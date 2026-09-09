import React from 'react';
import {
  Wifi,
  Activity,
  Minus,
  X,
  FolderGit2,
  ChevronDown,
  Kanban,
  Sparkles,
  Brain,
  BarChart3,
  User,
} from 'lucide-react';
import { NodeSpec, Workspace, UserProfile } from '../types';

interface NodeMeshStatusProps {
  localNode: NodeSpec;
  peers: NodeSpec[];
  activeRunsCount: number;
  isDwdConfigured: boolean;
  onOpenDwdModal: () => void;
  activeWorkspace?: Workspace;
  onOpenWorkspaceModal: () => void;
  activeUser?: UserProfile;
  onOpenUserModal: () => void;
  currentView: 'board' | 'skills' | 'memory' | 'stats';
  onSelectView: (view: 'board' | 'skills' | 'memory' | 'stats') => void;
}

export const NodeMeshStatus: React.FC<NodeMeshStatusProps> = ({
  localNode,
  peers,
  activeRunsCount,
  isDwdConfigured,
  onOpenDwdModal,
  activeWorkspace,
  onOpenWorkspaceModal,
  activeUser,
  onOpenUserModal,
  currentView,
  onSelectView,
}) => {
  return (
    <header
      data-tauri-drag-region
      className="bg-[#080808]/90 backdrop-blur-2xl border-b border-white/[0.06] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-zinc-400 select-none z-30 font-sans"
    >
      {/* Left: Logo, Workspace Switcher, User Identity Switcher */}
      <div className="flex items-center space-x-3 sm:space-x-3.5">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2 font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-mono font-bold tracking-tight text-zinc-100">
            Petri
          </span>
        </div>

        {/* User Identity Switcher */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center space-x-2 bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/[0.08] hover:border-white/[0.15] px-2.5 py-1 rounded-xl transition-all text-zinc-200 group"
          title="Switch User & Identity"
        >
          <User className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          <span className="font-mono text-[11px] font-medium text-zinc-100">
            {activeUser?.name.split(' ')[0] || 'User'}
          </span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/50 text-zinc-400 border border-white/[0.04]">
            {activeUser?.role.replace('_', ' ') || 'owner'}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </button>

        {/* Workspace Switcher Trigger */}
        <button
          onClick={onOpenWorkspaceModal}
          className="hidden sm:flex items-center space-x-2 bg-zinc-900/60 hover:bg-zinc-800/60 border border-white/[0.06] hover:border-white/[0.12] px-2.5 py-1 rounded-xl transition-all text-zinc-300 group"
          title="Switch active workspace"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span className="font-mono text-[11px] text-zinc-300">
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>

        {/* Local Node Tag */}
        <div className="hidden lg:flex items-center space-x-2 bg-zinc-900/60 border border-white/[0.06] px-2.5 py-1 rounded-xl">
          <span className="text-zinc-500 text-[10px] font-mono">HOST:</span>
          <span className="text-zinc-200 font-mono text-[11px]">{localNode.deviceName}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-black/40 text-zinc-400 border border-white/[0.04]">
            {localNode.role}
          </span>
          {localNode.hasRtx && localNode.vramFreeMb !== undefined && (
            <span className="text-zinc-500 text-[10px] font-mono">
              VRAM: <span className="text-zinc-200">{Math.round(localNode.vramFreeMb / 1024)}GB</span>
            </span>
          )}
        </div>
      </div>

      {/* Center: Main Enterprise View Navigation */}
      <div className="flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-2xl border border-white/[0.06]">
        <button
          onClick={() => onSelectView('board')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'board'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-white/[0.08]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Board</span>
        </button>

        <button
          onClick={() => onSelectView('skills')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'skills'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-white/[0.08]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Skills</span>
        </button>

        <button
          onClick={() => onSelectView('memory')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'memory'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-white/[0.08]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-amber-400" />
          <span>Memory</span>
        </button>

        <button
          onClick={() => onSelectView('stats')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'stats'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-white/[0.08]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stats</span>
        </button>
      </div>

      {/* Right Controls: Google DWD + Mesh Peers + Window Controls */}
      <div className="flex items-center space-x-2">
        {/* Google Workspace DWD Trigger */}
        <button
          onClick={onOpenDwdModal}
          className="flex items-center space-x-1.5 bg-zinc-900/60 hover:bg-zinc-800/70 border border-white/[0.06] hover:border-white/[0.1] px-2.5 py-1 rounded-xl transition-colors font-mono text-[11px]"
          title="Google Workspace Domain-Wide Delegation (.json)"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDwdConfigured ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
          />
          <span className="text-zinc-400">Google DWD</span>
        </button>

        <div className="hidden md:flex items-center space-x-1.5 bg-zinc-900/60 border border-white/[0.06] px-2.5 py-1 rounded-xl text-[11px] font-mono">
          <Wifi className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-500">Peers:</span>
          <span className="text-zinc-300 font-medium">{peers.length}</span>
        </div>

        {/* Active Runs */}
        <div className="flex items-center space-x-1.5 bg-zinc-900/60 border border-white/[0.06] px-2.5 py-1 rounded-xl text-[11px] font-mono">
          <Activity className="w-3 h-3 text-zinc-500" />
          <span className="text-zinc-500">Jobs:</span>
          <span className="text-zinc-300 font-medium">{activeRunsCount}</span>
        </div>

        {/* Minimal Frameless Window Controls */}
        <div className="hidden sm:flex items-center space-x-1 pl-1.5 border-l border-white/[0.06]">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize());
              }
            }}
            className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg transition-colors"
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
            className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
