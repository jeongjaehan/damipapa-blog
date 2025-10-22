'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getDashboardStats } from '@/services/api'
import { DashboardStats } from '@/types'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, EyeOff, Eye } from 'lucide-react'

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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">블로그 통계와 관리 기능</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/posts">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">전체 포스트</CardTitle>
              <FileText className="w-5 h-5 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">{stats?.totalPosts}</div>
            </CardContent>
          </Card>
        </Link>


        <Link href="/admin/posts?filter=private">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-stone-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">비공개</CardTitle>
              <EyeOff className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.privatePosts}</div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-stone-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 조회수</CardTitle>
            <Eye className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats?.totalViews?.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

