/**
 * Winston 로거 설정
 */

import winston from "winston";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

// 로그 레벨 정의
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 로그 레벨에 따른 색상 정의
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// 로그 포맷 정의
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 콘솔 출력 포맷 (개발 환경)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// 로그 파일 경로
const logsDir = path.join(process.cwd(), "logs");

// Transport 설정
const transports: winston.transport[] = [
  // 콘솔 출력
  new winston.transports.Console({
    format: isProduction ? format : consoleFormat,
  }),
];

// 프로덕션 환경에서만 파일 로깅
if (isProduction) {
  // 에러 로그 파일
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // 모든 로그 파일
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Winston 로거 생성
export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  levels,
  format,
  transports,
  // 예외 처리
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
  ],
  // Promise 거부 처리
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
  ],
});

// 스트림 인터페이스 (Morgan과 함께 사용)
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
