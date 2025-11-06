'use client'

import type { PostSummary } from '@/types'

export const TAG_LEVELS = 5

export interface TagMetric {
  name: string
  count: number
  ratio: number
  intensity: number
  level: number
}

const normalizeCount = (count: number, min: number, max: number): number => {
  if (max === min) {
    return 0.5
  }
  return (count - min) / (max - min)
}

export const buildTagMetrics = (posts: PostSummary[]): TagMetric[] => {
  if (!posts.length) {
    return []
  }

  const tagMap = new Map<string, number>()

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })

  if (!tagMap.size) {
    return []
  }

  const counts = Array.from(tagMap.values())
  const maxCount = Math.max(...counts)
  const minCount = Math.min(...counts)

  return Array.from(tagMap.entries())
    .map(([name, count]) => {
      const intensity = normalizeCount(count, minCount, maxCount)
      const level = Math.min(TAG_LEVELS, Math.max(1, Math.round(intensity * (TAG_LEVELS - 1)) + 1))

      return {
        name,
        count,
        ratio: (count / posts.length) * 100,
        intensity,
        level,
      }
    })
    .sort((a, b) => b.ratio - a.ratio)
}

export type { TagMetric as TagMetricWithIntensity }

