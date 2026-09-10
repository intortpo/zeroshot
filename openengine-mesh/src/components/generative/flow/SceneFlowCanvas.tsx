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
    <div className={`relative flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Canvas Toolbar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3.5 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Nodal Scene Flow Canvas</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {scenes.length} Scenes Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive generative graph: connect scenes, branch alternate takes, and configure optical transitions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddScene}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Scene Node</span>
          </button>
        </div>
      </div>

      {/* Main Flow Canvas Graph Area */}
      <div className="relative flex-1 min-h-[520px] overflow-x-auto p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
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
                  className={`w-[340px] bg-slate-900/90 border rounded-2xl shadow-xl transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'border-teal-400 ring-2 ring-teal-500/30 shadow-teal-500/10 scale-[1.01]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) =>
                          videoFlowService.updateSceneNode(scene.id, { title: e.target.value })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-slate-200 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-teal-500/50 rounded px-1 w-44 truncate"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                        {scene.durationSeconds}s
                      </span>
                      {scenes.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteScene(scene.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete Scene Node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Video Thumbnail / Canvas Simulation */}
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
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
                      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-teal-950/40 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                        <Video className="w-8 h-8 text-teal-500/60 mb-2 animate-pulse" />
                        <span className="text-[11px] font-mono text-slate-400">
                          {scene.modelId.toUpperCase()} • {scene.cameraFlight}
                        </span>
                      </div>
                    )}

                    {/* Camera flight & LUT Overlay Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-teal-300 border border-slate-700">
                        {scene.cameraFlight.toUpperCase()}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-700">
                        {scene.colorLut}
                      </span>
                    </div>

                    {/* Synthesize Button Overlay */}
                    <button
                      onClick={(e) => handleSynthesize(scene.id, e)}
                      disabled={isSynthesizing}
                      className={`absolute bottom-2 right-2 px-3 py-1 rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                        isSynthesizing
                          ? 'bg-teal-500 text-slate-950 animate-pulse'
                          : 'bg-slate-900/90 text-teal-300 border border-teal-500/40 hover:bg-teal-500 hover:text-slate-950'
                      }`}
                    >
                      {isSynthesizing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>{scene.videoBlobUrl ? 'Regenerate' : 'Synthesize Video'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="p-3.5 space-y-3 bg-slate-900/60 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-mono text-slate-500">
                          Prompt Directive
                        </span>
                        <span className="text-[10px] text-teal-400 font-mono">
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
                        className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-teal-500 resize-none font-sans leading-relaxed"
                        placeholder="Describe camera movement, lighting, subjects..."
                      />
                    </div>

                    {/* Action Buttons: Branch, Extend, Settings */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => handleBranchScene(scene.id, e)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] font-medium text-slate-300 hover:text-teal-300 flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                        title="Create alternate A/B branch"
                      >
                        <GitBranch className="w-3 h-3 text-teal-400" />
                        <span>Branch A/B</span>
                      </button>

                      <button
                        onClick={(e) => handleExtendScene(scene.id, e)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] font-medium text-slate-300 hover:text-teal-300 flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                        title="Extend continuous shot"
                      >
                        <FastForward className="w-3 h-3 text-emerald-400" />
                        <span>Extend</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* TRANSITION CONNECTOR PILL */}
                {transFromThis && idx < scenes.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="h-0.5 w-6 bg-teal-500/40" />
                    <button
                      onClick={() => handleChangeTransition(transFromThis.id, transFromThis.type)}
                      className="my-1 px-2.5 py-1.5 rounded-full bg-slate-900 border border-teal-500/40 hover:border-teal-400 text-teal-300 text-[10px] font-mono font-bold shadow-lg flex items-center gap-1 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                      title="Click to cycle optical transition"
                    >
                      <ArrowRight className="w-3 h-3 text-teal-400" />
                      <span>{transFromThis.type.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-[9px] text-slate-500">({transFromThis.durationMs}ms)</span>
                    </button>
                    <div className="h-0.5 w-6 bg-teal-500/40" />
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
