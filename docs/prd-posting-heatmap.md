# PRD: Posting Activity Heatmap (포스팅 잔디)

| | |
|---|---|
| **문서 버전** | v1.0 (확정) |
| **작성일** | 2026-05-03 |
| **확정일** | 2026-05-03 |
| **작성자** | damipapa |
| **대상 릴리즈** | 다음 마이너 배포 |
| **상태** | Approved → Implementation |

---

## 1. 배경 (Background)

블로그 메인 페이지는 현재 `BlogDashboard` 위젯(통계 pill, 최근 글, 인기 글)이 차지하고 있다.
방문자가 블로그의 **운영 활성도**를 한눈에 인지하기 어렵고, 작성자 본인도 글쓰기 동기를 시각적으로 강화할 장치가 부족하다.

GitHub의 contribution graph(통칭 "잔디")는 누적 활동을 즉각적으로 보여주는 가장 검증된 시각화 패턴이다. 동일한 시각화를 **포스트 작성 활동**에 적용해 메인 페이지 하단에 배치한다.

---

## 2. 목표 (Goals) & 비목표 (Non-Goals)

### Goals
- G1. 작성자의 **연간 포스팅 빈도**를 GitHub 잔디와 시각적으로 동일한 그리드로 표시
- G2. 셀 클릭 시 해당 날짜에 작성된 포스트로 즉시 이동 가능 (탐색성)
- G3. 연도 전환을 통해 과거 활동 회고 가능 (2025 → 2024 → ...)
- G4. 라이트/다크 테마, 모바일/데스크톱 모두 자연스럽게 대응

### Non-Goals
- N1. 댓글/조회수 등 다른 활동 지표를 잔디에 합산하지 않는다 (이번 릴리즈는 **포스트 작성** 한 가지만)
- N2. 다른 사용자/작성자의 활동 비교 기능 (단일 작성자 블로그)
- N3. 잔디 자체에서 직접 글 작성/편집 (탐색용으로만)
- N4. 외부 라이브러리(`react-activity-calendar` 등) 도입 — 자체 구현으로 번들 비용 최소화

---

## 3. 사용자 시나리오 (User Scenarios)

### S1. 일반 방문자
> "이 블로그 활발히 운영되네?" 를 3초 안에 인지

- 메인 페이지 진입 → 스크롤 다운 → 잔디 영역에서 최근 한 달의 진한 셀 패턴을 본다
- "올해 N편 · M일 활동" 요약 텍스트로 정량 파악
- 호기심에 진한 셀 위에 마우스 호버 → "2026-04-15 · 포스트 3편" 툴팁
- 클릭 → 해당 날짜에 작성된 포스트 목록 페이지로 이동

### S2. 작성자(관리자) 본인
- 비공개 포스트도 잔디에 포함되어야 함 (`isAdmin` 플래그로 분기)
- 공백 기간이 길어지면 시각적으로 인지 → 글쓰기 동기 강화
- 연도 토글로 작년/재작년과 비교

### S3. 모바일 방문자
- 가로 폭이 부족하므로 **좌→우 스크롤 가능**한 영역으로 처리
- 호버 대신 **탭(tap) 시 툴팁** 표시, 한 번 더 탭 시 해당 날짜로 이동

---

## 4. 기능 요구사항 (Functional Requirements)

### F1. 잔디 그리드 렌더링
- **53주 × 7일** 그리드 (정확히 53컬럼, GitHub 명세 그대로)
- 각 셀은 ISO 날짜 1일에 대응
- 셀 색상은 그날 작성한 포스트 개수에 따라 5단계
  - L0: 0편 (회색 배경)
  - L1: 1편
  - L2: 2편
  - L3: 3편
  - L4: 4편 이상
- 미래 날짜의 셀은 렌더링은 하되 더 옅은 회색 (no-data 상태)

### F2. 월/요일 레이블
- 상단: `Jan, Feb, ... , Dec` 월 라벨 (월의 첫 주가 시작되는 컬럼 위에 정렬)
- 좌측: `Mon, Wed, Fri` 요일 라벨 (홀수 행만, GitHub와 동일)

