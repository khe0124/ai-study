# 빠른 배포 가이드 (요약)

이 문서는 경험 있는 개발자를 위한 빠른 참조 가이드입니다. 상세한 설명은 [DEPLOYMENT_AWS.md](./DEPLOYMENT_AWS.md)를 참고하세요.

## 1. EC2 인스턴스 생성

```bash
# AWS 콘솔에서:
# - Ubuntu 22.04 LTS 선택
# - t3.small 이상 권장
# - 보안 그룹: SSH(22), HTTP(80), HTTPS(443) 열기
# - 키 페어 다운로드
```

## 2. 서버 접속 및 초기 설정

```bash
# SSH 접속
ssh -i ~/key.pem ubuntu@<EC2-IP>

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 방화벽 설정
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 3. Docker 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 재접속
exit
```

## 4. 프로젝트 클론 및 설정

```bash
# 레포지토리 클론
cd ~
git clone <your-repo-url> ai-study
cd ai-study/infrastructure

# 환경 변수 설정
cp .env.example .env
nano .env  # DOMAIN 설정

# 디렉토리 생성
mkdir -p nginx/logs nginx/ssl
```

## 5. 서비스 실행

```bash
# 이미지 빌드 및 실행
docker compose build
docker compose up -d

# 상태 확인
docker compose ps
docker compose logs -f
```

## 6. 도메인 연결

```bash
# DNS에 A 레코드 추가
# 타입: A
# 호스트: @
# 값: <EC2-퍼블릭-IP>
# TTL: 300
```

## 7. HTTPS 적용

```bash
# Certbot 설치
sudo snap install --classic certbot

# 인증서 발급
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Nginx 설정 수정
# - nginx/conf.d/default.conf에서 HTTPS 블록 주석 해제
# - SSL 인증서 경로 설정
# - docker-compose.yml에 /etc/letsencrypt 볼륨 추가

# 서비스 재시작
docker compose restart nginx

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가:
# 0 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /home/ubuntu/ai-study/infrastructure/docker-compose.yml restart nginx"
```

## 확인

```bash
# Health check
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health
```

## 유용한 명령어

```bash
# 서비스 관리
docker compose up -d          # 시작
docker compose down            # 중지
docker compose restart         # 재시작
docker compose logs -f         # 로그 확인

# 업데이트
cd ~/ai-study && git pull
cd infrastructure && docker compose build && docker compose up -d
```
