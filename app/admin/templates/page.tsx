'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { PageResponse, Template } from '@/types'
import { formatDate } from '@/utils/date'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import api from '@/services/api'

export default function AdminTemplatesPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<PageResponse<Template> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadTemplates()
    }
  }, [isAdmin, authLoading, router])

  const loadTemplates = useCallback(async () => {
    try {
      const response = await api.get<PageResponse<Template>>('/admin/templates?page=0&size=20')
      setTemplates(response.data)
    } catch (error) {
      console.error('템플릿 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 템플릿을 삭제하시겠습니까?`)) {
      return
    }

    try {
      await api.delete(`/admin/templates/${id}`)
      loadTemplates()
    } catch (error) {
      console.error('템플릿 삭제 실패:', error)
      alert('템플릿 삭제에 실패했습니다')
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
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">템플릿 관리</h1>
          <p className="text-gray-600 mt-2">포스트 템플릿을 관리하세요</p>
        </div>
        <Link href="/admin/templates/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 템플릿 생성
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
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
            {templates?.content.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {template.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {template.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(template.createdAt)}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2">
                  <Link href={`/admin/templates/edit/${template.id}`}>
                    <Button size="sm" variant="outline">편집</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(template.id, template.name)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {templates?.content.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>템플릿이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
