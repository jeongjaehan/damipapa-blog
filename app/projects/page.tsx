import { getProjectsList } from '@/utils/projects'
import ProjectGrid from '@/components/projects/ProjectGrid'
import { Card } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사이드 프로젝트 | 다미파파의 블로그',
  description: '다미파파가 개발한 다양한 사이드 프로젝트들을 소개합니다. 웹 애플리케이션부터 모바일 앱까지 다양한 프로젝트를 확인해보세요.',
  keywords: '사이드 프로젝트, 개발 프로젝트, 포트폴리오, 앱 개발, 웹 개발',
  openGraph: {
    title: '다미파파의 사이드 프로젝트',
    description: '다양한 기술로 구현된 창의적인 프로젝트들을 만나보세요.',
    type: 'website',
    url: 'https://damipapa.com/projects',
  },
}

export default async function ProjectsPage() {
  const projects = await getProjectsList()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          사이드 프로젝트
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          저에게 또는 누군가에게 필요한 프로덕틀 만드는 것을 좋아합니다.
          서비스가 잘되면 더 좋지만, 잘 안되더라도 만들어보는 것을 좋아합니다.
        </p>
      </div>

      {/* 프로젝트 그리드 */}
      <Card className="border-border bg-muted/30">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              다양한 프로젝트들을 둘러보세요
            </h2>
            <p className="text-sm text-muted-foreground">
              각 프로젝트를 클릭하면 자세한 정보를 확인할 수 있어요.
            </p>
          </div>
          
          <ProjectGrid projects={projects} />
        </div>
      </Card>

      {/* 하단 안내 */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-full">
          <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
          <span className="text-sm text-indigo-700 dark:text-indigo-300">
            새로운 프로젝트가 계속 추가될 예정입니다
          </span>
        </div>
      </div>
    </div>
  )
}


