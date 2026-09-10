import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Volume2
} from 'lucide-react';
import { TimelineClip } from '../../../types';
import { videoFlowService } from '../../../services/videoFlowService';

interface VideoFlowTimelineProps {
  timelineClips: TimelineClip[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  activeSceneId: string | null;
  onSelectScene: (id: string) => void;
  className?: string;
}

export const VideoFlowTimeline: React.FC<VideoFlowTimelineProps> = ({
  timelineClips,
  currentTime,
  totalDuration,
  isPlaying,
  activeSceneId,
  onSelectScene,
  className = '',
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Playback timer loop
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTimestamp) / 1000;
        let nextTime = currentTime + delta;
        if (nextTime >= totalDuration) {
          nextTime = 0; // Loop playback
        }
        videoFlowService.setCurrentTime(nextTime);
      }
      lastTimestamp = now;
      if (isPlaying) {
        animFrame = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      animFrame = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, currentTime, totalDuration]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || totalDuration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    videoFlowService.setCurrentTime(ratio * totalDuration);
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const playheadPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const v1Clips = timelineClips.filter((c) => c.track === 'v1');
  const a1Clips = timelineClips.filter((c) => c.track === 'a1');

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 ${className}`}>
      {/* Timeline Controls & Timecode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => videoFlowService.setIsPlaying(!isPlaying)}
            className={`p-2.5 rounded-xl font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 text-slate-950'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Rewind to Start */}
          <button
            onClick={() => videoFlowService.setCurrentTime(0)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Rewind to Beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Split Clip Button */}
          <button
            onClick={() => {
              if (activeSceneId) videoFlowService.branchSceneNode(activeSceneId);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Split Clip at Playhead"
          >
            <Scissors className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-800 mx-1" />

          {/* Timecode Readout */}
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-teal-400 font-bold">{formatTimecode(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTimecode(totalDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-400 font-mono hidden md:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>30 FPS • 48 kHz</span>
          </div>
        </div>
      </div>

      {/* Multi-Track Canvas & Scrubber Area */}
      <div className="relative flex">
        {/* Track Headers Column */}
        <div className="w-24 flex-shrink-0 flex flex-col gap-2 pt-6 text-[10px] font-mono text-slate-400 select-none border-r border-slate-800 pr-2">
          <div className="h-10 flex items-center justify-between px-2 bg-slate-950/60 rounded border border-slate-850">
            <span className="font-bold text-slate-300">V1</span>
            <span className="text-[9px] text-slate-500">SCENES</span>
          </div>
          <div className="h-8 flex items-center justify-between px-2 bg-slate-950/60 rounded border border-slate-850">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> A1
            </span>
            <span className="text-[9px] text-slate-500">SCORE</span>
          </div>
        </div>

        {/* Tracks Timeline Scrubber Area */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="flex-1 relative pl-3 cursor-pointer select-none overflow-hidden"
        >
          {/* Ruler Marks (Seconds) */}
          <div className="h-6 w-full flex items-center justify-between border-b border-slate-800/80 font-mono text-[9px] text-slate-500 pb-1">
            {Array.from({ length: Math.max(1, Math.ceil(totalDuration) + 1) }, (_, i) => (
              <span key={i} className="flex flex-col items-center">
                <span>00:{i.toString().padStart(2, '0')}</span>
                <span className="h-1 w-0.5 bg-slate-700" />
              </span>
            ))}
          </div>

          {/* Draggable Playhead Needle */}
          <div
            style={{ left: `calc(${playheadPercent}% + 12px)` }}
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none transition-all duration-75"
          >
            <div className="w-3 h-3 bg-rose-500 rotate-45 -ml-1.25 -mt-1 shadow-md shadow-rose-500/50" />
          </div>

          {/* Track 1: Video Scenes (V1) */}
          <div className="h-10 my-2 flex items-center gap-1 relative">
            {v1Clips.map((clip) => {
              const widthPct = totalDuration > 0 ? (clip.duration / totalDuration) * 100 : 33;
              const isSelected = activeSceneId === clip.sceneId;

              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScene(clip.sceneId);
                  }}
                  style={{ width: `${widthPct}%`, backgroundColor: `${clip.color}33`, borderColor: clip.color }}
                  className={`h-full rounded-lg border flex items-center justify-between px-2.5 transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected ? 'ring-2 ring-teal-400 shadow-md' : 'hover:brightness-110'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: clip.color }} />
                    <span className="text-[11px] font-bold text-slate-100 truncate">{clip.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300">{clip.duration}s</span>
                </div>
              );
            })}
          </div>

          {/* Track 2: Audio Score (A1) with Procedural Waveform */}
          <div className="h-8 my-1 flex items-center relative bg-slate-950/80 border border-emerald-500/30 rounded-lg overflow-hidden px-2">
            {a1Clips.map((clip) => (
              <div key={clip.id} className="w-full flex items-center justify-between gap-1 h-full">
                <div className="flex items-center gap-1 h-full flex-1">
                  {clip.waveform?.map((val, i) => (
                    <div
                      key={i}
                      style={{ height: `${val * 100}%` }}
                      className="w-1 bg-emerald-400/70 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-emerald-300 whitespace-nowrap pl-2">
                  AI Ambient (48kHz)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
