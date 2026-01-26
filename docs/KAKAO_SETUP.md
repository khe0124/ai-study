# Kakao 로그인 설정 가이드

Kakao 로그인을 연동하기 위한 상세 가이드입니다.

## 📋 사전 준비

1. [Kakao Developers](https://developers.kakao.com/) 계정 생성
2. 카카오 계정으로 로그인

## 🔧 단계별 설정

### 1단계: 애플리케이션 등록

1. **Kakao Developers 접속**
   - https://developers.kakao.com/ 접속
   - 카카오 계정으로 로그인

2. **내 애플리케이션 추가**
   - 우측 상단 "내 애플리케이션" 클릭
   - "애플리케이션 추가하기" 버튼 클릭

3. **애플리케이션 정보 입력**
   ```
   앱 이름: Web Service (또는 원하는 이름)
   사업자명: 개인 또는 회사명
   ```

4. **애플리케이션 생성 완료**
   - 생성된 앱을 선택하여 대시보드로 이동

### 2단계: 플랫폼 설정

**⚠️ 중요**: Kakao Developers 콘솔에서 좌측 메뉴를 확인하세요. "플랫폼"은 최상위 메뉴입니다.

1. **플랫폼 메뉴 찾기**
   - 좌측 메뉴에서 **"플랫폼"** 메뉴를 찾아 클릭
   - (참고: "앱 설정" 하위 메뉴가 아닙니다. 최상위 메뉴에 있습니다)
   - 만약 보이지 않는다면, 앱 대시보드에서 좌측 사이드바를 확인하세요

2. **Web 플랫폼 추가**
   - "웹 플랫폼" 또는 "Web" 섹션을 찾습니다
   - **"[Web 플랫폼 등록]"** 또는 **"웹 등록"** 버튼 클릭
   - 사이트 도메인 입력:
     ```
     개발 환경: http://localhost:3000
     프로덕션: https://your-domain.com
     ```
   - "저장" 또는 "등록" 버튼 클릭

**💡 팁**: 
- 플랫폼 메뉴가 보이지 않는다면, 앱을 선택한 후 대시보드에서 좌측 메뉴를 다시 확인하세요
- 일부 UI에서는 "앱 설정" 탭 내에 "플랫폼" 섹션이 있을 수도 있습니다

### 3단계: 카카오 로그인 활성화

1. **제품 설정 → 카카오 로그인**
   - 좌측 메뉴에서 "제품 설정" → "카카오 로그인" 선택
   - "활성화 설정"을 **ON**으로 변경

2. **Redirect URI 설정**
   - "Redirect URI" 섹션에서 "URI 추가" 클릭
   - 다음 URI 추가:
     ```
     개발 환경: http://localhost:3000
     프로덕션: https://your-domain.com
     ```
   - "저장" 클릭

3. **동의항목 설정**
   - "동의항목" 탭 선택
   - 필수 동의 항목:
     - ✅ **이메일** (필수) - 체크
   - 선택 동의 항목:
     - ✅ **닉네임** (선택) - 필요시 체크
     - ✅ **프로필 사진** (선택) - 필요시 체크
   - "저장" 클릭

### 4단계: 앱 키 확인

1. **앱 키 메뉴 선택**
   - 좌측 메뉴에서 **"앱 키"** 클릭
   - (참고: "앱 설정" 하위가 아닌 최상위 메뉴일 수 있습니다)

2. **JavaScript 키 복사**
   - **REST API 키** 또는 **JavaScript 키** 확인
   - JavaScript 키를 복사 (예: `abc123def456...`)
   - (참고: JavaScript 키가 없다면 REST API 키를 사용할 수도 있습니다)

### 5단계: 환경 변수 설정

1. **Frontend `.env.local` 파일 수정**
   ```bash
   cd apps/frontend
   nano .env.local
   ```

2. **Kakao JavaScript 키 추가**
   ```env
   NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-javascript-key-here
   ```

3. **환경 변수 적용**
   ```bash
   # 개발 서버 재시작
   npm run dev
   ```

## ✅ 설정 확인

### 1. 환경 변수 확인
```bash
# Frontend 디렉토리에서
cat .env.local | grep KAKAO
```

### 2. 로그인 페이지 테스트
1. 브라우저에서 `http://localhost:3000/login` 접속
2. "카카오" 버튼 클릭
3. Kakao 로그인 팝업이 표시되는지 확인
4. 로그인 성공 후 토큰이 발급되는지 확인

## 🔍 문제 해결

### 문제 1: "Kakao SDK가 로드되지 않았습니다" 에러

**원인**: JavaScript 키가 설정되지 않았거나 잘못됨

**해결**:
1. `.env.local` 파일에 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`가 올바르게 설정되었는지 확인
2. 개발 서버 재시작
3. 브라우저 콘솔에서 에러 확인

### 문제 2: "이메일 정보가 제공되지 않았습니다" 에러

**원인**: 동의항목에서 이메일을 필수로 설정하지 않음

**해결**:
1. Kakao Developers → 제품 설정 → 카카오 로그인 → 동의항목
2. 이메일을 **필수**로 설정
3. 저장 후 다시 시도

### 문제 3: Redirect URI 불일치 에러

**원인**: 설정한 Redirect URI와 실제 도메인이 다름

**해결**:
1. Kakao Developers → 제품 설정 → 카카오 로그인 → Redirect URI
2. 현재 사용 중인 도메인과 정확히 일치하는지 확인
3. `http://localhost:3000` (개발) 또는 `https://your-domain.com` (프로덕션)

### 문제 4: "유효하지 않은 Kakao 토큰입니다" 에러

**원인**: 
- 앱 키가 잘못됨
- 토큰이 만료됨
- 다른 앱의 토큰을 사용

**해결**:
1. JavaScript 키가 올바른지 확인
2. 새로 로그인 시도
3. 브라우저 캐시 및 쿠키 삭제 후 재시도

## 📝 프로덕션 배포 시 주의사항

### 1. Redirect URI 업데이트
프로덕션 도메인으로 배포 시:
1. Kakao Developers → 제품 설정 → 카카오 로그인
2. Redirect URI에 프로덕션 URL 추가:
   ```
   https://your-domain.com
   ```

### 2. 환경 변수 업데이트
프로덕션 서버의 `.env.local` 파일:
```env
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-production-key
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### 3. 보안 확인
- JavaScript 키는 프론트엔드에 노출되므로 공개되어도 안전합니다
- 하지만 REST API 키는 절대 노출하면 안 됩니다

## 🎯 빠른 설정 체크리스트

- [ ] Kakao Developers 계정 생성
- [ ] 애플리케이션 등록
- [ ] 좌측 메뉴 "플랫폼" → Web 플랫폼 추가 (localhost:3000)
- [ ] 좌측 메뉴 "제품 설정" → "카카오 로그인" → 활성화 설정 ON
- [ ] Redirect URI 설정 (localhost:3000)
- [ ] 동의항목 설정 (이메일 필수)
- [ ] 좌측 메뉴 "앱 키" → JavaScript 키 복사
- [ ] `.env.local`에 키 추가
- [ ] 개발 서버 재시작
- [ ] 로그인 테스트

## 📚 참고 자료

- [Kakao Developers 공식 문서](https://developers.kakao.com/docs)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [JavaScript SDK 가이드](https://developers.kakao.com/docs/latest/ko/getting-started/sdk-js)

## 💡 추가 팁

### 개발 환경에서 테스트
```bash
# Frontend 개발 서버 실행
cd apps/frontend
npm run dev

# 브라우저에서 http://localhost:3000/login 접속
# 카카오 로그인 버튼 클릭하여 테스트
```

### 로그 확인
브라우저 개발자 도구(F12) → Console 탭에서:
- Kakao SDK 로드 확인
- 에러 메시지 확인
- 네트워크 탭에서 API 호출 확인

### 디버깅
```javascript
// 브라우저 콘솔에서 실행
console.log('Kakao SDK:', window.Kakao);
console.log('Initialized:', window.Kakao?.isInitialized());
```
