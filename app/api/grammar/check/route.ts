import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt for grammar checking (cached for token efficiency)
const SYSTEM_PROMPT = `당신은 한국어 문법 전문가입니다. 주어진 텍스트의 맞춤법, 문법, 띄어쓰기를 검토하고 더 자연스럽고 명확한 문장으로 개선해주세요.

이 글을 논리적이고 자연스러운 완성형 글로 다듬어라.  
- 구어체를 서면체로 수정  
- 문단별 주제 명확히  
- 논리적 연결어 추가  
- 불필요한 표현 삭제  
- 어조는 차분하고 신뢰감 있게 유지  
- 단어 선택은 자연스럽고 세련되게  
- 맞춤법과 문법 오류를 수정합니다

응답은 반드시 다음 JSON 형식으로 제공해주세요:
{
  "correctedText": "수정된 전체 텍스트",
  "changes": [
    {
      "original": "원본 문구",
      "corrected": "수정된 문구",
      "reason": "수정 이유"
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '유효한 텍스트를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Call OpenAI API with GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3, // Lower temperature for consistent grammar checking
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: '응답을 받지 못했습니다.' },
        { status: 500 }
      )
    }

    const result = JSON.parse(response)

    return NextResponse.json({
      original: text,
      corrected: result.correctedText,
      changes: result.changes || [],
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    })
  } catch (error: any) {
    console.error('Grammar check error:', error)
    
    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 유효하지 않습니다.' },
        { status: 401 }
      )
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error?.message || '문법 검사 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

