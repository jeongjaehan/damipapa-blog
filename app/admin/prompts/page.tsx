'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { PageResponse, PromptTemplate } from '@/types'
import { formatDate } from '@/utils/date'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getPromptTemplates, deletePromptTemplate } from '@/services/api'

export default function AdminPromptsPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [prompts, setPrompts] = useState<PageResponse<PromptTemplate> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadPrompts()
    }
  }, [isAdmin, authLoading, router])

  const loadPrompts = useCallback(async () => {
    try {
      const data = await getPromptTemplates(0, 20)
      setPrompts(data)
    } catch (error) {
      console.error('프롬프트 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 프롬프트를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deletePromptTemplate(id)
      loadPrompts()
    } catch (error) {
      console.error('프롬프트 삭제 실패:', error)
      alert('프롬프트 삭제에 실패했습니다')
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">프롬프트 관리</h1>
          <p className="text-gray-600 mt-2">AI 문장 개선용 프롬프트 템플릿을 관리하세요</p>
        </div>
        <Link href="/admin/prompts/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 프롬프트 생성
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temperature
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Tokens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prompts?.content.map((prompt) => (
              <tr key={prompt.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {prompt.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {prompt.description || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {prompt.temperature}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {prompt.maxTokens}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(prompt.createdAt)}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <Link href={`/admin/prompts/edit/${prompt.id}`}>
                    <Button size="sm" variant="outline">편집</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(prompt.id, prompt.title)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {prompts?.content.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>프롬프트가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}

