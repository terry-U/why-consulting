import { useState } from 'react';
import { SectionBase } from '../SectionBase';
import { ChapterIntro } from '../ChapterIntro';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Clock, CheckCircle2, Play, ChefHat } from 'lucide-react';

interface ActionRecipeSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
}

const recipes = [
  {
    id: 'morning',
    title: '모닝 Why 체크',
    duration: '5분',
    frequency: '매일 아침',
    steps: [
      '오늘 하는 일의 목적 되새기기',
      '내 Why와 연결된 의도 설정',
      '하루 우선순위 재정렬'
    ],
    completed: false
  },
  {
    id: 'weekly',
    title: '주간 방향성 점검',
    duration: '15분',
    frequency: '매주 일요일',
    steps: [
      '지난 주 Why 실현도 평가',
      '다음 주 목표와 Why 정렬',
      '조정이 필요한 부분 식별'
    ],
    completed: true
  },
  {
    id: 'reflection',
    title: '저녁 성찰 시간',
    duration: '10분',
    frequency: '매일 저녁',
    steps: [
      '오늘의 행동과 Why 일치도 점검',
      '의미있었던 순간 기록',
      '내일의 Why 기반 계획 수립'
    ],
    completed: false
  }
];

export function ActionRecipeSection({ isPinned, onTogglePin, language }: ActionRecipeSectionProps) {
  const [recipeStates, setRecipeStates] = useState(
    recipes.reduce((acc, recipe) => ({
      ...acc,
      [recipe.id]: recipe.completed
    }), {})
  );

  const content = {
    ko: {
      title: '행동 레시피',
      description: '짧은 루틴',
      introTitle: 'Why를 일상에 녹여내기',
      introSubtitle: '목적의식을 실천으로 연결하는 구체적 방법',
      introDescription: '발견한 Why가 실제 삶을 변화시키려면 일상의 작은 습관과 루틴으로 연결되어야 합니다. 간단하지만 강력한 행동 레시피로 당신의 Why를 매일 실천해보세요.',
      introInsights: [
        'Why를 일상에 통합하는 실용적 방법',
        '지속가능한 습관 형성 전략',
        '목적의식을 유지하는 정기적 점검 시스템',
        '작은 행동으로 큰 변화를 만드는 레시피'
      ],
      startRoutine: '루틴 시작',
      markComplete: '완료 표시',
      progress: '진행 상황'
    },
    en: {
      title: 'Action Recipe',
      description: 'Short Routines',
      introTitle: 'Integrating Why into Daily Life',
      introSubtitle: 'Concrete methods to connect purpose with practice',
      introDescription: 'For your discovered Why to actually transform your life, it must be connected to small daily habits and routines. Practice your Why every day with simple but powerful action recipes.',
      introInsights: [
        'Practical methods to integrate Why into daily life',
        'Sustainable habit formation strategies',
        'Regular check systems to maintain purpose',
        'Recipes to create big changes through small actions'
      ],
      startRoutine: 'Start Routine',
      markComplete: 'Mark Complete',
      progress: 'Progress'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  const toggleRecipe = (recipeId: string) => {
    setRecipeStates(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  const completedCount = Object.values(recipeStates).filter(Boolean).length;

  return (
    <SectionBase
      id={7}
      title={text.title}
      description={text.description}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-6">
        {/* Chapter Intro */}
        <ChapterIntro
          icon={ChefHat}
          title={text.introTitle}
          subtitle={text.introSubtitle}
          description={text.introDescription}
          insights={text.introInsights}
          chapterNumber={7}
          language={language}
        />

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardHeader>
            <h4>{text.progress}</h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {recipes.map((recipe) => (
                <div key={recipe.id}>
                  <p className="text-sm text-muted-foreground mb-1">{recipe.title}</p>
                  <p className="text-lg font-bold">{recipe.completed ? '완료' : '진행 중'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Cards */}
        {recipes.map((recipe) => {
          const completionRate = recipe.completed ? 100 : 0;
          const isCompleted = completionRate === 100;
          
          return (
            <Card key={recipe.id} className={isCompleted ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Play className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <h4>{recipe.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{recipe.duration}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {recipe.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isCompleted ? 'default' : 'secondary'}>
                      {completionRate}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipe.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={`${recipe.id}-step-${stepIndex}`}
                      checked={recipe.completed}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`${recipe.id}-step-${stepIndex}`}
                      className={`text-sm cursor-pointer flex-1 ${
                        recipe.completed 
                          ? 'line-through text-muted-foreground' 
                          : ''
                      }`}
                    >
                      <span className="font-medium text-xs text-muted-foreground mr-2">
                        {stepIndex + 1}.
                      </span>
                      {step}
                    </label>
                  </div>
                ))}
                
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SectionBase>
  );
}