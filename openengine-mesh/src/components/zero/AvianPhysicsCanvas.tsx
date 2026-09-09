import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Compass,
} from 'lucide-react';
import { GamePhysicsConfig } from '../../types';

interface PhysicsBody {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isStatic?: boolean;
  restitution: number;
  mass: number;
  label?: string;
}

interface AvianPhysicsCanvasProps {
  gameTitle: string;
  physicsConfig: GamePhysicsConfig;
}

export const AvianPhysicsCanvas: React.FC<AvianPhysicsCanvasProps> = ({
  gameTitle,
  physicsConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrag, setCurrentDrag] = useState<{ x: number; y: number } | null>(null);
  const [entityCount, setEntityCount] = useState<number>(6);

  const bodiesRef = useRef<PhysicsBody[]>([]);

  // Initialize initial physics world bodies
  const resetBodies = useCallback(() => {
    bodiesRef.current = [
      // Dynamic Player Orb
      {
        id: 1,
        x: 180,
        y: 120,
        vx: 3.5,
        vy: 1.0,
        radius: 18,
        color: '#0ABAB5',
        restitution: physicsConfig.restitution,
        mass: 2.0,
        label: 'Player Orb',
      },
      // Secondary dynamic spheres
      {
        id: 2,
        x: 280,
        y: 80,
        vx: -2.0,
        vy: 2.0,
        radius: 14,
        color: '#1c1917',
        restitution: physicsConfig.restitution,
        mass: 1.2,
      },
      {
        id: 3,
        x: 350,
        y: 160,
        vx: 1.5,
        vy: -3.0,
        radius: 12,
        color: '#FF5F1F',
        restitution: physicsConfig.restitution * 1.1,
        mass: 1.0,
        label: 'Goal Core',
      },
      // Static Bumper Pegs (Avian Static Colliders)
      {
        id: 101,
        x: 240,
        y: 200,
        vx: 0,
        vy: 0,
        radius: 22,
        color: '#e7e5e4',
        isStatic: true,
        restitution: 0.95,
        mass: 0,
        label: 'Bumper',
      },
      {
        id: 102,
        x: 140,
        y: 260,
        vx: 0,
        vy: 0,
        radius: 18,
        color: '#e7e5e4',
        isStatic: true,
        restitution: 0.9,
        mass: 0,
      },
      {
        id: 103,
        x: 360,
        y: 260,
        vx: 0,
        vy: 0,
        radius: 18,
        color: '#e7e5e4',
        isStatic: true,
        restitution: 0.9,
        mass: 0,
      },
    ];
    setEntityCount(bodiesRef.current.length);
  }, [physicsConfig.restitution]);

  useEffect(() => {
    resetBodies();
  }, [resetBodies]);

  // Main 60 FPS Physics Simulation Loop simulating Avian ECS Integration
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gravityAccel = (physicsConfig.gravity / 9.81) * 0.18;
    const frictionFactor = 1 - (physicsConfig.friction * 0.02);

    const step = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Soft clear with frosted trail
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isRunning) {
        const bodies = bodiesRef.current;

        // 1. Integrate positions & gravity
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];
          if (b.isStatic) continue;

          b.vy += gravityAccel;
          b.vx *= frictionFactor;
          b.vy *= frictionFactor;

          b.x += b.vx;
          b.y += b.vy;

          // Wall boundary collisions (Rigid static perimeter)
          const margin = 12;
          if (b.x - b.radius < margin) {
            b.x = margin + b.radius;
            b.vx = -b.vx * b.restitution;
          } else if (b.x + b.radius > width - margin) {
            b.x = width - margin - b.radius;
            b.vx = -b.vx * b.restitution;
          }

          if (b.y - b.radius < margin) {
            b.y = margin + b.radius;
            b.vy = -b.vy * b.restitution;
          } else if (b.y + b.radius > height - margin) {
            b.y = height - margin - b.radius;
            b.vy = -b.vy * b.restitution;
          }
        }

        // 2. Pairwise Circle-to-Circle Elastic Collisions (Avian Restitution Solve)
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const b1 = bodies[i];
            const b2 = bodies[j];

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist && dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = minDist - dist;

              // Positional separation
              if (!b1.isStatic && !b2.isStatic) {
                b1.x -= nx * overlap * 0.5;
                b1.y -= ny * overlap * 0.5;
                b2.x += nx * overlap * 0.5;
                b2.y += ny * overlap * 0.5;
              } else if (!b1.isStatic) {
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
              } else if (!b2.isStatic) {
                b2.x += nx * overlap;
                b2.y += ny * overlap;
              }

              // Impulse collision response
              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass || 1);

              const effRest = Math.min(b1.restitution, b2.restitution);

              if (!b1.isStatic) {
                b1.vx -= p * b2.mass * nx * (1 + effRest);
                b1.vy -= p * b2.mass * ny * (1 + effRest);
              }
              if (!b2.isStatic) {
                b2.vx += p * b1.mass * nx * (1 + effRest);
                b2.vy += p * b1.mass * ny * (1 + effRest);
              }
            }
          }
        }
      }

      // Draw Bodies
      const bodies = bodiesRef.current;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();

        // Delicate inner border
        ctx.strokeStyle = b.isStatic ? '#d6d3d1' : 'rgba(0,0,0,0.15)';
        ctx.lineWidth = b.isStatic ? 2 : 1;
        ctx.stroke();

        // Label if present
        if (b.label) {
          ctx.fillStyle = b.color === '#1c1917' ? '#ffffff' : '#1c1917';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.label.slice(0, 7), b.x, b.y);
        }
      }

      // Drag impulse vector arrow
      if (dragStart && currentDrag) {
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(currentDrag.x, currentDrag.y);
        ctx.strokeStyle = '#0ABAB5';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target head
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#0ABAB5';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, physicsConfig, dragStart, currentDrag]);

  // Mouse drag impulse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setCurrentDrag({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentDrag({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseUp = () => {
    if (dragStart && currentDrag) {
      const dx = dragStart.x - currentDrag.x;
      const dy = dragStart.y - currentDrag.y;
      const impulseScale = 0.08;

      // Spawn or impulse launch
      const newOrb: PhysicsBody = {
        id: Date.now(),
        x: dragStart.x,
        y: dragStart.y,
        vx: dx * impulseScale,
        vy: dy * impulseScale,
        radius: 14,
        color: '#0ABAB5',
        restitution: physicsConfig.restitution,
        mass: 1.5,
      };

      bodiesRef.current.push(newOrb);
      setEntityCount(bodiesRef.current.length);
    }
    setDragStart(null);
    setCurrentDrag(null);
  };

  const handleAddBumper = () => {
    const newBumper: PhysicsBody = {
      id: Date.now(),
      x: 100 + Math.random() * 280,
      y: 100 + Math.random() * 200,
      vx: 0,
      vy: 0,
      radius: 16 + Math.random() * 8,
      color: '#e7e5e4',
      isStatic: true,
      restitution: 0.92,
      mass: 0,
      label: 'Bumper',
    };
    bodiesRef.current.push(newBumper);
    setEntityCount(bodiesRef.current.length);
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* Simulation Header */}
      <div className="p-3.5 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5] animate-pulse" />
          <div className="text-xs font-semibold text-stone-900">
            Avian Live Physics Simulator
          </div>
          <span className="text-stone-300 font-light">·</span>
          <span className="text-[11px] text-stone-500 font-normal">
            {gameTitle}
          </span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-stone-500 font-normal mr-1">
            Entities: <span className="font-semibold text-stone-800">{entityCount}</span>
          </span>

          <button
            type="button"
            onClick={handleAddBumper}
            className="subtle-depth-interactive flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-stone-700 bg-white/90 border border-stone-200/90 hover:border-stone-400"
            title="Add static Avian collider bumper"
          >
            <Plus className="w-3 h-3 text-stone-500" />
            <span>Bumper</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="subtle-depth-interactive p-1.5 rounded-lg text-stone-700 bg-white/90 border border-stone-200/90 hover:border-stone-400"
            title={isRunning ? 'Pause physics simulation' : 'Play physics simulation'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={resetBodies}
            className="subtle-depth-interactive p-1.5 rounded-lg text-stone-700 bg-white/90 border border-stone-200/90 hover:border-stone-400"
            title="Reset physics bodies"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 relative bg-stone-50/50 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={480}
          height={380}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Physics Overlay Specs */}
        <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 shadow-sm flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Compass className="w-3 h-3 text-[#0ABAB5]" />
            <span>Gravity: {physicsConfig.gravity} m/s²</span>
          </span>
          <span>·</span>
          <span>Restitution: {physicsConfig.restitution}</span>
          <span>·</span>
          <span>Drag to launch impulse</span>
        </div>
      </div>
    </div>
  );
};
