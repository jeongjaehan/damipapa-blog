'use client'

import { useEffect, useState } from 'react'
import { getPostReactions, togglePostReaction } from '@/services/api'
import { PostReactionResponse } from '@/types'

interface PostReactionsProps {
  postId: number
}

export default function PostReactions({ postId }: PostReactionsProps) {
  const [reactionStats, setReactionStats] = useState<PostReactionResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReactions()
  }, [postId])

  const loadReactions = async () => {
    try {
      setLoading(true)
      const data = await getPostReactions(postId)
      setReactionStats(data)
    } catch (error) {
      console.error('반응 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (reactionType: 'LIKE' | 'DISLIKE') => {
    try {
      const data = await togglePostReaction(postId, reactionType)
      setReactionStats(data)
    } catch (error) {
      console.error('반응 토글 실패:', error)
      alert('반응 등록에 실패했습니다')
    }
  }

  if (loading || !reactionStats) {
    return (
      <div className="border-t border-border py-6 text-sm text-muted-foreground">
        좋아요 0 · 싫어요 0
      </div>
    )
  }

  const isLiked = reactionStats.userReaction?.type === 'LIKE'
  const isDisliked = reactionStats.userReaction?.type === 'DISLIKE'

  return (
    <div className="flex items-center gap-4 border-t border-border py-6 text-sm">
      <button
        type="button"
        onClick={() => handleReaction('LIKE')}
        className={isLiked ? 'font-bold text-foreground' : 'text-link hover:underline'}
      >
        {isLiked ? '★' : '☆'} 좋아요 {reactionStats.likeCount}
      </button>
      <button
        type="button"
        onClick={() => handleReaction('DISLIKE')}
        className={isDisliked ? 'font-bold text-foreground' : 'text-link hover:underline'}
      >
        {isDisliked ? '★' : '☆'} 싫어요 {reactionStats.dislikeCount}
      </button>
    </div>
  )
}
