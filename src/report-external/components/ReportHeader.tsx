import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, Menu } from 'lucide-react';
import { toast } from 'sonner';

interface ReportHeaderProps {
  language: string;
  onLanguageChange: (language: string) => void;
  onToggleMobileTOC?: () => void;
  createdAt?: string;
}

export function ReportHeader({ language, onLanguageChange, onToggleMobileTOC, createdAt }: ReportHeaderProps) {
  const handleSave = () => {
    try {
      window.print();
    } catch {
      toast.error('PDF 저장을 시작할 수 없습니다. 브라우저 인쇄를 이용해 주세요.');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="container mx-auto px-4 py-3 lg:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Mobile TOC Toggle */}
            {onToggleMobileTOC && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleMobileTOC}
                className="lg:hidden p-2"
                aria-label="목차 열기"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div>
              <h1 className="text-lg lg:text-xl font-medium">Why 보고서</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{createdAt ? new Date(createdAt).toLocaleDateString('ko-KR') : ''}</Badge>
              </div>
            </div>
          </div>

          {/* Desktop Actions (저장만) */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} className="hidden lg:flex">
              <Download className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>

          {/* Mobile Actions - 저장만 */}
          <div className="flex sm:hidden items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} className="p-2">
              <Download className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}