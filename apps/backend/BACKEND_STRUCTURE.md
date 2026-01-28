# 백엔드 구조 가이드

이 문서는 Express 기반 백엔드 API의 디렉터리 구조, 설치·실행, 에러 핸들링, 보안, 테스트, 마이그레이션, 캐싱, API 문서화를 한 곳에서 설명합니다.

---

## 1. 디렉터리 구조

```
apps/backend/
├── src/
│   ├── routes/           # API 라우트 (auth, post)
│   ├── controllers/      # 요청 처리 (authController, postController)
│   ├── services/         # 비즈니스 로직 (authService, postService, socialAuthService)
│   ├── middleware/       # 인증, 검증, 에러핸들러, 레이트리밋, 업로드
│   ├── models/           # 데이터 모델 (User, Post, Comment)
│   ├── config/           # DB, Redis, Sentry, Swagger, security 설정
│   ├── utils/            # logger, errors, jwt, cache
│   ├── types/            # TypeScript 타입 (auth, post)
│   └── __tests__/        # 테스트 (auth, rateLimiting, authService, jwt)
├── migrations/           # Knex 마이그레이션
├── knexfile.ts
├── package.json
└── tsconfig.json
```

### 주요 파일 역할

| 경로 | 역할 |
|------|------|
| `src/utils/errors.ts` | 커스텀 에러 클래스, 에러 응답 포맷 |
| `src/middleware/errorHandler.ts` | 전역 에러 핸들러, asyncHandler |
| `src/utils/logger.ts` | Winston 로깅 |
| `src/config/sentry.ts` | Sentry (선택) |
| `src/config/swagger.ts` | Swagger/OpenAPI 설정 |
| `src/config/redis.ts` | Redis 클라이언트 (선택) |
| `src/utils/cache.ts` | 캐시 get/set/delete 유틸 |

---

## 2. 설치 및 실행

### 패키지 설치

```bash
cd apps/backend
pnpm install
# 또는 한 번에 추가 패키지 설치:
pnpm add winston morgan @sentry/node @sentry/profiling-node swagger-ui-express swagger-jsdoc knex redis
pnpm add -D @types/morgan @types/swagger-ui-express @types/swagger-jsdoc @types/knex @types/redis
```

### 환경 변수 (.env)

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production   # 프로덕션에서 필수, 32자 이상 권장
JWT_EXPIRES_IN=7d
NODE_ENV=development

# DB (Supabase 등)
DATABASE_URL=postgresql://...

# 선택
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
APP_VERSION=1.0.0
```

### 실행

```bash
npm run dev          # 개발
npm run build && npm start   # 프로덕션
npm run test:db      # DB 연결 테스트
```

---

## 3. API 개요

- **인증**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/social`, `GET /api/auth/profile`
- **게시글**: `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/:id`, 댓글 CRUD
- **인증 필요**: `Authorization: Bearer {token}`

상세 스키마와 예제는 **Swagger UI** (`http://localhost:3001/api-docs`) 또는 [README.md](./README.md)의 API 엔드포인트 섹션을 참고하세요.

---

## 4. 에러 핸들링

### 통일된 에러 응답

```json
{
  "success": false,
  "message": "에러 메시지",
  "error": { "code": "ERROR_CODE", "details": {}, "stack": "개발환경만" },
  "timestamp": "2026-01-26T12:00:00.000Z"
}
```

### 커스텀 에러 클래스

`BadRequestError`(400), `UnauthorizedError`(401), `ForbiddenError`(403), `NotFoundError`(404), `ConflictError`(409), `ValidationError`(422), `InternalServerError`(500) 등을 `src/utils/errors.ts`에서 import해 사용합니다.

### asyncHandler 사용

```typescript
import { asyncHandler } from "../middleware/errorHandler";

static myMethod = asyncHandler(async (req, res) => {
  const result = await MyService.doSomething();
  res.json({ success: true, data: result });
});
```

### 로깅

```typescript
import { logger } from "../utils/logger";
logger.info("메시지", { userId: "123" });
logger.error("에러", { error, stack });
```

프로덕션에서는 `logs/error.log`, `logs/combined.log` 등이 생성됩니다.

### Sentry (선택)

`.env`에 `SENTRY_DSN`을 넣으면 에러가 Sentry로 전송됩니다.

---

## 5. 보안

- **Rate Limiting**: 일반 15분 100회, 로그인 15분 5회, 회원가입 1시간 3회, 소셜 15분 10회
- **Helmet**: X-Content-Type-Options, X-Frame-Options, HSTS 등
- **입력 검증**: 이메일/비밀번호 규칙, body 크기 10MB 제한
- **Timing Attack 방어**: 로그인 시 일관된 응답 시간
- **JWT**: Issuer/Audience 검증, 프로덕션에서 JWT_SECRET 미설정 시 시작 차단
- **CORS**: 허용 Origin만 사용, credentials 지원

프로덕션 배포 전: JWT_SECRET 강함(32자 이상), HTTPS, CORS·Rate Limiting·로그 설정 확인.

---

## 6. 테스트

```bash
npm test
npm run test:watch
npm run test:coverage
```

테스트 위치: `src/__tests__/` (auth, rateLimiting, services/authService, utils/jwt).  
`setup.ts`, `helpers/testHelpers.ts`로 앱·DB 초기화. 커버리지는 `coverage/`에 생성됩니다.

---

## 7. 데이터베이스 마이그레이션 (Knex)

```bash
npm run migrate            # 최신 마이그레이션 실행
npm run migrate:rollback   # 롤백
npm run migrate:status     # 상태 확인
npm run migrate:make name  # 새 마이그레이션 생성
```

마이그레이션 파일은 `migrations/`에 있으며 `up`/`down` 함수로 정의합니다.  
프로덕션에서는 실행 전 백업을 권장합니다.

---

## 8. Redis 캐싱 (선택)

`.env`에 `REDIS_URL=redis://localhost:6379` 등을 설정하면 게시글 목록이 자동 캐시됩니다(키 패턴 `posts:page:{page}:limit:{limit}`, TTL 5분). 생성/수정/삭제 시 해당 캐시는 무효화됩니다.

로컬 Docker 예시:

```bash
docker run -d -p 6379:6379 redis:alpine
```

수동 캐시는 `src/utils/cache.ts`의 `getCache`, `setCache`, `deleteCache`를 사용합니다.  
Redis가 없어도 앱은 동작하며, 캐싱만 비활성화됩니다.

---

## 9. API 문서 (Swagger)

- **URL**: `http://localhost:3001/api-docs`
- 라우트 파일에 `@swagger` JSDoc으로 요청/응답·인증을 문서화합니다.
- 공통 스키마는 `src/config/swagger.ts`의 `components.schemas`에 정의합니다.

---

## 10. 주의사항

- Redis·Sentry는 선택이며, 없어도 서버는 동작합니다.
- 프로덕션에서는 JWT_SECRET을 반드시 설정하고, 기본값 사용 시 시작을 막도록 되어 있습니다.
- 마이그레이션 전 DB 백업을 권장합니다.
- 소셜 로그인은 각 제공자(OAuth) 설정이 필요합니다. Kakao는 [docs/KAKAO_SETUP.md](../../docs/KAKAO_SETUP.md) 참고.

시스템 전체 아키텍처(프론트·백·인프라)는 프로젝트 루트의 [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)를 참고하세요.
