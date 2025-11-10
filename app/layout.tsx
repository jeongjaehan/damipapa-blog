import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Analytics from '@/components/common/Analytics'
import Loading from '@/components/common/Loading'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '다미파파의 블로그',
    template: '%s | 다미파파의 블로그',
  },
  description: '100% 바이브 코딩으로 만든  블로그. 개발, 기술, 일상에 대한 이야기를 공유합니다.',
  keywords: ['블로그', '개발', '기술', 'Next.js', '프로그래밍'],
  authors: [{ name: '다미파파' }],
  creator: '다미파파',
  publisher: '다미파파',
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: 'index, follow',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: baseUrl,
    siteName: '다미파파의 블로그',
    title: '다미파파의 블로그',
    description: '100% 바이브 코딩으로 만든  블로그',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '다미파파의 블로그',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '다미파파의 블로그',
    description: '100% 바이브 코딩으로 만든  블로그',
  },
  icons: {
    // 다양한 해상도 favicon (ICO 파일 우선, PNG 보조)
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon_16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon_64x64.png', sizes: '64x64', type: 'image/png' },
    ],
    
    // Apple 디바이스용 터치 아이콘 (iPhone/iPad 홈 화면)
    apple: [
      { url: '/favicon_180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    
    // Android Chrome 및 기타 디바이스용
    other: [
      {
        rel: 'icon',
        url: '/favicon_192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon', 
        url: '/favicon_512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1948329005731989'
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* Google Analytics 4 */}
        {gaMeasurementId && gaMeasurementId !== 'your_ga_id' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        
        {/* Facebook SDK */}
        <Script id="facebook-sdk" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId: '${fbAppId}',
                xfbml: true,
                version: 'v18.0'
              });
            };
            (function(d, s, id){
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {return;}
              js = d.createElement(s); js.id = id;
              js.src = "https://connect.facebook.net/ko_KR/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
          `}
        </Script>
        <div id="fb-root"></div>
        
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<Loading />}>
              <Analytics />
            </Suspense>
            <div className="min-h-screen flex flex-col bg-background">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8 bg-background">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

