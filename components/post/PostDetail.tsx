'use client'

import { PostDetail as PostDetailType } from '@/types'
import { formatFullDate } from '@/utils/date'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Calendar, Edit, Trash2 } from 'lucide-react'

interface PostDetailProps {
  post: PostDetailType
}

export default function PostDetail({ post }: PostDetailProps) {
  const { isAdmin } = useAuth()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`"${post.title}" 포스트를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deletePost(post.id)
      alert('포스트가 삭제되었습니다')
      router.push('/')
    } catch (error) {
      console.error('포스트 삭제 실패:', error)
      alert('포스트 삭제에 실패했습니다')
    }
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <header className="px-8 py-12 bg-gradient-to-b from-stone-50 to-white">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight flex-1 tracking-tight">
              {post.title}
            </h1>
            {isAdmin && (
              <div className="flex gap-2 ml-6">
                <Link href={`/admin/posts/edit/${post.id}`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    수정
                  </Button>
                </Link>
                <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <span className="font-medium text-gray-900">{post.author.name}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatFullDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {post.viewCount.toLocaleString()} 조회
            </span>
            {post.createdAt !== post.updatedAt && (
              <span className="text-xs text-gray-500">
                (수정됨: {formatFullDate(post.updatedAt)})
              </span>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/?tag=${tag}`}>
                  <Badge variant="outline" className="border-primary-200 text-primary-700 hover:bg-primary-50">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        <Separator />

        <div className="px-8 py-12">
          <div className="markdown prose prose-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </article>
  )
}

