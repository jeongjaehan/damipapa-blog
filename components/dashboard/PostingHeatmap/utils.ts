import type { HeatmapDay } from '@/types'
import type { GridCell, WeekColumn, BuiltGrid } from './types'

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// KST 기준 오늘 날짜 (YYYY-MM-DD)
export function todayKSTDateString(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + KST_OFFSET_MS)
  const y = kst.getUTCFullYear()
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0')
  const d = String(kst.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface ParsedDate {
  year: number
  month: number  // 1-12
  day: number    // 1-31
  weekday: number // 0=Sun ~ 6=Sat
}

function parseDate(ds: string): ParsedDate {
  const [y, m, d] = ds.split('-').map(Number)
  // Date.UTC 로 만들고 getUTCDay() 사용해 로컬 타임존의 영향을 제거
  const t = Date.UTC(y, m - 1, d)
  return { year: y, month: m, day: d, weekday: new Date(t).getUTCDay() }
}

function addDays(ds: string, delta: number): string {
  const [y, m, d] = ds.split('-').map(Number)
  const t = Date.UTC(y, m - 1, d) + delta * 24 * 60 * 60 * 1000
  const dt = new Date(t)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/**
 * GitHub 잔디 스타일의 53주 컬럼 그리드를 생성한다.
 *
 * 규칙:
 * - 1/1 이 속한 주의 일요일을 그리드 시작점으로
 * - 12/31 이 속한 주의 토요일까지 채움
 * - 시작 이전(전년도)·끝 이후(내년도) 셀은 isPadding=true
 * - 오늘(KST) 이후 날짜는 isFuture=true (호버/클릭 비활성)
 * - 월 라벨은 그 달의 1일을 포함한 컬럼에 표시 (단, 같은 달 중복 표시 X)
 */
export function buildGrid(year: number, days: HeatmapDay[]): BuiltGrid {
  const todayKST = todayKSTDateString()

  const dayMap = new Map<string, HeatmapDay>()
  for (const d of days) dayMap.set(d.date, d)

  // 그리드 시작: 1/1 이 속한 주의 일요일
  const yearStart = `${year}-01-01`
  const startWeekday = parseDate(yearStart).weekday
  const gridStart = addDays(yearStart, -startWeekday)

  // 그리드 끝: 12/31 이 속한 주의 토요일
  const yearEnd = `${year}-12-31`
  const endWeekday = parseDate(yearEnd).weekday
  const gridEnd = addDays(yearEnd, 6 - endWeekday)

  const columns: WeekColumn[] = []
  let lastShownMonth = -1
  let cursor = gridStart

  while (cursor <= gridEnd) {
    const cells: GridCell[] = []
    for (let i = 0; i < 7; i += 1) {
      const cd = parseDate(cursor)
      const isPadding = cd.year !== year
      const isFuture = !isPadding && cursor > todayKST
      const day = dayMap.get(cursor)

      cells.push({
        date: isPadding ? null : cursor,
        count: isPadding ? 0 : (day?.count ?? 0),
        level: isPadding ? 0 : (day?.level ?? 0),
        isPadding,
        isFuture,
        weekday: cd.weekday,
      })
      cursor = addDays(cursor, 1)
    }

    // 월 라벨: 비-패딩 셀 중 첫 번째 셀이 새 달의 1일을 포함하는 주
    let monthLabel: string | null = null
    const firstNonPadding = cells.find((c) => !c.isPadding)
    if (firstNonPadding && firstNonPadding.date) {
      const pd = parseDate(firstNonPadding.date)
      // 그 컬럼 내에 day=1 이 있거나, 컬럼의 시작이 이미 새 달이면 라벨
      const hasFirstOfMonth = cells.some(
        (c) => c.date && parseDate(c.date).day === 1,
      )
      if (hasFirstOfMonth && pd.month !== lastShownMonth) {
        monthLabel = MONTH_LABELS[pd.month - 1]
        lastShownMonth = pd.month
      }
    }

    columns.push({ cells, monthLabel })
  }

  return { columns, todayKST }
}
