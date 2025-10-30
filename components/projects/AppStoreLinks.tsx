'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, Smartphone, Globe, Github } from 'lucide-react'
import { ProjectLinks } from '@/types'

interface AppStoreLinksProps {
  links: ProjectLinks
  title: string
}

export default function AppStoreLinks({ links, title }: AppStoreLinksProps) {
  const hasAnyLink = Object.values(links).some(link => link)

  if (!hasAnyLink) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 text-sm">아직 링크가 제공되지 않습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">다운로드 & 링크</h3>
      
      <div className="grid gap-3">
        {/* 웹 애플리케이션 링크 */}
        {links.web && (
          <a
            href={links.web}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button 
              variant="default" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-3 py-6"
            >
              <Globe className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">웹에서 사용하기</span>
                <span className="text-xs opacity-80">브라우저에서 바로 이용</span>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </Button>
          </a>
        )}

        {/* iOS 앱스토어 링크 */}
        {links.ios && (
          <a
            href={links.ios}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:border-gray-400 gap-3 py-6"
            >
              <div className="w-5 h-5 bg-black rounded-md flex items-center justify-center">
                <Smartphone className="w-3 h-3 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900">App Store</span>
                <span className="text-xs text-gray-500">iOS 앱 다운로드</span>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </Button>
          </a>
        )}

        {/* Google Play 링크 */}
        {links.android && (
          <a
            href={links.android}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button 
              variant="outline" 
              className="w-full border-green-300 hover:border-green-400 gap-3 py-6"
            >
              <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
                <Smartphone className="w-3 h-3 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900">Google Play</span>
                <span className="text-xs text-gray-500">Android 앱 다운로드</span>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </Button>
          </a>
        )}

        {/* GitHub 링크 */}
        {links.github && (
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:border-gray-400 gap-3 py-4"
            >
              <Github className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900">소스 코드</span>
                <span className="text-xs text-gray-500">GitHub에서 확인</span>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}
