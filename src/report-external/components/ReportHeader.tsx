import { Button } from './ui/button';
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
    <header className="sticky top-0 z-30 border-b border-white/20 bg-transparent">
      <div className="container mx-auto px-4 py-3 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { try { history.back(); } catch { window.location.href = '/home'; } }}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
              aria-label="뒤로가기"
              title="뒤로가기"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Download className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} className="p-2">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}