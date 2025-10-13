'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getProfile, updateProfile } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Loading from '@/components/common/Loading'
import { Eye, Edit3, Save, X } from 'lucide-react'

export default function EditProfilePage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, authLoading])

  const loadProfile = async () => {
    try {
      const data = await getProfile()
      setContent(data.content || '')
    } catch (error) {
      console.error('프로필 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await updateProfile(content)
      alert('프로필이 저장되었습니다!')
      router.push('/profile')
    } catch (err: any) {
      setError(err.response?.data?.message || '프로필 저장에 실패했습니다')
    } finally {
      setSaving(false)
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
      <h1 className="text-4xl font-bold mb-8 text-gray-900 tracking-tight">프로필 편집</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card className="border-stone-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>내용</CardTitle>
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
          </CardHeader>

          <CardContent>
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
                placeholder="마크다운으로 프로필을 작성하세요..."
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/profile')}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  )
}

