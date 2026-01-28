'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { authAPI } from '@/lib/api';
import { setAuthToken, setAuthUser } from '@/lib/auth';
import { initGoogleAuth, initKakaoAuth, loginWithKakao } from '@/lib/socialAuth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? '';
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
      setError('로그인에 실패했습니다.');
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
    // Kakao SDK 초기화 (Script 태그는 이미 로그인 페이지에서 로드됨)
    if (kakaoKey.trim() !== '') {
      initKakaoAuth(kakaoKey).catch((err) => {
        console.warn('Kakao SDK 초기화 실패:', err);
        // 초기화 실패는 에러로 표시하지 않음 (버튼 클릭 시 다시 시도)
      });
    } else {
      console.warn('Kakao JavaScript Key가 설정되지 않았습니다.');
    }
  }, [kakaoKey]);

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
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
        if (!kakaoKey || kakaoKey.trim() === '') {
          setError('Kakao JavaScript Key가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
          setLoading(false);
          return;
        }

        try {
          // Kakao SDK가 초기화되지 않은 경우 초기화
          if (!window.Kakao?.isInitialized()) {
            try {
              await initKakaoAuth(kakaoKey);
            } catch (initError) {
              setError(
                initError instanceof Error
                  ? initError.message
                  : 'Kakao SDK 초기화에 실패했습니다.'
              );
              setLoading(false);
              return;
            }
          }

          // Kakao 로그인 실행
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
                } else {
                  setError(response.message || 'Kakao 로그인에 실패했습니다.');
                  setLoading(false);
                }
              } catch (err) {
                const errorMessage =
                  err instanceof Error
                    ? err.message
                    : '서버와의 통신 중 오류가 발생했습니다.';
                setError(errorMessage);
                setLoading(false);
              }
            },
            (error: Error) => {
              setError(error.message);
              setLoading(false);
            }
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Kakao 로그인 중 오류가 발생했습니다.'
          );
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '소셜 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {kakaoKey && kakaoKey.trim() !== '' && (
        <Script
          id="kakao-sdk-script"
          src="https://developers.kakao.com/sdk/js/kakao.js"
          strategy="afterInteractive"
        />
      )}
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

          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* 구글 로그인 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
              <span>Google</span>
            </button>

            {/* 카카오 로그인 */}
            <button
              type="button"
              onClick={() => handleSocialLogin('kakao')}
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-[#FEE500] text-sm font-medium text-gray-900 hover:bg-[#FDD835] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 3C7.58 3 4 5.58 4 9.5c0 2.85 2.2 5.25 5.2 6.1-.07-.6-.13-1.52.03-2.17l.36-1.54s-.9-.18-.9-.18c-1.2-.27-1.47-1.12-1.47-1.7 0-1.17.7-1.78 1.4-1.78.66 0 .98.5.98.85 0 .66-1.05 1.65-1.6 2.55-.45.75-.34 1.14-.26 1.25.15.2.5.15.7.1.2-.05.85-.55 1.15-1.05.37-.5.65-1.05.65-1.9 0-1.25-.75-2.15-1.85-2.15-1.5 0-2.4 1.1-2.4 2.35 0 .85.35 1.4.35 1.4l-1.2 5.1c-.35 1.5-.05 3.35-.03 3.5 0 .2.15.25.2.1.1-.2 1.4-1.75 1.85-3.35.15-.6.9-3.7.9-3.7.45.85 1.75 1.6 3.15 1.6 4.15 0 6.95-3.75 6.95-7C20 5.58 16.42 3 12 3z" />
              </svg>
              <span className="font-bold">카카오 로그인</span>
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
