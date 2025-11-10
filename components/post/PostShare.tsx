'use client'

import { useState } from 'react'
import { Facebook, Linkedin, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="flex items-center gap-3 py-4 border-t border-border flex-wrap">
      <span className="text-sm text-foreground font-medium">공유하기:</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFacebookShare}
          className="gap-2"
          aria-label="페이스북 공유"
        >
          <Facebook className="w-4 h-4" />
          <span className="hidden sm:inline">페이스북</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLinkedInShare}
          className="gap-2"
          aria-label="링크드인 공유"
        >
          <Linkedin className="w-4 h-4" />
          <span className="hidden sm:inline">링크드인</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className={`gap-2 ${copied ? 'bg-green-50 border-green-300 text-green-700' : ''}`}
          aria-label="링크 복사"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">복사됨!</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">링크 복사</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

