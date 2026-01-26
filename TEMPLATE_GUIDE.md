# 웹 서비스 템플릿 가이드

이 프로젝트는 재사용 가능한 웹 서비스 템플릿입니다. 다양한 웹 서비스 개발을 위한 기본 구조와 기능을 제공합니다.

## 📋 포함된 기능

### 인증 시스템
- ✅ 이메일/비밀번호 회원가입 및 로그인
- ✅ 소셜 로그인 (Google, Kakao, Apple)
- ✅ JWT 토큰 기반 인증
- ✅ 보호된 라우트

### 게시글 시스템
- ✅ 게시글 CRUD (생성, 조회, 수정, 삭제)
- ✅ 댓글 기능
- ✅ 파일 업로드 (썸네일, 첨부파일)
- ✅ 페이지네이션 및 인피니트 스크롤

### 사용자 인터페이스
- ✅ 대시보드
- ✅ 사용자 프로필
- ✅ 설정 페이지
- ✅ 알림 페이지
- ✅ 검색 기능
- ✅ 도움말 페이지

### 공통 컴포넌트
- ✅ Header (네비게이션 바)
- ✅ Footer
- ✅ ProtectedLayout (인증 필요 페이지)

## 🗂️ 페이지 구조

```
/app
├── /                    # 홈 (랜딩 페이지)
├── /login               # 로그인/회원가입
├── /dashboard           # 대시보드 (인증 필요)
├── /posts               # 게시글 목록
│   ├── /new            # 게시글 작성 (인증 필요)
│   └── /[id]           # 게시글 상세
├── /profile             # 프로필 (인증 필요)
├── /settings            # 설정 (인증 필요)
├── /notifications       # 알림 (인증 필요)
├── /search              # 검색 (인증 필요)
├── /help                # 도움말 (인증 필요)
├── /terms               # 이용약관
└── /privacy             # 개인정보처리방침
```

## 🎨 커스터마이징 가이드

### 1. 브랜딩 변경

#### 로고 및 사이트 이름
- `src/components/layout/Header.tsx` - 로고 및 사이트 이름 수정
- `src/app/layout.tsx` - 메타데이터 수정

#### 색상 테마
- `tailwind.config.js` - 색상 팔레트 수정
- `src/app/globals.css` - 커스텀 CSS 변수 추가

### 2. 메뉴 구조 변경

`src/components/layout/Header.tsx`에서 네비게이션 메뉴를 수정하세요:

```tsx
<nav className="hidden md:flex items-center space-x-1">
  <Link href="/your-page">메뉴 이름</Link>
  {/* 추가 메뉴 */}
</nav>
```

### 3. 새로운 페이지 추가

1. `src/app/your-page/page.tsx` 생성
2. 필요시 `ProtectedLayout`으로 감싸기
3. `Header.tsx`에 메뉴 추가

### 4. 기능 확장

#### API 엔드포인트 추가
- `apps/backend/src/routes/` - 새 라우트 추가
- `apps/backend/src/controllers/` - 컨트롤러 추가
- `apps/backend/src/services/` - 비즈니스 로직 추가

#### 프론트엔드 API 클라이언트 추가
- `apps/frontend/src/lib/api.ts` - API 함수 추가

## 🔧 환경 변수 설정

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=...
NEXT_PUBLIC_APPLE_CLIENT_ID=...
```

### Backend
```env
PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
DATABASE_URL=...
SUPABASE_URL=...
```

## 📦 의존성 추가

### Frontend에 패키지 추가
```bash
cd /Users/haeun/ai-study
npm install <package> --workspace=apps/frontend
```

### Backend에 패키지 추가
```bash
cd /Users/haeun/ai-study
npm install <package> --workspace=apps/backend
```

## 🚀 배포

### Docker로 배포
```bash
cd infrastructure
docker-compose up -d
```

### 수동 배포
```bash
# 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 📝 커스터마이징 체크리스트

새 프로젝트를 시작할 때:

- [ ] 사이트 이름 및 로고 변경
- [ ] 색상 테마 커스터마이징
- [ ] 메뉴 구조 조정
- [ ] 불필요한 페이지 제거 또는 숨김
- [ ] 환경 변수 설정
- [ ] 데이터베이스 스키마 커스터마이징
- [ ] API 엔드포인트 추가/수정
- [ ] 메타데이터 및 SEO 설정
- [ ] 에러 페이지 커스터마이징
- [ ] 로딩 상태 UI 커스터마이징

## 🎯 다음 단계

1. **데이터베이스 연결**: Supabase 또는 다른 DB 연결
2. **추가 기능 구현**: 
   - 실시간 알림
   - 파일 관리 개선
   - 검색 기능 구현
3. **성능 최적화**:
   - 이미지 최적화
   - 코드 스플리팅
   - 캐싱 전략
4. **테스트 추가**:
   - E2E 테스트
   - 컴포넌트 테스트

## 📚 참고 문서

- [아키텍처 설계](./docs/ARCHITECTURE.md)
- [배포 가이드](./docs/DEPLOYMENT_AWS.md)
- [보안 가이드](./apps/backend/SECURITY.md)
- [테스트 가이드](./apps/backend/TESTING.md)
