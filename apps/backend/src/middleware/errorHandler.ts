/**
 * 전역 에러 핸들러 미들웨어
 */

import { Request, Response, NextFunction } from "express";
import {
  AppError,
  formatErrorResponse,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../utils/errors";
import { logger } from "../utils/logger";

// 에러 클래스들을 export
export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 이미 응답이 전송된 경우 Express 기본 에러 핸들러에 위임
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const includeStack = !isProduction;

  // AppError인 경우
  if (err instanceof AppError) {
    const statusCode = err.statusCode || 500;

    // 에러 로깅
    if (statusCode >= 500) {
      logger.error("Server Error", {
        error: err,
        code: err.code,
        statusCode,
        path: req.path,
        method: req.method,
        userId: (req as any).user?.userId,
        stack: err.stack,
      });
    } else {
      logger.warn("Client Error", {
        error: err.message,
        code: err.code,
        statusCode,
        path: req.path,
        method: req.method,
        userId: (req as any).user?.userId,
      });
    }

    const errorResponse = formatErrorResponse(err, includeStack);
    res.status(statusCode).json(errorResponse);
    return;
  }

  // 예상치 못한 에러인 경우
  logger.error("Unexpected Error", {
    error: err,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.userId,
    stack: err instanceof Error ? err.stack : undefined,
  });

  const errorResponse = formatErrorResponse(err, includeStack);
  res.status(500).json(errorResponse);
}

/**
 * 비동기 함수를 래핑하여 에러를 자동으로 처리하는 헬퍼
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
