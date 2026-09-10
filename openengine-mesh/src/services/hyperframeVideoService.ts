/**
 * Hyperframe Video Generation Domain Service
 * Manages multi-scene storyboards, multi-modal conditioning (T2V, I2V, Loop),
 * 3D Petri Submersion flight paths, color LUT profiles, and async batch render jobs.
 */

export type VideoModelId = 'veo-2' | 'sora-2' | 'wan-2.1' | 'luma-dream';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.39:1';

export type TransitionType = 'cut' | 'cross-dissolve' | 'optical-flow-morph' | 'whip-pan' | 'hyperzoom';

export type CameraFlightType = 'orbital-descent' | 'waterline-breach' | 'hourglass-zoom' | 'archimedean-ascent' | 'static-lock';

export type ColorLUTId = 'tiffany-clean' | 'cyberpunk-neon' | 'kodak-portra' | 'film-noir' | 'porcelain-blue';

export type ExportFormat = 'mp4-h264' | 'prores-422' | 'webm-alpha' | 'animated-gif' | 'png-sequence';

export interface OpticalFXSettings {
  anamorphicFlare: number; // 0 to 100
  filmGrain: number; // 0 to 100
  bloom: number; // 0 to 100
  chromaticAberration: number; // 0 to 100
  vignette: number; // 0 to 100
}

export interface VideoScene {
  id: string;
  order: number;
  title: string;
  prompt: string;
  negativePrompt?: string;
  durationSeconds: number; // e.g. 3.0 to 10.0
  motionScale: number; // 1 to 10
  transitionToNext: TransitionType;
  cameraFlight: CameraFlightType;
  firstFrameImageUrl?: string;
  endFrameImageUrl?: string;
  seamlessLoop: boolean;
  model: VideoModelId;
  previewGradient: string;
}

export interface RenderJob {
  id: string;
  title: string;
  resolution: '4K Cinema' | '1080p 60fps' | '9:16 Reel/Shorts' | '1:1 Square';
  format: ExportFormat;
  aspectRatio: AspectRatio;
  durationTotal: number;
  scenesCount: number;
  progress: number; // 0 to 100
  status: 'queued' | 'compiling' | 'denoising' | 'color-grading' | 'transcoding' | 'completed' | 'failed';
  currentStageText: string;
  createdAt: string;
  downloadUrl?: string;
  thumbnailUrl: string;
}

export interface ColorLUTProfile {
  id: ColorLUTId;
  name: string;
  description: string;
  filterCss: string;
  colorHex: string;
  contrast: number;
  saturation: number;
  temperature: string;
}

export const COLOR_LUT_PROFILES: ColorLUTProfile[] = [
  {
    id: 'tiffany-clean',
    name: 'Tiffany Clean',
    description: 'High-key enterprise teal highlights, radiant clean whites, and soft shadow roll-off.',
    filterCss: 'contrast(1.08) saturate(1.15) hue-rotate(-8deg) brightness(1.04)',
    colorHex: '#0D9488',
    contrast: 1.08,
    saturation: 1.15,
    temperature: '5400K (Pure Studio Day)',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Deep indigo-cyan blacks with electric magenta/cyan highlights and punchy dynamic range.',
    filterCss: 'contrast(1.25) saturate(1.4) hue-rotate(15deg) brightness(0.98)',
    colorHex: '#8B5CF6',
    contrast: 1.25,
    saturation: 1.4,
    temperature: '7200K (Neon Night)',
  },
  {
    id: 'kodak-portra',
    name: 'Kodak Portra 35mm',
    description: 'Warm organic skin tones, rich golden daylight roll-off, and subtle vintage film green shadows.',
    filterCss: 'contrast(1.04) saturate(1.1) sepia(0.18) hue-rotate(-4deg)',
    colorHex: '#D97706',
    contrast: 1.04,
    saturation: 1.1,
    temperature: '3200K (Warm Tungsten)',
  },
  {
    id: 'film-noir',
    name: 'Film Noir Silvers',
    description: 'High-contrast silver gelatin monochrome with deep shadows and chimerical lighting emphasis.',
    filterCss: 'grayscale(1) contrast(1.35) brightness(0.95)',
    colorHex: '#475569',
    contrast: 1.35,
    saturation: 0,
    temperature: 'Monochrome Silver',
  },
  {
    id: 'porcelain-blue',
    name: 'Porcelain Blue',
    description: 'Muted architectural blues, alabaster highlights, and Scandinavian minimalist coolness.',
    filterCss: 'contrast(1.05) saturate(0.85) hue-rotate(190deg) brightness(1.02)',
    colorHex: '#0284C7',
    contrast: 1.05,
    saturation: 0.85,
    temperature: '6500K (Overcast Sky)',
  },
];

