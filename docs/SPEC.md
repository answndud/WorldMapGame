# SPEC — Geo Mini Games (Final)

## 1. 개요
- 3가지 코어 모드가 있는 웹 미니게임:
  - A1: 국가를 3D 지구본에서 클릭해 찾기
  - A2: 수도 이름을 보고 국가 선택 → 해당 국가 2D 지도에서 수도 위치 클릭
  - B1/B2: 국가 인구수를 순서대로 나열(3개/5개)
  - 선택: 설문 기반 AI 국가 추천
- 목표: 가벼운 웹 서비스로 빠르게 배포(Vercel)하고, Supabase로 최소한의 백엔드/저장소 확보.

## 2. 목표 / 비목표
- 목표: MVP로 모든 모드가 플레이 가능, 점수/시도수 서버 검증, 최소 배포/운영 흐름 확보.
- 비목표: 멀티플레이/실시간, 고도 치트 방지, 복잡한 분석 파이프라인.

## 3. 최종 기술 스택
- 프론트엔드: Next.js 15(App Router) + TypeScript, Tailwind CSS, shadcn/ui
- 3D 지구본: `react-globe.gl` 권장(준비된 폴리곤 클릭 지원)  
  - 대안: `react-three-fiber` + `@react-three/drei`(최대 제어), 필요 시 선택.
- 2D 지도: `react-simple-maps` + `d3-geo`(가벼움), per-country GeoJSON 로드.
- DnD: `@dnd-kit/core`
- 폼/검증: `zod`
- 상태/서버 로직: Next.js Server Actions & Route Handlers
- 데이터베이스: Supabase(Postgres, Auth, Storage, RLS)
- ORM(선택): Drizzle 또는 Prisma (SQL 직작성도 OK)
- 배포: Vercel(프론트+API), Supabase(호스팅 DB/Auth/스토리지)
- 모니터링: Vercel Analytics/Speed Insights, Sentry(선택)
- 테스트: Vitest/Playwright(주요 흐름), ESLint/Prettier

## 4. 데이터 자원 (필수)
- `data/countries.json`: iso2, iso3, name_en, name_ko, capital_name, capital_lat, capital_lng, population, bbox(optional), geometries key.
- `data/world_countries.geojson`: 3D 폴리곤용.
- `data/countries/{iso3}.geojson`: 2D 국가별 지도(축소 해상도).
- 빌드 스크립트(`scripts/build-geo.ts`):
  - 원본 GeoJSON 정규화(ISO3 ID), per-country 파일 생성.
  - capital/인구 누락 검증.

## 5. 기능 명세 (게임 규칙)
- 공통: 모든 정답/점수/시도수 계산은 서버에서 수행.
- A1(국가 찾기): 국가 이름 제시 → 지구본 클릭 → ISO3 일치 시 정답.  
  - 점수 +10, 오답 누적 3회 시 런 종료, 정답 시 시도수 리셋.
- A2(수도 찾기):  
  - 단계1: 수도 이름 보고 국가 선택(검색 가능). 오답은 시도수 소모. 정답 시 단계2.  
  - 단계2: 해당 국가 2D 지도에서 수도 위치 클릭. 허용 반경 X km(기본 50km, 서버 설정).  
  - 점수: 단계1 +5, 단계2 +10. 총 3회 오답 시 런 종료(단계1/2 합산).
- B1/B2(인구 순서): 3개(B1) / 5개(B2) 국가 카드 제공, 인구 많은 순→적은 순으로 정렬 후 제출.  
  - 정답 시 +10(B1)/+20(B2) 기본. 오답 시 0(또는 -2 옵션). 이어서 새 세트.
- 선택: AI 국가 추천(설문 8~12문항, 객관식) → LLM 호출로 Top3+이유(+선택적 점수).

## 6. UX / 라우트
- `/`: 모드 선택, 시작 버튼.
- `/play/a1`: 3D 지구본(검은 배경), 대상 국가명 크게 표시, 클릭 후 토스트/하이라이트.
- `/play/a2`: 수도명 표시 → 국가 검색 선택 → 정답 시 2D 지도 등장, 클릭 마커 표시.
- `/play/b1`, `/play/b2`: 카드 드래그 정렬, 제출 버튼, 결과 토스트.
- `/ai`(선택): 설문, 결과 카드(Top3).
- 공통 UI: 헤더(점수, 시도수, 런 종료), 결과 모달, 토스트 피드백, 접근성 고려(키보드 reorder 대안).

## 7. 시스템 설계
- 서버 우선 검증: 클라이언트는 입력만 전송(ISO3, 클릭 좌표, 정렬 결과 등). 서버가 점수/시도/다음 문제 생성.
- 세션/런:
  - 익명 기본. `run_id`는 httpOnly 쿠키 권장(없으면 server memory/DB 임시 저장).  
  - 로그인(선택): Supabase Auth, RLS로 사용자 소유 데이터만 접근.
