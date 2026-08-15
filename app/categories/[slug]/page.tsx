'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCategoryTree, getCategoryPosts } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { 
  CategoryTree as CategoryTreeType, 
  PostSummary, 
  PageResponse
} from '@/types'

interface CategoryWithAncestors {
  id: number | null
  name: string
  slug: string
  description?: string | null
  isPrivate: boolean
  depth?: number
  parentId?: number | null
  ancestors?: { id: number; name: string; slug: string }[]
}
import Loading from '@/components/common/Loading'
import CategoryTree from '@/components/category/CategoryTree'
import PostList from '@/components/post/PostList'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const slug = params.slug as string
  
  const [categoryData, setCategoryData] = useState<CategoryTreeType | null>(null)
  const [category, setCategory] = useState<CategoryWithAncestors | null>(null)
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [categories, categoryResponse] = await Promise.all([
          getCategoryTree(isAdmin),
          getCategoryPosts(slug, 0, 10),
        ])
        setCategoryData(categories)
        setCategory(categoryResponse.category as CategoryWithAncestors)
        setPosts(categoryResponse.posts.content)
        setHasMore(!categoryResponse.posts.last)
        setTotalElements(categoryResponse.posts.totalElements)
        setCurrentPage(0)
      } catch (error: any) {
        console.error('카테고리 데이터 로딩 실패:', error)
        // 403 에러 처리
        if (error.response?.status === 403) {
          setError('접근 권한이 없습니다')
        } else if (error.response?.status === 404) {
          setError('카테고리를 찾을 수 없습니다')
        } else {
          setError('데이터를 불러오는데 실패했습니다')
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, isAdmin])

  // 추가 포스트 로드
  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const response = await getCategoryPosts(slug, nextPage, 10)
      setPosts((prev) => [...prev, ...response.posts.content])
      setHasMore(!response.posts.last)
      setCurrentPage(nextPage)
    } catch (error) {
      console.error('추가 포스트 로딩 실패:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Intersection Observer
  useEffect(() => {
    if (!observerTarget.current || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts()
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

  if (loading) {
    return <Loading />
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="border border-destructive p-4 text-center">
          <p className="mb-2 text-sm font-bold text-destructive">[비공개]</p>
          <h1 className="text-2xl font-bold text-destructive mb-2">
            {error}
          </h1>
          <p className="text-destructive/80 mb-6">
            이 카테고리에 접근할 수 없습니다.
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-link hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-8">
        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link
              href="/"
              className="hover:text-link"
            >
              홈
            </Link>
            {/* 상위 카테고리 경로 (ancestors) */}
            {category?.ancestors && category.ancestors.length > 0 && (
              <>
                {category.ancestors.map((ancestor) => (
                  <span key={ancestor.id} className="flex items-center gap-2">
                    <span aria-hidden="true">/</span>
                    <Link
                      href={`/categories/${ancestor.slug}`}
                      className="hover:text-link"
                    >
                      {ancestor.name}
                    </Link>
                  </span>
                ))}
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-foreground font-medium">
              {category?.name || '미분류'}
            </span>
          </nav>

          {/* 카테고리 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {category?.name || '미분류'}
              </h1>
            </div>
            {category?.description && (
              <p className="text-muted-foreground mt-2">{category.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              총 {totalElements}개의 포스트
            </p>
          </div>

          {/* 포스트 목록 */}
          <PostList
            initialData={{ 
              content: posts, 
              page: currentPage, 
              totalPages: 0, 
              last: !hasMore 
            } as PageResponse<PostSummary>}
            isLoading={isLoadingMore}
            hasMore={hasMore}
          />

          {/* Intersection Observer 트리거 */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {isLoadingMore && <p className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</p>}
          </div>
        </main>

        {/* 사이드바 - 카테고리 트리 */}
        <aside>
          <div className="border-t border-border pt-6">
            {categoryData && (
              <CategoryTree
                categories={categoryData.categories}
                uncategorizedCount={categoryData.uncategorizedCount}
                selectedSlug={slug}
                showPrivate={isAdmin}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

