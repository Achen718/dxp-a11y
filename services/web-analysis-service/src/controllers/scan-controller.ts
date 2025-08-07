import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import AccessibilityScanner from './accessibility-scanner';
import type { AxeResults, ImpactValue } from 'axe-core';

type ImpactKey = Extract<
  ImpactValue,
  'critical' | 'serious' | 'moderate' | 'minor'
>;

export const scanWebsite = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { url, includeScreenshot, includeKeyboardFlow } = (req.body || {}) as {
    url?: string;
    includeScreenshot?: boolean;
    includeKeyboardFlow?: boolean;
  };
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }
  try {
    // Validate URL format
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

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
    if (includeKeyboardFlow) {
      results.keyboardFlow = {
        totalTabStops: 0,
        tabSequence: [],
        analysis: { issues: [], summary: 'Not run' },
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
        keyboardIssues: includeKeyboardFlow ? 0 : 0,
        durationMs: Date.now() - start,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const message =
      e &&
      typeof e === 'object' &&
      'message' in e &&
      typeof (e as { message?: unknown }).message === 'string'
        ? (e as { message: string }).message
        : 'Unknown error';
    const status = message.includes('timeout') ? 504 : 500;
    res.status(status).json({ error: 'Scan failed', message });
  }
};
