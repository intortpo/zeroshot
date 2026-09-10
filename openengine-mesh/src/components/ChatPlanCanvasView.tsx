import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Check,
  CheckCircle2,
  RotateCcw,
  Pin,
  Edit3,
  Eye,
  Bot,
  ShieldCheck,
  Workflow,
  X,
  Plus,
  Trash2,
  Compass,
  Columns,
  MessageSquare,
  Cpu,
  Zap,
  Database,
  GraduationCap,
  Target,
  GitBranch,
  Sliders,
  Layers,
  Save,
  Download,
  ChevronDown,
  CornerDownRight,
  Network,
} from 'lucide-react';
import {
  Workspace,
  UserProfile,
  PlanCanvasDoc,
  PlanAnnotation,
  AgentChatMessage,
  EccOptimizationState,
  PetriItem,
  ChatThread,
} from '../types';
import { EccTerminalConsole } from '../ecc/EccTerminalConsole';
import { executeEccCli } from '../ecc/eccCliEngine';

export type CanvasDisplayMode = 'canvas' | 'split' | 'chat' | 'ecc';

interface ChatPlanCanvasViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  items?: PetriItem[];
  initialMode?: CanvasDisplayMode;
  onApprovePlan?: (plan: PlanCanvasDoc) => void;
  onSelectView?: (view: 'board' | 'graph' | 'node') => void;
  onBranchItem?: (parentItem: PetriItem, branchName: string, subGoal: string) => void;
}

const INITIAL_DEFAULT_ECC_STATE: EccOptimizationState = {
  modelTier: 'sonnet_flash',
  systemPromptSlimming: true,
  promptTokensSavedPercent: 42.6,
  backgroundDaemonEnabled: true,
  sessionPersistenceHooks: true,
  lastSessionSavedAt: Date.now() - 1000 * 60 * 4,
  savedCheckpointsCount: 3,
  autoExtractPatterns: true,
  extractedSkillsCount: 6,
  confidenceThreshold: 0.85,
  evalMode: 'continuous',
  graderType: 'deterministic_test',
  passAt1: 94.2,
  passAt3: 98.8,
  activeGitWorktrees: ['worktree/task-plan-ecc', 'worktree/mesh-ledger-test'],
  cascadeMethodEnabled: true,
  scaleInstancesRecommendation: 3,
  contextSlicingRatio: 14.8,
  iterativeRetrievalEnabled: true,
  activeSubagentSlices: [
    { agent: '@architect', tokenBudget: 24000, tokensUsed: 4200, retrievalCalls: 6 },
    { agent: '@speculative-coder', tokenBudget: 32000, tokensUsed: 11500, retrievalCalls: 14 },
    { agent: '@acceptance-verifier', tokenBudget: 18000, tokensUsed: 3100, retrievalCalls: 4 },
  ],
};

const INITIAL_DEFAULT_PLAN: PlanCanvasDoc = {
  id: 'plan-ecc-01',
  title: 'Bounded SQLite Event Ledger & Concurrent Review Pipeline',
  goalPrompt: 'Implement bounded SQLite retry queues with backpressure and acceptance test suite',
  status: 'review_required',
  version: 1,
  summary: 'Architects an immutable SQLite event ledger with bounded backpressure queues, parallel acceptance review containers, and compare-and-swap Git delivery.',
  objectives: [
    'Enforce a strict 64 MiB unfinished-record buffer guard across async reader streams.',
    'Execute independent parallel acceptance tests and security invariant verifiers.',
    'Guarantee zero silent message drops via explicit backpressure overflow markers.',
  ],
  invariants: [
    'Bounded Memory: Maximum 64 MiB allocated per concurrent provider turn.',
    'Fail-Closed Recovery: Disable MCP and approval bypass during recovery turns.',
    'Safe Timestamps: Produced as positive Unix epoch milliseconds at ingestion boundary.',
  ],
  phases: [
    {
      id: 'phase-1',
      name: 'Phase 1: Invariant Contract & Queue Architecture',
      description: 'Define bounded async queue types and SQLite retry schema.',
      tasks: [
        { id: 't-1', text: 'Define BoundedEventQueue with backpressure channel', completed: true, role: '@speculative-coder' },
        { id: 't-2', text: 'Implement SQLite WAL mode initialization and busy_timeout=5000', completed: true, role: '@speculative-coder' },
        { id: 't-3', text: 'Add fail-closed serialization guard tests', completed: false, role: '@acceptance-verifier' },
      ],
    },
    {
      id: 'phase-2',
      name: 'Phase 2: Worker AST Synthesis & Execution Engine',
      description: 'Synthesize core event-driven reader without unbounded allocations.',
      tasks: [
        { id: 't-4', text: 'Author concurrent stdin/stdout pump with SIGPIPE traps', completed: false, role: '@speculative-coder' },
        { id: 't-5', text: 'Wire SQLite atomic transaction block around ledger commits', completed: false, role: '@speculative-coder' },
      ],
    },
    {
      id: 'phase-3',
      name: 'Phase 3: Dual Independent Review & Verification Matrix',
      description: 'Execute acceptance tests and static security analysis in clean sandbox.',
      tasks: [
        { id: 't-6', text: 'Run 14/14 automated acceptance tests for cancellation safety', completed: false, role: '@acceptance-verifier' },
        { id: 't-7', text: 'Verify 0 Clippy pedantic warnings and 0 unbounded allocations', completed: false, role: '@security-auditor' },
      ],
    },
    {
      id: 'phase-4',
      name: 'Phase 4: Compare-and-Swap Git Delivery & Merge Receipt',
      description: 'Push branch ref, wait through CI checks, and squash merge to main.',
      tasks: [
        { id: 't-8', text: 'Authorize CAS branch push and verify head commit match', completed: false, role: '@delivery-worker' },
        { id: 't-9', text: 'Seal immutable merge receipt into local ledger', completed: false, role: '@ledger-daemon' },
      ],
    },
  ],
  testMatrix: [
    'test_bounded_queue_overflow_emits_explicit_marker',
    'test_concurrent_stdin_stdout_deadlock_freedom',
    'test_sqlite_wal_recovery_after_forced_sigkill',
    'test_acceptance_dual_verifier_consensus',
  ],
  annotations: [
    {
      id: 'ann-1',
      pinNumber: 1,
      sectionId: 'invariants',
      comment: 'Verify that the 64 MiB ceiling is also observed when replaying durable logs.',
      author: 'Hideo (lead)',
      createdAt: Date.now() - 1000 * 60 * 15,
    },
    {
      id: 'ann-2',
      pinNumber: 2,
      sectionId: 'phase-2',
      comment: 'Ensure SQLite busy handler retries up to 3 times before raising SQLITE_BUSY.',
      author: 'Hideo (lead)',
      createdAt: Date.now() - 1000 * 60 * 8,
    },
  ],
  updatedAt: Date.now() - 1000 * 60 * 5,
};

