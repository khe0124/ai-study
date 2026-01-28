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
          initialize: (config: unknown) => void;
          prompt: () => void;
        };
      };
    };
    Kakao?: {
      init: (key: string) => void;
      Auth: {
        login: (options: {
          scope?: string;
          success: (authObj: { access_token: string }) => void;
          fail: (err: unknown) => void;
        }) => void;
      };
      isInitialized: () => boolean;
    };
  }
}

// Google 로그인 초기화
export async function initGoogleAuth(
  clientId: string,
  onSuccess: (accessToken: string) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 스크립트가 로드된 경우
    const existingScript = document.getElementById("google-oauth-script");
    if (existingScript) {
      if (window.google) {
        setupGoogleAuth(clientId, onSuccess);
        resolve();
      } else {
        reject(new Error("Google SDK 로드 실패"));
      }
      return;
    }

    // Google Identity Services 스크립트 로드
    const script = document.createElement("script");
    script.id = "google-oauth-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        setupGoogleAuth(clientId, onSuccess);
        resolve();
      } else {
        reject(new Error("Google SDK 초기화 실패"));
      }
    };

    script.onerror = () => {
      reject(new Error("Google SDK 로드 실패"));
    };

    document.head.appendChild(script);
  });
}

function setupGoogleAuth(
  clientId: string,
  onSuccess: (accessToken: string) => void
): void {
  if (!window.google) {
    throw new Error("Google SDK가 로드되지 않았습니다.");
  }

  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "email profile",
    callback: (response: { access_token: string }) => {
      if (response.access_token) {
        onSuccess(response.access_token);
      }
    },
  });

  tokenClient.requestAccessToken();
}

// Kakao 로그인 초기화
export async function initKakaoAuth(javascriptKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 키 검증
    if (!javascriptKey?.trim()) {
      reject(new Error("Kakao JavaScript Key가 설정되지 않았습니다."));
      return;
    }

    // 이미 초기화된 경우
    if (window.Kakao?.isInitialized()) {
      try {
        window.Kakao.init(javascriptKey);
      } catch (error) {
        console.warn("Kakao SDK 재초기화 중 오류:", error);
      }
      resolve();
      return;
    }

    // 이미 스크립트가 로드된 경우
    if (window.Kakao) {
      try {
        window.Kakao.init(javascriptKey);
        resolve();
      } catch (error) {
        reject(new Error("Kakao SDK 초기화 실패"));
      }
      return;
    }

    // 스크립트가 로드 중인 경우 대기 (타임아웃 시 스크립트 제거 후 재시도)
    const existingScript = document.getElementById("kakao-sdk-script");
    if (existingScript) {
      waitForKakaoSDK(javascriptKey, resolve, reject, () =>
        loadKakaoSDK(javascriptKey, resolve, reject)
      );
      return;
    }

    // Kakao SDK 스크립트 로드
    loadKakaoSDK(javascriptKey, resolve, reject);
  });
}

function waitForKakaoSDK(
  javascriptKey: string,
  resolve: () => void,
  reject: (error: Error) => void,
  onTimeoutRetry?: () => void
): void {
  let attempts = 0;
  const maxAttempts = 150; // 15초 (100ms * 150)

  const checkInterval = setInterval(() => {
    attempts++;
    if (window.Kakao) {
      try {
        window.Kakao.init(javascriptKey);
        clearInterval(checkInterval);
        resolve();
      } catch (error) {
        clearInterval(checkInterval);
        reject(new Error("Kakao SDK 초기화 실패"));
      }
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      const script = document.getElementById("kakao-sdk-script");
      if (script?.parentNode) script.remove();
      if (onTimeoutRetry) {
        onTimeoutRetry();
      } else {
        reject(new Error("Kakao SDK 로드 타임아웃"));
      }
    }
  }, 100);
}

function loadKakaoSDK(
  javascriptKey: string,
  resolve: () => void,
  reject: (error: Error) => void
): void {
  const script = document.createElement("script");
  script.id = "kakao-sdk-script";
  script.src = "https://developers.kakao.com/sdk/js/kakao.js";
  script.async = true;
  script.crossOrigin = "anonymous";

  script.onload = () => {
    const tryInit = () => {
      if (window.Kakao) {
        try {
          window.Kakao.init(javascriptKey);
          resolve();
        } catch (error) {
          reject(new Error("Kakao SDK 초기화 실패"));
        }
        return;
      }
      reject(new Error("Kakao SDK 로드 후 초기화 실패"));
    };
    if (window.Kakao) {
      tryInit();
      return;
    }
    // 일부 환경에서 SDK가 한 틱 늦게 노출되는 경우 대비 (최대 500ms 대기)
    const started = Date.now();
    const waitForKakao = () => {
      if (window.Kakao) tryInit();
      else if (Date.now() - started < 500) setTimeout(waitForKakao, 50);
      else reject(new Error("Kakao SDK 로드 후 초기화 실패"));
    };
    setTimeout(waitForKakao, 50);
  };;

  script.onerror = () => {
    reject(new Error("Kakao SDK 스크립트 로드 실패"));
  };

  document.head.appendChild(script);
}

// Kakao 로그인 실행
export function loginWithKakao(
  onSuccess: (accessToken: string) => void,
  onError: (error: Error) => void
): void {
  if (!window.Kakao) {
    onError(
      new Error("Kakao SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.")
    );
    return;
  }

  if (!window.Kakao.isInitialized()) {
    onError(new Error("Kakao SDK가 초기화되지 않았습니다."));
    return;
  }

  try {
    window.Kakao.Auth.login({
      success: (authObj: { access_token: string }) => {
        if (authObj.access_token) {
          onSuccess(authObj.access_token);
        } else {
          onError(new Error("Kakao access token을 받을 수 없습니다."));
        }
      },
      fail: (err: unknown) => {
        const errorMessage = getKakaoErrorMessage(err);
        onError(new Error(errorMessage));
      },
    });
  } catch (error) {
    onError(
      error instanceof Error
        ? error
        : new Error("Kakao 로그인 중 예상치 못한 오류가 발생했습니다.")
    );
  }
}

function getKakaoErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "error" in err) {
    const errorObj = err as { error?: string; error_description?: string };
    switch (errorObj.error) {
      case "access_denied":
        return "로그인이 취소되었습니다.";
      case "invalid_client":
        return "앱 설정이 잘못되었습니다.";
      default:
        return (
          errorObj.error_description ||
          errorObj.error ||
          "Kakao 로그인에 실패했습니다."
        );
    }
  }
  return "Kakao 로그인에 실패했습니다.";
}
