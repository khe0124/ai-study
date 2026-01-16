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

interface AppleUserInfo {
  sub: string; // Apple user ID
  email?: string;
  email_verified?: boolean;
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

  static async authenticateWithApple(idToken: string): Promise<AuthResponse> {
    // 토큰 길이 검증
    if (idToken.length > INPUT_LIMITS.TOKEN_MAX_LENGTH) {
      throw new Error("유효하지 않은 토큰입니다.");
    }

    try {
      // Apple의 경우 idToken을 디코딩하여 사용자 정보 추출
      // 주의: 프로덕션에서는 Apple의 공개키로 서명을 검증해야 합니다
      const parts = idToken.split(".");
      if (parts.length !== 3) {
        throw new Error("유효하지 않은 Apple 토큰 형식입니다.");
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      
      // Base64 디코딩
      let jsonPayload: string;
      try {
        jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
      } catch (error) {
        throw new Error("토큰 디코딩에 실패했습니다.");
      }

      const appleUser: AppleUserInfo = JSON.parse(jsonPayload);

      // 필수 필드 검증
      if (!appleUser.sub) {
        throw new Error("Apple 인증 정보가 올바르지 않습니다.");
      }

      // 기존 사용자 확인
      let user = await UserModel.findByProvider("apple", appleUser.sub);

      if (!user) {
        // Apple의 경우 이메일이 없을 수 있음
        const email = appleUser.email
          ? normalizeEmail(appleUser.email)
          : `apple_${appleUser.sub}@apple.local`;

        user = await UserModel.create({
          email: email,
          provider: "apple",
          providerId: appleUser.sub,
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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Apple 인증에 실패했습니다.");
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

      case "apple":
        if (!data.idToken) {
          throw new Error("Apple idToken이 필요합니다.");
        }
        return await this.authenticateWithApple(data.idToken);

      default:
        throw new Error("지원하지 않는 소셜 로그인 제공자입니다.");
    }
  }
}
