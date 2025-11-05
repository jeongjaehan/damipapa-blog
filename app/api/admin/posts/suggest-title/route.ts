import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 content 추출
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: '본문 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // HTML 태그 제거 (간단한 정규식 사용)
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    // 본문이 너무 길면 앞부분만 사용 (토큰 제한 고려)
    const maxLength = 3000
    const textToAnalyze = plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 블로그 포스트의 제목을 추천하는 전문가입니다. 주어진 본문 내용을 분석하여 매력적이고 명확한 제목을 3개 제안해주세요. 각 제목은 한 줄로 작성하고, 너무 길지 않게 만들어주세요 (최대 50자). 제목만 출력하고, 번호나 추가 설명은 붙이지 마세요.',
        },
        {
          role: 'user',
          content: `다음 블로그 포스트의 내용을 바탕으로 적절한 제목 3개를 추천해주세요:\n\n${textToAnalyze}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const suggestions = completion.choices[0]?.message?.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[\d.\-*]+\s*/, '').trim()) // 번호나 불릿 제거
      .slice(0, 3) // 최대 3개만

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json(
        { message: '제목 추천을 생성하지 못했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error('OpenAI API 오류:', error)
    
    // OpenAI API 오류 처리
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { message: 'OpenAI API 할당량이 초과되었습니다.' },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { message: error.message || '제목 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

