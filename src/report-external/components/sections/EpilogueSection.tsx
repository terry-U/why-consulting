import { SectionBase } from '../SectionBase';
import { ChapterIntro } from '../ChapterIntro';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Star, Download, Share2, BookOpen, Flag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface EpilogueSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any;
}

const defaultInsights = [
  {
    category: 'discovery',
    title: 'Why 발견',
    description: '당신의 진정한 목적을 명확히 했습니다',
    score: 85
  },
  {
    category: 'alignment',
    title: '가치 정렬',
    description: '개인 가치와 행동의 일치도를 높였습니다',
    score: 78
  },
  {
    category: 'growth',
    title: '성장 방향',
    description: '앞으로의 발전 경로를 설계했습니다',
    score: 72
  }
];

export function EpilogueSection({ isPinned, onTogglePin, language, data }: EpilogueSectionProps) {
  const content = {
    ko: {
      title: '에필로그',
      description: '마무리와 요약',
      introTitle: '여정의 마무리, 새로운 시작',
      introSubtitle: '발견한 Why로 시작하는 의미있는 삶',
      introDescription: '이 보고서를 통해 당신의 Why를 탐구하는 여정이 마무리되었습니다. 하지만 이것은 끝이 아니라 진정한 시작입니다. 발견한 통찰들을 바탕으로 더 의미있고 목적이 명확한 삶을 시작해보세요.',
      introInsights: [
        '전체 여정에서 얻은 핵심 깨달음 정리',
        '개인적 성장과 변화의 증거 확인',
        '앞으로의 실천 방향과 지속 방법',
        'Why 기반 삶의 새로운 출발점 설정'
      ],
      journeySummary: '여정 요약',
      keyInsights: '핵심 인사이트',
      nextSteps: '다음 단계',
      overallScore: '전체 점수',
      overallProgress: '전반적 진행도',
      downloadReport: '보고서 다운로드',
      shareJourney: '여정 공유하기',
      continueGrowth: '성장 계속하기',
      reflection: '이 여정을 통해 당신은 자신의 진정한 Why를 발견하고, 그것을 일상에 적용하는 방법을 배웠습니다. 이제 이 깨달음을 바탕으로 더 의미있는 선택과 행동을 만들어가세요.',
      actionItems: [
        '매일 아침 Why 확인 루틴 실천하기',
        '주요 결정 시 Why와의 일치도 점검하기',
        '월 1회 Why 실현도 자가 점검하기',
        '발견한 인사이트를 가족, 동료와 공유하기'
      ]
    },
    en: {
      title: 'Epilogue',
      description: 'Closing & Summary',
      introTitle: 'End of the Journey, New Beginning',
      introSubtitle: 'Starting a meaningful life with your discovered Why',
      introDescription: 'Your journey to explore your Why through this report has concluded. However, this is not an end but a true beginning. Start living a more meaningful and purpose-driven life based on the insights you\'ve discovered.',
      introInsights: [
        'Organizing key realizations from the entire journey',
        'Confirming evidence of personal growth and change',
        'Direction for future practice and continuity methods',
        'Setting a new starting point for Why-based living'
      ],
      journeySummary: 'Journey Summary',
      keyInsights: 'Key Insights',
      nextSteps: 'Next Steps',
      overallScore: 'Overall Score',
      overallProgress: 'Overall Progress',
      downloadReport: 'Download Report',
      shareJourney: 'Share Journey',
      continueGrowth: 'Continue Growing',
      reflection: 'Through this journey, you have discovered your true Why and learned how to apply it to daily life. Now, create more meaningful choices and actions based on this realization.',
      actionItems: [
        'Practice daily morning Why check routine',
        'Check alignment with Why when making major decisions',
        'Conduct monthly self-assessment of Why realization',
        'Share discovered insights with family and colleagues'
      ]
    }
  };

  const text = content[language as keyof typeof content] || content.ko;
  const insights: Array<{ title: string; description: string; score: number }> = Array.isArray(data?.insights)
    ? data.insights.map((i: any) => ({
        title: typeof i?.title === 'string' ? i.title : '',
        description: typeof i?.description === 'string' ? i.description : '',
        score: Number.isFinite(Number(i?.score)) ? Number(i.score) : 0
      }))
    : defaultInsights;
  const overallScore = typeof data?.overall_score === 'number'
    ? data.overall_score
    : Math.round(insights.reduce((sum, insight) => sum + insight.score, 0) / insights.length);
  const actionItems: string[] = Array.isArray(data?.action_items) && data.action_items.length
    ? data.action_items
    : text.actionItems;
  const reflection: string = typeof data?.reflection === 'string' && data.reflection.length
    ? data.reflection
    : text.reflection;

  const handleExport = () => {
    toast.success('보고서 PDF 내보내기가 시작되었습니다');
  };

  const handleShare = () => {
    toast.success('보고서가 공유되었습니다');
  };

  return (
    <SectionBase
      id={9}
      title={text.title}
      description={text.description}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-6">
        {/* Chapter Intro */}
        <ChapterIntro
          icon={Flag}
          title={text.introTitle}
          subtitle={text.introSubtitle}
          description={text.introDescription}
          insights={text.introInsights}
          chapterNumber={9}
          language={language}
        />

        {/* Overall Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-chart-1/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h4>{text.overallProgress}</h4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/30"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${(overallScore / 100) * 339.29} 339.29`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{overallScore}%</span>
                </div>
              </div>
              <p className="text-muted-foreground">전반적 완성도</p>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <h4>{text.keyInsights}</h4>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{insight.title}</h5>
                  <Badge variant="secondary">{insight.score}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                <Progress value={insight.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500" />
              <h4>{text.nextSteps}</h4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Badge variant="outline" className="shrink-0 mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                PDF로 저장
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                결과 공유
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Final Reflection */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-4 text-purple-500" />
            <p className="text-lg italic text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-line">
              {reflection}
            </p>
          </CardContent>
        </Card>
      </div>
    </SectionBase>
  );
}