import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호는 필수입니다' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !comparePassword(password, user.password)) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }

    // JWT 토큰 생성
    const token = createToken({ email: user.email, role: user.role })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

