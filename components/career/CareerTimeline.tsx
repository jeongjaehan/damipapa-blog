'use client'

import React, { useState } from 'react'
import { Career, CareerProfile } from '@/types'
import { Mail, Linkedin } from 'lucide-react'

interface CareerTimelineProps {
  profile: CareerProfile
  careers: Career[]
}

export default function CareerTimeline({ profile, careers }: CareerTimelineProps) {
  const [hoveredCareer, setHoveredCareer] = useState<Career | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (career: Career, event: React.MouseEvent) => {
    if (career.description) {
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        x: rect.right + 10,
        y: rect.top + rect.height / 2,
      })
      setHoveredCareer(career)
    }
  }

  const handleMouseLeave = () => {
    setHoveredCareer(null)
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}.${month}`
  }

  const formatDateRange = (startDate: string, endDate: string | null): string => {
    const start = formatDate(startDate)
    const end = endDate ? formatDate(endDate) : '현재'
    return `${start} - ${end}`
  }

  // 프로필 카드 섹션
  return (
    <div className="space-y-12">
      {/* 프로필 카드 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
        <div className="flex items-start gap-6">
          {/* 프로필 이미지 (선택사항) */}
          {profile.avatar && (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold text-white shadow-xl">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            </div>
          )}
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
            <p className="text-lg text-gray-600 mb-4">{profile.bio}</p>
            
            <div className="flex flex-wrap gap-4">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{profile.email}</span>
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 경력 타임라인 */}
      <div className="relative">
        {/* 수직 타임라인 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

        {/* 경력 항목들 */}
        <div className="space-y-8">
          {careers.map((career, index) => (
            <div
              key={career.id}
              className="relative"
              onMouseEnter={(e) => handleMouseEnter(career, e)}
              onMouseLeave={handleMouseLeave}
            >
              {/* 타임라인 점 */}
              <div
                className={`absolute left-8 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-lg transition-all hover:scale-125 ${
                  index % 4 === 0
                    ? 'bg-blue-500'
                    : index % 4 === 1
                    ? 'bg-purple-500'
                    : index % 4 === 2
                    ? 'bg-pink-500'
                    : 'bg-orange-500'
                }`}
              />

              {/* 경력 카드 */}
              <div className="ml-20 bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md ${
                      index % 4 === 0
                        ? 'bg-blue-500'
                        : index % 4 === 1
                        ? 'bg-purple-500'
                        : index % 4 === 2
                        ? 'bg-pink-500'
                        : 'bg-orange-500'
                    }`}
                  >
                    {career.endDate === null ? '진행중' : formatDateRange(career.startDate, career.endDate)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{career.title}</h3>
                    <p className="text-gray-600">{career.subtitle}</p>
                    {career.description && (
                      <div className="mt-2 text-sm text-blue-600">상세 정보 보기 →</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 툴팁 */}
              {hoveredCareer?.id === career.id && hoveredCareer.description && (
                <div
                  className="absolute z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm"
                  style={{
                    top: tooltipPosition.y,
                    left: tooltipPosition.x,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="absolute left-0 top-1/2 transform -translate-x-full">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-900" />
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{hoveredCareer.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

