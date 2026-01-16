# 서비스 간 통신 구조 상세

## 1. 요청 라우팅 흐름

### 사용자 요청 → Nginx → 서비스

```
┌─────────────┐
│   사용자     │
└──────┬──────┘
       │ HTTP/HTTPS 요청
       │
       ▼
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)           │
│  ┌───────────────────────────────────┐  │
│  │  요청 분석 및 라우팅 결정           │  │
│  └───────────────────────────────────┘  │
└──────┬──────────────────────┬───────────┘
       │                      │
       │ /api/*               │ /*
       │                      │
       ▼                      ▼
┌─────────────┐      ┌─────────────┐
│   Backend   │      │   Frontend   │
│  Express    │      │   Next.js    │
└─────────────┘      └─────────────┘
```

## 2. 내부 서비스 통신

### Frontend → Backend 통신

**Docker 내부:**

```typescript
// Docker 네트워크 내에서 서비스명으로 통신
const response = await fetch("http://backend:3001/api/users");
```

**로컬 개발:**

```typescript
// 로컬에서는 localhost 사용
const response = await fetch("http://localhost:3001/api/users");
```

**프로덕션 (Nginx 경유):**

```typescript
// Nginx가 /api/* 경로를 backend로 프록시
const response = await fetch("/api/users");
```

## 3. 통신 프로토콜 및 포트 매핑

| 서비스   | 컨테이너 내부 포트 | 호스트 포트 | 접근 방법                     |
| -------- | ------------------ | ----------- | ----------------------------- |
| Nginx    | 80, 443            | 80, 443     | `http://localhost`            |
| Frontend | 3000               | -           | `http://frontend:3000` (내부) |
| Backend  | 3001               | -           | `http://backend:3001` (내부)  |

## 4. Nginx 라우팅 규칙 상세

### 정적 파일 요청

```
/_next/static/*  → frontend:3000
/static/*        → frontend:3000
/favicon.ico     → frontend:3000
```

### API 요청

```
/api/*           → backend:3001
```

### 페이지 요청

```
/                → frontend:3000
/about           → frontend:3000
/...             → frontend:3000
```

## 5. 향후 확장: 외부 서비스 통신

### Firebase 통신

```
Frontend ──(SDK)──▶ Firebase Auth
                  └─▶ Firestore

Backend  ──(Admin SDK)──▶ Firebase Admin
                        └─▶ Firestore
```

### Supabase 통신

```
Frontend ──(Client)──▶ Supabase
                     ├─▶ Database (PostgreSQL)
                     ├─▶ Auth
                     └─▶ Storage

Backend  ──(Service Key)──▶ Supabase
                          ├─▶ Database
                          └─▶ Auth Admin
```

### OAuth 통신

```
Frontend ──(OAuth Flow)──▶ OAuth Provider
                         ├─▶ Google
                         ├─▶ GitHub
                         └─▶ etc.

Backend  ──(Token Verification)──▶ OAuth Provider
```

## 6. 에러 처리 및 재시도 로직

### Frontend → Backend 통신 에러 처리

```typescript
try {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  // 에러 처리
  console.error("API 호출 실패:", error);
}
```

### Nginx 프록시 에러 처리

- Backend 다운 시: 502 Bad Gateway
- Timeout 설정: `proxy_read_timeout 60s`
- Health check를 통한 자동 재시도

## 7. 성능 최적화

### 캐싱 전략

- Nginx: 정적 파일 캐싱
- Next.js: ISR (Incremental Static Regeneration)
- Express: API 응답 캐싱 (Redis 등 추가 가능)

### 연결 풀링

- Nginx upstream: `keepalive 64`
- HTTP/1.1 Connection 재사용
