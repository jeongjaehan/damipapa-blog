'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import PostEditor from '@/components/admin/PostEditor'
import Loading from '@/components/common/Loading'

export default function NewPostPage() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/auth/login')
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">새 포스트 작성</h1>
      <PostEditor />
    </div>
  )
}

