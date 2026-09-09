import React from 'react';
import {
  QrCode,
  Compass,
  Play,
  Pencil,
  Trash2,
  Gamepad2,
} from 'lucide-react';
import { GameWorkspace } from '../../types';

interface PublishedGamesCatalogProps {
  games: GameWorkspace[];
  onPlayGame: (game: GameWorkspace) => void;
  onLaunchLobby: (game: GameWorkspace) => void;
  onSelectStudioGame: (gameId: string) => void;
  onEditGame?: (game: GameWorkspace) => void;
  onDeleteGame?: (gameId: string) => void;
}

export const PublishedGamesCatalog: React.FC<PublishedGamesCatalogProps> = ({
  games,
  onPlayGame,
  onLaunchLobby,
  onSelectStudioGame,
  onEditGame,
  onDeleteGame,
}) => {
  const publishedGames = games.filter((g) => g.status === 'published' || g.playCount > 0);

  return (
    <div className="space-y-6">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h2 className="text-base font-semibold text-stone-900 flex items-center space-x-2">
            <span>Published Bevy & Avian Games</span>
            <span className="text-xs font-normal text-stone-500">
              ({publishedGames.length} Available)
            </span>
          </h2>
          <p className="text-xs text-stone-500 font-normal mt-0.5">
            Compiled WASM & native builds with interactive play, synchronized multiplayer lobbies & QR joining
          </p>
        </div>
      </div>

      {/* Published Games Grid */}
      {publishedGames.length === 0 ? (
        <div className="p-12 text-center subtle-depth-card rounded-2xl border border-dashed border-stone-300">
          <Gamepad2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-stone-700">No Published Games Yet</h3>
          <p className="text-xs text-stone-500 mt-1">Publish a game from the Studio tab to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {publishedGames.map((game) => (
            <div
              key={game.id}
              className="subtle-depth-card rounded-2xl p-5 border border-stone-200/90 flex flex-col justify-between space-y-4 hover:border-stone-400 transition-all subtle-depth-interactive group"
            >
              <div className="space-y-3">
                {/* Header: Dimension & Status & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-white shadow-sm">
                      {game.dimension.toUpperCase()} ECS
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {game.dimension === '2d' ? 'avian2d' : 'avian3d'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {onEditGame && (
                      <button
                        type="button"
                        onClick={() => onEditGame(game)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Edit Game"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteGame && (
                      <button
                        type="button"
                        onClick={() => onDeleteGame(game.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Game"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[11px] text-stone-400 font-sans pl-1">
                      {game.playCount} plays
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 group-hover:text-stone-950 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {game.tagline}
                  </p>
                </div>

                {/* Physics Spec Chips */}
                <div className="flex items-center space-x-2 text-[11px] text-stone-500 pt-1">
                  <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200/80 flex items-center space-x-1">
                    <Compass className="w-3.5 h-3.5 text-[#0ABAB5]" />
                    <span>Gravity: {game.physicsConfig.gravity}</span>
                  </span>
                  <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200/80">
                    Restitution: {game.physicsConfig.restitution}
                  </span>
                </div>
              </div>

              {/* Actions: Play Game, Launch Lobby & Open in Studio */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectStudioGame(game.id)}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium py-1 px-2 rounded-lg hover:bg-stone-100 transition-colors"
                  title="Inspect Bevy ECS Architecture"
                >
                  Inspect ECS
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onLaunchLobby(game)}
                    className="subtle-depth-interactive flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-all"
                    title="Generate QR code and lobby"
                  >
                    <QrCode className="w-3.5 h-3.5 text-stone-500" />
                    <span className="hidden sm:inline">Lobby</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPlayGame(game)}
                    className="subtle-depth-interactive flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
                    title="Launch interactive game session"
                  >
                    <Play className="w-3.5 h-3.5 text-[#0ABAB5] fill-[#0ABAB5]" />
                    <span>Play Game</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
