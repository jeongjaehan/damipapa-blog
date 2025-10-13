'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PostList from '@/components/post/PostList'
import { getPosts } from '@/services/api'
import { PageResponse, PostSummary } from '@/types'
import Loading from '@/components/common/Loading'
import { Badge } from '@/components/ui/badge'

function HomeContent() {
  const searchParams = useSearchParams()
  const [postsData, setPostsData] = useState<PageResponse<PostSummary> | null>(null)
  const [loading, setLoading] = useState(true)

  const page = parseInt(searchParams.get('page') || '0')
  const tag = searchParams.get('tag') || undefined
  const category = searchParams.get('category') || undefined

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      try {
        const data = await getPosts(page, 10, tag, category)
        setPostsData(data)
      } catch (error) {
        console.error('포스트 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [page, tag, category])

  if (loading || !postsData) {
    return <Loading />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">최신 포스트</h1>
        <p className="text-gray-600 mt-3">블로그의 최신 글을 확인하세요</p>
      </div>
      
      {(tag || category) && (
        <div className="flex gap-2">
          {tag && (
            <Badge variant="outline" className="border-primary-200 text-primary-700">
              태그: {tag}
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
              카테고리: {category}
            </Badge>
          )}
        </div>
      )}
      
      <PostList initialData={postsData} />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  )
}

