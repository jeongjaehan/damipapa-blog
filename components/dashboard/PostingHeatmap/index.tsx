'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeatmapGrid from './HeatmapGrid'
import HeatmapTooltip from './HeatmapTooltip'
import YearSelector from './YearSelector'
import ActivitySummary from './ActivitySummary'
import Legend from './Legend'
import { todayKSTDateString } from './utils'
import type { HeatmapResponse } from '@/types'
import type { GridCell } from './types'

interface PostingHeatmapProps {
  isAdmin: boolean
  initialYear?: number
  className?: string
}

export default function PostingHeatmap({
  isAdmin,
  initialYear,
  className,
}: PostingHeatmapProps) {
  const router = useRouter()
  const initial = initialYear ?? Number(todayKSTDateString().slice(0, 4))

  const [year, setYear] = useState(initial)
  const [data, setData] = useState<HeatmapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null)
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)
  const lastTappedRef = useRef<string | null>(null)

  // 연도별 응답 캐시 (같은 세션 내 재방문 시 재페치 X)
  const cacheRef = useRef<Map<number, HeatmapResponse>>(new Map())

  useEffect(() => {
    let cancelled = false

    const cached = cacheRef.current.get(year)
    if (cached) {
      setData(cached)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const url = `/api/dashboard/heatmap?year=${year}${isAdmin ? '&admin=true' : ''}`
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('데이터를 불러오지 못했어요')
        return r.json() as Promise<HeatmapResponse>
      })
      .then((res) => {
        if (cancelled) return
        cacheRef.current.set(year, res)
        setData(res)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [year, isAdmin])

  // isAdmin 토글 시 캐시 무효화
  useEffect(() => {
    cacheRef.current.clear()
  }, [isAdmin])

  const handleHover = useCallback((cell: GridCell, target: HTMLElement | null) => {
    setHoveredCell(cell)
    setHoveredRect(target?.getBoundingClientRect() ?? null)
  }, [])

  const handleLeave = useCallback(() => {
    setHoveredCell(null)
    setHoveredRect(null)
  }, [])

  const handleActivate = useCallback(
    (cell: GridCell, target: HTMLElement | null) => {
      if (!cell.date) return
      const supportsHover =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(hover: hover)').matches

      if (supportsHover) {
        router.push(`/?date=${cell.date}`)
        return
      }

      // 모바일: 동일 셀 두 번째 탭에서만 라우팅
      if (lastTappedRef.current === cell.date) {
        lastTappedRef.current = null
        router.push(`/?date=${cell.date}`)
        return
      }
      lastTappedRef.current = cell.date
      setHoveredCell(cell)
      setHoveredRect(target?.getBoundingClientRect() ?? null)
    },
    [router],
  )

  const availableYears = useMemo(() => {
    if (data?.availableYears && data.availableYears.length > 0) {
      return data.availableYears
    }
    return [initial]
  }, [data, initial])

  // 빈 상태 분기
  // - 블로그 전체 0편: availableYears 가 currentYear 한 칸이고 그 해마저 0편
  // - 선택 연도만 0편: 그 해 totalPosts === 0 (위 케이스가 아닌 경우)
  const isBlogEmpty =
    !!data &&
    data.availableYears.length <= 1 &&
    data.totalPosts === 0 &&
    year === Number(todayKSTDateString().slice(0, 4))
  const isYearEmpty = !!data && data.totalPosts === 0 && !isBlogEmpty

  return (
    <section className={className} aria-label="포스팅 활동 잔디">
      <div
        className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-6"
        onMouseLeave={handleLeave}
      >
        {/* 잔디 본체 */}
        <div className="min-w-0 flex-1">
          {error && !data && (
            <div className="border border-destructive px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="heatmap-scroll relative overflow-x-auto pb-1">
            {data && (
              <HeatmapGrid
                year={year}
                days={data.days}
                onCellHover={handleHover}
                onCellLeave={handleLeave}
                onCellActivate={handleActivate}
              />
            )}
            {!data && loading && (
              <div className="h-[120px] bg-muted" />
            )}

            {/* 블로그 전체가 비어있을 때 그리드 위 오버레이 */}
            {isBlogEmpty && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <p className="text-sm font-semibold text-foreground">
                  여기 잔디는 글과 함께 자라요
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  첫 글을 작성하면 이 영역이 채워져요
                </p>
              </div>
            )}
          </div>

          {/* 잔디 아래: 활동 요약 좌측, 색상 범례 우측 */}
          {data && !isBlogEmpty && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <ActivitySummary data={data} isYearEmpty={isYearEmpty} />
              <Legend />
            </div>
          )}
        </div>

        {/* 우측 연도 셀렉터 (모바일은 위쪽 가로) */}
        <div className="sm:w-20 sm:shrink-0">
          <YearSelector
            years={availableYears}
            current={year}
            onChange={setYear}
          />
        </div>
      </div>

      <HeatmapTooltip cell={hoveredCell} rect={hoveredRect} />
    </section>
  )
}
