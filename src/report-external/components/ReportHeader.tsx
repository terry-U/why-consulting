import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Copy, Download, Share2, Languages, MoreHorizontal, Sun, Moon, Menu } from 'lucide-react';
import { toast } from 'sonner';

interface ReportHeaderProps {
  language: string;
  onLanguageChange: (language: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
  onToggleMobileTOC?: () => void;
}

export function ReportHeader({ language, onLanguageChange, theme, onThemeChange, onToggleMobileTOC }: ReportHeaderProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('보고서 링크가 복사되었습니다');
  };

  const handleSave = () => {
    // Mock save functionality
    toast.success('보고서가 저장되었습니다');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Golden Circle Why 보고서',
        url: window.location.href
      });
    } else {
      handleCopy();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <h1 className="text-lg lg:text-xl font-medium">Golden Circle Why 보고서</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">2024.09.01</Badge>
                <Badge variant="secondary" className="text-xs">개인 분석</Badge>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onThemeChange}>
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">다크모드</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">라이트모드</span>
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Languages className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">{language === 'ko' ? '한국어' : 'English'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onLanguageChange('ko')}>
                  한국어
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={handleCopy} className="hidden lg:flex">
              <Copy className="h-4 w-4 mr-2" />
              복사
            </Button>

            <Button variant="outline" size="sm" onClick={handleSave} className="hidden lg:flex">
              <Download className="h-4 w-4 mr-2" />
              저장
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare} className="hidden lg:flex">
              <Share2 className="h-4 w-4 mr-2" />
              공유
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCopy} className="lg:hidden">
                  <Copy className="h-4 w-4 mr-2" />
                  복사
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSave} className="lg:hidden">
                  <Download className="h-4 w-4 mr-2" />
                  저장
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare} className="lg:hidden">
                  <Share2 className="h-4 w-4 mr-2" />
                  공유
                </DropdownMenuItem>
                <DropdownMenuItem>PDF로 내보내기</DropdownMenuItem>
                <DropdownMenuItem>이메일로 발송</DropdownMenuItem>
                <DropdownMenuItem>프린트</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Actions - Simplified */}
          <div className="flex sm:hidden items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onThemeChange} className="p-2">
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onLanguageChange(language === 'ko' ? 'en' : 'ko')}>
                  <Languages className="h-4 w-4 mr-2" />
                  {language === 'ko' ? 'English' : '한국어'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  복사
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSave}>
                  <Download className="h-4 w-4 mr-2" />
                  저장
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  공유
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}