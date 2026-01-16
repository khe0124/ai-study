// 테스트 환경 설정
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only-min-32-chars";
process.env.JWT_EXPIRES_IN = "1h";
process.env.FRONTEND_URL = "http://localhost:3000";

// 데이터베이스 초기화
import { UserModel } from "../models/User";

beforeEach(() => {
  // 각 테스트 전에 데이터베이스 초기화
  UserModel.reset();
});
