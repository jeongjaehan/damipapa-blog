'use client'

import React, { useState } from 'react'
import { Career, CareerProfile } from '@/types'
import { Mail, Linkedin, Building2, Briefcase, FileText, BookOpen, MapPin, Calendar, ChevronDown, ExternalLink } from 'lucide-react'
import { SegmentedControl } from '@/components/ui/segmented-control'

/* ── Facebook icon ── */
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

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

/* ── Accent color per card index ── */
const accentColors = [
  { dot: 'bg-primary', badge: 'bg-primary/10 text-primary', gradient: 'from-primary/80 to-primary' },
  { dot: 'bg-accent-foreground', badge: 'bg-accent text-accent-foreground', gradient: 'from-accent to-accent/80' },
  { dot: 'bg-secondary-foreground', badge: 'bg-secondary text-secondary-foreground', gradient: 'from-secondary to-secondary/80' },
  { dot: 'bg-primary/70', badge: 'bg-warm-highlight text-primary-700', gradient: 'from-primary/60 to-accent' },
  { dot: 'bg-accent-foreground/70', badge: 'bg-accent/60 text-accent-foreground', gradient: 'from-accent/60 to-secondary' },
  { dot: 'bg-secondary-foreground/70', badge: 'bg-secondary/60 text-secondary-foreground', gradient: 'from-secondary/60 to-primary' },
]

/* ── Expandable Career Card ── */
function CareerCard({ career, index, viewMode }: {
  career: Career
  index: number
  viewMode: 'resume' | 'story'
}) {
  const [expanded, setExpanded] = useState(index === 0)
  const isCurrent = career.endDate === null
  const colors = accentColors[index % accentColors.length]

  const description = viewMode === 'resume'
    ? (career.summaryDescription || career.description)
    : (career.narrativeDescription || career.description)

  return (
    <div className="group">
      {/* ── Card ── */}
      <div
        className={`
          relative bg-card border rounded-2xl overflow-hidden transition-all duration-300
          ${expanded ? 'border-primary/20 shadow-warm-md' : 'border-border/60 shadow-warm-sm hover:shadow-warm-md hover:border-border'}
        `}
      >
        {/* Top accent stripe */}
        <div className={`h-1 w-full bg-gradient-to-r ${colors.gradient}`} />

        {/* Header — always visible, clickable */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-5 sm:p-6 flex items-start gap-4 cursor-pointer"
        >
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md`}>
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {career.title}
              </h3>
              {isCurrent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  재직 중
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{career.subtitle}</span>
            </p>

            {/* Period & Duration — clean inline layout */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(career.startDate)} ~ {isCurrent ? '현재' : formatDate(career.endDate!)}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors.badge}`}>
                {calculateWorkPeriod(career.startDate, career.endDate)}
              </span>
            </div>
          </div>

          {/* Expand chevron */}
          <div className="flex-shrink-0 mt-1">
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Body — collapsible description */}
        {expanded && description && (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
            <div className="border-t border-border/50 pt-4">
              <div className={`
                text-sm sm:text-base leading-relaxed text-foreground/80 whitespace-pre-wrap break-words
                ${viewMode === 'story' ? 'max-w-prose' : ''}
              `}>
                {description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═════════ MAIN COMPONENT ═════════ */
export default function CareerTimeline({ profile, careers }: CareerTimelineProps) {
  const [viewMode, setViewMode] = useState<'resume' | 'story'>('resume')

  return (
    <div className="space-y-8 sm:space-y-10">

      {/* ═══ PROFILE SECTION ═══ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm-highlight via-card to-accent/20 border border-border/60 p-6 sm:p-8">
        {/* Decorative blob */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Name + Experience */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-warm-md ring-2 ring-white/80 flex-shrink-0"
              />
            )}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {profile.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-base sm:text-lg text-muted-foreground font-medium">
                  {profile.bio}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {calculateTotalExperience(careers)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact links — clean pill style */}
          <div className="flex flex-wrap gap-2 mt-5">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/80 border border-border/60 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200 backdrop-blur-sm"
            >
              <Mail className="w-4 h-4" />
              <span className="font-medium">{profile.email}</span>
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/80 border border-border/60 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200 backdrop-blur-sm"
            >
              <Linkedin className="w-4 h-4" />
              <span className="font-medium">LinkedIn</span>
              <ExternalLink className="w-3 h-3 opacity-40" />
            </a>
            {profile.facebook && (
              <a
                href={profile.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card/80 border border-border/60 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200 backdrop-blur-sm"
              >
                <FacebookIcon className="w-4 h-4" />
                <span className="font-medium">Facebook</span>
                <ExternalLink className="w-3 h-3 opacity-40" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══ VIEW MODE TOGGLE ═══ */}
      <section>
        <SegmentedControl
          options={[
            { value: 'resume', label: '요약형', icon: FileText },
            { value: 'story', label: '서술형', icon: BookOpen },
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value as 'resume' | 'story')}
        />
        <p className="text-xs text-muted-foreground mt-2 ml-1">
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
