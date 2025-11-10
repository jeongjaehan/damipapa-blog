'use client'

import React, { useState, useEffect } from 'react'
import { useRouter} from 'next/navigation'
import { createPost, updatePost, uploadFile, getTags, getTemplates, suggestPostTitle } from '@/services/api'
import { PostDetail, Template } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TipTapEditor from './TipTapEditor'
import { Save, X, Sparkles } from 'lucide-react'
import { trackPostCreate } from '@/lib/gtag'
import { smartCompressImage } from '@/utils/imageUtils'

interface PostEditorProps {
  post?: PostDetail
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [tags, setTags] = useState<string[]>(post?.tags ? Array.from(post.tags) : [])
  const [isPrivate, setIsPrivate] = useState(post?.isPrivate || false)
  const [tagInput, setTagInput] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestingTitle, setSuggestingTitle] = useState(false)
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)

  // 기존 태그 목록 및 템플릿 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagsData, templatesData] = await Promise.all([
          getTags(),
          getTemplates(),
        ])
        setAllTags(tagsData)
        setTemplates(templatesData)
      } catch (error) {
        console.error('데이터 로딩 실패:', error)
      }
    }
    loadData()
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

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId))
    if (template) {
      setContent(template.content)
      setTags(template.tags || [])
      setSelectedTemplate(templateId)
    }
  }

  const handleClearTemplate = () => {
    setContent('')
    setSelectedTemplate('')
  }

  const handleSuggestTitle = async () => {
    if (!content || content.trim().length === 0) {
      setError('제목을 추천받으려면 먼저 본문 내용을 작성해주세요.')
      return
    }

    setSuggestingTitle(true)
    setError('')

    try {
      const suggestions = await suggestPostTitle(content)
      setTitleSuggestions(suggestions)
      setShowSuggestionModal(true)
    } catch (err: any) {
      setError(err.response?.data?.message || '제목 추천 중 오류가 발생했습니다.')
    } finally {
      setSuggestingTitle(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setTitle(suggestion)
    setShowSuggestionModal(false)
    setTitleSuggestions([])
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    console.log('이미지 업로드 시작:', file.name, file.size, 'bytes')
    
    try {
      // 이미지 압축
      console.log('이미지 압축 중...')
      const compressedFile = await smartCompressImage(file)
      console.log('압축 완료:', compressedFile.name, compressedFile.size, 'bytes')
      
      // 압축된 파일 업로드
      const result = await uploadFile(compressedFile)
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
        isPrivate,
      }

      if (post) {
        await updatePost(post.id, postData)
      } else {
        await createPost(postData)
        // 새 게시글 작성 추적
        trackPostCreate(title)
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
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg shadow-md p-6 space-y-4 border border-border">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="title" className="block text-sm font-medium text-foreground">
              제목 *
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSuggestTitle}
              disabled={suggestingTitle || !content}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {suggestingTitle ? 'AI 생성 중...' : 'AI 제목 추천'}
            </Button>
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full px-4 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="포스트 제목을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">태그</label>
          <div className="relative">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => handleTagInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                onFocus={() => tagInput && filteredTags.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="flex-1 px-4 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="태그를 입력하고 엔터를 누르세요"
              />
              <Button type="button" onClick={() => handleTagAdd()} size="sm">
                추가
              </Button>
            </div>
            
            {/* 태그 자동완성 드롭다운 */}
            {showSuggestions && filteredTags.length > 0 && (
              <div className="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagAdd(tag)}
                    className="w-full px-4 py-2 text-left text-foreground hover:bg-muted focus:bg-muted focus:outline-none"
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
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
            />
            <span className="text-sm font-medium text-foreground">나만 보기 (비공개)</span>
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            체크하면 관리자만 볼 수 있는 비공개 포스트로 설정됩니다.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-md p-6 border border-border">
        <label className="block text-sm font-medium mb-4 text-foreground">템플릿 (선택사항)</label>
        <div className="flex gap-2 mb-4">
          <select
            value={selectedTemplate}
            onChange={(e) => handleApplyTemplate(e.target.value)}
            className="flex-1 px-4 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">템플릿 선택...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
          {selectedTemplate && (
            <Button type="button" variant="outline" onClick={handleClearTemplate} size="sm">
              초기화
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-md p-6 border border-border">
        <label className="block text-sm font-medium mb-4 text-foreground">내용 *</label>
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

      {/* 제목 추천 모달 */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                AI 제목 추천
              </h3>
              <button
                onClick={() => setShowSuggestionModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              본문 내용을 분석해서 생성한 제목입니다. 마음에 드는 제목을 클릭하세요.
            </p>
            <div className="space-y-3">
              {titleSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-foreground">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSuggestionModal(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

