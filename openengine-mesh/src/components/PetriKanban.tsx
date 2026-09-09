import React, { useState } from 'react';
import {
  Bug,
  AlertCircle,
  Sparkles,
  Milestone,
  CheckCircle2,
  GitMerge,
  ShieldAlert,
  Loader2,
  ArrowRight,
  GitCommit,
  Bot,
  ChevronDown,
  ChevronUp,
  Zap,
  Cpu,
  Terminal,
  Play,
  RotateCw,
} from 'lucide-react';
import { PetriItem, PetriItemKind, PetriStage, AgentWorker } from '../types';

interface PetriKanbanProps {
  items: PetriItem[];
  onOpenApproval: (item: PetriItem) => void;
  onSelectItem?: (item: PetriItem) => void;
  onFanOutAgents?: (itemId: string) => void;
  onAdvanceStage?: (itemId: string) => void;
  onRecurseAgent?: (itemId: string) => void;
}

const STAGES: { stage: PetriStage; label: string; description: string }[] = [
  { stage: 'backlog', label: 'Backlog', description: 'Ingested & Queued' },
  { stage: 'in_flight', label: 'In Flight', description: 'Autonomous RTX Coding' },
  { stage: 'verifying', label: 'Verifying', description: 'Parallel Tests & Invariants' },
  { stage: 'gated', label: 'Gated Review', description: 'Awaiting 1-Tap Signoff' },
  { stage: 'merged', label: 'Fully Merged', description: 'Delivered to Trunk' },
];

export const getKindBadge = (kind: PetriItemKind) => {
  switch (kind) {
    case 'bug':
      return {
        label: 'BUG',
        icon: <Bug className="w-3.5 h-3.5 text-[#f87171]" />,
        style: 'bg-[#261414]/90 text-[#fca5a5] border-[#4d1f1f]',
      };
    case 'issue':
      return {
        label: 'ISSUE',
        icon: <AlertCircle className="w-3.5 h-3.5 text-[#fbbf24]" />,
        style: 'bg-[#262014]/90 text-[#fde68a] border-[#4d3b1f]',
      };
    case 'feat':
      return {
        label: 'FEAT',
        icon: <Sparkles className="w-3.5 h-3.5 text-[#e5e5e5]" />,
        style: 'bg-[#1a1a1a]/90 text-[#f5f5f5] border-[#333333]',
      };
    case 'mile':
      return {
        label: 'MILE',
        icon: <Milestone className="w-3.5 h-3.5 text-[#818cf8]" />,
        style: 'bg-[#161729]/90 text-[#c7d2fe] border-[#292c4d]',
      };
  }
};

