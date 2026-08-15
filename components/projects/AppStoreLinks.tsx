'use client'

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
        <p className="text-muted-foreground text-sm">아직 링크가 제공되지 않습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">다운로드 & 링크</h3>

      <ul className="space-y-2 text-sm">
        {/* 웹 애플리케이션 링크 */}
        {links.web && (
          <li>
            <a
              href={links.web}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              [웹사이트]
            </a>
          </li>
        )}

        {/* iOS 앱스토어 링크 */}
        {links.ios && (
          <li>
            <a
              href={links.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              [App Store]
            </a>
          </li>
        )}

        {/* Google Play 링크 */}
        {links.android && (
          <li>
            <a
              href={links.android}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              [Google Play]
            </a>
          </li>
        )}

        {/* GitHub 링크 */}
        {links.github && (
          <li>
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              [GitHub]
            </a>
          </li>
        )}
      </ul>
    </div>
  )
}
