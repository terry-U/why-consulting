import { useState } from 'react';
import { SectionBase } from '../SectionBase';
import { ChapterIntro } from '../ChapterIntro';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Sparkles, Calendar, BookOpen, Edit3, Play } from 'lucide-react';

interface PrologueSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
}

export function PrologueSection({ isPinned, onTogglePin, language }: PrologueSectionProps) {
  const [whySwitchOn, setWhySwitchOn] = useState(true);
  const [dailyReflection, setDailyReflection] = useState('오늘은 새로운 가능성을 발견했다. 내가 정말 원하는 것이 무엇인지 조금 더 명확해졌다.');
  const [oneLineRecord, setOneLineRecord] = useState('Purpose drives everything I do');

  const content = {
    ko: {
      title: '프롤로그',
      description: '히어로, Why 스위치, 서사',
      heroTitle: '당신만의 Why를 찾는 여정',
      heroSubtitle: '진정한 목적을 발견하고 삶의 방향을 명확히 하세요',
      whySwitch: 'Why 모드',
      narrative: '서사',
      yesterdayReflection: '어제 회고',
      oneLineNote: '한 줄 기록',
      narrativeContent: '모든 위대한 여정은 질문으로 시작됩니다. "나는 왜 이것을 하는가?" 이 보고서는 당신의 깊은 동기와 진정한 목적을 탐구하는 여정의 기록입니다.',
      introTitle: '여정의 시작',
      introSubtitle: 'Why를 찾기 위한 첫 번째 단계',
      introDescription: '모든 의미 있는 변화는 자신에게 질문을 던지는 것에서 시작됩니다. 이 챕터에서는 당신의 Why 탐구 여정을 위한 마음가짐과 도구를 준비합니다.',
      introInsights: [
        'Why 모드 활성화로 깊이 있는 자기 탐구',
        '일상의 반성과 기록을 통한 인사이트 발굴',
        '여정의 목적과 방향성 설정',
        '진정성 있는 자기 서사 구성'
      ]
    },
    en: {
      title: 'Prologue',
      description: 'Hero, Why Switch, Narrative',
      heroTitle: 'Your Journey to Finding Why',
      heroSubtitle: 'Discover your true purpose and clarify your life direction',
      whySwitch: 'Why Mode',
      narrative: 'Narrative',
      yesterdayReflection: 'Yesterday\'s Reflection',
      oneLineNote: 'One-Line Record',
      narrativeContent: 'Every great journey begins with a question: "Why do I do this?" This report chronicles your journey to explore deep motivations and discover your true purpose.',
      introTitle: 'The Beginning of the Journey',
      introSubtitle: 'First step to finding your Why',
      introDescription: 'Every meaningful change begins with asking questions. This chapter prepares your mindset and tools for your Why exploration journey.',
      introInsights: [
        'Deep self-exploration through Why mode activation',
        'Insight discovery through daily reflection and recording',
        'Setting purpose and direction for the journey',
        'Constructing an authentic personal narrative'
      ]
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  return (
    <SectionBase
      id={0}
      title={text.title}
      description={text.description}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-6">
        {/* Chapter Intro */}
        <ChapterIntro
          icon={Play}
          title={text.introTitle}
          subtitle={text.introSubtitle}
          description={text.introDescription}
          insights={text.introInsights}
          chapterNumber={0}
          language={language}
        />

        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-chart-1/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl mb-2">{text.heroTitle}</h3>
            <p className="text-muted-foreground">{text.heroSubtitle}</p>
          </CardContent>
        </Card>

        {/* Why Switch */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4>{text.whySwitch}</h4>
                <Badge variant={whySwitchOn ? 'default' : 'secondary'}>
                  {whySwitchOn ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <Switch
                checked={whySwitchOn}
                onCheckedChange={setWhySwitchOn}
                aria-label="Toggle Why mode"
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {whySwitchOn 
                ? '깊은 동기 탐구 모드가 활성화되었습니다.' 
                : '표면적 분석 모드입니다. Why 모드를 켜보세요.'
              }
            </p>
          </CardContent>
        </Card>

        {/* Narrative */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h4>{text.narrative}</h4>
            </div>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{text.narrativeContent}</p>
          </CardContent>
        </Card>

        {/* Yesterday's Reflection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h4>{text.yesterdayReflection}</h4>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={dailyReflection}
              onChange={(e) => setDailyReflection(e.target.value)}
              placeholder="어제의 깨달음이나 반성을 기록해보세요..."
              className="min-h-20"
            />
          </CardContent>
        </Card>

        {/* One-Line Record */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              <h4>{text.oneLineNote}</h4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Textarea
                value={oneLineRecord}
                onChange={(e) => setOneLineRecord(e.target.value)}
                placeholder="오늘의 핵심 한 줄..."
                className="min-h-12 resize-none"
                rows={1}
              />
              <Button variant="outline" size="sm" className="shrink-0">
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionBase>
  );
}