### F3. 호버 툴팁 (인터랙티브 — 옵션 B 핵심)
- 셀 위 마우스 호버(데스크톱) / 탭(모바일) 시 표시
- 포맷: `2026-04-15 · 포스트 3편`
- 0편인 날: `2026-04-15 · 작성 없음`
- 미래 날짜: 툴팁 비표시
- 위치: 셀 바로 위 중앙, 그리드 영역을 벗어나지 않도록 자동 보정

### F4. 클릭 → 날짜별 포스트 이동
- 1편 이상 작성된 셀 클릭 → `/posts?date=YYYY-MM-DD` (또는 `/search?date=...`)로 라우팅
- 0편 셀 클릭은 no-op (커서도 default)
- 모바일: 첫 탭은 툴팁만 표시, 두 번째 탭에서 라우팅 (의도치 않은 이동 방지)

### F5. 연도 전환
- 잔디 우측에 GitHub 스타일 **연도 리스트**(스크롤 가능, 가장 최근 연도가 활성)
- 연도 클릭 시 해당 연도 데이터로 fetch & 그리드 재렌더
- 사용 가능한 연도 = `min(post.createdAt) ~ 현재 연도`

### F6. 활동 요약 (Activity Summary)
- **위치 (확정)**: 잔디 그리드 **아래**.
  - 결정 근거: 시선 흐름이 "그리드 패턴 인지 → 정량 수치 확인" 순으로 흐르도록 (GitHub 원본과 동일한 인지 경로 확보, 시각화 임팩트 우선).
- 표시 항목:
  - `542 contributions in 2025` 스타일의 **총 작성 수**
  - 활동한 일수 (예: `134 active days`)
  - 최장 연속 작성일 (longest streak, 옵션)
- 텍스트 톤은 한국어 기본: `2025년에 작성한 글 542편 · 활동일 134일 · 최장 연속 12일`
- 정렬: 잔디 좌측 정렬과 맞춰 좌측 정렬 (`text-sm text-muted-foreground`, 잔디와의 간격 `mt-3`)

### F7. 색상 범례 (Legend)
- 우측 하단에 `Less ─ ▢▫■▩■ ─ More` 5단계 표시
- 호버 시 단계별 기준값 툴팁 (`0편`, `1편`, `2편`, `3편`, `4편+`)

### F8. 권한 분기
- 비관리자: 비공개 포스트/카테고리 제외하고 카운팅
- 관리자: 모든 포스트 포함 (기존 `/api/dashboard` 의 `isAdmin` 패턴 재사용)

---

## 5. 디자인 스펙 (Design Spec)

### 5.1 레이아웃 (확정)
```
┌─────────────────────────────────────────────────────────┐
│                                                  [2026]  │
│  ┌──────────────────────────────────────────┐    2025 ◉ │
│  │     Jan  Feb  Mar  ... Nov  Dec          │    2024   │
│  │ Mon ▢▫■▩■▢▫■▩■▢▫■▩■▢▫■▩■▢▫■▩■▢▫       │    2023   │
│  │ Wed ▢▫■▩■▢▫■▩■▢▫■▩■▢▫■▩■▢▫■▩■▢▫       │    2022   │
│  │ Fri ▢▫■▩■▢▫■▩■▢▫■▩■▢▫■▩■▢▫■▩■▢▫       │    2021   │
│  └──────────────────────────────────────────┘    ...    │
│  2025년에 작성한 글 542편 · 활동일 134일                │
│  · 최장 연속 12일                                       │
│                            Less ▢▫■▩■ More              │
└─────────────────────────────────────────────────────────┘
```

> 활동 요약은 잔디 **아래**, 색상 범례와 같은 라인은 아니지만 인접 영역에 배치한다.

