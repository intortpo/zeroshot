import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Copy, Check, Sparkles, Zap, ShieldCheck, Database, GitBranch, Cpu } from 'lucide-react';
import { executeEccCli, EccCommandOutput } from './eccCliEngine';

interface EccTerminalConsoleProps {
  onPlanGenerated?: (goalText: string) => void;
  className?: string;
  initialCommand?: string;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: EccCommandOutput;
  timestamp: number;
}

const QUICK_COMMANDS = [
  { label: 'ecc memory doctor', cmd: 'ecc memory doctor', icon: <Database className="w-3 h-3 text-amber-500" /> },
  { label: 'ecc optimize tokens', cmd: 'ecc optimize tokens', icon: <Zap className="w-3 h-3 text-emerald-500" /> },
  { label: 'ecc eval pass@k', cmd: 'ecc eval', icon: <ShieldCheck className="w-3 h-3 text-indigo-500" /> },
  { label: 'ecc plan "SQLite WAL"', cmd: 'ecc plan Implement bounded SQLite WAL and event ledger queues', icon: <Sparkles className="w-3 h-3 text-[#0ABAB5]" /> },
  { label: 'ecc memory handoff', cmd: 'ecc memory handoff', icon: <Cpu className="w-3 h-3 text-purple-500" /> },
  { label: 'ecc worktree', cmd: 'ecc worktree', icon: <GitBranch className="w-3 h-3 text-stone-500" /> },
];

export const EccTerminalConsole: React.FC<EccTerminalConsoleProps> = ({
  onPlanGenerated,
  className = '',
  initialCommand = 'ecc memory doctor',
}) => {
  const [inputCmd, setInputCmd] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Run initial welcome command
  useEffect(() => {
    let mounted = true;
    const runInitial = async () => {
      setIsExecuting(true);
      const res = await executeEccCli(initialCommand);
      if (mounted) {
        setHistory([
          {
            id: `cmd-init`,
            command: initialCommand,
            output: res,
            timestamp: Date.now(),
          },
        ]);
        setIsExecuting(false);
      }
    };
    runInitial();
    return () => {
      mounted = false;
    };
  }, [initialCommand]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isExecuting]);

  const handleRunCommand = async (cmdToRun?: string) => {
    const rawCmd = (cmdToRun || inputCmd).trim();
    if (!rawCmd || isExecuting) return;

    setIsExecuting(true);
    setInputCmd('');
    setHistoryIndex(-1);

    const output = await executeEccCli(rawCmd);

    const newItem: CommandHistoryItem = {
      id: `cmd-${Date.now()}`,
      command: rawCmd,
      output,
      timestamp: Date.now(),
    };

    setHistory((prev) => [...prev, newItem]);
    setIsExecuting(false);

    // If command was plan, trigger callback to update plan canvas
    if (rawCmd.toLowerCase().includes('plan')) {
      const goal = rawCmd.replace(/^ecc\s+plan\s*/i, '').replace(/^"|"$/g, '').trim();
      if (goal) {
        onPlanGenerated?.(goal);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      const targetItem = history[history.length - 1 - nextIdx];
      if (targetItem) {
        setInputCmd(targetItem.command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        const targetItem = history[history.length - 1 - nextIdx];
        if (targetItem) {
          setInputCmd(targetItem.command);
        }
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCmd('');
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  return (
    <div className={`flex flex-col bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-xl overflow-hidden font-mono text-xs ${className}`}>
      {/* Top Bar */}
      <div className="px-4 py-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center space-x-2 pl-2">
            <Terminal className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span className="font-bold text-stone-200">ECC Native CLI Terminal</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-emerald-400 border border-stone-700">
              Bundled Android/Desktop
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-stone-400">
          <button
            type="button"
            onClick={() => setHistory([])}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="px-4 py-2 bg-stone-900/90 border-b border-stone-800/80 flex flex-wrap items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Quick:</span>
        {QUICK_COMMANDS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleRunCommand(item.cmd)}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700/80 text-stone-300 text-[11px] flex items-center space-x-1.5 border border-stone-700/60 transition-colors cursor-pointer"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px] min-h-[220px]">
        {history.map((item) => {
          const isError = item.output.exit_code !== 0;

          return (
            <div key={item.id} className="space-y-1.5 animate-in fade-in duration-150">
              {/* Command Prompt Line */}
              <div className="flex items-center justify-between text-stone-400 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-[#0ABAB5] font-bold">petri:ecc$</span>
                  <span className="text-white font-medium">{item.command}</span>
                </div>
                <div className="flex items-center space-x-2 text-[10px]">
                  <span>{item.output.duration_ms}ms</span>
                  <span>·</span>
                  <span className={isError ? 'text-rose-400' : 'text-emerald-400'}>
                    code {item.output.exit_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.output.stdout || item.output.stderr)}
                    className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors ml-1"
                    title="Copy Output"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Output */}
              {item.output.stdout && (
                <pre className="p-3 rounded-xl bg-stone-950/90 text-stone-200 border border-stone-800/80 whitespace-pre-wrap font-mono text-[11px] leading-relaxed overflow-x-auto">
                  {item.output.stdout}
                </pre>
              )}

              {item.output.stderr && (
                <pre className="p-3 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-900/60 whitespace-pre-wrap font-mono text-[11px] leading-relaxed overflow-x-auto">
                  {item.output.stderr}
                </pre>
              )}
            </div>
          );
        })}

        {isExecuting && (
          <div className="flex items-center space-x-2 text-stone-400 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#0ABAB5] animate-ping" />
            <span>Executing ECC native routine...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Prompt Box */}
      <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center space-x-2">
        <span className="text-[#0ABAB5] font-bold select-none pl-1">petri:ecc$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ecc <plan|memory|optimize|eval|worktree|subagents> [args]"
          disabled={isExecuting}
          className="flex-1 bg-transparent text-white text-xs font-mono placeholder:text-stone-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleRunCommand()}
          disabled={!inputCmd.trim() || isExecuting}
          className="px-3 py-1.5 rounded-lg bg-[#0ABAB5] hover:bg-[#099995] disabled:opacity-40 text-white text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>Run</span>
        </button>
      </div>
    </div>
  );
};
