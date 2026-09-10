import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sun,
  Moon,
  Copy,
  Sparkles,
  ChevronRight,
  ListTodo,
  Check,
} from 'lucide-react';
import { PetriItem, Workspace, UserProfile } from '../types';

export type GraphStage =
  | 'idle'
  | 'input'
  | 'worker'
  | 'verifying'
  | 'choice'
  | 'repair'
  | 'delivery'
  | 'delivery_repair'
  | 'merged';

export interface GoalWorkPlanStep {
  id: string;
  stageKey: GraphStage;
  phase: string;
  title: string;
  role: string;
  description: string;
  evidence?: string;
}

export interface DynamicGoalGraph {
  goalId: string;
  goalPrompt: string;
  goalType: 'feature' | 'bugfix' | 'diagram' | 'audit' | 'general';
  planTitle: string;
  planSummary: string;
  isSample: boolean;
  workerLabel: string;
  workerSublabel: string;
  workerRole: string;
  acceptanceLabel: string;
  acceptanceSublabel: string;
  codeReviewLabel: string;
  codeReviewSublabel: string;
  deliveryLabel: string;
  deliverySublabel: string;
  doneLabel: string;
  doneSublabel: string;
  steps: GoalWorkPlanStep[];
}

export const PRESET_GOALS = [
  {
    label: 'Feature: Bounded SQLite Queue',
    prompt: 'Implement bounded SQLite retry queues with backpressure and acceptance test suite',
    icon: '⚡',
  },
  {
    label: 'Bug: Jump Physics Velocity',
    prompt: 'Fix dude jump impulse velocity and platform collision jitter in Jumpy arena',
    icon: '🐛',
  },
  {
    label: 'Diagram: DWD OAuth Sequence',
    prompt: 'Generate editorial sequence diagram for Google Workspace DWD OAuth token validation using cathrynlavery/diagram-design',
    icon: '📊',
  },
  {
    label: 'Audit: SAIF Compliance',
    prompt: 'Conduct autonomous SAIF security audit and verify zero over-granted permissions',
    icon: '🔒',
  },
];

