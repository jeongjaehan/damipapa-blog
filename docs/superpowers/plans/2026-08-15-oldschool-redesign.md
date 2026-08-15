# 올드스쿨 텍스트 블로그 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** damipapa-blog의 공개 페이지 전체를 2000년대 텍스트 위주 고전 블로그 스타일로 교체한다.

**Architecture:** 색·모서리·그림자·폰트는 `app/globals.css`의 CSS 변수와 `tailwind.config.ts` 토큰에 집중되어 있으므로 이 둘을 먼저 교체해 사이트 전역에 전파시킨다. 그다음 카드·그리드·아이콘·애니메이션에 의존하는 컴포넌트를 목록형 마크업으로 하나씩 교체한다. 어드민(TipTap 에디터 포함), API, 라우팅, 페이징 로직은 건드리지 않는다.

**Tech Stack:** Next.js 15 (App Router), React 18, Tailwind CSS, `next/font/google`(Noto Serif KR), lucide-react(어드민만 잔류), date-fns

**Spec:** `docs/superpowers/specs/2026-08-15-oldschool-redesign-design.md`

## Global Constraints

- **테스트 방식**: 이것은 시각 변경 작업이다. 단위 테스트를 새로 만들지 않는다. 각 태스크의 검증은 `npx tsc --noEmit`(타입) → `npm run lint` → 개발 서버 육안 확인 순서다. 마지막 태스크에서만 `npm run build`를 돌린다.
- **개발 서버**: 계획 실행 시작 시 `npm run dev`를 한 번 띄워두고 태스크마다 재사용한다. 태스크마다 새로 띄우지 않는다.
- **건드리지 않는 것**: `app/admin/**`, `app/api/**`, `services/**`, `prisma/**`, `middleware.ts`, `app/game/tetris/**`, `components/game/**`, `.ProseMirror*` CSS 블록.
- **유지해야 하는 동작**: 헤더 로고 5회 클릭 로그인 이스터에그(`handleLogoClick`), `BlogDashboard`의 `loadMoreRecent`/`loadMorePopular` 페이징, 잔디 히트맵의 데이터 계산·툴팁·키보드 접근성.
- **색상 표기**: 모든 색은 HSL 3값 형식(`0 0% 100%`)으로 CSS 변수에 넣는다. 기존 파일 형식과 동일하다.
- **커밋 메시지**: 기존 관례를 따라 이모지 프리픽스를 쓴다(`💄` 스타일, `♻️` 리팩터링, `🔥` 제거).
- **아이콘 정책**: 공개 페이지에서 `lucide-react` import를 전부 제거한다. 단 `components/common/ImageViewerModal.tsx`, `components/common/OptimizedImage.tsx`, `components/ui/dropdown-menu.tsx`는 어드민과 공유되므로 예외로 남긴다.

---

## 파일 구조

| 파일 | 책임 | 작업 |
|---|---|---|
| `app/globals.css` | 디자인 토큰, base 스타일, `.markdown` 본문 스타일 | 수정 (토큰 교체, 애니메이션 삭제, `.markdown` 재작성) |
| `tailwind.config.ts` | 토큰 → Tailwind 유틸리티 매핑 | 수정 |
| `app/layout.tsx` | 폰트, 본문 폭 | 수정 |
| `components/layout/Header.tsx` | 사이트 제목 + 텍스트 내비 | 재작성 |
| `components/layout/Footer.tsx` | 한 줄 푸터 | 재작성 |
| `components/common/ThemeToggle.tsx` | 테마 순환 텍스트 버튼 | 재작성 |
| `components/common/Loading.tsx` | 텍스트 로딩 표시 | 재작성 |
| `components/common/Pagination.tsx` | 텍스트 페이지네이션 | 수정 |
| `components/post/PostCard.tsx` | 글 목록 한 행 | 재작성 |
| `components/post/PostList.tsx` | 글 목록 컨테이너 | 수정 |
| `components/dashboard/BlogDashboard.tsx` | 연도별 아카이브 목록 | 재작성 |
| `app/page.tsx` | 홈 레이아웃, 사이드바 | 수정 |
| `components/post/PostDetail.tsx` | 글 상세 | 수정 |
| `components/post/PostShare.tsx` / `PostReactions.tsx` | 텍스트 버튼 | 수정 |
| `components/category/CategoryTree.tsx` | 들여쓰기 목록 | 수정 |
| `components/tags/TagCloud.tsx` | 텍스트 태그 목록 | 재작성 |
| `components/dashboard/PostingHeatmap/{HeatmapCell,Legend}.tsx` | 각진 회색조 셀 | 수정 |
| `app/{tags,search,categories,career,projects}/**` | 카드 → 목록 | 수정 |

---

## Task 1: 디자인 토큰 교체

**Files:**
- Modify: `app/globals.css:5-66` (`:root` / `.dark` 블록)
- Modify: `tailwind.config.ts:33-95` (colors / borderRadius / boxShadow)

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces: CSS 변수 `--link`, `--link-visited`와 Tailwind 유틸리티 `text-link`, `text-link-visited`. 이후 모든 태스크가 이 두 개를 링크 색으로 사용한다. `--radius`는 `0rem`, `shadow-warm-{sm,md,lg}`는 `none`이 된다.

- [ ] **Step 1: `:root` 블록 교체**

`app/globals.css`의 `:root { ... }` 안을 아래로 통째로 교체한다.

```css
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 10%;
    --primary: 222 93% 35%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 94%;
    --secondary-foreground: 0 0% 20%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 40%;
    --accent: 0 0% 92%;
    --accent-foreground: 0 0% 20%;
    --destructive: 0 60% 40%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 87%;
    --input: 0 0% 87%;
    --ring: 0 0% 40%;
    --radius: 0rem;
    --warm-highlight: 0 0% 96%;

    --link: 222 93% 35%;
    --link-visited: 271 68% 32%;

    /* 잔디 - 회색조 (Light: 짙을수록 활동 많음) */
    --heatmap-l0: 0 0% 93%;
    --heatmap-l1: 0 0% 78%;
    --heatmap-l2: 0 0% 60%;
    --heatmap-l3: 0 0% 38%;
    --heatmap-l4: 0 0% 15%;
  }
```

- [ ] **Step 2: `.dark` 블록 교체**

```css
  .dark {
    --background: 0 0% 8%;
    --foreground: 0 0% 85%;
    --card: 0 0% 8%;
    --card-foreground: 0 0% 85%;
    --popover: 0 0% 12%;
    --popover-foreground: 0 0% 85%;
    --primary: 212 90% 70%;
    --primary-foreground: 0 0% 8%;
    --secondary: 0 0% 16%;
    --secondary-foreground: 0 0% 80%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 55%;
    --accent: 0 0% 18%;
    --accent-foreground: 0 0% 80%;
    --destructive: 0 55% 45%;
    --destructive-foreground: 0 0% 95%;
    --border: 0 0% 22%;
    --input: 0 0% 22%;
    --ring: 0 0% 55%;
    --warm-highlight: 0 0% 15%;

    --link: 212 90% 70%;
    --link-visited: 280 55% 75%;

    /* 잔디 - 회색조 (Dark: 밝을수록 활동 많음) */
    --heatmap-l0: 0 0% 18%;
    --heatmap-l1: 0 0% 32%;
    --heatmap-l2: 0 0% 48%;
    --heatmap-l3: 0 0% 66%;
    --heatmap-l4: 0 0% 85%;
  }
```

- [ ] **Step 3: `tailwind.config.ts`의 `colors` 수정**

`primary` 블록에서 50~900 주황 스케일을 전부 지우고, `link` / `link-visited`를 추가한다.

```ts
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        link: "hsl(var(--link))",
        "link-visited": "hsl(var(--link-visited))",
```

주의: `primary-50` ~ `primary-900` 클래스를 쓰는 파일이 남아 있으면 빌드가 아니라 **런타임에 색만 빠진다**(Tailwind는 없는 클래스를 조용히 무시). Step 6에서 grep으로 잡는다.

- [ ] **Step 4: `borderRadius` 전 키를 0으로**

`extend.borderRadius`를 아래로 교체한다. `2xl`/`3xl`은 지금 config에 없어서 Tailwind 기본값(1rem/1.5rem)이 적용되고 있다 — **반드시 함께 덮어써야 `rounded-2xl`, `rounded-3xl`이 각진다.**

```ts
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "9999px",
      },
```

`full`은 남긴다 — 아바타나 원형 요소가 사각형이 되면 깨져 보인다.

- [ ] **Step 5: `boxShadow` 값을 none으로**

키는 남기고 값만 바꾼다. 키를 지우면 `shadow-warm-md`를 쓰는 파일들이 한꺼번에 죽는다.

```ts
      boxShadow: {
        'warm-sm': 'none',
        'warm-md': 'none',
        'warm-lg': 'none',
      },
```

- [ ] **Step 6: 사라진 색 클래스 사용처 확인**

Run:
```bash
grep -rn "primary-[0-9]" app components --include=*.tsx | grep -v "/admin/"
```
Expected: 결과가 나오면 각 사용처를 `text-link` / `text-muted-foreground` / `border-border` 중 의미에 맞는 것으로 바꾼다. `app/page.tsx:99,106`과 `components/tags/TagCloud.tsx:24-29`가 대표적이며, 이 둘은 각각 Task 7과 Task 9에서 어차피 재작성되므로 **여기서는 목록만 기록하고 넘어간다.**

- [ ] **Step 7: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과 (CSS/config 변경이므로 에러 없음)

- [ ] **Step 8: 육안 확인**

`npm run dev` 후 `http://localhost:3000`을 연다.
Expected: 배경이 흰색, 글자가 검정, 모든 카드의 모서리가 각지고 그림자가 사라진 상태. 레이아웃은 아직 카드 그리드 그대로여도 정상이다.

