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
  MessageSquare,
  Boxes,
  Network,
  Eye,
  ShieldCheck,
  Shield,
  Wrench,
  Users,
  Server,
  GraduationCap,
} from 'lucide-react';
import { NodeSpec, Workspace, UserProfile, PetriViewMode, SystemTier } from '../types';
import { agentCognitionService } from '../services/agentCognitionService';
import { TIER_DEFINITIONS } from '../services/tierService';

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
  onSelectTier?: (tier: SystemTier) => void;
  currentView: PetriViewMode;
  onSelectView: (view: PetriViewMode) => void;
  isPreviewOpen?: boolean;
  onTogglePreview?: () => void;
  isCognitionOpen?: boolean;
  onToggleCognition?: () => void;
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
  onSelectTier,
  currentView,
  onSelectView,
  isPreviewOpen = false,
  onTogglePreview,
  isCognitionOpen = false,
  onToggleCognition,
}) => {
  const [cognition, setCognition] = useState(() => agentCognitionService.getState());
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);
  const [isTierMenuOpen, setIsTierMenuOpen] = useState(false);
  const modulesMenuRef = useRef<HTMLDivElement | null>(null);
  const tierMenuRef = useRef<HTMLDivElement | null>(null);

  const activeTier: SystemTier = activeUser?.tier || 'superadmin';
  const tierMeta = TIER_DEFINITIONS[activeTier];

  useEffect(() => {
    return agentCognitionService.subscribe(setCognition);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modulesMenuRef.current && !modulesMenuRef.current.contains(event.target as Node)) {
        setIsModulesMenuOpen(false);
      }
      if (tierMenuRef.current && !tierMenuRef.current.contains(event.target as Node)) {
        setIsTierMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isModuleActive = currentView === 'zero' || currentView === 'skills' || currentView === 'memory';

  return (
    <header
      data-tauri-drag-region
      className="bg-white/40 backdrop-blur-2xl border-b border-stone-200/60 px-3 sm:px-10 py-2.5 sm:py-3.5 flex items-center justify-between text-sm z-30 font-sans"
    >
      {/* Left: Brand, Breadcrumbs, User, Tier & Workspace */}
      <div className="flex items-center space-x-3.5">
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
          title="Switch User Identity Persona"
        >
          <span className="font-medium text-stone-800">{activeUser?.name.split(' ')[0] || 'User'}</span>
          <span className="text-stone-400">({activeUser?.role.replace('_', ' ') || 'owner'})</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </button>

        <span className="text-stone-300 font-light">/</span>

        {/* 3-Tier System Switcher Dropdown */}
        <div className="relative" ref={tierMenuRef}>
          <button
            type="button"
            onClick={() => setIsTierMenuOpen(!isTierMenuOpen)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${tierMeta.badgeStyle.bg} ${tierMeta.badgeStyle.text} ${tierMeta.badgeStyle.border} ${tierMeta.badgeStyle.glow}`}
            title={`Active System Tier: ${tierMeta.label} (Click to Switch)`}
          >
            {activeTier === 'superadmin' && <Shield className="w-3.5 h-3.5" />}
            {activeTier === 'control' && <Wrench className="w-3.5 h-3.5" />}
            {activeTier === 'consumer' && <Users className="w-3.5 h-3.5" />}
            <span>{tierMeta.label.toUpperCase()}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isTierMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTierMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-stone-400 font-semibold border-b border-stone-100 mb-1">
                Select Operating Tier
              </div>

              {/* SuperAdmin Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectTier?.('superadmin');
                  setIsTierMenuOpen(false);
                }}
                className={`w-full flex items-start space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeTier === 'superadmin' ? 'bg-purple-50 text-purple-900 font-medium' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold flex items-center space-x-1.5">
                    <span>SuperAdmin</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-purple-100 text-purple-800">Platform</span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                    Full SAIF governance, keys, users & root authority
                  </div>
                </div>
              </button>

              {/* Control Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectTier?.('control');
                  setIsTierMenuOpen(false);
                }}
                className={`w-full flex items-start space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeTier === 'control' ? 'bg-emerald-50 text-emerald-900 font-medium' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Wrench className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold flex items-center space-x-1.5">
                    <span>Control</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-100 text-emerald-800">Engineering</span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                    Node Studio DAGs, DevContainers & pipelines
                  </div>
                </div>
              </button>

              {/* Consumer Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectTier?.('consumer');
                  onSelectView('consumer');
                  setIsTierMenuOpen(false);
                }}
                className={`w-full flex items-start space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  activeTier === 'consumer' ? 'bg-sky-50 text-sky-900 font-medium' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Users className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold flex items-center space-x-1.5">
                    <span>Consumer</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-sky-100 text-sky-800">Stakeholder</span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                    Live preview, request desk & roadmap
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

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

      {/* Center: Main Enterprise View Navigation (Tier-Adapted, Desktop Only) */}
      <nav className="hidden md:flex items-center space-x-6 sm:space-x-8">
        {/* CONSUMER TIER: Shows Consumer Portal Only */}
        {activeTier === 'consumer' ? (
          <button
            onClick={() => onSelectView('consumer')}
            className={`flex items-center space-x-2 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
              currentView === 'consumer'
                ? 'border-sky-600 text-sky-950 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Consumer Portal</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-50 text-sky-700 border border-sky-200">
              Active
            </span>
          </button>
        ) : (
          /* SUPERADMIN & CONTROL TIERS: Engineering & Platform Views */
          <>
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
              onClick={() => onSelectView('focus')}
              className={`flex items-center space-x-1.5 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                currentView === 'focus'
                  ? 'border-stone-900 text-stone-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
              }`}
              title="Centric Focus Chat with Steerable Thinking"
            >
              <Sparkles className={`w-4 h-4 ${currentView === 'focus' ? 'text-indigo-600' : 'text-stone-400'}`} />
              <span>Focus</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                Zen
              </span>
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
              onClick={() => onSelectView('governance')}
              className={`flex items-center space-x-1.5 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                currentView === 'governance'
                  ? 'border-stone-900 text-stone-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
              }`}
              title={
                activeTier === 'superadmin'
                  ? 'Enterprise AI Governance & Full SAIF Policy Toggles'
                  : 'Enterprise AI Governance & SAIF Compliance (Read-Only)'
              }
            >
              <ShieldCheck className={`w-4 h-4 ${currentView === 'governance' ? 'text-emerald-700' : 'text-stone-400'}`} />
              <span>Governance</span>
              <span className={`ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                activeTier === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {activeTier === 'superadmin' ? 'Root' : 'Audit'}
              </span>
            </button>

            {activeTier === 'superadmin' && (
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
            )}

            {/* Petri Server: Container Manager, Reverse Proxy & SmartShield */}
            <button
              onClick={() => onSelectView('server')}
              className={`flex items-center space-x-1.5 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                currentView === 'server'
                  ? 'border-stone-900 text-stone-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
              }`}
              title="Petri Server: Container Manager, Reverse Proxy & SmartShield"
            >
              <Server className={`w-4 h-4 ${currentView === 'server' ? 'text-indigo-600' : 'text-stone-400'}`} />
              <span>Server</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                Petri
              </span>
            </button>

            {/* EDM: Quantum-Enhanced Educational Data Mining */}
            <button
              onClick={() => onSelectView('edm')}
              className={`flex items-center space-x-1.5 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                currentView === 'edm'
                  ? 'border-teal-600 text-teal-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
              }`}
              title="Quantum-Enhanced Educational Data Mining (Q-Matrix + DINA + QSVC)"
            >
              <GraduationCap className={`w-4 h-4 ${currentView === 'edm' ? 'text-teal-600' : 'text-stone-400'}`} />
              <span>EDM</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-teal-50 text-teal-700 border border-teal-200">
                QML
              </span>
            </button>

            {/* Quick Link to Consumer Portal for SuperAdmin / Control */}
            <button
              onClick={() => onSelectView('consumer')}
              className={`flex items-center space-x-1.5 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 ${
                currentView === 'consumer'
                  ? 'border-sky-600 text-sky-950 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
              }`}
              title="Preview the Consumer Experience"
            >
              <Eye className="w-3.5 h-3.5 text-sky-500" />
              <span>Consumer</span>
            </button>
          </>
        )}
      </nav>

      {/* Right Controls: Flat Indicators & Actions (No Rounded Boxes) */}
      <div className="flex items-center space-x-5 text-xs font-sans">
        {/* Agent Live Thinking & Concept HUD Trigger */}
        {onToggleCognition && (
          <button
            type="button"
            onClick={onToggleCognition}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs font-sans transition-all cursor-pointer ${
              isCognitionOpen
                ? 'bg-[#0ABAB5] text-white border-[#0ABAB5] shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border-stone-200'
            }`}
            title="Inspect Agent Live Thinking & Active Concept"
          >
            <Brain className={`w-3.5 h-3.5 ${isCognitionOpen ? 'text-white' : 'text-[#0ABAB5]'}`} />
            <span className="font-medium hidden sm:inline">Thinking</span>
            {cognition.isThinking ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ABAB5]" />
            )}
          </button>
        )}

        {/* Google Workspace DWD Trigger (Desktop Only, Available in Mobile Drawer) */}
        <button
          onClick={onOpenDwdModal}
          className="hidden md:flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 transition-colors font-medium"
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
