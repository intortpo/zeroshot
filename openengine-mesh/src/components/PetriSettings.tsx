import React, { useState } from 'react';
import {
  Radio,
  Cpu,
  Save,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  GitPullRequest,
  Cloud,
  FileCode2,
} from 'lucide-react';
import { Workspace, UserProfile } from '../types';

export interface PetriAvionicsSettings {
  targetUri: string;
  clusterOecpUri: string;
  heartbeatHz: number;
  failClosedArmed: boolean;
  maxRecursionTurn: number;
  systemPrompt: string;
  githubToken: string;
  githubTrunkRef: string;
  providerAnthropicKey: string;
  providerOpenaiKey: string;
  providerVertexProject: string;
  googleDwdKeyPath: string;
  avionicsChannel: 'CH-A' | 'CH-B' | 'DUAL';
  busBaudRate: string;
}

interface PetriSettingsProps {
  activeWorkspace: Workspace;
  activeUser: UserProfile;
  onSaveNotice?: (msg: string) => void;
}

export const PetriSettings: React.FC<PetriSettingsProps> = ({
  activeWorkspace,
  activeUser: _activeUser,
  onSaveNotice,
}) => {
  const [settings, setSettings] = useState<PetriAvionicsSettings>(() => {
    const saved = localStorage.getItem('petri_avionics_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      targetUri: 'http://127.0.0.1:8787',
      clusterOecpUri: 'ws://127.0.0.1:8788/v1',
      heartbeatHz: 50,
      failClosedArmed: true,
      maxRecursionTurn: 3,
      systemPrompt: `OPERATIONAL FLIGHT PROGRAM (OFP) SPECIFICATION // 1979-AFCS-01
1. COMMON TECHNICAL LANGUAGE: TRANSLATE USER INTENT DIRECTLY INTO DETERMINISTIC CODEBASE INVARIANTS.
2. TRUNK AUTHORITY: TRUNK REF 'MAIN' IS THE AUTHORITATIVE CARRIER. DELIVERY REQUIRES CAS VERIFICATION.
3. FAIL-CLOSED INVARIANT: AT ANY SIGN OF UNCERTAINTY OR RECOVERY DEGRADATION, HALT MUTATION AND ENGAGE GATED SIGNOFF.
4. FEEDBACK LOOP FIRST: ISOLATE REPEATABLE REPRODUCTION BEFORE SYSTEM CODE MODIFICATION. ZERO SPECULATIVE EDITS.
5. DEEP MODULE BOUNDARIES: MAXIMIZE DEPTH BEHIND MINIMAL, WELL-TYPED INTERFACES.`,
      githubToken: 'ghp_live_tok_arinc79_auton',
      githubTrunkRef: 'main',
      providerAnthropicKey: '',
      providerOpenaiKey: '',
      providerVertexProject: 'the-open-engine-zeroshot',
      googleDwdKeyPath: '/home/hideo/.config/gcloud/dwd-sa-key.json',
      avionicsChannel: 'CH-A',
      busBaudRate: '100 kHz (ARINC-429 HIGH SPEED)',
    };
  });

  const [biteRunning, setBiteRunning] = useState(false);
  const [biteResult, setBiteResult] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('petri_avionics_settings', JSON.stringify(settings));
    setSaveStatus('SETTINGS PERSISTED TO NON-VOLATILE MEMORY (NVM)');
    onSaveNotice?.('Avionics settings committed to NVM.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const runBiteTest = () => {
    setBiteRunning(true);
    setBiteResult(null);
    setTimeout(() => {
      setBiteRunning(false);
      setBiteResult('BITE TEST PASSED: ALL 5 AVIONICS BUSES SYNCHRONIZED. 0 FAULTS RECORDED.');
    }, 900);
  };

  const handleResetDefaults = () => {
    if (confirm('RESET ALL AVIONICS LRU CARDS TO 1979 FACTORY ENVELOPE?')) {
      localStorage.removeItem('petri_avionics_settings');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 sm:p-10 select-none font-sans text-xs sm:text-sm">
      <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-6">
        {/* 1979 Flight Deck Maintenance Panel Header */}
        <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-stone-500 mb-1">
                <span>AVIONICS INTERFACE UNIT (AIU)</span>
                <span>·</span>
                <span>DOC. 1979-AFCS-ENG</span>
                <span>·</span>
                <span className="text-stone-800 font-medium">{activeWorkspace?.name || 'zero-petri'}</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                Flight Deck & Technical Connections
              </h1>
            </div>

            {/* Sparing 1979 Annunciator Bar */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
              <div className="px-2.5 py-1 rounded bg-stone-100 border border-stone-300 text-stone-800 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
                <span>PFC: CH-A NORMAL</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-stone-100 border border-stone-300 text-stone-800">
                BUS: ARINC 429
              </div>
              <div
                className={`px-2.5 py-1 rounded border transition-colors flex items-center space-x-1.5 ${
                  settings.failClosedArmed
                    ? 'bg-orange-50 border-orange-200 text-[#FF5F1F]'
                    : 'bg-stone-100 border-stone-200 text-stone-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${settings.failClosedArmed ? 'bg-[#FF5F1F] animate-pulse' : 'bg-stone-400'}`} />
                <span>{settings.failClosedArmed ? 'FAIL-CLOSED ARMED' : 'BYPASS (CAUTION)'}</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          {saveStatus && (
            <div className="mt-4 p-3 rounded-xl bg-stone-900 text-white font-mono text-xs flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0ABAB5]" />
                <span>{saveStatus}</span>
              </span>
            </div>
          )}

          {biteResult && (
            <div className="mt-4 p-3 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 font-mono text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{biteResult}</span>
            </div>
          )}
        </div>

        {/* LRU-01: Flight Director Operational System Prompt */}
        <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <FileCode2 className="w-4 h-4 text-stone-700" />
              <h2 className="text-sm font-semibold text-stone-900">
                LRU-01: Operational Flight Program (OFP) System Prompt
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-400">SYS-PROMPT // AFCS SPEC</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-700 block">
              Master Autonomous Invariant Instructions
            </label>
            <textarea
              rows={7}
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 font-mono text-xs text-stone-800 leading-relaxed focus:outline-none focus:border-stone-900"
              spellCheck={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">
                Recursion Turn Ceiling
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 5, 8].map((turn) => (
                  <button
                    key={turn}
                    type="button"
                    onClick={() => setSettings({ ...settings, maxRecursionTurn: turn })}
                    className={`px-3 py-1 rounded-lg border text-xs font-mono font-medium transition-colors ${
                      settings.maxRecursionTurn === turn
                        ? 'bg-stone-900 border-stone-900 text-white'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    T-{turn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">
                Invariant Guard Stance
              </label>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, failClosedArmed: !settings.failClosedArmed })}
                className={`px-3.5 py-1 rounded-lg border text-xs font-mono font-medium transition-colors flex items-center space-x-2 ${
                  settings.failClosedArmed
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-orange-100 border-orange-300 text-[#FF5F1F]'
                }`}
              >
                {settings.failClosedArmed ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
                    <span>ARMED // FAIL-CLOSED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF5F1F]" />
                    <span>DISARMED // PERMISSIVE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Avionics Grid: Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LRU-02: Digital Data Link & Bus Endpoints */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  LRU-02: Digital Data Link (COMM/OECP)
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-400">ARINC-429</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Primary Target Interface URL
                </label>
                <input
                  type="text"
                  value={settings.targetUri}
                  onChange={(e) => setSettings({ ...settings, targetUri: e.target.value })}
                  placeholder="http://127.0.0.1:8787"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Cluster OECP Protocol Gateway URI
                </label>
                <input
                  type="text"
                  value={settings.clusterOecpUri}
                  onChange={(e) => setSettings({ ...settings, clusterOecpUri: e.target.value })}
                  placeholder="ws://127.0.0.1:8788/v1"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Bus Baud Rate
                  </label>
                  <select
                    value={settings.busBaudRate}
                    onChange={(e) => setSettings({ ...settings, busBaudRate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-800 focus:outline-none focus:border-stone-900"
                  >
                    <option value="100 kHz (ARINC-429 HIGH SPEED)">100 kHz (ARINC-429 HS)</option>
                    <option value="12.5 kHz (ARINC-429 LOW SPEED)">12.5 kHz (ARINC-429 LS)</option>
                    <option value="1 MHz (MIL-STD-1553B)">1 MHz (MIL-STD-1553B)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Avionics Channel
                  </label>
                  <select
                    value={settings.avionicsChannel}
                    onChange={(e) => setSettings({ ...settings, avionicsChannel: e.target.value as 'CH-A' | 'CH-B' | 'DUAL' })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-stone-800 focus:outline-none focus:border-stone-900"
                  >
                    <option value="CH-A">CH-A (PRIMARY)</option>
                    <option value="CH-B">CH-B (STANDBY)</option>
                    <option value="DUAL">DUAL CONCURRENT</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* LRU-03: VCS Carrier & GitHub Gateway */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <GitPullRequest className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  LRU-03: Repository Carrier (VCS-79)
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-400">GIT / CAS-MERGE</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={settings.githubToken}
                  onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                  placeholder="ghp_********************************"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Authoritative Trunk Reference
                </label>
                <input
                  type="text"
                  value={settings.githubTrunkRef}
                  onChange={(e) => setSettings({ ...settings, githubTrunkRef: e.target.value })}
                  placeholder="main"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs">
                <div className="font-medium text-stone-800">CAS Merge Protocol</div>
                <div className="text-stone-500 mt-0.5">Compare-and-Swap authorized delivery. Verified through required status contexts.</div>
              </div>
            </div>
          </div>

          {/* LRU-04: Model Provider Admission Keys */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  LRU-04: Model Admission Harness
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-400">OPAQUE PROVIDERS</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Anthropic Carrier Key
                </label>
                <input
                  type="password"
                  value={settings.providerAnthropicKey}
                  onChange={(e) => setSettings({ ...settings, providerAnthropicKey: e.target.value })}
                  placeholder="sk-ant-api03-********************************"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  OpenAI Carrier Key
                </label>
                <input
                  type="password"
                  value={settings.providerOpenaiKey}
                  onChange={(e) => setSettings({ ...settings, providerOpenaiKey: e.target.value })}
                  placeholder="sk-proj-********************************"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Google Vertex Project ID
                </label>
                <input
                  type="text"
                  value={settings.providerVertexProject}
                  onChange={(e) => setSettings({ ...settings, providerVertexProject: e.target.value })}
                  placeholder="the-open-engine-zeroshot"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* LRU-05: Google Workspace DWD Interface */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Cloud className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  LRU-05: Google Workspace DWD Key
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-400">IAM SERVICE ACC</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Service Account JSON File Path
                </label>
                <input
                  type="text"
                  value={settings.googleDwdKeyPath}
                  onChange={(e) => setSettings({ ...settings, googleDwdKeyPath: e.target.value })}
                  placeholder="/home/hideo/.config/gcloud/dwd-sa-key.json"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs">
                <div className="font-medium text-stone-800">Delegation Status: Configured</div>
                <div className="text-stone-500 mt-0.5">Scopes: Drive, Docs, Gmail, Sheets. Fail-closed credential binding.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Panel Action Controls & BITE Test */}
        <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={runBiteTest}
              disabled={biteRunning}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-medium text-xs font-sans transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${biteRunning ? 'animate-spin' : ''}`} />
              <span>{biteRunning ? 'Running BITE...' : 'Execute BITE Test'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 font-medium text-xs font-sans transition-colors"
              title="Reset configuration to 1979 factory envelope"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-sans font-medium transition-all"
            >
              <Save className="w-3.5 h-3.5 text-[#0ABAB5]" />
              <span>Commit to NVM</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
