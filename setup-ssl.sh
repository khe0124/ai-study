#!/usr/bin/env bash
set -euo pipefail

# ===================================
#   SSL 인증서 설정 스크립트
# ===================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="${SCRIPT_DIR}/infrastructure"
ENV_FILE="${INFRA_DIR}/.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}===================================${NC}"
echo -e "${BLUE}  SSL 인증서 설정${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# .env에서 DOMAIN 읽기
if [ -f "$ENV_FILE" ]; then
    DOMAIN=$(grep -E '^DOMAIN=' "$ENV_FILE" | cut -d'=' -f2-)
fi

# DOMAIN이 비어있으면 입력 받기
if [ -z "${DOMAIN:-}" ]; then
    echo -ne "  도메인을 입력하세요 (예: example.com): "
    read -r DOMAIN
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}도메인이 필요합니다. 종료합니다.${NC}"
        exit 1
    fi
    # .env에 DOMAIN 업데이트
    if [ -f "$ENV_FILE" ]; then
        if grep -q '^DOMAIN=' "$ENV_FILE"; then
            sed -i "s/^DOMAIN=.*/DOMAIN=${DOMAIN}/" "$ENV_FILE"
        else
            echo "DOMAIN=${DOMAIN}" >> "$ENV_FILE"
        fi
    fi
fi

echo -e "  도메인: ${GREEN}${DOMAIN}${NC}"
echo ""

# -----------------------------------------------
# [1/4] Certbot 설치
# -----------------------------------------------
echo -ne "${YELLOW}[1/4] Certbot 설치...${NC} "

if command -v certbot &> /dev/null; then
    echo -ne "(이미 설치됨) "
else
    sudo apt-get update -y > /dev/null 2>&1
    sudo apt-get install -y certbot > /dev/null 2>&1
fi

echo -e "${GREEN}✓${NC}"

# -----------------------------------------------
# [2/4] nginx 중지 (포트 80 해제)
# -----------------------------------------------
echo -ne "${YELLOW}[2/4] 인증서 발급 준비...${NC} "

cd "${INFRA_DIR}"
sudo docker compose stop nginx > /dev/null 2>&1 || true

echo -e "${GREEN}✓${NC}"

# -----------------------------------------------
# [3/4] 인증서 발급
# -----------------------------------------------
echo -ne "${YELLOW}[3/4] SSL 인증서 발급...${NC} "
echo ""

sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    2>&1 | tail -5

CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"

if [ ! -d "$CERT_PATH" ]; then
    echo -e "${RED}인증서 발급 실패. 도메인 DNS 설정을 확인하세요.${NC}"
    # nginx 재시작
    sudo docker compose start nginx > /dev/null 2>&1 || true
    exit 1
fi

echo -e "${GREEN}✓${NC}"

# -----------------------------------------------
# [4/4] nginx SSL 설정 및 재시작
# -----------------------------------------------
echo -ne "${YELLOW}[4/4] nginx SSL 설정 및 재시작...${NC} "

# nginx conf에 server_name 업데이트
sed -i "s/server_name localhost;/server_name ${DOMAIN};/g" "${INFRA_DIR}/nginx/conf.d/default.conf"

# SSL 인증서 경로 설정
if grep -q '^SSL_CERT_PATH=' "$ENV_FILE"; then
    sed -i "s|^SSL_CERT_PATH=.*|SSL_CERT_PATH=${CERT_PATH}|" "$ENV_FILE"
else
    echo "SSL_CERT_PATH=${CERT_PATH}" >> "$ENV_FILE"
fi

# HTTPS 리다이렉트 활성화 (주석 해제)
sed -i 's|# return 301 https://\$server_name\$request_uri;|return 301 https://\$server_name\$request_uri;|' \
    "${INFRA_DIR}/nginx/conf.d/default.conf"

# HTTPS 서버 블록 활성화 (주석 해제)
# default.conf에서 HTTPS 블록의 주석을 제거
sed -i '/^# HTTPS Server/,/^# }/ {
    s/^# //
    s/^#\t/\t/
    s/^#    /    /
}' "${INFRA_DIR}/nginx/conf.d/default.conf"

# SSL 인증서 경로를 Let's Encrypt 경로로 변경
sed -i "s|ssl_certificate /etc/nginx/ssl/cert.pem;|ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;|" \
    "${INFRA_DIR}/nginx/conf.d/default.conf"
sed -i "s|ssl_certificate_key /etc/nginx/ssl/key.pem;|ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;|" \
    "${INFRA_DIR}/nginx/conf.d/default.conf"

# docker-compose.yml에 letsencrypt 볼륨 마운트 추가 (nginx 서비스)
if ! grep -q '/etc/letsencrypt' "${INFRA_DIR}/docker-compose.yml"; then
    sed -i '/- \${SSL_CERT_PATH:-\.\/nginx\/ssl}:\/etc\/nginx\/ssl:ro/a\      - /etc/letsencrypt:/etc/letsencrypt:ro' \
        "${INFRA_DIR}/docker-compose.yml"
fi

# 서비스 재시작
sudo docker compose up -d > /dev/null 2>&1

echo -e "${GREEN}✓${NC}"

# -----------------------------------------------
# 자동 갱신 crontab 설정
# -----------------------------------------------
echo ""
echo -ne "${YELLOW}자동 갱신 crontab 설정...${NC} "

CRON_CMD="0 3 * * * certbot renew --quiet --pre-hook 'cd ${INFRA_DIR} && docker compose stop nginx' --post-hook 'cd ${INFRA_DIR} && docker compose start nginx'"

# 이미 등록되어 있는지 확인
if ! (sudo crontab -l 2>/dev/null | grep -q "certbot renew"); then
    (sudo crontab -l 2>/dev/null; echo "$CRON_CMD") | sudo crontab -
fi

echo -e "${GREEN}✓${NC}"

# -----------------------------------------------
# 완료 메시지
# -----------------------------------------------
echo ""
echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}  SSL 설정 완료!${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo -e "  HTTPS URL: https://${DOMAIN}"
echo -e "  인증서 경로: ${CERT_PATH}"
echo -e "  자동 갱신: 매일 03:00 (crontab)"
echo ""
