import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Minus, 
  Target, 
  Users, 
  Briefcase, 
  MapPin,
  Clock,
  Heart
} from 'lucide-react';

interface FuturePathSectionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  language: string;
  data?: any;
}

const pickRemoveIcon = (category?: string) => {
  if (!category) return Clock;
  if (category.includes('시간')) return Clock;
  if (category.includes('인간')) return Users;
  if (category.includes('업무')) return Briefcase;
  return Clock;
};

const pickStrengthenIcon = (category?: string) => {
  if (!category) return Target;
  if (category.includes('목표')) return Target;
  if (category.includes('동기')) return Heart;
  if (category.includes('환경')) return MapPin;
  return Target;
};

export function FuturePathSection({ isPinned, onTogglePin, language, data }: FuturePathSectionProps) {
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

  const envRemove = Array.isArray(data?.environment?.remove) ? data.environment.remove : [];
  const envStrengthen = Array.isArray(data?.environment?.strengthen) ? data.environment.strengthen : [];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="relative group">
        <div className="flex items-center justify-between pl-3 md:pl-0">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-medium">6</Badge>
            <div>
              <h2 className="text-2xl font-semibold">{text.title}</h2>
              <p className="text-muted-foreground mt-1">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2" />
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
          <CardContent className="space-y-6 -mx-6 md:mx-0">
            {(envRemove || []).map((factor: any, index: number) => {
              const Icon = pickRemoveIcon(factor?.category);
              return (
                <div key={index} className="px-6 md:px-0">
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-red-200 flex items-center justify-center flex-none">
                          <Icon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{factor.category}</h4>
                          {factor.impact && (
                            <p className="text-sm text-red-600">{factor.impact}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {(factor.items || []).slice(0,4).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-content-large text-muted-foreground">
                            <Minus className="h-3 w-3 text-red-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
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
          <CardContent className="space-y-6 -mx-6 md:mx-0">
            {(envStrengthen || []).map((factor: any, index: number) => {
              const Icon = pickStrengthenIcon(factor?.category);
              return (
                <div key={index} className="px-6 md:px-0">
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center flex-none">
                          <Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{factor.category}</h4>
                          {factor.impact && (
                            <p className="text-sm text-green-600">{factor.impact}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {(factor.items || []).slice(0,4).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-content-large text-muted-foreground">
                            <Plus className="h-3 w-3 text-green-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Implementation Roadmap — removed by request */}
    </div>
  );
}