const AVAILABLE_MODELS = [
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', badge: 'Hybrid Reasoning', provider: 'Anthropic' },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', badge: 'Fast Triage', provider: 'Anthropic' },
  { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash', badge: 'Low Latency', provider: 'Google' },
  { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', badge: 'Deep Architecture', provider: 'Google' },
  { id: 'deepseek-r1-local', name: 'DeepSeek-R1', badge: 'Self-Hosted', provider: 'Local Mesh' },
];

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread-ecc-plan',
    title: 'ECC Architecture & Plan Canvas',
    createdAt: Date.now() - 1000 * 60 * 30,
    updatedAt: Date.now() - 1000 * 60 * 5,
    messageCount: 4,
    activeModel: 'Claude 3.7 Sonnet',
  },
  {
    id: 'thread-sqlite-wal',
    title: 'SQLite Event Ledger & Invariants',
    createdAt: Date.now() - 1000 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 45,
    messageCount: 8,
    activeModel: 'Gemini 2.5 Pro',
  },
  {
    id: 'thread-memory-vault',
    title: 'Unified Memory Vault (ecc.memory.v1)',
    createdAt: Date.now() - 1000 * 60 * 240,
    updatedAt: Date.now() - 1000 * 60 * 90,
    messageCount: 5,
    activeModel: 'Claude 3.7 Sonnet',
  },
];

