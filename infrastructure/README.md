# Infrastructure Setup

Docker Compose를 사용한 서비스 오케스트레이션 설정입니다.

## 네트워크 구조

```
┌─────────────────────────────────────────────────────────┐
│              External Network (Internet)                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Port 80, 443
                        │
┌───────────────────────▼─────────────────────────────────┐
│              web-network (Bridge)                        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Nginx   │───▶│ Frontend │    │ Backend  │         │
│  │  :80/443 │    │  :3000   │    │  :3001   │         │
│  └──────────┘    └──────────┘    └──────────┘         │
└─────────────────────────────────────────────────────────┘
                        │
                        │ (Optional)
                        │
┌───────────────────────▼─────────────────────────────────┐
│           data-network (Bridge, Internal)                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Redis   │    │PostgreSQL│    │  MySQL   │         │
│  │  :6379   │    │  :5432   │    │  :3306   │         │
│  └──────────┘    └──────────┘    └──────────┘         │
└─────────────────────────────────────────────────────────┘
```

## 서비스 구조

### 외부 노출 서비스
- **Nginx**: 포트 80, 443만 외부에 노출

### 내부 서비스 (외부 접근 불가)
- **Frontend**: Next.js (포트 3000)
- **Backend**: Express (포트 3001)
- **Redis**: (선택사항, 포트 6379)
- **PostgreSQL/MySQL**: (선택사항, 포트 5432/3306)

## 환경 변수 설정

1. `.env.example` 파일을 `.env`로 복사:
```bash
cp .env.example .env
```

2. `.env` 파일을 편집하여 실제 값 입력

## 실행 방법

### 전체 서비스 시작
```bash
docker-compose up -d
```

### 특정 서비스만 시작
```bash
docker-compose up -d nginx frontend backend
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f nginx
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 서비스 중지
```bash
docker-compose down
```

### 볼륨 포함 완전 삭제
```bash
docker-compose down -v
```

## Redis 추가하기

1. `docker-compose.yml`에서 `redis` 서비스 주석 해제
2. `data-network` 네트워크 주석 해제
3. `backend` 서비스의 `data-network` 주석 해제
4. `.env` 파일에 Redis 설정 추가
5. 재시작: `docker-compose up -d`

## 데이터베이스 추가하기

### PostgreSQL
1. `docker-compose.yml`에서 `postgres` 서비스 주석 해제
2. `data-network` 네트워크 주석 해제
3. `backend` 서비스의 `data-network` 주석 해제
4. `.env` 파일에 PostgreSQL 설정 추가
5. 재시작: `docker-compose up -d`

### MySQL
1. `docker-compose.yml`에서 `mysql` 서비스 주석 해제
2. `data-network` 네트워크 주석 해제
3. `backend` 서비스의 `data-network` 주석 해제
4. `.env` 파일에 MySQL 설정 추가
5. 재시작: `docker-compose up -d`

## Health Check

모든 서비스는 health check를 포함하고 있습니다:

- Nginx: `http://localhost/health`
- Frontend: `http://localhost/api/health` (Next.js)
- Backend: `http://localhost/api/health` (Express)

## 개발 모드

개발 중에는 볼륨 마운트를 활성화하여 hot-reload를 사용할 수 있습니다:

`docker-compose.yml`에서 각 서비스의 `volumes` 섹션 주석을 해제하세요.

## 프로덕션 배포

프로덕션에서는:
1. 볼륨 마운트 제거 (immutable deployment)
2. HTTPS 설정 활성화
3. 환경 변수 보안 관리
4. 데이터베이스 백업 설정
