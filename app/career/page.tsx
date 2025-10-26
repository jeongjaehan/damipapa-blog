'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCareerData } from '@/services/api'
import { CareerData } from '@/types'
import CareerTimeline from '@/components/career/CareerTimeline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Loading from '@/components/common/Loading'
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default function CareerPage() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState<CareerData | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="border-stone-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">경력</h1>
            {isAdmin && (
              <Link href="/admin/career">
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  관리
                </Button>
              </Link>
            )}
          </div>

          {data.careers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>등록된 경력이 없습니다.</p>
            </div>
          ) : (
            <CareerTimeline profile={data.profile} careers={data.careers} />
          )}
        </div>
      </Card>
    </div>
  )
}

