'use client';

import { useState } from 'react';
import URLInput from '@/components/URLInput';
import ScanResultComponent from '@/components/ScanResult';
import type { ScanResult, ApiResponse } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data: ApiResponse<ScanResult> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to scan URL');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScan = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">ClearURL</span>
              <span className="hidden sm:inline text-xs text-[var(--muted)] ml-2 px-2 py-0.5 bg-[var(--secondary)] rounded-full">Beta</span>
            </div>
          </div>
          <a
            href="https://github.com/Gautam-2604/ClearURL"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2.5 px-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hidden sm:inline">Star on GitHub</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          {!result ? (
            // Landing / Input view
            <div className="pt-16 sm:pt-28 animate-fade-in">
              {/* Hero section */}
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-sm text-[var(--primary)] mb-8">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  AI-Powered URL Analysis
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                  Verify any link
                  <br />
                  <span className="text-gradient">before you click</span>
                </h1>
                <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                  Instantly detect phishing, malware, and suspicious elements.
                  Get a clear safety verdict powered by AI.
                </p>
              </div>

              {/* Input card */}
              <div className="glass-card p-8 sm:p-10 glow glow-border">
                <URLInput onScan={handleScan} isLoading={isLoading} />

                {error && (
                  <div className="mt-6 p-4 bg-[var(--risk-bg)] border border-[var(--risk)]/30 rounded-xl animate-fade-in">
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--risk)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                      <p className="text-sm text-[var(--risk)]">{error}</p>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="mt-10 text-center">
                    <div className="inline-flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-[var(--primary)]/20"></div>
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[var(--primary)] animate-spin"></div>
                      </div>
                      <div>
                        <p className="text-[var(--foreground)] font-medium">Analyzing URL...</p>
                        <p className="text-sm text-[var(--muted)] mt-1">
                          Inspecting security signals and content
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="glass-card-sm p-6 text-center group">
                  <div className="feature-icon w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">Security Analysis</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    Detect hidden iframes, obfuscated scripts, and phishing signals
                  </p>
                </div>

                <div className="glass-card-sm p-6 text-center group">
                  <div className="feature-icon w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--caution)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">Link Discovery</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    Analyze all outbound links for suspicious destinations
                  </p>
                </div>

                <div className="glass-card-sm p-6 text-center group">
                  <div className="feature-icon w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2h-4a2 2 0 0 1-2-2 4 4 0 0 1 4-4z" />
                      <path d="M8 8v6a4 4 0 0 0 8 0V8" />
                      <path d="M12 18v4" />
                      <path d="M8 22h8" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">AI Insights</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    Get intelligent descriptions and use-case analysis
                  </p>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-16 text-center">
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-4">Trusted Analysis</p>
                <div className="flex items-center justify-center gap-8 text-[var(--muted)]">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="text-sm">SSL Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span className="text-sm">Real-time Scan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    <span className="text-sm">Deep Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Results view
            <div className="pt-8">
              <ScanResultComponent result={result} onNewScan={handleNewScan} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>ClearURL — Open Source URL Security Scanner</span>
          </div>
          <a
            href="https://github.com/Gautam-2604/ClearURL"
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
