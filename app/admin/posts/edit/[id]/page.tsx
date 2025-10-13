'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { getPost } from '@/services/api'
import { PostDetail } from '@/types'
import PostEditor from '@/components/admin/PostEditor'
import Loading from '@/components/common/Loading'

export default function EditPostPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin && params.id) {
      loadPost()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, authLoading, router, params.id])

  const loadPost = async () => {
    try {
      const data = await getPost(parseInt(params.id as string))
      setPost(data)
    } catch (error) {
      console.error('포스트 로딩 실패:', error)
      router.push('/admin/posts')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAdmin || !post) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">포스트 편집</h1>
      <PostEditor post={post} />
    </div>
  )
}

