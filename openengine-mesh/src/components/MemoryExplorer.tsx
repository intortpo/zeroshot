import React, { useState, useMemo } from 'react';
import {
  Brain,
  Search,
  Database,
  Layers,
  BookOpen,
  FileCode2,
  Trash2,
  Plus,
  Copy,
  Check,
  Sparkles,
  Cpu,
  Key,
  Calendar,
  History,
} from 'lucide-react';
import { MemoryEntry, MemoryType, Workspace } from '../types';

interface MemoryExplorerProps {
  activeWorkspace?: Workspace;
}

export const INITIAL_MEMORIES: MemoryEntry[] = [
  // Semantic / Architectural Invariants from AGENTS.md
  {
    id: 'mem-001',
    workspaceId: 'ws-petri',
    type: 'rule',
    title: 'Protocol Rust Types as Canonical Source of Truth',
    content: 'Protocol Rust types are the single source of truth. Generated protocol definitions under protocol/ must be regenerated via Rust testkit and never hand-edited.',
    tags: ['rule', 'protocol', 'rust', 'source-of-truth'],
    timestamp: Date.now() - 86400000 * 2,
    tokens: 280,
    importance: 'critical',
    metadata: {
      source: 'AGENTS.md:L44',
      status: 'enforced',
    },
  },
  {
    id: 'mem-002',
    workspaceId: 'ws-petri',
    type: 'rule',
    title: 'Four-Parameter Clippy Ceiling on Public APIs',
    content: 'New Rust APIs must respect the four-parameter Clippy ceiling. Use typed request structs rather than raising or bypassing the lint limit. Preserves bounded interfaces and ergonomic refactoring.',
    tags: ['rule', 'rust', 'clippy', 'interfaces'],
    timestamp: Date.now() - 86400000,
    tokens: 210,
    importance: 'critical',
    metadata: {
      source: 'AGENTS.md:L142',
      lintId: 'clippy::too_many_arguments',
    },
  },
  {
    id: 'mem-003',
    workspaceId: 'ws-petri',
    type: 'rule',
    title: 'Defensive Bounded Stdin/Stdout Concurrent Draining',
    content: 'Provider stdin and stdout must remain concurrent and bounded to prevent large prompts and early outputs from deadlocking. Incomplete stdin is fatal, while parsed identity and diagnostics survive either I/O order.',
    tags: ['rule', 'io', 'concurrency', 'bounded', 'resilience'],
    timestamp: Date.now() - 172800000,
    tokens: 295,
    importance: 'critical',
    metadata: {
      source: 'AGENTS.md:L63',
      guardCeiling: '64 MiB',
    },
  },
  {
    id: 'mem-004',
    workspaceId: 'ws-petri',
    type: 'rule',
    title: 'Fail-Closed Structured-Output Recovery',
    content: 'Structured-output recovery is provider-owned and fail-closed. Recovery turns disable reused sessions, MCP, write/network tools, and user configs. Max 2 turns before terminal rejection.',
    tags: ['rule', 'recovery', 'fail-closed', 'security'],
    timestamp: Date.now() - 120000000,
    tokens: 240,
    importance: 'high',
    metadata: {
      source: 'AGENTS.md:L55',
      maxTurns: 2,
    },
  },
  // Authentic Episodic Memories from Real Repository Git Commits
  {
    id: 'mem-005',
    workspaceId: 'ws-petri',
    type: 'episodic',
    title: 'Git Commit 97a09659: Soft Tiffany Pastel Aesthetic & TUI View',
    content: 'Transformed full UI stack from dark cyberpunk styling to soft Tiffany pastel porcelain light enterprise design. Built interactive TuiView with keyboard shortcuts, process inspection, and command bar.',
    tags: ['git', 'commit', 'ui', 'tui', 'pastel'],
    timestamp: 1788972517000,
    tokens: 380,
    importance: 'high',
    metadata: {
      commitHash: '97a09659',
      author: 'intortpo',
      branch: 'main',
    },
  },
  {
    id: 'mem-006',
    workspaceId: 'ws-petri',
    type: 'episodic',
    title: 'Git Commit 36fbb1ee: Enterprise Telemetry & User Switcher',
    content: 'Integrated multi-tenant user identity switcher with RBAC permissions matrix and live telemetry dashboard tracking SLA adherence, MTTM velocity, and self-learning invariant loops.',
    tags: ['git', 'commit', 'telemetry', 'rbac'],
    timestamp: 1788972218000,
    tokens: 340,
    importance: 'high',
    metadata: {
      commitHash: '36fbb1ee',
      author: 'intortpo',
      branch: 'main',
    },
  },
  {
    id: 'mem-007',
    workspaceId: 'ws-petri',
    type: 'episodic',
    title: 'Git Commit 71dc16f1: Google Workspace DWD JSON Key Integration',
    content: 'Implemented Domain-Wide Delegation service account parser in Rust Tauri backend for headless autonomous operations across Drive, Docs, Gmail, and Sheets.',
    tags: ['git', 'commit', 'dwd', 'google-workspace'],
    timestamp: 1788970292000,
    tokens: 310,
    importance: 'medium',
    metadata: {
      commitHash: '71dc16f1',
      author: 'intortpo',
      branch: 'main',
    },
  },
  // Omarchy Workspace Memories
  {
    id: 'mem-009',
    workspaceId: 'ws-omarchy',
    type: 'semantic',
    title: 'Omarchy Wayland Compositor Dynamic Gesture Map',
    content: 'Three-finger horizontal swipe triggers smooth workspace pan. Custom hyprctl IPC socket handles 120Hz gesture updates without frame drops.',
    tags: ['wayland', 'hyprland', 'gestures', 'omarchy'],
    timestamp: Date.now() - 14400000,
    tokens: 310,
    importance: 'high',
    metadata: {
      workspace: 'omarchy-desktop',
    },
  },
  // Cloud Cluster Memories
  {
    id: 'mem-010',
    workspaceId: 'ws-cloud',
    type: 'config',
    title: 'Cluster Pool: GCP Cloud Run Container Sandboxes',
    content: 'Target container ghcr.io/the-open-engine/zeroshot-target pooled across us-central1 and europe-west1 with minimum 0 instances and 1000 concurrent max ceiling.',
    tags: ['cloud-run', 'containers', 'pooling', 'gcp'],
    timestamp: Date.now() - 21600000,
    tokens: 290,
    importance: 'high',
    metadata: {
      image: 'ghcr.io/the-open-engine/zeroshot-target:latest',
    },
  },
];

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({ activeWorkspace }) => {
  const [memories, setMemories] = useState<MemoryEntry[]>(INITIAL_MEMORIES);
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [filterWorkspace, setFilterWorkspace] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MemoryType>('semantic');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const currentWorkspaceId = activeWorkspace?.id || 'ws-petri';

  const handleCopyContent = (content: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDeleteMemory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemory?.id === id) {
      setSelectedMemory(null);
    }
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newEntry: MemoryEntry = {
      id: `mem-${Math.random().toString(36).substring(2, 7)}`,
      workspaceId: currentWorkspaceId,
      type: newType,
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      timestamp: Date.now(),
      tokens: Math.round(newContent.length / 4),
      importance: 'high',
    };

    setMemories((prev) => [newEntry, ...prev]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAddingMemory(false);
  };

  const filteredMemories = useMemo(() => {
    return memories.filter((mem) => {
      if (filterWorkspace && mem.workspaceId !== currentWorkspaceId) {
        return false;
      }
      if (selectedType !== 'all' && mem.type !== selectedType) {
        return false;
      }
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        mem.title.toLowerCase().includes(q) ||
        mem.content.toLowerCase().includes(q) ||
        mem.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [memories, selectedType, filterWorkspace, currentWorkspaceId, searchQuery]);

  const totalTokens = useMemo(() => {
    return filteredMemories.reduce((acc, curr) => acc + (curr.tokens || 0), 0);
  }, [filteredMemories]);

  const getTypeStyle = (type: MemoryType) => {
    switch (type) {
      case 'semantic':
        return {
          label: 'SEMANTIC (ADR)',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          style: 'bg-[#EDE8DC] text-[#1A1D1A] border-[#1A1D1A]',
        };
      case 'episodic':
        return {
          label: 'EPISODIC (RUN)',
          icon: <History className="w-3.5 h-3.5" />,
          style: 'bg-[#EDE8DC] text-[#1A1D1A] border-[#1A1D1A]',
        };
      case 'rule':
        return {
          label: 'RULE & INVARIANT',
          icon: <FileCode2 className="w-3.5 h-3.5" />,
          style: 'bg-[#EDE8DC] text-[#1A1D1A] border-[#1A1D1A]',
        };
      case 'vector':
        return {
          label: 'VECTOR EMBEDDING',
          icon: <Cpu className="w-3.5 h-3.5" />,
          style: 'bg-[#EDE8DC] text-[#1A1D1A] border-[#1A1D1A]',
        };
      case 'config':
        return {
          label: 'CONFIG & STATE',
          icon: <Key className="w-3.5 h-3.5" />,
          style: 'bg-[#EDE8DC] text-[#1A1D1A] border-[#1A1D1A]',
        };
    }
  };

  const TYPE_TABS: { type: MemoryType | 'all'; label: string; count: number }[] = [
    { type: 'all', label: 'ALL LOGS', count: memories.length },
    { type: 'semantic', label: 'SEMANTIC (ADR)', count: memories.filter((m) => m.type === 'semantic').length },
    { type: 'episodic', label: 'EPISODIC (RUNS)', count: memories.filter((m) => m.type === 'episodic').length },
    { type: 'rule', label: 'RULES & INVARIANTS', count: memories.filter((m) => m.type === 'rule').length },
    { type: 'vector', label: 'VECTOR EMBEDDINGS', count: memories.filter((m) => m.type === 'vector').length },
    { type: 'config', label: 'CONFIGS & KEYS', count: memories.filter((m) => m.type === 'config').length },
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto p-4 sm:p-8 space-y-6 font-mono bg-[#F6F3EC] text-[#1A1D1A]">
      {/* 1960s Technical Header Panel */}
      <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-4 shadow-[2px_2px_0px_#1A1D1A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1D1A] pb-3 mb-3">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-[#1A1D1A]/70 mb-1">
              <span className="px-1 border border-[#1A1D1A] bg-[#EDE8DC]">DOC NO. 60-PETRI-MEM-03</span>
              <span>//</span>
              <span>SYSTEM LOGBOOK SECTION 03</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1A1D1A]">
              FLIGHT DATA RECORDER & ARCHITECTURAL LOGBOOK
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddingMemory(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] hover:bg-[#333] text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>[RECORD LOG ENTRY]</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center space-x-2">
            <span>REGISTERED MEMORY NODES: {memories.length}</span>
            <span>·</span>
            <span>INDEXED TOKENS: {totalTokens.toLocaleString()}</span>
          </div>
          <div className="font-bold border border-[#1A1D1A] px-2 py-0.5 bg-[#EDE8DC]">
            ● VAULT STATUS: PERSISTED & DURABLE
          </div>
        </div>
      </div>

      {/* Memory Telemetry Instruments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-3 shadow-[2px_2px_0px_#1A1D1A] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1D1A]/70">
            <span>INDEXED TOKENS</span>
            <Database className="w-3.5 h-3.5 text-[#1A1D1A]" />
          </div>
          <div className="text-xl font-bold">{totalTokens.toLocaleString()}</div>
          <div className="text-[9px] text-[#1A1D1A]/60 uppercase border-t border-[#1A1D1A]/20 pt-1">
            AST COMPACTED VECTORS
          </div>
        </div>

        <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-3 shadow-[2px_2px_0px_#1A1D1A] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1D1A]/70">
            <span>CACHE HIT RATIO</span>
            <Sparkles className="w-3.5 h-3.5 text-[#1A1D1A]" />
          </div>
          <div className="text-xl font-bold">89.4%</div>
          <div className="text-[9px] text-[#1A1D1A]/60 uppercase border-t border-[#1A1D1A]/20 pt-1">
            PROMPT REUSE GAIN
          </div>
        </div>

        <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-3 shadow-[2px_2px_0px_#1A1D1A] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1D1A]/70">
            <span>VECTOR MODEL</span>
            <Cpu className="w-3.5 h-3.5 text-[#1A1D1A]" />
          </div>
          <div className="text-sm font-bold truncate">text-emb-3-small</div>
          <div className="text-[9px] text-[#1A1D1A]/60 uppercase border-t border-[#1A1D1A]/20 pt-1">
            COSINE DIST 1536D
          </div>
        </div>

        <div className="border border-[#1A1D1A] bg-[#FAF8F3] p-3 shadow-[2px_2px_0px_#1A1D1A] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1D1A]/70">
            <span>FLIGHT SCOPE</span>
            <Layers className="w-3.5 h-3.5 text-[#1A1D1A]" />
          </div>
          <div className="text-sm font-bold truncate">
            {filterWorkspace ? activeWorkspace?.name || 'Current' : 'All Workspaces'}
          </div>
          <div className="text-[9px] text-[#1A1D1A]/60 uppercase border-t border-[#1A1D1A]/20 pt-1">
            WORKSPACE ENFORCED
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Type Inked Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setSelectedType(tab.type)}
              className={`flex items-center space-x-1 px-2.5 py-1 border border-[#1A1D1A] text-xs font-mono transition-all cursor-pointer ${
                selectedType === tab.type
                  ? 'bg-[#1A1D1A] text-[#FAF8F3] font-bold shadow-[2px_2px_0px_#1A1D1A]'
                  : 'bg-[#FAF8F3] text-[#1A1D1A] hover:bg-[#EDE8DC]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="opacity-70">[{tab.count}]</span>
            </button>
          ))}
        </div>

        {/* Workspace Scope Toggle & Search */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setFilterWorkspace(!filterWorkspace)}
            className="px-2.5 py-1 border border-[#1A1D1A] bg-[#EDE8DC] text-xs font-mono flex items-center space-x-1 cursor-pointer hover:bg-[#FAF8F3]"
          >
            <span className="text-[#1A1D1A]/70">SCOPE:</span>
            <span className="font-bold">
              {filterWorkspace ? activeWorkspace?.name : 'GLOBAL'}
            </span>
          </button>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-[#1A1D1A]/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH MEMORY LOGS..."
              className="w-full bg-[#FAF8F3] border border-[#1A1D1A] pl-8 pr-2.5 py-1 text-xs font-mono text-[#1A1D1A] placeholder-[#888] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full h-36 flex flex-col items-center justify-center border border-dashed border-[#1A1D1A] bg-[#FAF8F3] text-xs text-[#1A1D1A]/60 space-y-1 font-mono">
            <Brain className="w-5 h-5" />
            <span>NO FLIGHT LOG ENTRIES MATCH QUERY</span>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const typeStyle = getTypeStyle(mem.type);

            return (
              <div
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="border border-[#1A1D1A] bg-[#FAF8F3] p-4 flex flex-col justify-between space-y-3 transition-all shadow-[2px_2px_0px_#1A1D1A] hover:bg-[#F2EFE9] cursor-pointer group"
              >
                <div className="space-y-2">
                  {/* Top: Type Badge, Importance, and Timestamp */}
                  <div className="flex items-center justify-between border-b border-[#1A1D1A]/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`flex items-center space-x-1 px-1.5 py-0.5 border text-[9px] font-bold ${typeStyle.style}`}
                      >
                        {typeStyle.icon}
                        <span>{typeStyle.label}</span>
                      </span>

                      <span
                        className={`px-1.5 py-0.5 border border-[#1A1D1A] text-[9px] font-bold uppercase ${
                          mem.importance === 'critical'
                            ? 'bg-[#8B0000] text-[#FAF8F3]'
                            : mem.importance === 'high'
                            ? 'bg-[#EDE8DC] text-[#1A1D1A]'
                            : 'bg-[#FAF8F3] text-[#1A1D1A]/70'
                        }`}
                      >
                        {mem.importance}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px] text-[#1A1D1A]/60">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(mem.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-[10px] text-[#1A1D1A]/60 font-mono">
                    ID: #{mem.id}
                  </div>
                  <h3 className="text-xs font-bold text-[#1A1D1A] leading-snug">
                    {mem.title}
                  </h3>

                  {/* Content snippet */}
                  <div className="border border-[#1A1D1A]/40 bg-[#F2EFE9] p-2.5 text-[11px] text-[#1A1D1A] leading-relaxed line-clamp-2">
                    {mem.content}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {mem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.2 border border-[#1A1D1A]/40 bg-[#EDE8DC] text-[9px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Tokens & Actions */}
                <div className="pt-2 border-t border-[#1A1D1A] flex items-center justify-between text-[10px] text-[#1A1D1A]/70">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{mem.tokens} TOKENS</span>
                    <span>·</span>
                    <span>{mem.workspaceId}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopyContent(mem.content, mem.id, e)}
                      className="p-1 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] transition-colors cursor-pointer"
                      title="Copy content"
                    >
                      {copiedId === mem.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteMemory(mem.id, e)}
                      className="p-1 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#8B0000] hover:text-[#FAF8F3] transition-colors cursor-pointer"
                      title="Prune memory record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D1A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="border-2 border-[#1A1D1A] bg-[#FAF8F3] w-full max-w-2xl overflow-hidden text-[#1A1D1A] font-mono shadow-[6px_6px_0px_#1A1D1A]">
            {/* Modal Header */}
            <div className="border-b border-[#1A1D1A] p-4 flex items-center justify-between bg-[#EDE8DC]">
              <div className="flex items-center space-x-2.5">
                <Brain className="w-4 h-4" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase">
                      {selectedMemory.type}
                    </span>
                    <span className="text-[10px] opacity-70">
                      #{selectedMemory.id}
                    </span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold mt-0.5">
                    {selectedMemory.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedMemory(null)}
                className="px-2 py-1 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-xs font-bold cursor-pointer"
              >
                [ESC ✕]
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-[10px] font-bold uppercase border-b border-[#1A1D1A] pb-1 mb-1.5">
                  [1.0 PAYLOAD & SYSTEM CONTENT]
                </h4>
                <div className="border border-[#1A1D1A] bg-[#F2EFE9] p-3 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.content}
                </div>
              </div>

              {selectedMemory.metadata && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase border-b border-[#1A1D1A] pb-1 mb-1.5">
                    [2.0 PROVENANCE & STRUCTURED METADATA]
                  </h4>
                  <pre className="border border-[#1A1D1A] bg-[#EDE8DC] p-3 text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedMemory.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-bold uppercase border-b border-[#1A1D1A] pb-1 mb-1.5">
                  [3.0 INDEXED TAGS]
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMemory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#1A1D1A] bg-[#EDE8DC] flex items-center justify-between">
              <span className="text-[10px] opacity-70">
                LOGGED: {new Date(selectedMemory.timestamp).toLocaleString()}
              </span>

              <button
                onClick={() => setSelectedMemory(null)}
                className="px-3 py-1 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] text-xs font-bold hover:bg-[#333] cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Node Modal */}
      {isAddingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1D1A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="border-2 border-[#1A1D1A] bg-[#FAF8F3] w-full max-w-xl overflow-hidden text-[#1A1D1A] font-mono shadow-[6px_6px_0px_#1A1D1A]">
            <div className="border-b border-[#1A1D1A] p-4 flex items-center justify-between bg-[#EDE8DC]">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <h2 className="text-xs sm:text-sm font-bold">
                  RECORD FLIGHT MEMORY ENTRY
                </h2>
              </div>
              <button
                onClick={() => setIsAddingMemory(false)}
                className="px-2 py-1 border border-[#1A1D1A] bg-[#FAF8F3] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-xs font-bold cursor-pointer"
              >
                [ESC ✕]
              </button>
            </div>

            <form onSubmit={handleAddMemorySubmit} className="p-4 sm:p-6 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase">ENTRY TYPE</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as MemoryType)}
                  className="w-full bg-[#FAF8F3] border border-[#1A1D1A] px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="semantic">Semantic (ADR / Architectural Concept)</option>
                  <option value="rule">Rule & Invariant Guard</option>
                  <option value="episodic">Episodic (Flight Run Record)</option>
                  <option value="vector">Vector Store Embedding</option>
                  <option value="config">Config & State</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase">ENTRY TITLE</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ADR 0004: Eventarc Concurrency Guard"
                  className="w-full bg-[#FAF8F3] border border-[#1A1D1A] px-2.5 py-1.5 text-xs text-[#1A1D1A] placeholder-[#888] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase">KNOWLEDGE PAYLOAD</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe the decision, heuristic, or learned constraint..."
                  className="w-full bg-[#FAF8F3] border border-[#1A1D1A] px-2.5 py-1.5 text-xs text-[#1A1D1A] placeholder-[#888] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase">INDEXED TAGS (COMMA-SEPARATED)</label>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. adr, eventarc, concurrency, fail-closed"
                  className="w-full bg-[#FAF8F3] border border-[#1A1D1A] px-2.5 py-1.5 text-xs text-[#1A1D1A] placeholder-[#888] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1A1D1A]">
                <button
                  type="button"
                  onClick={() => setIsAddingMemory(false)}
                  className="px-3 py-1 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#FAF8F3] text-xs font-bold transition-colors cursor-pointer"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] text-xs font-bold hover:bg-[#333] transition-colors cursor-pointer"
                >
                  [COMMIT TO VAULT]
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
