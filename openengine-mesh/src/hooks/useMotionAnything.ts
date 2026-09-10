import { useEffect, useRef } from 'react';
import { motionAnything, MotionOptions, MotionPreset } from '../services/motionAnything';

export function useMotionEnter<T extends HTMLElement = HTMLDivElement>(options: MotionOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      motionAnything.enter(ref.current, options);
    }
  }, []);

  return ref;
}

export function useMotionStagger<T extends HTMLElement = HTMLDivElement>(
  childSelector: string = ':scope > *',
  options: MotionOptions & { staggerMs?: number; triggerDeps?: any[] } = {}
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      motionAnything.staggerChildren(ref.current, childSelector, options);
    }
  }, options.triggerDeps || []);

  return ref;
}

export function useMotionPress<T extends HTMLElement = HTMLButtonElement>(scaleTo: number = 0.96) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      return motionAnything.attachSpringPress(ref.current, scaleTo);
    }
  }, [scaleTo]);

  return ref;
}

export function useMotionViewTransition<T extends HTMLElement = HTMLDivElement>(
  viewKey: string,
  preset: MotionPreset = 'gentle'
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      motionAnything.transitionView(ref.current, 'forward', preset);
    }
  }, [viewKey, preset]);

  return ref;
}
