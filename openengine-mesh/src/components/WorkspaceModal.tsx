import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  FolderGit2,
  Plus,
  Check,
  FolderOpen,
  Layers,
  ArrowRight,
  ChevronDown,
  Search,
  GitBranch,
  ExternalLink,
  Edit3,
  Trash2,
  Lock,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Workspace } from '../types';
import { multiGithubAuth, GitHubRepoItem } from '../services/multiGithubAuthService';

const SUGGESTED_REPOS = [
  'foxlight/zero-petri',
  'the-open-engine/zeroshot',
  'the-open-engine-company/open-engine-core',
  'the-open-engine-company/zeroshot-target',
  'intortpo/zero-petri',
  'foxlight/petri-mesh',
  'foxlight/motion-anything',
  'foxlight/petri-smartshield',
  'foxlight/petri-kernel',
  'fharrison-bbs/bbs-momentum-ino',
];

const COMMON_BRANCHES = ['main', 'master', 'develop', 'release', 'v2-cluster'];

export interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (
    dataOrName:
      | string
      | {
          name: string;
          repo: string;
          path: string;
          branch?: string;
          repoUrl?: string;
          isPrivate?: boolean;
          accountId?: string;
        },
    legacyRepo?: string,
    legacyPath?: string
  ) => void;
  onUpdateWorkspace?: (updated: Workspace) => void;
  onDeleteWorkspace?: (id: string) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
}) => {
  // Form mode: 'list' | 'create' | 'edit'
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [path, setPath] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);

  // Dropdown state
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [repoFilterTab, setRepoFilterTab] = useState<'all' | 'connected' | 'presets'>('all');
  const repoDropdownRef = useRef<HTMLDivElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Load connected repos from multiGithubAuth
  const connectedRemoteRepos: GitHubRepoItem[] = useMemo(() => {
    return multiGithubAuth.getRemoteRepos();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        repoDropdownRef.current &&
        !repoDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRepoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setMode('list');
      setEditingWorkspaceId(null);
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setRepo('');
    setBranch('main');
    setPath('');
    setRepoUrl('');
    setIsPrivate(false);
    setAccountId(undefined);
    setIsRepoDropdownOpen(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setMode('create');
    setEditingWorkspaceId(null);
  };

  const handleStartEdit = (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    setName(ws.name);
    setRepo(ws.repo);
    setBranch(ws.branch || 'main');
    setPath(ws.path);
    setRepoUrl(ws.repoUrl || `https://github.com/${ws.repo}`);
    setIsPrivate(ws.isPrivate ?? false);
    setAccountId(ws.accountId);
    setEditingWorkspaceId(ws.id);
    setMode('edit');
  };

  const handleDelete = (wsId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (workspaces.length <= 1) {
      alert('At least one workspace must remain active.');
      return;
    }
    if (confirm('Are you sure you want to remove this workspace? Your local files will not be deleted.')) {
      onDeleteWorkspace?.(wsId);
    }
  };

  // Helper to normalize any GitHub input (URL, git SSH, or slug) into canonical owner/repo
  const normalizeGithubRepo = (input: string): { slug: string; url: string } => {
    let clean = input.trim();
    clean = clean.replace(/^git@github\.com:/, '');
    clean = clean.replace(/^https?:\/\/github\.com\//, '');
    clean = clean.replace(/\.git$/, '');
    clean = clean.replace(/\/+$/, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const slug = `${parts[0]}/${parts[1]}`;
      return { slug, url: `https://github.com/${slug}` };
    }
    return { slug: clean, url: clean ? `https://github.com/${clean}` : '' };
  };

  const handleRepoInputChange = (val: string) => {
    setRepo(val);
    const normalized = normalizeGithubRepo(val);
    setRepoUrl(normalized.url);

    // Auto-update workspace name if empty or matches previous repo
    const extractedName = normalized.slug.split('/')[1] || normalized.slug;
    if (!name.trim() || name === repo.split('/')[1] || name === repo) {
      setName(extractedName);
    }
    // Auto-suggest local path if empty
    if (!path.trim() || path.startsWith('/home/hideo/Documents/GitHub/')) {
      setPath(`/home/hideo/Documents/GitHub/${extractedName}`);
    }
    setIsRepoDropdownOpen(true);
  };

  const handleSelectRemoteRepo = (r: GitHubRepoItem) => {
    setRepo(r.fullName);
    setRepoUrl(r.cloneUrl || `https://github.com/${r.fullName}`);
    setBranch(r.defaultBranch || 'main');
    setIsPrivate(r.isPrivate);
    setAccountId(r.accountId);
    if (!name.trim() || name === repo.split('/')[1]) {
      setName(r.name);
    }
    setPath(`/home/hideo/Documents/GitHub/${r.name}`);
    setIsRepoDropdownOpen(false);
  };

  const handleSelectPreset = (preset: string) => {
    const normalized = normalizeGithubRepo(preset);
    setRepo(normalized.slug);
    setRepoUrl(normalized.url);
    setBranch('main');
    const repoName = normalized.slug.split('/')[1] || normalized.slug;
    if (!name.trim() || name === repo.split('/')[1]) {
      setName(repoName);
    }
    setPath(`/home/hideo/Documents/GitHub/${repoName}`);
    setIsRepoDropdownOpen(false);
  };

  // Filtered dropdown items
  const filteredConnectedRepos = connectedRemoteRepos.filter(
    (r) =>
      r.fullName.toLowerCase().includes(repo.toLowerCase().trim()) ||
      r.description?.toLowerCase().includes(repo.toLowerCase().trim())
  );

  const filteredPresets = SUGGESTED_REPOS.filter((p) =>
    p.toLowerCase().includes(repo.toLowerCase().trim())
  );

  const handlePickFolder = async () => {
    // Check if in Tauri desktop environment
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const chosenPath = await invoke<string | null>('select_folder');
        if (chosenPath) {
          setPath(chosenPath);
          if (!name.trim()) {
            const folderName = chosenPath.split(/[/\\]/).filter(Boolean).pop() || '';
            setName(folderName);
          }
          return;
        }
      } catch (err) {
        console.warn('Native folder selection fallback', err);
      }
    }
    // Web fallback: click hidden directory input
    folderInputRef.current?.click();
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstRelPath = files[0].webkitRelativePath;
      const rootDir = firstRelPath ? firstRelPath.split('/')[0] : 'workspace-dir';
      const syntheticPath = `/home/hideo/Documents/GitHub/${rootDir}`;
      setPath(syntheticPath);
      if (!name.trim()) {
        setName(rootDir);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const normalized = normalizeGithubRepo(repo.trim() || 'local/repo');
    const finalRepo = normalized.slug || 'local/repo';
    const finalRepoUrl = repoUrl.trim() || normalized.url;
    const finalPath = path.trim() || `/home/hideo/Documents/GitHub/${name.toLowerCase().replace(/\s+/g, '-')}`;
    const finalBranch = branch.trim() || 'main';

    if (mode === 'edit' && editingWorkspaceId) {
      const existing = workspaces.find((w) => w.id === editingWorkspaceId);
      if (existing && onUpdateWorkspace) {
        onUpdateWorkspace({
          ...existing,
          name: name.trim(),
          repo: finalRepo,
          branch: finalBranch,
          repoUrl: finalRepoUrl,
          path: finalPath,
          isPrivate,
          accountId,
          lastSyncedAt: Date.now(),
        });
      }
      setMode('list');
      setEditingWorkspaceId(null);
    } else {
      // Create mode
      onCreateWorkspace({
        name: name.trim(),
        repo: finalRepo,
        branch: finalBranch,
        repoUrl: finalRepoUrl,
        path: finalPath,
        isPrivate,
        accountId,
      });
      resetForm();
      setMode('list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-stone-800 font-sans">
        {/* Header */}
        <div className="border-b border-stone-200 p-5 flex items-center justify-between bg-stone-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
              <Layers className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-stone-900">
                {mode === 'list'
                  ? 'Switch & Manage Workspaces'
                  : mode === 'edit'
                  ? `Configure Workspace: ${name || 'Repo Binding'}`
                  : 'Initialize New Workspace'}
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {mode === 'list'
                  ? 'Select, bind GitHub repositories, and isolate execution memory'
                  : 'Bind a GitHub repository, target branch, and local directory'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {mode === 'list' ? (
            <>
              <div className="space-y-2.5">
                {workspaces.map((ws) => {
                  const isActive = ws.id === activeWorkspaceId;
                  const repoUrlToOpen = ws.repoUrl || `https://github.com/${ws.repo}`;

                  return (
                    <div
                      key={ws.id}
                      onClick={() => {
                        onSelectWorkspace(ws.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'border-stone-400 bg-stone-100 text-stone-900 font-semibold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${
                            isActive
                              ? 'bg-stone-900 border-stone-900 text-white'
                              : 'bg-stone-50 border-stone-200 text-stone-400 group-hover:text-stone-700'
                          }`}
                        >
                          <FolderGit2 className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-900 flex items-center space-x-2">
                            <span className="truncate">{ws.name}</span>
                            {isActive && (
                              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-stone-200 border border-stone-300 text-stone-800 font-semibold">
                                ACTIVE
                              </span>
                            )}
                            {ws.isPrivate !== undefined && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center space-x-1 ${
                                  ws.isPrivate
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {ws.isPrivate ? (
                                  <Lock className="w-2.5 h-2.5 inline mr-0.5" />
                                ) : (
                                  <Globe className="w-2.5 h-2.5 inline mr-0.5" />
                                )}
                                <span>{ws.isPrivate ? 'Private' : 'Public'}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-xs font-sans text-stone-500 mt-1">
                            <span className="font-mono text-[11px] text-stone-700 font-medium">
                              {ws.repo}
                            </span>
                            <span className="text-stone-300">·</span>
                            <span className="inline-flex items-center space-x-0.5 text-stone-600 font-mono text-[11px] bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                              <GitBranch className="w-2.5 h-2.5 text-stone-500" />
                              <span>{ws.branch || 'main'}</span>
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-stone-400 mt-0.5 truncate max-w-sm">
                            {ws.path}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-3">
                        {/* External Link to GitHub */}
                        <a
                          href={repoUrlToOpen}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open repository on GitHub"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200/70 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit Workspace Repo & Branch */}
                        <button
                          onClick={(e) => handleStartEdit(ws, e)}
                          title="Configure repository and branch"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200/70 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Workspace */}
                        {workspaces.length > 1 && (
                          <button
                            onClick={(e) => handleDelete(ws.id, e)}
                            title="Remove workspace"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isActive ? (
                          <Check className="w-4 h-4 text-emerald-600 ml-1" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-transparent group-hover:text-stone-400 transition-colors ml-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Workspace Action */}
              <button
                onClick={handleStartCreate}
                className="w-full py-3 rounded-xl border border-dashed border-stone-300 hover:border-stone-500 hover:bg-stone-50 text-xs font-sans text-stone-600 hover:text-stone-900 transition-all flex items-center justify-center space-x-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Initialize New Workspace</span>
              </button>
            </>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workspace Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-sans font-medium text-stone-700">Workspace Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zeroshot Core, Motion Graph, Mobile App"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-500 focus:bg-white transition-all"
                />
              </div>

              {/* GitHub Repository Combobox with Search */}
              <div className="space-y-1 relative" ref={repoDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-sans font-medium text-stone-700">
                    GitHub Repository (Search or Specify)
                  </label>
                  <span className="text-[10px] text-stone-500">
                    Accepts `owner/repo` or full GitHub URL
                  </span>
                </div>

                <div className="relative">
                  <input
                    value={repo}
                    onFocus={() => setIsRepoDropdownOpen(true)}
                    onChange={(e) => handleRepoInputChange(e.target.value)}
                    placeholder="Search connected repos or enter e.g. foxlight/zero-petri"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-8 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-500 focus:bg-white transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isRepoDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-xl z-50 p-2 font-sans text-xs">
                    {/* Filter Tabs */}
                    <div className="flex items-center space-x-2 border-b border-stone-100 pb-1.5 mb-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setRepoFilterTab('all')}
                        className={`px-2 py-0.5 rounded-md ${
                          repoFilterTab === 'all'
                            ? 'bg-stone-900 text-white font-medium'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        All Repos
                      </button>
                      <button
                        type="button"
                        onClick={() => setRepoFilterTab('connected')}
                        className={`px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                          repoFilterTab === 'connected'
                            ? 'bg-stone-900 text-white font-medium'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Connected ({connectedRemoteRepos.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRepoFilterTab('presets')}
                        className={`px-2 py-0.5 rounded-md ${
                          repoFilterTab === 'presets'
                            ? 'bg-stone-900 text-white font-medium'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        Presets
                      </button>
                    </div>

                    {/* Connected Repositories Section */}
                    {(repoFilterTab === 'all' || repoFilterTab === 'connected') &&
                      filteredConnectedRepos.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2 py-1">
                            Connected GitHub Accounts
                          </div>
                          {filteredConnectedRepos.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => handleSelectRemoteRepo(r)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer text-stone-800 transition-colors"
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                <FolderGit2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                <div className="min-w-0">
                                  <div className="font-mono text-xs font-semibold text-stone-900 flex items-center space-x-1.5">
                                    <span>{r.fullName}</span>
                                    {r.isPrivate ? (
                                      <Lock className="w-2.5 h-2.5 text-amber-600" />
                                    ) : (
                                      <Globe className="w-2.5 h-2.5 text-emerald-600" />
                                    )}
                                  </div>
                                  <div className="text-[10px] text-stone-400 truncate">
                                    {r.accountAlias} · {r.language}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                                {r.defaultBranch || 'main'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Presets Section */}
                    {(repoFilterTab === 'all' || repoFilterTab === 'presets') &&
                      filteredPresets.length > 0 && (
                        <div>
                          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2 py-1">
                            Suggested Zeroshot & Petri Repos
                          </div>
                          {filteredPresets.map((p) => (
                            <div
                              key={p}
                              onClick={() => handleSelectPreset(p)}
                              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer text-stone-800 transition-colors"
                            >
                              <FolderGit2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="font-mono text-xs">{p}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    {repo.trim() && (
                      <div
                        onClick={() => {
                          const norm = normalizeGithubRepo(repo);
                          setRepo(norm.slug);
                          setRepoUrl(norm.url);
                          setIsRepoDropdownOpen(false);
                        }}
                        className="mt-1 pt-1 border-t border-stone-100 px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded cursor-pointer text-xs"
                      >
                        Use custom repository slug: <span className="font-mono font-semibold">{repo}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Target Branch Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-sans font-medium text-stone-700">Git Target Branch</label>
                  <span className="text-[10px] text-stone-500">Autonomous agents will branch from here</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. main, develop"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-500 focus:bg-white"
                    />
                    <GitBranch className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {COMMON_BRANCHES.slice(0, 3).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBranch(b)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                          branch === b
                            ? 'bg-stone-900 text-white font-semibold'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Directory Root Path with Folder Picker Window */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-sans font-medium text-stone-700">Directory Root / Path</label>
                  <span className="text-[10px] text-stone-400">Click Browse to open native folder picker</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    onClick={handlePickFolder}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer shrink-0"
                    title="Open native folder picker window"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <input
                    value={path}
                    onClick={handlePickFolder}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/home/hideo/Documents/GitHub/zero-petri"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-500 focus:bg-white cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handlePickFolder}
                    className="shrink-0 px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
                  >
                    Browse...
                  </button>
                  {/* Web fallback hidden directory input */}
                  <input
                    type="file"
                    ref={folderInputRef}
                    className="hidden"
                    // @ts-expect-error webkitdirectory is standard in browsers but omitted in some TS types
                    webkitdirectory=""
                    directory=""
                    onChange={handleFolderInputChange}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode('list');
                    setEditingWorkspaceId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-sans font-semibold transition-all shadow-sm"
                >
                  {mode === 'edit' ? 'Save Changes' : 'Create & Open'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
