# 올드스쿨 텍스트 블로그 리디자인 설계

작성일: 2026-08-15
대상: damipapa-blog 공개 페이지 전체

## 1. 목표

현재 웜톤·라운드·카드 기반의 "매거진 대시보드" 디자인을 2000년대 텍스트 위주
고전 블로그 스타일로 전면 교체한다.

성공 기준:

- 공개 페이지 어디에도 둥근 모서리, 그림자, 그라디언트, 진입 애니메이션이 없다.
- 본문이 명조체로 렌더링되고, 링크는 항상 밑줄과 고전적 파랑/보라(방문)로 구분된다.
- 홈이 대시보드가 아니라 연도별 아카이브 목록이다.
- 라이트/다크 모두 동작하고 `npm run build`가 통과한다.

명시적 비목표:

- 어드민 화면(TipTap 에디터 포함) 디자인 변경
- API, 라우팅, 데이터 로직, 페이징 로직 변경
- OG 이미지 생성 로직 변경
- 잔디(히트맵) 데이터 계산 로직 변경

## 2. 결정 사항

| 항목 | 결정 |
|---|---|
| 올드스쿨 강도 | 2000년대 텍스트 블로그 (90년대 HTML 패러디 아님) |
| 적용 범위 | 공개 페이지 전체. 어드민 제외 |
| 본문 폰트 | Noto Serif KR 전면 적용 (제목·본문 모두 명조) |
| 홈 구성 | 연도별 아카이브 목록 + 텍스트 사이드바 |
| 잔디 히트맵 | 유지하되 색상을 회색조 5단계로 교체 |
| 다크모드 | 유지 |
| 애니메이션 | 전부 제거 |
| 아이콘(lucide) | 공개 페이지에서 전부 제거, 텍스트 라벨로 대체. 어드민은 유지 |
| 모바일 햄버거 메뉴 | 삭제. 내비 링크를 항상 노출하고 줄바꿈 허용 |
| 테트리스 게임 화면 | 게임 보드 자체는 현행 유지 |

## 3. 디자인 토큰

`app/globals.css`의 `:root` / `.dark` 블록과 `tailwind.config.ts`를 교체한다.
컴포넌트는 이미 `bg-background`, `text-muted-foreground` 같은 시맨틱 클래스를
쓰고 있으므로, 토큰 교체만으로 색 변경의 대부분이 전파된다.

### 3.1 색상

HSL 값으로 기술한다(기존 형식 유지).

라이트:

| 토큰 | 값 | 비고 |
|---|---|---|
| `--background` | `0 0% 100%` | 순백 |
| `--foreground` | `0 0% 10%` | #1a1a1a |
| `--card` | `0 0% 100%` | 배경과 동일. 카드가 사라지므로 구분 불필요 |
| `--muted` | `0 0% 96%` | 코드블록 배경 |
| `--muted-foreground` | `0 0% 40%` | 메타 정보 |
| `--border` | `0 0% 87%` | #ddd |
| `--input` | `0 0% 87%` | |
| `--ring` | `0 0% 40%` | 포커스 링은 무채색 |
| `--link` | `222 93% 35%` | 신규. #0645ad 계열 |
| `--link-visited` | `271 68% 32%` | 신규. #551a8b |
| `--primary` | `--link`와 동일 | |
| `--secondary` / `--accent` | 무채색(`0 0% 94%` / `0 0% 92%`)으로 통일 | |
| `--destructive` | `0 60% 40%` | 삭제 버튼 등 최소 유지 |
| `--radius` | `0rem` | |

다크:

| 토큰 | 값 |
|---|---|
| `--background` | `0 0% 8%` |
| `--foreground` | `0 0% 85%` |
| `--card` | `0 0% 8%` |
| `--muted` | `0 0% 15%` |
| `--muted-foreground` | `0 0% 55%` |
| `--border` | `0 0% 22%` |
| `--link` | `212 90% 70%` |
| `--link-visited` | `280 55% 75%` |

잔디 5단계는 무채색으로 교체한다.

- 라이트: `--heatmap-l0: 0 0% 93%` → `l1 0 0% 78%` → `l2 0 0% 60%` → `l3 0 0% 38%` → `l4 0 0% 15%`
- 다크: `--heatmap-l0: 0 0% 18%` → `l1 0 0% 32%` → `l2 0 0% 48%` → `l3 0 0% 66%` → `l4 0 0% 85%`

`tailwind.config.ts`에서:

