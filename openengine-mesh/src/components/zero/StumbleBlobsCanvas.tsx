import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Trophy,
  Zap,
  Flag,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { GamePhysicsConfig } from '../../types';

interface StumbleBlobsCanvasProps {
  gameTitle: string;
  physicsConfig: GamePhysicsConfig;
}

interface Checkpoint {
  z: number;
  name: string;
}

const CHECKPOINTS: Checkpoint[] = [
  { z: 18, name: 'Start Gate' },
  { z: -12, name: '1. Dual Sweepers' },
  { z: -38, name: '2. Trampoline Gap' },
  { z: -62, name: '3. Pendulum Alley' },
  { z: -87, name: '4. Tilting See-Saw' },
  { z: -110, name: '5. Rolling Logs' },
  { z: -132, name: '6. Puncher Wall' },
  { z: -157, name: '7. Turntables' },
  { z: -178, name: '8. Sliding Gates' },
  { z: -200, name: '9. Pinball Bumpers' },
  { z: -222, name: '10. Victory Slide' },
];

export const StumbleBlobsCanvas: React.FC<StumbleBlobsCanvasProps> = ({
  gameTitle,
  physicsConfig,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [qualifyStatus, setQualifyStatus] = useState<'racing' | 'qualified' | 'eliminated'>('racing');
  const [blobCount] = useState<number>(4);
  const [hazardSpeed, setHazardSpeed] = useState<number>(1.0);
  const [currentStageName, setCurrentStageName] = useState<string>('Start Gate');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Key controls state ref
  const keysRef = useRef<{ forward: boolean; backward: boolean; left: boolean; right: boolean; jump: boolean; dive: boolean }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    dive: false,
  });

  // Action triggers
  const diveTriggerRef = useRef(false);
  const jumpTriggerRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.right = true;
      if (e.code === 'Space') {
        e.preventDefault();
        jumpTriggerRef.current = true;
      }
      if (e.code === 'KeyE' || e.code === 'ShiftLeft') {
        diveTriggerRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera, Renderer
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f5f5f4');
    scene.fog = new THREE.FogExp2('#f5f5f4', 0.007);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    camera.position.set(0, 14, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.8);
    dirLight.position.set(25, 45, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 350;
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    scene.add(dirLight);

    // 3. Stumble Guys 10-Obstacle Mega Track Architecture
    const trackGroup = new THREE.Group();
    scene.add(trackGroup);

    interface PlatformBounds {
      minX: number;
      maxX: number;
      minZ: number;
      maxZ: number;
      y: number;
    }
    const platforms: PlatformBounds[] = [];

    const createPlatform = (x: number, y: number, z: number, w: number, d: number, color: string) => {
      const geo = new THREE.BoxGeometry(w, 1.2, d);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      trackGroup.add(mesh);

      platforms.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        y: y + 0.6,
      });
      return mesh;
    };

    // Platform Sections:
    // Start Pad
    createPlatform(0, 0, 20, 12, 12, '#e7e5e4');

    // Section 1: Sweepers track (z: +14 to -10)
    createPlatform(0, 0, 2, 8, 24, '#ffffff');

    // Section 2: Trampoline landing pad & gap (z: -14 to -36)
    createPlatform(0, 0, -14, 10, 8, '#e7e5e4');
    // Abyss gap from -18 to -28 (jumped via trampolines)
    createPlatform(0, 0, -34, 10, 8, '#e7e5e4');

    // Section 3: Narrow Pendulum Bridge (z: -42 to -62)
    createPlatform(0, 0, -52, 6, 24, '#ffffff');

    // Section 4: See-Saw approach pad (z: -66 to -70)
    createPlatform(0, 0, -68, 8, 8, '#e7e5e4');
    // The see-saw itself is a dynamic mesh at z: -78
    createPlatform(0, 0, -88, 8, 8, '#e7e5e4');

    // Section 5: Roller Logs Lane (z: -96 to -108)
    createPlatform(0, 0, -102, 9, 20, '#ffffff');

    // Section 6: Puncher Wall Corridor (z: -116 to -132)
    createPlatform(0, 0, -124, 8, 24, '#e7e5e4');
    // Side walls for punchers
    const wallMat = new THREE.MeshStandardMaterial({ color: '#d6d3d1', roughness: 0.4 });
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 24), wallMat);
    wallL.position.set(-4.4, 1.5, -124);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 24), wallMat);
    wallR.position.set(4.4, 1.5, -124);
    scene.add(wallL, wallR);

    // Section 7: Turntable stepping pads (z: -138 to -156)
    createPlatform(0, 0, -136, 6, 6, '#ffffff');
    createPlatform(0, 0, -158, 6, 6, '#ffffff');

    // Section 8: Narrow Catwalk with Sliding Gates (z: -164 to -178)
    createPlatform(0, 0, -171, 4.5, 20, '#ffffff');

    // Section 9: Pinball Bumper Arena (z: -186 to -202)
    createPlatform(0, 0, -194, 13, 22, '#e7e5e4');

    // Section 10: Grand Victory Slide & Finish Plaza (z: -208 to -232)
    const rampMat = new THREE.MeshStandardMaterial({ color: '#0ABAB5', roughness: 0.2 });
    const rampMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 16), rampMat);
    rampMesh.position.set(0, -1, -214);
    rampMesh.rotation.x = 0.18; // gentle slide angle
    rampMesh.receiveShadow = true;
    scene.add(rampMesh);

    // Finish Platform
    createPlatform(0, -2.5, -228, 16, 14, '#ffffff');

    // Add Checkpoint Gates & Arches
    CHECKPOINTS.forEach((cp, idx) => {
      const archMat = new THREE.MeshStandardMaterial({
        color: idx === CHECKPOINTS.length - 1 ? '#FF5F1F' : '#0ABAB5',
        roughness: 0.2,
      });
      const gateL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4, 12), archMat);
      gateL.position.set(-3.8, 2, cp.z);
      const gateR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4, 12), archMat);
      gateR.position.set(3.8, 2, cp.z);
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(8, 0.35, 0.35), archMat);
      topBar.position.set(0, 4, cp.z);
      scene.add(gateL, gateR, topBar);
    });

    // Grand Finish Arch at z: -232
    const grandFinishGroup = new THREE.Group();
    grandFinishGroup.position.set(0, -2.5, -232);
    const postGeo = new THREE.CylinderGeometry(0.6, 0.6, 9, 16);
    const postMat = new THREE.MeshStandardMaterial({ color: '#1c1917' });
    const fpL = new THREE.Mesh(postGeo, postMat);
    fpL.position.set(-6.5, 4.5, 0);
    const fpR = new THREE.Mesh(postGeo, postMat);
    fpR.position.set(6.5, 4.5, 0);
    const fBanner = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 0.5), new THREE.MeshStandardMaterial({ color: '#FF5F1F', roughness: 0.15 }));
    fBanner.position.set(0, 8.2, 0);
    grandFinishGroup.add(fpL, fpR, fBanner);
    scene.add(grandFinishGroup);

    // --- OBSTACLE HAZARD REFS & INITIALIZATION ---

    // Obstacle 1: Dual Sweeper Arms (z: 6 and z: -4)
    const sweeperPivot1 = new THREE.Group();
    sweeperPivot1.position.set(0, 1.4, 6);
    const sweeperPivot2 = new THREE.Group();
    sweeperPivot2.position.set(0, 1.4, -4);
    const armGeo = new THREE.CylinderGeometry(0.4, 0.4, 8.5, 16);
    armGeo.rotateZ(Math.PI / 2);
    const sweeper1 = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: '#FF5F1F', roughness: 0.2 }));
    const sweeper2 = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: '#0ABAB5', roughness: 0.2 }));
    sweeper1.castShadow = true;
    sweeper2.castShadow = true;
    sweeperPivot1.add(sweeper1);
    sweeperPivot2.add(sweeper2);
    scene.add(sweeperPivot1, sweeperPivot2);

    // Obstacle 2: Bouncy Trampoline Forest in Abyss Gap (z: -20 to -28)
    const trampolines: THREE.Mesh[] = [];
    const trampPositions = [
      { x: -2.2, z: -20.5 },
      { x: 2.2, z: -20.5 },
      { x: 0, z: -23.5 },
      { x: -2.2, z: -26.5 },
      { x: 2.2, z: -26.5 },
    ];
    trampPositions.forEach((tp) => {
      const padGeo = new THREE.CylinderGeometry(1.5, 1.2, 0.8, 24);
      const padMat = new THREE.MeshStandardMaterial({ color: '#0ABAB5', roughness: 0.1, metalness: 0.2 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(tp.x, 0.4, tp.z);
      pad.castShadow = true;
      scene.add(pad);
      trampolines.push(pad);
    });

    // Obstacle 3: Triple Swinging Pendulum Hammers (z: -46, -52, -58)
    const pendulums: { pivot: THREE.Group; hammer: THREE.Mesh; phase: number; baseZ: number }[] = [];
    [-46, -52, -58].forEach((pz, i) => {
      const piv = new THREE.Group();
      piv.position.set(0, 8, pz);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7, 12), new THREE.MeshStandardMaterial({ color: '#78716c' }));
      rod.position.set(0, -3.5, 0);
      const ham = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 2.2), new THREE.MeshStandardMaterial({ color: '#FF5F1F', roughness: 0.2 }));
      ham.position.set(0, -6.8, 0);
      ham.castShadow = true;
      piv.add(rod, ham);
      scene.add(piv);
      pendulums.push({ pivot: piv, hammer: ham, phase: i * 1.3, baseZ: pz });
    });

    // Obstacle 4: Tilting See-Saw Teeter Platform (z: -78)
    const seeSawPivot = new THREE.Group();
    seeSawPivot.position.set(0, 0, -78);
    const seeSawMesh = new THREE.Mesh(
      new THREE.BoxGeometry(7, 1.0, 16),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3 })
    );
    seeSawMesh.receiveShadow = true;
    seeSawMesh.castShadow = true;
    seeSawPivot.add(seeSawMesh);
    scene.add(seeSawPivot);

    // Obstacle 5: Rotating Rolling Logs (z: -98 and z: -104)
    const rollerLog1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 8.5, 20),
      new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.2 })
    );
    rollerLog1.rotateZ(Math.PI / 2);
    rollerLog1.position.set(0, 1.4, -98);
    rollerLog1.castShadow = true;
    const rollerLog2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 8.5, 20),
      new THREE.MeshStandardMaterial({ color: '#0ABAB5', roughness: 0.2 })
    );
    rollerLog2.rotateZ(Math.PI / 2);
    rollerLog2.position.set(0, 1.4, -104);
    rollerLog2.castShadow = true;
    scene.add(rollerLog1, rollerLog2);

    // Obstacle 6: Piston Punchers Wall (z: -118, -122, -126, -130)
    const punchers: { mesh: THREE.Mesh; side: 1 | -1; baseZ: number; speed: number; phase: number }[] = [];
    const puncherPositions = [
      { side: -1 as const, z: -118, speed: 4.5, phase: 0 },
      { side: 1 as const, z: -122, speed: 4.8, phase: 1.5 },
      { side: -1 as const, z: -126, speed: 4.2, phase: 3.0 },
      { side: 1 as const, z: -130, speed: 5.0, phase: 4.2 },
    ];
    puncherPositions.forEach((pp) => {
      const pHead = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.5, 1.8),
        new THREE.MeshStandardMaterial({ color: '#FF5F1F', roughness: 0.15 })
      );
      pHead.castShadow = true;
      scene.add(pHead);
      punchers.push({ mesh: pHead, side: pp.side, baseZ: pp.z, speed: pp.speed, phase: pp.phase });
    });

    // Obstacle 7: Triple Spinning Turntable Discs (z: -142, -148, -154)
    const turntables: { mesh: THREE.Mesh; speed: number; x: number; z: number }[] = [];
    const discGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.8, 32);
    const discPos = [
      { x: -1.5, z: -142, speed: 2.2, color: '#0ABAB5' },
      { x: 1.5, z: -148, speed: -2.5, color: '#ffffff' },
      { x: -0.5, z: -154, speed: 2.4, color: '#0ABAB5' },
    ];
    discPos.forEach((dp) => {
      const dMesh = new THREE.Mesh(discGeo, new THREE.MeshStandardMaterial({ color: dp.color, roughness: 0.25 }));
      dMesh.position.set(dp.x, 0.4, dp.z);
      dMesh.receiveShadow = true;
      scene.add(dMesh);
      turntables.push({ mesh: dMesh, speed: dp.speed, x: dp.x, z: dp.z });
    });

    // Obstacle 8: Sliding Laser Gate Barriers (z: -166, -170, -174)
    const slidingGates: { mesh: THREE.Mesh; baseZ: number; phase: number }[] = [];
    const gateGeo = new THREE.BoxGeometry(2.4, 1.8, 0.3);
    [-166, -170, -174].forEach((gz, i) => {
      const gMesh = new THREE.Mesh(gateGeo, new THREE.MeshStandardMaterial({ color: '#FF5F1F', roughness: 0.1 }));
      gMesh.position.set(0, 1.5, gz);
      gMesh.castShadow = true;
      scene.add(gMesh);
      slidingGates.push({ mesh: gMesh, baseZ: gz, phase: i * 2.1 });
    });

    // Obstacle 9: Pinball Bumper Alley (z: -188 to -200)
    const pinballBumpers: THREE.Mesh[] = [];
    const pinballPos = [
      { x: -3.5, z: -188 },
      { x: 3.5, z: -188 },
      { x: 0, z: -191 },
      { x: -3.0, z: -194 },
      { x: 3.0, z: -194 },
      { x: -1.5, z: -198 },
      { x: 1.5, z: -198 },
    ];
    pinballPos.forEach((pb) => {
      const bGeo = new THREE.CylinderGeometry(1.4, 1.1, 1.4, 20);
      const bMat = new THREE.MeshStandardMaterial({ color: '#0ABAB5', roughness: 0.1, metalness: 0.3 });
      const bm = new THREE.Mesh(bGeo, bMat);
      bm.position.set(pb.x, 1.2, pb.z);
      bm.castShadow = true;
      scene.add(bm);
      pinballBumpers.push(bm);
    });

    // 4. Lumpy 3D Blobs Generation (Squishy Deformed Spheres with Googly Eyes)
    interface BlobActor {
      mesh: THREE.Group;
      bodyMesh: THREE.Mesh;
      baseGeoPositions: Float32Array;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      isGrounded: boolean;
      isDiving: boolean;
      isAi: boolean;
      checkpointZ: number;
      color: string;
      wobblePhase: number;
    }

    const blobs: BlobActor[] = [];

    const createLumpyBlob = (color: string, startX: number, startZ: number, isAi = false): BlobActor => {
      const group = new THREE.Group();

      const sphereGeo = new THREE.SphereGeometry(1.1, 32, 24);
      const basePos = new Float32Array(sphereGeo.attributes.position.array);

      const bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.1,
      });
      const bodyMesh = new THREE.Mesh(sphereGeo, bodyMat);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Googly Eyes
      const eyeWhiteGeo = new THREE.SphereGeometry(0.26, 16, 16);
      const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1 });
      const eyePupilGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const eyePupilMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.1 });

      const eyeL = new THREE.Group();
      eyeL.position.set(-0.35, 0.45, 0.95);
      const wl = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      const pl = new THREE.Mesh(eyePupilGeo, eyePupilMat);
      pl.position.set(0, 0, 0.18);
      eyeL.add(wl, pl);

      const eyeR = new THREE.Group();
      eyeR.position.set(0.35, 0.45, 0.95);
      const wr = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      const pr = new THREE.Mesh(eyePupilGeo, eyePupilMat);
      pr.position.set(0, 0, 0.18);
      eyeR.add(wr, pr);

      group.add(eyeL, eyeR);
      group.position.set(startX, 2, startZ);
      scene.add(group);

      return {
        mesh: group,
        bodyMesh,
        baseGeoPositions: basePos,
        x: startX,
        y: 2,
        z: startZ,
        vx: 0,
        vy: 0,
        vz: 0,
        isGrounded: true,
        isDiving: false,
        isAi,
        checkpointZ: 20,
        color,
        wobblePhase: Math.random() * 10,
      };
    };

    // Player Blob (Tiffany Turquoise)
    const playerBlob = createLumpyBlob('#0ABAB5', 0, 20, false);
    blobs.push(playerBlob);

    // 3 AI Competitors (Stumbling together)
    blobs.push(createLumpyBlob('#FF5F1F', -2.5, 21, true));
    blobs.push(createLumpyBlob('#a855f7', 2.5, 21, true));
    blobs.push(createLumpyBlob('#3b82f6', 0, 23, true));

    // Respawn Blob to latest reached checkpoint
    const respawnBlob = (b: BlobActor) => {
      b.x = (Math.random() - 0.5) * 2.5;
      b.y = 3.5;
      b.z = b.checkpointZ + (Math.random() - 0.5) * 1.5;
      b.vx = 0;
      b.vy = 0;
      b.vz = 0;
      b.isDiving = false;
      b.isGrounded = false;
    };

    // 5. Physics & Animation Tick Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // --- ANIMATE HAZARDS ---
      // 1. Sweepers
      sweeperPivot1.rotation.y += dt * 2.5 * hazardSpeed;
      sweeperPivot2.rotation.y -= dt * 2.8 * hazardSpeed;

      // 2. Trampolines pulse
      trampolines.forEach((tp, i) => {
        const s = 1.0 + Math.sin(time * 6 + i) * 0.06;
        tp.scale.set(s, 1.0, s);
      });

      // 3. Pendulum Hammers
      pendulums.forEach((p) => {
        const angle = Math.sin(time * 3.2 * hazardSpeed + p.phase) * 0.95;
        p.pivot.rotation.z = angle;
      });

      // 4. See-Saw rock
      const seeSawAngle = Math.sin(time * 1.8) * 0.22;
      seeSawPivot.rotation.z = seeSawAngle;

      // 5. Roller Logs rotation
      rollerLog1.rotation.x += dt * 4.5 * hazardSpeed;
      rollerLog2.rotation.x += dt * 5.0 * hazardSpeed;

      // 6. Punchers push/pull
      punchers.forEach((p) => {
        const cycle = Math.sin(time * p.speed * hazardSpeed + p.phase);
        const extend = cycle > 0.3 ? (cycle - 0.3) / 0.7 : 0;
        const targetX = p.side === 1 ? 4.0 - extend * 4.2 : -4.0 + extend * 4.2;
        p.mesh.position.set(targetX, 1.5, p.baseZ);
      });

      // 7. Turntables spin
      turntables.forEach((tt) => {
        tt.mesh.rotation.y += dt * tt.speed * hazardSpeed;
      });

      // 8. Sliding Gates
      slidingGates.forEach((g) => {
        const gx = Math.sin(time * 3.0 * hazardSpeed + g.phase) * 2.2;
        g.mesh.position.set(gx, 1.5, g.baseZ);
      });

      // 9. Pinball Bumpers
      pinballBumpers.forEach((bm, i) => {
        const s = 1.0 + Math.sin(time * 5 + i) * 0.05;
        bm.scale.set(s, 1.0, s);
      });

      // --- BLOBS UPDATE ---
      blobs.forEach((blob) => {
        // Player Input
        if (!blob.isAi) {
          const speed = 13.0;
          let moveX = 0;
          let moveZ = 0;

          if (keysRef.current.forward) moveZ -= 1;
          if (keysRef.current.backward) moveZ += 1;
          if (keysRef.current.left) moveX -= 1;
          if (keysRef.current.right) moveX += 1;

          const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
          if (len > 0) {
            moveX /= len;
            moveZ /= len;
            blob.vx += moveX * speed * dt * 4.0;
            blob.vz += moveZ * speed * dt * 4.0;

            const targetRot = Math.atan2(moveX, moveZ);
            blob.mesh.rotation.y = targetRot;
          }

          // Jump
          if (jumpTriggerRef.current && blob.isGrounded) {
            blob.vy = 9.0;
            blob.isGrounded = false;
            jumpTriggerRef.current = false;
          }

          // Dive Impulse (Belly Slide)
          if (diveTriggerRef.current) {
            blob.isDiving = true;
            blob.vy = 4.2;
            const forwardZ = Math.cos(blob.mesh.rotation.y);
            const forwardX = Math.sin(blob.mesh.rotation.y);
            blob.vz += forwardZ * 15.0;
            blob.vx += forwardX * 15.0;
            diveTriggerRef.current = false;
          }
        } else {
          // AI Logic: Drive towards finish line z = -228
          blob.vz -= dt * (9.0 + Math.random() * 3.5);
          blob.vx += (Math.random() - 0.5) * 2.2;

          // AI jumps over obstacles
          if (Math.random() < 0.03 && blob.isGrounded) {
            blob.vy = 8.0;
            blob.isGrounded = false;
          }
        }

        // Apply Avian Gravity & Drag
        const gravity = (physicsConfig.gravity / 9.81) * 22.0;
        blob.vy -= gravity * dt;

        blob.vx *= 0.91;
        blob.vz *= 0.91;

        blob.x += blob.vx * dt;
        blob.y += blob.vy * dt;
        blob.z += blob.vz * dt;

        // Ground check on platforms
        let onFloor = false;
        for (const p of platforms) {
          if (blob.x >= p.minX && blob.x <= p.maxX && blob.z >= p.minZ && blob.z <= p.maxZ) {
            if (blob.y <= p.y + 0.3 && blob.y >= p.y - 1.2) {
              blob.y = p.y;
              blob.vy = 0;
              blob.isGrounded = true;
              blob.isDiving = false;
              onFloor = true;
              break;
            }
          }
        }

        // Ground check on see-saw
        if (!onFloor && blob.z >= -86 && blob.z <= -70 && Math.abs(blob.x) <= 3.5) {
          const tiltY = Math.tan(-seeSawAngle) * blob.x;
          if (blob.y <= tiltY + 0.5 && blob.y >= tiltY - 1.0) {
            blob.y = tiltY + 0.5;
            blob.vy = 0;
            blob.vx += Math.sin(seeSawAngle) * 8.0 * dt; // slide down slope!
            blob.isGrounded = true;
            onFloor = true;
          }
        }

        // Ground check on victory slide ramp
        if (!onFloor && blob.z >= -222 && blob.z <= -206 && Math.abs(blob.x) <= 5.0) {
          const rampY = -1.0 - (blob.z - (-206)) * 0.15;
          if (blob.y <= rampY + 0.5 && blob.y >= rampY - 1.0) {
            blob.y = rampY + 0.5;
            blob.vy = 0;
            blob.vz -= 12.0 * dt; // Super slide boost down to finish line!
            blob.isGrounded = true;
            blob.isDiving = true;
            onFloor = true;
          }
        }

        if (!onFloor && blob.y < 1.0) {
          blob.isGrounded = false;
        }

        // --- HAZARD COLLISIONS ---
        // 1. Sweeper arms
        [sweeperPivot1, sweeperPivot2].forEach((sp) => {
          const distZ = Math.abs(blob.z - sp.position.z);
          if (distZ < 1.8 && Math.abs(blob.x) <= 4.5 && blob.y <= 2.6) {
            const rot = sp.rotation.y;
            const armDir = new THREE.Vector3(Math.cos(rot), 0, -Math.sin(rot));
            const toBlob = new THREE.Vector3(blob.x, 0, blob.z - sp.position.z);
            const d = toBlob.distanceTo(armDir.clone().multiplyScalar(toBlob.dot(armDir)));
            if (d < 1.4) {
              blob.vx += Math.cos(rot + Math.PI / 2) * 20.0;
              blob.vz += -Math.sin(rot + Math.PI / 2) * 20.0;
              blob.vy = 6.5;
              blob.isDiving = true;
            }
          }
        });

        // 2. Trampolines (Megabounce)
        trampolines.forEach((tp) => {
          const dx = blob.x - tp.position.x;
          const dz = blob.z - tp.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 1.7 && blob.y <= 1.5) {
            blob.vy = 14.5;
            blob.vz -= 9.0;
            blob.isGrounded = false;
          }
        });

        // 3. Pendulums
        pendulums.forEach((p) => {
          const distZ = Math.abs(blob.z - p.baseZ);
          if (distZ < 1.8) {
            const hx = Math.sin(p.pivot.rotation.z) * 6.8;
            const hy = 8.0 - Math.cos(p.pivot.rotation.z) * 6.8;
            const dx = blob.x - hx;
            const dy = blob.y - hy;
            if (Math.sqrt(dx * dx + dy * dy) < 1.6) {
              blob.vx += (dx > 0 ? 1 : -1) * 22.0;
              blob.vy = 8.0;
              blob.isDiving = true;
            }
          }
        });

        // 5. Roller Logs
        [rollerLog1, rollerLog2].forEach((log) => {
          const distZ = Math.abs(blob.z - log.position.z);
          if (distZ < 1.3 && Math.abs(blob.x) <= 4.2 && blob.y <= 2.2) {
            blob.vz += 8.0; // Rollback
            blob.vy = 5.0;
          }
        });

        // 6. Punchers
        punchers.forEach((p) => {
          const distZ = Math.abs(blob.z - p.baseZ);
          if (distZ < 1.2) {
            const px = p.mesh.position.x;
            const dx = Math.abs(blob.x - px);
            if (dx < 1.8 && blob.y <= 2.6) {
              blob.vx += p.side * 22.0;
              blob.vy = 7.0;
              blob.isDiving = true;
            }
          }
        });

        // 7. Turntables
        turntables.forEach((tt) => {
          const dx = blob.x - tt.x;
          const dz = blob.z - tt.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 3.6 && blob.y <= 1.2) {
            // Tangential spin force
            const tanX = -dz * tt.speed;
            const tanZ = dx * tt.speed;
            blob.vx += tanX * 1.5 * dt;
            blob.vz += tanZ * 1.5 * dt;
          }
        });

        // 8. Sliding Gates
        slidingGates.forEach((g) => {
          const distZ = Math.abs(blob.z - g.baseZ);
          if (distZ < 1.0) {
            const dx = Math.abs(blob.x - g.mesh.position.x);
            if (dx < 1.4 && blob.y <= 2.5) {
              blob.vz += 10.0;
              blob.vx += (blob.x > g.mesh.position.x ? 1 : -1) * 8.0;
            }
          }
        });

        // 9. Pinball Bumpers
        pinballBumpers.forEach((bm) => {
          const dx = blob.x - bm.position.x;
          const dz = blob.z - bm.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 2.0 && blob.y <= 2.2) {
            const nx = dx / (dist || 1);
            const nz = dz / (dist || 1);
            blob.vx = nx * 24.0 * physicsConfig.restitution;
            blob.vz = nz * 24.0 * physicsConfig.restitution;
            blob.vy = 10.0;
          }
        });

        // Checkpoint Advance
        for (const cp of CHECKPOINTS) {
          if (blob.z <= cp.z && cp.z < blob.checkpointZ) {
            blob.checkpointZ = cp.z;
          }
        }

        // Void Fall Respawn
        if (blob.y < -12) {
          respawnBlob(blob);
          if (!blob.isAi) {
            setQualifyStatus('racing');
          }
        }

        // Finish Line Check
        if (blob.z <= -228 && blob.y >= -3.5) {
          if (!blob.isAi && qualifyStatus !== 'qualified') {
            setQualifyStatus('qualified');
          }
        }

        // --- REAL-TIME LUMPY 3D BLOB HARMONIC DEFORMATION ---
        const posAttr = blob.bodyMesh.geometry.attributes.position;
        const posArr = posAttr.array as Float32Array;
        const base = blob.baseGeoPositions;
        const wobbleSpeed = 8.0;
        const wobbleAmp = 0.12;

        for (let i = 0; i < base.length; i += 3) {
          const bx = base[i];
          const by = base[i + 1];
          const bz = base[i + 2];

          const lump = Math.sin(time * wobbleSpeed + by * 4.0 + blob.wobblePhase) *
                       Math.cos(bx * 3.0 + time * 6.0) * wobbleAmp;

          const squishY = blob.isDiving ? 0.65 : blob.isGrounded ? 0.95 : 1.1;
          const stretchXZ = blob.isDiving ? 1.35 : 1.0;

          posArr[i] = bx * (1.0 + lump) * stretchXZ;
          posArr[i + 1] = by * (1.0 + lump) * squishY;
          posArr[i + 2] = bz * (1.0 + lump) * stretchXZ;
        }
        posAttr.needsUpdate = true;
        blob.bodyMesh.geometry.computeVertexNormals();

        // Update Transform
        blob.mesh.position.set(blob.x, blob.y, blob.z);

        // Tilt/wobble mesh while running
        if (Math.abs(blob.vx) > 0.1 || Math.abs(blob.vz) > 0.1) {
          blob.mesh.rotation.z = Math.sin(time * 12.0) * 0.15;
          if (blob.isDiving) {
            blob.mesh.rotation.x = -Math.PI / 3;
          } else {
            blob.mesh.rotation.x = 0;
          }
        }
      });

      // Update HUD progress states based on player blob
      const totalTrackDist = 248; // from z=20 to z=-228
      const curDist = Math.max(0, Math.min(totalTrackDist, 20 - playerBlob.z));
      const pct = Math.round((curDist / totalTrackDist) * 100);
      setProgressPercent(pct);

      // Find current stage name
      let stageName = 'Start Gate';
      for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
        if (playerBlob.z <= CHECKPOINTS[i].z) {
          stageName = CHECKPOINTS[i].name;
          break;
        }
      }
      setCurrentStageName(stageName);

      // Smooth Camera tracking behind player blob
      const targetCamX = playerBlob.x * 0.4;
      const targetCamY = playerBlob.y + 11.5;
      const targetCamZ = playerBlob.z + 18.5;
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.lookAt(playerBlob.x, playerBlob.y + 1.2, playerBlob.z - 4.0);

      // Dynamic light tracking to keep shadows crisp along the 250-unit track
      dirLight.position.set(playerBlob.x + 25, playerBlob.y + 45, playerBlob.z + 20);
      dirLight.target = playerBlob.mesh;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [physicsConfig, hazardSpeed, qualifyStatus]);

  const handleManualJump = () => {
    jumpTriggerRef.current = true;
  };

  const handleManualDive = () => {
    diveTriggerRef.current = true;
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* 3D Arena Header */}
      <div className="p-3.5 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0ABAB5] animate-pulse" />
          <div className="text-xs font-semibold text-stone-900">
            {gameTitle}
          </div>
          <span className="text-stone-300 font-light">·</span>
          <span className="text-[11px] text-stone-500 font-normal">
            Lumpy 3D Blobs ({blobCount} Racers)
          </span>
          <span className="text-stone-300 font-light">·</span>
          <span className="text-[11px] text-stone-600 font-medium flex items-center space-x-1">
            <Flag className="w-3 h-3 text-[#FF5F1F]" />
            <span>10 Obstacles</span>
          </span>
        </div>

        {/* Qualification / Match Status Pill & Hazards */}
        <div className="flex items-center space-x-2">
          {qualifyStatus === 'qualified' ? (
            <span className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-bounce">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>VICTORY! Round 1 Qualified!</span>
            </span>
          ) : (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0ABAB5]" />
              <span>Checkpoints Active</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setHazardSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : 1.0))}
            className="subtle-depth-interactive flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-stone-700 bg-white/90 border border-stone-200/90 hover:border-stone-400"
            title="Cycle Obstacle Speed"
          >
            <Zap className="w-3 h-3 text-[#FF5F1F]" />
            <span>Hazards: {hazardSpeed}x</span>
          </button>
        </div>
      </div>

      {/* Course Progress Bar */}
      <div className="px-4 py-1.5 bg-stone-50 border-b border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-stone-800 flex items-center space-x-1">
            <span>Course Progress</span>
            <ChevronRight className="w-3 h-3 text-stone-400" />
          </span>
          <span className="text-stone-600">{currentStageName}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-36 h-2 bg-stone-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0ABAB5] to-[#FF5F1F] rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-medium text-stone-700 w-8 text-right">{progressPercent}%</span>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="flex-1 relative bg-stone-100/60 overflow-hidden">
        <div ref={mountRef} className="w-full h-full" />

        {/* On-Screen Touch / Action Controls for Jump & Dive */}
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
            onClick={handleManualDive}
            className="subtle-depth-interactive px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium border border-stone-900 shadow-sm flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span>Dive (E / Shift)</span>
          </button>
        </div>

        {/* Physics Specs Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 shadow-sm flex items-center space-x-2.5">
          <span className="flex items-center space-x-1">
            <Compass className="w-3 h-3 text-[#0ABAB5]" />
            <span>WASD / Arrows to Move</span>
          </span>
          <span>·</span>
          <span>Avian3D Restitution: {physicsConfig.restitution}</span>
          <span>·</span>
          <span>10 Physics Obstacles & Checkpoints</span>
        </div>
      </div>
    </div>
  );
};

