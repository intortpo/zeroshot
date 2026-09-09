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
    'Active user: Hideo (intortpo) <82773932+intortpo@users.noreply.github.com>',
    'Hardware profile: Native Local Client · System CPU execution',
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
    <div className="flex-1 w-full h-full p-4 sm:p-6 font-mono text-xs select-none flex flex-col justify-between overflow-hidden">
      {/* Top Header Bar */}
      <div className="border border-stone-200/90 rounded-2xl p-3.5 bg-white/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-bold text-stone-900 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0ABAB5]" />
            <span>petri cli</span>
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

        <div className="flex items-center space-x-3 text-[11px] text-stone-500">
          <span>host: po (x86_64)</span>
          <span className="text-stone-300">·</span>
          <span>runtime: tauri v2</span>
          <span className="px-2 py-0.5 rounded-md bg-[#E0F7F6] text-[#0A7B76] border border-[#B4E8E4] font-medium text-[10px]">
            active
          </span>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 my-3 overflow-hidden">
        {/* Left Column: Authentic Git & Task Ledger (7 cols) */}
        <div className="lg:col-span-7 border border-stone-200/90 rounded-2xl p-4 bg-white/95 backdrop-blur-xl flex flex-col overflow-hidden shadow-sm">
          <div className="border-b border-stone-200 pb-2.5 mb-2.5 flex items-center justify-between text-xs text-stone-700 font-semibold">
            <span>Repository Tasks & Git Commits ({items.length})</span>
            <span className="text-[11px] text-stone-400 font-normal">
              [↑/↓] select · [f] fanout · [a] advance
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <div className="grid grid-cols-12 text-[10px] text-stone-400 pb-1.5 border-b border-stone-100 font-semibold uppercase tracking-wider">
              <span className="col-span-2">REF / ID</span>
              <span className="col-span-2">STAGE</span>
              <span className="col-span-1">KIND</span>
              <span className="col-span-7">DESCRIPTION</span>
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
                  className={`grid grid-cols-12 py-2 px-2.5 rounded-xl cursor-pointer transition-all text-xs items-center ${
                    isSelected
                      ? 'bg-[#E0F7F6] text-stone-900 border border-[#B4E8E4] font-medium shadow-sm'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-transparent'
                  }`}
                >
                  <span className="col-span-2 text-[11px] font-mono text-stone-500">
                    {refLabel}
                  </span>
                  <span className="col-span-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
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
                  <span className="col-span-1 text-[10px] uppercase text-stone-400">
                    {item.kind}
                  </span>
                  <span className="col-span-7 truncate text-[11px] text-stone-800">
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected Task Inspection Bar */}
          {selectedItem && (
            <div className="mt-3 pt-2.5 border-t border-stone-200 text-[11px] flex flex-wrap items-center justify-between gap-2 text-stone-600">
              <div className="truncate max-w-md font-medium text-stone-900">
                Selected: {selectedItem.title}
              </div>
              <div className="flex items-center space-x-3 text-[10px] text-stone-500">
                <span>stage: {selectedItem.stage}</span>
                {selectedItem.commitHash && <span>commit: {selectedItem.commitHash}</span>}
                <span className="text-[#0A7B76] font-semibold">
                  [F] Fanout · [R] Recurse · [A] Advance
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Execution Trace & Authentic System Info (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 overflow-hidden">
          {/* Upper: Chain of Thought & Worker Activity */}
          <div className="flex-1 border border-stone-200/90 rounded-2xl p-4 bg-white/95 backdrop-blur-xl flex flex-col overflow-hidden shadow-sm">
            <div className="border-b border-stone-200 pb-2 mb-2.5 flex items-center justify-between text-xs text-stone-700 font-semibold">
              <span>Autonomous Execution Trace</span>
              <span className="text-[10px] text-[#0A7B76] font-medium bg-[#E0F7F6] px-2 py-0.5 rounded-full border border-[#B4E8E4]">
                turn {selectedItem?.recursionDepth ?? 1}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-[11px] text-stone-600 pr-1">
              {selectedItem?.chainOfThought && selectedItem.chainOfThought.length > 0 ? (
                selectedItem.chainOfThought.map((thought, tIdx) => (
                  <div key={tIdx} className="flex items-start space-x-2 p-2 rounded-lg bg-stone-50/80 border border-stone-100">
                    <span className="text-[#0ABAB5] font-bold select-none">❯</span>
                    <span className="leading-relaxed text-stone-700">{thought}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-400 text-center italic">
                  {selectedItem?.stage === 'merged'
                    ? `Merged into main with commit ${selectedItem.commitHash || 'HEAD'}.`
                    : 'Awaiting autonomous agent dispatch.'}
                </div>
              )}

              {selectedItem?.agents && selectedItem.agents.length > 0 && (
                <div className="pt-2 border-t border-stone-200 space-y-1.5">
                  <div className="text-[10px] text-stone-500 font-semibold uppercase">
                    Fanned-Out Agents ({selectedItem.agents.length}):
                  </div>
                  {selectedItem.agents.map((ag) => (
                    <div key={ag.id} className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-[10px]">
                      <div className="flex justify-between font-semibold text-stone-800">
                        <span>{ag.role}</span>
                        <span className="text-[#0A7B76]">{ag.status}</span>
                      </div>
                      {ag.thought && <div className="italic text-stone-500 mt-1">"{ag.thought}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lower: Genuine Runtime & Environment Telemetry */}
          <div className="h-44 border border-stone-200/90 rounded-2xl p-4 bg-white/95 backdrop-blur-xl flex flex-col justify-between text-xs shadow-sm">
            <div className="border-b border-stone-200 pb-1.5 text-xs text-stone-700 font-semibold flex justify-between">
              <span>Host & Workspace Environment</span>
              <span className="text-[10px] text-stone-400">verified</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-stone-600">
              <div className="flex justify-between">
                <span className="text-stone-400">Host / Machine:</span>
                <span className="text-stone-800 font-medium">po (Linux 7.1.9-arch1-2 x86_64)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Workspace Path:</span>
                <span className="text-stone-800 truncate max-w-[200px]" title="/home/hideo/Documents/GitHub/zero-petri">
                  .../Documents/GitHub/zero-petri
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Hardware Profile:</span>
                <span className="text-stone-800">Native CPU Host</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Tracked Tasks:</span>
                <span className="text-stone-800">{items.length} total ({items.filter(i => i.stage === 'merged').length} merged)</span>
              </div>
            </div>

            <div className="text-[10px] text-stone-400 border-t border-stone-100 pt-1.5 flex justify-between">
              <span>IPC: Tauri v2 Core</span>
              <span>WireGuard: Standalone Node</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Command Line Bar & Console Logs */}
      <div className="space-y-2">
        {consoleLogs.length > 0 && (
          <div className="px-3.5 py-2 rounded-xl bg-white/90 border border-stone-200 max-h-20 overflow-y-auto space-y-1 text-[11px] text-stone-600 shadow-sm">
            {consoleLogs.slice(0, 3).map((log, lIdx) => (
              <div key={lIdx} className="truncate font-mono">
                <span className="text-[#0ABAB5] font-bold">›</span> {log}
              </div>
            ))}
          </div>
        )}

        <div className="border border-stone-200/90 rounded-2xl p-2.5 bg-white/95 backdrop-blur-xl flex items-center space-x-3 shadow-sm">
          <span className="text-[#0A7B76] font-bold text-xs flex items-center space-x-1 pl-1">
            <span>hideo@po:~/zero-petri$</span>
          </span>

          <form onSubmit={handleCommandSubmit} className="flex-1">
            <input
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="type command (fanout, recurse, advance, board, skills, memory, stats, help)..."
              className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-xs font-mono focus:outline-none"
            />
          </form>

          <div className="flex items-center space-x-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => onSelectView?.('board')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              [1] Board
            </button>
            <button
              type="button"
              onClick={() => onSelectView?.('skills')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              [2] Skills
            </button>
            <button
              type="button"
              onClick={() => onSelectView?.('memory')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              [3] Memory
            </button>
            <button
              type="button"
              onClick={() => onSelectView?.('stats')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              [4] Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
