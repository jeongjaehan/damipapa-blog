'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getCareerData, createCareer, updateCareer, deleteCareer, updateCareerProfile } from '@/services/api'
import { Career, CareerData, CareerProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Loading from '@/components/common/Loading'
import { Plus, Edit, Trash2, Eye, User } from 'lucide-react'
import CareerForm from '@/components/admin/CareerForm'
import ProfileForm from '@/components/admin/ProfileForm'
import CareerTimeline from '@/components/career/CareerTimeline'

function AdminCareerContent() {
  const { isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<CareerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/auth/login')
      return
    }

    if (isAdmin) {
      loadData()
    }
  }, [isAdmin, authLoading, router])

  const loadData = async () => {
    try {
      const careerData = await getCareerData()
      setData(careerData)
    } catch (error) {
      console.error('경력 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCareer(null)
    setShowForm(true)
  }

  const handleEdit = (career: Career) => {
    setEditingCareer(career)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 경력을 삭제하시겠습니까?')) return

    try {
      await deleteCareer(id)
      await loadData()
    } catch (error) {
      console.error('경력 삭제 실패:', error)
      alert('경력 삭제에 실패했습니다.')
    }
  }

  const handleSave = async (careerData: Omit<Career, 'id'>) => {
    try {
      if (editingCareer) {
        await updateCareer(editingCareer.id, careerData)
      } else {
        await createCareer(careerData)
      }
      await loadData()
      setShowForm(false)
      setEditingCareer(null)
    } catch (error) {
      console.error('경력 저장 실패:', error)
      alert('경력 저장에 실패했습니다.')
    }
  }

  const handleSaveProfile = async (profileData: Partial<CareerProfile>) => {
    try {
      await updateCareerProfile(profileData)
      await loadData()
      setEditingProfile(false)
    } catch (error) {
      console.error('프로필 저장 실패:', error)
      alert('프로필 저장에 실패했습니다.')
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAdmin) {
    return null
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          <p>경력 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">프로필 관리</h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? '목록 보기' : '미리 보기'}
          </Button>
          <Button onClick={() => setEditingProfile(true)} variant="outline">
            <User className="w-4 h-4 mr-2" />
            프로필 편집
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            추가
          </Button>
        </div>
      </div>

      {editingProfile ? (
        <ProfileForm
          profile={data.profile}
          onSave={handleSaveProfile}
          onCancel={() => setEditingProfile(false)}
        />
      ) : showForm ? (
        <CareerForm
          career={editingCareer}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingCareer(null)
          }}
        />
      ) : showPreview ? (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">미리 보기</CardTitle>
          </CardHeader>
          <CardContent>
            <CareerTimeline profile={data.profile} careers={data.careers} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">경력 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {data.careers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>등록된 경력이 없습니다.</p>
                <Button onClick={handleAdd} className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  첫 경력 추가
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="px-4 py-3 text-left text-muted-foreground">시작일자</th>
                      <th className="px-4 py-3 text-left text-muted-foreground">종료일자</th>
                      <th className="px-4 py-3 text-left text-muted-foreground">제목</th>
                      <th className="px-4 py-3 text-left text-muted-foreground">부제목</th>
                      <th className="px-4 py-3 text-left text-muted-foreground">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.careers.map((career) => (
                      <tr key={career.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3 font-semibold text-foreground">{career.startDate}</td>
                        <td className="px-4 py-3 text-foreground">{career.endDate || '현재'}</td>
                        <td className="px-4 py-3 text-foreground">{career.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{career.subtitle}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(career)}
                              className="gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(career.id)}
                              className="gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                              삭제
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function AdminCareerPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminCareerContent />
    </Suspense>
  )
}

