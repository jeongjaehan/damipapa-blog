'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getProfile, updateProfile, uploadFile } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TipTapEditor from '@/components/admin/TipTapEditor'
import Loading from '@/components/common/Loading'
import { Save, X } from 'lucide-react'

export default function EditProfilePage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
            <CardTitle>프로필 내용</CardTitle>
          </CardHeader>

          <CardContent>
            <TipTapEditor
              content={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
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