- [ ] **Step 9: 커밋**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "💄 디자인 토큰을 무채색 올드스쿨 팔레트로 교체"
```

---

## Task 2: 폰트 교체와 본문 폭

**Files:**
- Modify: `app/layout.tsx:2,13,106`
- Modify: `app/globals.css:68-76` (base `body` 규칙)
- Modify: `tailwind.config.ts` (`fontFamily`)

**Interfaces:**
- Consumes: Task 1의 토큰
- Produces: CSS 변수 `--font-serif`. Tailwind의 `font-sans`/`font-serif` 둘 다 이 변수를 가리킨다. `<main>`의 최대 폭은 `720px`.

- [ ] **Step 1: `app/layout.tsx`의 폰트 교체**

2행과 13행을 바꾼다.

```ts
// 기존: import { Nunito } from 'next/font/google'
import { Noto_Serif_KR } from 'next/font/google'

// 기존: const nunito = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })
const serif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-serif',
})
```

106행의 `<body className={nunito.className}>`를 아래로 바꾼다.

```tsx
      <body className={serif.variable}>
```

`className`이 아니라 `variable`을 쓰는 이유: `className`은 body에 인라인 `font-family`를 넣는데, Tailwind의 `font-sans` 유틸리티(클래스 셀렉터)가 이를 덮어쓴다. 두 경로가 같은 CSS 변수를 가리켜야 어디서도 폰트가 어긋나지 않는다.

**빌드가 `Unknown subset 'latin'` 또는 유사한 에러를 내면** `subsets` 대신 `preload: false`를 쓴다:

```ts
const serif = Noto_Serif_KR({
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-serif',
})
```

- [ ] **Step 2: `app/globals.css`의 body 규칙에 폰트 지정**

68~76행의 base 레이어를 아래로 교체한다.

```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-serif), Georgia, 'Times New Roman', serif;
    font-size: 1.05rem;
    line-height: 1.9;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  a {
    color: hsl(var(--link));
  }
  a:visited {
    color: hsl(var(--link-visited));
  }
}
```

**스펙 §3.3에서 벗어나는 지점 하나**: 스펙은 `a`에 전역 밑줄을 넣으라고 했지만, `text-decoration`은 자손이 `none`으로 되돌릴 수 없다. `<Link><Button>수정</Button></Link>` 패턴이 어드민 전반에 있어서 전역 밑줄을 넣으면 어드민 버튼이 전부 밑줄 처리된다. 그래서 **색만 전역, 밑줄은 본문(`.markdown a`)과 우리가 직접 고치는 목록 링크에 `underline` 클래스로 개별 부여**한다.

- [ ] **Step 3: `tailwind.config.ts`의 `fontFamily` 교체**

```ts
      fontFamily: {
        sans: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
```

`sans`라는 키 이름을 유지하는 이유: `font-sans`를 쓰는 기존 파일들이 깨지지 않게 하기 위해서다. 이름은 `sans`지만 내용은 명조다.

- [ ] **Step 4: 본문 폭 토큰 추가**

`tailwind.config.ts`의 `extend`에 아래를 추가한다. 720px는 `layout.tsx`·`Header.tsx`·`Footer.tsx` 세 곳에서 쓰이므로 리터럴을 세 번 적지 않는다.

```ts
      maxWidth: {
        content: '720px',
        reading: '680px',
      },
```

`reading`은 Task 8의 글 상세 본문 폭이다. Tailwind에 이미 있는 `max-w-prose`(65ch)와 이름이 겹치지 않게 `reading`을 쓴다.

- [ ] **Step 5: 본문 폭 축소**

`app/layout.tsx:134`의 `<main>`을 바꾼다.

```tsx
              <main className="flex-grow mx-auto w-full max-w-content px-4 py-10 bg-background">
```

`container` 클래스를 뺀다. `tailwind.config.ts`의 `theme.container` 설정 자체는 어드민이 계속 쓰므로 **지우지 않는다.**

- [ ] **Step 6: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과

- [ ] **Step 7: 육안 확인**

`http://localhost:3000`을 새로고침한다.
Expected: 본문이 명조체로 바뀌고 콘텐츠 폭이 720px로 좁아진다. 폰트가 안 바뀌면 브라우저 devtools에서 body의 `font-family` 계산값에 `--font-serif`가 들어갔는지 본다.

- [ ] **Step 8: 커밋**

```bash
git add app/layout.tsx app/globals.css tailwind.config.ts
git commit -m "💄 본문 폰트를 Noto Serif KR로 교체하고 본문 폭 720px로 축소"
```

---

## Task 3: 헤더 · 푸터 · 테마 토글

**Files:**
- Rewrite: `components/layout/Header.tsx` (210줄 → 약 85줄)
- Rewrite: `components/layout/Footer.tsx` (52줄 → 약 30줄)
- Rewrite: `components/common/ThemeToggle.tsx` (47줄 → 약 30줄)

**Interfaces:**
- Consumes: Task 1 토큰, Task 2 폰트
- Produces: `ThemeToggle`은 named export `ThemeToggle`을 그대로 유지한다(`import { ThemeToggle } from '@/components/common/ThemeToggle'`). props 없음. `Header`/`Footer`는 default export 유지.

- [ ] **Step 1: `ThemeToggle` 재작성**

`components/common/ThemeToggle.tsx` 전체를 아래로 교체한다. Radix 드롭다운과 lucide 아이콘을 버리고, 클릭할 때마다 `light → dark → system → light`로 순환하는 텍스트 버튼으로 만든다.

```tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

const LABEL: Record<string, string> = {
  light: '라이트',
  dark: '다크',
  system: '시스템',
}

const NEXT: Record<string, 'light' | 'dark' | 'system'> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(NEXT[theme] ?? 'light')}
      className="text-sm text-foreground hover:text-link"
      aria-label={`테마 변경 (현재: ${LABEL[theme] ?? theme})`}
    >
      [테마: {LABEL[theme] ?? theme}]
    </button>
  )
}
```

- [ ] **Step 2: `ThemeToggle` 동작 확인**

브라우저에서 헤더의 `[테마: ...]`를 세 번 클릭한다.
Expected: 라이트 → 다크 → 시스템 → 라이트로 순환하고, 다크에서 배경이 `#141414`가 된다.

- [ ] **Step 3: `Header` 재작성**

`components/layout/Header.tsx` 전체를 아래로 교체한다. 로고 5회 클릭 이스터에그(`handleLogoClick`)는 원본 로직 그대로 옮긴다.

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRef, useState } from 'react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

const NAV = [
  { href: '/', label: '홈' },
  { href: '/career', label: '프로필' },
  { href: '/projects', label: '놀이터' },
  { href: '/search', label: '검색' },
  { href: '/tags', label: '태그' },
]

function Sep() {
  return <span aria-hidden="true" className="text-border">|</span>
}

