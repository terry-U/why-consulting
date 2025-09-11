import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Users2, 
  Wrench, 
  Target, 
  Pin, 
  PinOff, 
  Link,
  Heart,
  Lightbulb,
  Compass
} from 'lucide-react';

interface MasterManagerSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any;
}

const spectrumData = {
  motivation: {
    self: 28,
    others: 72,
    label: "동기 방향"
  },
  execution: {
    master: 58,
    manager: 42,
    label: "실행 방식"
  }
};

const quadrantTypes = [
  {
    id: 'mediator',
    name: '중재자',
    position: '타인지향 가치관 + 매니저',
    description: '사람들 사이를 잇고 함께 문제를 해결하는 역할',
    icon: Users2,
    color: 'blue',
    traits: ['갈등 조율', '협업 실행', '소통 중시', '현장 중심'],
    quadrant: { others: 70, manager: 70 }
  },
  {
    id: 'prophet',
    name: '선지자',
    position: '자기지향 가치관 + 매니저',
    description: '내적 비전을 바탕으로 사람들과 함께 이끄는 역할',
    icon: Lightbulb,
    color: 'violet',
    traits: ['비전 제시', '영감 부여', '협업 리더십', '시스템 구축'],
    quadrant: { others: 30, manager: 70 }
  },
  {
    id: 'lighthouse',
    name: '등대지기',
    position: '타인지향 가치관 + 마스터',
    description: '타인을 위해 고독한 작업을 통해 길을 밝히는 전문가',
    icon: Compass,
    color: 'amber',
    traits: ['전문성 추구', '독립적 작업', '타인을 위한 헌신', '깊이 있는 탐구'],
    quadrant: { others: 70, manager: 30 }
  },
  {
    id: 'sage',
    name: '도인',
    position: '자기지향 가치관 + 마스터',
    description: '내적 성찰을 통해 스스로 지혜로운 길을 만드는 현자',
    icon: Target,
    color: 'green',
    traits: ['내적 성찰', '독립적 사고', '자기 완성', '개인적 탐구'],
    quadrant: { others: 30, manager: 30 }
  }
];

const sceneExplanations = [
  {
    id: 1,
    category: "타인지향 가치관 — 타인 쪽으로 기울어 있음 (72)",
    icon: Heart,
    color: "rose",
    description: "당신의 동기 체계는 근본적으로 '타인의 변화와 반응'에서 활력을 얻도록 설계되어 있습니다. 이것은 단순한 이타심이 아니라, 타인의 긍정적 변화를 목격하고 그 과정에 기여할 때 스스로의 존재 의미를 확인하는 심리적 패턴입니다.",
    evidence: [
      "사용자가 남긴 \"덕분에 오늘 하루가 달라졌어요\" 한 줄의 피드백이 몇 주 동안 기억에 남아있었습니다.",
      "동료의 진심어린 \"고마워요\" 표정을 보는 순간 에너지가 즉시 회복되는 경험을 반복적으로 했습니다.",
      "프로젝트 성과 지표가 목표를 상회했음에도 불구하고, 수혜자의 얼굴이나 목소리가 보이지 않으면 성취감이 현저히 떨어졌습니다."
    ],
    analysis: "이러한 패턴은 당신이 '관계적 보상 시스템'을 통해 동기를 얻는 사람임을 보여줍니다. 타인의 변화를 직접 목격하고 그 변화에 자신이 기여했다는 확신을 얻을 때, 도파민과 세로토닌 분비가 활성화되며 지속적인 동기를 유지할 수 있는 신경화학적 기반이 형성됩니다.",
    conclusion: "타인의 변화와 표정이 동기의 핵심 스위치 역할을 합니다."
  },
  {
    id: 2,
    category: "실행 방식 — 마스터 쪽이 약간 우세 (58)",
    icon: Wrench,
    color: "blue", 
    description: "당신의 실행 패턴은 '직접 체험을 통한 숙련'과 '시스템적 사고를 통한 구조 설계' 사이에서 균형을 이루고 있습니다. 마스터적 성향이 약간 우세하지만, 매니저적 접근 또한 상당한 비중을 차지하는 하이브리드 형태입니다.",
    evidence: [
      "복잡한 기술적 문제에 대해 밤늦게 혼자 몰입하여 해결책을 찾았을 때, '내가 정말 할 수 있는 사람이구나'라는 강한 자기효능감을 경험했습니다.",
      "온보딩 프로세스나 피어리뷰 시스템 등 사람들 간의 협업을 원활하게 만드는 구조를 설계할 때도 깊은 만족감을 느꼈습니다.",
      "단순 반복 작업보다는 문제의 본질을 파악하고 근본적 해결책을 찾는 과정에서 몰입도가 극대화됩니다."
    ],
    analysis: "이는 '깊이 있는 전문성 추구'와 '시스템적 영향력 확산' 두 가지 욕구가 공존하는 특별한 조합입니다. 마스터적 측면에서는 개별 문제에 대한 완전한 이해와 숙련을 통해 자아실현을 추구하며, 매니저적 측면에서는 그 지식과 경험을 구조화하여 더 많은 사람들에게 긍정적 영향을 미치고자 합니다.",
    conclusion: "직접 손을 대며 해결하는 장인적 역량이 강하면서도, 사람을 연결하는 구조 설계에서도 의미를 찾습니다."
  }
];

