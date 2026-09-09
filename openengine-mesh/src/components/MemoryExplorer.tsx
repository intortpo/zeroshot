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
  // Semantic / ADR Memories
  {
    id: 'mem-001',
    workspaceId: 'ws-petri',
    type: 'semantic',
    title: 'ADR 0001: Hybrid Mesh Topology with WireGuard P2P',
    content: 'RTX host acts as persistent cognitive server; mobile Android client acts as low-latency thin sensor and gate reviewer. Handshake over encrypted WireGuard tunnel preserves state across transient roaming.',
    tags: ['adr', 'mesh', 'wireguard', 'p2p', 'architecture'],
    timestamp: Date.now() - 86400000 * 2,
    tokens: 412,
    importance: 'critical',
    metadata: {
      author: 'Antigravity Architect',
      status: 'accepted',
      sourcePath: 'docs/adr/0001-hybrid-mesh-p2p.md',
    },
  },
  {
    id: 'mem-002',
    workspaceId: 'ws-petri',
    type: 'semantic',
    title: 'ADR 0002: Soft Frost Fluid Silk Shader Visual Language',
    content: 'Aesthetic convention: high-efficiency WebGL fluid silk shader underneath 2px soft frost backdrop blur. Minimal soft ink dark gray color palette with high contrast monospace indicators. Eliminates visual noise.',
    tags: ['adr', 'shader', 'webgl', 'design', 'frost'],
    timestamp: Date.now() - 86400000,
    tokens: 285,
    importance: 'high',
    metadata: {
      author: 'UI/UX Lead',
      status: 'accepted',
      shaderVersion: 'v2.1',
    },
  },
  {
    id: 'mem-003',
    workspaceId: 'ws-petri',
    type: 'rule',
    title: 'Rule: Four-Parameter Clippy Ceiling & Request Structs',
    content: 'New Rust APIs must respect the four-parameter Clippy ceiling. Use typed request structs rather than raising or bypassing the lint limit. Preserves bounded interfaces and ergonomic refactoring.',
    tags: ['rule', 'rust', 'clippy', 'interfaces'],
    timestamp: Date.now() - 172800000,
    tokens: 198,
    importance: 'critical',
    metadata: {
      source: 'AGENTS.md',
      lintId: 'clippy::too_many_arguments',
    },
  },
  {
    id: 'mem-004',
    workspaceId: 'ws-petri',
    type: 'rule',
    title: 'Rule: Defensive Bounded Stdin/Stdout Concurrent Draining',
    content: 'Provider stdin and stdout must remain concurrent and bounded to prevent large prompts and early outputs from deadlocking. Incomplete stdin is fatal, while parsed identity and diagnostics survive either I/O order.',
    tags: ['rule', 'io', 'concurrency', 'bounded', 'resilience'],
    timestamp: Date.now() - 120000000,
    tokens: 310,
    importance: 'critical',
    metadata: {
      source: 'AGENTS.md',
      guardCeiling: '64 MiB',
    },
  },
  // Episodic Memories (Past Runs & Fixes)
  {
    id: 'mem-005',
    workspaceId: 'ws-petri',
    type: 'episodic',
    title: 'Run Verdict: Speculative Runner Precomputation on RTX 4090',
    content: 'Spun up speculative test environment inside target container. Anticipated dependencies built in 0.28s; 3/3 acceptance property tests passed without regression.',
    tags: ['run', 'speculative', 'rtx4090', 'tests-passed'],
    timestamp: Date.now() - 3600000,
    tokens: 520,
    importance: 'high',
    metadata: {
      runId: 'run-8f921bc4-001',
      commitHash: '4b4b23b8',
      testDuration: '0.28s',
    },
  },
  {
    id: 'mem-006',
    workspaceId: 'ws-petri',
    type: 'episodic',
    title: 'Run Verdict: Fix SIGPIPE during container cancellation',
    content: 'Applied non-blocking pipe drain with 10-minute command ceiling prior to issuing SIGKILL. Tested across 50 simulated container tear-down cycles with zero unhandled signals.',
    tags: ['run', 'sigpipe', 'container', 'bugfix'],
    timestamp: Date.now() - 7200000,
    tokens: 440,
    importance: 'medium',
    metadata: {
      runId: 'run-3a18e902-002',
      commitHash: 'ac226920',
    },
  },
  // Vector Store / Context Memories
  {
    id: 'mem-007',
    workspaceId: 'ws-petri',
    type: 'vector',
    title: 'Vector Embedding: Tailscale WireGuard Roaming Heuristics',
    content: 'Cluster distance: 0.082. Correlated with mobile hotspot handoff latency and DERP relay fallback mechanisms. Used for optimizing P2P peer reconnect backoff timers.',
    tags: ['vector', 'embeddings', 'wireguard', 'cluster'],
    timestamp: Date.now() - 5400000,
    tokens: 165,
    importance: 'medium',
    metadata: {
      dimension: 1536,
      similarityScore: 0.942,
      model: 'text-embedding-3-small',
    },
  },
  {
    id: 'mem-008',
    workspaceId: 'ws-petri',
    type: 'config',
    title: 'Config: Google Workspace DWD Service Account Fingerprint',
    content: 'Delegated scopes: gmail.send, drive.file, calendar.events. Key ID suffix: ...4b9f. In-memory ephemeral secret hydration active.',
    tags: ['config', 'dwd', 'google-workspace', 'oauth'],
    timestamp: Date.now() - 10800000,
    tokens: 220,
    importance: 'high',
    metadata: {
      clientEmail: 'petri-dwd@zero-petri-cloud.iam.gserviceaccount.com',
      status: 'verified',
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
          icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" />,
          style: 'bg-[#15162a] text-indigo-300 border-indigo-500/30',
        };
      case 'episodic':
        return {
          label: 'EPISODIC / RUN',
          icon: <History className="w-3.5 h-3.5 text-emerald-400" />,
          style: 'bg-[#0f1f15] text-emerald-300 border-emerald-500/30',
        };
      case 'rule':
        return {
          label: 'RULE & INVARIANT',
          icon: <FileCode2 className="w-3.5 h-3.5 text-amber-400" />,
          style: 'bg-[#241c10] text-amber-300 border-amber-500/30',
        };
      case 'vector':
        return {
          label: 'VECTOR STORE',
          icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />,
          style: 'bg-[#0f2126] text-cyan-300 border-cyan-500/30',
        };
      case 'config':
        return {
          label: 'CONFIG & STATE',
          icon: <Key className="w-3.5 h-3.5 text-purple-400" />,
          style: 'bg-[#1f1226] text-purple-300 border-purple-500/30',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#f5f5f5] flex items-center space-x-2.5">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>Memory Explorer</span>
            <span className="text-xs font-mono font-normal text-[#737373] bg-[#141414] px-2.5 py-0.5 rounded-full border border-white/5">
              {filteredMemories.length} Nodes Indexed
            </span>
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-1">
            Episodic runs, architectural decision records (ADRs), invariant rules, and vector memory embeddings.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingMemory(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#f5f5f5] hover:bg-white text-[#0a0a0a] text-xs font-mono font-bold transition-all shadow-md hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#0a0a0a]" />
            <span>Add Memory Node</span>
          </button>
        </div>
      </div>

      {/* Memory Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-[#141414] border border-white/5 text-indigo-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#737373]">Indexed Tokens</div>
            <div className="text-base font-bold font-mono text-[#f5f5f5]">
              {totalTokens.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-[#141414] border border-white/5 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#737373]">Cache Hit Rate</div>
            <div className="text-base font-bold font-mono text-[#f5f5f5]">89.4%</div>
          </div>
        </div>

        <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-[#141414] border border-white/5 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#737373]">Vector Cluster Model</div>
            <div className="text-xs font-bold font-mono text-[#f5f5f5] truncate max-w-[150px]">
              text-emb-3-small
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0c]/80 border border-white/5 rounded-2xl p-4 flex items-center space-x-3.5 backdrop-blur-xl">
          <div className="p-2.5 rounded-xl bg-[#141414] border border-white/5 text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#737373]">Workspace Scope</div>
            <div className="text-xs font-bold font-mono text-[#f5f5f5] truncate max-w-[150px]">
              {filterWorkspace ? activeWorkspace?.name || 'Current' : 'All Workspaces'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Type Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setSelectedType(tab.type)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                selectedType === tab.type
                  ? 'bg-[#202020] text-[#f5f5f5] border border-white/20 shadow-md'
                  : 'bg-[#101010]/80 text-[#888888] hover:text-[#e0e0e0] border border-white/5 hover:bg-[#161616]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] text-[#555555]">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Workspace Scope Toggle & Search */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFilterWorkspace((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all flex items-center space-x-2 flex-shrink-0 ${
              filterWorkspace
                ? 'bg-[#181818] border-white/20 text-[#f5f5f5]'
                : 'bg-[#0f0f0f] border-white/5 text-[#777777] hover:text-[#aaaaaa]'
            }`}
            title="Toggle workspace scope filter"
          >
            <span>Scope:</span>
            <span className="font-semibold text-indigo-300">
              {filterWorkspace ? activeWorkspace?.name : 'Global'}
            </span>
          </button>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memory entries..."
              className="w-full bg-[#111111] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-[#f5f5f5] placeholder-[#555555] focus:outline-none focus:border-white/25"
            />
          </div>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-xs font-mono text-[#555555] space-y-2">
            <Brain className="w-6 h-6 text-[#333333]" />
            <span>No memory records match query</span>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const typeStyle = getTypeStyle(mem.type);

            return (
              <div
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="bg-[#0c0c0c]/85 border border-white/5 hover:border-white/15 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all duration-200 backdrop-blur-xl group hover:shadow-2xl cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Top: Type Badge, Importance, and Timestamp */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${typeStyle.style}`}
                      >
                        {typeStyle.icon}
                        <span>{typeStyle.label}</span>
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
                          mem.importance === 'critical'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            : mem.importance === 'high'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                            : 'bg-[#181818] text-[#888888] border border-white/5'
                        }`}
                      >
                        {mem.importance}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] font-mono text-[#555555]">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(mem.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-[#f5f5f5] group-hover:text-white transition-colors leading-snug">
                    {mem.title}
                  </h3>

                  {/* Content snippet */}
                  <div className="bg-[#080808]/90 border border-white/5 rounded-xl p-3 text-xs font-mono text-[#a3a3a3] leading-relaxed line-clamp-3">
                    {mem.content}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-[#141414] border border-white/5 text-[10px] font-mono text-[#777777]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Tokens & Actions */}
                <div className="pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#666666]">
                  <div className="flex items-center space-x-2">
                    <span>{mem.tokens} tokens</span>
                    <span>·</span>
                    <span className="text-[#888888]">{mem.workspaceId}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyContent(mem.content, mem.id, e)}
                      className="p-1.5 rounded-lg text-[#777777] hover:text-[#f5f5f5] hover:bg-white/5 transition-colors"
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
                      className="p-1.5 rounded-lg text-[#777777] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b0b0b]/95 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-[#e0e0e0] font-sans">
            {/* Modal Header */}
            <div className="border-b border-white/5 p-6 flex items-center justify-between bg-[#0e0e0e]/80">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#171717] border border-white/5">
                  <Brain className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase text-[#777777]">
                      {selectedMemory.type}
                    </span>
                    <span className="text-xs font-mono text-[#555555]">
                      #{selectedMemory.id}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-[#f5f5f5] mt-0.5">
                    {selectedMemory.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedMemory(null)}
                className="p-1.5 rounded-lg text-[#777777] hover:text-[#f5f5f5] hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-mono text-[#777777] uppercase mb-2">
                  Memory Payload & Knowledge Content
                </h4>
                <div className="bg-[#080808] border border-white/5 rounded-xl p-4 text-xs font-mono text-[#d4d4d4] leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.content}
                </div>
              </div>

              {selectedMemory.metadata && (
                <div>
                  <h4 className="text-xs font-mono text-[#777777] uppercase mb-2">
                    Provenance & Structured Metadata
                  </h4>
                  <pre className="bg-[#080808] border border-white/5 rounded-xl p-4 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(selectedMemory.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-xs font-mono text-[#777777] uppercase mb-2">
                  Indexed Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMemory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#141414] border border-white/10 text-xs font-mono text-[#a3a3a3]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/5 bg-[#0e0e0e]/80 flex items-center justify-between">
              <span className="text-xs font-mono text-[#666666]">
                Created {new Date(selectedMemory.timestamp).toLocaleString()}
              </span>

              <button
                onClick={() => setSelectedMemory(null)}
                className="px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 text-xs font-mono text-[#f5f5f5] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Node Modal */}
      {isAddingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b0b0b]/95 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-[#e0e0e0] font-sans">
            <div className="border-b border-white/5 p-5 flex items-center justify-between bg-[#0e0e0e]/80">
              <div className="flex items-center space-x-2.5">
                <Brain className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-[#f5f5f5]">
                  Add Memory Node
                </h2>
              </div>
              <button
                onClick={() => setIsAddingMemory(false)}
                className="p-1 rounded-lg text-[#777777] hover:text-[#f5f5f5] hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemorySubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#777777]">Memory Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as MemoryType)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-white/25"
                >
                  <option value="semantic">Semantic (ADR / Concept)</option>
                  <option value="rule">Rule & Invariant Guard</option>
                  <option value="episodic">Episodic (Run Record)</option>
                  <option value="vector">Vector Store Embedding</option>
                  <option value="config">Config & State</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#777777]">Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ADR 0004: Eventarc Concurrency Guard"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#777777]">Knowledge Content</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe the decision, heuristic, or learned constraint..."
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#777777]">Tags (comma-separated)</label>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. adr, eventarc, concurrency, fail-closed"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddingMemory(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#777777] hover:text-[#f5f5f5] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f5f5f5] hover:bg-white text-[#0a0a0a] text-xs font-mono font-bold transition-all"
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
