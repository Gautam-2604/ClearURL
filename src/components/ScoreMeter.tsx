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
        const duration = 1000;
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

    return (
        <div className="score-meter relative">
            <svg width="200" height="200" className="score-meter-ring">
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
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>

            {/* Score display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-[var(--foreground)]">
                    {animatedScore}
                </span>
                <span className="text-sm text-[var(--muted)] uppercase tracking-wider mt-1">
                    Safety Score
                </span>
            </div>
        </div>
    );
}
