import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Zap, Brain, ThumbsUp, ThumbsDown } from 'lucide-react';

interface StylePatternSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any; // API 데이터
}

const workingStyles = [
  {
    id: 1,
    title: "사람들과 함께 일하기",
    subtitle: "중간에 공유하고 피드백 받기",
    fit: "아주 잘 맞음",
    fitLevel: "high",
    icon: Users,
    color: "blue",
    what: "혼자 끝까지 가지 말고, 중간중간 \"이거 어때요?\" 물어보면서 진행하기",
    example: "주 1회 15분 진행상황 공유, \"덕분에 도움됐어요\" 같은 반응 듣기",
    why: "혼자 할 때보다 에너지가 충전되고, 방향을 놓치지 않게 됨",
    caution: "너무 완벽해야 한다고 생각해서 공유를 미루면 오히려 힘들어짐",
    story: "기억해보세요. 중요한 프로젝트를 혼자 며칠 동안 붙잡고 있을 때였습니다. 밤늦게까지 고민하며 \"이게 맞나\" 싶어 막막했는데, 다음 날 동료에게 \"잠깐 이거 봐주실래요?\" 하고 5분만 설명했을 때의 그 순간 말이에요. 상대방이 \"아, 이런 방향은 어때요?\" 한 마디에 갑자기 길이 보이고 에너지가 다시 차오르는 걸 느꼈죠. 그리고 결과물이 나왔을 때 \"덕분에 정말 도움됐어요\"라는 말을 들으며 혼자 해낼 때와는 전혀 다른 만족감을 경험했을 거예요.\n\n이런 패턴이 반복되는 걸 보면, 당신은 **관계 속에서 에너지를 얻는 사람**입니다. 혼자서도 충분히 능력 있지만, 사람들과의 연결고리가 있을 때 진짜 힘을 발휘하는 타입이에요. 단순히 도움을 받는 차원이 아니라, 그 상호작용 자체에서 창조적 에너지가 나오고 일의 의미를 더 크게 느끼는 성향이죠. 그래서 숫자로만 평가받는 환경에서는 공허함을 느끼고, 얼굴과 반응이 보이는 협업에서는 몇 배의 성과를 내는 거예요."
  },
  {
    id: 2,
    title: "작게 시작해서 빠르게 배우기",
    subtitle: "큰 계획보다 작은 실험",
    fit: "잘 맞음",
    fitLevel: "medium",
    icon: Zap,
    color: "amber",
    what: "거대한 계획 세우지 말고, 1주일 안에 확인할 수 있는 작은 실험부터",
    example: "사용자 1명에게 프로토타입 보여주고 반응 보기, A/B 테스트로 메시지 확인하기",
    why: "실패해도 부담 없고, 배운 걸로 다음에 더 좋게 만들 수 있음",
    caution: "실험만 계속하다가 정리 안 하면 나중에 복잡해짐",
    story: "완벽한 계획을 3주 동안 세우며 모든 경우의 수를 검토했던 프로젝트와, 일단 핵심 기능 하나만 1주일 만에 만들어서 실제 사용자에게 보여줬던 프로젝트를 비교해보세요. 아마 후자에서 훨씬 좋은 결과를 경험했을 거예요. 사용자가 \"이 기능 좋네요, 그런데 이렇게 되면 더 좋겠어요\"라고 말하는 순간, 3주짜리 완벽한 계획보다 더 정확한 방향을 찾았죠. 그리고 그 피드백을 바탕으로 다음 주에 개선된 버전을 만들어서 다시 보여주는 과정에서 진짜 가치를 만들어냈을 거예요.\n\n이런 당신의 모습을 보면, **배움을 통한 성장에서 에너지를 얻는 사람**이라는 걸 알 수 있어요. 미리 모든 걸 알고 시작하는 것보다, 하면서 배우고 그 배움으로 더 좋은 걸 만들어가는 과정 자체를 즐기는 성향이죠. 실패를 두려워하기보다는 \"이것도 배움이다\"라고 받아들이고, 그 경험을 다음 단계의 연료로 활용하는 능력이 뛰어나요. 그래서 불확실한 환경에서도 유연하게 적응하며 점진적으로 더 나은 해답을 찾아갈 수 있는 거예요."
  },
  {
    id: 3,
    title: "어려운 문제 깊이 파기",
    subtitle: "복잡한 걸 끝까지 해결하기",
    fit: "상황에 따라",
    fitLevel: "conditional",
    icon: Brain,
    color: "violet",
    what: "복잡하고 어려운 문제를 포기하지 않고 끝까지 해결하기",
    example: "밤늦게까지 버그 찾기, 복잡한 설계 문제 며칠 동안 고민하기",
    why: "해결했을 때 \"나도 할 수 있구나\" 확신이 생김",
    caution: "너무 오래 혼자 하면 지쳐서 번아웃 올 수 있음. 중간에 누군가와 얘기하는 게 좋음",
    story: "다른 사람들이 \"이건 너무 복잡해서 어렵겠다\" 하며 우회하려고 했던 문제를 기억해보세요. 밤늦게 혼자 남아서 코드를 뒤지고, 문서를 찾아보고, 이런저런 가설을 세워가며 며칠을 보냈을 때 말이에요. 그러다가 어느 순간 \"아, 이거구나!\" 하고 실마리를 찾았을 때의 그 순간 - 마치 퍼즐의 마지막 조각이 맞춰지는 것 같은 쾌감과 함께 \"역시 나는 해낼 수 있는 사람이야\"라는 확신이 온몸에 퍼졌죠. 그리고 나서 팀에게 해결책을 공유했을 때 \"와, 이걸 어떻게 찾아냈어요?\"라는 반응을 들며 진짜 가치를 만들어냈다는 성취감을 느꼈을 거예요.\n\n이런 패턴을 보면, 당신은 **도전과 숙련을 통해 자아실현을 추구하는 사람**입니다. 쉬운 문제로는 만족하지 않고, 복잡하고 어려운 문제일수록 오히려 흥미를 느끼는 성향이죠. 깊이 파고들어 본질을 이해하고 해결책을 찾아내는 과정에서 진정한 즐거움을 느끼고, 그렇게 얻은 성과를 통해 자신의 역량을 확인하는 타입이에요. 하지만 이런 몰입이 너무 길어지면 에너지가 고갈될 수 있어서, 중간중간 사람들과의 접촉을 통해 균형을 맞춰주는 게 중요해요."
  }
];