- API/Route Handlers (zod 검증):
  - `POST /api/run/start` {mode} → {runId, score, attemptsLeft, question}
  - `POST /api/run/a1/answer` {runId, targetIso3, clickedIso3}
  - `POST /api/run/a2/country` {runId, capitalName, pickedIso3}
  - `POST /api/run/a2/click` {runId, iso3, clickLat, clickLng}
  - `POST /api/run/b/order` {runId, mode, orderedIso3[]}
  - `POST /api/ai/recommend` {answers, provider}
- 질문 생성 로직:
  - A1: 무작위 ISO3 선택(중복 방지 세트). payload {type:"A1", targetIso3, targetName}
  - A2: 수도 좌표와 GeoJSON 가진 ISO3만 선택. {type:"A2", iso3, capitalName, step:"pickCountry"}
  - B1/B2: N개 국가 무작위. {type:"B", mode, items:[{iso3,name}]}
- 검증:
  - A1: clickedIso3 === targetIso3
  - A2 단계2: 하버사인 거리 ≤ X km
  - B: orderedIso3 배열이 인구 내림차순과 동일한지 비교

## 8. 데이터베이스 스키마 (Supabase/Postgres)
- `runs`: id(uuid PK), user_id(uuid nullable), mode(text), status('active'|'ended'), score(int), attempts_left(int), current_question(jsonb), created_at, ended_at
- `run_events`(옵션): run_id FK, event_type('ANSWER'|'WRONG'|'CORRECT'|'END'), payload jsonb, created_at
- `ai_results`(옵션): user_id nullable, answers jsonb, result jsonb, created_at
- RLS(로그인 시): `user_id = auth.uid()`만 select/insert/update.  
  - 익명 런은 DB 미저장 또는 별도 anon_key 컬럼으로 제한(미니멈: 메모리/쿠키만).

## 9. 인프라 / 배포 / 운영
- 호스팅: Vercel(Next.js), Supabase(DB/Auth/Storage).
- 환경변수: Supabase URL/KEY, 선택적 LLM 키(OpenAI/Anthropic/Gemini 교체 가능). 클라이언트 노출 금지.
- 빌드/CI: `pnpm lint`, `pnpm test`(필수 최소), `pnpm build`. Vercel 프리뷰/프로덕션 배포 분리.
- 모니터링: Vercel Analytics + Edge Functions 로그, 선택적으로 Sentry(에러 트레이싱).
- 에셋 크기 관리: GeoJSON 축소, 필요 시 dynamic import & 캐싱.

## 10. 개발 마일스톤(권장 순서)
1) 스켈레톤: Next.js + Tailwind + shadcn/ui 세팅, 홈/모드 라우트, countries.json 로더, `/api/run/start`.
2) 모드 B 우선: B1 UI(dnd-kit) + `/api/run/b/order`, 점수/시도/런 종료 플로우. B2 확장.
3) 모드 A2: 국가 선택 → 2D 지도 렌더링 → 수도 클릭 검증(하버사인). `/api/run/a2/*`.
4) 모드 A1: 3D 지구본 클릭(react-globe.gl), ISO3 매핑, 서버 검증.
5) 선택: AI 추천 설문 + LLM Provider 추상화 + 결과 페이지.

## 11. 테스트 전략
- 단위: 질문 생성기/검증기(zod 스키마, 정렬 체크, 거리 계산).
- 통합: API Route Handlers(Server Actions) happy/edge 케이스.
- E2E: Playwright로 주요 플로우(A1/A2/B1) 성공/실패 시나리오.
- 데이터 검증: 빌드 스크립트에서 countries.json/GeoJSON 누락/일관성 체크.

## 12. 비용/성능 고려
- LLM 호출은 선택적, 1회/런으로 제한. 저가 모델 기본값, provider 스위치 가능.
- GeoJSON 리듀스 + lazy load로 번들 최소화. 이미지/정적 파일은 Vercel CDN 사용.
- Supabase 프리티어로 시작, 트래픽 증가 시 플랜 업그레이드.

## 13. 위험 및 대응
- 3D 클릭 정확도: react-globe.gl 우선 사용, 필요 시 ISO3 폴리곤 ID 매핑 확인. 대안으로 r3f 커스텀 피킹 준비.
- 데이터 불일치: 단일 소스 countries.json + 빌드 검증 스크립트로 차단.
- 익명 세션 유실: 쿠키 run_id, 필요 시 서버 메모리/간단 KV 캐시.
- 번들 비대: GeoJSON 축소, dynamic import, 코드스플리팅.

---
본 SPEC은 @docs/PRD.md, @docs/Chatgpt_SPEC.md, @docs/Gemini_SPEC.md 내용을 통합한 최종본이다. 필요 시 모듈 교체(지구본 라이브러리/ORM/LLM Provider)는 인터페이스 유지 조건 하에 가능하다.
