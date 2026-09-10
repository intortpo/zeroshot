import React, { useState } from 'react';
import {
  GitMerge,
  MessageSquare,
  Activity,
  Layers,
} from 'lucide-react';

export type HourglassMode = 'chat_cognition' | 'git_development';
export type HourglassOrientation = 'horizontal' | 'vertical';

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
  orientation?: HourglassOrientation;
  className?: string;
}

export const PetriHourglassStream: React.FC<PetriHourglassStreamProps> = ({
  initialMode = 'git_development',
  orientation = 'horizontal',
  className = '',
}) => {
  const [mode, setMode] = useState<HourglassMode>(initialMode);
  const [currentOrientation, setCurrentOrientation] = useState<HourglassOrientation>(orientation);
  const [hoveredStage, setHoveredStage] = useState<HourglassStage | null>(null);
  const [selectedStage, setSelectedStage] = useState<HourglassStage | null>(null);

  // Define stages for Chat Cognition & Data Pattern Tracking
  const chatStages: HourglassStage[] = [
    {
      id: 'raw_data',
      label: '1. Ingested Data',
      count: 4200,
      unit: 'Records',
      description: 'Midterms 1-2026, 324 Below-Passing students, May punctuality audit (838 students).',
      color: '#0d9488', // Tiffany Base
      items: [
        'Midterms 1-2026.xlsx (849 students · 16 subjects)',
        '2026 Summary of Below Passing Marks (324 failures)',
        'Check In & Out Record 18-29 May 2026 (838 students)',
      ],
    },
    {
      id: 'vector_distill',
      label: '2. Vector Distillation',
      count: 1850,
      unit: 'Chunks',
      description: 'Recursive paragraph segmentation, L2 dense embeddings, encrypted envelope storage.',
      color: '#14b8a6', // Tiffany Light
      items: [
        'Curriculum passing thresholds (50% max mark)',
        'Thai Language, Math IP, Science IP, Mandarin item vectors',
      ],
    },
    {
      id: 'qsvc_choke',
      label: '3. QSVC Choke Neck',
      count: 480,
      unit: 'Deficits',
      description: 'DINA slips/guessing filter & Quantum ZZFeatureMap decision boundary (w* hyperplane).',
      color: '#0abab5', // Tiffany Pure
      items: [
        'Student #3667 Leo: Mandarin + Math IP + Math Thai deficit',
        'Student #3068 Star: 5 below-passing marks (Critical Risk)',
      ],
    },
    {
      id: 'rag_attention',
      label: '4. Attention Neck',
      count: 120,
      unit: 'Top-K Excerpts',
      description: 'Cosine similarity ranking + lexical keyword alignment delivering exact citations.',
      color: '#2dd4bf', // Tiffany Bright
      items: [
        'Leo case file citation (88.5% match confidence)',
        'Late arrival penalty threshold rules (08:00 AM cutoff)',
      ],
    },
    {
      id: 'agent_action',
      label: '5. Action & Delivery',
      count: 24,
      unit: 'Interventions',
      description: 'Targeted remediation plans, parent alerts, advisor notifications.',
      color: '#5eead4', // Tiffany Surge
      items: [
        'Dispatched Mandarin remedial micro-module for Leo #3667',
        'Academic Advisor high-priority alert for Star #3068',
      ],
    },
  ];

  // Define stages for Git Development & Release Tracking (Left to Right)
  const gitStages: HourglassStage[] = [
    {
      id: 'git_commits',
      label: '1. Worker Commits',
      count: 540,
      unit: 'Task Commits',
      description: 'Autonomous agent task runs, isolated worktrees, exploratory branches.',
      color: '#0d9488', // Tiffany Deep
      items: [
        'Subagent branch: feat/petri-submersion-3d-engine',
        'Subagent branch: feat/full-file-doc-rag-federated-hub',
        'Subagent branch: feat/google-drive-dwd-impersonation',
      ],
    },
    {
      id: 'ci_gates',
      label: '2. Automated CI Gates',
      count: 180,
      unit: 'Verified PRs',
      description: 'Narrow checks (cargo clippy, cargo fmt, cargo test, npm test, ruff check, pydoclint).',
      color: '#14b8a6', // Tiffany Light
      items: [
        'Rust Clippy 4-parameter ceiling verified',
        'Protocol Rust types & OpenRPC conformance verified',
        'Zero occurrences of forbidden word verified',
      ],
    },
    {
      id: 'squash_neck',
      label: '3. Main Trunk Squash',
      count: 42,
      unit: 'Squash Merges',
      description: 'Single authoritative Conventional Commit squash-merged directly onto main.',
      color: '#0abab5', // Tiffany Pure
      items: [
        'feat(git): add development git page with horizontal petri funnel',
        'feat(security): enable gcp iap ssh tunnel and smartshield',
        'feat(edm): strip lieflat charts with 3D petri submersion',
      ],
    },
    {
      id: 'release_fanout',
      label: '4. Release Fanout',
      count: 4,
      unit: 'Distributions',
      description: 'Unified GitHub Release publish: native CLI binaries, Docker target, npm, PyPI wheel rev 1.',
      color: '#5eead4', // Tiffany Surge
      items: [
        'Native CLI binary: zeroshot-v8 (Linux, macOS, Windows)',
        'Docker Image: ghcr.io/the-open-engine/zeroshot-target',
        'npm Package: @the-open-engine-company/zeroshot',
        'Python SDK: the-open-engine-zeroshot (wheel rev 1)',
      ],
    },
  ];

  const currentStages = mode === 'chat_cognition' ? chatStages : gitStages;
  const maxCount = currentStages[0].count;

  // Viewport Geometry
  const isHorizontal = currentOrientation === 'horizontal';
  const width = isHorizontal ? 760 : 480;
  const height = isHorizontal ? 240 : 340;
  const stageSpacing = isHorizontal
    ? (width - 120) / Math.max(1, currentStages.length - 1)
    : (height - 60) / Math.max(1, currentStages.length - 1);
  const maxBarHeight = 120;
  const maxBarWidth = 320;
  const cy = height / 2;
  const cx = width / 2;

  return (
    <div className={`bg-[#071620] text-slate-100 rounded-2xl border border-teal-900/40 p-5 shadow-2xl space-y-3.5 select-none ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-900/40 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#041017] text-teal-400 border border-teal-800/60 flex items-center justify-center">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>Petri Funnel Stream</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#041017] text-teal-300 border border-teal-900/50">
                {isHorizontal ? 'Horizontal (Left → Right)' : 'Vertical Top-Down'}
              </span>
            </h3>
          </div>
        </div>

        {/* Orientation & Mode Toggles */}
        <div className="flex items-center space-x-2">
          {/* Orientation Toggle */}
          <button
            onClick={() => setCurrentOrientation(isHorizontal ? 'vertical' : 'horizontal')}
            className="px-2.5 py-1 rounded-lg bg-[#041017] border border-teal-900/50 text-slate-300 hover:text-teal-200 text-xs font-mono flex items-center space-x-1.5 cursor-pointer transition-colors"
            title="Toggle Flow Orientation"
          >
            <Layers className="w-3 h-3 text-teal-400" />
            <span>{isHorizontal ? 'L → R' : 'Top → Down'}</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl bg-[#041017] border border-teal-900/50 p-1 space-x-1 text-xs font-mono">
            <button
              onClick={() => {
                setMode('git_development');
                setSelectedStage(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                mode === 'git_development'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitMerge className="w-3 h-3" />
              <span>Git Flow</span>
            </button>
            <button
              onClick={() => {
                setMode('chat_cognition');
                setSelectedStage(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                mode === 'chat_cognition'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Cognition & Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative bg-[#041017] rounded-xl border border-teal-900/40 p-2 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible select-none">
          <defs>
            <linearGradient id="streamGradTiffany" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#5eead4" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {isHorizontal ? (
            /* Horizontal Streamlines (Left to Right) */
            <>
              {currentStages.map((stage, k) => {
                if (k >= currentStages.length - 1) return null;
                const nextStage = currentStages[k + 1];

                const xLeft = 60 + k * stageSpacing;
                const xRight = 60 + (k + 1) * stageSpacing;

                const hLeft = Math.max(24, (stage.count / maxCount) * maxBarHeight);
                const hRight = Math.max(16, (nextStage.count / maxCount) * maxBarHeight);

                const numThreads = 24;
                const threads = [];

                for (let t = 0; t < numThreads; t++) {
                  const u = (t + 0.5) / numThreads;
                  const yLeft = cy - hLeft / 2 + u * hLeft;
                  const yRight = cy - hRight / 2 + u * hRight;

                  const cx1 = xLeft + (xRight - xLeft) * 0.45;
                  const cx2 = xRight - (xRight - xLeft) * 0.45;

                  threads.push(
                    <path
                      key={`hthread-${k}-${t}`}
                      d={`M ${xLeft + 6} ${yLeft.toFixed(1)} C ${cx1.toFixed(1)} ${yLeft.toFixed(1)}, ${cx2.toFixed(1)} ${yRight.toFixed(1)}, ${xRight - 6} ${yRight.toFixed(1)}`}
                      fill="none"
                      stroke={t % 4 === 0 ? '#5eead4' : t % 2 === 0 ? '#14b8a6' : '#0d9488'}
                      strokeWidth={t % 4 === 0 ? 0.85 : 0.45}
                      opacity={t % 4 === 0 ? 0.7 : 0.3}
                    />
                  );
                }

                const yieldPct = Math.round((nextStage.count / stage.count) * 100);
                const midX = (xLeft + xRight) / 2;

                return (
                  <g key={`hconnector-${k}`}>
                    {threads}
                    {/* Yield Label */}
                    <rect
                      x={midX - 22}
                      y={height - 24}
                      width={44}
                      height={16}
                      rx="4"
                      fill="#071620"
                      stroke="#134e4a"
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={height - 13}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#5eead4"
                      textAnchor="middle"
                    >
                      → {yieldPct}%
                    </text>
                  </g>
                );
              })}

              {/* Horizontal Stage Bars */}
              {currentStages.map((stage, k) => {
                const x = 60 + k * stageSpacing;
                const h = Math.max(24, (stage.count / maxCount) * maxBarHeight);
                const hh = h / 2;
                const isHovered = hoveredStage?.id === stage.id;
                const isSelected = selectedStage?.id === stage.id;

                const numTicks = Math.min(32, Math.max(8, Math.round(h / 5)));
                const ticks = [];
                for (let t = 0; t < numTicks; t++) {
                  const ty = cy - hh + (t + 0.5) * (h / numTicks);
                  ticks.push(
                    <line
                      key={`htick-${k}-${t}`}
                      x1={x - 4}
                      y1={ty}
                      x2={x + 4}
                      y2={ty}
                      stroke={stage.color}
                      strokeWidth={1}
                      opacity={0.65 + (t % 2) * 0.3}
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
                    {/* Stage Vertical Bar Pill */}
                    <rect
                      x={x - 7}
                      y={cy - hh - 4}
                      width={14}
                      height={h + 8}
                      rx="7"
                      fill="#071620"
                      stroke={isHovered || isSelected ? '#5eead4' : stage.color}
                      strokeWidth={isHovered || isSelected ? 2 : 1.2}
                    />
                    {ticks}

                    {/* Stage Label on Top */}
                    <text
                      x={x}
                      y={cy - hh - 12}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={isHovered || isSelected ? '#5eead4' : '#cbd5e1'}
                      textAnchor="middle"
                    >
                      {stage.label}
                    </text>

                    {/* Stage Count on Bottom */}
                    <text
                      x={x}
                      y={cy + hh + 16}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                      fill="#5eead4"
                      textAnchor="middle"
                    >
                      {stage.count.toLocaleString()} {stage.unit}
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            /* Vertical Streamlines (Top to Bottom fallback) */
            <>
              {currentStages.map((stage, k) => {
                if (k >= currentStages.length - 1) return null;
                const nextStage = currentStages[k + 1];

                const yTop = 32 + k * stageSpacing;
                const yBottom = 32 + (k + 1) * stageSpacing;

                const wTop = Math.max(30, (stage.count / maxCount) * maxBarWidth);
                const wBottom = Math.max(26, (nextStage.count / maxCount) * maxBarWidth);

                const numThreads = 24;
                const threads = [];

                for (let t = 0; t < numThreads; t++) {
                  const u = (t + 0.5) / numThreads;
                  const xTop = cx - wTop / 2 + u * wTop;
                  const xBottom = cx - wBottom / 2 + u * wBottom;

                  const cy1 = yTop + (yBottom - yTop) * 0.45;
                  const cy2 = yBottom - (yBottom - yTop) * 0.45;

                  threads.push(
                    <path
                      key={`vthread-${k}-${t}`}
                      d={`M ${xTop.toFixed(1)} ${yTop + 8} C ${xTop.toFixed(1)} ${cy1.toFixed(1)}, ${xBottom.toFixed(1)} ${cy2.toFixed(1)}, ${xBottom.toFixed(1)} ${yBottom - 8}`}
                      fill="none"
                      stroke={t % 4 === 0 ? '#5eead4' : t % 2 === 0 ? '#14b8a6' : '#0d9488'}
                      strokeWidth={t % 4 === 0 ? 0.8 : 0.45}
                      opacity={t % 4 === 0 ? 0.7 : 0.28}
                    />
                  );
                }

                const yieldPct = Math.round((nextStage.count / stage.count) * 100);
                const midY = (yTop + yBottom) / 2;

                return (
                  <g key={`vconnector-${k}`}>
                    {threads}
                    <rect
                      x={width - 55}
                      y={midY - 9}
                      width={46}
                      height={18}
                      rx="4"
                      fill="#071620"
                      stroke="#134e4a"
                      strokeWidth="1"
                    />
                    <text
                      x={width - 32}
                      y={midY + 3}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#5eead4"
                      textAnchor="middle"
                    >
                      ↓ {yieldPct}%
                    </text>
                  </g>
                );
              })}

              {currentStages.map((stage, k) => {
                const y = 32 + k * stageSpacing;
                const w = Math.max(30, (stage.count / maxCount) * maxBarWidth);
                const hw = w / 2;
                const isHovered = hoveredStage?.id === stage.id;
                const isSelected = selectedStage?.id === stage.id;

                return (
                  <g
                    key={stage.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredStage(stage)}
                    onMouseLeave={() => setHoveredStage(null)}
                    onClick={() => setSelectedStage(stage)}
                  >
                    <rect
                      x={cx - hw - 6}
                      y={y - 9}
                      width={w + 12}
                      height={18}
                      rx="9"
                      fill="#071620"
                      stroke={isHovered || isSelected ? '#5eead4' : stage.color}
                      strokeWidth={isHovered || isSelected ? 2 : 1.2}
                    />
                    <text
                      x={cx}
                      y={y + 3.5}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      {stage.count.toLocaleString()} {stage.unit}
                    </text>
                    <text
                      x={cx - hw - 14}
                      y={y + 3}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                      fill={isHovered || isSelected ? '#5eead4' : '#cbd5e1'}
                      textAnchor="end"
                    >
                      {stage.label}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* Hover / Selected Stage Inspector */}
        {(hoveredStage || selectedStage) && (
          <div className="absolute top-3 left-3 bg-[#071620] border border-teal-700/60 rounded-xl p-3 max-w-xs text-xs font-mono shadow-2xl z-30 animate-in fade-in duration-150">
            {(() => {
              const active = hoveredStage || selectedStage;
              if (!active) return null;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 border-b border-teal-900/60 pb-1.5">
                    <span className="font-bold text-teal-300 truncate">{active.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#041017] border border-teal-800 text-teal-200">
                      {active.count.toLocaleString()} {active.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {active.description}
                  </p>
                  {active.items && active.items.length > 0 && (
                    <div className="pt-1.5 border-t border-teal-900/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-teal-400">
                        Active References:
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

      {/* Clean Metric Badges (No long narrative explanation blocks) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {currentStages.map((stage) => (
          <div
            key={stage.id}
            className="px-3 py-2 rounded-xl bg-[#041017] border border-teal-900/40 flex items-center justify-between font-mono"
          >
            <div className="text-[11px] text-slate-400 truncate mr-2">{stage.label.split('. ')[1] || stage.label}</div>
            <div className="text-xs font-bold text-teal-300">{stage.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
