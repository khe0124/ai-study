import axios from "axios";
import { UserModel } from "../models/User";
import { generateToken } from "../utils/jwt";
import { SocialAuthRequest, AuthResponse, User } from "../types/auth";
import { normalizeEmail } from "../config/security";
import { INPUT_LIMITS } from "../config/security";

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
}

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email?: string;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
  };
  properties?: {
    nickname?: string;
    profile_image?: string;
  };
}


export class SocialAuthService {
  static async authenticateWithGoogle(accessToken: string): Promise<AuthResponse> {
    // 토큰 길이 검증
    if (accessToken.length > INPUT_LIMITS.TOKEN_MAX_LENGTH) {
      throw new Error("유효하지 않은 토큰입니다.");
    }

    try {
      // Google API로 사용자 정보 가져오기 (타임아웃 설정)
      const response = await axios.get<GoogleUserInfo>(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000, // 10초 타임아웃
        }
      );

      const googleUser = response.data;

      if (!googleUser.verified_email) {
        throw new Error("이메일 인증이 완료되지 않은 Google 계정입니다.");
      }

      // 이메일 정규화
      const normalizedEmail = normalizeEmail(googleUser.email);

      // 기존 사용자 확인
      let user = await UserModel.findByProvider("google", googleUser.id);

      if (!user) {
        // 새 사용자 생성
        user = await UserModel.create({
          email: normalizedEmail,
          provider: "google",
          providerId: googleUser.id,
        });
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("유효하지 않은 Google 토큰입니다.");
        }
        throw new Error("Google 인증에 실패했습니다.");
      }
      throw error;
    }
  }

  static async authenticateWithKakao(accessToken: string): Promise<AuthResponse> {
    // 토큰 길이 검증
    if (accessToken.length > INPUT_LIMITS.TOKEN_MAX_LENGTH) {
      throw new Error("유효하지 않은 토큰입니다.");
    }

    try {
      // Kakao API로 사용자 정보 가져오기 (타임아웃 설정)
      const response = await axios.get<KakaoUserInfo>(
        "https://kapi.kakao.com/v2/user/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000, // 10초 타임아웃
        }
      );

      const kakaoUser = response.data;
      const email = kakaoUser.kakao_account?.email;

      if (!email) {
        throw new Error("이메일 정보가 제공되지 않았습니다.");
      }

      // 이메일 정규화
      const normalizedEmail = normalizeEmail(email);

      // 기존 사용자 확인
      let user = await UserModel.findByProvider("kakao", kakaoUser.id.toString());

      if (!user) {
        // 새 사용자 생성
        user = await UserModel.create({
          email: normalizedEmail,
          provider: "kakao",
          providerId: kakaoUser.id.toString(),
        });
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("유효하지 않은 Kakao 토큰입니다.");
        }
        throw new Error("Kakao 인증에 실패했습니다.");
      }
      throw error;
    }
  }

  static async authenticate(data: SocialAuthRequest): Promise<AuthResponse> {
    switch (data.provider) {
      case "google":
        if (!data.accessToken) {
          throw new Error("Google accessToken이 필요합니다.");
        }
        return await this.authenticateWithGoogle(data.accessToken);

      case "kakao":
        if (!data.accessToken) {
          throw new Error("Kakao accessToken이 필요합니다.");
        }
        return await this.authenticateWithKakao(data.accessToken);
      
      default:
        throw new Error("지원하지 않는 소셜 로그인 제공자입니다. (google, kakao만 지원)");
    }
  }
}
