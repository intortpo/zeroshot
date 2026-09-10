import React, { useState } from 'react';
import {
  GitMerge,
  MessageSquare,
  Database,
  Sparkles,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export type HourglassMode = 'chat_cognition' | 'git_development';

interface HourglassStage {
  id: string;
  label: string;
  count: number;
  unit: string;
  description: string;
  color: string;
  items?: string[];
}

interface PetriHourglassStreamProps {
  initialMode?: HourglassMode;
  className?: string;
}

export const PetriHourglassStream: React.FC<PetriHourglassStreamProps> = ({
  initialMode = 'chat_cognition',
  className = '',
}) => {
  const [mode, setMode] = useState<HourglassMode>(initialMode);
  const [hoveredStage, setHoveredStage] = useState<HourglassStage | null>(null);
  const [selectedStage, setSelectedStage] = useState<HourglassStage | null>(null);

  // Define stages for Chat Cognition & Data Pattern Tracking
  const chatStages: HourglassStage[] = [
    {
      id: 'raw_data',
      label: '1. Ingested Data Assets',
      count: 4200,
      unit: 'Records & Cells',
      description: 'Midterms 1-2026, 324 Below-Passing students, May punctuality audit (838 students), Google Drive DWD sheets.',
      color: '#0d9488', // Tiffany Teal
      items: [
        'Midterms 1-2026.xlsx (849 students · 16 subjects)',
        '2026 Summary of Below Passing Marks (324 failures)',
        'Check In & Out Record 18-29 May 2026 (838 students)',
        'Google Classroom G1.2 Primary Math & G9-2 Computer Science',
      ],
    },
    {
      id: 'vector_distill',
      label: '2. 64D Vector Distillation',
      count: 1850,
      unit: 'Semantic Chunks',
      description: 'Recursive paragraph segmentation, L2-normalized dense embeddings, AES-256-GCM encrypted envelope storage.',
      color: '#0284c7', // Sky blue
      items: [
        'Curriculum passing thresholds (50% max mark)',
        'Thai Language, Math IP, Science IP, Mandarin item vectors',
        'Longitudinal punctuality momentum calculations',
        'AY2026 Semester 2 strategic blueprint rubrics',
      ],
    },
    {
      id: 'qsvc_choke',
      label: '3. Cognitive & QSVC Choke Point',
      count: 480,
      unit: 'Focal Deficits & Bounds',
      description: 'DINA slips/guessing psychometric filter & Quantum ZZFeatureMap decision boundary (w* = [-2.15, -3.10, ...]).',
      color: '#8b5cf6', // Purple
      items: [
        'Student #3667 Leo: Mandarin + Math IP + Math Thai deficit',
        'Student #3068 Star: 5 below-passing marks (Critical Risk)',
        'Student #3078 Fairy: Math IP deficit (Amber Warning)',
        'Quantum risk hyperplane threshold: Z_crit = 0.0 (50% waterline)',
      ],
    },
    {
      id: 'rag_attention',
      label: '4. Contextual Attention Neck',
      count: 120,
      unit: 'Top-K Cited Excerpts',
      description: 'Cosine similarity ranking + lexical keyword alignment delivering exact curricular citations.',
      color: '#f59e0b', // Amber
      items: [
        'Leo case file citation (88.5% match confidence)',
        'Late arrival penalty threshold rules (08:00 AM cutoff)',
        'Mandarin vocabulary acquisition diagnostic rubric',
        'Prerequisite geometry micro-module syllabus',
      ],
    },
    {
      id: 'agent_action',
      label: '5. Action & Interventions',
      count: 24,
      unit: 'Dispatched Interventions',
      description: 'Targeted remediation plans, parent alert triggers, advisor notifications, and subagent tool executions.',
      color: '#e11d48', // Rose/Crimson
      items: [
        'Dispatched Mandarin remedial micro-module for Leo #3667',
        'Academic Advisor high-priority alert for Star #3068',
        'Counseling referral for negative attendance velocity drift',
        'RAG pedagogical explanation generated with verified citations',
      ],
    },
  ];

  // Define stages for Git Development & Release Tracking
  const gitStages: HourglassStage[] = [
    {
      id: 'git_commits',
      label: '1. Feature Commits & Worktrees',
      count: 540,
      unit: 'Worker Commits',
      description: 'Autonomous agent task runs, isolated git worktrees, exploratory branches, and test iterations.',
      color: '#64748b',
      items: [
        'Subagent branch: feat/petri-submersion-3d-engine',
        'Subagent branch: feat/full-file-doc-rag-federated-hub',
        'Subagent branch: feat/google-drive-dwd-impersonation',
        'Subagent branch: feat/quantum-edm-secure-vault-dina',
      ],
    },
    {
      id: 'ci_gates',
      label: '2. Automated Validation Gates',
      count: 180,
      unit: 'Verified PR Candidates',
      description: 'Narrow checks (cargo clippy, cargo fmt, cargo test, npm test, ruff check, pydoclint).',
      color: '#0284c7',
      items: [
        'Rust Clippy 4-parameter ceiling verified',
        'Protocol Rust types & OpenRPC conformance verified',
        'Zero occurrences of forbidden word verified',
        'Prettier & TypeScript compilation checks passed',
      ],
    },
    {
      id: 'squash_neck',
      label: '3. Main Trunk Bottleneck',
      count: 42,
      unit: 'Squash-Merged Releases',
      description: 'Single authoritative Conventional Commit squash-merged directly onto main. No semantic release promotion branches.',
      color: '#0d9488',
      items: [
        'feat(edm): strip lieflat charts with 3D petri submersion',
        'feat(federated): auto-folder routing & drive DWD impersonation',
        'feat(generative): drag-drop ingestion & hyperframe video',
        'feat(mobile): build android universal release APK',
      ],
    },
    {
      id: 'release_fanout',
      label: '4. Immutable Release Fanout',
      count: 4,
      unit: 'Canonical Distributions',
      description: 'Unified GitHub Release publish: native CLI binaries, Docker target image, npm package, PyPI wheel revision 1.',
      color: '#10b981',
      items: [
        'Native CLI binary: zeroshot-v8 (Linux, macOS, Windows)',
        'Docker Image: ghcr.io/the-open-engine/zeroshot-target',
        'npm Package: @the-open-engine-company/zeroshot',
        'Python SDK: the-open-engine-zeroshot (wheel rev 1)',
      ],
    },
  ];

  const currentStages = mode === 'chat_cognition' ? chatStages : gitStages;

  // Viewport geometry for SVG Hourglass Stream
  const width = 480;
  const height = 340;
  const cx = width / 2;
  const maxCount = currentStages[0].count;
  const maxBarWidth = 320;
  const stageSpacing = (height - 60) / Math.max(1, currentStages.length - 1);

  return (
    <div className={`bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 select-none ${className}`}>
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/80 flex items-center justify-center">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>Petri Funnel Hourglass Stream</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-teal-300 border border-slate-800">
                Lupi Editorial Streamline
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {mode === 'chat_cognition'
                ? 'Tracking multi-agent reasoning, RAG compression, and data-to-chat correlation patterns.'
                : 'Tracking Git commits, CI gate filtering, squash merge onto main, and release fanout.'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Controls */}
        <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 space-x-1 text-xs font-mono">
          <button
            onClick={() => {
              setMode('chat_cognition');
              setSelectedStage(null);
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              mode === 'chat_cognition'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat & Data Patterns</span>
          </button>
          <button
            onClick={() => {
              setMode('git_development');
              setSelectedStage(null);
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              mode === 'git_development'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3 h-3" />
            <span>Git Development Flow</span>
          </button>
        </div>
      </div>

      {/* SVG Hourglass Stream Canvas */}
      <div className="relative bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72 overflow-visible select-none">
          <defs>
            {/* Ambient hairline glow filters */}
            <filter id="streamGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#14b8a6" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Render Trickling Bézier Hairline Streamlines Between Stages */}
          {currentStages.map((stage, k) => {
            if (k >= currentStages.length - 1) return null;
            const nextStage = currentStages[k + 1];

            const yTop = 32 + k * stageSpacing;
            const yBottom = 32 + (k + 1) * stageSpacing;

            const wTop = Math.max(30, (stage.count / maxCount) * maxBarWidth);
            const wBottom = Math.max(26, (nextStage.count / maxCount) * maxBarWidth);

            const numThreads = 28;
            const threads = [];

            for (let t = 0; t < numThreads; t++) {
              const u = (t + 0.5) / numThreads;
              const xTop = cx - wTop / 2 + u * wTop;
              const xBottom = cx - wBottom / 2 + u * wBottom;

              const cy1 = yTop + (yBottom - yTop) * 0.45;
              const cy2 = yBottom - (yBottom - yTop) * 0.45;

              threads.push(
                <path
                  key={`thread-${k}-${t}`}
                  d={`M ${xTop.toFixed(1)} ${yTop + 8} C ${xTop.toFixed(1)} ${cy1.toFixed(1)}, ${xBottom.toFixed(1)} ${cy2.toFixed(1)}, ${xBottom.toFixed(1)} ${yBottom - 8}`}
                  fill="none"
                  stroke={t % 4 === 0 ? '#14b8a6' : t % 3 === 0 ? '#818cf8' : '#475569'}
                  strokeWidth={t % 4 === 0 ? 0.8 : 0.45}
                  opacity={t % 4 === 0 ? 0.65 : 0.28}
                  className="transition-opacity duration-300"
                />
              );
            }

            // Yield / Retention percentage label in right margin
            const yieldPct = Math.round((nextStage.count / stage.count) * 100);
            const midY = (yTop + yBottom) / 2;

            return (
              <g key={`connector-${k}`}>
                {threads}
                {/* Margin Yield Pill */}
                <rect
                  x={width - 55}
                  y={midY - 9}
                  width={46}
                  height={18}
                  rx="4"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={width - 32}
                  y={midY + 3}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  ↓ {yieldPct}%
                </text>
              </g>
            );
          })}

          {/* Render Stage Horizontal Strips & Barcode Tickmarks */}
          {currentStages.map((stage, k) => {
            const y = 32 + k * stageSpacing;
            const w = Math.max(30, (stage.count / maxCount) * maxBarWidth);
            const hw = w / 2;
            const isHovered = hoveredStage?.id === stage.id;
            const isSelected = selectedStage?.id === stage.id;

            // Discrete barcode tickmarks along stage strip
            const numTicks = Math.min(48, Math.max(12, Math.round(w / 6)));
            const ticks = [];
            for (let t = 0; t < numTicks; t++) {
              const tx = cx - hw + (t + 0.5) * (w / numTicks);
              ticks.push(
                <line
                  key={`tick-${k}-${t}`}
                  x1={tx}
                  y1={y - 5}
                  x2={tx}
                  y2={y + 5}
                  stroke={stage.color}
                  strokeWidth={1}
                  opacity={0.6 + (t % 3) * 0.2}
                />
              );
            }

            return (
              <g
                key={stage.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStage(stage)}
                onMouseLeave={() => setHoveredStage(null)}
                onClick={() => setSelectedStage(stage)}
              >
                {/* Background Pill */}
                <rect
                  x={cx - hw - 6}
                  y={y - 9}
                  width={w + 12}
                  height={18}
                  rx="9"
                  fill="#0a0f1d"
                  stroke={isHovered || isSelected ? '#38bdf8' : stage.color}
                  strokeWidth={isHovered || isSelected ? 2 : 1.2}
                  opacity={0.9}
                  className="transition-all duration-200"
                />

                {/* Barcode Ticks */}
                {ticks}

                {/* Central Quantity Tag */}
                <text
                  x={cx}
                  y={y + 3.5}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                  className="select-none pointer-events-none"
                >
                  {stage.count.toLocaleString()} {stage.unit}
                </text>

                {/* Left Margin Stage Name */}
                <text
                  x={cx - hw - 14}
                  y={y + 3}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="600"
                  fill={isHovered || isSelected ? '#38bdf8' : '#cbd5e1'}
                  textAnchor="end"
                >
                  {stage.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Inspector */}
        {(hoveredStage || selectedStage) && (
          <div className="absolute top-3 left-3 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 max-w-xs text-xs font-mono shadow-2xl z-30 animate-in fade-in duration-150">
            {(() => {
              const active = hoveredStage || selectedStage;
              if (!active) return null;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-teal-300 truncate">{active.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-900 border border-slate-700 text-slate-200">
                      {active.count.toLocaleString()} {active.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {active.description}
                  </p>
                  {active.items && active.items.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {mode === 'chat_cognition' ? 'Active Ingested Data Citations' : 'Git Release Milestones'}:
                      </span>
                      <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc pl-3 font-mono">
                        {active.items.map((item, idx) => (
                          <li key={idx} className="line-clamp-1">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Narrative Synthesis Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5 font-bold">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Entropy Compression</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {mode === 'chat_cognition'
              ? '4,200 raw data records distilled down to 24 high-priority pedagogical interventions (99.4% entropy compression).'
              : '540 worker commits distilled into 42 conventional commits on main, yielding 4 published releases.'}
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Focal Choke Point</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {mode === 'chat_cognition'
              ? 'Quantum QSVC hyperplane (w* boundary) clusters high-risk failing students into targeted language & math queues.'
              : 'Trunk-based squash merge ensures release stability and atomic conventional commit release notes.'}
          </p>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Provenance</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {mode === 'chat_cognition'
              ? 'All agent chat answers trace directly back to verified Excel row numbers and attendance timestamps in Local Vault.'
              : 'Every published wheel and npm package matches the exact Git commit SHA descended from the canonical tag.'}
          </p>
        </div>
      </div>
    </div>
  );
};
