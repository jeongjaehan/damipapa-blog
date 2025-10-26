'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCareerData } from '@/services/api'
import { CareerData } from '@/types'
import CareerTimeline from '@/components/career/CareerTimeline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Loading from '@/components/common/Loading'
import { Settings, Download } from 'lucide-react'
import Link from 'next/link'
import { usePDFDownload } from '@/hooks/usePDFDownload'

export default function CareerPage() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState<CareerData | null>(null)
  const [loading, setLoading] = useState(true)
  const { isGenerating, generatePDF } = usePDFDownload()

  useEffect(() => {
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

    loadData()
  }, [])

  const handlePDFDownload = async () => {
    if (!data?.profile?.name) return
    await generatePDF('career-content', `${data.profile.name}_프로필`)
  }

  if (loading) {
    return <Loading />
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="border-stone-200">
          <div className="p-8 text-center text-gray-500">
            <p>경력 정보를 불러올 수 없습니다.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <Card className="border-stone-200">
        <div className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">프로필</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={handlePDFDownload} 
                disabled={isGenerating}
                variant="outline" 
                className="gap-2 w-full sm:w-auto text-sm sm:text-base"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{isGenerating ? 'PDF 생성 중...' : 'PDF 다운로드'}</span>
              </Button>
              {isAdmin && (
                <Link href="/admin/career" className="w-full sm:w-auto">
                  <Button variant="outline" className="gap-2 w-full text-sm sm:text-base">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    관리
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {data.careers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>등록된 경력이 없습니다.</p>
            </div>
          ) : (
            <div id="career-content">
              <CareerTimeline profile={data.profile} careers={data.careers} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

