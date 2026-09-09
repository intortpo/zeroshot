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
  X,
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
    content: 'Protocol Rust types are the single source of truth. Generated protocol definitions under protocol/openengine-cluster/v1/ must be regenerated via Rust testkit and never hand-edited.',
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
          label: 'SEMANTIC / ADR',
          icon: <BookOpen className="w-3.5 h-3.5 text-stone-700" />,
          style: 'bg-stone-100 text-stone-900 border-stone-300 font-semibold',
        };
      case 'episodic':
        return {
          label: 'EPISODIC / RUN',
          icon: <History className="w-3.5 h-3.5 text-emerald-400" />,
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'rule':
        return {
          label: 'RULE & INVARIANT',
          icon: <FileCode2 className="w-3.5 h-3.5 text-amber-400" />,
          style: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'vector':
        return {
          label: 'VECTOR STORE',
          icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />,
          style: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        };
      case 'config':
        return {
          label: 'CONFIG & STATE',
          icon: <Key className="w-3.5 h-3.5 text-purple-400" />,
          style: 'bg-purple-50 text-purple-800 border-purple-200',
        };
    }
  };

  const TYPE_TABS: { type: MemoryType | 'all'; label: string; count: number }[] = [
    { type: 'all', label: 'All Memory', count: memories.length },
    { type: 'semantic', label: 'Semantic (ADRs)', count: memories.filter((m) => m.type === 'semantic').length },
    { type: 'episodic', label: 'Episodic (Runs)', count: memories.filter((m) => m.type === 'episodic').length },
    { type: 'rule', label: 'Rules & Invariants', count: memories.filter((m) => m.type === 'rule').length },
    { type: 'vector', label: 'Vector Store', count: memories.filter((m) => m.type === 'vector').length },
    { type: 'config', label: 'Configs & Keys', count: memories.filter((m) => m.type === 'config').length },
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto p-6 sm:p-10 select-none space-y-8">
      {/* Top Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-xl font-semibold font-sans text-stone-900 flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5]" />
            <span>Memory Explorer</span>
            <span className="text-xs font-sans font-medium text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
              {filteredMemories.length} Nodes
            </span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingMemory(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-sans font-semibold transition-all border border-stone-900"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Memory Node</span>
          </button>
        </div>
      </div>

      {/* Memory Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 border border-stone-200/80 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-2xl">
          <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-sans">Indexed Tokens</div>
            <div className="text-base sm:text-lg font-semibold font-sans text-stone-900">
              {totalTokens.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white/70 border border-stone-200/80 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-2xl">
          <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-sans">Cache Hit Rate</div>
            <div className="text-base sm:text-lg font-semibold font-sans text-stone-900">89.4%</div>
          </div>
        </div>

        <div className="bg-white/70 border border-stone-200/80 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-2xl">
          <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-sans">Vector Model</div>
            <div className="text-xs font-sans font-medium text-stone-800 truncate max-w-[150px]">
              text-emb-3-small
            </div>
          </div>
        </div>

        <div className="bg-white/70 border border-stone-200/80 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-2xl">
          <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-sans">Workspace Scope</div>
            <div className="text-xs font-medium text-stone-800 truncate max-w-[150px] font-sans">
              {filterWorkspace ? activeWorkspace?.name || 'Current' : 'All Workspaces'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Type Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setSelectedType(tab.type)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all ${
                selectedType === tab.type
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-white/70 text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-white font-normal'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-xs text-stone-400 font-sans">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Workspace Scope Toggle & Search */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => setFilterWorkspace(!filterWorkspace)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white/70 hover:bg-white text-xs text-stone-700 flex items-center space-x-1.5 transition-colors font-sans"
          >
            <span>Scope:</span>
            <span className="font-medium text-stone-900">
              {filterWorkspace ? activeWorkspace?.name : 'Global'}
            </span>
          </button>

          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memory entries..."
              className="w-full bg-white/70 border border-stone-200/80 rounded-xl pl-9 pr-3.5 py-1.5 text-xs font-sans text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white font-normal"
            />
          </div>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full h-40 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-2xl text-xs text-stone-400 space-y-1.5 font-sans">
            <Brain className="w-6 h-6 text-stone-300" />
            <span>No memory records match query</span>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const typeStyle = getTypeStyle(mem.type);

            return (
              <div
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="bg-white/70 border border-stone-200/80 hover:border-stone-400 rounded-2xl p-5 flex flex-col justify-between space-y-3.5 transition-all duration-200 backdrop-blur-2xl group cursor-pointer"
              >
                <div className="space-y-2.5">
                  {/* Top: Type Badge, Importance, and Timestamp */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs font-sans font-medium border ${typeStyle.style}`}
                      >
                        {typeStyle.icon}
                        <span>{typeStyle.label}</span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-xs font-sans uppercase font-medium ${
                          mem.importance === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : mem.importance === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                      >
                        {mem.importance}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs font-sans text-stone-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(mem.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-stone-900 group-hover:text-stone-950 transition-colors leading-snug">
                    {mem.title}
                  </h3>

                  {/* Content snippet */}
                  <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-3 text-xs font-sans text-stone-700 leading-relaxed line-clamp-2">
                    {mem.content}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {mem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-white border border-stone-200 text-xs font-sans text-stone-500 font-normal"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Tokens & Actions */}
                <div className="pt-3.5 border-t border-stone-200 flex items-center justify-between text-xs font-sans text-stone-400">
                  <div className="flex items-center space-x-2">
                    <span>{mem.tokens} tokens</span>
                    <span>·</span>
                    <span className="text-stone-500">{mem.workspaceId}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyContent(mem.content, mem.id, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-white/5 transition-colors"
                      title="Copy content"
                    >
                      {copiedId === mem.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteMemory(mem.id, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 border border-stone-200/80 rounded-3xl w-full max-w-2xl overflow-hidden text-stone-800 font-sans">
            {/* Modal Header */}
            <div className="border-b border-stone-200 p-6 flex items-center justify-between bg-stone-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
                  <Brain className="w-4 h-4 text-stone-700" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-sans uppercase text-stone-400">
                      {selectedMemory.type}
                    </span>
                    <span className="text-xs font-sans text-stone-400">
                      #{selectedMemory.id}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-stone-900 mt-0.5">
                    {selectedMemory.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedMemory(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-sans font-medium text-stone-400 uppercase mb-2">
                  Memory Payload & Knowledge Content
                </h4>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs font-sans text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.content}
                </div>
              </div>

              {selectedMemory.metadata && (
                <div>
                  <h4 className="text-xs font-sans font-medium text-stone-400 uppercase mb-2">
                    Provenance & Structured Metadata
                  </h4>
                  <pre className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs font-mono text-cyan-800 overflow-x-auto">
                    {JSON.stringify(selectedMemory.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-xs font-sans font-medium text-stone-400 uppercase mb-2">
                  Indexed Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMemory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs font-sans text-stone-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <span className="text-xs font-sans text-stone-400">
                Created {new Date(selectedMemory.timestamp).toLocaleString()}
              </span>

              <button
                onClick={() => setSelectedMemory(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-[#252525] border border-stone-200 text-xs font-sans font-medium text-stone-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Node Modal */}
      {isAddingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 border border-stone-200/80 rounded-3xl w-full max-w-xl overflow-hidden text-stone-800 font-sans">
            <div className="border-b border-stone-200 p-5 flex items-center justify-between bg-stone-50">
              <div className="flex items-center space-x-2.5">
                <Brain className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  Add Memory Node
                </h2>
              </div>
              <button
                onClick={() => setIsAddingMemory(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemorySubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-stone-600">Memory Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as MemoryType)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-900"
                >
                  <option value="semantic">Semantic (ADR / Concept)</option>
                  <option value="rule">Rule & Invariant Guard</option>
                  <option value="episodic">Episodic (Run Record)</option>
                  <option value="vector">Vector Store Embedding</option>
                  <option value="config">Config & State</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-stone-600">Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ADR 0004: Eventarc Concurrency Guard"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-stone-600">Knowledge Content</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe the decision, heuristic, or learned constraint..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-stone-600">Tags (comma-separated)</label>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. adr, eventarc, concurrency, fail-closed"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddingMemory(false)}
                  className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-sans font-semibold transition-all border border-stone-900"
                >
                  Save to Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
