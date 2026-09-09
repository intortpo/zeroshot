import React, { useState, useEffect } from 'react';
import { PetriItem, Workspace, UserProfile } from '../types';

interface TuiViewProps {
  items: PetriItem[];
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  onFanOutAgents?: (itemId: string) => void;
  onAdvanceStage?: (itemId: string) => void;
  onRecurseAgent?: (itemId: string) => void;
  onSelectView?: (view: 'board' | 'skills' | 'memory' | 'stats' | 'tui') => void;
}

export const TuiView: React.FC<TuiViewProps> = ({
  items,
  activeWorkspace,
  activeUser,
  onFanOutAgents,
  onAdvanceStage,
  onRecurseAgent,
  onSelectView,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [commandInput, setCommandInput] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] Petri Cognitive Daemon v8.4.0 started on Omarchy x86_64',
    '[MESH] WireGuard mesh initialized: 3 peer nodes connected via Tailscale',
    '[GPU] NVIDIA RTX 4090 detected: 24564 MiB total, 18841 MiB reserved',
    '[SELF-LEARN] Loaded 48 invariant heuristics from Memory store (confidence: 94.6%)',
    '[CACHE] Prompt cache warmed up: 91.2% hit ratio',
  ]);

  const selectedItem = items[selectedIndex] || items[0];

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'f' && selectedItem && onFanOutAgents) {
        onFanOutAgents(selectedItem.id);
        setConsoleLogs((prev) => [
          `[SWARM] Fanned out 3 parallel RTX workers on task #${selectedItem.id.slice(-6)}`,
          ...prev,
        ]);
      } else if (e.key === 'r' && selectedItem && onRecurseAgent) {
        onRecurseAgent(selectedItem.id);
        setConsoleLogs((prev) => [
          `[COT] Advanced recursive turn on #${selectedItem.id.slice(-6)}: AST patch synthesized`,
          ...prev,
        ]);
      } else if (e.key === 'a' && selectedItem && onAdvanceStage) {
        onAdvanceStage(selectedItem.id);
        setConsoleLogs((prev) => [
          `[KANBAN] Advanced task #${selectedItem.id.slice(-6)} to next stage`,
          ...prev,
        ]);
      } else if (e.key === '1') onSelectView?.('board');
      else if (e.key === '2') onSelectView?.('skills');
      else if (e.key === '3') onSelectView?.('memory');
      else if (e.key === '4') onSelectView?.('stats');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, selectedItem, onFanOutAgents, onRecurseAgent, onAdvanceStage, onSelectView]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'fanout' && selectedItem && onFanOutAgents) {
      onFanOutAgents(selectedItem.id);
      setConsoleLogs((prev) => [`> fanout: Exploded task across 3 RTX subagents`, ...prev]);
    } else if (cmd === 'recurse' && selectedItem && onRecurseAgent) {
      onRecurseAgent(selectedItem.id);
      setConsoleLogs((prev) => [`> recurse: Advanced recursive self-correction turn`, ...prev]);
    } else if (cmd === 'advance' && selectedItem && onAdvanceStage) {
      onAdvanceStage(selectedItem.id);
      setConsoleLogs((prev) => [`> advance: Promoted stage on #${selectedItem.id.slice(-6)}`, ...prev]);
    } else if (cmd === 'help') {
      setConsoleLogs((prev) => [
        `AVAILABLE COMMANDS: fanout, recurse, advance, clear, board, skills, memory, stats`,
        ...prev,
      ]);
    } else if (cmd === 'clear') {
      setConsoleLogs([]);
    } else if (cmd === 'board') onSelectView?.('board');
    else if (cmd === 'skills') onSelectView?.('skills');
    else if (cmd === 'memory') onSelectView?.('memory');
    else if (cmd === 'stats') onSelectView?.('stats');
    else {
      setConsoleLogs((prev) => [`Unknown command: ${cmd}. Type 'help' for commands.`, ...prev]);
    }

    setCommandInput('');
  };

  return (
    <div className="flex-1 w-full h-full bg-[#0a0f0f] text-[#81D8D0] p-4 sm:p-6 font-mono text-xs select-none flex flex-col justify-between overflow-hidden">
      {/* TUI Top Header Bar */}
      <div className="border border-[#0ABAB5]/40 rounded-xl p-3 bg-[#061212]/90 flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(10,186,181,0.08)]">
        <div className="flex items-center space-x-3 text-sm font-bold text-[#E0F7F6]">
          <span className="text-[#0ABAB5]">╔═ PETRI TUI v8.4.0 ═╗</span>
          <span className="text-xs font-normal text-[#81D8D0]/80">
            WORKSPACE: <span className="text-[#E0F7F6]">{activeWorkspace?.name || 'zero-petri'}</span>
          </span>
          <span className="text-xs font-normal text-[#81D8D0]/80">
            USER: <span className="text-[#E0F7F6]">{activeUser?.name || 'Hideo'}</span>
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-[#81D8D0]/70">
          <span>HOST: rtx-server-01</span>
          <span>GPU: 18.4/24.0 GB (76%)</span>
          <span>PEERS: 3 LIVE</span>
          <span className="px-2 py-0.5 rounded bg-[#0ABAB5]/20 text-[#E0F7F6] border border-[#0ABAB5]/40 text-[10px]">
            AUTONOMOUS
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 my-3 overflow-hidden">
        {/* Left Column: Task Process Table (7 cols) */}
        <div className="lg:col-span-7 border border-[#0ABAB5]/30 rounded-xl p-3 bg-[#061212]/70 flex flex-col overflow-hidden">
          <div className="border-b border-[#0ABAB5]/20 pb-2 mb-2 flex items-center justify-between text-xs text-[#E0F7F6] font-semibold">
            <span>┌── ACTIVE TASK PROCESSES ({items.length}) ──────────────────────────────────────┐</span>
            <span className="text-[10px] text-[#81D8D0]/60">[↑/↓] Select · [F] Fanout · [A] Advance</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <div className="grid grid-cols-12 text-[10px] text-[#81D8D0]/60 pb-1 border-b border-[#0ABAB5]/10 font-bold uppercase">
              <span className="col-span-2">PID</span>
              <span className="col-span-2">STAGE</span>
              <span className="col-span-2">KIND</span>
              <span className="col-span-5">TITLE</span>
              <span className="col-span-1 text-right">DEPTH</span>
            </div>

            {items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`grid grid-cols-12 py-1.5 px-2 rounded cursor-pointer transition-colors text-xs items-center ${
                    isSelected
                      ? 'bg-[#0ABAB5]/25 text-[#E0F7F6] border border-[#0ABAB5]/50 font-semibold'
                      : 'text-[#81D8D0]/80 hover:bg-[#0ABAB5]/10 hover:text-[#E0F7F6]'
                  }`}
                >
                  <span className="col-span-2 text-[11px]">#{item.id.slice(-6)}</span>
                  <span className="col-span-2">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase ${
                      item.stage === 'merged'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : item.stage === 'gated'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        : item.stage === 'in_flight'
                        ? 'bg-[#0ABAB5]/30 text-[#E0F7F6] border border-[#0ABAB5]/50'
                        : 'bg-stone-900 text-stone-400'
                    }`}>
                      {item.stage.replace('_', ' ')}
                    </span>
                  </span>
                  <span className="col-span-2 text-[10px] uppercase text-[#81D8D0]/70">{item.kind}</span>
                  <span className="col-span-5 truncate text-[11px]">{item.title}</span>
                  <span className="col-span-1 text-right text-[10px]">d:{item.recursionDepth ?? 1}</span>
                </div>
              );
            })}
          </div>

          {/* Selected Task Inspection Footer */}
          {selectedItem && (
            <div className="mt-2 pt-2 border-t border-[#0ABAB5]/20 text-[11px] space-y-1 text-[#81D8D0]/90">
              <div className="text-[#E0F7F6] font-bold truncate">
                SELECTED: #{selectedItem.id} · {selectedItem.title}
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-[#81D8D0]/70">
                <span>STAGE: {selectedItem.stage}</span>
                <span>FANNED: {selectedItem.isFannedOut ? 'YES (3 AGENTS)' : 'NO'}</span>
                {selectedItem.commitHash && <span>COMMIT: {selectedItem.commitHash.slice(0, 7)}</span>}
                <span className="text-[#0ABAB5] font-semibold">
                  PRESS: [F] Fan Out  [R] Recurse  [A] Advance
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Split into Chain of Thought & Hardware Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 overflow-hidden">
          {/* Upper Box: Chain of Thought Recursion Stream */}
          <div className="flex-1 border border-[#0ABAB5]/30 rounded-xl p-3 bg-[#061212]/70 flex flex-col overflow-hidden">
            <div className="border-b border-[#0ABAB5]/20 pb-1.5 mb-2 flex items-center justify-between text-xs text-[#E0F7F6] font-semibold">
              <span>┌── CHAIN OF THOUGHT (RECURSION) ──┐</span>
              <span className="text-[10px] text-[#0ABAB5] animate-pulse">● LIVE DRAIN</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-[11px] text-[#81D8D0]/80 pr-1">
              {(selectedItem?.chainOfThought || [
                '[turn 1 · cot] Ingest intent & map AST boundaries in zero-petri',
                '[turn 2 · recurse] Synthesizing AST diff with bounded backpressure queues',
                '[turn 3 · active] Running speculative property verifiers on RTX 4090',
              ]).map((thought, tIdx) => (
                <div key={tIdx} className="flex items-start space-x-1.5">
                  <span className="text-[#0ABAB5] select-none">❯</span>
                  <span className="leading-relaxed">{thought}</span>
                </div>
              ))}

              {selectedItem?.agents && (
                <div className="pt-2 border-t border-[#0ABAB5]/20 space-y-1.5">
                  <div className="text-[10px] text-[#E0F7F6] font-bold uppercase">
                    Concurrent Fanned-Out Workers ({selectedItem.agents.length}):
                  </div>
                  {selectedItem.agents.map((ag) => (
                    <div key={ag.id} className="p-1.5 rounded bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 text-[10px]">
                      <div className="flex justify-between font-semibold text-[#E0F7F6]">
                        <span>{ag.role}</span>
                        <span>TURN {ag.recursionTurn ?? 1} · {ag.status}</span>
                      </div>
                      {ag.thought && <div className="italic text-[#81D8D0]/80 mt-0.5">"{ag.thought}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lower Box: Telemetry & Invariants Monitor */}
          <div className="h-44 border border-[#0ABAB5]/30 rounded-xl p-3 bg-[#061212]/70 flex flex-col justify-between text-xs">
            <div className="border-b border-[#0ABAB5]/20 pb-1 text-xs text-[#E0F7F6] font-semibold flex justify-between">
              <span>┌── HARDWARE & INVARIANT TELEMETRY ──┐</span>
              <span className="text-[10px] text-[#81D8D0]/60">NVML 550.54</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>RTX 4090 VRAM:</span>
                <span className="text-[#E0F7F6]">[████████████████░░░░░░] 18.4G/24G (76%)</span>
              </div>
              <div className="flex justify-between">
                <span>PROMPT CACHE:</span>
                <span className="text-[#E0F7F6]">[███████████████████░░░] 91.2% HIT RATE</span>
              </div>
              <div className="flex justify-between">
                <span>INVARIANT FUZZ:</span>
                <span className="text-emerald-400">[██████████████████████] 99.4% VERIFIED</span>
              </div>
              <div className="flex justify-between">
                <span>SELF-LEARNING:</span>
                <span className="text-amber-400">48 RULES DISTILLED · 94.6% CONFIDENCE</span>
              </div>
            </div>

            <div className="text-[10px] text-[#81D8D0]/60 border-t border-[#0ABAB5]/10 pt-1 flex justify-between">
              <span>WireGuard: wg0 (10.0.0.1/24)</span>
              <span>Uptime: 4d 18h 22m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Command Line Bar & Console Output */}
      <div className="space-y-1.5">
        {consoleLogs.length > 0 && (
          <div className="px-3 py-1.5 rounded-lg bg-[#061212]/80 border border-[#0ABAB5]/20 max-h-20 overflow-y-auto space-y-0.5 text-[10px] text-[#81D8D0]/70">
            {consoleLogs.slice(0, 4).map((log, lIdx) => (
              <div key={lIdx} className="truncate font-mono">
                <span className="text-[#0ABAB5]/80">»</span> {log}
              </div>
            ))}
          </div>
        )}

        <div className="border border-[#0ABAB5]/40 rounded-xl p-2.5 bg-[#061212]/90 flex items-center space-x-3">
          <span className="text-[#0ABAB5] font-bold text-xs flex items-center space-x-1">
            <span>petri:~$</span>
          </span>

          <form onSubmit={handleCommandSubmit} className="flex-1">
            <input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="type command (fanout, recurse, advance, board, skills, memory, stats, help)..."
              className="w-full bg-transparent text-[#E0F7F6] placeholder-[#81D8D0]/40 text-xs font-mono focus:outline-none"
            />
          </form>

        <div className="flex items-center space-x-1.5 text-[10px] text-[#81D8D0]/70">
          <button
            type="button"
            onClick={() => onSelectView?.('board')}
            className="px-2 py-0.5 rounded bg-[#0ABAB5]/20 hover:bg-[#0ABAB5]/30 text-[#E0F7F6] transition-colors"
          >
            [1] Board
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('skills')}
            className="px-2 py-0.5 rounded bg-[#0ABAB5]/20 hover:bg-[#0ABAB5]/30 text-[#E0F7F6] transition-colors"
          >
            [2] Skills
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('memory')}
            className="px-2 py-0.5 rounded bg-[#0ABAB5]/20 hover:bg-[#0ABAB5]/30 text-[#E0F7F6] transition-colors"
          >
            [3] Memory
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('stats')}
            className="px-2 py-0.5 rounded bg-[#0ABAB5]/20 hover:bg-[#0ABAB5]/30 text-[#E0F7F6] transition-colors"
          >
            [4] Stats
          </button>
        </div>
      </div>
    </div>
  </div>
);
};
