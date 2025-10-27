import { Metadata } from 'next'

async function getCareerData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    const response = await fetch(`${baseUrl}/career`, {
      next: { revalidate: 3600 }
    })
    if (!response.ok) throw new Error('Failed to fetch')
    return await response.json()
  } catch (error) {
    // 기본값 반환
    return {
      profile: {
        name: '정재한',
        bio: 'Senior Developer'
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCareerData()
  const profileName = data.profile?.name || '정재한'
  const profileBio = data.profile?.bio || 'Senior Developer'
  
  return {
    title: `${profileName} 프로필 | 다미파파의 블로그`,
    description: `${profileName}의 개발 경력과 프로필을 확인하세요. ${profileBio}로서의 성장 과정과 주요 프로젝트 경험을 소개합니다.`,
    keywords: `${profileName}, 프로필, 개발자, ${profileBio}, 경력, 이력서`,
    openGraph: {
      title: `${profileName} 프로필`,
      description: `${profileBio} ${profileName}의 개발 경력과 프로젝트 경험을 확인하세요.`,
      type: 'profile',
      url: 'https://damipapa.com/career',
      siteName: '다미파파의 블로그',
      images: [
        {
          url: data.profile?.avatar || 'https://damipapa.com/og-career.jpg',
          width: 1200,
          height: 630,
          alt: `${profileName} 프로필`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profileName} 프로필`,
      description: `${profileBio} ${profileName}의 개발 경력과 프로젝트 경험을 확인하세요.`,
      images: [data.profile?.avatar || 'https://damipapa.com/og-career.jpg'],
    },
  }
}

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
