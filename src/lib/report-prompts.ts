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
- 당신은 상담 대화에서 감정 신호와 반복 선택을 근거로, !!가장!! 강력한 동기(핵심 감정/가치)와 그 동기가 지향하는 끝상태(바라는 세상/삶)를 한 문장으로 만듭니다.

# 입력
- TRANSCRIPT = \\\`${transcript}\\\`

# 출력
{
  "on_why_main": "<먼저 전체 대화 내용을 바탕으로 가장 많이 반복된 가치적 느낌을 찾아주세요. 1: 사람의 느낌은 변연계에 있고, 구체화 되지 않습니다. 그 느낌을 구체적 문장으로 풀어내는 것이 관권입니다. 2: 사람은 내가 느끼는 가치를 남에게도 느끼게 해 주어야 한다고 본능적으로 생각합니다. 내 가치를 남에게 전달했을 때 어떤 사회나 세상, 삶이 되었으면 하는지를 도출해주세요. 두 문장을 연결해, {~함으로써 ~한다.}의 문장을 완성하면 됩니다. 하여, 함으로써, 함으로, 등 비슷한 단어는 사용해도 좋습니다. 말이 되는게 제일 중요합니다.>",
  "off_why_main": "<도출된 why 한 문장은 대상의 삶을 꿰둟고 있습니다. 대상은 이것을 잃어버렸을 때 좌절하고, 행동 동기를 느끼지 못합니다. why가 가장 극단적으로 좌절되었을때를 가정하여 부정적 why 한문장을 만들어주세요.>",
  "narrative": [
    "<당신은 스토리 텔러가 됩니다. 유려한 이야기꾼처럼 이야기 해주세요. 사용자의 대화에서 어떤 부분들이 도드라졌고, 어떤 부분이 반복되었으며, 당신은 'why'대로 사는 사람이라는 것을 알아차렸다는 이야기를 해주세요. 당신은 이런 사람이고, 이럴때 행복함을 느끼고, 이럴때 만족감을 느끼고, 이럴때 무언가 잘 되고 있다는 느낌을 받고, 이럴때 풍족하고, 이럴때 충만하고, 이럴때 보람되고 등. 어떠한 이유들로 당신의 why가 형성되었으며 그 와이때문에 이렇게 살고 있고 그 와이로 세상과 상호작용 하고 있다고 이야기 해주세요. 주인공의 서사를 완성해서 따듯하게 정리해주는 느낌입니다. 적당한 부분에 줄바꿈 해주세요!>"
  ],
  "markdown": "<저장을 위한 공간입니다. 위 세가지 정보를 모두 그대로 출력해주세요>",

}

`.trim(),

