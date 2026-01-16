# Web Service Monorepo

Next.js + Express + Nginx를 사용한 실무 운영 가능한 웹 서비스 Monorepo 구조입니다.

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

### 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (프론트엔드 + 백엔드)
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

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

## 🔧 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Express.js + TypeScript
- **Reverse Proxy**: Nginx
- **Containerization**: Docker + Docker Compose
- **Package Management**: npm workspaces

## 🔐 향후 확장 계획

- Firebase (인증, 데이터베이스)
- Supabase (데이터베이스, 인증)
- OAuth (Google, GitHub 등)

## 📝 라이선스

Private
