import { UserModel } from "../../models/User";
import { User } from "../../types/auth";

export const testHelpers = {
  // 테스트용 사용자 생성
  async createTestUser(overrides?: Partial<User>): Promise<User> {
    return await UserModel.create({
      email: "test@example.com",
      password: "$2b$12$dummy.hash.for.testing",
      provider: "email",
      ...overrides,
    });
  },

  // 테스트용 이메일 생성
  generateTestEmail(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
  },
};
