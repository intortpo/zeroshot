import React, { useState } from 'react';
import {
  GitCommit,
  GitMerge,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Bot,
  Terminal,
  Zap,
  RotateCw,
  Cpu,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import { PetriItem, PetriStage, PetriItemKind, AgentWorker } from '../types';

interface PetriKanbanProps {
  items: PetriItem[];
  onOpenApproval: (item: PetriItem) => void;
  onSelectItem?: (item: PetriItem) => void;
  onFanOutAgents?: (itemId: string) => void;
  onAdvanceStage?: (itemId: string) => void;
  onRecurseAgent?: (itemId: string) => void;
}

const STAGES: { stage: PetriStage; label: string; description: string }[] = [
  {
    stage: 'backlog',
    label: 'Backlog',
    description: 'Awaiting autonomous pickup',
  },
  {
    stage: 'in_flight',
    label: 'In Flight',
    description: 'Agents recursing & coding',
  },
  {
    stage: 'verifying',
    label: 'Verifying',
    description: 'Automated test suites running',
  },
  {
    stage: 'gated',
    label: 'Gated Delivery',
    description: 'Awaiting human signoff',
  },
  {
    stage: 'merged',
    label: 'Fully Merged',
    description: 'Verified & landed on main',
  },
];

const getKindBadge = (kind: PetriItemKind) => {
  switch (kind) {
    case 'feat':
      return {
        label: 'feat',
        style: 'bg-[#E0F7F6] text-[#0A7B76] border-[#B4E8E4]',
      };
    case 'bug':
      return {
        label: 'bug',
        style: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'issue':
      return {
        label: 'issue',
        style: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'mile':
      return {
        label: 'mile',
        style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
  const [expandedCoT, setExpandedCoT] = useState<Record<string, boolean>>({});

  const toggleCoT = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCoT((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className="flex-1 w-full overflow-x-auto p-6 sm:p-10 select-none font-sans">
      <div className="flex space-x-8 min-w-[1600px] h-full items-stretch pb-8">
        {STAGES.map((col, colIdx) => {
          const columnItems = items.filter((item) => item.stage === col.stage);
          const isMergedCol = col.stage === 'merged';
          const isInFlightCol = col.stage === 'in_flight';

          return (
            <div
              key={col.stage}
              className={`w-[420px] flex-shrink-0 flex flex-col rounded-3xl border transition-all duration-300 backdrop-blur-2xl ${
                isMergedCol
                  ? 'border-emerald-200/80 bg-emerald-50/25'
                  : isInFlightCol
                  ? 'border-[#0ABAB5]/40 bg-[#E0F7F6]/20'
                  : 'border-stone-200/80 bg-white/45'
              }`}
            >
              {/* Column Header */}
              <div className="px-7 py-5 border-b border-stone-200/60 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  {isMergedCol ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                      <GitMerge className="w-4 h-4 text-emerald-700" />
                    </div>
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isInFlightCol ? 'bg-[#0ABAB5] animate-pulse' : 'bg-stone-400'
                      }`}
                    />
                  )}
                  <div>
                    <div className="text-base font-mono font-bold text-stone-900 flex items-center space-x-2">
                      <span>{col.label}</span>
                      <span className="text-xs text-stone-500 font-normal">
                        ({columnItems.length})
                      </span>
                    </div>
                    <div className="text-xs font-mono text-stone-500 mt-0.5">
                      {col.description}
                    </div>
                  </div>
                </div>

                {colIdx < STAGES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-stone-300" />
                )}
              </div>

              {/* Items List */}
              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                {columnItems.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-2xl text-xs font-mono text-stone-400 space-y-1">
                    <span>No active items</span>
                    <span className="text-[11px] text-stone-400">Column idle</span>
                  </div>
                ) : (
                  columnItems.map((item) => {
                    const badge = getKindBadge(item.kind);
                    const isCoTOpen = !!expandedCoT[item.id];
                    const hasAgents = item.agents && item.agents.length > 0;
                    const cotSteps = item.chainOfThought || [
                      `[turn 1 · cot] Ingest intent & map AST boundaries in zero-petri`,
                      `[turn 2 · recurse] Speculative synthesis with bounded backpressure`,
                      `[turn 3 · active] Running property verifiers on local workspace`,
                    ];
                    const recursionDepth = item.recursionDepth ?? 1;

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem?.(item)}
                        className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer group backdrop-blur-xl ${
                          item.stage === 'gated'
                            ? 'border-amber-300 bg-amber-50/60 hover:border-amber-400'
                            : item.stage === 'merged'
                            ? 'border-emerald-200/90 bg-white/70 hover:border-emerald-300'
                            : item.stage === 'in_flight'
                            ? 'border-[#0ABAB5]/50 bg-white/80 hover:border-[#0ABAB5]'
                            : 'border-stone-200/80 bg-white/75 hover:border-[#0ABAB5]/50'
                        }`}
                      >
                        {/* Header: Kind Badge, Time, and Recursion Depth Tag */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${badge.style}`}
                            >
                              {badge.label}
                            </span>

                            {item.stage === 'in_flight' && (
                              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-[#E0F7F6] border border-[#B4E8E4] text-[#0A7B76] text-xs font-mono font-semibold">
                                <Cpu className="w-3.5 h-3.5 text-[#0ABAB5]" />
                                <span>Turn {recursionDepth}</span>
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-mono text-stone-400">
                            #{item.commitHash ? item.commitHash.slice(0, 7) : item.id.replace('pt-', '')}
                          </span>
                        </div>

                        {/* Title with Generous, Crisp Typography */}
                        <div className="text-base sm:text-lg font-semibold text-stone-900 group-hover:text-stone-950 transition-colors line-clamp-3 leading-snug">
                          {item.title}
                        </div>

                        {/* Fanned Out Subagents Section */}
                        {hasAgents && (
                          <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                              <span className="flex items-center space-x-1.5 font-semibold">
                                <Bot className="w-4 h-4 text-[#0ABAB5]" />
                                <span>Concurrent Workers ({item.agents!.length})</span>
                              </span>
                              <span className="text-xs text-[#0A7B76] font-semibold bg-[#E0F7F6] px-2 py-0.5 rounded-md border border-[#B4E8E4]">
                                Fanned Out
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {item.agents!.map((agent: AgentWorker) => (
                                <div
                                  key={agent.id}
                                  className="bg-stone-50/80 border border-stone-200/80 rounded-xl p-3 text-xs font-mono flex flex-col space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-stone-900 flex items-center space-x-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5] animate-ping" />
                                      <span>{agent.role}</span>
                                    </span>
                                    <span className="text-[11px] text-stone-600 uppercase bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                                      Turn {agent.recursionTurn ?? 1} · {agent.status}
                                    </span>
                                  </div>
                                  {agent.thought && (
                                    <div className="text-xs text-stone-600 italic pl-3 border-l-2 border-[#0ABAB5]/40 mt-1">
                                      "{agent.thought}"
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chain of Thought (CoT) Monospace Console */}
                        {(item.stage === 'in_flight' || item.stage === 'verifying') && (
                          <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-2">
                            <button
                              type="button"
                              onClick={(e) => toggleCoT(item.id, e)}
                              className="w-full flex items-center justify-between text-xs font-mono text-stone-700 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-xl bg-stone-50/90 border border-stone-200"
                            >
                              <div className="flex items-center space-x-2">
                                <Terminal className="w-4 h-4 text-[#0ABAB5]" />
                                <span className="font-medium">Chain of Thought ({cotSteps.length} turns)</span>
                              </div>
                              {isCoTOpen ? (
                                <ChevronUp className="w-4 h-4 text-stone-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-stone-400" />
                              )}
                            </button>

                            {isCoTOpen ? (
                              <div className="bg-stone-50/95 border border-stone-200 rounded-xl p-3.5 space-y-2 font-mono text-xs animate-in fade-in duration-200">
                                {cotSteps.map((step, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="text-stone-700 leading-relaxed flex items-start space-x-2"
                                  >
                                    <span className="text-[#0ABAB5] select-none font-bold">❯</span>
                                    <span
                                      className={
                                        sIdx === cotSteps.length - 1
                                          ? 'text-[#0A7B76] font-semibold'
                                          : ''
                                      }
                                    >
                                      {step}
                                    </span>
                                  </div>
                                ))}

                                {onRecurseAgent && (
                                  <div className="pt-2.5 border-t border-stone-200 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRecurseAgent(item.id);
                                      }}
                                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#E0F7F6] hover:bg-[#B4E8E4] border border-[#B4E8E4] text-[#0A7B76] font-semibold text-xs transition-colors"
                                    >
                                      <RotateCw className="w-3.5 h-3.5" />
                                      <span>Recurse Next Turn</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="px-2.5 py-1.5 text-xs font-mono text-stone-500 truncate flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-[#0ABAB5] animate-pulse" />
                                <span className="truncate">{cotSteps[cotSteps.length - 1]}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Interactive Fan Out Button */}
                        {!item.isFannedOut && (item.stage === 'in_flight' || item.stage === 'backlog') && onFanOutAgents && (
                          <div className="mt-3.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFanOutAgents(item.id);
                              }}
                              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#E0F7F6]/60 hover:bg-[#E0F7F6] border border-[#0ABAB5]/40 hover:border-[#0ABAB5] text-[#0A7B76] text-xs sm:text-sm font-mono font-semibold transition-all"
                            >
                              <Zap className="w-4 h-4 text-[#0ABAB5]" />
                              <span>Fan Out Parallel Workers</span>
                            </button>
                          </div>
                        )}

                        {/* Footer & Column Progression Actions */}
                        <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-500">
                          {item.commitHash ? (
                            <div className="flex items-center space-x-1.5 text-stone-700 font-medium">
                              <GitCommit className="w-4 h-4 text-stone-500" />
                              <span>{item.commitHash.slice(0, 7)}</span>
                            </div>
                          ) : (
                            <span className="text-stone-500 flex items-center space-x-1.5">
                              <Cpu className="w-3.5 h-3.5 text-stone-400" />
                              <span>Native Task</span>
                            </span>
                          )}

                          {item.stage === 'backlog' && onAdvanceStage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdvanceStage(item.id);
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-mono font-medium transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 text-[#0ABAB5]" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {item.stage === 'in_flight' && (
                            <div className="flex items-center space-x-2.5">
                              {onAdvanceStage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceStage(item.id);
                                  }}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-mono transition-colors"
                                >
                                  <span>Verify</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                                </button>
                              )}
                              <div className="flex items-center space-x-1.5 text-[#0A7B76]">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0ABAB5]" />
                                <span className="font-semibold">Coding</span>
                              </div>
                            </div>
                          )}

                          {item.stage === 'verifying' && (
                            <div className="flex items-center space-x-2.5">
                              {onAdvanceStage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceStage(item.id);
                                  }}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-mono transition-colors"
                                >
                                  <span>Gate</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                                </button>
                              )}
                              <div className="flex items-center space-x-1.5 text-[#0A7B76]">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0ABAB5]" />
                                <span className="font-semibold">Verifying</span>
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
                              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-mono font-bold transition-all"
                            >
                              <ShieldAlert className="w-4 h-4 text-amber-700" />
                              <span>Signoff</span>
                            </button>
                          )}

                          {item.stage === 'merged' && (
                            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
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
