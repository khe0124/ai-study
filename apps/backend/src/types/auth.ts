export interface User {
  id: string;
  email: string;
  password?: string; // 해시된 비밀번호
  provider: 'email' | 'google' | 'kakao';
  providerId?: string; // 소셜 로그인 제공자의 사용자 ID
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    provider: string;
  };
  token: string;
}

export interface SocialAuthRequest {
  provider: 'google' | 'kakao';
  accessToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  provider: string;
}
