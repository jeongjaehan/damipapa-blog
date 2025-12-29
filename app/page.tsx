'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getCategoryTree, getBlogDashboard, getPosts } from '@/services/api'
import { CategoryTree as CategoryTreeType, BlogDashboardData, PostSummary, PageResponse } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/common/Loading'
import CategoryTree from '@/components/category/CategoryTree'
import BlogDashboard from '@/components/dashboard/BlogDashboard'
import PostList from '@/components/post/PostList'
import { Badge } from '@/components/ui/badge'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const tag = searchParams.get('tag')
  
  const [categoryData, setCategoryData] = useState<CategoryTreeType | null>(null)
  const [dashboardData, setDashboardData] = useState<BlogDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 태그 필터링 모드일 때의 상태
  const [tagPosts, setTagPosts] = useState<PostSummary[]>([])
  const [tagLoading, setTagLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  // 초기 데이터 로드 (관리자 상태에 따라 다른 데이터 로드)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categories, dashboard] = await Promise.all([
          getCategoryTree(isAdmin), // 관리자면 비공개 카테고리도 포함
          getBlogDashboard(isAdmin), // 관리자면 비공개 포스트도 포함
        ])
        setCategoryData(categories)
        setDashboardData(dashboard)
      } catch (error) {
        console.error('데이터 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [isAdmin])

  // 태그 필터링 시 포스트 로드
  useEffect(() => {
    if (tag) {
      const loadTagPosts = async () => {
        setTagLoading(true)
        try {
          const data = await getPosts(0, 10, tag)
          setTagPosts(data.content)
          setHasMore(!data.last)
          setCurrentPage(0)
        } catch (error) {
          console.error('태그 포스트 로딩 실패:', error)
        } finally {
          setTagLoading(false)
        }
      }
      loadTagPosts()
    }
  }, [tag])

  if (loading) {
    return <Loading />
  }

  // 태그 필터링 모드
  if (tag) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">태그 검색 결과</h1>
                <Badge 
                  variant="outline" 
                  className="border-primary-200 text-primary-700 dark:border-primary-800 dark:text-primary-300"
                >
                  #{tag}
                </Badge>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                ← 대시보드로 돌아가기
              </button>
            </div>

            {tagLoading ? (
              <Loading />
            ) : (
              <PostList
                initialData={{ 
                  content: tagPosts, 
                  page: currentPage, 
                  totalPages: 0, 
                  last: !hasMore 
                } as PageResponse<PostSummary>}
                isLoading={false}
                hasMore={hasMore}
              />
            )}
          </div>

          {/* 사이드바 - 카테고리 트리 */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              {categoryData && (
                <CategoryTree
                  categories={categoryData.categories}
                  uncategorizedCount={categoryData.uncategorizedCount}
                  showPrivate={isAdmin}
                />
              )}
            </div>
          </aside>
        </div>
      </div>
    )
  }

  // 기본 대시보드 모드
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">블로그</h1>
        <p className="text-muted-foreground mt-2">최신 글과 인기 글을 확인하세요</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 메인 콘텐츠 - 대시보드 */}
        <main className="flex-1 min-w-0">
          {dashboardData && <BlogDashboard data={dashboardData} />}
        </main>

        {/* 사이드바 - 카테고리 트리 */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            {categoryData && (
              <CategoryTree
                categories={categoryData.categories}
                uncategorizedCount={categoryData.uncategorizedCount}
                showPrivate={isAdmin}
              />
            )}
          </div>
        </aside>
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
