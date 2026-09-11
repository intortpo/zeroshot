import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Maximize2,
  RefreshCw,
  Video,
  Upload,
  X,
  CheckCircle2,
  Layers,
  Zap,
} from 'lucide-react';
import {
  ImageGenerationRequest,
  GeneratedImageResult,
  generateAiImage,
  saveGeneratedAssetToLibrary,
  AspectRatio,
} from '../services/generativeSynthesisEngine';

interface AiImageGeneratorProps {
  onSendToVideo?: (imageUrl: string, prompt: string) => void;
  onSendToMultimodal?: (imageUrl: string) => void;
}

const PRESET_PROMPTS = [
  'Minimalist educational campus with glass atrium, tiffany teal accents, isometric render, 8k',
  '3D frosted glassmorphic UI interface card with caustic lighting refractions and iridescent glow',
  'Isometric technical blueprint of quantum computing core with glowing holographic wireframes',
  'Bioluminescent underwater coral laboratory with volumetric light rays in obsidian deep ocean',
  'Cyberpunk metropolis transit terminal in electric cyan and magenta rain with octane reflections',
];

export const AiImageGenerator: React.FC<AiImageGeneratorProps> = ({
  onSendToVideo,
  onSendToMultimodal,
}) => {
  const [prompt, setImagePrompt] = useState(
    'Minimalist architectural educational campus with glass atrium, tiffany teal accents, isometric render'
  );
  const [negativePrompt, setNegativePrompt] = useState('blurry, ugly, artifacts, distortion, noise, low quality');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [stylePreset, setStylePreset] = useState('enterprise_minimal');
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 899999) + 100000);

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImageResult | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImageResult[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferenceImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const req: ImageGenerationRequest = {
      prompt,
      negativePrompt,
      aspectRatio,
      stylePreset,
      steps,
      cfgScale,
      seed,
      referenceImageUrl: referenceImage || undefined,
    };

    try {
      const result = await generateAiImage(req);
      setCurrentImage(result);
      setImageHistory((prev) => [result, ...prev]);

      // Auto-save to Asset Library
      saveGeneratedAssetToLibrary(
        `AI Image: ${prompt.slice(0, 32)}...`,
        'image',
        result.dataUrl,
        result.dataUrl,
        {
          prompt,
          seed,
          aspectRatio,
          stylePreset,
          steps,
          cfgScale,
          dimensions: `${result.width}x${result.height}`,
        },
        [stylePreset, 'ai-image', 'diffusion']
      );

      setNotification('Generated image saved to Asset Library!');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setNotification(`Generation failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImageResult) => {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = `petri-image-${img.seed}-${img.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAnimateWithVideo = () => {
    if (!currentImage) return;
    if (onSendToVideo) {
      onSendToVideo(currentImage.dataUrl, currentImage.prompt);
    } else {
      setNotification('Image dispatched to Video Generator as first frame!');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#FAFBFB]">
      {/* LEFT COLUMN: Image Controls */}
      <div className="w-full xl:w-[480px] p-6 border-b xl:border-b-0 xl:border-r border-stone-200/80 overflow-y-auto space-y-5 shrink-0 bg-white/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">AI Image Generator</h2>
              <p className="text-[11px] text-stone-500">Dual-engine latent diffusion & neural rendering</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            DIFFUSION v3
          </span>
        </div>

        {/* Prompt Input & Quick Picks */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700">Visual Prompt</label>
            <button
              onClick={() => {
                const randomPrompt = PRESET_PROMPTS[Math.floor(Math.random() * PRESET_PROMPTS.length)];
                setImagePrompt(randomPrompt);
              }}
              className="text-[11px] text-amber-600 hover:text-amber-700 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Prompt Ideas</span>
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none h-24 bg-white"
            placeholder="Describe visual composition, lighting, style, architectural geometry, materials..."
          />
        </div>

        {/* Negative Prompt */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-600">Negative Prompt</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full p-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
            placeholder="Elements to avoid (e.g. blur, low quality, distortion)"
          />
        </div>

        {/* Image-to-Image Reference (Optional) */}
        <div className="space-y-2 p-3 bg-stone-50/80 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Image-to-Image Conditioning (Optional)</span>
            </label>
            {referenceImage && (
              <button
                onClick={() => setReferenceImage(null)}
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

          {referenceImage ? (
            <div className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-900 h-24 flex items-center justify-center group">
              <img src={referenceImage} alt="Reference Conditioning" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => setReferenceImage(null)}
                  className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Clear Reference
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 border border-dashed border-stone-300 hover:border-amber-400 bg-white rounded-lg text-center flex items-center justify-center space-x-2 text-xs text-stone-600 hover:text-amber-600 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-stone-400" />
              <span>Upload image for style transfer / variation (I2I)</span>
            </button>
          )}
        </div>

        {/* Aspect Ratio & Style Preset */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-stone-600 block mb-1">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="w-full p-2 border border-stone-200 rounded-xl bg-white cursor-pointer"
            >
              <option value="16:9">16:9 Landscape (Presentation / Banner)</option>
              <option value="1:1">1:1 Square (Avatar / Icon)</option>
              <option value="9:16">9:16 Portrait (Mobile Screen)</option>
              <option value="4:3">4:3 Standard (Document / Slide)</option>
              <option value="21:9">21:9 Ultra-Wide Cinematic</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-stone-600 block mb-1">Style Preset</label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-xl bg-white cursor-pointer"
            >
              <option value="enterprise_minimal">Enterprise Minimalist (Clean Teal)</option>
              <option value="3d_glassmorphic">3D Frosted Glassmorphism</option>
              <option value="isometric_blueprint">Isometric Blueprint Tech</option>
              <option value="cyberpunk_neon">Cyberpunk Neon</option>
            </select>
          </div>
        </div>

        {/* Sampling Steps & CFG Scale */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-stone-600">Inference Steps</span>
              <span className="font-mono text-stone-500">{steps}</span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-stone-600">CFG Scale</span>
              <span className="font-mono text-stone-500">{cfgScale}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.5"
              value={cfgScale}
              onChange={(e) => setCfgScale(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Seed Info */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
          <span>Deterministic Seed: #{seed}</span>
          <button
            onClick={() => setSeed(Math.floor(Math.random() * 899999) + 100000)}
            className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
          >
            Randomize Seed
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Rendering Latent Diffusion Image...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate Image Asset</span>
            </>
          )}
        </button>
      </div>

      {/* RIGHT COLUMN: Output Stage & History */}
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

        {/* Main Canvas View */}
        <div className="flex-1 min-h-[380px] bg-stone-900 rounded-2xl border border-stone-800 shadow-xl overflow-hidden flex flex-col items-center justify-center relative group">
          {currentImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={currentImage.dataUrl}
                alt={currentImage.prompt}
                className="max-h-[520px] max-w-full object-contain rounded-lg shadow-2xl transition-transform"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 pointer-events-none">
                <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 font-semibold">
                  {currentImage.aspectRatio} • {currentImage.width}x{currentImage.height}
                </span>
                <span className="px-2 py-1 rounded bg-amber-500/80 backdrop-blur-md text-white text-[10px] font-mono font-semibold">
                  SEED: #{currentImage.seed}
                </span>
              </div>

              {/* Fullscreen inspect button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 text-white rounded-xl backdrop-blur-md transition-all cursor-pointer"
                title="Fullscreen Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 text-stone-400">
              <div className="w-16 h-16 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-stone-500 shadow-inner">
                <ImageIcon className="w-8 h-8 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-200">No Image Rendered Yet</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  Specify your visual prompt and style preset, then click &quot;Generate Image Asset&quot; to synthesize high-resolution imagery.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Render Sample Asset</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        {currentImage && (
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-stone-900">Latent Diffusion Output Ready</div>
              <div className="text-[11px] text-stone-500 font-mono truncate max-w-md">
                {currentImage.prompt}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(currentImage)}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={handleAnimateWithVideo}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Animate with Video Generator (I2V)</span>
              </button>

              {onSendToMultimodal && (
                <button
                  onClick={() => currentImage && onSendToMultimodal(currentImage.dataUrl)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Send to Multi-Modal</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Generation History */}
        {imageHistory.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-700">Recent Generated Images ({imageHistory.length})</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {imageHistory.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setCurrentImage(img)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all bg-stone-900 ${
                    currentImage?.id === img.id
                      ? 'border-amber-600 ring-2 ring-amber-500/30'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={img.dataUrl}
                    alt={img.prompt}
                    className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 p-1 flex items-end transition-opacity">
                    <span className="text-[9px] font-mono text-white truncate">{img.stylePreset}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isModalOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-6xl max-h-full flex flex-col items-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={currentImage.dataUrl}
              alt={currentImage.prompt}
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 text-center text-stone-300 text-xs font-mono">
              {currentImage.prompt} • Seed: #{currentImage.seed} • {currentImage.width}x{currentImage.height}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
