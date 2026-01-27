import { chromium, Browser, Page } from 'playwright';

export interface ScreenshotConfig {
  url: string;
  selector?: string;
  annotations?: Array<{
    x: number;
    y: number;
    text: string;
    type: 'callout' | 'highlight' | 'arrow';
  }>;
  filename: string;
  viewport?: { width: number; height: number };
}

export class ScreenshotGenerator {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async captureScreenshot(config: ScreenshotConfig): Promise<Buffer> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage({
      viewport: config.viewport || { width: 1280, height: 720 }
    });

    try {
      // Navigate to the page
      await page.goto(config.url, { waitUntil: 'networkidle' });

      // Wait for any specific elements to load
      if (config.selector) {
        await page.waitForSelector(config.selector);
      }

      // Add annotations if specified
      if (config.annotations) {
        await this.addAnnotations(page, config.annotations);
      }

      // Take the screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: !config.selector
      });

      return screenshot;
    } finally {
      await page.close();
    }
  }

  async captureElementScreenshot(
    config: ScreenshotConfig & { selector: string }
  ): Promise<Buffer> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage({
      viewport: config.viewport || { width: 1280, height: 720 }
    });

    try {
      await page.goto(config.url, { waitUntil: 'networkidle' });
      await page.waitForSelector(config.selector);

      const element = page.locator(config.selector);
      const screenshot = await element.screenshot({ type: 'png' });

      return screenshot;
    } finally {
      await page.close();
    }
  }

  async captureWorkflow(
    steps: Array<{
      url: string;
      action: 'click' | 'fill' | 'wait' | 'navigate';
      selector?: string;
      value?: string;
      description: string;
    }>,
    outputPath: string
  ): Promise<string[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage({
      viewport: { width: 1280, height: 720 }
    });

    const screenshots: string[] = [];

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        switch (step.action) {
          case 'navigate':
            await page.goto(step.url, { waitUntil: 'networkidle' });
            break;

          case 'click':
            if (step.selector) {
              await page.click(step.selector);
              await page.waitForTimeout(1000); // Wait for UI changes
            }
            break;

          case 'fill':
            if (step.selector && step.value) {
              await page.fill(step.selector, step.value);
            }
            break;

          case 'wait':
            if (step.selector) {
              await page.waitForSelector(step.selector);
            } else {
              await page.waitForTimeout(2000);
            }
            break;
        }

        // Capture screenshot after each step
        const filename = `${outputPath}/step-${i + 1}-${step.description.replace(/\s+/g, '-').toLowerCase()}.png`;
        await page.screenshot({ path: filename, type: 'png' });
        screenshots.push(filename);
      }

      return screenshots;
    } finally {
      await page.close();
    }
  }

  private async addAnnotations(
    page: Page,
    annotations: Array<{
      x: number;
      y: number;
      text: string;
      type: 'callout' | 'highlight' | 'arrow';
    }>
  ): Promise<void> {
    // Inject CSS and JavaScript for annotations
    await page.addStyleTag({
      content: `
        .gemdesk-annotation {
          position: absolute;
          z-index: 10000;
          pointer-events: none;
        }

        .gemdesk-callout {
          background: #ff6b6b;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .gemdesk-highlight {
          border: 2px solid #ff6b6b;
          box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
          border-radius: 4px;
        }

        .gemdesk-arrow {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 15px solid #ff6b6b;
        }
      `
    });

    // Add annotations to the page
    await page.evaluate((annotations) => {
      annotations.forEach((annotation) => {
        const element = document.createElement('div');
        element.className = `gemdesk-annotation gemdesk-${annotation.type}`;
        element.style.left = `${annotation.x}px`;
        element.style.top = `${annotation.y}px`;

        if (annotation.type === 'callout') {
          element.textContent = annotation.text;
        }

        document.body.appendChild(element);
      });
    }, annotations);

    // Wait for annotations to render
    await page.waitForTimeout(500);
  }
}