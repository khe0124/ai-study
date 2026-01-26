#!/bin/bash

# Supabase 데이터베이스 연결 테스트 스크립트

echo "🔍 Supabase 데이터베이스 연결 테스트"
echo "=================================="
echo ""

# Backend 디렉토리로 이동
cd "$(dirname "$0")/.." || exit

# .env 파일 확인
if [ ! -f .env ]; then
  echo "❌ .env 파일이 없습니다."
  echo "   apps/backend/.env.example을 참고하여 .env 파일을 생성하세요."
  exit 1
fi

# DATABASE_URL 확인
if ! grep -q "DATABASE_URL" .env; then
  echo "❌ .env 파일에 DATABASE_URL이 설정되지 않았습니다."
  echo "   DATABASE_URL=postgresql://... 형식으로 추가하세요."
  exit 1
fi

echo "✅ .env 파일 확인 완료"
echo ""

# TypeScript 파일 실행
echo "🔌 데이터베이스 연결 시도 중..."
echo ""

npx tsx src/test-db-connection.ts
