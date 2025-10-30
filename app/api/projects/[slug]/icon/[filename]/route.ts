import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { lookup } from 'mime-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  try {
    const { slug, filename } = await params
    
    // 보안: 파일명 검증
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return new NextResponse('Invalid filename', { status: 400 })
    }
    
    // 허용된 확장자만 처리
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg']
    const fileExtension = filename.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return new NextResponse('Invalid file type', { status: 400 })
    }
    
    const iconPath = join(process.cwd(), 'data/projects', slug, filename)
    const fileBuffer = await readFile(iconPath)
    
    const mimeType = lookup(filename) || 'application/octet-stream'
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error(`Failed to serve icon ${params}:`, error)
    return new NextResponse('Icon not found', { status: 404 })
  }
}
