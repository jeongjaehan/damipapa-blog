'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, PenSquare, LayoutDashboard, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary-600 transition-colors">
            다미파파의 블로그
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-primary-600 transition-colors">
              홈
            </Link>
            <Link href="/career" className="text-sm font-medium text-foreground/70 hover:text-primary-600 transition-colors">
              프로필
            </Link>
            <Link href="/projects" className="text-sm font-medium text-foreground/70 hover:text-primary-600 transition-colors">
              프로젝트
            </Link>
            <Link href="/search" className="text-sm font-medium text-foreground/70 hover:text-primary-600 transition-colors">
              검색
            </Link>
            <Link href="/tags" className="text-sm font-medium text-foreground/70 hover:text-primary-600 transition-colors">
              태그
            </Link>
            <ThemeToggle />
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      대시보드
                    </Button>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin/posts/new">
                    <Button size="sm" className="gap-2">
                      <PenSquare className="w-4 h-4" />
                      글쓰기
                    </Button>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin/templates">
                    <Button size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      템플릿 관리
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-foreground/70">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  로그아웃
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-foreground/70 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              홈
            </Link>
            <Link
              href="/career"
              className="block py-2 text-foreground/70 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              프로필
            </Link>
            <Link
              href="/projects"
              className="block py-2 text-foreground/70 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              프로젝트
            </Link>
            <Link
              href="/search"
              className="block py-2 text-foreground/70 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              검색
            </Link>
            <Link
              href="/tags"
              className="block py-2 text-foreground/70 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              태그
            </Link>
            <div className="py-2">
              <ThemeToggle />
            </div>
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="block py-2 text-foreground/70 hover:text-primary-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      관리자
                    </Link>
                    <Link
                      href="/admin/posts/new"
                      className="block py-2 bg-primary-600 text-white px-4 rounded hover:bg-primary-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      글쓰기
                    </Link>
                    <Link
                      href="/admin/templates"
                      className="block py-2 bg-primary-600 text-white px-4 rounded hover:bg-primary-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      템플릿 관리
                    </Link>
                  </>
                )}
                <span className="block py-2 text-foreground/70">{user?.name}</span>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="block py-2 text-foreground/70 hover:text-primary-600 w-full text-left"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

