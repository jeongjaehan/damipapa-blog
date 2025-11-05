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

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call OpenAI API with streaming enabled
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
            stream: true,
          })

          let fullContent = ''

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              // Send each chunk to the client
              const data = `data: ${JSON.stringify({ 
                content,
                fullContent,
                done: false 
              })}\n\n`
              controller.enqueue(new TextEncoder().encode(data))
            }

            // Check if stream is done
            if (chunk.choices[0]?.finish_reason) {
              const data = `data: ${JSON.stringify({ 
                content: '',
                fullContent,
                done: true,
                finishReason: chunk.choices[0].finish_reason
              })}\n\n`
              controller.enqueue(new TextEncoder().encode(data))
              break
            }
          }

          controller.close()
        } catch (error: any) {
          console.error('Grammar streaming error:', error)
          
          let errorMessage = '문법 검사 중 오류가 발생했습니다.'
          
          if (error?.status === 401) {
            errorMessage = 'OpenAI API 키가 유효하지 않습니다.'
          } else if (error?.status === 429) {
            errorMessage = 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
          } else if (error?.message) {
            errorMessage = error.message
          }

          const errorData = `data: ${JSON.stringify({ 
            error: errorMessage,
            done: true 
          })}\n\n`
          controller.enqueue(new TextEncoder().encode(errorData))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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