export default function Header() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [logoClickCount, setLogoClickCount] = useState(0)
  const lastClickTimeRef = useRef<number>(0)

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isAuthenticated) return

    const now = Date.now()

    if (now - lastClickTimeRef.current < 1000) {
      const newCount = logoClickCount + 1
      setLogoClickCount(newCount)

      if (newCount >= 5) {
        e.preventDefault()
        setLogoClickCount(0)
        router.push('/auth/login')
        return
      }
    } else {
      setLogoClickCount(1)
    }

    lastClickTimeRef.current = now
  }

  return (
    <header className="w-full border-b border-border">
      <div className="mx-auto w-full max-w-content px-4 pt-8 pb-3">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="select-none text-2xl font-bold text-foreground visited:text-foreground hover:text-link"
        >
          다미파파의 블로그
        </Link>

        <nav className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {NAV.map((item, i) => (
            <span key={item.href} className="flex items-center gap-x-2">
              {i > 0 && <Sep />}
              <Link
                href={item.href}
                className="text-foreground visited:text-foreground hover:text-link"
              >
                {item.label}
              </Link>
            </span>
          ))}

          <Sep />
          <a
            href="https://github.com/jeongjaehan/damipapa-blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground visited:text-foreground hover:text-link"
          >
            GitHub
          </a>

          <Sep />
          <ThemeToggle />

          {isAuthenticated && (
            <>
              <Sep />
              {isAdmin ? (
                <>
                  <Link
                    href="/admin/posts/new"
                    className="text-foreground visited:text-foreground hover:text-link"
                  >
                    글쓰기
                  </Link>
                  <Sep />
                  <Link
                    href="/admin"
                    className="text-foreground visited:text-foreground hover:text-link"
                  >
                    관리자
                  </Link>
                </>
              ) : (
                <span className="text-muted-foreground">{user?.name}</span>
              )}
              <Sep />
              <button
                type="button"
                onClick={logout}
                className="text-foreground hover:text-link"
              >
                로그아웃
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
```

바뀐 점: `sticky`/`backdrop-blur`/`shadow` 제거, `🏡` 이모지 제거, 햄버거 메뉴와 모바일 메뉴 블록 삭제(내비가 `flex-wrap`으로 줄바꿈), lucide 아이콘 전부 제거, `Button` 컴포넌트 의존 제거.

- [ ] **Step 4: `Footer` 재작성**

`components/layout/Footer.tsx` 전체를 아래로 교체한다.

```tsx
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full border-t border-border">
      <div className="mx-auto w-full max-w-content px-4 py-6 text-sm text-muted-foreground">
        <p>
          <Link href="/" className="text-muted-foreground visited:text-muted-foreground hover:text-link">홈</Link>
          <span aria-hidden="true" className="mx-2 text-border">|</span>
          <Link href="/search" className="text-muted-foreground visited:text-muted-foreground hover:text-link">검색</Link>
          <span aria-hidden="true" className="mx-2 text-border">|</span>
          <Link href="/tags" className="text-muted-foreground visited:text-muted-foreground hover:text-link">태그</Link>
        </p>
        <p className="mt-2">
          &copy; {currentYear} 다미파파의 블로그 · 100% 바이브 코딩으로 만든 블로그
        </p>
      </div>
    </footer>
  )
}
```

기술 스택 뱃지 3열 그리드와 `rounded-t-3xl`, `bg-muted`는 전부 삭제한다.

- [ ] **Step 5: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과

- [ ] **Step 6: 육안 확인 (데스크톱 + 모바일)**

브라우저 devtools에서 폭을 375px로 줄여본다.
Expected: 내비 링크 6~7개가 두 줄로 자연스럽게 wrap되고, 가로 스크롤이 생기지 않는다. 헤더가 스크롤을 따라오지 않는다.

- [ ] **Step 7: 커밋**

```bash
git add components/layout/Header.tsx components/layout/Footer.tsx components/common/ThemeToggle.tsx
git commit -m "💄 헤더/푸터를 텍스트 내비로 교체하고 모바일 햄버거 메뉴 제거"
```

---

## Task 4: `globals.css` 장식 제거와 `.markdown` 재작성

**Files:**
- Modify: `app/globals.css:248-360` (`.markdown` 블록)
- Delete: `app/globals.css:552-707` (애니메이션 · 장식 블록)
- Delete: `app/globals.css:741-746` (중복 `.markdown p`)

**Interfaces:**
- Consumes: Task 1 토큰
- Produces: `.markdown` 클래스가 명조 본문 스타일을 제공한다. `.animate-fade-up`, `.animate-scale-in`, `.animate-fade-in`, `.animate-float-gentle`, `.animate-counter-roll`, `.animate-shimmer`, `.animate-pulse-scale`, `.dashboard-blob`, `.dashboard-grain`, `.featured-card`, `.magazine-number`은 **더 이상 존재하지 않는다** — Task 6에서 사용처를 제거한다.

- [ ] **Step 1: 삭제 전 사용처 확인**

Run:
```bash
grep -rn "animate-fade-up\|animate-fade-in\|animate-scale-in\|animate-float-gentle\|animate-counter-roll\|animate-shimmer\|animate-pulse-scale\|dashboard-blob\|dashboard-grain\|featured-card\|magazine-number" app components --include=*.tsx
```
Expected: `components/dashboard/BlogDashboard.tsx`와 `components/tags/TagCloud.tsx` 정도만 나온다. 다른 파일이 나오면 목록에 적어두고 Task 6/9에서 함께 정리한다. **CSS를 먼저 지우고 TSX를 나중에 고쳐도 화면이 깨지지 않는다** — 없는 클래스는 무시될 뿐이다.

- [ ] **Step 2: 애니메이션 · 장식 블록 삭제**

`app/globals.css`에서 아래를 전부 지운다.

- `@keyframes fade-up`, `fade-in`, `scale-in`, `float-gentle`, `shimmer`, `counter-roll`, `pulse-scale`
- `.animate-fade-up`, `.animate-fade-in`, `.animate-scale-in`, `.animate-float-gentle`, `.animate-counter-roll`, `.animate-shimmer`, `.animate-pulse-scale`
- `.dashboard-blob` (다크 변형 포함)
- `.dashboard-grain::before` (다크 변형 포함)
- `.featured-card`, `.featured-card::before`, `.featured-card:hover::before`
- `.magazine-number`

**지우면 안 되는 것**: `.code-scroll*`, `.heatmap-scroll*`, `.break-words`, `.break-all`, `.text-balance`, `.prose*`, `.ProseMirror*`(전부), `.pdf-generating*`, input/textarea 관련 블록.

- [ ] **Step 3: `.markdown` 블록 재작성**

기존 `.markdown` 관련 규칙(248~360행)을 아래로 교체한다.

```css
.markdown {
  color: hsl(var(--foreground));
  font-size: 1.05rem;
  line-height: 1.9;
}

.markdown h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 2.5rem 0 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid hsl(var(--border));
}

.markdown h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 2.2rem 0 0.9rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid hsl(var(--border));
}

.markdown h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 1.8rem 0 0.7rem;
}

.markdown p {
  margin: 1.2rem 0;
}

.markdown ul,
.markdown ol {
  margin: 1.2rem 0;
  padding-left: 1.6rem;
}

.markdown ul {
  list-style: disc;
}

.markdown ol {
  list-style: decimal;
}

.markdown li {
  margin: 0.4rem 0;
}

.markdown a {
  color: hsl(var(--link));
  text-decoration: underline;
}

.markdown a:visited {
  color: hsl(var(--link-visited));
}

.markdown blockquote {
  margin: 1.5rem 0;
  padding: 0.2rem 0 0.2rem 1rem;
  border-left: 3px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}

.markdown code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 0;
  padding: 0.1rem 0.3rem;
}

.markdown pre {
  margin: 1.5rem 0;
  padding: 1rem;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 0;
  overflow-x: auto;
}

.markdown pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.88rem;
  line-height: 1.7;
}

.markdown img {
  border: 1px solid hsl(var(--border));
  border-radius: 0;
  margin: 1.5rem 0;
}

.markdown hr {
  margin: 2.5rem 0;
  border: none;
  border-top: 1px solid hsl(var(--border));
}

.markdown table {
  width: 100%;
  margin: 1.5rem 0;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.markdown th,
.markdown td {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem 0.7rem;
  text-align: left;
}

.markdown th {
  background: hsl(var(--muted));
  font-weight: 700;
}

.markdown strong {
  font-weight: 700;
}

.markdown em {
  font-style: italic;
}
```

- [ ] **Step 4: 파일 끝의 중복 `.markdown p` 제거**

파일 맨 아래(741행 부근)에 `/* Markdown 스타일 */`과 함께 `.markdown p { ... }`가 한 번 더 정의되어 있다. 이 중복 블록을 지운다. (뒤에 오는 정의가 이기므로, 남겨두면 Step 3의 `margin`이 조용히 무시된다.)

- [ ] **Step 5: 육안 확인**

글이 있는 상세 페이지(`/posts/<아무 id>`)를 연다.
Expected: 본문이 명조, 코드블록이 각진 회색 박스, 인용문이 좌측 회색 바, 본문 링크에 밑줄. h1/h2 아래에 가로선.

- [ ] **Step 6: 커밋**

```bash
git add app/globals.css
git commit -m "🔥 대시보드 애니메이션·장식 CSS 제거하고 마크다운 본문을 명조 스타일로 교체"
```

---

## Task 5: 글 목록 (`PostCard` · `PostList`)

**Files:**
- Rewrite: `components/post/PostCard.tsx` (51줄 → 약 40줄)
- Modify: `components/post/PostList.tsx:15,27-40`

**Interfaces:**
- Consumes: Task 1~2 토큰/폰트
- Produces: `PostCard`는 `{ post: PostSummary }` props를 그대로 유지하고 default export도 유지한다. 바깥 요소가 `<Link>`가 아니라 `<article>`이 되므로, `PostCard`를 `<Link>`로 감싸는 호출자가 있으면 중첩 링크가 된다 — Step 1에서 확인한다.

- [ ] **Step 1: `PostCard` 호출자 확인**

Run: `grep -rn "PostCard" app components --include="*.tsx"`

`PostCard`를 렌더링하는 곳은 **두 군데**다. 둘 다 이 태스크가 처리한다.

1. `components/post/PostList.tsx:17` — Step 3에서 처리
2. `app/search/page.tsx:82` — **`PostList`를 거치지 않고 자기만의 그리드 래퍼를 갖고 있다** (80행 `<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">`)

`PostCard`가 카드에서 목록 행으로 바뀌면 3열 그리드 안에 행이 들어가 레이아웃이 깨진다. **그리드를 이 태스크에서 함께 고친다** — 뒤 태스크로 미루면 하나의 변경이 두 태스크로 쪼개진다. 80행을 아래로 바꾼다.

```tsx
            <div className="border-t border-border">
```

`app/search/page.tsx`에서 이 한 줄 외에는 아무것도 건드리지 않는다 — 나머지 검색 페이지 정리는 Task 9 소관이다.

`<Link><PostCard/></Link>` 형태로 감싼 곳은 없다(확인됨). 만약 grep이 위 두 곳 외에 다른 파일을 보여주면 보고하고 멈춘다.

- [ ] **Step 2: `PostCard` 재작성**

`components/post/PostCard.tsx` 전체를 아래로 교체한다.

```tsx
import Link from 'next/link'
import { format } from 'date-fns'
import { PostSummary } from '@/types'

interface PostCardProps {
  post: PostSummary
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-border py-5">
      <p className="text-sm text-muted-foreground">
        {format(new Date(post.createdAt), 'yyyy.MM.dd')}
      </p>

      <h2 className="mt-1 text-lg font-bold leading-snug">
        <Link
          href={`/posts/${post.id}`}
          className="text-foreground underline visited:text-link-visited hover:text-link"
        >
          {post.title}
        </Link>
      </h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {post.tags && post.tags.length > 0 && (
          <>
            {post.tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${tag}`}
                className="mr-2 text-muted-foreground visited:text-muted-foreground hover:text-link"
              >
                #{tag}
              </Link>
            ))}
            <span aria-hidden="true" className="mx-1 text-border">·</span>
          </>
        )}
        {post.authorName}
        <span aria-hidden="true" className="mx-1 text-border">·</span>
        조회 {post.viewCount.toLocaleString()}
      </p>
    </article>
  )
}
```

`formatDate`(`utils/date.ts`)를 쓰지 않는 이유: 7일 이내 글을 "3일 전"으로 바꿔주는데, 아카이브 목록에서는 날짜가 고정 포맷이어야 정렬이 눈에 들어온다.

- [ ] **Step 3: `PostList`의 그리드를 목록으로**

참고: `PostList`는 `app/page.tsx:119`와 `app/categories/[slug]/page.tsx:203` 두 곳에서 쓰인다. 여기서 컨테이너를 바꾸면 두 페이지 모두에 자동으로 반영된다 — 그 두 파일은 건드리지 않는다.

`components/post/PostList.tsx:15`를 바꾼다.

```tsx
      <div className="border-t border-border">
