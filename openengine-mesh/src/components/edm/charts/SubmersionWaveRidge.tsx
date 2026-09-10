import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StudentEdmRecord } from '../../../services/edmStorageService';
import { LieflatColorMode, LIEFLAT_PALETTES } from './lieflatTheme';
import { RotateCcw, Layers } from 'lucide-react';

interface SubmersionWaveRidgeProps {
  students: StudentEdmRecord[];
  colorMode: LieflatColorMode;
  waterlineElevation: number; // in sigma e.g. 0.0
  height?: number;
  onSelectStudent?: (studentId: string) => void;
}

export const SubmersionWaveRidge: React.FC<SubmersionWaveRidgeProps> = ({
  students,
  colorMode,
  waterlineElevation,
  height = 360,
  onSelectStudent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const palette = LIEFLAT_PALETTES[colorMode] || LIEFLAT_PALETTES.tiffany;

  const [hoveredInfo, setHoveredInfo] = useState<{
    cohortLabel: string;
    studentName: string;
    elevation: number;
    submerged: boolean;
  } | null>(null);

  const [isWireframe, setIsWireframe] = useState(false);
  const resetCameraRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 600;
    const canvasHeight = height;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.background);
    scene.fog = new THREE.FogExp2(new THREE.Color(palette.background).getHex(), 0.012);

    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, -65, 55);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Build Wave Ridge Geometry ("Fifty Cohorts, One Wave")
    // Dimension X: Time sequence (12 weeks)
    // Dimension Y: Cohorts / Students (up to 24 parallel series)
    const cohortSample = students.slice(0, 24);
    const numCohorts = Math.max(cohortSample.length, 8);
    const numSteps = 24; // Timeline slices

    const gridWidth = 70;
    const gridDepth = 60;
    const geom = new THREE.PlaneGeometry(gridWidth, gridDepth, numSteps - 1, numCohorts - 1);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Normalize row index [0, numCohorts - 1]
      const rowNorm = (z + gridDepth / 2) / gridDepth;
      const cohortIndex = Math.min(
        Math.floor(rowNorm * numCohorts),
        cohortSample.length - 1
      );
      const st = cohortSample[cohortIndex >= 0 ? cohortIndex : 0];

      // Time dimension [0, numSteps - 1]
      const colNorm = (x + gridWidth / 2) / gridWidth;
      const weekIndex = Math.floor(colNorm * 11);
      const weekData = st?.weeklyTimeline[weekIndex] || {
        normAttendance: 0.9,
        normHomework: 0.85,
      };

      // Elevation Z = f(Mastery, Velocity, Slippage)
      const baseMastery = (weekData.normAttendance + weekData.normHomework) / 2;
      const waveOffset =
        Math.sin(colNorm * Math.PI * 4 + rowNorm * Math.PI * 2) * 2.2 +
        Math.cos(colNorm * Math.PI * 2) * 1.5;

      const elevation = (baseMastery - 0.7) * 22 + waveOffset;
      pos.setY(i, elevation);
    }
    geom.computeVertexNormals();

    // 3. Shaders & Material with Color Modes
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: palette.hexPrimary,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: isWireframe,
      side: THREE.DoubleSide,
      flatShading: !isWireframe,
    });
    const ridgeMesh = new THREE.Mesh(geom, ridgeMat);
    scene.add(ridgeMesh);

    // 4. Hairline Wave Ribbons (Lieflat Lupi Editorial Stems)
    const lineGroup = new THREE.Group();
    for (let r = 0; r < numCohorts; r++) {
      const linePts: THREE.Vector3[] = [];
      const zPos = -gridDepth / 2 + (r / (numCohorts - 1)) * gridDepth;
      for (let c = 0; c < numSteps; c++) {
        const xPos = -gridWidth / 2 + (c / (numSteps - 1)) * gridWidth;
        const vertIndex = r * numSteps + c;
        const yVal = pos.getY(vertIndex);
        linePts.push(new THREE.Vector3(xPos, yVal + 0.1, zPos));
      }
      const lineGeom = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineBasicMaterial({
        color: palette.hexAccent,
        transparent: true,
        opacity: 0.65,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      lineGroup.add(line);
    }
    scene.add(lineGroup);

    // 5. Translucent Risk Waterplane (Z = waterlineElevation)
    const waterGeom = new THREE.PlaneGeometry(gridWidth + 15, gridDepth + 15);
    waterGeom.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({
      color: palette.waterlineHex,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const waterPlane = new THREE.Mesh(waterGeom, waterMat);
    waterPlane.position.y = waterlineElevation * 5; // Scale with slider
    scene.add(waterPlane);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(palette.hexSecondary, 0.8);
    backLight.position.set(-30, -20, -30);
    scene.add(backLight);

    // 7. Mouse Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = -0.4;
    let rotY = 0;
    let zoomDist = 75;

    resetCameraRef.current = () => {
      rotX = -0.4;
      rotY = 0;
      zoomDist = 75;
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        rotY += deltaX * 0.007;
        rotX = Math.max(-1.4, Math.min(0.2, rotX + deltaY * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }

      // Raycaster for hover telemetry
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(ridgeMesh);

      if (intersects.length > 0 && intersects[0].point) {
        const pt = intersects[0].point;
        const zNorm = (pt.z + gridDepth / 2) / gridDepth;
        const cIdx = Math.min(Math.max(0, Math.floor(zNorm * cohortSample.length)), cohortSample.length - 1);
        const st = cohortSample[cIdx];
        if (st) {
          const elev = Number(pt.y.toFixed(2));
          setHoveredInfo({
            cohortLabel: `Cohort Wave #${cIdx + 1} (${st.cohort})`,
            studentName: st.pseudonym,
            elevation: elev,
            submerged: elev < waterlineElevation * 5,
          });
        }
      } else {
        setHoveredInfo(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(ridgeMesh);
      if (intersects.length > 0 && intersects[0].point) {
        const pt = intersects[0].point;
        const zNorm = (pt.z + gridDepth / 2) / gridDepth;
        const cIdx = Math.min(Math.max(0, Math.floor(zNorm * cohortSample.length)), cohortSample.length - 1);
        const st = cohortSample[cIdx];
        if (st) {
          onSelectStudent?.(st.id);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomDist = Math.max(30, Math.min(130, zoomDist + e.deltaY * 0.05));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      camera.aspect = newW / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, canvasHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Camera position from spherical coords
      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * zoomDist;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * zoomDist;
      camera.position.y = -Math.sin(rotX) * zoomDist;
      camera.lookAt(0, 0, 0);

      // Soft water ripple
      waterPlane.position.y = waterlineElevation * 5 + Math.sin(Date.now() * 0.002) * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geom.dispose();
      ridgeMat.dispose();
      waterGeom.dispose();
      waterMat.dispose();
    };
  }, [students, colorMode, waterlineElevation, isWireframe, height]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-stone-800 shadow-2xl select-none"
      style={{ height, backgroundColor: palette.background }}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay: Title & Lupi Badge */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center space-x-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-stone-200 border border-stone-700/60 backdrop-blur-md">
          Lieflat Lupi Editorial · Fifty Cohorts One Wave
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
          style={{ backgroundColor: palette.surface, color: palette.accent }}
        >
          {palette.name} Palette
        </span>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/60 border border-stone-700/60 backdrop-blur-md p-1 rounded-xl text-stone-300 text-xs">
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isWireframe ? 'bg-teal-600 text-white' : 'hover:bg-stone-800'
          }`}
          title="Toggle Wireframe Mesh"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => resetCameraRef.current?.()}
          className="p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hover Telemetry Card */}
      {hoveredInfo && (
        <div className="absolute bottom-3 left-3 bg-black/85 border border-stone-700/80 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs space-y-1 font-mono pointer-events-none animate-in fade-in duration-100">
          <div className="text-[10px] text-stone-400 uppercase">{hoveredInfo.cohortLabel}</div>
          <div className="font-bold text-white flex items-center space-x-2">
            <span>{hoveredInfo.studentName}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                hoveredInfo.submerged
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {hoveredInfo.submerged ? 'Submerged Deficit' : 'Elevated Mastery'}
            </span>
          </div>
          <div className="text-[11px] text-stone-300 flex items-center space-x-3 pt-0.5">
            <span>Elevation: {hoveredInfo.elevation > 0 ? '+' : ''}{hoveredInfo.elevation}σ</span>
            <span>Waterline: {(waterlineElevation * 5).toFixed(1)}σ</span>
          </div>
        </div>
      )}

      {/* Bottom Right Hint */}
      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-stone-400 bg-black/60 px-2.5 py-1 rounded-lg border border-stone-800 pointer-events-none">
        Click + Drag to Orbit · Scroll to Zoom
      </div>
    </div>
  );
};
