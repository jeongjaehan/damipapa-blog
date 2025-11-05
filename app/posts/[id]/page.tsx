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
  
  // 포스트 내용에서 텍스트 추출 (HTML 태그, 마크다운 링크, 이미지 제거)
  const extractText = (content: string): string => {
    if (!content) return '다미파파의 블로그'
    
    // HTML 태그 제거
    let text = content.replace(/<[^>]*>/g, '')
    
    // 마크다운 이미지 제거: ![alt](url) 형식
    text = text.replace(/!\[.*?\]\(.*?\)/g, '')
    
    // 마크다운 링크 제거: [text](url) 형식, 텍스트만 남김
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    
    // 마크다운 헤더 제거 (# 제거)
    text = text.replace(/^#{1,6}\s+/gm, '')
    
    // 코드 블록 제거
    text = text.replace(/```[\s\S]*?```/g, '')
    text = text.replace(/`[^`]+`/g, '')
    
    // 여러 공백을 하나로
    text = text.replace(/\s+/g, ' ').trim()
    
    return text.substring(0, 160) || '다미파파의 블로그'
  }
  
  const description = extractText(post.content || '')
  
  // 포스트 내용에서 첫 이미지 URL 추출
  const extractFirstImage = (content: string): string | null => {
    if (!content) return null
    
    // 마크다운 이미지 형식: ![alt](url)
    const markdownImageMatch = content.match(/!\[.*?\]\((.*?)\)/)
    if (markdownImageMatch && markdownImageMatch[1]) {
      const imageUrl = markdownImageMatch[1]
      // 절대 URL인 경우 그대로 사용, 상대 URL인 경우 baseUrl 추가
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
      }
      if (imageUrl.startsWith('/')) {
        return `${baseUrl}${imageUrl}`
      }
      return `${baseUrl}/${imageUrl}`
    }
    
    // HTML img 태그 형식
    const htmlImageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/)
    if (htmlImageMatch && htmlImageMatch[1]) {
      const imageUrl = htmlImageMatch[1]
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
      }
      if (imageUrl.startsWith('/')) {
        return `${baseUrl}${imageUrl}`
      }
      return `${baseUrl}/${imageUrl}`
    }
    
    return null
  }
  
  const firstImage = extractFirstImage(post.content || '')
  const ogImage = firstImage || `${baseUrl}/og-image.png`
  
  const siteTitle = '다미파파의 블로그'
  const fullTitle = `${siteTitle} - ${title}`
  
  return {
    title: fullTitle,
    description: description,
    keywords: post.tags?.join(', ') || [],
    authors: [{ name: post.author?.name || '다미파파' }],
    openGraph: {
      type: 'article',
      title: title, // 제목에 사이트명 중복 제거
      description: description,
      url: postUrl,
      siteName: siteTitle,
      locale: 'ko_KR',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || '다미파파'],
      tags: post.tags || [],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
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