```

그리고 27~34행의 스피너 블록을 텍스트로 바꾼다.

```tsx
      {isLoading && (
        <p className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</p>
      )}
```

21~25행의 빈 상태와 36~40행의 "더 이상 포스트가 없습니다"는 아래처럼 단순화한다.

```tsx
      {initialData.content.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">포스트가 없습니다.</p>
      )}
```

```tsx
      {!hasMore && initialData.content.length > 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">더 이상 포스트가 없습니다.</p>
      )}
```

- [ ] **Step 4: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과

- [ ] **Step 5: 육안 확인**

`/?tag=<존재하는 태그>` 또는 `/search`에서 결과 목록을 본다.
Expected: 3열 카드 그리드가 사라지고, 가로선으로 구분된 단일 컬럼 목록이 된다. 제목에 밑줄이 있고 방문한 글은 보라색이 된다.

- [ ] **Step 6: 커밋**

```bash
git add components/post/PostCard.tsx components/post/PostList.tsx app/search/page.tsx
git commit -m "♻️ 글 카드를 목록 행으로 교체"
```

---

## Task 6: 홈 재작성 (`BlogDashboard`)

**Files:**
- Rewrite: `components/dashboard/BlogDashboard.tsx` (398줄 → 약 140줄)

**Interfaces:**
- Consumes: Task 1~2 토큰/폰트. `BlogDashboardData` 타입(`totalPosts`, `totalViews`, `todayVisitors`, `totalVisitors`, `recentPosts`, `popularPosts`)과 `getPosts(page, size, tag?, sort?, date?)` API는 그대로 쓴다.
- Produces: `BlogDashboard`는 `{ data: BlogDashboardData }` props와 default export를 유지한다. 인기 글은 이 컴포넌트에서 **더 이상 렌더링하지 않는다** — Task 7의 `app/page.tsx` 사이드바가 `data.popularPosts`를 직접 받아 그린다.

- [ ] **Step 1: `BlogDashboard.tsx` 전체 교체**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { BlogDashboardData, PostSummary } from '@/types'
import { getPosts } from '@/services/api'

interface BlogDashboardProps {
  data: BlogDashboardData
}

/** 글 목록을 작성연도로 묶는다. 연도는 내림차순, 그룹 안 순서는 입력 순서를 유지한다. */
function groupByYear(posts: PostSummary[]): Array<[string, PostSummary[]]> {
  const groups = new Map<string, PostSummary[]>()
  for (const post of posts) {
    const year = format(new Date(post.createdAt), 'yyyy')
    const bucket = groups.get(year)
    if (bucket) {
      bucket.push(post)
    } else {
      groups.set(year, [post])
    }
  }
  return Array.from(groups.entries()).sort((a, b) => Number(b[0]) - Number(a[0]))
}

function ArchiveRow({ post }: { post: PostSummary }) {
  return (
    <li className="flex gap-3 py-1.5 text-[0.95rem] leading-relaxed">
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {format(new Date(post.createdAt), 'MM.dd')}
      </span>
      <span className="min-w-0">
        <Link
          href={`/posts/${post.id}`}
          className="text-foreground underline visited:text-link-visited hover:text-link"
        >
          {post.title}
        </Link>
        <span className="ml-2 whitespace-nowrap text-sm text-muted-foreground">
          {post.categoryName && (
            <>
              {post.categoryName}
              <span aria-hidden="true" className="mx-1 text-border">·</span>
            </>
          )}
          조회 {post.viewCount.toLocaleString()}
        </span>
      </span>
    </li>
  )
}

const PAGE_SIZE = 10

export default function BlogDashboard({ data }: BlogDashboardProps) {
  const [posts, setPosts] = useState<PostSummary[]>(data.recentPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(data.totalPosts > data.recentPosts.length)

  const loadMore = async () => {
    setLoading(true)
    try {
      // ponytail: 매번 처음부터 다시 받는다. getPosts는 오프셋이 아니라 페이지 단위라,
      // 초기 목록 길이(대시보드 API가 정하는 값)가 PAGE_SIZE의 배수가 아니면
      // 페이지 인덱스 계산이 글을 건너뛴다. 글이 수백 편을 넘어가면 커서 페이징으로 바꿀 것.
      const result = await getPosts(0, posts.length + PAGE_SIZE, undefined, 'recent')
      const existingIds = new Set(posts.map((p) => p.id))
      const newPosts = result.content.filter((p) => !existingIds.has(p.id))
      setPosts([...posts, ...newPosts])
      setHasMore(!result.last)
    } catch (error) {
      console.error('더보기 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const grouped = groupByYear(posts)

  return (
    <div>
      <p className="text-[0.95rem] text-muted-foreground">
        100% 바이브 코딩으로 만든 블로그
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        글 {data.totalPosts.toLocaleString()}편
        <span aria-hidden="true" className="mx-1.5 text-border">·</span>
        조회 {data.totalViews.toLocaleString()}
        <span aria-hidden="true" className="mx-1.5 text-border">·</span>
        오늘 {data.todayVisitors.toLocaleString()}명
        <span aria-hidden="true" className="mx-1.5 text-border">·</span>
        누적 {data.totalVisitors.toLocaleString()}명
      </p>

      {grouped.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">아직 작성된 글이 없습니다.</p>
      ) : (
        <div className="mt-10 space-y-8">
          {grouped.map(([year, yearPosts]) => (
            <section key={year}>
              <h2 className="border-b border-border pb-1 text-base font-bold">{year}</h2>
              <ul className="mt-2">
                {yearPosts.map((post) => (
                  <ArchiveRow key={post.id} post={post} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {hasMore && (
        <p className="mt-8 text-right">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-sm text-link hover:underline disabled:text-muted-foreground"
          >
            {loading ? '불러오는 중...' : '더보기 »'}
          </button>
        </p>
      )}
    </div>
  )
}
```

원본과 달라진 점:

- `getGreeting()`, `StatPill`, `FeaturedPost`, `MagazinePostCard`, `PostRow` 전부 삭제
- 최신 글을 히어로/나머지로 쪼개지 않는다 — 아카이브에서는 첫 글도 그냥 한 줄이다
- `formatDistanceToNow`(상대시간) 대신 `MM.dd` 고정 포맷
- 인기 글 상태(`popularPosts`, `loadMorePopular`)를 이 컴포넌트에서 제거 — 사이드바로 이동
- `lucide-react`, `date-fns/locale`, `Badge` import 전부 제거
- **더보기 방식이 페이지 인덱스 누적 → 전체 재조회로 바뀐다.** 원본은 `getPosts(recentPage, 5, ...)`로 페이지 인덱스를 올렸는데, 이는 초기 목록이 정확히 5개일 때만 맞는다. `getPosts(page, size)`는 오프셋이 아니라 **페이지 단위**라서, 초기 목록 5개 상태에서 `getPosts(1, 10)`을 부르면 11~20번째를 가져와 **6~10번째가 영구히 안 보인다.** 새 코드는 `getPosts(0, posts.length + PAGE_SIZE, ...)`로 매번 처음부터 받고 id로 중복을 걸러 이 결합을 없앤다

- [ ] **Step 2: `hasMore` 초기값 회귀 확인**

원본은 `data.totalPosts > 5`로 하드코딩되어 있었다. 새 코드는 `data.totalPosts > data.recentPosts.length`를 쓴다.
Run: 브라우저에서 홈을 열고, 글 개수가 `recentPosts` 길이보다 많으면 `더보기 »`가 보이는지 확인한다.
Expected: 전체 글이 `recentPosts`에 다 들어오는 경우 버튼이 안 보이고, 더 있으면 보인다.

- [ ] **Step 3: 더보기 경계 확인 (컨트롤러가 수행)**

이 검증은 브라우저가 필요하므로 구현자는 건너뛴다. 컨트롤러가 확인할 것:

1. `더보기 »`를 두 번 눌렀을 때 글이 추가되고 **중복이 생기지 않는다**
2. **초기 목록의 마지막 글 다음 글이 실제로 나타난다** — 즉 6번째 글이 건너뛰어지지 않는다. 이것이 이 태스크에서 가장 틀리기 쉬운 지점이다
3. 마지막 페이지에 도달하면 버튼이 사라진다

- [ ] **Step 4: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과

- [ ] **Step 5: 커밋**

```bash
git add components/dashboard/BlogDashboard.tsx
git commit -m "♻️ 홈 대시보드를 연도별 아카이브 목록으로 재작성"
```

---

## Task 7: 홈 레이아웃과 사이드바 (`app/page.tsx`)

**Files:**
- Modify: `app/page.tsx:13,90-146,150-187`

**Interfaces:**
- Consumes: Task 6의 `BlogDashboard`(인기 글을 더 이상 그리지 않음), `CategoryTree`(Task 9에서 스타일이 바뀌지만 props는 불변)
- Produces: 없음 (페이지 컴포넌트)

- [ ] **Step 1: 인기 글 사이드바 컴포넌트 추가**

`app/page.tsx` 안, `HomeContent` 위에 아래 함수를 추가한다. 별도 파일로 빼지 않는다 — 이 페이지에서만 쓰인다.

