import React, { useState } from 'react';
import {
  Plus,
  Gamepad2,
  Sparkles,
  Layers,
  Send,
  X,
} from 'lucide-react';
import { GameWorkspace } from '../../types';

interface GameWorkspaceSelectorProps {
  workspaces: GameWorkspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (workspace: Partial<GameWorkspace>) => void;
  onPublishCurrent: (id: string) => void;
}

export const GameWorkspaceSelector: React.FC<GameWorkspaceSelectorProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onPublishCurrent,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDimension, setNewDimension] = useState<'2d' | '3d'>('2d');

  const active = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    onCreateWorkspace({
      id: slug || `game-${Date.now()}`,
      title: newTitle.trim(),
      tagline: newTagline.trim() || 'Custom Bevy & Avian physics game',
      dimension: newDimension,
      status: 'drafting',
    });

    setNewTitle('');
    setNewTagline('');
    setIsCreateOpen(false);
  };

  return (
    <div className="w-full pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Workspaces Horizontal Strip */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
          {workspaces.map((ws) => {
            const isSelected = ws.id === activeWorkspaceId;
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => onSelectWorkspace(ws.id)}
                className={`subtle-depth-interactive flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-sans whitespace-nowrap border ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white/80 text-stone-700 hover:text-stone-950 border-stone-200/90'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-[#0ABAB5]' : 'bg-stone-400'
                  }`}
                />
                <span className="font-medium">{ws.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-normal uppercase ${
                    isSelected
                      ? 'bg-stone-800 text-stone-300'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {ws.dimension}
                </span>
                {ws.status === 'published' && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Live
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="subtle-depth-interactive flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-sans text-stone-600 hover:text-stone-900 bg-white/60 hover:bg-white border border-stone-200/90"
            title="Create new Bevy & Avian game workspace"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>
        </div>

        {/* Workspace Quick Actions */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden lg:flex items-center space-x-2 text-xs text-stone-500 font-sans">
            <span className="flex items-center space-x-1">
              <Gamepad2 className="w-3.5 h-3.5 text-stone-400" />
              <span>Bevy {active?.bevyVersion || '0.15'}</span>
            </span>
            <span>·</span>
            <span className="text-stone-700 font-medium">
              {active?.dimension === '2d' ? 'avian2d' : 'avian3d'} {active?.avianVersion || '0.2'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => active && onPublishCurrent(active.id)}
            disabled={active?.status === 'published'}
            className={`subtle-depth-interactive flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium font-sans border transition-all ${
              active?.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-90'
                : 'bg-stone-900 text-white hover:bg-stone-800 border-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span>{active?.status === 'published' ? 'Published' : 'Publish Game'}</span>
          </button>
        </div>
      </div>

      {/* Modal: New Game Workspace */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="subtle-depth w-full max-w-md rounded-2xl p-6 space-y-5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-stone-800" />
                <h3 className="text-sm font-semibold text-stone-900 font-sans">
                  Create Game Workspace
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-medium text-stone-700">Game Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Neon Bounce Arena"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200/90 focus:outline-none focus:border-stone-900 bg-stone-50/50 text-stone-900 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-stone-700">Tagline / Core Hook</label>
                <input
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Physics ball arena with restitution bumpers"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200/90 focus:outline-none focus:border-stone-900 bg-stone-50/50 text-stone-900 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-stone-700">Physics Engine & Dimension</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewDimension('2d')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newDimension === '2d'
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50/80 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">avian2d (2D ECS)</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Top-down or side-scroller</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDimension('3d')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newDimension === '3d'
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50/80 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">avian3d (3D ECS)</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">3D arena & spatial collisions</div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-medium flex items-center space-x-1.5 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
