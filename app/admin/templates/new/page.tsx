'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createTemplate, getTags } from '@/services/api'
import { Button } from '@/components/ui/button'
import TipTapEditor from '@/components/admin/TipTapEditor'
import { X, Save } from 'lucide-react'

export default function NewTemplatePage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
    }
  }, [isAdmin, authLoading, router])

  // 태그 목록 로드
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await getTags()
        setAllTags(tagsData)
      } catch (error) {
        console.error('태그 로딩 실패:', error)
      }
    }
    loadTags()
  }, [])

  const handleTagInputChange = (value: string) => {
    setTagInput(value)
    if (value.trim()) {
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) &&
        !tags.includes(tag)
      )
      setFilteredTags(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredTags([])
      setShowSuggestions(false)
    }
  }

  const handleTagAdd = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim()
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd])
      setTagInput('')
      setShowSuggestions(false)
      setFilteredTags([])
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!name.trim() || !description.trim() || !content.trim()) {
        setError('모든 필드를 입력해주세요')
        setLoading(false)
        return
      }

      await createTemplate({
        name,
        description,
        tags,
        content,
      })

      router.push('/admin/templates')
    } catch (err: any) {
      setError(err.response?.data?.message || '템플릿 생성에 실패했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">새 템플릿 생성</h1>
        <p className="text-gray-600 mt-2">새로운 포스트 템플릿을 만들어보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            템플릿 이름 *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="예: 튜토리얼, 버그 리포트, 회고"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            설명 *
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={500}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="템플릿에 대한 간단한 설명"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium mb-2">태그</label>
          <div className="relative">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => handleTagInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                onFocus={() => tagInput && filteredTags.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="태그를 입력하고 엔터를 누르세요"
              />
              <Button type="button" onClick={() => handleTagAdd()} size="sm">
                추가
              </Button>
            </div>
            
            {showSuggestions && filteredTags.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagAdd(tag)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium mb-4">템플릿 내용 *</label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            onImageUpload={async () => ''}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/templates')}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? '생성 중...' : '템플릿 생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
