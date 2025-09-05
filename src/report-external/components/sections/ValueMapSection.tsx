import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Brain, Heart, ArrowLeftRight, Lightbulb, CheckCircle, Pin, PinOff, Link } from 'lucide-react';

interface ValueMapSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any;
}

const valueConflicts = [
  {
    id: 1,
    head: "지표가 중요하다",
    heart: "사람의 표정과 감사가 더 오래 남는다",
    gap: "간극 큼",
    gapLevel: "high",
    headDetail: "성과는 숫자로 증명돼야 해요.",
    heartDetail: "유저의 '덕분에', 동료의 '고마워요'가 제일 크게 와닿아요.",
    scene: "숫자는 좋았는데도 마음이 비었던 날이 있었습니다. 반대로, 짧은 감사 한 줄을 보고 오래 미소 지으셨지요. 숫자만 있을 때와, 얼굴·한마디가 있을 때의 온도 차가 분명했습니다.",
    bridge: "성과 문서에 '얼굴/한마디/맥락' 한 칸을 고정하세요."
  },
  {
    id: 2,
    head: "혼자 끝까지 책임진다",
    heart: "중간을 나누면 기운이 다시 찬다",
    gap: "간극 보통",
    gapLevel: "medium",
    headDetail: "끝을 봐야 마음이 놓여요.",
    heartDetail: "중간을 공유하고 '고마워요'를 들을 때 다시 힘이 납니다.",
    scene: "밤에 혼자 버틸 땐 확신은 생겼지만 기운이 빠지기도 했습니다. 중간을 나눴을 땐 안도와 따뜻함이 돌아왔습니다.",
    bridge: "매주 10분 중간 공유를 캘린더에 고정해 보세요. \"여기까지 했어요\" 한 줄이면 충분합니다."
  },
  {
    id: 3,
    head: "완성도가 중요하다",
    heart: "작게 빨리 실험하면 더 좋아진다",
    gap: "간극 작음·잘 맞음",
    gapLevel: "low",
    headDetail: "완성도를 높여야 해요.",
    heartDetail: "작게 시험하고 필요하면 방향을 바꿀 때 살아납니다.",
    scene: "작게-빨리가 오히려 좋은 완성도로 갔습니다. 작은 실험 → 배움 → 전환이 잘 맞았습니다.",
    bridge: "1주 1실험. 가설 1개, 사용자 1명, 결과 1줄."
  },
  
];

const todayActions = [
  "문서에 '얼굴/한마디/맥락' 칸을 하나 추가합니다.",
  "진행 중인 화면을 스크린샷 1장과 함께 \"여기까지 했습니다\"로 공유합니다.",
  "다음 데모에 사용자 변화 1문장을 미리 붙입니다."
];

export function ValueMapSection({ isPinned, onTogglePin, language, data }: ValueMapSectionProps) {
  const content = {
    ko: {
      title: '밸류맵',
      subtitle: '머리와 마음 사이',
      description: '머리vs가슴, 간극 코멘트',
      whatTitle: '이 페이지는 무엇을 하나요?',
      whatDescription: '내가 중요하다고 믿는 말(머리)과, 실제 순간에 진하게 느낀 것(마음)을 나란히 보여드립니다. 옳고 그름을 가르는 표가 아닙니다. 차이를 알아차려서 다음 선택을 더 편하게 하려는 지도입니다.',
      howTitle: '이렇게 보시면 편합니다',
      howSteps: [
        '제목의 머리 ↔ 마음을 먼저 읽으세요.',
        '장면 해설에서 "그때 나는 이렇게 느꼈지"를 떠올려 보세요.',
        '마지막의 작은 다리 중 하나만 오늘 일정에 붙여 보세요.'
      ],
      head: '머리',
      heart: '마음',
      sceneTitle: '장면 해설',
      bridgeTitle: '작은 다리',
      todayTitle: '오늘, 여기서 한 걸음'
    },
    en: {
      title: 'Value Map',
      subtitle: 'Between Head and Heart',
      description: 'Head vs Heart, Gap Comments',
      whatTitle: 'What does this page do?',
      whatDescription: 'It shows side by side what I believe is important (head) and what I actually felt deeply in real moments (heart). This is not a table for judging right and wrong. It\'s a map to notice differences and make next choices more comfortably.',
      howTitle: 'Here\'s how to view it comfortably',
      howSteps: [
        'First read the head ↔ heart in the title.',
        'Recall "that\'s how I felt then" from the scene descriptions.',
        'Pick just one small bridge to attach to today\'s schedule.'
      ],
      head: 'Head',
      heart: 'Heart',
      sceneTitle: 'Scene Description',
      bridgeTitle: 'Small Bridge',
      todayTitle: 'Today, One Step From Here'
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  // API 데이터 매핑
  const apiItems: Array<any> | undefined = Array.isArray(data?.items) ? data.items.slice(0,3) : undefined;
  const apiToday: string[] | undefined = Array.isArray(data?.today_actions) ? data.today_actions : undefined;

  const getGapColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">1</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              <p className="text-muted-foreground mt-1">{text.subtitle}</p>
              {text.description && (
                <p className="text-muted-foreground">{text.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                const element = document.getElementById('section-1');
                if (element) {
                  navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#section-1`);
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

      {/* What & How Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <h3 className="text-xl font-semibold">{text.whatTitle}</h3>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-content-large">
              {text.whatDescription}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <h3 className="text-xl font-semibold">{text.howTitle}</h3>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-3">
              {text.howSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-content-large">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Value Conflicts */}
      <div className="space-y-8">
        {(apiItems || valueConflicts).map((conflict: any, i: number) => {
          const gapLabel = conflict.gap || (conflict.gapLevel === 'high' ? '간극 큼' : conflict.gapLevel === 'medium' ? '간극 보통' : '간극 작음·잘 맞음');
          const key = conflict.id ?? i;
          return (
          <Card key={key} className="shadow-lg">
            {/* Main Conflict Header */}
            <CardHeader>
              <div className="space-y-4">
                {/* Head vs Heart with Gap */}
                <div className="flex items-center justify-between gap-3 overflow-hidden">
                  <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Brain className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-xl font-semibold break-words whitespace-normal leading-snug max-w-full">{conflict.head}</span>
                    </div>
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <Heart className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span className="text-xl font-semibold break-words whitespace-normal leading-snug max-w-full">{conflict.heart}</span>
                    </div>
                  </div>
                  <Badge className={`${getGapColor(conflict.gapLevel)} font-medium flex-shrink-0`}>
                    {gapLabel}
                  </Badge>
                </div>

                {/* Head vs Heart Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border-2 border-blue-500 w-full md:w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <p className="font-semibold text-blue-800 dark:text-blue-200">{text.head}는</p>
                    </div>
                    <p className="text-lg leading-relaxed">"{conflict.headDetail}"</p>
                  </div>
                  <div className="p-4 rounded-lg border-2 border-red-500 w-full md:w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <p className="font-semibold text-red-800 dark:text-red-200">{text.heart}은</p>
                    </div>
                    <p className="text-value-item">"{conflict.heartDetail}"</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Scene Description */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  📖 {text.sceneTitle}
                </h4>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {conflict.scene}
                  </p>
                </div>
                
                {/* Bridge content moved directly under scene */}
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                  <p className="text-lg leading-relaxed text-green-800 dark:text-green-200 font-medium">
                    💡 {conflict.bridge}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      {/* Today's Actions */}
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {text.todayTitle}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {(apiToday || todayActions).map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="leading-relaxed">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}