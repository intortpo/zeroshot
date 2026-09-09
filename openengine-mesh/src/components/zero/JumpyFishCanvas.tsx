import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  ExternalLink,
  Flame,
  RefreshCw,
  Trophy,
  Zap,
} from 'lucide-react';
import { GamePhysicsConfig } from '../../types';

interface JumpyFishCanvasProps {
  gameTitle: string;
  physicsConfig: GamePhysicsConfig;
}

type PlayMode = 'sim' | 'wasm';
type WeaponType = 'bubble_blaster' | 'fish_bazooka' | 'laser_pike';

export interface DudeDef {
  id: string;
  name: string;
  svgPath: string;
  abilityName: string;
  abilityDescription: string;
  abilityCooldown: number;
  passiveDescription: string;
  color: string;
}

export const DUDES_ROSTER: DudeDef[] = [
  {
    id: 'astronaut',
    name: 'Astro Dude',
    svgPath: '/dudes/astronaut.svg',
    abilityName: 'Zero-G Thruster',
    abilityDescription: 'Rocket boost upward & forward with low-gravity glide',
    abilityCooldown: 5.0,
    passiveDescription: '-40% fall gravity glide',
    color: '#00c0f3',
  },
  {
    id: 'alien',
    name: 'Alien Invader',
    svgPath: '/dudes/alien.svg',
    abilityName: 'Plasma Disintegrator',
    abilityDescription: 'Fires an overcharged bouncing plasma orb piercing ledges',
    abilityCooldown: 4.5,
    passiveDescription: '+20% locomotion agility',
    color: '#10b981',
  },
  {
    id: 'wizard',
    name: 'Arcane Wizard',
    svgPath: '/dudes/wizard.svg',
    abilityName: 'Arcane Blink',
    abilityDescription: 'Instant teleport dash with a radial mana shockwave',
    abilityCooldown: 4.0,
    passiveDescription: 'Spells travel +35% faster',
    color: '#a855f7',
  },
  {
    id: 'dragon',
    name: 'Fire Drake',
    svgPath: '/dudes/dragon.svg',
    abilityName: "Dragon's Breath",
    abilityDescription: 'Unleashes a sweeping torrent of scorching flame particles',
    abilityCooldown: 6.0,
    passiveDescription: '-50% recoil knockback taken',
    color: '#ef4444',
  },
  {
    id: 'mega_bot',
    name: 'Mega Bot',
    svgPath: '/dudes/mega_bot.svg',
    abilityName: 'EMP Forcefield',
    abilityDescription: 'Deploys an electromagnetic barrier reflecting incoming bullets',
    abilityCooldown: 7.0,
    passiveDescription: 'Armored plating (+30 max health)',
    color: '#3b82f6',
  },
  {
    id: 'swashbuckler',
    name: 'Swashbuckler',
    svgPath: '/dudes/swashbuckler.svg',
    abilityName: 'Shadow Blade Dash',
    abilityDescription: 'High-speed forward blade slash with invulnerability frames',
    abilityCooldown: 4.0,
    passiveDescription: 'Triple-jump aerial agility',
    color: '#f59e0b',
  },
  {
    id: 'ice_elemental',
    name: 'Ice Elemental',
    svgPath: '/dudes/ice_elemental.svg',
    abilityName: 'Glacial Nova',
    abilityDescription: 'Freezes all nearby opponents in solid ice blocks for 2.5s',
    abilityCooldown: 6.5,
    passiveDescription: 'Slippery frost trails',
    color: '#67e8f9',
  },
  {
    id: 'vampire',
    name: 'Count Vampire',
    svgPath: '/dudes/vampire.svg',
    abilityName: 'Bat Swarm Drain',
    abilityDescription: 'Transforms into fluttering bats stealing 40 HP from enemies',
    abilityCooldown: 5.5,
    passiveDescription: '15% lifesteal on weapon hits',
    color: '#881337',
  },
  {
    id: 'tyrannosaurus_rex',
    name: 'T-Rex Dino',
    svgPath: '/dudes/tyrannosaurus_rex.svg',
    abilityName: 'Primal Roar',
    abilityDescription: 'Massive acoustic shockwave launching enemies off platforms',
    abilityCooldown: 6.0,
    passiveDescription: '+50% explosion force & knockback',
    color: '#15803d',
  },
  {
    id: 'ghost',
    name: 'Spooky Ghost',
    svgPath: '/dudes/ghost.svg',
    abilityName: 'Ethereal Phase',
    abilityDescription: 'Phases out of reality for 3.5s, immune to bullets and walls',
    abilityCooldown: 7.0,
    passiveDescription: 'Smooth levitation',
    color: '#94a3b8',
  },
  {
    id: 'blobfish',
    name: 'Squishy Blobfish',
    svgPath: '/dudes/blobfish.svg',
    abilityName: 'Goo Splashdown',
    abilityDescription: 'Leaps high and body slams the ground with a slowing goo puddle',
    abilityCooldown: 4.5,
    passiveDescription: 'High-restitution jelly bounce',
    color: '#f43f5e',
  },
  {
    id: 'cat',
    name: 'Ninja Cat',
    svgPath: '/dudes/cat.svg',
    abilityName: 'Claw Frenzy',
    abilityDescription: 'Rapid multi-slash critical damage leaps across the platform',
    abilityCooldown: 4.0,
    passiveDescription: 'Fast acrobatic recovery',
    color: '#ea580c',
  },
];

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
  isPlasma?: boolean;
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

