'use client'

import type { HeatmapResponse } from '@/types'

interface ActivitySummaryProps {
  data: HeatmapResponse
  isYearEmpty: boolean // 그 해만 0편 (블로그 전체가 비어있는 케이스는 상위에서 다른 UI로 처리)
}

export default function ActivitySummary({
  data,
  isYearEmpty,
}: ActivitySummaryProps) {
  if (isYearEmpty) {
    return (
      <p className="text-sm text-muted-foreground">
        {data.year}년엔 잔디가 비어있어요
      </p>
    )
  }

  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{data.year}</span>
      년에 작성한 글{' '}
      <span className="font-semibold text-foreground">
        {data.totalPosts.toLocaleString()}편
      </span>
      <span aria-hidden="true" className="mx-1.5 text-border">·</span>
      활동일{' '}
      <span className="font-semibold text-foreground">{data.activeDays}일</span>
      <span aria-hidden="true" className="mx-1.5 text-border">·</span>
      최장 연속{' '}
      <span className="font-semibold text-foreground">
        {data.longestStreak}일
      </span>
    </p>
  )
}
