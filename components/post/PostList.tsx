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
      <div className="border-t border-border">
        {initialData.content.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {initialData.content.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">포스트가 없습니다.</p>
      )}

      {isLoading && (
        <p className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</p>
      )}

      {!hasMore && initialData.content.length > 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">더 이상 포스트가 없습니다.</p>
      )}
    </div>
  )
}

