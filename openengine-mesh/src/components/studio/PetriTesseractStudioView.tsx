import React, { useState, useEffect, useRef } from 'react';
import { Workspace, UserProfile, PetriItem } from '../../types';
import { pyspurUserService } from '../../services/pyspurUserService';

interface PetriTesseractStudioViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  items?: PetriItem[];
  onNavigateToChat?: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

interface NodeInfo {
  id: string;
  title: string;
  type: string;
  auth: string;
  desc: string;
  stage: string;
}

export const PetriTesseractStudioView: React.FC<PetriTesseractStudioViewProps> = ({
  activeUser,
  onUpdateUser,
}) => {
  // ----------------------------------------------------
  // 1. Operator & Work Impersonation Form State
  // ----------------------------------------------------
  const [operatorName, setOperatorName] = useState(activeUser?.name || 'Hideo');
  const [operatorEmail, setOperatorEmail] = useState(activeUser?.email || 'intortpo@gmail.com');
  const [impersonateTarget, setImpersonateTarget] = useState(activeUser?.impersonateUser || 'j.sadol@bbs.ac.th');
  const [activeTab, setActiveTab] = useState<'studio' | 'tesseract' | 'stats'>('studio');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // ----------------------------------------------------
  // 2. Node Studio DAG Inspector State
  // ----------------------------------------------------
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tesseract');
  const [nodeScale, setNodeScale] = useState<number>(1.0);

  const nodeMap: Record<string, NodeInfo> = {
    dwd: {
      id: 'N-01: DWD INPUT',
      title: 'Google Workspace DWD Ingestion',
      type: 'AUTHENTICATED_DRIVE_READER',
      auth: 'j.sadol@bbs.ac.th (Delegated)',
      desc: 'Ingests academic records and coursework from Google Drive and Classroom under Bangkok Christian College authority.',
      stage: 'STAGE 1: SCOPE',
    },
    intent: {
      id: 'N-02: INTENT',
      title: 'Intent Deconstruction Bar',
      type: 'COGNITIVE_TASK_EXPANDER',
      auth: 'Hideo (intortpo@gmail.com)',
      desc: 'Parses natural language requests into mathematically verifiable execution DAGs and delivery criteria.',
      stage: 'STAGE 2: COMPOSE',
    },
    tesseract: {
      id: 'N-03: TESSERACT',
      title: '4D Hypercube Synthesis Engine',
      type: 'HYPERSPACE_PROJECTION_KERNEL',
      auth: 'Hideo (intortpo@gmail.com)',
      desc: 'Rotates 16 vertices in 4D space across XW, YW, and ZW planes, projecting topological invariants into the node mesh.',
      stage: 'STAGE 3: SYNTHESIZE',
    },
    pyspur: {
      id: 'N-04: PYSPUR',
      title: 'PySpur User Contract Gateway',
      type: 'REST_IDENTITY_MAPPER',
      auth: 'intortpo@gmail.com',
      desc: 'Executes POST /user/ contract binding authenticated IAM identity with PySpur workflow engine.',
      stage: 'STAGE 4: BIND',
    },
    gate: {
      id: 'N-05: GATE S-5',
      title: 'Verification Gate (Stage 5)',
      type: 'CRITICAL_APPROVAL_CHECKPOINT',
      auth: 'SuperAdmin Authority',
      desc: 'Enforces automated test passing, SAIF boundary compliance, and diff sign-off prior to delivery.',
      stage: 'STAGE 5: VERIFY',
    },
    ship: {
      id: 'N-06: SHIP',
      title: 'Stage 7 PR Ship & Delivery',
      type: 'GIT_DELIVERY_EXECUTOR',
      auth: 'foxlight/zero-petri',
      desc: 'Publishes verified commit to canonical main trunk and triggers automated target deployment.',
      stage: 'STAGE 7: RELEASE',
    },
  };

  const activeNode = nodeMap[selectedNodeId] || nodeMap['tesseract'];

  // ----------------------------------------------------
  // 3. 4D Tesseract Canvas Projection
  // ----------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angleXW, setAngleXW] = useState(0.26);
  const [angleYW, setAngleYW] = useState(0.44);
  const [angleZW, setAngleZW] = useState(0.17);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 16 Vertices of unit Tesseract in 4D
    const v4: number[][] = [];
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          for (const w of [-1, 1]) {
            v4.push([x, y, z, w]);
          }
        }
      }
    }

    // 32 Edges
    const e4: [number, number][] = [];
    for (let i = 0; i < v4.length; i++) {
      for (let j = i + 1; j < v4.length; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (v4[i][k] !== v4[j][k]) diff++;
        }
        if (diff === 1) e4.push([i, j]);
      }
    }

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const projected = v4.map((pt) => {
        const [x, y, z, w] = pt;

        // XW plane rotation
        const x1 = x * Math.cos(angleXW) - w * Math.sin(angleXW);
        const w1 = x * Math.sin(angleXW) + w * Math.cos(angleXW);

        // YW plane rotation
        const y1 = y * Math.cos(angleYW) - w1 * Math.sin(angleYW);
        const w2 = y * Math.sin(angleYW) + w1 * Math.cos(angleYW);

        // ZW plane rotation
        const z1 = z * Math.cos(angleZW) - w2 * Math.sin(angleZW);
        const w3 = z * Math.sin(angleZW) + w2 * Math.cos(angleZW);

        const dist4D = 2.4;
        const wScale = 1 / (dist4D - w3);
        const dist3D = 2.5;
        const zScale = 1 / (dist3D - z1 * wScale);

        const scale = 170;
        return [
          cx + x1 * wScale * zScale * scale,
          cy + y1 * wScale * zScale * scale,
          w3,
        ];
      });

      // Draw edges with draft ink
      e4.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgW = (p1[2] + p2[2]) / 2;
        const alpha = Math.min(1, Math.max(0.2, (avgW + 1.2) / 2.4));

        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.strokeStyle = `rgba(26, 29, 26, ${alpha})`;
        ctx.lineWidth = avgW > 0 ? 1.4 : 0.8;
        ctx.stroke();
      });

      // Draw vertices
      projected.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#1A1D1A';
        ctx.fill();
      });
    }

    render();
  }, [angleXW, angleYW, angleZW]);

  // Mouse drag handler on canvas
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };

    setAngleXW((prev) => prev + dx * 0.008);
    setAngleYW((prev) => prev + dy * 0.008);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // ----------------------------------------------------
  // 4. Save Profile Changes & PySpur Sync
  // ----------------------------------------------------
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    const updated: UserProfile = {
      ...activeUser,
      name: operatorName.trim(),
      email: operatorEmail.trim(),
      impersonateUser: impersonateTarget.trim(),
      zitadelSub: operatorEmail.trim(),
      pyspurExternalId: operatorEmail.trim(),
    };

    onUpdateUser?.(updated);
    pyspurUserService.linkZitadelUserToPySpur(updated);

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // ----------------------------------------------------
  // 5. Notes / Scratchpad Inscription State
  // ----------------------------------------------------
  const [notes, setNotes] = useState<Array<{ id: string; time: string; text: string; tag: string }>>([
    {
      id: 'nt-1',
      time: '2026-09-10 · 21:15',
      tag: 'SPEC.80',
      text: 'Port 80 Ingress active under raw Caddy gateway. Direct HTTP 200 OK. Zero Zitadel visible in public address.',
    },
    {
      id: 'nt-2',
      time: '2026-09-10 · 21:11',
      tag: 'SPEC.IAM',
      text: 'Operator Hideo (intortpo@gmail.com) bound with work delegation j.sadol@bbs.ac.th to PySpur user contract.',
    },
    {
      id: 'nt-3',
      time: '2026-09-10 · 20:55',
      tag: 'SPEC.EDM',
      text: 'DINAC Q-matrix response vectors validated for Bangkok Christian College academic evaluation run.',
    },
  ]);
  const [noteInput, setNoteInput] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    const newEntry = {
      id: `nt-${Date.now()}`,
      time: new Date().toISOString().replace('T', ' · ').slice(0, 16),
      tag: 'OBSERVATION',
      text: noteInput.trim(),
    };
    setNotes([newEntry, ...notes]);
    setNoteInput('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F6F3EC] text-[#1A1D1A] p-4 sm:p-8 font-mono select-none">
      
      {/* Master Sheet Container with Architectural Hairline Border */}
      <div className="max-w-6xl w-full mx-auto border border-[#1A1D1A] p-6 sm:p-8 bg-[#F6F3EC] relative shadow-sm space-y-8">
        
        {/* Alignment Crop Marks */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#1A1D1A]" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#1A1D1A]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#1A1D1A]" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#1A1D1A]" />

        {/* Header Datum Line */}
        <div className="border-b border-[#1A1D1A] pb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] tracking-widest uppercase">
            <div className="flex items-center space-x-3">
              <span className="font-bold">PETRI</span>
              <span className="text-[#545B54]">·</span>
              <span>STUDIO &amp; TELEMETRY STATS</span>
            </div>
            <div className="text-[#545B54] text-[10px]">
              136.85.58.244 · PORT 80 OK
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
            <h1 className="text-xl sm:text-2xl font-normal tracking-tight uppercase">
              NODE STUDIO &amp; 4D TESSERACT BENCH
            </h1>
            <div className="flex items-center space-x-2 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`px-2.5 py-0.5 border border-[#1A1D1A] ${
                  activeTab === 'studio' ? 'bg-[#1A1D1A] text-[#F6F3EC] font-bold' : 'hover:bg-[#EFECE4]'
                }`}
              >
                STUDIO DAG
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tesseract')}
                className={`px-2.5 py-0.5 border border-[#1A1D1A] ${
                  activeTab === 'tesseract' ? 'bg-[#1A1D1A] text-[#F6F3EC] font-bold' : 'hover:bg-[#EFECE4]'
                }`}
              >
                4D TESSERACT
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`px-2.5 py-0.5 border border-[#1A1D1A] ${
                  activeTab === 'stats' ? 'bg-[#1A1D1A] text-[#F6F3EC] font-bold' : 'hover:bg-[#EFECE4]'
                }`}
              >
                ALL STATS
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: Telemetry Stats Quad Metric Bar (Always Prominently Visible) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          
          {/* Metric 1: Delivery Rate */}
          <div className="border border-[#1A1D1A] p-3.5 bg-[#FAF7F0] space-y-1">
            <div className="text-[9px] text-[#545B54] uppercase tracking-wider">AUTONOMOUS DELIVERY</div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-bold tracking-tight">94.8%</span>
              <svg viewBox="0 0 36 36" className="w-8 h-8 transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(26,29,26,0.15)" strokeWidth="2.5"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1A1D1A" strokeWidth="2.5" strokeDasharray="83 100"/>
              </svg>
            </div>
            <div className="text-[8px] text-[#545B54]">+2.4% vs BASELINE</div>
          </div>

          {/* Metric 2: Mean Time to Merge */}
          <div className="border border-[#1A1D1A] p-3.5 bg-[#FAF7F0] space-y-1">
            <div className="text-[9px] text-[#545B54] uppercase tracking-wider">MEAN TIME TO MERGE</div>
            <div className="text-2xl font-bold tracking-tight">6.4<span className="text-sm font-normal">m</span></div>
            <div className="text-[8px] text-[#545B54]">σ = 0.8m · STAGES 1 → 7</div>
          </div>

          {/* Metric 3: GPU VRAM / Duty */}
          <div className="border border-[#1A1D1A] p-3.5 bg-[#FAF7F0] space-y-1">
            <div className="text-[9px] text-[#545B54] uppercase tracking-wider">GPU COMPUTE / VRAM</div>
            <div className="text-2xl font-bold tracking-tight">23.4<span className="text-sm font-normal">G</span></div>
            <div className="text-[8px] text-[#545B54]">48GB TOTAL · 78% @ 54°C</div>
          </div>

          {/* Metric 4: Token Efficiency */}
          <div className="border border-[#1A1D1A] p-3.5 bg-[#FAF7F0] space-y-1">
            <div className="text-[9px] text-[#545B54] uppercase tracking-wider">CACHE HIT RATIO</div>
            <div className="text-2xl font-bold tracking-tight">89.4%</div>
            <div className="text-[8px] text-[#545B54]">14.2M TOKENS · 28 RULES</div>
          </div>

        </div>

        {/* SECTION 2: Dynamic View Tab Switch (Studio DAG / Tesseract / All Stats) */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Interactive Node Studio Execution DAG (8 cols) */}
            <div className="lg:col-span-8 border border-[#1A1D1A] p-4 bg-[#FAF7F0] space-y-3">
              <div className="flex justify-between items-center text-[10px] text-[#545B54] border-b border-[#1A1D1A]/20 pb-1.5">
                <span>EXECUTION GRAPH: zero-petri-orchestrator-v8</span>
                <span>CLICK NODE TO INSPECT</span>
              </div>

              {/* Inked Vector DAG SVG */}
              <div className="h-64 border border-dashed border-[#1A1D1A]/30 relative bg-[#F6F3EC] flex items-center justify-center">
                <svg viewBox="0 0 620 220" className="w-full h-full select-none p-2">
                  
                  {/* Connecting Splines */}
                  <path d="M 90,60 C 140,60 140,110 190,110" fill="none" stroke="#1A1D1A" strokeWidth="1.2"/>
                  <path d="M 90,160 C 140,160 140,110 190,110" fill="none" stroke="#1A1D1A" strokeWidth="1.2"/>
                  <path d="M 300,110 C 340,110 340,60 380,60" fill="none" stroke="#1A1D1A" strokeWidth="1.2"/>
                  <path d="M 300,110 C 340,110 340,160 380,160" fill="none" stroke="#1A1D1A" strokeWidth="1.2"/>
                  <path d="M 480,60 C 510,60 510,110 540,110" fill="none" stroke="#1A1D1A" strokeWidth="1.2"/>
                  <path d="M 480,160 C 510,160 510,110 540,110" fill="none" stroke="#1A1D1A" strokeWidth="1.2"/>

                  {/* N1: DWD Ingestion */}
                  <g onClick={() => setSelectedNodeId('dwd')} className="cursor-pointer">
                    <rect x="10" y="40" width="80" height="40" fill={selectedNodeId === 'dwd' ? '#EFECE4' : '#F6F3EC'} stroke="#1A1D1A" strokeWidth="1.2"/>
                    <text x="18" y="56" fontSize="8" fontFamily="Space Mono" fontWeight="bold" fill="#1A1D1A">N-01: DWD</text>
                    <text x="18" y="70" fontSize="7" fontFamily="Space Mono" fill="#545B54">j.sadol@bbs</text>
                  </g>

                  {/* N2: Intent */}
                  <g onClick={() => setSelectedNodeId('intent')} className="cursor-pointer">
                    <rect x="10" y="140" width="80" height="40" fill={selectedNodeId === 'intent' ? '#EFECE4' : '#F6F3EC'} stroke="#1A1D1A" strokeWidth="1.2"/>
                    <text x="18" y="156" fontSize="8" fontFamily="Space Mono" fontWeight="bold" fill="#1A1D1A">N-02: INTENT</text>
                    <text x="18" y="170" fontSize="7" fontFamily="Space Mono" fill="#545B54">CALLSIGN</text>
                  </g>

                  {/* N3: Tesseract (Center) */}
                  <g onClick={() => setSelectedNodeId('tesseract')} className="cursor-pointer">
                    <rect x="190" y="85" width="110" height="50" fill={selectedNodeId === 'tesseract' ? '#EFECE4' : '#F6F3EC'} stroke="#1A1D1A" strokeWidth="2"/>
                    <circle cx="245" cy="110" r="18" fill="none" stroke="rgba(26,29,26,0.2)" strokeDasharray="2,2"/>
                    <text x="202" y="106" fontSize="8" fontFamily="Space Mono" fontWeight="bold" fill="#1A1D1A">N-03: TESSERACT</text>
                    <text x="202" y="122" fontSize="7" fontFamily="Space Mono" fill="#545B54">4D PROJECTION</text>
                  </g>

                  {/* N4: PySpur */}
                  <g onClick={() => setSelectedNodeId('pyspur')} className="cursor-pointer">
                    <rect x="380" y="40" width="100" height="40" fill={selectedNodeId === 'pyspur' ? '#EFECE4' : '#F6F3EC'} stroke="#1A1D1A" strokeWidth="1.2"/>
                    <text x="390" y="56" fontSize="8" fontFamily="Space Mono" fontWeight="bold" fill="#1A1D1A">N-04: PYSPUR</text>
                    <text x="390" y="70" fontSize="7" fontFamily="Space Mono" fill="#545B54">/user/ BINDING</text>
                  </g>

                  {/* N5: Gate S-5 */}
                  <g onClick={() => setSelectedNodeId('gate')} className="cursor-pointer">
                    <rect x="380" y="140" width="100" height="40" fill={selectedNodeId === 'gate' ? '#EFECE4' : '#F6F3EC'} stroke="#1A1D1A" strokeWidth="1.2"/>
                    <text x="390" y="156" fontSize="8" fontFamily="Space Mono" fontWeight="bold" fill="#1A1D1A">N-05: GATE S-5</text>
                    <text x="390" y="170" fontSize="7" fontFamily="Space Mono" fill="#545B54">VERIFY PASS</text>
                  </g>

                  {/* N6: Ship */}
                  <g onClick={() => setSelectedNodeId('ship')} className="cursor-pointer">
                    <rect x="540" y="90" width="70" height="40" fill={selectedNodeId === 'ship' ? '#EFECE4' : '#F6F3EC'} stroke="#1A1D1A" strokeWidth="1.2"/>
                    <text x="548" y="106" fontSize="8" fontFamily="Space Mono" fontWeight="bold" fill="#1A1D1A">N-06: SHIP</text>
                    <text x="548" y="120" fontSize="7" fontFamily="Space Mono" fill="#545B54">STAGE 7 PR</text>
                  </g>

                </svg>
              </div>

              <div className="flex justify-between text-[9px] text-[#545B54] border-t border-[#1A1D1A]/20 pt-1.5">
                <span>GRID: ORTHOGRAPHIC 10mm</span>
                <span>STATUS: 6 NODES RECEPTIVE</span>
              </div>
            </div>

            {/* Right: Node Detail Inspector (4 cols) */}
            <div className="lg:col-span-4 border border-[#1A1D1A] p-4 bg-[#FAF7F0] space-y-3">
              <div className="border-b border-[#1A1D1A] pb-1.5 flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider">NODE SCHEMA</span>
                <span className="text-[10px] text-[#545B54]">{activeNode.stage}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[9px] text-[#545B54] uppercase">LABEL</div>
                  <div className="font-bold">{activeNode.title}</div>
                </div>

                <div>
                  <div className="text-[9px] text-[#545B54] uppercase">TYPE</div>
                  <div className="text-[11px] text-[#545B54]">{activeNode.type}</div>
                </div>

                <div>
                  <div className="text-[9px] text-[#545B54] uppercase">AUTHORITY</div>
                  <div className="text-[11px] font-bold">{activeNode.auth}</div>
                </div>

                <div>
                  <div className="text-[9px] text-[#545B54] uppercase">CONTRACT SPECIFICATION</div>
                  <p className="text-[11px] leading-relaxed text-[#545B54] pt-0.5">
                    {activeNode.desc}
                  </p>
                </div>

                <div className="border-t border-[#1A1D1A]/20 pt-2 space-y-1">
                  <div className="flex justify-between text-[9px]">
                    <span>SCALE TUNING</span>
                    <span>{nodeScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={nodeScale * 100}
                    onChange={(e) => setNodeScale(Number(e.target.value) / 100)}
                    className="w-full accent-[#1A1D1A]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Node ${activeNode.id} calibrated at scale ${nodeScale.toFixed(2)}x`)}
                  className="w-full py-1.5 border border-[#1A1D1A] text-xs font-bold uppercase hover:bg-[#1A1D1A] hover:text-[#F6F3EC] transition-colors mt-2 cursor-pointer"
                >
                  CALIBRATE NODE
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'tesseract' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: 4D Canvas (8 cols) */}
            <div className="lg:col-span-8 border border-[#1A1D1A] p-4 bg-[#FAF7F0] space-y-2">
              <div className="flex justify-between text-[10px] text-[#545B54] border-b border-[#1A1D1A]/20 pb-1.5">
                <span>HYPERSURFACE PROJECTION 4D → 2D</span>
                <span>DRAG MOUSE TO ROTATE HYPERSPACE</span>
              </div>

              <div className="h-72 border border-dashed border-[#1A1D1A]/30 relative bg-[#F6F3EC] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={280}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                />
                <div className="absolute bottom-2 right-2 text-[8px] text-[#545B54] pointer-events-none">
                  θ(xw): {angleXW.toFixed(2)} | θ(yw): {angleYW.toFixed(2)} | θ(zw): {angleZW.toFixed(2)}
                </div>
              </div>

              {/* Hyperspace Sliders */}
              <div className="grid grid-cols-3 gap-3 text-[10px] pt-1">
                <div>
                  <div className="flex justify-between">
                    <span>XW PLANE</span>
                    <span>{Math.round((angleXW * 180) / Math.PI)}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={Math.round((angleXW * 180) / Math.PI)}
                    onChange={(e) => setAngleXW((Number(e.target.value) * Math.PI) / 180)}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>YW PLANE</span>
                    <span>{Math.round((angleYW * 180) / Math.PI)}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={Math.round((angleYW * 180) / Math.PI)}
                    onChange={(e) => setAngleYW((Number(e.target.value) * Math.PI) / 180)}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>ZW PLANE</span>
                    <span>{Math.round((angleZW * 180) / Math.PI)}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={Math.round((angleZW * 180) / Math.PI)}
                    onChange={(e) => setAngleZW((Number(e.target.value) * Math.PI) / 180)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Right: Mathematical Properties (4 cols) */}
            <div className="lg:col-span-4 border border-[#1A1D1A] p-4 bg-[#FAF7F0] space-y-3 text-xs">
              <div className="border-b border-[#1A1D1A] pb-1 font-bold uppercase tracking-wider">
                HYPERCUBE INVARIANTS
              </div>

              <div className="space-y-1.5 text-[11px] leading-relaxed text-[#545B54]">
                <div>• <strong>16 VERTICES</strong>: (±1, ±1, ±1, ±1)</div>
                <div>• <strong>32 EDGES</strong>: Connecting orthogonal pairs</div>
                <div>• <strong>24 SQUARE FACES</strong>: 2D cell boundaries</div>
                <div>• <strong>8 CUBIC CELLS</strong>: 3D bounding hypervolumes</div>
              </div>

              <div className="border-t border-[#1A1D1A]/20 pt-2 text-[10px] text-[#545B54]">
                The tesseract wireframe models the 4-dimensional state envelope of the Petri runtime, guaranteeing bounded transitions and zero coordinate leakage.
              </div>
            </div>

          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4 text-xs">
            <div className="border border-[#1A1D1A] p-4 bg-[#FAF7F0] space-y-3">
              <div className="border-b border-[#1A1D1A]/20 pb-2 flex justify-between">
                <span className="font-bold uppercase tracking-wider">AGGREGATE SYSTEM AUDIT</span>
                <span className="text-[10px] text-[#545B54]">ROLLING RECORD</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-l-2 border-[#1A1D1A] pl-3 space-y-0.5">
                  <div className="text-[10px] text-[#545B54]">TOTAL PRs MERGED</div>
                  <div className="text-xl font-bold">142</div>
                  <div className="text-[9px] text-[#545B54]">100% SQUASH HEADERS CONVENTIONAL</div>
                </div>

                <div className="border-l-2 border-[#1A1D1A] pl-3 space-y-0.5">
                  <div className="text-[10px] text-[#545B54]">GATE VERIFICATION TIME</div>
                  <div className="text-xl font-bold">4.2 min</div>
                  <div className="text-[9px] text-[#545B54]">STAGE 5 CRITERIA EVALUATION</div>
                </div>

                <div className="border-l-2 border-[#1A1D1A] pl-3 space-y-0.5">
                  <div className="text-[10px] text-[#545B54]">ESTIMATED COST SAVINGS</div>
                  <div className="text-xl font-bold">$4,820 USD</div>
                  <div className="text-[9px] text-[#545B54]">RTX ACCELERATOR + CACHE OFFSET</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Minimalist Inked Operator Datum Form */}
        <div className="border-t border-[#1A1D1A] pt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A1D1A]/20 pb-2 text-xs">
            <span className="font-bold uppercase tracking-wider">OPERATOR IDENTITY &amp; WORK DELEGATION</span>
            {isSavedNotice && <span className="text-[10px] font-bold text-emerald-800">[SAVED OK]</span>}
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            <div className="space-y-1">
              <label className="text-[10px] text-[#545B54] uppercase">01 · OPERATOR NAME</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-transparent border-b border-[#1A1D1A] py-1 font-bold outline-none uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#545B54] uppercase">02 · LOGIN CALLSIGN (EMAIL)</label>
              <input
                type="email"
                value={operatorEmail}
                onChange={(e) => setOperatorEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[#1A1D1A] py-1 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#545B54] uppercase">03 · WORK IMPERSONATION (DWD)</label>
              <input
                type="email"
                value={impersonateTarget}
                onChange={(e) => setImpersonateTarget(e.target.value)}
                className="w-full bg-transparent border-b border-[#1A1D1A] py-1 font-bold outline-none"
                required
              />
            </div>

            <div className="md:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 border border-[#1A1D1A] text-xs font-bold uppercase hover:bg-[#1A1D1A] hover:text-[#F6F3EC] transition-colors cursor-pointer"
              >
                UPDATE OPERATOR DATUM
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 4: Inked Field Notes Record */}
        <div className="border-t border-[#1A1D1A]/20 pt-6 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold uppercase tracking-wider">FIELD OBSERVATION RECORD</span>
            <span className="text-[10px] text-[#545B54]">{notes.length} RECORDS</span>
          </div>

          <div className="border border-[#1A1D1A]/30 divide-y divide-[#1A1D1A]/20 bg-[#FAF7F0]">
            {notes.map((n) => (
              <div key={n.id} className="p-2.5 space-y-0.5">
                <div className="flex justify-between text-[9px] text-[#545B54]">
                  <span>{n.time}</span>
                  <span>{n.tag}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{n.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddNote} className="flex space-x-2 pt-1">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="RECORD OBSERVATION OR /note <text>..."
              className="flex-1 bg-transparent border-b border-[#1A1D1A] py-1 text-xs outline-none uppercase"
            />
            <button
              type="submit"
              className="px-4 py-1 border border-[#1A1D1A] text-xs uppercase hover:bg-[#1A1D1A] hover:text-[#F6F3EC] transition-colors cursor-pointer"
            >
              RECORD
            </button>
          </form>
        </div>

        {/* Footer Datum */}
        <div className="border-t border-[#1A1D1A] pt-4 flex justify-between text-[9px] text-[#545B54]">
          <span>PETRI STUDIO · BANGKOK KERNEL (136.85.58.244:80)</span>
          <span>MONOCHROME ARCHIVAL VELLUM</span>
        </div>

      </div>

    </div>
  );
};
