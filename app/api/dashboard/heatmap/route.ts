import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { HeatmapResponse, HeatmapDay, HeatmapLevel } from '@/types'

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

function toKSTDateString(d: Date): string {
  const kst = new Date(d.getTime() + KST_OFFSET_MS)
  const y = kst.getUTCFullYear()
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kst.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function countToLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

function getCurrentKSTYear(): number {
  return Number(toKSTDateString(new Date()).slice(0, 4))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const yearParam = searchParams.get('year')
    const currentYear = getCurrentKSTYear()
    const year = yearParam ? parseInt(yearParam, 10) : currentYear

    if (!Number.isInteger(year) || year < 2000 || year > currentYear + 1) {
      return NextResponse.json(
        { message: '유효하지 않은 연도입니다' },
        { status: 400 },
      )
    }

    const privateCategories = await prisma.category.findMany({
      where: { isPrivate: true },
      select: { id: true },
    })
    const privateCategoryIds = privateCategories.map((c) => c.id)

    const visibilityFilter = isAdmin
      ? {}
      : {
          isPrivate: false,
          OR: [
            { categoryId: null },
            { categoryId: { notIn: privateCategoryIds } },
          ],
        }

    // KST 기준 [year/01/01 00:00, year+1/01/01 00:00) 의 UTC 표현
    const startUtc = new Date(Date.UTC(year, 0, 1) - KST_OFFSET_MS)
    const endUtc = new Date(Date.UTC(year + 1, 0, 1) - KST_OFFSET_MS)

    const [postsInYear, oldestPost] = await Promise.all([
      prisma.post.findMany({
        where: {
          ...visibilityFilter,
          createdAt: { gte: startUtc, lt: endUtc },
        },
        select: { createdAt: true },
      }),
      prisma.post.findFirst({
        where: visibilityFilter,
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
    ])

    // 일자별 카운트 집계
    const counts = new Map<string, number>()
    for (const p of postsInYear) {
      const ds = toKSTDateString(p.createdAt)
      counts.set(ds, (counts.get(ds) ?? 0) + 1)
    }

    // 1/1 ~ 12/31 일자 배열 생성 (윤년 자동 처리)
    const days: HeatmapDay[] = []
    const cursor = new Date(Date.UTC(year, 0, 1))
    while (cursor.getUTCFullYear() === year) {
      const y = cursor.getUTCFullYear()
      const m = String(cursor.getUTCMonth() + 1).padStart(2, '0')
      const d = String(cursor.getUTCDate()).padStart(2, '0')
      const ds = `${y}-${m}-${d}`
      const count = counts.get(ds) ?? 0
      days.push({ date: ds, count, level: countToLevel(count) })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }

    // 통계
    const totalPosts = postsInYear.length
    const activeDays = days.filter((d) => d.count > 0).length

    let longestStreak = 0
    let currentStreak = 0
    for (const d of days) {
      if (d.count > 0) {
        currentStreak += 1
        if (currentStreak > longestStreak) longestStreak = currentStreak
      } else {
        currentStreak = 0
      }
    }

    // 사용 가능 연도: 가장 오래된 글의 KST 연도 ~ 현재 KST 연도 (내림차순)
    const oldestYear = oldestPost
      ? Number(toKSTDateString(oldestPost.createdAt).slice(0, 4))
      : currentYear
    const availableYears: number[] = []
    for (let y = currentYear; y >= oldestYear; y -= 1) {
      availableYears.push(y)
    }

    const response: HeatmapResponse = {
      year,
      timezone: 'Asia/Seoul',
      totalPosts,
      activeDays,
      longestStreak,
      availableYears,
      days,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Heatmap data error:', error)
    return NextResponse.json(
      { message: '잔디 데이터 조회 중 오류가 발생했습니다' },
      { status: 500 },
    )
  }
}
