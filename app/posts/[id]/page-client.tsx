'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPost } from '@/services/api'
import { PostDetail as PostDetailType } from '@/types'
import PostDetail from '@/components/post/PostDetail'
import FacebookComments from '@/components/comment/FacebookComments'
import Loading from '@/components/common/Loading'

export default function PostPageClient({ postId }: { postId: string }) {
  const router = useRouter()
  const [post, setPost] = useState<PostDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getPost(parseInt(postId))
        setPost(data)
      } catch (error) {
        console.error('포스트 로딩 실패:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      loadPost()
    }
  }, [postId, router])

  if (loading || !post) {
    return <Loading />
  }

  const postUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/posts/${post.id}`
    : `http://localhost:3000/posts/${post.id}`

  return (
    <div>
      <PostDetail post={post} />
      <FacebookComments url={postUrl} />
    </div>
  )
}
