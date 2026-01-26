# Web Service Monorepo

Next.js + Express + Nginx를 사용한 실무 운영 가능한 웹 서비스 Monorepo 구조입니다.

**Turbo Monorepo**로 구성되어 빌드 캐싱과 병렬 실행을 지원합니다.

## 🏗️ 프로젝트 구조

```
ai-study/
├── apps/
│   ├── frontend/      # Next.js 애플리케이션
│   └── backend/       # Express API 서버
├── infrastructure/    # Docker & Nginx 설정
└── docs/             # 아키텍처 문서
```

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18 이상
- npm 9 이상
- Docker & Docker Compose (선택사항)

### 로컬 개발 환경

```bash
# ⚠️ 중요: 반드시 프로젝트 루트 디렉토리에서 실행하세요
# apps/frontend나 apps/backend 디렉토리에서 직접 npm install을 실행하면 에러가 발생합니다

# 의존성 설치 (루트에서만 실행)
cd /Users/haeun/ai-study
npm install

# 개발 서버 실행 (Frontend + Backend)
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 환경 변수 설정

#### Frontend
```bash
cd apps/frontend
cp .env.example .env.local
# .env.local 파일을 편집하여 환경 변수 설정
```

#### Backend
```bash
cd apps/backend
cp .env.example .env
# .env 파일을 편집하여 환경 변수 설정
```

### 빌드

```bash
# 모든 앱 빌드
npm run build

# 특정 앱만 빌드
npm run build --filter=frontend
npm run build --filter=backend
```

### 테스트

```bash
# 모든 테스트 실행
npm run test

# 특정 앱만 테스트
npm run test --filter=backend

# 커버리지 리포트
npm run test:coverage
```

### Docker로 실행

```bash
# 환경 변수 설정
cp infrastructure/.env.example infrastructure/.env

# Docker Compose로 전체 서비스 실행
cd infrastructure
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

- 웹 서비스: http://localhost (Nginx를 통해 라우팅)

## 📚 문서

- [아키텍처 설계](./docs/ARCHITECTURE.md) - 시스템 아키텍처 및 통신 구조
- [AWS EC2 배포 가이드](./docs/DEPLOYMENT_AWS.md) - 상세한 단계별 배포 가이드
- [빠른 배포 가이드](./docs/DEPLOYMENT_QUICK_START.md) - 경험 있는 개발자용 요약 가이드
- [배포 가이드](./docs/DEPLOYMENT.md) - 일반 배포 가이드
- [통신 흐름](./docs/COMMUNICATION_FLOW.md) - 서비스 간 통신 구조 상세
- [Kakao 로그인 설정](./docs/KAKAO_SETUP.md) - Kakao 계정 연동 가이드
- [Supabase 연결 확인](./docs/SUPABASE_CONNECTION.md) - 데이터베이스 연결 확인 방법

## 🔧 기술 스택

- **Monorepo**: Turbo
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Express.js + TypeScript
- **Reverse Proxy**: Nginx
- **Containerization**: Docker + Docker Compose
- **Package Management**: npm workspaces

## 🎯 Turbo 명령어

Turbo를 사용한 주요 명령어:

```bash
# 개발 서버 실행 (모든 앱)
npm run dev

# 빌드 (모든 앱, 캐싱 사용)
npm run build

# 특정 앱만 실행
npm run dev --filter=frontend
npm run dev --filter=backend

# 의존성 그래프 확인
npx turbo run build --graph

# 캐시 정리
npx turbo clean
```

## 🔐 향후 확장 계획

- Firebase (인증, 데이터베이스)
- Supabase (데이터베이스, 인증)
- OAuth (Google, GitHub 등)

## 📝 라이선스

Private
