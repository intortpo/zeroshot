/**
 * Playwright Browser Operator Engine
 * Provides automated script generation, step-by-step execution,
 * network interception, locator synthesis, and human takeover (page.pause())
 * for school intranet and web workflows.
 */

export interface PlaywrightStep {
  id: string;
  action:
    | 'goto'
    | 'locator_click'
    | 'locator_fill'
    | 'wait_for_selector'
    | 'screenshot'
    | 'evaluate'
    | 'extract_table'
    | 'pause';
  label: string;
  target: string;
  value?: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused_for_human';
  durationMs?: number;
  error?: string;
  codeSnippet: string;
}

export interface NetworkRequestItem {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: number;
  durationMs: number;
  timestamp: number;
  resourceType: 'document' | 'xhr' | 'fetch' | 'script' | 'stylesheet' | 'image';
}

export interface PlaywrightSession {
  id: string;
  name: string;
  browserType: 'chromium' | 'firefox' | 'webkit';
  headed: boolean;
  viewport: { width: number; height: number };
  url: string;
  steps: PlaywrightStep[];
  logs: string[];
  networkRequests: NetworkRequestItem[];
  isRunning: boolean;
  isPaused: boolean;
  currentStepIndex: number;
}

export const SAMPLE_PLAYWRIGHT_STEPS: PlaywrightStep[] = [
  {
    id: 'step-1',
    action: 'goto',
    label: 'Navigate to BBS Intranet Gradebook',
    target: 'https://portal.bbs.ac.th/admin/grades-2026',
    status: 'completed',
    durationMs: 480,
    codeSnippet: `await page.goto('https://portal.bbs.ac.th/admin/grades-2026', { waitUntil: 'domcontentloaded' });`,
  },
  {
    id: 'step-2',
    action: 'wait_for_selector',
    label: 'Wait for Academic Roster Grid',
    target: '#gradebook-datatable',
    status: 'completed',
    durationMs: 210,
    codeSnippet: `await page.waitForSelector('#gradebook-datatable', { state: 'visible', timeout: 5000 });`,
  },
  {
    id: 'step-3',
    action: 'locator_fill',
    label: 'Filter by AY2026 Semester 1',
    target: 'input[data-testid="term-filter"]',
    value: 'AY2026-Sem1',
    status: 'completed',
    durationMs: 140,
    codeSnippet: `await page.locator('input[data-testid="term-filter"]').fill('AY2026-Sem1');`,
  },
  {
    id: 'step-4',
    action: 'locator_click',
    label: 'Click Apply Filters',
    target: 'button:has-text("Apply Filters")',
    status: 'completed',
    durationMs: 320,
    codeSnippet: `await page.getByRole('button', { name: 'Apply Filters' }).click();`,
  },
  {
    id: 'step-5',
    action: 'extract_table',
    label: 'Scrape Midterm Scores Table',
    target: 'table.gradebook-table',
    status: 'completed',
    durationMs: 190,
    codeSnippet: `const tableData = await page.$$eval('table.gradebook-table tr', rows => 
  rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => c.textContent?.trim() || ''))
);`,
  },
  {
    id: 'step-6',
    action: 'screenshot',
    label: 'Capture Audit Verification Fullpage Screenshot',
    target: 'vault/grades-audit-2026.png',
    status: 'completed',
    durationMs: 410,
    codeSnippet: `await page.screenshot({ path: 'vault/grades-audit-2026.png', fullPage: true });`,
  },
];

export const SAMPLE_NETWORK_REQUESTS: NetworkRequestItem[] = [
  {
    id: 'req-1',
    url: 'https://portal.bbs.ac.th/admin/grades-2026',
    method: 'GET',
    status: 200,
    durationMs: 240,
    timestamp: Date.now() - 5000,
    resourceType: 'document',
  },
  {
    id: 'req-2',
    url: 'https://portal.bbs.ac.th/api/v2/roster?term=AY2026-Sem1',
    method: 'GET',
    status: 200,
    durationMs: 180,
    timestamp: Date.now() - 4200,
    resourceType: 'xhr',
  },
  {
    id: 'req-3',
    url: 'https://portal.bbs.ac.th/api/v2/grades/summary',
    method: 'GET',
    status: 200,
    durationMs: 310,
    timestamp: Date.now() - 3800,
    resourceType: 'fetch',
  },
  {
    id: 'req-4',
    url: 'https://portal.bbs.ac.th/assets/app.min.js',
    method: 'GET',
    status: 200,
    durationMs: 85,
    timestamp: Date.now() - 4800,
    resourceType: 'script',
  },
];

