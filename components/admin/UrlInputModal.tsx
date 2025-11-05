'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  useEffect(() => {
    if (isOpen) {
      setUrl('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
      setUrl('')
      onClose()
    }
  }

  const handleClose = () => {
    setUrl('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium mb-2">
            URL
          </label>
          <Input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={placeholder}
            className="w-full"
            autoFocus
            style={{ color: '#111827', backgroundColor: '#fff' }}
          />
          {example && (
            <p className="mt-2 text-sm text-gray-500">{example}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button type="submit" disabled={!url.trim()}>
            확인
          </Button>
        </div>
      </form>
    </Modal>
  )
}

