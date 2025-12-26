import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// 🔒 보안: JWT_SECRET 환경변수가 없으면 에러 발생 (기본값 사용 금지)
const JWT_SECRET = process.env.JWT_SECRET || ''
if (!JWT_SECRET || JWT_SECRET === 'default-secret-key' || JWT_SECRET.length < 32) {
  console.error('❌ 보안 오류: JWT_SECRET 환경변수가 설정되지 않았거나 안전하지 않습니다.')
  console.error('최소 32자 이상의 안전한 랜덤 문자열을 설정하세요.')
  console.error('생성 방법: openssl rand -base64 64')
  throw new Error('JWT_SECRET is not properly configured')
}

const JWT_EXPIRATION = '12h'

export interface JWTPayload {
  email: string
  role: string
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return '0.0.0.0'
}

