import { getProjectsList } from '@/utils/projects'
import ProjectGrid from '@/components/projects/ProjectGrid'
import { Card } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '놀이터 | 다미파파의 블로그',
  description: '떠오른 아이디어를 실제 프로덕트로 만드는 것을 좋아합니다.',
  keywords: '놀이터, 사이트 프로젝트, 개발 프로젝트, 포트폴리오, 앱 개발, 웹 개발',
  openGraph: {
    title: '다미파파의 놀이터',
    description: '떠오른 아이디어를 실제 프로덕트로 만드는 것을 좋아합니다.',
    type: 'website',
    url: 'https://damipapa.com/projects',
  },
}

export default async function ProjectsPage() {
  const projects = await getProjectsList()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 인트로 문구 */}
      <div className="text-center mb-12">
        <p className="text-xl sm:text-2xl text-muted-foreground font-medium italic max-w-3xl mx-auto leading-relaxed">
          떠오른 아이디어를 실제 프로덕트로 만드는 것을 좋아합니다
        </p>
      </div>

      {/* 프로젝트 그리드 */}
      <Card className="border-border bg-muted/30">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              다양한 프로젝트들을 둘러보세요
            </h2>
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


