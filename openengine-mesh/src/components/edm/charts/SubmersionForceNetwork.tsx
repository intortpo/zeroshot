import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StudentEdmRecord, CANONICAL_LATENT_SKILLS } from '../../../services/edmStorageService';
import { LieflatColorMode, LIEFLAT_PALETTES } from './lieflatTheme';
import { RotateCcw } from 'lucide-react';

interface SubmersionForceNetworkProps {
  students: StudentEdmRecord[];
  colorMode: LieflatColorMode;
  waterlineElevation: number;
  height?: number;
  onSelectStudent?: (studentId: string) => void;
}

interface GraphNode {
  id: string;
  name: string;
  type: 'student' | 'skill';
  elevation: number;
  isSubmerged: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mesh?: THREE.Mesh;
}

interface GraphEdge {
  source: GraphNode;
  target: GraphNode;
  weight: number;
  line?: THREE.Line;
}

export const SubmersionForceNetwork: React.FC<SubmersionForceNetworkProps> = ({
  students,
  colorMode,
  waterlineElevation,
  height = 360,
  onSelectStudent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const palette = LIEFLAT_PALETTES[colorMode] || LIEFLAT_PALETTES.tiffany;

  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{
    name: string;
    type: string;
    elevation: string;
    status: string;
  } | null>(null);

  const resetCameraRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 600;
    const canvasHeight = height;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(palette.background);

    const camera = new THREE.PerspectiveCamera(50, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, -60, 60);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(width, canvasHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (err) {
      console.warn('SubmersionForceNetwork WebGL init failed:', err);
      return;
    }

    // 2. Build Force Graph Nodes & Edges
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Add Skill Nodes (Hubs in center)
    CANONICAL_LATENT_SKILLS.forEach((skill, i) => {
      const angle = (i / CANONICAL_LATENT_SKILLS.length) * Math.PI * 2;
      const radius = 18;
      const node: GraphNode = {
        id: `skill-${skill.id}`,
        name: skill.name,
        type: 'skill',
        elevation: 8,
        isSubmerged: false,
        x: Math.cos(angle) * radius,
        y: 8,
        z: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        vz: 0,
      };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    // Add Student Nodes
    students.slice(0, 18).forEach((st, i) => {
      const skillVals = Object.values(st.latentMastery);
      const avg = skillVals.length > 0 ? skillVals.reduce((a, b) => a + b, 0) / skillVals.length : 0.5;
      const elev = (avg - 0.5) * 28 - waterlineElevation * 8;
      const isSub = elev < 0;

      const angle = (i / 18) * Math.PI * 2 + 0.3;
      const radius = 30 + Math.random() * 8;
      const node: GraphNode = {
        id: st.id,
        name: st.pseudonym,
        type: 'student',
        elevation: elev,
        isSubmerged: isSub,
        x: Math.cos(angle) * radius,
        y: elev,
        z: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        vz: 0,
      };
      nodes.push(node);
      nodeMap.set(node.id, node);

      // Connect student to top 2 mastered skills
      CANONICAL_LATENT_SKILLS.slice(0, 2).forEach((skill) => {
        const targetNode = nodeMap.get(`skill-${skill.id}`);
        if (targetNode) {
          edges.push({
            source: node,
            target: targetNode,
            weight: st.latentMastery[skill.id] || 0.7,
          });
        }
      });
    });

    // 3. Create Three.js Meshes for Nodes
    const nodeGroup = new THREE.Group();
    const edgeGroup = new THREE.Group();

    const skillGeo = new THREE.SphereGeometry(2.4, 16, 16);
    const studentGeo = new THREE.SphereGeometry(1.5, 12, 12);

    nodes.forEach((node) => {
      const isSkill = node.type === 'skill';
      const col = isSkill
        ? palette.hexAccent
        : node.isSubmerged
        ? 0xf43f5e
        : palette.hexPrimary;

      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.3,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(isSkill ? skillGeo : studentGeo, mat);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = { node };
      node.mesh = mesh;
      nodeGroup.add(mesh);
    });
    scene.add(nodeGroup);

    // Create Lines for Edges
    edges.forEach((edge) => {
      const pts = [
        new THREE.Vector3(edge.source.x, edge.source.y, edge.source.z),
        new THREE.Vector3(edge.target.x, edge.target.y, edge.target.z),
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: palette.hexSecondary,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(geom, mat);
      edge.line = line;
      edgeGroup.add(line);
    });
    scene.add(edgeGroup);

    // 4. Risk Waterplane
    const waterGeom = new THREE.PlaneGeometry(90, 90);
    waterGeom.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshBasicMaterial({
      color: palette.waterlineHex,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const waterPlane = new THREE.Mesh(waterGeom, waterMat);
    waterPlane.position.y = 0;
    scene.add(waterPlane);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 50, 30);
    scene.add(dirLight);

    // 6. Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = -0.4;
    let rotY = 0;
    let zoomDist = 70;

    resetCameraRef.current = () => {
      rotX = -0.4;
      rotY = 0;
      zoomDist = 70;
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

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const targetMesh = intersects[0].object;
        const node = targetMesh.userData?.node as GraphNode | undefined;
        if (node) {
          setHoveredNodeInfo({
            name: node.name,
            type: node.type === 'skill' ? 'Competency Hub' : 'Student Learner',
            elevation: `${node.elevation > 0 ? '+' : ''}${node.elevation.toFixed(1)}σ`,
            status: node.isSubmerged ? 'Submerged Risk' : 'Elevated Mastery',
          });
        }
      } else {
        setHoveredNodeInfo(null);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomDist = Math.max(30, Math.min(120, zoomDist + e.deltaY * 0.05));
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeGroup.children);

      if (intersects.length > 0) {
        const targetMesh = intersects[0].object;
        const node = targetMesh.userData?.node as GraphNode | undefined;
        if (node && node.type === 'student') {
          onSelectStudent?.(node.id);
        }
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      camera.aspect = newW / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, canvasHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation & Physics Tick
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Force physics relaxation (soft harmonic pull)
      edges.forEach((edge) => {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const dz = edge.target.z - edge.source.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const force = (dist - 15) * 0.0005;

        edge.source.vx += dx * force;
        edge.source.vy += dy * force;
        edge.source.vz += dz * force;

        edge.target.vx -= dx * force;
        edge.target.vy -= dy * force;
        edge.target.vz -= dz * force;
      });

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;
        n.vx *= 0.92;
        n.vy *= 0.92;
        n.vz *= 0.92;
        if (n.mesh) {
          n.mesh.position.set(n.x, n.y, n.z);
        }
      });

      // Update edge geometries
      edges.forEach((edge) => {
        if (edge.line) {
          const positions = edge.line.geometry.attributes.position as THREE.BufferAttribute;
          if (positions) {
            positions.setXYZ(0, edge.source.x, edge.source.y, edge.source.z);
            positions.setXYZ(1, edge.target.x, edge.target.y, edge.target.z);
            positions.needsUpdate = true;
          }
        }
      });

      // Soft rotation of whole network
      nodeGroup.rotation.y += 0.001;
      edgeGroup.rotation.y = nodeGroup.rotation.y;

      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * zoomDist;
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * zoomDist;
      camera.position.y = -Math.sin(rotX) * zoomDist;
      camera.lookAt(0, 0, 0);

      try {
        if (renderer) {
          renderer.render(scene, camera);
        }
      } catch (err) {
        // Safe WebGL context recovery guard
      }
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
      try {
        renderer?.dispose();
      } catch {}
    };
  }, [students, colorMode, waterlineElevation, height]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-stone-800 shadow-2xl select-none"
      style={{ height, backgroundColor: palette.background }}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Header Badge */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center space-x-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-stone-200 border border-stone-700/60 backdrop-blur-md">
          Lieflat Interactive · 3D Force Graph DAG
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
          style={{ backgroundColor: palette.surface, color: palette.accent }}
        >
          {palette.name} Palette
        </span>
      </div>

      <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/60 border border-stone-700/60 backdrop-blur-md p-1 rounded-xl text-stone-300 text-xs">
        <button
          onClick={() => resetCameraRef.current?.()}
          className="p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {hoveredNodeInfo && (
        <div className="absolute bottom-3 left-3 bg-black/85 border border-stone-700/80 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs space-y-1 font-mono pointer-events-none animate-in fade-in duration-100">
          <div className="text-[10px] text-stone-400 uppercase">{hoveredNodeInfo.type}</div>
          <div className="font-bold text-white flex items-center space-x-2">
            <span>{hoveredNodeInfo.name}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-stone-800 text-stone-300">
              {hoveredNodeInfo.status}
            </span>
          </div>
          <div className="text-[11px] text-teal-400">
            Elevation: {hoveredNodeInfo.elevation}
          </div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-stone-400 bg-black/60 px-2.5 py-1 rounded-lg border border-stone-800 pointer-events-none">
        Click + Drag to Orbit · Spring Physics Active
      </div>
    </div>
  );
};
