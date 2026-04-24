'use client'

import { useEffect, useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      <div className="flex items-center gap-4 py-6 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ThumbsUp className="w-4 h-4 mr-2" />
            <span className="text-sm">0</span>
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ThumbsDown className="w-4 h-4 mr-2" />
            <span className="text-sm">0</span>
          </Button>
        </div>
      </div>
    )
  }

  const isLiked = reactionStats.userReaction?.type === 'LIKE'
  const isDisliked = reactionStats.userReaction?.type === 'DISLIKE'

  return (
    <div className="flex items-center gap-4 py-6 border-t border-border">
      <Button
        variant={isLiked ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleReaction('LIKE')}
        className={`gap-2 ${isLiked ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
      >
        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{reactionStats.likeCount}</span>
      </Button>
      <Button
        variant={isDisliked ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleReaction('DISLIKE')}
        className={`gap-2 ${isDisliked ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
      >
        <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{reactionStats.dislikeCount}</span>
      </Button>
    </div>
  )
}