### 5.2 치수
- 셀: `width 11px × height 11px`, `border-radius 2px`
- 셀 간격: `gap 3px`
- 그리드 외부 패딩: `16px`
- 컨테이너: 메인 페이지 콘텐츠 폭(`max-w-7xl`) 안에서 좌우 여유 24px
- 모바일(< 768px): 그리드 영역에 `overflow-x: auto`, 우측 fade mask 적용

### 5.3 색상 (GitHub 잔디 거의 그대로)
CSS 변수로 5단계 정의 (`app/globals.css` 에 추가):

| 단계 | Light Mode (HSL) | Dark Mode (HSL) | 비고 |
|---|---|---|---|
| L0 | `30 25% 92%` (배경 카드보다 살짝 진한 회색) | `25 15% 18%` | GitHub `#ebedf0` / `#161b22` |
| L1 | `135 50% 80%` | `135 35% 22%` | GitHub `#9be9a8` / `#0e4429` |
| L2 | `135 55% 60%` | `135 45% 30%` | GitHub `#40c463` / `#006d32` |
| L3 | `135 60% 45%` | `135 55% 40%` | GitHub `#30a14e` / `#26a641` |
| L4 | `135 70% 32%` | `135 65% 50%` | GitHub `#216e39` / `#39d353` |

> 사용자 요청: "디자인도 최대한 비슷하게" → 블로그의 따뜻한 오렌지 팔레트가 아닌 **GitHub 초록 톤을 의도적으로 유지**한다.
> 정당화: 잔디는 일종의 "기능적 인용"으로, 사용자가 즉각 알아볼 수 있는 visual primitive 가치 > 톤 일관성.

### 5.4 타이포그래피
- 월/요일 라벨: `text-xs text-muted-foreground` (Tailwind 기존 토큰 그대로)
- 활동 요약: `text-sm font-medium text-foreground`
- 툴팁: `bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-warm-md`

### 5.5 애니메이션
- 진입 시: 셀이 좌→우, 위→아래 순서로 **stagger fade-in** (셀당 1ms delay, 총 ~400ms)
- 호버 시: `scale(1.15)` + 1px ring (`ring-1 ring-foreground/20`)
- 연도 전환 시: 그리드 영역 fade-out → fetch → fade-in (200ms)

### 5.6 다크 모드
- 라이트/다크 전환은 `darkMode: 'class'` 그대로 따름 (CSS 변수만 다르게 정의)

---

## 6. 데이터 & API 스펙

### 6.1 신규 엔드포인트
**`GET /api/dashboard/heatmap`**

#### Query Parameters
| 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `year` | number | No (default: 현재 연도, KST) | 조회할 연도 |
| `admin` | boolean | No (default: false) | 관리자 모드 (비공개 글 포함) |

#### Response
```typescript
interface HeatmapResponse {
  year: number
  timezone: 'Asia/Seoul'        // 명시
  totalPosts: number             // 그 해 총 작성 글 수
  activeDays: number             // 1편 이상 작성한 일수
  longestStreak: number          // 최장 연속 작성일
  availableYears: number[]       // 연도 토글 옵션 (사용 가능 연도 목록, 내림차순)
  days: Array<{
    date: string                 // 'YYYY-MM-DD' (KST 기준)
    count: number                // 그 날 작성한 포스트 개수
    level: 0 | 1 | 2 | 3 | 4     // 색상 단계 (서버에서 계산해 내려줌)
  }>
}
```

> 서버에서 `level` 까지 계산해 내려주는 이유: 클라이언트 분기 로직 단순화 + 추후 임계값 정책 변경 시 서버만 수정.
> `days` 길이는 **윤년 여부와 관계없이 365 또는 366**. 53주 그리드는 클라이언트가 채움(앞뒤 padding 셀로).

