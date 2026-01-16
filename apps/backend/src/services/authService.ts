import bcrypt from "bcrypt";
import { UserModel } from "../models/User";
import { generateToken } from "../utils/jwt";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User,
} from "../types/auth";
import { normalizeEmail } from "../config/security";

// Timing Attack 방지를 위한 일정한 시간 지연
const TIMING_DELAY_MS = 100; // 100ms 지연

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // 이메일 정규화
    const normalizedEmail = normalizeEmail(data.email);

    // 이메일 중복 확인
    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error("이미 존재하는 이메일입니다.");
    }

    // 비밀번호 해싱 (bcrypt rounds: 10-12 권장)
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // 사용자 생성
    const user = await UserModel.create({
      email: normalizedEmail,
      password: hashedPassword,
      provider: "email",
    });

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        provider: user.provider,
      },
      token,
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const startTime = Date.now();

    // 이메일 정규화
    const normalizedEmail = normalizeEmail(data.email);

    // 사용자 찾기
    const user = await UserModel.findByEmail(normalizedEmail);

    // Timing Attack 방지: 사용자 존재 여부와 관계없이 일정한 시간 소요
    // 비밀번호 검증은 항상 수행 (존재하지 않는 사용자도 더미 해시로 비교)
    let isPasswordValid = false;

    if (user && user.provider === "email" && user.password) {
      isPasswordValid = await bcrypt.compare(data.password, user.password);
    } else {
      // 존재하지 않는 사용자나 소셜 로그인 사용자의 경우 더미 해시로 비교
      const dummyHash = "$2b$12$dummy.hash.for.timing.attack.prevention";
      await bcrypt.compare(data.password, dummyHash);
    }

    // 최소 응답 시간 보장 (Timing Attack 방지)
    const elapsed = Date.now() - startTime;
    if (elapsed < TIMING_DELAY_MS) {
      await delay(TIMING_DELAY_MS - elapsed);
    }

    // 인증 실패 (일관된 에러 메시지)
    if (
      !user ||
      user.provider !== "email" ||
      !user.password ||
      !isPasswordValid
    ) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        provider: user.provider,
      },
      token,
    };
  }

  static async getUserById(userId: string): Promise<User | null> {
    return await UserModel.findById(userId);
  }
}
