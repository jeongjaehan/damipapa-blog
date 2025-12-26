import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔒 보안 미들웨어
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 1. 보안 헤더 추가
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // 2. 업로드 디렉토리 보안: 스크립트 실행 방지
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    const filename = request.nextUrl.pathname.split('/').pop() || ''
    const dangerousExtensions = [
      '.sh',
      '.bash',
      '.php',
      '.py',
      '.pl',
      '.cgi',
      '.exe',
      '.bin',
      '.js',
      '.mjs',
      '.ts',
    ]

    // 위험한 확장자 차단
    if (dangerousExtensions.some((ext) => filename.toLowerCase().endsWith(ext))) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // 3. 파일 다운로드 시 Content-Disposition 헤더 추가 (XSS 방지)
  if (request.nextUrl.pathname.startsWith('/api/files/')) {
    response.headers.set('Content-Disposition', 'inline')
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  return response
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

