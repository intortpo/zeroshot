import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowUp,
  Brain,
  Layers,
  Compass,
  Zap,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  Cpu,
  Mic,
  MicOff,
} from 'lucide-react';
import { Workspace, UserProfile, SteerableConceptWord, PlanCanvasDoc } from '../../types';
import { agentCognitionService } from '../../services/agentCognitionService';

interface CentricFocusChatViewProps {
  activeWorkspace?: Workspace;
  activeUser: UserProfile;
  onHandoffPlan?: (plan: PlanCanvasDoc) => void;
  onLogGoal?: (goal: string) => void;
  onNavigateToView?: (view: 'plan' | 'node' | 'board') => void;
}

// Conceptual domain knowledge matrix with steerable children
const DOMAIN_CONCEPT_DICTIONARY: Record<string, { category: SteerableConceptWord['category']; children: string[] }> = {
  'fail-closed-boundary': {
    category: 'security',
    children: ['zero-trust-smartshield', 'tamper-evident-log', 'deterministic-abort'],
  },
  'tailscale-mesh-vpn': {
    category: 'networking',
    children: ['magic-dns-routing', 'wireguard-peer-tunnel', 'private-100-ip'],
  },
  'docker-socket-ipc': {
    category: 'runtime',
    children: ['non-interactive-exec', 'volume-bind-mount', 'container-log-tail'],
  },
  'bounded-queue-backpressure': {
    category: 'architecture',
    children: ['tokio-async-channel', '64-mib-guard', 'cas-compare-swap'],
  },
  'rubric-assertion-grader': {
    category: 'eval',
    children: ['pass-at-k-metric', 'isolated-test-reproduction', 'latency-budget'],
  },
  'ast-code-rewrite': {
    category: 'architecture',
    children: ['in-memory-ast', 'deterministic-patch', 'zero-regression-test'],
  },
  'smartshield-anti-bot': {
    category: 'security',
    children: ['rate-limit-rpm', 'challenge-response-2fa', 'ip-reputation-filter'],
  },
  'subagent-fanout': {
    category: 'architecture',
    children: ['parallel-agent-pool', 'bounded-concurrency', 'safe-epoch-timestamp'],
  },
  'ollama-local-llm': {
    category: 'runtime',
    children: ['zero-data-egress', 'gguf-quantization', 'gpu-vram-allocation'],
  },
};

