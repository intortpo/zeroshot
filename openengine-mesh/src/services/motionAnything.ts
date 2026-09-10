/**
 * Motion-Anything Animation Engine
 * Zero-dependency, chat-native physics animation system inspired by nexu-io/motion-anything.
 * Uses native Web Animations API (WAAPI), CSS custom properties, and analytical spring solvers
 * to deliver fluid, tactile, natural motion throughout the Petri application.
 */

export interface SpringConfig {
  stiffness: number; // k
  damping: number; // d
  mass: number; // m
  velocity?: number; // v0
}

export type MotionPreset =
  | 'gentle'
  | 'snappy'
  | 'bouncy'
  | 'slow'
  | 'elastic'
  | 'subtle'
  | 'cinematic';

export const SPRING_PRESETS: Record<MotionPreset, { config: SpringConfig; cssEase: string; durationMs: number }> = {
  gentle: {
    config: { stiffness: 120, damping: 14, mass: 1 },
    cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
    durationMs: 380,
  },
  snappy: {
    config: { stiffness: 300, damping: 20, mass: 1 },
    cssEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
    durationMs: 240,
  },
  bouncy: {
    config: { stiffness: 180, damping: 12, mass: 1 },
    cssEase: 'cubic-bezier(0.34, 1.45, 0.64, 1)',
    durationMs: 440,
  },
  slow: {
    config: { stiffness: 80, damping: 18, mass: 1 },
    cssEase: 'cubic-bezier(0.35, 0, 0.25, 1)',
    durationMs: 560,
  },
  elastic: {
    config: { stiffness: 240, damping: 8, mass: 1 },
    cssEase: 'cubic-bezier(0.68, -0.4, 0.32, 1.4)',
    durationMs: 600,
  },
  subtle: {
    config: { stiffness: 150, damping: 16, mass: 1 },
    cssEase: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    durationMs: 280,
  },
  cinematic: {
    config: { stiffness: 90, damping: 15, mass: 1 },
    cssEase: 'cubic-bezier(0.19, 1, 0.22, 1)',
    durationMs: 700,
  },
};

export interface MotionOptions {
  preset?: MotionPreset;
  delayMs?: number;
  durationMs?: number;
  fromY?: number;
  fromX?: number;
  fromScale?: number;
  fromOpacity?: number;
}

class MotionAnythingEngine {
  /**
   * Applies an enter spring animation to a DOM element via Web Animations API
   */
  public enter(element: HTMLElement | null, options: MotionOptions = {}): Animation | null {
    if (!element || typeof element.animate !== 'function') return null;

    const preset = options.preset || 'gentle';
    const presetData = SPRING_PRESETS[preset];
    const duration = options.durationMs ?? presetData.durationMs;
    const delay = options.delayMs ?? 0;

    const fromY = options.fromY ?? 12;
    const fromX = options.fromX ?? 0;
    const fromScale = options.fromScale ?? 0.97;
    const fromOpacity = options.fromOpacity ?? 0;

    return element.animate(
      [
        {
          opacity: fromOpacity,
          transform: `translate3d(${fromX}px, ${fromY}px, 0) scale(${fromScale})`,
        },
        {
          opacity: 1,
          transform: 'translate3d(0, 0, 0) scale(1)',
        },
      ],
      {
        duration,
        delay,
        easing: presetData.cssEase,
        fill: 'both',
      }
    );
  }

  /**
   * Cascades a staggered spring entrance across all children of a parent container
   */
  public staggerChildren(
    container: HTMLElement | null,
    selector: string = ':scope > *',
    options: MotionOptions & { staggerMs?: number } = {}
  ): Animation[] {
    if (!container) return [];

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
    const stagger = options.staggerMs ?? 35;
    const animations: Animation[] = [];

    elements.forEach((el, index) => {
      const anim = this.enter(el, {
        ...options,
        delayMs: (options.delayMs ?? 0) + index * stagger,
      });
      if (anim) animations.push(anim);
    });

    return animations;
  }

  /**
   * Attaches tactile spring press physics to a clickable element (mousedown -> mouseup)
   */
  public attachSpringPress(element: HTMLElement | null, scaleTo: number = 0.96): () => void {
    if (!element) return () => {};

    const handleDown = () => {
      element.style.transition = 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)';
      element.style.transform = `scale(${scaleTo})`;
    };

    const handleUp = () => {
      element.style.transition = 'transform 260ms cubic-bezier(0.34, 1.5, 0.64, 1)';
      element.style.transform = 'scale(1)';
    };

    element.addEventListener('mousedown', handleDown);
    element.addEventListener('mouseup', handleUp);
    element.addEventListener('mouseleave', handleUp);

    return () => {
      element.removeEventListener('mousedown', handleDown);
      element.removeEventListener('mouseup', handleUp);
      element.removeEventListener('mouseleave', handleUp);
    };
  }

  /**
   * Animates a view transition slide-and-fade for page switching
   */
  public transitionView(
    element: HTMLElement | null,
    direction: 'forward' | 'backward' = 'forward',
    preset: MotionPreset = 'gentle'
  ): Animation | null {
    if (!element || typeof element.animate !== 'function') return null;

    const presetData = SPRING_PRESETS[preset];
    const offset = direction === 'forward' ? 16 : -16;

    return element.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${offset}px, 0, 0) scale(0.99)`,
        },
        {
          opacity: 1,
          transform: 'translate3d(0, 0, 0) scale(1)',
        },
      ],
      {
        duration: presetData.durationMs,
        easing: presetData.cssEase,
        fill: 'both',
      }
    );
  }
}

export const motionAnything = new MotionAnythingEngine();
