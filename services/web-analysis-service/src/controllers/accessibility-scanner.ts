import puppeteer, { Browser, Page } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import type { AxeResults } from 'axe-core';

export interface ImageInfo {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export interface HeadingInfo {
  level: string;
  text: string;
}

export interface DomData {
  title: string;
  headings: HeadingInfo[];
  images: ImageInfo[];
  links: number;
  buttons: number;
  totalElements: number;
}

export interface ScanResult {
  axeResults: AxeResults;
  domData: DomData;
  screenshotB64?: string;
}

export interface ScanOptions {
  includeScreenshot?: boolean;
}

export default class AccessibilityScanner {
  async scan(url: string, options: ScanOptions = {}): Promise<ScanResult> {
    const browser: Browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    const page: Page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // Ensure the DOM is present before running analysis
      await page.waitForSelector('body', { visible: true, timeout: 15000 });

      // Run Axe with a quick retry in case the page wasn't fully ready
      let axeResults: AxeResults;
      try {
        axeResults = await new AxePuppeteer(page).analyze();
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        axeResults = await new AxePuppeteer(page).analyze();
      }
      const domData: DomData = await page.evaluate(() => ({
        title: document.title,
        headings: Array.from(
          document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        ).map((h) => ({
          level: (h as HTMLElement).tagName,
          text: (h as HTMLElement).textContent?.trim() || '',
        })),
        images: Array.from(document.querySelectorAll('img')).map((img) => ({
          src: (img as HTMLImageElement).src,
          alt: (img as HTMLImageElement).alt || '',
          hasAlt: !!(img as HTMLImageElement).alt,
        })),
        links: document.querySelectorAll('a').length,
        buttons: document.querySelectorAll(
          'button, input[type="button"], input[type="submit"]'
        ).length,
        totalElements: document.querySelectorAll('*').length,
      }));

      let screenshotB64: string | undefined;
      if (options.includeScreenshot) {
        screenshotB64 = (
          (await page.screenshot({ fullPage: true })) as Buffer
        ).toString('base64');
      }

      return { axeResults, domData, screenshotB64 };
    } finally {
      await browser.close();
    }
  }
}
