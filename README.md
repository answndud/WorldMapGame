# 지리 미니게임 (Geo Mini Games)

3D 지구본, 2D 지도, 그리고 재미있는 퀴즈로 세계 지리를 배우는 웹 게임

## 🎮 게임 모드

### Mode A: 국가 위치 찾기
- **Level 1 (A1)**: 3D 지구본을 돌려 국가를 클릭하세요
- **Level 2 (A2)**: 수도 이름을 보고 국가를 선택한 후, 2D 지도에서 정확한 위치를 클릭하세요

### Mode B: 인구수 맞추기
- **Level 1 (B1)**: 3개 국가를 인구가 많은 순서대로 정렬하세요
- **Level 2 (B2)**: 5개 국가를 인구가 많은 순서대로 정렬하세요

### Mode C: AI 국가 추천 (선택)
- 8개 질문에 답하고 당신에게 맞는 여행지를 AI가 추천해드립니다

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 15+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (UI 컴포넌트)

### 3D/2D 지도
- **react-globe.gl** (3D 지구본)
- **react-leaflet** (2D 지도)
- **@dnd-kit** (드래그 앤 드롭)

### 백엔드
- **Next.js API Routes** (서버리스 API)
- **Supabase** (데이터베이스, 인증)
- **Zod** (입력 검증)

### AI (선택)
- **OpenAI API** (gpt-4o-mini)

### 배포
- **Vercel** (호스팅)
- **Supabase** (데이터베이스 호스팅)

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd worldmap_game
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일 생성:
```bash
cp .env.local.example .env.local
```

환경 변수 입력 (Supabase URL, API 키 등)

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
worldmap_game/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── run/          # 게임 실행 API
│   │   └── ai/           # AI 추천 API
│   ├── play/             # 게임 페이지
│   │   ├── a1/           # Mode A1
│   │   ├── a2/           # Mode A2
│   │   ├── b1/           # Mode B1
│   │   └── b2/           # Mode B2
│   ├── ai/               # AI 추천 페이지
│   └── page.tsx          # 홈페이지
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── GlobeCanvas.tsx   # 3D 지구본
│   ├── CountryMap2D.tsx  # 2D 지도
│   ├── PopulationOrderBoard.tsx  # 인구수 정렬
│   └── ScoreHeader.tsx   # 점수 헤더
├── lib/                   # 유틸리티 라이브러리
│   ├── datasets/         # 데이터셋 (countries.json)
│   ├── game/             # 게임 로직
│   │   ├── generators.ts # 질문 생성
│   │   └── validators.ts # 답안 검증
│   ├── supabase/         # Supabase 클라이언트
│   └── ai/               # AI 제공자
├── data/                  # 정적 데이터
│   └── countries.json    # 국가 데이터
├── docs/                  # 프로젝트 문서
│   ├── PRD.md            # 제품 요구사항 문서
│   ├── SPEC.md           # 최종 기술 명세
│   └── ...
├── supabase/
│   └── schema.sql        # 데이터베이스 스키마
└── DEPLOYMENT.md         # 배포 가이드
```

## 🎯 주요 기능

### 서버 기반 검증
- 모든 점수 계산과 정답 체크는 서버에서 실행
- 클라이언트는 신뢰할 수 없으므로 서버가 최종 판단

### 정확한 거리 계산
- Haversine 공식으로 수도 클릭 위치의 정확도 계산
- 허용 거리: 50km (설정 가능)

### 드래그 앤 드롭
- 직관적인 카드 정렬 UI
- 키보드 접근성 지원

### 3D 인터랙션
- WebGL 기반 3D 지구본
- 부드러운 회전과 클릭 감지

### AI 기반 추천
- 사용자 선호도 분석
- 최적의 여행지 Top 3 추천
- 캐시로 비용 절감 (24시간)

## 📊 데이터

### countries.json
- 50개 주요 국가 정보
- 포함 데이터:
  - ISO 코드 (ISO2, ISO3)
  - 국가명 (영어, 한국어)
  - 수도 (이름, 위도, 경도)
  - 인구수
  - Bounding Box (지도 범위)

## 🔒 보안

- 환경 변수로 API 키 관리
- Supabase RLS (Row Level Security)로 데이터 보호
- 서버 사이드 검증으로 부정행위 방지
- HTTPS 강제 (Vercel 자동 적용)

## 📈 성능 최적화

- 동적 import로 큰 라이브러리 lazy loading
- 클라이언트 사이드 렌더링 (CSR) 활용
- 이미지 최적화 (Next.js Image)
- Vercel Edge Network로 전 세계 빠른 로딩

## 🧪 테스트

```bash
# 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# Lint
npm run lint
```

## 📝 라이선스

MIT License

## 👨‍💻 개발자

개인 프로젝트로 제작되었습니다.

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - 프레임워크
- [Supabase](https://supabase.com/) - 백엔드
- [Vercel](https://vercel.com/) - 호스팅
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [react-globe.gl](https://github.com/vasturiano/react-globe.gl) - 3D 지구본
- [react-leaflet](https://react-leaflet.js.org/) - 2D 지도
- [OpenStreetMap](https://www.openstreetmap.org/) - 지도 데이터

## 📞 문의

버그 리포트나 기능 제안은 GitHub Issues에 등록해주세요.
