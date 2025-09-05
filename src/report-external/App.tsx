"use client"

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

type ReportsMap = Record<string, any>;

export default function App({ initialReports }: { initialReports?: ReportsMap }) {
  const [language, setLanguage] = useState('ko');
  const [pinnedSections, setPinnedSections] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isTOCVisible, setIsTOCVisible] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportsMap>(initialReports || {});
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

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

  // Resolve session id from url and trigger report generation + fetch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parts = window.location.pathname.split('/').filter(Boolean);
    // Expecting /session/:id/report
    const idx = parts.indexOf('session');
    const id = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
    if (!id) return;
    setSessionId(id);

    const base = window.location.origin;
    const fetchJson = async (url: string) => {
      try {
        console.log('[report] GET', url);
        const res = await fetch(url, { method: 'GET', credentials: 'same-origin' });
        console.log('[report] RES', res.status, url);
        if (res.status === 202) return { pending: true } as any;
        const text = await res.text();
        try { return JSON.parse(text); } catch {
          console.warn('[report] non-JSON response', text?.slice(0,200));
          return { success: false, error: 'non-json' };
        }
      } catch (e) {
        console.error('[report] fetch error', url, e);
        return { success: false, error: String(e) };
      }
    };

    const loadReports = async () => {
      try {
        setLoading(true);
        // 1) Ensure my_why exists and cascade others (no force to use cache)
        setStatusMsg('보고서 확인 중...');
        await fetchJson(`${base}/api/session/${id}/report?type=my_why&cascade=1`);

        const types: Array<string> = [
          'my_why',
          'value_map',
          'style_pattern',
          'master_manager_spectrum',
          'fit_triggers',
          'light_shadow',
          'philosophy',
          'action_recipe',
          'future_path',
          'epilogue'
        ];

        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
        const pollType = async (t: string) => {
          // Poll up to ~90s with backoff
          for (let attempt = 0; attempt < 12; attempt++) {
            try {
              const data = await fetchJson(`${base}/api/session/${id}/report?type=${t}`);
              if (data && (data.success || data.report)) {
                setReports(prev => ({ ...prev, [t]: data.report || data }));
                setStatusMsg(`${t} 로드 완료`);
                return;
              }
            } catch {}
            await delay(Math.min(1000 * (attempt + 1), 8000));
          }
        };

        // poll all types in parallel to reduce waiting time
        await Promise.all(types.map(pollType));
      } finally {
        setLoading(false);
      }
    };
    // If server already injected reports, skip client fetch
    if (initialReports && Object.keys(initialReports).length > 0) {
      setReports(initialReports);
      return;
    }
    loadReports();
  }, []);

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
          {loading && (
            <div className="max-w-4xl mx-auto px-6">
              <div className="my-4 text-sm text-muted-foreground">{statusMsg || '보고서 로딩 중...'}</div>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-20">
              
              {/* Section 0: Why Statement */}
              <section id="section-0" className="scroll-mt-24">
                <WhyStatementSection 
                  isPinned={pinnedSections.includes(0)}
                  onTogglePin={() => togglePin(0)}
                  language={language}
                  data={reports?.my_why}
                />
                {reports?.my_why?.markdown && (
                  <div className="prose dark:prose-invert max-w-none mt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.my_why.markdown}
                    </ReactMarkdown>
                  </div>
                )}
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
                  data={reports?.value_map}
                />
                {reports?.value_map?.markdown && (
                  <div className="prose dark:prose-invert max-w-none mt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.value_map.markdown}
                    </ReactMarkdown>
                  </div>
                )}
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
                {reports?.style_pattern?.markdown && (
                  <div className="prose dark:prose-invert max-w-none mt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.style_pattern.markdown}
                    </ReactMarkdown>
                  </div>
                )}
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
                {reports?.master_manager_spectrum?.markdown && (
                  <div className="prose dark:prose-invert max-w-none mt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.master_manager_spectrum.markdown}
                    </ReactMarkdown>
                  </div>
                )}
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
                {reports?.light_shadow?.markdown && (
                  <div className="prose dark:prose-invert max-w-none mt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.light_shadow.markdown}
                    </ReactMarkdown>
                  </div>
                )}
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
                {reports?.philosophy?.markdown && (
                  <div className="prose dark:prose-invert max-w-none mt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.philosophy.markdown}
                    </ReactMarkdown>
                  </div>
                )}
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
                {reports?.future_path?.markdown && (
                  <div className="prose dark:prose-invert max-w-none mt-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.future_path.markdown}
                    </ReactMarkdown>
                  </div>
                )}
              </section>

              {/* Section 7: Fit & Triggers (optional) */}
              <section id="section-7" className="scroll-mt-24">
                {reports?.fit_triggers?.markdown && (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.fit_triggers.markdown}
                    </ReactMarkdown>
                  </div>
                )}
              </section>

              {/* Section 8: Action Recipe */}
              <section id="section-8" className="scroll-mt-24">
                {reports?.action_recipe?.markdown && (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.action_recipe.markdown}
                    </ReactMarkdown>
                  </div>
                )}
              </section>

              {/* Section 9: Epilogue */}
              <section id="section-9" className="scroll-mt-24">
                {reports?.epilogue?.markdown && (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reports.epilogue.markdown}
                    </ReactMarkdown>
                  </div>
                )}
              </section>

            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}