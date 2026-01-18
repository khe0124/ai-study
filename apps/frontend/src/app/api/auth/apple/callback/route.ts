import { NextRequest, NextResponse } from 'next/server';

/**
 * Apple 로그인 콜백 처리
 * Apple OAuth는 form_post 방식을 사용하므로 서버 사이드에서 처리
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const idToken = formData.get('id_token') as string | null;
    const state = formData.get('state') as string | null;
    const code = formData.get('code') as string | null;

    if (!idToken && !code) {
      return NextResponse.redirect(
        new URL('/login?error=apple_auth_failed', request.url)
      );
    }

    // idToken이 있으면 클라이언트로 전달
    if (idToken) {
      const redirectUrl = new URL('/auth/apple/callback', request.url);
      redirectUrl.searchParams.set('id_token', idToken);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      return NextResponse.redirect(redirectUrl);
    }

    // code만 있는 경우 (idToken 교환이 필요한 경우)
    // 현재 백엔드는 idToken만 받으므로, 여기서는 에러 처리
    return NextResponse.redirect(
      new URL('/login?error=apple_code_exchange_needed', request.url)
    );
  } catch (error) {
    console.error('Apple callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=apple_auth_error', request.url)
    );
  }
}