- `colors.primary`의 50~900 주황 계열 스케일 삭제. `primary`는 CSS 변수만 참조
- `colors.link`, `colors["link-visited"]` 추가
- `boxShadow.warm-sm/md/lg` → 세 값 모두 `none`. 키를 지우면 `shadow-warm-md`를
  쓰는 모든 파일이 빌드 에러를 내므로, **키는 남기고 값만 `none`으로 둔 뒤
  컴포넌트 정리 단계에서 클래스를 제거한다**
- `borderRadius`의 `xl/lg/md/sm`을 모두 `0`으로
- `--warm-highlight` 토큰은 무채색(`0 0% 96%` / 다크 `0 0% 15%`)으로 유지

### 3.2 타이포그래피

`app/layout.tsx`:

```
import { Noto_Serif_KR } from 'next/font/google'
const serif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-serif',
})
```

`Nunito` import와 사용을 삭제하고 `<body className={serif.variable}>`로 교체한다.
`className` 대신 `variable`을 쓰는 이유: Tailwind의 `font-sans` 유틸리티가
body의 인라인 폰트를 덮어쓰기 때문에, 두 경로가 같은 CSS 변수를 가리켜야
어디서도 폰트가 어긋나지 않는다. body 자체의 폰트는 `globals.css`의
`body { font-family: ... }`에서 같은 변수로 지정한다.

`tailwind.config.ts`의 `fontFamily`:

- `sans`: `['var(--font-serif)', 'Georgia', 'serif']` — 기본 폰트를 명조로.
  `sans`라는 키 이름은 그대로 두어 기존 `font-sans` 사용처가 깨지지 않게 한다
- `serif`: 동일한 명조 스택
- `mono`: 현행 유지 (JetBrains Mono)

본문 타이포 기준값:

- 본문 `1.05rem` / `line-height: 1.9`
- 제목은 `font-weight: 700`, 크기 대비를 현재보다 줄인다 (h1 1.75rem, h2 1.35rem,
  h3 1.15rem). 올드스쿨 블로그는 제목이 크게 튀지 않는다
- `letter-spacing` 조정(`tracking-tight` 등) 제거

### 3.3 링크 스타일

`globals.css` base 레이어에 추가한다.

```
a { color: hsl(var(--link)); text-decoration: underline; }
a:visited { color: hsl(var(--link-visited)); }
```

내비게이션·버튼 등 밑줄이 부적절한 곳은 `no-underline`으로 개별 해제한다.
`:visited`는 내비 링크에도 적용되면 산만하므로, 헤더/푸터 링크에는
`visited:text-[inherit]`를 준다.

## 4. 레이아웃

### 4.1 폭

`app/layout.tsx`의 `<main className="container mx-auto ...">`에서 `container`를
제거하고 `mx-auto w-full max-w-[720px] px-4 py-10`으로 바꾼다.
글 상세는 `app/posts/[id]/page-client.tsx`에서 `max-w-[680px]`로 더 좁힌다.

`tailwind.config.ts`의 `theme.container` 설정은 어드민이 계속 쓰므로 남긴다.

### 4.2 헤더 (`components/layout/Header.tsx`, 210줄 → ~90줄)

- `sticky top-0 z-50`, `backdrop-blur`, `shadow-warm-sm` 삭제
- 제목: `🏡 다미파파의 블로그` → `다미파파의 블로그` (이모지 제거)
- 제목 아래 `border-b` 한 줄, 그 아래 내비를 한 줄로:
  `홈 | 프로필 | 놀이터 | 검색 | 태그 | GitHub`
  구분자는 CSS가 아니라 실제 `<span aria-hidden>|</span>`로 넣는다
- 햄버거 버튼과 모바일 메뉴 블록 전부 삭제. 내비는 `flex flex-wrap`으로
  모바일에서 자연스럽게 줄바꿈
- `Github`, `Menu`, `X`, `PenSquare` 아이콘 삭제. GitHub는 텍스트 링크,
  글쓰기는 `[글쓰기]` 텍스트 링크
- **로고 5회 클릭 로그인 이스터에그(`handleLogoClick`)는 그대로 유지**
- `ThemeToggle` 위치 유지

### 4.3 테마 토글 (`components/common/ThemeToggle.tsx`)

`Sun`/`Moon` 아이콘 → 현재 테마의 반대를 가리키는 텍스트 (`[다크]` / `[라이트]`).
버튼 스타일은 밑줄 없는 텍스트 링크 형태.

### 4.4 푸터 (`components/layout/Footer.tsx`)

`border-t` 한 줄 + 한 행 텍스트: `© 2026 다미파파 · 누적 방문 12,345`.
현재 있는 링크 목록은 한 줄 파이프 구분으로 압축한다.

