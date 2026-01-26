# Layout Components

레이아웃 컴포넌트 가이드입니다.

## 컴포넌트 목록

### 1. Header
메인 헤더 컴포넌트입니다. 로고, 네비게이션, 사용자 메뉴를 포함합니다.

**사용법:**
```tsx
import Header from '@/components/layout/Header';

<Header />
```

**기능:**
- 로고 및 사이트 이름
- 데스크톱 네비게이션 (Navigation 컴포넌트 사용)
- 모바일 메뉴 버튼 (MobileNavigation 컴포넌트 사용)
- 알림 아이콘
- 사용자 메뉴 드롭다운

### 2. Navigation
재사용 가능한 네비게이션 컴포넌트입니다.

**Props:**
- `variant`: 'horizontal' | 'vertical' (기본값: 'horizontal')
- `className`: 추가 CSS 클래스

**사용법:**
```tsx
import Navigation from '@/components/layout/Navigation';

// 수평 네비게이션 (헤더용)
<Navigation variant="horizontal" />

// 수직 네비게이션 (사이드바용)
<Navigation variant="vertical" />
```

**기능:**
- 활성 상태 표시
- 아이콘 지원
- 배지 표시 (알림 개수 등)

### 3. MobileNavigation
모바일용 네비게이션 메뉴입니다.

**사용법:**
```tsx
import MobileNavigation from '@/components/layout/MobileNavigation';

<MobileNavigation />
```

**기능:**
- 햄버거 메뉴 버튼
- 슬라이드 인 메뉴
- 오버레이
- 자동 닫기

### 4. Sidebar
사이드바 네비게이션 컴포넌트입니다.

**Props:**
- `isOpen`: 사이드바 열림 상태 (기본값: true)
- `onClose`: 사이드바 닫기 콜백

**사용법:**
```tsx
import Sidebar from '@/components/layout/Sidebar';

<Sidebar isOpen={true} onClose={() => setOpen(false)} />
```

**기능:**
- 사용자 정보 표시
- 메인 네비게이션
- 계정 메뉴
- 로그아웃 버튼
- 반응형 (모바일에서 오버레이)

### 5. LayoutWithSidebar
사이드바가 포함된 레이아웃입니다.

**사용법:**
```tsx
import LayoutWithSidebar from '@/components/layout/LayoutWithSidebar';

export default function MyPage() {
  return (
    <LayoutWithSidebar>
      <div>페이지 내용</div>
    </LayoutWithSidebar>
  );
}
```

**기능:**
- 자동 인증 확인
- 사이드바 통합
- 모바일 헤더
- 데스크톱 헤더

### 6. ProtectedLayout
인증이 필요한 페이지용 레이아웃입니다.

**사용법:**
```tsx
import ProtectedLayout from '@/components/layout/ProtectedLayout';

export default function MyPage() {
  return (
    <ProtectedLayout>
      <div>페이지 내용</div>
    </ProtectedLayout>
  );
}
```

**기능:**
- 자동 인증 확인
- 미인증 시 로그인 페이지로 리다이렉트
- Header/Footer 포함

### 7. Footer
푸터 컴포넌트입니다.

**사용법:**
```tsx
import Footer from '@/components/layout/Footer';

<Footer />
```

## 레이아웃 선택 가이드

### 사이드바가 있는 페이지
대시보드, 프로필, 설정 등 관리 페이지에 사용:
```tsx
<LayoutWithSidebar>
  {/* 페이지 내용 */}
</LayoutWithSidebar>
```

### 일반 페이지
게시글 목록, 게시글 상세 등:
```tsx
<ProtectedLayout>
  {/* 페이지 내용 */}
</ProtectedLayout>
```

### 공개 페이지
홈, 로그인, 이용약관 등:
```tsx
// 레이아웃 없이 사용 (RootLayout의 Header/Footer 사용)
<div>페이지 내용</div>
```

## 네비게이션 아이템 커스터마이징

`Navigation.tsx` 파일에서 메뉴 아이템을 수정할 수 있습니다:

```tsx
const mainNavItems: NavItem[] = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: '📊',
  },
  // 추가 메뉴 아이템
];
```

## 반응형 동작

- **데스크톱 (lg 이상)**: 사이드바 항상 표시, 헤더 네비게이션 표시
- **태블릿/모바일**: 사이드바 숨김, 모바일 메뉴 버튼 표시
- **모바일 메뉴**: 슬라이드 인 방식으로 표시
