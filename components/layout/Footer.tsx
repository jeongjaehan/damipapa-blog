import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">다미파파의 블로그</h3>
            <p className="text-gray-300">
              100% 바이브 코딩으로 만든 내 블로그
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">기술 스택</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Next.js 15 (풀스택)</li>
              <li>• Prisma + MySQL</li>
              <li>• TypeScript</li>
              <li>• shadcn/ui</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">링크</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-300 hover:text-white">
                  검색
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-gray-300 hover:text-white">
                  태그
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} 다미파파의 블로그. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

