# 빠른 시작 가이드 (5분 완성)

## ✅ 개발 완료 현황

프로젝트의 모든 핵심 기능이 구현되었습니다:

- ✅ **Mode B (인구수 정렬)**: Level 1 (3개 국가), Level 2 (5개 국가)
- ✅ **Mode A2 (수도 찾기)**: 국가 선택 + 2D 지도 클릭
- ✅ **Mode A1 (3D 지구본)**: 3D 지구본에서 국가 클릭
- ✅ **Mode C (AI 추천)**: 8개 질문 설문 + AI 국가 추천
- ✅ **서버 검증**: 모든 답안은 서버에서 검증
- ✅ **반응형 UI**: 모바일/태블릿/데스크톱 지원
- ✅ **Toast 알림**: 정답/오답 실시간 피드백

## 🚀 로컬에서 실행하기 (2분)

### 1. 의존성 설치 완료
```bash
# 이미 설치되어 있습니다
npm install  # 필요시에만
```

### 2. 환경 변수 설정
`.env.local` 파일이 이미 생성되어 있습니다. 필요하다면 수정하세요:

```bash
# Supabase (선택사항 - 없어도 게임 동작)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# AI 추천 (선택사항 - 없으면 기본 추천 제공)
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속!

## 🌐 Vercel에 배포하기 (5분)

### 방법 1: GitHub 연동 (추천)

1. **GitHub에 푸시**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. **Vercel에서 Import**
- https://vercel.com 접속
- "Add New..." → "Project"
- GitHub 저장소 선택
- "Deploy" 클릭

3. **환경 변수 설정** (선택사항)
- Vercel 프로젝트 → Settings → Environment Variables
- Supabase URL, API 키 추가
- OpenAI API 키 추가 (AI 기능 사용 시)

### 방법 2: Vercel CLI (빠름)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 🎮 게임 테스트 체크리스트

빌드 성공 후 각 모드를 테스트해보세요:

### Mode B (인구수 정렬)
- [ ] `/play/b1` 접속
- [ ] 3개 국가 카드 드래그 정렬
- [ ] 정답 제출 및 점수 확인
- [ ] 3번 틀리면 게임 종료 확인

### Mode A2 (수도 찾기)
- [ ] `/play/a2` 접속
- [ ] 수도 이름 확인
- [ ] Step 1: 국가 선택 (+5점)
- [ ] Step 2: 2D 지도에서 수도 클릭 (+10점)
- [ ] 거리 계산 확인

### Mode A1 (3D 지구본)
- [ ] `/play/a1` 접속
- [ ] 3D 지구본 로드 확인
- [ ] 지구본 회전 및 국가 클릭
- [ ] 정답 시 다음 질문 생성

### Mode C (AI 추천)
- [ ] `/ai` 접속
- [ ] 8개 질문 답변
- [ ] 추천 결과 표시
- [ ] Top 3 국가 확인

## 📊 빌드 결과 확인

```bash
npm run build
```

성공 시 다음과 같은 출력:

```
✓ Compiled successfully
✓ Generating static pages (15/15)
Route (app)
├ ○ /                   (홈페이지)
├ ○ /ai                 (AI 추천)
├ ƒ /api/run/start     (게임 시작 API)
├ ƒ /api/run/b/order   (인구수 정렬 API)
├ ƒ /api/run/a2/*      (수도 찾기 API)
├ ƒ /api/run/a1/answer (3D 지구본 API)
├ ○ /play/b1           (인구수 Level 1)
├ ○ /play/b2           (인구수 Level 2)
├ ○ /play/a1           (3D 지구본)
└ ○ /play/a2           (수도 찾기)
```

## 🔧 주요 파일 위치

### 게임 로직
- `lib/game/generators.ts` - 질문 생성
- `lib/game/validators.ts` - 답안 검증
- `lib/datasets/countries.ts` - 국가 데이터 관리

### API
- `app/api/run/start/route.ts` - 게임 시작
- `app/api/run/b/order/route.ts` - 인구수 정렬
- `app/api/run/a1/answer/route.ts` - 3D 지구본
- `app/api/run/a2/country/route.ts` - 수도 찾기 (국가 선택)
- `app/api/run/a2/click/route.ts` - 수도 찾기 (위치 클릭)
- `app/api/ai/recommend/route.ts` - AI 추천

### UI 컴포넌트
- `components/GlobeCanvas.tsx` - 3D 지구본
- `components/CountryMap2D.tsx` - 2D 지도
- `components/PopulationOrderBoard.tsx` - 드래그 정렬
- `components/ScoreHeader.tsx` - 점수 헤더

### 페이지
- `app/page.tsx` - 홈페이지
- `app/play/b1/page.tsx` - 인구수 Level 1
- `app/play/b2/page.tsx` - 인구수 Level 2
- `app/play/a1/page.tsx` - 3D 지구본
- `app/play/a2/page.tsx` - 수도 찾기
- `app/ai/page.tsx` - AI 추천

## 🎨 커스터마이징

### 게임 난이도 조정
`lib/game/validators.ts`에서 설정 변경:
```typescript
// 수도 클릭 허용 거리 (기본 50km)
export function validateCapitalClick(
  clickLat: number,
  clickLng: number,
  capitalLat: number,
  capitalLng: number,
  thresholdKm: number = 50  // 이 값을 변경
)
```

### 점수 시스템 변경
각 API route 파일에서 점수 변경:
```typescript
// Mode B1: 10점 → 원하는 점수
run.score += 10;

// Mode A1: 10점
run.score += 10;

// Mode A2 Step1: 5점, Step2: 10점
run.score += 5;
run.score += 10;
```

### 시도 횟수 변경
`app/api/run/start/route.ts`에서:
```typescript
attemptsLeft: 3,  // 원하는 횟수로 변경
```

## 📱 모바일 최적화

현재 구현된 반응형 기능:
- ✅ Tailwind breakpoints (sm, md, lg)
- ✅ 터치 이벤트 지원 (드래그 앤 드롭)
- ✅ 모바일 친화적 폰트 크기
- ✅ 반응형 레이아웃

## 🐛 트러블슈팅

### 개발 서버가 시작되지 않을 때
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 빌드 에러 발생 시
```bash
# TypeScript 타입 체크
npx tsc --noEmit

# Lint 체크
npm run lint
```

### 3D 지구본이 보이지 않을 때
- WebGL 지원 브라우저인지 확인
- 하드웨어 가속 활성화 확인
- 개발자 도구 콘솔에서 에러 확인

### Leaflet 지도가 안 보일 때
- CSS가 올바르게 로드되었는지 확인
- `leaflet/dist/leaflet.css` import 확인
- 브라우저 콘솔에서 네트워크 에러 확인

## 🎉 완료!

프로젝트가 완전히 구현되었습니다. 이제:

1. ✅ **로컬 테스트**: `npm run dev`
2. ✅ **빌드 확인**: `npm run build`
3. ✅ **배포**: Vercel에 푸시
4. ✅ **공유**: 친구들과 함께 플레이!

궁금한 점이 있으면 `DEPLOYMENT.md`를 참고하세요.
