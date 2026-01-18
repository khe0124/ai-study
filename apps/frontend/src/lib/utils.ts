/**
 * 이미지 URL을 생성하는 유틸리티 함수
 * 클라이언트 사이드에서 사용 가능
 */
export function getImageUrl(path?: string): string {
  if (!path) return '';
  
  // 이미 절대 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 상대 경로인 경우 백엔드 URL과 결합
  const apiUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  
  return `${apiUrl}${path}`;
}