```tsx
function PopularList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null

  return (
    <section>
      <h3 className="border-b border-border pb-1 text-sm font-bold">인기 글</h3>
      <ol className="mt-2 space-y-1.5 text-sm">
        {posts.slice(0, 5).map((post, i) => (
          <li key={post.id} className="flex gap-2">
            <span className="shrink-0 tabular-nums text-muted-foreground">{i + 1}.</span>
            <Link
              href={`/posts/${post.id}`}
              className="text-foreground underline visited:text-link-visited hover:text-link"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

파일 상단에 `import Link from 'next/link'`를 추가하고, 13행의 `import { Badge } from '@/components/ui/badge'`는 삭제한다.

- [ ] **Step 2: 태그/날짜 필터 모드 블록 교체**

90~146행(`return (` ~ 해당 블록 끝)을 아래로 교체한다.

```tsx
    return (
      <div>
        <h1 className="text-xl font-bold">
          {filterTitle}
          <span className="ml-2 font-normal text-muted-foreground">{filterBadge}</span>
        </h1>
        <p className="mt-1 text-sm">
          <button
            onClick={() => router.push('/')}
            className="text-link hover:underline"
          >
            « 홈으로 돌아가기
          </button>
        </p>

        <div className="mt-8">
          {tagLoading ? (
            <Loading />
          ) : tagPosts.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            <PostList
              initialData={{
                content: tagPosts,
                page: currentPage,
                totalPages: 0,
                last: !hasMore
              } as PageResponse<PostSummary>}
              isLoading={false}
              hasMore={hasMore}
            />
          )}
        </div>

        <aside className="mt-12 border-t border-border pt-6">
          {categoryData && (
            <CategoryTree
              categories={categoryData.categories}
              uncategorizedCount={categoryData.uncategorizedCount}
              showPrivate={isAdmin}
            />
          )}
        </aside>
      </div>
    )
```

`max-w-7xl`, `lg:flex-row`, `lg:w-72`, `sticky top-24`, `rounded-2xl`, `bg-card`, `shadow-sm`이 전부 사라졌다. 본문 폭은 이미 `app/layout.tsx`의 `<main>`이 720px로 잡는다.

- [ ] **Step 3: 기본 대시보드 모드 블록 교체**

150~187행을 아래로 교체한다.

```tsx
  return (
    <div>
      <h1 className="text-lg font-bold">다미파파의 블로그</h1>

      {dashboardData && <BlogDashboard data={dashboardData} />}

      <aside className="mt-14 border-t border-border pt-6 space-y-8">
        {dashboardData && <PopularList posts={dashboardData.popularPosts} />}

        {categoryData && (
          <CategoryTree
            categories={categoryData.categories}
            uncategorizedCount={categoryData.uncategorizedCount}
            showPrivate={isAdmin}
          />
        )}
      </aside>

      <section className="mt-12 border-t border-border pt-6">
        <h2 className="text-base font-bold">포스팅 잔디</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">글을 쓴 날만큼 잔디가 자라요</p>
        <div className="mt-4">
          <PostingHeatmap isAdmin={isAdmin} />
        </div>
      </section>
    </div>
  )
```

**스펙 §5.2에서 벗어나는 지점**: 스펙은 데스크톱에서 좌우 2단(본문 + 우측 사이드바)을 유지한다고 했지만, `<main>` 폭이 720px로 좁아진 상태에서 2단을 만들면 본문이 450px대로 눌려 오히려 읽기 나빠진다. **사이드바를 본문 아래로 내려 단일 컬럼으로 통일한다.** 모바일과 데스크톱이 같은 구조가 되어 반응형 분기도 사라진다.

**`<h1>`은 반드시 있어야 한다.** 구 대시보드는 시간대별 인사말("안녕하세요")을 `<h1>`으로 갖고 있었는데 Task 6이 이를 제거했다. 지금 홈은 `<h1>` 없이 `<h2>` 연도 제목부터 시작하는 상태다 — 사이트에서 가장 많이 방문하는 페이지에 최상위 제목이 없는 것이고, 제목 레벨도 건너뛴다. 위 코드의 `<h1 className="text-lg font-bold">다미파파의 블로그</h1>`가 이를 메운다.

헤더에도 같은 문구가 있어 시각적으로 한 번 반복되지만, 이는 2000년대 블로그에서 흔한 형태(배너 + 페이지 머리글)이고, 헤더 쪽을 `<h1>`으로 바꾸는 대안은 글 상세 페이지에서 글 제목 `<h1>`과 충돌한다. **필터 모드 분기에는 이미 `<h1>`이 있으므로(96행) 그쪽은 건드리지 않는다.**

- [ ] **Step 4: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과. `PostSummary`가 이미 4행에서 import되어 있으므로 `PopularList`의 타입은 해결된다.

- [ ] **Step 5: 육안 확인**

`http://localhost:3000` (라이트/다크 각각), 그리고 `/?tag=<존재하는 태그>`.
Expected: 홈이 연도별 목록 → 인기 글 → 카테고리 → 잔디 순서의 단일 컬럼. 카드/그림자/둥근 모서리 없음.

- [ ] **Step 6: 커밋**

```bash
git add app/page.tsx
git commit -m "♻️ 홈을 단일 컬럼으로 정리하고 인기 글을 하단 목록으로 이동"
```

---

## Task 8: 글 상세 (`PostDetail` · `PostShare` · `PostReactions`)

**Files:**
- Modify: `components/post/PostDetail.tsx:11-14,85-172,218`
- Modify: `components/post/PostShare.tsx` (아이콘 → 텍스트)
- Modify: `components/post/PostReactions.tsx` (아이콘 → 텍스트)
- Modify: `app/posts/[id]/page-client.tsx` (본문 폭)

**Interfaces:**
- Consumes: Task 4의 `.markdown` 스타일
- Produces: 없음. 모든 컴포넌트의 props와 export는 불변이다.

- [ ] **Step 1: `PostDetail`의 import 정리**

11~14행에서 아래를 삭제한다.

```ts
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Calendar, Edit, Trash2, EyeOff, Folder, Clock } from 'lucide-react'
```

`Button`은 어드민 액션(수정/삭제)에서 계속 쓰므로 남긴다.

- [ ] **Step 2: `PostDetail`의 헤더와 컨테이너 교체**

85행 `<div className="bg-card rounded-2xl ...">`부터 172행 `<div className="px-4 sm:px-8 py-8 sm:py-12">`까지를 아래로 교체한다. (`handleDelete`, `YoutubeEmbed`, `ReactMarkdown` 블록은 건드리지 않는다.)

```tsx
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          {post.author.name}
          <span aria-hidden="true" className="mx-1.5 text-border">·</span>
          {formatFullDate(post.createdAt)}
          <span aria-hidden="true" className="mx-1.5 text-border">·</span>
          조회 {post.viewCount.toLocaleString()}
          <span aria-hidden="true" className="mx-1.5 text-border">·</span>
          {formatReadingTime(readingTime)}
          {post.category && (
            <>
              <span aria-hidden="true" className="mx-1.5 text-border">·</span>
              <Link
                href={`/categories/${post.category.slug}`}
                className="text-muted-foreground underline visited:text-muted-foreground hover:text-link"
              >
                {post.category.name}
              </Link>
            </>
          )}
        </p>

        {(post.isPrivate && isAdmin) || post.createdAt !== post.updatedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {post.isPrivate && isAdmin && <span className="text-destructive">[비공개]</span>}
            {post.createdAt !== post.updatedAt && (
              <span className="ml-1">(수정됨: {formatFullDate(post.updatedAt)})</span>
            )}
          </p>
        ) : null}

        {post.tags && post.tags.length > 0 && (
          <p className="mt-2 text-sm">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${tag}`}
                className="mr-2 text-muted-foreground visited:text-muted-foreground hover:text-link"
              >
                #{tag}
              </Link>
            ))}
          </p>
        )}

        {isAdmin && (
          <p className="mt-4 flex gap-2 text-sm">
            <Link href={`/admin/posts/edit/${post.id}`}>
              <Button size="sm" variant="outline">수정</Button>
            </Link>
            <Button size="sm" variant="destructive" onClick={handleDelete}>삭제</Button>
          </p>
        )}
      </header>

      <div className="py-8">
```

**태그 균형 — 이 편집에서 가장 틀리기 쉬운 부분이다. 아래를 정확히 따른다.**

현재 구조는 이렇다.

```
85    <article className="max-w-4xl mx-auto">
86      <div className="bg-card rounded-2xl shadow-warm-sm border border-border overflow-hidden">
87        <header ...>   … 168  </header>
170       <Separator />
172       <div className="px-4 sm:px-8 py-8 sm:py-12">
173         <div className="markdown prose prose-lg"> … 255 </div>
258         <PostShare … />
261         <PostReactions … />
262       </div>
263     </div>      ← 86행 래퍼의 짝
264   </article>
```

해야 할 일:

1. 85행을 `    <article>`로 바꾼다 (`max-w-4xl mx-auto` 제거 — 폭은 `page-client.tsx`가 잡는다)
2. **86행 `<div className="bg-card ...">`를 삭제하고, 짝인 263행 `</div>`도 삭제한다**
3. 87~168행의 `<header>` 블록 내용을 위 새 코드로 교체한다
4. **170행 `<Separator />`를 삭제한다** — 새 `<header>`가 `border-b`로 구분선을 직접 그린다
5. 172행 `<div className="px-4 sm:px-8 py-8 sm:py-12">`를 `<div className="py-8">`로 바꾼다 (짝인 262행 `</div>`는 그대로 둔다)

`ReactMarkdown` 블록(173~255행)과 `YoutubeEmbed`, `handleDelete`는 **한 글자도 건드리지 않는다.**

편집 후 `npx tsc --noEmit`이 통과하면 태그 균형이 맞은 것이다. JSX 태그가 어긋나면 타입 체크가 반드시 실패한다.

- [ ] **Step 3: 마크다운 이미지의 둥근 모서리 제거**

218행의 `className="max-w-full h-auto rounded-lg shadow-sm my-4"`를 아래로 바꾼다.

```tsx
                      className="max-w-full h-auto border border-border my-4"
