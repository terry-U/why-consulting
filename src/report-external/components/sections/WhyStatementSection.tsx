import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Pin, PinOff, Link } from 'lucide-react';

interface WhyStatementSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any;
}

export function WhyStatementSection({ isPinned, onTogglePin, language, data }: WhyStatementSectionProps) {
  const [whySwitchOn, setWhySwitchOn] = useState(true);
  const [firstBlank, setFirstBlank] = useState('');
  const [secondBlank, setSecondBlank] = useState('');
  const [showWhy, setShowWhy] = useState(false);

  const content = {
    ko: {
      title: 'Why 한 문장',
      description: '스위치/서사/회고/기록',
      whyTitle: '나의 Why',
      whyOn: '사람과 사람 사이에 따뜻함이 흐르도록 구조를 만들고, 그 따뜻함이 서로의 하루에 자연스레 스며들게 한다.',
      whyOff: '나는 관계가 단절되고 차가운 무관심에서는 의미가 희미해지고, 숫자만 세게 된다.',
      narrative: `당신에게는 이런 일들이 있었지요. 숫자는 괜찮았는데도 마음이 비어 있던 날들, 반대로 유저가 "덕분에 오늘 하루가 달라졌어요"라고 남긴 한 줄 때문에 오래 미소 짓던 순간들. 동료가 "고마워요"라고 웃을 때, 에너지가 다시 차오른 경험. 깊은 밤 혼자 남아 복잡한 문제의 실마리를 끝내 찾아내며 "나는 해낼 수 있는 사람"이라는 믿음을 확인한 일. 그리고 mirrorboard 방향 전환이나, 작은 실험을 밀어붙이며 "사람들이 서로 만나는 결을 더 분명히 만들자"고 결심했던 때들.

그 이유는, 당신의 심장이 **'연결된 의미'**에 가장 크게 반응하기 때문이에요. 그래서 당신은 지표가 좋아도 얼굴이 보이지 않으면 공허했고, 누군가의 짧은 고마움 한마디에는 오래도록 따뜻해졌습니다. 그래서 그때 그렇게 행동했고(끝까지 버티고, 결국 길을 찾고, 사람에게 닿는 쪽으로 방향을 틀고), 그래서 그런 일들에 가슴 아파했고(연결이 끊긴 자리, 숫자만 남은 자리에서), 그래서 사람들이 서로 만나고 보람이 돌게 되는 세상을 꿨던 거예요.`,
      reflectionTitle: '어제 있었던 일을 잠깐 떠올려볼까요?',
      reflectionQuestions: [
        '어제, 일이 잘 풀렸던 장면을 떠올리면 누구의 얼굴이 함께 떠오르나요?\n그 순간에 당신의 에너지는 올라갔나요, 유지됐나요, 줄었나요?',
        '어제, "덕분에"라는 말을 직접 들었거나, 그렇게 말하고 싶었던 사람이 있었나요?\n그때 당신의 표정은 어땠는지 한 줄로 적어보세요.',
        '어제의 성과 중 숫자만 남고 마음이 비었던 일이 있었다면, 무엇이 빠져 있었나요?\n(얼굴? 목소리? 이야기의 맥락?)'
      ],
      oneLineRecordTitle: '한 줄 기록',
      oneLineTemplate: '어제 나는',
      oneLinePlaceholder1: '때문에',
      oneLinePlaceholder2: '해졌고',
      oneLinePlaceholder3: '때문에',
      oneLinePlaceholder4: '해졌다',
      checkButton: '확인',
      myWhyTitle: '나의 Why',
      finalQuestion: '어때요. 나의 Why와 비슷한 모습인가요?'
    },
    en: {
      title: 'Why Statement',
      description: 'Switch/Narrative/Reflection/Record',
      whyTitle: 'My Why',
      whyOn: 'I create structures that allow warmth to flow between people, letting that warmth naturally permeate each other\'s daily lives.',
      whyOff: 'When relationships are disconnected and there is cold indifference, meaning becomes dim and I only count numbers.',
      narrative: `You have had these experiences. Days when the numbers looked good but your heart felt empty, and conversely moments when you smiled for a long time because a user left a line saying "Thanks to you, my day was different today." When a colleague smiled and said "Thank you," the energy was recharged. Working alone late at night, finally finding the clue to a complex problem and confirming the belief that "I am someone who can do it." And times when you pushed forward with mirrorboard direction changes or small experiments, deciding to "make the texture of people meeting each other clearer."

The reason is that your heart responds most strongly to **'connected meaning'**. That's why you felt empty when the indicators were good but you couldn't see faces, and you were warmed for a long time by someone's short word of gratitude. That's why you acted that way (persevering to the end, eventually finding a way, turning toward reaching people), why you were heartbroken by those things (where connections were broken, where only numbers remained), and why you dreamed of a world where people meet each other and rewards circulate.`,
      reflectionTitle: 'Let\'s think about what happened yesterday for a moment?',
      reflectionQuestions: [
        'Yesterday, when you think of a scene where things went well, whose face comes to mind?\nDid your energy go up, stay the same, or decrease at that moment?',
        'Yesterday, was there someone you directly heard say "thanks to you" or someone you wanted to say that to?\nDescribe in one line what your expression was like then.',
        'If there was work yesterday where only numbers remained and your heart felt empty, what was missing?\n(Face? Voice? Context of the story?)'
      ],
      oneLineRecordTitle: 'One-Line Record',
      oneLineTemplate: 'Yesterday I',
      oneLinePlaceholder1: 'because of',
      oneLinePlaceholder2: 'became',
      oneLinePlaceholder3: 'because of',
      oneLinePlaceholder4: 'became',
      checkButton: 'Check',
      myWhyTitle: 'My Why',
      finalQuestion: 'How about it. Does this look similar to my Why?'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  // API 데이터 매핑
  const apiHeadline: string | undefined = data?.headline || undefined;
  const apiOff: string | undefined = data?.off_why_main || undefined;
  const apiNarrative: string | undefined = Array.isArray(data?.narrative)
    ? (data.narrative as string[]).join('\n\n')
    : undefined;
  const apiQuestions: string[] | undefined = Array.isArray(data?.reflection_questions)
    ? (data.reflection_questions as string[])
    : undefined;

  const handleCheck = () => {
    if (firstBlank.trim() && secondBlank.trim()) {
      setShowWhy(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">0</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              {text.description && (
                <p className="text-muted-foreground mt-1">{text.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2" />
        </div>
      </div>

      {/* Why Switch */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{text.whyTitle}</h3>
            <div className="flex items-center gap-3">
              <Switch
                checked={whySwitchOn}
                onCheckedChange={setWhySwitchOn}
                aria-label="Toggle Why mode"
              />
              <Badge variant={whySwitchOn ? 'default' : 'secondary'} className="font-medium">
                {whySwitchOn ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <blockquote className="text-xl leading-relaxed border-l-4 border-primary/30 pl-6 font-medium">
            "{apiHeadline || text.whyOn}"
          </blockquote>
          { (apiOff || text.whyOff) && (
            <div className="mt-3">
              <blockquote className="text-base leading-relaxed border-l-4 border-muted/30 pl-6 text-muted-foreground">
                "{apiOff || text.whyOff}"
              </blockquote>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Narrative */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold">당신의 이야기</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg leading-relaxed whitespace-pre-line">
            {apiNarrative || text.narrative}
          </div>
        </CardContent>
      </Card>

      {/* Reflection Questions */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold">{text.reflectionTitle}</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            {(apiQuestions || text.reflectionQuestions).map((question, index) => (
              <div key={index} className="p-6 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <p className="text-lg leading-relaxed whitespace-pre-line">
                    {question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* One-Line Record */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold">{text.oneLineRecordTitle}</h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-xl overflow-hidden">
              <span className="font-medium">"{text.oneLineTemplate}</span>
              <Input
                value={firstBlank}
                onChange={(e) => setFirstBlank(e.target.value)}
                placeholder="____"
                className="inline-flex min-w-0 w-[140px] text-center text-lg font-medium border-2 border-dashed border-primary/30"
              />
              <span>{text.oneLinePlaceholder1}</span>
              <Input
                value={secondBlank}
                onChange={(e) => setSecondBlank(e.target.value)}
                placeholder="____"
                className="inline-flex min-w-0 w-[140px] text-center text-lg font-medium border-2 border-dashed border-primary/30"
              />
              <span className="font-medium">{text.oneLinePlaceholder2}."</span>
            </div>
            
            <div className="flex justify-start">
              <Button 
                onClick={handleCheck}
                disabled={!firstBlank.trim() || !secondBlank.trim()}
                className="px-8 py-3 text-lg font-medium"
                size="lg"
              >
                {text.checkButton}
              </Button>
            </div>

            {/* My Why and Final Question (always shown after record) */}
            <div className="space-y-6 pt-6 border-t border-border">
              <div>
                <h4 className="text-lg font-semibold mb-4">{text.myWhyTitle}</h4>
                <blockquote className="text-xl leading-relaxed p-6 border-l-4 border-primary/30 bg-muted/30 rounded-r-lg font-medium">
                  "{apiHeadline || text.whyOn}"
                </blockquote>
              </div>
              
              <div>
                <p className="text-lg leading-relaxed text-muted-foreground font-medium">
                  {text.finalQuestion}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}