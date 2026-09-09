import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  Trash2,
  Check,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { GameWorkspace } from '../../types';

interface EditGameModalProps {
  game: GameWorkspace | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (gameId: string, updates: Partial<GameWorkspace>) => void;
  onDelete?: (gameId: string) => void;
}

export const EditGameModal: React.FC<EditGameModalProps> = ({
  game,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [dimension, setDimension] = useState<'2d' | '3d'>('2d');
  const [gravity, setGravity] = useState<number>(9.81);
  const [restitution, setRestitution] = useState<number>(0.75);
  const [friction, setFriction] = useState<number>(0.2);
  const [linearDamping, setLinearDamping] = useState<number>(0.05);
  const [modeName, setModeName] = useState('');
  const [objective, setObjective] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setTagline(game.tagline);
      setDimension(game.dimension);
      setGravity(game.physicsConfig.gravity);
      setRestitution(game.physicsConfig.restitution);
      setFriction(game.physicsConfig.friction);
      setLinearDamping(game.physicsConfig.linearDamping);
      setModeName(game.gameLoop.modeName);
      setObjective(game.gameLoop.objective);
      setConfirmDelete(false);
    }
  }, [game]);

  if (!isOpen || !game) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(game.id, {
      title: title.trim(),
      tagline: tagline.trim() || game.tagline,
      dimension,
      physicsConfig: {
        ...game.physicsConfig,
        gravity,
        restitution,
        friction,
        linearDamping,
      },
      gameLoop: {
        ...game.gameLoop,
        modeName: modeName.trim() || game.gameLoop.modeName,
        objective: objective.trim() || game.gameLoop.objective,
        cameraPerspective: dimension === '3d' ? '3d_arena' : '2d_topdown',
      },
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(game.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="subtle-depth w-full max-w-xl rounded-2xl p-6 space-y-5 bg-white shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white">
              <Pencil className="w-4 h-4 text-[#0ABAB5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Edit Game Workspace
              </h3>
              <p className="text-[11px] text-stone-500">
                Configure Bevy ECS systems, Avian physics properties, and game mode loop
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Delete Confirmation Warning */}
        {confirmDelete ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-rose-900">
                  Delete &quot;{game.title}&quot;?
                </h4>
                <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                  This will permanently remove this game workspace, its Avian physics configuration,
                  Bevy Rust systems, and chat design history. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors"
              >
                Keep Game
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Title & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-stone-700">Game Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-200/90 focus:outline-none focus:border-stone-900 bg-stone-50/50 text-stone-900"
                placeholder="Game Title"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-stone-700">Tagline / Core Hook</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200/90 focus:outline-none focus:border-stone-900 bg-stone-50/50 text-stone-900"
                placeholder="Brief description"
              />
            </div>
          </div>

          {/* Dimension Toggle */}
          <div className="space-y-1.5">
            <label className="font-medium text-stone-700">Simulation Dimension</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDimension('2d')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  dimension === '2d'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-semibold text-xs flex items-center space-x-1.5">
                  <span>avian2d (2D ECS)</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Tactical platformer or top-down brawler</div>
              </button>

              <button
                type="button"
                onClick={() => setDimension('3d')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  dimension === '3d'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-semibold text-xs flex items-center space-x-1.5">
                  <span>avian3d (3D ECS)</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">3D obstacle dash & spatial colliders</div>
              </button>
            </div>
          </div>

          {/* Physics Properties Sliders */}
          <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-3">
            <div className="flex items-center space-x-2 text-stone-800 font-medium pb-1 border-b border-stone-200/60">
              <Compass className="w-3.5 h-3.5 text-[#0ABAB5]" />
              <span>Avian Physics Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>Gravity</span>
                  <span className="font-medium text-stone-900">{gravity} m/s²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={gravity}
                  onChange={(e) => setGravity(parseFloat(e.target.value))}
                  className="w-full accent-stone-900"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>Restitution (Bounciness)</span>
                  <span className="font-medium text-stone-900">{restitution}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={restitution}
                  onChange={(e) => setRestitution(parseFloat(e.target.value))}
                  className="w-full accent-[#0ABAB5]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>Friction</span>
                  <span className="font-medium text-stone-900">{friction}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={friction}
                  onChange={(e) => setFriction(parseFloat(e.target.value))}
                  className="w-full accent-stone-900"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>Linear Drag</span>
                  <span className="font-medium text-stone-900">{linearDamping}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={linearDamping}
                  onChange={(e) => setLinearDamping(parseFloat(e.target.value))}
                  className="w-full accent-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Game Loop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-stone-700">Game Mode Name</label>
              <input
                type="text"
                value={modeName}
                onChange={(e) => setModeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200/90 focus:outline-none focus:border-stone-900 bg-stone-50/50 text-stone-900"
                placeholder="Mode Name"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-stone-700">Win / Objective Condition</label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200/90 focus:outline-none focus:border-stone-900 bg-stone-50/50 text-stone-900"
                placeholder="Match Objective"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-200">
            {onDelete && !confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="subtle-depth-interactive px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Game</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="subtle-depth-interactive px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-[#0ABAB5]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
