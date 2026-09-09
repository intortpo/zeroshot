import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  ExternalLink,
  Flame,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { GamePhysicsConfig } from '../../types';

interface JumpyFishCanvasProps {
  gameTitle: string;
  physicsConfig: GamePhysicsConfig;
}

type PlayMode = 'sim' | 'wasm';
type WeaponType = 'bubble_blaster' | 'fish_bazooka' | 'laser_pike';

interface WeaponDef {
  name: string;
  recoil: number;
  fireRate: number;
  speed: number;
  damage: number;
  color: string;
}

const WEAPONS: Record<WeaponType, WeaponDef> = {
  bubble_blaster: {
    name: 'Bubble Blaster',
    recoil: 320,
    fireRate: 0.18,
    speed: 580,
    damage: 25,
    color: '#0ABAB5',
  },
  fish_bazooka: {
    name: 'Fish Bazooka',
    recoil: 680,
    fireRate: 0.75,
    speed: 420,
    damage: 100,
    color: '#FF5F1F',
  },
  laser_pike: {
    name: 'Laser Pike',
    recoil: 180,
    fireRate: 0.28,
    speed: 850,
    damage: 40,
    color: '#a855f7',
  },
};

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  isOneWay?: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  ownerIsPlayer: boolean;
  life: number;
  isExplosive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface WeaponPickupEntity {
  x: number;
  y: number;
  type: WeaponType;
  respawnTimer: number;
  available: boolean;
}

interface FishActor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1; // 1 = right, -1 = left
  isGrounded: boolean;
  isPlayer: boolean;
  color: string;
  hatColor: string;
  health: number;
  stocks: number;
  weapon: WeaponType;
  fireCooldown: number;
  tailPhase: number;
  score: number;
}

