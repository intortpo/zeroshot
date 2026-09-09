import React from 'react';
import { Wifi, Activity, Minus, X, FolderGit2, ChevronDown } from 'lucide-react';
import { NodeSpec, Workspace } from '../types';

interface NodeMeshStatusProps {
  localNode: NodeSpec;
  peers: NodeSpec[];
  activeRunsCount: number;
  isDwdConfigured: boolean;
  onOpenDwdModal: () => void;
  activeWorkspace?: Workspace;
  onOpenWorkspaceModal: () => void;
}

export const NodeMeshStatus: React.FC<NodeMeshStatusProps> = ({
  localNode,
  peers,
  activeRunsCount,
  isDwdConfigured,
  onOpenDwdModal,
  activeWorkspace,
  onOpenWorkspaceModal,
}) => {
  return (
    <header
      data-tauri-drag-region
      className="bg-[#090909]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-[#a3a3a3] select-none z-30"
    >
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2 font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-mono font-bold tracking-tight text-[#f5f5f5]">
            Petri
          </span>
        </div>

        {/* Workspace Switcher Trigger */}
        <button
          onClick={onOpenWorkspaceModal}
          className="flex items-center space-x-2 bg-[#121212]/90 hover:bg-[#1c1c1c] border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-lg transition-all text-[#e5e5e5] group"
          title="Switch active workspace"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-[#888888] group-hover:text-white transition-colors" />
          <span className="font-mono text-[11px] font-semibold text-[#f5f5f5]">
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronDown className="w-3 h-3 text-[#666666] group-hover:text-[#aaaaaa] transition-colors" />
        </button>

        {/* Local Node Tag */}
        <div className="hidden md:flex items-center space-x-2 bg-[#0e0e0e]/90 border border-white/5 px-2.5 py-1 rounded-md">
          <span className="text-[#525252] text-[10px] font-mono">HOST:</span>
          <span className="text-[#e5e5e5] font-mono font-medium text-[11px]">{localNode.deviceName}</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-medium ${
              localNode.role === 'rtx_host'
                ? 'bg-[#1a1a1a] text-[#d4d4d4] border border-[#2e2e2e]'
                : 'bg-[#141414] text-[#a3a3a3] border border-[#262626]'
            }`}
          >
            {localNode.role}
          </span>
          {localNode.hasRtx && localNode.vramFreeMb !== undefined && (
            <span className="text-[#737373] text-[10px] font-mono">
              VRAM: <span className="text-[#e5e5e5]">{Math.round(localNode.vramFreeMb / 1024)}GB</span>
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Google DWD + Mesh Peers + Window Controls */}
      <div className="flex items-center space-x-2">
        {/* Google Workspace DWD Trigger */}
        <button
          onClick={onOpenDwdModal}
          className="flex items-center space-x-1.5 bg-[#0e0e0e]/90 hover:bg-[#141414] border border-white/5 hover:border-white/10 px-2.5 py-1 rounded-md transition-colors font-mono text-[11px]"
          title="Google Workspace Domain-Wide Delegation (.json)"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDwdConfigured ? 'bg-emerald-400' : 'bg-[#525252]'
            }`}
          />
          <span className="text-[#a3a3a3]">Google DWD</span>
        </button>

        <div className="flex items-center space-x-1.5 bg-[#0e0e0e]/90 border border-white/5 px-2.5 py-1 rounded-md text-[11px] font-mono">
          <Wifi className="w-3 h-3 text-[#737373]" />
          <span className="text-[#525252]">Peers:</span>
          <span className="text-[#e5e5e5] font-medium">{peers.length}</span>
        </div>

        {/* Active Runs */}
        <div className="flex items-center space-x-1.5 bg-[#0e0e0e]/90 border border-white/5 px-2.5 py-1 rounded-md text-[11px] font-mono">
          <Activity className="w-3 h-3 text-[#737373]" />
          <span className="text-[#525252]">Jobs:</span>
          <span className="text-[#e5e5e5] font-medium">{activeRunsCount}</span>
        </div>

        {/* Minimal Frameless Window Controls */}
        <div className="hidden sm:flex items-center space-x-1 pl-1.5 border-l border-white/5">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize());
              }
            }}
            className="p-1 text-[#737373] hover:text-[#f5f5f5] hover:bg-white/5 rounded transition-colors"
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
            className="p-1 text-[#737373] hover:text-[#fca5a5] hover:bg-rose-950/60 rounded transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
