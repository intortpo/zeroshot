import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Repeat,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { VideoScene, TransitionType, VideoModelId } from '../../../services/hyperframeVideoService';

interface SceneStoryboardDrawerProps {
  scenes: VideoScene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
  onUpdateScene: (id: string, updates: Partial<VideoScene>) => void;
  onDeleteScene: (id: string) => void;
  onMoveScene: (index: number, direction: 'up' | 'down') => void;
}

export const SceneStoryboardDrawer: React.FC<SceneStoryboardDrawerProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onMoveScene,
}) => {
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  const transitionOptions: { id: TransitionType; label: string; desc: string }[] = [
    { id: 'optical-flow-morph', label: 'Optical Flow Morph', desc: 'AI-interpolated vector motion blend' },
    { id: 'cross-dissolve', label: 'Cross-Dissolve', desc: 'Soft cinematic luminance fade' },
    { id: 'whip-pan', label: 'Whip Pan', desc: 'High-speed directional blur transition' },
    { id: 'hyperzoom', label: 'Hyperzoom', desc: 'Kinetic focal length punch-through' },
    { id: 'cut', label: 'Direct Cut', desc: 'Instant hard scene boundary' },
  ];

  const modelOptions: { id: VideoModelId; label: string; tag: string }[] = [
    { id: 'veo-2', label: 'Veo-2', tag: 'High-Fidelity Photoreal' },
    { id: 'sora-2', label: 'Sora-2', tag: 'Kinetic Real-world Dynamics' },
    { id: 'wan-2.1', label: 'Wan 2.1', tag: 'Open Diffusion Latents' },
    { id: 'luma-dream', label: 'Luma Dream', tag: 'Fast Ambient Motion' },
  ];

  return (
    <div className="bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-2xl p-5 shadow-xs font-mono text-[#1A1D1A]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#1A1D1A]/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F0ECE1] text-teal-800 border border-[#1A1D1A]/15">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1A1D1A] tracking-wide flex items-center gap-2">
              Multi-Scene Storyboard & Keyframe Sequencing
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/20">
                {scenes.length} Scenes ({totalDuration.toFixed(1)}s Total)
              </span>
            </h3>
            <p className="text-xs text-[#1A1D1A]/60">
              Shot-by-shot continuity, multi-modal I2V first-frame conditioning, and AI optical flow transitions.
            </p>
          </div>
        </div>

        <button
          onClick={onAddScene}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] font-semibold text-xs transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Storyboard Scene
        </button>
      </div>

      {/* Storyboard Card Grid */}
      <div className="space-y-4">
        {scenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId;
          return (
            <div key={scene.id} className="relative">
              {/* Scene Card */}
              <div
                onClick={() => onSelectScene(scene.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#F6F3EC] border-[#1A1D1A] shadow-xs ring-2 ring-[#1A1D1A]/15'
                    : 'bg-[#FAF8F3] border-[#1A1D1A]/15 hover:border-[#1A1D1A]/35'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  {/* Title & Order Badge */}
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#F0ECE1] text-[#1A1D1A] font-mono text-xs font-bold flex items-center justify-center border border-[#1A1D1A]/20">
                      {scene.order}
                    </span>
                    <input
                      type="text"
                      value={scene.title}
                      onClick={e => e.stopPropagation()}
                      onChange={e => onUpdateScene(scene.id, { title: e.target.value })}
                      className="bg-transparent text-sm font-semibold text-[#1A1D1A] focus:outline-none border-b border-transparent focus:border-[#1A1D1A]"
                    />
                  </div>

                  {/* Actions (Reorder, Duplicate, Delete) */}
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      disabled={index === 0}
                      onClick={() => onMoveScene(index, 'up')}
                      className="p-1 text-[#1A1D1A]/50 hover:text-[#1A1D1A] disabled:opacity-30 rounded hover:bg-[#F0ECE1]"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === scenes.length - 1}
                      onClick={() => onMoveScene(index, 'down')}
                      className="p-1 text-[#1A1D1A]/50 hover:text-[#1A1D1A] disabled:opacity-30 rounded hover:bg-[#F0ECE1]"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        onUpdateScene(scene.id, {
                          title: `${scene.title} (Copy)`,
                        })
                      }
                      className="p-1 text-[#1A1D1A]/50 hover:text-[#1A1D1A] rounded hover:bg-[#F0ECE1]"
                      title="Duplicate Scene"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {scenes.length > 1 && (
                      <button
                        onClick={() => onDeleteScene(scene.id)}
                        className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50"
                        title="Delete Scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Prompt Field */}
                <div className="mb-3" onClick={e => e.stopPropagation()}>
                  <textarea
                    rows={2}
                    value={scene.prompt}
                    onChange={e => onUpdateScene(scene.id, { prompt: e.target.value })}
                    placeholder="Enter visual conditioning prompt for this shot..."
                    className="w-full text-xs bg-[#FAF8F3] border border-[#1A1D1A]/20 rounded-lg p-2.5 text-[#1A1D1A] focus:outline-none focus:border-[#1A1D1A] resize-none font-mono"
                  />
                </div>

                {/* Controls Bar: Model, Duration, Motion Scale, I2V */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs" onClick={e => e.stopPropagation()}>
                  {/* Model Selector */}
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <select
                      value={scene.model}
                      onChange={e => onUpdateScene(scene.id, { model: e.target.value as VideoModelId })}
                      className="bg-[#F0ECE1] border border-[#1A1D1A]/20 rounded-md px-2 py-1 text-xs text-[#1A1D1A] font-mono focus:outline-none"
                    >
                      {modelOptions.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.label} ({m.tag})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Slider */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#1A1D1A]/50" />
                    <span className="text-[#1A1D1A]/70">Duration:</span>
                    <input
                      type="range"
                      min={1.5}
                      max={10.0}
                      step={0.5}
                      value={scene.durationSeconds}
                      onChange={e => onUpdateScene(scene.id, { durationSeconds: Number(e.target.value) })}
                      className="w-20 h-1 bg-[#F0ECE1] rounded accent-[#1A1D1A] cursor-pointer"
                    />
                    <span className="font-mono text-[#1A1D1A] font-bold text-xs w-9 text-right">{scene.durationSeconds.toFixed(1)}s</span>
                  </div>

                  {/* Motion Scale */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#1A1D1A]/70">Motion:</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={scene.motionScale}
                      onChange={e => onUpdateScene(scene.id, { motionScale: Number(e.target.value) })}
                      className="w-16 h-1 bg-[#F0ECE1] rounded accent-[#1A1D1A] cursor-pointer"
                    />
                    <span className="font-mono text-[#1A1D1A] font-bold">{scene.motionScale}/10</span>
                  </div>

                  {/* Image-to-Video First Frame Dropzone Trigger */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowImageModal(showImageModal === scene.id ? null : scene.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
                        scene.firstFrameImageUrl
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                          : 'bg-[#F0ECE1] text-[#1A1D1A] border-[#1A1D1A]/20 hover:bg-[#E8E2D5]'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3 text-teal-700" />
                      {scene.firstFrameImageUrl ? 'I2V Frame Attached' : 'Attach I2V Frame'}
                    </button>

                    {/* Seamless Loop Toggle */}
                    <button
                      onClick={() => onUpdateScene(scene.id, { seamlessLoop: !scene.seamlessLoop })}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors ${
                        scene.seamlessLoop
                          ? 'bg-[#1A1D1A] text-[#FAF8F3] border-[#1A1D1A]'
                          : 'bg-[#F0ECE1] text-[#1A1D1A]/70 border-[#1A1D1A]/20 hover:text-[#1A1D1A]'
                      }`}
                      title="Seamless Loop Conditioning"
                    >
                      <Repeat className="w-3 h-3" />
                      Loop
                    </button>
                  </div>
                </div>

                {/* I2V URL Attachment Drawer */}
                {showImageModal === scene.id && (
                  <div className="mt-3 p-3 bg-[#FAF8F3] rounded-lg border border-[#1A1D1A]/20 flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Upload className="w-3.5 h-3.5 text-teal-700" />
                    <span className="text-xs text-[#1A1D1A] font-medium">First-Frame Conditioning Image URL:</span>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or data:image/..."
                      value={scene.firstFrameImageUrl || ''}
                      onChange={e => onUpdateScene(scene.id, { firstFrameImageUrl: e.target.value })}
                      className="flex-1 min-w-[200px] text-xs bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded px-2 py-1 text-[#1A1D1A] font-mono focus:outline-none focus:border-[#1A1D1A]"
                    />
                    {scene.firstFrameImageUrl && (
                      <button
                        onClick={() => onUpdateScene(scene.id, { firstFrameImageUrl: undefined })}
                        className="text-xs text-rose-600 hover:underline px-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Inter-Scene Transition Node */}
              {index < scenes.length - 1 && (
                <div className="my-2 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#1A1D1A]/20 text-[11px] text-[#1A1D1A] shadow-xs">
                    <ArrowRight className="w-3 h-3 text-teal-700" />
                    <span className="text-[#1A1D1A]/60">Transition:</span>
                    <select
                      value={scene.transitionToNext}
                      onChange={e => onUpdateScene(scene.id, { transitionToNext: e.target.value as TransitionType })}
                      className="bg-transparent font-bold text-[#1A1D1A] focus:outline-none cursor-pointer"
                    >
                      {transitionOptions.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#FAF8F3] text-[#1A1D1A]">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