## 5. 홈 재작성

### 5.1 `components/dashboard/BlogDashboard.tsx` (398줄 → ~120줄)

삭제할 것:

- `getGreeting()`과 시간대별 인사말 블록
- `StatPill` 컴포넌트와 스탯 필 4개
- `FeaturedPost` (그라디언트 히어로 카드)
- `MagazinePostCard` (랭킹 넘버, 호버 리프트)
- `dashboard-blob` / `dashboard-grain` / `animate-*` 클래스 전부
- `lucide-react` import 전체

새 구조:

```
[한 줄 소개]  100% 바이브 코딩으로 만든 블로그
[한 줄 통계]  글 42편 · 조회 12,345 · 오늘 12명 · 누적 3,456명

2026
─────────────────────────────
08.15  메인 페이지에 잔디를 추가했다
       개발 · 조회 123
08.12  OG 이미지 502 삽질기
       개발 · 조회 87

2025
─────────────────────────────
12.28  ...

                     더보기 »
```

- 연도 그룹핑은 `recentPosts`를 `createdAt`의 연도로 `reduce`하여 만든다.
  별도 API 변경 없음
- 날짜는 `MM.DD` 고정 포맷. `formatDistanceToNow`(상대시간)는 제거한다 —
  "3일 전"은 현대적 UX 관용구이고 아카이브 목록과 맞지 않는다
- `loadMoreRecent` / `loadMorePopular`의 **기존 페이징 로직은 그대로 재사용**하고
  버튼만 `더보기 »` 텍스트 링크로 교체
- 인기 글은 메인 목록에서 빼고 사이드바로 이동 (5.2 참조)
- 빈 상태: 이모지 제거, `아직 작성된 글이 없습니다.` 한 줄

### 5.2 `app/page.tsx`

- `max-w-7xl` → `max-w-[720px]` (layout에서 제어하므로 여기선 wrapper 단순화)
- 사이드바 `<aside>`: `sticky top-24`, `rounded-2xl`, `bg-card`, `shadow-warm-sm`,
  `backdrop-blur-sm` 전부 제거. 데스크톱에서는 좌측 `border-l`과 패딩만,
  모바일에서는 본문 아래로 흐르며 상단 `border-t`
- 사이드바 내용: 카테고리 트리 + **인기 글 top 5 텍스트 목록** 추가
- 잔디 섹션의 `rounded-2xl border bg-card/80 shadow-warm-sm` → `border-t` + 제목만
- 태그/날짜 필터 모드의 빈 상태 카드(`rounded-2xl border bg-card/60`)도 텍스트 한 줄로

## 6. 글 목록과 상세

### 6.1 `components/post/PostCard.tsx` (51줄)

`Card` / `CardHeader` / `CardContent` / `Badge` / 아이콘 import 전부 제거.
`<article>` 한 행으로 재작성:

```
2026.08.15
메인 페이지에 잔디를 추가했다
#태그 #태그 · 다미파파 · 조회 123
```

호버 효과는 제목 링크 색 변화만. `hover:scale`, `hover:shadow`, `transition` 제거.
행 사이는 `border-b border-border`로 구분.

### 6.2 `components/post/PostDetail.tsx` (267줄)

- 상단: 제목 → 메타 한 줄(`작성일 · 카테고리 · 조회 N`) → `<hr>` → 본문
- lucide 아이콘 전부 텍스트 라벨로 교체
- 카드/라운드/그림자 컨테이너 제거
- `PostShare`, `PostReactions`는 아이콘 버튼 → 텍스트 버튼 (`[공유]`, `[링크 복사]`)

### 6.3 `.markdown` 스타일 (`globals.css` 248~360줄)

- 본문 명조, `1.05rem / 1.9`
- `h1~h3` 크기 축소, 상단 여백은 유지하되 `border-bottom`으로 구분(h2까지만)
- `blockquote`: 좌측 `3px solid` 회색 바 + 이탤릭 없음 + 배경 없음
- `pre`: `background: hsl(var(--muted))`, `border: 1px solid hsl(var(--border))`,
  `border-radius: 0`
- `code`(인라인): 배경 + 1px 실선, 모서리 0
- `a`: 항상 밑줄
- `img`: `border: 1px solid` + 모서리 0. 캡션이 있으면 중앙 정렬 작은 회색 텍스트

### 6.4 `components/ui/*`

