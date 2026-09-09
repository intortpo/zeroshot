import React from 'react';
import { Wifi, Activity, GitGraph, Layers, Brain, Minus, X } from 'lucide-react';
import { NodeSpec } from '../types';

interface NodeMeshStatusProps {
  localNode: NodeSpec;
  peers: NodeSpec[];
  activeRunsCount: number;
  activeView: 'graph' | 'tracker';
  onViewChange: (view: 'graph' | 'tracker') => void;
  isDwdConfigured: boolean;
  onOpenDwdModal: () => void;
}

export const NodeMeshStatus: React.FC<NodeMeshStatusProps> = ({
  localNode,
  peers,
  activeRunsCount,
  activeView,
  onViewChange,
  isDwdConfigured,
  onOpenDwdModal,
}) => {
  return (
    <header
      data-tauri-drag-region
      className="bg-[#090909] border-b border-[#1c1c1c] px-4 py-2.5 flex items-center justify-between text-xs text-[#a3a3a3] select-none"
    >
      <div className="flex items-center space-x-3.5">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5 font-medium tracking-wide">
          <Brain className="w-4 h-4 text-[#e5e5e5] animate-pulse" />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold tracking-tight text-[#f5f5f5]">
              The Cognitive Core
            </span>
            <span className="hidden lg:inline text-[10px] font-mono text-[#737373]">
              (Continuous, Evolving Intelligence)
            </span>
          </div>
        </div>

        {/* Cognitive Thread Status */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-[#0e0e0e] border border-[#1f1f1f] px-2 py-0.5 rounded text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#525252]">RTX Thread:</span>
          <span className="text-[#a3a3a3]">Self-Scheduling</span>
        </div>

        {/* Local Node Tag */}
        <div className="hidden sm:flex items-center space-x-2 bg-[#0e0e0e] border border-[#1f1f1f] px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8e8e8e] animate-pulse" />
          <span className="text-[#525252]">Host:</span>
          <span className="text-[#e5e5e5] font-mono font-medium">{localNode.deviceName}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-medium ${
              localNode.role === 'rtx_host'
                ? 'bg-[#1a1a1a] text-[#d4d4d4] border border-[#2e2e2e]'
                : 'bg-[#141414] text-[#a3a3a3] border border-[#262626]'
            }`}
          >
            {localNode.role}
          </span>
          {localNode.hasRtx && localNode.vramFreeMb !== undefined && (
            <span className="text-[#737373] text-[11px] font-mono">
              VRAM: <span className="text-[#e5e5e5]">{Math.round(localNode.vramFreeMb / 1024)}GB</span>
            </span>
          )}
        </div>
      </div>

      {/* Desktop Workspace View Switcher */}
      <div className="hidden md:flex items-center space-x-1 bg-[#0c0c0c] p-0.5 rounded-md border border-[#1c1c1c]">
        <button
          onClick={() => onViewChange('tracker')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-mono transition-all ${
            activeView === 'tracker'
              ? 'bg-[#1c1c1c] text-[#f5f5f5] border border-[#2e2e2e] shadow-sm'
              : 'text-[#737373] hover:text-[#d4d4d4]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Project Tracker</span>
        </button>

        <button
          onClick={() => onViewChange('graph')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-mono transition-all ${
            activeView === 'graph'
              ? 'bg-[#1c1c1c] text-[#f5f5f5] border border-[#2e2e2e] shadow-sm'
              : 'text-[#737373] hover:text-[#d4d4d4]'
          }`}
        >
          <GitGraph className="w-3.5 h-3.5" />
          <span>Cognitive Topology</span>
        </button>
      </div>

      {/* Right Controls: Google DWD + Mesh Peers + Window Controls */}
      <div className="flex items-center space-x-2">
        {/* Google Workspace DWD Trigger */}
        <button
          onClick={onOpenDwdModal}
          className="flex items-center space-x-1.5 bg-[#0e0e0e] hover:bg-[#141414] border border-[#1f1f1f] hover:border-[#2e2e2e] px-2.5 py-1 rounded-md transition-colors font-mono text-[11px]"
          title="Configure Google Workspace Domain-Wide Delegation (DWD) & 6 Use Cases"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDwdConfigured ? 'bg-emerald-500' : 'bg-[#737373]'
            }`}
          />
          <span className="text-[#a3a3a3]">Google DWD</span>
        </button>

        <div className="flex items-center space-x-1.5 bg-[#0e0e0e] border border-[#1f1f1f] px-2.5 py-1 rounded-md">
          <Wifi className="w-3.5 h-3.5 text-[#737373]" />
          <span className="text-[#525252]">Peers:</span>
          <span className="text-[#e5e5e5] font-mono font-medium">{peers.length}</span>
        </div>

        {/* Active Runs */}
        <div className="flex items-center space-x-1.5 bg-[#0e0e0e] border border-[#1f1f1f] px-2.5 py-1 rounded-md">
          <Activity className="w-3.5 h-3.5 text-[#737373]" />
          <span className="text-[#525252]">Jobs:</span>
          <span className="text-[#e5e5e5] font-mono font-medium">{activeRunsCount}</span>
        </div>

        {/* Minimal Frameless Window Controls */}
        <div className="hidden sm:flex items-center space-x-1 pl-1.5 border-l border-[#1f1f1f]">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize());
              }
            }}
            className="p-1 text-[#737373] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().close());
              }
            }}
            className="p-1 text-[#737373] hover:text-[#fca5a5] hover:bg-[#2b1818] rounded transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
