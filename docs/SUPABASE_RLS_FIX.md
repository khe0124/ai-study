# Supabase "Tenant or user not found" 에러 해결 가이드

카카오 로그인 시 "Tenant or user not found" 에러가 발생하는 경우의 해결 방법입니다.

---

## 🔴 에러 원인

이 에러는 보통 다음 중 하나 때문입니다:

1. **테이블이 생성되지 않음** - 마이그레이션이 실행되지 않았습니다
2. **RLS (Row Level Security) 정책** - Supabase의 보안 정책이 쿼리를 차단합니다
3. **잘못된 연결** - 다른 데이터베이스/스키마에 연결되었습니다

---

## ✅ 해결 방법

### 1단계: 마이그레이션 실행 (가장 중요)

```bash
cd apps/backend
npm run migrate
```

**성공 시 출력:**
```
Batch 1 run: 3 migrations
```

**확인:**
```bash
npm run migrate:status
```

모든 마이그레이션이 "completed"로 표시되어야 합니다.

---

### 2단계: Supabase에서 테이블 확인

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Table Editor** 메뉴 클릭
4. `users`, `posts`, `comments` 테이블이 보이는지 확인

**테이블이 없다면:**
- 마이그레이션이 실행되지 않았거나 실패한 것입니다
- `npm run migrate` 다시 실행
- 에러 메시지 확인

---

### 3단계: RLS (Row Level Security) 정책 확인 및 수정

Supabase는 기본적으로 RLS가 활성화되어 있어, 서비스 역할 키 없이는 접근이 막힐 수 있습니다.

#### 방법 A: RLS 비활성화 (개발 환경, 빠른 해결)

1. Supabase Dashboard → **Authentication** → **Policies**
2. `users` 테이블 선택
3. **RLS 활성화** 토글을 **OFF**로 변경

또는 SQL Editor에서:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
```

#### 방법 B: RLS 정책 추가 (프로덕션 권장)

SQL Editor에서 다음 정책 추가:

```sql
-- users 테이블: 모든 작업 허용 (서비스 역할 키 사용 시)
CREATE POLICY "Enable all operations for service role"
ON users
FOR ALL
USING (true)
WITH CHECK (true);

-- posts 테이블
CREATE POLICY "Enable all operations for service role"
ON posts
FOR ALL
USING (true)
WITH CHECK (true);

-- comments 테이블
CREATE POLICY "Enable all operations for service role"
ON comments
FOR ALL
USING (true)
WITH CHECK (true);
```

#### 방법 C: 서비스 역할 키 사용 (권장)

`.env` 파일에 `SUPABASE_SERVICE_ROLE_KEY` 추가:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**서비스 역할 키 확인:**
1. Supabase Dashboard → **Project Settings** → **API**
2. **service_role** 키 복사 (⚠️ 절대 노출 금지)

**주의:** 서비스 역할 키는 RLS를 우회하므로, 백엔드에서만 사용하고 프론트엔드에 노출하면 안 됩니다.

---

### 4단계: 연결 테스트

```bash
cd apps/backend
npm run test:db
```

성공하면:
```
✅ 데이터베이스 연결 성공!
📊 존재하는 테이블:
  - users
  - posts
  - comments
```

---

## 🔍 문제 진단

### 테이블이 없는 경우

```bash
# 마이그레이션 상태 확인
npm run migrate:status

# 마이그레이션 실행
npm run migrate

# Supabase Table Editor에서 확인
```

### RLS 정책 문제인 경우

```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM users LIMIT 1;
```

**에러가 나면:** RLS 정책 문제입니다. 위의 "3단계" 참고.

**성공하면:** RLS는 괜찮고, 다른 문제일 수 있습니다.

---

## 📝 빠른 체크리스트

- [ ] `npm run migrate` 실행 완료
- [ ] Supabase Table Editor에서 `users` 테이블 확인
- [ ] RLS 비활성화 또는 정책 추가
- [ ] `npm run test:db` 성공
- [ ] 카카오 로그인 다시 시도

---

## 💡 추가 팁

### 개발 환경에서는 RLS 비활성화 권장

개발 중에는 RLS를 끄고, 프로덕션 배포 전에 적절한 정책을 설정하는 것이 편합니다.

### 서비스 역할 키 사용 시

서비스 역할 키를 사용하면 RLS를 우회하므로, 개발 환경에서도 편리합니다. 다만 보안에 주의하세요.

---

## 🆘 여전히 안 되면

1. **에러 메시지 전체 확인** - 터미널/로그에서 정확한 에러 확인
2. **Supabase Dashboard → Logs** - 데이터베이스 로그 확인
3. **연결 문자열 재확인** - `.env`의 `DATABASE_URL`이 올바른지 확인
4. **프로젝트 일시중지 여부** - Supabase 프로젝트가 활성 상태인지 확인
