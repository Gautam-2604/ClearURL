import type { ScanFindings, ScanResult } from './types';

/**
 * Calculate safety score based on findings
 * Score starts at 100 and deductions are made for each risk factor
 */
export function calculateScore(findings: ScanFindings): number {
    let score = 100;
    
    

    // Deduct for each risk factor based on weight
    for (const risk of findings.riskFactors) {
        if (risk.found) {
            score -= risk.weight;
        }
    }

    // Additional deductions

    // No HTTPS
    if (!findings.isHttps) {
        score -= 5; // Additional penalty beyond risk factor
    }

    // Missing meta information
    if (!findings.hasOpenGraph && !findings.hasTwitterCard) {
        score -= 5; // Legitimate sites usually have social meta tags
    }

    // Slow response time (over 3 seconds)
    if (findings.responseTimeMs > 3000) {
        score -= 5;
    }

    // High ratio of external links
    if (findings.totalLinks > 0) {
        const externalRatio = findings.externalLinks / findings.totalLinks;
        if (externalRatio > 0.8 && findings.externalLinks > 10) {
            score -= 10;
        }
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
}

/**
 * Determine verdict based on score
 */
export function determineVerdict(score: number): 'safe' | 'caution' | 'risk' {
    if (score >= 80) return 'safe';
    if (score >= 50) return 'caution';
    return 'risk';
}

/**
 * Generate human-readable summary
 */
export function generateSummary(findings: ScanFindings, verdict: 'safe' | 'caution' | 'risk'): string {
    const parts: string[] = [];

    switch (verdict) {
        case 'safe':
            parts.push('This URL appears to be safe.');
            if (findings.isHttps) {
                parts.push('The site uses HTTPS encryption.');
            }
            if (findings.hasOpenGraph || findings.hasTwitterCard) {
                parts.push('Proper social meta tags are present.');
            }
            break;

        case 'caution':
            parts.push('This URL shows some signs that warrant caution.');
            if (!findings.isHttps) {
                parts.push('The site does not use HTTPS.');
            }
            if (findings.suspiciousLinks > 0) {
                parts.push(`Found ${findings.suspiciousLinks} potentially suspicious link(s).`);
            }
            if (findings.hasMultipleRedirects) {
                parts.push('The URL involves multiple redirects.');
            }
            break;

        case 'risk':
            parts.push('This URL shows multiple warning signs.');
            const highRisks = findings.riskFactors.filter(r => r.severity === 'high');
            if (highRisks.length > 0) {
                parts.push(`Detected ${highRisks.length} high-severity issue(s).`);
            }
            if (findings.hiddenIframes > 0) {
                parts.push('Hidden iframes were detected on this page.');
            }
            if (findings.obfuscatedScripts > 0) {
                parts.push('Obfuscated scripts were found.');
            }
            break;
    }

    return parts.join(' ');
}

/**
 * Generate complete scan result with verdict
 */
export function generateVerdict(url: string, findings: ScanFindings, durationMs: number): ScanResult {
    const score = calculateScore(findings);
    const verdict = determineVerdict(score);
    const summary = generateSummary(findings, verdict);

    return {
        url,
        verdict,
        score,
        summary,
        findings,
        durationMs,
        scannedAt: new Date().toISOString(),
    };
}
