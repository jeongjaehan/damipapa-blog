import type { HeatmapDay, HeatmapLevel } from '@/types'

export interface GridCell {
  date: string | null   // 'YYYY-MM-DD' KST. padding 셀은 null
  count: number
  level: HeatmapLevel
  isPadding: boolean
  isFuture: boolean
  weekday: number       // 0=일 ~ 6=토 (KST)
}

export interface WeekColumn {
  cells: GridCell[]     // 항상 길이 7
  monthLabel: string | null
}

export interface BuiltGrid {
  columns: WeekColumn[] // 보통 53개
  todayKST: string      // 'YYYY-MM-DD'
}

export type { HeatmapDay, HeatmapLevel }
