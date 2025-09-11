"use client"

import { useEffect, useState } from 'react';
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
import { ReportHeader } from './components/ReportHeader';
import { Skeleton } from './components/ui/skeleton';

type ReportsMap = Record<string, any>;

export default function App({ initialReports }: { initialReports?: ReportsMap }) {
  const [language, setLanguage] = useState('ko');
  const [pinnedSections, setPinnedSections] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isTOCVisible, setIsTOCVisible] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportsMap>(initialReports || {});
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);

  const isLikelyJson = (s?: string) => {
    if (typeof s !== 'string') return false;
    const t = s.trim();
    // code fence or raw JSON array/object
    if (t.startsWith('```')) return true;
    return /^[\[{]/.test(t);
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    localStorage.setItem('goldenCircle-theme', 'light');
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
        const res = await fetch(url, { method: 'GET', credentials: 'same-origin', cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
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
        // 이미 저장된 값이 있으면 재생성하지 않도록 checkOnly로 먼저 확인
        const checkUrl = `${base}/api/session/${id}/report?type=my_why&check=1`;
        const check = await fetchJson(checkUrl);
        if (check?.pending) {
          await fetchJson(`${base}/api/session/${id}/report?type=my_why&cascade=1`);
        }

        // 비용 절감을 위해 실제 화면에서 쓰는 타입만 호출
        const types: Array<string> = [
          'my_why',
          'value_map',
          'style_pattern',
          'master_manager_spectrum',
          'light_shadow',
          'philosophy',
          'future_path'
        ];

        const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
        const pollType = async (t: string) => {
          // Faster client polling: cap ~20s
          for (let attempt = 0; attempt < 6; attempt++) {
            try {
              const backfillFlag = t === 'my_why' ? '&backfill=1' : '';
              const data = await fetchJson(`${base}/api/session/${id}/report?type=${t}${backfillFlag}`);
              if (data && (data.success || data.report)) {
                setReports(prev => ({ ...prev, [t]: data.report || data }));
                if (!createdAt && data?.createdAt) setCreatedAt(data.createdAt);
                setStatusMsg(`${t} 로드 완료`);
                // 첫 성공 시 로딩 해제(점진적 표시)
                setLoading(l => (l ? false : l));
                return;
              }
            } catch {}
            await delay(Math.min(600 * (attempt + 1), 4000));
          }
        };

        // 세션 변경 시 이전 보고서 흔적 제거
        setReports({});
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

  const toggleTheme = () => {};

  const toggleTOC = () => {
    setIsTOCVisible(!isTOCVisible);
  };

  return (
    <div className={`report-root min-h-screen text-foreground`}>
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
            onToggleMobileTOC={toggleTOC}
            createdAt={createdAt}
          />
          {loading && (
            <div className="max-w-full md:max-w-4xl md:mx-auto px-0 md:px-6">
              <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          )}
          
          <div className="max-w-full md:max-w-4xl md:mx-auto px-0 md:px-6 py-8 overflow-x-hidden">
            <div className="space-y-20">
              
              {/* Section 0: Why Statement */}
              <section id="section-0" className="scroll-mt-24">
                {!reports?.my_why ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                <WhyStatementSection 
                  isPinned={pinnedSections.includes(0)}
                  onTogglePin={() => togglePin(0)}
                  language={language}
                  data={reports?.my_why}
                />)}
                {/* Raw markdown hidden: structured UI only */}
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
                {!reports?.value_map ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                <ValueMapSection 
                  isPinned={pinnedSections.includes(1)}
                  onTogglePin={() => togglePin(1)}
                  language={language}
                  data={reports?.value_map}
                />)}
                {/* Raw markdown hidden: structured UI only */}
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
                {!reports?.style_pattern ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                <StylePatternSection 
                  isPinned={pinnedSections.includes(2)}
                  onTogglePin={() => togglePin(2)}
                  language={language}
                  data={reports?.style_pattern}
                />)}
                {/* Raw markdown hidden: structured UI only */}
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
                {!reports?.master_manager_spectrum ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                <MasterManagerSection 
                  isPinned={pinnedSections.includes(3)}
                  onTogglePin={() => togglePin(3)}
                  language={language}
                  data={reports?.master_manager_spectrum}
                />)}
                {/* Raw markdown hidden: structured UI only */}
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
                {!reports?.light_shadow ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                <LightShadowSection 
                  isPinned={pinnedSections.includes(4)}
                  onTogglePin={() => togglePin(4)}
                  language={language}
                  data={reports?.light_shadow}
                />)}
                {/* Raw markdown hidden: structured UI only */}
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
                {!reports?.philosophy ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                <PhilosophySection 
                  isPinned={pinnedSections.includes(5)}
                  onTogglePin={() => togglePin(5)}
                  language={language}
                  data={reports?.philosophy}
                />)}
                {/* Raw markdown hidden: structured UI only */}
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
                {!reports?.future_path ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                <FuturePathSection 
                  isPinned={pinnedSections.includes(6)}
                  onTogglePin={() => togglePin(6)}
                  language={language}
                  data={reports?.future_path}
                />)}
                {/* Raw markdown hidden: structured UI only */}
              </section>

              {/* Section 7: Fit & Triggers (optional) */}
              <section id="section-7" className="scroll-mt-24">
                {/* Raw markdown hidden: structured UI only */}
              </section>

              {/* Section 8: Action Recipe */}
              <section id="section-8" className="scroll-mt-24">
                {/* Raw markdown hidden: structured UI only */}
              </section>

              {/* Section 9: Epilogue */}
              <section id="section-9" className="scroll-mt-24">
                {/* If we have structured epilogue data, render component; otherwise fallback to markdown */}
                {/* Raw markdown hidden: structured UI only */}
              </section>

            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}