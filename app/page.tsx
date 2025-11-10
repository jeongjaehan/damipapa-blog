'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import PostList from '@/components/post/PostList'
import { getPosts } from '@/services/api'
import { PageResponse, PostSummary } from '@/types'
import Loading from '@/components/common/Loading'
import { Badge } from '@/components/ui/badge'

function HomeContent() {
  const searchParams = useSearchParams()
  const [allPosts, setAllPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  const tag = searchParams.get('tag') || undefined

  // 포스트 로드 함수
  const loadPosts = async (pageNum: number, isInitial: boolean = false) => {
    if (pageNum === 0) {
      setLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const data = await getPosts(pageNum, 10, tag)
      
      if (isInitial) {
        setAllPosts(data.content)
        console.log('📌 초기 로드:', { page: pageNum, count: data.content.length, last: data.last })
      } else {
        setAllPosts((prev) => [...prev, ...data.content])
        console.log('📌 추가 로드:', { page: pageNum, count: data.content.length, last: data.last })
      }

      setCurrentPage(pageNum)
      setHasMore(!data.last)
    } catch (error) {
      console.error('❌ 포스트 로딩 실패:', error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    loadPosts(0, true)
  }, [tag])

  // Intersection Observer
  useEffect(() => {
    if (!observerTarget.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting
        console.log('👀 Observer 감지:', { isIntersecting, hasMore, isLoadingMore })
        
        if (isIntersecting && hasMore && !isLoadingMore && !loading) {
          console.log('🚀 다음 페이지 로드 트리거')
          loadPosts(currentPage + 1, false)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [currentPage, hasMore, isLoadingMore, loading])

  if (loading && allPosts.length === 0) {
    return <Loading />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-foreground tracking-tight">최신 포스트</h1>
        <p className="text-muted-foreground mt-3">블로그의 최신 글을 확인하세요</p>
      </div>

      {tag && (
        <div className="flex gap-2">
          <Badge variant="outline" className="border-primary-200 text-primary-700 dark:border-primary-800 dark:text-primary-300">
            태그: {tag}
          </Badge>
        </div>
      )}

      <PostList
        initialData={{ content: allPosts, page: currentPage, totalPages: 0, last: !hasMore } as PageResponse<PostSummary>}
        isLoading={isLoadingMore}
        hasMore={hasMore}
      />

      {/* Intersection Observer 트리거 */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center">
        {isLoadingMore && <p className="text-muted-foreground">로딩 중...</p>}
      </div>
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

