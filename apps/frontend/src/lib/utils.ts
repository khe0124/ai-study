/**
 * 이미지 URL을 생성하는 유틸리티 함수
 * Next.js rewrites를 사용하므로 상대 경로로 반환 (같은 도메인으로 프록시됨)
 */
export function getImageUrl(path?: string): string {
  if (!path) return '';
  
  // 이미 절대 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 상대 경로인 경우 그대로 반환 (Next.js rewrites가 /uploads/*를 백엔드로 프록시)
  // 또는 프로덕션에서 직접 백엔드 URL이 필요한 경우를 위해 환경 변수 사용
  if (typeof window !== 'undefined') {
    // 클라이언트: rewrites 사용 (상대 경로)
    return path;
  } else {
    // 서버 사이드: 절대 URL 필요 (SSR 시)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}${path}`;
  }
}
