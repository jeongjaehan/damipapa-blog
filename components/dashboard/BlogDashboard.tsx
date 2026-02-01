'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BlogDashboardData, PostSummary } from '@/types'
import { FileText, Eye, TrendingUp, Clock, Users, UserCheck, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getPosts } from '@/services/api'

interface BlogDashboardProps {
  data: BlogDashboardData
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`
      flex items-center gap-4 p-4 rounded-xl border
      bg-white dark:bg-gray-800 
      border-gray-200 dark:border-gray-700
      shadow-sm
    `}>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  )
}

interface PostListItemProps {
  post: PostSummary
  showViews?: boolean
}

function PostListItem({ post, showViews = false }: PostListItemProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="
        block py-3 px-4 rounded-lg transition-colors
        hover:bg-gray-50 dark:hover:bg-gray-800/50
        border-b border-gray-100 dark:border-gray-700/50 last:border-0
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {post.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            {post.categoryName && (
              <>
                <span>·</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {post.categoryName}
                </span>
              </>
            )}
          </div>
        </div>
        {showViews && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 shrink-0">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function BlogDashboard({ data }: BlogDashboardProps) {
  // 최근 포스트 상태
  const [recentPosts, setRecentPosts] = useState(data.recentPosts)
  const [recentPage, setRecentPage] = useState(1)
  const [recentLoading, setRecentLoading] = useState(false)
  const [recentHasMore, setRecentHasMore] = useState(data.totalPosts > 5)
  
  // 인기 포스트 상태
  const [popularPosts, setPopularPosts] = useState(data.popularPosts)
  const [popularPage, setPopularPage] = useState(1)
  const [popularLoading, setPopularLoading] = useState(false)
  const [popularHasMore, setPopularHasMore] = useState(data.totalPosts > 5)

  // 최근 포스트 더보기
  const loadMoreRecent = async () => {
    setRecentLoading(true)
    try {
      const result = await getPosts(recentPage, 5, undefined, 'recent')
      
      // 중복 제거: 이미 있는 ID는 필터링
      const existingIds = new Set(recentPosts.map(p => p.id))
      const newPosts = result.content.filter(p => !existingIds.has(p.id))
      
      setRecentPosts([...recentPosts, ...newPosts])
      setRecentPage(recentPage + 1)
      setRecentHasMore(!result.last)
    } catch (error) {
      console.error('더보기 로딩 실패:', error)
    } finally {
      setRecentLoading(false)
    }
  }

  // 인기 포스트 더보기
  const loadMorePopular = async () => {
    setPopularLoading(true)
    try {
      const result = await getPosts(popularPage, 5, undefined, 'popular')
      
      // 중복 제거: 이미 있는 ID는 필터링
      const existingIds = new Set(popularPosts.map(p => p.id))
      const newPosts = result.content.filter(p => !existingIds.has(p.id))
      
      setPopularPosts([...popularPosts, ...newPosts])
      setPopularPage(popularPage + 1)
      setPopularHasMore(!result.last)
    } catch (error) {
      console.error('더보기 로딩 실패:', error)
    } finally {
      setPopularLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          label="전체 포스트"
          value={data.totalPosts}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          icon={<Eye className="w-5 h-5 text-green-600" />}
          label="총 조회수"
          value={data.totalViews}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-purple-600" />}
          label="오늘 방문자"
          value={data.todayVisitors}
          color="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-orange-600" />}
          label="전체 방문자"
          value={data.totalVisitors}
          color="bg-orange-100 dark:bg-orange-900/30"
        />
      </div>

      {/* 최근 포스트 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Clock className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">최근 포스트</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              포스트가 없습니다
            </p>
          )}
        </div>
        {recentHasMore && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={loadMoreRecent}
              disabled={recentLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300 text-sm font-medium
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recentLoading ? (
                <>로딩 중...</>
              ) : (
                <>
                  <span>더보기</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 인기 포스트 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">인기 포스트</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {popularPosts.length > 0 ? (
            popularPosts.map((post) => (
              <PostListItem key={post.id} post={post} showViews />
            ))
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              포스트가 없습니다
            </p>
          )}
        </div>
        {popularHasMore && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={loadMorePopular}
              disabled={popularLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300 text-sm font-medium
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {popularLoading ? (
                <>로딩 중...</>
              ) : (
                <>
                  <span>더보기</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

