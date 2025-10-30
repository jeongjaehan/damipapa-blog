'use client'

import { ProjectListItem } from '@/types'
import ProjectCard from './ProjectCard'

interface ProjectGridProps {
  projects: ProjectListItem[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h.01M17 7h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">아직 프로젝트가 없습니다</h3>
        <p className="text-gray-500 text-sm">곧 멋진 프로젝트들을 선보일 예정입니다!</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* iOS 스타일 앱 그리드 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      
      {/* 프로젝트 개수 표시 */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          총 <span className="font-medium text-gray-700">{projects.length}개</span>의 프로젝트
        </p>
      </div>
    </div>
  )
}