interface DudeActor {
  dude: DudeDef;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  isGrounded: boolean;
  isPlayer: boolean;
  health: number;
  maxHealth: number;
  stocks: number;
  weapon: WeaponType;
  fireCooldown: number;
  abilityCooldownRemaining: number;
  abilityActiveDuration: number;
  frozenTimer: number;
  wobblePhase: number;
  jumpCount: number;
  score: number;
}

export const JumpyFishCanvas: React.FC<JumpyFishCanvasProps> = ({
  gameTitle,
  physicsConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [playMode, setPlayMode] = useState<PlayMode>('sim');
  const [playerDudeId, setPlayerDudeId] = useState<string>('astronaut');
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [playerStocks, setPlayerStocks] = useState<number>(3);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('bubble_blaster');
  const [abilityCooldownPercent, setAbilityCooldownPercent] = useState<number>(100);
  const [abilityReady, setAbilityReady] = useState<boolean>(true);
  const [matchStatus, setMatchStatus] = useState<'battling' | 'victory' | 'defeated'>('battling');

  const selectedDude = DUDES_ROSTER.find((d) => d.id === playerDudeId) || DUDES_ROSTER[0];

  // Preload Dude SVGs into HTMLImageElement cache
  useEffect(() => {
    DUDES_ROSTER.forEach((d) => {
      if (!imageCacheRef.current.has(d.id)) {
        const img = new Image();
        img.src = d.svgPath;
        imageCacheRef.current.set(d.id, img);
      }
    });
  }, []);

  // Keyboard input states
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    fire: boolean;
    ability: boolean;
    pickup: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    ability: false,
    pickup: false,
  });

  const triggerJumpRef = useRef(false);
  const triggerFireRef = useRef(false);
  const triggerAbilityRef = useRef(false);

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
      if (e.code === 'KeyQ' || e.code === 'ShiftLeft' || e.code === 'KeyX') {
        keysRef.current.ability = true;
        triggerAbilityRef.current = true;
      }
      if (e.code === 'KeyK' || e.code === 'KeyE') keysRef.current.pickup = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.right = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keysRef.current.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.down = false;
      if (e.code === 'KeyJ' || e.code === 'KeyF') keysRef.current.fire = false;
      if (e.code === 'KeyQ' || e.code === 'ShiftLeft' || e.code === 'KeyX') keysRef.current.ability = false;
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

    // Tactical Floating Platforms
    const platforms: Platform[] = [
      { x: 40, y: height - 42, w: width - 80, h: 36 },
      { x: 80, y: height - 140, w: 180, h: 14, isOneWay: true },
      { x: width - 260, y: height - 140, w: 180, h: 14, isOneWay: true },
      { x: width / 2 - 130, y: height - 230, w: 260, h: 16, isOneWay: true },
      { x: width / 2 - 70, y: height - 310, w: 140, h: 12, isOneWay: true },
    ];

    // Weapon Pickups
    const weaponSpawns: WeaponPickupEntity[] = [
      { x: 170, y: height - 165, type: 'bubble_blaster', respawnTimer: 0, available: true },
      { x: width - 170, y: height - 165, type: 'laser_pike', respawnTimer: 0, available: true },
      { x: width / 2, y: height - 255, type: 'fish_bazooka', respawnTimer: 0, available: true },
    ];

    // Pick 2 distinct AI opponents from roster
    const remainingDudes = DUDES_ROSTER.filter((d) => d.id !== playerDudeId);
    const botDude1 = remainingDudes[0] || DUDES_ROSTER[1];
    const botDude2 = remainingDudes[1] || DUDES_ROSTER[2];

    const player: DudeActor = {
      dude: selectedDude,
      x: 120,
      y: height - 100,
      vx: 0,
      vy: 0,
      facing: 1,
      isGrounded: false,
      isPlayer: true,
      health: selectedDude.id === 'mega_bot' ? 130 : 100,
      maxHealth: selectedDude.id === 'mega_bot' ? 130 : 100,
      stocks: 3,
      weapon: 'bubble_blaster',
      fireCooldown: 0,
      abilityCooldownRemaining: 0,
      abilityActiveDuration: 0,
      frozenTimer: 0,
      wobblePhase: 0,
      jumpCount: 0,
      score: 0,
    };

    const bots: DudeActor[] = [
      {
        dude: botDude1,
        x: width - 140,
        y: height - 100,
        vx: 0,
        vy: 0,
        facing: -1,
        isGrounded: false,
        isPlayer: false,
        health: botDude1.id === 'mega_bot' ? 130 : 100,
        maxHealth: botDude1.id === 'mega_bot' ? 130 : 100,
        stocks: 3,
        weapon: 'laser_pike',
        fireCooldown: 0.5,
        abilityCooldownRemaining: 2.0,
        abilityActiveDuration: 0,
        frozenTimer: 0,
        wobblePhase: 1,
        jumpCount: 0,
        score: 0,
      },
      {
        dude: botDude2,
        x: width / 2 - 40,
        y: height - 260,
        vx: 0,
        vy: 0,
        facing: 1,
        isGrounded: false,
        isPlayer: false,
        health: botDude2.id === 'mega_bot' ? 130 : 100,
        maxHealth: botDude2.id === 'mega_bot' ? 130 : 100,
        stocks: 3,
        weapon: 'fish_bazooka',
        fireCooldown: 0.8,
        abilityCooldownRemaining: 3.5,
        abilityActiveDuration: 0,
        frozenTimer: 0,
        wobblePhase: 2,
        jumpCount: 0,
        score: 0,
      },
    ];

    const actors: DudeActor[] = [player, ...bots];
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

    const respawnDude = (dudeActor: DudeActor) => {
      dudeActor.stocks -= 1;
      dudeActor.health = dudeActor.maxHealth;
      dudeActor.vx = 0;
      dudeActor.vy = 0;
      dudeActor.x = Math.random() * (width - 240) + 120;
      dudeActor.y = 80;
      dudeActor.frozenTimer = 0;
      dudeActor.abilityActiveDuration = 0;
      spawnParticles(dudeActor.x, dudeActor.y, dudeActor.dude.color, 24, 180);

      if (dudeActor.isPlayer) {
        setPlayerStocks(dudeActor.stocks);
        if (dudeActor.stocks <= 0) {
          setMatchStatus('defeated');
        }
      }
    };

    // Execute character ability
    const executeAbility = (actor: DudeActor) => {
      actor.abilityCooldownRemaining = actor.dude.abilityCooldown;
      actor.abilityActiveDuration = 3.0;

      switch (actor.dude.id) {
        case 'astronaut': {
          // Zero-G Thruster: Rocket boost upward & forward
          actor.vy = -560;
          actor.vx += actor.facing * 380;
          spawnParticles(actor.x, actor.y + 20, '#00c0f3', 28, 220);
          break;
        }
        case 'alien': {
          // Plasma Disintegrator: fires super bouncing plasma orb
          projectiles.push({
            x: actor.x + actor.facing * 28,
            y: actor.y,
            vx: actor.facing * 750,
            vy: (Math.random() - 0.5) * 50,
            radius: 9,
            color: '#10b981',
            damage: 65,
            ownerIsPlayer: actor.isPlayer,
            life: 3.5,
            isPlasma: true,
          });
          spawnParticles(actor.x + actor.facing * 28, actor.y, '#10b981', 18, 160);
          break;
        }
        case 'wizard': {
          // Arcane Blink: Teleport dash in facing direction + shockwave
          const oldX = actor.x;
          actor.x += actor.facing * 180;
          actor.x = Math.max(60, Math.min(width - 60, actor.x));
          spawnParticles(oldX, actor.y, '#a855f7', 20, 180);
          spawnParticles(actor.x, actor.y, '#c084fc', 24, 200);

          // Radial mana blast hitting enemies near arrival
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 70) {
              target.health -= 35;
              target.vx += (target.x > actor.x ? 1 : -1) * 350;
              target.vy -= 160;
              spawnParticles(target.x, target.y, '#a855f7', 16, 140);
            }
          });
          break;
        }
        case 'dragon': {
          // Dragon's Breath: cone of burning flames
          for (let f = 0; f < 18; f++) {
            const spread = (Math.random() - 0.5) * 0.4;
            projectiles.push({
              x: actor.x + actor.facing * 20,
              y: actor.y,
              vx: actor.facing * (450 + Math.random() * 120),
              vy: spread * 300,
              radius: 6,
              color: '#ef4444',
              damage: 18,
              ownerIsPlayer: actor.isPlayer,
              life: 0.8,
              isExplosive: true,
            });
          }
          spawnParticles(actor.x, actor.y, '#f97316', 22, 190);
          break;
        }
        case 'mega_bot': {
          // EMP Forcefield shield active (deflects bullets for 3s)
          spawnParticles(actor.x, actor.y, '#3b82f6', 20, 150);
          break;
        }
        case 'swashbuckler': {
          // Shadow Blade Dash
          actor.vx = actor.facing * 600;
          actor.vy = -120;
          spawnParticles(actor.x, actor.y, '#f59e0b', 24, 200);

          // Slice enemies in path
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 65) {
              target.health -= 45;
              target.vx += actor.facing * 420;
              target.vy -= 180;
              spawnParticles(target.x, target.y, '#f59e0b', 20, 180);
            }
          });
          break;
        }
        case 'ice_elemental': {
          // Glacial Nova: Freezes opponents within radius
          spawnParticles(actor.x, actor.y, '#67e8f9', 32, 240);
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 160) {
              target.frozenTimer = 2.5;
              target.vx = 0;
              target.vy = 0;
              spawnParticles(target.x, target.y, '#38bdf8', 20, 120);
            }
          });
          break;
        }
        case 'vampire': {
          // Bat Swarm Drain: lunge and steal health
          actor.vx = actor.facing * 480;
          actor.vy = -200;
          spawnParticles(actor.x, actor.y, '#881337', 24, 180);
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 60) {
              target.health -= 40;
              actor.health = Math.min(actor.maxHealth, actor.health + 40);
              target.vx += actor.facing * 320;
              spawnParticles(actor.x, actor.y, '#10b981', 16, 120);
            }
          });
          break;
        }
        case 'tyrannosaurus_rex': {
          // Primal Roar: Massive radial shockwave
          spawnParticles(actor.x, actor.y, '#15803d', 36, 280);
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            const dist = Math.hypot(target.x - actor.x, target.y - actor.y);
            if (dist < 220) {
              const nx = (target.x - actor.x) / (dist || 1);
              target.vx += nx * 650;
              target.vy -= 260;
              target.health -= 25;
              spawnParticles(target.x, target.y, '#22c55e', 18, 160);
            }
          });
          break;
        }
        case 'ghost': {
          // Ethereal phase
          spawnParticles(actor.x, actor.y, '#94a3b8', 20, 120);
          break;
        }
        case 'blobfish': {
          // Goo Splashdown: leap & slam
          actor.vy = -540;
          spawnParticles(actor.x, actor.y, '#f43f5e', 24, 160);
          break;
        }
        case 'cat': {
          // Claw frenzy
          actor.vx = actor.facing * 520;
          actor.vy = -220;
          spawnParticles(actor.x, actor.y, '#ea580c', 24, 200);
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 60) {
              target.health -= 50;
              target.vx += actor.facing * 380;
              target.vy -= 160;
              spawnParticles(target.x, target.y, '#f97316', 20, 160);
            }
          });
          break;
        }
      }
    };

    // Main game frame tick
    const frame = (time: number) => {
      animId = requestAnimationFrame(frame);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const baseGravity = (physicsConfig.gravity / 9.81) * 980;

      // 1. Weapon Pickups
      weaponSpawns.forEach((w) => {
        if (!w.available) {
          w.respawnTimer -= dt;
          if (w.respawnTimer <= 0) {
            w.available = true;
            spawnParticles(w.x, w.y, WEAPONS[w.type].color, 12, 100);
          }
        }
      });

      // 2. Dude Actors Simulation
      actors.forEach((dudeActor) => {
        if (dudeActor.stocks <= 0) return;

        dudeActor.wobblePhase += dt * 10;
        dudeActor.fireCooldown = Math.max(0, dudeActor.fireCooldown - dt);
        dudeActor.abilityCooldownRemaining = Math.max(0, dudeActor.abilityCooldownRemaining - dt);
        dudeActor.abilityActiveDuration = Math.max(0, dudeActor.abilityActiveDuration - dt);

        // If frozen by Ice Elemental
        if (dudeActor.frozenTimer > 0) {
          dudeActor.frozenTimer -= dt;
          dudeActor.vx *= 0.8;
          return;
        }

        // Apply Passive Gravity Modifier (e.g. Astronaut Zero-G glide)
        let dudeGravity = baseGravity;
        if (dudeActor.dude.id === 'astronaut' && dudeActor.vy > 0) {
          dudeGravity *= 0.6; // 40% reduced falling gravity
        }

        if (dudeActor.isPlayer) {
          // Update HUD ability states
          const cdRatio = Math.max(0, 1 - dudeActor.abilityCooldownRemaining / dudeActor.dude.abilityCooldown);
          setAbilityCooldownPercent(Math.round(cdRatio * 100));
          setAbilityReady(dudeActor.abilityCooldownRemaining <= 0);

          // Player Locomotion
          let moveSpeed = 260;
          if (dudeActor.dude.id === 'alien') moveSpeed *= 1.2;

          if (keysRef.current.left) {
            dudeActor.vx = -moveSpeed;
            dudeActor.facing = -1;
          } else if (keysRef.current.right) {
            dudeActor.vx = moveSpeed;
            dudeActor.facing = 1;
          } else {
            dudeActor.vx *= 0.82;
          }

          // Jumping (Swashbuckler has triple jump, others double jump)
          const maxJumps = dudeActor.dude.id === 'swashbuckler' ? 3 : 2;
          if (triggerJumpRef.current) {
            if (dudeActor.isGrounded || dudeActor.jumpCount < maxJumps) {
              dudeActor.vy = -490;
              dudeActor.isGrounded = false;
              dudeActor.jumpCount += 1;
              spawnParticles(dudeActor.x, dudeActor.y + 16, dudeActor.dude.color, 8, 80);
            }
            triggerJumpRef.current = false;
          }

          // Trigger Special Ability
          if ((keysRef.current.ability || triggerAbilityRef.current) && dudeActor.abilityCooldownRemaining <= 0) {
            executeAbility(dudeActor);
            triggerAbilityRef.current = false;
          }

          // Weapon Pickup check
          if (keysRef.current.pickup) {
            weaponSpawns.forEach((w) => {
              if (w.available && Math.hypot(dudeActor.x - w.x, dudeActor.y - w.y) < 32) {
                dudeActor.weapon = w.type;
                w.available = false;
                w.respawnTimer = 6.0;
                setCurrentWeapon(w.type);
                spawnParticles(dudeActor.x, dudeActor.y, WEAPONS[w.type].color, 16, 140);
              }
            });
          }

          // Fire Weapon (Linear Recoil Kick)
          if ((keysRef.current.fire || triggerFireRef.current) && dudeActor.fireCooldown <= 0) {
            const wDef = WEAPONS[dudeActor.weapon];
            dudeActor.fireCooldown = wDef.fireRate;
            triggerFireRef.current = false;

            const spawnX = dudeActor.x + dudeActor.facing * 24;
            const spawnY = dudeActor.y - 2;
            projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: dudeActor.facing * (dudeActor.dude.id === 'wizard' ? wDef.speed * 1.35 : wDef.speed),
              vy: (Math.random() - 0.5) * 40,
              radius: dudeActor.weapon === 'fish_bazooka' ? 6 : 4,
              color: wDef.color,
              damage: wDef.damage,
              ownerIsPlayer: true,
              life: 2.2,
              isExplosive: dudeActor.weapon === 'fish_bazooka',
            });

            // RECOIL LINEAR IMPULSE
            let recoilForce = wDef.recoil;
            if (dudeActor.dude.id === 'dragon') recoilForce *= 0.5; // Dragon passive recoil dampener
            dudeActor.vx -= dudeActor.facing * recoilForce;
            if (!dudeActor.isGrounded) {
              dudeActor.vy -= 80;
            }
            spawnParticles(spawnX, spawnY, wDef.color, 10, 160);
          }
        } else {
          // AI Bot Logic
          const target = player;
          const distToTarget = Math.hypot(target.x - dudeActor.x, target.y - dudeActor.y);
          dudeActor.facing = target.x > dudeActor.x ? 1 : -1;

          if (distToTarget > 200) {
            dudeActor.vx = dudeActor.facing * 180;
          } else if (distToTarget < 90) {
            dudeActor.vx = -dudeActor.facing * 140;
          } else {
            dudeActor.vx *= 0.85;
          }

          if (dudeActor.isGrounded && (Math.random() < 0.02 || (target.y < dudeActor.y - 40 && Math.random() < 0.06))) {
            dudeActor.vy = -470;
            dudeActor.isGrounded = false;
          }

          // Bot Weapon Fire
          if (distToTarget < 340 && Math.abs(target.y - dudeActor.y) < 70 && dudeActor.fireCooldown <= 0) {
            const wDef = WEAPONS[dudeActor.weapon];
            dudeActor.fireCooldown = wDef.fireRate * (1.2 + Math.random() * 0.4);

            const spawnX = dudeActor.x + dudeActor.facing * 24;
            const spawnY = dudeActor.y - 2;
            projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: dudeActor.facing * wDef.speed,
              vy: (Math.random() - 0.5) * 30,
              radius: dudeActor.weapon === 'fish_bazooka' ? 6 : 4,
              color: wDef.color,
              damage: wDef.damage,
              ownerIsPlayer: false,
              life: 2.2,
              isExplosive: dudeActor.weapon === 'fish_bazooka',
            });

            dudeActor.vx -= dudeActor.facing * wDef.recoil;
          }

          // Bot Special Ability Activation
          if (distToTarget < 260 && dudeActor.abilityCooldownRemaining <= 0 && Math.random() < 0.05) {
            executeAbility(dudeActor);
          }
        }

        // Apply Dynamics
        dudeActor.vy += dudeGravity * dt;
        dudeActor.x += dudeActor.vx * dt;
        dudeActor.y += dudeActor.vy * dt;

        // Platform Collisions (Unless in Ghost Ethereal Phase)
        const isEthereal = dudeActor.dude.id === 'ghost' && dudeActor.abilityActiveDuration > 0;
        dudeActor.isGrounded = false;
        const halfW = 18;
        const halfH = 20;

        if (!isEthereal) {
          platforms.forEach((p) => {
            if (
              dudeActor.x + halfW > p.x &&
              dudeActor.x - halfW < p.x + p.w &&
              dudeActor.y + halfH >= p.y &&
              dudeActor.y + halfH <= p.y + 16 &&
              dudeActor.vy >= 0
            ) {
              dudeActor.y = p.y - halfH;
              dudeActor.vy = 0;
              dudeActor.isGrounded = true;
              dudeActor.jumpCount = 0;
            }
          });
        }

        if (dudeActor.x < 48) {
          dudeActor.x = 48;
          dudeActor.vx = 0;
        } else if (dudeActor.x > width - 48) {
          dudeActor.x = width - 48;
          dudeActor.vx = 0;
        }

        if (dudeActor.y > height + 60) {
          respawnDude(dudeActor);
        }
      });

      // 3. Process Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const pr = projectiles[i];
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        pr.life -= dt;

        // Particle trail
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
        if (!pr.isPlasma) {
          for (const p of platforms) {
            if (pr.x >= p.x && pr.x <= p.x + p.w && pr.y >= p.y && pr.y <= p.y + p.h) {
              hitPlatform = true;
              break;
            }
          }
        }

        let hitDude = false;
        actors.forEach((actor) => {
          if (actor.stocks <= 0) return;
          if (pr.ownerIsPlayer === actor.isPlayer) return;

          // Ghost ethereal immunity
          if (actor.dude.id === 'ghost' && actor.abilityActiveDuration > 0) return;

          // Mega Bot Forcefield reflection
          if (actor.dude.id === 'mega_bot' && actor.abilityActiveDuration > 0) {
            if (Math.hypot(pr.x - actor.x, pr.y - actor.y) < 45) {
              pr.vx = -pr.vx * 1.2;
              pr.ownerIsPlayer = !pr.ownerIsPlayer;
              spawnParticles(pr.x, pr.y, '#3b82f6', 14, 180);
              return;
            }
          }

          if (Math.hypot(pr.x - actor.x, pr.y - actor.y) < 26) {
            hitDude = true;
            actor.health -= pr.damage;
            actor.vx += (pr.vx > 0 ? 1 : -1) * 280;
            actor.vy -= 120;
            spawnParticles(actor.x, actor.y, actor.dude.color, 14, 160);

            // Vampire lifesteal passive
            if (pr.ownerIsPlayer && selectedDude.id === 'vampire') {
              player.health = Math.min(player.maxHealth, player.health + pr.damage * 0.15);
            }

            if (actor.health <= 0) {
              if (pr.ownerIsPlayer) {
                setPlayerScore((s) => {
                  const ns = s + 1;
                  if (ns >= 5) setMatchStatus('victory');
                  return ns;
                });
              }
              respawnDude(actor);
            }
          }
        });

        if (hitPlatform || hitDude || pr.life <= 0) {
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

      // 5. Render Canvas Viewport
      ctx.clearRect(0, 0, width, height);

      // Arena Background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid
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

      // Render Dude Actors (Using actual SVGs from /dudes/)
      actors.forEach((actor) => {
        if (actor.stocks <= 0) return;

        ctx.save();
        ctx.translate(actor.x, actor.y);
        ctx.scale(actor.facing, 1);

        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(0, 22, 16, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();

        // Active Ability Auras
        if (actor.abilityActiveDuration > 0) {
          if (actor.dude.id === 'mega_bot') {
            // EMP Dome
            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 2);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
            ctx.fill();
            ctx.stroke();
          } else if (actor.dude.id === 'astronaut') {
            // Jetpack exhaust particles
            ctx.fillStyle = '#00c0f3';
            ctx.beginPath();
            ctx.arc(-14, 18, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw Dude SVG Image from Cache
        const dudeImg = imageCacheRef.current.get(actor.dude.id);
        const dudeSize = 44;

        if (actor.dude.id === 'ghost' && actor.abilityActiveDuration > 0) {
          ctx.globalAlpha = 0.45; // Ethereal phase transparency
        }

        if (dudeImg && dudeImg.complete && dudeImg.naturalWidth > 0) {
          ctx.drawImage(dudeImg, -dudeSize / 2, -dudeSize / 2 - 2, dudeSize, dudeSize);
        } else {
          // Fallback cartoon body with dude's color
          ctx.beginPath();
          ctx.roundRect(-16, -18, 32, 36, 12);
          ctx.fillStyle = actor.dude.color;
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // Held Weapon Sprite
        const wDef = WEAPONS[actor.weapon];
        ctx.fillStyle = wDef.color;
        ctx.fillRect(8, 2, 14, 5);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(8, 2, 14, 5);

        // Frozen ice overlay if frozen by Ice Elemental
        if (actor.frozenTimer > 0) {
          ctx.fillStyle = 'rgba(103, 232, 249, 0.45)';
          ctx.fillRect(-22, -26, 44, 52);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(-22, -26, 44, 52);
        }

        ctx.restore();

        // Health Bar above Dude
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(actor.x - 18, actor.y - 30, 36, 4);
        ctx.fillStyle = actor.isPlayer ? '#0ABAB5' : '#ef4444';
        ctx.fillRect(actor.x - 18, actor.y - 30, (actor.health / actor.maxHealth) * 36, 4);

        // Character Name Tag
        ctx.fillStyle = actor.isPlayer ? '#0ABAB5' : '#64748b';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(actor.isPlayer ? `YOU (${actor.dude.name})` : actor.dude.name, actor.x, actor.y - 34);
      });
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playMode, playerDudeId, physicsConfig, selectedDude]);

  const handleManualJump = () => {
    triggerJumpRef.current = true;
  };

  const handleManualFire = () => {
    triggerFireRef.current = true;
  };

  const handleManualAbility = () => {
    triggerAbilityRef.current = true;
  };

  const handleResetMatch = () => {
    setPlayerScore(0);
    setPlayerStocks(3);
    setMatchStatus('battling');
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* Jumpy Dudes Header Bar */}
      <div className="p-3.5 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5] animate-pulse" />
          <div className="text-xs font-semibold text-stone-900 flex items-center space-x-1.5">
            <span>{gameTitle}</span>
            <span className="text-stone-300 font-light">·</span>
            <span className="text-[11px] font-normal text-stone-500">
              Dudes Tactical Brawler with Unique Character Abilities
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Reset */}
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
              Avian2D Dudes Sim
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
              <span>Official WASM</span>
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

      {/* Character / Dude Selection Strip */}
      <div className="px-3.5 py-2 bg-stone-50/90 border-b border-stone-200/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-semibold text-stone-700 whitespace-nowrap mr-1">
            Choose Your Dude:
          </span>
          {DUDES_ROSTER.map((dude) => {
            const isSelected = dude.id === playerDudeId;
            return (
              <button
                key={dude.id}
                type="button"
                onClick={() => setPlayerDudeId(dude.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl whitespace-nowrap transition-all border text-[11px] ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200/80'
                }`}
              >
                <img
                  src={dude.svgPath}
                  alt={dude.name}
                  className="w-4 h-4 object-contain"
                />
                <span className="font-medium">{dude.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Dude Ability Preview Badge */}
        <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-stone-200/80 whitespace-nowrap">
          <Zap className="w-3.5 h-3.5 text-[#FF5F1F]" />
          <span className="text-[11px] font-semibold text-stone-900">
            {selectedDude.abilityName}:
          </span>
          <span className="text-[11px] text-stone-500 font-normal">
            {selectedDude.abilityDescription}
          </span>
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

            {/* In-Game HUD: Score, Stocks, Weapon & Ability */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
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

              {/* Character Ability Readiness Bar */}
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs shadow-sm flex items-center space-x-2">
                <Zap className={`w-3.5 h-3.5 ${abilityReady ? 'text-[#FF5F1F] animate-pulse' : 'text-stone-400'}`} />
                <span className="font-medium text-stone-800">{selectedDude.abilityName} (Q):</span>
                <div className="w-16 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 rounded-full ${
                      abilityReady ? 'bg-[#FF5F1F]' : 'bg-[#0ABAB5]'
                    }`}
                    style={{ width: `${abilityCooldownPercent}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${abilityReady ? 'text-emerald-600' : 'text-stone-500'}`}>
                  {abilityReady ? 'READY' : `${Math.ceil((100 - abilityCooldownPercent) * selectedDude.abilityCooldown / 100)}s`}
                </span>
              </div>

              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs shadow-sm flex items-center space-x-1.5">
                <span className="text-stone-500">Weapon:</span>
                <span className="font-medium text-stone-900">{WEAPONS[currentWeapon].name}</span>
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
                        Victory! Top Dude!
                      </h3>
                      <p className="text-xs text-stone-600 mb-4">
                        You dominated the tactical arena with 5 knockouts using {selectedDude.name}'s {selectedDude.abilityName}.
                      </p>
                    </>
                  ) : (
                    <>
                      <Flame className="w-12 h-12 text-[#FF5F1F] mx-auto mb-2" />
                      <h3 className="text-base font-semibold text-stone-900 mb-1">
                        Defeated! Out of Stocks
                      </h3>
                      <p className="text-xs text-stone-600 mb-4">
                        All 3 stock lives depleted. Rematch and try another Dude ability!
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
                onClick={handleManualAbility}
                className={`subtle-depth-interactive px-3.5 py-2 rounded-xl text-xs font-medium shadow-sm flex items-center space-x-1.5 ${
                  abilityReady
                    ? 'bg-[#FF5F1F] hover:bg-[#e05318] text-white border border-[#FF5F1F]'
                    : 'bg-white/80 text-stone-400 border border-stone-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>Ability (Q / Shift)</span>
              </button>

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
                <span>Fire (J / F)</span>
              </button>
            </div>

            {/* Controls Specs Overlay */}
            <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 shadow-sm flex items-center space-x-2.5">
              <span>A/D Move</span>
              <span>·</span>
              <span>Space Jump</span>
              <span>·</span>
              <span>Q Ability</span>
              <span>·</span>
              <span>J Fire (Recoil Kick)</span>
              <span>·</span>
              <span>K Pickup</span>
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
