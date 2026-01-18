import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// 일반 API 요청 제한
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100회 요청
  message: {
    success: false,
    message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 관련 엄격한 제한
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: {
    success: false,
    message: "너무 많은 로그인 시도가 발생했습니다. 15분 후 다시 시도해주세요.",
  },
  skipSuccessfulRequests: true, // 성공한 요청은 카운트에서 제외
  standardHeaders: true,
  legacyHeaders: false,
});

// 회원가입 제한
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3회 시도
  message: {
    success: false,
    message: "너무 많은 회원가입 시도가 발생했습니다. 1시간 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 소셜 로그인 제한
export const socialAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 최대 10회 시도
  message: {
    success: false,
    message: "너무 많은 소셜 로그인 시도가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 속도 제한 (점진적 지연)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15분
  delayAfter: 50, // 50회 요청 후부터 지연 시작
  delayMs: (used, req) => {
    const delayAfter = req.slowDown?.limit || 50;
    return (used - delayAfter) * 500; // 500ms씩 지연 증가
  },
  maxDelayMs: 20000, // 최대 20초 지연
});
