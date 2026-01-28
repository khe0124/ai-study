# 배포 가이드

이 문서는 로컬 Docker 실행, 배포 체크리스트, AWS EC2 배포까지 한 곳에서 다룹니다.

---

## 목차

1. [환경 변수](#1-환경-변수)
2. [로컬 / Docker Compose 실행](#2-로컬--docker-compose-실행)
3. [서비스 확인 및 로그](#3-서비스-확인-및-로그)
4. [배포 체크리스트](#4-배포-체크리스트)
5. [AWS EC2 배포](#5-aws-ec2-배포)
6. [트러블슈팅 및 유용한 명령어](#6-트러블슈팅-및-유용한-명령어)

---

## 1. 환경 변수

### 1.1 Infrastructure (`infrastructure/.env`)

```bash
DOMAIN=yourdomain.com
NGINX_PORT=80
NGINX_SSL_PORT=443
SSL_CERT_PATH=./nginx/ssl
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://backend:3001
BACKEND_PORT=3001
FRONTEND_URL=http://frontend:3000
```

### 1.2 Frontend (`apps/frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://backend:3001
```

### 1.3 Backend (`apps/backend/.env`)

```bash
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
# DATABASE_URL, JWT_SECRET 등 필수 항목 설정
```

---

## 2. 로컬 / Docker Compose 실행

```bash
cd infrastructure
docker-compose up -d
```

### 빠른 배포 요약 (경험자용)

- **EC2**: Ubuntu 22.04, t3.small 권장, 보안 그룹 22/80/443
- **서버**: `sudo apt update && sudo apt upgrade -y`, UFW 22/80/443 허용
- **Docker**: `curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh`, `sudo usermod -aG docker $USER`
- **프로젝트**: `git clone`, `infrastructure/.env` 설정, `mkdir -p nginx/logs nginx/ssl`
- **실행**: `docker compose build && docker compose up -d`
- **도메인**: DNS A 레코드 → EC2 퍼블릭 IP
- **HTTPS**: Certbot 설치 후 `sudo certbot certonly --standalone -d yourdomain.com`, Nginx에 SSL 설정·볼륨 마운트, `docker compose restart nginx`
- **자동 갱신**: crontab에 `0 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /home/ubuntu/ai-study/infrastructure/docker-compose.yml restart nginx"`

---

## 3. 서비스 확인 및 로그

| 대상 | URL/명령 |
|------|----------|
| 웹 | http://localhost |
| Health | http://localhost/health |
| Frontend Health | http://localhost/api/health (Next.js) |
| Backend Health | http://localhost/api/health (Express) |

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스
docker-compose logs -f nginx
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## 4. 배포 체크리스트

### 사전 준비

- [ ] AWS 계정, 도메인 또는 기존 도메인, Git 접근, SSH 키 페어

### EC2 인스턴스

- [ ] Ubuntu 22.04 LTS, t3.small 이상 권장
- [ ] 키 페어 생성·다운로드
- [ ] 보안 그룹: SSH(22) 내 IP, HTTP(80)·HTTPS(443) 0.0.0.0/0
- [ ] 퍼블릭 IP 자동 할당

### 서버 초기 설정

- [ ] SSH 접속, `apt update && apt upgrade`
- [ ] 방화벽(UFW) 22/80/443, 타임존 등 선택 설정

### Docker

- [ ] Docker·Docker Compose 설치, 사용자 docker 그룹 추가
- [ ] `docker ps` 등 sudo 없이 동작 확인

### 프로젝트

- [ ] 레포 클론, `infrastructure/.env` 및 DOMAIN 설정
- [ ] `nginx/logs`, `nginx/ssl` 디렉터리 생성

### 서비스 실행

- [ ] `docker compose build`, `docker compose up -d`
- [ ] Health check 응답, 로그 에러 없음

### 도메인·HTTPS

- [ ] DNS A 레코드 추가·전파 확인
- [ ] Certbot 설치·인증서 발급
- [ ] Nginx HTTPS 설정·인증서 볼륨 마운트
- [ ] HTTP→HTTPS 리다이렉트, SSL 자동 갱신(crontab)

### 최종·보안

- [ ] HTTPS, Frontend/Backend/Health 확인
- [ ] (선택) SSH 키만 허용, root 로그인 비활성화, 로그·백업 설정

---

## 5. AWS EC2 배포

### 5.1 EC2 인스턴스 생성

1. AWS 콘솔 → EC2 → 인스턴스 시작  
2. 이름, AMI **Ubuntu 22.04 LTS**, 인스턴스 유형 **t3.small** 권장  
3. 키 페어 생성·저장 (.pem 안전한 곳에 보관)  
4. 네트워크: 퍼블릭 IP 활성화, 보안 그룹 규칙:
   - SSH(22): 내 IP
   - HTTP(80), HTTPS(443): 0.0.0.0/0  
5. 스토리지 기본 또는 필요 시 조정 후 인스턴스 시작

### 5.2 접속 및 초기 설정

```bash
chmod 400 ~/Downloads/your-key.pem
ssh -i ~/Downloads/your-key.pem ubuntu@<퍼블릭-IP>
```

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
sudo timedatectl set-timezone Asia/Seoul   # 선택
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 5.3 Docker 설치

```bash
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER
```

이후 **로그아웃 후 재접속**한 뒤 `docker ps`, `docker compose version` 확인.

### 5.4 프로젝트 클론 및 설정

```bash
cd ~
git clone <your-repo-url> ai-study
cd ai-study/infrastructure
cp .env.example .env
nano .env   # DOMAIN, NODE_ENV, NEXT_PUBLIC_API_URL, BACKEND_PORT, FRONTEND_URL 등 설정
mkdir -p nginx/logs nginx/ssl
```

### 5.5 서비스 실행

```bash
docker compose build
docker compose up -d
docker compose ps
curl http://localhost/health
curl http://localhost/api/health
```

### 5.6 도메인 연결

- **Route 53**: 호스팅 영역 생성 → 레코드 유형 A, 값=EC2 퍼블릭 IP, TTL 300  
- **그 외 DNS**: A 레코드 호스트 `@` 또는 `www`, 값=EC2 퍼블릭 IP  
- 전파 후 `nslookup yourdomain.com` 또는 `dig yourdomain.com`로 확인  
- `infrastructure/.env`의 `DOMAIN`을 실제 도메인으로 수정 후 `docker compose restart nginx`

### 5.7 HTTPS (Let's Encrypt)

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

인증서 경로:

- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

`infrastructure/nginx/conf.d/default.conf`에 HTTPS 서버 블록 설정(ssl_certificate, ssl_certificate_key, proxy_pass 등).  
`docker-compose.yml`의 nginx volumes에 `/etc/letsencrypt:/etc/letsencrypt:ro` 추가 후:

```bash
docker compose restart nginx
```

자동 갱신(crontab):

```bash
sudo crontab -e
# 추가: 0 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /home/ubuntu/ai-study/infrastructure/docker-compose.yml restart nginx"
```

### 5.8 배포 완료 확인

```bash
docker compose ps
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
```

---

## 6. 트러블슈팅 및 유용한 명령어

### 트러블슈팅

- **포트 사용 충돌**: `sudo netstat -tulpn | grep :80` 등으로 확인 후 프로세스 종료  
- **Docker 권한**: `sudo usermod -aG docker $USER` 후 재로그인  
- **SSL 갱신 실패**: `sudo certbot renew` 후 `docker compose restart nginx`  
- **도메인 미연결**: `nslookup yourdomain.com`, UFW, AWS 보안 그룹 인바운드 확인  

### 서비스 관리

```bash
docker compose up -d
docker compose down
docker compose restart
docker compose logs -f
docker compose logs -f nginx
```

### 업데이트

```bash
cd ~/ai-study && git pull
cd infrastructure && docker compose build && docker compose up -d
```

### 기타

- 컨테이너 상태: `docker ps -a`
- 로그: `docker logs <컨테이너이름>`
- 네트워크: `docker network ls`, `docker network inspect <network>`

---

## 프로덕션 체크 요약

- [ ] SSL 인증서 및 HTTPS
- [ ] 환경 변수(특히 JWT_SECRET, DB, API URL) 설정
- [ ] DB 연결·마이그레이션
- [ ] OAuth/소셜 로그인 설정
- [ ] 도메인 DNS
- [ ] 모니터링·백업 전략(선택)
