'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { pageview, logEvent } from '@/lib/gtag'

/**
 * Analytics 컴포넌트 - 자동 페이지뷰 추적
 * Next.js 라우터 변경을 감지하여 GA4에 페이지뷰 이벤트를 전송합니다.
 */
export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URL이 변경될 때마다 페이지뷰 추적
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    // GA4 페이지뷰 이벤트 전송
    pageview(url)
    
    // 개발 환경에서 로깅
    logEvent('pageview', { url })
  }, [pathname, searchParams])

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
}
