'use client'

const LEVEL_BG: Record<number, string> = {
  0: 'bg-[hsl(var(--heatmap-l0))]',
  1: 'bg-[hsl(var(--heatmap-l1))]',
  2: 'bg-[hsl(var(--heatmap-l2))]',
  3: 'bg-[hsl(var(--heatmap-l3))]',
  4: 'bg-[hsl(var(--heatmap-l4))]',
}

const LEVEL_HINT: Record<number, string> = {
  0: '작성 없음',
  1: '1편',
  2: '2편',
  3: '3편',
  4: '4편 이상',
}

export default function Legend({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-1 text-[11px] text-muted-foreground ${className}`}
      aria-label="잔디 색상 범례"
    >
      <span>Less</span>
      {[0, 1, 2, 3, 4].map((level) => (
        <span
          key={level}
          aria-label={`${LEVEL_HINT[level]} 작성한 날`}
          title={LEVEL_HINT[level]}
          className={`h-[11px] w-[11px] rounded-[2px] ${LEVEL_BG[level]}`}
        />
      ))}
      <span>More</span>
    </div>
  )
}
