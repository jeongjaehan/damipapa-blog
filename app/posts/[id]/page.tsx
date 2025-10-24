import type { Metadata } from 'next'
import PostPageClient from './page-client'

// 메타데이터 생성 (서버 사이드)
async function getPostData(id: string) {
  try {
    // 서버 사이드에서는 절대 URL 사용
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api`
    
    // 타임아웃 설정
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3초 타임아웃
    
    const response = await fetch(`${apiUrl}/posts/${id}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error(`Failed to fetch post ${id}: ${response.status} ${response.statusText}`)
      return null
    }
    return response.json()
  } catch (error) {
    console.error('Failed to fetch post:', error)
    // API 호출 실패 시 null 반환 (기본 메타데이터 사용)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const post = await getPostData(id)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/posts/${id}`

  if (!post) {
    // 포스트를 찾을 수 없는 경우에도 기본 메타데이터 제공
    return {
      title: '포스트를 찾을 수 없습니다 | 다미파파의 블로그',
      description: '요청한 포스트를 찾을 수 없습니다.',
      openGraph: {
        title: '포스트를 찾을 수 없습니다 | 다미파파의 블로그',
        description: '요청한 포스트를 찾을 수 없습니다.',
        url: postUrl,
        siteName: '다미파파의 블로그',
      },
      twitter: {
        card: 'summary',
        title: '포스트를 찾을 수 없습니다 | 다미파파의 블로그',
        description: '요청한 포스트를 찾을 수 없습니다.',
      },
    }
  }

  const title = post.title
  const description = post.content
    ?.replace(/<[^>]*>/g, '')
    ?.substring(0, 160) || '다미파파의 블로그'
  
  const siteTitle = '다미파파의 블로그'
  const fullTitle = `${siteTitle} - ${title}`
  
  return {
    title: fullTitle,
    description: description,
    keywords: post.tags?.join(', ') || [],
    authors: [{ name: post.author?.name || '다미파파' }],
    openGraph: {
      type: 'article',
      title: fullTitle,
      description: description,
      url: postUrl,
      siteName: siteTitle,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || '다미파파'],
      tags: post.tags || [],
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PostPageClient postId={id} />
}

