import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '10')
    const tag = searchParams.get('tag')
    const date = searchParams.get('date') // YYYY-MM-DD (KST)
    const sortBy = searchParams.get('sortBy') || 'recent'

    const skip = page * size
    const take = size

    // 비공개 카테고리 ID 목록 조회
    const privateCategories = await prisma.category.findMany({
      where: { isPrivate: true },
      select: { id: true },
    })
    const privateCategoryIds = privateCategories.map((c) => c.id)

    // 필터 조건: 비공개 포스트 + 비공개 카테고리 소속 포스트 제외
    const where: any = {
      isPrivate: false,
      OR: [
        { categoryId: null }, // 미분류
        { categoryId: { notIn: privateCategoryIds } }, // 비공개 카테고리가 아닌 포스트
      ],
    }

    if (tag) {
      where.tags = { contains: tag }
    }

    // KST 기준 특정 일자 필터 (잔디 셀 클릭 시 사용)
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y, m, d] = date.split('-').map(Number)
      const KST_OFFSET_MS = 9 * 60 * 60 * 1000
      const startUtc = new Date(Date.UTC(y, m - 1, d) - KST_OFFSET_MS)
      const endUtc = new Date(Date.UTC(y, m - 1, d + 1) - KST_OFFSET_MS)
      where.createdAt = { gte: startUtc, lt: endUtc }
    }

    // 정렬 조건
    const orderBy = sortBy === 'popular' 
      ? { viewCount: 'desc' as const } 
      : { createdAt: 'desc' as const }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { 
          author: true,
          category: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy,
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
      categoryId: post.categoryId,
      categoryName: post.category?.name ?? null,
      categorySlug: post.category?.slug ?? null,
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

    const { title, content, tags, isPrivate, categoryId } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 비공개 포스트인 경우 secretToken 생성
    const secretToken = isPrivate ? crypto.randomUUID() : null

    const post = await prisma.post.create({
      data: {
        title,
        content,
        tags: tags ? JSON.stringify(tags) : null,
        isPrivate: isPrivate || false,
        secretToken,
        authorId: user.id,
        categoryId: categoryId ?? null,
      } as any,
      include: { 
        author: true,
        category: {
          select: { id: true, name: true, slug: true }
        }
      },
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
      categoryId: post.categoryId,
      category: post.category,
    })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

