import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Trophy,
  Zap,
} from 'lucide-react';
import { GamePhysicsConfig } from '../../types';

interface StumbleBlobsCanvasProps {
  gameTitle: string;
  physicsConfig: GamePhysicsConfig;
}

export const StumbleBlobsCanvas: React.FC<StumbleBlobsCanvasProps> = ({
  gameTitle,
  physicsConfig,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [qualifyStatus, setQualifyStatus] = useState<'racing' | 'qualified' | 'eliminated'>('racing');
  const [blobCount] = useState<number>(4);
  const [hazardSpeed, setHazardSpeed] = useState<number>(1.0);

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
    scene.fog = new THREE.FogExp2('#f5f5f4', 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Soft pastel stadium light)
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.8);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);

    // 3. Stumble Guys Obstacle Course Architecture
    // Floor Sections
    const trackGroup = new THREE.Group();
    scene.add(trackGroup);

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
      return mesh;
    };

    // Spawn starting platform
    createPlatform(0, 0, 15, 12, 10, '#e7e5e4'); // Start pad
    createPlatform(0, 0, 0, 8, 14, '#ffffff');  // Sweeper platform
    createPlatform(0, 0, -15, 10, 12, '#e7e5e4'); // Trampoline field
    createPlatform(0, 0, -32, 14, 16, '#0ABAB5'); // Finish gate platform

    // Finish Line Arch
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -38);
    const postGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
    const postMat = new THREE.MeshStandardMaterial({ color: '#1c1917' });
    const postL = new THREE.Mesh(postGeo, postMat);
    postL.position.set(-6, 4, 0);
    const postR = new THREE.Mesh(postGeo, postMat);
    postR.position.set(6, 4, 0);
    const bannerGeo = new THREE.BoxGeometry(13, 1.5, 0.4);
    const bannerMat = new THREE.MeshStandardMaterial({ color: '#FF5F1F', roughness: 0.2 });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 7.5, 0);
    archGroup.add(postL, postR, banner);
    scene.add(archGroup);

    // Hazard 1: Rotating Sweeper Arm (Avian Kinematic AngularVelocity)
    const sweeperPivot = new THREE.Group();
    sweeperPivot.position.set(0, 1.5, 0);
    const armGeo = new THREE.CylinderGeometry(0.45, 0.45, 8.5, 16);
    armGeo.rotateZ(Math.PI / 2);
    const armMat = new THREE.MeshStandardMaterial({ color: '#FF5F1F', roughness: 0.2 });
    const sweeperMesh = new THREE.Mesh(armGeo, armMat);
    sweeperMesh.castShadow = true;
    sweeperPivot.add(sweeperMesh);
    scene.add(sweeperPivot);

    // Hazard 2: Bouncy Bumper Mushrooms (Avian High-Restitution Colliders)
    const bumpers: THREE.Mesh[] = [];
    const bumperPos = [
      { x: -3, z: -13 },
      { x: 3, z: -13 },
      { x: 0, z: -17 },
      { x: -3, z: -21 },
      { x: 3, z: -21 },
    ];
    bumperPos.forEach((bp) => {
      const bGeo = new THREE.CylinderGeometry(1.6, 1.2, 1.4, 24);
      const bMat = new THREE.MeshStandardMaterial({ color: '#0ABAB5', roughness: 0.1 });
      const bm = new THREE.Mesh(bGeo, bMat);
      bm.position.set(bp.x, 1.2, bp.z);
      bm.castShadow = true;
      scene.add(bm);
      bumpers.push(bm);
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
      targetZ: number;
      color: string;
      wobblePhase: number;
    }

    const blobs: BlobActor[] = [];

    const createLumpyBlob = (color: string, startX: number, startZ: number, isAi = false): BlobActor => {
      const group = new THREE.Group();

      // Sphere with high density for organic lumpiness deformation
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
        targetZ: -40,
        color,
        wobblePhase: Math.random() * 10,
      };
    };

    // Player Blob (Tiffany Turquoise)
    const playerBlob = createLumpyBlob('#0ABAB5', 0, 16, false);
    blobs.push(playerBlob);

    // 3 AI Competitors (Stumbling together)
    blobs.push(createLumpyBlob('#FF5F1F', -2.5, 17, true));
    blobs.push(createLumpyBlob('#a855f7', 2.5, 17, true));
    blobs.push(createLumpyBlob('#3b82f6', 0, 19, true));

    // Reset Player to start
    const respawnBlob = (b: BlobActor) => {
      b.x = (Math.random() - 0.5) * 4;
      b.y = 3;
      b.z = 15 + Math.random() * 3;
      b.vx = 0;
      b.vy = 0;
      b.vz = 0;
      b.isDiving = false;
    };

    // 5. Physics & Animation Tick Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Rotate Hazard Sweeper (Avian AngularVelocity Kinematic simulation)
      sweeperPivot.rotation.y += dt * 2.6 * hazardSpeed;

      // Pulse bumper scales slightly
      bumpers.forEach((bm, i) => {
        const s = 1.0 + Math.sin(time * 4 + i) * 0.04;
        bm.scale.set(s, 1.0, s);
      });

      // Update Blobs
      blobs.forEach((blob) => {
        // Player Input
        if (!blob.isAi) {
          const speed = 12.0;
          let moveX = 0;
          let moveZ = 0;

          if (keysRef.current.forward) moveZ -= 1;
          if (keysRef.current.backward) moveZ += 1;
          if (keysRef.current.left) moveX -= 1;
          if (keysRef.current.right) moveX += 1;

          // Normalize vector
          const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
          if (len > 0) {
            moveX /= len;
            moveZ /= len;
            blob.vx += moveX * speed * dt * 4.0;
            blob.vz += moveZ * speed * dt * 4.0;

            // Face travel direction
            const targetRot = Math.atan2(moveX, moveZ);
            blob.mesh.rotation.y = targetRot;
          }

          // Jump
          if (jumpTriggerRef.current && blob.isGrounded) {
            blob.vy = 8.5;
            blob.isGrounded = false;
            jumpTriggerRef.current = false;
          }

          // Dive Impulse (Iconic Stumble Guys Belly Slide)
          if (diveTriggerRef.current) {
            blob.isDiving = true;
            blob.vy = 4.0;
            const forwardZ = Math.cos(blob.mesh.rotation.y);
            const forwardX = Math.sin(blob.mesh.rotation.y);
            blob.vz += forwardZ * 14.0;
            blob.vx += forwardX * 14.0;
            diveTriggerRef.current = false;
          }
        } else {
          // AI Logic: Drive towards finish line z = -40 with jitter
          blob.vz -= dt * (8.0 + Math.random() * 4.0);
          blob.vx += (Math.random() - 0.5) * 2.0;

          // AI random jumps over obstacles
          if (Math.random() < 0.02 && blob.isGrounded) {
            blob.vy = 7.5;
            blob.isGrounded = false;
          }
        }

        // Apply Avian Gravity & Friction
        const gravity = (physicsConfig.gravity / 9.81) * 22.0;
        blob.vy -= gravity * dt;

        blob.vx *= 0.90;
        blob.vz *= 0.90;

        blob.x += blob.vx * dt;
        blob.y += blob.vy * dt;
        blob.z += blob.vz * dt;

        // Ground check on platforms
        let onPlatform = false;
        if (blob.y <= 1.2) {
          // Check bounds
          const onStart = blob.z >= 9 && blob.z <= 20 && Math.abs(blob.x) <= 6;
          const onSweeper = blob.z >= -7 && blob.z <= 7 && Math.abs(blob.x) <= 4;
          const onTrampoline = blob.z >= -21 && blob.z <= -9 && Math.abs(blob.x) <= 5;
          const onFinish = blob.z <= -24 && blob.z >= -40 && Math.abs(blob.x) <= 7;

          if (onStart || onSweeper || onTrampoline || onFinish) {
            blob.y = 1.2;
            blob.vy = 0;
            blob.isGrounded = true;
            blob.isDiving = false;
            onPlatform = true;
          }
        }

        if (!onPlatform && blob.y < 1.2) {
          blob.isGrounded = false;
        }

        // Sweeper Collision Check (Near sweeper center)
        if (blob.z >= -5 && blob.z <= 5 && Math.abs(blob.x) <= 4.5 && blob.y <= 2.5) {
          const armRot = sweeperPivot.rotation.y;
          const armDir = new THREE.Vector3(Math.cos(armRot), 0, -Math.sin(armRot));
          const toBlob = new THREE.Vector3(blob.x, 0, blob.z);
          const distToSweeper = toBlob.distanceTo(armDir.clone().multiplyScalar(toBlob.dot(armDir)));

          if (distToSweeper < 1.2) {
            // WHAM! Sweeper sweeps blob sideways
            blob.vx += Math.cos(armRot + Math.PI / 2) * 18.0;
            blob.vz += -Math.sin(armRot + Math.PI / 2) * 18.0;
            blob.vy = 6.0;
            blob.isDiving = true;
          }
        }

        // Bumper Collisions (Avian Restitution Bouncers)
        bumpers.forEach((bm) => {
          const dx = blob.x - bm.position.x;
          const dz = blob.z - bm.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 2.2 && blob.y <= 2.2) {
            const nx = dx / (dist || 1);
            const nz = dz / (dist || 1);
            blob.vx = nx * 22.0 * physicsConfig.restitution;
            blob.vz = nz * 22.0 * physicsConfig.restitution;
            blob.vy = 12.0; // Mega trampoline launch
          }
        });

        // Void Fall Respawn
        if (blob.y < -12) {
          respawnBlob(blob);
          if (!blob.isAi) {
            setQualifyStatus('racing');
          }
        }

        // Finish Line Check
        if (blob.z <= -36 && blob.y >= 1.0) {
          if (!blob.isAi && qualifyStatus !== 'qualified') {
            setQualifyStatus('qualified');
          }
        }

        // 6. Real-Time "Lumpy 3D Blob" Mesh Vertex Deformation!
        // Deform vertices with harmonic sine waves to give the squishy, wobbly jelly feel
        const posAttr = blob.bodyMesh.geometry.attributes.position;
        const posArr = posAttr.array as Float32Array;
        const base = blob.baseGeoPositions;
        const wobbleSpeed = 8.0;
        const wobbleAmp = 0.12;

        for (let i = 0; i < base.length; i += 3) {
          const bx = base[i];
          const by = base[i + 1];
          const bz = base[i + 2];

          // Lumpy harmonic wobble based on velocity and time
          const lump = Math.sin(time * wobbleSpeed + by * 4.0 + blob.wobblePhase) *
                       Math.cos(bx * 3.0 + time * 6.0) * wobbleAmp;

          // Squish on landing or dive
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

      // Smooth Camera tracking behind player blob
      const targetCamX = playerBlob.x * 0.4;
      const targetCamY = playerBlob.y + 11.0;
      const targetCamZ = playerBlob.z + 18.0;
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.lookAt(playerBlob.x, playerBlob.y + 1.2, playerBlob.z - 4.0);

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
        </div>

        {/* Qualification / Match Status Pill */}
        <div className="flex items-center space-x-2">
          {qualifyStatus === 'qualified' ? (
            <span className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-bounce">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>QUALIFIED! Round 1 Cleared</span>
            </span>
          ) : (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              Round 1: Knockout Race
            </span>
          )}

          <button
            type="button"
            onClick={() => setHazardSpeed((prev) => (prev === 1.0 ? 1.6 : prev === 1.6 ? 2.2 : 1.0))}
            className="subtle-depth-interactive flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-stone-700 bg-white/90 border border-stone-200/90 hover:border-stone-400"
            title="Cycle Sweeper Hazard Speed"
          >
            <Zap className="w-3 h-3 text-[#FF5F1F]" />
            <span>Hazard: {hazardSpeed}x</span>
          </button>
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
          <span>Squishy Harmonic Blobs</span>
        </div>
      </div>
    </div>
  );
};
