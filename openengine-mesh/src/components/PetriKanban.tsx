import React from 'react';
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
} from 'lucide-react';
import { PetriItem, PetriItemKind, PetriStage } from '../types';

interface PetriKanbanProps {
  items: PetriItem[];
  onOpenApproval: (item: PetriItem) => void;
  onSelectItem?: (item: PetriItem) => void;
}

const STAGES: { stage: PetriStage; label: string; description: string }[] = [
  { stage: 'backlog', label: 'Backlog', description: 'Ingested & Queued' },
  { stage: 'in_flight', label: 'In Flight', description: 'Autonomous RTX Coding' },
  { stage: 'verifying', label: 'Verifying', description: 'Parallel Tests & Review' },
  { stage: 'gated', label: 'Gated Review', description: 'Awaiting 1-Tap Signoff' },
  { stage: 'merged', label: 'Fully Merged', description: 'Delivered to Trunk' },
];

export const getKindBadge = (kind: PetriItemKind) => {
  switch (kind) {
    case 'bug':
      return {
        label: 'BUG',
        icon: <Bug className="w-3 h-3 text-[#f87171]" />,
        style: 'bg-[#261414] text-[#fca5a5] border-[#4d1f1f]',
      };
    case 'issue':
      return {
        label: 'ISSUE',
        icon: <AlertCircle className="w-3 h-3 text-[#fbbf24]" />,
        style: 'bg-[#262014] text-[#fde68a] border-[#4d3b1f]',
      };
    case 'feat':
      return {
        label: 'FEAT',
        icon: <Sparkles className="w-3 h-3 text-[#e5e5e5]" />,
        style: 'bg-[#1a1a1a] text-[#f5f5f5] border-[#333333]',
      };
    case 'mile':
      return {
        label: 'MILE',
        icon: <Milestone className="w-3 h-3 text-[#818cf8]" />,
        style: 'bg-[#161729] text-[#c7d2fe] border-[#292c4d]',
      };
  }
};

export const PetriKanban: React.FC<PetriKanbanProps> = ({
  items,
  onOpenApproval,
  onSelectItem,
}) => {
  return (
    <div className="flex-1 w-full overflow-x-auto p-4 sm:p-6 select-none">
      <div className="flex space-x-4 min-w-[1250px] h-full items-stretch">
        {STAGES.map((col, colIdx) => {
          const columnItems = items.filter((item) => item.stage === col.stage);
          const isMergedCol = col.stage === 'merged';

          return (
            <div
              key={col.stage}
              className={`flex-1 flex flex-col rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                isMergedCol
                  ? 'border-white/10 bg-[#0c0c0c]/80 shadow-[0_0_30px_rgba(255,255,255,0.03)]'
                  : 'border-white/5 bg-[#0a0a0a]/65'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isMergedCol ? (
                    <GitMerge className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
                  )}
                  <div>
                    <div className="text-xs font-mono font-medium text-[#f5f5f5] flex items-center space-x-1.5">
                      <span>{col.label}</span>
                      <span className="text-[10px] text-[#525252]">({columnItems.length})</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#525252]">{col.description}</div>
                  </div>
                </div>

                {colIdx < STAGES.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[#333333]" />
                )}
              </div>

              {/* Items List */}
              <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
                {columnItems.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border border-dashed border-[#1a1a1a] rounded-xl text-[10px] font-mono text-[#404040]">
                    Empty
                  </div>
                ) : (
                  columnItems.map((item) => {
                    const badge = getKindBadge(item.kind);

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem?.(item)}
                        className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group backdrop-blur-md ${
                          item.stage === 'gated'
                            ? 'border-amber-500/40 bg-[#14120e]/80 hover:border-amber-400/60 shadow-lg'
                            : item.stage === 'merged'
                            ? 'border-emerald-500/25 bg-[#0d1410]/70 hover:border-emerald-500/40'
                            : 'border-white/5 bg-[#0f0f0f]/80 hover:border-white/15 hover:bg-[#141414]/90'
                        }`}
                      >
                        {/* Header: Kind Badge & Time */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border ${badge.style}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>

                          <span className="text-[9px] font-mono text-[#525252]">
                            #{item.id.slice(-6)}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="text-xs font-medium text-[#e5e5e5] group-hover:text-[#ffffff] transition-colors line-clamp-2 leading-relaxed">
                          {item.title}
                        </div>

                        {/* Footer & Actions */}
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#737373]">
                          {item.commitHash ? (
                            <div className="flex items-center space-x-1 text-[#a3a3a3]">
                              <GitCommit className="w-3 h-3" />
                              <span>{item.commitHash.slice(0, 7)}</span>
                            </div>
                          ) : (
                            <span className="text-[#525252]">RTX Agent</span>
                          )}

                          {item.stage === 'in_flight' && (
                            <div className="flex items-center space-x-1 text-[#8e8e8e]">
                              <Loader2 className="w-3 h-3 animate-spin text-[#a3a3a3]" />
                              <span>Coding</span>
                            </div>
                          )}

                          {item.stage === 'verifying' && (
                            <div className="flex items-center space-x-1 text-cyan-400">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Verifying</span>
                            </div>
                          )}

                          {item.stage === 'gated' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenApproval(item);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[10px] font-mono transition-all hover:scale-105"
                            >
                              <ShieldAlert className="w-3 h-3 text-amber-300" />
                              <span>Signoff</span>
                            </button>
                          )}

                          {item.stage === 'merged' && (
                            <div className="flex items-center space-x-1 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
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
