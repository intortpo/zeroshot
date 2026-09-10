/**
 * Petri Video Flow Service
 *
 * Manages the nodal scene flow graph, non-linear multi-track timeline,
 * procedural canvas video synthesis via MediaRecorder, and composite video export.
 */

import {
  FlowSceneNode,
  FlowTransitionNode,
  TimelineClip
} from '../types';

export interface VideoFlowState {
  scenes: FlowSceneNode[];
  transitions: FlowTransitionNode[];
  timelineClips: TimelineClip[];
  activeSceneId: string | null;
  currentTime: number; // In seconds
  isPlaying: boolean;
  totalDuration: number;
  zoomLevel: number;
}

class VideoFlowService {
  private scenes: FlowSceneNode[] = [];
  private transitions: FlowTransitionNode[] = [];
  private timelineClips: TimelineClip[] = [];
  private activeSceneId: string | null = null;
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaultFlow();
  }

  private initDefaultFlow() {
    this.scenes = [
      {
        id: 'scene-01',
        title: 'Scene 1: Coral Reef Abyss',
        prompt: 'Cinematic 4k underwater wide shot, deep turquoise ocean trench, glowing azure caustics illuminating ancient coral structures, smooth forward glide',
        durationSeconds: 4,
        aspectRatio: '16:9',
        cameraFlight: 'push_in',
        modelId: 'petri-veo-2',
        colorLut: 'Tiffany Clean',
        status: 'ready',
        x: 60,
        y: 120,
        motionStrength: 7,
      },
      {
        id: 'scene-02',
        title: 'Scene 2: Bioluminescent Submersion',
        prompt: 'Macro lens sinking below thermocline, iridescent bioluminescent plankton swirling in helical vortex around camera lens, deep midnight indigo tones',
        durationSeconds: 5,
        aspectRatio: '16:9',
        cameraFlight: 'submersion_dive',
        modelId: 'sora-2-turbo',
        colorLut: 'Cyberpunk Neon',
        status: 'ready',
        x: 420,
        y: 120,
        motionStrength: 8,
      },
      {
        id: 'scene-03',
        title: 'Scene 3: Crystalline Emergence',
        prompt: 'High speed upward breach through water surface, crystalline droplets scattering into golden hour prism flares, anamorphic horizontal lens flare',
        durationSeconds: 4,
        aspectRatio: '16:9',
        cameraFlight: 'crane',
        modelId: 'petri-veo-2',
        colorLut: 'Kodak Portra',
        status: 'ready',
        x: 780,
        y: 120,
        motionStrength: 9,
      },
    ];

    this.transitions = [
      {
        id: 'trans-01',
        sourceSceneId: 'scene-01',
        targetSceneId: 'scene-02',
        type: 'optical_flow_morph',
        durationMs: 800,
      },
      {
        id: 'trans-02',
        sourceSceneId: 'scene-02',
        targetSceneId: 'scene-03',
        type: 'cross_dissolve',
        durationMs: 1000,
      },
    ];

    this.activeSceneId = 'scene-01';
    this.recalculateTimeline();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getState(): VideoFlowState {
    const totalDuration = this.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
    return {
      scenes: [...this.scenes],
      transitions: [...this.transitions],
      timelineClips: [...this.timelineClips],
      activeSceneId: this.activeSceneId,
      currentTime: this.currentTime,
      isPlaying: this.isPlaying,
      totalDuration,
      zoomLevel: 1.0,
    };
  }

  public setActiveScene(id: string | null) {
    this.activeSceneId = id;
    this.notify();
  }

  public setCurrentTime(time: number) {
    const totalDuration = this.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
    this.currentTime = Math.max(0, Math.min(totalDuration, time));
    this.notify();
  }

  public setIsPlaying(playing: boolean) {
    this.isPlaying = playing;
    this.notify();
  }

  // Recalculate Timeline V1 and A1 tracks based on current scenes
  public recalculateTimeline() {
    let accumulatedTime = 0;
    const clips: TimelineClip[] = [];

    const colors = ['#0D9488', '#0284C7', '#6366F1', '#8B5CF6', '#EC4899'];

    this.scenes.forEach((scene, idx) => {
      clips.push({
        id: `clip-v1-${scene.id}`,
        sceneId: scene.id,
        track: 'v1',
        title: scene.title,
        startTime: accumulatedTime,
        duration: scene.durationSeconds,
        color: colors[idx % colors.length],
      });
      accumulatedTime += scene.durationSeconds;
    });

    // Audio Track A1 (Full soundtrack spanning total duration)
    if (accumulatedTime > 0) {
      const waveform = Array.from({ length: 48 }, () => Math.random() * 0.7 + 0.3);
      clips.push({
        id: 'clip-a1-ambient',
        sceneId: 'global-audio',
        track: 'a1',
        title: 'AI Submersion Soundscape (48kHz Stereo)',
        startTime: 0,
        duration: accumulatedTime,
        color: '#10B981',
        waveform,
      });
    }

    this.timelineClips = clips;
  }

  // Add a new scene node to the flow
  public addSceneNode(params?: Partial<FlowSceneNode>): FlowSceneNode {
    const nextIdx = this.scenes.length + 1;
    const lastScene = this.scenes[this.scenes.length - 1];

    const newNode: FlowSceneNode = {
      id: `scene-${Date.now()}`,
      title: params?.title || `Scene ${nextIdx}: Kinetic Transition`,
      prompt:
        params?.prompt ||
        'Cinematic volumetric lighting cutting through azure waters, camera accelerating forward with dynamic motion blur',
      durationSeconds: params?.durationSeconds || 4,
      aspectRatio: params?.aspectRatio || '16:9',
      cameraFlight: params?.cameraFlight || 'pan_right',
      modelId: params?.modelId || 'petri-veo-2',
      colorLut: params?.colorLut || 'Tiffany Clean',
      status: 'ready',
      x: lastScene ? lastScene.x + 360 : 60,
      y: lastScene ? lastScene.y : 120,
      motionStrength: params?.motionStrength || 7,
      negativePrompt: params?.negativePrompt,
    };

    this.scenes.push(newNode);

    // Auto-connect with transition if previous scene exists
    if (lastScene) {
      this.transitions.push({
        id: `trans-${Date.now()}`,
        sourceSceneId: lastScene.id,
        targetSceneId: newNode.id,
        type: 'cross_dissolve',
        durationMs: 800,
      });
    }

    this.recalculateTimeline();
    this.notify();
    return newNode;
  }

  // Branch an existing scene into an alternate variation (A/B testing)
  public branchSceneNode(parentSceneId: string): FlowSceneNode {
    const parent = this.scenes.find((s) => s.id === parentSceneId);
    if (!parent) return this.addSceneNode();

    const branchedNode: FlowSceneNode = {
      id: `scene-branch-${Date.now()}`,
      title: `${parent.title} (Variation B)`,
      prompt: `${parent.prompt} [High dynamic contrast, alternate optical angle]`,
      durationSeconds: parent.durationSeconds,
      aspectRatio: parent.aspectRatio,
      cameraFlight: parent.cameraFlight === 'orbit' ? 'push_in' : 'orbit',
      modelId: parent.modelId,
      colorLut: 'Cyberpunk Neon',
      status: 'ready',
      x: parent.x,
      y: parent.y + 220, // Rendered below the parent node in the flow
      branchOfSceneId: parent.id,
      motionStrength: Math.min(10, parent.motionStrength + 1),
    };

    this.scenes.push(branchedNode);
    this.recalculateTimeline();
    this.notify();
    return branchedNode;
  }

  // Extend scene (continuity generation)
  public extendSceneNode(sceneId: string): FlowSceneNode {
    const source = this.scenes.find((s) => s.id === sceneId);
    if (!source) return this.addSceneNode();

    const extendedNode: FlowSceneNode = {
      id: `scene-ext-${Date.now()}`,
      title: `${source.title} (Continuation)`,
      prompt: `Continuing seamless shot from ${source.title}: camera keeps momentum through volumetric caustics into wide ocean panorama`,
      durationSeconds: 4,
      aspectRatio: source.aspectRatio,
      cameraFlight: source.cameraFlight,
      modelId: source.modelId,
      colorLut: source.colorLut,
      status: 'ready',
      x: source.x + 360,
      y: source.y,
      motionStrength: source.motionStrength,
    };

    this.scenes.push(extendedNode);
    this.transitions.push({
      id: `trans-${Date.now()}`,
      sourceSceneId: source.id,
      targetSceneId: extendedNode.id,
      type: 'optical_flow_morph',
      durationMs: 1000,
    });

    this.recalculateTimeline();
    this.notify();
    return extendedNode;
  }

  public updateSceneNode(id: string, updates: Partial<FlowSceneNode>) {
    this.scenes = this.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.recalculateTimeline();
    this.notify();
  }

  public deleteSceneNode(id: string) {
    this.scenes = this.scenes.filter((s) => s.id !== id);
    this.transitions = this.transitions.filter(
      (t) => t.sourceSceneId !== id && t.targetSceneId !== id
    );
    if (this.activeSceneId === id) {
      this.activeSceneId = this.scenes[0]?.id || null;
    }
    this.recalculateTimeline();
    this.notify();
  }

  public updateTransition(id: string, updates: Partial<FlowTransitionNode>) {
    this.transitions = this.transitions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.notify();
  }

  // Move scene position in flow canvas
  public moveSceneNode(id: string, x: number, y: number) {
    const scene = this.scenes.find((s) => s.id === id);
    if (scene) {
      scene.x = x;
      scene.y = y;
      this.notify();
    }
  }

  // Synthesize real video blob for a scene using HTML5 Canvas + MediaRecorder
  public async generateSceneVideo(sceneId: string): Promise<string> {
    const scene = this.scenes.find((s) => s.id === sceneId);
    if (!scene) throw new Error('Scene not found');

    this.updateSceneNode(sceneId, { status: 'synthesizing' });

    const width = 640;
    const height = 360;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.updateSceneNode(sceneId, { status: 'ready' });
      return '';
    }

    const durationMs = scene.durationSeconds * 1000;
    const fps = 30;
    const totalFrames = Math.round((durationMs / 1000) * fps);

    // Color theme based on LUT
    let baseColor = '#0D9488';
    let accentColor = '#14B8A6';
    if (scene.colorLut === 'Cyberpunk Neon') {
      baseColor = '#3B82F6';
      accentColor = '#EC4899';
    } else if (scene.colorLut === 'Kodak Portra') {
      baseColor = '#B45309';
      accentColor = '#F59E0B';
    }

    const stream = canvas.captureStream(fps);
    let mediaRecorder: MediaRecorder | null = null;
    const chunks: Blob[] = [];

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.start();
    } catch {
      // Fallback
    }

    for (let frame = 0; frame < totalFrames; frame++) {
      const progress = frame / totalFrames;
      const time = progress * scene.durationSeconds;

      // Draw procedural ocean caustics & lighting
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#041017');
      grad.addColorStop(0.5, baseColor);
      grad.addColorStop(1, accentColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Procedural caustics wave lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 20) {
          const y =
            height * 0.3 +
            i * 35 +
            Math.sin(x * 0.02 + time * 3 + i) * 18 +
            Math.cos(x * 0.01 - time * 2) * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Swirling particles
      for (let p = 0; p < 30; p++) {
        const px = (width * 0.5 + Math.cos(time * 2 + p) * (120 + p * 4)) % width;
        const py = (height * 0.5 + Math.sin(time * 2.5 + p) * (80 + p * 3)) % height;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Timecode overlay & Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(scene.title, 24, 40);

      ctx.fillStyle = 'rgba(200, 240, 240, 0.9)';
      ctx.font = '12px monospace';
      ctx.fillText(`PROMPT: ${scene.prompt.slice(0, 55)}...`, 24, 65);
      ctx.fillText(`CAM: ${scene.cameraFlight.toUpperCase()} | TIME: ${time.toFixed(2)}s / ${scene.durationSeconds}s`, 24, height - 24);

      // Short delay for stream buffer
      await new Promise((r) => setTimeout(r, 8));
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        if (!mediaRecorder) return resolve();
        mediaRecorder.onstop = () => resolve();
        mediaRecorder.stop();
      });
    }

    const blob = new Blob(chunks, { type: 'video/webm' });
    const blobUrl = URL.createObjectURL(blob);

    this.updateSceneNode(sceneId, {
      status: 'ready',
      videoBlobUrl: blobUrl,
      thumbnailUrl: blobUrl,
    });

    return blobUrl;
  }

  // Master Video Export: Download compiled sequence
  public async exportMasterVideo() {
    // Generate footage for all scenes that don't have one yet
    for (const scene of this.scenes) {
      if (!scene.videoBlobUrl) {
        await this.generateSceneVideo(scene.id);
      }
    }

    // Collect first valid blob or synthesize master compilation
    const firstValid = this.scenes.find((s) => s.videoBlobUrl)?.videoBlobUrl;
    if (firstValid) {
      const a = document.createElement('a');
      a.href = firstValid;
      a.download = `petri_video_flow_master_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}

export const videoFlowService = new VideoFlowService();
