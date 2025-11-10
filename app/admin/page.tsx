'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getDashboardStats } from '@/services/api'
import { DashboardStats } from '@/types'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  EyeOff, 
  Eye, 
  Sparkles, 
  LayoutDashboard,
  PenSquare,
  Settings,
  TrendingUp,
  ArrowRight,
  Plus,
  BarChart3
} from 'lucide-react'

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadStats()
    }
  }, [isAdmin, authLoading, router])

  const loadStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('통계 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  const publicPosts = (stats?.totalPosts || 0) - (stats?.privatePosts || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                관리자 대시보드
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">블로그 통계와 관리 기능을 한눈에 확인하세요</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new">
            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-5 h-5" />
              새 포스트 작성
            </Button>
          </Link>
          <Link href="/admin/posts">
            <Button variant="outline" size="lg" className="gap-2">
              <FileText className="w-5 h-5" />
              포스트 관리
            </Button>
          </Link>
          <Link href="/admin/templates">
            <Button variant="outline" size="lg" className="gap-2">
              <Settings className="w-5 h-5" />
              템플릿 관리
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/posts">
            <Card className="group relative overflow-hidden border border-border hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">전체 포스트</CardTitle>
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats?.totalPosts || 0}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  공개: {publicPosts}개
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/posts?filter=private">
            <Card className="group relative overflow-hidden border border-border hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">비공개 포스트</CardTitle>
                <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg group-hover:bg-red-500/20 dark:group-hover:bg-red-500/30 transition-colors">
                  <EyeOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {stats?.privatePosts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  전체의 {stats?.totalPosts ? Math.round((stats.privatePosts / stats.totalPosts) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="group relative overflow-hidden border border-border hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 조회수</CardTitle>
              <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-colors">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {stats?.totalViews?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                모든 포스트 합계
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-border hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">공개 포스트</CardTitle>
              <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-colors">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                {publicPosts}
              </div>
              <p className="text-xs text-muted-foreground">
                전체의 {stats?.totalPosts ? Math.round((publicPosts / stats.totalPosts) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Menu */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">관리 메뉴</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent mx-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/prompts">
              <Card className="group relative overflow-hidden border border-border hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg cursor-pointer h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 dark:from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                      <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-semibold mb-2">프롬프트 관리</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI 문장 개선용 프롬프트 템플릿을 생성하고 관리합니다
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/templates">
              <Card className="group relative overflow-hidden border border-border hover:border-green-500/50 dark:hover:border-green-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg cursor-pointer h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 dark:from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-xl group-hover:bg-green-500/20 dark:group-hover:bg-green-500/30 transition-colors">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-semibold mb-2">템플릿 관리</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    포스트 작성을 위한 템플릿을 생성하고 관리합니다
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/posts">
              <Card className="group relative overflow-hidden border border-border hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg cursor-pointer h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 dark:from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-colors">
                      <PenSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-semibold mb-2">포스트 관리</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    모든 포스트를 확인하고 수정, 삭제할 수 있습니다
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