export function buildGoalGraph(prompt: string, isSample: boolean = false): DynamicGoalGraph {
  const p = prompt.toLowerCase();

  if (p.includes('bug') || p.includes('fix') || p.includes('crash') || p.includes('error') || p.includes('jitter')) {
    return {
      goalId: `goal-${Date.now()}`,
      goalPrompt: prompt,
      goalType: 'bugfix',
      planTitle: 'Bug Reproduction & Invariant Fix Plan',
      planSummary: 'Isolates minimal failing reproduction, patches root cause in worker session, verifies zero regressions, and delivers fix.',
      isSample,
      workerLabel: 'Reproduction & Fix',
      workerSublabel: 'isolate repro test + patch',
      workerRole: '@debugger-agent',
      acceptanceLabel: 'Reproduction Test',
      acceptanceSublabel: 'failing test now green',
      codeReviewLabel: 'Invariant Verifier',
      codeReviewSublabel: '0 regression breaches',
      deliveryLabel: 'Commit Fix & Run CI',
      deliverySublabel: 'PR checks & branch CAS merge',
      doneLabel: 'Resolved & Merged',
      doneSublabel: 'verified fix merged to main',
      steps: [
        {
          id: 'step-1',
          stageKey: 'input',
          phase: 'INGESTION',
          title: 'Goal Ingestion & Reproduction Scope',
          role: '@orchestrator',
          description: 'Parse error telemetry, locate affected modules, and isolate scope.',
        },
        {
          id: 'step-2',
          stageKey: 'worker',
          phase: 'SYNTHESIS',
          title: 'Minimal Reproduction & Patch Synthesis',
          role: '@debugger-agent',
          description: 'Construct failing test case, synthesize corrective patch, and verify locally.',
        },
        {
          id: 'step-3',
          stageKey: 'verifying',
          phase: 'VERIFICATION',
          title: 'Parallel Invariant & Regression Checks',
          role: '@verifier-matrix',
          description: 'Run targeted reproduction test and full regression suite concurrently.',
        },
        {
          id: 'step-4',
          stageKey: 'delivery',
          phase: 'DELIVERY',
          title: 'Git Compare-and-Swap Delivery',
          role: '@delivery-worker',
          description: 'Push verified commit ref, wait for required CI checks, and squash merge.',
        },
        {
          id: 'step-5',
          stageKey: 'merged',
          phase: 'CLOSURE',
          title: 'Resolution Attestation & Receipt',
          role: '@ledger-daemon',
          description: 'Record immutable event ledger receipt and update status.',
        },
      ],
    };
  }

  if (p.includes('diagram') || p.includes('draw') || p.includes('architecture') || p.includes('svg') || p.includes('visual')) {
    return {
      goalId: `goal-${Date.now()}`,
      goalPrompt: prompt,
      goalType: 'diagram',
      planTitle: 'Editorial Architecture Diagram Plan',
      planSummary: 'Applies cathrynlavery/diagram-design design system: layout ontology, SVG generation, brand token verification, and publishing.',
      isSample,
      workerLabel: 'Layout & SVG Generator',
      workerSublabel: 'synthesize editorial HTML/SVG',
      workerRole: '@diagram-designer',
      acceptanceLabel: 'Brand Token Verifier',
      acceptanceSublabel: '39 visual rules & tokens',
      codeReviewLabel: 'SVG DOM Linter',
      codeReviewSublabel: 'clean viewBox, responsive paths',
      deliveryLabel: 'Publish Diagram Artifact',
      deliverySublabel: 'export self-contained HTML/SVG',
      doneLabel: 'Diagram Published',
      doneSublabel: 'rendered artifact linked in ledger',
      steps: [
        {
          id: 'step-1',
          stageKey: 'input',
          phase: 'INGESTION',
          title: 'Visual Requirement & Ontology Mapping',
          role: '@orchestrator',
          description: 'Identify visual type (architecture/sequence/state machine) and focal nodes.',
        },
        {
          id: 'step-2',
          stageKey: 'worker',
          phase: 'SYNTHESIS',
          title: 'Editorial SVG & CSS Synthesis',
          role: '@diagram-designer',
          description: 'Generate semantic HTML/SVG markup following 4/10 target density.',
        },
        {
          id: 'step-3',
          stageKey: 'verifying',
          phase: 'VERIFICATION',
          title: 'Editorial Tokens & Linter Validation',
          role: '@style-verifier',
          description: 'Audit palette tokens, responsive viewBox, and accessibility labels.',
        },
        {
          id: 'step-4',
          stageKey: 'delivery',
          phase: 'DELIVERY',
          title: 'Artifact Export & Presentation',
          role: '@delivery-worker',
          description: 'Package standalone HTML/SVG into workspace artifacts directory.',
        },
        {
          id: 'step-5',
          stageKey: 'merged',
          phase: 'CLOSURE',
          title: 'Artifact Published & Ledger Sealed',
          role: '@ledger-daemon',
          description: 'Mount artifact into docs/assets and record durable receipt.',
        },
      ],
    };
  }

  if (p.includes('audit') || p.includes('security') || p.includes('dwd') || p.includes('token') || p.includes('auth')) {
    return {
      goalId: `goal-${Date.now()}`,
      goalPrompt: prompt,
      goalType: 'audit',
      planTitle: 'Security & Token Governance Audit Plan',
      planSummary: 'Dispatches non-interactive auditors to inspect OAuth scopes, credential boundaries, and compliance invariant baselines.',
      isSample,
      workerLabel: 'Security & Scope Scanner',
      workerSublabel: 'surface scan & token audit',
      workerRole: '@security-auditor',
      acceptanceLabel: 'Scope Least-Privilege Gate',
      acceptanceSublabel: 'zero over-granted scopes',
      codeReviewLabel: 'SAIF Compliance Verifier',
      codeReviewSublabel: '100% security baseline',
      deliveryLabel: 'Publish Security Attestation',
      deliverySublabel: 'sign ledger audit report',
      doneLabel: 'Audit Certified',
      doneSublabel: 'attestation sealed in SQLite',
      steps: [
        {
          id: 'step-1',
          stageKey: 'input',
          phase: 'INGESTION',
          title: 'Audit Target & Credential Ingestion',
          role: '@orchestrator',
          description: 'Verify workspace DWD status, API surfaces, and cryptographic keys.',
        },
        {
          id: 'step-2',
          stageKey: 'worker',
          phase: 'SYNTHESIS',
          title: 'Surface Scan & Scope Inventory',
          role: '@security-auditor',
          description: 'Enumerate effective permissions, active service accounts, and token TTLs.',
        },
        {
          id: 'step-3',
          stageKey: 'verifying',
          phase: 'VERIFICATION',
          title: 'Dual Compliance & Isolation Review',
          role: '@compliance-verifier',
          description: 'Audit against least-privilege rules and data-loss prevention boundaries.',
        },
        {
          id: 'step-4',
          stageKey: 'delivery',
          phase: 'DELIVERY',
          title: 'Attestation Signing & Sealing',
          role: '@delivery-worker',
          description: 'Cryptographically sign security report with node authority key.',
        },
        {
          id: 'step-5',
          stageKey: 'merged',
          phase: 'CLOSURE',
          title: 'Audit Attestation Sealed',
          role: '@ledger-daemon',
          description: 'Commit compliance receipt into immutable run ledger.',
        },
      ],
    };
  }

  // Default: Feature change / General software engineering goal
  return {
    goalId: `goal-${Date.now()}`,
    goalPrompt: prompt,
    goalType: 'feature',
    planTitle: 'Autonomous Software Change Plan',
    planSummary: 'Ingests goal requirements, synthesizes workspace code, proves invariants with independent review, and delivers via Git.',
    isSample,
    workerLabel: 'Initial Implementation',
    workerSublabel: 'workspace synthesis + tests',
    workerRole: '@speculative-coder',
    acceptanceLabel: 'Acceptance Review',
    acceptanceSublabel: '14/14 acceptance tests passed',
    codeReviewLabel: 'Code Review',
    codeReviewSublabel: '0 defects / 0 lint errors',
    deliveryLabel: 'Commit + Push PR + Merge',
    deliverySublabel: 'Git delivery & CI merge queue',
    doneLabel: 'Done (Merged to Main)',
    doneSublabel: 'verified commit merged to main',
    steps: [
      {
        id: 'step-1',
        stageKey: 'input',
        phase: 'INGESTION',
        title: 'Goal Requirement & Contract Ingestion',
        role: '@orchestrator',
        description: 'Read repo invariants, validate preconditions, and setup worktree session.',
      },
      {
        id: 'step-2',
        stageKey: 'worker',
        phase: 'SYNTHESIS',
        title: 'Initial Implementation & Test Matrix',
        role: '@speculative-coder',
        description: 'Synthesize AST changes in isolated sandbox and author acceptance tests.',
      },
      {
        id: 'step-3',
        stageKey: 'verifying',
        phase: 'VERIFICATION',
        title: 'Independent Parallel Review Loop',
        role: '@verifier-matrix',
        description: 'Concurrently run acceptance verifier and code review in clean containers.',
      },
      {
        id: 'step-4',
        stageKey: 'delivery',
        phase: 'DELIVERY',
        title: 'Commit, Push PR, & Merge Checks',
        role: '@delivery-worker',
        description: 'Push branch ref, verify required CI contexts, and execute squash merge.',
      },
      {
        id: 'step-5',
        stageKey: 'merged',
        phase: 'CLOSURE',
        title: 'Merge Receipt & Run Closeout',
        role: '@ledger-daemon',
        description: 'Tombstone run activity and record durable merge receipt in ledger.',
      },
    ],
  };
}

