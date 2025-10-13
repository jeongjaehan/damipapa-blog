'use client'

import { PageResponse, PostSummary } from '@/types'
import PostCard from './PostCard'
import Pagination from '../common/Pagination'

interface PostListProps {
  initialData: PageResponse<PostSummary>
}

export default function PostList({ initialData }: PostListProps) {
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

      {initialData.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={initialData.page}
            totalPages={initialData.totalPages}
          />
        </div>
      )}
    </div>
  )
}

