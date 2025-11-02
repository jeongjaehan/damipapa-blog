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
  const [facebookId, setFacebookId] = useState<string | null>(null)
  const [checkingFacebook, setCheckingFacebook] = useState(true)

  // Facebook SDK 로그인 상태 확인
  useEffect(() => {
    const checkFacebookLogin = () => {
      if (typeof window === 'undefined' || !window.FB) {
        setCheckingFacebook(false)
        return
      }

      try {
        window.FB.getLoginStatus((response: any) => {
          if (response.status === 'connected' && response.authResponse?.userID) {
            setFacebookId(response.authResponse.userID)
          }
          setCheckingFacebook(false)
        })
      } catch (error) {
        console.error('Facebook login status check failed:', error)
        setCheckingFacebook(false)
      }
    }

    // Facebook SDK가 로드될 때까지 대기
    if (typeof window !== 'undefined') {
      if (window.FB) {
        checkFacebookLogin()
      } else {
        // SDK 로드를 기다림
        const checkInterval = setInterval(() => {
          if (window.FB) {
            clearInterval(checkInterval)
            checkFacebookLogin()
          }
        }, 100)

        // 최대 5초 대기
        setTimeout(() => {
          clearInterval(checkInterval)
          setCheckingFacebook(false)
        }, 5000)
      }
    }
  }, [])

  // 반응 데이터 로드
  useEffect(() => {
    if (!checkingFacebook) {
      loadReactions()
    }
  }, [postId, facebookId, checkingFacebook])

  const loadReactions = async () => {
    try {
      setLoading(true)
      const data = await getPostReactions(postId, facebookId)
      setReactionStats(data)
    } catch (error) {
      console.error('반응 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (reactionType: 'LIKE' | 'DISLIKE') => {
    try {
      const data = await togglePostReaction(postId, reactionType, facebookId)
      setReactionStats(data)
    } catch (error) {
      console.error('반응 토글 실패:', error)
      alert('반응 등록에 실패했습니다')
    }
  }

  if (loading || !reactionStats) {
    return (
      <div className="flex items-center gap-4 py-6 border-t border-gray-200">
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
    <div className="flex items-center gap-4 py-6 border-t border-gray-200">
      <Button
        variant={isLiked ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleReaction('LIKE')}
        className={`gap-2 ${isLiked ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
      >
        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{reactionStats.likeCount}</span>
      </Button>
      <Button
        variant={isDisliked ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleReaction('DISLIKE')}
        className={`gap-2 ${isDisliked ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
      >
        <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
        <span className="text-sm font-medium">{reactionStats.dislikeCount}</span>
      </Button>
    </div>
  )
}

