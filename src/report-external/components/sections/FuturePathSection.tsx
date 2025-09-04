import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Plus, 
  Minus, 
  Target, 
  Users, 
  Briefcase, 
  MapPin,
  Clock,
  Heart,
  Pin, 
  PinOff, 
  Link 
} from 'lucide-react';

interface FuturePathSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
}

const scenarios = [
  {
    id: 'growth_accelerator',
    title: '성장 가속화',
    timeframe: '6개월',
    probability: 85,
    description: '현재의 강점을 더욱 발전시켜 전문성을 심화하는 경로',
    milestones: [
      { month: 1, goal: '핵심 스킬 집중 개발', status: 'active' },
      { month: 3, goal: '멘토링 관계 구축', status: 'planned' },
      { month: 6, goal: '전문가 네트워크 확장', status: 'planned' }
    ],
    keyActions: ['창의적 프로젝트 리딩', '학습 커뮤니티 참여', '피드백 시스템 구축']
  },
  {
    id: 'impact_maximizer',
    title: '임팩트 극대화',
    timeframe: '1년',
    probability: 70,
    description: '개인의 성장을 넘어서 타인과 조직에 의미있는 변화를 만드는 경로',
    milestones: [
      { month: 3, goal: '팀 프로젝트 주도', status: 'planned' },
      { month: 6, goal: '조직 문화 개선 기여', status: 'planned' },
      { month: 12, goal: '사회적 임팩트 창출', status: 'planned' }
    ],
    keyActions: ['리더십 역할 수행', '사회적 가치 추구', '협업 플랫폼 구축']
  },
  {
    id: 'balance_optimizer',
    title: '균형 최적화',
    timeframe: '지속적',
    probability: 90,
    description: '개인적 만족과 전문적 성취 사이의 건강한 균형을 찾는 경로',
    milestones: [
      { month: 1, goal: '일과 삶의 경계 설정', status: 'active' },
      { month: 6, goal: '지속가능한 루틴 확립', status: 'planned' },
      { month: 12, goal: '장기적 웰빙 시스템 구축', status: 'planned' }
    ],
    keyActions: ['자기 관리 시스템', '스트레스 관리', '관계 투자']
  }
];

const environmentFactors = {
  remove: [
    {
      icon: Clock,
      category: "시간 환경",
      items: [
        "불필요한 반복 회의",
        "명확하지 않은 요청들",
        "즉석 판단 요구 상황",
        "과도한 멀티태스킹"
      ],
      impact: "집중도 70% 향상"
    },
    {
      icon: Users,
      category: "인간관계",
      items: [
        "건설적이지 않은 비판",
        "목적 없는 잡담",
        "에너지 소모적인 갈등",
        "부정적 사고 패턴"
      ],
      impact: "정신적 에너지 60% 절약"
    },
    {
      icon: Briefcase,
      category: "업무 환경",
      items: [
        "복잡한 승인 프로세스",
        "중복 검토 단계",
        "형식적인 문서 작업",
        "완벽주의적 검증"
      ],
      impact: "실행 속도 50% 증가"
    }
  ],
  strengthen: [
    {
      icon: Target,
      category: "목표 달성",
      items: [
        "명확한 우선순위 설정",
        "정기적인 진도 점검",
        "데이터 기반 의사결정",
        "빠른 실험과 학습"
      ],
      impact: "목표 달성률 80% 향상"
    },
    {
      icon: Heart,
      category: "동기 부여",
      items: [
        "성과 인정과 피드백",
        "자율성과 책임 부여",
        "새로운 도전 기회",
        "지속적 학습 지원"
      ],
      impact: "몰입도 90% 증가"
    },
    {
      icon: MapPin,
      category: "환경 조성",
      items: [
        "집중 가능한 물리적 공간",
        "필요한 도구와 자원",
        "신뢰하는 동료들",
        "안전한 실패 문화"
      ],
      impact: "창의성 75% 향상"
    }
  ]
};

