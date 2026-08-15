import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Satori는 woff2를 지원하지 않으므로 OTF 사용
const PRETENDARD_REGULAR =
  'https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/public/static/Pretendard-Regular.otf'
const PRETENDARD_BOLD =
  'https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/public/static/Pretendard-Bold.otf'

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`)
  return res.arrayBuffer()
}

async function getPostMeta(id: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${baseUrl}/api/posts/${id}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function extractText(content: string, max = 140): string {
  if (!content) return ''
  let text = content.replace(/<[^>]*>/g, '')
  text = text.replace(/!\[.*?\]\(.*?\)/g, '')
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
  text = text.replace(/^#{1,6}\s+/gm, '')
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`[^`]+`/g, '')
  text = text.replace(/[*_~]/g, '')
  text = text.replace(/\s+/g, ' ').trim()
  return text.length > max ? text.slice(0, max) + '…' : text
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = await getPostMeta(id)

  const title = post?.title || '다미파파의 블로그'
  const summary =
    extractText(post?.content || '', 140) ||
    '개발, 기술, 일상에 대한 이야기를 공유합니다.'
  const tags: string[] = Array.isArray(post?.tags) ? post.tags.slice(0, 3) : []
  const date = formatDate(post?.createdAt)

  const [regular, bold] = await Promise.all([
    fetchFont(PRETENDARD_REGULAR),
    fetchFont(PRETENDARD_BOLD),
  ])

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #FAF6F0 0%, #F4ECE0 55%, #EBDDC8 100%)',
          fontFamily: 'Pretendard',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 32,
            color: '#8B6F47',
          }}
        >
          <span style={{ marginRight: 14 }}>🏡</span>
          <span style={{ fontWeight: 700 }}>다미파파의 블로그</span>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: 40,
            paddingBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: '#2D1810',
              lineHeight: 1.25,
              marginBottom: 28,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: '#6B5B4A',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {summary}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #D4C4A8',
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex', gap: 18 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 26,
                  color: '#8B6F47',
                  fontWeight: 500,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 26, color: '#8B6F47' }}>{date}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Pretendard', data: regular, weight: 400, style: 'normal' },
        { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
      ],
    }
  )

  image.headers.set(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
  )
  return image
}
