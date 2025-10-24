// OpenAI 프롬프트 및 GPT 설정 상수들

export const DEFAULT_GRAMMAR_SYSTEM_PROMPT = `당신은 한국어 문법 전문가입니다. 주어진 텍스트의 맞춤법, 문법, 띄어쓰기를 검토하고 더 자연스럽고 명확한 문장으로 개선해주세요.

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

export const DEFAULT_GPT_SETTINGS = {
  temperature: 0.3,
  maxTokens: 4096,
  model: 'gpt-4o-mini',
} as const

export interface GPTSettings {
  temperature: number
  maxTokens: number
  model: string
}

export interface GrammarPromptSettings {
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export const DEFAULT_GRAMMAR_PROMPT_SETTINGS: GrammarPromptSettings = {
  systemPrompt: DEFAULT_GRAMMAR_SYSTEM_PROMPT,
  temperature: DEFAULT_GPT_SETTINGS.temperature,
  maxTokens: DEFAULT_GPT_SETTINGS.maxTokens,
}
