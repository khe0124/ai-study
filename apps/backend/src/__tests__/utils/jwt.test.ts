import { generateToken, verifyToken } from "../../utils/jwt";
import { JwtPayload } from "../../types/auth";
import jwt from "jsonwebtoken";

describe("JWT Utils Tests", () => {
  const testPayload: JwtPayload = {
    userId: "test-user-id",
    email: "test@example.com",
    provider: "email",
  };

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT는 3부분으로 구성
    });

    it("should include all payload data in token", () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token) as JwtPayload;
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.provider).toBe(testPayload.provider);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.provider).toBe(testPayload.provider);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        verifyToken("invalid-token");
      }).toThrow();
    });

    it("should throw error for expired token", () => {
      // 만료된 토큰 생성 (1초 후 만료)
      const expiredToken = jwt.sign(testPayload, process.env.JWT_SECRET!, {
        expiresIn: "1s",
        issuer: "ai-study-backend",
        audience: "ai-study-frontend",
      });

      // 2초 대기 후 검증
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(() => {
            verifyToken(expiredToken);
          }).toThrow("토큰이 만료되었습니다");
          resolve();
        }, 2000);
      });
    });

    it("should throw error for token with wrong secret", () => {
      const wrongSecretToken = jwt.sign(testPayload, "wrong-secret");
      expect(() => {
        verifyToken(wrongSecretToken);
      }).toThrow();
    });
  });
});
