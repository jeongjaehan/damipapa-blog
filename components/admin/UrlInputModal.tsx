'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface UrlInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string) => void
  title: string
  placeholder: string
  example?: string
}

export default function UrlInputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder,
  example,
}: UrlInputModalProps) {
  const [url, setUrl] = useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUrl('')
      // 모달이 열릴 때 입력 필드에 포커스
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
      setUrl('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              autoFocus
            />
            {example && (
              <p className="mt-2 text-sm text-gray-500">{example}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!url.trim()}
            >
              추가
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
