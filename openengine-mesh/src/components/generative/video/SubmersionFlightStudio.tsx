import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Compass, Play, Pause, RotateCcw, Video, Waves, Eye } from 'lucide-react';
import { CameraFlightType } from '../../../services/hyperframeVideoService';

interface SubmersionFlightStudioProps {
  currentFlight: CameraFlightType;
  onSelectFlight: (flight: CameraFlightType) => void;
  motionScale: number;
}

export const SubmersionFlightStudio: React.FC<SubmersionFlightStudioProps> = ({
  currentFlight,
  onSelectFlight,
  motionScale,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraFov, setCameraFov] = useState(35);
  const [rollAngle, setRollAngle] = useState(0);
  const [splineProgress, setSplineProgress] = useState(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const droneMarkerRef = useRef<THREE.Mesh | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || 600;
    const height = 340;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040810);
    scene.fog = new THREE.FogExp2(0x040810, 0.035);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(cameraFov, width / height, 0.1, 100);
    camera.position.set(0, 8, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambient = new THREE.AmbientLight(0x0d9488, 0.8);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x14b8a6, 2, 30);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // 5. Petri Submersion Waterline Grid
    const gridHelper = new THREE.GridHelper(16, 24, 0x14b8a6, 0x0f766e);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Waterline breach ring
    const ringGeo = new THREE.RingGeometry(3.8, 4.0, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // 6. Dual-cone Hourglass core geometry
    const coneTopGeo = new THREE.ConeGeometry(2.5, 4, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.25 });
    const coneTop = new THREE.Mesh(coneTopGeo, coneMat);
    coneTop.position.y = 2;
    scene.add(coneTop);

    const coneBottomGeo = new THREE.ConeGeometry(2.5, 4, 24, 1, true);
    const coneBottom = new THREE.Mesh(coneBottomGeo, coneMat);
    coneBottom.position.y = -2;
    coneBottom.rotation.x = Math.PI;
    scene.add(coneBottom);

    // 7. Curve points based on currentFlight
    let points: THREE.Vector3[] = [];
    if (currentFlight === 'orbital-descent') {
      points = [
        new THREE.Vector3(6, 6, 6),
        new THREE.Vector3(0, 3, 7),
        new THREE.Vector3(-6, 0, 4),
        new THREE.Vector3(-3, -2, -5),
        new THREE.Vector3(4, -4, -3),
        new THREE.Vector3(2, -5, 3),
      ];
    } else if (currentFlight === 'waterline-breach') {
      points = [
        new THREE.Vector3(0, 8, 12),
        new THREE.Vector3(0, 4, 6),
        new THREE.Vector3(0, 0.2, 2),
        new THREE.Vector3(0, -1.5, -1),
        new THREE.Vector3(0, -4, -6),
      ];
    } else if (currentFlight === 'hourglass-zoom') {
      points = [
        new THREE.Vector3(0, 5, 0.5),
        new THREE.Vector3(0.5, 2.5, 0.2),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.5, -2.5, 0.2),
        new THREE.Vector3(0, -5, 0.5),
      ];
    } else {
      // Archimedean ascent
      points = [
        new THREE.Vector3(1, -5, 1),
        new THREE.Vector3(-3, -3, 2),
        new THREE.Vector3(4, -0.5, 0),
        new THREE.Vector3(-4, 2.5, -2),
        new THREE.Vector3(0, 6, 4),
      ];
    }

    const curve = new THREE.CatmullRomCurve3(points);
    curveRef.current = curve;

    // Curve Line Object
    const curvePoints = curve.getPoints(100);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const curveLine = new THREE.Line(curveGeo, curveMat);
    scene.add(curveLine);

    // 8. Drone / Camera target indicator marker
    const droneGeo = new THREE.ConeGeometry(0.35, 0.8, 8);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777 });
    const drone = new THREE.Mesh(droneGeo, droneMat);
    scene.add(drone);
    droneMarkerRef.current = drone;

    // 9. Animation loop
    let progress = 0;
    const speed = (0.002 * (motionScale / 5));

    const animate = () => {
      if (isPlaying && curveRef.current && droneMarkerRef.current) {
        progress = (progress + speed) % 1;
        setSplineProgress(progress);

        const point = curveRef.current.getPointAt(progress);
        const tangent = curveRef.current.getTangentAt(progress);

        droneMarkerRef.current.position.copy(point);
        droneMarkerRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

        // Gentle camera rotation for overview
        camera.position.x = 12 * Math.sin(Date.now() * 0.0003);
        camera.position.z = 12 * Math.cos(Date.now() * 0.0003);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      cameraRef.current.aspect = newWidth / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      renderer.dispose();
      mountRef.current?.replaceChildren();
    };
  }, [currentFlight, motionScale, isPlaying, cameraFov]);

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Petri Submersion 3D Camera Trajectory Studio
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Vector Physics
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive 3D mathematical spline modeling for sub-aquatic camera dives, breaches, and hourglass zooms.
            </p>
          </div>
        </div>

        {/* Playback & Reset Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-slate-200 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-teal-400" />}
            {isPlaying ? 'Pause Flight' : 'Resume Flight'}
          </button>
          <button
            onClick={() => setSplineProgress(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Spline Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Flight Mode Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[
          { id: 'orbital-descent', name: 'Orbital Descent', icon: Compass, desc: '360° helical dive under waterline' },
          { id: 'waterline-breach', name: 'Waterline Breach', icon: Waves, desc: 'High-speed surface plunge' },
          { id: 'hourglass-zoom', name: 'Hourglass Core', icon: Camera, desc: 'Through dual-cone convergence' },
          { id: 'archimedean-ascent', name: 'Spiral Ascent', icon: Video, desc: 'Centrifugal vortex emergence' },
        ].map(flight => {
          const Icon = flight.icon;
          const isSelected = currentFlight === flight.id;
          return (
            <button
              key={flight.id}
              onClick={() => onSelectFlight(flight.id as CameraFlightType)}
              className={`text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-950/30'
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-300' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {flight.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{flight.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Three.js 3D Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner">
        <div ref={mountRef} className="w-full h-[340px]" />

        {/* Telemetry Overlays */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-teal-300 flex items-center gap-3 shadow-md">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            SPLINE POS: {(splineProgress * 100).toFixed(1)}%
          </span>
          <span className="text-slate-500">|</span>
          <span>FOV: {cameraFov}mm</span>
          <span className="text-slate-500">|</span>
          <span>ROLL: {rollAngle}°</span>
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>SUBMERSION WATERLINE GRID (Y=0.0)</span>
        </div>
      </div>

      {/* Lens Optics & Focal Controls */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span>Virtual Cinema Lens Focal Length (FOV)</span>
            <span className="font-mono text-teal-400">{cameraFov}mm</span>
          </div>
          <input
            type="range"
            min={18}
            max={85}
            value={cameraFov}
            onChange={e => setCameraFov(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>18mm Ultra-Wide</span>
            <span>35mm Anamorphic</span>
            <span>85mm Portrait Tele</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span>Dutch Roll & Banking Horizon</span>
            <span className="font-mono text-teal-400">{rollAngle}°</span>
          </div>
          <input
            type="range"
            min={-45}
            max={45}
            value={rollAngle}
            onChange={e => setRollAngle(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>-45° Counter-Clockwise</span>
            <span>0° Level</span>
            <span>+45° Clockwise</span>
          </div>
        </div>
      </div>
    </div>
  );
};
