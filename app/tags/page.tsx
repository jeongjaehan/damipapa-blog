'use client'

import { useEffect, useMemo, useState } from 'react'
import { getPosts } from '@/services/api'
import TagCloud from '@/components/tags/TagCloud'
import { buildTagMetrics } from '@/lib/tags/metrics'
import type { TagMetric } from '@/lib/tags/metrics'
import Loading from '@/components/common/Loading'

export default function TagsPage() {
  const [tags, setTags] = useState<TagMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTags = async () => {
      try {
        // 모든 포스트 가져오기 (충분한 size로)
        const data = await getPosts(0, 10000)
        const posts = data.content

        const metrics = buildTagMetrics(posts)

        setTags(metrics)
      } catch (error) {
        console.error('태그 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  const topTags = useMemo(() => tags.slice(0, 5), [tags])
  const totalUsage = useMemo(
    () => tags.reduce((sum, tag) => sum + tag.count, 0),
    [tags]
  )
  const highlightTag = topTags[0]

  if (loading) {
    return <Loading />
  }

  if (!tags.length) {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">태그 클라우드</h1>
        <p className="text-gray-500">아직 등록된 태그가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">태그 클라우드</h1>
        <p className="text-gray-500">
          자주 사용된 태그일수록 더 크고 선명하게 떠올라요. 원하는 태그를 클릭해 관련 글을 탐색해보세요.
        </p>
      </div>

      <TagCloud tags={tags} />

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-gray-900">인기 태그 Top 5</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            {topTags.map((tag, index) => (
              <li key={tag.name} className="flex items-center justify-between">
                <span className="font-medium text-gray-800">
                  {index + 1}. #{tag.name}
                </span>
                <span>
                  {tag.count}회 · {tag.ratio.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-gray-900">태그 인사이트</h2>
          <dl className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">전체 태그 수</dt>
              <dd className="font-semibold text-gray-800">{tags.length}개</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">총 태그 사용량</dt>
              <dd className="font-semibold text-gray-800">{totalUsage}회</dd>
            </div>
            {highlightTag && (
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">가장 많이 언급된 태그</dt>
                <dd className="font-semibold text-indigo-600">
                  #{highlightTag.name}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-gradient-to-br from-sky-50 via-white to-violet-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">태그 활용 팁</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>태그를 클릭하면 해당 주제의 글만 모아서 볼 수 있어요.</li>
            <li>태그 구름은 자동으로 최신 글 정보를 반영해 업데이트됩니다.</li>
            <li>새로운 태그를 추가하면 이곳에서 바로 확인할 수 있어요.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