export const PetriKanban: React.FC<PetriKanbanProps> = ({
  items,
  onOpenApproval,
  onSelectItem,
  onFanOutAgents,
  onAdvanceStage,
  onRecurseAgent,
}) => {
  // Expanded CoT drawer state per item
  const [expandedCoT, setExpandedCoT] = useState<Record<string, boolean>>({});

  const toggleCoT = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCoT((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className="flex-1 w-full overflow-x-auto p-6 sm:p-10 select-none">
      <div className="flex space-x-8 min-w-[1600px] h-full items-stretch pb-8">
        {STAGES.map((col, colIdx) => {
          const columnItems = items.filter((item) => item.stage === col.stage);
          const isMergedCol = col.stage === 'merged';
          const isInFlightCol = col.stage === 'in_flight';

          return (
            <div
              key={col.stage}
              className={`w-[400px] flex-shrink-0 flex flex-col rounded-3xl border transition-all duration-300 backdrop-blur-2xl ${
                isMergedCol
                  ? 'border-white/10 bg-[#0a0a0a]/80 shadow-[0_0_40px_rgba(255,255,255,0.02)]'
                  : isInFlightCol
                  ? 'border-white/10 bg-[#0c0c0c]/85 shadow-[0_0_40px_rgba(0,0,0,0.4)]'
                  : 'border-white/5 bg-[#090909]/75'
              }`}
            >
              {/* Column Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMergedCol ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
                      <GitMerge className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ) : (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isInFlightCol ? 'bg-indigo-400 animate-pulse' : 'bg-[#555555]'
                      }`}
                    />
                  )}
                  <div>
                    <div className="text-sm font-mono font-semibold text-[#f5f5f5] flex items-center space-x-2">
                      <span>{col.label}</span>
                      <span className="text-xs text-[#666666] font-normal">
                        ({columnItems.length})
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#666666] mt-0.5">
                      {col.description}
                    </div>
                  </div>
                </div>

                {colIdx < STAGES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#333333]" />
                )}
              </div>

              {/* Items List */}
              <div className="p-5 flex-1 overflow-y-auto space-y-6">
                {columnItems.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center border border-dashed border-[#1c1c1c] rounded-2xl text-xs font-mono text-[#444444] space-y-1">
                    <span>No active items</span>
                    <span className="text-[10px] text-[#333333]">Column idle</span>
                  </div>
                ) : (
                  columnItems.map((item) => {
                    const badge = getKindBadge(item.kind);
                    const isCoTOpen = !!expandedCoT[item.id];
                    const hasAgents = item.agents && item.agents.length > 0;
                    const cotSteps = item.chainOfThought || [
                      `[turn 1 · cot] Ingest intent & map AST boundaries in zero-petri`,
                      `[turn 2 · recurse] Speculative synthesis with bounded backpressure`,
                      `[turn 3 · active] Dispatched parallel verifiers to isolated target`,
                    ];
                    const recursionDepth = item.recursionDepth ?? 1;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem?.(item)}
                        className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer group backdrop-blur-xl ${
                          item.stage === 'gated'
                            ? 'border-amber-500/40 bg-[#14120e]/90 hover:border-amber-400/60 shadow-xl'
                            : item.stage === 'merged'
                            ? 'border-emerald-500/25 bg-[#0b130e]/80 hover:border-emerald-500/40'
                            : item.stage === 'in_flight'
                            ? 'border-white/10 bg-[#121212]/90 hover:border-white/20 shadow-lg'
                            : 'border-white/5 bg-[#0e0e0e]/80 hover:border-white/15 hover:bg-[#131313]/90'
                        }`}
                      >
                        {/* Header: Kind Badge, Time, and Recursion Depth Tag */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${badge.style}`}
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>

                            {item.stage === 'in_flight' && (
                              <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[9px] font-mono">
                                <Cpu className="w-3 h-3 text-indigo-400 animate-pulse" />
                                <span>Depth {recursionDepth}</span>
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-mono text-[#555555]">
                            #{item.id.slice(-6)}
                          </span>
                        </div>

                        {/* Title with generous spacing */}
                        <div className="text-sm font-medium text-[#e5e5e5] group-hover:text-[#ffffff] transition-colors line-clamp-3 leading-relaxed tracking-normal">
                          {item.title}
                        </div>

                        {/* Fanned Out Subagents Section */}
                        {hasAgents && (
                          <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#888888]">
                              <span className="flex items-center space-x-1.5">
                                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Concurrent Agents ({item.agents!.length})</span>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-medium">
                                Fanned Out
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {item.agents!.map((agent: AgentWorker) => (
                                <div
                                  key={agent.id}
                                  className="bg-[#080808]/90 border border-white/5 rounded-xl p-2.5 text-[11px] font-mono flex flex-col space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[#f5f5f5] flex items-center space-x-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                                      <span>{agent.role}</span>
                                    </span>
                                    <span className="text-[10px] text-[#777777] uppercase bg-[#141414] px-1.5 py-0.5 rounded">
                                      Turn {agent.recursionTurn ?? 1} · {agent.status}
                                    </span>
                                  </div>
                                  {agent.thought && (
                                    <div className="text-[10px] text-[#8e8e8e] italic pl-3 border-l border-white/10 mt-1">
                                      "{agent.thought}"
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chain of Thought (CoT) Monospace Terminal */}
                        {(item.stage === 'in_flight' || item.stage === 'verifying') && (
                          <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                            <button
                              type="button"
                              onClick={(e) => toggleCoT(item.id, e)}
                              className="w-full flex items-center justify-between text-[11px] font-mono text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors py-1 px-2 rounded-lg bg-[#0a0a0a]/60 border border-white/5"
                            >
                              <div className="flex items-center space-x-2">
                                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Chain of Thought ({cotSteps.length} turns)</span>
                              </div>
                              {isCoTOpen ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#737373]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
                              )}
                            </button>

                            {/* Active thought stream or expanded view */}
                            {isCoTOpen ? (
                              <div className="bg-[#080808] border border-white/5 rounded-xl p-3 space-y-2 font-mono text-[10px] animate-in fade-in duration-200">
                                {cotSteps.map((step, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="text-[#999999] leading-relaxed flex items-start space-x-2"
                                  >
                                    <span className="text-[#444444] select-none">❯</span>
                                    <span
                                      className={
                                        sIdx === cotSteps.length - 1
                                          ? 'text-cyan-300 font-medium'
                                          : ''
                                      }
                                    >
                                      {step}
                                    </span>
                                  </div>
                                ))}

                                {onRecurseAgent && (
                                  <div className="pt-2 border-t border-white/5 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRecurseAgent(item.id);
                                      }}
                                      className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#161616] hover:bg-[#202020] border border-white/10 text-cyan-400 hover:text-cyan-300 text-[10px] transition-colors"
                                    >
                                      <RotateCw className="w-3 h-3" />
                                      <span>Recurse Next Turn</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="px-2 py-1 text-[10px] font-mono text-[#666666] truncate flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="truncate">{cotSteps[cotSteps.length - 1]}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Fan Out Button */}
                        {!item.isFannedOut && (item.stage === 'in_flight' || item.stage === 'backlog') && onFanOutAgents && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFanOutAgents(item.id);
                              }}
                              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-[#141414] hover:bg-[#1e1e1e] border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 text-xs font-mono font-medium transition-all group-hover:border-indigo-500/30"
                            >
                              <Zap className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Fan Out Agents (Parallel RTX)</span>
                            </button>
                          </div>
                        )}

                        {/* Footer & Column Progression Actions */}
                        <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#777777]">
                          {item.commitHash ? (
                            <div className="flex items-center space-x-1.5 text-[#aaaaaa]">
                              <GitCommit className="w-3.5 h-3.5" />
                              <span>{item.commitHash.slice(0, 7)}</span>
                            </div>
                          ) : (
                            <span className="text-[#555555] flex items-center space-x-1">
                              <Cpu className="w-3 h-3 text-[#555555]" />
                              <span>RTX Engine</span>
                            </span>
                          )}

                          {item.stage === 'backlog' && onAdvanceStage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdvanceStage(item.id);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-white/10 text-[#e0e0e0] text-[11px] font-mono transition-colors"
                            >
                              <Play className="w-3 h-3 text-emerald-400" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {item.stage === 'in_flight' && (
                            <div className="flex items-center space-x-2">
                              {onAdvanceStage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceStage(item.id);
                                  }}
                                  className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#181818] hover:bg-[#222222] border border-white/10 text-[#d4d4d4] text-[10px] font-mono transition-colors"
                                >
                                  <span>Verify</span>
                                  <ArrowRight className="w-3 h-3 text-[#888888]" />
                                </button>
                              )}
                              <div className="flex items-center space-x-1.5 text-[#999999]">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                <span>Coding</span>
                              </div>
                            </div>
                          )}

                          {item.stage === 'verifying' && (
                            <div className="flex items-center space-x-2">
                              {onAdvanceStage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceStage(item.id);
                                  }}
                                  className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#181818] hover:bg-[#222222] border border-white/10 text-[#d4d4d4] text-[10px] font-mono transition-colors"
                                >
                                  <span>Gate</span>
                                  <ArrowRight className="w-3 h-3 text-[#888888]" />
                                </button>
                              )}
                              <div className="flex items-center space-x-1.5 text-cyan-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying</span>
                              </div>
                            </div>
                          )}

                          {item.stage === 'gated' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenApproval(item);
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200 text-xs font-mono transition-all hover:scale-105 shadow-md"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                              <span className="font-semibold">Signoff</span>
                            </button>
                          )}

                          {item.stage === 'merged' && (
                            <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Merged</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
