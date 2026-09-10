import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Sliders,
  Download,
  Film,
  Volume2,
  VolumeX,
  Type,
  Video,
  CheckCircle2,
  Wand2,
} from 'lucide-react';

export interface TimelineTrackItem {
  id: string;
  name: string;
  type: 'video' | 'overlay' | 'audio' | 'effect';
  startSec: number;
  durationSec: number;
  color: string;
  details: string;
}

export const HyperframeVideoSuite: React.FC = () => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(4.3);
  const totalDurationSec = 15.0;
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '2.39:1'>('16:9');

  // Neural Generator State
  const [selectedModel, setSelectedModel] = useState<'veo-2' | 'sora-2' | 'wan-2.1' | 'luma-dream'>('veo-2');
  const [cameraMotion, setCameraMotion] = useState<'orbit_smooth' | 'dolly_in' | 'pan_left' | 'crane_overhead' | 'dutch_roll'>('orbit_smooth');
  const [motionPrompt, setMotionPrompt] = useState(
    'Cinematic fluid ribbon simulation with soft cyan and tiffany lighting, 60fps slow motion, 4k render'
  );
  const [hyperframeRate, setHyperframeRate] = useState<24 | 60 | 120>(60);
  const [motionStrength, setMotionStrength] = useState(0.85);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [lastRenderedTime, setLastRenderedTime] = useState<string | null>('Just now');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm' | 'gif' | 'png_seq'>('mp4');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Timeline Tracks
  const [tracks] = useState<TimelineTrackItem[]>([
    {
      id: 'trk-video-1',
      name: 'Primary Motion Stream',
      type: 'video',
      startSec: 0,
      durationSec: 15,
      color: 'bg-indigo-500/80 border-indigo-400',
      details: 'Google Veo 2: Fluid cyan simulation (1080p60)',
    },
    {
      id: 'trk-overlay-1',
      name: 'Title & Lower Third',
      type: 'overlay',
      startSec: 1.5,
      durationSec: 8.5,
      color: 'bg-teal-500/80 border-teal-400',
      details: 'Text: "Zero Petri v8 · Hyperframe Engine"',
    },
    {
      id: 'trk-audio-1',
      name: 'Ambient Score',
      type: 'audio',
      startSec: 0,
      durationSec: 15,
      color: 'bg-rose-500/80 border-rose-400',
      details: 'BBS Momentum Theme · 120 BPM Stereo (M4A)',
    },
    {
      id: 'trk-effect-1',
      name: 'Hyperframe Interpolation',
      type: 'effect',
      startSec: 0,
      durationSec: 15,
      color: 'bg-amber-500/80 border-amber-400',
      details: 'Optical Flow 60fps frame synthesis',
    },
  ]);

  // Animation playback loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          const next = prev + 0.05 * playbackSpeed;
          if (next >= totalDurationSec) {
            return 0;
          }
          return parseFloat(next.toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleRenderVideo = () => {
    setIsRendering(true);
    setRenderProgress(0);
    const step = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(step);
          setIsRendering(false);
          setLastRenderedTime(new Date().toLocaleTimeString());
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleExport = () => {
    setIsExportOpen(false);
    setExportNotification(`Rendered & exported ${exportFormat.toUpperCase()} to local downloads (${aspectRatio}, ${hyperframeRate}fps).`);
    setTimeout(() => setExportNotification(null), 4000);
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    const frames = Math.floor((seconds % 1) * hyperframeRate).toString().padStart(2, '0');
    return `${mins}:${secs}:${frames}`;
  };

  const aspectClass = {
    '16:9': 'aspect-video w-full max-w-2xl',
    '9:16': 'aspect-[9/16] w-64',
    '1:1': 'aspect-square w-96',
    '2.39:1': 'aspect-[2.39/1] w-full max-w-2xl',
  }[aspectRatio];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0E1117] text-stone-200 overflow-hidden select-none font-sans">
      {/* Top Suite Toolbar */}
      <header className="px-6 py-2.5 bg-[#151922] border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold text-sm tracking-tight text-white flex items-center space-x-1.5">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Hyperframe Video Design Suite</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
              Pro v8
            </span>
          </div>

          <span className="text-stone-700">|</span>

          {/* Model Badge */}
          <div className="flex items-center space-x-1 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-stone-400">Neural Engine:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-stone-900 border border-stone-700 text-stone-200 rounded-md px-2 py-0.5 text-xs font-mono cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="veo-2">Google Veo 2 (60fps Ultra)</option>
              <option value="sora-2">OpenAI Sora v2 (Temporal Coherent)</option>
              <option value="wan-2.1">Wan 2.1 Pro (Cinematic)</option>
              <option value="luma-dream">Luma Dream Machine</option>
            </select>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-[11px]">
            {(['16:9', '9:16', '1:1', '2.39:1'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Clip</span>
          </button>
        </div>
      </header>

      {/* Notification Banner */}
      {exportNotification && (
        <div className="px-6 py-2 bg-teal-950/80 border-b border-teal-700/60 text-teal-300 text-xs flex items-center justify-between animate-in fade-in shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{exportNotification}</span>
          </div>
          <button onClick={() => setExportNotification(null)} className="text-teal-400 hover:text-teal-200 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace (Split Preview + Director Controls) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Preview Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0B0D13] relative overflow-hidden">
          {/* Video Canvas Container */}
          <div
            className={`relative rounded-xl border border-stone-800 bg-black overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300 ${aspectClass}`}
          >
            {/* Simulated Generative Canvas Animation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/70 via-stone-900 to-teal-950/50 flex flex-col items-center justify-center text-center p-6">
              {/* Animated Floating Elements */}
              <div
                className="w-48 h-48 rounded-full bg-gradient-to-r from-teal-500/20 to-indigo-500/20 blur-2xl animate-pulse"
                style={{
                  transform: `scale(${1 + Math.sin(currentTimeSec * 2) * 0.15}) rotate(${currentTimeSec * 20}deg)`,
                }}
              />
              
              <div className="relative z-10 space-y-2">
                <span className="text-[11px] font-mono tracking-widest uppercase text-teal-400/90 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-800/40">
                  {selectedModel.toUpperCase()} · HYPERFRAME {hyperframeRate} FPS
                </span>
                <h3 className="text-lg font-bold text-white tracking-wide drop-shadow-md">
                  Zero Petri v8 · Neural Motion
                </h3>
                <p className="text-xs text-stone-300/80 max-w-md line-clamp-2 italic">
                  "{motionPrompt}"
                </p>
              </div>

              {/* Dynamic Lower Third Overlay */}
              {currentTimeSec >= 1.5 && currentTimeSec <= 10.0 && (
                <div className="absolute bottom-6 left-6 bg-stone-900/90 backdrop-blur-md border border-stone-700/80 px-4 py-2 rounded-xl text-left shadow-lg animate-in fade-in duration-300">
                  <div className="text-[10px] text-teal-400 font-mono">BBS MOMENTUM CORE</div>
                  <div className="text-xs font-semibold text-white">849 Student Records · 0ms Latency</div>
                </div>
              )}

              {/* Watermark / HUD */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 text-[10px] font-mono text-stone-400 bg-black/60 px-2.5 py-1 rounded-md border border-stone-800">
                <span>{cameraMotion.replace('_', ' ').toUpperCase()}</span>
                <span>•</span>
                <span className="text-teal-400">{hyperframeRate} FPS</span>
              </div>
            </div>

            {/* Rendering Progress Overlay */}
            {isRendering && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20 space-y-3">
                <Wand2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <div className="text-sm font-semibold text-white">Synthesizing Hyperframe Sequence...</div>
                <div className="w-64 bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full transition-all duration-200"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-stone-400">{renderProgress}% Synthesized</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Director Controls & Neural Attributes */}
        <aside className="w-88 border-l border-stone-800 bg-[#121620] flex flex-col overflow-y-auto shrink-0 p-5 space-y-5">
          <div className="flex items-center space-x-2 border-b border-stone-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Camera & Motion Director</h3>
          </div>

          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span>Motion Prompt</span>
              <span className="text-[10px] text-stone-500 font-mono">Veo / Sora Natural Lang</span>
            </label>
            <textarea
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#181D29] border border-stone-700/80 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Camera Path */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300">Camera Trajectory</label>
            <select
              value={cameraMotion}
              onChange={(e) => setCameraMotion(e.target.value as any)}
              className="w-full bg-[#181D29] border border-stone-700/80 rounded-xl p-2.5 text-xs text-stone-200 cursor-pointer focus:outline-none focus:border-indigo-500"
            >
              <option value="orbit_smooth">Orbit Smooth 360°</option>
              <option value="dolly_in">Dolly Zoom In</option>
              <option value="pan_left">Slow Pan Left to Right</option>
              <option value="crane_overhead">Overhead Crane View</option>
              <option value="dutch_roll">Dutch Angle Cinematic Roll</option>
            </select>
          </div>

          {/* Hyperframe Interpolation Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300">Hyperframe Interpolation</span>
              <span className="font-mono text-teal-400 font-bold">{hyperframeRate} FPS</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([24, 60, 120] as const).map((rate) => (
                <button
                  key={rate}
                  onClick={() => setHyperframeRate(rate)}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    hyperframeRate === rate
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                      : 'bg-[#181D29] border-stone-700 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {rate} FPS
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Zero Petri AI synthesizes in-between frames with optical flow vectors to eliminate judder.
            </p>
          </div>

          {/* Motion Strength */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300">Motion Amplitude</span>
              <span className="font-mono text-indigo-400">{Math.round(motionStrength * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={motionStrength}
              onChange={(e) => setMotionStrength(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Render Action Button */}
          <div className="pt-2">
            <button
              onClick={handleRenderVideo}
              disabled={isRendering}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRendering ? 'Rendering Hyperframe...' : 'Synthesize Video Stream'}</span>
            </button>
            {lastRenderedTime && !isRendering && (
              <div className="text-[10px] text-stone-500 text-center mt-2 font-mono">
                Last synthesized: {lastRenderedTime}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Non-Linear Timeline & Playback Bar */}
      <footer className="h-56 bg-[#121620] border-t border-stone-800 flex flex-col shrink-0">
        {/* Playback Controls & Timecode Bar */}
        <div className="px-6 py-2 bg-[#151924] border-b border-stone-800/80 flex items-center justify-between text-xs">
          {/* Left: Transport controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTimeSec(0)}
              className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="Return to Start"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => setCurrentTimeSec(totalDurationSec)}
              className="p-1 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="Go to End"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <span className="text-stone-700">|</span>

            {/* Timecode display */}
            <div className="font-mono text-xs text-white bg-black/40 px-2.5 py-1 rounded border border-stone-800">
              <span className="text-teal-400 font-bold">{formatTimecode(currentTimeSec)}</span>
              <span className="text-stone-500"> / {formatTimecode(totalDurationSec)}</span>
            </div>
          </div>

          {/* Center: Playback Speed */}
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            <span className="text-stone-500">Speed:</span>
            {[0.5, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  playbackSpeed === s ? 'bg-indigo-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Right: Audio mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Multi-Track Timeline Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1.5 relative">
          {/* Timeline Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none"
            style={{
              left: `calc(180px + (100% - 200px) * (${currentTimeSec} / ${totalDurationSec}))`,
            }}
          >
            <div className="w-2.5 h-2.5 bg-rose-500 -ml-1 -mt-0.5 rotate-45 rounded-xs" />
          </div>

          {/* Tracks */}
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center space-x-3 text-xs">
              {/* Track Header */}
              <div className="w-40 shrink-0 flex items-center space-x-2 text-stone-400 truncate">
                {track.type === 'video' && <Video className="w-3.5 h-3.5 text-indigo-400" />}
                {track.type === 'overlay' && <Type className="w-3.5 h-3.5 text-teal-400" />}
                {track.type === 'audio' && <Volume2 className="w-3.5 h-3.5 text-rose-400" />}
                {track.type === 'effect' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span className="font-semibold text-[11px] truncate text-stone-300">{track.name}</span>
              </div>

              {/* Track Lane / Clip */}
              <div className="flex-1 h-7 bg-[#171B26] rounded border border-stone-800/80 relative overflow-hidden flex items-center px-2">
                <div
                  className={`absolute top-0.5 bottom-0.5 rounded border px-2 flex items-center text-[10px] font-mono text-white truncate shadow-xs ${track.color}`}
                  style={{
                    left: `${(track.startSec / totalDurationSec) * 100}%`,
                    width: `${(track.durationSec / totalDurationSec) * 100}%`,
                  }}
                >
                  <span className="truncate">{track.details}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </footer>

      {/* Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#151924] border border-stone-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Hyperframe Video</span>
              </h3>
              <button onClick={() => setIsExportOpen(false)} className="text-stone-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-300 block mb-1">Target Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'mp4', label: 'MP4 (H.264 / 60fps)' },
                    { id: 'webm', label: 'WebM (VP9 / Alpha)' },
                    { id: 'gif', label: 'Animated GIF' },
                    { id: 'png_seq', label: 'PNG Image Sequence' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id as any)}
                      className={`p-2 rounded-lg border text-left cursor-pointer ${
                        exportFormat === fmt.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-1 font-mono text-[11px] text-stone-400">
                <div>Dimensions: {aspectRatio === '16:9' ? '1920x1080 (Full HD)' : '1080x1920 (Vertical)'}</div>
                <div>Interpolation: {hyperframeRate} FPS Optical Flow</div>
                <div>Duration: {totalDurationSec}s ({Math.round(totalDurationSec * hyperframeRate)} frames)</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setIsExportOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Start Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