class PlaywrightBrowserService {
  private session: PlaywrightSession = {
    id: 'pw-session-1',
    name: 'BBS Academic Portal Harvest',
    browserType: 'chromium',
    headed: true,
    viewport: { width: 1280, height: 800 },
    url: 'https://portal.bbs.ac.th/admin/grades-2026',
    steps: [...SAMPLE_PLAYWRIGHT_STEPS],
    logs: [
      '[Playwright] Launching Chromium (channel: chrome, headless: false, slowMo: 50ms)...',
      '[Playwright] Context created with viewport 1280x800',
      '[Playwright] page.goto("https://portal.bbs.ac.th/admin/grades-2026") -> 200 OK',
      '[Playwright] Element #gradebook-datatable detected and hydrated',
      '[Playwright] Scraped 849 tabular grade records successfully',
      '[Playwright] Full-page screenshot saved to vault/grades-audit-2026.png',
    ],
    networkRequests: [...SAMPLE_NETWORK_REQUESTS],
    isRunning: false,
    isPaused: false,
    currentStepIndex: -1,
  };

  public getSession(): PlaywrightSession {
    return this.session;
  }

  public setBrowserType(type: 'chromium' | 'firefox' | 'webkit'): void {
    this.session.browserType = type;
  }

  public setHeaded(headed: boolean): void {
    this.session.headed = headed;
  }

  public setViewport(width: number, height: number): void {
    this.session.viewport = { width, height };
  }

  public addStep(step: Omit<PlaywrightStep, 'id' | 'status'>): PlaywrightStep {
    const newStep: PlaywrightStep = {
      ...step,
      id: `pw-step-${Date.now()}`,
      status: 'idle',
    };
    this.session.steps.push(newStep);
    return newStep;
  }

  /**
   * Generates a fully compliant, executable TypeScript Playwright test script
   */
  public generatePlaywrightScript(session?: PlaywrightSession): string {
    const s = session || this.session;
    const stepsCode = s.steps.map((st) => `  // Step: ${st.label}\n  ${st.codeSnippet}`).join('\n\n');

    return `import { test, expect } from '@playwright/test';

test.describe('Petri Browser Operator: ${s.name}', () => {
  test.use({
    viewport: { width: ${s.viewport.width}, height: ${s.viewport.height} },
    headless: ${!s.headed},
    screenshot: 'on',
    trace: 'on',
  });

  test('Execute automated browser workflow', async ({ page, context }) => {
    // Enable request logging & HAR capture
    page.on('request', req => console.log(\`[\${req.method()}] \${req.url()}\`));
    page.on('response', res => console.log(\`[\${res.status()}] \${res.url()}\`));

${stepsCode}

    console.log('[Petri] Playwright workflow completed successfully');
  });
});
`;
  }

  /**
   * Executes Playwright steps sequentially with live callbacks
   */
  public async executeSession(
    onStepChange: (session: PlaywrightSession) => void,
    onPauseRequired?: (step: PlaywrightStep) => void
  ): Promise<void> {
    this.session.isRunning = true;
    this.session.isPaused = false;
    this.session.logs.push(`[Playwright] Starting session execution on ${this.session.browserType}...`);

    for (let i = 0; i < this.session.steps.length; i++) {
      if (!this.session.isRunning) break;

      this.session.currentStepIndex = i;
      const step = this.session.steps[i];
      step.status = 'running';
      onStepChange({ ...this.session });

      if (step.action === 'pause') {
        step.status = 'paused_for_human';
        this.session.isPaused = true;
        this.session.logs.push(`[Playwright] page.pause() invoked at step "${step.label}" - human takeover active.`);
        onStepChange({ ...this.session });
        if (onPauseRequired) onPauseRequired(step);
        return;
      }

      // Simulate step duration
      const duration = Math.floor(Math.random() * 250) + 120;
      await new Promise((r) => setTimeout(r, duration));
      step.durationMs = duration;
      step.status = 'completed';
      this.session.logs.push(`[Playwright] Completed: ${step.label} (${duration}ms)`);
      onStepChange({ ...this.session });
    }

    this.session.isRunning = false;
    this.session.currentStepIndex = -1;
    this.session.logs.push('[Playwright] All automation steps completed cleanly.');
    onStepChange({ ...this.session });
  }

  /**
   * Resumes execution after human takeover (e.g. 2FA cleared)
   */
  public resumeAfterTakeover(onStepChange: (session: PlaywrightSession) => void): void {
    if (this.session.currentStepIndex >= 0) {
      this.session.steps[this.session.currentStepIndex].status = 'completed';
    }
    this.session.isPaused = false;
    this.session.logs.push('[Playwright] Human takeover resumed. Continuing automated steps...');
    this.executeSession(onStepChange);
  }

  public stopSession(): void {
    this.session.isRunning = false;
    this.session.isPaused = false;
    this.session.logs.push('[Playwright] Session execution manually stopped.');
  }
}

export const playwrightBrowserService = new PlaywrightBrowserService();
