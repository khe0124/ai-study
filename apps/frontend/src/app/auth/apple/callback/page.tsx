'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setAuthToken, setAuthUser } from '@/lib/auth';

export default function AppleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Apple OAuth는 form_post 방식으로 데이터를 전송하므로
        // 실제로는 서버 사이드에서 처리하는 것이 좋습니다
        // 여기서는 URL 파라미터나 다른 방법으로 id_token을 받는 것을 가정합니다

        // 방법 1: URL 파라미터로 id_token 받기 (실제로는 form_post 사용)
        const idToken = searchParams.get('id_token');
        const state = searchParams.get('state');
        const code = searchParams.get('code');

        // state 검증
        const savedState = sessionStorage.getItem('apple_oauth_state');
        if (state && savedState !== state) {
          throw new Error('Invalid state parameter');
        }

        if (idToken) {
          // idToken이 있으면 바로 사용
          const response = await authAPI.socialLogin({
            provider: 'apple',
            idToken,
          });

          if (response.success && response.data) {
            setAuthToken(response.data.token);
            setAuthUser(response.data.user);
            sessionStorage.removeItem('apple_oauth_state');
            router.push('/posts');
            router.refresh();
            return;
          }
        } else if (code) {
          // code가 있으면 서버에서 idToken으로 교환해야 함
          // 이 경우 백엔드에 code를 전달하고 idToken을 받아야 합니다
          // 현재 백엔드는 idToken만 받으므로, 프론트엔드에서 직접 교환하거나
          // 백엔드에 code를 받는 엔드포인트를 추가해야 합니다
          setError('Apple 로그인: code를 idToken으로 교환하는 기능이 필요합니다.');
          setLoading(false);
          return;
        } else {
          setError('Apple 로그인 정보를 받을 수 없습니다.');
          setLoading(false);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Apple 로그인에 실패했습니다.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Apple 로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