export const INITIAL_STORYBOARD_SCENES: VideoScene[] = [
  {
    id: 'scene-101',
    order: 1,
    title: 'Waterline Surface Survey',
    prompt: 'Wide establishing cinematic shot of shimmering petri surface water, luminescent particles undulating in fluid turbulence, gentle volumetric sunbeams penetrating translucent crystal ripples, photorealistic 8K.',
    negativePrompt: 'blurry, pixelated, jitter, low quality, artifacts, watermark',
    durationSeconds: 4.0,
    motionScale: 6,
    transitionToNext: 'optical-flow-morph',
    cameraFlight: 'orbital-descent',
    seamlessLoop: false,
    model: 'veo-2',
    previewGradient: 'from-teal-900 via-emerald-950 to-slate-900',
  },
  {
    id: 'scene-102',
    order: 2,
    title: 'Waterline Breach Dive',
    prompt: 'High-speed kinetic plunge breaching the petri waterline, optical dispersion droplet spray, transitioning into deep sub-aquatic bioluminescent turquoise currents, volumetric god-rays.',
    negativePrompt: 'overexposed, grainy, plastic skin, jitter',
    durationSeconds: 3.5,
    motionScale: 8,
    transitionToNext: 'whip-pan',
    cameraFlight: 'waterline-breach',
    seamlessLoop: false,
    model: 'sora-2',
    previewGradient: 'from-cyan-950 via-blue-950 to-indigo-950',
  },
  {
    id: 'scene-103',
    order: 3,
    title: 'Dual-Cone Hourglass Core',
    prompt: 'Extreme close-up flythrough entering the mathematical pinch of a dual-cone hourglass vortex, cascading golden particle stream flowing downwards, temporal gravitational warping, pristine reflections.',
    negativePrompt: 'flicker, cartoonish, static, flat lighting',
    durationSeconds: 5.0,
    motionScale: 7,
    transitionToNext: 'cross-dissolve',
    cameraFlight: 'hourglass-zoom',
    seamlessLoop: true,
    model: 'wan-2.1',
    previewGradient: 'from-amber-950 via-teal-950 to-emerald-950',
  },
];

export const INITIAL_RENDER_JOBS: RenderJob[] = [
  {
    id: 'job-9801',
    title: 'Petri Submersion: The Depths (Ep. 1)',
    resolution: '4K Cinema',
    format: 'prores-422',
    aspectRatio: '2.39:1',
    durationTotal: 12.5,
    scenesCount: 3,
    progress: 100,
    status: 'completed',
    currentStageText: 'Render completed successfully',
    createdAt: '12 minutes ago',
    downloadUrl: '#',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'job-9802',
    title: 'Hourglass Stream Velocity Reel',
    resolution: '9:16 Reel/Shorts',
    format: 'mp4-h264',
    aspectRatio: '9:16',
    durationTotal: 8.5,
    scenesCount: 2,
    progress: 68,
    status: 'color-grading',
    currentStageText: 'Applying Tiffany Clean LUT & Anamorphic Flares...',
    createdAt: '3 minutes ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
];

class HyperframeVideoService {
  private scenes: VideoScene[] = [...INITIAL_STORYBOARD_SCENES];
  private jobs: RenderJob[] = [...INITIAL_RENDER_JOBS];
  private activeLutId: ColorLUTId = 'tiffany-clean';
  private opticalSettings: OpticalFXSettings = {
    anamorphicFlare: 45,
    filmGrain: 20,
    bloom: 35,
    chromaticAberration: 15,
    vignette: 25,
  };

  getScenes(): VideoScene[] {
    return [...this.scenes];
  }

  addScene(scene: Omit<VideoScene, 'id' | 'order'>): VideoScene {
    const newId = `scene-${Date.now()}`;
    const newScene: VideoScene = {
      ...scene,
      id: newId,
      order: this.scenes.length + 1,
    };
    this.scenes.push(newScene);
    return newScene;
  }

  updateScene(id: string, updates: Partial<VideoScene>): VideoScene | undefined {
    const idx = this.scenes.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.scenes[idx] = { ...this.scenes[idx], ...updates };
    return this.scenes[idx];
  }

  deleteScene(id: string): boolean {
    const idx = this.scenes.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.scenes.splice(idx, 1);
    // Re-index order
    this.scenes.forEach((s, i) => {
      s.order = i + 1;
    });
    return true;
  }

  reorderScenes(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.scenes.length || toIndex < 0 || toIndex >= this.scenes.length) return;
    const [moved] = this.scenes.splice(fromIndex, 1);
    this.scenes.splice(toIndex, 0, moved);
    this.scenes.forEach((s, i) => {
      s.order = i + 1;
    });
  }

  getRenderJobs(): RenderJob[] {
    return [...this.jobs];
  }

  submitRenderJob(title: string, resolution: RenderJob['resolution'], format: ExportFormat, aspectRatio: AspectRatio): RenderJob {
    const totalDuration = this.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
    const newJob: RenderJob = {
      id: `job-${Date.now().toString().slice(-4)}`,
      title: title || `Petri Sequence ${new Date().toLocaleTimeString()}`,
      resolution,
      format,
      aspectRatio,
      durationTotal: totalDuration,
      scenesCount: this.scenes.length,
      progress: 5,
      status: 'compiling',
      currentStageText: 'Compiling latent scene conditions...',
      createdAt: 'Just now',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    };
    this.jobs.unshift(newJob);
    return newJob;
  }

  getActiveLUT(): ColorLUTProfile {
    return COLOR_LUT_PROFILES.find(p => p.id === this.activeLutId) || COLOR_LUT_PROFILES[0];
  }

  setActiveLUT(lutId: ColorLUTId): void {
    this.activeLutId = lutId;
  }

  getOpticalSettings(): OpticalFXSettings {
    return { ...this.opticalSettings };
  }

  updateOpticalSettings(settings: Partial<OpticalFXSettings>): void {
    this.opticalSettings = { ...this.opticalSettings, ...settings };
  }
}

export const hyperframeVideoService = new HyperframeVideoService();
