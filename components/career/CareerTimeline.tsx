'use client'

import React, { useState } from 'react'
import { Career, CareerProfile } from '@/types'

interface CareerTimelineProps {
  profile: CareerProfile
  careers: Career[]
}

/* ── Helper functions ── */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

function calculateWorkPeriod(startDate: string, endDate: string | null): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0 && months === 0) return '1개월 미만'
  if (years === 0) return `${months}개월`
  if (months === 0) return `${years}년`
  return `${years}년 ${months}개월`
}

function calculateTotalExperience(careers: Career[]): string {
  let totalMonths = 0
  careers.forEach(career => {
    const start = new Date(career.startDate)
    const end = career.endDate ? new Date(career.endDate) : new Date()
    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    if (months < 0) { years--; months += 12 }
    totalMonths += years * 12 + months
  })
  const totalYears = Math.floor(totalMonths / 12)
  const remainingMonths = totalMonths % 12
  if (totalYears === 0 && remainingMonths === 0) return '1개월 미만'
  if (totalYears === 0) return `${remainingMonths}개월`
  if (remainingMonths === 0) return `${totalYears}년`
  return `${totalYears}년 ${remainingMonths}개월`
}

/* ── Expandable Career Card ── */
function CareerCard({ career, index, viewMode }: {
  career: Career
  index: number
  viewMode: 'resume' | 'story'
}) {
  const [expanded, setExpanded] = useState(index === 0)
  const isCurrent = career.endDate === null

  const description = viewMode === 'resume'
    ? (career.summaryDescription || career.description)
    : (career.narrativeDescription || career.description)

  return (
    <section className={index > 0 ? 'border-t border-border pt-4' : ''}>
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full text-left"
      >
        <h3 className="text-lg font-bold text-foreground">
          {career.title}
          {isCurrent && <span className="ml-2 text-sm font-normal text-muted-foreground">(재직중)</span>}
          <span className="ml-2 text-sm font-normal text-muted-foreground">{expanded ? '−' : '+'}</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          {career.subtitle} · {formatDate(career.startDate)} ~ {isCurrent ? '현재' : formatDate(career.endDate!)}
          {' '}({calculateWorkPeriod(career.startDate, career.endDate)})
        </p>
      </button>

      {expanded && description && (
        <div className="mt-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
          {description}
        </div>
      )}
    </section>
  )
}

/* ═════════ MAIN COMPONENT ═════════ */
export default function CareerTimeline({ profile, careers }: CareerTimelineProps) {
  const [viewMode, setViewMode] = useState<'resume' | 'story'>('resume')

  return (
    <div className="space-y-8">

      {/* ═══ PROFILE SECTION ═══ */}
      <section className="border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 border border-border object-cover flex-shrink-0"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {profile.name}
            </h2>
            <p className="text-base text-muted-foreground">
              {profile.bio} · 경력 {calculateTotalExperience(careers)}
            </p>
          </div>
        </div>

        {/* Contact links */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <a
            href={`mailto:${profile.email}`}
            className="text-link hover:underline"
          >
            이메일
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:underline"
          >
            LinkedIn
          </a>
          {profile.facebook && (
            <a
              href={profile.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              Facebook
            </a>
          )}
        </div>
      </section>

      {/* ═══ VIEW MODE TOGGLE ═══ */}
      <section>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setViewMode('resume')}
            className={viewMode === 'resume' ? 'font-bold text-foreground' : 'text-link hover:underline'}
          >
            이력서
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => setViewMode('story')}
            className={viewMode === 'story' ? 'font-bold text-foreground' : 'text-link hover:underline'}
          >
            스토리
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {viewMode === 'resume'
            ? '핵심 성과 위주로 요약된 이력입니다'
            : '경험과 맥락을 담은 서술형 이력입니다'}
        </p>
      </section>

      {/* ═══ CAREER CARDS ═══ */}
      <section className="space-y-4">
        {careers.map((career, index) => (
          <CareerCard
            key={career.id}
            career={career}
            index={index}
            viewMode={viewMode}
          />
        ))}
      </section>
    </div>
  )
}
