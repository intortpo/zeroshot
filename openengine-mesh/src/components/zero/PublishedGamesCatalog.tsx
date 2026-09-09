import React from 'react';
import {
  QrCode,
  Compass,
} from 'lucide-react';
import { GameWorkspace } from '../../types';

interface PublishedGamesCatalogProps {
  games: GameWorkspace[];
  onLaunchLobby: (game: GameWorkspace) => void;
  onSelectStudioGame: (gameId: string) => void;
}

export const PublishedGamesCatalog: React.FC<PublishedGamesCatalogProps> = ({
  games,
  onLaunchLobby,
  onSelectStudioGame,
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
            Compiled WASM & native builds with synchronized multiplayer lobbies & QR joining
          </p>
        </div>
      </div>

      {/* Published Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {publishedGames.map((game) => (
          <div
            key={game.id}
            className="subtle-depth-card rounded-2xl p-5 border border-stone-200/90 flex flex-col justify-between space-y-4 hover:border-stone-400 transition-all subtle-depth-interactive group"
          >
            <div className="space-y-3">
              {/* Header: Dimension & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-white shadow-sm">
                    {game.dimension.toUpperCase()} ECS
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {game.dimension === '2d' ? 'avian2d' : 'avian3d'}
                  </span>
                </div>

                <span className="text-[11px] text-stone-400 font-sans">
                  {game.playCount} plays
                </span>
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
                  <Compass className="w-3 h-3 text-[#0ABAB5]" />
                  <span>Gravity: {game.physicsConfig.gravity}</span>
                </span>
                <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200/80">
                  Restitution: {game.physicsConfig.restitution}
                </span>
              </div>
            </div>

            {/* Actions: Launch Lobby with QR & Open in Studio */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectStudioGame(game.id)}
                className="text-xs text-stone-600 hover:text-stone-900 font-medium py-1 px-2.5 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Inspect ECS
              </button>

              <button
                type="button"
                onClick={() => onLaunchLobby(game)}
                className="subtle-depth-interactive flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium shadow-sm transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-[#0ABAB5]" />
                <span>Launch Lobby</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
