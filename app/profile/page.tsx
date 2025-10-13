'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getProfile } from '@/services/api'
import { Profile } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Loading from '@/components/common/Loading'
import Link from 'next/link'
import { Edit, Calendar } from 'lucide-react'
import { formatFullDate } from '@/utils/date'

export default function ProfilePage() {
  const { isAdmin } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch (error) {
        console.error('프로필 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-stone-200">
        <CardHeader className="bg-gradient-to-b from-stone-50 to-white">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-4xl font-bold tracking-tight">
              프로필
            </CardTitle>
            {isAdmin && (
              <Link href="/admin/profile/edit">
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  편집
                </Button>
              </Link>
            )}
          </div>
          
          {profile?.updatedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>마지막 수정: {formatFullDate(profile.updatedAt)}</span>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="p-8">
          <div className="markdown prose prose-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {profile?.content || '# 프로필\n\n프로필이 아직 작성되지 않았습니다.'}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

