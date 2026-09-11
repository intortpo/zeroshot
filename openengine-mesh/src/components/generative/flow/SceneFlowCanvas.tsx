import React, { useState } from 'react';
import {
  Film,
  Plus,
  GitBranch,
  FastForward,
  Sparkles,
  Trash2,
  ArrowRight,
  RefreshCw,
  Video
} from 'lucide-react';
import { FlowSceneNode, FlowTransitionNode, VideoFlowTransitionType } from '../../../types';
import { videoFlowService } from '../../../services/videoFlowService';

interface SceneFlowCanvasProps {
  scenes: FlowSceneNode[];
  transitions: FlowTransitionNode[];
  activeSceneId: string | null;
  onSelectScene: (id: string) => void;
  className?: string;
}

export const SceneFlowCanvas: React.FC<SceneFlowCanvasProps> = ({
  scenes,
  transitions,
  activeSceneId,
  onSelectScene,
  className = '',
}) => {
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);

  const handleSynthesize = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSynthesizingId(id);
    try {
      await videoFlowService.generateSceneVideo(id);
    } catch {
      // Handled
    } finally {
      setSynthesizingId(null);
    }
  };

  const handleAddScene = () => {
    const newScene = videoFlowService.addSceneNode();
    onSelectScene(newScene.id);
  };

  const handleBranchScene = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const branch = videoFlowService.branchSceneNode(id);
    onSelectScene(branch.id);
  };

  const handleExtendScene = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ext = videoFlowService.extendSceneNode(id);
    onSelectScene(ext.id);
  };

  const handleDeleteScene = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    videoFlowService.deleteSceneNode(id);
  };

  const handleChangeTransition = (transId: string, currentType: VideoFlowTransitionType) => {
    const types: VideoFlowTransitionType[] = [
      'cross_dissolve',
      'optical_flow_morph',
      'whip_pan',
      'hyperzoom_in',
      'glitch',
      'cut',
    ];
    const nextIdx = (types.indexOf(currentType) + 1) % types.length;
    videoFlowService.updateTransition(transId, { type: types[nextIdx] });
  };

  return (
    <div className={`relative flex flex-col bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-2xl overflow-hidden shadow-xs font-mono ${className}`}>
      {/* Canvas Toolbar */}
      <div className="bg-[#FAF8F3] border-b border-[#1A1D1A]/10 p-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F0ECE1] border border-[#1A1D1A]/15 rounded-lg text-teal-800">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1A1D1A]">Nodal Scene Flow Canvas</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/20 font-semibold">
                {scenes.length} Scenes Connected
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                REAL VIDEO
              </span>
            </div>
            <p className="text-[11px] text-[#1A1D1A]/60">
              Interactive generative graph: connect scenes, branch alternate takes, configure optical transitions, and attach real footage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddScene}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Scene Node</span>
          </button>
        </div>
      </div>

      {/* Main Flow Canvas Graph Area with Vellum 24mm Drafting Grid */}
      <div
        className="relative flex-1 min-h-[520px] overflow-x-auto p-8 bg-[#F6F3EC]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(26, 29, 26, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 29, 26, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Nodes & Connecting Transitions */}
        <div className="flex items-center gap-6 min-w-max pb-8 pt-4">
          {scenes.map((scene, idx) => {
            const isActive = activeSceneId === scene.id;
            const isSynthesizing = synthesizingId === scene.id;
            const transFromThis = transitions.find((t) => t.sourceSceneId === scene.id);

            return (
              <React.Fragment key={scene.id}>
                {/* SCENE NODE CARD */}
                <div
                  onClick={() => onSelectScene(scene.id)}
                  className={`w-[340px] bg-[#FAF8F3] border rounded-2xl shadow-xs transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'border-[#1A1D1A] ring-2 ring-[#1A1D1A]/20 shadow-md scale-[1.01]'
                      : 'border-[#1A1D1A]/15 hover:border-[#1A1D1A]/35'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 border-b border-[#1A1D1A]/10 flex items-center justify-between bg-[#F0ECE1]/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-700 flex-shrink-0" />
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) =>
                          videoFlowService.updateSceneNode(scene.id, { title: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-[#1A1D1A] bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#1A1D1A]/30 rounded px-1 w-44 truncate font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F3] text-[#1A1D1A] border border-[#1A1D1A]/20">
                        {scene.durationSeconds}s
                      </span>
                      {scenes.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteScene(scene.id, e)}
                          className="p-1 text-[#1A1D1A]/40 hover:text-rose-600 hover:bg-[#F0ECE1] rounded transition-colors"
                          title="Delete Scene Node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Video Thumbnail / Canvas Simulation */}
                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                    {scene.videoBlobUrl ? (
                      <video
                        src={scene.videoBlobUrl}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        autoPlay
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1A1D1A] flex flex-col items-center justify-center p-4 text-center">
                        <Video className="w-8 h-8 text-teal-400/80 mb-2 animate-pulse" />
                        <span className="text-[11px] font-mono text-slate-300">
                          {scene.modelId.toUpperCase()} • {scene.cameraFlight}
                        </span>
                      </div>
                    )}

                    {/* Camera flight & LUT Overlay Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF8F3]/90 text-[#1A1D1A] border border-[#1A1D1A]/20 shadow-xs">
                        {scene.cameraFlight.toUpperCase()}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF8F3]/90 text-amber-900 border border-[#1A1D1A]/20 shadow-xs">
                        {scene.colorLut}
                      </span>
                    </div>

                    {/* Synthesize Button Overlay */}
                    <button
                      onClick={(e) => handleSynthesize(scene.id, e)}
                      disabled={isSynthesizing}
                      className={`absolute bottom-2 right-2 px-3 py-1 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 ${
                        isSynthesizing
                          ? 'bg-teal-700 text-white animate-pulse'
                          : 'bg-[#FAF8F3]/95 text-[#1A1D1A] border border-[#1A1D1A]/20 hover:bg-[#1A1D1A] hover:text-[#FAF8F3]'
                      }`}
                    >
                      {isSynthesizing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>{scene.videoBlobUrl ? 'Regenerate' : 'Synthesize Video'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="p-3.5 space-y-3 bg-[#FAF8F3] flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-mono text-[#1A1D1A]/60">
                          Prompt Directive
                        </span>
                        <span className="text-[10px] text-teal-800 font-mono font-bold">
                          Motion: {scene.motionStrength}/10
                        </span>
                      </div>
                      <textarea
                        value={scene.prompt}
                        onChange={(e) =>
                          videoFlowService.updateSceneNode(scene.id, { prompt: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        rows={3}
                        className="w-full text-xs text-[#1A1D1A] bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg p-2.5 focus:outline-none focus:border-[#1A1D1A] resize-none font-mono leading-relaxed"
                        placeholder="Describe camera movement, lighting, subjects..."
                      />
                    </div>

                    {/* Action Buttons: Branch, Extend, Settings */}
                    <div className="pt-2 border-t border-[#1A1D1A]/10 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleBranchScene(scene.id, e)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#F6F3EC] hover:bg-[#F0ECE1] text-[11px] font-medium text-[#1A1D1A] flex items-center justify-center gap-1 border border-[#1A1D1A]/20 transition-colors"
                        title="Create alternate A/B branch"
                      >
                        <GitBranch className="w-3 h-3 text-teal-700" />
                        <span>Branch A/B</span>
                      </button>

                      <button
                        onClick={(e) => handleExtendScene(scene.id, e)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-[#F6F3EC] hover:bg-[#F0ECE1] text-[11px] font-medium text-[#1A1D1A] flex items-center justify-center gap-1 border border-[#1A1D1A]/20 transition-colors"
                        title="Extend continuous shot"
                      >
                        <FastForward className="w-3 h-3 text-emerald-700" />
                        <span>Extend</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* TRANSITION CONNECTOR PILL */}
                {transFromThis && idx < scenes.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="h-0.5 w-6 bg-[#1A1D1A]/20" />
                    <button
                      onClick={() => handleChangeTransition(transFromThis.id, transFromThis.type)}
                      className="my-1 px-2.5 py-1.5 rounded-full bg-[#FAF8F3] border border-[#1A1D1A]/20 hover:border-[#1A1D1A]/40 text-[#1A1D1A] text-[10px] font-mono font-bold shadow-xs flex items-center gap-1 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                      title="Click to cycle optical transition"
                    >
                      <ArrowRight className="w-3 h-3 text-teal-700" />
                      <span>{transFromThis.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-[9px] text-[#1A1D1A]/50">({transFromThis.durationMs}ms)</span>
                    </button>
                    <div className="h-0.5 w-6 bg-[#1A1D1A]/20" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
