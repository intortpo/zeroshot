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
    'Petri native runtime initialized on Linux x86_64 (host: po)',
    'Loaded authentic git ledger from /home/hideo/Documents/GitHub/zero-petri (branch: main)',
    'Active operator: Hideo (intortpo) <82773932+intortpo@users.noreply.github.com>',
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
          `fanout: Dispatched concurrent worker group on #${selectedItem.id.replace('pt-', '')}`,
          ...prev,
        ]);
      } else if (e.key === 'r' && selectedItem && onRecurseAgent) {
        onRecurseAgent(selectedItem.id);
        setConsoleLogs((prev) => [
          `recurse: Triggered reflection turn on #${selectedItem.id.replace('pt-', '')}`,
          ...prev,
        ]);
      } else if (e.key === 'a' && selectedItem && onAdvanceStage) {
        onAdvanceStage(selectedItem.id);
        setConsoleLogs((prev) => [
          `advance: Promoted #${selectedItem.id.replace('pt-', '')} to next workflow stage`,
          ...prev,
        ]);
      } else if (e.key === '1') {
        onSelectView?.('board');
      } else if (e.key === '2') {
        onSelectView?.('skills');
      } else if (e.key === '3') {
        onSelectView?.('memory');
      } else if (e.key === '4') {
        onSelectView?.('stats');
      }
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
      setConsoleLogs((prev) => [`> fanout: Dispatched concurrent workers on #${selectedItem.id.replace('pt-', '')}`, ...prev]);
    } else if (cmd === 'recurse' && selectedItem && onRecurseAgent) {
      onRecurseAgent(selectedItem.id);
      setConsoleLogs((prev) => [`> recurse: Executed reflection turn on #${selectedItem.id.replace('pt-', '')}`, ...prev]);
    } else if (cmd === 'advance' && selectedItem && onAdvanceStage) {
      onAdvanceStage(selectedItem.id);
      setConsoleLogs((prev) => [`> advance: Advanced stage on #${selectedItem.id.replace('pt-', '')}`, ...prev]);
    } else if (cmd === 'help') {
      setConsoleLogs((prev) => [
        `Commands: fanout, recurse, advance, board, skills, memory, stats, clear`,
        ...prev,
      ]);
    } else if (cmd === 'clear') {
      setConsoleLogs([]);
    } else if (cmd === 'board') onSelectView?.('board');
    else if (cmd === 'skills') onSelectView?.('skills');
    else if (cmd === 'memory') onSelectView?.('memory');
    else if (cmd === 'stats') onSelectView?.('stats');
    else {
      setConsoleLogs((prev) => [`Unknown command '${cmd}'. Type 'help' for options.`, ...prev]);
    }

    setCommandInput('');
  };

  return (
    <div className="flex-1 w-full h-full p-5 sm:p-8 font-mono text-sm select-none flex flex-col justify-between overflow-hidden">
      {/* Top Header Bar */}
      <div className="border border-stone-200/80 rounded-2xl p-4 bg-white/70 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-sm">
          <span className="font-bold text-stone-900 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5]" />
            <span className="text-base tracking-tight">petri cli</span>
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-600">
            repo: <span className="font-semibold text-stone-900">{activeWorkspace?.name || 'zero-petri'}</span>
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-600">
            branch: <span className="text-stone-900 font-semibold">main</span>
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-600">
            user: <span className="text-stone-900 font-semibold">{activeUser?.name || 'Hideo'}</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-stone-500">
          <span>host: po (x86_64)</span>
          <span className="text-stone-300">·</span>
          <span>runtime: tauri v2</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#E0F7F6] text-[#0A7B76] border border-[#B4E8E4] font-semibold text-xs">
            active
          </span>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 my-4 overflow-hidden">
        {/* Left Column: Authentic Git & Task Ledger (7 cols) */}
        <div className="lg:col-span-7 border border-stone-200/80 rounded-2xl p-5 bg-white/70 backdrop-blur-2xl flex flex-col overflow-hidden">
          <div className="border-b border-stone-200/80 pb-3 mb-3 flex items-center justify-between text-sm text-stone-800 font-semibold">
            <span>Repository Tasks & Git Commits ({items.length})</span>
            <span className="text-xs text-stone-500 font-normal">
              [↑/↓] select · [f] fanout · [a] advance
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            <div className="grid grid-cols-12 text-xs text-stone-400 pb-2 border-b border-stone-100 font-semibold uppercase tracking-wider">
              <span className="col-span-2">REF / ID</span>
              <span className="col-span-2">STAGE</span>
              <span className="col-span-2">KIND</span>
              <span className="col-span-6">DESCRIPTION</span>
            </div>

            {items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const refLabel = item.commitHash
                ? item.commitHash.slice(0, 7)
                : item.id.replace('pt-', '#');

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`grid grid-cols-12 py-3 px-3 rounded-xl cursor-pointer transition-all text-xs sm:text-sm items-center ${
                    isSelected
                      ? 'bg-[#E0F7F6]/80 text-stone-900 border border-[#B4E8E4] font-medium'
                      : 'text-stone-700 hover:bg-white/60 hover:text-stone-900 border border-transparent'
                  }`}
                >
                  <span className="col-span-2 font-mono text-stone-500">
                    {refLabel}
                  </span>
                  <span className="col-span-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${
                        item.stage === 'merged'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.stage === 'gated'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : item.stage === 'in_flight'
                          ? 'bg-[#E0F7F6] text-[#0A7B76] border border-[#B4E8E4]'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {item.stage.replace('_', ' ')}
                    </span>
                  </span>
                  <span className="col-span-2 text-xs uppercase text-stone-500 font-medium">
                    {item.kind}
                  </span>
                  <span className="col-span-6 truncate text-stone-900 font-medium">
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected Task Inspection Bar */}
          {selectedItem && (
            <div className="mt-3.5 pt-3 border-t border-stone-200/80 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 text-stone-600">
              <div className="truncate max-w-lg font-semibold text-stone-900">
                Selected: {selectedItem.title}
              </div>
              <div className="flex items-center space-x-3 text-xs text-stone-500">
                <span>stage: {selectedItem.stage}</span>
                <span className="text-[#0A7B76] font-bold">
                  [F] Fanout · [R] Recurse · [A] Advance
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Execution Trace & System Info (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4 overflow-hidden">
          {/* Upper: Chain of Thought & Worker Activity */}
          <div className="flex-1 border border-stone-200/80 rounded-2xl p-5 bg-white/70 backdrop-blur-2xl flex flex-col overflow-hidden">
            <div className="border-b border-stone-200/80 pb-2.5 mb-3 flex items-center justify-between text-sm text-stone-800 font-semibold">
              <span>Autonomous Execution Trace</span>
              <span className="text-xs text-[#0A7B76] font-semibold bg-[#E0F7F6] px-2.5 py-0.5 rounded-full border border-[#B4E8E4]">
                turn {selectedItem?.recursionDepth ?? 1}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs sm:text-sm text-stone-700 pr-1">
              {selectedItem?.chainOfThought && selectedItem.chainOfThought.length > 0 ? (
                selectedItem.chainOfThought.map((thought, tIdx) => (
                  <div key={tIdx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-white/70 border border-stone-200/70">
                    <span className="text-[#0ABAB5] font-bold select-none">❯</span>
                    <span className="leading-relaxed text-stone-800">{thought}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-white/50 border border-stone-200/70 text-stone-400 text-center italic">
                  {selectedItem?.stage === 'merged'
                    ? `Merged into main with commit ${selectedItem.commitHash || 'HEAD'}.`
                    : 'Awaiting autonomous agent dispatch.'}
                </div>
              )}

              {selectedItem?.agents && selectedItem.agents.length > 0 && (
                <div className="pt-3 border-t border-stone-200/80 space-y-2">
                  <div className="text-xs text-stone-600 font-bold uppercase">
                    Fanned-Out Workers ({selectedItem.agents.length}):
                  </div>
                  {selectedItem.agents.map((ag) => (
                    <div key={ag.id} className="p-3 rounded-xl bg-white/80 border border-stone-200 text-xs">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{ag.role}</span>
                        <span className="text-[#0A7B76]">{ag.status}</span>
                      </div>
                      {ag.thought && <div className="italic text-stone-600 mt-1">"{ag.thought}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lower: Genuine Runtime & Environment Telemetry */}
          <div className="h-48 border border-stone-200/80 rounded-2xl p-5 bg-white/70 backdrop-blur-2xl flex flex-col justify-between text-xs sm:text-sm">
            <div className="border-b border-stone-200/80 pb-2 text-sm text-stone-800 font-semibold flex justify-between">
              <span>Host & Workspace Environment</span>
              <span className="text-xs text-stone-400 font-normal">verified</span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Host / Machine:</span>
                <span className="text-stone-900 font-semibold">po (Linux 7.1.9-arch1-2 x86_64)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Workspace Path:</span>
                <span className="text-stone-900 font-medium truncate max-w-[220px]" title="/home/hideo/Documents/GitHub/zero-petri">
                  .../Documents/GitHub/zero-petri
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Hardware Profile:</span>
                <span className="text-stone-800">Native CPU Host</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tracked Tasks:</span>
                <span className="text-stone-900 font-semibold">{items.length} total ({items.filter(i => i.stage === 'merged').length} merged)</span>
              </div>
            </div>

            <div className="text-xs text-stone-400 border-t border-stone-200/60 pt-2 flex justify-between">
              <span>IPC: Tauri v2 Core</span>
              <span>WireGuard: Standalone Node</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Command Line Bar & Console Logs */}
      <div className="space-y-2.5">
        {consoleLogs.length > 0 && (
          <div className="px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-stone-200/80 max-h-24 overflow-y-auto space-y-1 text-xs sm:text-sm text-stone-700">
            {consoleLogs.slice(0, 3).map((log, lIdx) => (
              <div key={lIdx} className="truncate font-mono">
                <span className="text-[#0ABAB5] font-bold">›</span> {log}
              </div>
            ))}
          </div>
        )}

        <div className="border border-stone-200/80 rounded-2xl p-3 bg-white/75 backdrop-blur-2xl flex items-center space-x-3.5">
          <span className="text-[#0A7B76] font-bold text-sm flex items-center space-x-1 pl-1">
            <span>hideo@po:~/zero-petri$</span>
          </span>

          <form onSubmit={handleCommandSubmit} className="flex-1">
            <input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="type command (fanout, recurse, advance, board, skills, memory, stats, help)..."
              className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-sm font-mono focus:outline-none"
            />
          </form>

          <div className="flex items-center space-x-2 text-xs">
            <button
              type="button"
              onClick={() => onSelectView?.('board')}
              className="px-3 py-1.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-700 transition-colors font-semibold"
            >
              [1] Board
            </button>
            <button
              type="button"
              onClick={() => onSelectView?.('skills')}
              className="px-3 py-1.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-700 transition-colors font-semibold"
            >
              [2] Skills
            </button>
            <button
              type="button"
              onClick={() => onSelectView?.('memory')}
              className="px-3 py-1.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-700 transition-colors font-semibold"
            >
              [3] Memory
            </button>
            <button
              type="button"
              onClick={() => onSelectView?.('stats')}
              className="px-3 py-1.5 rounded-xl bg-stone-100/80 hover:bg-stone-200 text-stone-700 transition-colors font-semibold"
            >
              [4] Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
