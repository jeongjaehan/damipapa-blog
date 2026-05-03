'use client'

import { memo } from 'react'
import type { GridCell } from './types'

interface HeatmapCellProps {
  cell: GridCell
  onHover?: (cell: GridCell, target: HTMLElement | null) => void
  onLeave?: () => void
  onActivate?: (cell: GridCell, target: HTMLElement | null) => void
}

const LEVEL_BG: Record<number, string> = {
  0: 'bg-[hsl(var(--heatmap-l0))]',
  1: 'bg-[hsl(var(--heatmap-l1))]',
  2: 'bg-[hsl(var(--heatmap-l2))]',
  3: 'bg-[hsl(var(--heatmap-l3))]',
  4: 'bg-[hsl(var(--heatmap-l4))]',
}

function formatAriaLabel(cell: GridCell): string {
  if (!cell.date) return ''
  const [y, m, d] = cell.date.split('-')
  if (cell.isFuture) return `${y}년 ${Number(m)}월 ${Number(d)}일 (예정)`
  if (cell.count === 0) return `${y}년 ${Number(m)}월 ${Number(d)}일, 작성 없음`
  return `${y}년 ${Number(m)}월 ${Number(d)}일, 포스트 ${cell.count}편 작성`
}

function HeatmapCellInner({ cell, onHover, onLeave, onActivate }: HeatmapCellProps) {
  if (cell.isPadding) {
    return <div aria-hidden="true" className="h-[11px] w-[11px]" />
  }

  const hoverable = !cell.isFuture
  const clickable = hoverable && cell.count > 0
  const baseClass = 'h-[11px] w-[11px] rounded-[2px] transition-transform duration-100'
  const futureClass = cell.isFuture ? 'opacity-30' : ''
  const cursorClass = clickable ? 'cursor-pointer' : 'cursor-default'
  const focusClass = hoverable
    ? 'hover:scale-[1.25] hover:ring-1 hover:ring-foreground/25 focus-visible:scale-[1.25] focus-visible:ring-1 focus-visible:ring-foreground/40 focus-visible:outline-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100'
    : ''

  return (
    <button
      type="button"
      tabIndex={hoverable ? 0 : -1}
      aria-label={formatAriaLabel(cell)}
      data-date={cell.date ?? undefined}
      data-level={cell.level}
      className={`${baseClass} ${LEVEL_BG[cell.level]} ${futureClass} ${cursorClass} ${focusClass}`}
      onMouseEnter={(e) => hoverable && onHover?.(cell, e.currentTarget)}
      onMouseLeave={() => hoverable && onLeave?.()}
      onFocus={(e) => hoverable && onHover?.(cell, e.currentTarget)}
      onBlur={() => hoverable && onLeave?.()}
      onClick={(e) => clickable && onActivate?.(cell, e.currentTarget)}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onActivate?.(cell, e.currentTarget)
        }
      }}
    />
  )
}

export default memo(HeatmapCellInner)
