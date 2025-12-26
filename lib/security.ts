/**
 * 🔒 보안 유틸리티 함수
 */

/**
 * 파일명 검증: Path Traversal 공격 방지
 */
export function isValidFilename(filename: string): boolean {
  // 경로 구분자 차단
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return false
  }

  // NULL 바이트 차단
  if (filename.includes('\0')) {
    return false
  }

  // 제어 문자 차단
  if (/[\x00-\x1f\x7f-\x9f]/.test(filename)) {
    return false
  }

  // 파일명 길이 제한 (255자)
  if (filename.length > 255) {
    return false
  }

  return true
}

/**
 * UUID 패턴 검증
 */
export function isValidUUIDFilename(filename: string): boolean {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i
  return uuidPattern.test(filename)
}

/**
 * 이미지 파일 매직 바이트 검증
 */
export function verifyImageSignature(
  buffer: Buffer,
  extension: string
): boolean {
  const ext = extension.toLowerCase()

  // JPEG: FF D8 FF
  if (ext === 'jpg' || ext === 'jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (ext === 'png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    )
  }

  // GIF: 47 49 46 38
  if (ext === 'gif') {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    )
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (ext === 'webp') {
    return (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    )
  }

  return false
}

/**
 * 허용된 이미지 확장자 목록
 */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']

/**
 * 허용된 MIME 타입 목록
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

/**
 * 위험한 파일 확장자 목록 (실행 가능한 파일)
 */
export const DANGEROUS_EXTENSIONS = [
  'sh',
  'bash',
  'zsh',
  'php',
  'py',
  'pl',
  'cgi',
  'exe',
  'bin',
  'bat',
  'cmd',
  'com',
  'app',
  'jar',
  'js',
  'mjs',
  'ts',
  'jsx',
  'tsx',
  'sql',
  'html',
  'htm',
  'svg', // SVG는 XSS 위험
]

/**
 * SQL Injection 패턴 감지 (기본적인 검증)
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\;|\/\*|\*\/|xp_|sp_)/i,
    /(UNION.*SELECT)/i,
    /(OR\s+1\s*=\s*1)/i,
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * XSS 패턴 감지 (기본적인 검증)
 */
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload 등
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

/**
 * 입력값 정제 (기본적인 HTML 태그 제거)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

/**
 * Rate Limiting용 키 생성
 */
export function getRateLimitKey(ip: string, endpoint: string): string {
  return `ratelimit:${ip}:${endpoint}`
}

/**
 * 안전한 에러 메시지 반환 (내부 정보 노출 방지)
 */
export function getSafeErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : String(error)
  }
  return '서버 오류가 발생했습니다'
}

