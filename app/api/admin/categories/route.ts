import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { CategoryWithChildren } from '@/types'

const MAX_DEPTH = 4 // 0~4 = 5 depth

// 카테고리를 트리 구조로 변환하는 헬퍼 함수
function buildCategoryTree(
  categories: Array<{
    id: number
    name: string
    slug: string
    description: string | null
    isPrivate: boolean
    order: number
    depth: number
    parentId: number | null
    createdAt: Date
    updatedAt: Date
    _count: { posts: number }
  }>,
  parentId: number | null = null
): CategoryWithChildren[] {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      isPrivate: cat.isPrivate,
      order: cat.order,
      depth: cat.depth,
      parentId: cat.parentId,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      postCount: cat._count.posts,
      children: buildCategoryTree(categories, cat.id),
    }))
}

// 인증 검증 헬퍼
function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return null
  }
  return payload
}

// GET /api/admin/categories - 전체 카테고리 트리 조회 (비공개 포함)
export async function GET(request: NextRequest) {
  try {
    const payload = verifyAdmin(request)
    if (!payload) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: [{ depth: 'asc' }, { order: 'asc' }],
    })

    // 미분류 포스트 수
    const uncategorizedCount = await prisma.post.count({
      where: { categoryId: null },
    })

    const categoryTree = buildCategoryTree(categories)

    return NextResponse.json({
      categories: categoryTree,
      uncategorizedCount,
    })
  } catch (error) {
    console.error('Get admin categories error:', error)
    return NextResponse.json(
      { message: '카테고리 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - 새 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const payload = verifyAdmin(request)
    if (!payload) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, description, isPrivate, order, parentId } = body

    if (!name || !slug) {
      return NextResponse.json(
        { message: '이름과 슬러그는 필수입니다' },
        { status: 400 }
      )
    }

    // 슬러그 중복 체크
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })
    if (existingCategory) {
      return NextResponse.json(
        { message: '이미 사용 중인 슬러그입니다' },
        { status: 400 }
      )
    }

    // depth 계산
    let depth = 0
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      })
      if (!parentCategory) {
        return NextResponse.json(
          { message: '상위 카테고리를 찾을 수 없습니다' },
          { status: 400 }
        )
      }
      depth = parentCategory.depth + 1
      if (depth > MAX_DEPTH) {
        return NextResponse.json(
          { message: `최대 ${MAX_DEPTH + 1} depth까지만 생성 가능합니다` },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        isPrivate: isPrivate || false,
        order: order || 0,
        depth,
        parentId: parentId || null,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { message: '카테고리 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

