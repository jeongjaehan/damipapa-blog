'use client'

import React from 'react'
import { Career, CareerProfile } from '@/types'
import { Mail, Linkedin, Building2, Briefcase } from 'lucide-react'

interface CareerTimelineProps {
  profile: CareerProfile
  careers: Career[]
}

export default function CareerTimeline({ profile, careers }: CareerTimelineProps) {

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}.${month}`
  }

  const calculateWorkPeriod = (startDate: string, endDate: string | null): string => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    
    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    
    if (months < 0) {
      years--
      months += 12
    }
    
    if (years === 0 && months === 0) {
      return '1개월 미만'
    }
    
    if (years === 0) {
      return `${months}개월`
    }
    
    if (months === 0) {
      return `${years}년`
    }
    
    return `${years}년 ${months}개월`
  }

  const calculateTotalExperience = (careers: Career[]): string => {
    let totalMonths = 0
    
    careers.forEach(career => {
      const start = new Date(career.startDate)
      const end = career.endDate ? new Date(career.endDate) : new Date()
      
      let years = end.getFullYear() - start.getFullYear()
      let months = end.getMonth() - start.getMonth()
      
      if (months < 0) {
        years--
        months += 12
      }
      
      totalMonths += years * 12 + months
    })
    
    const totalYears = Math.floor(totalMonths / 12)
    const remainingMonths = totalMonths % 12
    
    if (totalYears === 0 && remainingMonths === 0) {
      return '1개월 미만'
    }
    
    if (totalYears === 0) {
      return `${remainingMonths}개월`
    }
    
    if (remainingMonths === 0) {
      return `${totalYears}년`
    }
    
    return `${totalYears}년 ${remainingMonths}개월`
  }

  const getColorClass = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-green-500 to-green-600',
      'from-indigo-500 to-indigo-600',
    ]
    return colors[index % colors.length]
  }

  const getDotColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-green-500',
      'bg-indigo-500',
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* 프로필 카드 */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {profile.avatar && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg ring-4 ring-white flex-shrink-0">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-2xl object-cover" />
            </div>
          )}
          
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">{profile.name}</h2>
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                경력 {calculateTotalExperience(careers)}
              </span>
            </div>
            <p className="text-base sm:text-xl text-gray-700 mb-4 sm:mb-6 font-medium break-words">{profile.bio}</p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6">
              <a
                href={`mailto:${profile.email}`}
                className="group flex items-center gap-3 px-3 sm:px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 hover:text-blue-600 text-sm sm:text-base"
              >
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-medium truncate">{profile.email}</span>
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-3 sm:px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 hover:text-blue-600 text-sm sm:text-base"
              >
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-medium">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 경력 타임라인 */}
      <div className="relative">
        {/* 수직 타임라인 */}
        <div className="absolute left-3 sm:left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-60" />

        {/* 경력 항목들 */}
        <div className="space-y-4 sm:space-y-6">
          {careers.map((career, index) => {
            const isCurrent = career.endDate === null
            const colorClass = getColorClass(index)
            const dotColor = getDotColor(index)
            
            return (
              <div
                key={career.id}
                className="relative pl-8 sm:pl-12"
              >
                {/* 타임라인 점 */}
                <div className={`absolute left-3 sm:left-0 top-2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full ${dotColor} shadow-lg ring-2 sm:ring-4 ring-white z-10`} />

                {/* 연도 표시 (점 아래에 수평으로) */}
                <div className="absolute left-3 sm:left-0 top-6 sm:top-8 transform -translate-x-1/2 text-center z-30">
                  <div className="text-xs font-bold text-gray-700 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm border border-gray-200 leading-tight sm:leading-relaxed whitespace-nowrap">
                    <div>{formatDate(career.startDate)}</div>
                    {isCurrent ? (
                      <div className="text-green-600">~ 재직 중</div>
                    ) : (
                      <div>~ {formatDate(career.endDate!)}</div>
                    )}
                  </div>
                  
                  {/* 근무기간 뱃지 */}
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                      isCurrent 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {calculateWorkPeriod(career.startDate, career.endDate)}
                    </span>
                  </div>
                </div>

                {/* 경력 카드 */}
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* 아이콘 */}
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                      <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    
                    {/* 회사 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 break-words">{career.title}</h3>
                      <p className="text-sm sm:text-lg text-gray-600 flex items-start sm:items-center gap-2 break-words">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="break-words">{career.subtitle}</span>
                      </p>
                    </div>
                  </div>

                  {/* 상세 설명 */}
                  {career.description && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {career.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
