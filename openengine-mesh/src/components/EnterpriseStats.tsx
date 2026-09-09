import React, { useState } from 'react';
import {
  TrendingUp,
  Cpu,
  Zap,
  ShieldCheck,
  Brain,
  Wifi,
  Sparkles,
  Clock,
  RotateCw,
} from 'lucide-react';
import { EnterpriseStats as EnterpriseStatsType, Workspace, UserProfile } from '../types';

interface EnterpriseStatsProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
}

export const INITIAL_STATS: EnterpriseStatsType = {
  mttmMinutes: 14.2,
  gateApprovalTimeMinutes: 3.8,
  autonomousDeliveryRate: 96.8,
  totalMergedPRs: 142,
  activeWorkers: 3,
  gpuVramUsedGb: 18.4,
  gpuVramTotalGb: 24.0,
  gpuDutyCyclePercent: 76,
  gpuTempCelsius: 52,
  totalTokensMonth: 1824000,
  cacheHitRatio: 91.2,
  costSavingsEstimatedUsd: 1420,
  selfLearningRulesLearned: 48,
  selfLearningConfidence: 94.6,
  invariantPassRate: 99.4,
};

export const EnterpriseStats: React.FC<EnterpriseStatsProps> = ({
  activeWorkspace,
  activeUser,
}) => {
  const [stats, setStats] = useState<EnterpriseStatsType>(INITIAL_STATS);
  const [isReflecting, setIsReflecting] = useState(false);
  const [learningLog, setLearningLog] = useState<string[]>([
    '[Distilled Rule #48] Container SIGPIPE teardown failure distilled into invariant rule: Non-blocking pipe drain with 10m ceiling (applied to 14 future turns)',
    '[Heuristic Optimization #47] Combined redundant cargo check passes into single AST traversal (-1.8s latency per turn)',
    '[Model Strategy #46] Routing speculative AST code to Claude 3.7 Sonnet, invariant fuzzing to DeepSeek-R1 (-22% token cost)',
    '[Zero Leak Memory #45] In-memory secret buffer destruction on target container exit verified across 128 consecutive runs',
  ]);

  const handleTriggerReflection = () => {
    setIsReflecting(true);
    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        selfLearningRulesLearned: prev.selfLearningRulesLearned + 1,
        selfLearningConfidence: Math.min(99.9, +(prev.selfLearningConfidence + 0.3).toFixed(1)),
        cacheHitRatio: Math.min(98.5, +(prev.cacheHitRatio + 0.4).toFixed(1)),
        mttmMinutes: Math.max(8.0, +(prev.mttmMinutes - 0.3).toFixed(1)),
      }));

      const newInsights = [
        `[Distilled Rule #${stats.selfLearningRulesLearned + 1}] Bounded concurrency backpressure model stabilized across async queues`,
        `[Self-Learning Refinement] Pruned 3 obsolete prompt variations; reduced token footprint by 14%`,
      ];
      setLearningLog((prev) => [newInsights[Math.floor(Math.random() * newInsights.length)], ...prev]);
      setIsReflecting(false);
    }, 1200);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 sm:p-10 select-none space-y-8 font-sans">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-bold font-mono text-zinc-100">
              Enterprise Telemetry & Cognitive Stats
            </h1>
            <span className="text-xs font-mono font-medium text-zinc-400 bg-zinc-900 border border-white/[0.06] px-2.5 py-0.5 rounded-full">
              Enterprise v8.4
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Real-time SLA velocity, autonomous self-learning metrics, GPU compute duty cycle, and token economics.
          </p>
        </div>

        {/* Action Controls: Trigger Reflection */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerReflection}
            disabled={isReflecting}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-mono font-bold transition-all shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-40"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReflecting ? 'animate-spin' : ''}`} />
            <span>{isReflecting ? 'Reflecting on Runs...' : 'Trigger Self-Learning Loop'}</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Autonomous Delivery Rate */}
        <div className="bg-[#0b0b0b]/90 border border-white/[0.06] rounded-3xl p-5 backdrop-blur-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Autonomous Delivery
            </span>
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.autonomousDeliveryRate}%
            </div>
            <div className="text-[11px] font-mono text-emerald-400/90 mt-1 flex items-center space-x-1">
              <span>+2.4% from last release</span>
            </div>
          </div>
        </div>

        {/* Mean Time to Merge (MTTM) */}
        <div className="bg-[#0b0b0b]/90 border border-white/[0.06] rounded-3xl p-5 backdrop-blur-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Mean Time to Merge (MTTM)
            </span>
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.mttmMinutes} min
            </div>
            <div className="text-[11px] font-mono text-indigo-400/90 mt-1">
              Avg gate signoff: {stats.gateApprovalTimeMinutes} min
            </div>
          </div>
        </div>

        {/* Hardware & RTX Compute */}
        <div className="bg-[#0b0b0b]/90 border border-white/[0.06] rounded-3xl p-5 backdrop-blur-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              RTX 4090 Duty Cycle
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.gpuVramUsedGb} / {stats.gpuVramTotalGb} GB
            </div>
            <div className="text-[11px] font-mono text-cyan-400/90 mt-1">
              {stats.gpuDutyCyclePercent}% load · {stats.gpuTempCelsius}°C thermal
            </div>
          </div>
        </div>

        {/* Self-Learning Engine */}
        <div className="bg-[#0b0b0b]/90 border border-white/[0.06] rounded-3xl p-5 backdrop-blur-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Self-Learning Heuristics
            </span>
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.selfLearningRulesLearned} Rules Active
            </div>
            <div className="text-[11px] font-mono text-amber-400/90 mt-1">
              {stats.selfLearningConfidence}% confidence score
            </div>
          </div>
        </div>
      </div>

      {/* Main Section 1: Self-Learning Continuous Reflection Loop */}
      <div className="bg-[#0c0c0c]/80 border border-white/[0.06] rounded-3xl p-6 backdrop-blur-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-zinc-900 border border-white/[0.08] text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Continuous Self-Learning & Heuristic Distillation Feed
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Automatically synthesizes failure modes and user feedback into permanent repo invariants
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
            AUTONOMOUS LOOP ENGAGED
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {learningLog.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#080808] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl p-4 flex items-start space-x-3 transition-colors text-zinc-300 leading-relaxed"
            >
              <span className="text-amber-400/80 select-none font-bold">❯</span>
              <span className="flex-1">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Token Economics & Invariant Quality Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Economics & Cache Efficiency */}
        <div className="bg-[#0c0c0c]/80 border border-white/[0.06] rounded-3xl p-6 backdrop-blur-2xl space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-white/[0.06] pb-3.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Token Economics & Cache Efficiency</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Prompt Cache Hit Rate</div>
              <div className="text-xl font-bold text-zinc-100">{stats.cacheHitRatio}%</div>
              <div className="text-[10px] text-emerald-400">Est. 12x latency reduction</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Monthly Tokens Processed</div>
              <div className="text-xl font-bold text-zinc-100">
                {(stats.totalTokensMonth / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-zinc-400">1.4M in / 424K out</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Cost Savings vs Human Dev</div>
              <div className="text-xl font-bold text-emerald-400">
                ${stats.costSavingsEstimatedUsd.toLocaleString()} / mo
              </div>
              <div className="text-[10px] text-zinc-400">Based on 142 merged PRs</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Cost per Merged PR</div>
              <div className="text-xl font-bold text-zinc-100">$0.14 avg</div>
              <div className="text-[10px] text-zinc-400">Local RTX GPU compute free</div>
            </div>
          </div>
        </div>

        {/* Enterprise Invariant & Security Assurance */}
        <div className="bg-[#0c0c0c]/80 border border-white/[0.06] rounded-3xl p-6 backdrop-blur-2xl space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-white/[0.06] pb-3.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Enterprise Invariants & Safety</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Formal Invariant Pass Rate</div>
              <div className="text-xl font-bold text-emerald-400">{stats.invariantPassRate}%</div>
              <div className="text-[10px] text-zinc-400">0 test regressions accepted</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Clippy 4-Param Ceilings</div>
              <div className="text-xl font-bold text-zinc-100">18 Preempted</div>
              <div className="text-[10px] text-emerald-400">Enforced by AST gate</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Credential Leak Incidents</div>
              <div className="text-xl font-bold text-emerald-400">0</div>
              <div className="text-[10px] text-zinc-400">In-memory ephemeral wipe</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-1">
              <div className="text-[11px] text-zinc-400">Unsafe Memory / Queue Leaks</div>
              <div className="text-xl font-bold text-emerald-400">0</div>
              <div className="text-[10px] text-zinc-400">Bounded queues fail-closed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Mesh Peer Topology */}
      <div className="bg-[#0c0c0c]/80 border border-white/[0.06] rounded-3xl p-6 backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
          <div className="flex items-center space-x-2.5">
            <Wifi className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-100">Active P2P WireGuard Mesh Topology</h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Workspace: <span className="text-zinc-200">{activeWorkspace?.name}</span> · User: <span className="text-zinc-200">{activeUser?.name}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">rtx-server-01</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px]">
                PRIMARY COGNITIVE HOST
              </span>
            </div>
            <div className="text-zinc-400 text-[11px]">
              24GB RTX 4090 · NVML Hardware Accelerated · Ping 0ms (Local)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">omarchy-laptop</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 border border-white/10 text-zinc-300 text-[10px]">
                THIN SENSOR / DISPATCH
              </span>
            </div>
            <div className="text-zinc-400 text-[11px]">
              Wayland Hyprland Desktop · Mesh Ledger · Ping 11ms
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#080808] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">android-fold-04</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px]">
                ROAMING GATE REVIEWER
              </span>
            </div>
            <div className="text-zinc-400 text-[11px]">
              Tailscale Encrypted Tunnel · 1-Tap Signoff · Ping 26ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
