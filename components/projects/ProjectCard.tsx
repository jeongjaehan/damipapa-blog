'use client'

import Link from 'next/link'
import { ProjectListItem } from '@/types'
import { generateIconText, getStatusColor, getStatusLabel } from '@/utils/korean'

interface ProjectCardProps {
  project: ProjectListItem
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const iconText = generateIconText(project.title)
  const statusColor = getStatusColor(project.status)
  const statusLabel = getStatusLabel(project.status)

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="group flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-gray-50/80 transition-all duration-200 cursor-pointer">
        {/* 앱 아이콘 */}
        <div className="relative">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl group-hover:scale-105 transition-transform duration-200"
            style={{ 
              backgroundColor: project.iconColor,
              boxShadow: `0 4px 20px ${project.iconColor}40`
            }}
          >
            {project.iconType === 'image' && project.icon ? (
              <img 
                src={project.icon} 
                alt={project.title}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-white font-bold select-none">
                {project.iconType === 'text' && project.icon ? project.icon : iconText}
              </span>
            )}
          </div>
          
          {/* 상태 뱃지 */}
          <div 
            className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: statusColor }}
            title={statusLabel}
          />
        </div>

        {/* 프로젝트 정보 */}
        <div className="text-center space-y-1 min-h-[3rem] flex flex-col justify-center">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 leading-tight break-words max-w-[80px] sm:max-w-[100px]">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-xs text-gray-500 leading-tight break-words max-w-[80px] sm:max-w-[100px]">
              {project.description.length > 20 
                ? `${project.description.slice(0, 20)}...` 
                : project.description
              }
            </p>
          )}
        </div>

        {/* 진행 상태 라벨 */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span 
            className="px-2 py-1 text-xs font-medium rounded-full text-white shadow-sm"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}
