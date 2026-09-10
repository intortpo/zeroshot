import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PetriItem, Workspace, UserProfile, PetriViewMode, PetriSkill, SkillCategory } from '../types';
import { INITIAL_SKILLS } from './SkillsCatalog';
import {
  HelpCircle,
  Sparkles,
  ExternalLink,
  Palette,
  Flame,
  GitPullRequest,
  Cloud,
  Cpu,
  Play,
} from 'lucide-react';

interface TuiViewProps {
  items: PetriItem[];
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  skills?: PetriSkill[];
  onDispatchSkill?: (prompt: string, category: SkillCategory) => void;
  onFanOutAgents?: (itemId: string) => void;
  onAdvanceStage?: (itemId: string) => void;
  onRecurseAgent?: (itemId: string) => void;
  onSelectView?: (view: PetriViewMode) => void;
}

export const TuiView: React.FC<TuiViewProps> = ({
  items,
  activeWorkspace,
  activeUser,
  skills,
  onDispatchSkill,
  onFanOutAgents,
  onAdvanceStage,
  onRecurseAgent,
  onSelectView,
}) => {
  const allSkills = useMemo(() => skills || INITIAL_SKILLS, [skills]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [commandInput, setCommandInput] = useState<string>('');

  // Modals state for '?' and '/'
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSkillPickerOpen, setIsSkillPickerOpen] = useState<boolean>(false);
  const [skillSearch, setSkillSearch] = useState<string>('');
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(0);
  const skillSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'petri daemon v8.4.0 started on host po (x86_64 Linux)',
    'git ledger synchronized: /home/hideo/Documents/GitHub/zero-petri [main]',
    'operator: Hideo (intortpo) <82773932+intortpo@users.noreply.github.com>',
    'hardware: native CPU execution mode (driver inactive fallback)',
    'hint: press [?] for keyboard shortcuts, [/] to load skills palette',
  ]);

  const selectedItem = items[selectedIndex] || items[0];

  // Filter skills based on user search
  const filteredSkills = useMemo(() => {
    if (!skillSearch.trim()) return allSkills;
    const q = skillSearch.toLowerCase();
    return allSkills.filter((s) => {
      return (
        s.title.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.repoUrl && s.repoUrl.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.samplePrompts.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [allSkills, skillSearch]);

  const activeSkill = filteredSkills[selectedSkillIndex] || filteredSkills[0];

  const handleRunSkill = (skill: PetriSkill, customPrompt?: string) => {
    const promptToDispatch = customPrompt || skill.samplePrompts[0] || `Execute ${skill.title} workflow`;
    if (onDispatchSkill) {
      onDispatchSkill(promptToDispatch, skill.category);
    }
    setConsoleLogs((prev) => [
      `[SKILL DISPATCHED] ${skill.name} (${skill.category}): "${promptToDispatch.slice(0, 65)}..."`,
      ...prev,
    ]);
    setIsSkillPickerOpen(false);
  };

  const handleCopySkillPrompt = (prompt: string) => {
    setCommandInput(prompt);
    setIsSkillPickerOpen(false);
    setConsoleLogs((prev) => [
      `[SKILL LOADED TO PROMPT] Press Enter to run or edit command`,
      ...prev,
    ]);
  };

  const getCategoryIcon = (category: SkillCategory) => {
    switch (category) {
      case 'diagram':
        return <Palette className="w-3.5 h-3.5 text-rose-400" />;
      case 'firebase':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'github':
        return <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />;
      case 'gcloud':
        return <Cloud className="w-3.5 h-3.5 text-sky-400" />;
      case 'agy':
      default:
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes any open modal
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
          e.preventDefault();
          return;
        }
        if (isSkillPickerOpen) {
          setIsSkillPickerOpen(false);
          e.preventDefault();
          return;
        }
      }

      // Keyboard handling inside the Skill Loader palette
      if (isSkillPickerOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSkillIndex((prev) => Math.min(filteredSkills.length - 1, prev + 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSkillIndex((prev) => Math.max(0, prev - 1));
          return;
        }
        if (e.key === 'Enter' && e.target === skillSearchInputRef.current) {
          e.preventDefault();
          if (activeSkill) {
            handleRunSkill(activeSkill);
          }
          return;
        }
        return;
      }

      const isInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Handle '?' shortcut for shortcuts cheat sheet
      if (e.key === '?') {
        if (!isInput || (e.target as HTMLInputElement).value === '') {
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          return;
        }
      }

      // Handle '/' shortcut for skill loader palette
      if (e.key === '/') {
        if (!isInput) {
          e.preventDefault();
          setIsSkillPickerOpen(true);
          setSkillSearch('');
          setSelectedSkillIndex(0);
          setTimeout(() => skillSearchInputRef.current?.focus(), 50);
          return;
        }
      }

      if (isInput) return;

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
      else if (e.key === '2') onSelectView?.('graph');
      else if (e.key === '3') onSelectView?.('zero');
      else if (e.key === '4') onSelectView?.('skills');
      else if (e.key === '5') onSelectView?.('memory');
      else if (e.key === '6') onSelectView?.('stats');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    items,
    selectedIndex,
    selectedItem,
    onFanOutAgents,
    onRecurseAgent,
    onAdvanceStage,
    onSelectView,
    isShortcutsOpen,
    isSkillPickerOpen,
    filteredSkills,
    selectedSkillIndex,
    activeSkill,
  ]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;
    const cmd = rawCmd.toLowerCase();

    // Command shortcuts & skill loaders
    if (cmd === '/' || cmd === '/skills' || cmd === 'skills') {
      setIsSkillPickerOpen(true);
      setSkillSearch('');
      setSelectedSkillIndex(0);
      setTimeout(() => skillSearchInputRef.current?.focus(), 50);
    } else if (cmd === '?' || cmd === '/help' || cmd === 'help' || cmd === '/shortcuts') {
      setIsShortcutsOpen(true);
    } else if (cmd.startsWith('/diagram')) {
      const diagramSkill = allSkills.find((s) => s.id === 'diagram-design') || allSkills[0];
      const customPrompt = rawCmd.slice(8).trim();
      handleRunSkill(diagramSkill, customPrompt || undefined);
    } else if (cmd.startsWith('/plan') || cmd.startsWith('/grill') || cmd.startsWith('/goal')) {
      const agySkill = allSkills.find((s) => s.name.includes('slash')) || allSkills[0];
      handleRunSkill(agySkill, rawCmd);
    } else if (cmd === 'fanout' && selectedItem && onFanOutAgents) {
      onFanOutAgents(selectedItem.id);
      setConsoleLogs((prev) => [`> fanout #${selectedItem.id.replace('pt-', '')}: parallel workers dispatched`, ...prev]);
    } else if (cmd === 'recurse' && selectedItem && onRecurseAgent) {
      onRecurseAgent(selectedItem.id);
      setConsoleLogs((prev) => [`> recurse #${selectedItem.id.replace('pt-', '')}: executed turn`, ...prev]);
    } else if (cmd === 'advance' && selectedItem && onAdvanceStage) {
      onAdvanceStage(selectedItem.id);
      setConsoleLogs((prev) => [`> advance #${selectedItem.id.replace('pt-', '')}: stage promoted`, ...prev]);
    } else if (cmd === 'clear') {
      setConsoleLogs([]);
    } else if (cmd === 'board') onSelectView?.('board');
    else if (cmd === 'graph') onSelectView?.('graph');
    else if (cmd === 'zero') onSelectView?.('zero');
    else if (cmd === 'memory') onSelectView?.('memory');
    else if (cmd === 'stats') onSelectView?.('stats');
    else {
      setConsoleLogs((prev) => [`command not found: ${rawCmd}. type '?' or 'help'`, ...prev]);
    }

    setCommandInput('');
  };

  return (
    <div className="flex-1 w-full h-full bg-zinc-950 text-zinc-300 p-2 sm:p-4 font-mono text-xs sm:text-sm flex flex-col justify-between overflow-hidden relative">
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
              [↑/↓ or j/k] NAVIGATE · [/] SKILLS · [?] HELP
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
            onChange={(e) => {
              const val = e.target.value;
              if (val === '/') {
                setIsSkillPickerOpen(true);
                setSkillSearch('');
                setSelectedSkillIndex(0);
                setTimeout(() => skillSearchInputRef.current?.focus(), 50);
                return;
              }
              if (val === '?') {
                setIsShortcutsOpen(true);
                return;
              }
              setCommandInput(val);
            }}
            placeholder="fanout, recurse, advance, board, /diagram, /skills, ?shortcuts..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 font-mono text-xs sm:text-sm focus:outline-none"
          />
        </form>

        <div className="flex items-center space-x-1.5 text-xs">
          {/* Quick Action buttons */}
          <button
            type="button"
            onClick={() => {
              setIsSkillPickerOpen(true);
              setSkillSearch('');
              setSelectedSkillIndex(0);
              setTimeout(() => skillSearchInputRef.current?.focus(), 50);
            }}
            className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 transition-colors font-semibold"
            title="Load autonomous skill palette"
          >
            [/] SKILLS
          </button>

          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-600/60 transition-colors font-semibold"
            title="Show keyboard shortcuts"
          >
            [?] HELP
          </button>

          <span className="text-zinc-600">│</span>

          <button
            type="button"
            onClick={() => onSelectView?.('board')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [1] BOARD
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('graph')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [2] GRAPH
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('zero')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [3] ZERO
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('skills')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [4] SKILLS
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('memory')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [5] MEMORY
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('stats')}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition-colors"
          >
            [6] STATS
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KEYBOARD SHORTCUTS CHEAT SHEET MODAL (Triggered by '?')               */}
      {/* ========================================================================= */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-100 font-mono">
          <div className="bg-zinc-950 border-2 border-amber-500/80 w-full max-w-2xl text-zinc-200 text-xs shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-bold tracking-wide">
                  ┌─ KEYBOARD SHORTCUTS CHEAT SHEET ──────────────────────────┐
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="text-zinc-400 hover:text-white px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              >
                [ESC] CLOSE
              </button>
            </div>

            {/* Shortcuts Content */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Navigation & Task Ledger */}
              <div>
                <div className="text-emerald-400 font-bold border-b border-zinc-800 pb-1 mb-2">
                  TASKS & LEDGER NAVIGATION
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[↑] or [k]</span>
                    <span className="text-zinc-400">Navigate selection up</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[↓] or [j]</span>
                    <span className="text-zinc-400">Navigate selection down</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[f]</span>
                    <span className="text-zinc-400">Fan out 3 RTX subagents</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[r]</span>
                    <span className="text-zinc-400">Recurse next cognitive turn</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[a]</span>
                    <span className="text-zinc-400">Advance item to next stage</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Skills & Autonomy */}
              <div>
                <div className="text-rose-400 font-bold border-b border-zinc-800 pb-1 mb-2">
                  AUTONOMOUS SKILLS & PALETTES
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[/]</span>
                    <span className="text-zinc-400">Load Skills Palette & Search</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[?]</span>
                    <span className="text-zinc-400">Toggle shortcuts cheat sheet</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">/diagram</span>
                    <span className="text-zinc-400">Generate architectural SVG diagrams</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">/plan, /goal</span>
                    <span className="text-zinc-400">AGY autonomous workflows</span>
                  </div>
                </div>
              </div>

              {/* Section 3: View Switching */}
              <div>
                <div className="text-sky-400 font-bold border-b border-zinc-800 pb-1 mb-2">
                  SYSTEM VIEW SWITCHING
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-zinc-300">
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[1]</span>
                    <span className="text-zinc-400">Board</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[2]</span>
                    <span className="text-zinc-400">Graph</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[3]</span>
                    <span className="text-zinc-400">Zero</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[4]</span>
                    <span className="text-zinc-400">Skills</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[5]</span>
                    <span className="text-zinc-400">Memory</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 border border-zinc-800">
                    <span className="font-semibold text-white">[6]</span>
                    <span className="text-zinc-400">Stats</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-zinc-400">
              <span>Press [?] or [ESC] to return to terminal</span>
              <span className="text-zinc-500">petri-tui runtime</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SKILL LOADER PALETTE (Triggered by '/')                    */}
      {/* ========================================================================= */}
      {isSkillPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-100 font-mono">
          <div className="bg-zinc-950 border-2 border-emerald-500/80 w-full max-w-4xl text-zinc-200 text-xs shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Title Bar */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold tracking-wide">
                  ┌─ LOAD AUTONOMOUS SKILL (/) ───────────────────────────────┐
                </span>
                <span className="text-zinc-500">[{allSkills.length} available]</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSkillPickerOpen(false)}
                className="text-zinc-400 hover:text-white px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              >
                [ESC] CLOSE
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center space-x-3">
              <span className="text-emerald-400 font-bold select-none">&gt;&gt;</span>
              <input
                ref={skillSearchInputRef}
                value={skillSearch}
                onChange={(e) => {
                  setSkillSearch(e.target.value);
                  setSelectedSkillIndex(0);
                }}
                placeholder="Search skills (e.g. diagram, cathrynlavery, deploy, rules, test)..."
                className="flex-1 bg-transparent text-emerald-300 placeholder-zinc-500 focus:outline-none font-mono text-xs sm:text-sm"
                autoFocus
              />
              {skillSearch && (
                <button
                  type="button"
                  onClick={() => setSkillSearch('')}
                  className="text-zinc-500 hover:text-zinc-300 text-[10px] px-1.5 py-0.5 bg-zinc-800 border border-zinc-700"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Two-Column Split: Skill List & Active Skill Inspection */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Left Column: Skill List (5 cols) */}
              <div className="md:col-span-5 border-r border-zinc-800 overflow-y-auto max-h-[55vh]">
                {filteredSkills.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 italic">
                    No skills matched "{skillSearch}".
                  </div>
                ) : (
                  filteredSkills.map((skill, idx) => {
                    const isSelected = idx === selectedSkillIndex;
                    return (
                      <div
                        key={skill.id}
                        onClick={() => setSelectedSkillIndex(idx)}
                        className={`p-2.5 border-b border-zinc-900 cursor-pointer transition-none flex items-start space-x-2.5 ${
                          isSelected
                            ? 'bg-zinc-100 text-zinc-950 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <span className="font-bold select-none mt-0.5">
                          {isSelected ? '▶' : ' '}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-[9px] uppercase px-1 py-0.2 rounded border font-semibold ${
                                isSelected
                                  ? 'bg-zinc-900 text-zinc-100 border-zinc-800'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {skill.category}
                            </span>
                            <span className="truncate text-xs font-semibold">
                              {skill.title}
                            </span>
                          </div>
                          <div className="text-[10px] opacity-75 font-mono truncate mt-0.5">
                            {skill.name} · {skill.version}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Active Skill Detailed Preview & Executable Prompts (7 cols) */}
              <div className="md:col-span-7 p-4 overflow-y-auto max-h-[55vh] flex flex-col justify-between space-y-3 bg-zinc-900/40">
                {activeSkill ? (
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(activeSkill.category)}
                          <span className="text-zinc-100 font-bold text-sm">
                            {activeSkill.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {activeSkill.version}
                        </span>
                      </div>

                      <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                        {activeSkill.name}
                      </div>

                      {activeSkill.repoUrl && (
                        <div className="mt-1">
                          <a
                            href={activeSkill.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
                          >
                            <span>{activeSkill.repoUrl}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">
                        Specification
                      </div>
                      <p className="text-zinc-300 leading-relaxed text-xs">
                        {activeSkill.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">
                        Capabilities & Keywords
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeSkill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Executable Sample Prompts */}
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold mb-1.5 flex justify-between">
                        <span>Executable Prompts</span>
                        <span className="text-emerald-400">[Click to dispatch]</span>
                      </div>
                      <div className="space-y-1.5">
                        {activeSkill.samplePrompts.map((prompt, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/80 hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                          >
                            <div className="flex items-center space-x-2 flex-1 pr-2 truncate">
                              <span className="text-zinc-500 font-semibold select-none">
                                0{pIdx + 1}
                              </span>
                              <span className="text-zinc-300 text-xs truncate">
                                {prompt}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5 opacity-80 group-hover:opacity-100 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopySkillPrompt(prompt)}
                                className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 border border-zinc-700"
                                title="Insert into command prompt"
                              >
                                [TAB] EDIT
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRunSkill(activeSkill, prompt)}
                                className="px-2 py-0.5 bg-emerald-900/80 hover:bg-emerald-800 text-[10px] text-emerald-200 border border-emerald-600 font-semibold flex items-center space-x-1"
                                title="Dispatch immediately"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>RUN</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-zinc-500 italic">
                    Select a skill to inspect its specification.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-zinc-400">
              <div className="flex items-center space-x-4">
                <span>[ENTER] Run / Dispatch</span>
                <span>[TAB] Copy to Prompt</span>
                <span>[↑/↓] Navigate</span>
                <span>[ESC] Close</span>
              </div>
              {activeSkill && (
                <button
                  type="button"
                  onClick={() => handleRunSkill(activeSkill)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                >
                  DISPATCH SKILL ▶
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
