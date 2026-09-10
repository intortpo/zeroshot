import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Terminal,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Play,
  GitBranch,
  ExternalLink,
  X,
  Trash2,
  FileCode,
  CheckSquare,
} from 'lucide-react';
import { PetriItem, PetriStage, PetriItemKind } from '../types';

interface PetriKanbanProps {
  items: PetriItem[];
  onOpenApproval: (item: PetriItem) => void;
  onSelectItem?: (item: PetriItem) => void;
  onFanOutAgents?: (itemId: string) => void;
  onAdvanceStage?: (itemId: string) => void;
  onRecurseAgent?: (itemId: string) => void;
  onBranchItem?: (parentItem: PetriItem, branchName: string, subGoal: string) => void;
  onExecuteCode?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  onResetBoard?: () => void;
}

const STAGES: { stage: PetriStage; secNum: string; label: string; desc: string }[] = [
  { stage: 'backlog', secNum: '01', label: 'SPEC BACKLOG', desc: 'Ingested Flight Directives' },
  { stage: 'in_flight', secNum: '02', label: 'IN FLIGHT // CODING', desc: 'Autonomous AST Synthesis' },
  { stage: 'verifying', secNum: '03', label: 'ACCEPTANCE SUITE', desc: 'Container Invariant Checks' },
  { stage: 'gated', secNum: '04', label: 'AIRWORTHINESS GATE', desc: 'Human Oversight Signoff' },
  { stage: 'merged', secNum: '05', label: 'MERGED TRUNK', desc: 'Committed to Logbook' },
];

const getKindBadge = (kind: PetriItemKind) => {
  switch (kind) {
    case 'feat':
      return { label: 'FEAT', style: 'border-[#1A1D1A] bg-[#EDE8DC] text-[#1A1D1A]' };
    case 'bug':
      return { label: 'DEFECT', style: 'border-[#8B0000] bg-[#FDF0EE] text-[#8B0000]' };
    case 'issue':
      return { label: 'AUDIT', style: 'border-[#8A5A00] bg-[#FDF8EE] text-[#8A5A00]' };
    case 'mile':
      return { label: 'MILE', style: 'border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3]' };
  }
};

