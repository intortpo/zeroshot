import React, { useState } from 'react';
import {
  GitCommit,
  Cpu,
  Brain,
  CheckCircle2,
  RotateCw,
  Plus,
  Coins,
  Shield,
  Activity,
  Radio,
} from 'lucide-react';
import { Workspace, UserProfile, PetriItem, NodeSpec } from '../types';

interface EnterpriseStatsProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  items?: PetriItem[];
  localNode?: NodeSpec;
  subTab?: 'telemetry' | 'tokens' | 'all';
}

export const EnterpriseStats: React.FC<EnterpriseStatsProps> = ({
  activeWorkspace,
  activeUser,
  items = [],
  localNode,
  subTab = 'all',
}) => {
  const [currentTab, setCurrentTab] = useState<'all' | 'telemetry' | 'tokens'>(subTab);
  const [isReflecting, setIsReflecting] = useState(false);
  const [newRuleInput, setNewRuleInput] = useState('');
  const [rules, setRules] = useState<Array<{ id: string; title: string; category: string; source: string }>>([
    {
      id: 'inv-01',
      title: 'Protocol Rust types are canonical source of truth; no hand-editing generated definitions',
      category: 'INVARIANTS',
      source: 'AGENTS.md:L44',
    },
    {
      id: 'inv-02',
      title: 'Clippy four-parameter ceiling on public APIs; use typed request structs',
      category: 'MAINTAINABILITY',
      source: 'AGENTS.md:L142',
    },
    {
      id: 'inv-03',
      title: 'Structured-output recovery is provider-owned and fail-closed (bounded to max 2 turns)',
      category: 'RELIABILITY',
      source: 'AGENTS.md:L55',
    },
    {
      id: 'inv-04',
      title: 'Safe-log timestamps must be positive JavaScript-safe Unix epoch milliseconds',
      category: 'SERIALIZATION',
      source: 'AGENTS.md:L67',
    },
    {
      id: 'inv-05',
      title: 'Single development trunk (main) with Conventional Commit PR squash headers',
      category: 'RELEASE_POLICY',
      source: 'AGENTS.md:L19',
    },
    {
      id: 'inv-06',
      title: 'Concurrent & bounded provider stdin/stdout preventing deadlock on large prompts',
      category: 'STREAMING',
      source: 'AGENTS.md:L63',
    },
  ]);

  // Derived genuine metrics
  const totalTasks = items.length;
  const mergedCount = items.filter((i) => i.stage === 'merged').length;
  const inFlightCount = items.filter((i) => i.stage === 'in_flight').length;
  const gatedCount = items.filter((i) => i.stage === 'gated').length;
  const verifyingCount = items.filter((i) => i.stage === 'verifying').length;
  const backlogCount = items.filter((i) => i.stage === 'backlog').length;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    setRules((prev) => [
      {
        id: `inv-${Date.now().toString().slice(-4)}`,
        title: newRuleInput.trim(),
        category: 'LEARNED_INVARIANT',
        source: 'PETRI_MEMORY_LOG',
      },
      ...prev,
    ]);
    setNewRuleInput('');
  };

  const handleReflect = () => {
    setIsReflecting(true);
    setTimeout(() => {
      setRules((prev) => [
        {
          id: `inv-${Date.now().toString().slice(-4)}`,
          title: 'Distilled AST verification checkpoint from merged test suites and invariant receipts',
          category: 'SYNTHESIZED_HEURISTIC',
          source: 'SELF_LEARNING_ENGINE',
        },
        ...prev,
      ]);
      setIsReflecting(false);
    }, 600);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto p-4 sm:p-8 space-y-6 font-mono bg-[#F6F3EC] text-[#1A1D1A]">
      {/* 1960s Technical Document Header */}
      <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-4 shadow-[2px_2px_0px_#1A1D1A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1D1A] pb-3 mb-3">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-[#1A1D1A]/70 mb-1">
              <span className="px-1 border border-[#1A1D1A] bg-[#EDE8DC]">DOC NO. 60-PETRI-TEL-01</span>
              <span>//</span>
              <span>SYSTEM LOGBOOK SECTION 04</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1A1D1A]">
              TELEMETRY, TOKEN EXPENDITURE & INVARIANTS
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center border border-[#1A1D1A] bg-[#EDE8DC] p-0.5 text-xs">
              <button
                onClick={() => setCurrentTab('all')}
                className={`px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  currentTab === 'all'
                    ? 'bg-[#1A1D1A] text-[#FAF8F3]'
                    : 'text-[#1A1D1A] hover:bg-[#FAF8F3]'
                }`}
              >
                [ALL]
              </button>
              <button
                onClick={() => setCurrentTab('telemetry')}
                className={`px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  currentTab === 'telemetry'
                    ? 'bg-[#1A1D1A] text-[#FAF8F3]'
                    : 'text-[#1A1D1A] hover:bg-[#FAF8F3]'
                }`}
              >
                [01 TELEMETRY]
              </button>
              <button
                onClick={() => setCurrentTab('tokens')}
                className={`px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  currentTab === 'tokens'
                    ? 'bg-[#1A1D1A] text-[#FAF8F3]'
                    : 'text-[#1A1D1A] hover:bg-[#FAF8F3]'
                }`}
              >
                [02 TOKEN LEDGER]
              </button>
            </div>

            <button
              onClick={handleReflect}
              disabled={isReflecting}
              className="flex items-center space-x-1.5 px-3 py-1 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isReflecting ? 'animate-spin' : ''}`} />
              <span>{isReflecting ? 'ANALYZING...' : '[EXECUTE REFLECTION]'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[10px] text-[#1A1D1A]/80 pt-1">
          <div className="flex items-center space-x-3">
            <span>CALIBRATION: 0.0σ</span>
            <span>·</span>
            <span>FAIL-CLOSED POLICY: ACTIVE</span>
            <span>·</span>
            <span>4-PARAM CEILING: ENFORCED</span>
          </div>
          <div className="font-bold border border-[#1A1D1A] px-2 py-0.5 bg-[#EDE8DC]">
            ● STATUS: AIRWORTHY / NOMINAL
          </div>
        </div>
      </div>

      {/* Real Airworthiness Pipeline Telemetry - 1960s Wireframe Gauge Cluster */}
      {(currentTab === 'telemetry' || currentTab === 'all') && (
        <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-4 shadow-[2px_2px_0px_#1A1D1A] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1A1D1A] pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              [FIG 4.1 // AIRFRAME PIPELINE STAGE GAUGES]
            </span>
            <span className="text-[10px] text-[#1A1D1A]/70 font-mono">
              TOTAL SPECIFICATIONS: {totalTasks}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Merged Commits */}
            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>05 // MERGED TRUNK</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{mergedCount}</div>
              <div className="text-[9px] text-[#1A1D1A]/70 uppercase border-t border-[#1A1D1A]/30 pt-1">
                RELEASED ON MAIN
              </div>
            </div>

            {/* In-Flight Work */}
            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>02 // IN-FLIGHT</span>
                <Radio className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{inFlightCount}</div>
              <div className="text-[9px] text-[#1A1D1A]/70 uppercase border-t border-[#1A1D1A]/30 pt-1">
                AST SYNTHESIS RUNNING
              </div>
            </div>

            {/* Verifying Acceptance */}
            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>03 // ACCEPTANCE</span>
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{verifyingCount}</div>
              <div className="text-[9px] text-[#1A1D1A]/70 uppercase border-t border-[#1A1D1A]/30 pt-1">
                CONTAINER INVARIANTS
              </div>
            </div>

            {/* Gated Review */}
            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>04 // GATED SIGN</span>
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{gatedCount}</div>
              <div className="text-[9px] text-[#1A1D1A]/70 uppercase border-t border-[#1A1D1A]/30 pt-1">
                PILOT OVERSIGHT REQ
              </div>
            </div>

            {/* Spec Backlog */}
            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>01 // SPEC BACKLOG</span>
                <GitCommit className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold">{backlogCount}</div>
              <div className="text-[9px] text-[#1A1D1A]/70 uppercase border-t border-[#1A1D1A]/30 pt-1">
                INGESTED DIRECTIVES
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Spend & Compaction Ledger - 1960s Wireframe Accounting Sheet */}
      {(currentTab === 'tokens' || currentTab === 'all') && (
        <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-4 shadow-[2px_2px_0px_#1A1D1A] space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-[#1A1D1A] pb-2 gap-2">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                [FIG 4.2 // TOKEN CONSUMPTION & COMPACTION LEDGER]
              </span>
            </div>
            <span className="text-[10px] font-bold border border-[#1A1D1A] px-2 py-0.5 bg-[#EDE8DC]">
              EFFICIENCY GAIN: +42.6% COMPACTION RATIO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>PROMPT EXPENDITURE</span>
                <span className="border border-[#1A1D1A] px-1 bg-[#EDE8DC]">+14.2%</span>
              </div>
              <div className="text-2xl font-bold">1,420,890</div>
              <div className="space-y-1 text-[10px]">
                <div className="w-full border border-[#1A1D1A] bg-[#FAF8F3] h-2">
                  <div className="bg-[#1A1D1A] h-full" style={{ width: '86.4%' }} />
                </div>
                <div className="text-[9px] text-[#1A1D1A]/80 font-bold">
                  86.4% PROMPT CACHE HIT
                </div>
              </div>
            </div>

            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>COMPLETION DRAIN</span>
                <span className="border border-[#1A1D1A] px-1 bg-[#EDE8DC]">20.0%</span>
              </div>
              <div className="text-2xl font-bold">284,110</div>
              <div className="space-y-1 text-[10px]">
                <div className="w-full border border-[#1A1D1A] bg-[#FAF8F3] h-2">
                  <div className="bg-[#1A1D1A] h-full" style={{ width: '20%' }} />
                </div>
                <div className="text-[9px] text-[#1A1D1A]/80 font-bold">
                  BOUNDED JSON SCHEMA
                </div>
              </div>
            </div>

            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>STREAMING BUFFER CEILING</span>
                <span className="border border-[#1A1D1A] px-1 bg-[#EDE8DC]">GUARD</span>
              </div>
              <div className="text-2xl font-bold">64 MiB</div>
              <div className="space-y-1 text-[10px]">
                <div className="w-full border border-[#1A1D1A] bg-[#FAF8F3] h-2">
                  <div className="bg-[#1A1D1A] h-full" style={{ width: '100%' }} />
                </div>
                <div className="text-[9px] text-[#1A1D1A]/80 font-bold">
                  ZERO-LOSS RECOVERY ACTIVE
                </div>
              </div>
            </div>

            <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>ACCUMULATED CHARGE</span>
                <span className="border border-[#1A1D1A] px-1 bg-[#EDE8DC]">EST</span>
              </div>
              <div className="text-2xl font-bold">$482.50</div>
              <div className="space-y-1 text-[10px]">
                <div className="w-full border border-[#1A1D1A] bg-[#FAF8F3] h-2">
                  <div className="bg-[#1A1D1A] h-full" style={{ width: '68%' }} />
                </div>
                <div className="text-[9px] text-[#1A1D1A]/80 font-bold">
                  PROMPT CACHING REDUCED 68%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Host Environment Spec & Invariants Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Host Environment Spec (5 cols) */}
        <div className="lg:col-span-5 border border-[#1A1D1A] bg-[#FAF8F3] p-4 shadow-[2px_2px_0px_#1A1D1A] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1A1D1A] pb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                [SCHEMATIC 4.3 // HOST AVIONICS]
              </h3>
            </div>
            <span className="text-[9px] border border-[#1A1D1A] bg-[#EDE8DC] px-1.5 py-0.5 font-bold">
              VERIFIED
            </span>
          </div>

          <div className="space-y-1 text-xs border border-[#1A1D1A] bg-[#F2EFE9] p-3 divide-y divide-[#1A1D1A]/20">
            <div className="flex justify-between py-1.5">
              <span className="text-[#1A1D1A]/70">HOST BUS</span>
              <span className="font-bold">po</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#1A1D1A]/70">OS KERNEL</span>
              <span className="font-bold">Linux 7.1.9-arch1-2 (x86_64)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#1A1D1A]/70">WORKSPACE</span>
              <span className="font-bold">{activeWorkspace?.name || 'zero-petri'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#1A1D1A]/70">FS ROOT</span>
              <span className="font-bold truncate max-w-[200px]" title="/home/hideo/Documents/GitHub/zero-petri">
                .../GitHub/zero-petri
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#1A1D1A]/70">AVIONICS UNIT</span>
              <span className="font-bold">{localNode?.deviceName || 'Generic Linux Client'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#1A1D1A]/70">CHIEF OPERATOR</span>
              <span className="font-bold">{activeUser?.name || 'Hideo'} (j.sadol@bbs.ac.th)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#1A1D1A]/70">UPSTREAM TRUNK</span>
              <span className="font-bold">github.com:foxlight/zero-petri</span>
            </div>
          </div>
        </div>

        {/* Right: Architectural Invariants & Learned Heuristics (7 cols) */}
        <div className="lg:col-span-7 border border-[#1A1D1A] bg-[#FAF8F3] p-4 shadow-[2px_2px_0px_#1A1D1A] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1A1D1A] pb-2">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                [LOGBOOK 4.4 // INVARIANTS & HEURISTICS ({rules.length})]
              </h3>
            </div>
            <span className="text-[9px] border border-[#1A1D1A] bg-[#EDE8DC] px-1.5 py-0.5 font-bold">
              ENFORCED
            </span>
          </div>

          <form onSubmit={handleAddRule} className="flex gap-2">
            <input
              type="text"
              value={newRuleInput}
              onChange={(e) => setNewRuleInput(e.target.value)}
              placeholder="Record distilled invariant directive..."
              className="flex-1 px-3 py-1.5 border border-[#1A1D1A] bg-[#FAF8F3] text-xs text-[#1A1D1A] placeholder-[#888] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] hover:bg-[#333] text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>[ADD]</span>
            </button>
          </form>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-2.5 border border-[#1A1D1A] bg-[#F2EFE9] text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold border border-[#1A1D1A] px-1 bg-[#EDE8DC]">
                    {rule.category}
                  </span>
                  <span className="text-[#1A1D1A]/60">{rule.source}</span>
                </div>
                <div className="text-[#1A1D1A] leading-relaxed">
                  {rule.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