```

- [ ] **Step 4: 본문 폭 조정**

`app/posts/[id]/page-client.tsx`에서 상세 본문을 감싸는 래퍼에 `max-w-reading mx-auto`를 준다(Task 2에서 `tailwind.config.ts`에 추가한 `maxWidth.reading = 680px` 토큰). 이미 `max-w-*` 클래스가 있으면 그 값을 `max-w-reading`으로 바꾼다.

- [ ] **Step 5: `PostShare` 아이콘 제거**

`components/post/PostShare.tsx`에서 `import { Facebook, Linkedin, Link2, Check } from 'lucide-react'`를 삭제하고, JSX의 각 아이콘을 지운 뒤 버튼 라벨을 텍스트로 만든다: `페이스북`, `링크드인`, `링크 복사`(복사 완료 시 `복사됨`). 버튼 컨테이너의 `rounded-*`, `shadow-*` 클래스도 제거한다.

- [ ] **Step 6: `PostReactions` 아이콘 제거**

`components/post/PostReactions.tsx`에서 `import { ThumbsUp, ThumbsDown } from 'lucide-react'`를 삭제하고, 아이콘 자리를 텍스트로 바꾼다: `좋아요 {count}`, `싫어요 {count}`.

- [ ] **Step 7: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과. 실패하면 대부분 Step 2의 태그 짝이 안 맞는 경우다 — 닫는 `</div>` 개수를 확인한다.

- [ ] **Step 8: 육안 확인**

글 상세 페이지를 라이트/다크로 각각 연다. 코드블록·표·이미지·인용문이 들어간 글로 확인한다.
Expected: 카드 컨테이너와 그라디언트 헤더가 사라지고, 제목 → 메타 한 줄 → 가로선 → 본문 순서. 관리자 로그인 상태에서 수정/삭제 버튼이 여전히 동작한다.

- [ ] **Step 9: 커밋**

```bash
git add components/post/PostDetail.tsx components/post/PostShare.tsx components/post/PostReactions.tsx "app/posts/[id]/page-client.tsx"
git commit -m "♻️ 글 상세를 카드 없는 텍스트 레이아웃으로 교체"
```

---

## Task 9: 카테고리 트리 · 태그 · 검색

**Files:**
- Modify: `components/category/CategoryTree.tsx:6,22-102,112-155`
- Rewrite: `components/tags/TagCloud.tsx` (128줄 → 약 45줄)
- Modify: `app/tags/page.tsx`, `app/categories/page.tsx`, `app/categories/[slug]/page.tsx`, `app/search/page.tsx`

**Interfaces:**
- Consumes: Task 1 토큰
- Produces: `TagCloud`의 props(`{ tags: TagMetric[], className?: string }`)와 default export는 불변이다. `CategoryTree`의 props(`categories`, `uncategorizedCount`, `selectedSlug?`, `showPrivate?`)도 불변이다.

- [ ] **Step 1: `CategoryTree` 아이콘 제거**

6행의 lucide import를 삭제하고, `CategoryNode`의 아이콘 자리를 텍스트로 바꾼다.

- 펼치기/접기 버튼: `<ChevronDown/>` → `−`, `<ChevronRight/>` → `+` (자식이 없으면 지금처럼 빈 자리)
- 폴더/파일 아이콘: 전부 삭제 (들여쓰기만으로 계층이 보인다)
- `<Lock/>`(비공개 표시): `🔒` 대신 텍스트 `[비공개]`, `text-xs text-destructive`

행 컨테이너의 클래스도 바꾼다.

```tsx
        className={`
          flex items-center gap-2 py-1 text-sm
          ${isSelected ? 'font-bold text-foreground' : 'text-foreground'}
        `}
```

`rounded-xl`, `hover:bg-muted`, `bg-primary/10`, `transition-all`을 제거한다. 선택 상태는 배경색이 아니라 **굵기**로 표시한다.

- [ ] **Step 2: `CategoryTree` 헤더와 미분류 섹션 정리**

114행 헤더를 `<h3 className="border-b border-border pb-1 text-sm font-bold">카테고리</h3>`로 바꾸고, `uppercase tracking-wider px-3`을 제거한다. 미분류 링크(137~152행)에서도 `rounded-xl`, `bg-primary/10`, `transition-all`, `<Folder/>`를 제거한다.

- [ ] **Step 3: `TagCloud` 전체 교체**

`components/tags/TagCloud.tsx` 전체를 아래로 교체한다. `framer-motion`은 이 파일이 프로젝트 내 유일한 사용처다.

```tsx
'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TagMetric } from '@/lib/tags/metrics'

interface TagCloudProps {
  tags: TagMetric[]
  className?: string
}

