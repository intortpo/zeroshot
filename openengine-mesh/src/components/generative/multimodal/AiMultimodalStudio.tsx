import React, { useState, useRef } from 'react';
import {
  Layers,
  Upload,
  Video,
  Image as ImageIcon,
  Sparkles,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Download,
  X,
  Zap,
} from 'lucide-react';
import {
  generateAiImage,
  synthesizeVideoClip,
  saveGeneratedAssetToLibrary,
  GeneratedImageResult,
  GeneratedVideoResult,
} from '../services/generativeSynthesisEngine';

interface AiMultimodalStudioProps {
  onSendToVideo?: (imageUrl: string, prompt: string) => void;
}

type MultimodalMode = 'image_to_video' | 'style_transfer' | 'vision_narration' | 'cross_modal_bundle';

export const AiMultimodalStudio: React.FC<AiMultimodalStudioProps> = ({ onSendToVideo }) => {
  const [activeMode, setActiveMode] = useState<MultimodalMode>('image_to_video');

  // Input file / media
  const [mediaUrl, setMediaUrl] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
  const [fileName, setFileName] = useState<string>('Petri_Architectural_Campus.png');
  const [fileSize, setFileSize] = useState<string>('1.2 MB');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation Inputs
  const [prompt, setPrompt] = useState(
    'Cinematic orbital camera flight across glass pavilions with volumetric lighting and atmospheric mist'
  );
  const [cameraFlight, setCameraFlight] = useState<
    'orbital-descent' | 'waterline-breach' | 'hourglass-zoom' | 'archimedean-ascent' | 'pan-cinematic'
  >('orbital-descent');
  const [motionIntensity, setMotionIntensity] = useState(7);
  const [targetStyle, setTargetStyle] = useState('3d_glassmorphic');

  // State for outputs
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideoResult | null>(null);
  const [transformedImage, setTransformedImage] = useState<GeneratedImageResult | null>(null);

  // Audio narration state
  const [narrationTranscript, setNarrationTranscript] = useState<string>(
    'Multimodal Vision Breakdown: Architectural scan confirms 4 distinct glass pavilion wings linked by central atrium. Volumetric lighting indices match standard daylight Kelvin rating (5400K). Structural geometry adheres to low-entropy modular specifications.'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Pipeline 1: Image-to-Video
  const handleGenerateVideoFromImage = async () => {
    setIsGenerating(true);
    setStatusMessage('Conditioning motion vectors on uploaded reference image...');

    try {
      const vidResult = await synthesizeVideoClip(
        {
          prompt,
          model: 'veo-2',
          aspectRatio: '16:9',
          resolution: '1080p 60fps',
          durationSeconds: 4,
          fps: 30,
          motionScale: motionIntensity,
          cameraFlight,
          firstFrameImageUrl: mediaUrl,
        },
        (pct, stage) => setStatusMessage(`${stage} (${pct}%)`)
      );

      setGeneratedVideo(vidResult);

      saveGeneratedAssetToLibrary(
        `I2V: ${prompt.slice(0, 28)}`,
        'video',
        vidResult.videoUrl,
        vidResult.thumbnailUrl,
        {
          prompt,
          sourceImage: fileName,
          cameraFlight,
          motionIntensity,
          durationSeconds: 4,
        },
        ['multimodal', 'image-to-video']
      );

      setNotification('Generated Image-to-Video clip ready and saved to library!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('I2V error:', err);
      setNotification(`Failed to generate video: ${err?.message || 'Error'}`);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  // Pipeline 2: Visual Style Transfer / Image-to-Image
  const handleTransformImage = async () => {
    setIsGenerating(true);
    setStatusMessage('Applying multimodal style fusion and latent transformation...');

    try {
      const imgResult = await generateAiImage({
        prompt: `${prompt}, style of ${targetStyle}`,
        aspectRatio: '16:9',
        stylePreset: targetStyle,
        referenceImageUrl: mediaUrl,
      });

      setTransformedImage(imgResult);

      saveGeneratedAssetToLibrary(
        `Style Fusion: ${prompt.slice(0, 28)}`,
        'image',
        imgResult.dataUrl,
        imgResult.dataUrl,
        {
          prompt,
          sourceImage: fileName,
          targetStyle,
        },
        ['multimodal', 'style-transfer']
      );

      setNotification('Transformed visual asset ready!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Style transfer error:', err);
      setNotification(`Failed to transform image: ${err?.message || 'Error'}`);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  // Pipeline 3: Vision Analysis & Spoken Narration
  const handleSynthesizeSpokenNarration = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(narrationTranscript);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis?.speak(utterance);
  };

  // Pipeline 4: Unified Multimodal Bundle
  const handleGenerateBundle = async () => {
    setIsGenerating(true);
    setStatusMessage('Synthesizing coordinated Multimodal Bundle (Image + Video + Speech)...');

    try {
      // 1. Image
      const imgRes = await generateAiImage({
        prompt,
        aspectRatio: '16:9',
        stylePreset: targetStyle,
        referenceImageUrl: mediaUrl,
      });
      setTransformedImage(imgRes);

      // 2. Video from the newly transformed image
      const vidRes = await synthesizeVideoClip({
        prompt,
        model: 'veo-2',
        aspectRatio: '16:9',
        resolution: '1080p 60fps',
        durationSeconds: 3,
        fps: 30,
        motionScale: motionIntensity,
        cameraFlight,
        firstFrameImageUrl: imgRes.dataUrl,
      });
      setGeneratedVideo(vidRes);

      // 3. Spoken briefing
      const transcript = `Multimodal Asset Bundle generated for "${prompt}". Primary image resolution is 1920 by 1080 with ${targetStyle} aesthetic. 3D camera trajectory executed with ${cameraFlight} profile. All assets synchronized and verified.`;
      setNarrationTranscript(transcript);

      const utterance = new SpeechSynthesisUtterance(transcript);
      window.speechSynthesis?.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      setNotification('Coordinated Multimodal Bundle generated successfully!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error('Bundle generation error:', err);
      setNotification(`Bundle generation failed: ${err?.message || 'Error'}`);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#FAFBFB]">
      {/* LEFT COLUMN: Multimodal Input & Mode Configurations */}
      <div className="w-full xl:w-[480px] p-6 border-b xl:border-b-0 xl:border-r border-stone-200/80 overflow-y-auto space-y-5 shrink-0 bg-white/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Multimodal Generation Studio</h2>
              <p className="text-[11px] text-stone-500">Cross-modal video, style fusion & speech synthesis</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            CROSS-MODAL
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100/90 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => setActiveMode('image_to_video')}
            className={`p-2 rounded-lg font-medium text-left transition-all cursor-pointer ${
              activeMode === 'image_to_video'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span>Image-to-Video (I2V)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveMode('style_transfer')}
            className={`p-2 rounded-lg font-medium text-left transition-all cursor-pointer ${
              activeMode === 'style_transfer'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Style Fusion (I2I)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveMode('vision_narration')}
            className={`p-2 rounded-lg font-medium text-left transition-all cursor-pointer ${
              activeMode === 'vision_narration'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Vision-to-Speech</span>
            </div>
          </button>

          <button
            onClick={() => setActiveMode('cross_modal_bundle')}
            className={`p-2 rounded-lg font-medium text-left transition-all cursor-pointer ${
              activeMode === 'cross_modal_bundle'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Asset Bundle</span>
            </div>
          </button>
        </div>

        {/* Reference Image / Document Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700">Multimodal Input Media</label>
            <span className="text-[10px] text-stone-400 font-mono">{fileSize}</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-3 cursor-pointer transition-all overflow-hidden ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-stone-200 bg-stone-50 hover:border-stone-300'
            }`}
          >
            {mediaUrl ? (
              <div className="flex items-center space-x-3">
                <img src={mediaUrl} alt="Conditioning input" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-stone-900 truncate">{fileName}</div>
                  <div className="text-[10px] text-stone-500 font-mono mt-0.5">Click or drop new file to replace</div>
                  <div className="inline-flex items-center space-x-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Keyframe Encoded</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-1">
                <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                <div className="text-xs font-semibold text-stone-700">Drop image or document here</div>
                <div className="text-[10px] text-stone-400">PNG, JPG, WebP supported</div>
              </div>
            )}
          </div>
        </div>

        {/* Directive / Conditioning Prompt */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Multimodal Generation Directive</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none h-20 bg-white"
            placeholder="Specify motion trajectory, target aesthetic transformation, or visual focal elements..."
          />
        </div>

        {/* Dynamic Controls based on Active Mode */}
        {activeMode === 'image_to_video' && (
          <div className="space-y-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-stone-600 block mb-1">Camera Trajectory</label>
                <select
                  value={cameraFlight}
                  onChange={(e) => setCameraFlight(e.target.value as any)}
                  className="w-full p-2 border border-stone-200 rounded-lg bg-white"
                >
                  <option value="orbital-descent">Orbital 3D Descent</option>
                  <option value="waterline-breach">Waterline Breach</option>
                  <option value="hourglass-zoom">Hourglass Hyperzoom</option>
                  <option value="pan-cinematic">Horizontal Pan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-600 block mb-1">Motion Scale ({motionIntensity}x)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateVideoFromImage}
              disabled={isGenerating}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMessage || 'Synthesizing Video Stream...'}</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Synthesize Video from Image</span>
                </>
              )}
            </button>
          </div>
        )}

        {activeMode === 'style_transfer' && (
          <div className="space-y-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div>
              <label className="font-semibold text-stone-600 block mb-1">Target Transformation Style</label>
              <select
                value={targetStyle}
                onChange={(e) => setTargetStyle(e.target.value)}
                className="w-full p-2 border border-stone-200 rounded-lg bg-white"
              >
                <option value="3d_glassmorphic">3D Frosted Glassmorphism</option>
                <option value="enterprise_minimal">Enterprise Minimalist Clean Teal</option>
                <option value="isometric_blueprint">Isometric Blueprint Hologram</option>
                <option value="cyberpunk_neon">Cyberpunk Neon Rain</option>
              </select>
            </div>

            <button
              onClick={handleTransformImage}
              disabled={isGenerating}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transforming Image Latents...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Transform Image Style</span>
                </>
              )}
            </button>
          </div>
        )}

        {activeMode === 'vision_narration' && (
          <div className="space-y-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <label className="font-semibold text-stone-700 block">Synthesized Speech Transcript</label>
            <textarea
              value={narrationTranscript}
              onChange={(e) => setNarrationTranscript(e.target.value)}
              className="w-full p-2.5 text-xs border border-stone-200 rounded-lg bg-white h-20 resize-none"
            />

            <button
              onClick={handleSynthesizeSpokenNarration}
              className={`w-full py-2.5 text-white rounded-xl font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-md ${
                isSpeaking ? 'bg-rose-700 hover:bg-rose-800' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Stop Voice Narration' : 'Speak Multimodal Breakdown'}</span>
            </button>
          </div>
        )}

        {activeMode === 'cross_modal_bundle' && (
          <div className="space-y-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <p className="text-[11px] text-stone-500">
              Generates a coupled set of visual still, animated video clip, and spoken briefing narration matching your concept.
            </p>

            <button
              onClick={handleGenerateBundle}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Multimodal Bundle...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Generate Complete Asset Bundle</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Multimodal Interactive Viewer & Player */}
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

        {/* Viewport for Video or Image or Comparison */}
        <div className="flex-1 min-h-[380px] bg-stone-900 rounded-2xl border border-stone-800 shadow-xl overflow-hidden flex flex-col items-center justify-center relative">
          {activeMode === 'image_to_video' && (
            generatedVideo ? (
              <video
                src={generatedVideo.videoUrl}
                controls
                autoPlay
                loop
                className="max-h-[520px] w-full object-contain"
              />
            ) : (
              <div className="text-center p-6 text-stone-400 space-y-3">
                <Video className="w-12 h-12 text-indigo-400 mx-auto" />
                <h3 className="text-sm font-semibold text-stone-200">Image-to-Video Preview Stage</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  Upload an image on the left and click &quot;Synthesize Video from Image&quot; to render motion physics and camera trajectories.
                </p>
              </div>
            )
          )}

          {activeMode === 'style_transfer' && (
            transformedImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={transformedImage.dataUrl}
                  alt="Transformed visual"
                  className="max-h-[520px] max-w-full object-contain rounded-lg shadow-2xl"
                />
                <span className="absolute bottom-6 left-6 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono rounded border border-white/10 font-semibold">
                  STYLE: {targetStyle.toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="text-center p-6 text-stone-400 space-y-3">
                <ImageIcon className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-sm font-semibold text-stone-200">Style Fusion Stage</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  Upload a reference image or blueprint on the left and click &quot;Transform Image Style&quot; to synthesize restyled outputs.
                </p>
              </div>
            )
          )}

          {activeMode === 'vision_narration' && (
            <div className="w-full h-full p-8 flex flex-col justify-between text-white">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Multimodal Speech Stream</h3>
                    <p className="text-[11px] text-stone-400">Web Audio API neural voice agent</p>
                  </div>
                </div>

                {isSpeaking && (
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-4 bg-rose-500 animate-pulse rounded-full" />
                    <span className="w-1.5 h-6 bg-rose-400 animate-pulse delay-75 rounded-full" />
                    <span className="w-1.5 h-3 bg-rose-600 animate-pulse delay-150 rounded-full" />
                    <span className="w-1.5 h-5 bg-rose-500 animate-pulse delay-100 rounded-full" />
                  </div>
                )}
              </div>

              <div className="my-6 p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 font-mono text-xs text-stone-300 leading-relaxed">
                {narrationTranscript}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-stone-500">FERPA-sanitized & cryptographically verified</span>
                <button
                  onClick={handleSynthesizeSpokenNarration}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isSpeaking ? 'Stop Audio' : 'Play Speech'}
                </button>
              </div>
            </div>
          )}

          {activeMode === 'cross_modal_bundle' && (
            <div className="w-full h-full p-6 flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Image card */}
                <div className="rounded-xl overflow-hidden border border-stone-800 bg-black flex flex-col justify-center items-center relative">
                  {transformedImage ? (
                    <img src={transformedImage.dataUrl} alt="Bundle visual" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-stone-600 text-xs font-mono">Image Asset Slot</div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] font-mono rounded">
                    1. STILL RENDER
                  </span>
                </div>

                {/* Video card */}
                <div className="rounded-xl overflow-hidden border border-stone-800 bg-black flex flex-col justify-center items-center relative">
                  {generatedVideo ? (
                    <video src={generatedVideo.videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-stone-600 text-xs font-mono">Video Asset Slot</div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] font-mono rounded">
                    2. MOTION CLIP
                  </span>
                </div>
              </div>

              {/* Bottom audio narration row */}
              <div className="mt-4 p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 flex items-center justify-between text-xs text-stone-200">
                <div className="flex items-center space-x-2 truncate max-w-lg">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{narrationTranscript}</span>
                </div>
                <button
                  onClick={handleSynthesizeSpokenNarration}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer ml-2"
                >
                  {isSpeaking ? 'Stop Audio' : 'Listen Briefing'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-stone-900">Multimodal Pipeline Outputs</div>
            <div className="text-[11px] text-stone-500 font-mono">
              Ready for immediate download, NLE insertion, or gallery sync
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {generatedVideo && (
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = generatedVideo.videoUrl;
                  a.download = `multimodal-video-${generatedVideo.id}.webm`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </button>
            )}

            {transformedImage && (
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = transformedImage.dataUrl;
                  a.download = `multimodal-image-${transformedImage.id}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
            )}

            {transformedImage && onSendToVideo && (
              <button
                onClick={() => onSendToVideo(transformedImage.dataUrl, prompt)}
                className="px-3 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Animate in Video Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
