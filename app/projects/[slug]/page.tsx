import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getProject, getAllProjectSlugs } from '@/utils/projects'
import ProjectDetail from '@/components/projects/ProjectDetail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  
  if (!project) {
    return {
      title: '프로젝트를 찾을 수 없습니다',
    }
  }

  return {
    title: `${project.title} | 사이드 프로젝트 | 다미파파의 블로그`,
    description: project.description,
    keywords: `${project.title}, ${project.category}, ${project.tech_stack.join(', ')}, 사이드 프로젝트`,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'article',
      url: `https://damipapa.com/projects/${slug}`,
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProject(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 뒤로 가기 버튼 */}
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            프로젝트 목록으로
          </Button>
        </Link>
      </div>

      {/* 프로젝트 상세 정보 */}
      <ProjectDetail project={project} />
    </div>
  )
}


