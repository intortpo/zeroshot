import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Palette,
  Play,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { OpenDesignStudioView } from './OpenDesignStudioView';
import { PetriViewMode } from '../../types';

export type GenerativeSubTab = 'video' | 'audio' | 'image' | 'multimodal' | 'design';

interface GenerativeSuiteViewProps {
  initialTab?: GenerativeSubTab;
  currentView?: PetriViewMode;
  onSelectView?: (view: PetriViewMode) => void;
}

export const GenerativeSuiteView: React.FC<GenerativeSuiteViewProps> = ({
  initialTab = 'design',
  currentView,
  onSelectView,
}) => {
  const tabFromView = (view?: PetriViewMode): GenerativeSubTab => {
    if (view === 'generative_video') return 'video';
    if (view === 'generative_audio') return 'audio';
    if (view === 'generative_image') return 'image';
    if (view === 'generative_multimodal') return 'multimodal';
    if (view === 'generative_design') return 'design';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<GenerativeSubTab>(() => tabFromView(currentView));

  useEffect(() => {
    if (currentView) {
      setActiveTab(tabFromView(currentView));
    }
  }, [currentView]);

  const handleTabChange = (tab: GenerativeSubTab) => {
    setActiveTab(tab);
    if (onSelectView) {
      const modeMap: Record<GenerativeSubTab, PetriViewMode> = {
        video: 'generative_video',
        audio: 'generative_audio',
        image: 'generative_image',
        multimodal: 'generative_multimodal',
        design: 'generative_design',
      };
      onSelectView(modeMap[tab]);
    }
  };

  // Video State
  const [videoPrompt, setVideoPrompt] = useState(
    'Cinematic fluid ribbon simulation with soft cyan and tiffany lighting, 60fps slow motion, 4k render'
  );
  const [videoCameraMotion, setVideoCameraMotion] = useState('orbit_smooth');
  const [isVideoRendering, setIsVideoRendering] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState(false);

  // Audio State
  const [audioPrompt, setAudioPrompt] = useState(
    'Welcome back to Zero Petri. All eight hundred forty-nine student records are synced with zero latency.'
  );
  const [voicePersona, setVoicePersona] = useState('nova_calm');
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  // Image State
  const [imagePrompt, setImagePrompt] = useState(
    'Minimalist architectural educational campus with glass atrium, tiffany teal accents, isometric render'
  );
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('16:9');
  const [stylePreset, setStylePreset] = useState('enterprise_minimal');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Multi-Modal State
  const multimodalFile = 'Midterms_1-2026_Analysis.png';
  const multimodalAnalysis =
    'Vision Analysis Result: Detected 16 columns corresponding to curriculum skills. Student #402 demonstrates a 32% deviation on cloze test items while maintaining a 92% vocabulary benchmark.';

  const handleGenerateVideo = () => {
    setIsVideoRendering(true);
    setVideoSuccess(false);
    setTimeout(() => {
      setIsVideoRendering(false);
      setVideoSuccess(true);
    }, 1200);
  };

  const handleSynthesizeAudio = () => {
    setIsSynthesizingAudio(true);
    setAudioPlayed(false);
    setTimeout(() => {
      setIsSynthesizingAudio(false);
      setAudioPlayed(true);
      const utterance = new SpeechSynthesisUtterance(audioPrompt);
      utterance.rate = audioSpeed;
      window.speechSynthesis?.speak(utterance);
    }, 600);
  };

  const handleGenerateImage = () => {
    setIsGeneratingImage(true);
    setTimeout(() => {
      setIsGeneratingImage(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] overflow-hidden select-none font-sans">
      {/* Sub-navigation Bar for Generative Suite */}
      <div className="px-6 py-2.5 bg-white/90 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#0ABAB5]" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Generative Media & Design Engine
          </span>
        </div>

        {/* Generative Tabs */}
        <div className="flex items-center space-x-1 bg-stone-100/80 p-0.5 rounded-xl border border-stone-200/60 text-xs">
          <button
            onClick={() => handleTabChange('video')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span>Video</span>
          </button>

          <button
            onClick={() => handleTabChange('audio')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            <span>Audio</span>
          </button>

          <button
            onClick={() => handleTabChange('image')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Image</span>
          </button>

          <button
            onClick={() => handleTabChange('multimodal')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'multimodal'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Modal</span>
          </button>

          <button
            onClick={() => handleTabChange('design')}
            className={`px-3 py-1 rounded-lg font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'design'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-teal-600" />
            <span>Design Studio</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Open Design
            </span>
          </button>
        </div>
      </div>

      {/* View Content Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. Video Studio */}
        {activeTab === 'video' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Neural Video & Motion Synthesis</h2>
              <p className="text-xs text-stone-500 mt-1">
                Generate dynamic UI motion previews, product demos, and animated explainers with 60fps precision.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <label className="text-xs font-semibold text-stone-700 block">Motion Prompt</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-24"
              />

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Camera Path</label>
                  <select
                    value={videoCameraMotion}
                    onChange={(e) => setVideoCameraMotion(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-xl bg-stone-50 cursor-pointer"
                  >
                    <option value="orbit_smooth">Orbit Smooth 360°</option>
                    <option value="dolly_in">Dolly Zoom In</option>
                    <option value="pan_left">Slow Pan Left</option>
                    <option value="crane_overhead">Overhead Crane View</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Target Format</label>
                  <div className="p-2 border border-stone-200 rounded-xl bg-stone-50 font-mono text-stone-600">
                    MP4 (H.264 / 60 FPS / 1080p)
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={isVideoRendering}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isVideoRendering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Frame Motion...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Render Motion Video</span>
                  </>
                )}
              </button>
            </div>

            {videoSuccess && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-md space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Render Complete: fluid_motion_60fps.mp4</span>
                  </div>
                  <button className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5">
                    <Download className="w-3 h-3" />
                    <span>Download MP4</span>
                  </button>
                </div>
                <div className="w-full h-64 bg-stone-950 rounded-xl flex items-center justify-center text-stone-400 text-xs font-mono">
                  [ Video Player: 1920x1080 @ 60fps · Canvas Stream Active ]
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Audio Studio */}
        {activeTab === 'audio' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Neural Speech & Voice Synthesis</h2>
              <p className="text-xs text-stone-500 mt-1">
                Natural educational narration, voice briefings, and audio guidance agents.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <label className="text-xs font-semibold text-stone-700 block">Speech Transcript</label>
              <textarea
                value={audioPrompt}
                onChange={(e) => setAudioPrompt(e.target.value)}
                className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none h-24"
              />

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Voice Persona</label>
                  <select
                    value={voicePersona}
                    onChange={(e) => setVoicePersona(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-xl bg-stone-50 cursor-pointer"
                  >
                    <option value="nova_calm">Nova (Warm Educational Guide)</option>
                    <option value="echo_technical">Echo (Crisp Engineering Precision)</option>
                    <option value="shimmer_expressive">Shimmer (Expressive Presenter)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">
                    Playback Speed ({audioSpeed}x)
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>

              <button
                onClick={handleSynthesizeAudio}
                disabled={isSynthesizingAudio}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isSynthesizingAudio ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Voice Waveforms...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak Transcript</span>
                  </>
                )}
              </button>
            </div>

            {audioPlayed && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-rose-600" />
                  <span>Speech output actively streamed via Web Audio API.</span>
                </div>
                <button
                  onClick={() => window.speechSynthesis?.cancel()}
                  className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg font-medium hover:bg-rose-100"
                >
                  Stop Audio
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Image Studio */}
        {activeTab === 'image' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Text-to-Image & Asset Generator</h2>
              <p className="text-xs text-stone-500 mt-1">
                Generate production design mockups, illustration vectors, and UI component textures.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <label className="text-xs font-semibold text-stone-700 block">Visual Prompt</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none h-24"
              />

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full p-2 border border-stone-200 rounded-xl bg-stone-50 cursor-pointer"
                  >
                    <option value="16:9">16:9 Landscape (Presentation / Banner)</option>
                    <option value="1:1">1:1 Square (Avatar / Icon / Texture)</option>
                    <option value="9:16">9:16 Portrait (Mobile Screen)</option>
                    <option value="4:3">4:3 Standard (Slide / Document)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Style Preset</label>
                  <select
                    value={stylePreset}
                    onChange={(e) => setStylePreset(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-xl bg-stone-50 cursor-pointer"
                  >
                    <option value="enterprise_minimal">Enterprise Minimalist (Clean Teal)</option>
                    <option value="3d_glassmorphic">3D Frosted Glassmorphism</option>
                    <option value="vector_flat">Flat Vector Illustration</option>
                    <option value="isometric_blueprint">Isometric Blueprint Tech</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering Image with Latent Diffusion...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Generate Image Asset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 4. Multi-Modal Vision Analysis */}
        {activeTab === 'multimodal' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Multi-Modal Vision & Document Analysis</h2>
              <p className="text-xs text-stone-500 mt-1">
                Inspect scanned student tests, whiteboard diagrams, UI wireframes, and video frames.
              </p>
            </div>

            <div className="p-8 bg-white border-2 border-dashed border-stone-300 rounded-2xl text-center space-y-3">
              <Upload className="w-8 h-8 text-stone-400 mx-auto" />
              <div className="text-sm font-semibold text-stone-800">
                Drag and drop test sheets, diagrams, or wireframes
              </div>
              <p className="text-xs text-stone-400">
                Supports PNG, JPEG, WEBP, PDF, and MP4 frame captures (Stored with AES-256-GCM encryption)
              </p>
            </div>

            {multimodalAnalysis && (
              <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2 text-xs">
                <div className="font-bold text-stone-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Inspected: {multimodalFile}</span>
                </div>
                <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl font-mono text-[11px]">
                  {multimodalAnalysis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. Complete Open Design Studio */}
        {activeTab === 'design' && <OpenDesignStudioView />}
      </div>
    </div>
  );
};
