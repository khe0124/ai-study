import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

// 환경변수를 지연 평가하여 dotenv.config() 호출 후에 읽도록 함
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
  }
  return secret;
}

function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || "7d";
}

export function generateToken(payload: JwtPayload): string {
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
    issuer: "ai-study-backend",
    audience: "ai-study-frontend",
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: "ai-study-backend",
      audience: "ai-study-frontend",
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("토큰이 만료되었습니다.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("유효하지 않은 토큰입니다.");
    }
    throw new Error("토큰 검증에 실패했습니다.");
  }
}
