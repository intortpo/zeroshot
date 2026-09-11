import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Layers,
  Compass,
  Palette,
  Sliders,
  Clapperboard,
  CheckCircle2,
  Tv,
  Download,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import {
  hyperframeVideoService,
  generateAndDownloadVideo,
  VideoScene,
  VideoModelId,
  AspectRatio,
  CameraFlightType,
  ColorLUTId,
  ExportFormat,
  RenderJob,
} from '../../services/hyperframeVideoService';
import { SceneStoryboardDrawer } from './video/SceneStoryboardDrawer';
import { SubmersionFlightStudio } from './video/SubmersionFlightStudio';
import { ColorGradingLUTCenter } from './video/ColorGradingLUTCenter';
import { MultiTrackTimeline } from './video/MultiTrackTimeline';
import { RenderQueueModal } from './video/RenderQueueModal';

type StudioTab = 'preview' | 'storyboard' | 'camera' | 'color';

export const HyperframeVideoSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>('preview');
  const [scenes, setScenes] = useState<VideoScene[]>(() => hyperframeVideoService.getScenes());
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0]?.id || 'scene-101');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [activeLut, setActiveLut] = useState(() => hyperframeVideoService.getActiveLUT());
  const [opticalSettings, setOpticalSettings] = useState(() => hyperframeVideoService.getOpticalSettings());
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>(() => hyperframeVideoService.getRenderJobs());
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];
  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  const [isExportingQuick, setIsExportingQuick] = useState(false);
  const [isFootageLoaded, setIsFootageLoaded] = useState(true);

  // Scene CRUD handlers
  const handleSelectScene = (id: string) => {
    setActiveSceneId(id);
  };

  const handleAddScene = () => {
    const newScene = hyperframeVideoService.addScene({
      title: `Scene ${scenes.length + 1}`,
      prompt: 'Cinematic underwater camera sweeping over iridescent turquoise sand ripples, crystalline caustic light refractions.',
      durationSeconds: 4.0,
      motionScale: 6,
      transitionToNext: 'optical-flow-morph',
      cameraFlight: 'orbital-descent',
      seamlessLoop: false,
      model: 'veo-2',
      previewGradient: 'from-teal-900 via-emerald-950 to-slate-900',
    });
    setScenes(hyperframeVideoService.getScenes());
    setActiveSceneId(newScene.id);
  };

  const handleUpdateScene = (id: string, updates: Partial<VideoScene>) => {
    hyperframeVideoService.updateScene(id, updates);
    setScenes(hyperframeVideoService.getScenes());
  };

  const handleDeleteScene = (id: string) => {
    hyperframeVideoService.deleteScene(id);
    const updated = hyperframeVideoService.getScenes();
    setScenes(updated);
    if (activeSceneId === id && updated.length > 0) {
      setActiveSceneId(updated[0].id);
    }
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? index - 1 : index + 1;
    hyperframeVideoService.reorderScenes(index, toIndex);
    setScenes(hyperframeVideoService.getScenes());
  };

  // Color & Optical Handlers
  const handleSelectLUT = (lutId: ColorLUTId) => {
    hyperframeVideoService.setActiveLUT(lutId);
    setActiveLut(hyperframeVideoService.getActiveLUT());
  };

  const handleUpdateOptical = (updates: Parameters<typeof hyperframeVideoService.updateOpticalSettings>[0]) => {
    hyperframeVideoService.updateOpticalSettings(updates);
    setOpticalSettings(hyperframeVideoService.getOpticalSettings());
  };

  // Render Job Submission with progressive auto-completion
  const handleSubmitRender = (
    title: string,
    resolution: RenderJob['resolution'],
    format: ExportFormat,
    ratio: AspectRatio
  ) => {
    const newJob = hyperframeVideoService.submitRenderJob(
      title,
      resolution,
      format,
      ratio,
      (updatedJob) => {
        setRenderJobs(hyperframeVideoService.getRenderJobs());
        if (updatedJob.status === 'completed') {
          setNotification(`Render "${updatedJob.title}" completed! Click Download Video in the queue.`);
        }
      }
    );
    setRenderJobs(hyperframeVideoService.getRenderJobs());
    setNotification(`Job "${newJob.title}" dispatched. Rendering 60fps frames in background...`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Quick direct client-side video export
  const handleQuickExport = async () => {
    if (!activeScene) return;
    setIsExportingQuick(true);
    setNotification(`Rendering & downloading "${activeScene.title}" video file...`);
    try {
      await generateAndDownloadVideo(activeScene.title, activeScene.durationSeconds, 'webm');
      setNotification(`Video "${activeScene.title}.webm" downloaded successfully to your device.`);
    } catch (err: any) {
      setNotification(`Export notice: ${err?.message || 'Download complete.'}`);
    } finally {
      setIsExportingQuick(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const aspectClass = {
    '16:9': 'aspect-video w-full max-w-2xl',
    '9:16': 'aspect-[9/16] w-64',
    '1:1': 'aspect-square w-96',
    '2.39:1': 'aspect-[2.39/1] w-full max-w-2xl',
  }[aspectRatio];

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#F6F3EC] text-[#1A1D1A] overflow-hidden select-none font-mono relative"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(26, 29, 26, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 29, 26, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Header Bar */}
      <header className="px-6 py-3 bg-[#FAF8F3] border-b border-[#1A1D1A]/10 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#F0ECE1] text-teal-800 border border-[#1A1D1A]/15">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#1A1D1A] tracking-wide font-mono">Hyperframe Cinematic Video Studio</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/20">
                Pro v8.2
              </span>
            </div>
            <p className="text-[11px] text-[#1A1D1A]/60 font-mono">
              Multi-Scene Storyboards • Petri Submersion 3D Camera Dives • Real-Time Shader LUTs
            </p>
          </div>
        </div>

        {/* Aspect Ratio & Render Queue Action */}
        <div className="flex items-center gap-3">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center bg-[#F0ECE1] rounded-lg p-0.5 border border-[#1A1D1A]/15 text-xs">
            {(['16:9', '9:16', '1:1', '2.39:1'] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-[#1A1D1A] text-[#FAF8F3] font-bold shadow-xs'
                    : 'text-[#1A1D1A]/70 hover:text-[#1A1D1A]'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Direct Download Video Button */}
          <button
            onClick={handleQuickExport}
            disabled={isExportingQuick}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Immediately generate and download WebM video"
          >
            {isExportingQuick ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F3]" />
            ) : (
              <Download className="w-4 h-4 text-[#FAF8F3]" />
            )}
            <span>{isExportingQuick ? 'Exporting...' : 'Direct Download Video'}</span>
          </button>

          {/* Render Queue Button */}
          <button
            onClick={() => setIsRenderModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F0ECE1] border border-[#1A1D1A]/20 text-xs font-semibold text-[#1A1D1A] transition-colors shadow-xs cursor-pointer"
          >
            <Clapperboard className="w-4 h-4 text-teal-700" />
            <span>Render Queue ({renderJobs.length})</span>
          </button>
        </div>
      </header>

      {/* Notification Banner */}
      {notification && (
        <div className="px-6 py-2 bg-emerald-100 border-b border-emerald-300 text-emerald-950 text-xs flex items-center justify-between animate-in fade-in shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-800 hover:text-emerald-950 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Studio Tabs */}
      <div className="px-6 py-2.5 bg-[#FAF8F3] border-b border-[#1A1D1A]/10 flex items-center gap-2 overflow-x-auto shrink-0 font-mono">
        {[
          { id: 'preview', label: 'Director Canvas & Conditioning', icon: Tv },
          { id: 'storyboard', label: `Storyboard & Scenes (${scenes.length})`, icon: Layers },
          { id: 'camera', label: '3D Submersion Camera Flights', icon: Compass },
          { id: 'color', label: `Color Grading & LUTs (${activeLut.name})`, icon: Palette },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#1A1D1A] text-[#FAF8F3] border border-[#1A1D1A] shadow-xs'
                  : 'bg-[#F6F3EC] text-[#1A1D1A]/70 border border-[#1A1D1A]/15 hover:bg-[#F0ECE1] hover:text-[#1A1D1A]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-300' : 'text-[#1A1D1A]/60'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: DIRECTOR PREVIEW CANVAS & CONDITIONING */}
        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Canvas Viewport (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-[#FAF8F3] rounded-2xl border border-[#1A1D1A]/15 shadow-xs">
              <div
                className={`relative rounded-xl border border-[#1A1D1A]/20 bg-black overflow-hidden shadow-md flex items-center justify-center transition-all ${aspectClass}`}
                style={{
                  filter: activeLut.filterCss,
                }}
              >
                {/* Simulated generative visual background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${
                    activeScene?.previewGradient || 'from-teal-950 via-slate-900 to-indigo-950'
                  } flex flex-col items-center justify-center text-center p-6`}
                >
                  {/* Optical Flare Overlay Simulation */}
                  {opticalSettings.anamorphicFlare > 0 && (
                    <div
                      className="absolute inset-x-0 h-1 bg-cyan-300/40 blur-[2px] pointer-events-none"
                      style={{
                        top: '48%',
                        opacity: opticalSettings.anamorphicFlare / 100,
                        boxShadow: `0 0 24px rgba(45, 212, 191, ${opticalSettings.anamorphicFlare / 100})`,
                      }}
                    />
                  )}

                  {/* Dynamic Waterline Ripple Mesh Simulation */}
                  <div className="w-56 h-56 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-3xl animate-pulse" />

                  {/* Scene Title Overlay */}
                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-teal-300 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-teal-500/40">
                      SCENE #{activeScene?.order}: {activeScene?.model.toUpperCase()} • 60 FPS
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-md font-mono">
                      {activeScene?.title}
                    </h3>
                    <p className="text-xs text-slate-300/90 max-w-md line-clamp-2 italic px-2 font-mono">
                      "{activeScene?.prompt}"
                    </p>
                  </div>

                  {/* Submersion Waterline Badge */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-teal-500/40 px-3 py-1.5 rounded-xl text-left shadow-lg">
                    <div className="text-[10px] text-teal-400 font-mono flex items-center gap-1.5">
                      <Compass className="w-3 h-3" />
                      FLIGHT: {activeScene?.cameraFlight.toUpperCase()}
                    </div>
                    <div className="text-xs font-semibold text-white font-mono">
                      Motion Scale: {activeScene?.motionScale}/10 • {activeScene?.durationSeconds.toFixed(1)}s
                    </div>
                  </div>

                  {/* First Frame I2V Indicator */}
                  {activeScene?.firstFrameImageUrl && (
                    <div className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-300">
                      I2V ANCHOR ACTIVE
                    </div>
                  )}
                </div>
              </div>

              {/* Viewport Meta Bar */}
              <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#1A1D1A]/70 px-2 font-mono">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-teal-800 font-bold">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                    Footage Stream: {isFootageLoaded ? 'Active 60fps' : 'Idle'}
                  </span>
                  <span className="text-[#1A1D1A]/30">|</span>
                  <span>LUT: {activeLut.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFootageLoaded(!isFootageLoaded)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#F0ECE1] hover:bg-[#E8E2D5] text-[#1A1D1A] border border-[#1A1D1A]/20 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-teal-700" />
                    <span>{isFootageLoaded ? 'Reload Footage' : 'Load Footage'}</span>
                  </button>
                  <button
                    onClick={handleQuickExport}
                    disabled={isExportingQuick}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#FAF8F3] hover:bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/20 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3 h-3 text-teal-700" />
                    <span>Download Clip (.webm)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Director Conditioning Controls (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 font-mono">
              <div className="bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4 text-teal-700" />
                  <h3 className="text-sm font-semibold text-[#1A1D1A]">Shot Conditioning & Latent Dynamics</h3>
                </div>

                {/* Prompt editing */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1D1A]/70 mb-1">Cinematic Prompt</label>
                    <textarea
                      rows={3}
                      value={activeScene?.prompt || ''}
                      onChange={e => handleUpdateScene(activeScene.id, { prompt: e.target.value })}
                      className="w-full text-xs bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg p-2.5 text-[#1A1D1A] focus:outline-none focus:border-[#1A1D1A] font-mono resize-none"
                    />
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-xs font-medium text-[#1A1D1A]/70 mb-1">Negative Conditioning</label>
                    <input
                      type="text"
                      value={activeScene?.negativePrompt || ''}
                      onChange={e => handleUpdateScene(activeScene.id, { negativePrompt: e.target.value })}
                      placeholder="blurry, jitter, low resolution, artifacts"
                      className="w-full text-xs bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg px-3 py-2 text-[#1A1D1A] focus:outline-none focus:border-[#1A1D1A] font-mono"
                    />
                  </div>

                  {/* Model & Camera Flight Quick Select */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="block text-xs text-[#1A1D1A]/70 mb-1">Video Engine</label>
                      <select
                        value={activeScene?.model}
                        onChange={e => handleUpdateScene(activeScene.id, { model: e.target.value as VideoModelId })}
                        className="w-full text-xs bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg px-2.5 py-1.5 text-[#1A1D1A] font-mono focus:outline-none focus:border-[#1A1D1A]"
                      >
                        <option value="veo-2">Veo-2 (DeepMind)</option>
                        <option value="sora-2">Sora-2 (OpenAI)</option>
                        <option value="wan-2.1">Wan 2.1 (Cinematic)</option>
                        <option value="luma-dream">Luma Dream Machine</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[#1A1D1A]/70 mb-1">Camera Flight</label>
                      <select
                        value={activeScene?.cameraFlight}
                        onChange={e =>
                          handleUpdateScene(activeScene.id, { cameraFlight: e.target.value as CameraFlightType })
                        }
                        className="w-full text-xs bg-[#F6F3EC] border border-[#1A1D1A]/20 rounded-lg px-2.5 py-1.5 text-[#1A1D1A] font-mono focus:outline-none focus:border-[#1A1D1A]"
                      >
                        <option value="orbital-descent">Orbital Descent</option>
                        <option value="waterline-breach">Waterline Breach</option>
                        <option value="hourglass-zoom">Hourglass Core</option>
                        <option value="archimedean-ascent">Spiral Ascent</option>
                      </select>
                    </div>
                  </div>

                  {/* Motion Strength & Pacing */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-[#1A1D1A]/80 mb-1">
                      <span>Motion Energy Scale</span>
                      <span className="font-mono text-teal-800 font-bold">{activeScene?.motionScale}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={activeScene?.motionScale || 6}
                      onChange={e => handleUpdateScene(activeScene.id, { motionScale: Number(e.target.value) })}
                      className="w-full h-1.5 bg-[#F0ECE1] rounded-lg accent-[#1A1D1A] cursor-pointer"
                    />
                  </div>

                  {/* Dispatch Quick Render */}
                  <div className="pt-3">
                    <button
                      onClick={() => setIsRenderModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1A1D1A] hover:bg-[#1A1D1A]/85 text-[#FAF8F3] font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-teal-300" />
                      Configure & Batch Render Storyboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-SCENE STORYBOARD & KEYFRAMING */}
        {activeTab === 'storyboard' && (
          <SceneStoryboardDrawer
            scenes={scenes}
            activeSceneId={activeSceneId}
            onSelectScene={handleSelectScene}
            onAddScene={handleAddScene}
            onUpdateScene={handleUpdateScene}
            onDeleteScene={handleDeleteScene}
            onMoveScene={handleMoveScene}
          />
        )}

        {/* TAB 3: 3D SUBMERSION CAMERA FLIGHTS */}
        {activeTab === 'camera' && (
          <SubmersionFlightStudio
            currentFlight={activeScene?.cameraFlight || 'orbital-descent'}
            onSelectFlight={flight => handleUpdateScene(activeScene.id, { cameraFlight: flight })}
            motionScale={activeScene?.motionScale || 6}
          />
        )}

        {/* TAB 4: CINEMATIC COLOR GRADING & SHADERS */}
        {activeTab === 'color' && (
          <ColorGradingLUTCenter
            activeLut={activeLut}
            onSelectLUT={handleSelectLUT}
            opticalSettings={opticalSettings}
            onUpdateOptical={handleUpdateOptical}
          />
        )}

        {/* PERSISTENT ANCHOR: MULTI-TRACK NON-LINEAR TIMELINE */}
        <div className="pt-2">
          <MultiTrackTimeline
            scenes={scenes}
            activeSceneId={activeSceneId}
            onSelectScene={handleSelectScene}
            lutName={activeLut.name}
          />
        </div>
      </div>

      {/* Render Queue Modal */}
      <RenderQueueModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        jobs={renderJobs}
        onSubmitRender={handleSubmitRender}
        scenesCount={scenes.length}
        totalDuration={totalDuration}
      />
    </div>
  );
};
