import request from "supertest";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "../routes/auth";
import { UserModel } from "../models/User";
import { generalLimiter, speedLimiter } from "../middleware/rateLimiter";

dotenv.config();

function createTestApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Rate limiting 테스트를 위해 적용
  app.use(generalLimiter);
  app.use(speedLimiter);
  app.use("/api/auth", authRoutes);
  return app;
}

describe("Rate Limiting Tests", () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    UserModel.reset();
  });

  describe("Register Rate Limiting", () => {
    it("should allow requests within rate limit", async () => {
      // 3회까지는 성공해야 함
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post("/api/auth/register")
          .send({
            email: `test${i}@example.com`,
            password: "Password123!@#",
          });

        expect(response.status).toBe(201);
      }
    });

    it("should block requests exceeding rate limit", async () => {
      // 3회 회원가입 성공
      for (let i = 0; i < 3; i++) {
        await request(app).post("/api/auth/register").send({
          email: `test${i}@example.com`,
          password: "Password123!@#",
        });
      }

      // 4번째 요청은 차단되어야 함
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test4@example.com",
          password: "Password123!@#",
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain("너무 많은 회원가입 시도");
    });
  });

  describe("Login Rate Limiting", () => {
    const testEmail = "ratelimit@example.com";
    const testPassword = "Password123!@#";

    beforeEach(async () => {
      // 테스트용 사용자 생성
      await request(app).post("/api/auth/register").send({
        email: testEmail,
        password: testPassword,
      });
    });

    it("should allow requests within rate limit", async () => {
      // 5회까지는 성공해야 함 (실패해도 카운트)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: testEmail,
            password: i === 0 ? testPassword : "wrong", // 첫 번째만 성공
          });

        // 첫 번째는 성공, 나머지는 실패하지만 429는 아님
        if (i === 0) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(401);
        }
      }
    });

    it("should block requests exceeding rate limit", async () => {
      // 5회 실패 시도
      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/auth/login").send({
          email: testEmail,
          password: "wrongpassword",
        });
      }

      // 6번째 요청은 차단되어야 함
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain("너무 많은 로그인 시도");
    });
  });
});
