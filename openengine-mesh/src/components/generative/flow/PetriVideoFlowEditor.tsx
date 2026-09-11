import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Download,
  CheckCircle2,
  Upload,
  FolderOpen,
  X,
  Play,
  Film
} from 'lucide-react';
import { videoFlowService, VideoFlowState } from '../../../services/videoFlowService';
import { assetLibraryService } from '../../../services/assetLibraryService';
import { AssetItem, FlowSceneNode } from '../../../types';
import { SceneFlowCanvas } from './SceneFlowCanvas';
import { VideoFlowTimeline } from './VideoFlowTimeline';
import { VideoFlowPlayer } from './VideoFlowPlayer';

interface PetriVideoFlowEditorProps {
  className?: string;
}

export const PetriVideoFlowEditor: React.FC<PetriVideoFlowEditorProps> = ({
  className = '',
}) => {
  const [flowState, setFlowState] = useState<VideoFlowState>(() => videoFlowService.getState());
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [directVideoUrl, setDirectVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return videoFlowService.subscribe(() => {
      setFlowState(videoFlowService.getState());
    });
  }, []);

  const activeScene =
    flowState.scenes.find((s) => s.id === flowState.activeSceneId) || flowState.scenes[0];

  const videoAssets = assetLibraryService.getAssets().filter((a) => a.type === 'video');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeScene) return;

    const blobUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration) || 5;
      videoFlowService.attachVideoFile(activeScene.id, blobUrl, duration, file.name);
    };
    video.src = blobUrl;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePickAsset = (asset: AssetItem) => {
    if (!activeScene) return;
    videoFlowService.importFromAssetLibrary(activeScene.id, asset);
    setIsAssetPickerOpen(false);
  };

  const handleAttachDirectUrl = () => {
    if (!directVideoUrl.trim() || !activeScene) return;
    videoFlowService.attachVideoFile(activeScene.id, directVideoUrl.trim(), activeScene.durationSeconds, 'Custom Video Stream');
    setDirectVideoUrl('');
  };

  return (
    <div
      className={`space-y-6 max-w-[1700px] mx-auto p-4 sm:p-6 text-[#1A1D1A] font-mono relative ${className}`}
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(26, 29, 26, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 29, 26, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Hidden File Input for Video Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
      />

      {/* Top Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1D1A]/15 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#1A1D1A]/60 mb-1">
            <span>GENERATIVE STUDIO</span>
            <span>/</span>
            <span>REAL VIDEO FLOW</span>
            <span>/</span>
            <span className="text-[#1A1D1A] font-bold">NON-LINEAR EDITOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1D1A] flex items-center gap-3">
            Petri Video Flow Studio
            <span className="text-xs px-2.5 py-1 rounded-full font-mono font-semibold bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/20">
              Real Video NLE
            </span>
          </h1>
          <p className="text-sm text-[#1A1D1A]/70 mt-1 max-w-3xl">
            A real video non-linear editor with multi-scene playback, video file upload,
            Asset Library import, optical transitions, and synchronized multi-track timeline assembly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => videoFlowService.exportMasterVideo()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] shadow-xs transition-all cursor-pointer"
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
        <div className="xl:col-span-5 bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#1A1D1A]/10 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1D1A]">
                  Active Scene Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#1A1D1A] px-2 py-0.5 rounded bg-[#F0ECE1] border border-[#1A1D1A]/20">
                {activeScene?.id}
              </span>
            </div>

            {activeScene ? (
              <div className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#1A1D1A]/60 block mb-1">
                    Scene Title
                  </label>
                  <input
                    type="text"
                    value={activeScene.title}
                    onChange={(e) =>
                      videoFlowService.updateSceneNode(activeScene.id, { title: e.target.value })
                    }
                    className="w-full bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg p-2 text-[#1A1D1A] font-medium focus:outline-none focus:border-[#1A1D1A]"
                  />
                </div>

                {/* Real Video Source Attachment Section */}
                <div className="p-3 bg-[#F0ECE1]/50 border border-[#1A1D1A]/15 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#1A1D1A] flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-teal-700" />
                      Real Video Source
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      {activeScene.videoBlobUrl ? 'Video Attached' : 'No Video'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Video File</span>
                    </button>

                    <button
                      onClick={() => setIsAssetPickerOpen(true)}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#FAF8F3] hover:bg-[#F0ECE1] border border-[#1A1D1A]/20 text-[#1A1D1A] text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-teal-700" />
                      <span>Pick from Asset Library</span>
                    </button>
                  </div>

                  {/* Direct URL input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="url"
                      placeholder="Or paste video URL (mp4, webm)..."
                      value={directVideoUrl}
                      onChange={(e) => setDirectVideoUrl(e.target.value)}
                      className="flex-1 text-[11px] bg-[#FAF8F3] border border-[#1A1D1A]/20 rounded-lg px-2.5 py-1 text-[#1A1D1A] focus:outline-none focus:border-[#1A1D1A]"
                    />
                    <button
                      onClick={handleAttachDirectUrl}
                      disabled={!directVideoUrl.trim()}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF8F3] hover:bg-[#F0ECE1] border border-[#1A1D1A]/20 text-[#1A1D1A] text-[11px] font-bold disabled:opacity-40"
                    >
                      Attach
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase text-[#1A1D1A]/60">
                      Generative Video Prompt
                    </label>
                    <button
                      onClick={() => {
                        const enhanced = `${activeScene.prompt} [Hyper-realistic 4K, 35mm anamorphic caustics, cinematic volumetric rays, award-winning cinematography]`;
                        videoFlowService.updateSceneNode(activeScene.id, { prompt: enhanced });
                      }}
                      className="text-[10px] text-teal-800 hover:text-teal-950 flex items-center gap-1 font-mono font-bold"
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
                    className="w-full bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg p-2.5 text-[#1A1D1A] font-mono focus:outline-none focus:border-[#1A1D1A] leading-relaxed resize-none"
                  />
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera Flight */}
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#1A1D1A]/60 block mb-1">
                      Camera Trajectory
                    </label>
                    <select
                      value={activeScene.cameraFlight}
                      onChange={(e) =>
                        videoFlowService.updateSceneNode(activeScene.id, {
                          cameraFlight: e.target.value as FlowSceneNode['cameraFlight'],
                        })
                      }
                      className="w-full bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg p-2 text-[#1A1D1A] font-mono focus:outline-none focus:border-[#1A1D1A]"
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
                    <label className="text-[10px] font-mono uppercase text-[#1A1D1A]/60 block mb-1">
                      Color Grading LUT
                    </label>
                    <select
                      value={activeScene.colorLut}
                      onChange={(e) =>
                        videoFlowService.updateSceneNode(activeScene.id, { colorLut: e.target.value })
                      }
                      className="w-full bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg p-2 text-[#1A1D1A] font-mono focus:outline-none focus:border-[#1A1D1A]"
                    >
                      <option value="Tiffany Clean">Tiffany Clean</option>
                      <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                      <option value="Kodak Portra">Kodak Portra 35mm</option>
                      <option value="Film Noir">Film Noir</option>
                    </select>
                  </div>

                  {/* Duration Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-[#1A1D1A]/70 mb-1">
                      <span>Duration</span>
                      <span className="text-[#1A1D1A] font-bold">{activeScene.durationSeconds}s</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={activeScene.durationSeconds}
                      onChange={(e) =>
                        videoFlowService.updateSceneNode(activeScene.id, {
                          durationSeconds: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-[#1A1D1A] cursor-pointer h-1.5 bg-[#F0ECE1] rounded-lg"
                    />
                  </div>

                  {/* Motion Strength Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-[#1A1D1A]/70 mb-1">
                      <span>Motion Vector</span>
                      <span className="text-[#1A1D1A] font-bold">{activeScene.motionStrength}/10</span>
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
                      className="w-full accent-[#1A1D1A] cursor-pointer h-1.5 bg-[#F0ECE1] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#1A1D1A]/40">Select a scene in the flow canvas.</div>
            )}
          </div>

          <div className="pt-4 border-t border-[#1A1D1A]/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#1A1D1A]/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Timeline Synchronized</span>
            </div>

            {activeScene && (
              <button
                onClick={() => videoFlowService.generateSceneVideo(activeScene.id)}
                className="px-4 py-2 rounded-xl bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
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

      {/* Asset Library Video Picker Modal */}
      {isAssetPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1D1A]/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#FAF8F3] border border-[#1A1D1A]/20 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1D1A]/10">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-bold text-[#1A1D1A]">
                  Select Video from Asset Library
                </h3>
              </div>
              <button
                onClick={() => setIsAssetPickerOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F0ECE1] text-[#1A1D1A]/70 hover:text-[#1A1D1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {videoAssets.length === 0 ? (
                <div className="p-8 text-center text-[#1A1D1A]/50">No video assets found in library.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {videoAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handlePickAsset(asset)}
                      className="p-3 rounded-xl border border-[#1A1D1A]/15 bg-[#F6F3EC] hover:bg-[#F0ECE1] hover:border-[#1A1D1A]/30 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-2">
                        <video
                          src={asset.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white/80" />
                        </div>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono">
                          {asset.durationSeconds}s
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#1A1D1A] truncate">{asset.name}</div>
                      <div className="text-[10px] text-[#1A1D1A]/60 mt-1 font-mono">
                        {asset.source} • {asset.dimensions}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
