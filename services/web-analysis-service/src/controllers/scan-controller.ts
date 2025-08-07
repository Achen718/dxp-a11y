import { Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import AccessibilityScanner from './accessibility-scanner';
import type { AxeResults, ImpactValue } from 'axe-core';

type ImpactKey = Extract<
  ImpactValue,
  'critical' | 'serious' | 'moderate' | 'minor'
>;

const ScanRequestSchema = z.object({
  url: z.url({ error: 'Invalid URL' }),
  includeScreenshot: z.boolean().optional(),
  includeKeyboardFlow: z.boolean().optional(),
});

export const scanWebsite = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parseResult = ScanRequestSchema.safeParse(req.body ?? {});
  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: z.treeifyError(parseResult.error),
    });
    return;
  }
  const { url, includeScreenshot, includeKeyboardFlow } = parseResult.data;

  const start = Date.now();
  const scanId = randomUUID();
  try {
    // Global scan timeout guard (30s)
    const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
      new Promise<T>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Scan timeout')), ms);
        p.then((v) => {
          clearTimeout(t);
          resolve(v);
        }).catch((err) => {
          clearTimeout(t);
          reject(err);
        });
      });

    const scanner = new AccessibilityScanner();
    const { axeResults, domData, screenshotB64 } = await withTimeout(
      scanner.scan(url, {
        includeScreenshot: !!includeScreenshot,
      }),
      30000
    );

    const byImpact: Record<ImpactKey, number> = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    };

    const violations: AxeResults['violations'] = axeResults.violations || [];
    violations.forEach((v) => {
      if (v.impact && byImpact[v.impact] !== undefined) byImpact[v.impact]++;
    });

    // Build results payload with optional sections
    const results: {
      axeResults: AxeResults;
      domData: typeof domData;
      screenshot?: string;
      keyboardFlow?: {
        totalTabStops: number;
        tabSequence: Array<unknown>;
        analysis: { issues: Array<unknown>; summary: string };
      };
    } = {
      axeResults,
      domData,
      screenshot: includeScreenshot ? screenshotB64 : undefined,
    };
    // TODO: Implement keyboard flow analysis
    if (includeKeyboardFlow) {
      results.keyboardFlow = {
        totalTabStops: 0,
        tabSequence: [],
        analysis: {
          issues: [],
          summary: 'Keyboard flow analysis not yet implemented',
        },
      };
    }

    res.json({
      success: true,
      url,
      scanId,
      results,
      summary: {
        totalIssues: violations.length || 0,
        byImpact,
        keyboardIssues: 0, // TODO: Implement keyboard flow analysis
        durationMs: Date.now() - start,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    const status = message.includes('timeout') ? 504 : 500;
    res.status(status).json({ error: 'Scan failed', message });
  }
};
