import { useState } from 'react';
import { SectionBase } from '../SectionBase';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Zap, ZapOff, CheckCircle, XCircle } from 'lucide-react';

interface FitTriggerSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
}

const triggers = [
  { id: 'creative_challenge', label: '창의적 도전', category: 'fit', defaultState: true },
  { id: 'team_collaboration', label: '팀 협업', category: 'fit', defaultState: true },
  { id: 'learning_opportunity', label: '학습 기회', category: 'fit', defaultState: true },
  { id: 'meaningful_impact', label: '의미있는 임팩트', category: 'fit', defaultState: true },
  { id: 'autonomy', label: '자율성', category: 'fit', defaultState: false },
  { id: 'repetitive_tasks', label: '반복 작업', category: 'trigger', defaultState: false },
  { id: 'micromanagement', label: '마이크로매니징', category: 'trigger', defaultState: false },
  { id: 'unclear_goals', label: '불분명한 목표', category: 'trigger', defaultState: false },
  { id: 'time_pressure', label: '시간 압박', category: 'trigger', defaultState: true },
  { id: 'conflict', label: '갈등 상황', category: 'trigger', defaultState: true }
];

export function FitTriggerSection({ isPinned, onTogglePin, language }: FitTriggerSectionProps) {
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>(
    triggers.reduce((acc, trigger) => ({
      ...acc,
      [trigger.id]: trigger.defaultState
    }), {})
  );

  const content = {
    ko: {
      title: '핏&트리거',
      description: '스위치 보드',
      fitTriggers: '핏 트리거 (동기 부여)',
      negativeTriggers: '네거티브 트리거 (방해 요소)',
      activeCount: '활성화된 스위치',
      recommendation: '추천 설정'
    },
    en: {
      title: 'Fit & Triggers',
      description: 'Switch Board',
      fitTriggers: 'Fit Triggers (Motivators)',
      negativeTriggers: 'Negative Triggers (Obstacles)', 
      activeCount: 'Active Switches',
      recommendation: 'Recommended Settings'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  const toggleSwitch = (triggerId: string) => {
    setSwitchStates(prev => ({
      ...prev,
      [triggerId]: !prev[triggerId]
    }));
  };

  const fitTriggers = triggers.filter(t => t.category === 'fit');
  const negativeTriggers = triggers.filter(t => t.category === 'trigger');
  
  const activeFitCount = fitTriggers.filter(t => switchStates[t.id]).length;
  const activeNegativeCount = negativeTriggers.filter(t => switchStates[t.id]).length;

  return (
    <SectionBase
      id={5}
      title={text.title}
      description={text.description}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-6">
        {/* Switch Board Summary */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">핏 트리거</p>
                <p className="text-xl font-bold text-green-500">{activeFitCount}/{fitTriggers.length}</p>
              </div>
              <div>
                <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-muted-foreground">네거티브 트리거</p>
                <p className="text-xl font-bold text-red-500">{activeNegativeCount}/{negativeTriggers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fit Triggers */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              <h4>{text.fitTriggers}</h4>
              <Badge variant="secondary">{activeFitCount} 활성</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fitTriggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {switchStates[trigger.id] ? (
                    <Zap className="h-4 w-4 text-green-500" />
                  ) : (
                    <ZapOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={switchStates[trigger.id] ? 'font-medium' : 'text-muted-foreground'}>
                    {trigger.label}
                  </span>
                </div>
                <Switch
                  checked={switchStates[trigger.id]}
                  onCheckedChange={() => toggleSwitch(trigger.id)}
                  aria-label={`Toggle ${trigger.label}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Negative Triggers */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <h4>{text.negativeTriggers}</h4>
              <Badge variant="outline">{activeNegativeCount} 활성</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {negativeTriggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {switchStates[trigger.id] ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={switchStates[trigger.id] ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
                    {trigger.label}
                  </span>
                </div>
                <Switch
                  checked={switchStates[trigger.id]}
                  onCheckedChange={() => toggleSwitch(trigger.id)}
                  aria-label={`Toggle ${trigger.label}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <h4>{text.recommendation}</h4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">최적 환경 구성</h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  창의적 도전과 팀 협업이 포함된 프로젝트에서 높은 자율성을 보장받을 때 최고 성과를 발휘합니다.
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-2">주의 요소</h5>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  시간 압박과 갈등 상황에 민감하므로 적절한 완충 장치와 소통 채널이 필요합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionBase>
  );
}