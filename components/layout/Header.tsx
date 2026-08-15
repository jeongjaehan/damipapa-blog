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
