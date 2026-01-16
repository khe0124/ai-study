# Backend API 서버

Express 기반 인증 API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**⚠️ 보안 주의사항:**

- `JWT_SECRET`은 반드시 강력한 랜덤 문자열로 설정하세요 (최소 32자 권장)
- 프로덕션 환경에서는 기본값을 사용하면 서버가 시작되지 않습니다
- `FRONTEND_URL`은 여러 도메인을 쉼표로 구분하여 설정할 수 있습니다

## 실행

### 개발 모드

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## API 엔드포인트

### 1. 회원가입 (이메일/비밀번호)

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1234567890_abc123",
      "email": "user@example.com",
      "provider": "email"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**비밀번호 규칙:**

- 최소 8자 이상, 최대 128자
- 대문자, 소문자, 숫자, 특수문자(@$!%\*?&) 포함

### 2. 로그인 (이메일/비밀번호)

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1234567890_abc123",
      "email": "user@example.com",
      "provider": "email"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 소셜 로그인

**POST** `/api/auth/social`

#### Google 로그인

**Request Body:**

```json
{
  "provider": "google",
  "accessToken": "ya29.a0AfH6SMC..."
}
```

#### Kakao 로그인

**Request Body:**

```json
{
  "provider": "kakao",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Apple 로그인

**Request Body:**

```json
{
  "provider": "apple",
  "idToken": "eyJraWQiOiJlWGF1bm1yb..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1234567890_abc123",
      "email": "user@example.com",
      "provider": "google"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. 프로필 조회

**GET** `/api/auth/profile`

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "provider": "email"
  }
}
```

## 에러 응답

모든 API는 에러 발생 시 다음과 같은 형식으로 응답합니다:

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

또는 유효성 검사 실패 시:

```json
{
  "success": false,
  "errors": [
    {
      "msg": "유효한 이메일 주소를 입력해주세요.",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## 인증 토큰 사용

인증이 필요한 API를 호출할 때는 `Authorization` 헤더에 Bearer 토큰을 포함해야 합니다:

```
Authorization: Bearer {your-jwt-token}
```

## 게시글 API 엔드포인트

### 1. 게시글 목록 조회

**GET** `/api/posts?page=1&limit=10`

**Query Parameters:**
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 게시글 수 (기본값: 10, 최대: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_123",
        "title": "게시글 제목",
        "content": "게시글 내용",
        "authorId": "user_123",
        "authorEmail": "author@example.com",
        "thumbnailImage": "/uploads/thumbnails/image.jpg",
        "attachments": ["/uploads/attachments/file.pdf"],
        "comments": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### 2. 게시글 상세 조회

**GET** `/api/posts/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "title": "게시글 제목",
    "content": "게시글 내용",
    "authorId": "user_123",
    "authorEmail": "author@example.com",
    "thumbnailImage": "/uploads/thumbnails/image.jpg",
    "attachments": ["/uploads/attachments/file.pdf"],
    "comments": [
      {
        "id": "comment_123",
        "postId": "post_123",
        "authorId": "user_456",
        "authorEmail": "commenter@example.com",
        "content": "댓글 내용",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 게시글 작성

**POST** `/api/posts`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (required): 게시글 제목 (1-200자)
- `content` (required): 게시글 내용 (1-10000자)
- `thumbnailImage` (optional): 썸네일 이미지 파일 (이미지 파일만)
- `attachments` (optional): 첨부파일 (최대 10개)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "title": "게시글 제목",
    "content": "게시글 내용",
    "authorId": "user_123",
    "authorEmail": "author@example.com",
    "thumbnailImage": "/uploads/thumbnails/image.jpg",
    "attachments": ["/uploads/attachments/file.pdf"],
    "comments": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 게시글 수정

**PUT** `/api/posts/:id`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (optional): 게시글 제목
- `content` (optional): 게시글 내용
- `thumbnailImage` (optional): 새 썸네일 이미지 (기존 이미지 교체)
- `attachments` (optional): 새 첨부파일 (기존 파일에 추가)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "title": "수정된 제목",
    "content": "수정된 내용",
    ...
  }
}
```

### 5. 게시글 삭제

**DELETE** `/api/posts/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "게시글이 삭제되었습니다."
}
```

### 6. 댓글 작성

**POST** `/api/posts/:postId/comments`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "댓글 내용"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comment_123",
    "postId": "post_123",
    "authorId": "user_456",
    "authorEmail": "commenter@example.com",
    "content": "댓글 내용",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. 댓글 수정

**PUT** `/api/posts/:postId/comments/:commentId`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "수정된 댓글 내용"
}
```

### 8. 댓글 삭제

**DELETE** `/api/posts/:postId/comments/:commentId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "댓글이 삭제되었습니다."
}
```

## 파일 업로드

- **썸네일 이미지**: 이미지 파일만 허용 (JPEG, PNG, GIF, WebP)
- **첨부파일**: 모든 파일 형식 허용
- **파일 크기 제한**: 파일당 최대 10MB
- **파일 개수 제한**: 첨부파일 최대 10개
- **업로드 경로**: `/uploads/thumbnails/`, `/uploads/attachments/`
- **파일 접근**: 업로드된 파일은 `/uploads/{path}` 경로로 접근 가능

## 프로젝트 구조

```
src/
├── routes/          # API 라우트 정의
├── controllers/     # 요청 처리 로직
├── services/        # 비즈니스 로직
├── middleware/      # 미들웨어 (인증, 검증 등)
├── models/          # 데이터 모델
├── utils/           # 유틸리티 함수
└── types/           # TypeScript 타입 정의
```

## 보안 기능

이 백엔드는 다음과 같은 보안 기능을 포함합니다:

1. **Rate Limiting**: 무차별 대입 공격 방지

   - 로그인: 15분당 5회
   - 회원가입: 1시간당 3회
   - 소셜 로그인: 15분당 10회

2. **보안 헤더**: Helmet을 통한 보안 헤더 자동 설정

3. **Timing Attack 방어**: 로그인 시 일관된 응답 시간 보장

4. **입력 검증**: 엄격한 입력 검증 및 길이 제한

5. **에러 메시지**: 프로덕션에서 정보 노출 최소화

자세한 내용은 [SECURITY.md](./SECURITY.md)를 참고하세요.

## 주의사항

1. **데이터베이스**: 현재는 인메모리 데이터베이스를 사용하고 있습니다. 프로덕션 환경에서는 PostgreSQL, MongoDB 등의 실제 데이터베이스를 사용하세요.

2. **JWT Secret**: 프로덕션 환경에서는 반드시 강력한 JWT_SECRET을 설정하세요 (최소 32자 권장). 기본값 사용 시 서버가 시작되지 않습니다.

3. **소셜 로그인**: 각 소셜 로그인 제공자의 OAuth 설정이 필요합니다:

   - Google: Google Cloud Console에서 OAuth 클라이언트 ID 설정
   - Kakao: Kakao Developers에서 앱 등록 및 REST API 키 발급
   - Apple: Apple Developer에서 Service ID 및 Key 설정 (프로덕션에서는 공개키 검증 필요)

4. **비밀번호 보안**: 비밀번호는 bcrypt(rounds: 12)로 해싱되어 저장됩니다.

5. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요.

## 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 테스트 실행
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### 테스트 구조

```
src/
├── __tests__/
│   ├── setup.ts                    # 테스트 환경 설정
│   ├── helpers/
│   │   └── testHelpers.ts          # 테스트 헬퍼 함수
│   ├── auth.test.ts                # 인증 API 통합 테스트
│   ├── rateLimiting.test.ts        # Rate Limiting 테스트
│   ├── services/
│   │   └── authService.test.ts     # AuthService 단위 테스트
│   └── utils/
│       └── jwt.test.ts             # JWT 유틸리티 테스트
```

### 테스트 커버리지

테스트는 다음 영역을 포함합니다:

- ✅ 회원가입 API (성공, 중복 이메일, 입력 검증)
- ✅ 로그인 API (성공, 실패, 이메일 정규화)
- ✅ 소셜 로그인 API (입력 검증)
- ✅ 프로필 조회 API (인증 필요, 토큰 검증)
- ✅ Rate Limiting (회원가입, 로그인)
- ✅ 입력 검증 (이메일, 비밀번호, 길이 제한)
- ✅ JWT 토큰 생성 및 검증
- ✅ AuthService 비즈니스 로직
