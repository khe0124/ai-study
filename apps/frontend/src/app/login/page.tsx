'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setAuthToken, setAuthUser } from '@/lib/auth';
import { initGoogleAuth, initKakaoAuth, loginWithKakao, loginWithApple } from '@/lib/socialAuth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // URL 파라미터에서 에러 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        apple_auth_failed: 'Apple 로그인에 실패했습니다.',
        apple_code_exchange_needed: 'Apple 로그인: 추가 설정이 필요합니다.',
        apple_auth_error: 'Apple 로그인 중 오류가 발생했습니다.',
      };
      setError(errorMessages[errorParam] || '로그인에 실패했습니다.');
      // URL에서 에러 파라미터 제거
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = isLogin
        ? await authAPI.login({ email, password })
        : await authAPI.register({ email, password });

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setAuthUser(response.data.user);
        router.push('/posts');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인 SDK 초기화
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

    // Google SDK 초기화 (선택적 - 필요시에만 로드)
    if (googleClientId) {
      // Google SDK는 버튼 클릭 시 동적으로 로드
    }

    // Kakao SDK 초기화
    if (kakaoKey) {
      initKakaoAuth(kakaoKey).catch((err) => {
        console.warn('Kakao SDK 초기화 실패:', err);
      });
    }
  }, []);

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'apple') => {
    setError(null);
    setLoading(true);

    try {
      if (provider === 'google') {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          setError('Google Client ID가 설정되지 않았습니다.');
          setLoading(false);
          return;
        }

        await initGoogleAuth(googleClientId, async (accessToken: string) => {
          try {
            const response = await authAPI.socialLogin({
              provider: 'google',
              accessToken,
            });

            if (response.success && response.data) {
              setAuthToken(response.data.token);
              setAuthUser(response.data.user);
              router.push('/posts');
              router.refresh();
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.');
            setLoading(false);
          }
        });
      } else if (provider === 'kakao') {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
        if (!kakaoKey) {
          setError('Kakao JavaScript Key가 설정되지 않았습니다.');
          setLoading(false);
          return;
        }

        // Kakao SDK가 초기화되지 않은 경우 초기화
        if (!window.Kakao?.isInitialized()) {
          await initKakaoAuth(kakaoKey);
        }

        loginWithKakao(
          async (accessToken: string) => {
            try {
              const response = await authAPI.socialLogin({
                provider: 'kakao',
                accessToken,
              });

              if (response.success && response.data) {
                setAuthToken(response.data.token);
                setAuthUser(response.data.user);
                router.push('/posts');
                router.refresh();
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Kakao 로그인에 실패했습니다.');
              setLoading(false);
            }
          },
          (error: Error) => {
            setError(error.message);
            setLoading(false);
          }
        );
      } else if (provider === 'apple') {
        const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
        if (!appleClientId) {
          setError('Apple Client ID가 설정되지 않았습니다.');
          setLoading(false);
          return;
        }

        const redirectUri = `${window.location.origin}/auth/apple/callback`;
        loginWithApple(appleClientId, redirectUri);
        // Apple 로그인은 리디렉션되므로 여기서는 로딩 상태 유지하지 않음
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '소셜 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            또는{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {/* 구글 로그인 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>

            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-yellow-300 text-sm font-medium text-gray-900 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-bold">카카오</span>
            </button>

            {/* 애플 로그인 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-black text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/posts"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            게시글 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
