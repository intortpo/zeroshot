import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  ArrowUp,
  Brain,
  Compass,
  Zap,
  CheckCircle2,
  RefreshCw,
  Copy,
  BookOpen,
  Send,
  Trash2,
  FolderGit2,
  Globe2,
  X,
  Plus,
  Mic,
  MicOff,
} from 'lucide-react';
import { Workspace, UserProfile, SteerableConceptWord, PlanCanvasDoc } from '../../types';
import { agentCognitionService } from '../../services/agentCognitionService';
import { zenNotesService, ZenNote } from '../../services/zenNotesService';
import { triggerLightHaptic, triggerSuccessHaptic } from '../../utils/haptics';

interface CentricFocusChatViewProps {
  activeWorkspace?: Workspace;
  activeUser: UserProfile;
  onHandoffPlan?: (plan: PlanCanvasDoc) => void;
  onLogGoal?: (goal: string) => void;
  onNavigateToView?: (view: 'plan' | 'node' | 'board') => void;
}

// Conceptual domain knowledge dictionary for steerable thought direction
const DOMAIN_CONCEPT_DICTIONARY: Record<string, { category: SteerableConceptWord['category']; children: string[] }> = {
  'fail-closed-boundary': {
    category: 'security',
    children: ['zero-trust-smartshield', 'tamper-evident-log', 'deterministic-abort'],
  },
  'tailscale-mesh-vpn': {
    category: 'networking',
    children: ['magic-dns-routing', 'wireguard-peer-tunnel', 'exit-node-routing'],
  },
  'touch-ergonomics': {
    category: 'runtime',
    children: ['haptic-feedback', 'safe-area-insets', 'single-pane-navigation'],
  },
  'bounded-queue-backpressure': {
    category: 'architecture',
    children: ['tokio-async-channel', '64-mib-guard', 'cas-compare-swap'],
  },
  'gemini-thought-stream': {
    category: 'architecture',
    children: ['conversational-notes', 'auto-categorization', 'pattern-matching'],
  },
  'rubric-assertion-grader': {
    category: 'eval',
    children: ['pass-at-k-metric', 'isolated-test-reproduction', 'latency-budget'],
  },
  'smartshield-anti-bot': {
    category: 'security',
    children: ['rate-limit-rpm', 'challenge-response-2fa', 'ip-reputation-filter'],
  },
  'subagent-fanout': {
    category: 'architecture',
    children: ['parallel-agent-pool', 'bounded-concurrency', 'safe-epoch-timestamp'],
  },
};

