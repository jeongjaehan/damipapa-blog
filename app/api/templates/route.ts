import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Parse tags from JSON strings to arrays
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      tags: template.tags ? JSON.parse(template.tags) : [],
      content: template.content,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }))

    return NextResponse.json(formattedTemplates)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
