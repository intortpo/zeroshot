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
      else if (e.key === '2') onSelectView?.('node');
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
    else if (cmd === 'graph' || cmd === 'node' || cmd === 'studio') onSelectView?.('node');
    else if (cmd === 'federated' || cmd === 'docs') onSelectView?.('federated');
    else if (cmd === 'zero') onSelectView?.('zero');
    else if (cmd === 'memory') onSelectView?.('memory');
    else if (cmd === 'stats') onSelectView?.('stats');
    else {
      setConsoleLogs((prev) => [`command not found: ${rawCmd}. type '?' or 'help'`, ...prev]);
    }

    setCommandInput('');
  };

  return (
    <div className="flex-1 w-full h-full bg-[#F6F3EC] text-[#1A1D1A] p-2 sm:p-4 font-mono text-xs sm:text-sm flex flex-col justify-between overflow-hidden relative">
      {/* Top Statusline (1960s Inked Flight Console Header) */}
      <div className="bg-[#FAF8F3] border border-[#1A1D1A] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-[2px_2px_0px_#1A1D1A]">
        <div className="flex items-center space-x-3">
          <span className="bg-[#1A1D1A] text-[#FAF8F3] px-2 py-0.5 font-bold">
            PETRI-CONSOLE // V8.4.2
          </span>
          <span className="text-[#1A1D1A]">
            WORKTREE: <span className="font-bold">{activeWorkspace?.name || 'zero-petri'}@main</span>
          </span>
          <span className="text-[#1A1D1A]/40">│</span>
          <span className="text-[#1A1D1A]">
            OPERATOR: <span className="font-bold">{activeUser?.name || 'Hideo'} (j.sadol@bbs.ac.th)</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-[#1A1D1A]/80">
          <span>BUS: po</span>
          <span>ARCH: x86_64</span>
          <span>MODE: CPU NATIVE</span>
          <span className="font-bold border border-[#1A1D1A] px-1 bg-[#EDE8DC]">● AIRWORTHY</span>
        </div>
      </div>

      {/* Main Split Grid with 1960s Technical Box-Drawing Borders */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 my-2 overflow-hidden">
        {/* Left Column: Task Process Table (7 cols) */}
        <div className="lg:col-span-7 border border-[#1A1D1A] bg-[#FAF8F3] flex flex-col overflow-hidden shadow-[2px_2px_0px_#1A1D1A]">
          {/* Panel Header */}
          <div className="bg-[#EDE8DC] px-3 py-1.5 border-b border-[#1A1D1A] flex items-center justify-between text-xs text-[#1A1D1A]">
            <span className="font-bold">
              [LOGBOOK 01 // AIRFRAME TASKS & REPOSITORY LEDGER] [{items.length}]
            </span>
            <span className="text-xs text-[#1A1D1A]/70">
              [↑/↓ or j/k] SELECT · [/] SKILLS · [?] HELP
            </span>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 px-3 py-1 bg-[#F2EFE9] border-b border-[#1A1D1A] text-xs font-bold text-[#1A1D1A] uppercase">
            <span className="col-span-1">SEL</span>
            <span className="col-span-2">REF/ID</span>
            <span className="col-span-2">STAGE</span>
            <span className="col-span-1">KIND</span>
            <span className="col-span-6">SPECIFICATION</span>
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
                  className={`grid grid-cols-12 px-3 py-1.5 cursor-pointer border-b border-[#1A1D1A]/20 items-center transition-none ${
                    isSelected
                      ? 'bg-[#1A1D1A] text-[#FAF8F3] font-bold'
                      : 'text-[#1A1D1A] hover:bg-[#EDE8DC]'
                  }`}
                >
                  <span className="col-span-1 font-bold">
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
          <div className="bg-[#EDE8DC] px-3 py-1 border-t border-[#1A1D1A] text-xs flex justify-between text-[#1A1D1A]/80 font-bold">
            <span>SELECTED: #{selectedItem?.commitHash ? selectedItem.commitHash.slice(0, 7) : selectedItem?.id}</span>
            <span>PRESS: [F] FANOUT · [R] RECURSE · [A] ADVANCE</span>
          </div>
        </div>

        {/* Right Column: Execution Trace & Hardware Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2 overflow-hidden">
          {/* Upper: Chain of Thought Recursion Stream */}
          <div className="flex-1 border border-[#1A1D1A] bg-[#FAF8F3] flex flex-col overflow-hidden shadow-[2px_2px_0px_#1A1D1A]">
            <div className="bg-[#EDE8DC] px-3 py-1.5 border-b border-[#1A1D1A] flex items-center justify-between text-xs text-[#1A1D1A]">
              <span className="font-bold">
                [SCHEMATIC 02 // RECURSION TRACE & WORKERS]
              </span>
              <span className="text-xs text-[#1A1D1A]/70 font-bold">TURN {selectedItem?.recursionDepth ?? 1}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs text-[#1A1D1A]">
              <div className="font-bold border-b border-[#1A1D1A]/20 pb-1">
                DIRECTIVE: {selectedItem?.title}
              </div>

              {selectedItem?.chainOfThought && selectedItem.chainOfThought.length > 0 ? (
                selectedItem.chainOfThought.map((thought, tIdx) => (
                  <div key={tIdx} className="flex items-start space-x-2">
                    <span className="font-bold select-none">❯</span>
                    <span className="leading-relaxed">{thought}</span>
                  </div>
                ))
              ) : (
                <div className="text-[#1A1D1A]/60 italic py-2">
                  {selectedItem?.stage === 'merged'
                    ? `Status: Verified and merged to trunk main (commit ${selectedItem.commitHash}).`
                    : 'Status: Awaiting autonomous agent pickup.'}
                </div>
              )}

              {selectedItem?.agents && selectedItem.agents.length > 0 && (
                <div className="pt-2 border-t border-[#1A1D1A]/20 space-y-1 text-xs">
                  <div className="font-bold uppercase">
                    ACTIVE WORKER POOL ({selectedItem.agents.length}):
                  </div>
                  {selectedItem.agents.map((ag) => (
                    <div key={ag.id} className="p-1.5 bg-[#F2EFE9] border border-[#1A1D1A]">
                      <div className="flex justify-between font-bold">
                        <span>{ag.role}</span>
                        <span className="text-[#1A1D1A]/70">[{ag.status}]</span>
                      </div>
                      {ag.thought && <div className="italic text-[#1A1D1A]/80 mt-0.5">"{ag.thought}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lower: System & Runtime Environment */}
          <div className="h-44 border border-[#1A1D1A] bg-[#FAF8F3] flex flex-col justify-between text-xs shadow-[2px_2px_0px_#1A1D1A]">
            <div className="bg-[#EDE8DC] px-3 py-1 border-b border-[#1A1D1A] flex justify-between text-xs text-[#1A1D1A]">
              <span className="font-bold">[AVIONICS 03 // RUNTIME SYSTEM BUS]</span>
              <span className="text-xs font-bold border border-[#1A1D1A] px-1 bg-[#FAF8F3]">NOMINAL</span>
            </div>

            <div className="p-3 space-y-1 text-xs text-[#1A1D1A]">
              <div className="flex justify-between">
                <span className="text-[#1A1D1A]/70">HOST BUS:</span>
                <span className="font-bold">po (Linux 7.1.9-arch1-2 x86_64)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A1D1A]/70">WORKING TREE:</span>
                <span className="font-bold truncate max-w-[200px]" title="/home/hideo/Documents/GitHub/zero-petri">
                  .../Documents/GitHub/zero-petri
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A1D1A]/70">HARDWARE PROFILE:</span>
                <span className="font-bold">Native CPU Host</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A1D1A]/70">TRACKED TASKS:</span>
                <span className="font-bold">{items.length} total ({items.filter(i => i.stage === 'merged').length} merged)</span>
              </div>
            </div>

            <div className="bg-[#EDE8DC] px-3 py-1 border-t border-[#1A1D1A] text-xs flex justify-between text-[#1A1D1A]/80 font-bold">
              <span>IPC: TAURI V2 / BROWSER RUNTIME</span>
              <span>NETWORK: ISOLATED WORKSPACE NODE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Log Console */}
      {consoleLogs.length > 0 && (
        <div className="bg-[#EDE8DC] border border-[#1A1D1A] px-3 py-1.5 mb-2 text-xs space-y-0.5 max-h-16 overflow-y-auto text-[#1A1D1A] shadow-[1px_1px_0px_#1A1D1A]">
          {consoleLogs.slice(0, 3).map((log, lIdx) => (
            <div key={lIdx} className="truncate">
              <span className="font-bold">›</span> {log}
            </div>
          ))}
        </div>
      )}

      {/* Interactive Command Line & View Switcher */}
      <div className="bg-[#FAF8F3] border border-[#1A1D1A] p-2 flex items-center space-x-3 text-xs sm:text-sm shadow-[2px_2px_0px_#1A1D1A]">
        <span className="text-[#1A1D1A] font-bold whitespace-nowrap pl-1">
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
            className="w-full bg-transparent text-[#1A1D1A] placeholder-[#888] font-mono text-xs sm:text-sm focus:outline-none"
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
            className="px-2 py-0.5 bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors font-bold cursor-pointer"
            title="Load autonomous skill palette"
          >
            [/] SKILLS
          </button>

          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="px-2 py-0.5 bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors font-bold cursor-pointer"
            title="Show keyboard shortcuts"
          >
            [?] HELP
          </button>

          <span className="text-[#1A1D1A]/30">│</span>

          <button
            type="button"
            onClick={() => onSelectView?.('board')}
            className="px-2 py-0.5 bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors cursor-pointer"
          >
            [1] BOARD
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('node')}
            className="px-2 py-0.5 bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors cursor-pointer"
          >
            [2] NODE
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('zero')}
            className="px-2 py-0.5 bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors cursor-pointer"
          >
            [3] ZERO
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('skills')}
            className="px-2 py-0.5 bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors cursor-pointer"
          >
            [4] SKILLS
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('memory')}
            className="px-2 py-0.5 bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors cursor-pointer"
          >
            [5] MEMORY
          </button>
          <button
            type="button"
            onClick={() => onSelectView?.('stats')}
            className="px-2 py-0.5 bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A] transition-colors cursor-pointer"
          >
            [6] STATS
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KEYBOARD SHORTCUTS CHEAT SHEET MODAL (Triggered by '?')               */}
      {/* ========================================================================= */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D1A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-100 font-mono">
          <div className="bg-[#FAF8F3] border-2 border-[#1A1D1A] w-full max-w-2xl text-[#1A1D1A] text-xs shadow-[6px_6px_0px_#1A1D1A] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#EDE8DC] border-b border-[#1A1D1A] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4" />
                <span className="font-bold tracking-wide">
                  [MANUAL 04 // OPERATIONAL KEYBOARD SHORTCUTS]
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="text-[#1A1D1A] px-2 py-0.5 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] font-bold cursor-pointer"
              >
                [ESC] CLOSE
              </button>
            </div>

            {/* Shortcuts Content */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <div className="font-bold border-b border-[#1A1D1A] pb-1 mb-2">
                  TASKS & LEDGER NAVIGATION
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 border border-[#1A1D1A] bg-[#F2EFE9]">
                    <span className="font-bold">[↑] or [k]</span>
                    <span className="text-[#1A1D1A]/70">Navigate selection up</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-[#1A1D1A] bg-[#F2EFE9]">
                    <span className="font-bold">[↓] or [j]</span>
                    <span className="text-[#1A1D1A]/70">Navigate selection down</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-[#1A1D1A] bg-[#F2EFE9]">
                    <span className="font-bold">[F]</span>
                    <span className="text-[#1A1D1A]/70">Fanout parallel workers</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-[#1A1D1A] bg-[#F2EFE9]">
                    <span className="font-bold">[R]</span>
                    <span className="text-[#1A1D1A]/70">Recurse next synthesis turn</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-[#1A1D1A] bg-[#F2EFE9]">
                    <span className="font-bold">[A]</span>
                    <span className="text-[#1A1D1A]/70">Advance task stage</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-[#1A1D1A] bg-[#F2EFE9]">
                    <span className="font-bold">[/]</span>
                    <span className="text-[#1A1D1A]/70">Open avionics skill palette</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#EDE8DC] border-t border-[#1A1D1A] px-4 py-2 flex items-center justify-between text-[#1A1D1A]/80">
              <span>SYSTEM: PETRI TELEPRINTER SUBSYSTEM</span>
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(false)}
                className="px-3 py-1 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] font-bold hover:bg-[#333] cursor-pointer"
              >
                [DISMISS]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SKILL PICKER PALETTE MODAL (Triggered by '/')                         */}
      {/* ========================================================================= */}
      {isSkillPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D1A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-100 font-mono">
          <div className="bg-[#FAF8F3] border-2 border-[#1A1D1A] w-full max-w-4xl text-[#1A1D1A] text-xs shadow-[6px_6px_0px_#1A1D1A] overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-[#EDE8DC] border-b border-[#1A1D1A] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold tracking-wide">
                  [MANUAL 05 // AVIONICS SKILLS & WORKFLOW PALETTE]
                </span>
                <span className="border border-[#1A1D1A] bg-[#FAF8F3] px-1.5 py-0.2 text-[10px] font-bold">
                  {filteredSkills.length} SKILLS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSkillPickerOpen(false)}
                className="px-2 py-0.5 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] font-bold cursor-pointer"
              >
                [ESC] CLOSE
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="p-3 bg-[#FAF8F3] border-b border-[#1A1D1A] flex items-center space-x-3">
              <span className="font-bold select-none">&gt;&gt;</span>
              <input
                ref={skillSearchInputRef}
                value={skillSearch}
                onChange={(e) => {
                  setSkillSearch(e.target.value);
                  setSelectedSkillIndex(0);
                }}
                placeholder="Search skills (e.g. diagram, cathrynlavery, deploy, rules, test)..."
                className="flex-1 bg-transparent text-[#1A1D1A] placeholder-[#888] focus:outline-none font-mono text-xs sm:text-sm"
                autoFocus
              />
              {skillSearch && (
                <button
                  type="button"
                  onClick={() => setSkillSearch('')}
                  className="px-2 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] text-[10px] font-bold cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Two-Column Split: Skill List & Active Skill Inspection */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Left Column: Skill List (5 cols) */}
              <div className="md:col-span-5 border-r border-[#1A1D1A] overflow-y-auto max-h-[55vh]">
                {filteredSkills.length === 0 ? (
                  <div className="p-6 text-center text-[#1A1D1A]/60 italic">
                    No skills matched "{skillSearch}".
                  </div>
                ) : (
                  filteredSkills.map((skill, idx) => {
                    const isSelected = idx === selectedSkillIndex;
                    return (
                      <div
                        key={skill.id}
                        onClick={() => setSelectedSkillIndex(idx)}
                        className={`p-2.5 border-b border-[#1A1D1A]/20 cursor-pointer transition-none flex items-start space-x-2.5 ${
                          isSelected
                            ? 'bg-[#1A1D1A] text-[#FAF8F3] font-bold'
                            : 'text-[#1A1D1A] hover:bg-[#EDE8DC]'
                        }`}
                      >
                        <span className="font-bold select-none mt-0.5">
                          {isSelected ? '▶' : ' '}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-[9px] uppercase px-1 py-0.2 border font-bold ${
                                isSelected
                                  ? 'bg-[#FAF8F3] text-[#1A1D1A] border-[#1A1D1A]'
                                  : 'bg-[#EDE8DC] text-[#1A1D1A] border-[#1A1D1A]'
                              }`}
                            >
                              {skill.category}
                            </span>
                            <span className="truncate text-xs font-bold">
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
              <div className="md:col-span-7 p-4 overflow-y-auto max-h-[55vh] flex flex-col justify-between space-y-3 bg-[#FAF8F3]">
                {activeSkill ? (
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="border-b border-[#1A1D1A] pb-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(activeSkill.category)}
                          <span className="font-bold text-sm">
                            {activeSkill.title}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-70 font-mono">
                          {activeSkill.version}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono mt-0.5">
                        IDENT: {activeSkill.name}
                      </div>

                      {activeSkill.repoUrl && (
                        <div className="mt-1">
                          <a
                            href={activeSkill.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs underline font-mono text-[#1A1D1A]"
                          >
                            <span>{activeSkill.repoUrl}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <div className="text-[10px] uppercase font-bold mb-1">
                        SPECIFICATION:
                      </div>
                      <p className="leading-relaxed text-xs">
                        {activeSkill.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="text-[10px] uppercase font-bold mb-1">
                        CAPABILITIES & KEYWORDS:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeSkill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Executable Sample Prompts */}
                    <div>
                      <div className="text-[10px] uppercase font-bold mb-1.5 flex justify-between">
                        <span>EXECUTABLE DIRECTIVES</span>
                        <span className="opacity-70">[CLICK TO DISPATCH]</span>
                      </div>
                      <div className="space-y-1.5">
                        {activeSkill.samplePrompts.map((prompt, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-2 border border-[#1A1D1A] bg-[#F2EFE9] hover:bg-[#EDE8DC] flex items-center justify-between group transition-colors"
                          >
                            <div className="flex items-center space-x-2 flex-1 pr-2 truncate">
                              <span className="font-bold select-none">
                                0{pIdx + 1} //
                              </span>
                              <span className="text-xs truncate">
                                {prompt}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopySkillPrompt(prompt)}
                                className="px-1.5 py-0.5 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[10px] font-bold cursor-pointer"
                                title="Insert into command prompt"
                              >
                                [EDIT]
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRunSkill(activeSkill, prompt)}
                                className="px-2 py-0.5 border border-[#1A1D1A] bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                                title="Dispatch immediately"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>[RUN]</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#1A1D1A]/60 italic">
                    Select a skill to inspect its specification.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#EDE8DC] border-t border-[#1A1D1A] px-4 py-2 flex items-center justify-between text-[#1A1D1A]/80">
              <div className="flex items-center space-x-4 text-[10px] font-bold">
                <span>[ENTER] RUN</span>
                <span>[TAB] COPY</span>
                <span>[↑/↓] NAVIGATE</span>
                <span>[ESC] CLOSE</span>
              </div>
              {activeSkill && (
                <button
                  type="button"
                  onClick={() => handleRunSkill(activeSkill)}
                  className="px-3 py-1 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] font-bold text-xs hover:bg-[#333] cursor-pointer"
                >
                  DISPATCH DIRECTIVE ▶
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