value_map: ({ transcript, whyMarkdown }) => `
역할: 전체 대화(TRANSCRIPT)와 Why 보고서(WHY_MD)를 바탕으로, 사용자가 믿는 모습(Head)과 대화에서 발견한 무의식의 실제 욕구/동기(Heart)를 비교하는 Value Map을 JSON 1개로만 생성한다.

목표: 표면 신념이 실제로는 1차 욕구/동기(Heart)를 얻기 위한 전략(Head)이었음을, 장면+해설로 자연스럽게 깨닫게 하고, Heart→Head 순서로 재배치하는 작은 실천(시간·빈도·행동 포함)을 제안한다.

핵심 관점
- Heart=1차 욕구/동기(토대): 사용자가 본질적으로, 근본적으로, 원천적으로 원하는 why의 동기. 
- Head=2차 전략(수단): Heart를 얻기 위해 의식/무의식적으로 택한 방식

규칙
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수하고, items 항목 수는 정확히 3개 생성합니다(3 미만/초과 금지).
- 출력에는 라벨(머리/마음/장면 해설 등)을 쓰지 말고, 내용만 채운다.
- TRANSCRIPT의 실제 표현을 1~2개 자연스럽게 포함한다(인용부호 없이).
- 추상어(의미/가치/세상/변화/도움/행복/영감/개선/본질 등) 남용 금지.
- 과장·영웅화 금지. 대상의 관찰 가능한 변화를 중심에 둔다.

입력
- TRANSCRIPT: ${transcript}
- WHY_MD: ${whyMarkdown || 'null'}

추출 로직
0) head와 heart는 맥락적으로 하나의 세트다. head는 보통 약한 동기 혹은 부정적 결과고, heart는 강한 동기 혹은 긍정적 결과다. 두가지는 연결되어 이해할 수 있어야 한다.
1) head: 대화 중 가장 원천적인 동기가 아닌, 사용자의 의식/무의식에 의해 드러난 표면 욕구/당위(나는 이런게 좋다, 나는 이렇게 하는게 좋다) 중 heart와 쌍을 이루는 1개를, 사용자의 말버릇 1~2개를 살려 한 문장으로.
2) heart: 대화 중 원천적인 동기가 드러난 상황이나 대화 내용 1개를, 사용자의 말버릇 1~2개를 살려 한 문장으로.
3) gapLevel: head와 heart의 간극 정도를 high/medium/low로 평가.
4) headDetail: head에 대한 디테일한 상황 묘사. 표면적으로 드러난 동기로 행동했다고 생각했다는 맥락의 설명(느낌 알지? 그대로 쓰지마라잉)
5) heartDetail: head의 원천이 heart임을 나타내는 설명.(느낌 알지? 그대로 쓰지 마라잉, '그러나' 금지!)
6) scene(장면+해설, 2~4문장 필수):
headDtail과 heartDetail을 연결하여 논리 완성. 유려한 이야기꾼처럼 이야기 해주세요. 공감하는 따듯한 문장, 존대로 설명, 이야기 이어가기. 조금 자세하면 좋을 것 같아요.
TRANSCRIPT 표현 1개를 자연스럽게 섞는다.
7) bridge: 교정해볼 수 있는 예. heart를 고정한 상태에서 head가 진행 되어야 문제가 발생하지 않음. **시간·빈도·행동**이 있는 작은 실천 1문장. Heart 조건을 먼저 고정한 뒤 Head 요소를 붙인다. 예) “주 1회 동행 30분(밥/산책/축구 중 택1) 캘린더 고정, 끝에 오늘 덜 막막했어? 한마디 확인.”
8) today_actions: 오늘 10분 내 실행 가능한 동사형 3개(예: 되돌릴 길 확인 5칸 체크, 중간공유 10분 예약, 결과에 얼굴/한마디 1줄 추가).

어휘 치환 규칙(문장에 직접 쓰지 말고 내부 지침으로만 활용)
- “인생을 바꾼다”→ “한 사람의 하루가 가벼워지게 한다/막힘이 줄게 한다”
- “세상을 더 좋게”→ “안전한 자리를 꾸준히 유지한다/다시 시작할 수 있게 한다”
- “행복을 느끼게 한다”→ “표정이 풀리고 다음 한 걸음을 말한다”
- “성공/임팩트”→ “회의가 10분 안에 결론에 닿는다/복구 시작이 바로 된다”

출력(JSON 스키마, 항목은 반드시 정확히 3개)
{
  "items": [
    {
      "head": "문장",
      "heart": "문장",
      "gapLevel": "high|medium|low",
      "headDetail": "문장",
      "heartDetail": "문장",
      "scene": "장면+해설 2~4문장",
      "bridge": "작은 실천 1문장(시간·빈도·행동 포함)"
    }
      "items": [
    {
      "head": "문장",
      "heart": "문장",
      "gapLevel": "high|medium|low",
      "headDetail": "문장",
      "heartDetail": "문장",
      "scene": "장면+해설 2~4문장",
      "bridge": "작은 실천 1문장(시간·빈도·행동 포함)"
    }
      "items": [
    {
      "head": "문장",
      "heart": "문장",
      "gapLevel": "high|medium|low",
      "headDetail": "문장",
      "heartDetail": "문장",
      "scene": "장면+해설 2~4문장",
      "bridge": "작은 실천 1문장(시간·빈도·행동 포함)"
    }
  ],
}
`.trim(),

  style_pattern: ({ transcript, whyMarkdown }) => `
역할: Transcript와 Why를 바탕으로 사용자의 고유한 스타일 패턴을 JSON 1개로 생성한다. 예시나 보여주기용 문구를 쓰지 말고, 실제 내용만 작성한다.

출력 규칙:
- 한국어만 사용. 프리텍스트/설명/이모지/마크다운 금지. JSON 1개만 반환.
- 스키마를 반드시 준수.
- styles는 정확히 3개.
- 모든 필드는 구체적 문장으로 작성하며, 빈약하거나 상투적인 표현을 피한다.
- 모든 필드는 빈 문자열 금지.
- 최소 글자수(공백 제외):
  - title: 2~6자
  - subtitle: 10자 이상
  - what: 30자 이상
  - example: 30자 이상
  - why: 40자 이상
  - caution: 20자 이상
  - story: 3~5문장, 각 문장 12자 이상
- 단어 선택은 모델의 창의성을 신뢰한다. 다만 사용자의 어휘와 장면을 우선 사용한다.
- 출력 어휘는 이 프롬프트 문장들을 그대로 베끼지 말고, Transcript·WhyReport에서 얻은 단어를 우선 반영한다.

입력:
- Transcript: \${transcript}
- WhyReport: \${whyMarkdown || 'null'}

내부 절차(출력 금지):
1) 핵심 요약
   - WhyReport가 있으면 why_sentence, motive, end_state, 회피 요인, 효능감 조건을 추출한다.
   - WhyReport가 없으면 Transcript에서 감정·가치 3~5개(명사형)와 바라는 삶 1~2개(생활어)를 추출해 임시 why_core로 삼는다.
2) 신호 수집
   - 활동 신호: 사용자가 반복해 온 행동·습관·작업 방식.
   - 환경 신호: 자주 등장하는 장소·공간·이동 맥락.
   - 관계 신호: 1:1/소수 중심, 돌봄·책임, 질문 기반 대화 등.
   - 효능 신호: 완수, 마침표, 현장 확인, 산출물 확정, 피드백 루프.
   - 회피 신호: 사용자가 피하려는 조건이나 무너지는 패턴.
   - 미러 토큰: Transcript·WhyReport에서 고유 명사·지명·숫자·사물·감각어를 최소 8개 뽑아 리스트화하고, 각 style에 2개 이상 자연스럽게 포함한다. 새로운 사실·숫자 생성 금지.
3) 후보 설계·선정
   - 서로 다른 행동 성격에서 4~6개 방법 후보를 만든 뒤, 근거의 빈도·강도·서로 다른 장면 수를 종합해 상위 3개를 고른다.
   - 선택된 3개는 서로 다른 결을 가져야 한다(유사 중복 금지).
4) 필드 작성 원칙
   - title: 사용자의 맥락에서 생겨날 법한 짧은 이름으로, 기능 핵심이 드러나야 한다.
   - subtitle: 혜택과 핵심 행동을 한 줄로 요약한다.
   - what: 빈도·시간·산출물의 세 요소를 모두 포함하고, 숫자 단위를 명확히 기재한다.
   - example: 요일·시각·기간·장소·산출물을 모두 포함한 실행 시나리오를 한 문단으로 기술한다.
   - why: 동기와 끝상태에 직접 닿는 이유를 두 가지 이상 제시한다.
   - caution: 회피 신호를 실제 규칙으로 바꿔 한두 줄로 적는다.
   - story: Transcript의 구체 장면 두 개 이상을 엮어, 왜 이 방식이 사용자에게 맞는지 3~5문장으로 설명한다. 과장·창작 금지.
5) 적합도 등급
   - fitLevel=high: 동기와 끝상태를 모두 직접 지지하고, 근거가 충분하다.
   - fitLevel=medium: 한쪽만 강하게 지지하거나 근거가 제한적이다.
   - fitLevel=conditional: 자원·상황 의존성이 크거나 회피 신호와 충돌 위험이 있다.
6) 품질 점검
   - 세 title은 서로 달라야 한다.
   - 미러 토큰은 전체 출력에서 8개 이상 등장하고, 각 style에 2개 이상 포함되어야 한다.
   - 숫자·지명·사물은 Transcript·WhyReport에 있는 것만 사용한다.
   - 기준 미달 시 내부적으로 한 번 재작성하고 최종본만 출력한다.

출력(JSON 스키마):
{
  "styles": [
    { "title": "문자열", "subtitle": "문자열", "fitLevel": "high|medium|conditional", "what": "문자열", "example": "문자열", "why": "문자열", "caution": "문자열", "story": "문자열" },
    { "title": "문자열", "subtitle": "문자열", "fitLevel": "high|medium|conditional", "what": "문자열", "example": "문자열", "why": "문자열", "caution": "문자열", "story": "문자열" },
    { "title": "문자열", "subtitle": "문자열", "fitLevel": "high|medium|conditional", "what": "문자열", "example": "문자열", "why": "문자열", "caution": "문자열", "story": "문자열" }
  ],
  "quick_tips": [
    { "id": "A", "title": "문자열", "method": "문자열", "tip": "문자열" },
    { "id": "B", "title": "문자열", "method": "문자열", "tip": "문자열" },
    { "id": "C", "title": "문자열", "method": "문자열", "tip": "문자열" }
  ],
  "today_checklist": ["문자열", "문자열"],
  "summary": "문자열"


}
  `.trim(),

  master_manager_spectrum: ({ transcript, whyMarkdown }) => `역할: 대화와 Why를 바탕으로 Master–Manager Spectrum을 JSON 1개로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{
  "scores": { "others": 0-100, "master": 0-100 },
  "orientation": { "side": "self|others", "score": 0-100, "headline": "문장", "paragraph": "2~4문장", "evidence": ["3~5 예"], "analysis": "2~4문장", "summary": "1문장" },
  "execution": { "side": "manager|master", "score": 0-100, "headline": "문장", "paragraph": "2~4문장", "evidence": ["3~5 예"], "analysis": "2~4문장", "summary": "1문장" },
  "current_type": { "id": "id", "name": "이름", "position": "설명", "description": "문장", "traits": ["특성1","특성2"] },
  "types": [ { "id": "id", "name": "이름", "position": "설명", "description": "문장", "traits": ["특성"] } ],
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
- letter_content 길이 1400~2400자. 단락 8~14개.
- 화법 고정: 철학자 1인칭 “나는…”, 독자 2인칭 호칭 “자네…”.
- 사실 호도 금지. 모호 표현/장식적 수사 남용 금지.

입력:
- Transcript: \${transcript}
- WhyReport: \${whyMarkdown || 'null'}

내부 절차(출력 금지):
1) 핵심 추출
   - why_core: WhyReport가 있으면 why_sentence·motive·end_state·avoidance·efficacy를 추출. 없으면 Transcript에서 감정/가치(명사형 3~5개)와 바라는 삶(생활어 1~2개)로 임시 구성.
   - mirror_tokens(8~12개): Transcript에서 고유 장면/감각어/숫자·지명·사물 단어를 뽑아 리스트화.
   - avoidance_signals: 비교/SNS 과시/완벽주의/구원자 역할 등 회피·취약 신호 1~2개.
2) 철학자 선정(정확히 1명)
   - 매칭 규칙: 
   - 증거 점수 = (키워드 빈도 + 강도표현(감동/눈물/극복/칭찬/발표) + 상이한 장면 수). 최고 점수 1명 선택.
3) 문체·논리 세팅
   - 선택 철학자의 핵심 개념·논법을 반영
4) 편지 구성(본문에 목차 표기 없이 자연스럽게 포함)
   a) 자기소개: 생에 어떤 업적과 경험을 했으며, 어떠한 부분이 자네와 닮아있는지 자연스럽게 그 철학자의 말투로 이야기. 정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   b) 삶/사유의 장면 요지화(사실 왜곡 금지, 일반 상식 수준).  정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   c) 원리 3개: why_core의 동기·끝상태와 1:1 연결. 정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   d) 실행 조언 3가지: 오늘/주간/월간 레벨로 각각 1개씩. 반드시 수치(분/회/장/자)·장소·행동 포함.  정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   e) 회피 신호 다루기 2가지: avoidance_signals를 다루는 문장형 처방. 정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   f) 강화 신호 다루기 2가지: 자네의 삶을 강화하는 철학자의 생각. 정말 자신이 철학자라고 가정하고 진심으로 이야기 해주기.
   g) 마무리:  정말 자신이 철학자라고 가정하고 철학자 다운 마무리. 
6) 품질 검수(자가 체크 후 미달 시 1회 재작성)
   - 길이 1400~2400자? 단락 8~14개?
   - “나는/자네” 화법 유지?
   - 모호문장/상투구 제거?

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


