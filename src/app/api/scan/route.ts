import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scanUrl } from '@/lib/scanner';
import { generateVerdict } from '@/lib/verdict';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, ScanResult } from '@/lib/types';

// Request validation schema
const scanRequestSchema = z.object({
    url: z.string().url('Please enter a valid URL').refine(
        (url) => url.startsWith('http://') || url.startsWith('https://'),
        'URL must start with http:// or https://'
    ),
});

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ScanResult>>> {
    const startTime = Date.now();

    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please wait a minute before scanning again.' },
                { status: 429 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = scanRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { url } = validation.data;

        // Log scan started metric
        try {
            await prisma.metric.create({
                data: {
                    eventType: 'scan_started',
                    metadata: { url, ip },
                },
            });
        } catch {
            // Don't fail if metrics can't be recorded
            console.warn('Failed to record scan_started metric');
        }

        // Perform the scan
        const findings = await scanUrl(url);
        const durationMs = Date.now() - startTime;
        const result = generateVerdict(url, findings, durationMs);

        // Store scan result
        try {
            await prisma.scan.create({
                data: {
                    url: result.url,
                    verdict: result.verdict,
                    score: result.score,
                    findings: result.findings as object,
                    durationMs: result.durationMs,
                },
            });

            // Log scan completed metric
            await prisma.metric.create({
                data: {
                    eventType: 'scan_completed',
                    metadata: {
                        url,
                        verdict: result.verdict,
                        score: result.score,
                        durationMs: result.durationMs,
                    },
                },
            });
        } catch {
            // Don't fail if storage fails
            console.warn('Failed to store scan result');
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

        // Log scan failed metric
        try {
            await prisma.metric.create({
                data: {
                    eventType: 'scan_failed',
                    metadata: { error: errorMessage },
                },
            });
        } catch {
            console.warn('Failed to record scan_failed metric');
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
