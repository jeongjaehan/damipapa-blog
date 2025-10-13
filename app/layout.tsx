import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '다미파파의 블로그',
  description: 'Next.js 풀스택으로 만든 다미파파의 개인 블로그',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1948329005731989'
  
  return (
    <html lang="ko">
      <body className={inter.className}>
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