### 6.2 SQL/Prisma 쿼리
```ts
// KST = UTC + 9h
const kstOffset = 9 * 60 * 60 * 1000

// year 의 KST 1/1 0:00 ~ 12/31 23:59:59.999 를 UTC 로 변환
const startUtc = new Date(Date.UTC(year, 0, 1) - kstOffset)
const endUtc = new Date(Date.UTC(year + 1, 0, 1) - kstOffset)

// Prisma raw 또는 groupBy
const rows = await prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
  SELECT DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+09:00'), '%Y-%m-%d') AS day,
         COUNT(*) AS count
  FROM posts
  WHERE created_at >= ${startUtc} AND created_at < ${endUtc}
    ${isAdmin ? Prisma.empty : Prisma.sql`AND is_private = false`}
    -- private category 제외 조건도 동일하게
  GROUP BY day
`
```

> **타임존 함정**: 서버는 UTC로 동작하지만 사용자(한국)는 KST 기준으로 잔디를 본다.
> 한국 시간 새벽 1시에 작성한 글이 UTC 기준 전날로 묶이면 잔디 칸이 하루 어긋난다.
> → **반드시 `CONVERT_TZ` 또는 KST 오프셋 적용 후 GROUP BY** 한다. 이 PRD에 명시.

### 6.3 캐싱
- Next.js `revalidate: 600` (10분) — 잔디는 실시간성보다 안정성이 중요
- 연도별 응답은 `Cache-Control: public, max-age=600, stale-while-revalidate=3600`
- 클라이언트: 연도별 응답을 `Map<year, HeatmapResponse>` 로 메모이제이션 (재방문 시 재페치 X)

### 6.4 `/posts?date=YYYY-MM-DD` 라우트
- 기존 `getPosts` 서비스에 `date` 파라미터 추가
- 백엔드: `WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+09:00')) = ?`

---

## 7. 기술 구현 (Technical Design)

### 7.1 파일 구조
```
app/
  api/
    dashboard/
      heatmap/
        route.ts                  # 신규
components/
  dashboard/
    BlogDashboard.tsx             # 기존 (변경 없음)
    PostingHeatmap/               # 신규 디렉토리
      index.tsx                   # 컨테이너 (data fetch, 연도 상태)
      HeatmapGrid.tsx             # 53×7 SVG/div 그리드
      HeatmapCell.tsx             # 개별 셀 (호버, 클릭)
      HeatmapTooltip.tsx          # 툴팁
      YearSelector.tsx            # 우측 연도 리스트
      ActivitySummary.tsx         # 상단 요약 텍스트
      Legend.tsx                  # 우측 하단 색상 범례
      utils.ts                    # 53주 그리드 빌더, 날짜 유틸
      types.ts
app/
  page.tsx                        # <PostingHeatmap /> 추가 (대시보드 하단)
app/
  globals.css                     # --heatmap-l0 ~ l4 변수 추가
types/
  index.ts                        # HeatmapResponse 타입 추가
```

### 7.2 컴포넌트 인터페이스

```typescript
// PostingHeatmap/index.tsx
interface PostingHeatmapProps {
  isAdmin: boolean                 // 권한 분기
  initialYear?: number             // 기본 = 현재 연도(KST)
  className?: string
}

// HeatmapGrid.tsx
interface HeatmapGridProps {
  days: HeatmapDay[]               // 365/366 일 배열
  year: number
  onCellClick: (date: string) => void
  onCellHover: (cell: HeatmapDay | null, rect?: DOMRect) => void
}

// utils.ts
export function buildWeekColumns(year: number, days: HeatmapDay[]): WeekColumn[]
// 반환: 53주짜리 컬럼 배열, 각 컬럼은 7일치 셀 (앞주 padding, 뒤주 padding 포함)
```

### 7.3 53주 그리드 빌더 핵심 로직
```typescript
// 1월 1일이 속한 주의 일요일부터 시작
// 12월 31일이 속한 주의 토요일까지 채우면 자연스럽게 53주가 됨
// padding 셀은 isPadding=true 로 표시 (배경만, 호버/클릭 비활성)
```

