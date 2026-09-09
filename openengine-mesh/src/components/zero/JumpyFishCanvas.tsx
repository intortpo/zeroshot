import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  ExternalLink,
  Flame,
  RefreshCw,
  Trophy,
  Zap,
  Sparkles,
} from 'lucide-react';
import { GamePhysicsConfig } from '../../types';

interface JumpyFishCanvasProps {
  gameTitle: string;
  physicsConfig: GamePhysicsConfig;
}

type PlayMode = 'sim' | 'wasm';
type WeaponType = 'bubble_blaster' | 'fish_bazooka' | 'laser_pike' | 'plasma_shotgun' | 'chain_lightning';
type ArenaMapId = 'rooftops' | 'void_spires' | 'kinetic_factory';

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
  {
    id: 'captain_blackbeard',
    name: 'Captain Blackbeard',
    svgPath: '/dudes/captain_blackbeard.svg',
    abilityName: 'Broadside Cannon',
    abilityDescription: 'Fires two heavy bouncing explosive cannonballs across the deck',
    abilityCooldown: 6.5,
    passiveDescription: '+20% explosion resistance',
    color: '#b45309',
  },
  {
    id: 'chameleon',
    name: 'Camo Chameleon',
    svgPath: '/dudes/chameleon.svg',
    abilityName: 'Chameleon Cloak',
    abilityDescription: 'Turns transparent for 4.0s; first strike deals 2x critical damage',
    abilityCooldown: 7.0,
    passiveDescription: 'Climbs and sticks to walls',
    color: '#84cc16',
  },
  {
    id: 'yeti',
    name: 'Frost Yeti',
    svgPath: '/dudes/yeti.svg',
    abilityName: 'Avalanche Slam',
    abilityDescription: 'Leaps high and slams floor with a freezing seismic wave',
    abilityCooldown: 6.0,
    passiveDescription: 'Heavy mass resists knockback',
    color: '#38bdf8',
  },
  {
    id: 'angry_bot',
    name: 'Overclock Bot',
    svgPath: '/dudes/angry_bot.svg',
    abilityName: 'Rocket Overdrive',
    abilityDescription: '2x turbo rocket speed leaving burning exhaust trails',
    abilityCooldown: 5.0,
    passiveDescription: '+25% weapon fire rate',
    color: '#dc2626',
  },
  {
    id: 'pufferfish',
    name: 'Toxic Puffer',
    svgPath: '/dudes/pufferfish.svg',
    abilityName: 'Spike Eruption',
    abilityDescription: 'Inflates instantly and shoots 8 poison thorns in all directions',
    abilityCooldown: 5.5,
    passiveDescription: 'Thorns damage nearby attackers',
    color: '#eab308',
  },
  {
    id: 'werewolf',
    name: 'Shadow Werewolf',
    svgPath: '/dudes/werewolf.svg',
    abilityName: 'Lunar Pounce',
    abilityDescription: 'Ferocious lunging leap pinning down opponents with critical claw slashes',
    abilityCooldown: 4.5,
    passiveDescription: '+25% speed when enemies wounded',
    color: '#475569',
  },
  {
    id: 'crocodile',
    name: 'Iron Croc',
    svgPath: '/dudes/crocodile.svg',
    abilityName: 'Death Roll',
    abilityDescription: 'Rapid spinning charge deflecting bullets and bowling over opponents',
    abilityCooldown: 5.5,
    passiveDescription: 'Heavy scutes (+20 max health)',
    color: '#166534',
  },
  {
    id: 'octopus',
    name: 'Kraken Octopus',
    svgPath: '/dudes/octopus.svg',
    abilityName: 'Ink Blaster',
    abilityDescription: 'Sprays dark ink clouds slowing and blinding enemies for 3s',
    abilityCooldown: 5.0,
    passiveDescription: 'Picks up weapon crates from 2x range',
    color: '#7c3aed',
  },
];

interface WeaponDef {
  name: string;
  recoil: number;
  fireRate: number;
  speed: number;
  damage: number;
  color: string;
  count?: number;
  spread?: number;
}

