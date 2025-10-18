import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '10')
    const tag = searchParams.get('tag')

    const skip = page * size
    const take = size

    // 필터 조건
    const where: any = { published: true }
    
    if (tag) {
      where.tags = { contains: tag }
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.post.count({ where }),
    ])

    const content = posts.map((post) => ({
      id: post.id,
      title: post.title,
      tags: post.tags ? JSON.parse(post.tags) : [],
      authorName: post.author.name,
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
    console.error('Get posts error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const { title, content, tags, published } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        tags: tags ? JSON.stringify(tags) : null,
        published: true,
        authorId: user.id,
      },
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
    console.error('Create post error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

