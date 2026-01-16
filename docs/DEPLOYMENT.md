# 배포 가이드

## 환경 변수 설정

### 1. Infrastructure 환경 변수

`infrastructure/.env` 파일 생성:

```bash
DOMAIN=yourdomain.com
NGINX_PORT=80
NGINX_SSL_PORT=443
SSL_CERT_PATH=./nginx/ssl
```

### 2. Frontend 환경 변수

`apps/frontend/.env.local` 파일 생성:

```bash
NEXT_PUBLIC_API_URL=http://backend:3001
```

### 3. Backend 환경 변수

`apps/backend/.env` 파일 생성:

```bash
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

## Docker Compose 실행

```bash
cd infrastructure
docker-compose up -d
```

## 서비스 확인

- 웹 서비스: http://localhost
- Health Check: http://localhost/health
- Frontend Health: http://localhost/api/health (Next.js)
- Backend Health: http://localhost/api/health (Express)

## 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f nginx
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 프로덕션 배포 체크리스트

- [ ] SSL 인증서 설정
- [ ] 환경 변수 설정
- [ ] 데이터베이스 연결 설정
- [ ] Firebase/Supabase 설정
- [ ] OAuth 설정
- [ ] 도메인 DNS 설정
- [ ] 모니터링 설정
- [ ] 백업 전략 수립
