'use client'

import { useEffect, useState } from 'react'
import type { GridCell } from './types'

interface HeatmapTooltipProps {
  cell: GridCell | null
  rect: DOMRect | null
}

function formatTooltip(cell: GridCell): string {
  if (!cell.date) return ''
  const [y, m, d] = cell.date.split('-')
  const datePart = `${y}-${m}-${d}`
  if (cell.count === 0) return `${datePart} · 작성 없음`
  return `${datePart} · 포스트 ${cell.count}편`
}

export default function HeatmapTooltip({ cell, rect }: HeatmapTooltipProps) {
  // SSR 안전: position 계산은 마운트 후에만
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !cell || !rect || !cell.date || cell.isFuture) return null

  const top = rect.top - 8 // 셀 위로 8px 여유 (translate -100% 이후 셀과의 간격)
  const left = rect.left + rect.width / 2

  return (
    <div
      role="tooltip"
      aria-live="polite"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap bg-popover px-2 py-1 text-xs text-popover-foreground border border-border"
      style={{ top, left }}
    >
      {formatTooltip(cell)}
    </div>
  )
}
