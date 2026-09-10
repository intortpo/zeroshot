import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Download,
  Brain,
  CheckCircle2
} from 'lucide-react';
import { videoFlowService, VideoFlowState } from '../../../services/videoFlowService';
import { SceneFlowCanvas } from './SceneFlowCanvas';
import { VideoFlowTimeline } from './VideoFlowTimeline';
import { VideoFlowPlayer } from './VideoFlowPlayer';

interface PetriVideoFlowEditorProps {
  onOpenCompanion?: () => void;
  className?: string;
}

export const PetriVideoFlowEditor: React.FC<PetriVideoFlowEditorProps> = ({
  onOpenCompanion,
  className = '',
}) => {
  const [flowState, setFlowState] = useState<VideoFlowState>(() => videoFlowService.getState());

  useEffect(() => {
    return videoFlowService.subscribe(() => {
      setFlowState(videoFlowService.getState());
    });
  }, []);

  const activeScene =
    flowState.scenes.find((s) => s.id === flowState.activeSceneId) || flowState.scenes[0];

  return (
    <div className={`space-y-6 max-w-[1700px] mx-auto p-4 sm:p-6 text-slate-100 ${className}`}>
      {/* Top Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <span>GENERATIVE STUDIO</span>
            <span>/</span>
            <span>AI VIDEO FLOW</span>
            <span>/</span>
            <span className="text-slate-400">NON-LINEAR EDITOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            Petri Video Flow Studio
            <span className="text-xs px-2.5 py-1 rounded-full font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Flow NLE
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            A real AI video editor with visual scene generation flows, continuous shot branching,
            optical transition in-betweening, and synchronized multi-track timeline assembly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenCompanion && (
            <button
              onClick={onOpenCompanion}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-teal-500/30 hover:border-teal-400 text-teal-300 text-xs font-bold transition-all shadow-md cursor-pointer hover:bg-slate-850"
            >
              <Brain className="w-4 h-4 text-teal-400" />
              <span>✦ Gemini Thought Companion</span>
            </button>
          )}

          <button
            onClick={() => videoFlowService.exportMasterVideo()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Master Movie</span>
          </button>
        </div>
      </div>

      {/* Top Split: Video Player (Left 7 cols) + Active Scene Inspector (Right 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Video Player */}
        <div className="xl:col-span-7">
          <VideoFlowPlayer flowState={flowState} />
        </div>

        {/* Active Scene Inspector */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Active Scene Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-teal-300 px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30">
                {activeScene?.id}
              </span>
            </div>

            {activeScene ? (
              <div className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Scene Title
                  </label>
                  <input
                    type="text"
                    value={activeScene.title}
                    onChange={(e) =>
                      videoFlowService.updateSceneNode(activeScene.id, { title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400">
                      Generative Video Prompt
                    </label>
                    <button
                      onClick={() => {
                        const enhanced = `${activeScene.prompt} [Hyper-realistic 4K, 35mm anamorphic caustics, cinematic volumetric rays, award-winning cinematography]`;
                        videoFlowService.updateSceneNode(activeScene.id, { prompt: enhanced });
                      }}
                      className="text-[10px] text-teal-400 hover:text-teal-200 flex items-center gap-1 font-mono"
                    >
                      <Sparkles className="w-3 h-3" /> Enhance Prompt
                    </button>
                  </div>
                  <textarea
                    value={activeScene.prompt}
                    onChange={(e) =>
                      videoFlowService.updateSceneNode(activeScene.id, { prompt: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-sans focus:outline-none focus:border-teal-500 leading-relaxed resize-none"
                  />
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera Flight */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Camera Trajectory
                    </label>
                    <select
                      value={activeScene.cameraFlight}
                      onChange={(e) =>
                        videoFlowService.updateSceneNode(activeScene.id, {
                          cameraFlight: e.target.value as any,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono focus:outline-none focus:border-teal-500"
                    >
                      <option value="orbit">Orbit (360° Rotate)</option>
                      <option value="push_in">Push-In (Forward Dolly)</option>
                      <option value="submersion_dive">Submersion Dive</option>
                      <option value="crane">Crane (Ascending)</option>
                      <option value="tilt_up">Tilt-Up</option>
                      <option value="pan_right">Pan-Right</option>
                    </select>
                  </div>

                  {/* Color LUT */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Color Grading LUT
                    </label>
                    <select
                      value={activeScene.colorLut}
                      onChange={(e) =>
                        videoFlowService.updateSceneNode(activeScene.id, { colorLut: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono focus:outline-none focus:border-teal-500"
                    >
                      <option value="Tiffany Clean">Tiffany Clean</option>
                      <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                      <option value="Kodak Portra">Kodak Portra 35mm</option>
                      <option value="Film Noir">Film Noir</option>
                    </select>
                  </div>

                  {/* Duration Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Duration</span>
                      <span className="text-teal-300 font-bold">{activeScene.durationSeconds}s</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      step="1"
                      value={activeScene.durationSeconds}
                      onChange={(e) =>
                        videoFlowService.updateSceneNode(activeScene.id, {
                          durationSeconds: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* Motion Strength Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Motion Vector</span>
                      <span className="text-teal-300 font-bold">{activeScene.motionStrength}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={activeScene.motionStrength}
                      onChange={(e) =>
                        videoFlowService.updateSceneNode(activeScene.id, {
                          motionStrength: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">Select a scene in the flow canvas.</div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Timeline Synchronized</span>
            </div>

            {activeScene && (
              <button
                onClick={() => videoFlowService.generateSceneVideo(activeScene.id)}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Clip</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Nodal Scene Flow Canvas */}
      <SceneFlowCanvas
        scenes={flowState.scenes}
        transitions={flowState.transitions}
        activeSceneId={flowState.activeSceneId}
        onSelectScene={(id) => videoFlowService.setActiveScene(id)}
      />

      {/* Bottom: Multi-Track Non-Linear Timeline */}
      <VideoFlowTimeline
        timelineClips={flowState.timelineClips}
        currentTime={flowState.currentTime}
        totalDuration={flowState.totalDuration}
        isPlaying={flowState.isPlaying}
        activeSceneId={flowState.activeSceneId}
        onSelectScene={(id) => videoFlowService.setActiveScene(id)}
      />
    </div>
  );
};
