'use client'

import React, { useState, useEffect } from 'react'
import { useRouter} from 'next/navigation'
import { createPost, updatePost, uploadFile, getTags } from '@/services/api'
import { PostDetail } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TipTapEditor from './TipTapEditor'
import { Save, X } from 'lucide-react'

interface PostEditorProps {
  post?: PostDetail
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [tags, setTags] = useState<string[]>(post?.tags ? Array.from(post.tags) : [])
  const [tagInput, setTagInput] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 기존 태그 목록 로드
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

  const handleImageUpload = async (file: File): Promise<string> => {
    console.log('이미지 업로드 시작:', file.name, file.size, 'bytes')
    
    try {
      const result = await uploadFile(file)
      console.log('업로드 성공:', result)
      return result.url
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error)
      const errorMsg = error.response?.data?.message || error.message || '이미지 업로드에 실패했습니다'
      throw new Error(errorMsg)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const postData = {
        title,
        content,
        tags,
        published: true,
      }

      if (post) {
        await updatePost(post.id, postData)
      } else {
        await createPost(postData)
      }

      router.push('/admin/posts')
    } catch (err: any) {
      setError(err.response?.data?.message || '포스트 저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            제목 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="포스트 제목을 입력하세요"
          />
        </div>

        <div>
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
            
            {/* 태그 자동완성 드롭다운 */}
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
          <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium mb-4">내용 *</label>
        <TipTapEditor
          content={content}
          onChange={setContent}
          onImageUpload={handleImageUpload}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/posts')}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          취소
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="w-4 h-4" />
          {loading ? '저장 중...' : post ? '수정' : '발행'}
        </Button>
      </div>
    </form>
  )
}

