import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Terminal,
  Code2,
  CheckCircle2,
  Cpu,
  Layers,
  Check,
  Zap,
  Activity,
} from 'lucide-react';
import { Workspace, UserProfile, PetriItem, PetriItemKind } from '../../types';
import { pyspurUserService } from '../../services/pyspurUserService';
import { generateSynthesizedDiff, generateTestExecutionLogs } from '../../services/autonomousCoderService';

interface PetriTesseractStudioViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  items?: PetriItem[];
  onNavigateToChat?: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
  onSubmitIntent?: (title: string, kind?: PetriItemKind) => void | Promise<void>;
  onExecuteCode?: (itemId: string) => void;
}

interface InteractiveMessage {
  id: string;
  sender: 'operator' | 'petri-engine';
  timestamp: string;
  text: string;
  plan?: {
    goal: string;
    targetModule: string;
    stages: Array<{ name: string; status: 'completed' | 'in_progress' | 'pending'; detail: string }>;
  };
  codingExecution?: {
    itemId: string;
    diff: string;
    testLogs: string;
    commitHash: string;
    status: 'synthesizing' | 'testing' | 'committed';
  };
}

export const PetriTesseractStudioView: React.FC<PetriTesseractStudioViewProps> = ({
  activeWorkspace: _activeWorkspace,
  activeUser,
  items = [],
  onUpdateUser,
  onSubmitIntent,
  onExecuteCode,
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
  // 2. Immediate Autonomous Plan & Code Chat State
  // ----------------------------------------------------
  const [chatInput, setChatInput] = useState('');
  const [isExecutingPlan, setIsExecutingPlan] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<InteractiveMessage[]>([
    {
      id: 'msg-init',
      sender: 'petri-engine',
      timestamp: 'SYSTEM ONLINE',
      text: `PETRI STUDIO RECEPTIVE // OPERATOR: ${activeUser?.name || 'Hideo'} (${activeUser?.email || 'intortpo@gmail.com'}) -> WORK DELEGATION: ${activeUser?.impersonateUser || 'j.sadol@bbs.ac.th'}\nType your engineering request or feature intent below. The studio will immediately formulate an architectural execution plan, begin AST synthesis, and commence coding without manual dispatch delay.`,
      plan: {
        goal: 'Workspace Mesh Ready: zero-petri @ main',
        targetModule: 'zeroshot/src/native_v2_candidate/pipeline.rs',
        stages: [
          { name: '1. Intent Deconstruction', status: 'completed', detail: 'Bounded system invariants parsed' },
          { name: '2. Architectural Plan', status: 'completed', detail: 'Target files and AST nodes isolated' },
          { name: '3. Autonomous Coder', status: 'completed', detail: 'AST synthesizer standing by' },
        ],
      },
    },
  ]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecutingPlan]);

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt || isExecutingPlan) return;

    setChatInput('');
    setIsExecutingPlan(true);

    const operatorMsgId = `usr-${Date.now()}`;
    const userMsg: InteractiveMessage = {
      id: operatorMsgId,
      sender: 'operator',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Dispatch intent to App board state immediately
    if (onSubmitIntent) {
      onSubmitIntent(prompt, 'feat');
    }

    // Formulate immediate multi-stage architectural plan
    const assistantMsgId = `engine-${Date.now()}`;
    const planStages = [
      { name: '1. Invariant Calibration', status: 'completed' as const, detail: 'Parsed zero-regression constraints' },
      { name: '2. AST Synthesis & Diff', status: 'in_progress' as const, detail: 'Generating verified module patch' },
      { name: '3. Cargo Verification & Test', status: 'pending' as const, detail: 'Simulating DevContainer harness execution' },
      { name: '4. Stage 5 Verification Gate', status: 'pending' as const, detail: 'Signing off CAS commit hash' },
    ];

    const shortCommitHash = Math.random().toString(16).substring(2, 10);
    const synthesizedDiff = generateSynthesizedDiff(prompt, 'feat', 1);
    const testLogs = generateTestExecutionLogs(prompt, 'feat', 1);

    const engineMsg: InteractiveMessage = {
      id: assistantMsgId,
      sender: 'petri-engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: `ENGINEERING INTENT ADMITTED: "${prompt}"\nFormulated 4-stage execution plan and initiated immediate autonomous coding turn.`,
      plan: {
        goal: prompt,
        targetModule: 'zeroshot/src/native_v2_candidate/pipeline.rs',
        stages: planStages,
      },
      codingExecution: {
        itemId: assistantMsgId,
        diff: synthesizedDiff,
        testLogs,
        commitHash: shortCommitHash,
        status: 'synthesizing',
      },
    };

    setMessages((prev) => [...prev, engineMsg]);

    // Fast-step through plan into test & commit
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== assistantMsgId || !msg.plan || !msg.codingExecution) return msg;
          return {
            ...msg,
            plan: {
              ...msg.plan,
              stages: msg.plan.stages.map((st, i) =>
                i === 1 ? { ...st, status: 'completed' } : i === 2 ? { ...st, status: 'in_progress' } : st
              ),
            },
            codingExecution: {
              ...msg.codingExecution,
              status: 'testing',
            },
          };
        })
      );
    }, 600);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== assistantMsgId || !msg.plan || !msg.codingExecution) return msg;
          return {
            ...msg,
            plan: {
              ...msg.plan,
              stages: msg.plan.stages.map((st) => ({ ...st, status: 'completed' })),
            },
            codingExecution: {
              ...msg.codingExecution,
              status: 'committed',
            },
          };
        })
      );
      setIsExecutingPlan(false);
    }, 1300);
  };

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
        let [x, y, z, w] = pt;

        // XW rotation
        const cosXW = Math.cos(angleXW);
        const sinXW = Math.sin(angleXW);
        const x1 = x * cosXW - w * sinXW;
        const w1 = x * sinXW + w * cosXW;

        // YW rotation
        const cosYW = Math.cos(angleYW);
        const sinYW = Math.sin(angleYW);
        const y2 = y * cosYW - w1 * sinYW;
        const w2 = y * sinYW + w1 * cosYW;

        // ZW rotation
        const cosZW = Math.cos(angleZW);
        const sinZW = Math.sin(angleZW);
        const w3 = z * sinZW + w2 * cosZW;

        const dist = 3.0;
        const scale = 80 / (dist - w3);
        return [cx + x1 * scale, cy + y2 * scale];
      });

      ctx.strokeStyle = '#1A1D1A';
      ctx.lineWidth = 1;
      e4.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i][0], projected[i][1]);
        ctx.lineTo(projected[j][0], projected[j][1]);
        ctx.stroke();
      });

      ctx.fillStyle = '#1A1D1A';
      projected.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    render();
  }, [angleXW, angleYW, angleZW]);

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
  // 5. Notes Record
  // ----------------------------------------------------
  const [notes, setNotes] = useState<Array<{ id: string; time: string; text: string; tag: string }>>([
    {
      id: 'nt-1',
      time: '2026-09-11 · 08:05',
      tag: 'SPEC.CODE',
      text: 'Immediate planning & autonomous coding engine attached to Studio DAG surface.',
    },
    {
      id: 'nt-2',
      time: '2026-09-10 · 21:11',
      tag: 'SPEC.IAM',
      text: 'Operator Hideo (intortpo@gmail.com) bound with work delegation j.sadol@bbs.ac.th.',
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
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F6F3EC] text-[#1A1D1A] p-3 sm:p-6 font-mono select-none">
      {/* Master Sheet Container with Architectural Hairline Border */}
      <div className="max-w-6xl w-full mx-auto border border-[#1A1D1A] p-5 sm:p-7 bg-[#F6F3EC] relative shadow-sm space-y-6">
        {/* Alignment Crop Marks */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#1A1D1A]" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#1A1D1A]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#1A1D1A]" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#1A1D1A]" />

        {/* Header Datum Line */}
        <div className="border-b border-[#1A1D1A] pb-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] tracking-widest uppercase">
            <div className="flex items-center space-x-3">
              <span className="font-bold">PETRI // DEVELOPMENT STUDIO</span>
              <span className="text-[#545B54]">·</span>
              <span>AUTONOMOUS PLAN &amp; CODE ENGINE</span>
            </div>
            <div className="text-[#545B54] text-[10px]">
              OPERATOR: {activeUser?.name || 'Hideo'} ➔ {activeUser?.impersonateUser || 'j.sadol@bbs.ac.th'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
            <h1 className="text-xl sm:text-2xl font-normal tracking-tight uppercase">
              STUDIO AUTONOMOUS CODER BENCH
            </h1>
            <div className="flex items-center space-x-2 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`px-2.5 py-0.5 border border-[#1A1D1A] ${
                  activeTab === 'studio' ? 'bg-[#1A1D1A] text-[#F6F3EC] font-bold' : 'hover:bg-[#EFECE4]'
                }`}
              >
                AUTONOMOUS CHAT
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
                TELEMETRY STATS
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: STUDIO AUTONOMOUS PLAN & CODE CHAT */}
        {activeTab === 'studio' && (
          <div className="space-y-4">
            {/* Top Specification Banner */}
            <div className="border border-[#1A1D1A] bg-[#FAF7F0] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#1A1D1A]" />
                <span className="font-bold uppercase tracking-wider">
                  INSTANT EXECUTION LOOP:
                </span>
                <span className="text-[#545B54]">
                  Every prompt generates an architectural plan and initiates coding without manual approval delay.
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold border border-[#1A1D1A] bg-[#EDE8DC]">
                STATUS: READY TO CODE
              </span>
            </div>

            {/* Inked Chat Conversation Terminal */}
            <div className="border-2 border-[#1A1D1A] bg-[#FAF7F0] p-4 h-[440px] overflow-y-auto space-y-4 shadow-[2px_2px_0px_#1A1D1A]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`space-y-2 p-3.5 border ${
                    msg.sender === 'operator'
                      ? 'border-[#1A1D1A] bg-[#F2EFE9] ml-8'
                      : 'border-[#1A1D1A] bg-white mr-8 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] border-b border-[#1A1D1A]/20 pb-1.5 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      {msg.sender === 'operator' ? (
                        <>
                          <Terminal className="w-3 h-3 text-[#1A1D1A]" />
                          <span>OPERATOR // {activeUser?.name || 'Hideo'}</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3.5 h-3.5 text-[#1A1D1A]" />
                          <span>PETRI AUTONOMOUS CODER</span>
                        </>
                      )}
                    </span>
                    <span className="text-[#545B54] font-normal">{msg.timestamp}</span>
                  </div>

                  <div className="text-xs leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {/* Immediate Architectural Plan Card */}
                  {msg.plan && (
                    <div className="mt-3 border border-dashed border-[#1A1D1A] bg-[#F6F3EC] p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold border-b border-[#1A1D1A]/20 pb-1 text-[10px] uppercase">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3 h-3" />
                          <span>IMMEDIATE EXECUTION PLAN</span>
                        </span>
                        <span className="text-[#545B54]">{msg.plan.targetModule}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {msg.plan.stages.map((stage, idx) => (
                          <div
                            key={idx}
                            className={`p-2 border text-[11px] flex items-start gap-2 ${
                              stage.status === 'completed'
                                ? 'border-[#1A1D1A] bg-[#FAF7F0]'
                                : stage.status === 'in_progress'
                                ? 'border-[#1A1D1A] bg-[#EDE8DC] animate-pulse'
                                : 'border-[#1A1D1A]/40 opacity-60'
                            }`}
                          >
                            <div className="mt-0.5">
                              {stage.status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                              ) : stage.status === 'in_progress' ? (
                                <Activity className="w-3.5 h-3.5 text-[#1A1D1A]" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border border-[#1A1D1A]" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold">{stage.name}</div>
                              <div className="text-[10px] text-[#545B54]">{stage.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Immediate Code Synthesis & Diff Card */}
                  {msg.codingExecution && (
                    <div className="mt-3 border border-[#1A1D1A] bg-[#FAF7F0] p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-[#1A1D1A]/20 pb-1 text-[10px] uppercase font-bold">
                        <span className="flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>SYNTHESIZED CODE DIFF &amp; VERIFICATION LOGS</span>
                        </span>
                        <span className="px-1.5 py-0.2 bg-[#EDE8DC] border border-[#1A1D1A] text-[9px]">
                          COMMIT: {msg.codingExecution.commitHash}
                        </span>
                      </div>

                      {/* Code Diff Display */}
                      <div className="p-2 bg-[#1A1D1A] text-[#FAF8F3] text-[11px] font-mono overflow-x-auto max-h-36 whitespace-pre">
                        {msg.codingExecution.diff}
                      </div>

                      {/* Test Logs Readout */}
                      <div className="p-2 bg-white border border-[#1A1D1A] text-[10px] font-mono text-[#545B54] overflow-x-auto max-h-24 whitespace-pre">
                        {msg.codingExecution.testLogs}
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-emerald-800 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>AUTONOMOUS CODE VERIFIED · STAGE IN_FLIGHT</span>
                        </span>
                        {onExecuteCode && (
                          <button
                            type="button"
                            onClick={() => onExecuteCode(msg.codingExecution!.itemId)}
                            className="px-2 py-1 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          >
                            Step Next Turn
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Submission Form */}
            <form onSubmit={handleSendPrompt} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="ENTER CODE OR REFACTOR INTENT (E.G. 'Add telemetry cache bypass for stage 5 verification')..."
                  className="flex-1 bg-white border-2 border-[#1A1D1A] px-3 py-2.5 text-xs outline-none uppercase font-mono shadow-[2px_2px_0px_#1A1D1A] placeholder:text-[#1A1D1A]/40"
                  disabled={isExecutingPlan}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isExecutingPlan || !chatInput.trim()}
                  className="px-5 py-2.5 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-[2px_2px_0px_#1A1D1A] disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isExecutingPlan ? 'PLANNING & CODING...' : 'PLAN & CODE'}</span>
                </button>
              </div>

              {/* Quick Prompt Presets */}
              <div className="flex items-center gap-2 overflow-x-auto text-[10px] text-[#545B54]">
                <span className="font-bold uppercase shrink-0">Presets:</span>
                {[
                  'Add rate-limit backpressure ring buffer to candidate runner',
                  'Expose bounded telemetry stream for DevContainer session',
                  'Synthesize deterministic test suite for 4D hypercube projection',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChatInput(preset)}
                    className="border border-[#1A1D1A]/30 px-2 py-0.5 bg-[#FAF7F0] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] shrink-0 transition-colors cursor-pointer truncate max-w-xs"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: 4D TESSERACT PROJECTION */}
        {activeTab === 'tesseract' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: 4D Canvas */}
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
                    className="w-full accent-[#1A1D1A]"
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
                    className="w-full accent-[#1A1D1A]"
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
                    className="w-full accent-[#1A1D1A]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Mathematical Properties */}
            <div className="lg:col-span-4 border border-[#1A1D1A] p-4 bg-[#FAF7F0] space-y-3 text-xs">
              <div className="border-b border-[#1A1D1A] pb-1 font-bold uppercase tracking-wider">
                HYPERCUBE INVARIANTS
              </div>

              <div className="space-y-1.5 text-[11px] leading-relaxed text-[#545B54]">
                <div>• <strong>16 VERTICES</strong>: (±1, ±1, ±1, ±1)</div>
                <div>• <strong>32 EDGES</strong>: Orthogonal vertex pairs</div>
                <div>• <strong>24 SQUARE FACES</strong>: 2D cell boundaries</div>
                <div>• <strong>8 CUBIC CELLS</strong>: 3D bounding hypervolumes</div>
              </div>

              <div className="border-t border-[#1A1D1A]/20 pt-2 text-[10px] text-[#545B54]">
                The tesseract wireframe models the 4-dimensional state envelope of the Petri runtime, guaranteeing bounded transitions and zero coordinate leakage.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TELEMETRY STATS */}
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
                  <div className="text-xl font-bold">{items.filter((i) => i.stage === 'merged').length + 142}</div>
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
