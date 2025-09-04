import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { TableOfContents } from './components/TableOfContents';
import { WhyStatementSection } from './components/sections/WhyStatementSection';
import { ValueMapSection } from './components/sections/ValueMapSection';
import { StylePatternSection } from './components/sections/StylePatternSection';
import { MasterManagerSection } from './components/sections/MasterManagerSection';
import { LightShadowSection } from './components/sections/LightShadowSection';
import { PhilosophySection } from './components/sections/PhilosophySection';
import { FuturePathSection } from './components/sections/FuturePathSection';
import { EpilogueSection } from './components/sections/EpilogueSection';
import { ReportHeader } from './components/ReportHeader';

export default function App() {
  const [language, setLanguage] = useState('ko');
  const [pinnedSections, setPinnedSections] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isTOCVisible, setIsTOCVisible] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('goldenCircle-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Prevent body scroll when TOC is open
  useEffect(() => {
    if (isTOCVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isTOCVisible]);

  const togglePin = (sectionId: number) => {
    setPinnedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('goldenCircle-theme', newTheme);
  };

  const toggleTOC = () => {
    setIsTOCVisible(!isTOCVisible);
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-background text-foreground`}>
      <div className="min-h-screen">
        {/* Table of Contents Overlay */}
        {isTOCVisible && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={toggleTOC}
            />
            {/* TOC Content */}
            <div className="relative w-80 max-w-[80vw] h-full">
              <TableOfContents 
                language={language}
                pinnedSections={pinnedSections}
                onClose={toggleTOC}
              />
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="w-full">
          <ReportHeader 
            language={language}
            onLanguageChange={setLanguage}
            theme={theme}
            onThemeChange={toggleTheme}
            onToggleMobileTOC={toggleTOC}
          />
          
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-20">
              
              {/* Section 0: Why Statement */}
              <section id="section-0" className="scroll-mt-24">
                <WhyStatementSection 
                  isPinned={pinnedSections.includes(0)}
                  onTogglePin={() => togglePin(0)}
                  language={language}
                />
              </section>

              {/* Chapter Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="mx-6 px-4 py-2 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              {/* Section 1: Value Map */}
              <section id="section-1" className="scroll-mt-24">
                <ValueMapSection 
                  isPinned={pinnedSections.includes(1)}
                  onTogglePin={() => togglePin(1)}
                  language={language}
                />
              </section>

              {/* Chapter Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="mx-6 px-4 py-2 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              {/* Section 2: Style Pattern */}
              <section id="section-2" className="scroll-mt-24">
                <StylePatternSection 
                  isPinned={pinnedSections.includes(2)}
                  onTogglePin={() => togglePin(2)}
                  language={language}
                />
              </section>

              {/* Chapter Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="mx-6 px-4 py-2 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              {/* Section 3: Master-Manager Spectrum */}
              <section id="section-3" className="scroll-mt-24">
                <MasterManagerSection 
                  isPinned={pinnedSections.includes(3)}
                  onTogglePin={() => togglePin(3)}
                  language={language}
                />
              </section>

              {/* Chapter Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="mx-6 px-4 py-2 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              {/* Section 4: Light-Shadow Map */}
              <section id="section-4" className="scroll-mt-24">
                <LightShadowSection 
                  isPinned={pinnedSections.includes(4)}
                  onTogglePin={() => togglePin(4)}
                  language={language}
                />
              </section>

              {/* Chapter Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="mx-6 px-4 py-2 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              {/* Section 5: Philosophy */}
              <section id="section-5" className="scroll-mt-24">
                <PhilosophySection 
                  isPinned={pinnedSections.includes(5)}
                  onTogglePin={() => togglePin(5)}
                  language={language}
                />
              </section>

              {/* Chapter Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="mx-6 px-4 py-2 bg-muted rounded-full">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>

              {/* Section 6: Why 극대화 환경 */}
              <section id="section-6" className="scroll-mt-24">
                <FuturePathSection 
                  isPinned={pinnedSections.includes(6)}
                  onTogglePin={() => togglePin(6)}
                  language={language}
                />
              </section>

            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}