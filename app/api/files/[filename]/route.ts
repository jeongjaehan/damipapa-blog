import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    
    // 파일 경로 생성
    const filePath = join(UPLOAD_DIR, filename)
    
    // 파일 읽기
    const fileBuffer = await readFile(filePath)
    
    // MIME 타입 결정
    const ext = filename.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
    }
    
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1년 캐시, immutable 추가
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding', // 압축 지원
      },
    })
  } catch (error) {
    console.error('File serving error:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}