export const JumpyFishCanvas: React.FC<JumpyFishCanvasProps> = ({
  gameTitle,
  physicsConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>('sim');
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [playerStocks, setPlayerStocks] = useState<number>(3);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('bubble_blaster');
  const [matchStatus, setMatchStatus] = useState<'battling' | 'victory' | 'defeated'>('battling');

  // Input states
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
    pickup: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    pickup: false,
  });

  const triggerJumpRef = useRef(false);
  const triggerFireRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.right = true;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault();
        keysRef.current.up = true;
        triggerJumpRef.current = true;
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.down = true;
      if (e.code === 'KeyJ' || e.code === 'KeyF') {
        keysRef.current.fire = true;
        triggerFireRef.current = true;
      }
      if (e.code === 'KeyK' || e.code === 'KeyE') keysRef.current.pickup = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.right = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keysRef.current.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.down = false;
      if (e.code === 'KeyJ' || e.code === 'KeyF') keysRef.current.fire = false;
      if (e.code === 'KeyK' || e.code === 'KeyE') keysRef.current.pickup = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 2D Tactical Arena Physics Simulation Loop
  useEffect(() => {
    if (playMode !== 'sim') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const width = canvas.width;
    const height = canvas.height;

    // Arena Platforms
    const platforms: Platform[] = [
      // Ground
      { x: 40, y: height - 42, w: width - 80, h: 36 },
      // Left Floating Ledge
      { x: 80, y: height - 140, w: 180, h: 14, isOneWay: true },
      // Right Floating Ledge
      { x: width - 260, y: height - 140, w: 180, h: 14, isOneWay: true },
      // Center High Platform
      { x: width / 2 - 130, y: height - 230, w: 260, h: 16, isOneWay: true },
      // Top Sniper Perch
      { x: width / 2 - 70, y: height - 310, w: 140, h: 12, isOneWay: true },
    ];

    // Weapon Pickups
    const weaponSpawns: WeaponPickupEntity[] = [
      { x: 170, y: height - 165, type: 'bubble_blaster', respawnTimer: 0, available: true },
      { x: width - 170, y: height - 165, type: 'laser_pike', respawnTimer: 0, available: true },
      { x: width / 2, y: height - 255, type: 'fish_bazooka', respawnTimer: 0, available: true },
    ];

    // Actors: 1 Player + 2 AI Fish
    const player: FishActor = {
      x: 120,
      y: height - 100,
      vx: 0,
      vy: 0,
      facing: 1,
      isGrounded: false,
      isPlayer: true,
      color: '#0ABAB5',
      hatColor: '#FF5F1F',
      health: 100,
      stocks: 3,
      weapon: 'bubble_blaster',
      fireCooldown: 0,
      tailPhase: 0,
      score: 0,
    };

    const bots: FishActor[] = [
      {
        x: width - 140,
        y: height - 100,
        vx: 0,
        vy: 0,
        facing: -1,
        isGrounded: false,
        isPlayer: false,
        color: '#f43f5e',
        hatColor: '#3b82f6',
        health: 100,
        stocks: 3,
        weapon: 'laser_pike',
        fireCooldown: 0.5,
        tailPhase: 1,
        score: 0,
      },
      {
        x: width / 2 - 40,
        y: height - 260,
        vx: 0,
        vy: 0,
        facing: 1,
        isGrounded: false,
        isPlayer: false,
        color: '#eab308',
        hatColor: '#10b981',
        health: 100,
        stocks: 3,
        weapon: 'bubble_blaster',
        fireCooldown: 0.8,
        tailPhase: 2,
        score: 0,
      },
    ];

    const actors: FishActor[] = [player, ...bots];
    let projectiles: Projectile[] = [];
    let particles: Particle[] = [];

    const spawnParticles = (x: number, y: number, color: string, count: number, speed = 120) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (Math.random() * 0.7 + 0.3) * speed;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: Math.random() * 3.5 + 1.5,
          color,
          alpha: 1.0,
          life: 0,
          maxLife: Math.random() * 0.4 + 0.25,
        });
      }
    };

    const respawnFish = (fish: FishActor) => {
      fish.stocks -= 1;
      fish.health = 100;
      fish.vx = 0;
      fish.vy = 0;
      fish.x = Math.random() * (width - 240) + 120;
      fish.y = 80;
      spawnParticles(fish.x, fish.y, fish.color, 24, 180);

      if (fish.isPlayer) {
        setPlayerStocks(fish.stocks);
        if (fish.stocks <= 0) {
          setMatchStatus('defeated');
        }
      }
    };

    // Main physics frame loop
    const frame = (time: number) => {
      animId = requestAnimationFrame(frame);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const gravity = (physicsConfig.gravity / 9.81) * 980;

      // 1. Process Weapon Pickups
      weaponSpawns.forEach((w) => {
        if (!w.available) {
          w.respawnTimer -= dt;
          if (w.respawnTimer <= 0) {
            w.available = true;
            spawnParticles(w.x, w.y, WEAPONS[w.type].color, 12, 100);
          }
        }
      });

      // 2. Process Actors
      actors.forEach((fish) => {
        if (fish.stocks <= 0) return;

        fish.tailPhase += dt * 14;
        fish.fireCooldown = Math.max(0, fish.fireCooldown - dt);

        if (fish.isPlayer) {
          const moveSpeed = 260;
          if (keysRef.current.left) {
            fish.vx = -moveSpeed;
            fish.facing = -1;
          } else if (keysRef.current.right) {
            fish.vx = moveSpeed;
            fish.facing = 1;
          } else {
            fish.vx *= 0.82;
          }

          if (triggerJumpRef.current && fish.isGrounded) {
            fish.vy = -490;
            fish.isGrounded = false;
            triggerJumpRef.current = false;
            spawnParticles(fish.x, fish.y + 16, '#0ABAB5', 8, 80);
          }

          if (keysRef.current.pickup) {
            weaponSpawns.forEach((w) => {
              if (w.available && Math.hypot(fish.x - w.x, fish.y - w.y) < 32) {
                fish.weapon = w.type;
                w.available = false;
                w.respawnTimer = 6.0;
                setCurrentWeapon(w.type);
                spawnParticles(fish.x, fish.y, WEAPONS[w.type].color, 16, 140);
              }
            });
          }

          // Fire Weapon (Linear Recoil Kick)
          if ((keysRef.current.fire || triggerFireRef.current) && fish.fireCooldown <= 0) {
            const wDef = WEAPONS[fish.weapon];
            fish.fireCooldown = wDef.fireRate;
            triggerFireRef.current = false;

            const spawnX = fish.x + fish.facing * 24;
            const spawnY = fish.y - 2;
            projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: fish.facing * wDef.speed,
              vy: (Math.random() - 0.5) * 40,
              radius: fish.weapon === 'fish_bazooka' ? 6 : 4,
              color: wDef.color,
              damage: wDef.damage,
              ownerIsPlayer: true,
              life: 2.2,
              isExplosive: fish.weapon === 'fish_bazooka',
            });

            // RECOIL LINEAR IMPULSE
            fish.vx -= fish.facing * wDef.recoil;
            if (!fish.isGrounded) {
              fish.vy -= 80;
            }
            spawnParticles(spawnX, spawnY, wDef.color, 10, 160);
          }
        } else {
          // AI Bot
          const target = player;
          const distToTarget = Math.hypot(target.x - fish.x, target.y - fish.y);
          fish.facing = target.x > fish.x ? 1 : -1;

          if (distToTarget > 200) {
            fish.vx = fish.facing * 180;
          } else if (distToTarget < 90) {
            fish.vx = -fish.facing * 140;
          } else {
            fish.vx *= 0.85;
          }

          if (fish.isGrounded && (Math.random() < 0.02 || (target.y < fish.y - 40 && Math.random() < 0.06))) {
            fish.vy = -470;
            fish.isGrounded = false;
          }

          if (distToTarget < 340 && Math.abs(target.y - fish.y) < 70 && fish.fireCooldown <= 0) {
            const wDef = WEAPONS[fish.weapon];
            fish.fireCooldown = wDef.fireRate * (1.2 + Math.random() * 0.4);

            const spawnX = fish.x + fish.facing * 24;
            const spawnY = fish.y - 2;
            projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: fish.facing * wDef.speed,
              vy: (Math.random() - 0.5) * 30,
              radius: fish.weapon === 'fish_bazooka' ? 6 : 4,
              color: wDef.color,
              damage: wDef.damage,
              ownerIsPlayer: false,
              life: 2.2,
              isExplosive: fish.weapon === 'fish_bazooka',
            });

            fish.vx -= fish.facing * wDef.recoil;
          }
        }

        fish.vy += gravity * dt;
        fish.x += fish.vx * dt;
        fish.y += fish.vy * dt;

        // Platform collisions
        fish.isGrounded = false;
        const fishHalfW = 16;
        const fishHalfH = 14;

        platforms.forEach((p) => {
          if (
            fish.x + fishHalfW > p.x &&
            fish.x - fishHalfW < p.x + p.w &&
            fish.y + fishHalfH >= p.y &&
            fish.y + fishHalfH <= p.y + 16 &&
            fish.vy >= 0
          ) {
            fish.y = p.y - fishHalfH;
            fish.vy = 0;
            fish.isGrounded = true;
          }
        });

        if (fish.x < 48) {
          fish.x = 48;
          fish.vx = 0;
        } else if (fish.x > width - 48) {
          fish.x = width - 48;
          fish.vx = 0;
        }

        if (fish.y > height + 60) {
          respawnFish(fish);
        }
      });

      // 3. Process Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const pr = projectiles[i];
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        pr.life -= dt;

        if (Math.random() < 0.4) {
          particles.push({
            x: pr.x,
            y: pr.y,
            vx: -pr.vx * 0.1,
            vy: (Math.random() - 0.5) * 20,
            radius: Math.random() * 2 + 1,
            color: pr.color,
            alpha: 0.6,
            life: 0,
            maxLife: 0.3,
          });
        }

        let hitPlatform = false;
        for (const p of platforms) {
          if (pr.x >= p.x && pr.x <= p.x + p.w && pr.y >= p.y && pr.y <= p.y + p.h) {
            hitPlatform = true;
            break;
          }
        }

        let hitFish = false;
        actors.forEach((fish) => {
          if (fish.stocks <= 0) return;
          if (pr.ownerIsPlayer === fish.isPlayer) return;

          if (Math.hypot(pr.x - fish.x, pr.y - fish.y) < 22) {
            hitFish = true;
            fish.health -= pr.damage;
            fish.vx += (pr.vx > 0 ? 1 : -1) * 280;
            fish.vy -= 120;
            spawnParticles(fish.x, fish.y, '#f43f5e', 14, 160);

            if (fish.health <= 0) {
              if (pr.ownerIsPlayer) {
                setPlayerScore((s) => {
                  const ns = s + 1;
                  if (ns >= 5) setMatchStatus('victory');
                  return ns;
                });
              }
              respawnFish(fish);
            }
          }
        });

        if (hitPlatform || hitFish || pr.life <= 0) {
          spawnParticles(pr.x, pr.y, pr.color, pr.isExplosive ? 28 : 10, pr.isExplosive ? 240 : 120);
          projectiles.splice(i, 1);
        }
      }

      // 4. Process Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life += dt;
        pt.alpha = Math.max(0, 1.0 - pt.life / pt.maxLife);
        if (pt.life >= pt.maxLife) {
          particles.splice(i, 1);
        }
      }

      // 5. Render Stage
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Platforms
      platforms.forEach((p) => {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(p.x + 2, p.y + 3, p.w, p.h);

        ctx.fillStyle = p.isOneWay ? '#ffffff' : '#334155';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = p.isOneWay ? '#0ABAB5' : '#FF5F1F';
        ctx.fillRect(p.x, p.y, p.w, 3);
      });

      // Weapon Pickups
      weaponSpawns.forEach((w) => {
        if (!w.available) return;
        const bobY = Math.sin(time * 0.005 + w.x) * 4;
        const wDef = WEAPONS[w.type];

        ctx.save();
        ctx.beginPath();
        ctx.arc(w.x, w.y + bobY, 16, 0, Math.PI * 2);
        ctx.fillStyle = `${wDef.color}22`;
        ctx.fill();
        ctx.strokeStyle = wDef.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = wDef.color;
        ctx.fillRect(w.x - 8, w.y + bobY - 4, 16, 8);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('W', w.x, w.y + bobY + 3);
        ctx.restore();
      });

      // Projectiles
      projectiles.forEach((pr) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // Particles
      particles.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();
        ctx.restore();
      });

      // Fish Actors
      actors.forEach((fish) => {
        if (fish.stocks <= 0) return;

        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.facing, 1);

        // Body Shadow
        ctx.beginPath();
        ctx.ellipse(0, 16, 14, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();

        // Fish Tail
        const tailWiggle = Math.sin(fish.tailPhase) * 6;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-24, -10 + tailWiggle);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-24, 10 + tailWiggle);
        ctx.closePath();
        ctx.fillStyle = fish.color;
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Fish Main Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = fish.color;
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Fish Belly
        ctx.beginPath();
        ctx.ellipse(2, 4, 11, 6, 0, 0, Math.PI);
        ctx.fillStyle = '#ffffff88';
        ctx.fill();

        // Fish Fin
        ctx.beginPath();
        ctx.ellipse(-2, 2, 6, 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = fish.hatColor;
        ctx.fill();

        // Fish Eye
        ctx.beginPath();
        ctx.arc(7, -3, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Pupil
        ctx.beginPath();
        ctx.arc(9, -3, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Fish Hat
        ctx.beginPath();
        ctx.roundRect(-8, -16, 16, 6, 3);
        ctx.fillStyle = fish.hatColor;
        ctx.fill();
        ctx.stroke();

        // Held Weapon
        const wDef = WEAPONS[fish.weapon];
        ctx.fillStyle = wDef.color;
        ctx.fillRect(6, 1, 14, 5);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(6, 1, 14, 5);

        ctx.restore();

        // Health Bar
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(fish.x - 16, fish.y - 24, 32, 4);
        ctx.fillStyle = fish.isPlayer ? '#0ABAB5' : '#ef4444';
        ctx.fillRect(fish.x - 16, fish.y - 24, (fish.health / 100) * 32, 4);

        if (fish.isPlayer) {
          ctx.fillStyle = '#0ABAB5';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('YOU', fish.x, fish.y - 28);
        }
      });
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playMode, physicsConfig]);

  const handleManualJump = () => {
    triggerJumpRef.current = true;
  };

  const handleManualFire = () => {
    triggerFireRef.current = true;
  };

  const handleResetMatch = () => {
    setPlayerScore(0);
    setPlayerStocks(3);
    setMatchStatus('battling');
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* Jumpy Header Bar */}
      <div className="p-3.5 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5] animate-pulse" />
          <div className="text-xs font-semibold text-stone-900 flex items-center space-x-1.5">
            <span>{gameTitle}</span>
            <span className="text-stone-300 font-light">·</span>
            <span className="text-[11px] font-normal text-stone-500">
              Tactical 2D Bevy Brawler (Spicy Lobster)
            </span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-stone-100 p-0.5 rounded-lg border border-stone-200/80 flex items-center space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setPlayMode('sim')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                playMode === 'sim'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Avian2D Sim
            </button>
            <button
              type="button"
              onClick={() => setPlayMode('wasm')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                playMode === 'wasm'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ExternalLink className="w-3 h-3 text-[#FF5F1F]" />
              <span>Official WASM Player</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetMatch}
            className="subtle-depth-interactive p-1.5 rounded-lg text-stone-600 hover:text-stone-900 bg-white border border-stone-200/90"
            title="Reset Match Arena"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div ref={containerRef} className="flex-1 relative bg-stone-100/50 overflow-hidden">
        {playMode === 'sim' ? (
          <>
            <canvas
              ref={canvasRef}
              width={760}
              height={460}
              className="w-full h-full object-contain"
            />

            {/* In-Game HUD: Score & Stocks */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs shadow-sm flex items-center space-x-2">
                <span className="font-semibold text-stone-800">KO Score:</span>
                <span className="text-[#FF5F1F] font-bold">{playerScore} / 5</span>
              </div>

              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs shadow-sm flex items-center space-x-1.5">
                <span className="text-stone-600">Lives:</span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        i < playerStocks ? 'bg-[#0ABAB5]' : 'bg-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs shadow-sm flex items-center space-x-1.5">
                <span className="text-stone-500">Weapon:</span>
                <span className="font-medium text-stone-900">{WEAPONS[currentWeapon].name}</span>
                <span className="text-[10px] text-stone-400">
                  (Recoil: {WEAPONS[currentWeapon].recoil})
                </span>
              </div>
            </div>

            {/* Victory / Defeat Overlay */}
            {matchStatus !== 'battling' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-20">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl border border-stone-200">
                  {matchStatus === 'victory' ? (
                    <>
                      <Trophy className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
                      <h3 className="text-base font-semibold text-stone-900 mb-1">
                        Victory! Top Fish!
                      </h3>
                      <p className="text-xs text-stone-600 mb-4">
                        You dominated the tactical brawler arena with 5 knockouts.
                      </p>
                    </>
                  ) : (
                    <>
                      <Flame className="w-12 h-12 text-[#FF5F1F] mx-auto mb-2" />
                      <h3 className="text-base font-semibold text-stone-900 mb-1">
                        Defeated! Out of Stocks
                      </h3>
                      <p className="text-xs text-stone-600 mb-4">
                        All 3 stock lives depleted. Jump back into the arena!
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleResetMatch}
                    className="w-full py-2 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium transition-all shadow-sm"
                  >
                    Rematch
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Controls */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleManualJump}
                className="subtle-depth-interactive px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-stone-900 text-xs font-medium border border-stone-200/90 shadow-sm flex items-center space-x-1.5"
              >
                <span>Jump (Space)</span>
              </button>

              <button
                type="button"
                onClick={handleManualFire}
                className="subtle-depth-interactive px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium border border-stone-900 shadow-sm flex items-center space-x-1.5"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#0ABAB5]" />
                <span>Fire Weapon (J / F)</span>
              </button>
            </div>

            {/* Controls Specs Overlay */}
            <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 shadow-sm flex items-center space-x-2.5">
              <span>A/D Move</span>
              <span>·</span>
              <span>Space Jump</span>
              <span>·</span>
              <span>J Fire (Linear Recoil Kick)</span>
              <span>·</span>
              <span>K Weapon Pickup</span>
            </div>
          </>
        ) : (
          /* Official WASM Player Mode */
          <div className="w-full h-full flex flex-col relative bg-stone-950">
            <iframe
              src="https://fishfolk.github.io/jumpy/player/latest/"
              title="Fish Folk: Jumpy Official WASM Player"
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; gamepad"
            />
            <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-md text-stone-300 px-3 py-1 rounded-lg text-[11px] flex items-center space-x-2 border border-stone-700/60">
              <span>Upstream: fishfolk/jumpy</span>
              <a
                href="https://fishfolk.github.io/jumpy/player/latest/"
                target="_blank"
                rel="noreferrer"
                className="text-[#0ABAB5] hover:underline flex items-center space-x-0.5"
              >
                <span>Open External</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
