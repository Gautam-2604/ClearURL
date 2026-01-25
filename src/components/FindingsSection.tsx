'use client';

import { useState } from 'react';
import type { RiskFactor, OutboundLink } from '@/lib/types';

interface FindingsSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    count?: number;
}

export function FindingsSection({ title, icon, children, defaultOpen = false, count }: FindingsSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="glass-card-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-[var(--primary)]">{icon}</span>
                    <span className="font-medium">{title}</span>
                    {count !== undefined && (
                        <span className="text-xs text-[var(--muted)] bg-white/10 px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    )}
                </div>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                <div className="px-5 pb-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
}

interface RiskFactorsListProps {
    riskFactors: RiskFactor[];
}

export function RiskFactorsList({ riskFactors }: RiskFactorsListProps) {
    if (riskFactors.length === 0) {
        return (
            <p className="text-sm text-[var(--safe)]">
                ✓ No significant risk factors detected
            </p>
        );
    }

    const severityColors = {
        low: 'text-[var(--caution)] bg-[var(--caution-bg)]',
        medium: 'text-[var(--caution)] bg-[var(--caution-bg)]',
        high: 'text-[var(--risk)] bg-[var(--risk-bg)]',
    };

    return (
        <div className="space-y-2">
            {riskFactors.map((factor, index) => (
                <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-black/20 rounded-lg"
                >
                    <span className={`text-xs px-2 py-1 rounded uppercase font-medium ${severityColors[factor.severity]}`}>
                        {factor.severity}
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{factor.category}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{factor.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface LinksListProps {
    links: OutboundLink[];
    maxDisplay?: number;
}

export function LinksList({ links, maxDisplay = 10 }: LinksListProps) {
    const [showAll, setShowAll] = useState(false);
    const displayLinks = showAll ? links : links.slice(0, maxDisplay);

    if (links.length === 0) {
        return (
            <p className="text-sm text-[var(--muted)]">
                No outbound links found
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {displayLinks.map((link, index) => (
                <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${link.isSuspicious ? 'bg-[var(--risk-bg)]' : 'bg-black/20'
                        }`}
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate" title={link.href}>
                            {link.href}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            {link.isExternal && (
                                <span className="text-xs text-[var(--muted)] bg-white/10 px-2 py-0.5 rounded">
                                    External
                                </span>
                            )}
                            {link.isSuspicious && (
                                <span className="text-xs text-[var(--risk)] bg-[var(--risk-bg)] px-2 py-0.5 rounded">
                                    {link.suspicionReason || 'Suspicious'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {links.length > maxDisplay && !showAll && (
                <button
                    onClick={() => setShowAll(true)}
                    className="text-sm text-[var(--primary)] hover:underline"
                >
                    Show {links.length - maxDisplay} more links
                </button>
            )}
        </div>
    );
}

interface MetaInfoProps {
    title: string;
    description: string;
    hasOpenGraph: boolean;
    hasTwitterCard: boolean;
    isHttps: boolean;
}

export function MetaInfo({ title, description, hasOpenGraph, hasTwitterCard, isHttps }: MetaInfoProps) {
    return (
        <div className="space-y-3">
            <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Title</p>
                <p className="text-sm">{title}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
                <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm line-clamp-3">{description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-3 py-1 rounded-full ${isHttps ? 'bg-[var(--safe-bg)] text-[var(--safe)]' : 'bg-[var(--risk-bg)] text-[var(--risk)]'
                    }`}>
                    {isHttps ? '🔒 HTTPS' : '⚠️ No HTTPS'}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${hasOpenGraph ? 'bg-[var(--safe-bg)] text-[var(--safe)]' : 'bg-white/10 text-[var(--muted)]'
                    }`}>
                    {hasOpenGraph ? '✓ Open Graph' : '✗ No Open Graph'}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${hasTwitterCard ? 'bg-[var(--safe-bg)] text-[var(--safe)]' : 'bg-white/10 text-[var(--muted)]'
                    }`}>
                    {hasTwitterCard ? '✓ Twitter Card' : '✗ No Twitter Card'}
                </span>
            </div>
        </div>
    );
}