export const CentricFocusChatView: React.FC<CentricFocusChatViewProps> = ({
  activeWorkspace,
  activeUser: _activeUser,
  onHandoffPlan,
  onLogGoal,
  onNavigateToView,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [words, setWords] = useState<SteerableConceptWord[]>([]);
  const [steeredHistory, setSteeredHistory] = useState<string[]>([]);
  const [synthesizedAnswer, setSynthesizedAnswer] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subtle Interactive WebGL Fluid Shader Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gl.viewport(0, 0, width, height);
    };

    window.addEventListener('resize', handleResize);

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + vec2(10.0);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 st = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
        float t = u_time * 0.12;

        vec2 q = vec2(fbm(st + vec2(0.0, t * 0.2)), fbm(st + vec2(5.2, 1.3)));
        vec2 r = vec2(fbm(st + 4.0 * q + vec2(1.7, 9.2) + t * 0.15),
                      fbm(st + 4.0 * q + vec2(8.3, 2.8) + t * 0.1));

        float f = fbm(st + 4.0 * r);

        // Soft Tiffany pastel palette
        vec3 colorBg = vec3(0.98, 0.985, 0.99); // Crisp porcelain
        vec3 colorMint = vec3(0.88, 0.96, 0.95); // Subtle Tiffany mint
        vec3 colorLavender = vec3(0.94, 0.92, 0.98); // Soft lilac
        vec3 colorCyan = vec3(0.85, 0.94, 0.98); // Sky mist

        vec3 color = mix(colorBg, colorMint, clamp(f * f * 2.0, 0.0, 1.0));
        color = mix(color, colorLavender, clamp(length(q) * 0.6, 0.0, 1.0));
        color = mix(color, colorCyan, clamp(length(r.x) * 0.5, 0.0, 1.0));

        gl_FragColor = vec4(color, 0.94);
      }
    `;

    const createShader = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');

    const startTime = performance.now();

    const render = () => {
      const time = (performance.now() - startTime) * 0.001;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uResolution, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Autofocus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle User Prompt Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isThinking) return;

    setHasStarted(true);
    setIsThinking(true);
    setSynthesizedAnswer(null);
    setSteeredHistory([]);

    // Trigger agent deliberation
    agentCognitionService.simulateDeliberation(cleanPrompt);

    // Generate contextually relevant seed words
    const allDictKeys = Object.keys(DOMAIN_CONCEPT_DICTIONARY);
    const selectedKeys: string[] = [];

    // Keyword heuristics based on prompt
    const lower = cleanPrompt.toLowerCase();
    if (lower.includes('docker') || lower.includes('container') || lower.includes('runner')) {
      selectedKeys.push('docker-socket-ipc', 'ollama-local-llm');
    }
    if (lower.includes('network') || lower.includes('mesh') || lower.includes('tailscale') || lower.includes('proxy')) {
      selectedKeys.push('tailscale-mesh-vpn', 'smartshield-anti-bot');
    }
    if (lower.includes('test') || lower.includes('grade') || lower.includes('eval') || lower.includes('benchmark')) {
      selectedKeys.push('rubric-assertion-grader');
    }
    if (lower.includes('security') || lower.includes('shield') || lower.includes('gate') || lower.includes('safe')) {
      selectedKeys.push('fail-closed-boundary');
    }

    // Fill remaining up to 6 seed concepts
    for (const k of allDictKeys) {
      if (selectedKeys.length >= 6) break;
      if (!selectedKeys.includes(k)) {
        selectedKeys.push(k);
      }
    }

    // Initialize words with fadedIn: false
    const initialWords: SteerableConceptWord[] = selectedKeys.map((k, idx) => ({
      id: `w-${Date.now()}-${idx}`,
      word: k,
      category: DOMAIN_CONCEPT_DICTIONARY[k]?.category || 'architecture',
      relevance: 0.95 - idx * 0.05,
      selected: false,
      fadedIn: false,
      children: DOMAIN_CONCEPT_DICTIONARY[k]?.children || [],
    }));

    setWords(initialWords);

    // Staggered fade-in of words
    initialWords.forEach((_, idx) => {
      setTimeout(() => {
        setWords((prev) =>
          prev.map((w, i) => (i === idx ? { ...w, fadedIn: true } : w))
        );
      }, 250 + idx * 280);
    });

    // Synthesize final response after thinking duration
    setTimeout(() => {
      setIsThinking(false);
      synthesizeResponse(cleanPrompt, []);
    }, 2800);
  };

  // User Clicks a Concept Word to Drive Direction
  const handleSelectWord = (wordId: string) => {
    const target = words.find((w) => w.id === wordId);
    if (!target) return;

    const willBeSelected = !target.selected;

    setWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, selected: willBeSelected } : w))
    );

    if (willBeSelected) {
      const newHistory = [...steeredHistory, target.word];
      setSteeredHistory(newHistory);
      showToast(`🎯 Steered Direction: Anchoring "${target.word}"`);

      // Steer Agent Cognition hypothesis
      agentCognitionService.steerConcept({
        title: `Steered Intent: ${target.word}`,
        summary: `Actively orienting synthesis around ${target.word} invariants.`,
        workingHypothesis: `Prioritizing ${target.word} as the dominant architectural anchor for "${prompt}".`,
      });

      // Spawn child derivative words if available
      if (target.children && target.children.length > 0) {
        const newChildWords: SteerableConceptWord[] = target.children.map((child, idx) => ({
          id: `child-${Date.now()}-${idx}`,
          word: child,
          category: target.category,
          relevance: 0.88,
          selected: false,
          fadedIn: false,
        }));

        setWords((prev) => [...prev, ...newChildWords]);

        // Stagger fade-in of child words
        newChildWords.forEach((_, idx) => {
          setTimeout(() => {
            setWords((prev) =>
              prev.map((w) => (w.word === target.children?.[idx] ? { ...w, fadedIn: true } : w))
            );
          }, 150 + idx * 220);
        });
      }

      // Re-synthesize answer to reflect user's steering
      synthesizeResponse(prompt, newHistory);
    } else {
      const newHistory = steeredHistory.filter((w) => w !== target.word);
      setSteeredHistory(newHistory);
      synthesizeResponse(prompt, newHistory);
    }
  };

  // Synthesize answer integrating user's steered trajectory
  const synthesizeResponse = (userPrompt: string, steeredConcepts: string[]) => {
    const conceptsMentioned =
      steeredConcepts.length > 0
        ? steeredConcepts.join(', ')
        : 'fail-closed-boundary, deterministic execution';

    const solution = `### Proposed Architecture: ${userPrompt}

