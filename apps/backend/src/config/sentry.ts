/**
 * Sentry 에러 모니터링 설정
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";

  if (!dsn) {
    console.warn("⚠️  SENTRY_DSN이 설정되지 않았습니다. Sentry 모니터링이 비활성화됩니다.");
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        // 프로파일링 통합
        nodeProfilingIntegration(),
      ],
      // 성능 모니터링 샘플링 (0.0 ~ 1.0)
      tracesSampleRate: environment === "production" ? 0.1 : 1.0,
      // 프로파일링 샘플링
      profilesSampleRate: environment === "production" ? 0.1 : 1.0,
      // 릴리스 버전
      release: process.env.APP_VERSION || "1.0.0",
      // 에러 필터링
      beforeSend(event, hint) {
        // 개발 환경에서는 모든 에러 전송
        if (environment !== "production") {
          return event;
        }

        // 프로덕션에서는 중요한 에러만 전송
        const error = hint.originalException;
        if (error instanceof Error) {
          // 특정 에러는 제외
          if (error.message.includes("ECONNREFUSED")) {
            return null; // 전송하지 않음
          }
        }

        return event;
      },
    });
  } catch (error) {
    console.error("⚠️  Sentry initialization error:", error);
  }
}

/**
 * Sentry 요청 핸들러 (Express 미들웨어)
 * Sentry v8에서는 자동으로 처리되므로 빈 미들웨어
 */
export const sentryRequestHandler = (req: any, res: any, next: any) => {
  next();
};

/**
 * Sentry 트레이싱 핸들러 (Express 미들웨어)
 * Sentry v8에서는 자동으로 처리되므로 빈 미들웨어
 */
export const sentryTracingHandler = () => {
  return (req: any, res: any, next: any) => {
    next();
  };
};

/**
 * Sentry 에러 핸들러 (Express 미들웨어)
 */
export const sentryErrorHandler = (err: any, req: any, res: any, next: any) => {
  // Sentry에 에러 전송
  Sentry.captureException(err);
  
  // 500 이상의 에러만 Sentry로 전송
  if (err.statusCode >= 500 || !err.statusCode) {
    // 이미 전송됨
  }
  
  // 다음 에러 핸들러로 전달
  next(err);
};
