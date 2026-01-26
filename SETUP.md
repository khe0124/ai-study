# 프로젝트 설정 가이드

## ⚠️ 중요: 설치 및 실행 위치

**반드시 프로젝트 루트 디렉토리(`/Users/haeun/ai-study`)에서만 npm 명령어를 실행하세요.**

### ❌ 하지 말아야 할 것

```bash
# ❌ 이렇게 하지 마세요
cd apps/frontend
npm install  # 에러 발생!

cd apps/backend
npm install  # 에러 발생!
```

### ✅ 올바른 방법

```bash
# ✅ 프로젝트 루트에서만 실행
cd /Users/haeun/ai-study
npm install
npm run dev
```

## 초기 설정

### 1. nvm prefix 문제 해결

```bash
# nvm prefix 문제 해결
nvm use --delete-prefix v24.13.0
# 또는
npm config delete prefix
```

### 2. 의존성 설치

```bash
# 프로젝트 루트로 이동
cd /Users/haeun/ai-study

# 모든 의존성 설치 (workspaces 자동 처리)
npm install
```

### 3. 환경 변수 설정

#### Frontend
```bash
cd apps/frontend
cp .env.example .env.local
# .env.local 파일 편집
```

#### Backend
```bash
cd apps/backend
cp .env.example .env
# .env 파일 편집
```

### 4. 개발 서버 실행

```bash
# 루트 디렉토리에서
cd /Users/haeun/ai-study
npm run dev
```

## 문제 해결

### npm config prefix 에러가 발생하는 경우

```bash
# 1. 루트 디렉토리로 이동
cd /Users/haeun/ai-study

# 2. prefix 설정 삭제
npm config delete prefix

# 3. nvm 재설정
nvm use --delete-prefix v24.13.0

# 4. 설치 재시도
npm install
```

### 특정 앱만 실행하고 싶은 경우

```bash
# 루트에서 Turbo 필터 사용
npm run dev --filter=frontend
npm run dev --filter=backend
```

### 개별 앱 디렉토리에서 실행하고 싶은 경우

```bash
# 개발 서버만 실행하는 것은 가능 (npm install은 루트에서만)
cd apps/frontend
npm run dev  # 이것은 가능

# 하지만 npm install은 불가능
npm install  # ❌ 에러 발생
```

## Turbo Monorepo 사용법

### 모든 앱 실행
```bash
npm run dev
```

### 특정 앱만 실행
```bash
npm run dev --filter=frontend
npm run dev --filter=backend
```

### 빌드
```bash
npm run build
npm run build --filter=frontend
```

### 테스트
```bash
npm run test
npm run test --filter=backend
```

## 자주 묻는 질문

### Q: 왜 frontend 디렉토리에서 npm install을 실행하면 안 되나요?
A: 이 프로젝트는 npm workspaces를 사용하는 monorepo입니다. workspaces 환경에서는 루트 디렉토리에서만 `npm install`을 실행해야 합니다. 하위 디렉토리에서 실행하면 npm config 관련 에러가 발생합니다.

### Q: 그럼 어떻게 개별 앱의 의존성을 추가하나요?
A: 루트 디렉토리에서 `npm install <package> --workspace=apps/frontend` 형식으로 추가하세요.

```bash
# 예시
npm install axios --workspace=apps/frontend
npm install express --workspace=apps/backend
```

### Q: 개발 서버는 개별 디렉토리에서 실행할 수 있나요?
A: 네, 가능합니다. 하지만 Turbo를 사용하면 루트에서 실행하는 것이 더 효율적입니다.

```bash
# 방법 1: Turbo 사용 (권장)
npm run dev --filter=frontend

# 방법 2: 직접 실행
cd apps/frontend
npm run dev
```
