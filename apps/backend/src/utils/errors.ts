/**
 * 통일된 에러 응답 형식 및 커스텀 에러 클래스
 */

export interface ErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: unknown;
    stack?: string;
  };
  timestamp: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// HTTP 상태 코드별 에러 클래스
export class BadRequestError extends AppError {
  constructor(message: string = "잘못된 요청입니다.", details?: unknown) {
    super(message, 400, "BAD_REQUEST", true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "인증이 필요합니다.", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "권한이 없습니다.", details?: unknown) {
    super(message, 403, "FORBIDDEN", true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "리소스를 찾을 수 없습니다.", details?: unknown) {
    super(message, 404, "NOT_FOUND", true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "이미 존재하는 리소스입니다.", details?: unknown) {
    super(message, 409, "CONFLICT", true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "입력값 검증에 실패했습니다.", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "서버 오류가 발생했습니다.", details?: unknown) {
    super(message, 500, "INTERNAL_SERVER_ERROR", false, details);
  }
}

/**
 * 에러를 통일된 형식으로 변환
 */
export function formatErrorResponse(
  error: unknown,
  includeStack: boolean = false
): ErrorResponse {
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: error.details,
        stack: includeStack && !isProduction ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: isProduction
        ? "서버 오류가 발생했습니다."
        : error.message || "알 수 없는 오류가 발생했습니다.",
      error: {
        code: "UNKNOWN_ERROR",
        stack: includeStack && !isProduction ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: false,
    message: "알 수 없는 오류가 발생했습니다.",
    error: {
      code: "UNKNOWN_ERROR",
    },
    timestamp: new Date().toISOString(),
  };
}
