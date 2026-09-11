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
    <div className={`bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-2xl p-4 shadow-xs flex flex-col gap-3 font-mono ${className}`}>
      {/* Timeline Controls & Timecode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1D1A]/10 pb-3">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => videoFlowService.setIsPlaying(!isPlaying)}
            className={`p-2.5 rounded-xl font-bold transition-all shadow-xs ${
              isPlaying
                ? 'bg-amber-600 text-white'
                : 'bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3]'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Rewind to Start */}
          <button
            onClick={() => videoFlowService.setCurrentTime(0)}
            className="p-2 rounded-lg bg-[#FAF8F3] hover:bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/15 transition-colors"
            title="Rewind to Beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Split Clip Button */}
          <button
            onClick={() => {
              if (activeSceneId) videoFlowService.branchSceneNode(activeSceneId);
            }}
            className="p-2 rounded-lg bg-[#FAF8F3] hover:bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/15 transition-colors"
            title="Split Clip at Playhead"
          >
            <Scissors className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[#1A1D1A]/15 mx-1" />

          {/* Timecode Readout */}
          <div className="flex items-center gap-2 font-mono text-xs bg-[#F6F3EC] px-3 py-1.5 rounded-lg border border-[#1A1D1A]/20">
            <span className="text-teal-800 font-bold">{formatTimecode(currentTime)}</span>
            <span className="text-[#1A1D1A]/30">/</span>
            <span className="text-[#1A1D1A]/60">{formatTimecode(totalDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-[#1A1D1A]/60 font-mono hidden md:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>30 FPS • 48 kHz Native NLE</span>
          </div>
        </div>
      </div>

      {/* Multi-Track Canvas & Scrubber Area */}
      <div className="relative flex">
        {/* Track Headers Column */}
        <div className="w-24 flex-shrink-0 flex flex-col gap-2 pt-6 text-[10px] font-mono text-[#1A1D1A]/60 select-none border-r border-[#1A1D1A]/10 pr-2">
          <div className="h-10 flex items-center justify-between px-2 bg-[#F0ECE1]/60 rounded border border-[#1A1D1A]/10">
            <span className="font-bold text-[#1A1D1A]">V1</span>
            <span className="text-[9px] text-[#1A1D1A]/50">SCENES</span>
          </div>
          <div className="h-8 flex items-center justify-between px-2 bg-[#F0ECE1]/60 rounded border border-[#1A1D1A]/10">
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> A1
            </span>
            <span className="text-[9px] text-[#1A1D1A]/50">SCORE</span>
          </div>
        </div>

        {/* Tracks Timeline Scrubber Area */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="flex-1 relative pl-3 cursor-pointer select-none overflow-hidden"
        >
          {/* Ruler Marks (Seconds) */}
          <div className="h-6 w-full flex items-center justify-between border-b border-[#1A1D1A]/15 font-mono text-[9px] text-[#1A1D1A]/50 pb-1">
            {Array.from({ length: Math.max(1, Math.ceil(totalDuration) + 1) }, (_, i) => (
              <span key={i} className="flex flex-col items-center">
                <span>00:{i.toString().padStart(2, '0')}</span>
                <span className="h-1 w-0.5 bg-[#1A1D1A]/20" />
              </span>
            ))}
          </div>

          {/* Draggable Playhead Needle */}
          <div
            style={{ left: `calc(${playheadPercent}% + 12px)` }}
            className="absolute top-0 bottom-0 w-0.5 bg-rose-600 z-30 pointer-events-none transition-all duration-75"
          >
            <div className="w-3 h-3 bg-rose-600 rotate-45 -ml-1.25 -mt-1 shadow-xs" />
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
                  style={{ width: `${widthPct}%`, backgroundColor: `${clip.color}20`, borderColor: `${clip.color}66` }}
                  className={`h-full rounded-lg border flex items-center justify-between px-2.5 transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected ? 'ring-2 ring-[#1A1D1A] shadow-xs' : 'hover:brightness-95'
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: clip.color }} />
                    <span className="text-[11px] font-bold text-[#1A1D1A] truncate">{clip.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#1A1D1A]/70 font-semibold">{clip.duration}s</span>
                </div>
              );
            })}
          </div>

          {/* Track 2: Audio Score (A1) with Procedural Waveform */}
          <div className="h-8 my-1 flex items-center relative bg-[#F0ECE1]/50 border border-emerald-700/20 rounded-lg overflow-hidden px-2">
            {a1Clips.map((clip) => (
              <div key={clip.id} className="w-full flex items-center justify-between gap-1 h-full">
                <div className="flex items-center gap-1 h-full flex-1">
                  {clip.waveform?.map((val, i) => (
                    <div
                      key={i}
                      style={{ height: `${val * 100}%` }}
                      className="w-1 bg-emerald-700/60 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-emerald-900 whitespace-nowrap pl-2 font-semibold">
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
