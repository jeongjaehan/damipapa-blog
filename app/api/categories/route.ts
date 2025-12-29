import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CategoryWithChildren, CategoryTree } from '@/types'

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

// GET /api/categories - 공개 카테고리 트리 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePrivate = searchParams.get('includePrivate') === 'true'

    // 카테고리 조회 (비공개 카테고리 필터링)
    const categories = await prisma.category.findMany({
      where: includePrivate ? {} : { isPrivate: false },
      include: {
        _count: {
          select: {
            posts: {
              where: includePrivate ? {} : { isPrivate: false },
            },
          },
        },
      },
      orderBy: [{ depth: 'asc' }, { order: 'asc' }],
    })

    // 미분류 포스트 수 조회
    const uncategorizedCount = await prisma.post.count({
      where: {
        categoryId: null,
        ...(includePrivate ? {} : { isPrivate: false }),
      },
    })

    // 트리 구조로 변환
    const categoryTree = buildCategoryTree(categories)

    const response: CategoryTree = {
      categories: categoryTree,
      uncategorizedCount,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { message: '카테고리 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

