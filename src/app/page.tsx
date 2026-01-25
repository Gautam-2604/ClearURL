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
      <header className="py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
            </div>
            <span className="text-xl font-semibold">Link Checker</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2 px-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {!result ? (
            // Landing / Input view
            <div className="pt-12 sm:pt-24 animate-fade-in">
              {/* Hero section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Check any link for
                  <br />
                  <span className="text-gradient">hidden risks</span>
                </h1>
                <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto">
                  Instantly analyze URLs for phishing, malware, suspicious scripts,
                  and hidden elements. Get a clear safety verdict you can trust.
                </p>
              </div>

              {/* Input card */}
              <div className="glass-card p-6 sm:p-8 glow">
                <URLInput onScan={handleScan} isLoading={isLoading} />

                {error && (
                  <div className="mt-4 p-4 bg-[var(--risk-bg)] border border-[var(--risk)] rounded-lg animate-fade-in">
                    <p className="text-sm text-[var(--risk)]">{error}</p>
                  </div>
                )}

                {isLoading && (
                  <div className="mt-8 text-center animate-pulse">
                    <div className="inline-flex items-center gap-3 text-[var(--muted)]">
                      <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                      </svg>
                      <span>Analyzing URL...</span>
                    </div>
                    <p className="text-sm text-[var(--muted)] mt-2">
                      Inspecting page content, links, and security signals
                    </p>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card-sm p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--safe-bg)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Security Analysis</h3>
                  <p className="text-sm text-[var(--muted)]">
                    Detect hidden iframes, obfuscated scripts, and phishing signals
                  </p>
                </div>

                <div className="glass-card-sm p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--caution-bg)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--caution)" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Link Discovery</h3>
                  <p className="text-sm text-[var(--muted)]">
                    Find and analyze all outbound links for suspicious destinations
                  </p>
                </div>

                <div className="glass-card-sm p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Clear Verdicts</h3>
                  <p className="text-sm text-[var(--muted)]">
                    Understand results without security jargon or confusion
                  </p>
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
      <footer className="py-6 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center text-sm text-[var(--muted)]">
          <p>
            Open source URL security scanner.
            <a
              href="https://github.com"
              className="text-[var(--primary)] hover:underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
