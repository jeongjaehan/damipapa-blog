'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { TagMetric } from '@/lib/tags/metrics'

interface TagCloudProps {
  tags: TagMetric[]
  className?: string
}

export default function TagCloud({ tags, className }: TagCloudProps) {
  if (!tags.length) {
    return null
  }

  return (
    <ul className={cn('divide-y divide-border border-y border-border', className)}>
      {tags.map((tag) => (
        <li key={tag.name} className="flex items-baseline gap-2 py-2 text-sm">
          <Link
            href={`/?tag=${tag.name}`}
            className={cn(
              'text-foreground underline visited:text-link-visited hover:text-link',
              tag.level >= 4 && 'font-bold'
            )}
          >
            #{tag.name}
          </Link>
          <span className="text-muted-foreground">
            {tag.count}편
            <span aria-hidden="true" className="mx-1 text-border">·</span>
            {tag.ratio.toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  )
}
