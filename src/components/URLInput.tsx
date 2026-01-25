'use client';

import { useState, FormEvent } from 'react';

interface URLInputProps {
    onScan: (url: string) => void;
    isLoading: boolean;
}

export default function URLInput({ onScan, isLoading }: URLInputProps) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validateUrl = (input: string): boolean => {
        try {
            const parsed = new URL(input);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            setError('Please enter a URL to scan');
            return;
        }

        // Add https:// if no protocol specified
        let finalUrl = trimmedUrl;
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
            finalUrl = 'https://' + trimmedUrl;
        }

        if (!validateUrl(finalUrl)) {
            setError('Please enter a valid URL');
            return;
        }

        onScan(finalUrl);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
            setError(null);
        } catch {
            setError('Unable to access clipboard');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        setError(null);
                    }}
                    placeholder="https://example.com"
                    className="url-input"
                    disabled={isLoading}
                    autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                    <button
                        type="button"
                        onClick={handlePaste}
                        className="btn-secondary py-2 px-3"
                        disabled={isLoading}
                        title="Paste from clipboard"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    </button>
                    <button
                        type="submit"
                        className="btn-primary py-2 px-4"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                </svg>
                                Scanning
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                                Scan
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <p className="mt-3 text-sm text-[var(--risk)] animate-fade-in">
                    {error}
                </p>
            )}
        </form>
    );
}
