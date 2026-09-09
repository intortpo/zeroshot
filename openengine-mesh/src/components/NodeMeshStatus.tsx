import React from 'react';
import { Wifi, Zap, Activity } from 'lucide-react';
import { NodeSpec } from '../types';

interface NodeMeshStatusProps {
  localNode: NodeSpec;
  peers: NodeSpec[];
  activeRunsCount: number;
}

export const NodeMeshStatus: React.FC<NodeMeshStatusProps> = ({
  localNode,
  peers,
  activeRunsCount,
}) => {
  return (
    <header className="bg-mesh-card border-b border-mesh-border px-4 py-2.5 flex items-center justify-between text-xs text-gray-300 select-none">
      <div className="flex items-center space-x-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2 font-semibold text-white tracking-wide">
          <Zap className="w-4 h-4 text-mesh-accent animate-pulse" />
          <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            OpenEngine Mesh
          </span>
        </div>

        {/* Local Node Tag */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-900 border border-mesh-border px-2.5 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
          <span className="text-gray-400">Host:</span>
          <span className="text-white font-mono font-medium">{localNode.deviceName}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
              localNode.role === 'rtx_host'
                ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
            }`}
          >
            {localNode.role}
          </span>
          {localNode.hasRtx && localNode.vramFreeMb !== undefined && (
            <span className="text-gray-400 text-[11px]">
              VRAM: <span className="text-emerald-400 font-mono">{Math.round(localNode.vramFreeMb / 1024)}GB</span>
            </span>
          )}
        </div>
      </div>

      {/* Mesh Peer Discovery Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 bg-gray-900/80 border border-mesh-border px-2.5 py-1 rounded-md">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-400">Mesh Peers:</span>
          <span className="text-white font-bold font-mono">{peers.length}</span>
        </div>

        {/* Active Runs */}
        <div className="flex items-center space-x-1.5 bg-gray-900/80 border border-mesh-border px-2.5 py-1 rounded-md">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-gray-400">Active Jobs:</span>
          <span className="text-white font-bold font-mono">{activeRunsCount}</span>
        </div>
      </div>
    </header>
  );
};
