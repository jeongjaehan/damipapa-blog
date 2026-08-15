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
            className={`shrink-0 px-3 py-1.5 text-left ${
              active
                ? 'font-bold'
                : 'text-link hover:underline'
            }`}
          >
            {y}
          </button>
        )
      })}
    </div>
  )
}
