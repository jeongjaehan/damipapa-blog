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

    // 조회수 증가 (유니크)
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

    const post = await prisma.post.findFirst({
      where: { id, published: true },
      include: { author: true },
    })

    if (!post) {
      return NextResponse.json(
        { message: '포스트를 찾을 수 없습니다' },
        { status: 404 }
      )
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
    if (data.published !== undefined) updateData.published = data.published

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

