'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { BlogDashboardData, PostSummary } from '@/types'
import { getPosts } from '@/services/api'

interface BlogDashboardProps {
  data: BlogDashboardData
}

/** 글 목록을 작성연도로 묶는다. 연도는 내림차순, 그룹 안 순서는 입력 순서를 유지한다. */
function groupByYear(posts: PostSummary[]): Array<[string, PostSummary[]]> {
  const groups = new Map<string, PostSummary[]>()
  for (const post of posts) {
    const year = format(new Date(post.createdAt), 'yyyy')
    const bucket = groups.get(year)
    if (bucket) {
      bucket.push(post)
    } else {
      groups.set(year, [post])
    }
  }
  return Array.from(groups.entries()).sort((a, b) => Number(b[0]) - Number(a[0]))
}

function ArchiveRow({ post }: { post: PostSummary }) {
  return (
    <li className="flex gap-3 py-1.5 text-[0.95rem] leading-relaxed">
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {format(new Date(post.createdAt), 'MM.dd')}
      </span>
      <span className="min-w-0">
        <Link
          href={`/posts/${post.id}`}
          className="text-foreground underline visited:text-link-visited hover:text-link"
        >
          {post.title}
        </Link>
        <span className="ml-2 whitespace-nowrap text-sm text-muted-foreground">
          {post.categoryName && (
            <>
              {post.categoryName}
              <span aria-hidden="true" className="mx-1 text-border">·</span>
            </>
          )}
          조회 {post.viewCount.toLocaleString()}
        </span>
      </span>
    </li>
  )
}

const PAGE_SIZE = 10

export default function BlogDashboard({ data }: BlogDashboardProps) {
  const [posts, setPosts] = useState<PostSummary[]>(data.recentPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(data.totalPosts > data.recentPosts.length)

  const loadMore = async () => {
    setLoading(true)
    try {
      // ponytail: 매번 처음부터 다시 받는다. getPosts는 오프셋이 아니라 페이지 단위라,
      // 초기 목록 길이(대시보드 API가 정하는 값)가 PAGE_SIZE의 배수가 아니면
      // 페이지 인덱스 계산이 글을 건너뛴다. 글이 수백 편을 넘어가면 커서 페이징으로 바꿀 것.
      const result = await getPosts(0, posts.length + PAGE_SIZE, undefined, 'recent')
      const existingIds = new Set(posts.map((p) => p.id))
      const newPosts = result.content.filter((p) => !existingIds.has(p.id))
      setPosts([...posts, ...newPosts])
      setHasMore(!result.last)
    } catch (error) {
      console.error('더보기 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const grouped = groupByYear(posts)

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        글 {data.totalPosts.toLocaleString()}편
        <span aria-hidden="true" className="mx-1.5 text-border">·</span>
        조회 {data.totalViews.toLocaleString()}
        <span aria-hidden="true" className="mx-1.5 text-border">·</span>
        오늘 {data.todayVisitors.toLocaleString()}명
        <span aria-hidden="true" className="mx-1.5 text-border">·</span>
        누적 {data.totalVisitors.toLocaleString()}명
      </p>

      {grouped.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">아직 작성된 글이 없습니다.</p>
      ) : (
        <div className="mt-10 space-y-8">
          {grouped.map(([year, yearPosts]) => (
            <section key={year}>
              <h2 className="border-b border-border pb-1 text-base font-bold">{year}</h2>
              <ul className="mt-2">
                {yearPosts.map((post) => (
                  <ArchiveRow key={post.id} post={post} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {hasMore && (
        <p className="mt-8 text-right">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-sm text-link hover:underline disabled:text-muted-foreground"
          >
            {loading ? '불러오는 중...' : '더보기 »'}
          </button>
        </p>
      )}
    </div>
  )
}
