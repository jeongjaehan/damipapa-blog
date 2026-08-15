import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getProject, getAllProjectSlugs } from '@/utils/projects'
import ProjectDetail from '@/components/projects/ProjectDetail'
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
    <div className="px-4 py-4">
      {/* 뒤로 가기 버튼 */}
      <div className="mb-4 sm:mb-6">
        <Link href="/projects" className="text-sm text-link hover:underline sm:text-base">
          « 목록으로
        </Link>
      </div>

      {/* 프로젝트 상세 정보 */}
      <ProjectDetail project={project} />
    </div>
  )
}


