import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';

interface SectionBaseProps {
  id: number;
  title: string;
  description?: string;
  isPinned: boolean;
  onTogglePin: () => void;
  children: ReactNode;
  className?: string;
}

export function SectionBase({ 
  id, 
  title, 
  description, 
  isPinned, 
  onTogglePin, 
  children, 
  className = '' 
}: SectionBaseProps) {
  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="pb-4 pl-3 md:pl-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{id}</Badge>
            <div>
              <h2>{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <div />
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}