const WEAPONS: Record<WeaponType, WeaponDef> = {
  bubble_blaster: {
    name: 'Bubble Blaster',
    recoil: 280,
    fireRate: 0.16,
    speed: 600,
    damage: 22,
    color: '#0ABAB5',
  },
  fish_bazooka: {
    name: 'Fish Bazooka',
    recoil: 680,
    fireRate: 0.75,
    speed: 430,
    damage: 95,
    color: '#FF5F1F',
  },
  laser_pike: {
    name: 'Laser Pike',
    recoil: 160,
    fireRate: 0.26,
    speed: 880,
    damage: 42,
    color: '#a855f7',
  },
  plasma_shotgun: {
    name: 'Plasma Scattergun',
    recoil: 540,
    fireRate: 0.55,
    speed: 550,
    damage: 18, // 5 pellets = 90 total max
    color: '#ec4899',
    count: 5,
    spread: 0.35,
  },
  chain_lightning: {
    name: 'Tesla Arc Cannon',
    recoil: 240,
    fireRate: 0.38,
    speed: 720,
    damage: 36,
    color: '#eab308',
  },
};

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  isOneWay?: boolean;
  isBouncy?: boolean;
  isMoving?: boolean;
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  moveSpeed?: number;
  initialPos?: number;
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
  isLightning?: boolean;
  isCannonball?: boolean;
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

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
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
  isCloaked?: boolean;
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
  const [arenaMap, setArenaMap] = useState<ArenaMapId>('rooftops');
  const [opponentCount, setOpponentCount] = useState<number>(3); // 1 = 1v1, 3 = 4-Player FFA

  const screenShakeRef = useRef<number>(0);
  const selectedDude = DUDES_ROSTER.find((d) => d.id === playerDudeId) || DUDES_ROSTER[0];

  // Preload all 20 Dude SVGs into HTMLImageElement cache
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

    // Build Arena Platforms based on selected Arena Map
    let platforms: Platform[] = [];
    let weaponSpawns: WeaponPickupEntity[] = [];

    if (arenaMap === 'rooftops') {
      // Classic Multi-Tier Ledges
      platforms = [
        { x: 40, y: height - 42, w: width - 80, h: 36 },
        { x: 80, y: height - 140, w: 180, h: 14, isOneWay: true },
        { x: width - 260, y: height - 140, w: 180, h: 14, isOneWay: true },
        { x: width / 2 - 130, y: height - 230, w: 260, h: 16, isOneWay: true },
        { x: width / 2 - 70, y: height - 315, w: 140, h: 12, isOneWay: true },
      ];
      weaponSpawns = [
        { x: 170, y: height - 165, type: 'bubble_blaster', respawnTimer: 0, available: true },
        { x: width - 170, y: height - 165, type: 'plasma_shotgun', respawnTimer: 0, available: true },
        { x: width / 2, y: height - 255, type: 'fish_bazooka', respawnTimer: 0, available: true },
        { x: width / 2, y: height - 340, type: 'chain_lightning', respawnTimer: 0, available: true },
      ];
    } else if (arenaMap === 'void_spires') {
      // Void Spires with High-Restitution Central Bouncy Trampoline
      platforms = [
        { x: 40, y: height - 120, w: 220, h: 180 },
        { x: width - 260, y: height - 120, w: 220, h: 180 },
        { x: width / 2 - 70, y: height - 90, w: 140, h: 20, isBouncy: true },
        { x: width / 2 - 100, y: height - 240, w: 200, h: 14, isOneWay: true },
        { x: 100, y: height - 280, w: 120, h: 14, isOneWay: true },
        { x: width - 220, y: height - 280, w: 120, h: 14, isOneWay: true },
      ];
      weaponSpawns = [
        { x: 150, y: height - 145, type: 'laser_pike', respawnTimer: 0, available: true },
        { x: width - 150, y: height - 145, type: 'plasma_shotgun', respawnTimer: 0, available: true },
        { x: width / 2, y: height - 265, type: 'fish_bazooka', respawnTimer: 0, available: true },
      ];
    } else {
      // Kinetic Factory with Moving Platforms
      platforms = [
        { x: 40, y: height - 42, w: width - 80, h: 36 },
        {
          x: width / 2 - 80,
          y: height - 150,
          w: 160,
          h: 14,
          isOneWay: true,
          isMoving: true,
          moveAxis: 'x',
          moveRange: 140,
          moveSpeed: 1.6,
          initialPos: width / 2 - 80,
        },
        {
          x: 100,
          y: height - 200,
          w: 140,
          h: 14,
          isOneWay: true,
          isMoving: true,
          moveAxis: 'y',
          moveRange: 80,
          moveSpeed: 1.8,
          initialPos: height - 200,
        },
        {
          x: width - 240,
          y: height - 200,
          w: 140,
          h: 14,
          isOneWay: true,
          isMoving: true,
          moveAxis: 'y',
          moveRange: 80,
          moveSpeed: -1.8,
          initialPos: height - 200,
        },
        { x: width / 2 - 60, y: height - 310, w: 120, h: 12, isOneWay: true },
      ];
      weaponSpawns = [
        { x: 160, y: height - 70, type: 'chain_lightning', respawnTimer: 0, available: true },
        { x: width - 160, y: height - 70, type: 'bubble_blaster', respawnTimer: 0, available: true },
        { x: width / 2, y: height - 335, type: 'fish_bazooka', respawnTimer: 0, available: true },
      ];
    }

    // Pick AI opponents from roster based on opponentCount
    const remainingDudes = DUDES_ROSTER.filter((d) => d.id !== playerDudeId);
    // Shuffle slightly for variety
    const shuffledDudes = [...remainingDudes].sort(() => 0.5 - Math.random());
    const botDudes = shuffledDudes.slice(0, opponentCount);

    const playerMaxHp = selectedDude.id === 'mega_bot' ? 130 : selectedDude.id === 'crocodile' ? 120 : 100;
    const player: DudeActor = {
      dude: selectedDude,
      x: 120,
      y: height - 100,
      vx: 0,
      vy: 0,
      facing: 1,
      isGrounded: false,
      isPlayer: true,
      health: playerMaxHp,
      maxHealth: playerMaxHp,
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

    const bots: DudeActor[] = botDudes.map((bd, idx) => {
      const maxHp = bd.id === 'mega_bot' ? 130 : bd.id === 'crocodile' ? 120 : 100;
      const initialWeapons: WeaponType[] = ['plasma_shotgun', 'laser_pike', 'chain_lightning', 'fish_bazooka'];
      return {
        dude: bd,
        x: width - 140 - idx * 80,
        y: height - 100 - idx * 40,
        vx: 0,
        vy: 0,
        facing: -1,
        isGrounded: false,
        isPlayer: false,
        health: maxHp,
        maxHealth: maxHp,
        stocks: 3,
        weapon: initialWeapons[idx % initialWeapons.length],
        fireCooldown: 0.5 + idx * 0.2,
        abilityCooldownRemaining: 2.0 + idx * 1.5,
        abilityActiveDuration: 0,
        frozenTimer: 0,
        wobblePhase: idx,
        jumpCount: 0,
        score: 0,
      };
    });

    const actors: DudeActor[] = [player, ...bots];
    const projectiles: Projectile[] = [];
    const particles: Particle[] = [];
    const floatingTexts: FloatingText[] = [];

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

    const addFloatingText = (x: number, y: number, text: string, color = '#ffffff') => {
      floatingTexts.push({
        x: x + (Math.random() - 0.5) * 16,
        y,
        text,
        color,
        life: 0,
        maxLife: 0.85,
        vy: -45,
      });
    };

    const triggerScreenShake = (intensity = 8) => {
      screenShakeRef.current = Math.max(screenShakeRef.current, intensity);
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
      dudeActor.isCloaked = false;
      spawnParticles(dudeActor.x, dudeActor.y, dudeActor.dude.color, 24, 180);
      addFloatingText(dudeActor.x, dudeActor.y, 'RESPAWNED', dudeActor.dude.color);

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
          actor.vy = -560;
          actor.vx += actor.facing * 380;
          spawnParticles(actor.x, actor.y + 20, '#00c0f3', 28, 220);
          addFloatingText(actor.x, actor.y - 20, 'ZERO-G BOOST!', '#00c0f3');
          break;
        }
        case 'alien': {
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
          addFloatingText(actor.x, actor.y - 20, 'PLASMA ORB!', '#10b981');
          break;
        }
        case 'wizard': {
          const oldX = actor.x;
          actor.x += actor.facing * 190;
          actor.x = Math.max(60, Math.min(width - 60, actor.x));
          spawnParticles(oldX, actor.y, '#a855f7', 20, 180);
          spawnParticles(actor.x, actor.y, '#c084fc', 24, 200);
          addFloatingText(actor.x, actor.y - 20, 'ARCANE BLINK!', '#c084fc');

          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 75) {
              target.health -= 35;
              target.vx += (target.x > actor.x ? 1 : -1) * 360;
              target.vy -= 160;
              spawnParticles(target.x, target.y, '#a855f7', 16, 140);
              addFloatingText(target.x, target.y - 20, '-35 MANA BURST', '#a855f7');
            }
          });
          break;
        }
        case 'dragon': {
          for (let f = 0; f < 18; f++) {
            const spread = (Math.random() - 0.5) * 0.45;
            projectiles.push({
              x: actor.x + actor.facing * 20,
              y: actor.y,
              vx: actor.facing * (460 + Math.random() * 120),
              vy: spread * 300,
              radius: 6,
              color: '#ef4444',
              damage: 18,
              ownerIsPlayer: actor.isPlayer,
              life: 0.8,
              isExplosive: true,
            });
          }
          triggerScreenShake(6);
          spawnParticles(actor.x, actor.y, '#f97316', 24, 200);
          addFloatingText(actor.x, actor.y - 20, "DRAGON'S BREATH!", '#ef4444');
          break;
        }
        case 'mega_bot': {
          spawnParticles(actor.x, actor.y, '#3b82f6', 22, 160);
          addFloatingText(actor.x, actor.y - 20, 'EMP FORCEFIELD!', '#3b82f6');
          break;
        }
        case 'swashbuckler': {
          actor.vx = actor.facing * 620;
          actor.vy = -120;
          spawnParticles(actor.x, actor.y, '#f59e0b', 24, 200);
          addFloatingText(actor.x, actor.y - 20, 'SHADOW BLADE!', '#f59e0b');

          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 68) {
              target.health -= 45;
              target.vx += actor.facing * 440;
              target.vy -= 180;
              spawnParticles(target.x, target.y, '#f59e0b', 20, 180);
              addFloatingText(target.x, target.y - 20, '-45 CRIT!', '#f59e0b');
            }
          });
          break;
        }
        case 'ice_elemental': {
          spawnParticles(actor.x, actor.y, '#67e8f9', 32, 240);
          addFloatingText(actor.x, actor.y - 20, 'GLACIAL NOVA!', '#67e8f9');
          triggerScreenShake(8);

          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 170) {
              target.frozenTimer = 2.5;
              target.vx = 0;
              target.vy = 0;
              spawnParticles(target.x, target.y, '#38bdf8', 20, 120);
              addFloatingText(target.x, target.y - 20, 'FROZEN!', '#38bdf8');
            }
          });
          break;
        }
        case 'vampire': {
          actor.vx = actor.facing * 500;
          actor.vy = -200;
          spawnParticles(actor.x, actor.y, '#881337', 24, 180);
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 64) {
              target.health -= 40;
              actor.health = Math.min(actor.maxHealth, actor.health + 40);
              target.vx += actor.facing * 340;
              spawnParticles(actor.x, actor.y, '#10b981', 16, 120);
              addFloatingText(actor.x, actor.y - 20, '+40 HP DRAIN!', '#10b981');
              addFloatingText(target.x, target.y - 20, '-40 DRAINED!', '#881337');
            }
          });
          break;
        }
        case 'tyrannosaurus_rex': {
          spawnParticles(actor.x, actor.y, '#15803d', 36, 280);
          addFloatingText(actor.x, actor.y - 20, 'PRIMAL ROAR!', '#22c55e');
          triggerScreenShake(12);

          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            const dist = Math.hypot(target.x - actor.x, target.y - actor.y);
            if (dist < 230) {
              const nx = (target.x - actor.x) / (dist || 1);
              target.vx += nx * 680;
              target.vy -= 280;
              target.health -= 25;
              spawnParticles(target.x, target.y, '#22c55e', 18, 160);
              addFloatingText(target.x, target.y - 20, '-25 KNOCKOUT!', '#22c55e');
            }
          });
          break;
        }
        case 'ghost': {
          spawnParticles(actor.x, actor.y, '#94a3b8', 20, 120);
          addFloatingText(actor.x, actor.y - 20, 'ETHEREAL PHASE!', '#94a3b8');
          break;
        }
        case 'blobfish': {
          actor.vy = -560;
          spawnParticles(actor.x, actor.y, '#f43f5e', 24, 160);
          addFloatingText(actor.x, actor.y - 20, 'GOO SLAM!', '#f43f5e');
          break;
        }
        case 'cat': {
          actor.vx = actor.facing * 540;
          actor.vy = -230;
          spawnParticles(actor.x, actor.y, '#ea580c', 24, 200);
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 64) {
              target.health -= 50;
              target.vx += actor.facing * 400;
              target.vy -= 160;
              spawnParticles(target.x, target.y, '#f97316', 20, 160);
              addFloatingText(target.x, target.y - 20, '-50 CLAW SHRED!', '#ea580c');
            }
          });
          break;
        }
        case 'captain_blackbeard': {
          // Broadside Cannon: fires 2 heavy bouncing explosive cannonballs
          for (const s of [0.9, 1.2]) {
            projectiles.push({
              x: actor.x + actor.facing * 24,
              y: actor.y - 4,
              vx: actor.facing * 460 * s,
              vy: -120 * s,
              radius: 9,
              color: '#451a03',
              damage: 60,
              ownerIsPlayer: actor.isPlayer,
              life: 3.0,
              isCannonball: true,
              isExplosive: true,
            });
          }
          triggerScreenShake(9);
          spawnParticles(actor.x, actor.y, '#b45309', 24, 180);
          addFloatingText(actor.x, actor.y - 20, 'BROADSIDE CANNON!', '#b45309');
          break;
        }
        case 'chameleon': {
          // Camo Chameleon: Invisibility Cloak
          actor.isCloaked = true;
          spawnParticles(actor.x, actor.y, '#84cc16', 20, 140);
          addFloatingText(actor.x, actor.y - 20, 'CLOAKED (2x CRIT)', '#84cc16');
          break;
        }
        case 'yeti': {
          // Avalanche Slam: leap high and ground pound shockwave
          actor.vy = -580;
          triggerScreenShake(10);
          spawnParticles(actor.x, actor.y, '#38bdf8', 30, 220);
          addFloatingText(actor.x, actor.y - 20, 'AVALANCHE SLAM!', '#38bdf8');
          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.abs(target.x - actor.x) < 180 && target.isGrounded) {
              target.frozenTimer = 1.8;
              target.health -= 35;
              addFloatingText(target.x, target.y - 20, '-35 FROST TREMOR', '#38bdf8');
            }
          });
          break;
        }
        case 'angry_bot': {
          // Rocket Overdrive: 2x turbo rocket speed boost
          actor.vx = actor.facing * 750;
          actor.vy = -180;
          triggerScreenShake(7);
          spawnParticles(actor.x, actor.y, '#dc2626', 28, 220);
          addFloatingText(actor.x, actor.y - 20, 'ROCKET OVERDRIVE!', '#dc2626');
          break;
        }
        case 'pufferfish': {
          // Toxic Puffer: Spike Eruption (8 spikes in all directions)
          for (let ang = 0; ang < Math.PI * 2; ang += (Math.PI * 2) / 8) {
            projectiles.push({
              x: actor.x,
              y: actor.y,
              vx: Math.cos(ang) * 520,
              vy: Math.sin(ang) * 520,
              radius: 4,
              color: '#eab308',
              damage: 28,
              ownerIsPlayer: actor.isPlayer,
              life: 1.5,
            });
          }
          spawnParticles(actor.x, actor.y, '#eab308', 24, 180);
          addFloatingText(actor.x, actor.y - 20, 'SPIKE ERUPTION!', '#eab308');
          break;
        }
        case 'werewolf': {
          // Lunar Pounce
          actor.vx = actor.facing * 640;
          actor.vy = -260;
          triggerScreenShake(6);
          spawnParticles(actor.x, actor.y, '#475569', 24, 200);
          addFloatingText(actor.x, actor.y - 20, 'LUNAR POUNCE!', '#475569');

          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 68) {
              target.health -= 55;
              target.vx += actor.facing * 420;
              target.vy -= 180;
              spawnParticles(target.x, target.y, '#ef4444', 18, 160);
              addFloatingText(target.x, target.y - 20, '-55 PINNED!', '#ef4444');
            }
          });
          break;
        }
        case 'crocodile': {
          // Death Roll: spinning charge
          actor.vx = actor.facing * 660;
          actor.vy = -80;
          triggerScreenShake(8);
          spawnParticles(actor.x, actor.y, '#166534', 26, 180);
          addFloatingText(actor.x, actor.y - 20, 'DEATH ROLL!', '#166534');

          actors.forEach((target) => {
            if (target === actor || target.stocks <= 0) return;
            if (Math.hypot(target.x - actor.x, target.y - actor.y) < 72) {
              target.health -= 45;
              target.vx += actor.facing * 500;
              target.vy -= 160;
              addFloatingText(target.x, target.y - 20, '-45 BOWLED OVER', '#166534');
            }
          });
          break;
        }
        case 'octopus': {
          // Ink Blaster: sprays dark ink clouds
          for (let i = 0; i < 6; i++) {
            projectiles.push({
              x: actor.x + actor.facing * 20,
              y: actor.y,
              vx: actor.facing * (340 + Math.random() * 120),
              vy: (Math.random() - 0.5) * 160,
              radius: 12,
              color: '#3b0764',
              damage: 22,
              ownerIsPlayer: actor.isPlayer,
              life: 1.4,
            });
          }
          spawnParticles(actor.x, actor.y, '#7c3aed', 24, 160);
          addFloatingText(actor.x, actor.y - 20, 'INK BLIND!', '#7c3aed');
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

      // Update Screen Shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 24);
      }

      // Update Moving Platforms for Kinetic Factory
      platforms.forEach((p) => {
        if (p.isMoving && p.initialPos !== undefined && p.moveRange && p.moveSpeed) {
          const offset = Math.sin(time * 0.001 * p.moveSpeed) * p.moveRange;
          if (p.moveAxis === 'x') {
            p.x = p.initialPos + offset;
          } else {
            p.y = p.initialPos + offset;
          }
        }
      });

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

        if (dudeActor.abilityActiveDuration <= 0) {
          dudeActor.isCloaked = false;
        }

        // If frozen by Ice Elemental or Yeti
        if (dudeActor.frozenTimer > 0) {
          dudeActor.frozenTimer -= dt;
          dudeActor.vx *= 0.8;
          return;
        }

        // Apply Passive Gravity Modifier
        let dudeGravity = baseGravity;
        if (dudeActor.dude.id === 'astronaut' && dudeActor.vy > 0) {
          dudeGravity *= 0.6;
        }

        if (dudeActor.isPlayer) {
          // Update HUD ability states
          const cdRatio = Math.max(0, 1 - dudeActor.abilityCooldownRemaining / dudeActor.dude.abilityCooldown);
          setAbilityCooldownPercent(Math.round(cdRatio * 100));
          setAbilityReady(dudeActor.abilityCooldownRemaining <= 0);

          // Player Locomotion
          let moveSpeed = 260;
          if (dudeActor.dude.id === 'alien') moveSpeed *= 1.2;
          if (dudeActor.dude.id === 'angry_bot' && dudeActor.abilityActiveDuration > 0) moveSpeed *= 1.6;

          if (keysRef.current.left) {
            dudeActor.vx = -moveSpeed;
            dudeActor.facing = -1;
          } else if (keysRef.current.right) {
            dudeActor.vx = moveSpeed;
            dudeActor.facing = 1;
          } else {
            dudeActor.vx *= 0.82;
          }

          // Jumping
          const maxJumps = dudeActor.dude.id === 'swashbuckler' ? 3 : 2;
          if (triggerJumpRef.current) {
            if (dudeActor.isGrounded || dudeActor.jumpCount < maxJumps) {
              const jumpForce = dudeActor.dude.id === 'werewolf' ? -520 : -490;
              dudeActor.vy = jumpForce;
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
            const pickupRadius = dudeActor.dude.id === 'octopus' ? 55 : 34;
            weaponSpawns.forEach((w) => {
              if (w.available && Math.hypot(dudeActor.x - w.x, dudeActor.y - w.y) < pickupRadius) {
                dudeActor.weapon = w.type;
                w.available = false;
                w.respawnTimer = 6.0;
                setCurrentWeapon(w.type);
                spawnParticles(dudeActor.x, dudeActor.y, WEAPONS[w.type].color, 16, 140);
                addFloatingText(dudeActor.x, dudeActor.y - 24, `+ ${WEAPONS[w.type].name}`, WEAPONS[w.type].color);
              }
            });
          }

          // Fire Weapon (Linear Recoil Kick)
          if ((keysRef.current.fire || triggerFireRef.current) && dudeActor.fireCooldown <= 0) {
            const wDef = WEAPONS[dudeActor.weapon];
            dudeActor.fireCooldown = wDef.fireRate;
            if (dudeActor.dude.id === 'angry_bot') dudeActor.fireCooldown *= 0.75;
            triggerFireRef.current = false;

            const spawnX = dudeActor.x + dudeActor.facing * 24;
            const spawnY = dudeActor.y - 2;

            if (dudeActor.weapon === 'plasma_shotgun') {
              // Multi-pellet scattergun
              for (let p = 0; p < (wDef.count || 5); p++) {
                const spreadAngle = (Math.random() - 0.5) * (wDef.spread || 0.35);
                projectiles.push({
                  x: spawnX,
                  y: spawnY,
                  vx: dudeActor.facing * wDef.speed * (0.9 + Math.random() * 0.2),
                  vy: spreadAngle * wDef.speed,
                  radius: 4,
                  color: wDef.color,
                  damage: wDef.damage,
                  ownerIsPlayer: true,
                  life: 1.2,
                });
              }
              triggerScreenShake(7);
            } else if (dudeActor.weapon === 'chain_lightning') {
              projectiles.push({
                x: spawnX,
                y: spawnY,
                vx: dudeActor.facing * wDef.speed,
                vy: (Math.random() - 0.5) * 20,
                radius: 6,
                color: wDef.color,
                damage: wDef.damage,
                ownerIsPlayer: true,
                life: 1.8,
                isLightning: true,
              });
              triggerScreenShake(4);
            } else {
              projectiles.push({
                x: spawnX,
                y: spawnY,
                vx: dudeActor.facing * (dudeActor.dude.id === 'wizard' ? wDef.speed * 1.35 : wDef.speed),
                vy: (Math.random() - 0.5) * 35,
                radius: dudeActor.weapon === 'fish_bazooka' ? 7 : 4,
                color: wDef.color,
                damage: wDef.damage,
                ownerIsPlayer: true,
                life: 2.2,
                isExplosive: dudeActor.weapon === 'fish_bazooka',
              });
              if (dudeActor.weapon === 'fish_bazooka') triggerScreenShake(8);
            }

            // RECOIL LINEAR IMPULSE
            let recoilForce = wDef.recoil;
            if (dudeActor.dude.id === 'dragon') recoilForce *= 0.5;
            dudeActor.vx -= dudeActor.facing * recoilForce;
            if (!dudeActor.isGrounded) {
              dudeActor.vy -= 70;
            }
            spawnParticles(spawnX, spawnY, wDef.color, 10, 160);
          }
        } else {
          // AI Bot Logic: Targets closest enemy
          let nearestTarget = player;
          let minDist = Math.hypot(player.x - dudeActor.x, player.y - dudeActor.y);

          actors.forEach((other) => {
            if (other === dudeActor || other.stocks <= 0) return;
            const d = Math.hypot(other.x - dudeActor.x, other.y - dudeActor.y);
            if (d < minDist) {
              minDist = d;
              nearestTarget = other;
            }
          });

          const distToTarget = minDist;
          dudeActor.facing = nearestTarget.x > dudeActor.x ? 1 : -1;

          if (distToTarget > 200) {
            dudeActor.vx = dudeActor.facing * 190;
          } else if (distToTarget < 90) {
            dudeActor.vx = -dudeActor.facing * 140;
          } else {
            dudeActor.vx *= 0.85;
          }

          // Jump check
          if (
            dudeActor.isGrounded &&
            (Math.random() < 0.02 || (nearestTarget.y < dudeActor.y - 40 && Math.random() < 0.06))
          ) {
            dudeActor.vy = -470;
            dudeActor.isGrounded = false;
          }

          // Bot Weapon Fire
          if (distToTarget < 350 && Math.abs(nearestTarget.y - dudeActor.y) < 80 && dudeActor.fireCooldown <= 0) {
            const wDef = WEAPONS[dudeActor.weapon];
            dudeActor.fireCooldown = wDef.fireRate * (1.2 + Math.random() * 0.4);

            const spawnX = dudeActor.x + dudeActor.facing * 24;
            const spawnY = dudeActor.y - 2;
            projectiles.push({
              x: spawnX,
              y: spawnY,
              vx: dudeActor.facing * wDef.speed,
              vy: (Math.random() - 0.5) * 30,
              radius: dudeActor.weapon === 'fish_bazooka' ? 7 : 4,
              color: wDef.color,
              damage: wDef.damage,
              ownerIsPlayer: false,
              life: 2.2,
              isExplosive: dudeActor.weapon === 'fish_bazooka',
            });

            dudeActor.vx -= dudeActor.facing * wDef.recoil;
          }

          // Bot Special Ability Activation
          if (distToTarget < 270 && dudeActor.abilityCooldownRemaining <= 0 && Math.random() < 0.05) {
            executeAbility(dudeActor);
          }
        }

        // Apply Dynamics
        dudeActor.vy += dudeGravity * dt;
        dudeActor.x += dudeActor.vx * dt;
        dudeActor.y += dudeActor.vy * dt;

        // Platform Collisions
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
              dudeActor.y + halfH <= p.y + 18 &&
              dudeActor.vy >= 0
            ) {
              dudeActor.y = p.y - halfH;

              if (p.isBouncy) {
                // High-restitution trampoline pad
                dudeActor.vy = -680;
                dudeActor.isGrounded = false;
                spawnParticles(dudeActor.x, dudeActor.y + halfH, '#f43f5e', 16, 180);
                addFloatingText(dudeActor.x, dudeActor.y, 'BOUNCE!', '#f43f5e');
              } else {
                dudeActor.vy = 0;
                dudeActor.isGrounded = true;
                dudeActor.jumpCount = 0;
              }
            }
          });
        }

        // Boundary Clamps
        if (dudeActor.x < 36) {
          dudeActor.x = 36;
          dudeActor.vx = 0;
        } else if (dudeActor.x > width - 36) {
          dudeActor.x = width - 36;
          dudeActor.vx = 0;
        }

        // Void Falling
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

        // Cannonball gravity
        if (pr.isCannonball) {
          pr.vy += 600 * dt;
        }

        // Trail particles
        if (Math.random() < 0.45) {
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
              if (pr.isCannonball) {
                pr.vy = -pr.vy * 0.7; // Cannonball bounces
                pr.y = p.y - 2;
                spawnParticles(pr.x, pr.y, '#b45309', 8, 80);
              } else {
                hitPlatform = true;
                break;
              }
            }
          }
        }

        let hitDude = false;
        actors.forEach((actor) => {
          if (actor.stocks <= 0) return;
          if (pr.ownerIsPlayer === actor.isPlayer) return;

          // Ghost ethereal phase immunity
          if (actor.dude.id === 'ghost' && actor.abilityActiveDuration > 0) return;

          // Mega Bot Forcefield reflection
          if (actor.dude.id === 'mega_bot' && actor.abilityActiveDuration > 0) {
            if (Math.hypot(pr.x - actor.x, pr.y - actor.y) < 48) {
              pr.vx = -pr.vx * 1.3;
              pr.ownerIsPlayer = !pr.ownerIsPlayer;
              spawnParticles(pr.x, pr.y, '#3b82f6', 14, 180);
              addFloatingText(actor.x, actor.y - 24, 'DEFLECT!', '#3b82f6');
              return;
            }
          }

          if (Math.hypot(pr.x - actor.x, pr.y - actor.y) < 28) {
            hitDude = true;
            let actualDmg = pr.damage;

            // Chameleon 2x Crit from Cloak
            if (pr.ownerIsPlayer && selectedDude.id === 'chameleon' && player.isCloaked) {
              actualDmg *= 2;
              player.isCloaked = false;
              addFloatingText(actor.x, actor.y - 30, 'CRIT x2!', '#84cc16');
            }

            actor.health -= actualDmg;
            actor.vx += (pr.vx > 0 ? 1 : -1) * 280;
            actor.vy -= 120;
            spawnParticles(actor.x, actor.y, actor.dude.color, 14, 160);
            addFloatingText(actor.x, actor.y - 20, `-${actualDmg}`, pr.color);

            // Vampire lifesteal passive
            if (pr.ownerIsPlayer && selectedDude.id === 'vampire') {
              const healed = Math.round(actualDmg * 0.15);
              player.health = Math.min(player.maxHealth, player.health + healed);
              addFloatingText(player.x, player.y - 24, `+${healed} HP`, '#10b981');
            }

            // Tesla Chain Lightning effect: jumps to adjacent Dude
            if (pr.isLightning) {
              actors.forEach((other) => {
                if (other !== actor && other.stocks > 0 && Math.hypot(other.x - actor.x, other.y - actor.y) < 130) {
                  other.health -= 20;
                  spawnParticles(other.x, other.y, '#eab308', 12, 140);
                  addFloatingText(other.x, other.y - 20, '-20 ARC ZAP', '#eab308');
                }
              });
            }

            if (actor.health <= 0) {
              if (pr.ownerIsPlayer) {
                setPlayerScore((s) => {
                  const ns = s + 1;
                  if (ns >= 5) setMatchStatus('victory');
                  return ns;
                });
                addFloatingText(actor.x, actor.y - 30, 'KO! +1', '#FF5F1F');
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

      // 5. Process Floating Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.life += dt;
        if (ft.life >= ft.maxLife) {
          floatingTexts.splice(i, 1);
        }
      }

      // 6. Render Canvas Viewport with Screen Shake
      ctx.save();
      if (screenShakeRef.current > 0) {
        const sx = (Math.random() - 0.5) * screenShakeRef.current;
        const sy = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(sx, sy);
      }

      ctx.clearRect(0, 0, width, height);

      // Arena Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      if (arenaMap === 'rooftops') {
        grad.addColorStop(0, '#f8fafc');
        grad.addColorStop(1, '#f1f5f9');
      } else if (arenaMap === 'void_spires') {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      } else {
        grad.addColorStop(0, '#fdf4ff');
        grad.addColorStop(1, '#f3e8ff');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid
      ctx.strokeStyle = arenaMap === 'void_spires' ? 'rgba(255,255,255,0.05)' : '#e2e8f0';
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
        // Platform Shadow
        ctx.fillStyle = arenaMap === 'void_spires' ? 'rgba(0,0,0,0.4)' : '#cbd5e1';
        ctx.fillRect(p.x + 2, p.y + 3, p.w, p.h);

        // Main Body
        if (p.isBouncy) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x, p.y, p.w, 4);
        } else {
          ctx.fillStyle = p.isOneWay ? (arenaMap === 'void_spires' ? '#334155' : '#ffffff') : '#1e293b';
          ctx.fillRect(p.x, p.y, p.w, p.h);

          ctx.fillStyle = p.isOneWay ? '#0ABAB5' : '#FF5F1F';
          ctx.fillRect(p.x, p.y, p.w, 3);
        }
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
        ctx.fillStyle = arenaMap === 'void_spires' ? 'rgba(0,0,0,0.5)' : '#cbd5e1';
        ctx.fill();

        // Active Ability Auras
        if (actor.abilityActiveDuration > 0) {
          if (actor.dude.id === 'mega_bot') {
            // EMP Dome
            ctx.beginPath();
            ctx.arc(0, 0, 38, 0, Math.PI * 2);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
            ctx.fill();
            ctx.stroke();
          } else if (actor.dude.id === 'astronaut') {
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
          ctx.globalAlpha = 0.45;
        } else if (actor.isCloaked) {
          ctx.globalAlpha = 0.35; // Chameleon camo cloak
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

        // Frozen ice overlay
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
        ctx.fillStyle = actor.isPlayer ? '#0ABAB5' : (arenaMap === 'void_spires' ? '#94a3b8' : '#64748b');
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(actor.isPlayer ? `YOU (${actor.dude.name})` : actor.dude.name, actor.x, actor.y - 34);
      });

      // Render Floating Damage Texts
      floatingTexts.forEach((ft) => {
        ctx.save();
        const alpha = Math.max(0, 1.0 - ft.life / ft.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore(); // Restore screen shake
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playMode, playerDudeId, physicsConfig, selectedDude, arenaMap, opponentCount]);

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
    setAbilityCooldownPercent(100);
    setAbilityReady(true);
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* 2D Arena Top Navigation Bar */}
      <div className="p-3 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Mode Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F1F]" />
            <h3 className="text-xs font-semibold text-stone-900">{gameTitle}</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-stone-100 text-stone-600 border border-stone-200">
              Bevy 0.15 + Rapier2D
            </span>
          </div>

          {/* Arena Stage Map Selector */}
          <div className="hidden sm:flex items-center space-x-1 p-0.5 rounded-xl bg-stone-100 border border-stone-200/80 text-[11px]">
            <button
              type="button"
              onClick={() => setArenaMap('rooftops')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                arenaMap === 'rooftops' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Rooftops
            </button>
            <button
              type="button"
              onClick={() => setArenaMap('void_spires')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                arenaMap === 'void_spires' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Void Spires
            </button>
            <button
              type="button"
              onClick={() => setArenaMap('kinetic_factory')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                arenaMap === 'kinetic_factory' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Kinetic Factory
            </button>
          </div>
        </div>

        {/* Right: Opponents Count & Player Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-stone-100 border border-stone-200/80 text-[11px]">
            <button
              type="button"
              onClick={() => setOpponentCount(1)}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                opponentCount === 1 ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="1v1 Duel"
            >
              1v1 Duel
            </button>
            <button
              type="button"
              onClick={() => setOpponentCount(3)}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                opponentCount === 3 ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="4-Player Free-For-All"
            >
              4-Player FFA
            </button>
          </div>

          <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-stone-100 border border-stone-200/80 text-xs">
            <button
              type="button"
              onClick={() => setPlayMode('sim')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                playMode === 'sim' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tactical Canvas
            </button>
            <button
              type="button"
              onClick={() => setPlayMode('wasm')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                playMode === 'wasm' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Official WASM
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetMatch}
            className="p-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            title="Reset Tactical Match"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 20-Dude Character Selection Strip */}
      <div className="p-2.5 bg-stone-50/90 border-b border-stone-200/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider pl-1 pr-2 shrink-0">
          Roster ({DUDES_ROSTER.length}):
        </div>

        {DUDES_ROSTER.map((dude) => {
          const isSelected = dude.id === playerDudeId;
          return (
            <button
              key={dude.id}
              type="button"
              onClick={() => {
                setPlayerDudeId(dude.id);
                handleResetMatch();
              }}
              className={`subtle-depth-interactive flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap border shrink-0 transition-all ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 hover:text-stone-950 border-stone-200 hover:border-stone-300'
              }`}
              title={`${dude.name}: ${dude.abilityName} (${dude.abilityDescription}) - ${dude.passiveDescription}`}
            >
              <img
                src={dude.svgPath}
                alt={dude.name}
                className="w-5 h-5 rounded-md object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-medium">{dude.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Dude Stats & Ability Banner */}
      <div className="px-3.5 py-1.5 bg-white/70 border-b border-stone-200/60 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-stone-900">{selectedDude.name}</span>
          <span>·</span>
          <span className="text-[#FF5F1F] font-medium flex items-center space-x-1">
            <Zap className="w-3 h-3 text-[#FF5F1F]" />
            <span>Ability: {selectedDude.abilityName}</span>
          </span>
          <span className="text-[11px] text-stone-500 font-normal hidden sm:inline">
            ({selectedDude.abilityDescription})
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-stone-500">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#0ABAB5]" />
            <span>Passive: {selectedDude.passiveDescription}</span>
          </span>
        </div>
      </div>

      {/* Main Viewport */}
      <div ref={containerRef} className="flex-1 relative bg-stone-100/50 overflow-hidden min-h-[460px]">
        {playMode === 'sim' ? (
          <>
            <canvas
              ref={canvasRef}
              width={780}
              height={470}
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
                        You dominated the tactical arena with 5 knockouts using {selectedDude.name}&apos;s {selectedDude.abilityName}.
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
