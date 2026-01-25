'use client';

import { useEffect, useState } from 'react';

interface ScoreMeterProps {
    score: number;
    verdict: 'safe' | 'caution' | 'risk';
}

export default function ScoreMeter({ score, verdict }: ScoreMeterProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    useEffect(() => {
        // Animate the score from 0 to actual value
        const duration = 1200;
        const steps = 60;
        const stepDuration = duration / steps;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.round(current));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [score]);

    const getGradientId = () => `gradient-${verdict}`;

    return (
        <div className="score-meter relative">
            <svg width="200" height="200" className="score-meter-ring">
                {/* Gradient definitions */}
                <defs>
                    <linearGradient id="gradient-safe" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="gradient-caution" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="gradient-risk" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                </defs>
                {/* Background ring */}
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    className="score-meter-bg"
                />
                {/* Animated fill ring */}
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    className={`score-meter-fill ${verdict}`}
                    stroke={`url(#${getGradientId()})`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </svg>

            {/* Score display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-[var(--foreground)] tracking-tight">
                    {animatedScore}
                </span>
                <span className="text-xs text-[var(--muted)] uppercase tracking-widest mt-2 font-medium">
                    Safety Score
                </span>
            </div>
        </div>
    );
}
