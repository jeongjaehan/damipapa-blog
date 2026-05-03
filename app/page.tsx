'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getCategoryTree, getBlogDashboard, getPosts } from '@/services/api'
import { CategoryTree as CategoryTreeType, BlogDashboardData, PostSummary, PageResponse } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/common/Loading'
import CategoryTree from '@/components/category/CategoryTree'
import BlogDashboard from '@/components/dashboard/BlogDashboard'
import PostingHeatmap from '@/components/dashboard/PostingHeatmap'
import PostList from '@/components/post/PostList'
import { Badge } from '@/components/ui/badge'

function formatDateBadge(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const [y, m, d] = date.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const tag = searchParams.get('tag')
  const dateParam = searchParams.get('date')

  const [categoryData, setCategoryData] = useState<CategoryTreeType | null>(null)
  const [dashboardData, setDashboardData] = useState<BlogDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // 태그 / 날짜 필터링 모드 공용 상태
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

  // 태그 / 날짜 필터링 시 포스트 로드
  useEffect(() => {
    if (tag || dateParam) {
      const loadFilteredPosts = async () => {
        setTagLoading(true)
        try {
          const data = await getPosts(0, 10, tag || undefined, undefined, dateParam || undefined)
          setTagPosts(data.content)
          setHasMore(!data.last)
          setCurrentPage(0)
        } catch (error) {
          console.error('필터 포스트 로딩 실패:', error)
        } finally {
          setTagLoading(false)
        }
      }
      loadFilteredPosts()
    }
  }, [tag, dateParam])

  if (loading) {
    return <Loading />
  }

  // 태그 / 날짜 필터링 모드
  if (tag || dateParam) {
    const filterTitle = dateParam ? '날짜별 글 모음' : '태그 검색 결과'
    const filterBadge = dateParam ? formatDateBadge(dateParam) : `#${tag}`
    const emptyMessage = dateParam
      ? `${filterBadge}에 작성된 공개 글이 없어요`
      : '검색 결과가 없어요'

    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{filterTitle}</h1>
                <Badge
                  variant="outline"
                  className="border-primary-200 text-primary-700 dark:border-primary-800 dark:text-primary-300"
                >
                  {filterBadge}
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
            ) : tagPosts.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card/60 px-6 py-12 text-center text-muted-foreground">
                {emptyMessage}
              </div>
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
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-4 shadow-sm">
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
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* 메인 콘텐츠 - 대시보드 */}
        <main className="flex-1 min-w-0">
          {dashboardData && <BlogDashboard data={dashboardData} />}

          {/* 포스팅 잔디 (활동 히트맵) */}
          <section className="mt-12 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-warm-sm sm:p-6">
            <header className="mb-4">
              <h2 className="text-base font-semibold text-foreground">
                포스팅 잔디
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                글을 쓴 날만큼 잔디가 자라요
              </p>
            </header>
            <PostingHeatmap isAdmin={isAdmin} />
          </section>
        </main>

        {/* 사이드바 - 카테고리 트리 */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/60 p-4 shadow-warm-sm">
              {categoryData && (
                <CategoryTree
                  categories={categoryData.categories}
                  uncategorizedCount={categoryData.uncategorizedCount}
                  showPrivate={isAdmin}
                />
              )}
            </div>
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
