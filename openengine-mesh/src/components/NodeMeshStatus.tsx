import React from 'react';
import {
  Minus,
  X,
  ChevronDown,
  Kanban,
  Sparkles,
  Brain,
  BarChart3,
  Terminal,
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
      className="bg-white/40 backdrop-blur-2xl border-b border-stone-200/60 px-6 sm:px-10 py-3.5 flex items-center justify-between text-sm select-none z-30 font-sans"
    >
      {/* Left: Brand, Breadcrumbs, User & Workspace (Flat, No Rounded Boxes) */}
      <div className="flex items-center space-x-4">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
          <span className="text-lg font-mono font-bold tracking-tight text-stone-900">
            Petri
          </span>
        </div>

        <span className="text-stone-300 font-light">/</span>

        {/* User Identity (Flat Link, No Box) */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center space-x-1.5 text-stone-700 hover:text-stone-950 transition-colors font-mono text-xs font-semibold py-1 group"
          title="Switch User & Identity"
        >
          <span>{activeUser?.name.split(' ')[0] || 'User'}</span>
          <span className="text-stone-400 font-normal">({activeUser?.role.replace('_', ' ') || 'owner'})</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
        </button>

        <span className="text-stone-300 font-light">/</span>

        {/* Workspace Switcher (Flat Link, No Box) */}
        <button
          onClick={onOpenWorkspaceModal}
          className="hidden sm:flex items-center space-x-1.5 text-stone-700 hover:text-stone-950 transition-colors font-mono text-xs font-medium py-1 group"
          title="Switch active workspace"
        >
          <span className="font-semibold text-stone-900">{activeWorkspace?.name || 'zero-petri'}</span>
          <span className="text-stone-400">@main</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
        </button>

        {/* Host Spec (Subtle Text, No Box) */}
        <div className="hidden xl:flex items-center space-x-2 text-stone-400 text-xs font-mono pl-2">
          <span>·</span>
          <span>{localNode.deviceName}</span>
          <span>(po)</span>
        </div>
      </div>

      {/* Center: Main Enterprise View Navigation (Flat Tabs, No Rounded Box Container) */}
      <nav className="flex items-center space-x-6 sm:space-x-8">
        <button
          onClick={() => onSelectView('board')}
          className={`flex items-center space-x-2 py-1 text-sm font-mono transition-all border-b-2 ${
            currentView === 'board'
              ? 'border-stone-900 text-stone-950 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <Kanban className={`w-4 h-4 ${currentView === 'board' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Board</span>
        </button>

        <button
          onClick={() => onSelectView('skills')}
          className={`flex items-center space-x-2 py-1 text-sm font-mono transition-all border-b-2 ${
            currentView === 'skills'
              ? 'border-stone-900 text-stone-950 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${currentView === 'skills' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Skills</span>
        </button>

        <button
          onClick={() => onSelectView('memory')}
          className={`flex items-center space-x-2 py-1 text-sm font-mono transition-all border-b-2 ${
            currentView === 'memory'
              ? 'border-stone-900 text-stone-950 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <Brain className={`w-4 h-4 ${currentView === 'memory' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Memory</span>
        </button>

        <button
          onClick={() => onSelectView('stats')}
          className={`flex items-center space-x-2 py-1 text-sm font-mono transition-all border-b-2 ${
            currentView === 'stats'
              ? 'border-stone-900 text-stone-950 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${currentView === 'stats' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Stats</span>
        </button>

        <button
          onClick={() => onSelectView('tui')}
          className={`flex items-center space-x-2 py-1 text-sm font-mono transition-all border-b-2 ${
            currentView === 'tui'
              ? 'border-stone-900 text-stone-950 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>TUI</span>
        </button>
      </nav>

      {/* Right Controls: Flat Indicators & Actions (No Rounded Boxes) */}
      <div className="flex items-center space-x-5 text-xs font-mono">
        {/* Google Workspace DWD Trigger */}
        <button
          onClick={onOpenDwdModal}
          className="flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 transition-colors font-medium"
          title="Google Workspace Domain-Wide Delegation (.json)"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isDwdConfigured ? 'bg-emerald-500' : 'bg-stone-400'
            }`}
          />
          <span>Google DWD</span>
        </button>

        {/* Peers Count */}
        <div className="hidden md:flex items-center space-x-1.5 text-stone-500">
          <span>Peers:</span>
          <span className="text-stone-800 font-semibold">{peers.length}</span>
        </div>

        {/* Active Jobs */}
        <div className="flex items-center space-x-1.5 text-stone-500">
          <span>Jobs:</span>
          <span className="text-stone-800 font-semibold">{activeRunsCount}</span>
        </div>

        {/* Frameless Window Controls */}
        <div className="hidden sm:flex items-center space-x-1 pl-3 border-l border-stone-200">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().minimize());
              }
            }}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/window').then(({ getCurrentWindow }) => getCurrentWindow().close());
              }
            }}
            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
