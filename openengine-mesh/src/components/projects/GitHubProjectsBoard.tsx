import React, { useState } from 'react';
import {
  GitPullRequest,
  Plus,
  Play,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import {
  githubProjectService,
  GitHubProjectItem
} from '../../services/githubProjectService';
import { antigravityCloudService } from '../../services/antigravityCloudService';
import { PetriViewMode } from '../../types';

interface GitHubProjectsBoardProps {
  onLaunchSession?: (item: GitHubProjectItem) => void;
  onNavigateToView?: (view: PetriViewMode) => void;
}

export const GitHubProjectsBoard: React.FC<GitHubProjectsBoardProps> = ({
  onLaunchSession,
  onNavigateToView,
}) => {
  const [items, setItems] = useState<GitHubProjectItem[]>(() =>
    githubProjectService.getProjectItems()
  );
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const refreshItems = () => {
    setItems([...githubProjectService.getProjectItems()]);
  };

  const handleStatusChange = (
    itemId: string,
    newStatus: GitHubProjectItem['status']
  ) => {
    githubProjectService.updateItemStatus(itemId, newStatus);
    refreshItems();
  };

  const handleLaunch = (item: GitHubProjectItem) => {
    if (onLaunchSession) {
      onLaunchSession(item);
    } else {
      const name = `issue-${item.issueNumber || Math.floor(Math.random() * 1000)}`;
      const created = antigravityCloudService.createSession({
        name,
        envType: 'local_docker',
        taskTitle: item.title,
        githubIssueNumber: item.issueNumber,
        githubIssueUrl: item.issueUrl,
      });
      githubProjectService.linkSessionToItem(item.id, created.id);
      refreshItems();
      if (onNavigateToView) {
        onNavigateToView('antigravity');
      }
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    githubProjectService.createProjectItem({
      title: newTitle.trim(),
      body: newBody.trim(),
    });

    refreshItems();
    setNewTitle('');
    setNewBody('');
    setIsAddItemModalOpen(false);
  };

  const columns: Array<{
    status: GitHubProjectItem['status'];
    title: string;
    badgeColor: string;
  }> = [
    { status: 'Todo', title: 'Todo', badgeColor: 'bg-stone-200 text-stone-800' },
    { status: 'In Progress', title: 'In Flight / Active', badgeColor: 'bg-amber-100 text-amber-800 border-amber-500' },
    { status: 'Review', title: 'Review / Gated', badgeColor: 'bg-sky-100 text-sky-800 border-sky-500' },
    { status: 'Done', title: 'Done / Merged', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-500' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F3EC] text-[#1A1D1A] font-mono">
      {/* Board Header Ribbon */}
      <header className="border-b border-[#1A1D1A] bg-[#FAF8F3] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] flex items-center justify-center">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold uppercase tracking-wider">
                GITHUB PROJECT #1: BBS MOMENTUM PORTAL ROADMAP
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] font-bold">
                ORGANIZATION TRACKER
              </span>
            </div>
            <p className="text-[10px] text-[#1A1D1A]/60">
              Live bi-directional synchronization with GitHub Projects & Issues
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshItems}
            className="p-1.5 border border-[#1A1D1A] bg-white hover:bg-stone-100 text-xs cursor-pointer"
            title="Refresh from GitHub"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="px-3 py-1.5 bg-[#1A1D1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-[2px_2px_0px_#1A1D1A] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Roadmap Item</span>
          </button>
        </div>
      </header>

      {/* Kanban Board Columns */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.status === col.status);
          return (
            <div
              key={col.status}
              className="w-80 shrink-0 border border-[#1A1D1A] bg-[#FAF8F3] flex flex-col shadow-[3px_3px_0px_#1A1D1A]"
            >
              <div className="p-3 border-b border-[#1A1D1A] bg-[#EDE8DC] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {col.title}
                </span>
                <span className="text-[10px] font-bold border border-[#1A1D1A] px-1.5 py-0.2 bg-white">
                  {colItems.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 bg-[#F6F3EC]/50">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-[#1A1D1A] bg-white shadow-[2px_2px_0px_#1A1D1A] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-[9px]">
                      {item.issueNumber ? (
                        <a
                          href={item.issueUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>#{item.issueNumber}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-stone-500">Draft Item</span>
                      )}

                      {item.milestoneTitle && (
                        <span className="text-[9px] text-stone-500 truncate max-w-[140px]">
                          {item.milestoneTitle}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold leading-snug">
                      {item.title}
                    </h4>

                    {item.body && (
                      <p className="text-[10px] text-stone-600 font-sans line-clamp-3 leading-relaxed">
                        {item.body}
                      </p>
                    )}

                    {/* Footer / Actions */}
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[9px]">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as GitHubProjectItem['status']
                          )
                        }
                        className="bg-stone-50 border border-stone-300 px-1.5 py-0.5 text-[9px] font-mono focus:outline-none"
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </select>

                      <button
                        onClick={() => handleLaunch(item)}
                        className="px-2 py-1 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_#1A1D1A]"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Launch agy</span>
                      </button>
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <div className="text-center py-8 text-stone-400 text-xs italic">
                    No items in {col.title}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Roadmap Item */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md border-2 border-[#1A1D1A] bg-[#FAF8F3] p-6 shadow-[6px_6px_0px_#1A1D1A]">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-[#1A1D1A] pb-2 mb-4">
              Add GitHub Project Item
            </h2>

            <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. [P1] Security: Implement Cosmos Server forward-auth"
                  autoFocus
                  required
                  className="w-full bg-white border border-[#1A1D1A] px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Description / Verification Checklist
                </label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Details of the task and acceptance criteria..."
                  rows={4}
                  className="w-full bg-white border border-[#1A1D1A] px-3 py-2 text-xs focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1A1D1A]/20">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-3 py-1.5 border border-[#1A1D1A] bg-white text-xs font-bold uppercase hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1D1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#1A1D1A] cursor-pointer"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
