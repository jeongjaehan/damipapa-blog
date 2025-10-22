import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken, getClientIp } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const ipAddress = getClientIp(request)
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // 인증 헤더 확인 (관리자 접근용)
    const authHeader = request.headers.get('authorization')
    let isAdmin = false
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const authToken = authHeader.substring(7)
      const payload = verifyToken(authToken)
      isAdmin = !!(payload && payload.role === 'ADMIN')
    }

    const post = await prisma.post.findFirst({
      where: { id },
      include: { author: true },
    })

    if (!post) {
      return NextResponse.json(
        { message: '포스트를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 비공개 포스트 접근 권한 확인
    if ((post as any).isPrivate) {
      // 관리자이거나 올바른 토큰이 있는 경우만 접근 허용
      if (!isAdmin && (!token || token !== (post as any).secretToken)) {
        return NextResponse.json(
          { message: '접근 권한이 없습니다' },
          { status: 403 }
        )
      }
    }

    // 공개 포스트이거나 접근 권한이 있는 경우에만 조회수 증가
    if (!(post as any).isPrivate) {
      const existingView = await prisma.postView.findFirst({
        where: { postId: id, ipAddress },
      })

      if (!existingView) {
        await prisma.postView.create({
          data: { postId: id, ipAddress },
        })
        await prisma.post.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        })
      }
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags ? JSON.parse(post.tags) : [],
      author: {
        id: post.author.id,
        email: post.author.email,
        name: post.author.name,
        role: post.author.role,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      viewCount: post.viewCount,
      isPrivate: (post as any).isPrivate,
      secretToken: (post as any).secretToken,
    })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const data = await request.json()

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)
    
    // isPrivate 필드 처리
    if (data.isPrivate !== undefined) {
      updateData.isPrivate = data.isPrivate
      // 비공개로 전환 시 secretToken 생성, 공개로 전환 시 secretToken 제거
      if (data.isPrivate) {
        updateData.secretToken = crypto.randomUUID()
      } else {
        updateData.secretToken = null
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: { author: true },
    })

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags ? JSON.parse(post.tags) : [],
      author: {
        id: post.author.id,
        email: post.author.email,
        name: post.author.name,
        role: post.author.role,
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      viewCount: post.viewCount,
      isPrivate: (post as any).isPrivate,
      secretToken: (post as any).secretToken,
    })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: idParam } = await params
    const id = parseInt(idParam)
    await prisma.post.delete({ where: { id } })

    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