`card.tsx`, `badge.tsx`, `button.tsx`, `separator.tsx`, `segmented-control.tsx`는
어드민도 함께 쓴다. **컴포넌트 파일을 고치지 않고**, 공개 페이지에서 사용처를
제거하는 방향으로 간다. 단 `borderRadius` 토큰이 0이 되므로 어드민 쪽도
모서리는 각지게 바뀐다 — 허용 범위로 본다.

예외: `badge.tsx`는 공개 페이지 태그 표시에 널리 쓰이므로, 공개 페이지에서는
`Badge` 대신 순수 `<a>#태그</a>` 텍스트로 대체한다.

## 7. 나머지 공개 페이지

| 파일 | 작업 |
|---|---|
| `components/tags/TagCloud.tsx` (128줄) | `framer-motion` 제거(프로젝트 내 유일 사용처), 크기 가변 클라우드 → `#태그(12)` 텍스트 목록 |
| `app/tags/page.tsx` (115줄) | 카드 래퍼 제거 |
| `components/category/CategoryTree.tsx` (157줄) | `ChevronRight` 등 아이콘 → `+` / `-` 텍스트, 들여쓰기 목록 |
| `app/categories/page.tsx`, `app/categories/[slug]/page.tsx` | 카드 그리드 → 목록 |
| `app/search/page.tsx` (105줄) | 입력창 모서리 0, 결과를 PostCard 목록으로 |
| `app/career/page.tsx`, `components/career/CareerTimeline.tsx` (260줄) | 타임라인 장식·아이콘 제거, 연도별 텍스트 목록 |
| `app/projects/page.tsx`, `ProjectCard/ProjectGrid/ProjectDetail` | 카드 그리드 → 목록. `AppStoreLinks` 아이콘 → 텍스트 |
| `components/common/Pagination.tsx` (70줄) | `« 이전 1 2 3 다음 »` 텍스트 |
| `components/dashboard/PostingHeatmap/*` | 셀 `rounded` 제거, 회색조 토큰 적용, `Legend`를 텍스트로 |
| `components/common/Loading.tsx` (8줄) | 스피너 → `불러오는 중...` 텍스트 |
| `app/game/tetris/*` | **변경 없음** |

## 8. `globals.css` 정리

삭제 대상 (552~710줄 구간):

- `@keyframes fade-up / fade-in / scale-in / float-gentle / shimmer / counter-roll / pulse-scale`
  와 대응 `.animate-*` 클래스
- `.dashboard-blob`, `.dashboard-grain::before` (다크 변형 포함)
- `.featured-card`, `.featured-card::before`
- `.magazine-number`

유지 대상:

- `.ProseMirror*` 전체 (어드민 에디터)
- `.code-scroll`, `.heatmap-scroll`, `.break-words` 등 유틸리티
- `.pdf-generating` 블록

`.markdown`은 6.3대로 교체한다. 741줄 이후에 `.markdown p`가 중복 정의되어
있으므로 이 중복도 함께 정리한다.

## 9. 검증

1. `npm run lint`
2. `npm run build` 통과
3. 개발 서버를 띄우고 공개 페이지 8종을 라이트/다크 각각 육안 확인:
   `/`, `/posts/[id]`, `/tags`, `/categories`, `/categories/[slug]`, `/search`,
   `/career`, `/projects`
4. 모바일 폭(375px)에서 가로 오버플로가 없는지 확인 — 최근 커밋
   `8c1d8ba`에서 고쳤던 문제이므로 회귀 여부를 반드시 본다
5. `grep -rn "lucide-react" app components | grep -v admin` 결과가
   비어 있는지 확인 (게임/공통 모달 예외는 허용, 목록으로 남긴다)
6. `grep -rn "framer-motion" app components` 결과가 비어 있는지 확인

디자인 변경이므로 단위 테스트는 추가하지 않는다.

## 10. 리스크

| 리스크 | 대응 |
|---|---|
| Noto Serif KR 한글 자소 용량이 커 첫 로딩이 느려질 수 있음 | `display: 'swap'` 지정. 빌드 후 실제 전송량을 확인하고, 과하면 "제목만 명조" 대안으로 후퇴 |
| `boxShadow` 키 삭제 시 다수 파일 빌드 에러 | 값만 `none`으로 두고 클래스는 단계적으로 제거 |
| `borderRadius` 0이 어드민 UI에도 적용됨 | 의도된 부수효과로 수용 |
| 잔디 회색조가 다크모드에서 밝은 쪽이 강조되는 반전 구조 | 라이트는 짙을수록 활동 많음, 다크는 밝을수록 활동 많음으로 각각 정의 (위 3.1 값이 이미 반영) |
