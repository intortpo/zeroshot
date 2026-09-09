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
  Terminal,
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
  currentView: 'board' | 'skills' | 'memory' | 'stats' | 'tui';
  onSelectView: (view: 'board' | 'skills' | 'memory' | 'stats' | 'tui') => void;
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
      className="bg-white/85 backdrop-blur-2xl border-b border-stone-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-stone-600 select-none z-30 font-sans shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      {/* Left: Logo, User Switcher, Workspace Switcher */}
      <div className="flex items-center space-x-3 sm:space-x-3.5">
        {/* Brand / Logo with soft Tiffany Pastel badge */}
        <div className="flex items-center space-x-2 font-medium tracking-wide">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5] animate-pulse" />
          <span className="text-sm font-mono font-bold tracking-tight text-stone-900">
            Petri
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#E0F7F6] text-[#0A7B76] border border-[#B4E8E4] font-medium">
            ENTERPRISE
          </span>
        </div>

        {/* User Identity Switcher */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center space-x-2 bg-stone-100/90 hover:bg-stone-200/80 border border-stone-200 hover:border-stone-300 px-2.5 py-1 rounded-xl transition-all text-stone-800 group shadow-sm"
          title="Switch User & Identity"
        >
          <User className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-800 transition-colors" />
          <span className="font-mono text-[11px] font-semibold text-stone-900">
            {activeUser?.name.split(' ')[0] || 'User'}
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white text-stone-600 border border-stone-200">
            {activeUser?.role.replace('_', ' ') || 'owner'}
          </span>
          <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>

        {/* Workspace Switcher Trigger */}
        <button
          onClick={onOpenWorkspaceModal}
          className="hidden sm:flex items-center space-x-2 bg-stone-100/60 hover:bg-stone-200/60 border border-stone-200 hover:border-stone-300 px-2.5 py-1 rounded-xl transition-all text-stone-700 group"
          title="Switch active workspace"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
          <span className="font-mono text-[11px] text-stone-700">
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>

        {/* Local Node Tag */}
        <div className="hidden lg:flex items-center space-x-2 bg-stone-100/60 border border-stone-200 px-2.5 py-1 rounded-xl">
          <span className="text-stone-400 text-[10px] font-mono">HOST:</span>
          <span className="text-stone-700 font-mono text-[11px]">{localNode.deviceName}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-white text-stone-500 border border-stone-200">
            {localNode.role}
          </span>
          {localNode.hasRtx && localNode.vramFreeMb !== undefined && (
            <span className="text-stone-400 text-[10px] font-mono">
              VRAM: <span className="text-stone-700">{Math.round(localNode.vramFreeMb / 1024)}GB</span>
            </span>
          )}
        </div>
      </div>

      {/* Center: Main Enterprise View Navigation (Board / Skills / Memory / Stats / TUI) */}
      <div className="flex items-center space-x-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200">
        <button
          onClick={() => onSelectView('board')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'board'
              ? 'bg-[#E0F7F6] text-[#0A7B76] font-semibold border border-[#B4E8E4] shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Kanban className="w-3.5 h-3.5 text-[#0ABAB5]" />
          <span>Board</span>
        </button>

        <button
          onClick={() => onSelectView('skills')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'skills'
              ? 'bg-[#E0F7F6] text-[#0A7B76] font-semibold border border-[#B4E8E4] shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0ABAB5]" />
          <span>Skills</span>
        </button>

        <button
          onClick={() => onSelectView('memory')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'memory'
              ? 'bg-[#E0F7F6] text-[#0A7B76] font-semibold border border-[#B4E8E4] shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-[#0ABAB5]" />
          <span>Memory</span>
        </button>

        <button
          onClick={() => onSelectView('stats')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'stats'
              ? 'bg-[#E0F7F6] text-[#0A7B76] font-semibold border border-[#B4E8E4] shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#0ABAB5]" />
          <span>Stats</span>
        </button>

        <button
          onClick={() => onSelectView('tui')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
            currentView === 'tui'
              ? 'bg-[#0ABAB5] text-white font-semibold border border-[#0A9E99] shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>TUI</span>
        </button>
      </div>

      {/* Right Controls: Google DWD + Mesh Peers + Window Controls */}
      <div className="flex items-center space-x-2">
        {/* Google Workspace DWD Trigger */}
        <button
          onClick={onOpenDwdModal}
          className="flex items-center space-x-1.5 bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 hover:border-stone-300 px-2.5 py-1 rounded-xl transition-colors font-mono text-[11px]"
          title="Google Workspace Domain-Wide Delegation (.json)"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDwdConfigured ? 'bg-emerald-500' : 'bg-stone-400'
            }`}
          />
          <span className="text-stone-600 font-medium">Google DWD</span>
        </button>

        <div className="hidden md:flex items-center space-x-1.5 bg-stone-100/80 border border-stone-200 px-2.5 py-1 rounded-xl text-[11px] font-mono">
          <Wifi className="w-3 h-3 text-stone-400" />
          <span className="text-stone-400">Peers:</span>
          <span className="text-stone-700 font-semibold">{peers.length}</span>
        </div>

        {/* Active Runs */}
        <div className="flex items-center space-x-1.5 bg-stone-100/80 border border-stone-200 px-2.5 py-1 rounded-xl text-[11px] font-mono">
          <Activity className="w-3 h-3 text-[#0ABAB5]" />
          <span className="text-stone-400">Jobs:</span>
          <span className="text-stone-700 font-semibold">{activeRunsCount}</span>
        </div>

        {/* Minimal Frameless Window Controls */}
        <div className="hidden sm:flex items-center space-x-1 pl-1.5 border-l border-stone-200">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize());
              }
            }}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
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
            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
