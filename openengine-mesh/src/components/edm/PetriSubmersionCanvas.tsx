import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  StudentEdmRecord,
  SubmersionManifest,
  SubmersionNode,
  generateStudentSubmersionManifest,
  generateCohortSubmersionManifest,
} from '../../services/edmStorageService';
import {
  Sparkles,
  Maximize2,
  RotateCcw,
  Eye,
  Layers,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface PetriSubmersionCanvasProps {
  manifest?: SubmersionManifest;
  student?: StudentEdmRecord;
  cohort?: StudentEdmRecord[];
  initialMode?: 'individual_latent' | 'cohort_velocity_field';
  onSelectStudent?: (studentId: string) => void;
  height?: number;
  className?: string;
  showControls?: boolean;
}

export const PetriSubmersionCanvas: React.FC<PetriSubmersionCanvasProps> = ({
  manifest: customManifest,
  student,
  cohort,
  initialMode = 'individual_latent',
  onSelectStudent,
  height = 360,
  className = '',
  showControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeMode, setActiveMode] = useState<'individual_latent' | 'cohort_velocity_field'>(
    initialMode
  );
  const [wireframe, setWireframe] = useState(false);
  const [showWaterline, setShowWaterline] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<SubmersionNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SubmersionNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resetCameraFnRef = useRef<() => void>(() => {});

  // Compute active manifest
  const manifest = useMemo<SubmersionManifest>(() => {
    if (customManifest) return customManifest;
    if (activeMode === 'cohort_velocity_field' && cohort && cohort.length > 0) {
      return generateCohortSubmersionManifest(cohort);
    }
    if (student) {
      return generateStudentSubmersionManifest(student);
    }
    if (cohort && cohort.length > 0) {
      return generateCohortSubmersionManifest(cohort);
    }
    // Fallback dummy manifest
    return {
      id: 'submersion-empty',
      title: 'Petri Submersion Manifold',
      academicTerm: 'AY2026 Sem 1',
      mode: 'individual_latent',
      hyperplaneElevation: 0,
      nodes: [],
      summaryStats: {
        totalEntities: 0,
        submergedCount: 0,
        submergedPercentage: 0,
        meanVelocity: 0,
        criticalDeficits: [],
      },
    };
  }, [customManifest, student, cohort, activeMode]);

  // Three.js Render Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 480;
    const canvasHeight = isFullscreen ? window.innerHeight - 80 : height;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Deep oceanic dark slate

    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, -90, 80);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, canvasHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch {
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x14b8a6, 1.2); // Tiffany Teal
    dirLight1.position.set(60, -60, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.8); // Indigo
    dirLight2.position.set(-60, 60, 80);
    scene.add(dirLight2);

    // 4. Manifold Mesh (if manifoldGrid exists)
    let surfaceMesh: THREE.Mesh | null = null;
    if (manifest.manifoldGrid && manifest.manifoldGrid.heights.length > 0) {
      const grid = manifest.manifoldGrid;
      const res = grid.resolution;
      const geo = new THREE.PlaneGeometry(100, 100, res - 1, res - 1);
      const pos = geo.attributes.position;

      // Color attribute for depth/mastery elevation coloring
      const colors = new Float32Array(pos.count * 3);

      for (let i = 0; i < pos.count; i++) {
        const row = Math.floor(i / res);
        const col = i % res;
        const zVal = grid.heights[row]?.[col] ?? 0;
        pos.setZ(i, zVal);

        // Color mapping: Z > 0 (High mastery teal/emerald), Z < 0 (Submerged crimson/rose)
        let r = 0.05, g = 0.58, b = 0.53; // default teal
        if (zVal < 0) {
          // Submerged valley
          const subDepth = Math.min(1, Math.abs(zVal) / 40);
          r = 0.88 * subDepth + 0.1 * (1 - subDepth);
          g = 0.12 * subDepth + 0.5 * (1 - subDepth);
          b = 0.28 * subDepth + 0.4 * (1 - subDepth);
        } else {
          // Mastery peak
          const peak = Math.min(1, zVal / 40);
          r = 0.05 * (1 - peak) + 0.1 * peak;
          g = 0.58 * (1 - peak) + 0.85 * peak;
          b = 0.53 * (1 - peak) + 0.4 * peak;
        }
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhongMaterial({
        vertexColors: true,
        wireframe,
        side: THREE.DoubleSide,
        shininess: 40,
        transparent: true,
        opacity: 0.88,
      });

      surfaceMesh = new THREE.Mesh(geo, mat);
      scene.add(surfaceMesh);
    }

    // 5. Translucent Risk Hyperplane (Submersion Waterline at Z = hyperplaneElevation)
    let waterlineMesh: THREE.Mesh | null = null;
    let waterlineGrid: THREE.GridHelper | null = null;
    if (showWaterline) {
      const planeGeo = new THREE.PlaneGeometry(120, 120);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      waterlineMesh = new THREE.Mesh(planeGeo, planeMat);
      waterlineMesh.position.set(0, 0, manifest.hyperplaneElevation);
      scene.add(waterlineMesh);

      waterlineGrid = new THREE.GridHelper(120, 12, 0x0284c7, 0x1e293b);
      waterlineGrid.rotation.x = Math.PI / 2;
      waterlineGrid.position.set(0, 0, manifest.hyperplaneElevation + 0.1);
      scene.add(waterlineGrid);
    }

    // 6. Interactive 3D Nodes
    const nodeGroup = new THREE.Group();
    const nodeMeshMap = new Map<THREE.Object3D, SubmersionNode>();

    manifest.nodes.forEach((node) => {
      const isCentroid = node.id.includes('centroid');
      const radius = isCentroid ? 3.8 : 2.6;

      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: node.riskLevel === 'red' ? 0xe11d48 : node.riskLevel === 'amber' ? 0xf59e0b : 0x0d9488,
        emissive: node.riskLevel === 'red' ? 0x881337 : node.riskLevel === 'amber' ? 0x78350f : 0x042f2e,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(node.position[0], node.position[1], node.position[2]);
      nodeMeshMap.set(mesh, node);
      nodeGroup.add(mesh);

      // Vertical tether line to the baseline plane
      const tetherGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(node.position[0], node.position[1], -50),
        new THREE.Vector3(node.position[0], node.position[1], node.position[2]),
      ]);
      const tetherMat = new THREE.LineDashedMaterial({
        color: node.isSubmerged ? 0xf43f5e : 0x38bdf8,
        dashSize: 2,
        gapSize: 2,
        transparent: true,
        opacity: 0.4,
      });
      const tether = new THREE.Line(tetherGeo, tetherMat);
      tether.computeLineDistances();
      nodeGroup.add(tether);
    });

    scene.add(nodeGroup);

    // 7. Trajectory Streamlines with Particle System
    const particlePositions: number[] = [];
    const particleColors: number[] = [];

    manifest.trajectoryStreamlines?.forEach((stream) => {
      if (stream.points.length < 2) return;
      const pts = stream.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(pts);

      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.7, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(stream.color),
        transparent: true,
        opacity: 0.75,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tubeMesh);

      // Distribute animated flow particles along the curve
      for (let p = 0; p < 16; p++) {
        const u = Math.random();
        const pt = curve.getPoint(u);
        particlePositions.push(pt.x, pt.y, pt.z);
        const col = new THREE.Color(stream.color);
        particleColors.push(col.r, col.g, col.b);
      }
    });

    let particlesMesh: THREE.Points | null = null;
    if (particlePositions.length > 0) {
      const partGeo = new THREE.BufferGeometry();
      partGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
      partGeo.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));

      const partMat = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      });

      particlesMesh = new THREE.Points(partGeo, partMat);
      scene.add(particlesMesh);
    }

    // 8. Mouse Orbital Navigation Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 130, theta: -Math.PI / 2, phi: Math.PI / 3.2 };

    const updateCameraFromSpherical = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.y = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.z = spherical.radius * Math.cos(spherical.phi);
      camera.lookAt(0, 0, 0);
    };
    updateCameraFromSpherical();

    resetCameraFnRef.current = () => {
      spherical = { radius: 130, theta: -Math.PI / 2, phi: Math.PI / 3.2 };
      updateCameraFromSpherical();
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycasting for node hover
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const found = nodeMeshMap.get(intersects[0].object);
        if (found) {
          setHoveredNode(found);
          canvas.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
      }

      if (!isDragging) return;

      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));
      updateCameraFromSpherical();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(50, Math.min(300, spherical.radius + e.deltaY * 0.15));
      updateCameraFromSpherical();
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const found = nodeMeshMap.get(intersects[0].object);
        if (found) {
          setSelectedNode(found);
          if (found.id.startsWith('cohort-node-') || found.id.includes('centroid')) {
            const rawId = found.id.replace('cohort-node-', '').replace('node-', '').replace('-centroid', '');
            onSelectStudent?.(rawId);
          }
        }
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);

    // 9. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle atmospheric rotation
      scene.rotation.z = Math.sin(elapsedTime * 0.15) * 0.04;

      // Particle streamline pulsing
      if (particlesMesh) {
        const posAttr = particlesMesh.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < posAttr.count; i++) {
          let z = posAttr.getZ(i);
          z += Math.sin(elapsedTime * 3 + i) * 0.08;
          posAttr.setZ(i, z);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [manifest, wireframe, showWaterline, isFullscreen, height, onSelectStudent]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col select-none ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl ring-2 ring-teal-500/50' : className
      }`}
      style={{ height: isFullscreen ? 'auto' : height }}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full flex-1 block" />

      {/* Top Overlay HUD Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-bold">{manifest.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/80">
              {manifest.academicTerm}
            </span>
          </div>

          {/* Submerged Status Badge */}
          {manifest.summaryStats && (
            <div
              className={`bg-slate-900/85 backdrop-blur-md border rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-mono ${
                manifest.summaryStats.submergedCount > 0
                  ? 'border-rose-800/80 text-rose-300'
                  : 'border-emerald-800/80 text-emerald-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {manifest.summaryStats.submergedCount}/{manifest.summaryStats.totalEntities} Submerged (
                {manifest.summaryStats.submergedPercentage}%)
              </span>
            </div>
          )}
        </div>

        {/* Viewport Action Controls */}
        {showControls && (
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-1">
            {/* Mode Toggle (Individual vs Cohort) */}
            {cohort && cohort.length > 0 && (
              <button
                onClick={() =>
                  setActiveMode((m) =>
                    m === 'individual_latent' ? 'cohort_velocity_field' : 'individual_latent'
                  )
                }
                className="px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Switch visualization mode"
              >
                {activeMode === 'individual_latent' ? 'Cohort Field' : 'Latent Manifold'}
              </button>
            )}

            {/* Wireframe toggle */}
            <button
              onClick={() => setWireframe((w) => !w)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                wireframe ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle wireframe topology"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Waterline toggle */}
            <button
              onClick={() => setShowWaterline((w) => !w)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showWaterline ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Quantum Risk Hyperplane"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Reset Camera button */}
            <button
              onClick={() => resetCameraFnRef.current()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Reset 3D Camera Angle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Toggle Fullscreen Submersion"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Hover / Selected Node Floating Inspector */}
      {(hoveredNode || selectedNode) && (
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 max-w-sm text-xs text-slate-200 shadow-2xl z-20 pointer-events-auto">
          {(() => {
            const target = hoveredNode || selectedNode;
            if (!target) return null;
            return (
              <div className="space-y-1.5 font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-teal-300 truncate">{target.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      target.riskLevel === 'red'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : target.riskLevel === 'amber'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {target.riskLevel}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Elevation: Z={target.position[2].toFixed(1)}</span>
                  <span>Score: {target.scorePct}%</span>
                </div>

                {target.details?.submergedDepth !== undefined && target.details.submergedDepth > 0 && (
                  <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Submerged {target.details.submergedDepth.toFixed(1)} units below waterline
                  </div>
                )}

                {target.details?.rationale && (
                  <p className="text-[10px] text-slate-300 font-sans line-clamp-2 italic pt-1 border-t border-slate-800">
                    "{target.details.rationale}"
                  </p>
                )}

                {target.id.includes('cohort-node-') && onSelectStudent && (
                  <button
                    onClick={() => {
                      const sId = target.id.replace('cohort-node-', '');
                      onSelectStudent(sId);
                    }}
                    className="w-full mt-1 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Submerse into Student Record</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Bottom Right Orbital Instructions */}
      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 pointer-events-none flex items-center gap-2">
        <span>Drag to Orbit</span>
        <span>•</span>
        <span>Scroll to Zoom</span>
        <span>•</span>
        <span>Click Node to Inspect</span>
      </div>
    </div>
  );
};
