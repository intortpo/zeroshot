import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Sun,
  Moon,
  Copy,
} from 'lucide-react';
import { PetriItem, Workspace, UserProfile } from '../types';

export type GraphStage =
  | 'idle'
  | 'input'
  | 'worker'
  | 'verifying'
  | 'choice'
  | 'repair'
  | 'delivery'
  | 'delivery_repair'
  | 'merged';

interface OrchestrationGraphViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  items?: PetriItem[];
  onAdvanceStage?: (itemId: string) => void;
  onOpenApproval?: (item: PetriItem) => void;
  onSubmitGoal?: (goal: string) => void;
}

export const OrchestrationGraphView: React.FC<OrchestrationGraphViewProps> = ({
  activeWorkspace,
  activeUser,
  items = [],
  onSubmitGoal,
}) => {
  // Theme toggle: 'obsidian' (matches the exact demo GIF aesthetic) or 'porcelain'
  const [theme, setTheme] = useState<'obsidian' | 'porcelain'>('obsidian');

  // Active stage in the software-change orchestration graph
  const [activeStage, setActiveStage] = useState<GraphStage>('input');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.5);
  const [repairCount, setRepairCount] = useState<number>(0);
  const [simulateRepair, setSimulateRepair] = useState<boolean>(false);
  const [simulateDeliveryConflict, setSimulateDeliveryConflict] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('goal');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Selected or custom goal
  const defaultGoal = items[0]?.title || 'Add structured JSON output with acceptance tests';
  const [goalText, setGoalText] = useState<string>(defaultGoal);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  const activeItem = useMemo(() => {
    return items.find((i) => i.title === goalText) || items[0] || null;
  }, [items, goalText]);

  // Stage progression step function
  const advanceStep = () => {
    setActiveStage((curr) => {
      switch (curr) {
        case 'idle':
          return 'input';
        case 'input':
          return 'worker';
        case 'worker':
          return 'verifying';
        case 'verifying':
          return 'choice';
        case 'choice':
          if (simulateRepair && repairCount < 1) {
            setRepairCount((c) => c + 1);
            return 'repair';
          }
          return 'delivery';
        case 'repair':
          // Loops back to verifying after repair turn!
          return 'verifying';
        case 'delivery':
          if (simulateDeliveryConflict) {
            return 'delivery_repair';
          }
          return 'merged';
        case 'delivery_repair':
          // Re-enters review loop
          return 'verifying';
        case 'merged':
          return 'idle';
        default:
          return 'idle';
      }
    });
  };

  // Reset graph simulation
  const resetGraph = () => {
    setActiveStage('input');
    setIsPlaying(false);
    setRepairCount(0);
  };

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(800, 2400 / playbackSpeed);
    const timer = setInterval(() => {
      setActiveStage((curr) => {
        if (curr === 'merged') {
          setIsPlaying(false);
          return 'merged';
        }
        switch (curr) {
          case 'idle':
            return 'input';
          case 'input':
            return 'worker';
          case 'worker':
            return 'verifying';
          case 'verifying':
            return 'choice';
          case 'choice':
            if (simulateRepair && repairCount < 1) {
              setRepairCount((c) => c + 1);
              return 'repair';
            }
            return 'delivery';
          case 'repair':
            return 'verifying';
          case 'delivery':
            if (simulateDeliveryConflict) {
              return 'delivery_repair';
            }
            return 'merged';
          case 'delivery_repair':
            return 'verifying';
          default:
            return 'idle';
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, simulateRepair, simulateDeliveryConflict, repairCount]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Status badge text & color based on activeStage
  const statusBadge = useMemo(() => {
    switch (activeStage) {
      case 'input':
        return { label: 'GOAL RECEIVED', color: 'text-[#FF5F1F] bg-[#FF5F1F]/10 border-[#FF5F1F]/30' };
      case 'worker':
        return { label: 'IMPLEMENTING', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
      case 'verifying':
        return { label: 'INDEPENDENT REVIEW', color: 'text-[#0ABAB5] bg-[#0ABAB5]/10 border-[#0ABAB5]/30' };
      case 'choice':
        return { label: 'EVALUATING VERDICTS', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' };
      case 'repair':
        return { label: `REPAIRING (${repairCount}/10)`, color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
      case 'delivery':
        return { label: 'DELIVERING (GIT PUSH & CI)', color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' };
      case 'delivery_repair':
        return { label: 'REPAIRING CI CONFLICT', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
      case 'merged':
        return { label: 'DONE (MERGED)', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
      default:
        return { label: 'READY', color: 'text-stone-400 bg-stone-500/10 border-stone-500/20' };
    }
  }, [activeStage, repairCount]);

  const isObsidian = theme === 'obsidian';

  return (
    <div
      className={`flex-1 w-full h-full flex flex-col overflow-y-auto font-sans transition-colors duration-300 ${
        isObsidian ? 'bg-[#0f0f10] text-[#e3e3e3]' : 'bg-[#FAFBFB] text-stone-900'
      }`}
    >
      {/* Top Control Header */}
      <div
        className={`px-6 sm:px-10 py-4 border-b flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-2xl ${
          isObsidian ? 'bg-[#0f0f10]/90 border-stone-800' : 'bg-white/80 border-stone-200/80'
        }`}
      >
        {/* Left: Branding & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 text-xs font-mono tracking-wider">
            <span className="text-[#FF5F1F] font-bold">ZEROSHOT</span>
            <span className={isObsidian ? 'text-stone-600' : 'text-stone-400'}>·</span>
            <span className={isObsidian ? 'text-stone-400' : 'text-stone-500'}>SOFTWARE-CHANGE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center space-x-3">
            <span>The graph is the orchestration.</span>
          </h1>
        </div>

        {/* Center: Graph Runtime Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Run/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`subtle-depth-interactive px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-[#FF5F1F] hover:bg-orange-600 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Run Graph'}</span>
          </button>

          {/* Single Step Forward */}
          <button
            type="button"
            onClick={advanceStep}
            className={`subtle-depth-interactive px-3 py-2 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
              isObsidian
                ? 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <span>Step</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={resetGraph}
            className={`subtle-depth-interactive p-2 rounded-xl text-xs border transition-colors ${
              isObsidian
                ? 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-500'
            }`}
            title="Reset Graph to Initial Goal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Playback Speed Selector */}
          <div className="flex items-center space-x-1 pl-1">
            {[1, 1.5, 2.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                  playbackSpeed === speed
                    ? 'bg-[#0ABAB5]/20 border-[#0ABAB5] text-[#0ABAB5] font-bold'
                    : isObsidian
                    ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Test Simulation Toggles */}
          <div className="flex items-center space-x-2 pl-2 border-l border-stone-700/50">
            <button
              type="button"
              onClick={() => setSimulateRepair(!simulateRepair)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
                simulateRepair
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-semibold'
                  : isObsidian
                  ? 'bg-stone-900/50 border-stone-800 text-stone-400 hover:text-stone-200'
                  : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}
            >
              Test Repair Loop: {simulateRepair ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => setSimulateDeliveryConflict(!simulateDeliveryConflict)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
                simulateDeliveryConflict
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-semibold'
                  : isObsidian
                  ? 'bg-stone-900/50 border-stone-800 text-stone-400 hover:text-stone-200'
                  : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}
            >
              Test CI Conflict: {simulateDeliveryConflict ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Right: Built-In Graph Info & Theme Switcher */}
        <div className="flex items-center space-x-4 text-right">
          <div className="hidden md:block">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              BUILT-IN GRAPH
            </div>
            <div className="text-[11px] text-stone-500 font-mono">
              bounded repair · durable ledger
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(isObsidian ? 'porcelain' : 'obsidian')}
            className={`p-2 rounded-xl border transition-colors ${
              isObsidian
                ? 'bg-stone-900/90 border-stone-800 text-stone-300 hover:text-white'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
            title={`Switch to ${isObsidian ? 'Porcelain Light' : 'Obsidian Dark'}`}
          >
            {isObsidian ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>
        </div>
      </div>

      {/* Goal Selector Strip */}
      <div
        className={`px-6 sm:px-10 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isObsidian ? 'bg-stone-950/60 border-stone-800/80 text-stone-400' : 'bg-stone-50 border-stone-200/70 text-stone-600'
        }`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          <span className="font-semibold text-stone-500 uppercase tracking-wider text-[11px]">
            Active Goal:
          </span>
          {isEditingGoal ? (
            <div className="flex items-center space-x-2 flex-1 max-w-xl">
              <input
                type="text"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0ABAB5] ${
                  isObsidian ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  setIsEditingGoal(false);
                  onSubmitGoal?.(goalText);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0ABAB5] text-white text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 flex-1">
              <span className={`font-mono truncate ${isObsidian ? 'text-stone-200' : 'text-stone-800 font-medium'}`}>
                "{goalText}"
              </span>
              <button
                type="button"
                onClick={() => setIsEditingGoal(true)}
                className="text-[11px] text-[#0ABAB5] hover:underline"
              >
                edit
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span>Worktree: <strong className={isObsidian ? 'text-stone-300' : 'text-stone-800'}>{activeWorkspace?.name || 'zero-petri'}@main</strong></span>
          <span>·</span>
          <span>Ledger: <strong className="text-emerald-500">SQLite Durable</strong></span>
        </div>
      </div>

      {/* Main Graph Viewport Container */}
      <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-x-auto min-h-[640px]">
        {/* SVG Diagram Canvas matching zeroshot-demo.gif */}
        <div className="w-full max-w-[1240px] relative select-text">
          <svg
            viewBox="0 0 1200 600"
            className="w-full h-auto drop-shadow-2xl overflow-visible"
            style={{ minWidth: '960px' }}
          >
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrowhead-muted"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" fill={isObsidian ? '#404040' : '#d4d4d8'} />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" fill="#FF5F1F" />
              </marker>
              <marker
                id="arrowhead-teal"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" fill="#0ABAB5" />
              </marker>
              <marker
                id="arrowhead-green"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" fill="#10b981" />
              </marker>
              <marker
                id="arrowhead-rose"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 Z" fill="#f43f5e" />
              </marker>

              {/* Glowing gradient filters */}
              <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- 1. ENCLOSING BOUNDARY: INDEPENDENT REVIEW LOOP (Max 10 iterations) --- */}
            <g>
              <rect
                x="410"
                y="60"
                width="440"
                height="460"
                rx="18"
                ry="18"
                fill={isObsidian ? '#141416' : '#f4f4f5'}
                stroke={
                  activeStage === 'verifying' || activeStage === 'choice' || activeStage === 'repair'
                    ? '#0ABAB5'
                    : isObsidian
                    ? '#2a2a2e'
                    : '#e4e4e7'
                }
                strokeWidth={activeStage === 'verifying' || activeStage === 'repair' ? '2' : '1.5'}
                strokeDasharray={activeStage === 'repair' ? '6 4' : undefined}
                className="transition-all duration-300"
              />
              <text
                x="430"
                y="90"
                fill={isObsidian ? '#a3a3a3' : '#71717a'}
                fontSize="11"
                fontWeight="700"
                letterSpacing="1.2"
                fontFamily="monospace"
              >
                INDEPENDENT REVIEW LOOP
              </text>

              {/* Max iterations badge */}
              <rect
                x="705"
                y="74"
                width="130"
                height="24"
                rx="12"
                ry="12"
                fill={isObsidian ? '#222226' : '#e4e4e7'}
                stroke={isObsidian ? '#333338' : '#d4d4d8'}
                strokeWidth="1"
              />
              <text
                x="770"
                y="90"
                fill={isObsidian ? '#d4d4d8' : '#3f3f46'}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                MAX 10 ITERATIONS
              </text>
            </g>

            {/* --- CONNECTING PATHS & ARROWS --- */}
            {/* Edge 1: Goal -> Initial Implementation */}
            <path
              d="M 170 290 L 210 290"
              fill="none"
              stroke={activeStage === 'worker' ? '#FF5F1F' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'worker' ? 3 : 2}
              markerEnd={activeStage === 'worker' ? 'url(#arrowhead-active)' : 'url(#arrowhead-muted)'}
              strokeDasharray={activeStage === 'worker' ? '4 3' : undefined}
            />

            {/* Edge 2: Initial Implementation -> Fork to Acceptance Review & Code Review */}
            <path
              d="M 380 290 L 430 290 L 430 175 L 450 175"
              fill="none"
              stroke={activeStage === 'verifying' ? '#0ABAB5' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'verifying' ? 2.5 : 1.5}
              markerEnd={activeStage === 'verifying' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
            />
            <path
              d="M 430 290 L 430 335 L 450 335"
              fill="none"
              stroke={activeStage === 'verifying' ? '#0ABAB5' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'verifying' ? 2.5 : 1.5}
              markerEnd={activeStage === 'verifying' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
            />

            {/* Edge 3: Acceptance Review -> Review Result */}
            <path
              d="M 610 175 L 640 175 L 640 230 L 670 230"
              fill="none"
              stroke={activeStage === 'choice' ? '#0ABAB5' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'choice' ? 2.5 : 1.5}
              markerEnd={activeStage === 'choice' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
            />

            {/* Edge 4: Code Review -> Review Result */}
            <path
              d="M 610 335 L 640 335 L 640 260 L 670 260"
              fill="none"
              stroke={activeStage === 'choice' ? '#0ABAB5' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'choice' ? 2.5 : 1.5}
              markerEnd={activeStage === 'choice' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
            />

            {/* Edge 5: Review Result (REJECTED) -> Repair from Review Evidence */}
            <path
              d="M 745 295 L 745 400"
              fill="none"
              stroke={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'repair' ? 2.5 : 1.5}
              markerEnd={activeStage === 'repair' ? 'url(#arrowhead-rose)' : 'url(#arrowhead-muted)'}
            />
            {/* REJECTED Badge */}
            <rect
              x="712"
              y="335"
              width="66"
              height="20"
              rx="4"
              fill={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#222226' : '#e4e4e7'}
            />
            <text
              x="745"
              y="349"
              fill={activeStage === 'repair' ? '#ffffff' : isObsidian ? '#a3a3a3' : '#52525b'}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              REJECTED
            </text>

            {/* Edge 6: Repair from Review Evidence -> Loop Back to Reviews */}
            <path
              d="M 570 445 L 380 445 L 380 290 L 430 290"
              fill="none"
              stroke={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'repair' ? 2 : 1.5}
              strokeDasharray={activeStage === 'repair' ? '6 4' : undefined}
              markerEnd={activeStage === 'repair' ? 'url(#arrowhead-rose)' : 'url(#arrowhead-muted)'}
            />
            {/* REVIEW AGAIN Badge */}
            <rect
              x="440"
              y="435"
              width="85"
              height="20"
              rx="4"
              fill={isObsidian ? '#222226' : '#e4e4e7'}
            />
            <text
              x="482"
              y="449"
              fill={isObsidian ? '#a3a3a3' : '#52525b'}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              REVIEW AGAIN
            </text>

            {/* Edge 7: Review Result (ACCEPTED) -> Commit + Push */}
            <path
              d="M 820 245 L 860 245 L 860 190 L 890 190"
              fill="none"
              stroke={activeStage === 'delivery' || activeStage === 'merged' ? '#10b981' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'delivery' || activeStage === 'merged' ? 2.5 : 1.5}
              markerEnd={activeStage === 'delivery' || activeStage === 'merged' ? 'url(#arrowhead-green)' : 'url(#arrowhead-muted)'}
            />
            {/* ACCEPTED Badge */}
            <rect
              x="828"
              y="185"
              width="64"
              height="20"
              rx="4"
              fill={activeStage === 'delivery' ? '#10b981' : isObsidian ? '#222226' : '#e4e4e7'}
            />
            <text
              x="860"
              y="199"
              fill={activeStage === 'delivery' ? '#ffffff' : isObsidian ? '#a3a3a3' : '#52525b'}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              ACCEPTED
            </text>

            {/* Edge 8: Commit + push -> Done (MERGED) */}
            <path
              d="M 1005 250 L 1005 320"
              fill="none"
              stroke={activeStage === 'merged' ? '#10b981' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'merged' ? 3 : 1.5}
              markerEnd={activeStage === 'merged' ? 'url(#arrowhead-green)' : 'url(#arrowhead-muted)'}
            />
            {/* MERGED Badge */}
            <rect
              x="975"
              y="270"
              width="60"
              height="20"
              rx="4"
              fill={activeStage === 'merged' ? '#10b981' : isObsidian ? '#222226' : '#e4e4e7'}
            />
            <text
              x="1005"
              y="284"
              fill={activeStage === 'merged' ? '#ffffff' : isObsidian ? '#a3a3a3' : '#52525b'}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              MERGED
            </text>

            {/* Edge 9: Commit + push (REPAIR) -> Repair Delivery */}
            <path
              d="M 1110 210 L 1145 210 L 1145 455 L 1110 455"
              fill="none"
              stroke={activeStage === 'delivery_repair' ? '#f43f5e' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'delivery_repair' ? 2 : 1.5}
              markerEnd={activeStage === 'delivery_repair' ? 'url(#arrowhead-rose)' : 'url(#arrowhead-muted)'}
            />
            {/* REPAIR Badge */}
            <rect
              x="1075"
              y="270"
              width="54"
              height="20"
              rx="4"
              fill={activeStage === 'delivery_repair' ? '#f43f5e' : isObsidian ? '#222226' : '#e4e4e7'}
            />
            <text
              x="1102"
              y="284"
              fill={activeStage === 'delivery_repair' ? '#ffffff' : isObsidian ? '#a3a3a3' : '#52525b'}
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              REPAIR
            </text>

            {/* Edge 10: Repair Delivery -> Loop back to review container */}
            <path
              d="M 890 455 L 350 455 L 350 290 L 430 290"
              fill="none"
              stroke={activeStage === 'delivery_repair' ? '#f43f5e' : isObsidian ? '#404040' : '#d4d4d8'}
              strokeWidth={activeStage === 'delivery_repair' ? 2 : 1.5}
              strokeDasharray={activeStage === 'delivery_repair' ? '6 4' : undefined}
            />
          </svg>

          {/* --- HTML INTERACTIVE NODE CARDS (Positioned on top of SVG coordinates) --- */}
          {/* Node 1: Goal (INPUT) */}
          <div
            onClick={() => setSelectedNodeId('goal')}
            style={{ position: 'absolute', top: '235px', left: '20px', width: '150px', height: '110px' }}
            className={`rounded-2xl p-3.5 border cursor-pointer transition-all duration-200 shadow-lg flex flex-col justify-between ${
              selectedNodeId === 'goal' ? 'ring-2 ring-[#FF5F1F]' : ''
            } ${
              activeStage === 'input'
                ? 'border-[#FF5F1F] bg-[#FF5F1F]/15 text-white'
                : isObsidian
                ? 'border-stone-800 bg-[#17171a] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#FF5F1F] uppercase">
                INPUT
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF5F1F] animate-ping" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight">Goal</div>
              <div className="text-[11px] text-stone-400 truncate">plain-English</div>
            </div>
          </div>

          {/* Node 2: Initial Implementation (WORKER) */}
          <div
            onClick={() => setSelectedNodeId('worker')}
            style={{ position: 'absolute', top: '215px', left: '210px', width: '170px', height: '145px' }}
            className={`rounded-2xl p-3.5 border cursor-pointer transition-all duration-200 shadow-lg flex flex-col justify-between ${
              selectedNodeId === 'worker' ? 'ring-2 ring-amber-400' : ''
            } ${
              activeStage === 'worker'
                ? 'border-amber-400 bg-amber-400/15 text-white shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                : isObsidian
                ? 'border-stone-800 bg-[#17171a] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                WORKER
              </span>
              {activeStage === 'worker' && (
                <span className="text-[10px] font-mono text-amber-300 animate-pulse font-semibold">
                  running
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white leading-snug">
                Initial implementation
              </div>
              <div className="text-[11px] text-stone-400 mt-1">workspace + tests</div>
            </div>
            <div className="text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800/60 flex items-center justify-between">
              <span>Harness: codex</span>
            </div>
          </div>

          {/* Node 3a: Acceptance Review (VERIFIER) */}
          <div
            onClick={() => setSelectedNodeId('acceptance')}
            style={{ position: 'absolute', top: '125px', left: '450px', width: '160px', height: '98px' }}
            className={`rounded-2xl p-3 border cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between ${
              selectedNodeId === 'acceptance' ? 'ring-2 ring-[#0ABAB5]' : ''
            } ${
              activeStage === 'verifying'
                ? 'border-[#0ABAB5] bg-[#0ABAB5]/15 text-white shadow-[0_0_15px_rgba(10,186,181,0.2)]'
                : isObsidian
                ? 'border-stone-800 bg-[#1b1b1f] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#0ABAB5] uppercase">
                VERIFIER
              </span>
              {activeStage === 'choice' || activeStage === 'delivery' || activeStage === 'merged' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : null}
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">Acceptance review</div>
              <div className="text-[10px] text-stone-400">requirements</div>
            </div>
          </div>

          {/* Node 3b: Code Review (VERIFIER) */}
          <div
            onClick={() => setSelectedNodeId('code_review')}
            style={{ position: 'absolute', top: '285px', left: '450px', width: '160px', height: '98px' }}
            className={`rounded-2xl p-3 border cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between ${
              selectedNodeId === 'code_review' ? 'ring-2 ring-[#0ABAB5]' : ''
            } ${
              activeStage === 'verifying'
                ? 'border-[#0ABAB5] bg-[#0ABAB5]/15 text-white shadow-[0_0_15px_rgba(10,186,181,0.2)]'
                : isObsidian
                ? 'border-stone-800 bg-[#1b1b1f] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#0ABAB5] uppercase">
                VERIFIER
              </span>
              {activeStage === 'choice' || activeStage === 'delivery' || activeStage === 'merged' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : null}
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">Code review</div>
              <div className="text-[10px] text-stone-400">correctness + safety</div>
            </div>
          </div>

          {/* Node 4: Review Result (CHOICE) */}
          <div
            onClick={() => setSelectedNodeId('choice')}
            style={{ position: 'absolute', top: '198px', left: '670px', width: '150px', height: '95px' }}
            className={`rounded-2xl p-3 border cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between ${
              selectedNodeId === 'choice' ? 'ring-2 ring-indigo-400' : ''
            } ${
              activeStage === 'choice'
                ? 'border-indigo-400 bg-indigo-400/15 text-white'
                : isObsidian
                ? 'border-stone-800 bg-[#1b1b1f] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
              CHOICE
            </span>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">Review result</div>
              <div className="text-[10px] text-stone-400">pass or repair</div>
            </div>
          </div>

          {/* Node 5: Repair from review evidence (REJECTED · WORKER) */}
          <div
            onClick={() => setSelectedNodeId('repair')}
            style={{ position: 'absolute', top: '395px', left: '570px', width: '240px', height: '95px' }}
            className={`rounded-2xl p-3.5 border cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between ${
              selectedNodeId === 'repair' ? 'ring-2 ring-rose-400' : ''
            } ${
              activeStage === 'repair'
                ? 'border-rose-400 bg-rose-400/15 text-white shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                : isObsidian
                ? 'border-stone-800 bg-[#1b1b1f] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">
              REJECTED · WORKER
            </span>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                Repair from review evidence
              </div>
              <div className="text-[10px] text-stone-400">repeat both reviews</div>
            </div>
          </div>

          {/* Node 6: Commit + push PR (ACCEPTED · DELIVERY) */}
          <div
            onClick={() => setSelectedNodeId('delivery')}
            style={{ position: 'absolute', top: '130px', left: '890px', width: '230px', height: '120px' }}
            className={`rounded-2xl p-3.5 border cursor-pointer transition-all duration-200 shadow-lg flex flex-col justify-between ${
              selectedNodeId === 'delivery' ? 'ring-2 ring-emerald-400' : ''
            } ${
              activeStage === 'delivery'
                ? 'border-emerald-400 bg-emerald-400/15 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : isObsidian
                ? 'border-stone-800 bg-[#17171a] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
              ACCEPTED · DELIVERY
            </span>
            <div>
              <div className="text-sm font-bold text-white tracking-tight leading-tight">
                Commit + push
              </div>
              <div className="text-xs font-bold text-white tracking-tight leading-tight">
                PR + checks + merge
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Git delivery</div>
            </div>
          </div>

          {/* Node 7: Done (OUTPUT) */}
          <div
            onClick={() => setSelectedNodeId('done')}
            style={{ position: 'absolute', top: '320px', left: '945px', width: '120px', height: '85px' }}
            className={`rounded-2xl p-3 border cursor-pointer transition-all duration-200 shadow-lg flex flex-col justify-between ${
              selectedNodeId === 'done' ? 'ring-2 ring-emerald-400' : ''
            } ${
              activeStage === 'merged'
                ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                : isObsidian
                ? 'border-stone-800 bg-[#17171a] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
              OUTPUT
            </span>
            <div>
              <div className="text-sm font-bold text-white">Done</div>
              <div className="text-[10px] text-stone-400">merge receipt</div>
            </div>
          </div>

          {/* Node 8: Repair delivery (DELIVERY FAILED · WORKER) */}
          <div
            onClick={() => setSelectedNodeId('delivery_repair')}
            style={{ position: 'absolute', top: '415px', left: '890px', width: '220px', height: '85px' }}
            className={`rounded-2xl p-3 border cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between ${
              selectedNodeId === 'delivery_repair' ? 'ring-2 ring-rose-400' : ''
            } ${
              activeStage === 'delivery_repair'
                ? 'border-rose-400 bg-rose-400/15 text-white shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                : isObsidian
                ? 'border-stone-800 bg-[#17171a] text-stone-300'
                : 'border-stone-300 bg-white text-stone-800'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">
              DELIVERY FAILED · WORKER
            </span>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">Repair delivery</div>
              <div className="text-[10px] text-stone-400">CI failure or conflict</div>
            </div>
          </div>
        </div>

        {/* Node Detail Inspector Card */}
        {selectedNodeId && (
          <div
            className={`w-full max-w-[1240px] mt-6 p-5 rounded-2xl border shadow-xl transition-all animate-in fade-in duration-200 ${
              isObsidian ? 'bg-[#141416] border-stone-800 text-stone-300' : 'bg-white border-stone-200 text-stone-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-stone-700/50 pb-3 mb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-[#0ABAB5]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0ABAB5]">
                  Node Inspector: {selectedNodeId.toUpperCase()}
                </span>
                <span className="text-xs text-stone-500">·</span>
                <span className="text-xs text-stone-400">Durable SQLite Ledger Event Trace</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-stone-500 hover:text-stone-300"
              >
                Close ✕
              </button>
            </div>

            {selectedNodeId === 'goal' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-stone-500">Goal Prompt:</span>
                  <p className="text-stone-200 mt-1 font-sans">{goalText}</p>
                </div>
                <div>
                  <span className="text-stone-500">Author & Role:</span>
                  <p className="text-stone-200 mt-1">{activeUser?.name || 'Hideo'} ({activeUser?.role || 'owner'})</p>
                </div>
                <div>
                  <span className="text-stone-500">Template Spec:</span>
                  <p className="text-stone-200 mt-1 text-emerald-400">software-change.v8</p>
                </div>
              </div>
            )}

            {selectedNodeId === 'worker' && (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Worker Phase: Initial Synthesis</span>
                  <span className="text-amber-400">Bounded Execution: 300s max</span>
                </div>
                <pre className="p-3 rounded-xl bg-black/50 border border-stone-800 text-[11px] text-stone-300 overflow-x-auto">
                  {activeItem?.diff || `diff --git a/crates/openengine/src/lib.rs b/crates/openengine/src/lib.rs
+#[derive(Serialize, Deserialize)]
+pub struct SoftwareChangeReceipt {
+    pub goal_id: String,
+    pub merged_commit: String,
+    pub review_turns: usize,
+}`}
                </pre>
              </div>
            )}

            {selectedNodeId === 'acceptance' && (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Acceptance Verifier: Independent Sandbox</span>
                  <span className="text-emerald-400 font-bold">14 / 14 ACCEPTANCE TESTS PASSED</span>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-stone-800 text-[11px] text-emerald-300">
                  ✓ acceptance::test_goal_ingestion ... ok<br />
                  ✓ acceptance::test_bounded_repair_concurrency ... ok<br />
                  ✓ acceptance::test_durable_sqlite_event_order ... ok<br />
                  ✓ acceptance::test_zero_petri_invariants ... ok
                </div>
              </div>
            )}

            {selectedNodeId === 'code_review' && (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Code Review Verifier: Correctness & Security</span>
                  <span className="text-emerald-400 font-bold">0 DEFECTS / 0 LINT ERRORS</span>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-stone-800 text-[11px] text-stone-300">
                  • Rustfmt & Clippy checks clean with -D warnings<br />
                  • Four-parameter Clippy ceiling respected via Request structs<br />
                  • Fail-closed bounded recovery verified<br />
                  • Zero-petri memory boundary verified
                </div>
              </div>
            )}

            {selectedNodeId === 'choice' && (
              <div className="text-xs font-mono space-y-1">
                <span className="text-stone-500">Evidence Aggregator:</span>
                <p className="text-stone-200">
                  Acceptance: <strong className="text-emerald-400">APPROVED</strong> · Code Review: <strong className="text-emerald-400">APPROVED</strong> → Outcome: <strong className="text-emerald-400">ACCEPTED</strong>
                </p>
              </div>
            )}

            {selectedNodeId === 'repair' && (
              <div className="text-xs font-mono space-y-1">
                <span className="text-rose-400">Repair Worker Dispatch:</span>
                <p className="text-stone-300">
                  Evidence rejection payload dispatched to repair worker. Max bound: 10 iterations. Current repair turn: #{repairCount}.
                </p>
              </div>
            )}

            {selectedNodeId === 'delivery' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-stone-500">Pushed Branch:</span>
                  <p className="text-stone-200 mt-0.5">zeroshot/change-71f09c</p>
                </div>
                <div>
                  <span className="text-stone-500">PR Authority:</span>
                  <p className="text-stone-200 mt-0.5">#42 Merge Queue Verified</p>
                </div>
                <div>
                  <span className="text-stone-500">Required Contexts:</span>
                  <p className="text-emerald-400 mt-0.5">ci/native, ci/protocol PASSED</p>
                </div>
              </div>
            )}

            {selectedNodeId === 'done' && (
              <div className="text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Merge Receipt Generated</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('de653f7e9182', 'commit')}
                    className="flex items-center space-x-1 text-xs text-stone-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText === 'commit' ? 'Copied' : 'Copy SHA'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-emerald-900/40 text-[11px] text-emerald-300 font-mono">
                  Commit: de653f7e9182 (merged into main)<br />
                  Target: ghcr.io/the-open-engine/zeroshot-target<br />
                  Execution Duration: 24.8s · Total Tokens: 4,120
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar: Exact footer from zeroshot-demo.gif */}
      <div
        className={`px-6 sm:px-10 py-3.5 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-wider ${
          isObsidian ? 'bg-[#0f0f10] border-stone-800 text-stone-500' : 'bg-white border-stone-200 text-stone-500'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span>INDEPENDENT REVIEW</span>
          <span>·</span>
          <span>BOUNDED REPAIR</span>
          <span>·</span>
          <span>DURABLE LEDGER</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-stone-400 font-sans">Current Orchestration State:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 ${statusBadge.color}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>
    </div>
  );
};
