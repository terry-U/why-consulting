import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Pin, PinOff, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TableOfContentsProps {
  language: string;
  pinnedSections: number[];
  onClose?: () => void;
}

const sections = {
  ko: [
    { id: 0, title: 'Why 한 문장', description: '스위치/서사/회고/기록' },
    { id: 1, title: '밸류맵', description: '머리vs가슴, 간극 코멘트' },
    { id: 2, title: '스타일 패턴', description: '맞음/소모/성장 카드' },
    { id: 3, title: '마스터–매니저', description: '2축 스펙트럼 차트' },
    { id: 4, title: '빛·그림자 지도', description: '강점과 약점 매핑' },
    { id: 5, title: '핵심 철학', description: '실용적 6가지 원칙' },
    { id: 6, title: 'Why 극대화 환경', description: '제거와 강화 관점' },
  ],
  en: [
    { id: 0, title: 'Why Statement', description: 'Switch/Narrative/Reflection/Record' },
    { id: 1, title: 'Value Map', description: 'Head vs Heart, Gap Comments' },
    { id: 2, title: 'Style Patterns', description: 'Fit/Drain/Growth Cards' },
    { id: 3, title: 'Master–Manager', description: '2-Axis Spectrum Chart' },
    { id: 4, title: 'Light·Shadow Map', description: 'Strengths & Weaknesses' },
    { id: 5, title: 'Core Philosophy', description: '6 Practical Principles' },
    { id: 6, title: 'Why Maximization Environment', description: 'Remove & Strengthen Approach' },
  ]
};

export function TableOfContents({ language, pinnedSections, onClose }: TableOfContentsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentSections = sections[language as keyof typeof sections] || sections.ko;

  const scrollToSection = (sectionId: number) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile TOC after navigation
      if (onClose) {
        onClose();
      }
    }
  };

  // Mobile version (full screen overlay)
  if (onClose) {
    return (
      <aside className="w-full h-full bg-card">
        <Card className="h-full rounded-none border-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">목차</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0"
                aria-label="목차 닫기"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <nav className="space-y-1 p-4" role="navigation" aria-label="Report sections">
              {currentSections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 text-left hover:bg-accent"
                  onClick={() => scrollToSection(section.id)}
                  aria-describedby={`section-${section.id}-desc`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">
                      {section.id}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{section.title}</h3>
                        {pinnedSections.includes(section.id) && (
                          <Pin className="h-4 w-4 text-primary shrink-0 ml-2" />
                        )}
                      </div>
                      <p 
                        id={`section-${section.id}-desc`}
                        className="text-sm text-muted-foreground mt-1"
                      >
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </Card>
      </aside>
    );
  }

  // Desktop collapsed version
  if (isCollapsed) {
    return (
      <aside className="fixed left-0 top-0 z-40 w-16 h-screen bg-card border-r border-border">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 p-0"
            aria-label="Expand navigation"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 px-2">
          {currentSections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection(section.id)}
              className="w-full h-8 p-0 relative"
              aria-label={`Go to ${section.title}`}
            >
              <span className="text-xs">{section.id}</span>
              {pinnedSections.includes(section.id) && (
                <Pin className="h-2 w-2 absolute top-1 right-1 text-primary" />
              )}
            </Button>
          ))}
        </div>
      </aside>
    );
  }

  // Desktop expanded version
  return (
    <aside className="fixed left-0 top-0 z-40 w-80 h-screen bg-card border-r border-border">
      <Card className="h-full rounded-none border-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">목차</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 p-0"
              aria-label="Collapse navigation"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4">
          <nav className="space-y-2 py-4" role="navigation" aria-label="Report sections">
            {currentSections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left hover:bg-accent"
                onClick={() => scrollToSection(section.id)}
                aria-describedby={`section-${section.id}-desc`}
              >
                <div className="flex items-start gap-3 w-full">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">
                    {section.id}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{section.title}</h3>
                      {pinnedSections.includes(section.id) ? (
                        <Pin className="h-4 w-4 text-primary shrink-0 ml-2" />
                      ) : (
                        <PinOff className="h-4 w-4 text-muted-foreground shrink-0 ml-2 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                    <p 
                      id={`section-${section.id}-desc`}
                      className="text-sm text-muted-foreground mt-1"
                    >
                      {section.description}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </Card>
    </aside>
  );
}