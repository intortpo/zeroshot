import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { Workspace } from '../types';

const SUGGESTED_REPOS = [
  'foxlight/zero-petri',
  'the-open-engine/zeroshot',
  'foxlight/petri-mesh',
  'foxlight/motion-anything',
  'foxlight/petri-smartshield',
  'foxlight/petri-kernel',
];

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string, repo: string, path: string) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const repoDropdownRef = useRef<HTMLDivElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) return null;

  const filteredRepos = SUGGESTED_REPOS.filter((r) =>
    r.toLowerCase().includes(repo.toLowerCase().trim())
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
      // Extract root directory name from webkitRelativePath
      const firstRelPath = files[0].webkitRelativePath;
      const rootDir = firstRelPath ? firstRelPath.split('/')[0] : 'workspace-dir';
      const syntheticPath = `/home/hideo/Documents/GitHub/${rootDir}`;
      setPath(syntheticPath);
      if (!name.trim()) {
        setName(rootDir);
      }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateWorkspace(
      name.trim(),
      repo.trim() || 'local/repo',
      path.trim() || `/workspaces/${name.toLowerCase().replace(/\s+/g, '-')}`
    );
    setName('');
    setRepo('');
    setPath('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 border border-stone-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-stone-800 font-sans">
        {/* Header */}
        <div className="border-b border-stone-200 p-5 flex items-center justify-between bg-stone-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
              <Layers className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-stone-900">
                Switch Workspace
              </h2>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Isolate repositories, agent memory, and kanban boards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!isCreating ? (
            <>
              <div className="space-y-2">
                {workspaces.map((ws) => {
                  const isActive = ws.id === activeWorkspaceId;

                  return (
                    <div
                      key={ws.id}
                      onClick={() => {
                        onSelectWorkspace(ws.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'border-stone-400 bg-stone-100 text-stone-900 font-semibold'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div
                          className={`p-2 rounded-lg border ${
                            isActive
                              ? 'bg-stone-900 border-stone-900 text-white'
                              : 'bg-stone-50 border-stone-200 text-stone-400'
                          }`}
                        >
                          <FolderGit2 className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-stone-900 flex items-center space-x-2">
                            <span>{ws.name}</span>
                            {isActive && (
                              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-stone-200 border border-stone-300 text-stone-800 font-medium">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-sans text-stone-500 mt-0.5">
                            {ws.repo} · {ws.path}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-sans text-stone-500">
                          {ws.itemCount} items
                        </span>
                        {isActive ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-transparent group-hover:text-stone-400 transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Workspace Action */}
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-3 rounded-xl border border-dashed border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-xs font-sans text-stone-600 hover:text-stone-900 transition-all flex items-center justify-center space-x-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Initialize New Workspace</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-sans font-medium text-stone-600">Workspace Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zeroshot Core, Motion Graph, Mobile App"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>

              {/* Searchable Git Repository Combobox */}
              <div className="space-y-1 relative" ref={repoDropdownRef}>
                <label className="text-xs font-sans font-medium text-stone-600">Git Repository (Search or Specify)</label>
                <div className="relative">
                  <input
                    value={repo}
                    onFocus={() => setIsRepoDropdownOpen(true)}
                    onChange={(e) => {
                      setRepo(e.target.value);
                      setIsRepoDropdownOpen(true);
                    }}
                    placeholder="Search or enter repo (e.g. foxlight/zero-petri)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-8 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-400"
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
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-36 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-lg z-50 p-1 font-sans text-xs">
                    {filteredRepos.length > 0 ? (
                      filteredRepos.map((r) => (
                        <div
                          key={r}
                          onClick={() => {
                            setRepo(r);
                            setIsRepoDropdownOpen(false);
                            if (!name.trim()) {
                              const shortName = r.split('/')[1] || r;
                              setName(shortName);
                            }
                          }}
                          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer text-stone-800"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span className="font-mono text-xs">{r}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-stone-400 text-xs italic">
                        Press Enter to use "{repo}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Directory Root Path with Folder Picker Window */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-sans font-medium text-stone-600">Directory Root / Path</label>
                  <span className="text-[10px] text-stone-400">Click Browse to open native folder picker</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    onClick={handlePickFolder}
                    className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
                    title="Open native folder picker window"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <input
                    value={path}
                    onClick={handlePickFolder}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/home/hideo/Documents/GitHub/zero-petri"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 focus:outline-none focus:border-stone-400 cursor-pointer"
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

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-sans font-semibold transition-all border border-stone-900"
                >
                  Create & Open
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
