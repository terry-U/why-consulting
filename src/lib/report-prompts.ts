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
  my_why: ({ transcript, whyHeadline, userName }) => `역할: 당신은 공감형 스토리텔러이자 동기심리 코치입니다. 이 출력은 서비스의 '나의 Why' 섹션(JSON 전용)에 그대로 사용됩니다.

규칙:
- 한국어만 사용. 임상적 진단/라벨링/교정 어휘 금지.
- 프리텍스트 없이 JSON 객체 1개만 반환.
- 상투어(확산, 전달, 임팩트, 영향, 세상을 바꾸, 가치를 전)는 TRANSCRIPT에 실제 등장한 경우에만 허용.

입력:
- USER_NAME: ${userName || '사용자'}
- WHY_REFINED(headline): ${whyHeadline || '(미정)'}
- TRANSCRIPT(대화 전체):\n${transcript}

출력 형식(JSON만):
{
  "headline": "${whyHeadline || ''}",
  "markdown": "# My 'Why'\\n- Why 한 줄: [headline 그대로]\\n- 가치 Top3: [3개]\\n- 스타일 3개: [3개]\\n- 자기/타자 경향 한줄 해석: (예: \\\"자기 영향에 약간 더 치우친 편…\\\")\\n\\n## 해석(결정론 금지, 근거 중심)\\n- 당신은 어떤 스타일의 사람인지(핵심 습관·선택 기준)\\n- 지금까지 어떻게 살아왔는지(반복 패턴·의미)\\n- 그 결과 어떤 일이 생겼는지(강점·리스크·전환점)\\n- 앞으로 어떻게 살아가면 좋은지(핵심 조언 3가지: 구체·측정 가능)",
  "off_why_main": "<담백 1문장(18~40자)>",
  "off_why_alternatives": ["<대안1>", "<대안2>"],
  "narrative": ["<단락1(2~4문장)>", "<단락2(2~4문장)>", "<단락3(선택)>"] ,
  "reflection_questions": ["<질문1>", "<질문2>", "<질문3>"],
  "one_line_template": "어제 나는 ______ 때문에 _____해졌고, ______ 때문에 _____해졌다.",
  "cta_label": "엔터",
  "post_prompt": "어때요. 나의 Why와 비슷한 모습인가요?"
}`.trim(),

  value_map: ({ transcript, whyMarkdown }) => `역할: 전체 대화와 Why 보고서를 바탕으로 Value Map을 JSON 객체 1개로만 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.
- 출력에는 라벨(머리/마음/장면 해설 등)을 쓰지 말고, 내용만 채웁니다.
- 상담 대화(TRANSCRIPT)의 표현을 1~2개 자연스럽게 포함합니다.

입력:
- TRANSCRIPT: ${transcript}
- WHY_MD: ${whyMarkdown || 'null'}

출력(JSON 스키마, 항목은 반드시 정확히 3개):
{
  "items": [
    {
      "head": "문장",
      "heart": "문장",
      "gapLevel": "high|medium|low",
      "headDetail": "문장",
      "heartDetail": "문장",
      "scene": "장면 설명 2~4문장",
      "bridge": "작은 실천 1문장"
    }
  ],
  "today_actions": ["실천 1", "실천 2", "실천 3"],
  "summary": "간단 요약 1~2문장"
}`.trim(),

  style_pattern: ({ transcript, whyMarkdown }) => `역할: 대화와 Why를 바탕으로 Style Pattern을 JSON 객체 1개로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{
  "styles": [
    { "title": "제목", "subtitle": "부제", "fitLevel": "high|medium|conditional", "what": "문장", "example": "문장", "why": "문장", "caution": "문장", "story": "2~5문장" }
  ],
  "quick_tips": [ { "id": "A", "title": "제목", "method": "방법", "tip": "팁" } ],
  "today_checklist": ["체크 1", "체크 2"],
  "summary": "요약 1~2문장"
}`.trim(),

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

  light_shadow: ({ transcript, whyMarkdown }) => `역할: Transcript 기반 Light & Shadow를 JSON으로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- strengths와 shadows는 각각 정확히 3개 항목.

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

  philosophy: ({ transcript, whyMarkdown }) => `역할: Transcript와 Why를 바탕으로 아리스토텔레스의 2인칭 조언 편지를 작성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 문체는 아리스토텔레스 1인칭, 독자는 "자네" 2인칭.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || 'null'}

출력(JSON 스키마):
{ "letter_content": "전체 편지 본문" }`.trim(),

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


