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
    <div className="space-y-12">
      {/* 프로필 카드 */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-start gap-6">
          {profile.avatar && (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-2xl object-cover" />
            </div>
          )}
          
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">{profile.name}</h2>
            <p className="text-xl text-gray-700 mb-6 font-medium">{profile.bio}</p>
            
            <div className="flex flex-wrap gap-6">
              <a
                href={`mailto:${profile.email}`}
                className="group flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 hover:text-blue-600"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-medium">{profile.email}</span>
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-700 hover:text-blue-600"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Linkedin className="w-5 h-5" />
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
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-60" />

        {/* 경력 항목들 */}
        <div className="space-y-6">
          {careers.map((career, index) => {
            const isCurrent = career.endDate === null
            const colorClass = getColorClass(index)
            const dotColor = getDotColor(index)
            
            return (
              <div
                key={career.id}
                className="relative pl-12"
              >
                {/* 타임라인 점 */}
                <div className={`absolute left-0 top-2 transform -translate-x-1/2 w-4 h-4 rounded-full ${dotColor} shadow-lg ring-4 ring-white z-10`} />

                {/* 연도 표시 (점 아래에 수평으로) */}
                <div className="absolute left-0 top-8 transform -translate-x-1/2 text-center z-30">
                  <div className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200 leading-relaxed">
                    <div>{formatDate(career.startDate)}</div>
                    {isCurrent ? (
                      <div className="text-green-600">~ 진행중</div>
                    ) : (
                      <div>~ {formatDate(career.endDate!)}</div>
                    )}
                  </div>
                </div>

                {/* 경력 카드 */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start gap-4 mb-4">
                    {/* 아이콘 */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* 회사 정보 */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{career.title}</h3>
                      <p className="text-lg text-gray-600 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {career.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* 상세 설명 */}
                  {career.description && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
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
