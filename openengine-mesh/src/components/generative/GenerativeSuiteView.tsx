import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Palette,
  Volume2,
  RefreshCw,
  Clapperboard,
  Film,
  Zap,
} from 'lucide-react';
import { PetriDesignStudioView } from './PetriDesignStudioView';
import { HyperframeVideoSuite } from './HyperframeVideoSuite';
import { AiVideoGenerator } from './video/AiVideoGenerator';
import { AiImageGenerator } from './image/AiImageGenerator';
import { AiMultimodalStudio } from './multimodal/AiMultimodalStudio';
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
  const [videoSubMode, setVideoSubMode] = useState<'generator' | 'hyperframe'>('generator');
  const [videoInitialImage, setVideoInitialImage] = useState<string | null>(null);

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

  // Audio State (Speech Synthesis)
  const [audioPrompt, setAudioPrompt] = useState(
    'Welcome back to Zero Petri. All eight hundred forty-nine student records are synced with zero latency.'
  );
  const [voicePersona, setVoicePersona] = useState('nova_calm');
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const handleSynthesizeAudio = () => {
    setIsSynthesizingAudio(true);
    setAudioPlayed(false);
    setTimeout(() => {
      setIsSynthesizingAudio(false);
      setAudioPlayed(true);
      const utterance = new SpeechSynthesisUtterance(audioPrompt);
      utterance.rate = audioSpeed;
      window.speechSynthesis?.speak(utterance);
    }, 400);
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
            <span>Petri Design</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Workdesks
            </span>
          </button>
        </div>
      </div>

      {/* View Content Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 1. Video Suite (AI Video Generator + Hyperframe Cinematic Studio) */}
        {activeTab === 'video' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-Mode Switcher Bar */}
            <div className="px-6 py-2 bg-stone-50/90 border-b border-stone-200/70 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-stone-600">Video Studio Mode:</span>
                <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-stone-200 text-xs shadow-xs">
                  <button
                    onClick={() => setVideoSubMode('generator')}
                    className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-all flex items-center space-x-1.5 ${
                      videoSubMode === 'generator'
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-indigo-600" />
                    <span>AI Video Generator (T2V & I2V)</span>
                  </button>

                  <button
                    onClick={() => setVideoSubMode('hyperframe')}
                    className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-all flex items-center space-x-1.5 ${
                      videoSubMode === 'hyperframe'
                        ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Film className="w-3 h-3 text-teal-600" />
                    <span>Hyperframe Cinematic Studio & NLE</span>
                  </button>
                </div>
              </div>

              {onSelectView && (
                <button
                  onClick={() => onSelectView('video_flow')}
                  className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-teal-600" />
                  <span>Open Video Flow NLE →</span>
                </button>
              )}
            </div>

            {/* Video Sub-Mode Contents */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {videoSubMode === 'generator' ? (
                <AiVideoGenerator
                  initialImage={videoInitialImage}
                  onClearInitialImage={() => setVideoInitialImage(null)}
                  onSwitchToHyperframe={() => setVideoSubMode('hyperframe')}
                />
              ) : (
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <HyperframeVideoSuite />
                </div>
              )}
            </div>
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
                  className="px-2.5 py-1 bg-white border border-rose-200 text-rose-800 rounded-lg font-medium hover:bg-rose-100 cursor-pointer"
                >
                  Stop Audio
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Image Studio (AI Image Generator) */}
        {activeTab === 'image' && (
          <AiImageGenerator
            onSendToVideo={(imgUrl) => {
              setVideoInitialImage(imgUrl);
              setActiveTab('video');
              setVideoSubMode('generator');
            }}
            onSendToMultimodal={() => {
              setActiveTab('multimodal');
            }}
          />
        )}

        {/* 4. Multi-Modal Studio (Actual Multimodal Generation) */}
        {activeTab === 'multimodal' && (
          <AiMultimodalStudio
            onSendToVideo={(imgUrl) => {
              setVideoInitialImage(imgUrl);
              setActiveTab('video');
              setVideoSubMode('generator');
            }}
          />
        )}

        {/* 5. Complete Petri Design Studio */}
        {activeTab === 'design' && <PetriDesignStudioView />}
      </div>
    </div>
  );
};
