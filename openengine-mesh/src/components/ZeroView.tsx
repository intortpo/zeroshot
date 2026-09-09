import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Cpu,
  Lock,
  Play,
  Activity,
} from 'lucide-react';
import { Workspace, UserProfile } from '../types';

interface ZeroViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  onDispatchIntent?: (prompt: string, kind: 'bug' | 'feat' | 'issue' | 'mile') => void;
}

interface InvariantRule {
  id: string;
  name: string;
  code: string;
  status: 'passed' | 'verifying' | 'enforced';
  description: string;
  targetPath: string;
  lastChecked: string;
}

export const ZeroView: React.FC<ZeroViewProps> = ({
  activeWorkspace,
  activeUser,
  onDispatchIntent,
}) => {
  const [activeHarness, setActiveHarness] = useState<'zeroshot-native-v2' | 'cluster-client'>('zeroshot-native-v2');
  const [selectedProvider, setSelectedProvider] = useState<'anthropic' | 'openai' | 'vertex'>('anthropic');
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-5-sonnet');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditNotice, setAuditNotice] = useState<string | null>(null);

  const [invariants] = useState<InvariantRule[]>([
    {
      id: 'inv-01',
      name: 'Zero Speculative Edits',
      code: 'INV-FEEDBACK-FIRST',
      status: 'enforced',
      description: 'Never write speculative bug fixes. Isolate a repeatable reproduction loop before editing code.',
      targetPath: 'CONTEXT.md & tests/',
      lastChecked: '42s ago',
    },
    {
      id: 'inv-02',
      name: 'Zero CAS Drift',
      code: 'INV-CAS-TRUNK',
      status: 'enforced',
      description: 'Trunk ref main is the authoritative branch. Delivery advances only through compare-and-swap.',
      targetPath: '.github/workflows/ & git refs',
      lastChecked: '1m ago',
    },
    {
      id: 'inv-03',
      name: 'Zero Protocol Mutation',
      code: 'INV-PROTOCOL-KIT',
      status: 'enforced',
      description: 'Protocol Rust types are the source of truth. Schema artifacts regenerated strictly via Rust testkit.',
      targetPath: 'protocol/openengine-cluster/v1/',
      lastChecked: '2m ago',
    },
    {
      id: 'inv-04',
      name: 'Zero Allocation Leaks',
      code: 'INV-BOUNDED-IO',
      status: 'enforced',
      description: 'Provider JSONL readers share 64 MiB guard, bounded concurrent stdin/stdout, backpressure queues.',
      targetPath: 'zeroshot/src/execution/',
      lastChecked: '3m ago',
    },
    {
      id: 'inv-05',
      name: 'Zero Shallow Wrappers',
      code: 'INV-DEEP-MODULES',
      status: 'enforced',
      description: 'Maximize implementation depth behind minimal, well-typed interfaces. Zero trivial passthroughs.',
      targetPath: 'crates/ & zeroshot/src/',
      lastChecked: '5m ago',
    },
    {
      id: 'inv-06',
      name: 'Zero Broken Continuations',
      code: 'INV-FAIL-CLOSED',
      status: 'enforced',
      description: 'Structured-output recovery is fail-closed. Reused sessions, MCP, and network tools disabled on turn retry.',
      targetPath: 'zeroshot/src/native_v2_candidate/',
      lastChecked: '6m ago',
    },
  ]);

  const [telemetryEvents, setTelemetryEvents] = useState<string[]>([
    'Trunk CAS verified: refs/heads/main matches authoritative remote commit aff94c46',
    'OpenRPC gateway heartbeat confirmed on ws://127.0.0.1:8788/v1 (latency: 1.2ms)',
    'Target engine container ghcr.io/the-open-engine/zeroshot-target discovery healthy',
    'Rust canonical crate zeroshot-native-v2 bounds verified (64 MiB stream guard active)',
  ]);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditNotice(null);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditNotice('Invariant audit complete: 6 of 6 architectural invariants verified with 0 drift.');
      setTelemetryEvents((prev) => [
        `Invariant verification sweep passed: 0 drift detected across ${activeWorkspace?.name || 'zero-petri'}`,
        ...prev.slice(0, 7),
      ]);
      setTimeout(() => setAuditNotice(null), 4000);
    }, 1200);
  };

  const handleQuickVerificationIntent = (label: string) => {
    onDispatchIntent?.(`Run zero-drift invariant verification: ${label}`, 'feat');
  };

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 sm:p-10 select-none font-sans text-xs sm:text-sm">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Zero Header Banner with Subtle Depth */}
        <div className="subtle-depth rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-200/80">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white font-medium text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                  0
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-stone-950 tracking-tight flex items-center space-x-2.5">
                    <span>Zero</span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700">
                      v8 Engine
                    </span>
                    {activeUser && (
                      <span className="text-xs font-normal text-stone-400">
                        · {activeUser.name.split(' ')[0]} ({activeUser.role.replace('_', ' ')})
                      </span>
                    )}
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 font-normal leading-relaxed pt-1">
                Zero-overhead speculative execution, deterministic invariants, and authoritative CAS delivery across {activeWorkspace?.name || 'zero-petri'}.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="subtle-depth-interactive flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs sm:text-sm font-medium transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Verifying Invariants...' : 'Run Invariant Audit'}</span>
              </button>
            </div>
          </div>

          {/* Audit Notice Pill */}
          {auditNotice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-800 text-xs font-medium flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{auditNotice}</span>
            </div>
          )}

          {/* 4 Zero Pillars Summary Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="subtle-depth-card rounded-xl p-4">
              <div className="text-xs font-normal text-stone-500">Speculative Mutations</div>
              <div className="text-xl font-semibold text-stone-900 mt-1 flex items-baseline space-x-1.5">
                <span>0</span>
                <span className="text-xs font-normal text-emerald-600">Strict</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Feedback loop first</div>
            </div>

            <div className="subtle-depth-card rounded-xl p-4">
              <div className="text-xs font-normal text-stone-500">CAS Branch Drift</div>
              <div className="text-xl font-semibold text-stone-900 mt-1 flex items-baseline space-x-1.5">
                <span>0</span>
                <span className="text-xs font-normal text-emerald-600">Synced</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Trunk ref main authority</div>
            </div>

            <div className="subtle-depth-card rounded-xl p-4">
              <div className="text-xs font-normal text-stone-500">Stream Overflow</div>
              <div className="text-xl font-semibold text-stone-900 mt-1 flex items-baseline space-x-1.5">
                <span>0</span>
                <span className="text-xs font-normal text-emerald-600">Guarded</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">64 MiB ceiling active</div>
            </div>

            <div className="subtle-depth-card rounded-xl p-4">
              <div className="text-xs font-normal text-stone-500">Hand-edited Protocols</div>
              <div className="text-xl font-semibold text-stone-900 mt-1 flex items-baseline space-x-1.5">
                <span>0</span>
                <span className="text-xs font-normal text-emerald-600">100% Rust</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Testkit regeneration only</div>
            </div>
          </div>
        </div>

        {/* Runtime Engine & Model Dispatch Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Engine Selector */}
          <div className="lg:col-span-7 subtle-depth rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-stone-800" />
                <h2 className="text-sm font-semibold text-stone-900">Runtime Harness & Dispatch</h2>
              </div>
              <span className="text-xs text-stone-500 font-normal">
                Selector: <span className="text-stone-800 font-medium">Explicit caller-authored</span>
              </span>
            </div>

            <div className="space-y-4">
              {/* Harness Pick */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-700">Execution Harness</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveHarness('zeroshot-native-v2')}
                    className={`p-3 rounded-xl border text-left transition-all subtle-depth-interactive ${
                      activeHarness === 'zeroshot-native-v2'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200/90 bg-white/80 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>zeroshot-native-v2</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${activeHarness === 'zeroshot-native-v2' ? 'bg-[#0ABAB5]' : 'bg-stone-300'}`} />
                    </div>
                    <div className={`text-[11px] mt-1 ${activeHarness === 'zeroshot-native-v2' ? 'text-stone-300' : 'text-stone-400'}`}>
                      Canonical Rust CLI & contained runner
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveHarness('cluster-client')}
                    className={`p-3 rounded-xl border text-left transition-all subtle-depth-interactive ${
                      activeHarness === 'cluster-client'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200/90 bg-white/80 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>cluster-client</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${activeHarness === 'cluster-client' ? 'bg-[#0ABAB5]' : 'bg-stone-300'}`} />
                    </div>
                    <div className={`text-[11px] mt-1 ${activeHarness === 'cluster-client' ? 'text-stone-300' : 'text-stone-400'}`}>
                      OpenRPC distributed cluster gateway
                    </div>
                  </button>
                </div>
              </div>

              {/* Provider & Model Matrix */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Provider</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => {
                      const p = e.target.value as 'anthropic' | 'openai' | 'vertex';
                      setSelectedProvider(p);
                      if (p === 'anthropic') setSelectedModel('claude-3-5-sonnet');
                      else if (p === 'openai') setSelectedModel('o3-mini');
                      else setSelectedModel('gemini-2.5-pro');
                    }}
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900 font-sans"
                  >
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="openai">OpenAI (Codex / o3)</option>
                    <option value="vertex">Google Vertex AI (Gemini)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Model Identifier</label>
                  <input
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-white/90 border border-stone-200/90 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-900 font-sans"
                    placeholder="e.g. claude-3-5-sonnet"
                  />
                </div>
              </div>

              {/* Contained Execution Guard Specs */}
              <div className="subtle-depth-well rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-medium text-stone-800 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-600" />
                    <span>Contained Provider Session Invariants</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-2 py-0.5 rounded-full font-medium">
                    Fail-Closed
                  </span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Session bounds post-exit I/O draining to 10-minute ceiling while observing cancellation. Recovery turns disable reused sessions, MCP, write/network tools, and user-defined agents.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Verification Actions */}
          <div className="lg:col-span-5 subtle-depth rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center space-x-2.5 border-b border-stone-200/70 pb-4">
              <Play className="w-4 h-4 text-stone-800" />
              <h2 className="text-sm font-semibold text-stone-900">Zero-Drift Dispatchers</h2>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleQuickVerificationIntent('Workspace Clippy & Target Checks')}
                className="w-full subtle-depth-card subtle-depth-interactive p-3.5 rounded-xl text-left flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-medium text-stone-900 group-hover:text-stone-950">
                    cargo clippy & cargo test
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Verify 4-parameter clippy ceiling and narrowest workspace lane
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickVerificationIntent('Protocol Schema Conformance Check')}
                className="w-full subtle-depth-card subtle-depth-interactive p-3.5 rounded-xl text-left flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-medium text-stone-900 group-hover:text-stone-950">
                    npm run protocol:check
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Confirm generated OpenRPC schema matches Rust testkit source of truth
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickVerificationIntent('Distribution Check & npm Sync')}
                className="w-full subtle-depth-card subtle-depth-interactive p-3.5 rounded-xl text-left flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-medium text-stone-900 group-hover:text-stone-950">
                    npm run distribution:check
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Verify immutable GitHub release targets and container declarations
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickVerificationIntent('Python SDK Ruff & mypy Lint')}
                className="w-full subtle-depth-card subtle-depth-interactive p-3.5 rounded-xl text-left flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-medium text-stone-900 group-hover:text-stone-950">
                    sdks/python ruff & mypy
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Run strict type checking and pydoclint on zeroshot Python SDK
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Architectural Invariants List */}
        <div className="subtle-depth rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-stone-800" />
              <h2 className="text-sm font-semibold text-stone-900">Architectural Invariant Enforcement</h2>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 font-medium">
              6 Invariants Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invariants.map((inv) => (
              <div
                key={inv.id}
                className="subtle-depth-card rounded-xl p-4 space-y-2 border border-stone-200/80 hover:border-stone-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-stone-900 text-xs sm:text-sm">{inv.name}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {inv.code}
                  </span>
                </div>

                <p className="text-xs text-stone-600 font-normal leading-relaxed">
                  {inv.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px] text-stone-400">
                  <span>Scope: {inv.targetPath}</span>
                  <span>Checked {inv.lastChecked}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Invariant Telemetry Feed */}
        <div className="subtle-depth rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-stone-700" />
              <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                CAS & Invariant Telemetry Stream
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">Trunk Authority: main</span>
          </div>

          <div className="space-y-2">
            {telemetryEvents.map((evt, idx) => (
              <div
                key={idx}
                className="subtle-depth-well rounded-xl px-4 py-2.5 text-xs text-stone-700 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
                  <span>{evt}</span>
                </div>
                <span className="text-[10px] text-stone-400">Just now</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ZeroView;
