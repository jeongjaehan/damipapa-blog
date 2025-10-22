'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllPostsForAdmin, deletePost } from '@/services/api'
import { PostSummary } from '@/types'
import { formatDate } from '@/utils/date'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PenSquare, Copy, EyeOff } from 'lucide-react'
import { Suspense } from 'react'

function AdminPostsPageContent() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allPosts, setAllPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  const filter = searchParams.get('filter')

  const loadPosts = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    if (pageNum === 0) {
      setLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      // API URL 직접 사용
      const baseUrl = '/api'
      const url = filter ? `${baseUrl}/admin/posts?page=${pageNum}&size=10&filter=${filter}` : `${baseUrl}/admin/posts?page=${pageNum}&size=10`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      
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
  }, [filter])

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadPosts(0, true)
    }
  }, [isAdmin, authLoading, router])

  // 필터가 변경될 때마다 포스트 다시 로드
  useEffect(() => {
    if (isAdmin) {
      loadPosts(0, true)
    }
  }, [isAdmin, loadPosts])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deletePost(id)
      setAllPosts((prev) => prev.filter((post) => post.id !== id))
    } catch (error) {
      console.error('포스트 삭제 실패:', error)
      alert('포스트 삭제에 실패했습니다')
    }
  }

  const handleCopySecretLink = async (post: PostSummary) => {
    if (!post.secretToken) return
    
    const secretUrl = `${window.location.origin}/posts/${post.id}?token=${post.secretToken}`
    
    try {
      await navigator.clipboard.writeText(secretUrl)
      alert('비밀 링크가 클립보드에 복사되었습니다')
    } catch (error) {
      console.error('링크 복사 실패:', error)
      alert('링크 복사에 실패했습니다')
    }
  }

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
  }, [currentPage, hasMore, isLoadingMore, loading, loadPosts])

  if (authLoading || (loading && allPosts.length === 0)) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">포스트 관리</h1>
          <p className="text-gray-600 mt-2">
            {filter === 'private' ? '비공개 포스트를 관리하세요' : '모든 포스트를 관리하세요'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                댓글
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allPosts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {post.isPrivate && (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        비공개
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {post.commentCount}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <Link href={`/admin/posts/edit/${post.id}`}>
                    <Button size="sm" variant="outline">편집</Button>
                  </Link>
                  {post.isPrivate && post.secretToken && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopySecretLink(post)}
                      className="gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      링크
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(post.id, post.title)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allPosts.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p>포스트가 없습니다</p>
          </div>
        )}
      </div>

      {/* Intersection Observer 트리거 */}
      <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
        {isLoadingMore && <p className="text-gray-500">로딩 중...</p>}
      </div>

      {!hasMore && allPosts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">더 이상 포스트가 없습니다</p>
        </div>
      )}
    </div>
  )
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPostsPageContent />
    </Suspense>
  )
}

