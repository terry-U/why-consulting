import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Sun, 
  Moon, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Pin, 
  PinOff, 
  Link 
} from 'lucide-react';

interface LightShadowSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any;
}

const strengths = [
  {
    id: 1,
    title: "창의적 사고",
    percentage: 90,
    number: "1",
    description: "새로운 아이디어를 떠올리고, 막힌 문제에 다른 길을 찾아냅니다.",
    insight: "당신은 다른 사람들이 \"어떻게 해야 하지?\" 하며 막막해할 때, 자연스럽게 \"이렇게 해보면 어떨까?\" 하는 새로운 관점을 제시하는 사람입니다. 복잡해 보이는 문제도 본질을 꿰뚫어 보고, 간단하고 창의적인 해결책을 찾아내죠.",
    situations: ["회의가 막혔을 때", "복잡한 요구를 간단히 정리해야 할 때"],
    roles: ["해결책 설계자", "아이디어 워크숍 리더"],
    impact: "이런 순간에 당신이 있으면 모든 사람이 안도하며, 당신 자신도 가장 활기차고 행복해집니다."
  },
  {
    id: 2,
    title: "공감 능력",
    percentage: 85,
    number: "2",
    description: "다른 사람의 마음을 읽고, 그들이 이해할 수 있는 언어로 전달합니다.",
    insight: "당신은 불안해하는 사람을 보면 저절로 마음이 움직이고, 그들의 걱정을 덜어주고 싶어집니다. 복잡한 상황도 상대방이 안심할 수 있는 말로 차근차근 풀어서 설명하죠. 사람들이 당신과 이야기한 후 \"이제 알겠어요\" 하며 미소 짓는 모습을 자주 보게 됩니다.",
    situations: ["사고 후 사용자 공지", "팀 갈등 중재", "온보딩 문구 다듬기"],
    roles: ["안내 가이드", "고객 커뮤니케이터", "멘토"],
    impact: "이런 역할을 할 때 당신의 존재 이유가 선명해지고, 주변 사람들과의 신뢰가 깊어집니다."
  },
  {
    id: 3,
    title: "학습 의욕",
    percentage: 80,
    number: "3",
    description: "새로운 것을 빠르게 배우고, 배운 것을 바로 시도해봅니다.",
    insight: "당신은 \"이건 어떻게 하는 거지?\" 하는 호기심이 생기면 참지 못하고 바로 알아보려 합니다. 그리고 혼자만 알고 끝내는 게 아니라, 팀 전체가 더 안전하고 효율적으로 일할 수 있도록 그 지식을 나누죠. 작은 실험 하나가 큰 변화의 시작이 되는 걸 자주 경험합니다.",
    situations: ["새 도구·정책 도입", "사고 재발 방지 대책 설계"],
    roles: ["리서처", "작은 실험 설계자", "내부 학습 자료 제작자"],
    impact: "새로운 걸 배우고 나눌 때마다 당신의 에너지가 충전되고, 하루에도 여러 번 보람을 느낍니다."
  }
];

