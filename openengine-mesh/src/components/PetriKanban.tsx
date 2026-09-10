import React, { useState } from 'react';
import {
  GitCommit,
  GitMerge,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
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

const STAGES: { stage: PetriStage; label: string }[] = [
  { stage: 'backlog', label: 'Backlog' },
  { stage: 'in_flight', label: 'In Flight' },
  { stage: 'verifying', label: 'Verifying' },
  { stage: 'gated', label: 'Gated' },
  { stage: 'merged', label: 'Merged' },
];

const getKindBadge = (kind: PetriItemKind) => {
  switch (kind) {
    case 'feat':
      return {
        label: 'feat',
        style: 'bg-stone-100 text-stone-700 border-stone-200 font-medium',
      };
    case 'bug':
      return {
        label: 'bug',
        style: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
      };
    case 'issue':
      return {
        label: 'issue',
        style: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
      };
    case 'mile':
      return {
        label: 'mile',
        style: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium',
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
    <div className="flex-1 w-full overflow-x-auto p-6 sm:p-8 font-sans">
      <div className="flex space-x-6 min-w-[1500px] h-full items-stretch pb-6">
        {STAGES.map((col, colIdx) => {
          const columnItems = items.filter((item) => item.stage === col.stage);
          const isMergedCol = col.stage === 'merged';
          const isInFlightCol = col.stage === 'in_flight';

          return (
            <div
              key={col.stage}
              className={`w-[360px] flex-shrink-0 flex flex-col rounded-2xl transition-all duration-300 ${
                isMergedCol
                  ? 'border border-emerald-200/80 bg-emerald-50/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_12px_rgba(0,0,0,0.02)]'
                  : isInFlightCol
                  ? 'subtle-depth border-stone-300/90'
                  : 'subtle-depth'
              }`}
            >
              {/* Column Header */}
              <div className="px-5 py-3.5 border-b border-stone-200/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {isMergedCol ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                      <GitMerge className="w-3 h-3 text-emerald-700" />
                    </div>
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isInFlightCol ? 'bg-[#0ABAB5] animate-pulse' : 'bg-stone-400'
                      }`}
                    />
                  )}
                  <div className="text-sm font-sans font-semibold text-stone-900 flex items-center space-x-2">
                    <span>{col.label}</span>
                    <span className="text-xs font-sans text-stone-400 font-normal">
                      ({columnItems.length})
                    </span>
                  </div>
                </div>

                {colIdx < STAGES.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                )}
              </div>

              {/* Items List */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {columnItems.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border border-dashed border-stone-200 rounded-xl text-xs font-sans text-stone-400">
                    <span>Empty</span>
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
                        className={`p-6 rounded-2xl subtle-depth-card subtle-depth-interactive cursor-pointer group ${
                          item.stage === 'gated'
                            ? 'border-amber-300/90 bg-amber-50/70 hover:border-amber-400'
                            : item.stage === 'merged'
                            ? 'border-emerald-200/90 bg-white/90 hover:border-emerald-300'
                            : item.stage === 'in_flight'
                            ? 'border-stone-400/90 bg-white/95 hover:border-stone-600'
                            : 'border-stone-200/90 bg-white/85 hover:border-stone-400'
                        }`}
                      >
                        {/* Header: Kind Badge, Time, and Recursion Depth Tag */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-sans font-medium uppercase border ${badge.style}`}
                            >
                              {badge.label}
                            </span>

                            {item.stage === 'in_flight' && (
                              <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 text-xs font-sans font-normal">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
                                <span className="font-sans">T{recursionDepth}</span>
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-sans text-stone-400">
                            #{item.commitHash ? item.commitHash.slice(0, 7) : item.id.replace('pt-', '')}
                          </span>
                        </div>

                        {/* Title with Clean, Legible Typography */}
                        <div className="text-sm font-medium text-stone-900 group-hover:text-stone-950 transition-colors line-clamp-2 leading-relaxed">
                          {item.title}
                        </div>

                        {/* Fanned Out Subagents Section */}
                        {hasAgents && (
                          <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-sans text-stone-500">
                              <span>Workers ({item.agents!.length})</span>
                              <span className="text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-normal">
                                Parallel
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                              {item.agents!.map((agent: AgentWorker) => (
                                <div
                                  key={agent.id}
                                  className="bg-stone-50/80 border border-stone-200/80 rounded-lg px-2.5 py-1.5 text-xs flex items-center justify-between"
                                >
                                  <span className="font-sans font-medium text-stone-800 flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
                                    <span>{agent.role}</span>
                                  </span>
                                  <span className="text-xs font-sans text-stone-400 uppercase">
                                    T{agent.recursionTurn ?? 1} · {agent.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chain of Thought (CoT) Console */}
                        {(item.stage === 'in_flight' || item.stage === 'verifying') && (
                          <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1.5">
                            <button
                              type="button"
                              onClick={(e) => toggleCoT(item.id, e)}
                              className="w-full flex items-center justify-between text-xs font-sans text-stone-600 hover:text-stone-900 transition-colors py-1 px-2.5 rounded-lg bg-stone-50 border border-stone-200"
                            >
                              <div className="flex items-center space-x-1.5">
                                <Terminal className="w-3.5 h-3.5 text-stone-600" />
                                <span>CoT ({cotSteps.length})</span>
                              </div>
                              {isCoTOpen ? (
                                <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                              )}
                            </button>

                            {isCoTOpen ? (
                              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1.5 font-sans text-xs animate-in fade-in duration-200">
                                {cotSteps.map((step, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="text-stone-700 leading-snug flex items-start space-x-1.5"
                                  >
                                    <span className="text-stone-400 select-none">❯</span>
                                    <span
                                      className={
                                        sIdx === cotSteps.length - 1
                                          ? 'text-stone-950 font-semibold'
                                          : ''
                                      }
                                    >
                                      {step}
                                    </span>
                                  </div>
                                ))}

                                {onRecurseAgent && (
                                  <div className="pt-2 border-t border-stone-200 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRecurseAgent(item.id);
                                      }}
                                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-900 hover:bg-black text-white font-medium text-xs transition-colors"
                                    >
                                      <RotateCw className="w-3 h-3" />
                                      <span>Recurse</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="px-2 py-1 text-xs font-sans text-stone-500 truncate flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5] animate-pulse" />
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
                              className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-sans font-medium transition-all"
                            >
                              <Zap className="w-3.5 h-3.5 text-stone-600" />
                              <span>Fan Out</span>
                            </button>
                          </div>
                        )}

                        {/* Footer & Column Progression Actions */}
                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-sans">
                          {item.commitHash ? (
                            <div className="flex items-center space-x-1.5 text-stone-700 font-sans">
                              <GitCommit className="w-3.5 h-3.5 text-stone-400" />
                              <span>{item.commitHash.slice(0, 7)}</span>
                            </div>
                          ) : (
                            <span className="text-stone-400 flex items-center space-x-1.5">
                              <Cpu className="w-3.5 h-3.5 text-stone-400" />
                              <span>Task</span>
                            </span>
                          )}

                          {item.stage === 'backlog' && onAdvanceStage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdvanceStage(item.id);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-sans font-medium transition-colors"
                            >
                              <Play className="w-3 h-3 text-stone-500" />
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
                                  className="flex items-center space-x-1 px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-sans font-normal transition-colors"
                                >
                                  <span>Verify</span>
                                  <ArrowRight className="w-3 h-3 text-stone-400" />
                                </button>
                              )}
                              <div className="flex items-center space-x-1.5 text-stone-700">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-700" />
                                <span className="font-medium">Coding</span>
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
                                  className="flex items-center space-x-1 px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-sans font-normal transition-colors"
                                >
                                  <span>Gate</span>
                                  <ArrowRight className="w-3 h-3 text-stone-400" />
                                </button>
                              )}
                              <div className="flex items-center space-x-1.5 text-stone-700">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-700" />
                                <span className="font-medium">Verifying</span>
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
                              className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#FF5F1F] hover:bg-[#E04F15] text-white text-xs font-sans font-medium transition-all shadow-sm"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-white" />
                              <span>Signoff</span>
                            </button>
                          )}

                          {item.stage === 'merged' && (
                            <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
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
