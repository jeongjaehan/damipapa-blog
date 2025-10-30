import { Metadata } from 'next'
import { readCareerData } from '@/lib/career'

async function getCareerData() {
  try {
    // 실제 career.json 파일에서 데이터를 읽어옴
    return await readCareerData()
  } catch (error) {
    console.error('Career data 로딩 실패:', error)
    // 에러 발생 시 기본값 반환
    return {
      profile: {
        name: '정재한',
        bio: 'Senior Developer',
        avatar: null
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
