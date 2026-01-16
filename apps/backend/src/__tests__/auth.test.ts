import request from "supertest";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "../routes/auth";
import { UserModel } from "../models/User";
import { testHelpers } from "./helpers/testHelpers";
import { generalLimiter, speedLimiter } from "../middleware/rateLimiter";

dotenv.config();

// 테스트용 Express 앱 생성
function createTestApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Rate limiting은 테스트에서 별도로 테스트하므로 여기서는 제외
  // app.use(generalLimiter);
  // app.use(speedLimiter);
  app.use("/api/auth", authRoutes);
  return app;
}

describe("Auth API Tests", () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    UserModel.reset();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "newuser@example.com",
          password: "Password123!@#",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user.email).toBe("newuser@example.com");
      expect(response.body.data.user.provider).toBe("email");
    });

    it("should reject duplicate email", async () => {
      // 첫 번째 회원가입
      await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "Password123!@#",
      });

      // 중복 이메일로 회원가입 시도
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "Password123!@#",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("이미 존재하는 이메일");
    });

    it("should reject invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "Password123!@#",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it("should reject weak password", async () => {
      const testCases = [
        { password: "short", description: "too short" },
        { password: "nouppercase123!@#", description: "no uppercase" },
        { password: "NOLOWERCASE123!@#", description: "no lowercase" },
        { password: "NoNumbers!@#", description: "no numbers" },
        { password: "NoSpecial123", description: "no special characters" },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post("/api/auth/register")
          .send({
            email: testHelpers.generateTestEmail(),
            password: testCase.password,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it("should normalize email to lowercase", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "TEST@EXAMPLE.COM",
          password: "Password123!@#",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe("test@example.com");
    });
  });

  describe("POST /api/auth/login", () => {
    const testEmail = "login@example.com";
    const testPassword = "Password123!@#";

    beforeEach(async () => {
      // 테스트용 사용자 생성
      await request(app).post("/api/auth/register").send({
        email: testEmail,
        password: testPassword,
      });
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user.email).toBe(testEmail);
    });

    it("should reject login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!@#",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("이메일 또는 비밀번호");
    });

    it("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: testPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("이메일 또는 비밀번호");
    });

    it("should normalize email during login", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail.toUpperCase(),
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/auth/social", () => {
    // Google 로그인 모킹은 실제 API 호출이 필요하므로 간단한 테스트만 작성
    it("should reject invalid provider", async () => {
      const response = await request(app)
        .post("/api/auth/social")
        .send({
          provider: "invalid",
          accessToken: "test-token",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should require accessToken for Google", async () => {
      const response = await request(app)
        .post("/api/auth/social")
        .send({
          provider: "google",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should require idToken for Apple", async () => {
      const response = await request(app)
        .post("/api/auth/social")
        .send({
          provider: "apple",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/profile", () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          email: "profile@example.com",
          password: "Password123!@#",
        });

      authToken = registerResponse.body.data.token;
      userId = registerResponse.body.data.user.id;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe("profile@example.com");
    });

    it("should reject request without token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("인증 토큰");
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject request with malformed authorization header", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "InvalidFormat token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "",
          password: "Password123!@#",
        });

      expect(response.status).toBe(400);
    });

    it("should reject empty password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "",
        });

      expect(response.status).toBe(400);
    });

    it("should reject too long email", async () => {
      const longEmail = "a".repeat(255) + "@example.com";
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: longEmail,
          password: "Password123!@#",
        });

      expect(response.status).toBe(400);
    });

    it("should reject too long password", async () => {
      const longPassword = "A".repeat(129) + "1!@#";
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: longPassword,
        });

      expect(response.status).toBe(400);
    });
  });
});
