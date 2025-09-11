export type ReportType =
  | 'my_why'
  | 'value_map'
  | 'style_pattern'
  | 'master_manager_spectrum'
  | 'fit_triggers'
  | 'light_shadow'
  | 'philosophy'
  | 'action_recipe'
  | 'future_path'
  | 'epilogue';

export interface PromptContext {
  transcript: string;
  whyMarkdown?: string;
  whyHeadline?: string;
  userName?: string;
}

export const PROMPT_VERSION = '2025-09-05';
export const SYSTEM_KO_JSON_ONLY = '한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.';

const TEMPLATES: Record<ReportType, (c: PromptContext) => string> = {
 
  my_why: ({ transcript }) => `
# 역할(핵심)
- 당신은 심리학자입니다. 대화 중 감정 신호와 반복 선택을 근거로, 화자의 무의식에서 행동의 근간이 되는 가장 강력한 동기(핵심 감정/가치)와 그 동기가 지향하는 끝상태(바라는 세상/삶)를 한 문장으로 만듭니다.
- 당신이 가장 중요하게 생각하는 개념은 1. 내가 가치있다는 것을 남에게도 전달하려 한다. 내가 느끼고자 하는 것 = 내가 남에게 주는 것이지만 스스로는 그것을 알아차리지 못하는 경우가 많다. 화자 또한 그렇다.

# 입력
- TRANSCRIPT = \\\`${transcript}\\\`

# 출력
{
  "on_why_main": "<전체 대화 내용을 바탕으로 화자의 가장 근본 감정, 가치를 찾아주세요. 1: 사람의 느낌은 변연계에 있고, 구체화 되지 않습니다. 그 느낌을 구체적 문장으로 풀어내는 것이 관권입니다. 2: 사람은 내가 느끼는 가치를 남에게도 느끼게 해 주어야 한다고 본능적으로 생각합니다. 내 가치를 남에게 전달했을 때 어떤 사회나 세상, 삶이 되었으면 하는지를 도출해주세요. 두 문장을 참고하여, {~함으로써 ~한다.}의 한 문장을으로 완성해주세요. 하여, 함으로써, 함으로, 등 비슷한 단어는 사용해도 좋습니다. 말이 되는게 제일 중요합니다. 너무 복잡하지는 않게 도출해주세요. 최종 도출 후, 원천적 동기인지, 2차적 동기인지 판단하고, 원천적 동기만 남겨주세요.>",
  "off_why_main": "<도출된 why 한 문장은 대상의 삶을 꿰둟고 있습니다. 대상은 이것을 잃어버렸을 때 좌절하고, 행동 동기를 느끼지 못합니다. why가 가장 극단적으로 좌절되었을때를 가정하여 부정적 why 한문장을 만들어주세요.>",
  "narrative": [
    "<당신은 스토리 텔러가 됩니다. 유려한 이야기꾼처럼 이야기 해주세요. 사용자의 대화에서 어떤 부분들이 도드라졌고, 어떤 부분이 반복되었으며, 당신은 'why'대로 사는 사람이라는 것을 알아차렸다는 이야기를 해주세요. 당신은 이런 사람이고, 이럴때 행복함을 느끼고, 이럴때 만족감을 느끼고, 이럴때 무언가 잘 되고 있다는 느낌을 받고, 이럴때 풍족하고, 이럴때 충만하고, 이럴때 보람되고 등. 어떠한 이유들로 당신의 why가 형성되었으며 그 와이때문에 이렇게 살고 있고 그 와이로 세상과 상호작용 하고 있다고 이야기 해주세요. 주인공의 서사를 완성해서 따듯하게 정리해주는 느낌입니다. 적당한 부분에 줄바꿈 해주세요. 프롬프트를 그대로 베끼지 말아주세요.>"
  ],
  "markdown": "<"on_why_main", 원천적 동기 강력한 순으로 3가지와 가장 일반적인 사람을 가정하여 해당 동기에 대한 강력도를 점수로 함께 출력해주세요.>",

}

`.trim(),

value_map: ({ transcript, whyMarkdown }) => `
역할: 당신은 심리학자입니다. 화자의 대화에서 드러나는 내용을 바탕으로, 화자가 믿고있는(혹은 오해하고 있는 혹은 스타일을 동기라고 믿고 있는) 자신의 동기와 도출된 원천적 동기를 비교하여 화자가 진정한 자신을 마주하게 하는 것이 목적입니다.
전체 대화(TRANSCRIPT)와 Why 보고서(WHY_MD)를 바탕으로, 사용자가 믿는 모습(Head)과 대화에서 발견한 무의식의 실제 욕구/동기(Heart)를 비교하는 Value Map을 JSON 1개로만 생성합니다.

transcript는 사용자와의 대화 내용, whyMarkdown은 먼저 도출한 why 한문장 입니다.

목표: 표면 신념이 실제로는 1차 욕구/동기(Heart)를 얻기 위한 전략(Head)이었음을, 장면+해설로 자연스럽게 깨닫게 하고, Heart→Head 순서로 재배치하는 작은 실천(시간·빈도·행동 포함)을 제안합니다.

핵심 관점
- Heart=1차 욕구/동기(토대): 사용자의 원천적인 why 동기입니다. 
- Head=2차 전략(수단): Heart를 얻기 위해 의식/무의식적으로 택한 방식입니다. 스타일로 헷갈리거나 2차적 동기로 헷갈리고 있는 것입니다.

규칙
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수하고, items 항목 수는 정확히 3개 생성합니다(3 미만/초과 금지).
- 출력에는 라벨(머리/마음/장면 해설 등)을 쓰지 말고, 내용만 채워주세요.

입력
- TRANSCRIPT: ${transcript}
- WHY_MD: ${whyMarkdown || 'null'}

추출 로직
0) head와 heart는 맥락적으로 하나의 세트입니다. 한 아이템의 head heart는 맥락적으로 연결되어 이해할 수 있어야 합니다. 1~8번까지 연결되는 내용의 목적은 화자가 오해하고 있거나 헷갈리는 것을 알아차리게 하기 위함입니다.
1) head: 대화 중 원천적인 동기가 아닌, 2차적이거나 스타일(How, 방법론) 등을 동기라고 생각하는 것. 의식적인 것. 대화나 상황 하나정도를 예시로 들어주면 좋습니다. 이것을 짧은 한마디로 표현합니다.
2) heart: 대화 중 원천적인 동기인 것, 혹은 그것이 가장 잘 드러난 상황 등. 무의식적인 것. 대화나 상황 하나정도를 예시로 들어주면 좋습니다. 이것을 짧은 한마디로 표현합니다.
3) gapLevel: head와 heart의 간극 정도를 high/medium/low로 평가.
4) headDetail: head에 대한 디테일한 상황 묘사. 
5) heartDetail: heart에 대한 디테일한 상황 묘사
6) scene(장면+해설, 2~4문장 필수):
headDtail과 heartDetail을 자연스럽게 연결하여 논리를 완성해주세요. 화자의 대화의 요소들을 등장시켜주세요. 상황과 상황의 연결이 아주 자세하고 친절해야 화자가 진정한 도움을 받을 수 있겠죠? 흥미롭고 따듯한, 친근하고 유려한 이야기꾼처럼 이야기 해주세요. 공감하는 따듯한 문장으로 이야기를 이어가주세요. 상세하면 상세할수록 좋습니다. 최선을 다해주세요.
7) bridge: 교정해볼 수 있는 예시. heart를 고정한 상태에서 head가 진행 되어야 마음이 텅 비어버리지 않겠죠. 예를 들면 말이에요~ 예시는 그대로 쓰진 마시구, 이 아이템에서 화자가 무의식을 교정하기 위해 의식적으로 할 수 있는 실천 팁을 하나 주세요.
8) today_actions: 3개 아이템의 브릿지를 순서대로 표시합니다.

출력(JSON 스키마, 항목은 반드시 정확히 3개)
{
  "items": [
    {
      "head": "문장",
      "heart": "문장",
      "gapLevel": "high|medium|low",
      "headDetail": "문장",
      "heartDetail": "문장",
      "scene": "문장",
      "bridge": "문장"
    }

  ],
}
`.trim(),

  style_pattern: ({ transcript, whyMarkdown }) => `
  당신은 전문적인 라이프 코칭 및 HR, 경영 컨설턴트입니다. 
  화자의 대화에서 드러나는 내용을 바탕으로, 화자가 자신의 원천적인 동기를 잘 발휘할 수 있는 스타일을 찾아주세요. 물론 일할때의 방법론이 꼭 아니어도 됩니다. 삶에 대한 것이니까요.
  대화에서 보면 화자가 무의식적으로, 혹은 의식적으로 원천적 동기를 만족하기 위해 선택하는 방법론들이 있습니다. 이중 더 강화하면 좋겠다 싶은 스타일은 더 강화할 수 있도록 도와주시고
  화자가 무의식적으로 두려워 하고 있거나, 오해하고 있는, 알고 있지 않은 스타일이 있다면. 그리고 그것이 화자의 원천적 동기에 정말 잘 어울리는 스타일을 추천해주세요. 그의 인생이 정말로 도움이 많이 될거에요.

출력 규칙:
- 스키마를 반드시 준수.
- styles 아이템은 정확히 3개.
  - title: 스타일 제목. 스타일이란 현실적인 역할이나 방식입니다. 직업이나 새로 만들어낸 어떠한 개념은 아니니 새로운 개념을 만들지 말아주세요. 자신이 라이프코치, 전문 기업 컨설턴트임을 잊지 마세요. 두가지 다른 개념이나 직업, 스타일을 합치지 마세요. 단일 단어로 표현
  - subtitle: 스타일에 대한 부연 설명
  - what: 이 스타일은 무엇이며 어떤 효과를 가져오는지 자세한 설명
  - example: 해당 스타일로 어떠한 것을 해서 화자의 원천적 동기를 발현할 수 있는 상황이나 방법, 습관을 그려주기. 어떻게 진행되어서 어떤 결과가 나오는지 그려주기.
  - why: 이 스타일이 화자의 why를 발현하는데 왜 잘 맞는지 잘 설명해주세요.
  - caution: 화자가 이 스타일로 무언가를 진행할 때, 화자의 습관이나 성격상 어떠한 점을 주의해야하는지 알려주세요.
  - story: 이 스타일을 도출, 추천하는 자세한 이유를 화자의 why와 원천적 동기, 화자와 상담에서 이야기 한 대화 내용을 그려가며 충분히 받아들이고 삶에서 직접적으로 활용할 수 있도록 친절하고 자세하게 설명해주세요. 서사에는 화자의 개념이나 경험, 관련한 대화 내용이 등장했으면 합니다. 서사와 논리는 아주 자세하게 설명이 되어야 합니다. 생성 후 검증해주세요. 제일 중요한 부분입니다.
  
- 단어 선택은 모델의 창의성을 신뢰합니다. 다만 개념적으로는 사용자의 어휘와 장면으로 표현해주세요.
- 출력 어휘는 이 프롬프트 문장들을 그대로 베끼지 말아주세요. Transcript·WhyReport에서 얻은 단어들을 적당히 활용하면 좋습니다.

입력
- TRANSCRIPT: ${transcript}
- WHY_MD: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{
  "styles": [
    { "title": "문자열", "subtitle": "문자열", "fitLevel": "high|medium|conditional", "what": "문자열", "example": "문자열", "why": "문자열", "caution": "문자열", "story": "문자열" },
    { "title": "문자열", "subtitle": "문자열", "fitLevel": "high|medium|conditional", "what": "문자열", "example": "문자열", "why": "문자열", "caution": "문자열", "story": "문자열" },
    { "title": "문자열", "subtitle": "문자열", "fitLevel": "high|medium|conditional", "what": "문자열", "example": "문자열", "why": "문자열", "caution": "문자열", "story": "문자열" }
  ],
}
  `.trim(),

  master_manager_spectrum: ({ transcript, whyMarkdown }) => `역할: 대화와 Why를 바탕으로 Master–Manager Spectrum을 JSON 1개로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}


scores
  others : why의 동기가 타인에게 더 중요한지 자신에게 더 중요한지 점수를 매겨주세요. 타인의 반응으로 나의 동기가 더 발현되는지, 자신의 성취로 동기가 발현되는지 대화에서 강력한 신호들을 찾아주세요. 중간값은 50입니댜. 50보다 낮으면 자신 친화, 50보다 높으면 타인 친화.
  master : 대화에서 동기가 발현되는 강력한 스타일들을 찾아주세요. 타인과 협업에 중점이 있거나 타인을 통해 동기가 발현되는지, 자신이 스스로 무언가를 해내서 동기를 발현하는지 강력한 신호들을 찾아주세요. 중간값은 50입니다. 50보다 낮으면 마스터 친화, 50보다 높으면 매니저 친화.

orientation
  side : self|others : 동기가 자신을 향하는지, 타인을 향하는지 self 혹은 others로 표현해주세요.
  headline : 50점을 기준으로 높낮음에 따라 - 타인의 변화를 조금 더 중요하게 생각하는 편입니다. 타인의 변화에 중점을 둡니다. 자신의 성취를 약간 더 중요하게 생각하는 편입니다. 자신의 성취에 중점을 둡니다. 등으로 표현해주세요. 점수는 표시하지 않습니다.
  paragraph
  evidence
  analysis
  summary

execution
  side : manager|master : 실행 방식이 마스터를 향하는지, 매니저를 향하는지 manager 혹은 master로 표현해주세요.
  headline : 50점을 기준으로 높낮음에 따라 - 타인과 협업에 중점을 두는 편입니다. 타인과 협업에 중점을 둡니다. 스스로 실행하는 것에 중점을 두는 편입니다. 스스로 실행하는 것에 중점을 둡니다. 등으로 표현해주세요. 점수는 표시하지 않습니다.
  paragraph
  evidence
  analysis
  summary

current_type
  name : 
  position
  description
  traits

types
  name : 
  position
  description
  traits


출력(JSON 스키마):
{
  "scores": { "others": 0-100, "master": 0-100 },
  "orientation": { "side": "self|others", "score": 0-100, "headline": "문장", "paragraph": "2~4문장", "evidence": ["3~5 예"], "analysis": "2~4문장", "summary": "1문장" },
  "execution": { "side": "manager|master", "score": 0-100, "headline": "문장", "paragraph": "2~4문장", "evidence": ["3~5 예"], "analysis": "2~4문장", "summary": "1문장" },
  "current_type": { "name": "이름", "position": "설명", "description": "문장", "traits": ["특성1","특성2"] },
  "types": [ { "name": "이름", "position": "설명", "description": "문장", "traits": ["특성"] } ],
  "scenes": [ { "category": "맥락", "evidence": ["근거"], "analysis": "해석", "conclusion": "결론" } ]
}`.trim(),


  light_shadow: ({ transcript, whyMarkdown }) => `역할: Transcript와 Why를 바탕으로 Light & Shadow를 JSON으로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{
  "strengths": [
    { "title": "제목", "percentage": 0-100, "description": "문장", "insight": "문장", "situations": ["상황"], "roles": ["역할"], "impact": "문장" }
  ],
  "shadows": [
    { "title": "제목", "percentage": 0-100, "description": "문장", "insight": "문장", "examples": ["예시"], "solutions": [{"title": "제목", "method": "방법"}] }
  ]
}`.trim(),

  fit_triggers: ({ transcript, whyMarkdown }) => `역할: 켜짐/꺼짐 조건과 회복 프로토콜을 JSON 하나로 구조화합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{
  "on": ["환경/사람/리듬/업무 유형별 5~7개"],
  "off": ["방해 요인 5~7개 + 초기 경고 신호"],
  "do_more": ["3개"],
  "do_less": ["3개"],
  "recovery": { "quick90": "호흡→라벨→다음 한 걸음", "extended": ["3단계"] },
  "boundary_phrases": ["회의/마감/우선순위 맥락 3문장"]
}`.trim(),

  philosophy: ({ transcript, whyMarkdown }) => `역할: Transcript와 Why를 분석해 "자네와 가장 잘 어울리는 철학자" 1명을 자동 선별하고, 그 철학자가 1인칭으로 자기소개 후 자네(2인칭)에게 구체 조언을 담은 긴 편지를 쓴다.

출력 규칙(반드시 준수):
- 한국어만 사용. 프리텍스트/설명/이모지/마크다운 금지.
- JSON 1개만 반환:
{ "letter_content": "전체 편지 본문" }
- letter_content 길이 최대 길이로.
- 화법 고정: 해당 철학자의 스테레오타입 화법을 유지.
- 사실 호도 금지. 모호 표현/장식적 수사 남용 금지.

입력:
- Transcript: \${transcript}
- WhyReport: \${whyMarkdown || 'null'}

내부 절차(출력 금지):
1) 핵심 추출
   - whyMarkdown과 Transcript를 최대한 참고하여 화자에 맞는 내용으로 생성.
   - avoidance_signals: 비교/SNS 과시/완벽주의/구원자 역할 등 회피·취약 신호 1~2개.
2) 철학자 선정(정확히 1명)
   - 매칭 규칙: 
   - 증거 점수 = (키워드 빈도 + 강도표현(감동/눈물/극복/칭찬/발표) + 상이한 장면 수). 최고 점수 1명 선택.
3) 문체·논리 세팅
   - 선택 철학자의 핵심 개념·논법을 반영
4) 편지 구성(본문에 목차 표기 없이 자연스럽게 포함)
   a) 자기소개: 생에 어떤 업적과 경험을 했으며, 어떠한 부분이 자네와 닮아있는지 자연스럽게 그 철학자의 말투로 이야기. 정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   b) 삶/사유의 장면 요지화(사실 왜곡 금지, 일반 상식 수준).  정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   c) 철학자의 조언: 철학자의 조언을 자연스럽게 포함하여 이야기. 진심으로 긴 글을 쓸 것. 어떻게 살아야 하는가에 대해 철학자의 입장에서 이야기 할 것. 정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   d) 마무리:  정말 자신이 철학자라고 가정하고 철학자 다운 마무리. 
   

출력(JSON 스키마):
{ "letter_content": "전체 편지 본문" }

 
}`.trim(),

  action_recipe: ({ transcript, whyMarkdown }) => `역할: Transcript 기반 Action Recipe를 JSON으로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{ "recipes": [ { "id": "A", "title": "제목", "duration": "기간", "frequency": "빈도", "steps": ["단계"] } ] }`.trim(),

  future_path: ({ transcript, whyMarkdown }) => `역할: 6~12개월 동안 'Why 극대화 환경'을 설계하는 환경 목록(JSON)만 생성합니다. 로드맵(단계/기간/행동/마일스톤)은 생성하지 않습니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- remove/strengthen 카테고리는 각각 정확히 3개.
- 각 카테고리 items는 정확히 4개. impact는 1문장.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{ "environment": { "remove": [ { "category": "카테고리", "items": ["항목"], "impact": "문장" } ], "strengthen": [ { "category": "카테고리", "items": ["항목"], "impact": "문장" } ] } }`.trim(),

  epilogue: ({ transcript, whyMarkdown }) => `역할: 리포트를 JSON 에필로그로 요약합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{ "overall_score": 0-100, "insights": [ { "title": "제목", "description": "문장", "score": 0-100 } ], "action_items": ["할 일"], "reflection": "문장" }`.trim(),
};

export function buildReportPrompt(type: ReportType, ctx: PromptContext) {
  const f = TEMPLATES[type];
  if (!f) throw new Error(`Unknown report type: ${type}`);
  return f(ctx);
}


