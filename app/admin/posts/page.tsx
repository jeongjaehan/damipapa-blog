'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getAllPostsForAdmin, deletePost } from '@/services/api'
import { PageResponse, PostSummary } from '@/types'
import { formatDate } from '@/utils/date'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PenSquare } from 'lucide-react'

export default function AdminPostsPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<PageResponse<PostSummary> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadPosts()
    }
  }, [isAdmin, authLoading, router])

  const loadPosts = async () => {
    try {
      const data = await getAllPostsForAdmin()
      setPosts(data)
    } catch (error) {
      console.error('포스트 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deletePost(id)
      loadPosts()
    } catch (error) {
      console.error('포스트 삭제 실패:', error)
      alert('포스트 삭제에 실패했습니다')
    }
  }

  if (authLoading || loading) {
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
          <p className="text-gray-600 mt-2">모든 포스트를 관리하세요</p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="gap-2">
            <PenSquare className="w-4 h-4" />
            새 포스트 작성
          </Button>
        </Link>
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
            {posts?.content.map((post) => (
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
                  <span className={`px-2 py-1 rounded text-xs ${
                    post.id ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    발행됨
                  </span>
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

        {posts?.content.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>포스트가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}

