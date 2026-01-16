# 테스트 가이드

이 문서는 백엔드 API 테스트에 대한 가이드를 제공합니다.

## 테스트 실행

### 기본 명령어

```bash
# 모든 테스트 실행
npm test

# Watch 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

## 테스트 구조

### 테스트 파일 위치

```
src/
├── __tests__/
│   ├── setup.ts                    # 테스트 환경 설정
│   ├── helpers/
│   │   └── testHelpers.ts          # 테스트 헬퍼 함수
│   ├── auth.test.ts                # 인증 API 통합 테스트
│   ├── rateLimiting.test.ts        # Rate Limiting 테스트
│   ├── services/
│   │   └── authService.test.ts     # AuthService 단위 테스트
│   └── utils/
│       └── jwt.test.ts             # JWT 유틸리티 테스트
```

## 테스트 커버리지

### 포함된 테스트

#### 1. 인증 API 테스트 (`auth.test.ts`)

- **회원가입**
  - ✅ 성공적인 회원가입
  - ✅ 중복 이메일 거부
  - ✅ 잘못된 이메일 형식 거부
  - ✅ 약한 비밀번호 거부
  - ✅ 이메일 정규화 (대소문자)

- **로그인**
  - ✅ 올바른 자격증명으로 로그인
  - ✅ 잘못된 비밀번호 거부
  - ✅ 존재하지 않는 이메일 거부
  - ✅ 이메일 정규화

- **소셜 로그인**
  - ✅ 잘못된 제공자 거부
  - ✅ 필수 토큰 검증

- **프로필 조회**
  - ✅ 유효한 토큰으로 프로필 조회
  - ✅ 토큰 없이 요청 거부
  - ✅ 잘못된 토큰 거부
  - ✅ 잘못된 형식의 Authorization 헤더 거부

- **입력 검증**
  - ✅ 빈 이메일/비밀번호 거부
  - ✅ 너무 긴 이메일/비밀번호 거부

#### 2. Rate Limiting 테스트 (`rateLimiting.test.ts`)

- **회원가입 Rate Limiting**
  - ✅ 제한 내 요청 허용
  - ✅ 제한 초과 요청 차단

- **로그인 Rate Limiting**
  - ✅ 제한 내 요청 허용
  - ✅ 제한 초과 요청 차단

#### 3. AuthService 단위 테스트 (`services/authService.test.ts`)

- ✅ 사용자 생성 및 비밀번호 해싱
- ✅ 중복 이메일 검증
- ✅ 로그인 성공/실패
- ✅ 이메일 정규화
- ✅ 사용자 조회

#### 4. JWT 유틸리티 테스트 (`utils/jwt.test.ts`)

- ✅ 토큰 생성
- ✅ 토큰 검증
- ✅ 만료된 토큰 거부
- ✅ 잘못된 시크릿 거부

## 테스트 작성 가이드

### 새로운 테스트 추가하기

1. **통합 테스트** (API 엔드포인트 테스트)
   - `src/__tests__/` 디렉토리에 `*.test.ts` 파일 생성
   - `supertest`를 사용하여 HTTP 요청 테스트

2. **단위 테스트** (서비스/유틸리티 테스트)
   - `src/__tests__/services/` 또는 `src/__tests__/utils/` 디렉토리에 파일 생성
   - 직접 함수 호출하여 테스트

### 테스트 예제

```typescript
import request from "supertest";
import { createTestApp } from "./helpers/testHelpers";

describe("My API Tests", () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    // 각 테스트 전 초기화
    UserModel.reset();
  });

  it("should do something", async () => {
    const response = await request(app)
      .post("/api/endpoint")
      .send({ data: "value" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## 테스트 환경 변수

테스트는 자동으로 다음 환경 변수를 설정합니다:

- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret-key-for-testing-only-min-32-chars`
- `JWT_EXPIRES_IN=1h`
- `FRONTEND_URL=http://localhost:3000`

## 주의사항

1. **데이터베이스 초기화**: 각 테스트 전에 `UserModel.reset()`이 자동으로 호출됩니다.

2. **Rate Limiting**: Rate Limiting 테스트는 실제 제한을 적용하므로, 테스트 간 충분한 시간 간격이 필요할 수 있습니다.

3. **비동기 테스트**: 모든 API 테스트는 `async/await`를 사용합니다.

4. **타임아웃**: 기본 테스트 타임아웃은 10초입니다. 필요시 `jest.setTimeout()`으로 조정할 수 있습니다.

## 커버리지 목표

현재 테스트 커버리지 목표:

- 라인 커버리지: 80% 이상
- 함수 커버리지: 85% 이상
- 브랜치 커버리지: 75% 이상

커버리지 리포트는 `coverage/` 디렉토리에 생성됩니다.
