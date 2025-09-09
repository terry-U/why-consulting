import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * 사용자의 답변을 바탕으로 Why 문장을 생성합니다
 */
export async function generateWhyStatement(sessionId: string): Promise<string> {
  console.log('🎯 Why 문장 생성 시작:', sessionId)
  
  try {
    // 세션 정보와 답변 가져오기
    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('세션을 찾을 수 없습니다')
    }

    // 사용자 메시지들 가져오기
    const { data: messages, error: messagesError } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('role', 'user')
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error('메시지를 불러올 수 없습니다')
    }

    // 답변들을 정리
    const userResponses = messages
      .map((msg, index) => `질문 ${index + 1}에 대한 답변: ${msg.content}`)
      .join('\n\n')

    // Why 문장 생성 프롬프트
    const whyPrompt = `당신은 전문 Why 발견 상담사입니다. 

다음은 사용자가 8개의 핵심 질문에 답한 내용입니다:

${userResponses}

이 답변들을 종합하여 사용자의 개인화된 Why 문장을 생성해주세요.

Why 문장은 반드시 다음 형식을 따라야 합니다:
"[방법/스타일]함으로써 [궁극적 감정 상태][세상/사람들에게][~한다]"

예시:
- "진정성 있는 소통을 통해 따뜻한 연결감을 사람들에게 전한다"
- "창의적인 문제 해결로 새로운 희망을 세상에 제시한다"
- "깊은 공감과 이해로 치유의 경험을 필요한 이들에게 선사한다"

요구사항:
1. 사용자의 답변에서 나타난 핵심 감정과 동기를 정확히 반영
2. 구체적이고 실행 가능한 방법/스타일 명시
3. 사용자가 추구하는 궁극적 감정 상태 포함
4. 타인이나 세상에 미치고 싶은 영향 명확히 표현
5. 한 문장으로 완성된 형태

2-3개의 후보 문장을 제시하고, 각각에 대한 간단한 설명을 포함해주세요.
사용자가 "이거다!" 하고 느낄 수 있는 진정성 있는 문장을 만들어주세요.`

    // OpenAI를 통해 Why 문장 생성
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: whyPrompt
        }
      ]
    })

    const whyResponse = completion.choices[0]?.message?.content || ''
    
    console.log('✅ Why 문장 생성 완료')
    return whyResponse

  } catch (error) {
    console.error('❌ Why 문장 생성 오류:', error)
    throw new Error('Why 문장을 생성할 수 없습니다')
  }
}

/**
 * Why 문장을 세션에 저장합니다
 */
export async function saveWhyStatement(sessionId: string, whyStatement: string): Promise<void> {
  console.log('💾 Why 문장 저장 시작:', sessionId)
  
  try {
    // 세션의 generated_why 필드 업데이트
    const { error: updateError } = await supabaseServer
      .from('sessions')
      .update({ 
        generated_why: whyStatement,
        counseling_phase: 'completed',
        status: 'completed'
      })
      .eq('id', sessionId)

    if (updateError) {
      throw new Error('Why 문장 저장에 실패했습니다')
    }

    console.log('✅ Why 문장 저장 완료')
  } catch (error) {
    console.error('❌ Why 문장 저장 오류:', error)
    throw error
  }
}

/**
 * Why 문장 후보들을 파싱합니다
 */
export function parseWhyCandidates(whyResponse: string): { text: string; explanation: string }[] {
  // AI 응답에서 후보 문장들을 추출
  const candidates: { text: string; explanation: string }[] = []
  
  // 간단한 파싱 로직 (실제로는 더 정교하게 구현 필요)
  const lines = whyResponse.split('\n').filter(line => line.trim())
  
  let currentCandidate: { text: string; explanation: string } | null = null
  
  for (const line of lines) {
    // 따옴표로 감싸진 문장을 찾기
    const quoteMatch = line.match(/"([^"]+)"/)
    if (quoteMatch) {
      if (currentCandidate) {
        candidates.push(currentCandidate)
      }
      currentCandidate = {
        text: quoteMatch[1],
        explanation: ''
      }
    } else if (currentCandidate && line.trim() && !line.includes('예시:') && !line.includes('요구사항:')) {
      // 설명 추가
      currentCandidate.explanation += (currentCandidate.explanation ? ' ' : '') + line.trim()
    }
  }
  
  if (currentCandidate) {
    candidates.push(currentCandidate)
  }
  
  return candidates.slice(0, 3) // 최대 3개
}
