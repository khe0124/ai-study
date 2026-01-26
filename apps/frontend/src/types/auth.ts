export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface SocialAuthRequest {
  provider: 'google' | 'kakao';
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  provider: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}
