// Type definitions for the Link Checker application

export interface ScanRequest {
  url: string;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content?: string;
}

export interface OutboundLink {
  href: string;
  text: string;
  isExternal: boolean;
  isSuspicious: boolean;
  suspicionReason?: string;
}

export interface RedirectInfo {
  url: string;
  statusCode: number;
}

export interface RiskFactor {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
  found: boolean;
}

export interface ScanFindings {
  // Basic info
  finalUrl: string;
  title: string;
  description: string;
  
  // SSL/Security
  isHttps: boolean;
  hasValidCert: boolean;
  
  // Meta tags
  metaTags: MetaTag[];
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  
  // Links
  outboundLinks: OutboundLink[];
  totalLinks: number;
  externalLinks: number;
  suspiciousLinks: number;
  
  // Redirects
  redirectChain: RedirectInfo[];
  hasMultipleRedirects: boolean;
  
  // Risk factors
  riskFactors: RiskFactor[];
  
  // Hidden elements
  hiddenIframes: number;
  hiddenForms: number;
  obfuscatedScripts: number;
  
  // Timing
  responseTimeMs: number;
}

export interface ScanResult {
  url: string;
  verdict: 'safe' | 'caution' | 'risk';
  score: number;
  summary: string;
  findings: ScanFindings;
  durationMs: number;
  scannedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Verdict color mapping
export const VERDICT_COLORS = {
  safe: {
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgb(34, 197, 94)',
    text: 'rgb(34, 197, 94)',
  },
  caution: {
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgb(251, 191, 36)',
    text: 'rgb(251, 191, 36)',
  },
  risk: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgb(239, 68, 68)',
    text: 'rgb(239, 68, 68)',
  },
} as const;
