import React, { useRef, useEffect } from 'react';
import { motionAnything, MotionPreset, MotionOptions } from '../../services/motionAnything';

interface MotionContainerProps {
  children: React.ReactNode;
  preset?: MotionPreset;
  delayMs?: number;
  staggerChildren?: boolean;
  staggerSelector?: string;
  staggerMs?: number;
  className?: string;
  viewKey?: string;
}

export const MotionContainer: React.FC<MotionContainerProps> = ({
  children,
  preset = 'gentle',
  delayMs = 0,
  staggerChildren = false,
  staggerSelector = ':scope > *',
  staggerMs = 35,
  className = '',
  viewKey,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (viewKey) {
      motionAnything.transitionView(containerRef.current, 'forward', preset);
    } else {
      const options: MotionOptions = { preset, delayMs };
      motionAnything.enter(containerRef.current, options);
    }

    if (staggerChildren && containerRef.current) {
      motionAnything.staggerChildren(containerRef.current, staggerSelector, {
        preset,
        delayMs,
        staggerMs,
      });
    }
  }, [viewKey, preset, delayMs, staggerChildren, staggerSelector, staggerMs]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
