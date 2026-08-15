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
