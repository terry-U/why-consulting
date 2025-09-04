import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { LucideIcon } from 'lucide-react';

interface ChapterIntroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  insights: string[];
  chapterNumber: number;
  language: string;
}

export function ChapterIntro({ 
  icon: Icon, 
  title, 
  subtitle, 
  description, 
  insights, 
  chapterNumber, 
  language 
}: ChapterIntroProps) {
  const labels = {
    ko: {
      chapter: '챕터',
      whatYouGet: '이 챕터에서 얻을 수 있는 것',
      insights: '핵심 인사이트'
    },
    en: {
      chapter: 'Chapter',
      whatYouGet: 'What you will discover',
      insights: 'Key Insights'
    }
  };

  const text = labels[language as keyof typeof labels] || labels.ko;

  return (
    <Card className="mb-6 bg-gradient-to-br from-muted/30 to-muted/10 border-muted">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon and Chapter Badge */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs">
              {text.chapter} {chapterNumber}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <h3 className="text-xl mb-1">{title}</h3>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>

            <p className="leading-relaxed mb-4">{description}</p>

            {/* Key Insights */}
            <div>
              <h4 className="text-sm mb-2 text-muted-foreground">{text.insights}:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm p-2 rounded-md bg-background/60"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}