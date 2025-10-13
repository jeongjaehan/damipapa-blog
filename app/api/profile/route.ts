import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({
        content: '# 프로필\n\n프로필이 아직 작성되지 않았습니다.',
      })
    }

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      content: profile.content,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { message: '내용은 필수입니다' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      content: profile.content,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

