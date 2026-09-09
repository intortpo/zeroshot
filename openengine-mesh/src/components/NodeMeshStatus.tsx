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
      className="bg-white/60 backdrop-blur-2xl border-b border-stone-200/60 px-5 sm:px-8 py-3.5 flex items-center justify-between text-sm text-stone-600 select-none z-30 font-sans"
    >
      {/* Left: Logo, User Switcher, Workspace Switcher */}
      <div className="flex items-center space-x-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5 font-medium tracking-wide">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5]" />
          <span className="text-base font-mono font-bold tracking-tight text-stone-900">
            Petri
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-[#E0F7F6] text-[#0A7B76] border border-[#B4E8E4] font-semibold">
            ENTERPRISE
          </span>
        </div>

        {/* User Identity Switcher */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center space-x-2 bg-stone-100/70 hover:bg-stone-200/70 border border-stone-200/80 px-3 py-1.5 rounded-xl transition-all text-stone-800 group"
          title="Switch User & Identity"
        >
          <User className="w-4 h-4 text-stone-500 group-hover:text-stone-800 transition-colors" />
          <span className="font-mono text-xs font-semibold text-stone-900">
            {activeUser?.name.split(' ')[0] || 'User'}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white text-stone-600 border border-stone-200/80">
            {activeUser?.role.replace('_', ' ') || 'owner'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>

        {/* Workspace Switcher Trigger */}
        <button
          onClick={onOpenWorkspaceModal}
          className="hidden sm:flex items-center space-x-2 bg-stone-100/50 hover:bg-stone-200/60 border border-stone-200/80 px-3 py-1.5 rounded-xl transition-all text-stone-700 group"
          title="Switch active workspace"
        >
          <FolderGit2 className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
          <span className="font-mono text-xs font-medium text-stone-700">
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>

        {/* Local Node Tag */}
        <div className="hidden lg:flex items-center space-x-2 bg-stone-100/50 border border-stone-200/80 px-3 py-1.5 rounded-xl">
          <span className="text-stone-400 text-xs font-mono">HOST:</span>
          <span className="text-stone-800 font-mono text-xs font-medium">{localNode.deviceName}</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-white text-stone-600 border border-stone-200">
            {localNode.role}
          </span>
        </div>
      </div>

      {/* Center: Main Enterprise View Navigation */}
      <div className="flex items-center space-x-1 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80">
        <button
          onClick={() => onSelectView('board')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
            currentView === 'board'
              ? 'bg-white text-[#0A7B76] font-semibold border border-[#B4E8E4]'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Kanban className="w-4 h-4 text-[#0ABAB5]" />
          <span>Board</span>
        </button>

        <button
          onClick={() => onSelectView('skills')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
            currentView === 'skills'
              ? 'bg-white text-[#0A7B76] font-semibold border border-[#B4E8E4]'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#0ABAB5]" />
          <span>Skills</span>
        </button>

        <button
          onClick={() => onSelectView('memory')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
            currentView === 'memory'
              ? 'bg-white text-[#0A7B76] font-semibold border border-[#B4E8E4]'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Brain className="w-4 h-4 text-[#0ABAB5]" />
          <span>Memory</span>
        </button>

        <button
          onClick={() => onSelectView('stats')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
            currentView === 'stats'
              ? 'bg-white text-[#0A7B76] font-semibold border border-[#B4E8E4]'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#0ABAB5]" />
          <span>Stats</span>
        </button>

        <button
          onClick={() => onSelectView('tui')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
            currentView === 'tui'
              ? 'bg-stone-900 text-white font-semibold border border-stone-900'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>TUI</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Google Workspace DWD Trigger */}
        <button
          onClick={onOpenDwdModal}
          className="flex items-center space-x-2 bg-stone-100/70 hover:bg-stone-200/70 border border-stone-200/80 px-3 py-1.5 rounded-xl transition-colors font-mono text-xs"
          title="Google Workspace Domain-Wide Delegation (.json)"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isDwdConfigured ? 'bg-emerald-500' : 'bg-stone-400'
            }`}
          />
          <span className="text-stone-700 font-medium">Google DWD</span>
        </button>

        <div className="hidden md:flex items-center space-x-2 bg-stone-100/70 border border-stone-200/80 px-3 py-1.5 rounded-xl text-xs font-mono">
          <Wifi className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-400">Peers:</span>
          <span className="text-stone-800 font-semibold">{peers.length}</span>
        </div>

        {/* Active Runs */}
        <div className="flex items-center space-x-2 bg-stone-100/70 border border-stone-200/80 px-3 py-1.5 rounded-xl text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-[#0ABAB5]" />
          <span className="text-stone-400">Jobs:</span>
          <span className="text-stone-800 font-semibold">{activeRunsCount}</span>
        </div>

        {/* Minimal Frameless Window Controls */}
        <div className="hidden sm:flex items-center space-x-1 pl-2 border-l border-stone-200/80">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize());
              }
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().close());
              }
            }}
            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
