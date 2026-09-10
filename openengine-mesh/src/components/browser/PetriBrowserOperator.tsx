import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Camera,
  Table,
  CheckCircle2,
  FolderOpen,
  Hand,
  Code2,
  Play,
  Pause,
  Copy,
  Download,
  Activity,
  Laptop,
} from 'lucide-react';
import { browserOperator, ExtractedDataResult } from '../../services/browserOperatorService';
import {
  playwrightBrowserService,
  PlaywrightSession,
} from '../../services/playwrightBrowserService';

interface PetriBrowserOperatorProps {
  onDataLanded?: (result: ExtractedDataResult) => void;
  className?: string;
}

export const PetriBrowserOperator: React.FC<PetriBrowserOperatorProps> = ({
  onDataLanded,
  className = '',
}) => {
  const [operatorTab, setOperatorTab] = useState<'live' | 'playwright_code' | 'steps' | 'network'>('live');
  const [session, setSession] = useState<PlaywrightSession>(() => playwrightBrowserService.getSession());
  const [url, setUrl] = useState(session.url);
  const [activeUrl, setActiveUrl] = useState(session.url);
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanTakeover, setIsHumanTakeover] = useState(false);
  const [pendingDomainApproval, setPendingDomainApproval] = useState<string | null>(null);
  const [landedToast, setLandedToast] = useState<string | null>(null);
  const [history, setHistory] = useState<ExtractedDataResult[]>(() => browserOperator.getExtractedResults());
  const [copiedCode, setCopiedCode] = useState(false);

  const handleNavigate = (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    setUrl(clean);

    // Check domain approval gate
    if (!browserOperator.isDomainApproved(clean)) {
      try {
        const domain = new URL(clean).hostname;
        setPendingDomainApproval(domain);
        return;
      } catch {}
    }

    setIsLoading(true);
    setTimeout(() => {
      setActiveUrl(clean);
      setIsLoading(false);
    }, 450);
  };

  const handleApproveDomain = (always = true) => {
    if (pendingDomainApproval) {
      browserOperator.approveDomain(pendingDomainApproval, always);
      setPendingDomainApproval(null);
      setActiveUrl(url);
    }
  };

  const handleExtractTable = async () => {
    setIsLoading(true);
    const mockTableData = `Subject Code\tSubject Name\tMax Score\tPassing Threshold\tEnrolled\tDeficit Count
THLang\tThai Language\t20\t10.0 (50%)\t849\t42
MatTH\tMath Thai\t30\t15.0 (50%)\t849\t88
SSTH\tSocial Studies Thai\t20\t10.0 (50%)\t849\t31
ESL\tEnglish as a Second Language\t40\t20.0 (50%)\t849\t64
GW\tGrammar & Writing\t30\t15.0 (50%)\t849\t79
MatIP\tMathematics IP\t30\t15.0 (50%)\t849\t112
SciIP\tScience IP\t30\t15.0 (50%)\t849\t58
Man\tMandarin\t30\t15.0 (50%)\t849\t94`;

    const title = `BBS Extracted Curriculum Thresholds (${new URL(activeUrl).hostname}).xlsx`;
    const result = await browserOperator.landInWorkspace(activeUrl, title, mockTableData, 'table');
    setHistory(browserOperator.getExtractedResults());
    setIsLoading(false);
    setLandedToast(`Data landed directly in Workspace: 📁 ${result.targetFolder}/${result.title} (AES-256-GCM Encrypted)`);
    onDataLanded?.(result);
  };

  const handleCaptureScreenshot = async () => {
    setIsLoading(true);
    const screenshotData = `[PNG Visual Capture: ${activeUrl} · Dimensions: 1440x900 · DOM Elements: 320 · SHA256: 7f8a92bce]`;
    const title = `Browser Snapshot - ${new URL(activeUrl).hostname}.png`;
    const result = await browserOperator.landInWorkspace(activeUrl, title, screenshotData, 'screenshot');
    setHistory(browserOperator.getExtractedResults());
    setIsLoading(false);
    setLandedToast(`Screenshot landed directly in Workspace: 📁 ${result.targetFolder}/${result.title}`);
    onDataLanded?.(result);
  };

  const handleRunPlaywright = async () => {
    await playwrightBrowserService.executeSession(
      (updated) => setSession({ ...updated }),
      (_pausedStep) => setIsHumanTakeover(true)
    );
  };

  const handleResumeTakeover = () => {
    setIsHumanTakeover(false);
    playwrightBrowserService.resumeAfterTakeover((updated) => setSession({ ...updated }));
  };

  const generatedScript = playwrightBrowserService.generatePlaywrightScript(session);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportScript = () => {
    const blob = new Blob([generatedScript], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petri-operator-test.spec.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden select-none ${className}`}>
      {/* Top Browser Chrome Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation & Isolated Badge */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-slate-400">
            <button className="p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleNavigate(url)}
              className="p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>

          {/* Green-labeled Tab Group Isolated Badge */}
          <div className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono text-[10px] font-bold flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Isolated Tab Group (Sandboxed)</span>
          </div>
        </div>

        {/* Omnibox / URL Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(url);
          }}
          className="flex-1 max-w-xl mx-2"
        >
          <div className="relative flex items-center">
            <Lock className="w-3 h-3 text-emerald-400 absolute left-3" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL or search term..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </form>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          {/* Playwright Run Controls */}
          {session.isRunning ? (
            <button
              onClick={() => playwrightBrowserService.stopSession()}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Stop Script</span>
            </button>
          ) : (
            <button
              onClick={handleRunPlaywright}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Playwright</span>
            </button>
          )}

          {/* Human Takeover Mode Toggle */}
          <button
            onClick={() => {
              if (isHumanTakeover) {
                handleResumeTakeover();
              } else {
                setIsHumanTakeover(true);
              }
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isHumanTakeover
                ? 'bg-amber-600 text-white shadow-xs animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Pause agent and take the wheel for 2FA / CAPTCHA"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{isHumanTakeover ? 'Hand Wheel Back' : 'Take Wheel (2FA)'}</span>
          </button>

          {/* Extract Table to Workspace */}
          <button
            onClick={handleExtractTable}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            title="Extract table data directly into Workspace Vault"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Extract Table</span>
          </button>

          {/* Screenshot to Workspace */}
          <button
            onClick={handleCaptureScreenshot}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Save screenshot directly into Images & Visual Assets"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Screenshot</span>
          </button>
        </div>
      </div>

      {/* Operator Sub-Navigation & Browser Environment Settings */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setOperatorTab('live')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              operatorTab === 'live'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Viewport
          </button>
          <button
            onClick={() => setOperatorTab('playwright_code')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              operatorTab === 'playwright_code'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Playwright Code (.ts)</span>
          </button>
          <button
            onClick={() => setOperatorTab('steps')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
              operatorTab === 'steps'
                ? 'bg-teal-950 text-teal-300 border border-teal-800 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Steps ({session.steps.length})</span>
          </button>
          <button
            onClick={() => setOperatorTab('network')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              operatorTab === 'network'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Network / HAR ({session.networkRequests.length})
          </button>
        </div>

        {/* Engine, Headed & Viewport Toggles */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1">
            <span>Engine:</span>
            <select
              value={session.browserType}
              onChange={(e) => {
                const val = e.target.value as any;
                playwrightBrowserService.setBrowserType(val);
                setSession({ ...playwrightBrowserService.getSession() });
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-slate-200"
            >
              <option value="chromium">Chromium</option>
              <option value="firefox">Firefox</option>
              <option value="webkit">WebKit</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span>Mode:</span>
            <button
              onClick={() => {
                playwrightBrowserService.setHeaded(!session.headed);
                setSession({ ...playwrightBrowserService.getSession() });
              }}
              className={`px-2 py-0.5 rounded border text-[10px] ${
                session.headed
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {session.headed ? 'Headed (Interactive)' : 'Headless'}
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <Laptop className="w-3 h-3 text-slate-400" />
            <span>{session.viewport.width}x{session.viewport.height}</span>
          </div>
        </div>
      </div>

      {/* Human Takeover Notice Banner */}
      {isHumanTakeover && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs text-amber-200 font-mono animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <Hand className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Human Takeover Active (page.pause())</strong>: Autonomous agent is paused. Handle your 2FA, biometric login, or CAPTCHA in the viewport below, then click "Hand Wheel Back" to resume Playwright.
            </span>
          </div>
          <button
            onClick={handleResumeTakeover}
            className="px-2 py-0.5 rounded bg-amber-700 hover:bg-amber-600 text-white font-bold cursor-pointer"
          >
            Resume Agent
          </button>
        </div>
      )}

      {/* Workspace Landing Toast */}
      {landedToast && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 font-mono animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{landedToast}</span>
          </div>
          <button
            onClick={() => setLandedToast(null)}
            className="text-emerald-400 hover:text-white font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab 1: Live Browser Viewport */}
      {operatorTab === 'live' && (
        <div className="relative min-h-[360px] max-h-[440px] overflow-y-auto p-6 bg-slate-900/40">
          {pendingDomainApproval ? (
            /* Domain Permission Gate Modal */
            <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Permission Requested</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Petri Browser Operator is attempting to navigate to unapproved domain:
                </p>
                <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-300 truncate">
                  {pendingDomainApproval}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                "Asks before every site: Every site triggers a permission prompt. You approve, then it goes. Your other tabs, password manager, and banking pages remain completely out of reach."
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setPendingDomainApproval(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Deny Access
                </button>
                <button
                  onClick={() => handleApproveDomain(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-800 cursor-pointer"
                >
                  Allow Once
                </button>
                <button
                  onClick={() => handleApproveDomain(true)}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
                >
                  Always Allow Domain
                </button>
              </div>
            </div>
          ) : (
            /* Live Page Content Simulation */
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-teal-400 font-bold tracking-wider">
                    Verified School Intranet Portal
                  </span>
                  <h2 className="text-base font-bold text-slate-100 mt-0.5">
                    AY2026 Semester 1 Curriculum Evaluation Matrix
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Bangkok Bilingual School · Academic Operations & Psychometric Scorebook
                  </p>
                </div>
                <div className="text-right font-mono text-[11px] text-slate-400">
                  <div className="text-emerald-400 font-bold">HTTPS Verified</div>
                  <div>Server: bbs-cloud-prod-1</div>
                </div>
              </div>

              {/* Simulated Data Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    Subject Benchmark Registry (Table DOM Node #curriculum-matrix)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    8 Core Rows Detected
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5 text-right">Max Mark</th>
                      <th className="p-2.5 text-right">Passing (50%)</th>
                      <th className="p-2.5 text-right">Enrolled</th>
                      <th className="p-2.5 text-right">Deficit Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-teal-400">THLang</td>
                      <td className="p-2.5">Thai Language</td>
                      <td className="p-2.5 text-right">20</td>
                      <td className="p-2.5 text-right">10.0</td>
                      <td className="p-2.5 text-right">849</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">42</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-teal-400">MatTH</td>
                      <td className="p-2.5">Math Thai</td>
                      <td className="p-2.5 text-right">30</td>
                      <td className="p-2.5 text-right">15.0</td>
                      <td className="p-2.5 text-right">849</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">88</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-teal-400">ESL</td>
                      <td className="p-2.5">English as a Second Language</td>
                      <td className="p-2.5 text-right">40</td>
                      <td className="p-2.5 text-right">20.0</td>
                      <td className="p-2.5 text-right">849</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">64</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-teal-400">GW</td>
                      <td className="p-2.5">Grammar & Writing</td>
                      <td className="p-2.5 text-right">30</td>
                      <td className="p-2.5 text-right">15.0</td>
                      <td className="p-2.5 text-right">849</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">79</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40 bg-rose-950/20">
                      <td className="p-2.5 font-bold text-rose-400">MatIP</td>
                      <td className="p-2.5">Mathematics IP</td>
                      <td className="p-2.5 text-right">30</td>
                      <td className="p-2.5 text-right">15.0</td>
                      <td className="p-2.5 text-right">849</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">112</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40 bg-rose-950/20">
                      <td className="p-2.5 font-bold text-rose-400">Man</td>
                      <td className="p-2.5">Mandarin</td>
                      <td className="p-2.5 text-right">30</td>
                      <td className="p-2.5 text-right">15.0</td>
                      <td className="p-2.5 text-right">849</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">94</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Playwright Code View */}
      {operatorTab === 'playwright_code' && (
        <div className="p-6 bg-slate-950 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-slate-100 flex items-center space-x-2">
                <span>Playwright Test Script (.spec.ts)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px]">
                  @playwright/test standard
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Runnable in terminal via `npx playwright test` or embedded in DevContainer workflows.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyScript}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleExportScript}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .spec.ts</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 overflow-x-auto leading-relaxed max-h-[380px]">
            <code>{generatedScript}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Playwright Steps Timeline */}
      {operatorTab === 'steps' && (
        <div className="p-6 bg-slate-900/40 space-y-3 max-h-[440px] overflow-y-auto font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400">Playwright Step Pipeline Execution Ledger</span>
            <span className="text-teal-400">
              {session.steps.filter((s) => s.status === 'completed').length} / {session.steps.length} Steps Executed
            </span>
          </div>

          {session.steps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                session.currentStepIndex === idx
                  ? 'bg-indigo-950/60 border-indigo-600 ring-1 ring-indigo-500'
                  : step.status === 'completed'
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-slate-950 border-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-slate-100 flex items-center space-x-2">
                    <span>{step.label}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-teal-300 text-[9px] uppercase">
                      {step.action}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-lg">
                    <code>{step.codeSnippet}</code>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-[11px]">
                {step.durationMs && (
                  <span className="text-slate-400">{step.durationMs}ms</span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                    step.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : step.status === 'running'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse'
                      : step.status === 'paused_for_human'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-bounce'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Network Requests & HAR Traces */}
      {operatorTab === 'network' && (
        <div className="p-6 bg-slate-900/40 space-y-3 max-h-[440px] overflow-y-auto font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400">Network Request Interception & Telemetry</span>
            <span className="text-emerald-400">Total: {session.networkRequests.length} requests</span>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            {session.networkRequests.map((req) => (
              <div key={req.id} className="p-2.5 flex items-center justify-between hover:bg-slate-900/60">
                <div className="flex items-center space-x-3 truncate">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-teal-300">
                    {req.method}
                  </span>
                  <span className="text-slate-200 truncate max-w-md">{req.url}</span>
                </div>
                <div className="flex items-center space-x-4 text-[11px]">
                  <span className="text-slate-400">{req.resourceType}</span>
                  <span className="text-slate-400">{req.durationMs}ms</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Workspace Landing History Bar */}
      {history.length > 0 && (
        <div className="bg-slate-900 border-t border-slate-800 p-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center space-x-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Workspace Landed Artifacts ({history.length})</span>
            </span>
            <span className="text-[10px] text-slate-500">Results persist in Federated Data Store</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono shrink-0 max-w-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200 truncate">{item.title}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Encrypted
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>📁 {item.targetFolder}</span>
                  <span>{item.fileSize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
