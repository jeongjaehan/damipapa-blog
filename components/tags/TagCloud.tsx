'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TagMetric } from '@/lib/tags/metrics'

interface TagCloudProps {
  tags: TagMetric[]
  className?: string
}

interface FloatingConfig {
  x: number
  y: number
  rotate: number
  duration: number
  delay: number
}

const sizeClasses = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl']
const colorClasses = [
  'bg-sky-50 text-sky-700 border-sky-100 shadow-sky-100',
  'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100',
  'bg-violet-50 text-violet-700 border-violet-100 shadow-violet-100',
  'bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100',
]

const hashString = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  return Math.abs(hash)
}

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const createFloatingConfig = (tag: TagMetric, index: number): FloatingConfig => {
  const seed = hashString(`${tag.name}-${index}`)
  const randomX = seededRandom(seed + 1)
  const randomY = seededRandom(seed + 2)
  const randomRotation = seededRandom(seed + 3)
  const randomDuration = seededRandom(seed + 4)
  const randomDelay = seededRandom(seed + 5)

  return {
    x: 15 + randomX * 25,
    y: 10 + randomY * 20,
    rotate: (randomRotation - 0.5) * 8,
    duration: 6 + randomDuration * 4,
    delay: randomDelay * 2,
  }
}

const getSizeClass = (level: number) => sizeClasses[level - 1] ?? sizeClasses[1]
const getColorClass = (level: number) => colorClasses[level - 1] ?? colorClasses[colorClasses.length - 1]

export default function TagCloud({ tags, className }: TagCloudProps) {
  const floatingConfigs = useMemo(
    () => tags.map((tag, index) => createFloatingConfig(tag, index)),
    [tags]
  )

  if (!tags.length) {
    return null
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-slate-100 bg-white/60 p-8 shadow-lg shadow-slate-100',
        'backdrop-blur-lg',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 via-white/40 to-violet-100 opacity-80" />
      <div className="relative flex flex-wrap items-center justify-center gap-6">
        {tags.map((tag, index) => {
          const config = floatingConfigs[index]
          const intensityOpacity = 0.65 + tag.intensity * 0.35

          return (
            <Link key={tag.name} href={`/?tag=${tag.name}`} className="group">
              <motion.span
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-full border px-5 py-2 font-semibold transition-all duration-300',
                  'shadow-lg group-hover:shadow-xl',
                  getSizeClass(tag.level),
                  getColorClass(tag.level)
                )}
                style={{ opacity: intensityOpacity }}
                animate={{
                  x: [0, config.x, -config.x, 0],
                  y: [0, -config.y, config.y, 0],
                  rotate: [0, config.rotate, -config.rotate, 0],
                }}
                transition={{
                  duration: config.duration,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: config.delay,
                }}
                whileHover={{
                  scale: 1.12,
                  rotate: 0,
                  boxShadow: '0 25px 45px rgba(79, 70, 229, 0.25)',
                }}
              >
                <span>#{tag.name}</span>
                <span className="text-xs font-medium text-slate-500 transition-colors duration-300 group-hover:text-slate-700">
                  {tag.count} · {tag.ratio.toFixed(1)}%
                </span>
              </motion.span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

