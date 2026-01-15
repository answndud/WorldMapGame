# 배포 가이드

## 1. Supabase 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전 선택
4. 프로젝트 생성 완료 대기 (약 2분)

### 1.2 데이터베이스 스키마 적용
1. Supabase 대시보드 → SQL Editor
2. `supabase/schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행 (Run)

### 1.3 API 키 확인
- Supabase 대시보드 → Settings → API
- `Project URL`: `NEXT_PUBLIC_SUPABASE_URL`에 사용
- `anon public` 키: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
- `service_role` 키: `SUPABASE_SERVICE_ROLE_KEY`에 사용 (비공개)

## 2. Vercel 배포

### 2.1 GitHub 연동
```bash
# Git 저장소 생성 (아직 안했다면)
git init
git add .
git commit -m "Initial commit"

# GitHub에 push
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 2.2 Vercel 프로젝트 생성
1. [Vercel](https://vercel.com)에 로그인
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

### 2.3 환경 변수 설정
Vercel 프로젝트 → Settings → Environment Variables에 추가:

**필수 환경 변수:**
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

**선택 환경 변수 (AI 추천 기능):**
```
LLM_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>
```

### 2.4 배포
1. "Deploy" 버튼 클릭
2. 빌드 완료 대기 (약 2-3분)
3. 배포 완료 후 도메인 확인

## 3. 로컬 개발 환경 설정

### 3.1 환경 변수 설정
`.env.local` 파일 생성:
```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 실제 값 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# 선택사항
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### 3.2 개발 서버 실행
```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 4. 운영 체크리스트

### 4.1 배포 전 확인사항
- [ ] 모든 환경 변수 설정 완료
- [ ] Supabase 스키마 적용 완료
- [ ] `.env.local`이 `.gitignore`에 포함됨
- [ ] API 키가 코드에 하드코딩되지 않음
- [ ] 빌드 에러 없음 (`npm run build` 성공)

### 4.2 배포 후 확인사항
- [ ] 홈페이지 정상 작동
- [ ] Mode B (인구수 정렬) 게임 정상 작동
- [ ] Mode A2 (수도 찾기) 게임 정상 작동
- [ ] Mode A1 (3D 지구본) 게임 정상 작동
- [ ] AI 추천 기능 작동 (API 키 설정 시)
- [ ] 모바일 반응형 확인

## 5. 선택 기능 활성화

### 5.1 인증 활성화 (Supabase Auth)
Supabase 대시보드 → Authentication → Providers에서 원하는 로그인 방식 활성화:
- Email/Password
- Google
- GitHub
- 기타

### 5.2 AI 추천 기능 활성화
OpenAI API 키 발급:
1. [OpenAI Platform](https://platform.openai.com)에 로그인
2. API Keys → Create new secret key
3. 생성된 키를 `OPENAI_API_KEY` 환경 변수에 설정

## 6. 모니터링 및 유지보수

### 6.1 Vercel Analytics
- Vercel 대시보드에서 자동으로 트래픽 및 성능 모니터링 제공

### 6.2 Supabase 모니터링
- Supabase 대시보드 → Database → Usage에서 DB 사용량 확인

### 6.3 에러 로깅
- Vercel → 프로젝트 → Runtime Logs에서 서버 에러 확인
- 브라우저 개발자 도구에서 클라이언트 에러 확인

## 7. 비용 예상

### 무료 티어 (개인 프로젝트/MVP)
- **Vercel**: Hobby 플랜 무료 (월 100GB 대역폭)
- **Supabase**: Free 플랜 (월 500MB DB, 2GB 전송)
- **OpenAI**: 사용량 기준 (gpt-4o-mini는 매우 저렴)

### 예상 비용 (월 1,000명 사용자 기준)
- Vercel: $0 (무료 범위 내)
- Supabase: $0 - $25 (사용량에 따라)
- OpenAI: $1 - $5 (AI 추천 사용 시)

## 8. 문제 해결

### 빌드 오류 발생 시
```bash
# 로컬에서 빌드 테스트
npm run build

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### Supabase 연결 오류 시
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- RLS 정책이 올바르게 설정되었는지 확인

### 3D 지구본이 표시되지 않을 때
- 브라우저가 WebGL을 지원하는지 확인
- 클라이언트 사이드 렌더링이 활성화되었는지 확인 (dynamic import 사용)

## 9. 추가 개선 사항

### 9.1 성능 최적화
- GeoJSON 파일 압축 및 CDN 배포
- 이미지 최적화 (Next.js Image 컴포넌트 활용)
- 코드 스플리팅 및 lazy loading

### 9.2 기능 추가
- 사용자 프로필 및 랭킹 시스템
- 소셜 공유 기능
- 멀티플레이어 모드
- 모바일 앱 (React Native로 포팅)

### 9.3 SEO 최적화
- `metadata` 설정 강화
- Open Graph 태그 추가
- 사이트맵 생성

---

문의사항이나 버그 발견 시 GitHub Issues에 등록해주세요.
