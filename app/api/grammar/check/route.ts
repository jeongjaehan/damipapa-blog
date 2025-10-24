import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { DEFAULT_GRAMMAR_SYSTEM_PROMPT, DEFAULT_GPT_SETTINGS } from '@/lib/prompts'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const { text, systemPrompt, temperature, maxTokens } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '유효한 텍스트를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Use custom settings or defaults
    const finalSystemPrompt = systemPrompt || DEFAULT_GRAMMAR_SYSTEM_PROMPT
    const finalTemperature = temperature ?? DEFAULT_GPT_SETTINGS.temperature
    const finalMaxTokens = maxTokens ?? DEFAULT_GPT_SETTINGS.maxTokens

    // Call OpenAI API with GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: DEFAULT_GPT_SETTINGS.model,
      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: finalTemperature,
      max_tokens: finalMaxTokens,
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

