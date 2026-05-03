'use client'

interface YearSelectorProps {
  years: number[] // 내림차순
  current: number
  onChange: (year: number) => void
  className?: string
}

export default function YearSelector({
  years,
  current,
  onChange,
  className = '',
}: YearSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="연도 선택"
      className={`flex gap-1 text-sm flex-row overflow-x-auto sm:flex-col sm:overflow-visible sm:gap-0.5 ${className}`}
    >
      {years.map((y) => {
        const active = y === current
        return (
          <button
            key={y}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(y)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-left transition-colors ${
              active
                ? 'bg-primary/10 font-semibold text-primary ring-1 ring-primary/20'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:bg-muted/60 focus-visible:text-foreground focus-visible:outline-none'
            }`}
          >
            {y}
          </button>
        )
      })}
    </div>
  )
}
