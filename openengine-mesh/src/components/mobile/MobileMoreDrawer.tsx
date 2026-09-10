import React from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Brain,
  Sparkles,
  Terminal,
  Eye,
  Disc,
  Sliders,
  FolderGit2,
  User,
  Key,
  Cpu,
  BarChart3,
  ChevronRight,
  GraduationCap,
  Database,
  Kanban,
  Network,
  Palette,
  Video,
  Mic,
  Activity,
  Coins,
  Server,
  Clock,
} from 'lucide-react';
import { PetriViewMode, UserProfile, Workspace } from '../../types';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: PetriViewMode;
  onSelectView: (view: PetriViewMode) => void;
  activeUser?: UserProfile;
  activeWorkspace?: Workspace;
  onOpenUserModal: () => void;
  onOpenWorkspaceModal: () => void;
  onOpenDwdModal: () => void;
  onOpenAiProviderModal: () => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  activeUser,
  activeWorkspace,
  onOpenUserModal,
  onOpenWorkspaceModal,
  onOpenDwdModal,
  onOpenAiProviderModal,
}) => {
  if (!isOpen) return null;

  const handleNavigate = (view: PetriViewMode) => {
    onSelectView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Card */}
      <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl border-t border-stone-200 space-y-5 animate-in slide-in-from-bottom-8 duration-200 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {/* Header handle & close */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <h3 className="text-sm font-bold text-stone-900 font-sans">Petri Zero Navigation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User & Workspace Quick Bar */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenWorkspaceModal();
            }}
            className="p-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-stone-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono text-stone-400 uppercase">Workspace</div>
              <div className="font-bold text-stone-900 truncate">{activeWorkspace?.name || 'zero-petri'}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUserModal();
            }}
            className="p-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono text-stone-400 uppercase">Operator</div>
              <div className="font-bold text-stone-900 truncate">{activeUser?.name || 'Hideo'}</div>
            </div>
          </button>
        </div>

        {/* Categorized Navigation Sections */}
        <div className="space-y-4">
          {/* 1. Development */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-stone-400 px-1 font-semibold">Development</div>

            <button
              type="button"
              onClick={() => handleNavigate('focus')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'focus'
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Focus Chat</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-100 text-indigo-800">Zen</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Steerable Thinking & Prompt Cloud</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('chat')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'chat' || currentView === 'plan'
                  ? 'bg-stone-100 border border-stone-300 text-stone-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Chat / Canvas</div>
                  <div className="text-[11px] text-stone-500">Interactive Plan & ECC Canvas</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('board')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'board'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Kanban className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Board</div>
                  <div className="text-[11px] text-stone-500">Kanban Intent & Delivery Gate</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('node')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'node'
                  ? 'bg-sky-50 border border-sky-200 text-sky-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Node Studio</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-sky-100 text-sky-700">Pipeline</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Visual Platform & DevContainers</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* 2. Generative */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-stone-400 px-1 font-semibold">Generative</div>

            <button
              type="button"
              onClick={() => handleNavigate('generative_design')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'generative_design'
                  ? 'bg-amber-50 border border-amber-200 text-amber-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Petri Design</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-100 text-teal-800">Workdesks</span>
                  </div>
                  <div className="text-[11px] text-stone-500">AGY CLI + MCP Workdesk Studio</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('generative_video')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'generative_video'
                  ? 'bg-rose-50 border border-rose-200 text-rose-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Video Synthesis</div>
                  <div className="text-[11px] text-stone-500">Motion Diffusion & Camera Controls</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('generative_audio')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'generative_audio'
                  ? 'bg-teal-50 border border-teal-200 text-teal-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Audio & Neural Voice</div>
                  <div className="text-[11px] text-stone-500">Voice Personas & Synthesis</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* 3. Modules */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-stone-400 px-1 font-semibold">Modules</div>

            <button
              type="button"
              onClick={() => handleNavigate('zero')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'zero'
                  ? 'bg-orange-50 border border-orange-200 text-orange-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Zero Game Studio</div>
                  <div className="text-[11px] text-stone-500">Bevy & Avian 2D Physics</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('skills')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'skills'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Skills Catalog</div>
                  <div className="text-[11px] text-stone-500">ECC Continuous Learning Matrix</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('mcp')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'mcp'
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>MCP Server</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-100 text-indigo-800">Protocol</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Server Edit, Creation & Tools</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('memory')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'memory'
                  ? 'bg-purple-50 border border-purple-200 text-purple-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Memory Explorer</div>
                  <div className="text-[11px] text-stone-500">ADR Documents & Vector Store</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* 4. Stats */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-stone-400 px-1 font-semibold">Stats</div>

            <button
              type="button"
              onClick={() => handleNavigate('stats_telemetry')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'stats_telemetry'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Telemetry</div>
                  <div className="text-[11px] text-stone-500">MTTM Velocity & Invariant Gates</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('stats_tokens')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'stats_tokens'
                  ? 'bg-amber-50 border border-amber-200 text-amber-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Token Spend</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-100 text-amber-800">Compaction</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Context Buffers & Cost Savings</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* 5. Data */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-stone-400 px-1 font-semibold">Data</div>

            <button
              type="button"
              onClick={() => handleNavigate('federated')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'federated'
                  ? 'bg-sky-50 border border-sky-200 text-sky-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Federated Data</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-sky-100 text-sky-700">Encrypted</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Docs, Drive, Classroom & RAG</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('edm')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'edm'
                  ? 'bg-teal-50 border border-teal-200 text-teal-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>EDM Diagnostics</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-100 text-teal-800">QML</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Q-Matrix, DINA CDM & Quantum QSVC</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('midterm_clockin_demo')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'midterm_clockin_demo'
                  ? 'bg-teal-50 border border-teal-200 text-teal-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Midterm & Clock-In</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-100 text-teal-800">110+</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Lieflat Charts & 24h Telemetry</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('governance')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'governance'
                  ? 'bg-purple-50 border border-purple-200 text-purple-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Governance</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-purple-100 text-purple-800">SAIF</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Root Policy Gates & Compliance</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('stats')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'stats'
                  ? 'bg-stone-100 border border-stone-300 text-stone-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Enterprise Stat</div>
                  <div className="text-[11px] text-stone-500">Cross-Workspace Overview</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* 6. System */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-stone-400 px-1 font-semibold">System</div>

            <button
              type="button"
              onClick={() => handleNavigate('settings')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'settings'
                  ? 'bg-stone-100 border border-stone-300 text-stone-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Platform Settings</div>
                  <div className="text-[11px] text-stone-500">Mesh Security & Provider Keys</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('server')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'server'
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Petri Server</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-100 text-indigo-800">Docker</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Reverse Proxy & SmartShield</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('tui')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'tui'
                  ? 'bg-stone-200 border border-stone-400 text-stone-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-mono">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold font-mono">Terminal UI</div>
                  <div className="text-[11px] text-stone-500">Interactive CLI Console</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('consumer')}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                currentView === 'consumer'
                  ? 'bg-sky-50 border border-sky-200 text-sky-950 font-semibold'
                  : 'bg-[#FAFBFB] hover:bg-stone-100 border border-stone-200/70 text-stone-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>Consumer Portal</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-sky-100 text-sky-800">Preview</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Stakeholder Desk & Request Flow</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Quick Config Triggers */}
        <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAiProviderModal();
            }}
            className="p-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Providers</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDwdModal();
            }}
            className="p-2.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google DWD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
