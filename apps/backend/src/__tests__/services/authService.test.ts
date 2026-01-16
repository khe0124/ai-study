import { AuthService } from "../../services/authService";
import { UserModel } from "../../models/User";
import bcrypt from "bcrypt";

describe("AuthService Tests", () => {
  beforeEach(() => {
    UserModel.reset();
  });

  describe("register", () => {
    it("should create a new user with hashed password", async () => {
      const result = await AuthService.register({
        email: "newuser@example.com",
        password: "Password123!@#",
      });

      expect(result.user.email).toBe("newuser@example.com");
      expect(result.user.provider).toBe("email");
      expect(result.token).toBeDefined();

      // 비밀번호가 해싱되어 저장되었는지 확인
      const user = await UserModel.findByEmail("newuser@example.com");
      expect(user).not.toBeNull();
      expect(user?.password).not.toBe("Password123!@#");
      expect(user?.password).toContain("$2b$"); // bcrypt 해시 형식
    });

    it("should throw error for duplicate email", async () => {
      await AuthService.register({
        email: "duplicate@example.com",
        password: "Password123!@#",
      });

      await expect(
        AuthService.register({
          email: "duplicate@example.com",
          password: "Password123!@#",
        })
      ).rejects.toThrow("이미 존재하는 이메일");
    });

    it("should normalize email to lowercase", async () => {
      const result = await AuthService.register({
        email: "UPPERCASE@EXAMPLE.COM",
        password: "Password123!@#",
      });

      expect(result.user.email).toBe("uppercase@example.com");
    });
  });

  describe("login", () => {
    const testEmail = "login@example.com";
    const testPassword = "Password123!@#";

    beforeEach(async () => {
      await AuthService.register({
        email: testEmail,
        password: testPassword,
      });
    });

    it("should login successfully with correct credentials", async () => {
      const result = await AuthService.login({
        email: testEmail,
        password: testPassword,
      });

      expect(result.user.email).toBe(testEmail);
      expect(result.token).toBeDefined();
    });

    it("should throw error for wrong password", async () => {
      await expect(
        AuthService.login({
          email: testEmail,
          password: "WrongPassword123!@#",
        })
      ).rejects.toThrow("이메일 또는 비밀번호");
    });

    it("should throw error for non-existent user", async () => {
      await expect(
        AuthService.login({
          email: "nonexistent@example.com",
          password: testPassword,
        })
      ).rejects.toThrow("이메일 또는 비밀번호");
    });

    it("should normalize email during login", async () => {
      const result = await AuthService.login({
        email: testEmail.toUpperCase(),
        password: testPassword,
      });

      expect(result.user.email).toBe(testEmail);
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      const registerResult = await AuthService.register({
        email: "getuser@example.com",
        password: "Password123!@#",
      });

      const user = await AuthService.getUserById(registerResult.user.id);
      expect(user).not.toBeNull();
      expect(user?.email).toBe("getuser@example.com");
    });

    it("should return null for non-existent user", async () => {
      const user = await AuthService.getUserById("non-existent-id");
      expect(user).toBeNull();
    });
  });
});
