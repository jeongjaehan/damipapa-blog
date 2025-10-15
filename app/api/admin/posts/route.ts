import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '10')

    const skip = page * size
    const take = size

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        include: { author: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.post.count(),
    ])

    const content = posts.map((post) => ({
      id: post.id,
      title: post.title,
      tags: post.tags ? JSON.parse(post.tags) : [],
      authorName: post.author.name,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      viewCount: post.viewCount,
    }))

    return NextResponse.json({
      content,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: page >= Math.ceil(total / size) - 1,
    })
  } catch (error) {
    console.error('Get admin posts error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

