# Frontend - 소셜 로그인 설정 가이드

## 환경변수 설정

`.env.local` 파일에 다음 환경변수를 추가하세요:

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Kakao OAuth
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-javascript-key

# Apple OAuth
NEXT_PUBLIC_APPLE_CLIENT_ID=your-apple-service-id
```

## 각 소셜 로그인 설정 방법

### 1. Google 로그인 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. API 및 서비스 → 사용자 인증 정보
4. OAuth 2.0 클라이언트 ID 생성
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 JavaScript 원본: `http://localhost:3000`
   - 승인된 리디렉션 URI: `http://localhost:3000`
5. 생성된 클라이언트 ID를 `.env.local`에 추가

### 2. Kakao 로그인 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 설정 → 플랫폼 설정
   - Web 플랫폼 추가: `http://localhost:3000`
4. 제품 설정 → 카카오 로그인
   - 활성화 설정: ON
   - Redirect URI: `http://localhost:3000`
   - 동의항목: 이메일 (필수)
5. 앱 설정 → 앱 키에서 JavaScript 키 복사
6. JavaScript 키를 `.env.local`에 추가

## 구현된 기능

- ✅ Google 로그인 (Google Identity Services)
- ✅ Kakao 로그인 (Kakao SDK)
- ✅ 이메일/비밀번호 로그인
- ✅ 회원가입
- ✅ 토큰 관리 (localStorage)
- ✅ 자동 리다이렉트

## Kakao 로그인 설정

자세한 설정 방법은 [Kakao 로그인 설정 가이드](../../docs/KAKAO_SETUP.md)를 참고하세요.

## 사용 방법

1. 환경변수 설정 후 서버 재시작
2. `/login` 페이지 접속
3. 소셜 로그인 버튼 클릭
4. 각 제공자의 로그인 화면에서 인증
5. 성공 시 게시글 목록 페이지로 이동
