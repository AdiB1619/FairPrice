import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header.jsx';
import IntroStrip from './components/IntroStrip.jsx';
import Footer from './components/Footer.jsx';
import PriceChecker from './pages/PriceChecker.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { useTheme } from './hooks/useTheme.js';
import { getMetrics } from './api.js';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './components/ui/Button.jsx';

// ── Lazy-load Insights & HowItWorks to keep the main bundle small (Stage C requirement) ──
const Insights = lazy(() => import('./pages/Insights.jsx'));
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'));

// Fallback skeleton while a lazy page chunk is downloading
function PageLoadingFallback() {
  return (
    <div className="space-y-6 animate-pulse py-6" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  );
}

export default function App() {
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['checker', 'insights', 'howit'].includes(hash)) return hash;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (['checker', 'insights', 'howit'].includes(tabParam)) return tabParam;
    }
    return 'checker';
  };

  const [tab, setTabState] = useState(getInitialTab);
  const { theme, isDark, toggleTheme } = useTheme();

  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  const setTab = (newTab) => {
    setTabState(newTab);
    if (typeof window !== 'undefined') {
      window.location.hash = newTab;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['checker', 'insights', 'howit'].includes(hash)) {
        setTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchMetricsData = () => {
    setMetricsLoading(true);
    setBackendError(null);
    getMetrics()
      .then((data) => {
        setMetrics(data);
        setBackendError(null);
      })
      .catch((err) => {
        setBackendError('Backend not reachable on port 8000. Start uvicorn with: uvicorn app.main:app --port 8000');
      })
      .finally(() => {
        setMetricsLoading(false);
      });
  };

  useEffect(() => {
    fetchMetricsData();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* ── Sticky Header with Logo & Nav ── */}
        <Header
          currentTab={tab}
          setTab={setTab}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        {/* ── Backend Connectivity Warning Banner ── */}
        {backendError && (
          <div className="bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 px-4 py-3 text-xs sm:text-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>
                  <strong>Connection Error:</strong> {backendError}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchMetricsData}
                className="text-xs shrink-0 !py-1 !px-2.5"
                icon={RefreshCw}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* ── Main Container ── */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Intro Strip (Trust Stats from GET /api/metrics) */}
          <IntroStrip metrics={metrics} loading={metricsLoading} />

          {/* Dynamic Pages with Suspense & Lazy Loading */}
          <div className="transition-opacity duration-200">
            <Suspense fallback={<PageLoadingFallback />}>
              {tab === 'checker' && <PriceChecker />}
              {tab === 'insights' && <Insights />}
              {tab === 'howit' && <HowItWorks />}
            </Suspense>
          </div>
        </main>

        {/* ── Footer ── */}
        <Footer onNav={setTab} />
      </div>
    </ErrorBoundary>
  );
}
