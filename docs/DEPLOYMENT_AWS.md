# AWS EC2 배포 가이드

이 가이드는 AWS EC2 (Ubuntu 22.04)에 웹 서비스를 배포하는 전체 과정을 단계별로 설명합니다.

## 목차

1. [AWS EC2 인스턴스 생성 및 서버 세팅](#1-aws-ec2-인스턴스-생성-및-서버-세팅)
2. [Docker 및 Docker Compose 설치](#2-docker-및-docker-compose-설치)
3. [레포지토리 클론 및 설정](#3-레포지토리-클론-및-설정)
4. [Docker Compose로 서비스 실행](#4-docker-compose로-서비스-실행)
5. [도메인 연결 (Route 53 또는 다른 DNS)](#5-도메인-연결-route-53-또는-다른-dns)
6. [HTTPS 적용 (Let's Encrypt)](#6-https-적용-lets-encrypt)

---

## 1. AWS EC2 인스턴스 생성 및 서버 세팅

### 1.1 EC2 인스턴스 생성

1. **AWS 콘솔 접속**

   - <https://aws.amazon.com/console> 접속
   - AWS 계정으로 로그인

2. **EC2 서비스로 이동**

   - 검색창에 "EC2" 입력
   - EC2 서비스 선택

3. **인스턴스 시작**

   - "인스턴스 시작" 버튼 클릭

4. **인스턴스 설정**

   - **이름**: `web-service` (원하는 이름)
   - **AMI**: Ubuntu Server 22.04 LTS 선택
   - **인스턴스 유형**: `t2.micro` (프리티어) 또는 `t3.small` (프로덕션 권장)
   - **키 페어**: 새 키 페어 생성 또는 기존 키 페어 선택
     - 키 페어 이름: `web-service-key`
     - 키 페어 유형: RSA
     - 프라이빗 키 파일 형식: `.pem`
     - **⚠️ 중요**: 키 파일을 안전한 곳에 다운로드 (다시 받을 수 없음)

5. **네트워크 설정**

   - **퍼블릭 IP 자동 할당**: 활성화
   - **보안 그룹**: 새 보안 그룹 생성
     - 보안 그룹 이름: `web-service-sg`
     - 설명: `Web service security group`

6. **보안 그룹 규칙 설정**

   - **SSH (22)**: 내 IP에서만 접근 허용
   - **HTTP (80)**: 모든 위치 (0.0.0.0/0)
   - **HTTPS (443)**: 모든 위치 (0.0.0.0/0)

   규칙 추가:

   ```
   유형: SSH
   프로토콜: TCP
   포트 범위: 22
   소스: 내 IP

   유형: HTTP
   프로토콜: TCP
   포트 범위: 80
   소스: 0.0.0.0/0

   유형: HTTPS
   프로토콜: TCP
   포트 범위: 443
   소스: 0.0.0.0/0
   ```

7. **스토리지 설정**

   - 기본값 (8GB gp3) 사용 또는 필요에 따라 조정

8. **인스턴스 시작**
   - "인스턴스 시작" 버튼 클릭
   - 인스턴스가 생성될 때까지 대기 (1-2분)

### 1.2 EC2 인스턴스 접속

1. **퍼블릭 IP 확인**

   - EC2 대시보드에서 생성된 인스턴스 선택
   - "퍼블릭 IPv4 주소" 복사 (예: `54.123.45.67`)

2. **SSH로 접속 (Mac/Linux)**

   ```bash
   # 키 파일 권한 설정
   chmod 400 ~/Downloads/web-service-key.pem

   # SSH 접속
   ssh -i ~/Downloads/web-service-key.pem ubuntu@<퍼블릭-IP>
   ```

3. **SSH로 접속 (Windows)**

   - PuTTY 또는 Windows Terminal 사용
   - PuTTY 사용 시:
     - Connection > SSH > Auth에서 Private key file 선택
     - Host Name: `ubuntu@<퍼블릭-IP>`
     - Port: `22`
     - Open 클릭

4. **첫 접속 시 확인 메시지**

   ```
   Are you sure you want to continue connecting (yes/no)?
   ```

   `yes` 입력

### 1.3 서버 초기 설정

접속 후 다음 명령어들을 실행합니다:

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl wget git build-essential

# 타임존 설정 (선택사항)
sudo timedatectl set-timezone Asia/Seoul

# 방화벽 설정 (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 방화벽 상태 확인
sudo ufw status
```

---

## 2. Docker 및 Docker Compose 설치

### 2.1 Docker 설치

```bash
# Docker 공식 저장소 추가를 위한 패키지 설치
sudo apt install -y ca-certificates curl gnupg lsb-release

# Docker의 공식 GPG 키 추가
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Docker 저장소 추가
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 패키지 목록 업데이트
sudo apt update

# Docker Engine 설치
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker 서비스 시작 및 자동 시작 설정
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가 (sudo 없이 docker 사용)
sudo usermod -aG docker $USER

# 변경사항 적용을 위해 로그아웃 후 재접속
exit
```

**재접속 후 확인:**

```bash
# Docker 버전 확인
docker --version

# Docker Compose 버전 확인
docker compose version

# sudo 없이 docker 실행 테스트
docker ps
```

### 2.2 Docker 설치 확인

```bash
# Docker 서비스 상태 확인
sudo systemctl status docker

# Docker 테스트 실행
docker run hello-world
```

---

## 3. 레포지토리 클론 및 설정

### 3.1 Git 설치 (이미 설치되어 있을 수 있음)

```bash
# Git 설치 확인
git --version

# 설치되어 있지 않다면
sudo apt install -y git
```

### 3.2 레포지토리 클론

```bash
# 홈 디렉토리로 이동
cd ~

# 레포지토리 클론 (GitHub 예시)
git clone https://github.com/your-username/ai-study.git

# 또는 SSH 사용
# git clone git@github.com:your-username/ai-study.git

# 프로젝트 디렉토리로 이동
cd ai-study
```

### 3.3 환경 변수 설정

```bash
# infrastructure 디렉토리로 이동
cd infrastructure

# .env 파일 생성
nano .env
```

`.env` 파일에 다음 내용 입력 (도메인은 나중에 설정):

```bash
# Domain Configuration
DOMAIN=yourdomain.com

# Port Configuration
NGINX_PORT=80
NGINX_SSL_PORT=443

# SSL Configuration
SSL_CERT_PATH=./nginx/ssl

# Application Environment
NODE_ENV=production

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://backend:3001

# Backend Environment Variables
BACKEND_PORT=3001
FRONTEND_URL=http://frontend:3000
```

**저장 및 종료:**

- `Ctrl + O` (저장)
- `Enter` (확인)
- `Ctrl + X` (종료)

### 3.4 Nginx 로그 디렉토리 생성

```bash
# Nginx 로그 디렉토리 생성
mkdir -p nginx/logs

# SSL 디렉토리 생성 (Let's Encrypt 인증서용)
mkdir -p nginx/ssl
```

---

## 4. Docker Compose로 서비스 실행

### 4.1 이미지 빌드 및 실행

```bash
# infrastructure 디렉토리에서 실행
cd ~/ai-study/infrastructure

# 이미지 빌드
docker compose build

# 서비스 시작 (백그라운드)
docker compose up -d

# 서비스 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f
```

### 4.2 서비스 확인

```bash
# 모든 컨테이너 실행 확인
docker ps

# Health check 확인
curl http://localhost/health

# Frontend 확인
curl http://localhost

# Backend API 확인
curl http://localhost/api/health
```

### 4.3 문제 해결

```bash
# 특정 서비스 로그 확인
docker compose logs nginx
docker compose logs frontend
docker compose logs backend

# 서비스 재시작
docker compose restart

# 서비스 중지
docker compose down

# 서비스 중지 및 이미지 삭제
docker compose down --rmi all
```

---

## 5. 도메인 연결 (Route 53 또는 다른 DNS)

### 5.1 도메인 구매 (이미 있다면 건너뛰기)

- AWS Route 53
- GoDaddy
- Namecheap
- Cloudflare
- 기타 도메인 등록 업체

### 5.2 Route 53을 사용하는 경우

1. **Route 53 호스팅 영역 생성**

   - AWS 콘솔 > Route 53
   - "호스팅 영역" > "호스팅 영역 생성"
   - 도메인 이름 입력 (예: `example.com`)
   - 유형: 공용 호스팅 영역

2. **레코드 생성**

   - "레코드 생성" 클릭
   - 레코드 이름: `@` (루트 도메인) 또는 `www` (서브도메인)
   - 레코드 유형: `A`
   - 값: EC2 인스턴스의 **퍼블릭 IP 주소**
   - TTL: `300` (5분)
   - "레코드 생성" 클릭

3. **네임서버 확인**
   - Route 53에서 제공하는 네임서버를 도메인 등록 업체에 설정

### 5.3 다른 DNS 제공업체를 사용하는 경우

1. **DNS 관리 패널 접속**

   - 도메인 등록 업체의 DNS 관리 페이지로 이동

2. **A 레코드 추가**

   ```
   타입: A
   호스트: @ (또는 www)
   값: <EC2-퍼블릭-IP>
   TTL: 300
   ```

3. **확산 대기**
   - DNS 변경사항이 전파되는데 5분~48시간 소요
   - 확인: `nslookup yourdomain.com` 또는 `dig yourdomain.com`

### 5.4 도메인 연결 확인

```bash
# 도메인이 EC2 IP로 연결되는지 확인
nslookup yourdomain.com

# 또는
dig yourdomain.com
```

### 5.5 .env 파일 업데이트

```bash
cd ~/ai-study/infrastructure
nano .env
```

`DOMAIN` 값을 실제 도메인으로 변경:

```bash
DOMAIN=yourdomain.com
```

변경 후 서비스 재시작:

```bash
docker compose restart nginx
```

---

## 6. HTTPS 적용 (Let's Encrypt)

### 6.1 Certbot 설치

```bash
# Certbot 설치
sudo apt install -y certbot python3-certbot-nginx

# 또는 snap 사용 (권장)
sudo snap install --classic certbot

# certbot을 PATH에 추가
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 6.2 Nginx 설정 수정 (임시)

Let's Encrypt 인증을 위해 Nginx가 80 포트에서 실행되어야 합니다.

```bash
# nginx 설정 확인
cd ~/ai-study/infrastructure
cat nginx/conf.d/default.conf | grep -A 5 "listen 80"
```

80 포트가 열려있는지 확인 (이미 설정되어 있어야 함).

### 6.3 SSL 인증서 발급

```bash
# Certbot으로 인증서 발급
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 또는 nginx 플러그인 사용 (Nginx가 실행 중일 때)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**프롬프트 입력:**

- 이메일 주소 입력
- 이용 약관 동의: `Y`
- 이메일 수신 동의: `Y` 또는 `N`

### 6.4 인증서 위치 확인

인증서는 다음 위치에 저장됩니다:

```
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### 6.5 Nginx 설정에 SSL 적용

```bash
cd ~/ai-study/infrastructure
nano nginx/conf.d/default.conf
```

HTTPS 서버 블록의 주석을 해제하고 수정:

```nginx
# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Frontend routes (Next.js)
    location / {
        limit_req zone=general_limit burst=50 nodelay;

        proxy_pass http://frontend;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Cache control
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache $http_upgrade;
    }

    # API routes (Express)
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;

        # WebSocket support for API
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # CORS and security headers for API
        add_header Access-Control-Allow-Origin "$http_origin" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept" always;
        add_header Access-Control-Allow-Credentials "true" always;

        # Handle preflight requests
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "$http_origin" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }
}
```

HTTP 서버 블록에 HTTPS 리다이렉트 추가:

```nginx
# HTTP Server (redirect to HTTPS)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Health check endpoint (for Let's Encrypt renewal)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

### 6.6 Docker Compose에 SSL 인증서 볼륨 마운트 추가

```bash
nano docker-compose.yml
```

nginx 서비스의 volumes 섹션에 추가:

```yaml
nginx:
  # ... 기존 설정 ...
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/conf.d:/etc/nginx/conf.d:ro
    - ./nginx/logs:/var/log/nginx
    - /etc/letsencrypt:/etc/letsencrypt:ro # SSL 인증서 마운트
```

### 6.7 서비스 재시작

```bash
# Nginx 재시작
docker compose restart nginx

# 또는 전체 재시작
docker compose down
docker compose up -d
```

### 6.8 HTTPS 확인

```bash
# HTTPS 연결 테스트
curl https://yourdomain.com

# 브라우저에서 확인
# https://yourdomain.com 접속
```

### 6.9 자동 갱신 설정

Let's Encrypt 인증서는 90일마다 갱신해야 합니다. 자동 갱신 설정:

```bash
# Certbot 자동 갱신 테스트
sudo certbot renew --dry-run

# Crontab에 자동 갱신 추가
sudo crontab -e
```

다음 줄 추가:

```
0 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /home/ubuntu/ai-study/infrastructure/docker-compose.yml restart nginx"
```

이 설정은 매일 새벽 3시에 인증서를 확인하고, 갱신이 필요하면 자동으로 갱신 후 Nginx를 재시작합니다.

---

## 7. 배포 완료 확인

### 7.1 서비스 상태 확인

```bash
# 모든 서비스 실행 확인
docker compose ps

# Health check
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health

# 로그 확인
docker compose logs --tail=50
```

### 7.2 보안 확인

- [ ] HTTPS 연결 정상 작동
- [ ] HTTP → HTTPS 리다이렉트 작동
- [ ] 보안 헤더 확인 (브라우저 개발자 도구 > Network > Headers)
- [ ] SSL 인증서 유효성 확인

### 7.3 성능 확인

```bash
# 서버 리소스 사용량 확인
htop

# 또는
top

# Docker 리소스 사용량
docker stats
```

---

## 8. 유용한 명령어 모음

### 8.1 서비스 관리

```bash
# 서비스 시작
docker compose up -d

# 서비스 중지
docker compose down

# 서비스 재시작
docker compose restart

# 특정 서비스만 재시작
docker compose restart nginx

# 로그 확인
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f nginx
```

### 8.2 업데이트 및 배포

```bash
# 코드 업데이트
cd ~/ai-study
git pull

# 이미지 재빌드
cd infrastructure
docker compose build

# 서비스 재시작
docker compose up -d
```

### 8.3 문제 해결

```bash
# 컨테이너 상태 확인
docker ps -a

# 컨테이너 로그 확인
docker logs web-nginx
docker logs web-frontend
docker logs web-backend

# 컨테이너 내부 접속
docker exec -it web-nginx sh
docker exec -it web-backend sh

# 네트워크 확인
docker network ls
docker network inspect infrastructure_web-network
```

---

## 9. 트러블슈팅

### 9.1 포트가 이미 사용 중인 경우

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# 프로세스 종료
sudo kill -9 <PID>
```

### 9.2 Docker 권한 오류

```bash
# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 재접속
exit
```

### 9.3 SSL 인증서 갱신 실패

```bash
# 수동 갱신 시도
sudo certbot renew

# Nginx 재시작
docker compose restart nginx
```

### 9.4 도메인 연결 안 됨

```bash
# DNS 확인
nslookup yourdomain.com
dig yourdomain.com

# 방화벽 확인
sudo ufw status

# 보안 그룹 확인 (AWS 콘솔)
# EC2 > 보안 그룹 > 인바운드 규칙 확인
```

---

## 10. 추가 보안 설정 (선택사항)

### 10.1 SSH 키 기반 인증 강화

```bash
# SSH 설정 파일 수정
sudo nano /etc/ssh/sshd_config

# 다음 설정 추가/수정
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes

# SSH 재시작
sudo systemctl restart sshd
```

### 10.2 자동 업데이트 설정

```bash
# 자동 업데이트 설치
sudo apt install -y unattended-upgrades

# 설정
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 완료

축하합니다! 이제 웹 서비스가 AWS EC2에서 HTTPS로 실행되고 있습니다.

**접속 URL:**

- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api`
- Health Check: `https://yourdomain.com/health`

**다음 단계:**

- 모니터링 설정 (CloudWatch, Datadog 등)
- 백업 전략 수립
- CI/CD 파이프라인 구축
- 로드 밸런서 추가 (트래픽 증가 시)
