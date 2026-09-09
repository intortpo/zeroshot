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
    'petri daemon v8.4.0 started on host po (x86_64 Linux)',
    'git ledger synchronized: /home/hideo/Documents/GitHub/zero-petri [main]',
    'operator: Hideo (intortpo) <82773932+intortpo@users.noreply.github.com>',
    'hardware: native CPU execution mode (driver inactive fallback)',
  ]);

  const selectedItem = items[selectedIndex] || items[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if ((e.key === 'f' || e.key === 'F') && selectedItem && onFanOutAgents) {
        onFanOutAgents(selectedItem.id);
        setConsoleLogs((prev) => [
          `[ACTION] fanout dispatched on task #${selectedItem.id.replace('pt-', '')}`,
          ...prev,
        ]);
      } else if ((e.key === 'r' || e.key === 'R') && selectedItem && onRecurseAgent) {
        onRecurseAgent(selectedItem.id);
        setConsoleLogs((prev) => [
          `[ACTION] recurse step executed on #${selectedItem.id.replace('pt-', '')}`,
          ...prev,
        ]);
      } else if ((e.key === 'a' || e.key === 'A') && selectedItem && onAdvanceStage) {
        onAdvanceStage(selectedItem.id);
        setConsoleLogs((prev) => [
          `[ACTION] advance stage on #${selectedItem.id.replace('pt-', '')}`,
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
      setConsoleLogs((prev) => [`> fanout #${selectedItem.id.replace('pt-', '')}: parallel workers dispatched`, ...prev]);
    } else if (cmd === 'recurse' && selectedItem && onRecurseAgent) {
      onRecurseAgent(selectedItem.id);
      setConsoleLogs((prev) => [`> recurse #${selectedItem.id.replace('pt-', '')}: executed turn`, ...prev]);
    } else if (cmd === 'advance' && selectedItem && onAdvanceStage) {
      onAdvanceStage(selectedItem.id);
      setConsoleLogs((prev) => [`> advance #${selectedItem.id.replace('pt-', '')}: stage promoted`, ...prev]);
    } else if (cmd === 'help') {
      setConsoleLogs((prev) => [
        `commands: fanout, recurse, advance, board, skills, memory, stats, clear, help`,
        ...prev,
      ]);
    } else if (cmd === 'clear') {
      setConsoleLogs([]);
    } else if (cmd === 'board') onSelectView?.('board');
    else if (cmd === 'skills') onSelectView?.('skills');
    else if (cmd === 'memory') onSelectView?.('memory');
    else if (cmd === 'stats') onSelectView?.('stats');
    else {
      setConsoleLogs((prev) => [`command not found: ${cmd}. type 'help'`, ...prev]);
    }

    setCommandInput('');
  };

  return (
    <div className="flex-1 w-full h-full bg-zinc-950 text-zinc-300 p-2 sm:p-4 font-mono text-xs sm:text-sm select-none flex flex-col justify-between overflow-hidden">
      {/* Top Statusline (Authentic Vim/Tmux Status Header) */}
      <div className="bg-zinc-900 border border-zinc-700/80 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-3">
          <span className="bg-zinc-100 text-zinc-950 px-2 py-0.5 font-semibold">
            PETRI-TUI v8.4.0
          </span>
          <span className="text-zinc-300">
            WORKTREE: <span className="text-zinc-100 font-semibold">{activeWorkspace?.name || 'zero-petri'}@main</span>
          </span>
          <span className="text-zinc-600">│</span>
          <span className="text-zinc-300">
            OPERATOR: <span className="text-zinc-100 font-semibold">{activeUser?.name || 'Hideo'}</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-zinc-400">
          <span>HOST: po</span>
          <span>ARCH: x86_64</span>
          <span>MODE: CPU NATIVE</span>
          <span className="text-emerald-400 font-semibold">● ONLINE</span>
        </div>
      </div>

      {/* Main Split Grid with Authentic Box-Drawing Borders */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 my-2 overflow-hidden">
        {/* Left Column: Task Process Table (7 cols) */}
        <div className="lg:col-span-7 border border-zinc-700/80 bg-zinc-900/60 flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="bg-zinc-900 px-3 py-1.5 border-b border-zinc-700/80 flex items-center justify-between text-xs text-zinc-200">
            <span className="font-semibold text-zinc-100">
              ┌─ TASKS & REPOSITORY LEDGER [{items.length}] ──────────────────────────────
            </span>
            <span className="text-xs text-zinc-400">
              [↑/↓ or j/k] NAVIGATE · [ENTER] INSPECT
            </span>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 px-3 py-1 bg-zinc-900/90 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase">
            <span className="col-span-1">SEL</span>
            <span className="col-span-2">REF/ID</span>
            <span className="col-span-2">STAGE</span>
            <span className="col-span-1">KIND</span>
            <span className="col-span-6">DESCRIPTION</span>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto font-mono text-xs">
            {items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const refLabel = item.commitHash
                ? item.commitHash.slice(0, 7)
                : item.id.replace('pt-', '#');

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`grid grid-cols-12 px-3 py-1.5 cursor-pointer border-b border-zinc-800/80 items-center transition-none ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="col-span-1 font-semibold">
                    {isSelected ? '▶' : ' '}
                  </span>
                  <span className="col-span-2 font-mono">
                    {refLabel}
                  </span>
                  <span className="col-span-2 uppercase">
                    [{item.stage.replace('_', ' ')}]
                  </span>
                  <span className="col-span-1 uppercase">
                    {item.kind}
                  </span>
                  <span className="col-span-6 truncate">
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Panel Footer */}
          <div className="bg-zinc-900 px-3 py-1 border-t border-zinc-700/80 text-xs flex justify-between text-zinc-400">
            <span>SELECTED: #{selectedItem?.commitHash ? selectedItem.commitHash.slice(0, 7) : selectedItem?.id}</span>
            <span>PRESS: [F] FANOUT · [R] RECURSE · [A] ADVANCE</span>
          </div>
        </div>

        {/* Right Column: Execution Trace & Hardware Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2 overflow-hidden">
          {/* Upper: Chain of Thought Recursion Stream */}
          <div className="flex-1 border border-zinc-700/80 bg-zinc-900/60 flex flex-col overflow-hidden">
            <div className="bg-zinc-900 px-3 py-1.5 border-b border-zinc-700/80 flex items-center justify-between text-xs text-zinc-200">
              <span className="font-semibold text-zinc-100">
                ┌─ EXECUTION TRACE & RECURSION ──────────────────
              </span>
              <span className="text-xs text-zinc-400">TURN {selectedItem?.recursionDepth ?? 1}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs text-zinc-300">
              <div className="text-zinc-100 font-semibold border-b border-zinc-800 pb-1">
                TASK: {selectedItem?.title}
              </div>

              {selectedItem?.chainOfThought && selectedItem.chainOfThought.length > 0 ? (
                selectedItem.chainOfThought.map((thought, tIdx) => (
                  <div key={tIdx} className="flex items-start space-x-2">
                    <span className="text-zinc-400 font-semibold select-none">❯</span>
                    <span className="leading-relaxed">{thought}</span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic py-2">
                  {selectedItem?.stage === 'merged'
                    ? `Status: Verified and merged to branch main (commit ${selectedItem.commitHash}).`
                    : 'Status: Awaiting autonomous agent pickup.'}
                </div>
              )}

              {selectedItem?.agents && selectedItem.agents.length > 0 && (
                <div className="pt-2 border-t border-zinc-800 space-y-1 text-xs">
                  <div className="text-zinc-200 font-semibold uppercase">
                    ACTIVE WORKER POOL ({selectedItem.agents.length}):
                  </div>
                  {selectedItem.agents.map((ag) => (
                    <div key={ag.id} className="p-1.5 bg-zinc-900 border border-zinc-700/70">
                      <div className="flex justify-between font-semibold text-zinc-100">
                        <span>{ag.role}</span>
                        <span className="text-zinc-400">{ag.status}</span>
                      </div>
                      {ag.thought && <div className="italic text-zinc-400 mt-0.5">"{ag.thought}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lower: System & Runtime Environment */}
          <div className="h-44 border border-zinc-700/80 bg-zinc-900/60 flex flex-col justify-between text-xs">
            <div className="bg-zinc-900 px-3 py-1 border-b border-zinc-700/80 flex justify-between text-xs text-zinc-200">
              <span className="font-semibold text-zinc-100">┌─ SYSTEM & MESH RUNTIME ───────────────────</span>
              <span className="text-xs text-zinc-400">VERIFIED</span>
            </div>

            <div className="p-3 space-y-1 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">HOST MACHINE:</span>
                <span className="text-zinc-100">po (Linux 7.1.9-arch1-2 x86_64)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">WORKING TREE:</span>
                <span className="text-zinc-100 truncate max-w-[200px]" title="/home/hideo/Documents/GitHub/zero-petri">
                  .../Documents/GitHub/zero-petri
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">HARDWARE PROFILE:</span>
                <span className="text-zinc-100">Native CPU Host</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">TRACKED TASKS:</span>
                <span className="text-zinc-100">{items.length} total ({items.filter(i => i.stage === 'merged').length} merged)</span>
              </div>
            </div>

            <div className="bg-zinc-900 px-3 py-1 border-t border-zinc-700/80 text-xs flex justify-between text-zinc-400">
              <span>IPC: TAURI V2</span>
              <span>NETWORK: STANDALONE NODE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Log Console */}
      {consoleLogs.length > 0 && (
        <div className="bg-zinc-900/90 border border-zinc-700/80 px-3 py-1.5 mb-2 text-xs space-y-0.5 max-h-16 overflow-y-auto text-zinc-300">
          {consoleLogs.slice(0, 3).map((log, lIdx) => (
            <div key={lIdx} className="truncate">
              <span className="text-zinc-400 font-semibold">›</span> {log}
            </div>
          ))}
        </div>
      )}

      {/* Interactive Command Line & View Switcher */}
      <div className="bg-zinc-900 border border-zinc-700/80 p-2 flex items-center space-x-3 text-xs sm:text-sm">
        <span className="text-zinc-300 font-semibold whitespace-nowrap pl-1">
          petri:main&gt;
        </span>

        <form onSubmit={handleCommandSubmit} className="flex-1">
          <input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="fanout, recurse, advance, board, skills, memory, stats, clear, help..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 font-mono text-xs sm:text-sm focus:outline-none"
          />
        </form>

        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectView?.('board')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [1] BOARD
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('skills')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [2] SKILLS
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('memory')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [3] MEMORY
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('stats')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [4] STATS
          </button>
        </div>
      </div>
    </div>
  );
};
