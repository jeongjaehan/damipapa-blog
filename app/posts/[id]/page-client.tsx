'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPost } from '@/services/api'
import { PostDetail as PostDetailType } from '@/types'
import PostDetail from '@/components/post/PostDetail'
import FacebookComments from '@/components/comment/FacebookComments'
import Loading from '@/components/common/Loading'
import { trackPostView } from '@/lib/gtag'

export default function PostPageClient({ postId }: { postId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [post, setPost] = useState<PostDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getPost(parseInt(postId))
        setPost(data)
        
        // 게시글 조회 추적
        trackPostView(postId, data.title)
        
        // 동적으로 메타데이터 업데이트
        updatePageMetadata(data)
      } catch (error) {
        console.error('포스트 로딩 실패:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      loadPost()
    }
  }, [postId, router])

  // 페이지 메타데이터 동적 업데이트
  const updatePageMetadata = (postData: PostDetailType) => {
    if (typeof window === 'undefined') return
    
    const siteTitle = '다미파파의 블로그'
    const fullTitle = `${siteTitle} - ${postData.title}`
    const description = postData.content
      ?.replace(/<[^>]*>/g, '')
      ?.substring(0, 160) || '다미파파의 블로그'
    
    // 페이지 제목 업데이트
    document.title = fullTitle
    
    // 메타 태그 업데이트
    updateMetaTag('description', description)
    updateMetaTag('og:title', fullTitle)
    updateMetaTag('og:description', description)
    updateMetaTag('og:url', window.location.href)
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', description)
  }

  // 메타 태그 업데이트 헬퍼 함수
  const updateMetaTag = (property: string, content: string) => {
    if (typeof window === 'undefined') return
    
    // 기존 태그 찾기
    let metaTag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
    if (!metaTag) {
      metaTag = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement
    }
    
    if (metaTag) {
      metaTag.content = content
    } else {
      // 새 태그 생성
      metaTag = document.createElement('meta')
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        metaTag.setAttribute('property', property)
      } else {
        metaTag.setAttribute('name', property)
      }
      metaTag.content = content
      document.head.appendChild(metaTag)
    }
  }

  if (loading || !post) {
    return <Loading />
  }

  const postUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/posts/${post.id}`
    : `http://localhost:3000/posts/${post.id}`

  return (
    <div>
      <PostDetail post={post} />
      {!post.isPrivate && <FacebookComments url={postUrl} />}
    </div>
  )
}