export const CentricFocusChatView: React.FC<CentricFocusChatViewProps> = ({
  activeWorkspace,
  activeUser: _activeUser,
  onHandoffPlan: _onHandoffPlan,
  onLogGoal,
  onNavigateToView: _onNavigateToView,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [words, setWords] = useState<SteerableConceptWord[]>([]);
  const [steeredHistory, setSteeredHistory] = useState<string[]>([]);
  const [conversationalResponse, setConversationalResponse] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Zen Notes Scope and State
  const [noteScope, setNoteScope] = useState<'workspace' | 'global'>('workspace');
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [notesList, setNotesList] = useState<ZenNote[]>(() => zenNotesService.getAllNotes());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [matchedPatterns, setMatchedPatterns] = useState<{ note: ZenNote; matchedTags: string[]; score: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshNotes = () => {
    setNotesList(zenNotesService.getAllNotes());
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

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.18;
        float wave1 = sin(p.x * 1.8 + t + cos(p.y * 1.4 + t)) * 0.5 + 0.5;
        float wave2 = cos(p.y * 2.2 - t + sin(p.x * 1.6 - t)) * 0.5 + 0.5;
        float blend = mix(wave1, wave2, 0.5);

        // Tiffany / Lavender soft tones
        vec3 colBg = vec3(0.985, 0.988, 0.992);
        vec3 colCyan = vec3(0.88, 0.96, 0.95);
        vec3 colIndigo = vec3(0.92, 0.91, 0.98);

        vec3 col = mix(colBg, colCyan, blend * 0.45);
        col = mix(col, colIndigo, (1.0 - blend) * 0.35);

        gl_FragColor = vec4(col, 0.92);
      }
    `;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
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

  // Handle User Prompt Submission (Gemini-Style Conversational Note Taking)
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isThinking) return;

    triggerLightHaptic();
    setHasStarted(true);
    setIsThinking(true);
    setConversationalResponse(null);
    setSteeredHistory([]);

    // Check pattern matches against existing notes
    const matches = zenNotesService.findMatchingPatterns(cleanPrompt);
    setMatchedPatterns(matches);

    // Trigger agent cognition simulation
    agentCognitionService.simulateDeliberation(cleanPrompt);

    // Generate contextually relevant steerable words
    const allDictKeys = Object.keys(DOMAIN_CONCEPT_DICTIONARY);
    const selectedKeys: string[] = [];

    const lower = cleanPrompt.toLowerCase();
    if (lower.includes('network') || lower.includes('mesh') || lower.includes('tailscale')) {
      selectedKeys.push('tailscale-mesh-vpn', 'fail-closed-boundary');
    }
    if (lower.includes('mobile') || lower.includes('touch') || lower.includes('haptic')) {
      selectedKeys.push('touch-ergonomics');
    }
    if (lower.includes('note') || lower.includes('memory') || lower.includes('gemini')) {
      selectedKeys.push('gemini-thought-stream');
    }
    if (lower.includes('security') || lower.includes('shield') || lower.includes('safe')) {
      selectedKeys.push('fail-closed-boundary', 'smartshield-anti-bot');
    }

    for (const k of allDictKeys) {
      if (selectedKeys.length >= 5) break;
      if (!selectedKeys.includes(k)) selectedKeys.push(k);
    }

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

    // Staggered fade-in
    initialWords.forEach((_, idx) => {
      setTimeout(() => {
        setWords((prev) =>
          prev.map((w, i) => (i === idx ? { ...w, fadedIn: true } : w))
        );
      }, 250 + idx * 280);
    });

    // Synthesize Gemini-style conversational note reflection
    setTimeout(() => {
      setIsThinking(false);
      synthesizeConversationalResponse(cleanPrompt, []);
    }, 2200);
  };

  // User Clicks a Concept Word to Steer Conversational Direction
  const handleSelectWord = (wordId: string) => {
    triggerLightHaptic();
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
        newChildWords.forEach((_, idx) => {
          setTimeout(() => {
            setWords((prev) =>
              prev.map((w) => (w.word === target.children?.[idx] ? { ...w, fadedIn: true } : w))
            );
          }, 150 + idx * 220);
        });
      }

      synthesizeConversationalResponse(prompt, newHistory);
    } else {
      const newHistory = steeredHistory.filter((w) => w !== target.word);
      setSteeredHistory(newHistory);
      synthesizeConversationalResponse(prompt, newHistory);
    }
  };

  // Synthesize regular conversational response (No code execution/builds)
  const synthesizeConversationalResponse = (userPrompt: string, steered: string[]) => {
    const anchors = steered.length > 0 ? steered.join(', ') : 'core domain invariants';
    const workspaceName = activeWorkspace?.name || 'zero-petri';

    const response = `I've analyzed and reflected on your note: **"${userPrompt}"**

**Conceptual Anchors**: ${anchors}

### Thought Synthesis & Takeaways
- **Context**: Captured within **${noteScope === 'global' ? 'Global Notes (Cross-Project)' : `Workspace Notes (${workspaceName})`}**.
- **Key Insight**: Breaking down this concept into high-fidelity notes gives the autonomous agents clear boundaries when ready to dispatch.
- **Pattern Match**: Automatically mapped against related invariants in your memory ledger.

*You can save this reflection directly as a categorized note, or push it to your engineering agent workforce when ready to build.*`;

    setConversationalResponse(response);
  };

  // Save conversation / prompt as Zen Note
  const handleSaveCurrentAsNote = () => {
    if (!prompt.trim()) return;
    triggerSuccessHaptic();

    zenNotesService.saveNote({
      title: prompt.trim().slice(0, 48),
      content: prompt.trim(),
      scope: noteScope,
      workspaceId: noteScope === 'global' ? 'global' : activeWorkspace?.id || 'ws-petri',
    });

    refreshNotes();
    showToast(`📝 Note saved to ${noteScope === 'global' ? 'Global Notes' : 'Workspace Notes'}!`);
  };

  // Push Note to Agents to Build
  const handlePushNoteToBuild = (note: ZenNote) => {
    triggerSuccessHaptic();

    // Mark as pushed
    zenNotesService.markPushedToAgent(note.id);
    refreshNotes();

    // Log goal to Kanban board
    onLogGoal?.(`[Zen Note: ${note.category.toUpperCase()}] ${note.title}: ${note.content}`);

    showToast(`🚀 Pushed "${note.title}" to Agent Backlog!`);
  };

  const handleReset = () => {
    triggerLightHaptic();
    setPrompt('');
    setHasStarted(false);
    setIsThinking(false);
    setWords([]);
    setSteeredHistory([]);
    setConversationalResponse(null);
    setMatchedPatterns([]);
    textareaRef.current?.focus();
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notesList.filter((note) => {
      if (noteScope === 'workspace' && note.scope !== 'workspace') return false;
      if (noteScope === 'global' && note.scope !== 'global') return false;
      if (activeCategoryFilter !== 'all' && note.category !== activeCategoryFilter) return false;
      return true;
    });
  }, [notesList, noteScope, activeCategoryFilter]);

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

      {/* Top Header Bar with Scope Toggle and Notes Ledger Trigger */}
      <div className="relative z-20 px-4 sm:px-8 py-3 flex items-center justify-between border-b border-stone-200/60 bg-white/40 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
              <span>Petri Zen Chat</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Notes & Synthesis
              </span>
            </div>
            <div className="text-[10px] text-stone-500 font-mono">
              Captures, categorizes, and pattern-matches thoughts before agent build
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notes Scope Selector */}
          <div className="flex items-center bg-white/80 p-0.5 rounded-xl border border-stone-200 text-xs font-medium shadow-2xs">
            <button
              type="button"
              onClick={() => {
                triggerLightHaptic();
                setNoteScope('workspace');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1 cursor-pointer ${
                noteScope === 'workspace'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspace ({activeWorkspace?.name || 'zero-petri'})</span>
              <span className="sm:hidden">Repo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerLightHaptic();
                setNoteScope('global');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1 cursor-pointer ${
                noteScope === 'global'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Global</span>
            </button>
          </div>

          {/* Open Notes Drawer Button */}
          <button
            type="button"
            onClick={() => {
              triggerLightHaptic();
              setIsNotesDrawerOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium flex items-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Zen Notes ({notesList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start sm:justify-center p-4 sm:p-10 pt-4 sm:pt-6 pb-28 sm:pb-10 overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col items-center space-y-5 transition-all duration-300">
          {/* Header Title (Centered, Fades subtly when prompt submitted) */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-2xs text-[11px] font-mono text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemini Thought Companion</span>
              <span className="text-stone-300">·</span>
              <span className="text-emerald-700 font-semibold">Conversational Ideas & Notes</span>
            </div>
            {!hasStarted && (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                What concept or note would you like to capture?
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
                placeholder="Brainstorm an architectural pattern, write a note, or explore an idea with Gemini..."
                className="w-full bg-transparent text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none pr-10 font-sans leading-relaxed"
              />
            </div>

            {/* Input Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center space-x-2 text-stone-500 font-mono text-[11px]">
                <span>Saving to:</span>
                <span className="font-semibold text-stone-800 font-sans">
                  {noteScope === 'global' ? 'Global' : activeWorkspace?.name || 'zero-petri'}
                </span>
                <span className="text-stone-300">·</span>
                <span>Enter ↵</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerLightHaptic();
                    setIsListening(!isListening);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    isListening
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800'
                  }`}
                  title="Voice dictation"
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

          {/* Pattern Matching Preview Badge */}
          {matchedPatterns.length > 0 && (
            <div className="w-full p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/70 text-xs text-indigo-900 space-y-1.5 animate-in fade-in duration-150">
              <div className="font-semibold flex items-center space-x-1.5 text-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pattern Matcher: {matchedPatterns.length} related notes found in memory</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedPatterns.map((m) => (
                  <span
                    key={m.note.id}
                    onClick={() => {
                      triggerLightHaptic();
                      setIsNotesDrawerOpen(true);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white/90 border border-indigo-200 text-[11px] font-sans font-medium hover:bg-indigo-100/60 cursor-pointer"
                  >
                    🔗 {m.note.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Steerable Concept Cloud */}
          {hasStarted && (
            <div className="w-full space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-stone-600 px-2">
                <div className="flex items-center space-x-2">
                  <Brain className={`w-4 h-4 ${isThinking ? 'text-indigo-600 animate-pulse' : 'text-emerald-600'}`} />
                  <span className="font-semibold text-stone-800">
                    {isThinking ? 'Gemini Reflecting...' : 'Thought Stream Synced'}
                  </span>
                  <span className="text-stone-400 font-normal hidden sm:inline">
                    · Tap fading concept chips to steer reflection
                  </span>
                </div>
                {steeredHistory.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {steeredHistory.length} Steered
                  </span>
                )}
              </div>

              {/* Dynamic Concept Words Container */}
              <div className="p-4 rounded-3xl bg-white/60 backdrop-blur-md border border-stone-200/80 shadow-2xs flex flex-wrap gap-2.5 items-center justify-center min-h-[70px]">
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

              {/* Conversational Response Card (No Code/Build Actions) */}
              {conversationalResponse && (
                <div className="w-full rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/90 shadow-lg p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-stone-900">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>Gemini Thought Reflection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(conversationalResponse);
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
                        New Note
                      </button>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
                    {conversationalResponse}
                  </div>

                  {/* Note Action Toolbar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-stone-500 font-sans">
                      Categorization: <span className="font-mono text-indigo-700">#{noteScope}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleSaveCurrentAsNote}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save to Zen Notes</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zen Notes Drawer & Pattern Viewer */}
      {isNotesDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="flex-1" onClick={() => setIsNotesDrawerOpen(false)} />
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-stone-900">Zen Notes Ledger</h3>
                <span className="text-xs font-mono text-stone-400">({filteredNotes.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope Switcher */}
            <div className="px-4 pt-3 flex items-center justify-between gap-2">
              <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs font-medium w-full">
                <button
                  type="button"
                  onClick={() => {
                    triggerLightHaptic();
                    setNoteScope('workspace');
                  }}
                  className={`flex-1 py-1 rounded-lg text-center transition-colors cursor-pointer ${
                    noteScope === 'workspace' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500'
                  }`}
                >
                  Workspace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerLightHaptic();
                    setNoteScope('global');
                  }}
                  className={`flex-1 py-1 rounded-lg text-center transition-colors cursor-pointer ${
                    noteScope === 'global' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500'
                  }`}
                >
                  Global
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="px-4 py-2 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
              {['all', 'architecture', 'security', 'ux', 'todo', 'idea'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    triggerLightHaptic();
                    setActiveCategoryFilter(cat);
                  }}
                  className={`px-2.5 py-0.5 rounded-full capitalize text-[11px] font-mono shrink-0 transition-colors cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  #{cat}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-stone-300" />
                  <p>No notes captured in this scope yet.</p>
                  <p className="text-[11px]">Chat with Gemini to automatically capture and pattern match ideas.</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-stone-900">{note.title}</div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold bg-indigo-100 text-indigo-800">
                            {note.category}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {note.status === 'pushed_to_agent' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Pushed 🚀
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePushNoteToBuild(note)}
                          className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-black text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Push to Build</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-sans">
                      {note.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between pt-1 border-t border-stone-200/60 gap-1 text-[10px] font-mono text-stone-400">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((t) => (
                          <span key={t} className="text-stone-500">#{t}</span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          zenNotesService.deleteNote(note.id);
                          refreshNotes();
                        }}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
