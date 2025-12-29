import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET /api/categories/[slug] - 특정 카테고리 및 하위 글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const size = parseInt(searchParams.get('size') || '10')

    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    let isAdmin = false
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      isAdmin = !!(payload && payload.role === 'ADMIN')
    }

    // 미분류 포스트 조회 (관리자는 비공개 포스트도 포함)
    if (slug === 'uncategorized') {
      const uncategorizedWhereCondition = {
        categoryId: null,
        ...(isAdmin ? {} : { isPrivate: false }),
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: uncategorizedWhereCondition,
          include: {
            author: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: page * size,
          take: size,
        }),
        prisma.post.count({
          where: uncategorizedWhereCondition,
        }),
      ])

      const postSummaries = posts.map((post) => ({
        id: post.id,
        title: post.title,
        tags: post.tags ? JSON.parse(post.tags) : [],
        authorName: post.author.name,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        viewCount: post.viewCount,
        commentCount: 0,
        isPrivate: post.isPrivate,
        categoryId: null,
        categoryName: null,
        categorySlug: null,
      }))

      return NextResponse.json({
        category: {
          id: null,
          name: '미분류',
          slug: 'uncategorized',
          description: '카테고리가 지정되지 않은 글',
          isPrivate: false,
        },
        posts: {
          content: postSummaries,
          page,
          size,
          totalElements: total,
          totalPages: Math.ceil(total / size),
          first: page === 0,
          last: page >= Math.ceil(total / size) - 1,
        },
      })
    }

    // 특정 카테고리 조회
    const category = await prisma.category.findUnique({
      where: { slug },
    })

    if (!category) {
      return NextResponse.json(
        { message: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 비공개 카테고리 체크 (관리자는 접근 가능)
    if (category.isPrivate && !isAdmin) {
      return NextResponse.json(
        { message: '접근 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 상위 카테고리 경로 조회 (ancestors)
    const ancestors: { id: number; name: string; slug: string }[] = []
    let currentParentId = category.parentId
    while (currentParentId) {
      const parent = await prisma.category.findUnique({
        where: { id: currentParentId },
        select: { id: true, name: true, slug: true, parentId: true, isPrivate: true },
      })
      if (parent && !parent.isPrivate) {
        ancestors.unshift({ id: parent.id, name: parent.name, slug: parent.slug })
        currentParentId = parent.parentId
      } else {
        break
      }
    }

    // 해당 카테고리의 포스트 조회 (관리자는 비공개 포스트도 포함)
    const postWhereCondition = {
      categoryId: category.id,
      ...(isAdmin ? {} : { isPrivate: false }),
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: postWhereCondition,
        include: {
          author: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: page * size,
        take: size,
      }),
      prisma.post.count({
        where: postWhereCondition,
      }),
    ])

    const postSummaries = posts.map((post) => ({
      id: post.id,
      title: post.title,
      tags: post.tags ? JSON.parse(post.tags) : [],
      authorName: post.author.name,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      viewCount: post.viewCount,
      commentCount: 0,
      isPrivate: post.isPrivate,
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
    }))

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isPrivate: category.isPrivate,
        depth: category.depth,
        parentId: category.parentId,
        ancestors, // 상위 카테고리 경로
      },
      posts: {
        content: postSummaries,
        page,
        size,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        first: page === 0,
        last: page >= Math.ceil(total / size) - 1,
      },
    })
  } catch (error) {
    console.error('Get category posts error:', error)
    return NextResponse.json(
      { message: '카테고리 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

