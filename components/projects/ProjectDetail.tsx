'use client'

import { Project, ProjectLinks } from '@/types'
import { generateIconText, getStatusColor, getStatusLabel } from '@/utils/korean'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Tag, Code, Layers } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MermaidDiagram from './MermaidDiagram'
import AppStoreLinks from './AppStoreLinks'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ProjectDetailProps {
  project: Project
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const iconText = generateIconText(project.title)
  const statusColor = getStatusColor(project.status)
  const statusLabel = getStatusLabel(project.status)

  // 마크다운 컴포넌트 정의
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 mt-6 sm:mt-8 first:mt-0 break-words">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 mt-5 sm:mt-6 break-words">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2 sm:mb-3 mt-4 sm:mt-5 break-words">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 break-words">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside text-gray-700 mb-3 sm:mb-4 space-y-1 ml-2 sm:ml-0">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside text-gray-700 mb-3 sm:mb-4 space-y-1 ml-2 sm:ml-0">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="ml-1 sm:ml-2 break-words">{children}</li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-indigo-200 pl-3 sm:pl-4 italic text-gray-600 my-3 sm:my-4 break-words">
        {children}
      </blockquote>
    ),
    code: ({ children, className }: any) => {
      const isBlock = className?.includes('language-mermaid')
      
      if (isBlock && className?.includes('language-mermaid')) {
        return <MermaidDiagram chart={String(children)} className="my-4 sm:my-6" />
      }
      
      if (isBlock) {
        return (
          <div className="my-3 sm:my-4 -mx-2 sm:mx-0">
            <pre className="bg-gray-100 rounded-lg p-3 sm:p-4 overflow-x-auto text-sm">
              <code className={className}>{children}</code>
            </pre>
          </div>
        )
      }
      
      return (
        <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono break-all">
          {children}
        </code>
      )
    },
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900 break-words">{children}</strong>
    ),
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 프로젝트 헤더 */}
      <Card className="border-gray-200 mb-6 sm:mb-8">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* 프로젝트 아이콘 */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl flex-shrink-0"
              style={{ 
                backgroundColor: project.icon.color,
                boxShadow: `0 8px 32px ${project.icon.color}40`
              }}
            >
              {project.icon.type === 'image' ? (
                <img 
                  src={project.icon.value} 
                  alt={project.title}
                  className="w-full h-full rounded-2xl sm:rounded-3xl object-cover"
                />
              ) : (
                <span className="text-white font-bold select-none">
                  {project.icon.value || iconText}
                </span>
              )}
            </div>

            {/* 프로젝트 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-3 sm:mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words hyphens-auto leading-tight">
                  {project.title}
                </h1>
                <Badge 
                  className="w-fit text-white text-xs sm:text-sm px-2 sm:px-3 py-1"
                  style={{ backgroundColor: statusColor }}
                >
                  {statusLabel}
                </Badge>
              </div>
              
              <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4 leading-relaxed break-words">
                {project.subtitle}
              </p>
              
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 break-words leading-relaxed">
                {project.description}
              </p>

              {/* 메타 정보 */}
              <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="break-words">{project.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="break-words">
                    {formatDistanceToNow(new Date(project.updated_at), { 
                      addSuffix: true, 
                      locale: ko 
                    })} 업데이트
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 기술 스택 */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Code className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">기술 스택</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {project.tech_stack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 break-words">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 주요 기능 */}
          {project.features && project.features.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">주요 기능</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {project.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-1 break-words">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 프로젝트 상세 내용 */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-gray-200">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="prose prose-gray max-w-none break-words overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {project.content}
                </ReactMarkdown>
              </div>
            </div>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-4 sm:space-y-6">
          {/* 다운로드 링크 */}
          <Card className="border-gray-200">
            <div className="p-4 sm:p-6">
              <AppStoreLinks links={project.links} title={project.title} />
            </div>
          </Card>

          {/* 프로젝트 정보 */}
          <Card className="border-gray-200">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">프로젝트 정보</h3>
              
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 font-medium">상태:</span>
                  <Badge 
                    className="w-fit text-white text-xs px-2 py-1"
                    style={{ backgroundColor: statusColor }}
                  >
                    {statusLabel}
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 font-medium">카테고리:</span>
                  <span className="text-gray-900 break-words">{project.category}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 font-medium">시작일:</span>
                  <span className="text-gray-900">
                    {new Date(project.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-gray-500 font-medium">최근 업데이트:</span>
                  <span className="text-gray-900">
                    {new Date(project.updated_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
