import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lock,
  ZoomIn,
  ZoomOut,
  Scissors,
} from 'lucide-react';
import { VideoScene } from '../../../services/hyperframeVideoService';

interface MultiTrackTimelineProps {
  scenes: VideoScene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  lutName: string;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  lutName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(1.2);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [v2Visible, setV2Visible] = useState(true);

  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  // Playhead animation loop
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        setCurrentTime(prev => {
          const next = prev + 0.05;
          return next >= totalDuration ? 0 : next;
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, totalDuration]);

  // Audio Waveform rendering
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Render procedural soundwave bars
    const barCount = 120;
    const barWidth = width / barCount;
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const progress = i / barCount;
      const waveVal =
        Math.sin(progress * 18 + currentTime * 2) * 0.4 +
        Math.cos(progress * 36) * 0.3 +
        Math.sin(progress * 6) * 0.3;
      const barH = Math.max(4, Math.abs(waveVal) * (height * 0.8));
      const y = (height - barH) / 2;

      ctx.fillStyle = progress < currentTime / totalDuration ? '#14b8a6' : '#334155';
      ctx.fillRect(x + 1, y, barWidth - 2, barH);
    }
  }, [currentTime, totalDuration]);

  // Format timecode (MM:SS:FF)
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        {/* Playback buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTime(0)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Beginning"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setCurrentTime(totalDuration)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="End"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Timecode Readout */}
          <div className="ml-3 font-mono text-sm font-semibold text-teal-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
            {formatTimecode(currentTime)} <span className="text-slate-500">/</span> {formatTimecode(totalDuration)}
          </div>
        </div>

        {/* Timeline Tools (Zoom, Cut, Mute) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Audio Mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
          </button>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-1">{(zoomLevel * 100).toFixed(0)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
            title="Split Clip at Playhead"
          >
            <Scissors className="w-3.5 h-3.5 text-teal-400" />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* Multi-Track Canvas & Track Headers */}
      <div className="relative overflow-x-auto">
        {/* Track Headers + Lanes */}
        <div className="min-w-[680px] space-y-2">
          {/* TRACK V1: Primary Scenes */}
          <div className="flex items-center gap-2">
            <div className="w-28 flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                V1 Main
              </span>
              <Lock className="w-3 h-3 text-slate-500" />
            </div>

            {/* Clips Container */}
            <div className="flex-1 flex gap-1 h-12 bg-slate-950/60 rounded-lg p-1 border border-slate-800 relative">
              {scenes.map(scene => {
                const widthPercent = (scene.durationSeconds / totalDuration) * 100;
                const isSelected = scene.id === activeSceneId;
                return (
                  <div
                    key={scene.id}
                    onClick={() => onSelectScene(scene.id)}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full rounded px-2 py-1 text-xs font-medium cursor-pointer transition-all flex flex-col justify-between overflow-hidden border ${
                      isSelected
                        ? 'bg-teal-900/60 border-teal-400 text-teal-200 shadow-md ring-1 ring-teal-400/40'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold truncate">
                      <span>#{scene.order} {scene.title}</span>
                      <span className="font-mono text-[10px] text-teal-300">{scene.durationSeconds.toFixed(1)}s</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 truncate">
                      {scene.transitionToNext} • {scene.cameraFlight}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK V2: B-Roll & Waterline Overlays */}
          <div className="flex items-center gap-2">
            <div className="w-28 flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                V2 Overlays
              </span>
              <button onClick={() => setV2Visible(!v2Visible)} className="text-slate-400 hover:text-slate-200">
                {v2Visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
              </button>
            </div>

            <div className="flex-1 h-10 bg-slate-950/60 rounded-lg p-1 border border-slate-800 relative flex items-center">
              <div
                style={{ width: '45%', marginLeft: '25%' }}
                className={`h-full rounded px-2 py-1 text-[11px] flex items-center justify-between border ${
                  v2Visible
                    ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300'
                    : 'opacity-30 bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span>Waterline Particle Spray Alpha</span>
                <span className="font-mono text-[10px]">Add Blend</span>
              </div>
            </div>
          </div>

          {/* TRACK A1: Audio Score & Procedural Waveform */}
          <div className="flex items-center gap-2">
            <div className="w-28 flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                A1 Master
              </span>
              <Volume2 className="w-3 h-3 text-emerald-400" />
            </div>

            <div className="flex-1 h-12 bg-slate-950/60 rounded-lg border border-slate-800 relative overflow-hidden">
              <canvas ref={waveformCanvasRef} width={800} height={48} className="w-full h-full" />
            </div>
          </div>

          {/* TRACK FX: LUT & Optical Shaders */}
          <div className="flex items-center gap-2">
            <div className="w-28 flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                FX Master
              </span>
              <span className="text-[10px] font-mono text-purple-300">3D LUT</span>
            </div>

            <div className="flex-1 h-8 bg-purple-950/30 rounded-lg px-3 border border-purple-500/40 flex items-center justify-between text-xs text-purple-300 font-mono">
              <span>LUT: {lutName} + Anamorphic Streak Shader</span>
              <span className="text-[10px] text-purple-400">Global Continuous Pass</span>
            </div>
          </div>
        </div>

        {/* Global Playhead Scrubber */}
        <div
          style={{
            left: `calc(120px + ${(currentTime / totalDuration) * 100 * 0.82}%)`,
          }}
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-20 flex flex-col items-center"
        >
          <div className="w-3 h-3 bg-red-500 rotate-45 -mt-1 shadow-md shadow-red-500/50" />
        </div>
      </div>
    </div>
  );
};