export default function TagCloud({ tags, className }: TagCloudProps) {
  if (!tags.length) {
    return null
  }

  return (
    <ul className={cn('divide-y divide-border border-y border-border', className)}>
      {tags.map((tag) => (
        <li key={tag.name} className="flex items-baseline gap-2 py-2 text-sm">
          <Link
            href={`/?tag=${tag.name}`}
            className={cn(
              'text-foreground underline visited:text-link-visited hover:text-link',
              tag.level >= 4 && 'font-bold'
            )}
          >
            #{tag.name}
          </Link>
          <span className="text-muted-foreground">
            {tag.count}편
            <span aria-hidden="true" className="mx-1 text-border">·</span>
            {tag.ratio.toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  )
}
```

크기 가변(`sizeClasses`)과 색상 배정(`colorClasses`)은 버린다 — `colorClasses`는 Task 1에서 지운 `primary-50`~`primary-900`을 참조하고 있어 어차피 죽은 코드다. 강조는 `level >= 4`일 때 굵게만 한다. `hashString`/`seededRandom`/`createFloatingConfig`도 함께 삭제한다.

- [ ] **Step 4: `framer-motion` 잔존 확인**

Run: `grep -rn "framer-motion" app components`
Expected: 결과 없음.

`package.json`에서 의존성을 지울지는 이번 계획 범위 밖이다 — 제거는 별도 커밋으로 남겨둔다.

- [ ] **Step 5: 나머지 페이지의 카드 래퍼 제거**

아래는 실제 파일을 스캔해 확정한 목록이다. 여기 없는 줄은 건드리지 않는다.

**`app/tags/page.tsx`** — 세 개의 `<section>` 래퍼

| 행 | 현재 | 바꿀 것 |
|---|---|---|
| 66 | `rounded-2xl border border-border bg-card/80 p-6 shadow-warm-sm backdrop-blur` | `border-t border-border pt-6` |
| 82 | 동일 | `border-t border-border pt-6` |
| 104 | `rounded-2xl border border-border bg-gradient-to-br from-warm-highlight via-card to-accent p-6 shadow-warm-sm` | `border-t border-border pt-6` — **그라디언트 배경 제거가 핵심** |

**`app/categories/page.tsx`**

| 행 | 현재 | 바꿀 것 |
|---|---|---|
| 8 | `import { Folder } from 'lucide-react'` | import 삭제, `<Folder/>` 사용처는 제거 |
| 51 | `bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm` | `border-t border-border pt-6` — **하드코딩된 `bg-white`/`gray-*`를 쓰고 있어 새 팔레트와 어긋난다. 라이트에서 흰 배경 위 흰 카드라 경계가 사라진다** |

**`app/categories/[slug]/page.tsx`**

| 행 | 현재 | 바꿀 것 |
|---|---|---|
| 27 | `import { ChevronRight, Folder, Home, Lock } from 'lucide-react'` | import 삭제. `ChevronRight`(브레드크럼 구분자)는 `/` 텍스트로, `Home`은 `홈` 텍스트로, `Folder`는 삭제, `Lock`은 `[비공개]` 텍스트로 |
| 126, 151 | `max-w-7xl mx-auto` | 제거 (`<main>`이 폭을 잡는다) |
| 128 | `bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center max-w-md` | `border border-destructive p-4 text-center` |
| 138 | `px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200` | `text-link hover:underline` (텍스트 링크로) |
| 222 | `sticky top-24 bg-card rounded-2xl border border-border p-4 shadow-warm-sm` | `border-t border-border pt-6` — `sticky`도 제거 |

**`app/search/page.tsx`** — 80행 그리드 래퍼는 **Task 5가 이미 처리했다.** 남은 것은 두 줄뿐이다.

| 행 | 현재 | 바꿀 것 |
|---|---|---|
| 60 | `flex-1 px-4 py-3 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground` | `flex-1 px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground` |
| 64 | `px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-200` | `px-4 py-2 border border-border hover:bg-muted` |

- [ ] **Step 6: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과

- [ ] **Step 7: 육안 확인**

`/tags`, `/categories`, `/categories/<slug>`, `/search`를 라이트/다크로 각각 연다.
Expected: 떠다니는 태그 클라우드가 사라지고 `#태그 12편 · 3.4%` 목록이 된다. 카테고리 트리가 `+`/`−` 들여쓰기 목록이 된다.

- [ ] **Step 8: 커밋**

```bash
git add components/category/CategoryTree.tsx components/tags/TagCloud.tsx app/tags app/categories app/search
git commit -m "♻️ 태그 클라우드와 카테고리 트리를 텍스트 목록으로 교체"
```

---

## Task 10: 커리어 · 프로젝트 · 공통 컴포넌트

**Files:**
- Modify: `app/career/page.tsx`, `components/career/CareerTimeline.tsx`
- Modify: `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `components/projects/{ProjectCard,ProjectGrid,ProjectDetail,AppStoreLinks}.tsx`
- Rewrite: `components/common/Loading.tsx`
- Modify: `components/common/Pagination.tsx:35-39,54,64`

**Interfaces:**
- Consumes: Task 1 토큰
- Produces: `Loading`은 default export와 props 없음을 유지한다. `Pagination`의 props(`{ currentPage, totalPages }`)도 불변이다.

- [ ] **Step 1: `Loading` 재작성**

```tsx
export default function Loading() {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</p>
  )
}
```

- [ ] **Step 2: `Pagination` 텍스트화**

35~39행의 페이지 번호 버튼 클래스를 바꾼다.

```tsx
          className={`px-2 py-1 ${
            currentPage === i
              ? 'font-bold text-foreground'
              : 'text-link hover:underline'
          }`}
```

54행과 64행의 이전/다음 버튼 클래스를 바꾸고, 라벨을 `« 이전` / `다음 »`으로 바꾼다.

```tsx
        className="px-2 py-1 text-link hover:underline disabled:text-muted-foreground disabled:no-underline"
```

- [ ] **Step 3: 커리어 페이지 정리**

`components/career/CareerTimeline.tsx`(260줄)에서:

- lucide import와 모든 아이콘 JSX 삭제
- **`accentColors` 배열(56~64행)과 그 사용처를 전부 삭제한다.** 인덱스별로 점·뱃지·그라디언트 색을 돌려쓰는 장식 테이블이고, 61행 항목의 `text-primary-700`은 Task 1이 팔레트를 지워 이미 죽은 클래스다. **이 태스크가 그 유일한 소유자다.** 함께 지울 사용처 3곳:
  - 90행 `<div className={\`h-1 w-full bg-gradient-to-r ${colors.gradient}\`} />` — 카드 상단 그라디언트 바
  - 98행 아이콘 컨테이너의 `bg-gradient-to-br ${colors.gradient}`, `rounded-2xl`, `shadow-md`
  - 127행 뱃지의 `${colors.badge}`, `rounded-full`

  `const colors = accentColors[index % accentColors.length]`(74행 부근)도 함께 지운다. 뱃지는 색 대신 대괄호 텍스트(`[재직중]` 등)로 표현한다.
- 타임라인의 세로선·점(`absolute`, `rounded-full`, `bg-primary` 등 장식 요소) 삭제
- 각 경력 항목을 `<section>` + `<h3>회사명</h3>` + `<p className="text-sm text-muted-foreground">기간 · 직무</p>` + 설명 목록 구조로 단순화
- `rounded-*`, `shadow-*`, `bg-card`, `hover:scale-*`, `transition-*` 제거

`app/career/page.tsx`에서도 같은 클래스 패턴과 lucide import를 제거한다.

- [ ] **Step 4: 프로젝트 페이지 정리**

**중요 — 계획의 원래 가정이 틀렸다.** 실제 코드를 보니 `/projects`("놀이터")는 글 목록이 아니라 **앱 아이콘 런처**다. `ProjectGrid.tsx:28`은 3~6열 아이콘 격자이고 `ProjectCard.tsx`는 iOS 홈화면풍 아이콘 타일(둥근 사각 아이콘 + 배지 + 이름)을 그린다. 이걸 텍스트 목록으로 바꾸면 페이지의 존재 이유가 사라진다.

**결정: 격자 구조는 유지하고 장식만 벗긴다.** 테트리스 게임을 그대로 두기로 한 것과 같은 판단이다 — 놀이터는 산문이 아니라 도구다. 아이콘은 각진 사각형이 되고, 그림자·확대·페이드는 사라진다.

| 파일:행 | 현재 | 바꿀 것 |
|---|---|---|
| `ProjectGrid.tsx:28` | `grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto` | **격자 유지.** `max-w-6xl mx-auto`만 제거하고 열 수를 `grid-cols-3 sm:grid-cols-4 gap-4`로 줄인다(본문 폭이 720px이므로 6열은 안 들어간다) |
| `ProjectCard.tsx:18` | `rounded-2xl hover:bg-muted/50 transition-all duration-200` | `rounded-2xl`·`transition-all duration-200` 제거, `hover:bg-muted` 유지 |
| `ProjectCard.tsx:22` | `rounded-2xl shadow-lg ... group-hover:scale-105 transition-transform duration-200` | `rounded-2xl`·`shadow-lg`·`group-hover:scale-105`·`transition-transform duration-200` 제거 |
| `ProjectCard.tsx:32` | `rounded-2xl object-cover` | `object-cover` |
| `ProjectCard.tsx:43` | `rounded-full border-2 border-white shadow-sm` | `border border-border` |
| `ProjectCard.tsx:65` | `opacity-0 group-hover:opacity-100 transition-opacity duration-200` | **항상 보이게** — `opacity-0` 계열 전부 제거. 호버로만 드러나는 정보는 올드스쿨이 아니고 터치 기기에서 접근 불가다 |
| `ProjectCard.tsx:67` | `rounded-full ... shadow-sm` | `border border-border` |
| `ProjectDetail.tsx:8` | `import { Calendar, Tag, Code, Layers } from 'lucide-react'` | import 삭제, 아이콘 자리는 텍스트 라벨(`작성일`, `태그`, `기술`, `구성`) |
| `ProjectDetail.tsx:63` | `bg-muted rounded-lg p-3 sm:p-4` | `bg-muted border border-border p-4` |
| `ProjectDetail.tsx:101,111` | `rounded-2xl sm:rounded-3xl shadow-lg` | `rounded-*`·`shadow-lg` 제거 |
| `AppStoreLinks.tsx:4` | `import { ExternalLink, Smartphone, Globe, Github } from 'lucide-react'` | import 삭제. 링크를 텍스트로: `[App Store]`, `[Google Play]`, `[웹사이트]`, `[GitHub]` |
| `AppStoreLinks.tsx:62,86` | `bg-black rounded-md` / `bg-green-500 rounded-md` (아이콘 배경) | 요소 자체 삭제 — 텍스트 링크로 대체되므로 불필요 |
| `app/projects/page.tsx:22` | `max-w-7xl mx-auto px-4 py-8` | `max-w-7xl mx-auto` 제거 |
| `app/projects/page.tsx:45,46` | `bg-primary/10 rounded-full` + `w-2 h-2 bg-primary rounded-full` (상태 표시 점) | 점 삭제, 텍스트만 남김 |
| `app/projects/[slug]/page.tsx:6` | `import { ArrowLeft } from 'lucide-react'` | import 삭제, `« 목록으로` 텍스트 링크 |
| `app/projects/[slug]/page.tsx:50` | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8` | `max-w-7xl mx-auto`와 반응형 패딩 제거 |
| `app/career/page.tsx:10` | `import { Settings } from 'lucide-react'` | import 삭제, 사용처는 `[설정]` 텍스트 |
| `app/career/page.tsx:40` | `rounded-2xl border border-border bg-card p-8 text-center` | `border border-border p-6 text-center` |

`components/projects/MermaidDiagram.tsx`는 **Step 4b의 로딩 표시 한 곳 외에는 건드리지 않는다** — 다이어그램 렌더링 로직은 범위 밖이다.

- [ ] **Step 4b: Tailwind 내장 애니메이션 제거**

Task 4가 지운 것은 `globals.css`의 커스텀 애니메이션뿐이다. `animate-pulse`/`animate-spin`은 **Tailwind 내장 클래스라 CSS 삭제로는 사라지지 않는다.** 공개 페이지에 남은 것 중 이 태스크가 소유하는 세 곳:

| 위치 | 현재 | 바꿀 것 |
|---|---|---|
| `components/career/CareerTimeline.tsx:110` | `w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse` (재직중 표시 점) | 점 전체 삭제. 재직 여부는 텍스트 `(재직중)`으로 |
| `components/projects/MermaidDiagram.tsx:96` | `animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600` | `불러오는 중...` 텍스트로 교체. **이 파일에서 이 로딩 표시 외에는 아무것도 건드리지 않는다** — 다이어그램 렌더링 로직은 범위 밖이다 |
| `components/common/OptimizedImage.tsx:73` | `absolute inset-0 bg-gray-200 animate-pulse rounded` | `absolute inset-0 bg-muted`. `bg-gray-200`은 하드코딩된 밝은 회색이라 **다크모드에서 흰 사각형으로 뜨는 기존 버그**이기도 하다 |

`components/common/ImageViewerModal.tsx:89`의 스피너는 **건드리지 않는다** — 검은 오버레이 위의 모달 로딩 표시이고 어드민과 공유한다.

- [ ] **Step 5: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과

- [ ] **Step 6: 육안 확인**

`/career`, `/projects`, `/projects/<slug>`를 라이트/다크로 각각 연다.
Expected: 카드 그리드와 타임라인 장식이 사라지고 텍스트 목록이 된다.

- [ ] **Step 7: 커밋**

```bash
git add app/career app/projects components/career components/projects components/common/Loading.tsx components/common/Pagination.tsx
git commit -m "♻️ 커리어·프로젝트·공통 컴포넌트를 텍스트 스타일로 교체"
```

---

## Task 11: 잔디 히트맵 각지게

**Files:**
- Modify: `components/dashboard/PostingHeatmap/HeatmapCell.tsx:36,40`
- Modify: `components/dashboard/PostingHeatmap/Legend.tsx:22,31`
- Modify: `components/dashboard/PostingHeatmap/index.tsx` (컨테이너 클래스만)
- Modify: `components/dashboard/PostingHeatmap/YearSelector.tsx` (버튼 스타일)

**Interfaces:**
- Consumes: Task 1의 `--heatmap-l0`~`l4` 회색조 토큰
- Produces: 없음. 데이터 계산·툴팁·키보드 접근성 로직은 전부 그대로다.

- [ ] **Step 1: 셀 모서리와 호버 효과 정리**

`HeatmapCell.tsx:36`의 `baseClass`에서 `rounded-[2px]`와 `transition-transform duration-100`을 뺀다.

```tsx
  const baseClass = 'h-[11px] w-[11px]'
```

40행의 `focusClass`에서 확대(`hover:scale`, `focus-visible:scale`)를 빼고 링만 남긴다. **`focus-visible` 링은 지우지 않는다** — 키보드 접근성이다.

```tsx
  const focusClass = hoverable
    ? 'hover:ring-1 hover:ring-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/60 focus-visible:outline-none'
    : ''
```

- [ ] **Step 2: 범례 정리**

`Legend.tsx:31`에서 `rounded-[2px]`를 뺀다. 22행의 `Less`/`More`는 `적음`/`많음`으로 바꾼다(사이트가 한글이므로).

- [ ] **Step 3: 컨테이너와 연도 선택기 정리**

실제 확인한 대상은 아래 네 곳뿐이다. `components/ui/segmented-control.tsx`는 히트맵에서 **쓰이지 않으므로** 건드리지 않는다.

| 위치 | 현재 | 바꿀 것 |
|---|---|---|
| `YearSelector.tsx:32` | `rounded-md px-3 py-1.5 text-left transition-colors` | `rounded-md`와 `transition-colors` 제거. 선택된 연도는 `font-bold`, 나머지는 `text-link hover:underline` |
| `index.tsx:143` | `rounded-md bg-destructive/10 px-3 py-2 ...` (에러 박스) | `rounded-md` 제거, `border border-destructive`로 교체 |
| `index.tsx:158` | `h-[120px] animate-pulse rounded-md bg-muted/50` (로딩 스켈레톤) | **`animate-pulse` 제거** — Tailwind 내장 애니메이션이라 Task 4의 CSS 삭제로는 안 사라진다. `h-[120px] bg-muted` 정적 블록으로 |
| `index.tsx:163` | `rounded-md bg-card/70 backdrop-blur-[1px]` (오버레이) | `rounded-md`와 `backdrop-blur-[1px]` 제거, `bg-background/80`으로 |

- [ ] **Step 4: 타입·린트 확인**

Run: `npx tsc --noEmit && npm run lint`
Expected: 통과

- [ ] **Step 5: 육안 확인 (기능 회귀 포함)**

홈 하단의 잔디에서:
1. 라이트 모드: 활동이 많은 날일수록 **짙은** 회색인지
2. 다크 모드: 활동이 많은 날일수록 **밝은** 회색인지
3. 셀에 마우스를 올리면 툴팁이 뜨는지
4. Tab 키로 셀에 포커스가 가고 링이 보이는지
5. 글이 있는 날 셀을 클릭하면 `/?date=YYYY-MM-DD`로 이동하는지
6. 375px 폭에서 가로 스크롤이 잔디 안에서만 일어나고 페이지 전체가 밀리지 않는지

Expected: 6개 모두 통과.

- [ ] **Step 6: 커밋**

```bash
git add components/dashboard/PostingHeatmap
git commit -m "💄 잔디 히트맵을 각진 회색조로 교체"
```

---

## Task 12: 최종 검증과 잔여 정리

**Files:**
- Modify: 앞선 태스크에서 놓친 파일들

**Interfaces:**
- Consumes: Task 1~11 전부
- Produces: 없음

- [ ] **Step 1: 공개 페이지의 lucide 잔존 확인**

Run:
```bash
grep -rln "lucide-react" app components | grep -v "/admin/"
```
Expected: 아래 다섯 개만 남는다. 전부 의도된 예외다.
```
app/auth/login/page.tsx          숨겨진 로그인 페이지 (로고 5회 클릭으로만 도달)
components/common/ImageViewerModal.tsx   어드민과 공유
components/common/OptimizedImage.tsx     어드민과 공유
components/ui/dropdown-menu.tsx          어드민 전용 (Task 3에서 ThemeToggle이 의존을 끊었다)
components/ui/segmented-control.tsx      어드민과 공유
```
다른 파일이 나오면 해당 태스크로 돌아가 아이콘을 텍스트로 바꾼다. `app/game/tetris/**`와 `components/game/**`는 grep 범위에서 제외한다 — 계획 범위 밖이다.

- [ ] **Step 2: 죽은 색 클래스 확인**

Run:
```bash
grep -rn "primary-[0-9]\|warm-highlight\|shadow-warm" app components --include=*.tsx | grep -v "/admin/"
```
Expected: 결과 없음. 남아 있으면 제거한다(Tailwind가 조용히 무시하므로 화면은 멀쩡하지만 죽은 코드다).

- [ ] **Step 2b: 로그인 페이지 포커스 링 복구**

Task 1의 grep이 찾아낸 잔여 항목이다. `app/auth/login/page.tsx:59,74`의 입력창 클래스에서:

- `focus:ring-primary-500` → `focus:ring-ring`
- `border-stone-300` → `border-border`
- `rounded-lg` → 제거

이 페이지는 로고 5회 클릭으로만 도달하는 숨겨진 페이지라 계획 범위 밖이었지만, `primary-500` 팔레트가 사라져 **포커스 링이 무색이 된다**. 접근성 요소이므로 복구한다. 이 세 줄 외에는 건드리지 않는다.

- [ ] **Step 3: 둥근 모서리 잔존 확인**

Run:
```bash
grep -rn "rounded-full" app components --include="*.tsx" | grep -v "/admin/" | grep -v "/game/"
```
Expected: 아바타 등 의도적으로 원형인 것만 남는다. 태그 pill이나 버튼에 남아 있으면 제거한다.

- [ ] **Step 3b: Tailwind 내장 애니메이션 잔존 확인**

Run:
```bash
grep -rn "animate-pulse\|animate-spin\|animate-bounce" app components --include="*.tsx" | grep -v "/admin/" | grep -v "/game/"
```
Expected: `components/common/ImageViewerModal.tsx:89` 하나만 남는다 (검은 오버레이 위 모달 스피너, 어드민 공유 — 의도된 예외). 다른 것이 나오면 Task 5·10·11 중 해당 태스크가 놓친 것이다.

- [ ] **Step 4: 프로덕션 빌드**

Run: `npm run build`
Expected: 통과. 실패하면 에러 메시지의 파일을 고치고 다시 돌린다.

- [ ] **Step 5: 폰트 전송량 확인**

빌드 후 개발 서버가 아닌 `npm run start`로 띄우고, 브라우저 Network 탭에서 폰트 파일 총 전송량을 잰다.
Expected: 기준선은 **300KB 이하**. 이를 크게 넘으면 스펙 §10의 후퇴 방안을 실행한다 — `tailwind.config.ts`의 `fontFamily.sans`를 시스템 산세리프 스택으로 되돌리고 `fontFamily.serif`만 Noto Serif KR로 남긴 뒤, 제목(`h1`~`h3`, `.markdown h1~h3`, `PostCard`의 제목)에만 `font-serif`를 붙인다. **이 후퇴를 실행했다면 스펙 §3.2에 결정 변경을 한 줄 기록한다.**

- [ ] **Step 6: 모바일 가로 오버플로 회귀 확인**

devtools에서 375px 폭으로 아래 8개 페이지를 순회한다.
`/`, `/posts/<id>`, `/tags`, `/categories`, `/categories/<slug>`, `/search`, `/career`, `/projects`

Expected: 어느 페이지에서도 `document.documentElement.scrollWidth > window.innerWidth`가 아니다. 콘솔에서 아래로 확인할 수 있다.
```js
document.documentElement.scrollWidth - window.innerWidth
```
결과가 `0` 이하여야 한다. **커밋 `8c1d8ba`에서 고쳤던 문제이므로 반드시 확인한다.**

- [ ] **Step 7: 다크모드 순회**

Step 6의 8개 페이지를 다크 모드로 한 번 더 돈다.
Expected: 배경 `#141414`, 본문 회색, 링크 하늘색, 방문 링크 연보라. 흰 배경이 남아 있는 요소가 없다.

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "💄 올드스쿨 리디자인 잔여 정리 및 최종 검증"
```

---

## 자체 검토 결과

**스펙 커버리지:**

| 스펙 항목 | 담당 태스크 |
|---|---|
| §3.1 색상 토큰 | Task 1 |
| §3.1 잔디 회색조 | Task 1 (토큰), Task 11 (셀) |
| §3.2 타이포그래피 | Task 2 |
| §3.3 링크 스타일 | Task 2 (**범위 축소 — 아래 참조**) |
| §4.1 폭 | Task 2, Task 8 |
| §4.2 헤더 | Task 3 |
| §4.3 테마 토글 | Task 3 |
| §4.4 푸터 | Task 3 |
| §5.1 홈 재작성 | Task 6 |
| §5.2 `app/page.tsx` | Task 7 (**구조 변경 — 아래 참조**) |
| §6.1 PostCard | Task 5 |
| §6.2 PostDetail | Task 8 |
| §6.3 `.markdown` | Task 4 |
| §6.4 `ui/*` | Task 5·8·9·11에서 사용처만 제거 |
| §7 나머지 페이지 | Task 9, Task 10 |
| §8 globals.css 정리 | Task 4 |
| §9 검증 | Task 12 |
| §10 폰트 용량 후퇴 | Task 12 Step 5 |

**스펙에서 의도적으로 벗어난 두 곳** (각 태스크 안에 근거를 적어두었다):

1. **§3.3 전역 링크 밑줄 → 범위 축소** (Task 2 Step 2). `text-decoration`은 자손이 되돌릴 수 없어서 전역 밑줄을 넣으면 `<Link><Button>` 패턴을 쓰는 어드민 버튼이 전부 밑줄 처리된다. 색만 전역, 밑줄은 본문과 목록 링크에 개별 부여한다.
2. **§5.2 좌우 2단 사이드바 → 단일 컬럼** (Task 7 Step 3). `<main>`이 720px로 좁아진 상태에서 2단을 유지하면 본문이 450px대로 눌린다. 사이드바를 본문 아래로 내린다.

**계획에 추가된, 스펙에 없던 항목:**

- Task 1 Step 4: `borderRadius`의 `2xl`/`3xl`/`DEFAULT` 키도 덮어써야 한다는 점. 현재 config에 없어서 Tailwind 기본값이 적용 중이고, 이걸 놓치면 `rounded-2xl`을 쓰는 카드들이 계속 둥글게 남는다.
- Task 6: `hasMore` 초기값을 `data.totalPosts > 5` 하드코딩에서 `data.totalPosts > data.recentPosts.length`로 교정.
- Task 9 Step 3: `TagCloud`의 `colorClasses`가 Task 1에서 제거되는 `primary-50`~`primary-900`을 참조하므로 죽은 코드가 된다는 점.
