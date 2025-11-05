'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPromptTemplate } from '@/services/api'
import { Button } from '@/components/ui/button'
import { X, Save } from 'lucide-react'
import { DEFAULT_GRAMMAR_PROMPT_SETTINGS } from '@/lib/prompts'

export default function NewPromptPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_GRAMMAR_PROMPT_SETTINGS.systemPrompt)
  const [temperature, setTemperature] = useState(DEFAULT_GRAMMAR_PROMPT_SETTINGS.temperature)
  const [maxTokens, setMaxTokens] = useState(DEFAULT_GRAMMAR_PROMPT_SETTINGS.maxTokens)
  const [model, setModel] = useState('gpt-4o-mini')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
    }
  }, [isAdmin, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!title.trim() || !systemPrompt.trim()) {
        setError('제목과 시스템 프롬프트는 필수입니다')
        setLoading(false)
        return
      }

      await createPromptTemplate({
        title,
        description: description.trim() || undefined,
        systemPrompt,
        temperature,
        maxTokens,
        model,
      })

      router.push('/admin/prompts')
    } catch (err: any) {
      setError(err.response?.data?.message || '프롬프트 생성에 실패했습니다')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">새 프롬프트 생성</h1>
        <p className="text-gray-600 mt-2">AI 문장 개선용 프롬프트 템플릿을 만들어보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            프롬프트 제목 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            placeholder="예: 일기 프롬프트, 기술 문서 프롬프트"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            설명
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            placeholder="프롬프트에 대한 간단한 설명"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <label htmlFor="systemPrompt" className="block text-sm font-medium mb-2">
            시스템 프롬프트 *
          </label>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            required
            rows={15}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            style={{ color: '#111827', backgroundColor: '#ffffff' }}
            placeholder="시스템 프롬프트를 입력하세요..."
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium mb-2">
                Temperature: {temperature}
              </label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>일관적 (0.0)</span>
                <span>창의적 (1.0)</span>
              </div>
            </div>

            <div>
              <label htmlFor="maxTokens" className="block text-sm font-medium mb-2">
                Max Tokens
              </label>
              <input
                id="maxTokens"
                type="number"
                min="1000"
                max="8000"
                step="1"
                value={maxTokens}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  if (value >= 1000 && value <= 8000) {
                    setMaxTokens(value)
                  }
                }}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium mb-2">
                Model
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              >
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-5">gpt-5</option>
                <option value="gpt-5-turbo">gpt-5-turbo</option>
                <option value="gpt-5o">gpt-5o</option>
                <option value="gpt-5o-mini">gpt-5o-mini</option>
                {!['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-5', 'gpt-5-turbo', 'gpt-5o', 'gpt-5o-mini'].includes(model) && (
                  <option value={model}>{model} (사용자 정의)</option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/prompts')}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? '생성 중...' : '프롬프트 생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}