const shadows = [
  {
    id: 1,
    title: "완벽주의",
    percentage: 70,
    number: "1",
    color: "amber",
    description: "높은 기준 때문에 시작과 공유를 미루게 됩니다.",
    insight: "당신은 \"이 정도로는 부족해\" 하며 계속 다듬고 싶어합니다. 좋은 것을 만들고 싶은 마음이 크지만, 그 때문에 정작 도움이 필요한 사람들에게 늦게 전달되거나 아예 전달되지 않을 때가 있어요. 완벽하지 않아도 지금 당장 도움이 되는 것들이 많다는 걸 가끔 놓치게 됩니다.",
    examples: [
      "데모 전날까지 계속 다듬음",
      "문서 공개를 미룸",
      "\"완벽해지면 공유할게요\"가 습관"
    ],
    solutions: [
      {
        title: "못생긴 첫 버전",
        method: "캡처 1장 + \"여기까지 했습니다\"를 용기 내어 공유"
      },
      {
        title: "60% 공유 규칙",
        method: "완성 전 한 번 먼저 공유(마감 뒤 리팩터링 30분은 별도 예약)"
      }
    ]
  },
  {
    id: 2,
    title: "결정 회피",
    percentage: 60,
    number: "2",
    color: "blue",
    description: "더 좋은 선택을 위해 결정을 미루게 됩니다.",
    insight: "당신은 \"조금만 더 확실하게 알아보고 결정하자\" 하며 추가 정보를 기다립니다. 신중한 건 좋지만, 그 사이에 상황이 더 복잡해지거나 기회를 놓칠 때가 있어요. 완벽한 결정보다는 적당히 좋은 결정을 빨리 내리는 게 더 도움이 될 때가 많다는 걸 알면서도, 막상 그 순간이 오면 망설이게 됩니다.",
    examples: [
      "A/B 중 A로 가도 되는데 추가 데이터만 기다림",
      "\"모두가 동의할 때까지\" 대기",
      "\"추가 조사 필요\"만 반복"
    ],
    solutions: [
      {
        title: "10분 결정 메모",
        method: "A/B, 되돌릴 수 있나, 마감, 2주 뒤 재검토를 지금 작성"
      },
      {
        title: "작은 실험으로 결정",
        method: "대상 1명·기간 1일·평가 1줄로 바로 시험"
      }
    ]
  },
  {
    id: 3,
    title: "감정 과몰입",
    percentage: 55,
    number: "3",
    color: "violet",
    description: "다른 사람을 도우다가 자신의 에너지가 고갈됩니다.",
    insight: "당신은 누군가 힘들어하는 걸 보면 그냥 지나칠 수 없어서 깊이 관여하게 됩니다. 도와주고 싶은 마음이 진심이지만, 그러다 보면 정작 당신이 해야 할 중요한 일(위험을 미리 보고 알리기, 판단 기준 만들기)을 밤에 하게 되거나 소홀히 하게 돼요. 도움을 주는 건 좋지만, 당신만이 할 수 있는 고유한 역할도 중요합니다.",
    examples: [
      "DM 상담이 길어지고 본인 업무는 밤에 처리",
      "긴급 지원 요청을 연달아 수용",
      "\"언제든지 불러요\"가 습관"
    ],
    solutions: [
      {
        title: "공감 예산 20분 타이머 + 경계 문장",
        method: "\"지금은 10분까지만 도울게요\""
      },
      {
        title: "다음 손으로 연결",
        method: "리소스 링크·담당자 소개로 자연스럽게 넘기기"
      }
    ]
  }
];

