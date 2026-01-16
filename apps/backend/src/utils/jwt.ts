import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "ai-study-backend",
    audience: "ai-study-frontend",
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
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
