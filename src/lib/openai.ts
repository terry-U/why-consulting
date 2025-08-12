import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const COUNSELING_SYSTEM_PROMPT = `당신은 전문 Why 발견 상담사입니다.

이 상담은 구조화된 8단계 질문을 통해 사람의 핵심 감정 동기를 찾는 감정 탐색 대화입니다.

🎯 상담 목표:
"[방법/스타일]함으로써 [궁극적 감정 상태][세상/사람들에게][~한다]" 형태의 Why 문장을 도출하는 것입니다.

📋 상담 구조:
1. **인트로 단계**: 상담 안내 및 준비
2. **질문 단계**: 8개의 핵심 질문을 통한 감정 탐색
3. **Why 생성 단계**: 답변을 바탕으로 한 Why 문장 도출

🎭 캐릭터별 역할:
- **메인 상담사** 🌟: 인트로, Why 생성, 전체 진행
- **옐로** 🌞: 뿌듯함, 보람 관련 질문 (밝고 긍정적)
- **비비** 🦋: 감정, 좋은/힘든 순간 탐구 (차분하고 깊이 있음)
- **그린** 🌿: 꿈과 비전 탐구 (자연스럽고 안정적)

💬 응답 원칙:
- 친절하고 다정하며 공감적인 말투 사용
- **응답 길이: 2-4문장 정도로 적당한 길이 유지**
- "공감 → 부드러운 연결어 → 질문" 구조로 작성
- 감정 중심 질문 사용 ("왜 그렇게 생각했나요?" → X / "그때 어떤 기분이셨나요?" → O)
- "가치"라는 단어 대신 "느낌", "감정", "기분" 등 사용
- "천천히 괜찮아요", "편하게 말씀해 주세요" 같은 안정감 주는 표현 사용

🔄 상담 흐름:
현재 상담의 단계와 캐릭터 정보를 파악하여 그에 맞는 톤과 스타일로 응답해주세요.
각 단계에서 사용자의 응답을 충분히 탐구한 후 다음 단계로 진행하세요.

⚠️ 주의사항:
- 절대 냉정하거나 차가운 응답 금지
- 사용자의 감정 표현이 막힐 경우 감각화, 상상, 반복 유도로 해결
- 한 번에 하나의 질문만 던지기
- 사용자가 긴장하지 않도록 따뜻한 분위기 유지`

// Assistant 관리
let assistantId: string | null = null;

async function getOrCreateAssistant() {
  console.log('🤖 Assistant 생성/조회 시작')
  
  if (assistantId) {
    console.log('✅ 기존 Assistant 사용:', assistantId)
    return assistantId;
  }

  try {
    const assistant = await openai.beta.assistants.create({
      name: "Why 발견 상담사",
      instructions: COUNSELING_SYSTEM_PROMPT,
      model: "gpt-4o",
      temperature: 0.9, // 1.0에서 0.8로 조정 (더 일관성 있게)
    });
    
    assistantId = assistant.id;
    console.log('✅ 새 Assistant 생성 완료:', assistantId)
    return assistantId;
  } catch (error) {
    console.error('❌ Assistant 생성 오류:', error);
    throw error;
  }
}

// Thread 생성
export async function createThread(): Promise<string> {
  console.log('🧵 Thread 생성 시작')
  
  try {
    const thread = await openai.beta.threads.create();
    console.log('✅ Thread 생성 완료:', thread.id)
    return thread.id;
  } catch (error) {
    console.error('❌ Thread 생성 오류:', error);
    throw error;
  }
}

// 상담 구조를 고려한 메시지 전송
export async function sendCounselingMessage(
  threadId: string, 
  message: string,
  counselorId: string,
  counselingPhase: string,
  currentQuestion?: string
): Promise<string> {
  console.log('💬 상담 메시지 전송 시작')
  console.log('🎭 상담사:', counselorId)
  console.log('📍 단계:', counselingPhase)
  
  // 상담사별 스타일과 현재 상황을 고려한 컨텍스트 메시지
  const contextMessage = `
현재 상담 상황:
- 상담 단계: ${counselingPhase}
- 담당 상담사: ${counselorId}
${currentQuestion ? `- 현재 질문: ${currentQuestion}` : ''}
- 사용자 메시지: ${message}

위 상황에 맞게 ${counselorId} 상담사의 톤과 스타일로 응답해주세요.
`

  return sendMessageToAssistant(threadId, contextMessage)
}

// 기존 메시지 전송 함수 (호환성 유지)
export async function sendMessageToAssistant(
  threadId: string, 
  message: string
): Promise<string> {
  console.log('💬 Assistant에 메시지 전송 시작')
  console.log('📝 사용자 메시지:', message)
  
  try {
    const assistantIdValue = await getOrCreateAssistant();

    // 사용자 메시지 추가 (원본 그대로)
    console.log('📤 메시지를 Thread에 추가 중...')
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run 실행
    console.log('🏃 Run 실행 시작...')
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantIdValue,
    });

    console.log('⏳ Run 완료 대기 중... (ID:', run.id, ')')
    
    // Run 완료 대기
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
      thread_id: threadId
    });
    let attempts = 0;
    const maxAttempts = 60; // 60초 타임아웃
    
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      attempts++;
      if (attempts > maxAttempts) {
        throw new Error('Run 타임아웃: 60초 초과');
      }
      
      console.log(`⏳ Run 상태: ${runStatus.status} (${attempts}/${maxAttempts})`)
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      runStatus = await openai.beta.threads.runs.retrieve(run.id, {
        thread_id: threadId
      });
    }

    console.log('🏁 Run 완료! 상태:', runStatus.status)

    if (runStatus.status === 'completed') {
      // 최신 메시지 가져오기
      console.log('📥 Assistant 응답 조회 중...')
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data[0];
      
      if (lastMessage.role === 'assistant' && lastMessage.content[0].type === 'text') {
        const response = lastMessage.content[0].text.value;
        console.log('✅ Assistant 응답 수신 완료')
        console.log('📝 응답 내용:', response.substring(0, 100) + '...')
        return response;
      }
    }

    console.error('❌ Run 실패:', runStatus.status)
    throw new Error(`Run failed with status: ${runStatus.status}`);
  } catch (error) {
    console.error('❌ 메시지 전송 오류:', error);
    throw error;
  }
}

// 기존 함수는 호환성을 위해 유지 (사용하지 않음)
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateCounselingResponse(_messages: ChatMessage[]): Promise<string> {
  // 더 이상 사용하지 않는 함수
  throw new Error('이 함수는 더 이상 사용되지 않습니다. sendMessageToAssistant를 사용하세요.');
} 