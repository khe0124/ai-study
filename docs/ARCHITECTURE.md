# 시스템 아키텍처 설계 문서

## 1. 폴더 구조

```
ai-study/
├── apps/
│   ├── frontend/                 # Next.js 애플리케이션
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router
│   │   │   ├── components/       # React 컴포넌트
│   │   │   ├── lib/              # 유틸리티 함수
│   │   │   └── types/            # TypeScript 타입 정의
│   │   ├── public/               # 정적 파일
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── tsconfig.json
│   │
│   └── backend/                  # Express API 서버
│       ├── src/
│       │   ├── routes/           # API 라우트
│       │   ├── controllers/      # 컨트롤러
│       │   ├── services/         # 비즈니스 로직
│       │   ├── middleware/       # 미들웨어
│       │   ├── models/           # 데이터 모델
│       │   ├── config/           # 설정 파일
│       │   └── utils/            # 유틸리티
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/
│   ├── nginx/
│   │   ├── nginx.conf            # Nginx 메인 설정
│   │   └── conf.d/
│   │       └── default.conf      # 리버스 프록시 설정
│   ├── docker-compose.yml        # 전체 서비스 오케스트레이션
│   └── .env.example              # 환경 변수 예제
│
├── docs/                         # 문서
│   ├── ARCHITECTURE.md           # 이 문서
│   └── DEPLOYMENT.md             # 배포 가이드
│
├── .gitignore
├── .dockerignore
├── package.json                  # 루트 레벨 패키지 관리
└── README.md
```

## 2. 네트워크 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                        인터넷 사용자                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS (443) / HTTP (80)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Port: 80, 443                                        │   │
│  │  - SSL/TLS 종료                                        │   │
│  │  - 요청 라우팅                                         │   │
│  │  - 정적 파일 서빙                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────┬───────────────────────────────┬──────────────┘
                │                               │
                │ /api/*                        │ /*
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   Express Backend         │   │   Next.js Frontend        │
│   ┌─────────────────────┐ │   │   ┌─────────────────────┐ │
│   │ Port: 3001          │ │   │   │ Port: 3000          │ │
│   │ - API 엔드포인트      │ │   │   │ - SSR/SSG           │ │
│   │ - 비즈니스 로직       │ │   │   │ - 클라이언트 렌더링 │ │
│   │ - 데이터베이스 접근   │ │   │   │ - 정적 페이지       │ │
│   └─────────────────────┘ │   │   └─────────────────────┘ │
└───────────────────────────┘   └───────────────────────────┘
         │                                    │
         │                                    │
         └──────────────┬─────────────────────┘
                        │
                        ▼
         ┌──────────────────────────┐
         │   External Services       │
         │  - Firebase (Auth/DB)     │
         │  - Supabase (DB/Auth)     │
         │  - OAuth Providers        │
         └──────────────────────────┘
```

### 요청 흐름 상세

1. **정적 리소스 요청** (`/static/*`, `/images/*`)

   ```
   사용자 → Nginx → Next.js (정적 파일 직접 서빙)
   ```

2. **API 요청** (`/api/*`)

   ```
   사용자 → Nginx → Express Backend → External Services
   ```

3. **페이지 요청** (`/*` except `/api/*`)

   ```
   사용자 → Nginx → Next.js (SSR/SSG) → Express API (필요시)
   ```

## 3. 서비스 간 통신 구조

### 3.1 내부 네트워크 통신

```
┌─────────────────────────────────────────────────────────────┐
│              Docker Network: web-network                     │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   nginx      │──────│   frontend   │      │ backend  │  │
│  │              │      │              │      │          │  │
│  │  nginx:80    │      │  frontend:3000│      │backend:3001│ │
│  └──────────────┘      └──────────────┘      └──────────┘  │
│       │                      │                    │         │
│       └──────────────────────┴────────────────────┘         │
│                    내부 통신 (서비스명으로 접근)              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 통신 프로토콜 및 포트

| 서비스 | 내부 포트 | 외부 포트 | 통신 방식 |
|--------|----------|----------|----------|
| Nginx  | 80, 443  | 80, 443  | HTTP/HTTPS |
| Frontend | 3000   | -        | HTTP (내부만) |
| Backend  | 3001   | -        | HTTP (내부만) |

### 3.3 Next.js → Express 통신

```typescript
// Next.js에서 Express API 호출
const response = await fetch('http://backend:3001/api/users', {
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**중요**:

- 프로덕션에서는 상대 경로 사용 (`/api/users`)
- Docker 내부에서는 서비스명 사용 (`http://backend:3001/api/users`)

### 3.4 Nginx 라우팅 규칙

```
/                    → frontend:3000
/api/*               → backend:3001
/_next/static/*      → frontend:3000 (정적 파일)
/static/*            → frontend:3000 (정적 파일)
```

### 3.5 외부 서비스 통신 (향후 확장)

```
┌─────────────┐
│   Backend   │───┐
└─────────────┘   │
                  │
┌─────────────┐   │    ┌──────────────┐
│   Frontend  │───┼───▶│   Firebase   │
└─────────────┘   │    │  - Auth      │
                  │    │  - Firestore │
                  │    └──────────────┘
                  │
                  │    ┌──────────────┐
                  └───▶│   Supabase   │
                       │  - Database  │
                       │  - Auth      │
                       └──────────────┘
                            │
                            ▼
                  ┌──────────────┐
                  │ OAuth Providers│
                  │ - Google      │
                  │ - GitHub      │
                  │ - etc.        │
                  └──────────────┘
```

## 4. 환경 변수 구조

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
```

### Backend (.env)

```
PORT=3001
NODE_ENV=production
DATABASE_URL=...
FIREBASE_ADMIN_KEY=...
SUPABASE_SERVICE_KEY=...
```

### Docker Compose (.env)

```
DOMAIN=example.com
NGINX_PORT=80
SSL_CERT_PATH=...
SSL_KEY_PATH=...
```

## 5. 확장성 고려사항

1. **수평 확장**: Backend와 Frontend는 stateless하게 설계
2. **로드 밸런싱**: Nginx upstream을 통해 여러 인스턴스 라우팅 가능
3. **캐싱**: Nginx에서 정적 파일 및 API 응답 캐싱
4. **모니터링**: 각 서비스에 health check 엔드포인트 추가 예정
5. **로깅**: 중앙화된 로그 수집 구조 준비

## 6. 보안 고려사항

1. **HTTPS**: Nginx에서 SSL/TLS 종료
2. **CORS**: Backend에서 적절한 CORS 설정
3. **환경 변수**: 민감한 정보는 환경 변수로 관리
4. **Rate Limiting**: Nginx 및 Express에서 구현 가능
5. **인증**: Firebase/Supabase OAuth 통합 예정
