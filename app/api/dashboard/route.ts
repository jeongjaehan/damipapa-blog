import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BlogDashboardData } from '@/types'

// GET /api/dashboard - 공개 대시보드 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'

    // 비공개 카테고리 ID 목록 조회
    const privateCategories = await prisma.category.findMany({
      where: { isPrivate: true },
      select: { id: true },
    })
    const privateCategoryIds = privateCategories.map((c) => c.id)

    // 포스트 필터 조건
    const postWhereCondition = isAdmin
      ? {} // 관리자: 모든 포스트
      : {
          isPrivate: false, // 공개 포스트만
          OR: [
            { categoryId: null }, // 미분류
            { categoryId: { notIn: privateCategoryIds } }, // 비공개 카테고리가 아닌 포스트
          ],
        }

    // 병렬로 모든 데이터 조회
    const [totalPosts, totalViewsData, recentPosts, popularPosts] = await Promise.all([
      // 전체 포스트 수
      prisma.post.count({
        where: postWhereCondition,
      }),
      // 전체 조회수
      prisma.post.aggregate({
        where: postWhereCondition,
        _sum: { viewCount: true },
      }),
      // 최근 포스트 5개
      prisma.post.findMany({
        where: postWhereCondition,
        include: {
          author: { select: { name: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // 인기 포스트 5개 (조회수 기준)
      prisma.post.findMany({
        where: postWhereCondition,
        include: {
          author: { select: { name: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { viewCount: 'desc' },
        take: 5,
      }),
    ])

    const formatPosts = (posts: typeof recentPosts) =>
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        tags: post.tags ? JSON.parse(post.tags) : [],
        authorName: post.author.name,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        viewCount: post.viewCount,
        commentCount: 0,
        isPrivate: post.isPrivate,
        categoryId: post.category?.id ?? null,
        categoryName: post.category?.name ?? null,
        categorySlug: post.category?.slug ?? null,
      }))

    const response: BlogDashboardData = {
      totalPosts,
      totalViews: totalViewsData._sum.viewCount ?? 0,
      recentPosts: formatPosts(recentPosts),
      popularPosts: formatPosts(popularPosts),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json(
      { message: '대시보드 데이터 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
