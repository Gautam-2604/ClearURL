import type { ScanFindings } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AIDescriptionResult {
    description: string;
    targetAudience: string[];
    useCases: string[];
}

/**
 * Generate an AI-powered description of the link using OpenRouter free models
 */
export async function generateAIDescription(
    url: string,
    findings: ScanFindings
): Promise<AIDescriptionResult | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Skip silently if API key is not configured
    if (!apiKey || apiKey.trim() === '') {
        return null;
    }

    const prompt = `Analyze this website and provide a helpful description for users.

URL: ${url}
Page Title: ${findings.title}
Page Description: ${findings.description}
Has HTTPS: ${findings.isHttps ? 'Yes' : 'No'}
Total Links on Page: ${findings.totalLinks}
External Links: ${findings.externalLinks}

Based on this information, provide:
1. A brief, helpful 2-3 sentence description of what this website is about and what it offers
2. Who would find this website useful (list 3-5 target audience types)
3. Common use cases for visiting this site (list 2-4 use cases)

Respond in JSON format only:
{
  "description": "Brief description of the website",
  "targetAudience": ["audience1", "audience2", "audience3"],
  "useCases": ["useCase1", "useCase2"]
}`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://link-checker.app',
                'X-Title': 'Link Checker',
            },
            body: JSON.stringify({
                model: 'liquid/lfm-2.5-1.2b-thinking:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that analyzes websites and provides concise, accurate descriptions. Always respond in valid JSON format only, without any markdown or explanation.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            console.error('OpenRouter API error:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error('No content in OpenRouter response');
            return null;
        }

        // Parse the JSON response
        try {
            // Clean the response - remove markdown code blocks if present
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
            }

            const parsed = JSON.parse(cleanContent);
            return {
                description: parsed.description || 'No description available',
                targetAudience: parsed.targetAudience || [],
                useCases: parsed.useCases || [],
            };
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            // Try to extract meaningful text if JSON parsing fails
            return {
                description: content.substring(0, 200),
                targetAudience: [],
                useCases: [],
            };
        }
    } catch (error) {
        console.error('Failed to generate AI description:', error);
        return null;
    }
}
