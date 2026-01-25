import * as cheerio from 'cheerio';
import type {
    MetaTag,
    OutboundLink,
    RedirectInfo,
    RiskFactor,
    ScanFindings
} from './types';

// Known suspicious patterns
const SUSPICIOUS_DOMAINS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly',
    'is.gd', 'buff.ly', 'adf.ly', 'bc.vc', 'j.mp'
];

const OBFUSCATION_PATTERNS = [
    /eval\s*\(/i,
    /document\.write\s*\(/i,
    /unescape\s*\(/i,
    /fromCharCode/i,
    /\\x[0-9a-f]{2}/i,
    /\\u[0-9a-f]{4}/i,
    /atob\s*\(/i,
    /btoa\s*\(/i,
];

const SUSPICIOUS_SCRIPT_PATTERNS = [
    /crypto\s*miner/i,
    /coinhive/i,
    /cryptoloot/i,
    /minero\.cc/i,
];

interface FetchResult {
    html: string;
    finalUrl: string;
    redirectChain: RedirectInfo[];
    responseTimeMs: number;
    isHttps: boolean;
}

type CheerioRoot = ReturnType<typeof cheerio.load>;

/**
 * Fetch a page with redirect tracking
 */
export async function fetchPage(url: string, timeoutMs: number = 10000): Promise<FetchResult> {
    const startTime = Date.now();
    const redirectChain: RedirectInfo[] = [];

    try {
        const response = await fetch(url, {
            redirect: 'follow',
            signal: AbortSignal.timeout(timeoutMs),
            headers: {
                'User-Agent': 'LinkChecker/1.0 (Security Scanner)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });

        const html = await response.text();
        const responseTimeMs = Date.now() - startTime;
        const finalUrl = response.url;
        const isHttps = finalUrl.startsWith('https://');

        // Check if there were redirects
        if (response.redirected) {
            redirectChain.push({
                url: url,
                statusCode: 301, // We don't have exact codes, assume permanent redirect
            });
        }

        return {
            html,
            finalUrl,
            redirectChain,
            responseTimeMs,
            isHttps,
        };
    } catch (error) {
        throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract meta tags from HTML
 */
export function extractMetaTags($: CheerioRoot): MetaTag[] {
    const metaTags: MetaTag[] = [];

    $('meta').each(function (this: cheerio.Element) {
        const $el = $(this);
        const name = $el.attr('name');
        const property = $el.attr('property');
        const content = $el.attr('content');

        if (name || property) {
            metaTags.push({ name, property, content });
        }
    });

    return metaTags;
}

/**
 * Check if URL is a known URL shortener
 */
function isUrlShortener(url: string): boolean {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return SUSPICIOUS_DOMAINS.some(domain => hostname.includes(domain));
    } catch {
        return false;
    }
}

/**
 * Discover all outbound links
 */
export function discoverLinks($: CheerioRoot, baseUrl: string): OutboundLink[] {
    const links: OutboundLink[] = [];
    const baseHostname = new URL(baseUrl).hostname;

    $('a[href]').each(function (this: cheerio.Element) {
        const $el = $(this);
        const href = $el.attr('href');
        const text = $el.text().trim().substring(0, 100);

        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return;
        }

        try {
            const absoluteUrl = new URL(href, baseUrl).href;
            const linkHostname = new URL(absoluteUrl).hostname;
            const isExternal = linkHostname !== baseHostname;

            let isSuspicious = false;
            let suspicionReason: string | undefined;

            // Check for URL shorteners
            if (isUrlShortener(absoluteUrl)) {
                isSuspicious = true;
                suspicionReason = 'URL shortener detected';
            }

            // Check for mismatched text and URL
            if (text.includes('http') && !text.includes(linkHostname)) {
                isSuspicious = true;
                suspicionReason = 'Link text contains different URL than destination';
            }

            links.push({
                href: absoluteUrl,
                text: text || '[No text]',
                isExternal,
                isSuspicious,
                suspicionReason,
            });
        } catch {
            // Invalid URL, skip
        }
    });

    return links;
}

/**
 * Detect hidden elements and suspicious patterns
 */
export function detectRisks($: CheerioRoot, _html: string): {
    hiddenIframes: number;
    hiddenForms: number;
    obfuscatedScripts: number;
    riskFactors: RiskFactor[];
} {
    const riskFactors: RiskFactor[] = [];

    // Check for hidden iframes
    const hiddenIframes = $('iframe[style*="display:none"], iframe[style*="display: none"], iframe[width="0"], iframe[height="0"], iframe[width="1"], iframe[height="1"]').length;

    if (hiddenIframes > 0) {
        riskFactors.push({
            category: 'Hidden Elements',
            severity: 'high',
            description: `Found ${hiddenIframes} hidden iframe(s) which may load malicious content`,
            weight: 15,
            found: true,
        });
    }

    // Check for hidden forms
    const hiddenForms = $('form[style*="display:none"], form[style*="display: none"], form[style*="visibility:hidden"]').length;

    if (hiddenForms > 0) {
        riskFactors.push({
            category: 'Hidden Elements',
            severity: 'medium',
            description: `Found ${hiddenForms} hidden form(s) which may be used for phishing`,
            weight: 10,
            found: true,
        });
    }

    // Check for obfuscated scripts
    let obfuscatedScripts = 0;
    $('script').each(function (this: cheerio.Element) {
        const scriptContent = $(this).html() || '';

        for (const pattern of OBFUSCATION_PATTERNS) {
            if (pattern.test(scriptContent)) {
                obfuscatedScripts++;
                break;
            }
        }

        for (const pattern of SUSPICIOUS_SCRIPT_PATTERNS) {
            if (pattern.test(scriptContent)) {
                riskFactors.push({
                    category: 'Malicious Scripts',
                    severity: 'high',
                    description: 'Detected potential cryptocurrency mining script',
                    weight: 20,
                    found: true,
                });
                break;
            }
        }
    });

    if (obfuscatedScripts > 0) {
        riskFactors.push({
            category: 'Obfuscated Code',
            severity: 'medium',
            description: `Found ${obfuscatedScripts} script(s) with obfuscation patterns`,
            weight: 10,
            found: true,
        });
    }

    // Check for password fields without HTTPS context (will be checked later with isHttps)
    const passwordFields = $('input[type="password"]').length;
    if (passwordFields > 0) {
        riskFactors.push({
            category: 'Sensitive Input',
            severity: 'low',
            description: `Page contains ${passwordFields} password field(s)`,
            weight: 5,
            found: true,
        });
    }

    // Check for excessive external scripts
    let externalScriptsCount = 0;
    $('script[src]').each(function (this: cheerio.Element) {
        const src = $(this).attr('src') || '';
        if (src.startsWith('http') || src.startsWith('//')) {
            externalScriptsCount++;
        }
    });

    if (externalScriptsCount > 20) {
        riskFactors.push({
            category: 'Resource Loading',
            severity: 'low',
            description: `Page loads ${externalScriptsCount} external scripts which may slow performance or pose risks`,
            weight: 5,
            found: true,
        });
    }

    return {
        hiddenIframes,
        hiddenForms,
        obfuscatedScripts,
        riskFactors,
    };
}

/**
 * Perform a complete scan of a URL
 */
export async function scanUrl(url: string): Promise<ScanFindings> {
    const startTime = Date.now();

    // Fetch the page
    const fetchResult = await fetchPage(url);
    const $ = cheerio.load(fetchResult.html);

    // Extract meta tags
    const metaTags = extractMetaTags($);
    const hasOpenGraph = metaTags.some(m => m.property?.startsWith('og:'));
    const hasTwitterCard = metaTags.some(m => m.name?.startsWith('twitter:'));

    // Get page title and description
    const title = $('title').text().trim() || 'No title';
    const description = $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        'No description';

    // Discover links
    const outboundLinks = discoverLinks($, fetchResult.finalUrl);
    const externalLinks = outboundLinks.filter(l => l.isExternal).length;
    const suspiciousLinks = outboundLinks.filter(l => l.isSuspicious).length;

    // Detect risks
    const risks = detectRisks($, fetchResult.html);

    // Add SSL risk if not HTTPS
    if (!fetchResult.isHttps) {
        risks.riskFactors.push({
            category: 'SSL/Security',
            severity: 'high',
            description: 'Site does not use HTTPS encryption',
            weight: 15,
            found: true,
        });
    }

    // Add redirect risk if multiple redirects
    const hasMultipleRedirects = fetchResult.redirectChain.length > 1;
    if (hasMultipleRedirects) {
        risks.riskFactors.push({
            category: 'Redirects',
            severity: 'medium',
            description: `URL has ${fetchResult.redirectChain.length} redirects`,
            weight: 10,
            found: true,
        });
    }

    // Add suspicious links risk
    if (suspiciousLinks > 0) {
        risks.riskFactors.push({
            category: 'Suspicious Links',
            severity: 'medium',
            description: `Found ${suspiciousLinks} suspicious outbound link(s)`,
            weight: 10,
            found: true,
        });
    }

    const durationMs = Date.now() - startTime;

    return {
        finalUrl: fetchResult.finalUrl,
        title,
        description,
        isHttps: fetchResult.isHttps,
        hasValidCert: fetchResult.isHttps, // Simplified: if HTTPS works, cert is valid
        metaTags,
        hasOpenGraph,
        hasTwitterCard,
        outboundLinks: outboundLinks.slice(0, 50), // Limit to 50 links
        totalLinks: outboundLinks.length,
        externalLinks,
        suspiciousLinks,
        redirectChain: fetchResult.redirectChain,
        hasMultipleRedirects,
        riskFactors: risks.riskFactors,
        hiddenIframes: risks.hiddenIframes,
        hiddenForms: risks.hiddenForms,
        obfuscatedScripts: risks.obfuscatedScripts,
        responseTimeMs: fetchResult.responseTimeMs,
    };
}