const implementationSteps = [
  {
    phase: "1단계: 현황 파악",
    duration: "1-2주",
    actions: [
      "현재 에너지 소모 요인 목록화",
      "하루 시간 사용 패턴 분석",
      "스트레스 유발 상황 기록"
    ],
    milestone: "개선 포인트 10개 이상 식별"
  },
  {
    phase: "2단계: 제거 실행",
    duration: "1개월",
    actions: [
      "불필요한 미팅 정리",
      "업무 프로세스 단순화",
      "부정적 관계 최소화"
    ],
    milestone: "에너지 소모 30% 감소"
  },
  {
    phase: "3단계: 강화 구축",
    duration: "2개월",
    actions: [
      "목표 달성 시스템 구축",
      "동기부여 환경 조성",
      "지원 네트워크 확장"
    ],
    milestone: "Why 실현 환경 70% 완성"
  },
  {
    phase: "4단계: 최적화",
    duration: "지속적",
    actions: [
      "정기적 환경 점검",
      "피드백 기반 조정",
      "지속적 개선"
    ],
    milestone: "Why 극대화 환경 완전 구축"
  }
];

export function FuturePathSection({ isPinned, onTogglePin, language }: FuturePathSectionProps) {
  const [activeScenario, setActiveScenario] = useState('growth_accelerator');

  const content = {
    ko: {
      title: 'Why 극대화 환경',
      subtitle: '내 Why가 최고로 발휘되는 환경 설계',
      removeTitle: '제거할 것들',
      strengthenTitle: '강화할 것들',
      categoryLabel: '영역',
      impactLabel: '기대 효과',
      implementationTitle: '실행 로드맵',
      actionsLabel: '실행 항목',
      milestoneLabel: '마일스톤'
    },
    en: {
      title: 'Why Maximization Environment',
      subtitle: 'Designing an environment where my Why can be fully realized',
      removeTitle: 'Things to Remove',
      strengthenTitle: 'Things to Strengthen',
      categoryLabel: 'Category',
      impactLabel: 'Expected Impact',
      implementationTitle: 'Implementation Roadmap',
      actionsLabel: 'Actions',
      milestoneLabel: 'Milestone'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">6</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              <p className="text-muted-foreground mt-1">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                const element = document.getElementById('section-6');
                if (element) {
                  navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#section-6`);
                }
              }}
              aria-label="Copy section link"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePin}
              className="shrink-0"
              aria-label={isPinned ? 'Unpin section' : 'Pin section'}
            >
              {isPinned ? (
                <Pin className="h-4 w-4 text-primary" />
              ) : (
                <PinOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Remove & Strengthen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Remove Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Minus className="h-5 w-5 text-red-500" />
              {text.removeTitle}
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {environmentFactors.remove.map((factor, index) => {
              const IconComponent = factor.icon;
              return (
                <Card key={index} className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{factor.category}</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">{factor.impact}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {factor.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-content-large text-muted-foreground">
                          <Minus className="h-3 w-3 text-red-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Strengthen Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              {text.strengthenTitle}
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {environmentFactors.strengthen.map((factor, index) => {
              const IconComponent = factor.icon;
              return (
                <Card key={index} className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{factor.category}</h4>
                        <p className="text-sm text-green-600 dark:text-green-400">{factor.impact}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {factor.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-content-large text-muted-foreground">
                          <Plus className="h-3 w-3 text-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Implementation Roadmap */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            {text.implementationTitle}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {implementationSteps.map((step, index) => (
              <Card key={index} className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">{step.phase}</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{step.duration}</p>
                      </div>
                    </div>
                    <Progress value={(index + 1) * 25} className="w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">{text.actionsLabel}:</h5>
                    <ul className="space-y-1">
                      {step.actions.map((action, idx) => (
                        <li key={idx} className="text-action">• {action}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">{text.milestoneLabel}:</h5>
                    <p className="text-blue-700 dark:text-blue-300">{step.milestone}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}