**Steered Directive**: Focused on **${conceptsMentioned}**

1. **System Invariant & Guardrail**:
   - Execution is bounded by fail-closed invariants and positive Unix epoch timestamps.
   - Dedicated Docker socket IPC isolation mounted at \`/var/run/docker.sock\`.

2. **Network & Cluster Routing**:
   - Zero-trust ingress routed across private Tailscale WireGuard mesh (\`100.81.151.110\`).
   - Automated rate-limiting and anti-bot mitigation governed by Petri SmartShield.

3. **Execution Plan**:
   - Isolated reproduction test in \`.devcontainer\` sandbox before applying changes.
   - Automated verification using rubric assertion grader.
`;

    setSynthesizedAnswer(solution);
  };

  const handleSendToPlan = () => {
    if (!synthesizedAnswer) return;
    const plan: PlanCanvasDoc = {
      id: `plan-focus-${Date.now().toString().slice(-4)}`,
      title: prompt.trim() || 'Focus Steered Plan',
      goalPrompt: prompt.trim() || 'Autonomous Objective',
      status: 'drafting',
      version: 1,
      summary: `Implementing steered focus components: ${steeredHistory.join(', ') || 'Invariants'}`,
      objectives: [
        'Establish isolated reproduction test in DevContainer sandbox',
        'Enforce fail-closed boundaries and zero regression',
        ...steeredHistory.map((w) => `Anchor: ${w}`),
      ],
      invariants: [
        'Ceiling: 64 MiB buffer guard',
        'Assert: deterministic exit code 0',
        'Fail-closed boundary on untrusted input',
      ],
      phases: [
        {
          id: 'phase-1',
          name: 'Core System Engine',
          description: `Implementing steered focus components: ${steeredHistory.join(', ') || 'Invariants'}`,
          tasks: [
            {
              id: 'th-1',
              text: 'Create repeatable failing test in DevContainer sandbox',
              completed: false,
              role: '@architect',
            },
            {
              id: 'th-2',
              text: 'Assert fail-closed boundary and zero memory leak',
              completed: false,
              role: '@security-auditor',
            },
          ],
        },
      ],
      testMatrix: ['Isolated DevContainer pass-at-1 reproduction', 'Invariant rubric verification'],
      annotations: [],
      rawMarkdown: synthesizedAnswer,
      updatedAt: Date.now(),
    };

    onHandoffPlan?.(plan);
    showToast('🚀 Plan created! Opening Plan Canvas...');
    onNavigateToView?.('plan');
  };

  const handleSendToBoard = () => {
    if (!prompt.trim()) return;
    onLogGoal?.(`[Focus] ${prompt.trim()}`);
    showToast('📋 Logged goal to Petri Kanban Board!');
    onNavigateToView?.('board');
  };

  const handleReset = () => {
    setPrompt('');
    setHasStarted(false);
    setIsThinking(false);
    setWords([]);
    setSteeredHistory([]);
    setSynthesizedAnswer(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative flex-1 flex flex-col h-full w-full overflow-hidden font-sans select-none">
      {/* Background: Flowing Tiffany Subtle WebGL Shader */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-950 text-white text-xs font-medium shadow-2xl flex items-center space-x-2 border border-stone-800 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col items-center space-y-6 transition-all duration-300">
          {/* Header Title (Centered, Fades subtly when prompt submitted) */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-2xs text-[11px] font-mono text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Petri Zero Focus</span>
              <span className="text-stone-300">·</span>
              <span className="text-emerald-700 font-semibold">Gemini 3.8 Flash High</span>
            </div>
            {!hasStarted && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                What should we orchestrate today?
              </h1>
            )}
          </div>

          {/* Singular Centered Chat Input Card */}
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-stone-200/90 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_45px_rgba(0,0,0,0.09)] transition-all p-3 sm:p-4 space-y-3"
          >
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                rows={hasStarted ? 2 : 3}
                placeholder="Ask Petri Zero anything, or describe an autonomous software intent..."
                className="w-full bg-transparent text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none pr-10 font-sans leading-relaxed"
              />
            </div>

            {/* Input Footer: Model, Voice, Token, Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center space-x-2 text-stone-500 font-mono text-[11px]">
                <span className="hidden sm:inline">Workspace:</span>
                <span className="font-semibold text-stone-800 font-sans">{activeWorkspace?.name || 'zero-petri'}</span>
                <span className="text-stone-300">·</span>
                <span>Enter ↵ to send</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsListening(!isListening)}
                  className={`p-2 rounded-xl transition-colors ${
                    isListening
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800'
                  }`}
                  title="Voice dictation (Mock / Status)"
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="submit"
                  disabled={!prompt.trim() || isThinking}
                  className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    prompt.trim() && !isThinking
                      ? 'bg-stone-900 text-white hover:bg-black shadow-sm'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {isThinking ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-600" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Prompt Inspiration Chips (When Idle) */}
          {!hasStarted && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
              {[
                'Synthesize DevContainer for Rust engine & Tailscale mesh',
                'Audit SmartShield zero-trust edge policies and rate limits',
                'Design high-assurance DAG pipeline with rubric grading',
                'Benchmark Pass@k metrics on in-memory AST patches',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-stone-200/80 text-stone-700 hover:text-stone-950 transition-all text-xs font-sans shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Steerable Concept Cloud (Fade-in words as AI thinks) */}
          {hasStarted && (
            <div className="w-full space-y-4 pt-2 animate-in fade-in duration-200">
              {/* Deliberation Status Indicator */}
              <div className="flex items-center justify-between text-xs text-stone-600 px-2">
                <div className="flex items-center space-x-2">
                  <Brain className={`w-4 h-4 ${isThinking ? 'text-indigo-600 animate-pulse' : 'text-emerald-600'}`} />
                  <span className="font-semibold text-stone-800">
                    {isThinking ? 'AI Deliberating...' : 'Cognitive Synthesis Complete'}
                  </span>
                  <span className="text-stone-400 font-normal">
                    · Click fading concept pills to steer direction
                  </span>
                </div>
                {steeredHistory.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {steeredHistory.length} Steered
                  </span>
                )}
              </div>

              {/* Dynamic Concept Words Container */}
              <div className="p-4 rounded-3xl bg-white/60 backdrop-blur-md border border-stone-200/80 shadow-2xs flex flex-wrap gap-2.5 items-center justify-center min-h-[90px]">
                {words.map((w) => {
                  const isFaded = w.fadedIn;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectWord(w.id)}
                      className={`px-3.5 py-1.5 rounded-2xl text-xs font-mono transition-all duration-300 transform flex items-center space-x-1.5 cursor-pointer shadow-2xs ${
                        isFaded
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-2 pointer-events-none'
                      } ${
                        w.selected
                          ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-105'
                          : 'bg-white/90 hover:bg-white border border-stone-200/90 text-stone-700 hover:text-stone-900 hover:border-stone-400'
                      }`}
                    >
                      {w.selected ? (
                        <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Compass className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      )}
                      <span>{w.word}</span>
                    </button>
                  );
                })}
              </div>

              {/* Synthesized Response Card */}
              {synthesizedAnswer && (
                <div className="w-full rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/90 shadow-lg p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-stone-900">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      <span>Synthesized Architectural Plan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(synthesizedAnswer);
                          showToast('📋 Copied to clipboard!');
                        }}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors"
                      >
                        New Session
                      </button>
                    </div>
                  </div>

                  {/* Formatted Markdown Content */}
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
                    {synthesizedAnswer}
                  </div>

                  {/* Action Hand-offs */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-stone-500 font-sans">
                      Next Actions:
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleSendToBoard}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors flex items-center space-x-1.5"
                      >
                        <Layers className="w-3.5 h-3.5 text-stone-500" />
                        <span>Log to Board</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigateToView?.('node')}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors flex items-center space-x-1.5"
                      >
                        <Compass className="w-3.5 h-3.5 text-stone-500" />
                        <span>Open in Node Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendToPlan}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-stone-300" />
                        <span>Send to Plan Canvas</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
