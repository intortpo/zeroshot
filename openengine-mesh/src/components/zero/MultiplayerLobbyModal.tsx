import React, { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Play,
  QrCode,
  Wifi,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MultiplayerLobby } from '../../types';

interface MultiplayerLobbyModalProps {
  lobby: MultiplayerLobby | null;
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (lobby: MultiplayerLobby) => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  lobby,
  isOpen,
  onClose,
  onStartMatch,
}) => {
  const [copied, setCopied] = useState(false);
  const [predictionEnabled, setPredictionEnabled] = useState(true);

  if (!isOpen || !lobby) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(lobby.joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans">
      <div className="subtle-depth w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 bg-white shadow-2xl border border-stone-200/90">
        {/* Lobby Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-semibold text-stone-900">
                Multiplayer Lobby · {lobby.gameTitle}
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-normal">
              Scan the QR code with any mobile device or browser on the network to join
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code & Join Link Section */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-stone-50/70 p-5 rounded-2xl border border-stone-200/80">
          {/* QR Code SVG */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm">
            <QRCodeSVG
              value={lobby.joinUrl}
              size={148}
              level="M"
              includeMargin={false}
              fgColor="#1c1917"
            />
            <div className="mt-2.5 text-[11px] text-stone-500 font-medium flex items-center space-x-1">
              <QrCode className="w-3.5 h-3.5 text-stone-400" />
              <span>Scan to Play</span>
            </div>
          </div>

          {/* Room Details & Copy URL */}
          <div className="sm:col-span-7 space-y-3.5">
            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">
                Room Code
              </div>
              <div className="text-2xl font-bold text-stone-900 tracking-tight flex items-center space-x-2">
                <span>{lobby.roomCode}</span>
                <span className="text-xs font-normal text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  Open
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-stone-500 font-medium">Shareable Join URL</div>
              <div className="flex items-center space-x-2">
                <input
                  readOnly
                  value={lobby.joinUrl}
                  className="flex-1 bg-white border border-stone-200/90 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-sans focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="subtle-depth-interactive flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-800 bg-white border border-stone-200/90 hover:border-stone-400"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 flex items-center space-x-3 pt-1">
              <span className="flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5 text-stone-400" />
                <span>LAN & WebRTC Sync</span>
              </span>
              <span>·</span>
              <span>Tick: {lobby.tickRateHz}Hz</span>
            </div>
          </div>
        </div>

        {/* Player Roster */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-stone-700">
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-stone-600" />
              <span>Connected Players ({lobby.peers.length})</span>
            </div>
            <span className="text-[11px] text-stone-400 font-normal">
              Host: {lobby.hostName}
            </span>
          </div>

          <div className="space-y-2">
            {lobby.peers.map((peer) => (
              <div
                key={peer.id}
                className="subtle-depth-card p-3 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-semibold">
                    {peer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-stone-900 flex items-center space-x-1.5">
                      <span>{peer.name}</span>
                      {peer.role === 'host' && (
                        <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                          Host
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-stone-500 text-[11px]">
                  <span>{peer.pingMs}ms</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      peer.isReady ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    title={peer.isReady ? 'Ready' : 'Connecting'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lobby Actions */}
        <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={predictionEnabled}
              onChange={(e) => setPredictionEnabled(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-0"
            />
            <span>Avian Client-Side Physics Prediction</span>
          </label>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 transition-colors font-medium"
            >
              Close Lobby
            </button>

            <button
              type="button"
              onClick={() => onStartMatch(lobby)}
              className="subtle-depth-interactive flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium flex items-center justify-center space-x-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-[#0ABAB5]" />
              <span>Start Match</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