// quick tips / checklist / summary 제거됨

export function StylePatternSection({ isPinned, onTogglePin, language, data }: StylePatternSectionProps) {

  const content = {
    ko: {
      title: '나의 일하는 방식',
      subtitle: 'TOP 3',
      description: '어떻게 일할 때 가장 잘 되는가',
      introDescription: '여러 대화를 통해 발견한 나만의 일하는 패턴 3가지입니다.\n복잡한 분석보다는, 실제로 \"이렇게 하면 잘 되더라\" 하는 경험을 정리했어요.',
      whatTitle: '이건 뭐예요?',
      exampleTitle: '예를 들면',
      whyTitle: '왜 잘 맞나요?',
      cautionTitle: '주의할 점',
      // quick tips / checklist / summary 제거
      fitLevels: {
        'high': '아주 잘 맞음',
        'medium': '잘 맞음',
        'conditional': '상황에 따라'
      },
      methodLabel: '방법',
      tipLabel: '팁'
    },
    en: {
      title: 'My Working Style',
      subtitle: 'TOP 3',
      description: 'How I work best',
      introDescription: 'These are 3 working patterns discovered through various conversations.\nRather than complex analysis, I organized actual experiences of "this works well for me".',
      whatTitle: 'What is this?',
      exampleTitle: 'For example',
      whyTitle: 'Why does it work?',
      cautionTitle: 'Things to watch out for',
      // quick tips / checklist / summary removed
      fitLevels: {
        'high': 'Perfect Fit',
        'medium': 'Good Fit',
        'conditional': 'Situational'
      },
      methodLabel: 'Method',
      tipLabel: 'Tip'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  // API 데이터 매핑
  const apiStyles: Array<any> | undefined = Array.isArray(data?.styles) ? data.styles : undefined;

  const getFitColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'conditional': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStyleColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'amber': return 'bg-amber-500';
      case 'green': return 'bg-green-500';
      case 'violet': return 'bg-violet-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">2</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              <p className="text-muted-foreground mt-1">{text.subtitle}</p>
              {text.description && (
                <p className="text-muted-foreground">{text.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div />
          </div>
        </div>
      </div>

      {/* Introduction */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
            {text.introDescription}
          </p>
        </CardContent>
      </Card>

      {/* Working Styles */}
      <div className="space-y-6">
        {(apiStyles || workingStyles).map((styleRaw, idx) => {
          const style = apiStyles ? {
            id: idx,
            title: styleRaw.title,
            subtitle: styleRaw.subtitle,
            fitLevel: styleRaw.fitLevel,
            icon: [Users, Zap, Brain][idx % 3],
            color: ['blue','amber','violet'][idx % 3],
            what: styleRaw.what,
            example: styleRaw.example,
            why: styleRaw.why,
            caution: styleRaw.caution,
            story: styleRaw.story,
          } : styleRaw
          const IconComponent = style.icon;
          return (
            <Card key={style.id} className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${style.color === 'blue' ? 'bg-blue-50' : style.color === 'amber' ? 'bg-amber-50' : 'bg-violet-50'}`}>
                    <IconComponent className={`h-6 w-6 ${style.color === 'blue' ? 'text-blue-600' : style.color === 'amber' ? 'text-amber-600' : 'text-violet-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold">{style.title}</h3>
                      <Badge className={`${getFitColor(style.fitLevel)} text-xs`}>
                        {text.fitLevels[style.fitLevel as keyof typeof text.fitLevels]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{style.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* What */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    💡 {text.whatTitle}
                  </h4>
                  <p className="text-lg leading-relaxed pl-6">{style.what}</p>
                </div>

                {/* Example */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    📝 {text.exampleTitle}
                  </h4>
                  <p className="leading-relaxed pl-6 text-muted-foreground">{style.example}</p>
                </div>

                {/* Why & Caution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-800">
                      <ThumbsUp className="h-4 w-4" />
                      {text.whyTitle}
                    </h4>
                    <p className="text-green-700 leading-relaxed">
                      {style.why}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-800">
                      <ThumbsDown className="h-4 w-4" />
                      {text.cautionTitle}
                    </h4>
                    <p className="text-amber-700 leading-relaxed">
                      {style.caution}
                    </p>
                  </div>
                </div>

                {/* Story */}
                <div className="p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    📚 당신의 이야기
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
                      {style.story}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Tips / Checklist / Summary 제거 */}
    </div>
  );
}