export function MasterManagerSection({ isPinned, onTogglePin, language, data }: MasterManagerSectionProps) {
  const content = {
    ko: {
      title: '매니저-마스터 스펙트럼',
      subtitle: '동기는 누구를 향하고, 나는 어떤 방식으로 움직일까요?',
      description: '이 페이지는 선생님께서 무엇을 위해 힘이 나고(자기지향 가치관 ↔ 타인지향 가치관), 어떻게 움직일 때 성과가 잘 나는지(마스터 ↔ 매니저)를 한눈에 보여드립니다. 숫자는 판단이 아니라 현재 위치를 가늠하는 눈금입니다.',
      quadrantTitle: '매니저-마스터 스펙트럼 그래프',
      currentType: '당신은 **중재자** 타입입니다',
      overviewTitle: '한눈에 보기',
      whyTitle: '왜 이렇게 보였나요 (장면 해설)',
      motivationSelf: '자기지향 가치관',
      motivationOthers: '타인지향 가치관',
      executionMaster: '마스터',
      executionManager: '매니저',
      currentPosition: '현재 좌표(사분면): 타인지향 가치관 · 매니저 → \"함께 문제를 해결하는 중재자\"',
      traits: '특징'
    },
    en: {
      title: 'Manager-Master Spectrum',
      subtitle: 'What motivates you and how do you work best?',
      description: 'This page shows what energizes you (self-oriented values ↔ other-oriented values) and how you achieve the best results (master ↔ manager). Numbers are not judgments but gauges to understand your current position.',
      quadrantTitle: 'Manager-Master Spectrum Graph',
      currentType: 'You are a **Mediator** type',
      overviewTitle: 'At a Glance',
      whyTitle: 'Why This Pattern? (Scene Analysis)',
      motivationSelf: 'Self-oriented Values',
      motivationOthers: 'Other-oriented Values',
      executionMaster: 'Master',
      executionManager: 'Manager',
      currentPosition: 'Current Position (Quadrant): Other-oriented Values · Manager → \"Collaborative Problem-Solver\"',
      traits: 'Traits'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
      emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
      amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400',
      violet: 'text-violet-600 bg-violet-50 dark:bg-violet-950/20 dark:text-violet-400',
      green: 'text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400',
      rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // 현재 유저의 위치 (장면 해설 우선 → 점수 폴백)
  const orientation = data?.orientation;
  const execution = data?.execution;
  const othersFromScene = (typeof orientation?.score === 'number' && (orientation?.side === 'self' || orientation?.side === 'others'))
    ? (orientation.side === 'others' ? orientation.score : 100 - orientation.score)
    : undefined;
  // manager 점수(높을수록 매니저, 낮을수록 마스터)
  const managerFromScene = (typeof execution?.score === 'number' && (execution?.side === 'manager' || execution?.side === 'master'))
    ? (execution.side === 'manager' ? execution.score : 100 - execution.score)
    : undefined;
  const currentUser = {
    others: typeof othersFromScene === 'number'
      ? othersFromScene
      : (typeof data?.scores?.others === 'number' ? data.scores.others : 72),
    manager: typeof managerFromScene === 'number'
      ? managerFromScene
      : (typeof data?.scores?.master === 'number' ? (100 - data.scores.master) : 58),
  };

  // 파생 기준(단일 기준 적용): 점수에서 방향과 제목 표기용 점수 계산
  const derivedOrientationSide = currentUser.others >= 50 ? 'others' : 'self';
  const derivedExecutionSide = currentUser.manager >= 50 ? 'manager' : 'master';
  const orientationScoreForTitle = derivedOrientationSide === 'others' ? currentUser.others : (100 - currentUser.others);
  const executionScoreForTitle = derivedExecutionSide === 'manager' ? currentUser.manager : (100 - currentUser.manager);
  const orientationStrong = Math.abs(currentUser.others - 50) >= 15;
  const executionStrong = Math.abs(currentUser.manager - 50) >= 15;
  const orientationTitle = derivedOrientationSide === 'others'
    ? (orientationStrong ? '타인의 변화를 더 중요하게 생각합니다.' : '타인의 변화를 조금 더 중요하게 생각합니다.')
    : (orientationStrong ? '자신의 성취를 더 중요하게 생각합니다.' : '자신의 성취를 약간 더 중요하게 생각합니다.');
  const executionTitle = derivedExecutionSide === 'manager'
    ? (executionStrong ? '타인과 협업을 더 중요하게 생각합니다.' : '타인과 협업을 조금 더 중요하게 생각합니다.')
    : (executionStrong ? '스스로 실행을 더 중요하게 생각합니다.' : '스스로 실행을 조금 더 중요하게 생각합니다.');
  // 점수만으로 타입을 결정(프롬프트 생성값 사용 안 함)
  const typeByScores = (others: number, manager: number) => {
    if (others >= 50 && manager >= 50) return { id: 'mediator', name: '중재자' } as const;
    if (others >= 50 && manager < 50)  return { id: 'lighthouse', name: '등대지기' } as const;
    if (others < 50 && manager >= 50)  return { id: 'prophet', name: '선지자' } as const;
    return { id: 'sage', name: '도인' } as const;
  };
  const derivedType = typeByScores(currentUser.others, currentUser.manager);
  const currentTypeName = derivedType.name;
  const userType = quadrantTypes.find(type =>
    Math.abs(type.quadrant.others - currentUser.others) < 20 &&
    Math.abs(type.quadrant.manager - currentUser.manager) < 20
  ) || quadrantTypes.find(t => t.id === derivedType.id) || quadrantTypes[0];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">3</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              <p className="text-muted-foreground mt-1">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" />
        </div>
      </div>

      {/* Introduction */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <p className="text-lg leading-relaxed text-muted-foreground mb-6">
            {text.description}
          </p>
          <div className={`p-4 rounded-lg ${getColorClass(userType.color)}`}>
            <h3 className="font-semibold mb-2">{`당신은 **${currentTypeName}** 타입입니다`}</h3>
            <p className="text-sm">{userType.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* 4-Quadrant Types */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5" />
            {text.quadrantTitle}
          </h3>
        </CardHeader>
        <CardContent>
          {/* 4사분면 그래프 (요청: 배경 라벨/아이콘 제거) */}
          <div className="relative w-full h-96 border-2 border-muted rounded-lg bg-gradient-to-br from-background via-muted/10 to-background overflow-hidden">
            {/* 축 라벨 */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-muted-foreground">
              ↑ 매니저 (100)
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-muted-foreground">
              ↓ 마스터 (0)
            </div>
            <div className="absolute top-1/2 -left-24 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-muted-foreground">
              ← 자기지향 가치관 (0)
            </div>
            <div className="absolute top-1/2 -right-24 transform -translate-y-1/2 rotate-90 text-sm font-medium text-muted-foreground">
              → 타인지향 가치관 (100)
            </div>

            {/* 축 수치 표시 */}
            {/* 상단 축 수치 */}
            <div className="absolute top-0 left-0 transform -translate-x-2 -translate-y-6 text-xs text-muted-foreground">
              0
            </div>
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-6 text-xs text-muted-foreground">
              100
            </div>
            
            {/* 하단 축 수치 */}
            <div className="absolute bottom-0 left-0 transform -translate-x-2 translate-y-6 text-xs text-muted-foreground">
              100
            </div>
            <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-6 text-xs text-muted-foreground">
              0
            </div>
            
            {/* 좌측 축 수치 */}
            <div className="absolute top-0 left-0 transform -translate-x-8 -translate-y-2 text-xs text-muted-foreground">
              100
            </div>
            <div className="absolute bottom-0 left-0 transform -translate-x-8 translate-y-2 text-xs text-muted-foreground">
              0
            </div>
            
            {/* 우측 축 수치 */}
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-2 text-xs text-muted-foreground">
              100
            </div>
            <div className="absolute bottom-0 right-0 transform translate-x-8 translate-y-2 text-xs text-muted-foreground">
              0
            </div>

            {/* 방향 강조 표시 */}
            {/* 상단 방향 */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-full border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-semibold text-blue-700">매니저 지향</div>
              <div className="text-xs text-blue-600">↑</div>
            </div>
            
            {/* 하단 방향 */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-950/20 rounded-full border border-green-200 dark:border-green-800">
              <div className="text-xs font-semibold text-green-700">마스터 지향</div>
              <div className="text-xs text-green-600">↓</div>
            </div>
            
            {/* 좌측 방향 */}
            <div className="absolute top-1/2 -left-32 transform -translate-y-1/2 flex items-center gap-2 px-3 py-1 bg-purple-50 dark:bg-purple-950/20 rounded-full border border-purple-200 dark:border-purple-800">
              <div className="text-xs text-purple-600">←</div>
              <div className="text-xs font-semibold text-purple-700">자기지향</div>
            </div>
            
            {/* 우측 방향 */}
            <div className="absolute top-1/2 -right-32 transform -translate-y-1/2 flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-950/20 rounded-full border border-rose-200 dark:border-rose-800">
              <div className="text-xs font-semibold text-rose-700">타인지향</div>
              <div className="text-xs text-rose-600">→</div>
            </div>

            {/* 4사분면 배경 영역들 (복원) */}
            {/* 1사분면: 자기지향 + 매니저 (선지자) */}
            <div className={`absolute top-0 left-0 w-1/2 h-1/2 flex items-center justify-center ${derivedType.id === 'prophet' ? 'bg-primary/5' : ''}`}>
              <div className="text-center opacity-70 hover:opacity-90 transition-opacity">
                <Lightbulb className="h-8 w-8 text-violet-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-violet-600">선지자</p>
                <p className="text-xs text-foreground/70">자기지향 · 매니저</p>
              </div>
            </div>
            
            {/* 2사분면: 타인지향 + 매니저 (중재자) */}
            <div className={`absolute top-0 right-0 w-1/2 h-1/2 flex items-center justify-center ${derivedType.id === 'mediator' ? 'bg-primary/5' : ''}`}>
              <div className="text-center opacity-90 hover:opacity-100 transition-opacity">
                <Users2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-600">중재자</p>
                <p className="text-xs text-foreground/70">타인지향 · 매니저</p>
              </div>
            </div>
            
            {/* 3사분면: 자기지향 + 마스터 (도인) */}
            <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 flex items-center justify-center ${derivedType.id === 'sage' ? 'bg-primary/5' : ''}`}>
              <div className="text-center opacity-70 hover:opacity-90 transition-opacity">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">도인</p>
                <p className="text-xs text-foreground/70">자기지향 · 마스터</p>
              </div>
            </div>
            
            {/* 4사분면: 타인지향 + 마스터 (등대지기) */}
            <div className={`absolute bottom-0 right-0 w-1/2 h-1/2 flex items-center justify-center ${derivedType.id === 'lighthouse' ? 'bg-primary/5' : ''}`}>
              <div className="text-center opacity-70 hover:opacity-90 transition-opacity">
                <Compass className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-600">등대지기</p>
                <p className="text-xs text-foreground/70">타인지향 · 마스터</p>
              </div>
            </div>

            {/* 중앙 십자선 */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border z-10"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10"></div>

            {/* 현재 사용자 위치 */}
            <div 
              className="absolute w-6 h-6 rounded-full border-4 border-primary bg-primary shadow-lg shadow-primary/25 animate-pulse transform -translate-x-3 -translate-y-3 z-20"
              style={{
                left: `${currentUser.others}%`,
                top: `${100 - currentUser.manager}%`
              }}
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-primary whitespace-nowrap bg-background px-2 py-1 rounded shadow-md">
                현재 위치 ({currentUser.others}, {currentUser.manager})
              </div>
            </div>

            {/* 요청: 그래프 위 점 아이콘(선지자/중재자/도인/등대지기) 모두 제거 */}
          </div>

          {/* 범례 (현재 타입 하이라이트) */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {quadrantTypes.map((type) => {
              const IconComponent = type.icon;
              const isCurrentType = type.id === derivedType.id;
              
              return (
                <div 
                  key={type.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrentType 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${getColorClass(type.color)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {type.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{type.position}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {type.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {type.traits.map((trait, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overview - Spectrum Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            {text.overviewTitle}
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Motivation Direction */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{spectrumData.motivation.label}</span>
              <span className="text-sm text-muted-foreground">{orientationTitle}</span>
            </div>
            <div className="relative">
              <div className="h-3 w-full rounded bg-muted overflow-hidden flex">
                <div
                  className={`h-3 ${currentUser.others >= (100 - currentUser.others) ? 'bg-slate-400' : 'bg-blue-500'}`}
                  style={{ width: `${100 - currentUser.others}%` }}
                />
                <div
                  className={`h-3 ${currentUser.others >= (100 - currentUser.others) ? 'bg-blue-500' : 'bg-slate-400'}`}
                  style={{ width: `${currentUser.others}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={derivedOrientationSide === 'self' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{text.motivationSelf}</span>
                <span className={derivedOrientationSide === 'others' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{text.motivationOthers}</span>
              </div>
            </div>
          </div>

          {/* Execution Style */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{spectrumData.execution.label}</span>
              <span className="text-sm text-muted-foreground">{executionTitle}</span>
            </div>
            <div className="relative">
              <div className="h-3 w-full rounded bg-muted overflow-hidden flex">
                {/* Left: Master */}
                <div
                  className={`h-3 ${(100 - currentUser.manager) >= currentUser.manager ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  style={{ width: `${100 - currentUser.manager}%` }}
                />
                {/* Right: Manager */}
                <div
                  className={`h-3 ${(100 - currentUser.manager) >= currentUser.manager ? 'bg-slate-400' : 'bg-emerald-500'}`}
                  style={{ width: `${currentUser.manager}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className={derivedExecutionSide === 'master' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{text.executionMaster}</span>
                <span className={derivedExecutionSide === 'manager' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{text.executionManager}</span>
              </div>
            </div>
          </div>

          {/* Current Position */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-lg leading-relaxed font-medium">
              {text.currentPosition}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scene Explanation (장면 해설) */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {text.whyTitle}
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {orientation && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getColorClass('rose')}`}>
                  <Heart className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg">
                  {derivedOrientationSide === 'others'
                    ? `타인지향 가치관 — ${orientationStrong ? '타인의 변화를 더 중요하게 생각합니다.' : '타인의 변화를 조금 더 중요하게 생각합니다.'}`
                    : `자기지향 가치관 — ${orientationStrong ? '자신의 성취를 더 중요하게 생각합니다.' : '자신의 성취를 약간 더 중요하게 생각합니다.'}`}
                </h4>
              </div>
              <div className="pl-12 space-y-4">
                <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg">
                  <p className="text-insight leading-relaxed">{orientation.paragraph}</p>
                </div>
                {Array.isArray(orientation.evidence) && orientation.evidence.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 text-muted-foreground">구체적 증거:</h5>
                    <div className="space-y-2">
                      {orientation.evidence.map((item: string, index: number) => (
                        <p key={index} className="text-content-large leading-relaxed pl-4 border-l-2 border-muted">{item}</p>
                      ))}
                    </div>
                  </div>
                )}
                {orientation.analysis && (
                  <div className="p-4 bg-gradient-to-r from-blue-50/50 to-violet-50/50 dark:from-blue-950/10 dark:to-violet-950/10 rounded-lg">
                    <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-200">심층 분석:</h5>
                    <p className="text-insight leading-relaxed">{orientation.analysis}</p>
                  </div>
                )}
                {orientation.summary && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-l-4 border-primary">
                    <p className="text-content-large leading-relaxed font-medium">→ {orientation.summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {execution && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getColorClass('blue')}`}>
                  <Wrench className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-lg">
                  {`실행 방식 — ${executionTitle}`}
                </h4>
              </div>
              <div className="pl-12 space-y-4">
                <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg">
                  <p className="text-insight leading-relaxed">{execution.paragraph}</p>
                </div>
                {Array.isArray(execution.evidence) && execution.evidence.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-3 text-muted-foreground">구체적 증거:</h5>
                    <div className="space-y-2">
                      {execution.evidence.map((item: string, index: number) => (
                        <p key={index} className="text-content-large leading-relaxed pl-4 border-l-2 border-muted">{item}</p>
                      ))}
                    </div>
                  </div>
                )}
                {execution.analysis && (
                  <div className="p-4 bg-gradient-to-r from-blue-50/50 to-violet-50/50 dark:from-blue-950/10 dark:to-violet-950/10 rounded-lg">
                    <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-200">심층 분석:</h5>
                    <p className="text-insight leading-relaxed">{execution.analysis}</p>
                  </div>
                )}
                {execution.summary && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-l-4 border-primary">
                    <p className="text-content-large leading-relaxed font-medium">→ {execution.summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}