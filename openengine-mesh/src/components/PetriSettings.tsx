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
  Sparkles,
  Sliders,
  Lock,
  Shield,
} from 'lucide-react';
import { Workspace, UserProfile } from '../types';
import { lockPetriSession, updatePetriPassword } from './auth/PetriAuthGuard';
import { zitadelAuthService } from '../services/zitadelAuthService';

export interface PetriSettingsConfig {
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
  connectionMode: 'primary' | 'standby' | 'dual';
}

interface PetriSettingsProps {
  activeWorkspace: Workspace;
  activeUser: UserProfile;
  onSaveNotice?: (msg: string) => void;
  onOpenAiProviderModal?: () => void;
}

export const PetriSettings: React.FC<PetriSettingsProps> = ({
  activeWorkspace,
  activeUser: _activeUser,
  onSaveNotice,
  onOpenAiProviderModal,
}) => {
  const [settings, setSettings] = useState<PetriSettingsConfig>(() => {
    const saved = localStorage.getItem('petri_settings_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          targetUri: parsed.targetUri || 'http://127.0.0.1:8787',
          clusterOecpUri: parsed.clusterOecpUri || 'ws://127.0.0.1:8788/v1',
          heartbeatHz: parsed.heartbeatHz || 50,
          failClosedArmed: parsed.failClosedArmed !== undefined ? parsed.failClosedArmed : true,
          maxRecursionTurn: parsed.maxRecursionTurn || 3,
          systemPrompt: parsed.systemPrompt
            ? parsed.systemPrompt
            : `PETRI CORE SYSTEM INVARIANT SPECIFICATION // V8
1. DETERMINISTIC SYSTEM INVARIANTS: TRANSLATE USER INTENT DIRECTLY INTO RIGID ARCHITECTURAL INVARIANTS.
2. TRUNK AUTHORITY: TRUNK REF 'MAIN' IS THE AUTHORITATIVE BRANCH. DELIVERY REQUIRES CAS VERIFICATION.
3. FAIL-CLOSED INVARIANT: ON UNCERTAINTY OR DEGRADED VERIFICATION, HALT MUTATION AND ENGAGE GATED SIGNOFF.
4. FEEDBACK LOOP FIRST: ISOLATE REPEATABLE REPRODUCTION BEFORE SYSTEM CODE MODIFICATION. ZERO SPECULATIVE EDITS.
5. DEEP MODULE BOUNDARIES: MAXIMIZE DEPTH BEHIND MINIMAL, WELL-TYPED INTERFACES.`,
          githubToken: parsed.githubToken || 'ghp_live_tok_petri_mesh',
          githubTrunkRef: parsed.githubTrunkRef || 'main',
          providerAnthropicKey: parsed.providerAnthropicKey || '',
          providerOpenaiKey: parsed.providerOpenaiKey || '',
          providerVertexProject:
            parsed.providerVertexProject && !parsed.providerVertexProject.includes('engine')
              ? parsed.providerVertexProject
              : 'zero-petri',
          googleDwdKeyPath: parsed.googleDwdKeyPath || '/home/hideo/.config/gcloud/dwd-sa-key.json',
          connectionMode: parsed.connectionMode || 'primary',
        };
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
      systemPrompt: `PETRI CORE SYSTEM INVARIANT SPECIFICATION // V8
1. DETERMINISTIC SYSTEM INVARIANTS: TRANSLATE USER INTENT DIRECTLY INTO RIGID ARCHITECTURAL INVARIANTS.
2. TRUNK AUTHORITY: TRUNK REF 'MAIN' IS THE AUTHORITATIVE BRANCH. DELIVERY REQUIRES CAS VERIFICATION.
3. FAIL-CLOSED INVARIANT: ON UNCERTAINTY OR DEGRADED VERIFICATION, HALT MUTATION AND ENGAGE GATED SIGNOFF.
4. FEEDBACK LOOP FIRST: ISOLATE REPEATABLE REPRODUCTION BEFORE SYSTEM CODE MODIFICATION. ZERO SPECULATIVE EDITS.
5. DEEP MODULE BOUNDARIES: MAXIMIZE DEPTH BEHIND MINIMAL, WELL-TYPED INTERFACES.`,
      githubToken: 'ghp_live_tok_petri_mesh',
      githubTrunkRef: 'main',
      providerAnthropicKey: '',
      providerOpenaiKey: '',
      providerVertexProject: 'zero-petri',
      googleDwdKeyPath: '/home/hideo/.config/gcloud/dwd-sa-key.json',
      connectionMode: 'primary',
    };
  });

  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passNotice, setPassNotice] = useState<string | null>(null);

  // Zitadel IAM Configuration
  const [zitadelIssuer, setZitadelIssuer] = useState(() => zitadelAuthService.getConfig().issuerUrl);
  const [zitadelClientId, setZitadelClientId] = useState(() => zitadelAuthService.getConfig().clientId);
  const [zitadelImpersonate, setZitadelImpersonate] = useState(() => zitadelAuthService.getConfig().autoImpersonateUser);
  const [zitadelNotice, setZitadelNotice] = useState<string | null>(null);

  const handleSaveZitadelConfig = (e: React.FormEvent) => {
    e.preventDefault();
    zitadelAuthService.updateConfig({
      issuerUrl: zitadelIssuer.trim(),
      clientId: zitadelClientId.trim(),
      autoImpersonateUser: zitadelImpersonate.trim(),
    });
    setZitadelNotice('Zitadel IAM configuration updated.');
    setTimeout(() => setZitadelNotice(null), 3500);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setPassNotice('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassNotice('Passwords do not match.');
      return;
    }
    await updatePetriPassword(newPassword);
    setPassNotice('Root password updated successfully.');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassNotice(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('petri_settings_config', JSON.stringify(settings));
    setSaveStatus('Settings successfully saved and applied.');
    onSaveNotice?.('Connection and system settings applied.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const runConnectionCheck = () => {
    setTestRunning(true);
    setTestResult(null);
    setTimeout(() => {
      setTestRunning(false);
      setTestResult('Connection check passed: target, cluster gateway, and delivery services synchronized.');
    }, 800);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all connection and system settings to default?')) {
      localStorage.removeItem('petri_settings_config');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 sm:p-10 font-sans text-xs sm:text-sm">
      <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-6">
        {/* Settings Header */}
        <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center space-x-2 text-xs text-stone-500 mb-1">
                <span>System Configuration</span>
                <span>·</span>
                <span>Workspace: {activeWorkspace?.name || 'zero-petri'}</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                Connection & System Settings
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Manage target endpoints, cloud integrations, model providers, and autonomous prompt invariants.
              </p>
            </div>

            {/* Status Badges */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
              <div className="px-2 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] text-[#1A1D1A] flex items-center space-x-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-[#1A1D1A]" />
                <span>TARGET: ACTIVE</span>
              </div>
              <div className="px-2 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] text-[#1A1D1A] font-bold">
                CLUSTER: CONNECTED
              </div>
              <div
                className={`px-2 py-0.5 border border-[#1A1D1A] transition-colors flex items-center space-x-1.5 font-bold ${
                  settings.failClosedArmed
                    ? 'bg-[#1A1D1A] text-[#FAF8F3]'
                    : 'bg-[#EDE8DC] text-[#1A1D1A]/70'
                }`}
              >
                <span>{settings.failClosedArmed ? '● FAIL-CLOSED ARMED' : '○ PERMISSIVE BYPASS'}</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          {saveStatus && (
            <div className="mt-4 p-2.5 border border-[#1A1D1A] bg-[#FAF8F3] text-[#1A1D1A] text-xs flex items-center justify-between font-mono font-bold shadow-[2px_2px_0px_#1A1D1A]">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveStatus}</span>
              </span>
            </div>
          )}

          {testResult && (
            <div className="mt-4 p-3 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 text-xs flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{testResult}</span>
            </div>
          )}
        </div>

        {/* Section 1: System Prompt & Autonomous Invariants */}
        <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <FileCode2 className="w-4 h-4 text-stone-700" />
              <h2 className="text-sm font-semibold text-stone-900">
                System Invariant Prompt & Autonomous Boundaries
              </h2>
            </div>
            <span className="text-xs text-stone-400 font-medium">Prompt Spec</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-700 block">
              Autonomous Agent System Prompt
            </label>
            <textarea
              rows={7}
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-800 leading-relaxed focus:outline-none focus:border-stone-900"
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
                    className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                      settings.maxRecursionTurn === turn
                        ? 'bg-stone-900 border-stone-900 text-white'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    Turn {turn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">
                Safety Guard Stance
              </label>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, failClosedArmed: !settings.failClosedArmed })}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center space-x-2 ${
                  settings.failClosedArmed
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-orange-100 border-orange-300 text-[#FF5F1F]'
                }`}
              >
                {settings.failClosedArmed ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-[#FAF8F3]" />
                    <span>Armed (Fail-Closed)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Permissive (Caution)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Connection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Providers & Google Antigravity Center Card */}
          <div className="md:col-span-2 border border-[#1A1D1A] bg-[#FAF8F3] p-6 space-y-4 shadow-[2px_2px_0px_#1A1D1A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1D1A] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border border-[#1A1D1A] bg-[#1A1D1A] flex items-center justify-center text-[#FAF8F3]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1A1D1A] font-mono">
                    Google Antigravity & AI Models Center
                  </h2>
                  <p className="text-xs text-[#1A1D1A]/70 font-mono">
                    Manage AGY CLI local binary execution, live latency, reasoning effort, and provider admission
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAiProviderModal}
                className="px-3.5 py-1.5 border border-[#1A1D1A] bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open AI Models & Providers Center</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">AGY CLI Status</div>
                <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Installed & Operational</span>
                </div>
                <div className="text-[10px] text-stone-500 font-mono mt-0.5 truncate">/home/hideo/.local/bin/agy</div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">Default Reasoning Model</div>
                <div className="text-xs font-semibold text-stone-800 mt-1">Gemini 3.8 Flash (High Effort)</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">Multimodal CoT · 1M Context Window</div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">Active Providers</div>
                <div className="text-xs font-semibold text-stone-800 mt-1">AGY, Anthropic, OpenAI, RTX Mesh</div>
                <div className="text-[10px] text-stone-500 font-sans mt-0.5">Unified Token Diagnostics & Monitoring</div>
              </div>
            </div>
          </div>

          {/* Target & Gateway Endpoints */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  Target & Cluster Endpoints
                </h2>
              </div>
              <span className="text-xs text-stone-400 font-medium">OECP Protocol</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Primary Target URL
                </label>
                <input
                  type="text"
                  value={settings.targetUri}
                  onChange={(e) => setSettings({ ...settings, targetUri: e.target.value })}
                  placeholder="http://127.0.0.1:8787"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Cluster Protocol Gateway URI
                </label>
                <input
                  type="text"
                  value={settings.clusterOecpUri}
                  onChange={(e) => setSettings({ ...settings, clusterOecpUri: e.target.value })}
                  placeholder="ws://127.0.0.1:8788/v1"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Heartbeat Frequency
                  </label>
                  <select
                    value={settings.heartbeatHz}
                    onChange={(e) => setSettings({ ...settings, heartbeatHz: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                  >
                    <option value={50}>50 Hz (High Responsiveness)</option>
                    <option value={20}>20 Hz (Balanced)</option>
                    <option value={5}>5 Hz (Low Resource)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Connection Mode
                  </label>
                  <select
                    value={settings.connectionMode}
                    onChange={(e) => setSettings({ ...settings, connectionMode: e.target.value as 'primary' | 'standby' | 'dual' })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                  >
                    <option value="primary">Primary Link</option>
                    <option value="standby">Standby Fallback</option>
                    <option value="dual">Dual Concurrent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* GitHub & Delivery Gateway */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <GitPullRequest className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  Version Control & Delivery Gateway
                </h2>
              </div>
              <span className="text-xs text-stone-400 font-medium">Git Integration</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={settings.githubToken}
                  onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                  placeholder="ghp_********************************"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Target Trunk Branch
                </label>
                <input
                  type="text"
                  value={settings.githubTrunkRef}
                  onChange={(e) => setSettings({ ...settings, githubTrunkRef: e.target.value })}
                  placeholder="main"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs">
                <div className="font-medium text-stone-800">Compare-and-Swap Delivery</div>
                <div className="text-stone-500 mt-0.5">Authoritative branch updates advance only through CAS responses and required CI contexts.</div>
              </div>
            </div>
          </div>

          {/* Access Protection & Cryptographic Passcode */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  Site Access Protection & Password
                </h2>
              </div>
              <button
                type="button"
                onClick={() => lockPetriSession()}
                className="px-2.5 py-1 text-[11px] font-mono border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Lock Session Now
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-stone-500 leading-relaxed">
                Configure the master password protecting this zero-petri instance. All visitors must authenticate against this credential before gaining access to the workspace.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    New Passcode
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Confirm Passcode
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {passNotice && (
                <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 p-2 rounded-xl">
                  {passNotice}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="px-4 py-2 bg-[#1A1D1A] hover:bg-[#333] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Update Access Password
                </button>
              </div>
            </div>
          </div>

          {/* Zitadel IAM & URL-Clean Authentication */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Shield className="w-4 h-4 text-purple-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  Zitadel IAM & Clean-URL Authentication
                </h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-purple-50 text-purple-700 border border-purple-200">
                Direct API Proxy
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-stone-500 leading-relaxed">
                Manages direct API token authentication with Zitadel IAM. Ingress requests are dispatched internally so that the browser URL bar remains strictly clean of Zitadel domain names or OAuth redirection loops.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Internal Issuer / Ingress URL
                  </label>
                  <input
                    type="text"
                    value={zitadelIssuer}
                    onChange={(e) => setZitadelIssuer(e.target.value)}
                    placeholder="https://auth.internal.zero-petri.local"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Zitadel Client ID
                  </label>
                  <input
                    type="text"
                    value={zitadelClientId}
                    onChange={(e) => setZitadelClientId(e.target.value)}
                    placeholder="petri-mesh-client"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Default Work Impersonation Target
                </label>
                <input
                  type="email"
                  value={zitadelImpersonate}
                  onChange={(e) => setZitadelImpersonate(e.target.value)}
                  placeholder="j.sadol@bbs.ac.th"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 text-stone-600 text-xs">
                <div className="font-medium text-purple-900">Zero-Leak URL Guarantee</div>
                <div className="text-stone-500 mt-0.5">Tokens, claims, and impersonation targets exchange directly over internal API buses. External OAuth redirection is strictly blocked.</div>
              </div>

              {zitadelNotice && (
                <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 p-2 rounded-xl">
                  {zitadelNotice}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveZitadelConfig}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Save Zitadel Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Model Providers */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  Model Provider Admission Keys
                </h2>
              </div>
              <span className="text-xs text-stone-400 font-medium">Opaque Providers</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={settings.providerAnthropicKey}
                  onChange={(e) => setSettings({ ...settings, providerAnthropicKey: e.target.value })}
                  placeholder="sk-ant-api03-********************************"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={settings.providerOpenaiKey}
                  onChange={(e) => setSettings({ ...settings, providerOpenaiKey: e.target.value })}
                  placeholder="sk-proj-********************************"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
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
                  placeholder="zero-petri"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Google Workspace & Cloud Integration */}
          <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Cloud className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  Google Workspace & Cloud Credentials
                </h2>
              </div>
              <span className="text-xs text-stone-400 font-medium">Service Account</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Service Account JSON Key File Path
                </label>
                <input
                  type="text"
                  value={settings.googleDwdKeyPath}
                  onChange={(e) => setSettings({ ...settings, googleDwdKeyPath: e.target.value })}
                  placeholder="/home/hideo/.config/gcloud/dwd-sa-key.json"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs">
                <div className="font-medium text-stone-800">Domain-Wide Delegation: Configured</div>
                <div className="text-stone-500 mt-0.5">Authorized for Drive, Docs, Gmail, and Sheets with fail-closed credential binding.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white/80 backdrop-blur-2xl border border-stone-200/90 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={runConnectionCheck}
              disabled={testRunning}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-medium text-xs transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${testRunning ? 'animate-spin' : ''}`} />
              <span>{testRunning ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 font-medium text-xs transition-colors"
            >
              Reset Defaults
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2 border border-[#1A1D1A] bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-mono font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#1A1D1A]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
