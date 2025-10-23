import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
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
  description: 'Next.js 풀스택으로 만든 다미파파의 개인 블로그. 개발, 기술, 일상에 대한 이야기를 공유합니다.',
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
    description: 'Next.js 풀스택으로 만든 다미파파의 개인 블로그',
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
    description: 'Next.js 풀스택으로 만든 다미파파의 개인 블로그',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
  },
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
        
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Analytics />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

