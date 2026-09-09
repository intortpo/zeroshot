import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  Plus,
  Check,
  FolderOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Workspace } from '../types';

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

  if (!isOpen) return null;

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
      <div className="bg-[#0b0b0b]/95 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-[#e0e0e0] font-sans">
        {/* Header */}
        <div className="border-b border-white/5 p-5 flex items-center justify-between bg-[#0e0e0e]/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#171717] border border-white/5">
              <Layers className="w-4 h-4 text-[#f5f5f5]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#f5f5f5]">
                Switch Workspace
              </h2>
              <p className="text-xs text-[#737373] font-mono mt-0.5">
                Isolate repositories, agent memory, and kanban boards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#f5f5f5] hover:bg-white/5 transition-colors"
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
                          ? 'border-white/20 bg-[#171717] text-[#f5f5f5] shadow-lg'
                          : 'border-white/5 bg-[#0f0f0f] text-[#a3a3a3] hover:border-white/10 hover:bg-[#141414]'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div
                          className={`p-2 rounded-lg border ${
                            isActive
                              ? 'bg-[#222] border-white/15 text-white'
                              : 'bg-[#121212] border-white/5 text-[#737373]'
                          }`}
                        >
                          <FolderGit2 className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-[#f5f5f5] flex items-center space-x-2">
                            <span>{ws.name}</span>
                            {isActive && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-[#525252] mt-0.5">
                            {ws.repo} · {ws.path}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-[#525252]">
                          {ws.itemCount} items
                        </span>
                        {isActive ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-transparent group-hover:text-[#737373] transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Workspace Action */}
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] text-xs font-mono text-[#a3a3a3] hover:text-[#f5f5f5] transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Initialize New Workspace</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#737373]">Workspace Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zeroshot Core, Motion Graph, Mobile App"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#737373]">Git Repository (Optional)</label>
                <input
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g. foxlight/zero-petri"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#737373]">Directory Root / Path</label>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-[#121212] border border-white/5 text-[#737373]">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/home/hideo/Documents/GitHub/zero-petri"
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-[#f5f5f5] focus:outline-none focus:border-white/25"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#737373] hover:text-[#f5f5f5] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f5f5f5] hover:bg-white text-[#0a0a0a] text-xs font-mono font-bold transition-all"
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
