'use client'

import { PageResponse, PostSummary } from '@/types'
import PostCard from './PostCard'

interface PostListProps {
  initialData: PageResponse<PostSummary>
  isLoading?: boolean
  hasMore?: boolean
}

export default function PostList({ initialData, isLoading = false, hasMore = true }: PostListProps) {
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialData.content.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {initialData.content.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">포스트가 없습니다</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="ml-4 text-gray-500">로딩 중...</p>
        </div>
      )}

      {!hasMore && initialData.content.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">더 이상 포스트가 없습니다</p>
        </div>
      )}
    </div>
  )
}

