import React, { useState, useRef, useEffect } from 'react';
import {
  Minus,
  Plus,
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
  Database,
  Video,
  Mic,
  Palette,
  Layers,
  Coins,
  Activity,
  Image as ImageIcon,
  FolderGit2,
  Clock,
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
  type MenuDropdownType = 'dev' | 'gen' | 'modules' | 'stats' | 'data' | 'system' | null;
  const [openDropdown, setOpenDropdown] = useState<MenuDropdownType>(null);
  const [isTierMenuOpen, setIsTierMenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLElement | null>(null);
  const tierMenuRef = useRef<HTMLDivElement | null>(null);

  const activeTier: SystemTier = activeUser?.tier || 'superadmin';
  const tierMeta = TIER_DEFINITIONS[activeTier];

  useEffect(() => {
    return agentCognitionService.subscribe(setCognition);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (tierMenuRef.current && !tierMenuRef.current.contains(event.target as Node)) {
        setIsTierMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDevActive =
    currentView === 'chat' ||
    currentView === 'plan' ||
    currentView === 'board' ||
    currentView === 'node' ||
    currentView === 'projects';

  const isGenActive =
    currentView === 'generative_video' ||
    currentView === 'generative_audio' ||
    currentView === 'generative_image' ||
    currentView === 'generative_multimodal' ||
    currentView === 'generative_design';

  const isModulesActive =
    currentView === 'zero' ||
    currentView === 'skills' ||
    currentView === 'mcp' ||
    currentView === 'memory';

  const isStatsActive =
    currentView === 'stats_telemetry' ||
    currentView === 'stats_tokens';

  const isDataActive =
    currentView === 'federated' ||
    currentView === 'edm' ||
    currentView === 'midterm_clockin_demo' ||
    currentView === 'governance' ||
    currentView === 'stats';

  const isSystemActive =
    currentView === 'settings' ||
    currentView === 'server' ||
    currentView === 'tui';

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

      {/* Center: Main Enterprise View Navigation (Categorized Hierarchy) */}
      <nav ref={navContainerRef} className="hidden md:flex items-center space-x-3 lg:space-x-5">
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
          /* SUPERADMIN & CONTROL TIERS: Categorized Enterprise Nav */
          <>
            {/* 0. Focus (Direct Zen Button - Default View) */}
            <button
              onClick={() => {
                onSelectView('focus');
                setOpenDropdown(null);
              }}
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

            {/* 1. Development: Chat/Canvas, Board, Node */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'dev' ? null : 'dev')}
                className={`flex items-center space-x-1 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                  isDevActive
                    ? 'border-stone-900 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
                }`}
              >
                <MessageSquare className={`w-3.5 h-3.5 ${isDevActive ? 'text-stone-900' : 'text-stone-400'}`} />
                <span>Development</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'dev' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'dev' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  <button
                    onClick={() => {
                      onSelectView('chat');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'chat' || currentView === 'plan'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Chat / Canvas</div>
                      <div className="text-[10px] text-stone-400 font-normal">Interactive Plan & ECC Canvas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('board');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'board'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Kanban className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Board</div>
                      <div className="text-[10px] text-stone-400 font-normal">Kanban Delivery & Merged Items</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('node');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'node'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Network className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Node</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-sky-50 text-sky-700">Studio</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Visual Pipelines & DevContainers</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('projects');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'projects'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <FolderGit2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Projects</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-50 text-teal-700">Git</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Multi-Account GitHub & Repos</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Generative: Video, Audio, Image, Multi-Modal, Design Studio */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'gen' ? null : 'gen')}
                className={`flex items-center space-x-1 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                  isGenActive
                    ? 'border-stone-900 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
                }`}
              >
                <Palette className={`w-3.5 h-3.5 ${isGenActive ? 'text-stone-900' : 'text-stone-400'}`} />
                <span>Generative</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'gen' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'gen' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  {/* Quick Action: Start New Open Design */}
                  <button
                    onClick={() => {
                      onSelectView('generative_design');
                      window.dispatchEvent(new CustomEvent('petri:open-new-design-modal'));
                      setOpenDropdown(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 mb-1.5 rounded-xl text-left bg-teal-50/90 hover:bg-teal-100/90 text-teal-950 border border-teal-200/80 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-teal-950">Start New Open Design</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white text-teal-800 border border-teal-200/60 shadow-2xs">
                      Ctrl+N
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('generative_design');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'generative_design'
                        ? 'bg-amber-50 text-amber-950 font-medium border border-amber-200/60'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Petri Design</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-100 text-teal-800">Workdesks</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">AGY CLI + MCP Workdesk Studio</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('generative_video');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'generative_video'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Video className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Video</div>
                      <div className="text-[10px] text-stone-400 font-normal">Motion Synthesis & Text-to-Video</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('generative_audio');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'generative_audio'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Audio</div>
                      <div className="text-[10px] text-stone-400 font-normal">Neural TTS, SFX & Music Synthesis</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('generative_image');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'generative_image'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Image</div>
                      <div className="text-[10px] text-stone-400 font-normal">Diffusion Renders & Visual Assets</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('generative_multimodal');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'generative_multimodal'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Multi-Modal</div>
                      <div className="text-[10px] text-stone-400 font-normal">Cross-Modal Reasoning & Composition</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Modules: Zero Game Studio, Skills, MCP Server/Edit/Creation */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'modules' ? null : 'modules')}
                className={`flex items-center space-x-1 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                  isModulesActive
                    ? 'border-stone-900 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
                }`}
              >
                <Boxes className={`w-3.5 h-3.5 ${isModulesActive ? 'text-stone-900' : 'text-stone-400'}`} />
                <span>Modules</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'modules' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'modules' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  <button
                    onClick={() => {
                      onSelectView('zero');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'zero'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Disc className="w-4 h-4 text-[#FF5F1F] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Zero Game Studio</div>
                      <div className="text-[10px] text-stone-400 font-normal">Bevy 0.15 & Avian Physics Engine</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('skills');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'skills'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Skills</div>
                      <div className="text-[10px] text-stone-400 font-normal">ECC Continuous Learning Catalog</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('mcp');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'mcp'
                        ? 'bg-indigo-50 text-indigo-950 font-medium border border-indigo-200/60'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Network className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>MCP Server</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-100 text-indigo-800">Protocol</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Server Edit, Creation & Tools</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('memory');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'memory'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Brain className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Memory Explorer</div>
                      <div className="text-[10px] text-stone-400 font-normal">Vault Scopes & Vector Store</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Stats: Telemetry, Token Spend/Compaction/Breakdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'stats' ? null : 'stats')}
                className={`flex items-center space-x-1 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                  isStatsActive
                    ? 'border-stone-900 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
                }`}
              >
                <BarChart3 className={`w-3.5 h-3.5 ${isStatsActive ? 'text-stone-900' : 'text-stone-400'}`} />
                <span>Stats</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'stats' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'stats' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  <button
                    onClick={() => {
                      onSelectView('stats_telemetry');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'stats_telemetry'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Telemetry</div>
                      <div className="text-[10px] text-stone-400 font-normal">MTTM, Invariants & Latency</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('stats_tokens');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'stats_tokens'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Token Spend</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-100 text-amber-800">Compaction</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Context Windows & Cache Rates</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Data: Federated, EDM, Governance, Enterprise Stat */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'data' ? null : 'data')}
                className={`flex items-center space-x-1 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                  isDataActive
                    ? 'border-stone-900 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
                }`}
              >
                <Database className={`w-3.5 h-3.5 ${isDataActive ? 'text-stone-900' : 'text-stone-400'}`} />
                <span>Data</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'data' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'data' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  <button
                    onClick={() => {
                      onSelectView('federated');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'federated'
                        ? 'bg-sky-50 text-sky-900 font-medium border border-sky-100'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Database className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Federated</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-sky-100 text-sky-700">Encrypted</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Docs, Drive, Classroom & RAG</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('edm');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'edm'
                        ? 'bg-teal-50 text-teal-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>EDM</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-100 text-teal-800">QML</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Educational Data Mining & DINA</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('midterm_clockin_demo');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'midterm_clockin_demo'
                        ? 'bg-teal-50 text-teal-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Midterm & Clock-In</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-teal-100 text-teal-800">110+</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Lieflat Charts & Telemetry</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('governance');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'governance'
                        ? 'bg-purple-50 text-purple-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Governance</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-purple-100 text-purple-800">SAIF</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Root Gate Policies & Safety Bounds</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('stats');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'stats'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-stone-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Enterprise Stat</div>
                      <div className="text-[10px] text-stone-400 font-normal">Cross-Workspace Overview</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 6. System: Platform Settings, Petri Server, TUI */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'system' ? null : 'system')}
                className={`flex items-center space-x-1 py-1 text-xs sm:text-sm font-sans transition-all border-b-2 cursor-pointer ${
                  isSystemActive
                    ? 'border-stone-900 text-stone-950 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
                }`}
              >
                <Sliders className={`w-3.5 h-3.5 ${isSystemActive ? 'text-stone-900' : 'text-stone-400'}`} />
                <span>System</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'system' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'system' && (
                <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  {activeTier === 'superadmin' && (
                    <button
                      onClick={() => {
                        onSelectView('settings');
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        currentView === 'settings'
                          ? 'bg-stone-100 text-stone-900 font-medium'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                    >
                      <Sliders className="w-4 h-4 text-stone-600 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold">Platform Settings</div>
                        <div className="text-[10px] text-stone-400 font-normal">Mesh Config & Security Keys</div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSelectView('server');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'server'
                        ? 'bg-indigo-50 text-indigo-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Server className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>Petri Server</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-100 text-indigo-800">Docker</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-normal">Reverse Proxy & SmartShield</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectView('tui');
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      currentView === 'tui'
                        ? 'bg-stone-100 text-stone-900 font-medium'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-stone-600 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">TUI</div>
                      <div className="text-[10px] text-stone-400 font-normal">Fast Keyboard & CLI Console</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
