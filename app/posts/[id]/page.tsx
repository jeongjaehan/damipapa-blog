import type { Metadata } from 'next'
import PostPageClient from './page-client'

// 메타데이터 생성 (서버 사이드)
async function getPostData(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    const response = await fetch(`${baseUrl}/posts/${id}`, {
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const post = await getPostData(id)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/posts/${id}`

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
      description: '요청한 포스트를 찾을 수 없습니다.',
    }
  }

  const title = post.title
  const description = post.content
    ?.replace(/<[^>]*>/g, '')
    ?.substring(0, 160) || '다미파파의 블로그'
  
  return {
    title: title,
    description: description,
    keywords: post.tags?.join(', ') || [],
    authors: [{ name: post.author?.name || '다미파파' }],
    openGraph: {
      type: 'article',
      title: title,
      description: description,
      url: postUrl,
      siteName: '다미파파의 블로그',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name || '다미파파'],
      tags: post.tags || [],
      images: [
        {
          url: `${baseUrl}/og-image.png`,
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

