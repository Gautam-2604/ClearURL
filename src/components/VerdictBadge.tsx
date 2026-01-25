'use client';

interface VerdictBadgeProps {
    verdict: 'safe' | 'caution' | 'risk';
    size?: 'sm' | 'md' | 'lg';
}

const verdictLabels = {
    safe: 'Safe',
    caution: 'Caution',
    risk: 'Risk',
};

const verdictIcons = {
    safe: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    caution: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
    ),
    risk: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
    ),
};

export default function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs py-1 px-2',
        md: 'text-sm py-2 px-4',
        lg: 'text-base py-3 px-6',
    };

    return (
        <span className={`verdict-badge verdict-${verdict} ${sizeClasses[size]}`}>
            {verdictIcons[verdict]}
            {verdictLabels[verdict]}
        </span>
    );
}
