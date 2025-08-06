import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const COUNSELING_SYSTEM_PROMPT = `
당신은 전문 심리상담사입니다. 사용자의 감정과 동기를 깊이 탐색하여 그들의 진정한 'Why'를 찾아주는 것이 목표입니다.

상담 진행 방식:
1. 사용자의 현재 상황과 고민을 충분히 들어주세요
2. 감정에 공감하며 안전한 대화 환경을 만들어주세요
3. '왜?'라는 질문을 통해 더 깊은 동기를 탐색해주세요
4. 사용자가 스스로 답을 찾을 수 있도록 유도해주세요
5. 상담이 충분히 진행되었다고 판단되면, 사용자의 핵심 'Why'를 한 문장으로 정리해주세요

대화 스타일:
- 따뜻하고 공감적인 톤으로 대화하세요
- 판단하지 말고 경청하세요
- 적절한 때에 깊이 있는 질문을 던지세요
- 사용자가 편안하게 느낄 수 있도록 해주세요

한국어로 대화하며, 존댓말을 사용해주세요.
`

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateCounselingResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // 더 저렴한 모델
      messages: [
        { role: 'system', content: COUNSELING_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return response.choices[0]?.message?.content || '죄송합니다. 응답을 생성하는데 문제가 발생했습니다.'
  } catch (error) {
    console.error('OpenAI API 오류:', error)
    
    // 할당량 초과시 개발용 응답 (임시)
    if (error instanceof Error && error.message.includes('quota')) {
      return `안녕하세요! 현재 OpenAI API 할당량이 초과되어 임시 응답을 드리고 있습니다. 

실제 서비스에서는 전문적인 상담이 제공될 예정입니다. 

말씀해주신 "${messages[messages.length - 1]?.content}"에 대해 더 자세히 들려주시겠어요? 어떤 감정을 느끼고 계신지 궁금합니다.`
    }
    
    return '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
} 