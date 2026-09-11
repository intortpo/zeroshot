import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Download,
  Sparkles,
  RefreshCw,
  Film,
  Camera,
  CheckCircle2,
  ArrowRight,
  Upload,
  X,
  Compass,
  Zap,
} from 'lucide-react';
import {
  VideoGenerationRequest,
  GeneratedVideoResult,
  synthesizeVideoClip,
  saveGeneratedAssetToLibrary,
  AspectRatio,
} from '../services/generativeSynthesisEngine';
import { hyperframeVideoService } from '../../../services/hyperframeVideoService';

interface AiVideoGeneratorProps {
  initialImage?: string | null;
  onClearInitialImage?: () => void;
  onSwitchToHyperframe?: () => void;
}

const SAMPLE_PROMPTS = [
  'Deep underwater bioluminescent jellyfish swarm with crystalline caustic refractions',
  'FPV drone dive through brutalist glass university atrium, tiffany teal reflections',
  'Cyberpunk maglev train speeding through rain-slick neon skyscraper canyons',
  'Microscopic cell division with glowing fluorescent protein markers and volumetric lighting',
];

export const AiVideoGenerator: React.FC<AiVideoGeneratorProps> = ({
  initialImage,
  onClearInitialImage,
  onSwitchToHyperframe,
}) => {
  const [prompt, setPrompt] = useState(
    'Hyperframe underwater drone sweeping over iridescent turquoise sand ripples with volumetric caustics'
  );
  const [negativePrompt, setNegativePrompt] = useState('blurry, jitter, low quality, distortion, noise');
  const [model, setModel] = useState<'veo-2' | 'sora-2' | 'wan-2.1' | 'luma-dream' | 'petri-neural'>('veo-2');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<'1080p 60fps' | '4K Cinema' | '720p Fast'>('1080p 60fps');
  const [durationSeconds, setDurationSeconds] = useState(4);
  const [fps, setFps] = useState<number>(30);
  const [motionScale, setMotionScale] = useState(6);
  const [cameraFlight, setCameraFlight] = useState<
    'orbital-descent' | 'waterline-breach' | 'hourglass-zoom' | 'archimedean-ascent' | 'pan-cinematic'
  >('orbital-descent');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 899999) + 100000);

  const [firstFrameImage, setFirstFrameImage] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('');
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideoResult | null>(null);
  const [videoHistory, setVideoHistory] = useState<GeneratedVideoResult[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (initialImage) {
      setFirstFrameImage(initialImage);
    }
  }, [initialImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFirstFrameImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFirstFrameImage(null);
    if (onClearInitialImage) onClearInitialImage();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(5);
    setStageText('Synthesizing prompt tokens & motion vectors...');

    const req: VideoGenerationRequest = {
      prompt,
      negativePrompt,
      model,
      aspectRatio,
      resolution,
      durationSeconds,
      fps,
      motionScale,
      cameraFlight,
      firstFrameImageUrl: firstFrameImage || undefined,
      seed,
    };

    try {
      const result = await synthesizeVideoClip(req, (pct, stage) => {
        setProgress(pct);
        setStageText(stage);
      });

      setCurrentVideo(result);
      setVideoHistory((prev) => [result, ...prev]);

      // Automatically auto-save to asset library
      const asset = saveGeneratedAssetToLibrary(
        `AI Video: ${prompt.slice(0, 32)}...`,
        'video',
        result.videoUrl,
        result.thumbnailUrl,
        {
          model,
          prompt,
          seed,
          aspectRatio,
          durationSeconds,
          fps,
          resolution,
          cameraFlight,
        },
        [model, 'ai-video', cameraFlight]
      );

      setNotification(`Video rendered and saved to Asset Library (${asset.name})`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Video generation error:', err);
      setNotification(`Video generation failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setStageText('');
    }
  };

  const handleDownload = (video: GeneratedVideoResult) => {
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `petri-${video.model}-${video.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportToHyperframe = () => {
    if (!currentVideo) return;

    hyperframeVideoService.addScene({
      title: `Gen: ${currentVideo.prompt.slice(0, 24)}...`,
      prompt: currentVideo.prompt,
      negativePrompt,
      durationSeconds: currentVideo.durationSeconds,
      motionScale,
      transitionToNext: 'optical-flow-morph',
      cameraFlight: cameraFlight === 'pan-cinematic' ? 'orbital-descent' : cameraFlight,
      model: model === 'petri-neural' ? 'veo-2' : model,
      firstFrameImageUrl: firstFrameImage || currentVideo.thumbnailUrl,
      seamlessLoop: false,
      previewGradient: 'from-slate-900 via-teal-950 to-slate-900',
    });

    if (onSwitchToHyperframe) {
      onSwitchToHyperframe();
    } else {
      setNotification('Scene exported to Hyperframe Storyboard!');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#FAFBFB]">
      {/* LEFT COLUMN: Controls & Prompting */}
      <div className="w-full xl:w-[480px] p-6 border-b xl:border-b-0 xl:border-r border-stone-200/80 overflow-y-auto space-y-5 shrink-0 bg-white/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">AI Video Generation Studio</h2>
              <p className="text-[11px] text-stone-500">Synthesize cinematic T2V & I2V video clips</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            NATIVE RENDERER
          </span>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
            <span>Diffusion Video Model</span>
            <span className="text-[10px] text-stone-400 font-mono">Real-time WebM synthesis</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { id: 'veo-2', name: 'Google Veo 2', badge: 'High-Fi' },
              { id: 'sora-2', name: 'Sora 2 Turbo', badge: 'Ultra-Motion' },
              { id: 'wan-2.1', name: 'Wan 2.1', badge: 'Fast 14B' },
              { id: 'luma-dream', name: 'Luma Ray 2', badge: 'Volumetric' },
              { id: 'petri-neural', name: 'Petri Neural', badge: 'In-Process' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id as any)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  model === m.id
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold shadow-xs ring-1 ring-indigo-500/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="text-[11px] font-medium leading-tight truncate">{m.name}</div>
                <div className="text-[9px] font-mono text-stone-400 mt-0.5">{m.badge}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700">Video Motion Prompt</label>
            <button
              onClick={() => {
                const randomPrompt = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
                setPrompt(randomPrompt);
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Surprise me</span>
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-24 bg-white"
            placeholder="Describe camera movement, physics, subjects, lighting, and scenery..."
          />
        </div>

        {/* Negative Prompt */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600">Negative Prompt</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full p-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            placeholder="blurry, jitter, low quality, artifacts"
          />
        </div>

        {/* Image-to-Video Conditioning (Optional Keyframe) */}
        <div className="space-y-2 p-3 bg-stone-50/80 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              <span>Image-to-Video First Frame (Optional)</span>
            </label>
            {firstFrameImage && (
              <button
                onClick={handleRemoveImage}
                className="text-[10px] text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {firstFrameImage ? (
            <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-900 h-28 flex items-center justify-center group">
              <img src={firstFrameImage} alt="First Frame Keyframe" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white text-stone-900 rounded-md text-[10px] font-bold shadow-md cursor-pointer"
                >
                  Change Frame
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-md text-[10px] font-bold shadow-md cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded text-[9px] font-mono">
                Keyframe Conditioning Active
              </span>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 border border-dashed border-stone-300 hover:border-indigo-400 bg-white rounded-lg text-center flex items-center justify-center space-x-2 text-xs text-stone-600 hover:text-indigo-600 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-stone-400" />
              <span>Upload image to animate into video (I2V)</span>
            </button>
          )}
        </div>

        {/* Camera Flight & Dynamics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-stone-600 block mb-1 flex items-center space-x-1">
              <Compass className="w-3 h-3 text-stone-400" />
              <span>Camera Trajectory</span>
            </label>
            <select
              value={cameraFlight}
              onChange={(e) => setCameraFlight(e.target.value as any)}
              className="w-full p-2 border border-stone-200 rounded-xl bg-white cursor-pointer"
            >
              <option value="orbital-descent">Orbital Descent (3D Sweep)</option>
              <option value="waterline-breach">Waterline Breach</option>
              <option value="hourglass-zoom">Hourglass Hyperzoom</option>
              <option value="archimedean-ascent">Archimedean Ascent</option>
              <option value="pan-cinematic">Cinematic Horizontal Pan</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-stone-600 block mb-1">
              Motion Intensity ({motionScale}x)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={motionScale}
              onChange={(e) => setMotionScale(parseInt(e.target.value))}
              className="w-full mt-2 accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Aspect Ratio & Resolution */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-stone-600 block mb-1">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="w-full p-2 border border-stone-200 rounded-xl bg-white cursor-pointer"
            >
              <option value="16:9">16:9 Cinema Landscape</option>
              <option value="9:16">9:16 Reel / Shorts</option>
              <option value="1:1">1:1 Square</option>
              <option value="2.39:1">2.39:1 Anamorphic Widescreen</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-stone-600 block mb-1">Resolution Preset</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              className="w-full p-2 border border-stone-200 rounded-xl bg-white cursor-pointer"
            >
              <option value="1080p 60fps">1080p 60fps Full HD</option>
              <option value="4K Cinema">4K Cinema UHD</option>
              <option value="720p Fast">720p Fast Preview</option>
            </select>
          </div>
        </div>

        {/* Duration & FPS */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-stone-600 block mb-1">Duration & FPS</label>
            <div className="flex gap-2">
              <select
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value))}
                className="w-1/2 p-2 border border-stone-200 rounded-xl bg-white cursor-pointer"
              >
                <option value={3}>3 sec</option>
                <option value={4}>4 sec</option>
                <option value={6}>6 sec</option>
                <option value={8}>8 sec</option>
              </select>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-1/2 p-2 border border-stone-200 rounded-xl bg-white cursor-pointer"
              >
                <option value={24}>24 fps</option>
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seed & Negative Prompt */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span>Seed: #{seed}</span>
            <button
              onClick={() => setSeed(Math.floor(Math.random() * 899999) + 100000)}
              className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Randomize
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{stageText || 'Generating Video Stream...'} ({progress}%)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate AI Video ({durationSeconds}s @ {fps}fps)</span>
            </>
          )}
        </button>

        {isGenerating && (
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-500 font-mono text-center">
              {stageText}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Video Player & Output Actions */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-5">
        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Stage: Player or Empty State */}
        <div className="flex-1 min-h-[380px] bg-stone-900 rounded-2xl border border-stone-800 shadow-xl overflow-hidden flex flex-col relative group">
          {currentVideo ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
              <video
                ref={videoPlayerRef}
                src={currentVideo.videoUrl}
                controls
                autoPlay
                loop
                className="max-h-[520px] w-full object-contain"
              />

              {/* Overlay Badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 pointer-events-none">
                <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 font-semibold">
                  {currentVideo.model.toUpperCase()}
                </span>
                <span className="px-2 py-1 rounded bg-teal-500/80 backdrop-blur-md text-white text-[10px] font-mono font-semibold">
                  {currentVideo.aspectRatio} • {currentVideo.durationSeconds}s
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 text-stone-400">
              <div className="w-16 h-16 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-stone-500 shadow-inner">
                <Video className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-200">No Video Rendered Yet</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  Configure your prompt, motion dynamics, and aspect ratio on the left, then click &quot;Generate AI Video&quot; to synthesize an actual playable clip.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Generate Quick Demo Clip</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Actions & Hyperframe Integration Bar */}
        {currentVideo && (
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-900">Generated Video Output Ready</div>
              <div className="text-[11px] text-stone-500 font-mono truncate max-w-md">
                {currentVideo.prompt}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(currentVideo)}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .WebM</span>
              </button>

              <button
                onClick={handleExportToHyperframe}
                className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Export to Hyperframe Storyboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Video History Reel */}
        {videoHistory.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
              <span>Recent Generative Renders ({videoHistory.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {videoHistory.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setCurrentVideo(vid)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all bg-stone-900 ${
                    currentVideo?.id === vid.id
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.prompt}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-mono text-white font-semibold truncate">
                      {vid.prompt}
                    </span>
                    <span className="text-[9px] font-mono text-teal-400">
                      {vid.durationSeconds}s • {vid.model}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
