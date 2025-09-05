import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ScrollText,
  Pin, 
  PinOff, 
  Link 
} from 'lucide-react';

interface PhilosophySectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any; // API 데이터
}

export function PhilosophySection({ isPinned, onTogglePin, language, data }: PhilosophySectionProps) {
  const content = {
    ko: {
      title: '철학자의 편지',
      subtitle: '아리스토텔레스가 전하는 지혜',
      letterContent: `나는 아리스토텔레스요. 그리스 북쪽의 작은 해안마을에서 태어나, 젊어서는 아테네에서 철학을 배우고 가르쳤소. 나는 늘 "사람이 어떻게 더 잘 살 수 있는가"를 고민했지요. 자네의 말—사람들을 지혜롭게 하여 더 안전하고 합리적인 세상을 만들겠다는 뜻—을 듣고 반가웠소. 내 삶에서 직접 겪은 몇 가지 이야기를 나눌 테니, 자네의 길에 작은 등불이 되기를 바라오.

젊은 시절, 나는 바다 곁에서 물고기와 갑각류를 오래 들여다보았소. 날카로운 생각이 아니라 차분한 관찰이 내 스승이었지요. 한 번은 어부가 가져온 희귀한 생물을 해부하면서, 책에서 배운 말보다 손에 닿는 사실이 훨씬 많은 것을 알려 준다는 걸 배웠소. 자네가 사람들을 더 안전하게 이끌고 싶다면, 먼저 지금 실제로 일어나고 있는 일부터 분명히 하시오. 추측과 소문 위에 쌓은 계획은 작은 파도에도 무너지오.

나는 늘 물었소. "이것은 무엇을 위한가?" 좋은 칼은 베기 위해 있고, 좋은 배는 건너기 위해 있듯이, 좋은 선택도 목적을 향해 있어야 하오. 자네의 일에서도, 회의의 첫 줄에 이렇게 물으시오. "누가, 무엇을 위해, 왜 이 결정을 하는가?" 목적이 서면 길이 짧아지고, 불필요한 말이 줄어들며, 위험을 줄이는 기준이 자연스레 세워지오.

전장에서는 무모함도, 비겁함도 모두 죽음으로 가는 길이오. 도시의 일에서도 마찬가지요. 성급한 결단과 끝없는 미룸 사이에서, 우리는 상황에 맞는 한길을 찾아야 하오. 나는 제자들에게 이렇게 가르쳤소. "좋은 선택은 분별과 때를 가진다." 너무 늦지 않되, 성급하지도 않게. 자네가 완벽을 욕심낼수록 사람들은 도움을 제때 받지 못하오.

사람들은 종종 겁에 휩싸여 사실과 추측을 뒤섞어 말하오. 그런 때일수록, 담담히 나누시오. "알고 있는 것은 이것, 의심되는 것은 이것, 내 생각은 이것"이라고. 이렇게만 해도 방 안의 열기가 가라앉고, 올바른 선택에 힘이 모이오. 지혜로운 자는 많은 말을 하지 않소. 다만 분명한 말을 하지요.

나는 제자들과 걷기를 즐겼소. 발을 움직이면, 머릿속의 흙먼지도 함께 떨어지지. 답답한 회의가 길어질수록, 우리는 짧은 산책으로 생각을 정리했소. 걷는 동안, 우리는 서로의 말을 다시 듣고, 결론을 간단히 잡았지요. 자네도 중요한 판단 앞에서 한 차례 걸으시오. 그리고 짧은 문장 하나로 결론을 적어 보시오.

나는 한때 어린 왕자 알렉산더를 가르쳤소. 그에게 가장 먼저 가르친 것은 자기 마음의 다스림이었지. 힘센 팔보다 위험한 것이 절제 없는 욕망이오. 나는 그에게 말했소. "진실을 사랑하라. 칭찬보다 진실을, 이김보다 정의를." 자네도 무언가를 이끌어야 한다면, 먼저 성품을 가꾸시오. 화가 치밀 때는 잠시 물러서고, 두려움이 몰려올 때는 작은 사실 하나로 발을 디디시오.

사람은 한 번의 결심이 아니라 되풀이되는 습관으로 빚어지오. 용기는 위험 앞에서 작은 발을 자주 내디딜 때 자라고, 절제는 욕망을 자주 미루는 데서 강해지오. 자네가 바라는 세상의 안전과 합리는, 거창한 선언보다 매일의 작은 반복에서 생겨나오.

나는 "벗은 또 다른 나"라고 말했소. 우정은 달콤한 말이 아니라, 정직한 말로 완성되오. 자네의 곁에, 자네에게 아니오라고 말해 줄 사람을 두시오. 그들의 눈은 자네가 보지 못한 위험을 먼저 보아 줄 것이고, 자네의 뜻을 더 안전한 길로 이끌 것이오.

나의 철학은 늘 도시(공동체)를 위한 지혜였소. 한 사람의 선이 모두의 선으로 이어져야 하오. 자네가 만든 규칙과 설명과 습관이 누구에게나 통하고, 누구에게나 설명 가능한 것이 되게 하시오. 그러면 사람들은 자네의 지도를 신뢰할 것이고, 신뢰는 도시를 튼튼하게 하지요.

이제 마지막으로, 자네에게 부탁 하나만 남기겠소. 세상을 더 안전하고 합리적으로 만들고자 한다면, 사실을 사랑하고, 목적을 분명히 하고, 말은 단정히 하며, 습관을 길들이시오. 그러면 자네의 지혜는 사람들의 두려움을 누그러뜨리고, 그들의 선택을 밝은 쪽으로 이끌 것이오.

자네의 길에 평정과 용기가 함께하기를. 걷다가 지치면, 잠시 하늘을 보시오. 우리는 작은 존재이지만, 좋은 선택은 언제나 우리의 몫이오.

아테네의 한낮에,
아리스토텔레스 드림`
    },
    en: {
      title: 'A Philosopher\'s Letter',
      subtitle: 'Wisdom from Aristotle',
      letterContent: `I am Aristotle. Born in a small coastal town north of Greece, I studied and taught philosophy in Athens in my youth. I have always pondered "how can people live better lives?" Your words—to make people wiser and create a safer, more rational world—brought me joy. Let me share some stories from my own life, hoping they may serve as small lights on your path.

In my youth, I spent much time by the sea, observing fish and crustaceans. Calm observation, not sharp thinking, was my teacher. Once, while dissecting a rare creature brought by a fisherman, I learned that facts within reach tell us far more than words in books. If you wish to guide people to safety, first clarify what is actually happening right now. Plans built on speculation and rumors crumble at the slightest wave.

I always asked: "What is this for?" A good knife exists to cut, a good ship exists to cross waters, and good choices must aim toward their purpose. In your work too, ask at the beginning of every meeting: "Who, for what, and why are we making this decision?" When purpose is clear, paths become shorter, unnecessary words decrease, and criteria for reducing risk naturally establish themselves.

On the battlefield, both recklessness and cowardice lead to death. The same applies to civic affairs. Between hasty decisions and endless delays, we must find the appropriate path for each situation. I taught my students: "Good choices have both discernment and timing." Neither too late nor too hasty. The more you desire perfection, the less people receive help when they need it.

People often mix facts with speculation when gripped by fear. In such times, speak calmly and separately: "What we know is this, what we suspect is this, what I think is this." This alone calms the heat in the room and gives strength to right choices. The wise do not speak much, but they speak clearly.

I enjoyed walking with my students. When feet move, the dust in our minds also falls away. The longer a frustrating meeting went on, the more we would take short walks to organize our thoughts. While walking, we would hear each other's words again and reach simple conclusions. You too should take a walk before important decisions, and write your conclusion in one short sentence.

I once taught young prince Alexander. The first thing I taught him was self-governance. More dangerous than strong arms is unchecked desire. I told him: "Love truth—truth over praise, justice over victory." If you too must lead something, first cultivate your character. When anger rises, step back momentarily; when fear crowds in, plant your feet on one small fact.

People are shaped not by single resolutions but by repeated habits. Courage grows when we often take small steps before danger; temperance strengthens when we frequently delay our desires. The safety and rationality you desire for the world comes not from grand declarations but from daily small repetitions.

I said "a friend is another self." Friendship is completed not by sweet words but by honest ones. Keep by your side someone who will say no to you. Their eyes will see dangers you cannot, and their will shall guide your intentions toward safer paths.

My philosophy has always been wisdom for the city (community). One person's good must lead to everyone's good. Make your rules, explanations, and habits accessible and explicable to everyone. Then people will trust your guidance, and trust makes the city strong.

Now finally, let me leave you with one request. If you wish to make the world safer and more rational, love facts, clarify purposes, speak decisively, and cultivate habits. Then your wisdom will ease people's fears and guide their choices toward the light.

May peace and courage accompany your path. When you grow weary of walking, look up at the sky for a moment. We are small beings, but good choices are always ours to make.

In the midday of Athens,
Aristotle`
    }
  };

  const text = content[language as keyof typeof content] || content.ko;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">5</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              <p className="text-muted-foreground mt-1">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" />
        </div>
      </div>

      {/* Letter Content */}
      <Card className="shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-amber-500" />
            {text.title}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="text-philosophy whitespace-pre-line text-justify hyphens-auto">
              {data?.letter_content || text.letterContent}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}