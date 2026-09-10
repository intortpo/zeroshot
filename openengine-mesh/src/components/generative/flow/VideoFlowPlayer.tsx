import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clapperboard,
  Sparkles
} from 'lucide-react';
import { videoFlowService, VideoFlowState } from '../../../services/videoFlowService';

interface VideoFlowPlayerProps {
  flowState: VideoFlowState;
  className?: string;
}

export const VideoFlowPlayer: React.FC<VideoFlowPlayerProps> = ({
  flowState,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { scenes, currentTime, isPlaying } = flowState;

  // Determine current active scene based on currentTime
  let accumulated = 0;
  let currentScene = scenes[0];
  let sceneRelativeTime = 0;

  for (const scene of scenes) {
    if (currentTime >= accumulated && currentTime < accumulated + scene.durationSeconds) {
      currentScene = scene;
      sceneRelativeTime = currentTime - accumulated;
      break;
    }
    accumulated += scene.durationSeconds;
  }
  if (!currentScene && scenes.length > 0) {
    currentScene = scenes[scenes.length - 1];
    sceneRelativeTime = currentScene.durationSeconds;
  }

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleExportMaster = async () => {
    setIsExporting(true);
    try {
      await videoFlowService.exportMasterVideo();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between aspect-video ${className}`}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold text-slate-100 font-mono tracking-tight">
            {currentScene?.title || 'Sequence Master'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {currentScene?.aspectRatio || '16:9'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMaster}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-md ${
              isExporting
                ? 'bg-teal-500 text-slate-950 animate-pulse'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-teal-500/20'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Stitching Master...' : 'Export Master Video'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport / Composite Stage */}
      <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
        {currentScene?.videoBlobUrl ? (
          <video
            src={currentScene.videoBlobUrl}
            className="w-full h-full object-contain transition-opacity duration-300"
            loop
            muted={isMuted}
            autoPlay={isPlaying}
            playsInline
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/30 via-slate-950 to-slate-950">
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-3 animate-pulse">
              <Clapperboard className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">
              {currentScene?.title || 'Ready to Synthesize Flow'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mt-1 line-clamp-2">
              &quot;{currentScene?.prompt || 'Connect scenes in the flow canvas and generate real video blobs.'}&quot;
            </p>
            <button
              onClick={() => {
                if (currentScene) videoFlowService.generateSceneVideo(currentScene.id);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Synthesize Video Footage</span>
            </button>
          </div>
        )}

        {/* HUD Telemetry Overlay */}
        <div className="absolute bottom-16 left-4 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-3 backdrop-blur-sm">
          <span>TIME: <strong className="text-teal-400">{currentTime.toFixed(2)}s</strong></span>
          <span>SCENE: <strong className="text-teal-300">{sceneRelativeTime.toFixed(2)}s / {currentScene?.durationSeconds}s</strong></span>
          <span>LUT: <strong className="text-amber-300">{currentScene?.colorLut}</strong></span>
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="p-3 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => videoFlowService.setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all shadow-md shadow-teal-500/20"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
