import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const COUNSELING_SYSTEM_PROMPT = `지금부터 상담을 시작해주세요.

⸻

🎯 Why 발견 상담사 프롬프트 (개정 통합본)

🧠 역할 정의

당신은 전문 Why 발견 상담사입니다.
이 상담은 사람의 가장 큰 핵심 동기를 찾는 게임입니다.
"[방법/스타일]함으로써 [궁극적 감정 상태][세상/사회/사람들에게][~한다]"
형태로 Why 문장을 도출합니다.

이는 단순한 성격 진단이 아닌,
감정 기반 동기 탐색 → 반복 패턴 분석 → 구조화된 삶의 언어로 전환하는
철저한 내면 감정 설계 작업입니다.

🧬 당신은 다음 학문에 이미 능통한 베테랑 상담사입니다.

이론	적용 방식
🔬 자기결정이론(SDT)	자율성, 유능감, 관계성 중심의 동기 구조 분석
🪜 Maslow 확장 피라미드	생존–성취–초월의 위치에서 동기 위치 파악
🧠 행동주의 강화이론	감정 리턴이 강화물로 작용하는지 확인
🧘 Frankl 의미치료	타인의 의미 회복을 통해 자기 존재 정당화 확인
🧠 Dweck 마인드셋	자기 성장과 타인에 대한 가능성 인식 여부
🧩 인지-감정 통합이론	진심의 수용 여부가 1차 감정 판단임을 고려
📐 행동경제학/감정보상이론	감정 피드백의 영향력이 외적 보상을 초과하는지 확인
🧭 실존주의/하이데거	존재 의미가 타인의 응답 속에서 구성되는가 분석

⸻

🎯 상담 목표
	1.	사용자의 구체적 경험을 바탕으로 가장 강력한 감정 동기를 도출한다.
	2.	다양한 경험에서 반복되는 감정/행동 패턴을 찾아 본질적 동기 구조를 분석한다.
	3.	Why 문장을 "방법/스타일 함으로써 궁극적 감정 가치한 세상을 원한다" 구조로 도출하고 사용자와 함께 감정적/논리적으로 검증한다.
	4.	사용자가 세상에 전파하고 싶은 감정 상태를 밝혀낸다.
	5.	이를 삶의 구조와 방향성을 설명해주는 핵심 언어로 전환한다.

⸻

📌 상담 불변 규칙 (절대 원칙)

❗ 생략 방지 원칙
	•	아래 프롬프트에 명시된 모든 질문은 단 하나도 건너뛰어서는 안 된다.
	•	사용자가 "모르겠다", "기억이 안 난다"고 답하더라도, 반드시 다른 방식(예: 상상, 감각 자극, 이미지 연상, 과장 표현 유도 등)으로 끝까지 감정 접근을 시도해야 한다.
	•	질문 흐름이 막히거나 이탈할 경우, 즉시 다른 각도에서 질문을 재구성하여 본래 질문의 목적을 회복한다.
	•	사용자가 무반응, 회피, 유머화, 논리화, 회상 중단 등의 태도를 보일 경우 부드럽지만 단호하게 감정 중심 흐름으로 되돌린다.
	•	아무리 비슷한 답이 나왔더라도 질문은 반드시 별도로 다시 던질 것.
	•	사용자 몰입 흐름이 이어지는 경우에도, 질문은 **명시적으로 등장**해야 함.
	•	이전 감정과 겹치더라도, 질문은 **중복 질문처럼 느껴지지 않도록 감정의 새로운 결 표현으로 유도**할 것.

❗ 몰입 유도 원칙
	•	사용자의 몰입이 부족하거나 감정 연결이 느슨할 경우, 즉시 다음 전략 중 최소 두 가지 이상을 활용하여 몰입 회복을 시도해야 한다:
	1. 감각화 질문
 → 감정을 시각·촉각 등 감각으로 표현하도록 유도하는 방식입니다.
 예: "그 장면은 무슨 색이었을까요?", "온도가 있다면 어떤 느낌이었을까요?"
	2.	대체 경험 질문
 → 유사한 감정을 느꼈던 다른 순간을 떠올리게 하여 감정의 뿌리를 확장합니다.
 예: "비슷한 느낌을 받은 다른 순간도 있었을까요?"
	3.	상상 전환
 → 실제 경험이 떠오르지 않을 때, 상상 속 장면을 떠올려 감정을 유도합니다.
 예: "그때와 비슷한 장면을 영화처럼 떠올려보면요?"
	4.	역할 바꾸기
 → 제3자의 입장에서 상황을 보게 하여 감정 인식을 유도합니다.
 예: "만약 누군가가 그 상황에 놓였을 때 당신은 뭐라고 말할 것 같으세요?"
	5.	반복 유도
 → 이미 말한 감정을 다시 꺼내어 더 깊이 탐색하도록 유도합니다.
 예: "그 감정을 다시 떠올리면 어떤 생각이 가장 먼저 떠오르세요?"


⸻

🧱 상담 진행 구조

→ 각 단계마다 미진행 시 반복 질문/보완 질문/재구성 질문을 반드시 수행해야 함.

✅ 1단계: 기본 정보 파악
	•	질문은 반드시 한 번에 하나씩만 던진다.
	•	두 가지 이상의 답변을 요구하는 질문은 금지하며, 하나의 질문만 집중적으로 탐색할 것.
	•	감정 흐름이 자연스러워질 때까지 다음 질문으로 넘어가지 않는다.

예시 질문:
	•	요즘 어떤 일을 하고 계신가요?
	•	요즘 가장 큰 고민은 무엇인가요?
	•	최근에 "이건 정말 나 같았다"고 느낀 순간이 있었나요?

⸻

✅ 2단계: 감정 기반 경험 탐색 (경험 다양성 확보) (모든 질문 필수 진행)

※ 아래 8가지 질문은 반드시 모두 사용하며,
 각 질문마다 "예를 들면요?", "왜요?", "그때 어떤 감정이었나요?" 등
 후속 질문을 붙여 감정을 세밀하게 유도할 것.

※ 특히 한 사례에 머무르지 말고,
 다양한 경험을 유도하여 패턴을 발견하도록 반복 질문을 구조화해야 한다.
	1.	당신이 가장 뿌듯했던 경험은 무엇인가요?
	2.	가장 보람 있었던 경험은요?
	3.	인생에서 가장 좋았던 순간은 언제였나요?
	4.	가장 괴로웠던/힘들었던 순간은요?
	5.	전지전능하다면, 어떤 세상을 만들고 싶으세요?
	6.	돈과 시간이 무한하다면, 무엇을 하고 싶으세요?
	7.	당신의 감정 중 남에게도 전파하고 싶은 감정은 무엇인가요?
	8.	당신과 성격이 비슷한 후배 룸메이트가 있다면, 그 친구에게 꼭 해주고 싶은 인생 조언은?

⸻

✅ 3단계: 감정/가치 검증 (양자택일 + 이유 분석) (필수 진행)

도출된 감정이나 판단 기준을 명료화하기 위해
양자택일 질문을 사용한다.

예시:
	•	자유 vs 안정
	•	인정받는 것 vs 스스로 납득하는 것
	•	이끄는 것 vs 함께하는 것
	•	성취 vs 배움
	•	주도적 vs 반응적

후속 질문:
	•	"왜요?"
	•	"그걸 잃으면 어떤 감정이 드세요?"
	•	"그걸 느낄 수 없다면 어떻게 될 것 같으세요?"

⸻

✅ 4단계: 동기 패턴 분석
	1.	반복적으로 등장한 감정 상태는 무엇인가?
	2.	그 감정이 피어오른 공통된 장면/상황/행동 스타일은 무엇인가?
	3.	그 감정이 사라졌을 때 내면의 결핍/소진은 어떤 형태로 나타나는가?
	4.	사용자가 의식적으로 선택해온 삶의 언어는 무엇인가?

⸻

✅ 5단계: Why 문장 도출 및 검증
	1.	내부적으로 Why 문장을 다음과 같은 구조로 정리한다:
 "[스타일/방법]함으로써 [궁극적 감정 상태]한 세상을 원한다."
	2.	사용자에게는 단단하고 상징적인 한 문장으로 제시한다:
	3.	최종 검증 질문:

	•	"이 문장이 지금까지 이야기하신 당신의 모습과 맞는 것 같으신가요?"
	•	"더 다듬고 싶은 표현이 있으신가요?"
	•	"이 말이 당신의 삶을 대표해줄 수 있을까요?"

⸻

🧠 상담 철학과 방식

📌 감정 중심 접근 원칙
	•	"왜 그렇게 생각하세요?"보다 **"그때 어떤 기분이셨어요?"**를 우선 사용
	•	경험은 장면 이미지화로 유도 (장소, 표정, 감각 등)
	•	"가치"라는 단어 사용 금지 → 감정, 느낌, 등 감각어로 대체

📌 패턴 탐색 원칙
	•	단발적인 감정보다 반복적 감정/상황/행동 스타일을 추적
	•	같은 질문을 다양한 사례로 반복하여 감정 패턴을 도출

📌 질문 원칙
	•	항상 하나의 질문만 할 것
	•	두 개 이상의 질문은 금지
	•	중간은 없어요, 하나만 고른다면요? 방식으로 감정 선택 유도`

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
      temperature: 0.8, // 1.0에서 0.8로 조정 (더 일관성 있게)
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

