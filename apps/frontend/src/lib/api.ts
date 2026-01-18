import { PostsResponse, PostResponse } from '@/types/post';
import { AuthResponse, LoginRequest, RegisterRequest, SocialAuthRequest } from '@/types/auth';

// Next.js rewrites를 사용하므로 상대 경로 사용
// 또는 환경변수로 백엔드 URL 직접 지정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}`
  : '';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // rewrites를 사용하는 경우 상대 경로, 직접 호출하는 경우 절대 경로
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const postAPI = {
  // 게시글 목록 조회
  getPosts: async (page: number = 1, limit: number = 10): Promise<PostsResponse> => {
    return fetchAPI<PostsResponse>(`/api/posts?page=${page}&limit=${limit}`);
  },

  // 게시글 상세 조회
  getPost: async (id: string): Promise<PostResponse> => {
    return fetchAPI<PostResponse>(`/api/posts/${id}`);
  },
};

export const authAPI = {
  // 이메일 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 소셜 로그인
  socialLogin: async (data: SocialAuthRequest): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 프로필 조회
  getProfile: async (token: string): Promise<AuthResponse> => {
    return fetchAPI<AuthResponse>('/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
