import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Sliders,
  RotateCcw,
  Radio,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowDownUp,
  Cpu,
} from 'lucide-react';
import { LightyearConfig, LightyearTransport, PredictionMode } from '../../types';

interface LightyearNetPanelProps {
  config: LightyearConfig;
  onUpdateConfig: (updated: Partial<LightyearConfig>) => void;
  showGhostEntity: boolean;
  onToggleGhostEntity: (show: boolean) => void;
}

export const LightyearNetPanel: React.FC<LightyearNetPanelProps> = ({
  config,
  onUpdateConfig,
  showGhostEntity,
  onToggleGhostEntity,
}) => {
  // Live simulated network jitter and telemetry
  const [liveRtt, setLiveRtt] = useState<number>(config.latencySimMs);
  const [liveLoss, setLiveLoss] = useState<number>(config.packetLossSimPercent);
  const [bandwidthKbps, setBandwidthKbps] = useState<number>(48.5);
  const [serverTick, setServerTick] = useState<number>(1420);
  const [clientTick, setClientTick] = useState<number>(1424);
  const [rollbacksCount, setRollbacksCount] = useState<number>(0);
  const [recentRollbackFlash, setRecentRollbackFlash] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight realistic network fluctuation around configured base
      const jitter = (Math.random() - 0.5) * 6;
      const currentRtt = Math.max(8, Math.round(config.latencySimMs + jitter));
      setLiveRtt(currentRtt);

      // Packet loss fluctuation
      const currentLoss = Math.max(0, config.packetLossSimPercent + (Math.random() < 0.2 ? 0.5 : -0.2));
      setLiveLoss(Number(currentLoss.toFixed(1)));

      // Bandwidth
      setBandwidthKbps(Number((45 + Math.random() * 8).toFixed(1)));

      // Ticks
      setServerTick((s) => s + 1);
      setClientTick((c) => c + 1);

      // Rollback trigger simulation if latency/loss are non-zero
      if (config.latencySimMs > 40 && Math.random() < 0.25) {
        setRollbacksCount((r) => r + 1);
        setRecentRollbackFlash(true);
        setTimeout(() => setRecentRollbackFlash(false), 300);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [config.latencySimMs, config.packetLossSimPercent]);

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl p-4 subtle-depth font-sans text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#0ABAB5] animate-pulse" />
          <div className="font-semibold text-stone-900 flex items-center space-x-1.5">
            <span>Lightyear Network Engine</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-normal bg-stone-100 text-stone-600 border border-stone-200">
              v0.29 (Bevy + Avian)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-stone-500 font-sans">
            {bandwidthKbps} kb/s
          </span>
          <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Server Synced</span>
          </span>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/70">
          <div className="text-[10px] text-stone-500 uppercase font-medium flex items-center justify-between">
            <span>RTT (Ping)</span>
            <Wifi className="w-3 h-3 text-[#0ABAB5]" />
          </div>
          <div className="text-base font-bold text-stone-900 mt-1">
            {liveRtt} <span className="text-[10px] font-normal text-stone-500">ms</span>
          </div>
        </div>

        <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/70">
          <div className="text-[10px] text-stone-500 uppercase font-medium flex items-center justify-between">
            <span>Packet Loss</span>
            <ArrowDownUp className="w-3 h-3 text-[#FF5F1F]" />
          </div>
          <div className="text-base font-bold text-stone-900 mt-1">
            {liveLoss}%
          </div>
        </div>

        <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/70">
          <div className="text-[10px] text-stone-500 uppercase font-medium flex items-center justify-between">
            <span>Tick Offset</span>
            <Cpu className="w-3 h-3 text-purple-500" />
          </div>
          <div className="text-base font-bold text-stone-900 mt-1">
            +{clientTick - serverTick} <span className="text-[10px] font-normal text-stone-500">ticks</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all ${
          recentRollbackFlash
            ? 'bg-amber-100 border-amber-300'
            : 'bg-stone-50/80 border-stone-200/70'
        }`}>
          <div className="text-[10px] text-stone-500 uppercase font-medium flex items-center justify-between">
            <span>Rollbacks</span>
            <RotateCcw className={`w-3 h-3 ${recentRollbackFlash ? 'text-amber-600 animate-spin' : 'text-stone-400'}`} />
          </div>
          <div className="text-base font-bold text-stone-900 mt-1 flex items-center space-x-1.5">
            <span>{rollbacksCount}</span>
            {recentRollbackFlash && (
              <span className="text-[9px] font-semibold text-amber-700 bg-amber-200/80 px-1 py-0.2 rounded">
                RECONCILED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Network Degradation & Simulation Controls */}
      <div className="bg-stone-50/60 p-3 rounded-xl border border-stone-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-800 flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-stone-600" />
            <span>Simulate Real-World Network Conditions</span>
          </span>
          <button
            type="button"
            onClick={() => onUpdateConfig({ latencySimMs: 0, packetLossSimPercent: 0 })}
            className="text-[10px] text-stone-500 hover:text-stone-900 hover:underline"
          >
            Reset (0ms LAN)
          </button>
        </div>

        {/* Latency Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-stone-600">Simulated Latency:</span>
            <span className="font-semibold text-stone-900">{config.latencySimMs} ms</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={config.latencySimMs}
            onChange={(e) => onUpdateConfig({ latencySimMs: Number(e.target.value) })}
            className="w-full accent-[#0ABAB5] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-stone-400">
            <span>0ms (LAN)</span>
            <span>60ms (National)</span>
            <span>150ms (Transatlantic)</span>
            <span>300ms (High Lag)</span>
          </div>
        </div>

        {/* Packet Loss Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-stone-600">Packet Loss Simulation:</span>
            <span className="font-semibold text-stone-900">{config.packetLossSimPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={config.packetLossSimPercent}
            onChange={(e) => onUpdateConfig({ packetLossSimPercent: Number(e.target.value) })}
            className="w-full accent-[#FF5F1F] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Protocol Transport & Prediction Mode Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Transport Protocol */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-stone-700 flex items-center space-x-1">
            <Radio className="w-3 h-3 text-[#0ABAB5]" />
            <span>Transport Protocol</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            {(['webtransport', 'websocket', 'udp_netcode'] as LightyearTransport[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onUpdateConfig({ transport: t })}
                className={`py-1 text-[10px] font-medium rounded-lg capitalize transition-all ${
                  config.transport === t
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t === 'webtransport' ? 'WebTransport' : t === 'websocket' ? 'WebSocket' : 'Netcode'}
              </button>
            ))}
          </div>
        </div>

        {/* Authority / Prediction Strategy */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-stone-700 flex items-center space-x-1">
            <RotateCcw className="w-3 h-3 text-[#FF5F1F]" />
            <span>Replication Strategy</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            {(['full_rollback', 'snapshot_interpolation', 'lockstep'] as PredictionMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onUpdateConfig({ predictionMode: m })}
                className={`py-1 text-[10px] font-medium rounded-lg capitalize transition-all ${
                  config.predictionMode === m
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {m === 'full_rollback' ? 'Rollback' : m === 'snapshot_interpolation' ? 'Snapshot' : 'Lockstep'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualizer Toggles */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleGhostEntity(!showGhostEntity)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            showGhostEntity
              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
          }`}
        >
          {showGhostEntity ? <Eye className="w-3.5 h-3.5 text-[#0ABAB5]" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{showGhostEntity ? 'Server Truth Shadow: ON' : 'Show Server Truth Shadow'}</span>
        </button>

        <div className="flex items-center space-x-3 text-[11px] text-stone-500">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#0ABAB5]" />
            <span>Client Predicted</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            <span>Server Authoritative</span>
          </span>
        </div>
      </div>
    </div>
  );
};