export const PetriKanban: React.FC<PetriKanbanProps> = ({
  items,
  onOpenApproval,
  onSelectItem,
  onAdvanceStage,
  onRecurseAgent,
  onBranchItem,
  onExecuteCode,
  onDeleteItem,
  onResetBoard,
}) => {
  const [expandedCoT, setExpandedCoT] = useState<Record<string, boolean>>({});
  const [expandedDiff, setExpandedDiff] = useState<Record<string, boolean>>({});
  const [selectedDetailItem, setSelectedDetailItem] = useState<PetriItem | null>(null);
  const [branchingParentItem, setBranchingParentItem] = useState<PetriItem | null>(null);
  const [branchNameInput, setBranchNameInput] = useState('');
  const [subGoalInput, setSubGoalInput] = useState('');
  const [activeMobileStage, setActiveMobileStage] = useState<PetriStage>('backlog');

  const toggleCoT = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCoT((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleDiff = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDiff((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleOpenBranchModal = (item: PetriItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setBranchingParentItem(item);
    const shortId = item.id.replace(/^pt-(commit-)?/, '').slice(0, 8);
    setBranchNameInput(`flight/${shortId}-branch`);
    setSubGoalInput('');
  };

  const handleConfirmBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchingParentItem || !subGoalInput.trim()) return;
    onBranchItem?.(
      branchingParentItem,
      branchNameInput.trim() || `flight/${branchingParentItem.id.slice(0, 8)}`,
      subGoalInput.trim()
    );
    setBranchingParentItem(null);
    setBranchNameInput('');
    setSubGoalInput('');
  };

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden bg-[#F6F3EC] text-[#1A1D1A] font-mono select-none">
      {/* 1960s Technical Flight Log Instrumentation Header */}
      <div className="px-6 py-2.5 border-b border-[#1A1D1A] bg-[#FAF8F3] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#1A1D1A]" />
            <span className="font-black tracking-widest text-[11px] uppercase">
              FLIGHT WORKTREE LOGBOOK · 1964 SPEC
            </span>
          </div>
          <span className="text-[#1A1D1A]/30">|</span>
          <span className="text-[10px] px-2 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] font-bold text-[#1A5A2A]">
            ● VAULT: PERSISTED TO LOCAL STORAGE
          </span>
          <span className="text-[10px] text-[#1A1D1A]/60">
            TOTAL DIRECTIVES: <strong>{items.length}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onResetBoard && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset board to canonical repository state? Local custom items will be archived.')) {
                  onResetBoard();
                }
              }}
              className="px-2.5 py-1 border border-[#1A1D1A]/50 hover:border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#FAF8F3] text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
              title="Clear custom cards and restore default trunk"
            >
              RESTORE CANONICAL TRUNK
            </button>
          )}
        </div>
      </div>

      {/* Mobile Segmented Stage Selector */}
      <div className="md:hidden px-3 py-2 bg-[#FAF8F3] border-b border-[#1A1D1A] flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
        {STAGES.map((s) => {
          const count = items.filter((item) => item.stage === s.stage).length;
          const isActive = activeMobileStage === s.stage;
          return (
            <button
              key={s.stage}
              type="button"
              onClick={() => setActiveMobileStage(s.stage)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 border cursor-pointer ${
                isActive
                  ? 'border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3]'
                  : 'border-[#1A1D1A]/40 bg-[#EDE8DC] text-[#1A1D1A]'
              }`}
            >
              <span>{s.label}</span>
              <span className="text-[9px] px-1 bg-black/10">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 5-Column Flight Manual Wireframe Deck */}
      <div className="flex-1 w-full overflow-x-auto p-4 sm:p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:min-w-[1650px] h-full items-stretch pb-6">
          {STAGES.map((col, colIdx) => {
            const columnItems = items.filter((item) => item.stage === col.stage);
            const isVisibleOnMobile = activeMobileStage === col.stage;

            return (
              <div
                key={col.stage}
                className={`${isVisibleOnMobile ? 'flex' : 'hidden md:flex'} w-full md:w-[325px] flex-shrink-0 flex-col border border-[#1A1D1A] bg-[#F2EFE9] transition-all relative shadow-[2px_2px_0px_#1A1D1A]`}
              >
                {/* 1960s Technical Header Panel */}
                <div className="px-3.5 py-2.5 border-b border-[#1A1D1A] bg-[#FAF8F3] flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] px-1 border border-[#1A1D1A] bg-[#EDE8DC] font-bold">
                        SEC.{col.secNum}
                      </span>
                      <span className="text-xs font-black tracking-wider uppercase">
                        {col.label}
                      </span>
                      <span className="text-[10px] text-[#1A1D1A]/60">({columnItems.length})</span>
                    </div>
                    <div className="text-[9px] text-[#1A1D1A]/50 tracking-wider mt-0.5 uppercase">
                      {col.desc}
                    </div>
                  </div>

                  {colIdx < STAGES.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#1A1D1A]/40" />
                  )}
                </div>

                {/* Items List */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {columnItems.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-[#1A1D1A]/30 text-center p-3 text-[#1A1D1A]/40">
                      <span className="text-[10px] uppercase tracking-wider">NO DIRECTIVES IN THIS SECTION</span>
                      <span className="text-[8px] mt-1 text-[#1A1D1A]/30">STANDBY FOR LOG DISPATCH</span>
                    </div>
                  ) : (
                    columnItems.map((item) => {
                      const badge = getKindBadge(item.kind);
                      const isCoTOpen = !!expandedCoT[item.id];
                      const isDiffOpen = !!expandedDiff[item.id];
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
                          className="p-3.5 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-white shadow-[2px_2px_0px_#1A1D1A] cursor-pointer group relative transition-colors"
                        >
                          {/* Card Registration Corner Brackets */}
                          <div className="absolute top-1 right-1 flex items-center space-x-1">
                            {onDeleteItem && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteItem(item.id);
                                }}
                                className="p-1 text-[#1A1D1A]/40 hover:text-[#8B0000] hover:bg-[#FDF0EE] transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Header: Kind Badge, Branch Tag, and Commit/ID */}
                          <div className="flex items-center justify-between mb-2 pr-6">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <span
                                className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${badge.style}`}
                              >
                                {badge.label}
                              </span>

                              {item.branchName && (
                                <span className="flex items-center space-x-1 px-1 py-0.2 border border-[#1A1D1A]/40 bg-[#EDE8DC] text-[9px] font-mono">
                                  <GitBranch className="w-2.5 h-2.5" />
                                  <span className="truncate max-w-[85px]">{item.branchName}</span>
                                </span>
                              )}

                              {item.stage === 'in_flight' && (
                                <span className="flex items-center space-x-1 px-1.5 py-0.2 border border-[#1A1D1A] bg-[#EDE8DC] text-[9px] font-bold text-[#1A1D1A]">
                                  <Loader2 className="w-2.5 h-2.5 animate-spin text-[#1A1D1A]" />
                                  <span>CODING T{recursionDepth}</span>
                                </span>
                              )}
                            </div>

                            <span className="text-[9px] font-mono text-[#1A1D1A]/50">
                              #{item.commitHash ? item.commitHash.slice(0, 7) : item.id.replace('pt-', '').slice(0, 6)}
                            </span>
                          </div>

                          {/* Directive Title */}
                          <div className="text-xs font-bold text-[#1A1D1A] line-clamp-2 leading-snug uppercase">
                            {item.title}
                          </div>

                          {/* Active Code Patch Streamer (When diff exists or in_flight) */}
                          {item.diff && (
                            <div className="mt-2 pt-2 border-t border-dashed border-[#1A1D1A]/30">
                              <button
                                type="button"
                                onClick={(e) => toggleDiff(item.id, e)}
                                className="w-full flex items-center justify-between px-2 py-1 border border-[#1A1D1A]/60 bg-[#EDE8DC] text-[10px] font-bold uppercase tracking-wider hover:bg-[#FAF8F3] transition-colors"
                              >
                                <div className="flex items-center space-x-1.5">
                                  <FileCode className="w-3 h-3 text-[#1A1D1A]" />
                                  <span>AST PATCH DIFF</span>
                                </div>
                                <span>{isDiffOpen ? 'HIDE ▲' : 'VIEW ▼'}</span>
                              </button>

                              {isDiffOpen && (
                                <div className="mt-1.5 p-2 bg-white border border-[#1A1D1A] font-mono text-[9px] text-[#1A1D1A] overflow-x-auto whitespace-pre leading-tight max-h-36">
                                  {item.diff}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dispatched Workers HUD */}
                          {hasAgents && (
                            <div className="mt-2 pt-1.5 border-t border-[#1A1D1A]/20 space-y-1">
                              <div className="flex items-center justify-between text-[9px] text-[#1A1D1A]/70 uppercase">
                                <span>CONCURRENT WORKERS ({item.agents!.length})</span>
                                <span>PARALLEL RTX</span>
                              </div>
                              <div className="space-y-1">
                                {item.agents!.map((ag) => (
                                  <div
                                    key={ag.id}
                                    className="p-1 border border-[#1A1D1A]/30 bg-white text-[9px] flex items-center justify-between"
                                  >
                                    <span className="font-bold">{ag.role}</span>
                                    <span className="text-[#1A1D1A]/60 uppercase">
                                      T{ag.recursionTurn ?? 1} · {ag.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chain of Thought Telemetry Readout */}
                          {(item.stage === 'in_flight' || item.stage === 'verifying') && (
                            <div className="mt-2 pt-1.5 border-t border-[#1A1D1A]/20">
                              <button
                                type="button"
                                onClick={(e) => toggleCoT(item.id, e)}
                                className="w-full flex items-center justify-between px-1.5 py-1 text-[9px] uppercase tracking-wider border border-[#1A1D1A]/40 bg-[#F2EFE9] text-[#1A1D1A]"
                              >
                                <div className="flex items-center space-x-1">
                                  <Terminal className="w-3 h-3" />
                                  <span>COT LOG ({cotSteps.length})</span>
                                </div>
                                {isCoTOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>

                              {isCoTOpen && (
                                <div className="mt-1 p-2 bg-white border border-[#1A1D1A] space-y-1 text-[9px] font-mono leading-tight max-h-28 overflow-y-auto">
                                  {cotSteps.map((step, sIdx) => (
                                    <div key={sIdx} className="flex items-start space-x-1">
                                      <span className="text-[#1A1D1A]/40 select-none">❯</span>
                                      <span className={sIdx === cotSteps.length - 1 ? 'font-bold' : ''}>
                                        {step}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Footer & Action Dispatcher */}
                          <div className="mt-2.5 pt-2 border-t border-[#1A1D1A]/30 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                            {/* Inspect Detail Link */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetailItem(item);
                              }}
                              className="text-[#1A1D1A]/60 hover:text-[#1A1D1A] font-bold uppercase flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>INSPECT</span>
                            </button>

                            {/* Actions per Stage */}
                            <div className="flex items-center space-x-1">
                              {item.stage === 'backlog' && onAdvanceStage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceStage(item.id);
                                  }}
                                  className="px-2 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-[1px_1px_0px_#1A1D1A]"
                                >
                                  <Play className="w-2.5 h-2.5" />
                                  <span>ENGAGE</span>
                                </button>
                              )}

                              {item.stage === 'in_flight' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onExecuteCode) {
                                        onExecuteCode(item.id);
                                      } else if (onRecurseAgent) {
                                        onRecurseAgent(item.id);
                                      }
                                    }}
                                    className="px-2 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-[1px_1px_0px_#1A1D1A]"
                                    title="Run autonomous AST synthesizer turn"
                                  >
                                    <RotateCw className="w-2.5 h-2.5" />
                                    <span>CODE TURN</span>
                                  </button>

                                  {onAdvanceStage && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAdvanceStage(item.id);
                                      }}
                                      className="px-2 py-0.5 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] hover:bg-[#333] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-[1px_1px_0px_#1A1D1A]"
                                    >
                                      <span>VERIFY &gt;</span>
                                    </button>
                                  )}
                                </>
                              )}

                              {item.stage === 'verifying' && onAdvanceStage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceStage(item.id);
                                  }}
                                  className="px-2 py-0.5 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] hover:bg-[#333] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-[1px_1px_0px_#1A1D1A]"
                                >
                                  <CheckSquare className="w-2.5 h-2.5" />
                                  <span>PASS TO GATE &gt;</span>
                                </button>
                              )}

                              {item.stage === 'gated' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenApproval(item);
                                  }}
                                  className="px-2 py-0.5 border border-[#8B0000] bg-[#FDF0EE] text-[#8B0000] hover:bg-[#8B0000] hover:text-[#FAF8F3] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-[1px_1px_0px_#8B0000]"
                                >
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  <span>SIGNOFF</span>
                                </button>
                              )}

                              {item.stage === 'merged' && (
                                <div className="flex items-center space-x-1 font-bold text-[#1A5A2A]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>MERGED</span>
                                </div>
                              )}
                            </div>
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

      {/* 1960s Technical Flight Directive Inspection Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl max-h-[88vh] bg-[#FAF8F3] border border-[#1A1D1A] shadow-[4px_4px_0px_#1A1D1A] flex flex-col overflow-hidden font-mono">
            {/* Header */}
            <div className="px-5 py-3 border-b border-[#1A1D1A] flex items-center justify-between bg-[#EDE8DC]">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 border border-[#1A1D1A] bg-[#FAF8F3] uppercase">
                  {selectedDetailItem.kind}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  STATUS: {selectedDetailItem.stage.toUpperCase()}
                </span>
                <span className="text-[10px] text-[#1A1D1A]/60">
                  #{selectedDetailItem.commitHash ? selectedDetailItem.commitHash.slice(0, 7) : selectedDetailItem.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-[9px] text-[#1A1D1A]/60 uppercase tracking-widest block">
                  SPECIFICATION TITLE:
                </span>
                <h2 className="text-sm font-black text-[#1A1D1A] leading-snug mt-0.5 uppercase">
                  {selectedDetailItem.title}
                </h2>
              </div>

              {/* Code Patch Diff */}
              {selectedDetailItem.diff && (
                <div className="space-y-1.5">
                  <span className="text-[9px] text-[#1A1D1A]/60 uppercase tracking-widest block">
                    SYNTHESIZED AST HUNK:
                  </span>
                  <pre className="p-3 bg-white border border-[#1A1D1A] text-[10px] font-mono text-[#1A1D1A] overflow-x-auto whitespace-pre leading-snug max-h-48">
                    {selectedDetailItem.diff}
                  </pre>
                </div>
              )}

              {/* Verification Output */}
              {selectedDetailItem.testLogs && (
                <div className="space-y-1.5">
                  <span className="text-[9px] text-[#1A1D1A]/60 uppercase tracking-widest block">
                    ACCEPTANCE TEST TELEMETRY:
                  </span>
                  <pre className="p-3 bg-[#1A1D1A] text-[#FAF8F3] text-[10px] font-mono overflow-x-auto whitespace-pre leading-snug max-h-36">
                    {selectedDetailItem.testLogs}
                  </pre>
                </div>
              )}

              {/* Chain of Thought */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-[#1A1D1A]/60 uppercase tracking-widest block">
                  CHAIN OF THOUGHT LOG:
                </span>
                <div className="p-3 bg-white border border-[#1A1D1A] space-y-1 text-[10px] font-mono max-h-36 overflow-y-auto">
                  {(selectedDetailItem.chainOfThought || []).map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#1A1D1A]/40">❯</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#1A1D1A] bg-[#EDE8DC] flex items-center justify-between">
              {onBranchItem && (
                <button
                  type="button"
                  onClick={(e) => {
                    const itm = selectedDetailItem;
                    setSelectedDetailItem(null);
                    handleOpenBranchModal(itm, e);
                  }}
                  className="px-3 py-1.5 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_#1A1D1A]"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>FORK FLIGHT BRANCH</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="ml-auto px-4 py-1.5 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] hover:bg-[#333] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Sub-goal Modal */}
      {branchingParentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <form
            onSubmit={handleConfirmBranch}
            className="w-full max-w-md bg-[#FAF8F3] border border-[#1A1D1A] shadow-[4px_4px_0px_#1A1D1A] p-5 font-mono text-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#1A1D1A] pb-2">
              <span className="font-bold uppercase tracking-wider">FORK FLIGHT SUB-DIRECTIVE</span>
              <button
                type="button"
                onClick={() => setBranchingParentItem(null)}
                className="p-1 hover:bg-[#EDE8DC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#1A1D1A]/70 block mb-1">
                BRANCH IDENTIFIER:
              </label>
              <input
                value={branchNameInput}
                onChange={(e) => setBranchNameInput(e.target.value)}
                className="w-full bg-white border border-[#1A1D1A] px-3 py-1.5 text-xs text-[#1A1D1A] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#1A1D1A]/70 block mb-1">
                SUB-GOAL DIRECTIVE SPECIFICATION:
              </label>
              <textarea
                value={subGoalInput}
                onChange={(e) => setSubGoalInput(e.target.value)}
                placeholder="DESCRIBE SCOPED SUB-GOAL AST MODIFICATION..."
                rows={3}
                className="w-full bg-white border border-[#1A1D1A] px-3 py-1.5 text-xs text-[#1A1D1A] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1A1D1A]">
              <button
                type="button"
                onClick={() => setBranchingParentItem(null)}
                className="px-3 py-1.5 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#FAF8F3] font-bold uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!subGoalInput.trim()}
                className="px-4 py-1.5 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] hover:bg-[#333] font-bold uppercase cursor-pointer disabled:opacity-40"
              >
                FORK DIRECTIVE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
