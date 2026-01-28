# Supabase 데이터베이스 연결 확인 가이드

Supabase 데이터베이스 연결 상태를 확인하는 방법입니다.

## 🔍 연결 확인 방법

### 방법 1: 테스트 스크립트 실행 (권장)

```bash
# Backend 디렉토리로 이동
cd apps/backend

# 데이터베이스 연결 테스트
npm run test:db
```

또는 직접 실행:

```bash
cd apps/backend
npx tsx src/test-db-connection.ts
```

### 방법 2: 환경 변수 확인

```bash
# Backend 디렉토리에서
cd apps/backend

# .env 파일 확인
cat .env | grep DATABASE_URL

# 또는
echo $DATABASE_URL
```

## 📋 확인 체크리스트

### 1. 환경 변수 설정 확인

`apps/backend/.env` 파일에 다음이 설정되어 있어야 합니다:

```env
DATABASE_URL=postgresql://postgres:[비밀번호]@db.[프로젝트ID].supabase.co:5432/postgres
```

또는 Connection Pooling URL:

```env
DATABASE_URL=postgresql://postgres.[프로젝트ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 2. Supabase 프로젝트 확인

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. Settings → Database → Connection string 확인
4. "Session mode" 또는 "Transaction mode" 선택
5. Connection string 복사

### 3. 연결 테스트 실행

```bash
cd apps/backend
npm run test:db
```

**성공 시 출력 예시:**
```
✅ 데이터베이스 연결 성공!
📅 현재 시간: 2024-01-26 12:00:00
🗄️  PostgreSQL 버전: PostgreSQL 15.x

📊 존재하는 테이블:
  - users
  - posts
  - comments

👥 users 테이블 레코드 수: 0
📝 posts 테이블 레코드 수: 0
💬 comments 테이블 레코드 수: 0

✅ 연결 테스트 완료!
```

## 🔴 연결이 안 될 때 (우선 확인)

1. **Supabase 대시보드에서 URI 그대로 복사**
   - [Supabase Dashboard](https://app.supabase.com/) → 프로젝트 선택
   - **Project Settings** → **Database**
   - **Connection string** 탭 → **URI** 선택
   - **Session mode**(포트 5432) 또는 **Transaction mode**(포트 6543) 중 하나 복사
   - `.env`의 `DATABASE_URL`을 이 값으로 **통째로 교체** (리전·호스트가 프로젝트와 정확히 일치해야 함)

2. **프로젝트 일시중지 여부**
   - 무료 플랜은 비활성 기간 후 일시중지됨
   - 대시보드에서 프로젝트가 "Paused"면 **Restore** 후 다시 연결 시도

3. **직접 연결(db.xxx)에서 ENOTFOUND가 나는 경우**
   - `db.프로젝트ID.supabase.co` 대신 **Connection pooling** URI 사용
   - 대시보드 Database → Connection string → **Session mode** 또는 **Transaction mode** URI 사용
   - 형식 예: `postgresql://postgres.프로젝트ID:비밀번호@aws-0-리전.pooler.supabase.com:포트/postgres`
   - 리전(예: `ap-northeast-2`, `us-east-1`)은 대시보드에 표시된 그대로 사용

4. **로컬에서 연결 테스트**
   ```bash
   cd apps/backend
   npm run test:db
   ```
   - 실패 시 터미널에 나온 에러 메시지(타임아웃, 인증 실패, ENOTFOUND 등)를 확인

## ❌ 일반적인 에러 및 해결 방법

### 에러 1: "DATABASE_URL 환경변수가 설정되지 않았습니다"

**원인**: `.env` 파일에 `DATABASE_URL`이 없음

**해결**:
1. `apps/backend/.env` 파일 생성 또는 수정
2. Supabase Dashboard에서 Connection string 복사
3. `.env` 파일에 추가:
   ```env
   DATABASE_URL=postgresql://...
   ```

### 에러 2: "connection timeout" 또는 "ECONNREFUSED"

**원인**: 
- 잘못된 호스트/포트
- 방화벽 차단
- Supabase 프로젝트가 일시 중지됨

**해결**:
1. Supabase Dashboard에서 프로젝트 상태 확인
2. Connection string이 올바른지 확인
3. 직접 연결 URL 대신 Connection Pooling URL 사용 시도

### 에러 3: "password authentication failed"

**원인**: 잘못된 비밀번호

**해결**:
1. Supabase Dashboard → Settings → Database
2. Database password 확인 또는 재설정
3. Connection string의 비밀번호 업데이트

### 에러 4: "relation 'users' does not exist"

**원인**: 테이블이 아직 생성되지 않음

**해결**:
1. Supabase Dashboard → SQL Editor
2. 다음 SQL 실행하여 테이블 생성:

```sql
-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT,
  provider VARCHAR(50) NOT NULL DEFAULT 'email',
  provider_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thumbnail_image TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Supabase Connection String 형식

### 직접 연결 (Direct Connection)
```
postgresql://postgres:[비밀번호]@db.[프로젝트ID].supabase.co:5432/postgres
```

### Connection Pooling (권장)
```
# Session mode
postgresql://postgres.[프로젝트ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# Transaction mode
postgresql://postgres.[프로젝트ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**차이점**:
- **직접 연결**: 안정적이지만 연결 수 제한
- **Connection Pooling**: 더 많은 동시 연결 지원, 프로덕션 권장

## 📝 빠른 확인 스크립트

```bash
#!/bin/bash
# quick-check.sh

cd apps/backend

echo "1. .env 파일 확인..."
if [ -f .env ]; then
  echo "✅ .env 파일 존재"
  if grep -q "DATABASE_URL" .env; then
    echo "✅ DATABASE_URL 설정됨"
  else
    echo "❌ DATABASE_URL 없음"
    exit 1
  fi
else
  echo "❌ .env 파일 없음"
  exit 1
fi

echo ""
echo "2. 데이터베이스 연결 테스트..."
npm run test:db
```

## 🎯 연결 확인 후 다음 단계

1. ✅ 연결 성공 확인
2. ✅ 테이블 생성 확인
3. ✅ API 테스트 (회원가입, 로그인 등)
4. ✅ 데이터 저장 확인

## 💡 디버깅 팁

### 상세 로그 확인
```bash
# 더 자세한 로그를 보려면
cd apps/backend
DEBUG=* npx tsx src/test-db-connection.ts
```

### 수동 연결 테스트
```bash
# psql이 설치되어 있는 경우
psql "postgresql://postgres:[비밀번호]@db.[프로젝트ID].supabase.co:5432/postgres"
```

### 네트워크 확인
```bash
# 호스트 연결 확인
ping db.[프로젝트ID].supabase.co

# 포트 확인
telnet db.[프로젝트ID].supabase.co 5432
```

## 📚 참고 자료

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-string)
- [PostgreSQL Connection Issues](https://supabase.com/docs/guides/database/troubleshooting)
