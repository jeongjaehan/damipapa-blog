import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

const MAX_DEPTH = 4 // 0~4 = 5 depth

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

// 자식 카테고리들의 depth를 재귀적으로 업데이트
async function updateChildrenDepth(categoryId: number, parentDepth: number) {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
  })

  for (const child of children) {
    const newDepth = parentDepth + 1
    await prisma.category.update({
      where: { id: child.id },
      data: { depth: newDepth },
    })
    await updateChildrenDepth(child.id, newDepth)
  }
}

// 순환 참조 체크
async function hasCircularReference(
  categoryId: number,
  newParentId: number
): Promise<boolean> {
  if (categoryId === newParentId) return true

  let currentId: number | null = newParentId
  while (currentId !== null) {
    if (currentId === categoryId) return true
    const parent: { parentId: number | null } | null = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })
    currentId = parent?.parentId ?? null
  }
  return false
}

// GET /api/admin/categories/[id] - 특정 카테고리 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyAdmin(request)
    if (!payload) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { id } = await params
    const categoryId = parseInt(id)

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { message: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
      postCount: category._count.posts,
    })
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json(
      { message: '카테고리 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories/[id] - 카테고리 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyAdmin(request)
    if (!payload) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { id } = await params
    const categoryId = parseInt(id)
    const body = await request.json()
    const { name, slug, description, isPrivate, order, parentId } = body

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 슬러그 중복 체크 (자기 자신 제외)
    if (slug && slug !== existingCategory.slug) {
      const duplicateSlug = await prisma.category.findUnique({
        where: { slug },
      })
      if (duplicateSlug) {
        return NextResponse.json(
          { message: '이미 사용 중인 슬러그입니다' },
          { status: 400 }
        )
      }
    }

    // 부모 카테고리 변경 시 처리
    let newDepth = existingCategory.depth
    if (parentId !== undefined && parentId !== existingCategory.parentId) {
      if (parentId === null) {
        newDepth = 0
      } else {
        // 순환 참조 체크
        if (await hasCircularReference(categoryId, parentId)) {
          return NextResponse.json(
            { message: '순환 참조가 발생합니다' },
            { status: 400 }
          )
        }

        const parentCategory = await prisma.category.findUnique({
          where: { id: parentId },
        })
        if (!parentCategory) {
          return NextResponse.json(
            { message: '상위 카테고리를 찾을 수 없습니다' },
            { status: 400 }
          )
        }
        newDepth = parentCategory.depth + 1
        if (newDepth > MAX_DEPTH) {
          return NextResponse.json(
            { message: `최대 ${MAX_DEPTH + 1} depth까지만 가능합니다` },
            { status: 400 }
          )
        }
      }
    }

    // 카테고리 업데이트
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name ?? existingCategory.name,
        slug: slug ?? existingCategory.slug,
        description: description !== undefined ? description : existingCategory.description,
        isPrivate: isPrivate !== undefined ? isPrivate : existingCategory.isPrivate,
        order: order !== undefined ? order : existingCategory.order,
        parentId: parentId !== undefined ? parentId : existingCategory.parentId,
        depth: newDepth,
      },
    })

    // 자식 카테고리들의 depth 업데이트
    if (newDepth !== existingCategory.depth) {
      await updateChildrenDepth(categoryId, newDepth)
    }

    return NextResponse.json({
      ...updatedCategory,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { message: '카테고리 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - 카테고리 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = verifyAdmin(request)
    if (!payload) {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { id } = await params
    const categoryId = parseInt(id)

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { posts: true, children: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { message: '카테고리를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 하위 카테고리가 있으면 삭제 불가
    if (category._count.children > 0) {
      return NextResponse.json(
        { message: '하위 카테고리가 있어 삭제할 수 없습니다. 먼저 하위 카테고리를 삭제해주세요.' },
        { status: 400 }
      )
    }

    // 해당 카테고리의 포스트들은 미분류로 변경
    await prisma.post.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    })

    // 카테고리 삭제
    await prisma.category.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ message: '카테고리가 삭제되었습니다' })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { message: '카테고리 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