### 7.4 메인 페이지 통합
```tsx
// app/page.tsx (기본 대시보드 모드)
<main className="flex-1 min-w-0">
  {dashboardData && <BlogDashboard data={dashboardData} />}

  {/* ▼ 신규 추가 */}
  <section className="mt-12">
    <PostingHeatmap isAdmin={isAdmin} />
  </section>
</main>
```

---

## 8. 엣지 케이스

| 케이스 | 처리 |
|---|---|
| 작성 글이 0편 — **블로그 전체** (모든 연도 0편) | 모든 셀 L0 + 잔디 영역 위에 오버레이 메시지: **"여기 잔디는 글과 함께 자라요"** + 서브카피 `첫 글을 작성하면 이 영역이 채워져요` (`text-muted-foreground`) |
| 작성 글이 0편 — **선택한 연도만** (다른 해엔 글 있음) | 모든 셀 L0 (오버레이 없음). 활동 요약 영역에만 표시: **"2024년엔 잔디가 비어있어요"** (잔잔한 톤, 좌측 정렬) |
| 미래 날짜 셀 | 셀 렌더링은 하되 `opacity-30`, 호버/클릭 비활성 |
| 1월 1일이 일요일 | 53주가 아닌 52주가 될 수 있음 → 마지막에 빈 컬럼 1개 padding |
| 1월 1일이 토요일 | 첫 컬럼이 1주 padding 1주 → 53주 보장 |
| 윤년 (366일) | days 배열 길이만 다르고 그리드 빌더가 자동 처리 |
| 연도 전환 중 fetch 실패 | 이전 데이터 유지 + 토스트 알림 (`데이터를 불러오지 못했어요`) |
| 모바일 가로 스크롤 | `overflow-x: auto` + 우측 그라디언트 fade mask로 스크롤 가능 힌트 |
| 한 셀에 너무 많은 글 (10편+) | L4 상한 + 툴팁에서는 정확한 숫자 표시 |
| 다크모드 전환 직후 | CSS 변수 기반이라 자동 대응, 별도 처리 불필요 |
| 비공개 글 → 공개 전환 | 다음 캐시 만료(10분) 후 반영 — 즉시성 보장 안 함 (의도) |
| `date=` 라우트로 이동 후 결과 0건 | "이 날짜에 작성된 공개 글이 없어요" 빈 상태 |

---

## 9. 성능 / 비기능 요구사항

- **번들 영향**: 라이브러리 미사용 → +0KB gzipped (자체 컴포넌트만)
- **API 응답 크기**: 일자별 데이터 365개 × ~50바이트 ≈ **~18KB** (압축 후 ~3KB)
- **렌더링**: 53×7=371 셀 → React `key` 안정화로 한 번에 렌더, 추가 메모이제이션 불필요
- **접근성 (a11y)**:
  - 각 셀에 `aria-label="2026년 4월 15일, 포스트 3편 작성"`
  - 키보드 포커싱: Tab 으로 셀 순회, Enter 로 라우팅
  - 색상만으로 정보 전달하지 않음 (툴팁 + aria-label로 보강)
- **SEO**: 잔디 자체는 SEO 가치가 낮으므로 클라이언트 컴포넌트로 구현 (SSR 불필요)

---

## 10. 마일스톤 (구현 순서 제안)

| 단계 | 내용 | 예상 시간 |
|---|---|---|
| M1 | API 엔드포인트 (`/api/dashboard/heatmap`) + 타입 정의 + KST 처리 | 1h |
| M2 | `HeatmapGrid` + `HeatmapCell` 정적 렌더링 (인터랙션 없음, 더미 데이터) | 1.5h |
| M3 | 색상 변수 (`globals.css`) + 라이트/다크 검증 | 0.5h |
| M4 | 호버 툴팁 + 클릭 라우팅 | 1h |
| M5 | `YearSelector` + 연도 전환 로직 (캐시 포함) | 1h |
| M6 | `ActivitySummary` + `Legend` | 0.5h |
| M7 | 모바일 가로 스크롤 + fade mask | 0.5h |
| M8 | a11y 검토 (aria-label, 키보드 포커싱) | 0.5h |
| M9 | `/posts?date=` 라우트 백엔드 + 빈 상태 UI | 0.5h |
| M10 | Playwright/수동 회귀 (라이트/다크 × 데스크톱/모바일) | 0.5h |
|  | **합계** | **약 7.5h** |