interface OrchestrationGraphViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  items?: PetriItem[];
  onAdvanceStage?: (itemId: string) => void;
  onOpenApproval?: (item: PetriItem) => void;
  onSubmitGoal?: (goal: string) => void;
}

export const OrchestrationGraphView: React.FC<OrchestrationGraphViewProps> = ({
  activeWorkspace,
  activeUser,
  items = [],
  onSubmitGoal,
}) => {
  // Theme defaults to 'porcelain' to seamlessly match the rest of the application
  const [theme, setTheme] = useState<'obsidian' | 'porcelain'>('porcelain');

  // Active stage in the software-change orchestration graph
  const [activeStage, setActiveStage] = useState<GraphStage>('input');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.5);
  const [repairCount, setRepairCount] = useState<number>(0);
  const [simulateRepair, setSimulateRepair] = useState<boolean>(false);
  const [simulateDeliveryConflict, setSimulateDeliveryConflict] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('goal');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Goal planning state
  const defaultGoalPrompt = items[0]?.title || 'Add structured JSON output with acceptance tests';
  const [goalInput, setGoalInput] = useState<string>('');
  const [activeGraph, setActiveGraph] = useState<DynamicGoalGraph>(() =>
    buildGoalGraph(defaultGoalPrompt, true)
  );

  const [isPlanDrawerOpen, setIsPlanDrawerOpen] = useState<boolean>(true);

  // Handle plan submission
  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = goalInput.trim();
    if (!prompt) return;

    const newGraph = buildGoalGraph(prompt, false);
    setActiveGraph(newGraph);
    setActiveStage('input');
    setIsPlaying(true);
    setRepairCount(0);
    onSubmitGoal?.(prompt);
  };

  const handleSelectPreset = (prompt: string) => {
    setGoalInput(prompt);
    const newGraph = buildGoalGraph(prompt, false);
    setActiveGraph(newGraph);
    setActiveStage('input');
    setIsPlaying(false);
    setRepairCount(0);
  };

  // Stage progression step function
  const advanceStep = () => {
    setActiveStage((curr) => {
      switch (curr) {
        case 'idle':
          return 'input';
        case 'input':
          return 'worker';
        case 'worker':
          return 'verifying';
        case 'verifying':
          return 'choice';
        case 'choice':
          if (simulateRepair && repairCount < 1) {
            setRepairCount((c) => c + 1);
            return 'repair';
          }
          return 'delivery';
        case 'repair':
          return 'verifying';
        case 'delivery':
          if (simulateDeliveryConflict) {
            return 'delivery_repair';
          }
          return 'merged';
        case 'delivery_repair':
          return 'verifying';
        case 'merged':
          return 'idle';
        default:
          return 'idle';
      }
    });
  };

  // Reset graph simulation
  const resetGraph = () => {
    setActiveStage('input');
    setIsPlaying(false);
    setRepairCount(0);
  };

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(800, 2400 / playbackSpeed);
    const timer = setInterval(() => {
      setActiveStage((curr) => {
        if (curr === 'merged') {
          setIsPlaying(false);
          return 'merged';
        }
        switch (curr) {
          case 'idle':
            return 'input';
          case 'input':
            return 'worker';
          case 'worker':
            return 'verifying';
          case 'verifying':
            return 'choice';
          case 'choice':
            if (simulateRepair && repairCount < 1) {
              setRepairCount((c) => c + 1);
              return 'repair';
            }
            return 'delivery';
          case 'repair':
            return 'verifying';
          case 'delivery':
            if (simulateDeliveryConflict) {
              return 'delivery_repair';
            }
            return 'merged';
          case 'delivery_repair':
            return 'verifying';
          default:
            return 'idle';
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, simulateRepair, simulateDeliveryConflict, repairCount]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Status badge text & color based on activeStage
  const statusBadge = useMemo(() => {
    switch (activeStage) {
      case 'input':
        return { label: 'GOAL RECEIVED', color: 'text-[#FF5F1F] bg-[#FF5F1F]/10 border-[#FF5F1F]/30' };
      case 'worker':
        return { label: 'IMPLEMENTING', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
      case 'verifying':
        return { label: 'INDEPENDENT REVIEW', color: 'text-[#0ABAB5] bg-[#0ABAB5]/10 border-[#0ABAB5]/30' };
      case 'choice':
        return { label: 'EVALUATING VERDICTS', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' };
      case 'repair':
        return { label: `REPAIRING (${repairCount}/10)`, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
      case 'delivery':
        return { label: 'DELIVERING', color: 'text-sky-500 bg-sky-500/10 border-sky-500/30' };
      case 'delivery_repair':
        return { label: 'REPAIRING CI CONFLICT', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
      case 'merged':
        return { label: 'DONE (MERGED)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { label: 'READY', color: 'text-stone-400 bg-stone-500/10 border-stone-500/20' };
    }
  }, [activeStage, repairCount]);

  const isObsidian = theme === 'obsidian';

  // Compute live step status in the work plan
  const getStepStatus = (stepStage: GraphStage) => {
    const stageOrder: GraphStage[] = ['input', 'worker', 'verifying', 'delivery', 'merged'];
    const currentStageIdx = stageOrder.indexOf(activeStage === 'choice' || activeStage === 'repair' ? 'verifying' : activeStage === 'delivery_repair' ? 'delivery' : activeStage);
    const stepStageIdx = stageOrder.indexOf(stepStage);

    if (activeStage === 'merged') return 'completed';
    if (stepStageIdx < currentStageIdx) return 'completed';
    if (stepStageIdx === currentStageIdx) {
      if (activeStage === 'repair' || activeStage === 'delivery_repair') return 'repairing';
      return 'in_progress';
    }
    return 'pending';
  };

  return (
    <div
      className={`flex-1 w-full h-full flex flex-col overflow-y-auto font-sans transition-colors duration-200 ${
        isObsidian ? 'bg-[#0f0f10] text-[#e3e3e3]' : 'bg-[#FAFBFB] text-stone-900'
      }`}
    >
      {/* Top Header */}
      <div
        className={`px-6 sm:px-10 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-2xl ${
          isObsidian ? 'bg-[#0f0f10]/90 border-stone-800' : 'bg-white/90 border-stone-200/80'
        }`}
      >
        {/* Left: Dynamic Header & Plan Mode */}
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-[#FF5F1F] font-bold tracking-wide">PETRI ORCHESTRATION</span>
            <span className={isObsidian ? 'text-stone-600' : 'text-stone-400'}>·</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                activeGraph.isSample
                  ? 'bg-stone-100 border-stone-300 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
                  : 'bg-[#0ABAB5]/10 border-[#0ABAB5]/30 text-[#0ABAB5]'
              }`}
            >
              {activeGraph.isSample ? 'SAMPLE BASELINE GRAPH' : 'DYNAMIC GOAL PLAN'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center space-x-2">
            <span>{activeGraph.planTitle}</span>
          </h1>
        </div>

        {/* Center: Graph Runtime Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Run/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`subtle-depth-interactive px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-[#FF5F1F] hover:bg-orange-600 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Run Graph'}</span>
          </button>

          {/* Single Step Forward */}
          <button
            type="button"
            onClick={advanceStep}
            className={`subtle-depth-interactive px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-1 transition-colors ${
              isObsidian
                ? 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-200'
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <span>Step</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={resetGraph}
            className={`subtle-depth-interactive p-1.5 rounded-xl text-xs border transition-colors ${
              isObsidian
                ? 'bg-stone-900/90 hover:bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-500'
            }`}
            title="Reset Graph to Initial Goal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Playback Speed Selector */}
          <div className="flex items-center space-x-1 pl-1">
            {[1, 1.5, 2.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                  playbackSpeed === speed
                    ? 'bg-[#0ABAB5]/20 border-[#0ABAB5] text-[#0ABAB5] font-bold'
                    : isObsidian
                    ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Test Simulation Toggles */}
          <div className="hidden sm:flex items-center space-x-1.5 pl-2 border-l border-stone-200 dark:border-stone-700/50">
            <button
              type="button"
              onClick={() => setSimulateRepair(!simulateRepair)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                simulateRepair
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-600 dark:text-rose-300 font-semibold'
                  : isObsidian
                  ? 'bg-stone-900/50 border-stone-800 text-stone-400 hover:text-stone-200'
                  : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}
            >
              Repair Loop: {simulateRepair ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => setSimulateDeliveryConflict(!simulateDeliveryConflict)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                simulateDeliveryConflict
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-600 dark:text-rose-300 font-semibold'
                  : isObsidian
                  ? 'bg-stone-900/50 border-stone-800 text-stone-400 hover:text-stone-200'
                  : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}
            >
              CI Conflict: {simulateDeliveryConflict ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Right: Work Plan Toggle & Theme Switcher */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPlanDrawerOpen(!isPlanDrawerOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              isPlanDrawerOpen
                ? 'bg-[#0ABAB5]/10 border-[#0ABAB5]/40 text-[#0ABAB5]'
                : isObsidian
                ? 'bg-stone-900 border-stone-800 text-stone-400'
                : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Work Plan ({activeGraph.steps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(isObsidian ? 'porcelain' : 'obsidian')}
            className={`p-1.5 rounded-xl border transition-colors ${
              isObsidian
                ? 'bg-stone-900/90 border-stone-800 text-stone-300 hover:text-white'
                : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
            title={`Switch to ${isObsidian ? 'Porcelain Light' : 'Obsidian Dark'}`}
          >
            {isObsidian ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>
        </div>
      </div>

      {/* Interactive Goal Planning & Plan Generation Bar */}
      <div
        className={`px-6 sm:px-10 py-3.5 border-b shadow-xs transition-colors ${
          isObsidian ? 'bg-stone-950/70 border-stone-800/80' : 'bg-white border-stone-200/80'
        }`}
      >
        <form onSubmit={handlePlanSubmit} className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="What goal do you want to plan and execute? (e.g. Implement bounded retry queue, Fix jump velocity, Create architecture diagram)..."
              className={`w-full pl-3.5 pr-10 py-2 rounded-xl text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 transition-all font-sans border ${
                isObsidian
                  ? 'bg-stone-900/90 border-stone-700 text-white'
                  : 'bg-stone-50 hover:bg-stone-100/60 focus:bg-white border-stone-200 text-stone-900'
              }`}
            />
            {goalInput && (
              <button
                type="button"
                onClick={() => setGoalInput('')}
                className="absolute right-3 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0ABAB5] hover:bg-[#099b97] text-white text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Plan & Follow Graph</span>
            </button>
          </div>
        </form>

        {/* Quick Goal Preset Chips */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-stone-400 text-[11px] mr-1 font-mono">Preset Templates:</span>
          {PRESET_GOALS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset.prompt)}
              className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors flex items-center space-x-1.5 ${
                isObsidian
                  ? 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border-stone-200/70'
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Container: Split View between Graph SVG Canvas & Goal Work Plan Checklist */}
      <div className="flex-1 p-4 sm:p-8 flex flex-col xl:flex-row items-start gap-6 overflow-x-auto min-h-[640px]">
        {/* Left / Center Area: SVG Orchestration Diagram Canvas */}
        <div className="flex-1 w-full flex flex-col items-center select-text">
          <div
            className={`w-full max-w-[1240px] p-4 sm:p-6 rounded-3xl border shadow-sm transition-colors ${
              isObsidian
                ? 'bg-[#111113] border-stone-800'
                : 'bg-white border-stone-200/90 shadow-stone-100'
            }`}
          >
            <svg
              viewBox="0 0 1200 600"
              className="w-full h-auto overflow-visible"
              style={{ minWidth: '940px' }}
            >
              <defs>
                {/* Arrow markers */}
                <marker
                  id="arrowhead-muted"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 0 L 8 4 L 0 8 Z" fill={isObsidian ? '#404040' : '#cbd5e1'} />
                </marker>
                <marker
                  id="arrowhead-active"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 0 L 8 4 L 0 8 Z" fill="#FF5F1F" />
                </marker>
                <marker
                  id="arrowhead-teal"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 0 L 8 4 L 0 8 Z" fill="#0ABAB5" />
                </marker>
                <marker
                  id="arrowhead-green"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 0 L 8 4 L 0 8 Z" fill="#10b981" />
                </marker>
                <marker
                  id="arrowhead-rose"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 0 L 8 4 L 0 8 Z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* --- 1. ENCLOSING BOUNDARY: INDEPENDENT REVIEW LOOP (Max 10 iterations) --- */}
              <g>
                <rect
                  x="410"
                  y="60"
                  width="440"
                  height="460"
                  rx="20"
                  ry="20"
                  fill={isObsidian ? '#141416' : '#FAFBFB'}
                  stroke={
                    activeStage === 'verifying' || activeStage === 'choice' || activeStage === 'repair'
                      ? '#0ABAB5'
                      : isObsidian
                      ? '#2a2a2e'
                      : '#e2e8f0'
                  }
                  strokeWidth={activeStage === 'verifying' || activeStage === 'repair' ? '2.5' : '1.5'}
                  strokeDasharray={activeStage === 'repair' ? '6 4' : undefined}
                  className="transition-all duration-300"
                />
                <text
                  x="430"
                  y="92"
                  fill={isObsidian ? '#a3a3a3' : '#64748b'}
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="1.2"
                  fontFamily="monospace"
                >
                  INDEPENDENT REVIEW LOOP
                </text>

                {/* Max iterations badge */}
                <rect
                  x="705"
                  y="74"
                  width="130"
                  height="24"
                  rx="12"
                  ry="12"
                  fill={isObsidian ? '#222226' : '#f1f5f9'}
                  stroke={isObsidian ? '#333338' : '#e2e8f0'}
                  strokeWidth="1"
                />
                <text
                  x="770"
                  y="90"
                  fill={isObsidian ? '#d4d4d8' : '#475569'}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  MAX 10 ITERATIONS
                </text>
              </g>

              {/* --- CONNECTING PATHS & ARROWS --- */}
              {/* Edge 1: Goal -> Worker */}
              <path
                d="M 170 290 L 210 290"
                fill="none"
                stroke={activeStage === 'worker' ? '#FF5F1F' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'worker' ? 3 : 2}
                markerEnd={activeStage === 'worker' ? 'url(#arrowhead-active)' : 'url(#arrowhead-muted)'}
                strokeDasharray={activeStage === 'worker' ? '4 3' : undefined}
              />

              {/* Edge 2: Worker -> Fork to Acceptance Review & Code Review */}
              <path
                d="M 370 290 C 395 290, 400 170, 440 170"
                fill="none"
                stroke={activeStage === 'verifying' ? '#0ABAB5' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'verifying' ? 2.5 : 1.5}
                markerEnd={activeStage === 'verifying' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
              />
              <path
                d="M 370 290 C 395 290, 400 410, 440 410"
                fill="none"
                stroke={activeStage === 'verifying' ? '#0ABAB5' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'verifying' ? 2.5 : 1.5}
                markerEnd={activeStage === 'verifying' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
              />

              {/* Edge 3: Acceptance Review -> Review Result */}
              <path
                d="M 600 170 C 640 170, 640 290, 670 290"
                fill="none"
                stroke={activeStage === 'choice' ? '#0ABAB5' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'choice' ? 2.5 : 1.5}
                markerEnd={activeStage === 'choice' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
              />

              {/* Edge 4: Code Review -> Review Result */}
              <path
                d="M 600 410 C 640 410, 640 290, 670 290"
                fill="none"
                stroke={activeStage === 'choice' ? '#0ABAB5' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'choice' ? 2.5 : 1.5}
                markerEnd={activeStage === 'choice' ? 'url(#arrowhead-teal)' : 'url(#arrowhead-muted)'}
              />

              {/* Edge 5: Review Result -> Repair (REJECTED loop) */}
              <path
                d="M 730 330 L 730 430"
                fill="none"
                stroke={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'repair' ? 2.5 : 1.5}
                markerEnd={activeStage === 'repair' ? 'url(#arrowhead-rose)' : 'url(#arrowhead-muted)'}
                strokeDasharray="4 3"
              />
              <text
                x="745"
                y="380"
                fill={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#71717a' : '#94a3b8'}
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                REJECTED
              </text>

              {/* Edge 6: Repair Loopback -> Top of Review Container (REVIEW AGAIN) */}
              <path
                d="M 650 470 C 430 470, 420 300, 435 180"
                fill="none"
                stroke={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#2e2e33' : '#e2e8f0'}
                strokeWidth={activeStage === 'repair' ? 2.5 : 1.5}
                markerEnd={activeStage === 'repair' ? 'url(#arrowhead-rose)' : 'url(#arrowhead-muted)'}
                strokeDasharray="5 3"
              />
              <text
                x="450"
                y="340"
                fill={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#52525b' : '#94a3b8'}
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                transform="rotate(-90 450 340)"
              >
                REVIEW AGAIN
              </text>

              {/* Edge 7: Review Result -> Delivery (ACCEPTED path) */}
              <path
                d="M 790 290 L 890 290"
                fill="none"
                stroke={activeStage === 'delivery' || activeStage === 'merged' ? '#10b981' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'delivery' || activeStage === 'merged' ? 2.5 : 1.5}
                markerEnd={activeStage === 'delivery' || activeStage === 'merged' ? 'url(#arrowhead-green)' : 'url(#arrowhead-muted)'}
              />
              <text
                x="815"
                y="278"
                fill={activeStage === 'delivery' || activeStage === 'merged' ? '#10b981' : isObsidian ? '#71717a' : '#64748b'}
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ACCEPTED
              </text>

              {/* Edge 8: Delivery -> Done (Merge receipt) */}
              <path
                d="M 1050 290 L 1090 290"
                fill="none"
                stroke={activeStage === 'merged' ? '#10b981' : isObsidian ? '#404040' : '#cbd5e1'}
                strokeWidth={activeStage === 'merged' ? 3 : 1.5}
                markerEnd={activeStage === 'merged' ? 'url(#arrowhead-green)' : 'url(#arrowhead-muted)'}
              />

              {/* Edge 9: Delivery Failure Loopback -> Repair Delivery */}
              <path
                d="M 970 330 L 970 430"
                fill="none"
                stroke={activeStage === 'delivery_repair' ? '#f43f5e' : isObsidian ? '#2e2e33' : '#e2e8f0'}
                strokeWidth={activeStage === 'delivery_repair' ? 2.5 : 1.5}
                markerEnd={activeStage === 'delivery_repair' ? 'url(#arrowhead-rose)' : 'url(#arrowhead-muted)'}
                strokeDasharray="4 3"
              />
              <text
                x="985"
                y="380"
                fill={activeStage === 'delivery_repair' ? '#f43f5e' : isObsidian ? '#52525b' : '#94a3b8'}
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                CI FAILED
              </text>

              {/* Edge 10: Repair Delivery loopback to Review Container */}
              <path
                d="M 890 470 C 860 470, 850 310, 790 300"
                fill="none"
                stroke={activeStage === 'delivery_repair' ? '#f43f5e' : isObsidian ? '#2e2e33' : '#e2e8f0'}
                strokeWidth={activeStage === 'delivery_repair' ? 2.5 : 1.5}
                markerEnd={activeStage === 'delivery_repair' ? 'url(#arrowhead-rose)' : 'url(#arrowhead-muted)'}
                strokeDasharray="5 3"
              />

              {/* --- 2. PIPELINE NODES (Exact geometry & Dynamic Goal Binding) --- */}

              {/* Node 1: Goal Input */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('goal')}
              >
                <rect
                  x="30"
                  y="250"
                  width="140"
                  height="80"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'input' ? '#FF5F1F' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'input' ? '2.5' : '1.5'}
                  filter={activeStage === 'input' ? 'drop-shadow(0 4px 12px rgba(255,95,31,0.25))' : undefined}
                />
                <rect x="42" y="262" width="46" height="18" rx="6" fill="#fff7ed" stroke="#fed7aa" />
                <text x="65" y="274" fill="#c2410c" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  INPUT
                </text>
                <text x="42" y="298" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="13" fontWeight="bold">
                  Goal Prompt
                </text>
                <text x="42" y="316" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="10">
                  {activeUser?.name || 'Operator (hideo)'}
                </text>
              </g>

              {/* Node 2: Worker Synthesis */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('worker')}
              >
                <rect
                  x="210"
                  y="250"
                  width="160"
                  height="80"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'worker' ? '#FF5F1F' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'worker' ? '2.5' : '1.5'}
                  filter={activeStage === 'worker' ? 'drop-shadow(0 4px 12px rgba(255,95,31,0.25))' : undefined}
                />
                <rect x="222" y="262" width="60" height="18" rx="6" fill="#fef3c7" stroke="#fde68a" />
                <text x="252" y="274" fill="#b45309" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  WORKER
                </text>
                <text x="222" y="298" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold">
                  {activeGraph.workerLabel}
                </text>
                <text x="222" y="316" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="10">
                  {activeGraph.workerRole}
                </text>
              </g>

              {/* Node 3: Acceptance Review */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('acceptance')}
              >
                <rect
                  x="440"
                  y="130"
                  width="160"
                  height="80"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'verifying' ? '#0ABAB5' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'verifying' ? '2.5' : '1.5'}
                  filter={activeStage === 'verifying' ? 'drop-shadow(0 4px 12px rgba(10,186,181,0.25))' : undefined}
                />
                <rect x="452" y="142" width="66" height="18" rx="6" fill="#f0fdf4" stroke="#bbf7d0" />
                <text x="485" y="154" fill="#15803d" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  VERIFIER
                </text>
                <text x="452" y="178" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold">
                  {activeGraph.acceptanceLabel}
                </text>
                <text x="452" y="196" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="10">
                  {activeGraph.acceptanceSublabel}
                </text>
              </g>

              {/* Node 4: Code Review */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('code_review')}
              >
                <rect
                  x="440"
                  y="370"
                  width="160"
                  height="80"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'verifying' ? '#0ABAB5' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'verifying' ? '2.5' : '1.5'}
                  filter={activeStage === 'verifying' ? 'drop-shadow(0 4px 12px rgba(10,186,181,0.25))' : undefined}
                />
                <rect x="452" y="382" width="66" height="18" rx="6" fill="#f0fdf4" stroke="#bbf7d0" />
                <text x="485" y="394" fill="#15803d" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  VERIFIER
                </text>
                <text x="452" y="418" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold">
                  {activeGraph.codeReviewLabel}
                </text>
                <text x="452" y="436" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="10">
                  {activeGraph.codeReviewSublabel}
                </text>
              </g>

              {/* Node 5: Review Choice */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('choice')}
              >
                <rect
                  x="670"
                  y="250"
                  width="120"
                  height="80"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'choice' ? '#818cf8' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'choice' ? '2.5' : '1.5'}
                />
                <rect x="682" y="262" width="54" height="18" rx="6" fill="#eef2ff" stroke="#c7d2fe" />
                <text x="709" y="274" fill="#4338ca" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  CHOICE
                </text>
                <text x="682" y="298" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold">
                  Review verdict
                </text>
                <text x="682" y="316" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="10">
                  pass or repair
                </text>
              </g>

              {/* Node 6: Repair Node */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('repair')}
              >
                <rect
                  x="650"
                  y="430"
                  width="160"
                  height="70"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'repair' ? '#f43f5e' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'repair' ? '2.5' : '1.5'}
                />
                <rect x="662" y="442" width="100" height="16" rx="6" fill="#ffe4e6" stroke="#fecdd3" />
                <text x="712" y="453" fill="#be123c" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  REJECTED · WORKER
                </text>
                <text x="662" y="474" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="11" fontWeight="bold">
                  Repair from evidence
                </text>
                <text x="662" y="489" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="9.5">
                  bounded retry loop
                </text>
              </g>

              {/* Node 7: Delivery Node */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('delivery')}
              >
                <rect
                  x="890"
                  y="250"
                  width="160"
                  height="80"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'delivery' ? '#0284c7' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'delivery' ? '2.5' : '1.5'}
                />
                <rect x="902" y="262" width="112" height="18" rx="6" fill="#f0f9ff" stroke="#bae6fd" />
                <text x="958" y="274" fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  ACCEPTED · DELIVERY
                </text>
                <text x="902" y="298" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="12" fontWeight="bold">
                  {activeGraph.deliveryLabel}
                </text>
                <text x="902" y="316" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="10">
                  {activeGraph.deliverySublabel}
                </text>
              </g>

              {/* Node 8: Repair Delivery Node */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('delivery_repair')}
              >
                <rect
                  x="890"
                  y="430"
                  width="160"
                  height="70"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'delivery_repair' ? '#f43f5e' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'delivery_repair' ? '2.5' : '1.5'}
                />
                <rect x="902" y="442" width="128" height="16" rx="6" fill="#ffe4e6" stroke="#fecdd3" />
                <text x="966" y="453" fill="#be123c" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  DELIVERY FAILED · WORKER
                </text>
                <text x="902" y="474" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="11" fontWeight="bold">
                  Repair CI Conflict
                </text>
                <text x="902" y="489" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="9.5">
                  re-enters review container
                </text>
              </g>

              {/* Node 9: Done (Merge Receipt) */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedNodeId('done')}
              >
                <rect
                  x="1090"
                  y="250"
                  width="95"
                  height="80"
                  rx="14"
                  ry="14"
                  fill={isObsidian ? '#1c1c1f' : '#ffffff'}
                  stroke={activeStage === 'merged' ? '#10b981' : isObsidian ? '#38383e' : '#e2e8f0'}
                  strokeWidth={activeStage === 'merged' ? '2.5' : '1.5'}
                  filter={activeStage === 'merged' ? 'drop-shadow(0 4px 12px rgba(16,185,129,0.3))' : undefined}
                />
                <rect x="1102" y="262" width="52" height="18" rx="6" fill="#ecfdf5" stroke="#a7f3d0" />
                <text x="1128" y="274" fill="#047857" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  OUTPUT
                </text>
                <text x="1102" y="298" fill={isObsidian ? '#ffffff' : '#0f172a'} fontSize="13" fontWeight="bold">
                  Done
                </text>
                <text x="1102" y="316" fill={isObsidian ? '#a1a1aa' : '#64748b'} fontSize="10">
                  receipt
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right Area: Dynamic Work Plan Checklist Drawer */}
        {isPlanDrawerOpen && (
          <div
            className={`w-full xl:w-96 p-5 rounded-3xl border shadow-sm flex flex-col space-y-4 animate-in fade-in slide-in-from-right-4 duration-200 transition-colors ${
              isObsidian
                ? 'bg-[#111113] border-stone-800'
                : 'bg-white border-stone-200/90 shadow-stone-100'
            }`}
          >
            {/* Drawer Header */}
            <div className="border-b pb-3 flex items-center justify-between border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-[#0ABAB5]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Goal Work Plan
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                {activeGraph.steps.filter((s) => getStepStatus(s.stageKey) === 'completed').length} / {activeGraph.steps.length} done
              </span>
            </div>

            {/* Plan Summary */}
            <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
              <span className="font-semibold text-stone-900 dark:text-white block mb-0.5">Strategy:</span>
              {activeGraph.planSummary}
            </div>

            {/* Steps List */}
            <div className="space-y-2.5 flex-1">
              {activeGraph.steps.map((step, idx) => {
                const status = getStepStatus(step.stageKey);
                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedNodeId(step.stageKey === 'input' ? 'goal' : step.stageKey)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      status === 'in_progress'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                        : status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : status === 'repairing'
                        ? 'bg-rose-500/10 border-rose-500/40'
                        : isObsidian
                        ? 'bg-stone-900/40 border-stone-800 text-stone-400'
                        : 'bg-stone-50/70 border-stone-200/70 text-stone-600 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                        {idx + 1}. {step.phase}
                      </span>
                      {status === 'completed' && (
                        <span className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold font-mono">
                          <Check className="w-3 h-3" />
                          <span>DONE</span>
                        </span>
                      )}
                      {status === 'in_progress' && (
                        <span className="flex items-center space-x-1 text-[10px] text-amber-600 font-bold font-mono animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>RUNNING</span>
                        </span>
                      )}
                      {status === 'repairing' && (
                        <span className="flex items-center space-x-1 text-[10px] text-rose-600 font-bold font-mono">
                          <span>REPAIRING</span>
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="text-[10px] text-stone-400 font-mono">QUEUED</span>
                      )}
                    </div>

                    <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs mb-0.5">
                      {step.title}
                    </div>

                    <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      Assigned: <strong className="text-stone-700 dark:text-stone-300 font-semibold">{step.role}</strong>
                    </div>

                    <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-normal">
                      {step.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400 font-mono text-[11px]">Auto-follows graph state</span>
              <button
                type="button"
                onClick={advanceStep}
                className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs transition-colors flex items-center space-x-1"
              >
                <span>Advance Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Node Event & Trace Inspector Drawer */}
      {selectedNodeId && (
        <div
          className={`mx-4 sm:mx-10 mb-6 p-4 sm:p-5 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-150 transition-colors ${
            isObsidian ? 'bg-[#141416] border-stone-800 text-stone-200' : 'bg-white border-stone-200/90 text-stone-800 shadow-stone-100'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2.5 mb-3 border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#0ABAB5]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0ABAB5]">
                Node Inspector: {selectedNodeId.toUpperCase()}
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Durable SQLite Ledger Event Trace</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              Close ✕
            </button>
          </div>

          {selectedNodeId === 'goal' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-stone-400 dark:text-stone-500">Goal Prompt:</span>
                <p className="text-stone-900 dark:text-stone-100 mt-1 font-sans font-medium">{activeGraph.goalPrompt}</p>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500">Workspace / Worktree:</span>
                <p className="text-stone-900 dark:text-stone-100 mt-1">{activeWorkspace?.name || 'zero-petri'}@main</p>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500">Author & Role:</span>
                <p className="text-stone-900 dark:text-stone-100 mt-1">{activeUser?.name || 'Hideo'} ({activeUser?.role || 'owner'})</p>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500">Goal Type:</span>
                <p className="text-[#0ABAB5] font-semibold mt-1 uppercase">{activeGraph.goalType}</p>
              </div>
            </div>
          )}

          {selectedNodeId === 'worker' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span>Worker Phase: {activeGraph.workerLabel}</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Assigned Agent: {activeGraph.workerRole}</span>
              </div>
              <pre className="p-3 rounded-xl bg-stone-900 text-stone-200 border border-stone-800 text-[11px] overflow-x-auto">
{`[worker:exec] Task dispatch: ${activeGraph.goalPrompt.slice(0, 60)}...
[worker:spec] Invariant ceiling: bounded backpressure queues (no memory leaks)
[worker:diff] AST changes synthesized cleanly with isolated unit tests.`}
              </pre>
            </div>
          )}

          {selectedNodeId === 'acceptance' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">{activeGraph.acceptanceLabel}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">14 / 14 ACCEPTANCE TESTS PASSED</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                ✓ acceptance::test_goal_ingestion ... ok<br />
                ✓ acceptance::test_bounded_repair_concurrency ... ok<br />
                ✓ acceptance::test_durable_sqlite_event_order ... ok<br />
                ✓ acceptance::test_zero_petri_invariants ... ok
              </div>
            </div>
          )}

          {selectedNodeId === 'code_review' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400">{activeGraph.codeReviewLabel}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">0 DEFECTS / 0 LINT ERRORS</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                ✓ clippy::pedantic check passed<br />
                ✓ security::invariant_bounds check passed (no unconstrained buffers)<br />
                ✓ protocol::type_conformance passed
              </div>
            </div>
          )}

          {selectedNodeId === 'choice' && (
            <div className="text-xs font-mono space-y-1">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Dual Review Aggregation:</span>
              <p className="text-stone-700 dark:text-stone-300">
                Both verifiers evaluated. If any defect is detected, triggers bounded repair loop (max 10 iterations). Current verdict: <strong>ACCEPTED</strong>.
              </p>
            </div>
          )}

          {selectedNodeId === 'repair' && (
            <div className="text-xs font-mono space-y-1">
              <span className="text-rose-600 dark:text-rose-400 font-semibold">Repair Worker Dispatch:</span>
              <p className="text-stone-700 dark:text-stone-300">
                Evidence rejection payload dispatched to repair worker. Max bound: 10 iterations. Current repair turn: #{repairCount}.
              </p>
            </div>
          )}

          {selectedNodeId === 'delivery' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-stone-400 dark:text-stone-500">Target Delivery:</span>
                <p className="text-stone-900 dark:text-stone-100 mt-0.5 font-semibold">{activeGraph.deliveryLabel}</p>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500">PR Authority:</span>
                <p className="text-stone-900 dark:text-stone-100 mt-0.5">Merge Queue Verified</p>
              </div>
              <div>
                <span className="text-stone-400 dark:text-stone-500">Required Contexts:</span>
                <p className="text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">ci/native, ci/protocol PASSED</p>
              </div>
            </div>
          )}

          {selectedNodeId === 'done' && (
            <div className="text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Receipt Generated: {activeGraph.doneLabel}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('de653f7e9182', 'commit')}
                  className="flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'commit' ? 'Copied' : 'Copy SHA'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                Goal: {activeGraph.goalPrompt}<br />
                Receipt: commit de653f7e9182 (merged into main)<br />
                Status: Verified and sealed into durable SQLite ledger
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Bar */}
      <div
        className={`px-6 sm:px-10 py-3.5 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-wider transition-colors ${
          isObsidian ? 'bg-[#0f0f10] border-stone-800 text-stone-500' : 'bg-white border-stone-200 text-stone-500'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span>INDEPENDENT REVIEW</span>
          <span>·</span>
          <span>BOUNDED REPAIR</span>
          <span>·</span>
          <span>DURABLE LEDGER</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-stone-400 font-sans">Current Orchestration State:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 ${statusBadge.color}`}
          >
            {statusBadge.label}
          </span>
        </div>
      </div>
    </div>
  );
};
