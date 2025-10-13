'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPost, updatePost, uploadFile } from '@/services/api'
import { PostDetail } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Upload, Eye, Edit3, Save, X } from 'lucide-react'

interface PostEditorProps {
  post?: PostDetail
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [category, setCategory] = useState(post?.category || '')
  const [tags, setTags] = useState<string[]>(post?.tags ? Array.from(post.tags) : [])
  const [tagInput, setTagInput] = useState('')
  const [published, setPublished] = useState(true) // 기본값을 true로 변경
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('이미지 업로드 시작:', file.name, file.size, 'bytes')
    
    setUploading(true)
    try {
      const result = await uploadFile(file)
      console.log('업로드 성공:', result)
      
      const imageUrl = result.url
      const imageMarkdown = `![${result.filename}](${imageUrl})`
      
      console.log('이미지 마크다운:', imageMarkdown)
      setContent(content + '\n\n' + imageMarkdown)
      alert('이미지가 업로드되었습니다!')
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error)
      const errorMsg = error.response?.data?.message || error.message || '이미지 업로드에 실패했습니다'
      alert('이미지 업로드 실패: ' + errorMsg)
    } finally {
      setUploading(false)
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
        excerpt,
        category: category || undefined,
        tags,
        published,
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
          <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
            요약
          </label>
          <input
            id="excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="포스트 요약을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            카테고리
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="카테고리를 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">태그</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="태그를 입력하고 엔터를 누르세요"
            />
            <Button type="button" onClick={handleTagAdd} size="sm">
              추가
            </Button>
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
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium">내용 *</label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? '업로드 중...' : '이미지'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? '편집' : '미리보기'}
            </Button>
          </div>
        </div>


        {showPreview ? (
          <div className="border rounded p-4 min-h-[400px] markdown bg-white text-gray-900">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-gray-400">내용을 입력하면 미리보기가 표시됩니다...</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={20}
            spellCheck={true}
            lang="ko"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            placeholder="마크다운으로 내용을 작성하세요..."
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">발행하기</span>
        </label>
        <p className="text-sm text-gray-500 mt-1">
          체크하지 않으면 임시 저장됩니다
        </p>
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
          {loading ? '저장 중...' : post ? '수정' : '작성'}
        </Button>
      </div>
    </form>
  )
}

