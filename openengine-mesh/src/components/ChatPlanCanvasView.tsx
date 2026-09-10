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
} from 'lucide-react';
import {
  Workspace,
  UserProfile,
  PlanCanvasDoc,
  PlanAnnotation,
  AgentChatMessage,
} from '../types';

interface ChatPlanCanvasViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  onApprovePlan?: (plan: PlanCanvasDoc) => void;
  onSelectView?: (view: 'board' | 'graph') => void;
}

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

export const ChatPlanCanvasView: React.FC<ChatPlanCanvasViewProps> = ({
  activeWorkspace,
  activeUser,
  onApprovePlan,
  onSelectView,
}) => {
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

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking]);

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

    // Simulate Agent Reasoning & Plan Generation
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyThought = '';
      let replyContent = '';

      if (lower.startsWith('/plan') || lower.includes('plan') || lower.includes('canvas')) {
        const goalTopic = text.replace(/^\/plan\s*/i, '').trim() || text;
        replyThought = `Extracting architectural invariants and phase dependencies for "${goalTopic}"... Synthesizing multi-phase checklist, test matrix, and visual diagram for Plan Canvas.`;
        
        // Dynamically update the Plan Canvas
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
        replyContent = `Understood! I've noted: "${text}". I can adapt the Plan Canvas on the right, or you can use \`/plan <goal>\` to draft a complete new engineering specification.`;
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
    <div className="flex-1 w-full h-full flex flex-col xl:flex-row overflow-hidden font-sans bg-[#FAFBFB] text-stone-900">
      {/* ========================================================================= */}
      {/* 1. LEFT PANE: CONVERSATIONAL AGENT CHAT (ECC Interface)                  */}
      {/* ========================================================================= */}
      <div className="w-full xl:w-[45%] h-full flex flex-col border-r border-stone-200/90 bg-white/80 backdrop-blur-md">
        {/* Chat Top Header */}
        <div className="px-5 py-3.5 border-b border-stone-200/90 bg-white/90 flex items-center justify-between">
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
              <div className="text-[11px] text-stone-400 font-mono">
                Claude 3.7 Sonnet / Gemini 2.5 Flash
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
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
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
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

      {/* ========================================================================= */}
      {/* 2. RIGHT PANE: ECC-STYLE PLAN CANVAS                                      */}
      {/* ========================================================================= */}
      <div className="w-full xl:w-[55%] h-full flex flex-col bg-white overflow-hidden">
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

      {/* Popover: Add Pinned Annotation Modal */}
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
    </div>
  );
};
