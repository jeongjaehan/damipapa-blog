'use client'

import { useMemo } from 'react'
import HeatmapCell from './HeatmapCell'
import { buildGrid } from './utils'
import type { GridCell, HeatmapDay } from './types'

interface HeatmapGridProps {
  year: number
  days: HeatmapDay[]
  onCellHover?: (cell: GridCell, target: HTMLElement | null) => void
  onCellLeave?: () => void
  onCellActivate?: (cell: GridCell, target: HTMLElement | null) => void
}

// Mon, Wed, Fri 행에만 라벨 (GitHub 동일)
const WEEKDAY_ROW_LABELS: Record<number, string> = {
  1: 'Mon',
  3: 'Wed',
  5: 'Fri',
}

export default function HeatmapGrid({
  year,
  days,
  onCellHover,
  onCellLeave,
  onCellActivate,
}: HeatmapGridProps) {
  const grid = useMemo(() => buildGrid(year, days), [year, days])

  return (
    <div className="flex gap-[6px] text-muted-foreground">
      {/* 좌측 요일 라벨 */}
      <div
        className="flex flex-col gap-[3px] pt-[18px] text-[10px] leading-[11px]"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4, 5, 6].map((wd) => (
          <div key={wd} className="h-[11px] w-7">
            {WEEKDAY_ROW_LABELS[wd] ?? ''}
          </div>
        ))}
      </div>

      {/* 그리드 본체: 월 라벨 행 + 53컬럼 */}
      <div className="flex flex-col gap-[3px]">
        {/* 월 라벨 행 */}
        <div className="flex gap-[3px] text-[10px] leading-[15px]" aria-hidden="true">
          {grid.columns.map((col, idx) => (
            <div key={`m-${idx}`} className="w-[11px]">
              {col.monthLabel ?? ''}
            </div>
          ))}
        </div>

        {/* 셀 그리드 */}
        <div className="flex gap-[3px]">
          {grid.columns.map((col, ci) => (
            <div key={`c-${ci}`} className="flex flex-col gap-[3px]">
              {col.cells.map((cell, ri) => (
                <HeatmapCell
                  key={`${ci}-${ri}`}
                  cell={cell}
                  onHover={onCellHover}
                  onLeave={onCellLeave}
                  onActivate={onCellActivate}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
