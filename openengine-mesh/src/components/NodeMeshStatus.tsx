import React from 'react';
import { Wifi, Zap, Activity, GitGraph, Layers } from 'lucide-react';
import { NodeSpec } from '../types';

interface NodeMeshStatusProps {
  localNode: NodeSpec;
  peers: NodeSpec[];
  activeRunsCount: number;
  activeView: 'graph' | 'tracker';
  onViewChange: (view: 'graph' | 'tracker') => void;
}

export const NodeMeshStatus: React.FC<NodeMeshStatusProps> = ({
  localNode,
  peers,
  activeRunsCount,
  activeView,
  onViewChange,
}) => {
  return (
    <header className="bg-[#090909] border-b border-[#1c1c1c] px-4 py-2.5 flex items-center justify-between text-xs text-[#a3a3a3] select-none">
      <div className="flex items-center space-x-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2 font-medium text-[#f5f5f5] tracking-wide">
          <Zap className="w-3.5 h-3.5 text-[#8e8e8e]" />
          <span className="text-xs font-mono tracking-tight text-[#e5e5e5]">
            OpenEngine Mesh
          </span>
        </div>

        {/* Local Node Tag */}
        <div className="hidden sm:flex items-center space-x-2 bg-[#0e0e0e] border border-[#1f1f1f] px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8e8e8e] animate-pulse" />
          <span className="text-[#525252]">Host:</span>
          <span className="text-[#e5e5e5] font-mono font-medium">{localNode.deviceName}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-medium ${
              localNode.role === 'rtx_host'
                ? 'bg-[#1a1a1a] text-[#d4d4d4] border border-[#2e2e2e]'
                : 'bg-[#141414] text-[#a3a3a3] border border-[#262626]'
            }`}
          >
            {localNode.role}
          </span>
          {localNode.hasRtx && localNode.vramFreeMb !== undefined && (
            <span className="text-[#737373] text-[11px] font-mono">
              VRAM: <span className="text-[#e5e5e5]">{Math.round(localNode.vramFreeMb / 1024)}GB</span>
            </span>
          )}
        </div>
      </div>

      {/* Desktop Workspace View Switcher */}
      <div className="hidden md:flex items-center space-x-1 bg-[#0c0c0c] p-0.5 rounded-md border border-[#1c1c1c]">
        <button
          onClick={() => onViewChange('tracker')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-mono transition-all ${
            activeView === 'tracker'
              ? 'bg-[#1c1c1c] text-[#f5f5f5] border border-[#2e2e2e] shadow-sm'
              : 'text-[#737373] hover:text-[#d4d4d4]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Project Tracker</span>
        </button>

        <button
          onClick={() => onViewChange('graph')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-mono transition-all ${
            activeView === 'graph'
              ? 'bg-[#1c1c1c] text-[#f5f5f5] border border-[#2e2e2e] shadow-sm'
              : 'text-[#737373] hover:text-[#d4d4d4]'
          }`}
        >
          <GitGraph className="w-3.5 h-3.5" />
          <span>Pipeline DAG</span>
        </button>
      </div>

      {/* Mesh Peer Discovery Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 bg-[#0e0e0e] border border-[#1f1f1f] px-2.5 py-1 rounded-md">
          <Wifi className="w-3.5 h-3.5 text-[#737373]" />
          <span className="text-[#525252]">Peers:</span>
          <span className="text-[#e5e5e5] font-mono font-medium">{peers.length}</span>
        </div>

        {/* Active Runs */}
        <div className="flex items-center space-x-1.5 bg-[#0e0e0e] border border-[#1f1f1f] px-2.5 py-1 rounded-md">
          <Activity className="w-3.5 h-3.5 text-[#737373]" />
          <span className="text-[#525252]">Jobs:</span>
          <span className="text-[#e5e5e5] font-mono font-medium">{activeRunsCount}</span>
        </div>
      </div>
    </header>
  );
};