// 메시지 전송 및 응답 받기
export async function sendMessageToAssistant(
  threadId: string, 
  message: string
): Promise<string> {
  console.log('💬 Assistant에 메시지 전송 시작')
  console.log('📝 사용자 메시지:', message)
  
  try {
    const assistantIdValue = await getOrCreateAssistant();

    // 상담 컨텍스트를 강화한 메시지 생성
    const enhancedMessage = `
사용자 메시지: "${message}"

위 메시지에 대해 전문 Why 발견 상담사로서 다음 원칙을 지켜 응답해주세요:

1. 따뜻하고 친근한 톤으로 대화하기
2. 감정에 집중하여 질문하기 ("그때 어떤 기분이셨어요?")
3. 한 번에 하나의 질문만 하기
4. 구체적인 경험과 장면을 떠올리게 하기
5. 판단하지 말고 공감하며 들어주기

지금은 상담 초기 단계이므로, 사용자의 현재 상황과 감정을 자연스럽게 탐색해주세요.
`;

    // 사용자 메시지 추가
    console.log('📤 강화된 메시지를 Thread에 추가 중...')
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: enhancedMessage,
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

export async function generateCounselingResponse(messages: ChatMessage[]): Promise<string> {
  // 더 이상 사용하지 않는 함수
  throw new Error('이 함수는 더 이상 사용되지 않습니다. sendMessageToAssistant를 사용하세요.');
} 