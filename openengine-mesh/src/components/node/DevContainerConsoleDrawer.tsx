import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Play,
  Square,
  RefreshCw,
  Terminal,
  Send,
  Trash2,
} from 'lucide-react';
import { DevContainerInfo } from '../../types';
import {
  getDevContainerStatus,
  startDevContainer,
  stopDevContainer,
  execInDevContainer,
  getDevContainerLogs,
} from '../../services/devcontainerService';

interface DevContainerConsoleDrawerProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const DevContainerConsoleDrawer: React.FC<DevContainerConsoleDrawerProps> = ({
  isOpen,
  onClose: _onClose,
}) => {
  const [status, setStatus] = useState<DevContainerInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [inputCmd, setInputCmd] = useState<string>('python3 -c "import sys; print(sys.version)"');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => {
      setActionToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const refreshTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const [s, l] = await Promise.all([
        getDevContainerStatus(),
        getDevContainerLogs(50),
      ]);
      setStatus(s);
      setLogs(l);
    } catch (err: any) {
      console.warn('DevContainer refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshTelemetry();
    }
  }, [isOpen]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleStartContainer = async () => {
    showToast('Starting DevContainer...');
    const res = await startDevContainer();
    if (res.success) {
      showToast('DevContainer started successfully!');
    } else {
      showToast(`Startup notice: ${res.stderr || 'Using host sandbox'}`);
    }
    await refreshTelemetry();
  };

  const handleStopContainer = async () => {
    showToast('Stopping DevContainer...');
    await stopDevContainer();
    showToast('DevContainer stopped');
    await refreshTelemetry();
  };

  const handleRunCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim() || isExecuting) return;

    const cmd = inputCmd.trim();
    setIsExecuting(true);
    setLogs((prev) => [...prev, `$ ${cmd}`]);

    try {
      const res = await execInDevContainer(cmd, status?.container_id);
      if (res.stdout) {
        setLogs((prev) => [...prev, res.stdout]);
      }
      if (res.stderr) {
        setLogs((prev) => [...prev, `[stderr] ${res.stderr}`]);
      }
      setLogs((prev) => [
        ...prev,
        `[process exited with code ${res.exit_code} (${res.duration_ms}ms) · target: ${res.execution_target}]`,
      ]);
    } catch (err: any) {
      setLogs((prev) => [...prev, `[exec error] ${err?.message || String(err)}`]);
    } finally {
      setIsExecuting(false);
      setInputCmd('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex-1 flex flex-col bg-stone-900 text-stone-100 font-mono text-xs overflow-hidden border-t border-stone-800 animate-in fade-in duration-150">
      {/* Container Status Bar */}
      <div className="px-5 py-3 border-b border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between gap-3 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">Zero-Petri DevContainer</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium flex items-center space-x-1 ${
                  status?.state === 'running'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status?.state === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="uppercase">{status?.state || 'stopped'}</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {status?.engine || 'docker'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Isolated Python 3.11 agent environment with pre-configured dev runtime
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {actionToast && (
            <span className="text-[11px] font-sans text-[#0ABAB5] animate-in fade-in">
              {actionToast}
            </span>
          )}

          <button
            type="button"
            onClick={handleStartContainer}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Start container via docker compose"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start</span>
          </button>

          <button
            type="button"
            onClick={handleStopContainer}
            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Stop running container"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop</span>
          </button>

          <button
            type="button"
            onClick={refreshTelemetry}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
            title="Refresh container telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setLogs([])}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 border border-stone-700 transition-colors cursor-pointer"
            title="Clear console logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Port Forwards & Container Telemetry Quick Info */}
      <div className="px-5 py-2 bg-stone-950/40 border-b border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-sans">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="text-stone-500 font-mono">Ports:</span>
            <span className="text-stone-300 font-mono">5173 · 8000 · 8080 · 8787</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="text-stone-500 font-mono">Mount:</span>
            <span className="text-stone-300 font-mono">/workspace (.devcontainer)</span>
          </span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[10px]">
          <span className="text-emerald-400">● Zero Data Egress</span>
          <span className="text-stone-500">|</span>
          <span>Fail-Closed Sandbox Ready</span>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 bg-stone-950/90 text-stone-300">
        {logs.map((line, idx) => {
          const isCmd = line.startsWith('$');
          const isErr = line.includes('error') || line.includes('stderr') || line.includes('FAIL');
          const isOk = line.includes('success') || line.includes('PASS') || line.includes('ready');
          return (
            <div
              key={idx}
              className={`${
                isCmd
                  ? 'text-cyan-400 font-semibold pt-1'
                  : isErr
                  ? 'text-rose-400'
                  : isOk
                  ? 'text-emerald-400'
                  : 'text-stone-300'
              }`}
            >
              {line}
            </div>
          );
        })}
        <div ref={logsEndRef} />
      </div>

      {/* Interactive Command Input */}
      <form onSubmit={handleRunCommand} className="p-3 bg-stone-900 border-t border-stone-800 flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-stone-500 pl-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400">$</span>
        </div>
        <input
          type="text"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          placeholder="Execute python script or shell command in devcontainer..."
          className="flex-1 bg-stone-950 border border-stone-700/80 rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          disabled={isExecuting || !inputCmd.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-stone-950 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>{isExecuting ? 'Running...' : 'Exec'}</span>
        </button>
      </form>
    </div>
  );
};
