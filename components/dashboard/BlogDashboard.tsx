'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BlogDashboardData, PostSummary } from '@/types'
import {
  FileText, Eye, TrendingUp, Clock, Users, UserCheck,
  ChevronDown, ArrowRight, Sparkles, BookOpen
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { getPosts } from '@/services/api'

interface BlogDashboardProps {
  data: BlogDashboardData
}

/* ─────────── Time-aware Greeting ─────────── */
function getGreeting(): { emoji: string; text: string; sub: string } {
  const hour = new Date().getHours()
  if (hour < 6) return { emoji: '🌙', text: '늦은 밤이에요', sub: '오늘도 수고하셨어요' }
  if (hour < 12) return { emoji: '🌅', text: '좋은 아침이에요', sub: '오늘도 좋은 하루 보내세요' }
  if (hour < 18) return { emoji: '☀️', text: '안녕하세요', sub: '즐거운 오후 되세요' }
  return { emoji: '🌆', text: '좋은 저녁이에요', sub: '편안한 저녁 시간 되세요' }
}

/* ─────────── Stat Counter (inline) ─────────── */
function StatPill({ icon, label, value, delay }: {
  icon: React.ReactNode
  label: string
  value: number
  delay: number
}) {
  return (
    <div
      className="animate-counter-roll flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card/80 border border-border/60 backdrop-blur-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-primary/70">{icon}</span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-bold text-foreground magazine-number">
        {value.toLocaleString()}
      </span>
    </div>
  )
}

/* ─────────── Featured Post (Hero) ─────────── */
function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div className="featured-card relative rounded-3xl bg-gradient-to-br from-card via-card to-warm-highlight border border-border/60 p-6 sm:p-8 lg:p-10 shadow-warm-md transition-all duration-500 hover:shadow-warm-lg hover:-translate-y-1">
        {/* Decorative accent line */}
        <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative z-10">
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              최신 글
            </div>
            {post.categoryName && (
              <span className="px-2.5 py-1 rounded-full bg-secondary/60 text-secondary-foreground text-xs font-medium">
                {post.categoryName}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors duration-300 mb-4">
            {post.title}
          </h2>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="border-primary/15 text-primary/80 bg-primary/5 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground/70">{post.authorName}</span>
              <span>{format(new Date(post.createdAt), 'M월 d일', { locale: ko })}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.viewCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
              읽어보기
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─────────── Magazine Post Card ─────────── */
function MagazinePostCard({ post, index, variant = 'default' }: {
  post: PostSummary
  index: number
  variant?: 'default' | 'compact'
}) {
  const isCompact = variant === 'compact'

  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div
        className={`
          relative rounded-2xl border border-border/50 bg-card transition-all duration-300
          hover:border-primary/20 hover:shadow-warm-md hover:-translate-y-0.5
          ${isCompact ? 'p-4' : 'p-5 sm:p-6'}
        `}
      >
        {/* Rank number */}
        <div className="absolute -top-3 -left-1 sm:left-2">
          <span className="magazine-number text-[2.5rem] sm:text-5xl font-black text-primary/[0.07] dark:text-primary/[0.12] leading-none select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="relative z-10">
          {/* Category pill */}
          {post.categoryName && (
            <span className="inline-block px-2 py-0.5 rounded-md bg-accent/50 text-accent-foreground text-[10px] font-semibold uppercase tracking-wider mb-2">
              {post.categoryName}
            </span>
          )}

          {/* Title */}
          <h3 className={`
            font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200
            ${isCompact ? 'text-base line-clamp-2' : 'text-lg sm:text-xl line-clamp-2'}
          `}>
            {post.title}
          </h3>

          {/* Tags (only for non-compact) */}
          {!isCompact && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] text-primary/60 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className={`flex items-center gap-3 text-xs text-muted-foreground ${isCompact ? 'mt-2' : 'mt-3'}`}>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─────────── Post List Item (for load-more section) ─────────── */
function PostRow({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex items-center gap-4 py-3.5 px-4 -mx-4 rounded-xl transition-all duration-200 hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}</span>
          {post.categoryName && (
            <>
              <span className="text-border">·</span>
              <span className="text-primary/70">{post.categoryName}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 tabular-nums">
        <Eye className="w-3.5 h-3.5" />
        {post.viewCount.toLocaleString()}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
    </Link>
  )
}

/* ═══════════ MAIN DASHBOARD ═══════════ */
export default function BlogDashboard({ data }: BlogDashboardProps) {
  const greeting = useMemo(() => getGreeting(), [])
  const featuredPost = data.recentPosts[0]
  const restRecentPosts = data.recentPosts.slice(1)

  // 최근 포스트 more 상태
  const [recentPosts, setRecentPosts] = useState(restRecentPosts)
  const [recentPage, setRecentPage] = useState(1)
  const [recentLoading, setRecentLoading] = useState(false)
  const [recentHasMore, setRecentHasMore] = useState(data.totalPosts > 5)

  // 인기 포스트 more 상태
  const [popularPosts, setPopularPosts] = useState(data.popularPosts)
  const [popularPage, setPopularPage] = useState(1)
  const [popularLoading, setPopularLoading] = useState(false)
  const [popularHasMore, setPopularHasMore] = useState(data.totalPosts > 5)

  const loadMoreRecent = async () => {
    setRecentLoading(true)
    try {
      const result = await getPosts(recentPage, 5, undefined, 'recent')
      const existingIds = new Set(recentPosts.map(p => p.id))
      const newPosts = result.content.filter(p => !existingIds.has(p.id) && p.id !== featuredPost?.id)
      setRecentPosts([...recentPosts, ...newPosts])
      setRecentPage(recentPage + 1)
      setRecentHasMore(!result.last)
    } catch (error) {
      console.error('더보기 로딩 실패:', error)
    } finally {
      setRecentLoading(false)
    }
  }

  const loadMorePopular = async () => {
    setPopularLoading(true)
    try {
      const result = await getPosts(popularPage, 5, undefined, 'popular')
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
    <div className="relative dashboard-grain">
      {/* ── Decorative blobs ── */}
      <div className="dashboard-blob w-72 h-72 bg-primary/30 -top-20 -right-20" />
      <div className="dashboard-blob w-60 h-60 bg-accent -bottom-10 -left-16" />

      <div className="relative z-10 space-y-10">

        {/* ═══ HERO: Greeting + Stats ═══ */}
        <section className="animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl sm:text-4xl animate-float-gentle inline-block">{greeting.emoji}</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {greeting.text}
                </h1>
              </div>
              <p className="text-muted-foreground text-base sm:text-lg ml-0 sm:ml-[3.25rem]">
                {greeting.sub} — 다미파파의 블로그
              </p>
            </div>
          </div>

          {/* Inline stat pills */}
          <div className="flex flex-wrap gap-2.5">
            <StatPill icon={<FileText className="w-3.5 h-3.5" />} label="포스트" value={data.totalPosts} delay={100} />
            <StatPill icon={<Eye className="w-3.5 h-3.5" />} label="조회" value={data.totalViews} delay={200} />
            <StatPill icon={<UserCheck className="w-3.5 h-3.5" />} label="오늘" value={data.todayVisitors} delay={300} />
            <StatPill icon={<Users className="w-3.5 h-3.5" />} label="누적" value={data.totalVisitors} delay={400} />
          </div>
        </section>

        {/* ═══ FEATURED POST ═══ */}
        {featuredPost && (
          <section className="animate-fade-up" style={{ animationDelay: '150ms' }}>
            <FeaturedPost post={featuredPost} />
          </section>
        )}

        {/* ═══ POPULAR POSTS — Magazine Grid ═══ */}
        {popularPosts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">인기 글</h2>
              <div className="flex-1 h-px bg-border/60 ml-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularPosts.slice(0, 4).map((post, index) => (
                <div
                  key={post.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${400 + index * 80}ms` }}
                >
                  <MagazinePostCard
                    post={post}
                    index={index}
                    variant={index >= 2 ? 'compact' : 'default'}
                  />
                </div>
              ))}
            </div>

            {/* Extra popular posts as rows */}
            {popularPosts.length > 4 && (
              <div className="mt-4 pt-2 space-y-0.5">
                {popularPosts.slice(4).map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </div>
            )}

            {popularHasMore && (
              <div className="mt-4">
                <button
                  onClick={loadMorePopular}
                  disabled={popularLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                    bg-card border border-border/60 hover:border-primary/20 hover:bg-muted/30
                    text-foreground/60 text-sm font-medium
                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {popularLoading ? '로딩 중...' : (
                    <>더보기 <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ═══ RECENT POSTS ═══ */}
        {recentPosts.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: '450ms' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-secondary/60">
                <BookOpen className="w-4 h-4 text-secondary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">최근 글</h2>
              <div className="flex-1 h-px bg-border/60 ml-2" />
            </div>

            <div className="bg-card/50 rounded-2xl border border-border/40 backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-1 divide-y divide-border/30">
                {recentPosts.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </div>

              {recentHasMore && (
                <div className="px-4 py-3 border-t border-border/30">
                  <button
                    onClick={loadMoreRecent}
                    disabled={recentLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl
                      hover:bg-muted/30 text-foreground/60 text-sm font-medium
                      transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {recentLoading ? '로딩 중...' : (
                      <>더보기 <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Empty state */}
        {data.recentPosts.length === 0 && data.popularPosts.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-foreground mb-2">아직 작성된 글이 없어요</h3>
            <p className="text-muted-foreground">첫 번째 포스트를 작성해보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}
