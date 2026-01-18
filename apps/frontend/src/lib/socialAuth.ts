/**
 * 소셜 로그인 유틸리티
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
    Kakao?: {
      init: (key: string) => void;
      Auth: {
        login: (options: {
          success: (authObj: { access_token: string }) => void;
          fail: (err: any) => void;
        }) => void;
      };
      isInitialized: () => boolean;
    };
  }
}

// Google 로그인
export async function initGoogleAuth(
  clientId: string,
  onSuccess: (accessToken: string) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Google Identity Services 스크립트 로드
    if (document.getElementById('google-oauth-script')) {
      // 이미 로드된 경우
      if (window.google) {
        setupGoogleAuth(clientId, onSuccess);
        resolve();
      } else {
        reject(new Error('Google SDK 로드 실패'));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-oauth-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        setupGoogleAuth(clientId, onSuccess);
        resolve();
      } else {
        reject(new Error('Google SDK 초기화 실패'));
      }
    };

    script.onerror = () => {
      reject(new Error('Google SDK 로드 실패'));
    };

    document.head.appendChild(script);
  });
}

function setupGoogleAuth(
  clientId: string,
  onSuccess: (accessToken: string) => void
): void {
  const tokenClient = window.google!.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'email profile',
    callback: (response: { access_token: string }) => {
      if (response.access_token) {
        onSuccess(response.access_token);
      }
    },
  });

  tokenClient.requestAccessToken();
}

// Kakao 로그인 초기화
export async function initKakaoAuth(
  javascriptKey: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 초기화된 경우
    if (window.Kakao?.isInitialized()) {
      resolve();
      return;
    }

    // 이미 스크립트가 로드된 경우
    if (window.Kakao) {
      window.Kakao.init(javascriptKey);
      resolve();
      return;
    }

    // Kakao SDK 스크립트 로드
    if (document.getElementById('kakao-sdk-script')) {
      // 스크립트는 있지만 아직 로드 안됨
      const checkInterval = setInterval(() => {
        if (window.Kakao) {
          window.Kakao.init(javascriptKey);
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Kakao SDK 로드 타임아웃'));
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-sdk-script';
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;

    script.onload = () => {
      if (window.Kakao) {
        window.Kakao.init(javascriptKey);
        resolve();
      } else {
        reject(new Error('Kakao SDK 초기화 실패'));
      }
    };

    script.onerror = () => {
      reject(new Error('Kakao SDK 로드 실패'));
    };

    document.head.appendChild(script);
  });
}

// Kakao 로그인 실행
export function loginWithKakao(
  onSuccess: (accessToken: string) => void,
  onError: (error: Error) => void
): void {
  if (!window.Kakao) {
    onError(new Error('Kakao SDK가 로드되지 않았습니다.'));
    return;
  }

  if (!window.Kakao.isInitialized()) {
    onError(new Error('Kakao SDK가 초기화되지 않았습니다.'));
    return;
  }

  window.Kakao.Auth.login({
    success: (authObj: { access_token: string }) => {
      if (authObj.access_token) {
        onSuccess(authObj.access_token);
      } else {
        onError(new Error('Kakao access token을 받을 수 없습니다.'));
      }
    },
    fail: (err: any) => {
      onError(new Error(err.error || 'Kakao 로그인에 실패했습니다.'));
    },
  });
}

// Apple 로그인 (OAuth 2.0 플로우)
export function loginWithApple(clientId: string, redirectUri: string): void {
  const scope = encodeURIComponent('email name');
  const responseType = 'code id_token';
  // query 방식 사용 (form_post는 서버 사이드 처리 필요)
  const responseMode = 'query';
  const state = Math.random().toString(36).substring(7); // CSRF 방지

  // state를 sessionStorage에 저장
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('apple_oauth_state', state);
  }

  const authUrl = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${encodeURIComponent(responseType)}&scope=${scope}&response_mode=${responseMode}&state=${state}`;

  window.location.href = authUrl;
}
