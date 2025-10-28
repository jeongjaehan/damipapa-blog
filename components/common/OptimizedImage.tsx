'use client'

import { useState } from 'react'
import { ImageIcon, ZoomIn } from 'lucide-react'
import ImageViewerModal from './ImageViewerModal'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  enableModal?: boolean
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  loading = 'lazy',
  enableModal = true,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
    onError?.()
  }

  const handleImageClick = (e: React.MouseEvent) => {
    if (enableModal && !error && !isLoading) {
      e.preventDefault()
      e.stopPropagation()
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 rounded ${className}`}>
        <div className="text-center p-4">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">이미지를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`relative overflow-hidden ${className} ${enableModal ? 'group' : ''}`}>
        {/* 로딩 스켈레톤 */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
        
        {/* 실제 이미지 */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          onClick={handleImageClick}
          className={`transition-all duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } w-full h-auto ${
            enableModal ? 'cursor-zoom-in hover:opacity-90 hover:scale-[1.02]' : ''
          }`}
        />

        {/* 확대 힌트 오버레이 (호버 시에만 표시) */}
        {enableModal && !isLoading && !error && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
              <ZoomIn className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        src={src}
        alt={alt}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
