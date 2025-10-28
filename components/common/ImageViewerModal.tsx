'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageViewerModalProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export default function ImageViewerModal({ src, alt, isOpen, onClose }: ImageViewerModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // 모달 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden'
      
      // ESC 키 이벤트 리스너
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setError(true)
  }

  if (!mounted || !isOpen) {
    return null
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 확대 보기"
    >
      {/* 닫기 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
        aria-label="이미지 뷰어 닫기"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* 이미지 컨테이너 */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center min-w-[200px] min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-white text-center p-8">
            <ZoomIn className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">이미지를 불러올 수 없습니다</p>
            <p className="text-sm text-gray-300">다시 시도해주세요</p>
          </div>
        )}

        {/* 실제 이미지 */}
        {!error && (
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* 이미지 정보 */}
      {!isLoading && !error && alt && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white text-sm bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 max-w-lg mx-auto">
            {alt}
          </p>
        </div>
      )}
    </div>,
    document.body
  )
}
