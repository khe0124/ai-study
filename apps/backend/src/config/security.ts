// 환경 변수 검증
export function validateEnvVariables() {
  const required = ["JWT_SECRET"];
  const missing: string[] = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `필수 환경 변수가 설정되지 않았습니다: ${missing.join(", ")}`
    );
  }

  // JWT_SECRET 강도 검증
  if (process.env.JWT_SECRET) {
    const secret = process.env.JWT_SECRET;
    if (secret.length < 32) {
      console.warn(
        "⚠️  경고: JWT_SECRET이 너무 짧습니다. 최소 32자 이상을 권장합니다."
      );
    }
    if (secret === "your-secret-key-change-in-production") {
      throw new Error(
        "❌ 보안 위험: 기본 JWT_SECRET을 변경해주세요!"
      );
    }
  }
}

// 입력 길이 제한 상수
export const INPUT_LIMITS = {
  EMAIL_MAX_LENGTH: 254, // RFC 5321 표준
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  TOKEN_MAX_LENGTH: 2000,
};

// 이메일 정규화 (소문자 변환)
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
