import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { ProjectMetadata, ProjectListItem, Project } from '@/types'

const PROJECTS_DIR = join(process.cwd(), 'data/projects')

/**
 * 프로젝트 목록을 가져옵니다.
 */
export async function getProjectsList(): Promise<ProjectListItem[]> {
  try {
    const indexPath = join(PROJECTS_DIR, 'index.json')
    const indexContent = await readFile(indexPath, 'utf-8')
    const indexProjects: ProjectListItem[] = JSON.parse(indexContent)
    
    // 각 프로젝트의 메타데이터를 읽어서 아이콘 자동 감지 적용
    const projectsWithIcons = await Promise.all(
      indexProjects.map(async (project) => {
        const metadata = await getProjectMetadata(project.slug)
        if (metadata?.icon) {
          // 아이콘 타입에 따라 적절한 값 설정
          return {
            ...project,
            icon: metadata.icon.value,
            iconColor: metadata.icon.color,
            iconType: metadata.icon.type as 'image' | 'text'
          }
        }
        return project
      })
    )
    
    return projectsWithIcons.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Failed to load projects list:', error)
    return []
  }
}

/**
 * 특정 프로젝트의 메타데이터를 가져옵니다.
 */
export async function getProjectMetadata(slug: string): Promise<ProjectMetadata | null> {
  try {
    const projectDir = join(PROJECTS_DIR, slug)
    const metadataPath = join(projectDir, 'metadata.json')
    const metadataContent = await readFile(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent)
    
    // 아이콘 파일 자동 감지
    if (metadata.icon?.type === 'auto') {
      const iconFile = await findIconFile(projectDir)
      if (iconFile) {
        metadata.icon.type = 'image'
        metadata.icon.value = `/api/projects/${slug}/icon/${iconFile}`
      } else {
        metadata.icon.type = 'text'
        // value와 color는 기존 값 유지
      }
    }
    
    return metadata
  } catch (error) {
    console.error(`Failed to load metadata for project ${slug}:`, error)
    return null
  }
}

/**
 * 특정 프로젝트의 상세 내용을 가져옵니다.
 */
export async function getProjectContent(slug: string): Promise<string | null> {
  try {
    const contentPath = join(PROJECTS_DIR, slug, 'content.md')
    return await readFile(contentPath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load content for project ${slug}:`, error)
    return null
  }
}

/**
 * 특정 프로젝트의 전체 정보를 가져옵니다.
 */
export async function getProject(slug: string): Promise<Project | null> {
  try {
    const [metadata, content] = await Promise.all([
      getProjectMetadata(slug),
      getProjectContent(slug)
    ])
    
    if (!metadata || !content) {
      return null
    }
    
    return {
      ...metadata,
      slug,
      content
    }
  } catch (error) {
    console.error(`Failed to load project ${slug}:`, error)
    return null
  }
}

/**
 * 모든 프로젝트의 slug 목록을 가져옵니다 (static generation용).
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const projects = await getProjectsList()
    return projects.map(project => project.slug)
  } catch (error) {
    console.error('Failed to get project slugs:', error)
    return []
  }
}

/**
 * 프로젝트 상태별 통계를 가져옵니다.
 */
export async function getProjectStats() {
  try {
    const projects = await getProjectsList()
    
    const stats = {
      total: projects.length,
      planning: 0,
      inProgress: 0,
      completed: 0,
      launched: 0,
      paused: 0
    }
    
    projects.forEach(project => {
      switch (project.status) {
        case 'planning':
          stats.planning++
          break
        case 'in-progress':
          stats.inProgress++
          break
        case 'completed':
          stats.completed++
          break
        case 'launched':
          stats.launched++
          break
        case 'paused':
          stats.paused++
          break
      }
    })
    
    return stats
  } catch (error) {
    console.error('Failed to get project stats:', error)
    return {
      total: 0,
      planning: 0,
      inProgress: 0,
      completed: 0,
      launched: 0,
      paused: 0
    }
  }
}

/**
 * 프로젝트 폴더에서 아이콘 파일을 자동으로 찾습니다.
 */
async function findIconFile(projectDir: string): Promise<string | null> {
  try {
    const files = await readdir(projectDir)
    const iconExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg']
    
    for (const ext of iconExtensions) {
      const iconFile = files.find(file => 
        file.toLowerCase() === `icon.${ext}`
      )
      if (iconFile) {
        return iconFile
      }
    }
    return null
  } catch {
    return null
  }
}