export const ChatPlanCanvasView: React.FC<ChatPlanCanvasViewProps> = ({
  activeWorkspace,
  activeUser,
  items = [],
  initialMode,
  onApprovePlan,
  onSelectView,
  onBranchItem,
}) => {
  // Display Mode: 'canvas' (Plan Canvas Full) | 'split' (Chat + Canvas) | 'chat' (Chat Full) | 'ecc' (ECC Engine Hub)
  const [displayMode, setDisplayMode] = useState<CanvasDisplayMode>(initialMode || 'split');
  const [eccState, setEccState] = useState<EccOptimizationState>(INITIAL_DEFAULT_ECC_STATE);
  const [eccToast, setEccToast] = useState<string | null>(null);

  // Model Selection in upper left of @orchestrator
  const [selectedModelId, setSelectedModelId] = useState<string>('claude-3-7-sonnet');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);

  // Multi-Thread Chat State
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-ecc-plan');
  const [isThreadDropdownOpen, setIsThreadDropdownOpen] = useState<boolean>(false);

  // Branch Modal inside Plan Canvas Visual Tree
  const [branchingTreeItem, setBranchingTreeItem] = useState<PetriItem | null>(null);
  const [treeBranchName, setTreeBranchName] = useState<string>('');
  const [treeSubGoal, setTreeSubGoal] = useState<string>('');

  const showEccToast = (msg: string) => {
    setEccToast(msg);
    setTimeout(() => {
      setEccToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    if (initialMode) {
      setDisplayMode(initialMode);
    }
  }, [initialMode]);

  // Plan Canvas Document State
  const [plan, setPlan] = useState<PlanCanvasDoc>(INITIAL_DEFAULT_PLAN);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Annotation Creation Popover State
  const [annotationInput, setAnnotationInput] = useState<string>('');
  const [targetSectionForPin, setTargetSectionForPin] = useState<string | null>(null);
  const [isAddingPin, setIsAddingPin] = useState<boolean>(false);

  // Chat Conversation State
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      sender: '@orchestrator',
      thought: `Ingested goal requirements from workspace ${activeWorkspace?.name || 'zero-petri'}. Analyzing invariant boundaries and synthesizing initial Plan Canvas...`,
      content: `Hello ${activeUser?.name || 'Hideo'}! I have synthesized an autonomous engineering plan for **${INITIAL_DEFAULT_PLAN.title}** on the **Plan Canvas** to the right.\n\nYou can review each phase, click **[+ Pin Note]** to point-and-annotate specific sections, or hit **✓ Approve Plan** when you are ready to dispatch the agents!`,
      timestamp: Date.now() - 1000 * 60 * 12,
      planRef: 'plan-ecc-01',
    },
  ]);

  // Default prompt is /ecc:plan per user specification
  const [inputPrompt, setInputPrompt] = useState<string>('/ecc:plan ');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking]);

  // Thread Switcher Handlers
  const handleSelectThread = (thread: ChatThread) => {
    setActiveThreadId(thread.id);
    setIsThreadDropdownOpen(false);
    setMessages([
      {
        id: `msg-th-${Date.now()}`,
        role: 'assistant',
        sender: '@orchestrator',
        content: `Switched context to thread **"${thread.title}"** (Active Model: ${thread.activeModel || 'Claude 3.7 Sonnet'}). What would you like to explore or plan?`,
        timestamp: Date.now(),
        planRef: plan.id,
      },
    ]);
  };

  const handleCreateNewThread = () => {
    const newThreadId = `thread-${Date.now().toString(36)}`;
    const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId)?.name || 'Claude 3.7 Sonnet';
    const newThread: ChatThread = {
      id: newThreadId,
      title: `Thread #${threads.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 1,
      activeModel: currentModel,
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
    setIsThreadDropdownOpen(false);
    setMessages([
      {
        id: `msg-new-${Date.now()}`,
        role: 'assistant',
        sender: '@orchestrator',
        thought: 'Initialized clean conversation context for new task planning...',
        content: `Started new thread **"${newThread.title}"**! You can specify goals with \`/ecc:plan <goal>\` or ask architectural questions.`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleTreeBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchingTreeItem || !treeSubGoal.trim()) return;
    onBranchItem?.(
      branchingTreeItem,
      treeBranchName.trim() || `feature/${branchingTreeItem.id.slice(0, 8)}`,
      treeSubGoal.trim()
    );
    showEccToast(`Branched sub-goal from #${branchingTreeItem.id.replace('pt-', '')}`);
    setBranchingTreeItem(null);
    setTreeBranchName('');
    setTreeSubGoal('');
  };

  // Active items and models lookup
  const activeModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];
  const activeThreadObj = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Helper to generate a Plan Canvas for a given goal
  const generatePlanForGoal = (goalTopic: string) => {
    setPlan((prev) => ({
      ...prev,
      id: `plan-${Date.now()}`,
      title: goalTopic.length > 50 ? `${goalTopic.slice(0, 50)}...` : goalTopic,
      goalPrompt: goalTopic,
      status: 'review_required',
      version: prev.version + 1,
      summary: `Comprehensive engineering plan for ${goalTopic}. Structured with test-first reproduction loops, invariant checks, and bounded execution boundaries.`,
      objectives: [
        `Implement core requirements for ${goalTopic.slice(0, 40)}.`,
        'Enforce bounded memory ceilings and backpressure safety.',
        'Construct isolated acceptance test suite before code modification.',
      ],
      phases: [
        {
          id: 'phase-1',
          name: 'Phase 1: Invariant Specification & Preconditions',
          description: 'Map boundary constraints and author test fixtures.',
          tasks: [
            { id: `t-${Date.now()}-1`, text: 'Validate clean baseline worktree & SQLite schema', completed: true, role: '@orchestrator' },
            { id: `t-${Date.now()}-2`, text: 'Construct acceptance test reproduction harness', completed: false, role: '@acceptance-verifier' },
          ],
        },
        {
          id: 'phase-2',
          name: 'Phase 2: Worker AST Implementation',
          description: 'Synthesize minimal non-breaking code changes in sandbox.',
          tasks: [
            { id: `t-${Date.now()}-3`, text: `Implement changes for ${goalTopic.slice(0, 30)}`, completed: false, role: '@speculative-coder' },
            { id: `t-${Date.now()}-4`, text: 'Verify memory bounds & zero unconstrained allocations', completed: false, role: '@speculative-coder' },
          ],
        },
        {
          id: 'phase-3',
          name: 'Phase 3: Verification & Invariant Proof',
          description: 'Independent dual review and consensus evaluation.',
          tasks: [
            { id: `t-${Date.now()}-5`, text: '14/14 automated acceptance tests matrix pass', completed: false, role: '@acceptance-verifier' },
            { id: `t-${Date.now()}-6`, text: 'Zero compiler warnings, 0 lint defects', completed: false, role: '@security-auditor' },
          ],
        },
      ],
      updatedAt: Date.now(),
    }));
  };

  // Handle Chat Submission
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text) return;

    const userMsg: AgentChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      sender: activeUser?.name || 'Hideo',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsAgentThinking(true);

    const lower = text.toLowerCase();

    // Check if input is a direct ECC CLI command, e.g. "ecc ..." or "/ecc ..."
    if (/^(?:\/ecc|ecc)\b/i.test(text)) {
      const rawEccCmd = text.replace(/^\//, ''); // normalize "/ecc" -> "ecc"
      executeEccCli(rawEccCmd)
        .then((result) => {
          if (rawEccCmd.toLowerCase().includes('plan')) {
            const goalTopic = rawEccCmd.replace(/^ecc\s+plan\s*/i, '').trim();
            if (goalTopic) {
              generatePlanForGoal(goalTopic);
            }
          }

          const eccMsg: AgentChatMessage = {
            id: `ecc-${Date.now()}`,
            role: 'assistant',
            sender: '@ecc-cli',
            thought: `Executed bundled ECC CLI command: "${rawEccCmd}" (exit code: ${result.exit_code})`,
            content: `\`\`\`bash\n$ ${rawEccCmd}\n${result.stdout}${result.stderr ? '\n' + result.stderr : ''}\n\`\`\``,
            timestamp: Date.now(),
            planRef: plan.id,
          };
          setMessages((prev) => [...prev, eccMsg]);
          setIsAgentThinking(false);
        })
        .catch((err: any) => {
          const errMsg: AgentChatMessage = {
            id: `ecc-err-${Date.now()}`,
            role: 'assistant',
            sender: '@ecc-cli',
            content: `Error executing ECC command: ${err?.message || String(err)}`,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errMsg]);
          setIsAgentThinking(false);
        });
      return;
    }

    // Simulate Agent Reasoning & Plan Generation
    setTimeout(() => {
      let replyThought = '';
      let replyContent = '';

      if (lower.startsWith('/ecc:plan') || lower.startsWith('/plan') || lower.includes('plan') || lower.includes('canvas')) {
        const goalTopic = text.replace(/^(\/ecc:plan|\/plan)\s*/i, '').trim() || text;
        replyThought = `Extracting architectural invariants and phase dependencies for "${goalTopic}" using model ${activeModelObj.name}... Synthesizing multi-phase checklist, test matrix, and visual diagram for Plan Canvas.`;
        
        // Dynamically update the Plan Canvas
        generatePlanForGoal(goalTopic);

        replyContent = `I have generated a new **Plan Canvas** (v${plan.version + 1}) for **"${goalTopic}"**!\n\nPlease inspect the sections on the canvas to your right. You can add point-and-annotate review notes or hit **✓ Approve Plan** when you are satisfied.`;
      } else if (lower.includes('feedback') || lower.includes('annotation') || lower.includes('revise')) {
        replyThought = 'Ingesting operator annotations from Plan Canvas. Revising plan constraints and adjusting phase tasks...';
        replyContent = `Acknowledged! I have reviewed your pinned annotations and updated the plan accordingly. The invariant guardrails and test matrix have been updated on the canvas.`;
        setPlan((prev) => ({
          ...prev,
          status: 'review_required',
          version: prev.version + 1,
          updatedAt: Date.now(),
        }));
      } else {
        replyThought = 'Evaluating user directive against active plan state...';
        replyContent = `Understood! I've noted: "${text}". I can adapt the Plan Canvas on the right, or you can use \`/plan <goal>\` or \`ecc <command>\` to draft a complete new engineering specification.`;
      }

      const agentMsg: AgentChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        sender: '@orchestrator',
        thought: replyThought,
        content: replyContent,
        timestamp: Date.now(),
        planRef: plan.id,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsAgentThinking(false);
    }, 900);
  };

  // Toggle task completion
  const handleToggleTask = (phaseId: string, taskId: string) => {
    setPlan((prev) => ({
      ...prev,
      phases: prev.phases.map((phase) => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          tasks: phase.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return { ...task, completed: !task.completed };
          }),
        };
      }),
      updatedAt: Date.now(),
    }));
  };

  // Add Annotation Pin
  const handleAddAnnotation = () => {
    if (!annotationInput.trim() || !targetSectionForPin) return;

    const newPinNumber = plan.annotations.length + 1;
    const newAnnotation: PlanAnnotation = {
      id: `ann-${Date.now()}`,
      pinNumber: newPinNumber,
      sectionId: targetSectionForPin,
      comment: annotationInput.trim(),
      author: activeUser?.name || 'Hideo',
      createdAt: Date.now(),
    };

    setPlan((prev) => ({
      ...prev,
      annotations: [...prev.annotations, newAnnotation],
      updatedAt: Date.now(),
    }));

    setAnnotationInput('');
    setTargetSectionForPin(null);
    setIsAddingPin(false);
  };

  // Delete Annotation Pin
  const handleDeleteAnnotation = (annotationId: string) => {
    setPlan((prev) => ({
      ...prev,
      annotations: prev.annotations.filter((a) => a.id !== annotationId),
      updatedAt: Date.now(),
    }));
  };

  // Submit Annotations Back to Chat as Feedback
  const handleSubmitAnnotationsToChat = () => {
    if (plan.annotations.length === 0) return;

    const feedbackText = `I have reviewed the plan canvas and added ${plan.annotations.length} annotation pin(s):\n\n` +
      plan.annotations
        .map((a) => `[Pin #${a.pinNumber}] on section "${a.sectionId}": ${a.comment}`)
        .join('\n') +
      `\n\nPlease revise the plan accordingly.`;

    handleSendMessage(feedbackText);
  };

  // Approve Plan Gate
  const handleApprovePlan = () => {
    setPlan((prev) => ({
      ...prev,
      status: 'approved',
      updatedAt: Date.now(),
    }));

    // Trigger callback to parent App
    onApprovePlan?.(plan);

    // Add confirmation message to chat
    const approvalMsg: AgentChatMessage = {
      id: `sys-${Date.now()}`,
      role: 'system',
      sender: '@mesh-ledger',
      content: `✓ **Plan Approved by ${activeUser?.name || 'Hideo'}!**\n\nThe goal **"${plan.title}"** has been scheduled onto the Petri Kanban Board and Orchestration Graph. Autonomous subagents dispatched.`,
      timestamp: Date.now(),
      planRef: plan.id,
    };

    setMessages((prev) => [...prev, approvalMsg]);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden font-sans bg-[#FAFBFB] text-stone-900">
      {/* Top View Mode & ECC Optimization Header */}
      <div className="px-5 py-2.5 bg-white/95 border-b border-stone-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        {/* Left: View Mode Segmented Switcher */}
        <div className="flex items-center space-x-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80 text-xs">
          <button
            type="button"
            onClick={() => setDisplayMode('canvas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              displayMode === 'canvas'
                ? 'bg-white text-stone-950 shadow-xs border border-stone-200/80 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#FF5F1F]" />
            <span>Plan Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('split')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              displayMode === 'split'
                ? 'bg-white text-stone-950 shadow-xs border border-stone-200/80 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              displayMode === 'chat'
                ? 'bg-white text-stone-950 shadow-xs border border-stone-200/80 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-700" />
            <span>Chat Only</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('ecc')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              displayMode === 'ecc'
                ? 'bg-white text-stone-950 shadow-xs border border-stone-200/80 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>ECC Engine</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
              -42.6%
            </span>
          </button>
        </div>

        {/* Right: Live ECC Telemetry Indicators & Quick Actions */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-stone-500">
            <span className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Tokens: -42.6%</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <GitBranch className="w-3 h-3 text-indigo-600" />
              <span>Worktrees: 2</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
              <Target className="w-3 h-3 text-stone-600" />
              <span>pass@1: 94.2%</span>
            </span>
          </div>

          {onSelectView && (
            <>
              <button
                type="button"
                onClick={() => onSelectView('graph')}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="View in Orchestration Graph"
              >
                <Workflow className="w-3.5 h-3.5 text-[#0ABAB5]" />
                <span className="hidden sm:inline">Graph</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('node')}
                className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Open PySpur Node Studio & Mixture of Experts"
              >
                <Network className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Node (MoE)</span>
              </button>
            </>
          )}

          {displayMode === 'canvas' && (
            <button
              type="button"
              onClick={handleApprovePlan}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ========================================================================= */}
        {/* 1. LEFT PANE: CONVERSATIONAL AGENT CHAT (ECC Interface)                  */}
        {/* ========================================================================= */}
        {(displayMode === 'chat' || displayMode === 'split') && (
          <div className={`h-full flex flex-col border-r border-stone-200/90 bg-white/80 backdrop-blur-md overflow-hidden ${
            displayMode === 'chat' ? 'w-full max-w-4xl mx-auto flex-1' : 'w-full lg:w-[42%] shrink-0'
          }`}>
            {/* Chat Top Header */}
            <div className="px-5 py-3 border-b border-stone-200/90 bg-white/90 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0ABAB5] to-emerald-500 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-stone-900 font-mono">@orchestrator</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-stone-500 font-sans">ECC Agent Harness</span>
                  </div>

                  {/* Interactive Model Selector Dropdown in upper-left */}
                  <div className="relative mt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="text-[11px] font-mono text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-2 py-0.5 rounded-md border border-stone-200/80 flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Select Active AI Model"
                    >
                      <span className="font-semibold text-stone-800">{activeModelObj.name}</span>
                      <span className="text-[10px] text-stone-400">· {activeModelObj.provider}</span>
                      <ChevronDown className="w-3 h-3 text-stone-400" />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-30 font-sans text-xs">
                        <div className="px-3 py-1.5 text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider border-b border-stone-100">
                          Active Model
                        </div>
                        {AVAILABLE_MODELS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedModelId(m.id);
                              setIsModelDropdownOpen(false);
                              showEccToast(`Active model switched to ${m.name}`);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer ${
                              selectedModelId === m.id ? 'bg-teal-50/50 font-medium text-stone-900' : 'text-stone-600'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-mono font-medium">{m.name}</div>
                              <div className="text-[10px] text-stone-400 font-sans">{m.provider} · {m.badge}</div>
                            </div>
                            {selectedModelId === m.id && <Check className="w-3.5 h-3.5 text-[#0ABAB5]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                {/* Multi-Thread Switcher Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsThreadDropdownOpen(!isThreadDropdownOpen)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-xs font-sans text-stone-700 transition-colors cursor-pointer"
                    title="Change Chat Thread"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                    <span className="max-w-[120px] truncate font-medium">{activeThreadObj?.title || 'Thread'}</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>

                  {isThreadDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-30 font-sans text-xs">
                      <div className="px-3 py-1 flex items-center justify-between border-b border-stone-100 pb-1.5">
                        <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider">
                          Threads ({threads.length})
                        </span>
                        <button
                          type="button"
                          onClick={handleCreateNewThread}
                          className="text-[10px] text-[#0ABAB5] font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Thread</span>
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                        {threads.map((th) => (
                          <button
                            key={th.id}
                            type="button"
                            onClick={() => handleSelectThread(th)}
                            className={`w-full text-left px-3 py-2 flex items-start justify-between hover:bg-stone-50 transition-colors cursor-pointer ${
                              activeThreadId === th.id ? 'bg-teal-50/50 text-stone-900 font-medium' : 'text-stone-600'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="truncate text-xs">{th.title}</div>
                              <div className="text-[10px] text-stone-400 font-mono flex items-center space-x-2 mt-0.5">
                                <span>{th.activeModel || 'Claude 3.7'}</span>
                                <span>·</span>
                                <span>{new Date(th.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            {activeThreadId === th.id && <Check className="w-3.5 h-3.5 text-[#0ABAB5] flex-shrink-0 mt-0.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMessages([
                      {
                        id: `msg-${Date.now()}`,
                        role: 'assistant',
                        sender: '@orchestrator',
                        content: 'Session reset. What would you like to plan or execute next?',
                        timestamp: Date.now(),
                      },
                    ]);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Reset Conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 flex items-start space-x-2.5 animate-in fade-in"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] text-stone-400 px-1 font-mono">
                  <span>{msg.sender}</span>
                  <span>·</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-br-xs shadow-xs'
                      : 'bg-white border border-stone-200/90 text-stone-800 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {/* Expandable Thinking Block */}
                  {msg.thought && (
                    <div className="mb-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-600 font-mono">
                      <div className="flex items-center space-x-1.5 font-bold text-stone-700 uppercase tracking-wider text-[9px] mb-1">
                        <Sparkles className="w-3 h-3 text-[#0ABAB5]" />
                        <span>Agent Reasoning</span>
                      </div>
                      <p className="leading-normal">{msg.thought}</p>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.content}
                  </div>

                  {/* Plan Reference Pill */}
                  {msg.planRef && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <span className="text-[#0ABAB5] font-semibold flex items-center space-x-1">
                        <Workflow className="w-3 h-3" />
                        <span>Linked to Plan Canvas</span>
                      </span>
                      <span className="text-stone-400 font-mono text-[10px]">v{plan.version}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAgentThinking && (
            <div className="flex items-center space-x-2 text-xs text-stone-400 p-2">
              <Sparkles className="w-3.5 h-3.5 text-[#0ABAB5] animate-spin" />
              <span className="font-mono text-[11px]">Agent synthesizing plan and reasoning...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Slash Commands Chips */}
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-200/80 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-stone-400 font-bold uppercase">Slash:</span>
          {[
            { cmd: '/plan', label: 'Plan Feature' },
            { cmd: '/goal', label: 'Execute Goal' },
            { cmd: '/grill-me', label: 'Stress-Test' },
            { cmd: '/diagram', label: 'Editorial Diagram' },
            { cmd: '/review', label: 'Verify Invariants' },
          ].map((item) => (
            <button
              key={item.cmd}
              type="button"
              onClick={() => {
                setInputPrompt(`${item.cmd} `);
              }}
              className="px-2 py-0.5 rounded-lg bg-white hover:bg-stone-200/80 border border-stone-200 text-stone-700 text-[11px] font-mono transition-colors"
            >
              {item.cmd}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask agent, type /plan <goal>, or request revisions..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-[#0ABAB5] text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/20 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isAgentThinking}
              className="p-2.5 rounded-xl bg-stone-900 hover:bg-black disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    )}

      {/* ========================================================================= */}
      {/* 2. RIGHT PANE: ECC-STYLE PLAN CANVAS                                      */}
      {/* ========================================================================= */}
      {(displayMode === 'canvas' || displayMode === 'split') && (
        <div className={`h-full flex flex-col bg-white overflow-hidden ${
          displayMode === 'canvas' ? 'w-full max-w-5xl mx-auto flex-1 shadow-sm' : 'flex-1 min-w-0'
        }`}>
          {/* Plan Canvas Header Bar */}
          <div className="px-6 py-3.5 border-b border-stone-200/90 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-[#FF5F1F] font-bold">PLAN CANVAS</span>
              <span className="text-stone-300">·</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-amber-500/10 border-amber-500/30 text-amber-600">
                {plan.status.replace('_', ' ')}
              </span>
              <span className="text-stone-400 text-[10px]">v{plan.version}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 truncate max-w-lg">
              {plan.title}
            </h2>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center space-x-2">
            {onSelectView && (
              <button
                type="button"
                onClick={() => onSelectView('graph')}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                title="View in Orchestration Graph"
              >
                <Workflow className="w-3.5 h-3.5 text-[#0ABAB5]" />
                <span className="hidden sm:inline">Graph</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditMode ? 'Visual Preview' : 'Edit Markdown'}</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitAnnotationsToChat}
              disabled={plan.annotations.length === 0}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                plan.annotations.length > 0
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 hover:bg-amber-500/20 cursor-pointer'
                  : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title="Send pinned review annotations back to agent"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Feedback ({plan.annotations.length})</span>
            </button>

            <button
              type="button"
              onClick={handleApprovePlan}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Plan</span>
            </button>
          </div>
        </div>

        {/* Plan Canvas Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Direct Markdown Edit Mode */}
          {isEditMode ? (
            <div className="space-y-3">
              <div className="text-xs text-stone-500 font-mono flex justify-between">
                <span>Raw Markdown Plan Canvas Editor</span>
                <span>Auto-syncs with ECC agent</span>
              </div>
              <textarea
                value={
                  plan.rawMarkdown ||
                  `# ${plan.title}\n\n## Summary\n${plan.summary}\n\n## Objectives\n${plan.objectives.map((o) => `- ${o}`).join('\n')}\n\n## Invariants\n${plan.invariants.map((i) => `- ${i}`).join('\n')}`
                }
                onChange={(e) => {
                  setPlan((prev) => ({ ...prev, rawMarkdown: e.target.value }));
                }}
                rows={22}
                className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 leading-relaxed"
              />
            </div>
          ) : (
            /* Visual Rich Rendered Canvas */
            <div className="space-y-6 max-w-3xl select-text">
              {/* Plan Summary Card */}
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 text-xs text-stone-700 leading-relaxed relative group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-stone-900 font-mono uppercase tracking-wide text-[10px]">
                    Executive Summary & Strategy
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSectionForPin('summary');
                      setIsAddingPin(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-[#0ABAB5] hover:underline font-mono flex items-center space-x-1 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Pin Note</span>
                  </button>
                </div>
                <p>{plan.summary}</p>
              </div>

              {/* Section 1: Objectives & Scope */}
              <div className="space-y-2 relative group">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <h3 className="text-xs font-bold text-stone-900 font-mono uppercase tracking-wider flex items-center space-x-2">
                    <span>1. Objectives & Scope</span>
                    {plan.annotations.filter((a) => a.sectionId === 'objectives').map((a) => (
                      <span
                        key={a.id}
                        className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold"
                        title={a.comment}
                      >
                        [{a.pinNumber}]
                      </span>
                    ))}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSectionForPin('objectives');
                      setIsAddingPin(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-[#0ABAB5] hover:underline font-mono flex items-center space-x-1 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Pin Note</span>
                  </button>
                </div>

                <ul className="space-y-1.5 text-xs text-stone-700">
                  {plan.objectives.map((obj, oIdx) => (
                    <li key={oIdx} className="flex items-start space-x-2">
                      <span className="text-[#0ABAB5] font-bold select-none">❯</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2: Invariant Guardrails & Security Policies */}
              <div className="space-y-2 relative group">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <h3 className="text-xs font-bold text-stone-900 font-mono uppercase tracking-wider flex items-center space-x-2">
                    <span>2. Invariant Guardrails & Policies</span>
                    {plan.annotations.filter((a) => a.sectionId === 'invariants').map((a) => (
                      <span
                        key={a.id}
                        className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold"
                        title={a.comment}
                      >
                        [{a.pinNumber}]
                      </span>
                    ))}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSectionForPin('invariants');
                      setIsAddingPin(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-[#0ABAB5] hover:underline font-mono flex items-center space-x-1 transition-opacity"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Pin Note</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  {plan.invariants.map((inv, iIdx) => (
                    <div
                      key={iIdx}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 flex items-start space-x-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{inv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Work Breakdown & Implementation Phases */}
              <div className="space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <h3 className="text-xs font-bold text-stone-900 font-mono uppercase tracking-wider flex items-center space-x-2">
                    <span>3. Implementation Phases & Tasks</span>
                    {plan.annotations.filter((a) => a.sectionId.startsWith('phase')).map((a) => (
                      <span
                        key={a.id}
                        className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold"
                        title={a.comment}
                      >
                        [{a.pinNumber}]
                      </span>
                    ))}
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400">
                    Interactive Task Checklist
                  </span>
                </div>

                <div className="space-y-3">
                  {plan.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="p-3.5 rounded-2xl border border-stone-200/90 bg-stone-50/50 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 font-sans">
                          {phase.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetSectionForPin(phase.id);
                            setIsAddingPin(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-[#0ABAB5] hover:underline font-mono flex items-center space-x-1 transition-opacity"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Pin Note</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-stone-500 leading-normal">
                        {phase.description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {phase.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(phase.id, task.id)}
                            className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors text-xs text-stone-800"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded text-[#0ABAB5] focus:ring-[#0ABAB5]"
                            />
                            <span className={task.completed ? 'line-through text-stone-400' : 'font-medium'}>
                              {task.text}
                            </span>
                            {task.role && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-200/80 text-stone-600 ml-auto">
                                {task.role}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Visual Architecture Flowchart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <h3 className="text-xs font-bold text-stone-900 font-mono uppercase tracking-wider">
                    4. Visual Architecture Flow
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400">Inline Canvas Diagram</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center">
                  <svg viewBox="0 0 600 120" className="w-full h-auto max-h-28">
                    <defs>
                      <marker id="arrow-sm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M 0 0 L 6 3 L 0 6 Z" fill="#0ABAB5" />
                      </marker>
                    </defs>
                    <rect x="20" y="35" width="110" height="50" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                    <text x="75" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">Goal Ingestion</text>

                    <path d="M 130 60 L 170 60" stroke="#0ABAB5" strokeWidth="2" markerEnd="url(#arrow-sm)" />

                    <rect x="170" y="35" width="120" height="50" rx="10" fill="#ffffff" stroke="#FF5F1F" strokeWidth="2" />
                    <text x="230" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">Worker Synthesis</text>

                    <path d="M 290 60 L 330 60" stroke="#0ABAB5" strokeWidth="2" markerEnd="url(#arrow-sm)" />

                    <rect x="330" y="25" width="120" height="70" rx="10" fill="#ffffff" stroke="#0ABAB5" strokeWidth="2" />
                    <text x="390" y="55" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">Dual Review</text>
                    <text x="390" y="72" textAnchor="middle" fontSize="8" fill="#64748b">Acceptance + Invariant</text>

                    <path d="M 450 60 L 490 60" stroke="#0ABAB5" strokeWidth="2" markerEnd="url(#arrow-sm)" />

                    <rect x="490" y="35" width="90" height="50" rx="10" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                    <text x="535" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#10b981">Git CAS</text>
                  </svg>
                </div>
              </div>

              {/* Section 5: Verification & Acceptance Test Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <h3 className="text-xs font-bold text-stone-900 font-mono uppercase tracking-wider">
                    5. Verification & Test Matrix
                  </h3>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-800 font-mono text-xs space-y-1">
                  {plan.testMatrix.map((test, tIdx) => (
                    <div key={tIdx} className="flex items-center space-x-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{test}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Visual App & Branch Task Tree */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <div className="flex items-center space-x-2">
                    <Network className="w-3.5 h-3.5 text-[#0ABAB5]" />
                    <h3 className="text-xs font-bold text-stone-900 font-mono uppercase tracking-wider">
                      6. Visual App & Branch Task Tree
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    Tree Hierarchy ({items.length} nodes)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <p className="text-[11px] text-stone-500">
                    Visual tree structure for tasks and branched sub-intents across the mesh. Click <strong>Branch</strong> on any node to fork a sub-goal.
                  </p>

                  <div className="space-y-2 font-sans">
                    {items.map((item) => {
                      const isChild = !!item.parentId;
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isChild
                              ? 'ml-6 border-stone-200 bg-white shadow-2xs relative before:absolute before:-left-4 before:top-4 before:w-3 before:h-2 before:border-b before:border-l before:border-stone-300'
                              : 'border-stone-200/90 bg-white shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              {isChild ? (
                                <CornerDownRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                              ) : (
                                <GitBranch className="w-3.5 h-3.5 text-[#0ABAB5] flex-shrink-0" />
                              )}
                              
                              <span className="font-mono text-[10px] text-stone-400 flex-shrink-0">
                                #{item.commitHash ? item.commitHash.slice(0, 7) : item.id.replace('pt-', '')}
                              </span>

                              <span className="text-xs font-medium text-stone-800 truncate">
                                {item.title}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {item.branchName && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                                  {item.branchName}
                                </span>
                              )}

                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium capitalize border ${
                                item.stage === 'merged'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : item.stage === 'in_flight'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : item.stage === 'gated'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-stone-50 text-stone-600 border-stone-200'
                              }`}>
                                {item.stage.replace('_', ' ')}
                              </span>

                              {onBranchItem && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBranchingTreeItem(item);
                                    const shortId = item.id.replace(/^pt-(commit-)?/, '').slice(0, 8);
                                    setTreeBranchName(`feature/${shortId}-sub`);
                                    setTreeSubGoal('');
                                  }}
                                  className="px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0ABAB5] hover:text-[#099995] text-[10px] font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                                  title="Branch sub-goal from this node"
                                >
                                  <GitBranch className="w-2.5 h-2.5" />
                                  <span>Branch</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Annotations Drawer / Side-Rail (ECC Point-and-Annotate) */}
        {plan.annotations.length > 0 && (
          <div className="border-t border-stone-200/90 bg-stone-50/90 p-4 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-900 font-mono uppercase tracking-wide flex items-center space-x-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span>Pinned Annotations & Operator Feedback ({plan.annotations.length})</span>
              </span>
              <button
                type="button"
                onClick={handleSubmitAnnotationsToChat}
                className="text-[11px] text-[#0ABAB5] font-semibold hover:underline flex items-center space-x-1"
              >
                <span>Send to Agent Chat</span>
                <Send className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="p-2.5 rounded-xl bg-white border border-amber-300 text-xs shadow-2xs space-y-1 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-700">
                      [Pin #{ann.pinNumber}] · {ann.sectionId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnotation(ann.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-stone-800 text-[11px] leading-normal">{ann.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ECC CORE ARCHITECTURE & OPTIMIZATION DASHBOARD (When in 'ecc' mode)   */}
      {/* ========================================================================= */}
      {displayMode === 'ecc' && (
        <div className="flex-1 w-full max-w-6xl mx-auto h-full overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header & Toast */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-indigo-600 font-bold uppercase tracking-wider">ECC Core Architecture</span>
                <span className="text-stone-300">·</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-50 border-indigo-200 text-indigo-700">
                  CLI & Token Optimization Engine
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                Everything Claude Code (ECC) Optimization Hub
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                Dynamic model tiering, system prompt slimming, working memory persistence hooks, continuous learning, verification loops, worktree parallelization, and subagent orchestration.
              </p>
            </div>

            {eccToast && (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{eccToast}</span>
              </div>
            )}
          </div>

          {/* Embedded Bundled ECC CLI Terminal Console */}
          <EccTerminalConsole
            onPlanGenerated={(goal) => {
              generatePlanForGoal(goal);
              showEccToast(`Generated Plan Canvas for "${goal}"`);
            }}
          />

          {/* 6 Core ECC Architectural Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Token Optimization */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    -42.6% TOKENS
                  </span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">1. Token Optimization</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Model selection, system prompt slimming, and background processes.
                </p>

                {/* Model Tier Selector */}
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-mono text-stone-500 font-semibold uppercase">Model Tier Routing</div>
                  <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, modelTier: 'opus_pro' }));
                        showEccToast('Selected Opus 3.5 / Pro 2.5 for deep architecture');
                      }}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        eccState.modelTier === 'opus_pro'
                          ? 'bg-white text-stone-900 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Opus/Pro
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, modelTier: 'sonnet_flash' }));
                        showEccToast('Selected Sonnet 3.7 / Flash 2.5 for balanced execution');
                      }}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        eccState.modelTier === 'sonnet_flash'
                          ? 'bg-white text-stone-900 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Sonnet/Flash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, modelTier: 'haiku_lite' }));
                        showEccToast('Selected Haiku 3.5 / Flash-Lite for fast triage');
                      }}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        eccState.modelTier === 'haiku_lite'
                          ? 'bg-white text-stone-900 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Haiku/Lite
                    </button>
                  </div>
                </div>

                {/* Slimming & Background Toggles */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/80 cursor-pointer">
                    <span className="text-xs text-stone-700 font-medium">System Prompt Slimming</span>
                    <input
                      type="checkbox"
                      checked={eccState.systemPromptSlimming}
                      onChange={(e) => {
                        setEccState((prev) => ({ ...prev, systemPromptSlimming: e.target.checked }));
                        showEccToast(e.target.checked ? 'Enabled system prompt slimming' : 'Disabled prompt slimming');
                      }}
                      className="rounded accent-emerald-600 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/80 cursor-pointer">
                    <span className="text-xs text-stone-700 font-medium">Background Process Daemon</span>
                    <input
                      type="checkbox"
                      checked={eccState.backgroundDaemonEnabled}
                      onChange={(e) => {
                        setEccState((prev) => ({ ...prev, backgroundDaemonEnabled: e.target.checked }));
                        showEccToast(e.target.checked ? 'Background daemon active' : 'Background daemon paused');
                      }}
                      className="rounded accent-emerald-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Memory Persistence */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                    4 HOOKS ACTIVE
                  </span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">2. Memory Persistence</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Hooks that save/load context across sessions automatically.
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                    <div className="text-stone-400 text-[10px]">HOOK 1</div>
                    <div className="font-bold text-emerald-600">session:start</div>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                    <div className="text-stone-400 text-[10px]">HOOK 2</div>
                    <div className="font-bold text-emerald-600">session:save</div>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                    <div className="text-stone-400 text-[10px]">HOOK 3</div>
                    <div className="font-bold text-emerald-600">session:resume</div>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                    <div className="text-stone-400 text-[10px]">HOOK 4</div>
                    <div className="font-bold text-emerald-600">context:dump</div>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 font-mono pt-1">
                  Saved Checkpoints: <span className="font-bold text-stone-800">{eccState.savedCheckpointsCount}</span> (Auto-saved 4m ago)
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEccState((prev) => ({
                      ...prev,
                      savedCheckpointsCount: prev.savedCheckpointsCount + 1,
                      lastSessionSavedAt: Date.now(),
                    }));
                    showEccToast('Persisted session snapshot to .agents/memory/session-ecc-state.json');
                  }}
                  className="flex-1 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-stone-500" />
                  <span>Save Snapshot</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showEccToast('Exported context dump: 3.8 KB JSON snapshot');
                  }}
                  className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                  title="Export Context JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Continuous Learning */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                    {eccState.extractedSkillsCount} REUSABLE SKILLS
                  </span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">3. Continuous Learning</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Auto-extract patterns from sessions into reusable skills.
                </p>

                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-mono text-stone-500 font-semibold uppercase">Extracted Patterns</div>
                  <div className="space-y-1 text-xs">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-stone-800 truncate">safe-log-timestamp-epoch</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">97%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-stone-800 truncate">fail-closed-mcp-recovery</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">94%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-stone-800 truncate">worktree-zero-contamination</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">99%</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEccState((prev) => ({
                    ...prev,
                    extractedSkillsCount: prev.extractedSkillsCount + 1,
                  }));
                  showEccToast('Extracted new skill "bounded-sqlite-queue" into Skills Catalog!');
                }}
                className="w-full py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Auto-Extract Skill from Session</span>
              </button>
            </div>

            {/* 4. Verification Loops */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800">
                    PASS@1: {eccState.passAt1}%
                  </span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">4. Verification Loops</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Checkpoint vs continuous evals, grader types, pass@k metrics.
                </p>

                {/* Eval Strategy Selector */}
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-mono text-stone-500 font-semibold uppercase">Eval Mode</div>
                  <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, evalMode: 'continuous' }));
                        showEccToast('Switched to Continuous Streaming Evals');
                      }}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        eccState.evalMode === 'continuous'
                          ? 'bg-white text-stone-900 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Continuous
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, evalMode: 'checkpoint' }));
                        showEccToast('Switched to Checkpoint Gate Evals');
                      }}
                      className={`py-1 rounded-lg transition-all cursor-pointer ${
                        eccState.evalMode === 'checkpoint'
                          ? 'bg-white text-stone-900 font-bold shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Checkpoint Gate
                    </button>
                  </div>
                </div>

                {/* Grader Type Selector */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono text-stone-500 font-semibold uppercase">Grader Type</div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, graderType: 'deterministic_test' }));
                        showEccToast('Grader: Deterministic Test Runner');
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        eccState.graderType === 'deterministic_test'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      Test Runner
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, graderType: 'invariant_ast' }));
                        showEccToast('Grader: Invariant AST Synthesizer');
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        eccState.graderType === 'invariant_ast'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      AST Invariant
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEccState((prev) => ({ ...prev, graderType: 'llm_judge' }));
                        showEccToast('Grader: LLM-as-a-Judge Rubric');
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        eccState.graderType === 'llm_judge'
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      LLM Judge
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-stone-500 border-t border-stone-100">
                <span>pass@1: <strong className="text-stone-900">{eccState.passAt1}%</strong></span>
                <span>pass@3: <strong className="text-stone-900">{eccState.passAt3}%</strong></span>
                <span className="text-emerald-600 font-bold">14/14 Suites Pass</span>
              </div>
            </div>

            {/* 5. Parallelization */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-600">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800">
                    {eccState.activeGitWorktrees.length} WORKTREES ACTIVE
                  </span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">5. Parallelization</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Git worktrees, cascade method, when to scale instances.
                </p>

                {/* Worktrees list */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-mono text-stone-500 font-semibold uppercase">Isolated Worktree Sandboxes</div>
                  <div className="space-y-1 text-xs font-mono">
                    {eccState.activeGitWorktrees.map((wt) => (
                      <div key={wt} className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                        <span className="text-stone-700 truncate text-[11px]">{wt}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">CLEAN</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scaling Recommendation */}
                <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200/80 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-cyan-800 font-bold">Cascade Scaling Recommendation:</span>
                    <span className="font-bold text-cyan-900">{eccState.scaleInstancesRecommendation} Instances</span>
                  </div>
                  <div className="text-[10px] text-cyan-700 mt-1">
                    DAG width of 3 tasks indicates zero merge conflicts. Fan-out execution ready.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  showEccToast('Triggered git worktree refresh and cascade barrier check');
                }}
                className="w-full py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>Verify Worktree Isolation</span>
              </button>
            </div>

            {/* 6. Subagent Orchestration */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200/80 flex items-center justify-center text-violet-600">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-100 text-violet-800">
                    14.8% SLICE BUDGET
                  </span>
                </div>
                <h3 className="font-bold text-sm text-stone-900">6. Subagent Orchestration</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  The context problem, iterative retrieval pattern.
                </p>

                {/* The Context Problem Solution Info */}
                <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-200/80 text-xs space-y-1">
                  <div className="text-[11px] font-mono font-bold text-violet-900">
                    Context Problem Solved:
                  </div>
                  <p className="text-[10px] text-violet-700 leading-normal">
                    Subagents receive compact task slices (under 15% budget) and query AST iteratively on demand, preventing 100k token context bloat.
                  </p>
                </div>

                {/* Subagents Table */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono text-stone-500 font-semibold uppercase">Active Agent Slices</div>
                  <div className="space-y-1 text-xs font-mono">
                    {eccState.activeSubagentSlices.map((slice) => (
                      <div key={slice.agent} className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-stone-800 font-bold text-[11px]">{slice.agent}</span>
                          <span className="text-stone-400 text-[10px] ml-1.5">{slice.tokensUsed} / {slice.tokenBudget}</span>
                        </div>
                        <span className="text-[10px] text-indigo-600 font-bold">{slice.retrievalCalls} reqs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500 text-[11px]">Iterative Retrieval:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
      {isAddingPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100 font-sans">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 w-full max-w-md shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-stone-100">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-900">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span>Attach Review Annotation to "{targetSectionForPin}"</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPin(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-normal">
              Point-and-annotate feedback will be pinned with a numbered badge and sent back to the agent for revision.
            </p>

            <textarea
              value={annotationInput}
              onChange={(e) => setAnnotationInput(e.target.value)}
              placeholder="e.g. Ensure bounded queue memory ceiling is 64 MiB, or add SQLite WAL recovery test..."
              rows={3}
              autoFocus
              className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/20"
            />

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingPin(false)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAnnotation}
                disabled={!annotationInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-[#0ABAB5] hover:bg-[#099b97] disabled:opacity-50 text-white text-xs font-semibold"
              >
                Pin Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Modal for Tree Nodes */}
      {branchingTreeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleTreeBranchSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 flex flex-col overflow-hidden font-sans"
          >
            <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0ABAB5]">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Branch Sub-goal from Plan Canvas</h3>
                  <p className="text-[11px] text-stone-500 font-sans">
                    Fork a child intent into the visual task tree
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBranchingTreeItem(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold block">
                  Parent Task
                </span>
                <p className="text-stone-800 font-medium line-clamp-2">
                  {branchingTreeItem.title}
                </p>
                <span className="text-[10px] font-mono text-stone-400 block">
                  #{branchingTreeItem.commitHash ? branchingTreeItem.commitHash.slice(0, 7) : branchingTreeItem.id.replace('pt-', '')} · {branchingTreeItem.branchName || 'main'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700 font-mono">
                  Branch Name
                </label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={treeBranchName}
                    onChange={(e) => setTreeBranchName(e.target.value)}
                    placeholder="feature/subtask-name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-mono text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0ABAB5] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700 font-mono">
                  Sub-Goal / Child Intent
                </label>
                <textarea
                  required
                  rows={3}
                  value={treeSubGoal}
                  onChange={(e) => setTreeSubGoal(e.target.value)}
                  placeholder="e.g. Implement isolated memory_read tests for ECC unified memory"
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-300 text-xs font-sans text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#0ABAB5] focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-stone-200/80 bg-stone-50 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setBranchingTreeItem(null)}
                className="px-3.5 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!treeSubGoal.trim()}
                className="px-4 py-1.5 rounded-xl bg-[#0ABAB5] hover:bg-[#099995] disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Create Branch</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
