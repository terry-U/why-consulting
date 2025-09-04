import { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Pin, PinOff } from 'lucide-react';

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
      <CardHeader className="pb-4">
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
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}