export function LightShadowSection({ isPinned, onTogglePin, language, data }: LightShadowSectionProps) {
  const content = {
    ko: {
      title: '빛과 그림자',
      subtitle: '내 Why의 강점과 단점',
      lightTitle: '빛 – 내 Why의 강점',
      shadowTitle: '그림자 – 내 Why의 단점',
      situationsLabel: '이런 상황에서',
      rolesLabel: '이런 역할로',
      impactLabel: '이때 느끼는 것',
      examplesLabel: '이런 모습들',
      solutionsLabel: '이렇게 해보세요',
      methodLabel: '방법'
    },
    en: {
      title: 'Light and Shadow',
      subtitle: 'Strengths and Weaknesses of My Why',
      lightTitle: 'Light – Strengths of My Why',
      shadowTitle: 'Shadow – Weaknesses of My Why',
      situationsLabel: 'In these situations',
      rolesLabel: 'In these roles',
      impactLabel: 'What you feel',
      examplesLabel: 'These patterns',
      solutionsLabel: 'Try this',
      methodLabel: 'Method'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  const getColorClass = (color: string, type: 'bg' | 'text' | 'border' = 'bg') => {
    const colors = {
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' }
    };
    return colors[color as keyof typeof colors]?.[type] || colors.blue[type];
  };

  const apiStrengths: Array<any> | undefined = Array.isArray(data?.strengths) ? data.strengths : undefined;
  const apiShadows: Array<any> | undefined = Array.isArray(data?.shadows) ? data.shadows : undefined;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">4</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              <p className="text-muted-foreground mt-1">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" />
        </div>
      </div>

      {/* Light - Strengths */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            {text.lightTitle}
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {(apiStrengths || strengths).map((raw, idx) => {
            const strength = apiStrengths ? {
              id: idx,
              title: raw.title,
              percentage: raw.percentage ?? 0,
              number: String(idx + 1),
              description: raw.description,
              insight: raw.insight,
              situations: Array.isArray(raw.situations) ? raw.situations : [],
              roles: Array.isArray(raw.roles) ? raw.roles : [],
              impact: raw.impact
            } : raw;
            return (
            <Card key={strength.id} className="border-2 border-muted">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{strength.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{strength.title}</h4>
                      <Badge className="bg-muted/50 text-muted-foreground">
                        {strength.percentage}%
                      </Badge>
                    </div>
                    <Progress value={strength.percentage} className="h-2 mb-3" />
                    <p className="text-content-large text-muted-foreground">{strength.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Insight */}
                <div className="p-4 rounded-lg border-l-4 border-amber-500">
                  <p className="text-insight text-amber-800">
                    {strength.insight}
                  </p>
                </div>

                {/* Situations and Roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                    <h5 className="font-semibold mb-3 text-green-800">
                      {text.situationsLabel}:
                    </h5>
                    <ul className="space-y-2">
                      {strength.situations.map((situation: string, index: number) => (
                        <li key={index} className="text-green-700 font-medium">
                          • {situation}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                    <h5 className="font-semibold mb-3 text-green-800">
                      {text.rolesLabel}:
                    </h5>
                    <ul className="space-y-2">
                      {strength.roles.map((role: string, index: number) => (
                        <li key={index} className="text-green-700 font-medium">
                          • {role}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Impact */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <h5 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {text.impactLabel}:
                  </h5>
                  <p className="leading-relaxed font-medium text-blue-700">
                    {strength.impact}
                  </p>
                </div>
              </CardContent>
            </Card>
          )})}
        </CardContent>
      </Card>

      {/* Shadow - Weaknesses */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Moon className="h-5 w-5 text-slate-500" />
            {text.shadowTitle}
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {(apiShadows || shadows).map((raw, idx) => {
            const shadow = apiShadows ? {
              id: idx,
              title: raw.title,
              percentage: raw.percentage ?? 0,
              number: String(idx + 1),
              description: raw.description,
              insight: raw.insight,
              examples: Array.isArray(raw.examples) ? raw.examples : [],
              solutions: Array.isArray(raw.solutions) ? raw.solutions : []
            } : raw;
            return (
            <Card key={shadow.id} className="border-2 border-muted">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{shadow.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{shadow.title}</h4>
                      <Badge className="bg-muted/50 text-muted-foreground">
                        {shadow.percentage}%
                      </Badge>
                    </div>
                    <Progress value={shadow.percentage} className="h-2 mb-3" />
                    <p className="text-muted-foreground leading-relaxed">{shadow.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Insight */}
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-500">
                  <p className="leading-relaxed text-amber-800">
                    {shadow.insight}
                  </p>
                </div>

                {/* Examples */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h5 className="font-semibold mb-3 flex items-center gap-2 text-slate-700">
                    <AlertTriangle className="h-4 w-4" />
                    {text.examplesLabel}:
                  </h5>
                  <ul className="space-y-2">
                    {shadow.examples.map((example: string, index: number) => (
                      <li key={index} className="text-slate-600">
                        • {example}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div className="space-y-4">
                  <h5 className="font-semibold flex items-center gap-2 text-green-700">
                    <ArrowRight className="h-5 w-5" />
                    {text.solutionsLabel}:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shadow.solutions.map((solution: { title: string; method: string }, index: number) => (
                      <Card key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="pt-4">
                          <h6 className="font-semibold mb-2 text-green-800">
                            {solution.title}
                          </h6>
                          <p className="text-sm text-muted-foreground mb-1">{text.methodLabel}:</p>
                          <p className="leading-relaxed text-green-700">
                            {solution.method}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </CardContent>
      </Card>
    </div>
  );
}