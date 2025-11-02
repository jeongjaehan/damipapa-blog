'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FacebookCommentsProps {
  url: string
}

export default function FacebookComments({ url }: FacebookCommentsProps) {
  useEffect(() => {
    // Facebook SDK가 로드된 후 Comments 파싱
    if (window.FB?.XFBML) {
      window.FB.XFBML.parse()
    }
  }, [url])

  return (
    <Card className="border-stone-200 mt-12">
      <CardHeader>
        <CardTitle className="text-2xl">댓글</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="fb-comments" 
          data-href={url} 
          data-width="100%" 
          data-numposts="10"
          data-order-by="reverse_time"
        />
      </CardContent>
    </Card>
  )
}