---

## 11. 향후 확장 (Future)

- **F11.1** 잔디 셀에 글 외 다른 활동(댓글, 좋아요) 합산 토글
- **F11.2** 셀 클릭 시 모달로 그날 글 미리보기 (페이지 이동 대신)
- **F11.3** OG 이미지에 잔디 미리보기 합성 (블로그 SNS 공유 시)
- **F11.4** 작성 시간대 분포 (히스토그램, 잔디 옆에)
- **F11.5** 연속 작성 streak 기반 뱃지

---

## 12. 결정사항 (Decisions)

> v1.0 확정 시점에 모든 열린 이슈 종결. 변경이 필요하면 새로운 PRD 버전(v1.1+)으로 재기록.

| # | 이슈 | 결정 | 근거 / 비고 |
|---|---|---|---|
| D1 | 셀 클릭 시 모달 vs 라우팅 | **라우팅** (`/?date=YYYY-MM-DD`) | 메인 페이지 컨텍스트를 떠나는 비용보다 검색 결과 페이지의 풍부함이 더 가치 있음. 뒤로가기로 잔디 위치 복귀 가능. **구현 시 보정**: 코드베이스가 `/?tag=...` 패턴으로 메인 페이지 내부 분기 검색을 사용하므로, `/posts?date=` 가 아닌 `/?date=` 로 통일. 동일 페이지 내 검색 결과 표시 → 뒤로가기 시 잔디 스크롤 위치도 그대로 유지되는 부수적 이점. |
| D2 | 활동 요약 위치 | **잔디 아래** (좌측 정렬) | "그리드 패턴 인지 → 정량 확인" 시선 흐름 유지. GitHub 원본과 동일한 인지 경로. |
| D3 | 잔디 색상 톤 | **GitHub 초록 톤 유지** | 잔디는 보편적 시각 인용(visual primitive). 즉시 인지 가능성 > 톤 일관성. |
| D4 | 빈 상태 카피톤 | **잔디 메타포 + 따뜻한 톤** (분기 처리) | 블로그 기존 톤(`getGreeting` 등)과 일관. 분기는 § 8 엣지 케이스 표 참조. |
| D5 | (참고) 연도 토글 위치 | **잔디 우측 인라인** (사이드바 X) | 잔디와 데이터가 직접 연결됨을 시각적으로 표현. § 5.1 레이아웃 확정안. |

### 빈 상태 카피 (D4 상세)
- **블로그 전체 0편**: 메인 카피 `여기 잔디는 글과 함께 자라요` / 서브카피 `첫 글을 작성하면 이 영역이 채워져요`
- **선택 연도만 0편**: `{YYYY}년엔 잔디가 비어있어요` (잔디 아래 활동 요약 영역에 단독 표시)
- 톤 가이드: "아직 ~ 없어요" 류의 부정 표현보다, **"~와 함께 자라요" / "비어있어요"** 처럼 자연스러운 시간성 비유 사용

---

## 13. 부록: 참고 링크
- GitHub Contribution Graph: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/viewing-contributions-on-your-profile
- 53주 그리드 알고리즘: ISO 8601 Week date — https://en.wikipedia.org/wiki/ISO_week_date

---

## 14. 변경 이력 (Changelog)

| 버전 | 일자 | 변경 내용 |
|---|---|---|
| v0.1 | 2026-05-03 | 초안 작성. 5개 열린 이슈 포함 |
| **v1.0** | **2026-05-03** | **확정본**. 5개 결정사항 종결 (§ 12). 활동 요약 위치 잔디 아래로 확정 (§ 5.1, F6). 빈 상태 카피 분기 명세 추가 (§ 8, D4) |
