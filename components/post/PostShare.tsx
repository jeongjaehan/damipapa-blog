'use client'

import { useState } from 'react'

interface PostShareProps {
  postId: number
  postTitle: string
}

export default function PostShare({ postId, postTitle }: PostShareProps) {
  const [copied, setCopied] = useState(false)

  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/posts/${postId}`
    : ''

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes')
  }

  const handleFacebookShare = () => {
    // 페이스북은 URL만 필요하며, 메타데이터를 자동으로 크롤링합니다
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    openShareWindow(shareUrl)
  }

  const handleLinkedInShare = () => {
    // 링크드인도 URL만 필요하며, 메타데이터를 자동으로 크롤링합니다
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
    openShareWindow(shareUrl)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('링크 복사 실패:', error)
      alert('링크 복사에 실패했습니다')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border py-4 text-sm">
      <span className="text-muted-foreground">공유하기</span>
      <button type="button" onClick={handleFacebookShare} className="text-link hover:underline">
        페이스북
      </button>
      <button type="button" onClick={handleLinkedInShare} className="text-link hover:underline">
        링크드인
      </button>
      <button type="button" onClick={handleCopyLink} className="text-link hover:underline">
        {copied ? '복사됨' : '링크 복사'}
      </button>
    </div>
  )
}
