import React, { useState, useRef, useEffect } from 'react';
import {
  Minus,
  X,
  ChevronDown,
  Kanban,
  Sparkles,
  Brain,
  BarChart3,
  Terminal,
  Sliders,
  Disc,
  Workflow,
  MessageSquare,
  Boxes,
  Network,
  Eye,
} from 'lucide-react';
import { NodeSpec, Workspace, UserProfile, PetriViewMode } from '../types';

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
  currentView: PetriViewMode;
  onSelectView: (view: PetriViewMode) => void;
  isPreviewOpen?: boolean;
  onTogglePreview?: () => void;
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
  isPreviewOpen = false,
  onTogglePreview,
}) => {
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  const modulesMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modulesMenuRef.current && !modulesMenuRef.current.contains(event.target as Node)) {
        setIsModulesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isModuleActive = currentView === 'zero' || currentView === 'skills' || currentView === 'memory';

  return (
    <header
      data-tauri-drag-region
      className="bg-white/40 backdrop-blur-2xl border-b border-stone-200/60 px-6 sm:px-10 py-3.5 flex items-center justify-between text-sm z-30 font-sans"
    >
      {/* Left: Brand, Breadcrumbs, User & Workspace (Flat, No Rounded Boxes) */}
      <div className="flex items-center space-x-4">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#0ABAB5]" />
          <span className="text-base font-sans font-semibold tracking-tight text-stone-900">
            Petri
          </span>
        </div>

        <span className="text-stone-300 font-light">/</span>

        {/* User Identity (Flat Link, No Box) */}
        <button
          onClick={onOpenUserModal}
          className="flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 transition-colors font-sans text-xs font-normal py-1 group"
          title="Switch User & Identity"
        >
          <span className="font-medium text-stone-800">{activeUser?.name.split(' ')[0] || 'User'}</span>
          <span className="text-stone-400">({activeUser?.role.replace('_', ' ') || 'owner'})</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>

        <span className="text-stone-300 font-light">/</span>

        {/* Workspace Switcher (Flat Link, No Box) */}
        <button
          onClick={onOpenWorkspaceModal}
          className="hidden sm:flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 transition-colors font-sans text-xs py-1 group"
          title="Switch active workspace"
        >
          <span className="font-medium text-stone-900">{activeWorkspace?.name || 'zero-petri'}</span>
          <span className="text-stone-400 font-sans">@main</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>

        {/* Host Spec (Subtle Text, No Box) */}
        <div className="hidden xl:flex items-center space-x-2 text-stone-400 text-xs font-sans pl-2">
          <span>·</span>
          <span>{localNode.deviceName}</span>
        </div>
      </div>

      {/* Center: Main Enterprise View Navigation (Flat Tabs, No Rounded Box Container) */}
      <nav className="flex items-center space-x-6 sm:space-x-8">
        <button
          onClick={() => onSelectView('chat')}
          className={`flex items-center space-x-2 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
            currentView === 'chat'
              ? 'border-stone-900 text-stone-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
          }`}
        >
          <MessageSquare className={`w-4 h-4 ${currentView === 'chat' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Chat</span>
        </button>

        <button
          onClick={() => onSelectView('board')}
          className={`flex items-center space-x-2 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
            currentView === 'board'
              ? 'border-stone-900 text-stone-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
          }`}
        >
          <Kanban className={`w-4 h-4 ${currentView === 'board' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Board</span>
        </button>

        <button
          onClick={() => onSelectView('graph')}
          className={`flex items-center space-x-2 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
            currentView === 'graph'
              ? 'border-stone-900 text-stone-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
          }`}
        >
          <Workflow className={`w-4 h-4 ${currentView === 'graph' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Graph</span>
        </button>

        <button
          onClick={() => onSelectView('node')}
          className={`flex items-center space-x-1.5 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
            currentView === 'node'
              ? 'border-stone-900 text-stone-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
          }`}
          title="Node Studio Pipeline Engine & DevContainer"
        >
          <Network className={`w-4 h-4 ${currentView === 'node' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Node</span>
          <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
            Studio
          </span>
        </button>

        {/* Modules Dropdown Menu Group */}
        <div className="relative" ref={modulesMenuRef}>
          <button
            onClick={() => setIsModulesMenuOpen(!isModulesMenuOpen)}
            className={`flex items-center space-x-1.5 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
              isModuleActive
                ? 'border-stone-900 text-stone-950 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
            }`}
          >
            <Boxes className={`w-4 h-4 ${isModuleActive ? 'text-stone-900' : 'text-stone-400'}`} />
            <span>Modules</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isModulesMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isModulesMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-60 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <button
                onClick={() => {
                  onSelectView('zero');
                  setIsModulesMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  currentView === 'zero'
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Disc className="w-4 h-4 text-[#FF5F1F]" />
                <div>
                  <div className="text-xs font-semibold">Zero Game Studio</div>
                  <div className="text-[10px] text-stone-400 font-normal">Bevy 0.15 & Avian Physics</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectView('skills');
                  setIsModulesMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  currentView === 'skills'
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-semibold">Skills Catalog</div>
                  <div className="text-[10px] text-stone-400 font-normal">ECC Unified-Memory & Diagram</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectView('memory');
                  setIsModulesMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  currentView === 'memory'
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Brain className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="text-xs font-semibold">Memory Explorer</div>
                  <div className="text-[10px] text-stone-400 font-normal">Vault Scopes & Vector Store</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onSelectView('stats')}
          className={`flex items-center space-x-2 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
            currentView === 'stats'
              ? 'border-stone-900 text-stone-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${currentView === 'stats' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Stats</span>
        </button>

        <button
          onClick={() => onSelectView('tui')}
          className={`flex items-center space-x-2 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
            currentView === 'tui'
              ? 'border-stone-900 text-stone-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>TUI</span>
        </button>

        <button
          onClick={() => onSelectView('settings')}
          className={`flex items-center space-x-2 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
            currentView === 'settings'
              ? 'border-stone-900 text-stone-950 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
          }`}
        >
          <Sliders className={`w-4 h-4 ${currentView === 'settings' ? 'text-stone-900' : 'text-stone-400'}`} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Right Controls: Flat Indicators & Actions (No Rounded Boxes) */}
      <div className="flex items-center space-x-5 text-xs font-sans">
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

        {/* Live Project Preview & Agentation Trigger */}
        {onTogglePreview && (
          <button
            type="button"
            onClick={onTogglePreview}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
              isPreviewOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border-stone-200'
            }`}
            title="Toggle Live Web Preview & Agentation Visual Feedback"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-medium">Preview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        )}

        {/* Peers Count */}
        <div className="hidden md:flex items-center space-x-1.5 text-stone-500 font-sans">
          <span>Peers:</span>
          <span className="text-stone-800 font-semibold">{peers.length}</span>
        </div>

        {/* Active Jobs */}
        <div className="flex items-center space-x-1.5 text-stone-500 font-sans">
          {activeRunsCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F1F] animate-pulse" />
          )}
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
