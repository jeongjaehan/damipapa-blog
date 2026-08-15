'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCategoryTree, getBlogDashboard, getPosts } from '@/services/api'
import { CategoryTree as CategoryTreeType, BlogDashboardData, PostSummary, PageResponse } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/common/Loading'
import CategoryTree from '@/components/category/CategoryTree'
import BlogDashboard from '@/components/dashboard/BlogDashboard'
import PostingHeatmap from '@/components/dashboard/PostingHeatmap'
import PostList from '@/components/post/PostList'

function formatDateBadge(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const [y, m, d] = date.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}

function PopularList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null

  return (
    <section>
      <h3 className="border-b border-border pb-1 text-sm font-bold">인기 글</h3>
      <ol className="mt-2 space-y-1.5 text-sm">
        {posts.slice(0, 5).map((post, i) => (
          <li key={post.id} className="flex gap-2">
            <span className="shrink-0 tabular-nums text-muted-foreground">{i + 1}.</span>
            <Link
              href={`/posts/${post.id}`}
              className="text-foreground underline visited:text-link-visited hover:text-link"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
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
      <div>
        <h1 className="text-xl font-bold">
          {filterTitle}
          <span className="ml-2 font-normal text-muted-foreground">{filterBadge}</span>
        </h1>
        <p className="mt-1 text-sm">
          <button
            onClick={() => router.push('/')}
            className="text-link hover:underline"
          >
            « 홈으로 돌아가기
          </button>
        </p>

        <div className="mt-8">
          {tagLoading ? (
            <Loading />
          ) : tagPosts.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">{emptyMessage}</p>
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

        <aside className="mt-12 border-t border-border pt-6">
          {categoryData && (
            <CategoryTree
              categories={categoryData.categories}
              uncategorizedCount={categoryData.uncategorizedCount}
              showPrivate={isAdmin}
            />
          )}
        </aside>
      </div>
    )
  }

  // 기본 대시보드 모드
  return (
    <div>
      <h1 className="text-lg font-bold">다미파파의 블로그</h1>

      {dashboardData && <BlogDashboard data={dashboardData} />}

      <aside className="mt-14 border-t border-border pt-6 space-y-8">
        {dashboardData && <PopularList posts={dashboardData.popularPosts} />}

        {categoryData && (
          <CategoryTree
            categories={categoryData.categories}
            uncategorizedCount={categoryData.uncategorizedCount}
            showPrivate={isAdmin}
          />
        )}
      </aside>

      <section className="mt-12 border-t border-border pt-6">
        <h2 className="text-base font-bold">포스팅 잔디</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">글을 쓴 날만큼 잔디가 자라요</p>
        <div className="mt-4">
          <PostingHeatmap isAdmin={isAdmin} />
        </div>
      </section>
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
