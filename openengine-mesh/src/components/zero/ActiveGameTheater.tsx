import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Users,
  Code2,
  Gamepad2,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { GameWorkspace, MultiplayerLobby } from '../../types';
import { StumbleBlobsCanvas } from './StumbleBlobsCanvas';
import { JumpyFishCanvas } from './JumpyFishCanvas';
import { AvianPhysicsCanvas } from './AvianPhysicsCanvas';

interface ActiveGameTheaterProps {
  game: GameWorkspace;
  lobby?: MultiplayerLobby | null;
  onExit: () => void;
  onOpenInspector: () => void;
}

export const ActiveGameTheater: React.FC<ActiveGameTheaterProps> = ({
  game,
  lobby,
  onExit,
  onOpenInspector,
}) => {
  const [remountKey, setRemountKey] = useState<number>(0);
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false);

  const handleRestart = () => {
    setRemountKey((k) => k + 1);
  };

  const isStumble = game.id === 'stumble-blobs-3d' || (game.dimension === '3d' && game.id.includes('stumble'));
  const isJumpy = game.id === 'jumpy' || game.id.includes('jumpy') || game.id.includes('dudes');

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/90 font-sans bg-stone-900 shadow-2xl">
      {/* Top Header Match Bar */}
      <div className="p-3.5 bg-stone-950/90 border-b border-stone-800/90 flex flex-wrap items-center justify-between gap-3 text-white">
        {/* Left: Exit & Title */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onExit}
            className="subtle-depth-interactive flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-all"
            title="Exit match and return to studio"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-sm font-semibold text-white tracking-tight">
              {game.title}
            </h2>
            <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
              {game.dimension.toUpperCase()} {game.dimension === '3d' ? 'Avian3D' : 'Avian2D'}
            </span>
          </div>
        </div>

        {/* Center: Live Multiplayer or Practice Badge */}
        <div className="flex items-center space-x-2 text-xs">
          {lobby ? (
            <div className="flex items-center space-x-2 bg-stone-900/90 border border-stone-700 px-3 py-1 rounded-xl">
              <span className="text-[11px] font-mono text-[#0ABAB5] font-semibold">
                {lobby.roomCode}
              </span>
              <span className="text-stone-600">·</span>
              <span className="flex items-center space-x-1 text-stone-300 text-[11px]">
                <Users className="w-3 h-3 text-stone-400" />
                <span>{lobby.peers.length} Players</span>
              </span>
              <span className="text-stone-600">·</span>
              <span className="flex items-center space-x-1 text-stone-300 text-[11px]">
                <Radio className="w-3 h-3 text-[#FF5F1F]" />
                <span className="capitalize">{lobby.lightyearConfig?.transport || 'WebTransport'}</span>
              </span>
              <span className="text-stone-600">·</span>
              <span className="text-emerald-400 text-[10px] font-mono">60Hz Tick</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-stone-900/90 border border-stone-800 px-3 py-1 rounded-xl text-stone-400 text-xs">
              <Gamepad2 className="w-3.5 h-3.5 text-[#0ABAB5]" />
              <span>Solo Interactive Run</span>
            </div>
          )}
        </div>

        {/* Right: Quick Controls, Reset, ECS */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowControlsModal(!showControlsModal)}
            className={`subtle-depth-interactive flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              showControlsModal
                ? 'bg-stone-800 text-[#0ABAB5] border-stone-600'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Controls</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="subtle-depth-interactive flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-medium border border-stone-800 transition-all"
            title="Respawn / Restart physics simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <button
            type="button"
            onClick={onOpenInspector}
            className="subtle-depth-interactive flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-medium border border-stone-800 transition-all"
            title="Inspect Bevy ECS code"
          >
            <Code2 className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span>Bevy Code</span>
          </button>
        </div>
      </div>

      {/* Main Game Stage Area */}
      <div className="flex-1 relative min-h-[580px] bg-stone-950 overflow-hidden">
        {/* Render Appropriate Canvas */}
        <div key={remountKey} className="w-full h-full">
          {isStumble ? (
            <StumbleBlobsCanvas
              gameTitle={game.title}
              physicsConfig={game.physicsConfig}
            />
          ) : isJumpy ? (
            <JumpyFishCanvas
              gameTitle={game.title}
              physicsConfig={game.physicsConfig}
            />
          ) : game.dimension === '3d' ? (
            <StumbleBlobsCanvas
              gameTitle={game.title}
              physicsConfig={game.physicsConfig}
            />
          ) : (
            <AvianPhysicsCanvas
              gameTitle={game.title}
              physicsConfig={game.physicsConfig}
            />
          )}
        </div>

        {/* Controls Overlay Guide (Toggleable) */}
        {showControlsModal && (
          <div className="absolute top-4 right-4 z-40 w-80 p-4 rounded-2xl bg-stone-950/95 border border-stone-800 text-stone-200 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                <Gamepad2 className="w-3.5 h-3.5 text-[#0ABAB5]" />
                <span>Control Scheme</span>
              </div>
              <button
                type="button"
                onClick={() => setShowControlsModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {isStumble ? (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Locomotion</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-stone-200">WASD / Arrow Keys</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Jump</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-stone-200">Spacebar</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Belly Slide / Dive</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-amber-300">E or Left Shift</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-400">Checkpoints</span>
                    <span className="text-emerald-400">Auto-respawn at latest gate</span>
                  </div>
                </>
              ) : isJumpy ? (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Move / Run</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-stone-200">A / D Keys</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Jump (Multi-jump)</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-stone-200">Space / W</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Character Ability</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-[#0ABAB5]">Q or Left Shift</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Fire Weapon (Recoil)</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-[#FF5F1F]">J or F Key</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-400">Weapon Pickup</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-stone-200">K or E Key</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                    <span className="text-stone-400">Impulse Vector</span>
                    <span className="font-mono bg-stone-900 px-2 py-0.5 rounded text-stone-200">Left Click & Aim</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-400">Arena Rule</span>
                    <span className="text-stone-300">Sumo perimeter ring-out</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status & Key Hints Bar */}
      <div className="px-4 py-2.5 bg-stone-950 border-t border-stone-800 text-xs text-stone-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-stone-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Avian Physics 60Hz Engine Active</span>
          </span>
          <span className="text-stone-700">·</span>
          <span>Mode: {game.gameLoop.modeName}</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-stone-500">
          {isStumble ? (
            <span>Tip: Press <kbd className="px-1 py-0.5 bg-stone-800 text-stone-200 rounded text-[10px]">E</kbd> or <kbd className="px-1 py-0.5 bg-stone-800 text-stone-200 rounded text-[10px]">Shift</kbd> to belly dive over sweepers</span>
          ) : isJumpy ? (
            <span>Tip: Press <kbd className="px-1 py-0.5 bg-stone-800 text-stone-200 rounded text-[10px]">Q</kbd> to unleash your Dude signature ability</span>
          ) : (
            <span>Tip: Click and drag in the arena to apply Avian linear velocity impulses</span>
          )}
        </div>
      </div>
    </div>
  );
};
