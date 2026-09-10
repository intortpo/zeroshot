import {
  PySpurWorkflow,
  PySpurNode,
  PySpurEdge,
  PlanCanvasDoc,
  MoeExpertDomain,
} from '../../types';

// ============================================================================
// Mixture of Experts (MoE) Gating Calculation & Semantics
// ============================================================================

export interface MoeGatingResult {
  weights: Record<MoeExpertDomain, number>;
  activeExperts: MoeExpertDomain[];
  domainScores: Record<MoeExpertDomain, number>;
  primaryDomain: MoeExpertDomain;
}

export const EXPERT_DEFINITIONS: Record<
  MoeExpertDomain,
  {
    role: string;
    label: string;
    sublabel: string;
    icon: string;
    modelTier: string;
    keywords: string[];
    description: string;
  }
> = {
  architect: {
    role: '@architect',
    label: 'Architect Expert',
    sublabel: 'Invariants, ADRs & Module Seams',
    icon: 'Layers',
    modelTier: 'claude-3-7-sonnet',
    keywords: ['architecture', 'design', 'schema', 'sqlite', 'ledger', 'boundary', 'adr', 'module', 'contract', 'invariants'],
    description: 'Specializes in boundary contracts, deep module design, invariant specifications, and architectural decision records.',
  },
  speculative_coder: {
    role: '@speculative-coder',
    label: 'Coder Expert',
    sublabel: 'AST Synthesis & Core Logic',
    icon: 'Code2',
    modelTier: 'claude-3-7-sonnet',
    keywords: ['code', 'implement', 'algorithm', 'refactor', 'queue', 'ast', 'rust', 'typescript', 'stream', 'concurrent', 'feature', 'build'],
    description: 'Synthesizes clean, non-breaking implementations, concurrent data structures, and bounded AST reader loops.',
  },
  security_auditor: {
    role: '@security-auditor',
    label: 'Security & Safety Expert',
    sublabel: 'Fail-Closed Boundaries & Sandbox',
    icon: 'ShieldCheck',
    modelTier: 'gpt-4o',
    keywords: ['security', 'audit', 'saif', 'token', 'permission', 'sandbox', 'fail-closed', 'safe', 'cve', 'vulnerability', 'auth'],
    description: 'Enforces fail-closed recovery policies, bounded memory ceilings, credential sanitization, and security posture audits.',
  },
  acceptance_verifier: {
    role: '@acceptance-verifier',
    label: 'Verifier Expert',
    sublabel: 'Test Matrix & Grader Loops',
    icon: 'CheckCircle2',
    modelTier: 'claude-3-5-haiku',
    keywords: ['test', 'verify', 'matrix', 'grader', 'pass', 'repro', 'bug', 'fix', 'assert', 'eval', 'coverage', 'unit'],
    description: 'Constructs isolated failing reproduction tests before code changes, acceptance matrices, and continuous evals.',
  },
  token_optimizer: {
    role: '@token-optimizer',
    label: 'Token & Latency Expert',
    sublabel: 'Context Slimming & Cascades',
    icon: 'Zap',
    modelTier: 'claude-3-5-haiku',
    keywords: ['token', 'optimize', 'cache', 'cost', 'prompt', 'slimming', 'latency', 'speed', 'compress', 'cascade'],
    description: 'Performs system prompt slimming, dynamic model tier selection, context slicing, and background batching.',
  },
};

/**
 * Calculates Softmax gating weights for a goal prompt across the 5 MoE expert domains
 */
export function calculateMoeGating(goalPrompt: string, topK: number = 3): MoeGatingResult {
  const text = goalPrompt.toLowerCase();
  const rawScores: Record<MoeExpertDomain, number> = {
    architect: 1.0,
    speculative_coder: 1.0,
    security_auditor: 0.8,
    acceptance_verifier: 1.0,
    token_optimizer: 0.7,
  };

  // Keyword boost
  (Object.keys(EXPERT_DEFINITIONS) as MoeExpertDomain[]).forEach((domain) => {
    const def = EXPERT_DEFINITIONS[domain];
    def.keywords.forEach((kw) => {
      if (text.includes(kw)) {
        rawScores[domain] += 1.8;
      }
    });
  });

  // Goal length & complexity boost
  if (text.length > 80) {
    rawScores.architect += 0.8;
    rawScores.acceptance_verifier += 0.6;
  }
  if (text.includes('bug') || text.includes('fix') || text.includes('crash')) {
    rawScores.acceptance_verifier += 2.5;
    rawScores.speculative_coder += 1.5;
  }
  if (text.includes('plan') || text.includes('architect') || text.includes('module')) {
    rawScores.architect += 2.8;
  }
  if (text.includes('safe') || text.includes('auth') || text.includes('security')) {
    rawScores.security_auditor += 3.0;
  }

  // Softmax normalization
  const maxScore = Math.max(...Object.values(rawScores));
  const expScores: Record<MoeExpertDomain, number> = {
    architect: Math.exp(rawScores.architect - maxScore),
    speculative_coder: Math.exp(rawScores.speculative_coder - maxScore),
    security_auditor: Math.exp(rawScores.security_auditor - maxScore),
    acceptance_verifier: Math.exp(rawScores.acceptance_verifier - maxScore),
    token_optimizer: Math.exp(rawScores.token_optimizer - maxScore),
  };

  const sumExp = Object.values(expScores).reduce((a, b) => a + b, 0);
  const weights: Record<MoeExpertDomain, number> = {
    architect: Number((expScores.architect / sumExp).toFixed(3)),
    speculative_coder: Number((expScores.speculative_coder / sumExp).toFixed(3)),
    security_auditor: Number((expScores.security_auditor / sumExp).toFixed(3)),
    acceptance_verifier: Number((expScores.acceptance_verifier / sumExp).toFixed(3)),
    token_optimizer: Number((expScores.token_optimizer / sumExp).toFixed(3)),
  };

  // Rank top-k
  const sortedDomains = (Object.keys(weights) as MoeExpertDomain[]).sort(
    (a, b) => weights[b] - weights[a]
  );
  const activeExperts = sortedDomains.slice(0, Math.max(1, Math.min(topK, 5)));
  const primaryDomain = sortedDomains[0];

  return {
    weights,
    activeExperts,
    domainScores: rawScores,
    primaryDomain,
  };
}

// ============================================================================
// Default Flagship PySpur Template: Mixture of Experts (MoE) Planner
// ============================================================================

export function createDefaultMoeWorkflow(initialPrompt: string = 'Implement bounded SQLite retry queues with backpressure and acceptance test suite'): PySpurWorkflow {
  const gating = calculateMoeGating(initialPrompt, 3);

  const nodes: PySpurNode[] = [
    // 1. Goal Input Node
    {
      id: 'node-goal-input',
      type: 'input',
      label: 'Goal Input Node',
      sublabel: 'User Prompt / /plan Directive',
      role: '@user',
      iconName: 'MessageSquare',
      position: { x: 60, y: 240 },
      status: 'completed',
      config: {
        promptTemplate: initialPrompt,
      },
      outputTrace: {
        summary: `Goal registered: "${initialPrompt}"`,
        confidence: 1.0,
        tokensUsed: 48,
        durationMs: 12,
        logs: [`[Input] Received prompt (${initialPrompt.length} chars)`, `[Input] Dispatched to MoE Gating Router`],
      },
      inputs: [],
      outputs: ['output'],
    },

    // 2. MoE Gating Router Node
    {
      id: 'node-moe-router',
      type: 'router',
      label: 'MoE Gating Router',
      sublabel: 'Softmax Domain Classifier (Top-3)',
      role: '@router',
      iconName: 'GitBranch',
      position: { x: 340, y: 240 },
      status: 'completed',
      config: {
        topK: 3,
        temperature: 0.7,
        gatingWeights: gating.weights,
      },
      outputTrace: {
        summary: `Top-3 Experts Activated: ${gating.activeExperts.map((d) => EXPERT_DEFINITIONS[d].role).join(', ')}`,
        confidence: 0.94,
        tokensUsed: 120,
        durationMs: 45,
        logs: [
          `[Router] Evaluated semantic features across 5 expert domains`,
          `[Router] Gating weights: ${JSON.stringify(gating.weights)}`,
          `[Router] Dispatched parallel fan-out to active experts`,
        ],
      },
      inputs: ['input'],
      outputs: ['architect', 'speculative_coder', 'security_auditor', 'acceptance_verifier', 'token_optimizer'],
    },

    // 3. Expert: Architect
    {
      id: 'node-expert-architect',
      type: 'expert',
      label: EXPERT_DEFINITIONS.architect.label,
      sublabel: EXPERT_DEFINITIONS.architect.sublabel,
      role: EXPERT_DEFINITIONS.architect.role,
      iconName: 'Layers',
      position: { x: 680, y: 40 },
      status: gating.activeExperts.includes('architect') ? 'completed' : 'bypassed',
      config: {
        modelTier: EXPERT_DEFINITIONS.architect.modelTier,
        expertDomain: 'architect',
        systemPrompt: 'You are the System Architect Expert. Define clear deep module boundaries, invariant contracts, and phased architectural milestones.',
      },
      outputTrace: {
        summary: 'Architectural invariants defined: 64 MiB buffer ceiling and zero silent drops.',
        confidence: gating.weights.architect,
        tokensUsed: 840,
        durationMs: 240,
        logs: [
          `[Architect] Scanned repository module seams in /crates/`,
          `[Architect] Authored bounded memory contract`,
          `[Architect] Synthesized Phase 1 & Phase 2 boundary definitions`,
        ],
        planFragment: {
          objectives: [
            'Enforce bounded SQLite transaction boundaries with 5s busy timeout',
            'Guarantee zero unconstrained memory allocations on async reader loops',
          ],
          invariants: [
            'Bounded Memory: Maximum 64 MiB allocated per concurrent provider turn',
            'Safe Epoch Milliseconds: Monotonic timestamps produced at boundary',
          ],
        },
      },
      inputs: ['input'],
      outputs: ['output'],
    },

    // 4. Expert: Speculative Coder
    {
      id: 'node-expert-coder',
      type: 'expert',
      label: EXPERT_DEFINITIONS.speculative_coder.label,
      sublabel: EXPERT_DEFINITIONS.speculative_coder.sublabel,
      role: EXPERT_DEFINITIONS.speculative_coder.role,
      iconName: 'Code2',
      position: { x: 680, y: 150 },
      status: gating.activeExperts.includes('speculative_coder') ? 'completed' : 'bypassed',
      config: {
        modelTier: EXPERT_DEFINITIONS.speculative_coder.modelTier,
        expertDomain: 'speculative_coder',
        systemPrompt: 'You are the Speculative Coder Expert. Author minimal non-breaking AST code changes, concurrent worker pipelines, and SQLite transaction blocks.',
      },
      outputTrace: {
        summary: 'Synthesized BoundedEventQueue channel types and async pump loop.',
        confidence: gating.weights.speculative_coder,
        tokensUsed: 1120,
        durationMs: 310,
        logs: [
          `[Coder] Synthesized concurrent stdin/stdout pump with backpressure`,
          `[Coder] Added SQLite atomic transaction block`,
          `[Coder] Verified 0 Clippy pedantic warnings`,
        ],
        planFragment: {
          tasks: [
            { text: 'Define BoundedEventQueue with backpressure channel', role: '@speculative-coder' },
            { text: 'Implement SQLite WAL mode initialization and busy_timeout=5000', role: '@speculative-coder' },
            { text: 'Wire SQLite atomic transaction block around ledger commits', role: '@speculative-coder' },
          ],
        },
      },
      inputs: ['input'],
      outputs: ['output'],
    },

    // 5. Expert: Security Auditor
    {
      id: 'node-expert-security',
      type: 'expert',
      label: EXPERT_DEFINITIONS.security_auditor.label,
      sublabel: EXPERT_DEFINITIONS.security_auditor.sublabel,
      role: EXPERT_DEFINITIONS.security_auditor.role,
      iconName: 'ShieldCheck',
      position: { x: 680, y: 260 },
      status: gating.activeExperts.includes('security_auditor') ? 'completed' : 'bypassed',
      config: {
        modelTier: EXPERT_DEFINITIONS.security_auditor.modelTier,
        expertDomain: 'security_auditor',
        systemPrompt: 'You are the Security & Safety Expert. Ensure fail-closed recovery turns, disable approval bypass, and verify credentials never leak.',
      },
      outputTrace: {
        summary: 'Fail-closed verification: disabled MCP & approval bypass during recovery.',
        confidence: gating.weights.security_auditor,
        tokensUsed: 620,
        durationMs: 180,
        logs: [
          `[Security] Inspected tool invocation permissions in worker session`,
          `[Security] Verified secret-bearing credentials never enter ledger`,
          `[Security] Sealed fail-closed recovery boundary`,
        ],
        planFragment: {
          invariants: [
            'Fail-Closed Recovery: Disable MCP and approval bypass during recovery turns',
            'Credential Isolation: Sanitized target authentication at edge boundary',
          ],
        },
      },
      inputs: ['input'],
      outputs: ['output'],
    },

    // 6. Expert: Acceptance Verifier
    {
      id: 'node-expert-verifier',
      type: 'expert',
      label: EXPERT_DEFINITIONS.acceptance_verifier.label,
      sublabel: EXPERT_DEFINITIONS.acceptance_verifier.sublabel,
      role: EXPERT_DEFINITIONS.acceptance_verifier.role,
      iconName: 'CheckCircle2',
      position: { x: 680, y: 370 },
      status: gating.activeExperts.includes('acceptance_verifier') ? 'completed' : 'bypassed',
      config: {
        modelTier: EXPERT_DEFINITIONS.acceptance_verifier.modelTier,
        expertDomain: 'acceptance_verifier',
        systemPrompt: 'You are the Acceptance Verifier Expert. Generate deterministic failing reproduction tests first, then build test matrices with pass@k grading.',
      },
      outputTrace: {
        summary: 'Constructed 4-point acceptance test matrix with deadlock-freedom proof.',
        confidence: gating.weights.acceptance_verifier,
        tokensUsed: 780,
        durationMs: 210,
        logs: [
          `[Verifier] Authoring test_bounded_queue_overflow_emits_explicit_marker`,
          `[Verifier] Verifying concurrent stdin/stdout deadlock freedom`,
          `[Verifier] Formatted deterministic test runner commands`,
        ],
        planFragment: {
          testMatrix: [
            'test_bounded_queue_overflow_emits_explicit_marker',
            'test_concurrent_stdin_stdout_deadlock_freedom',
            'test_sqlite_wal_recovery_after_forced_sigkill',
            'test_acceptance_dual_verifier_consensus',
          ],
        },
      },
      inputs: ['input'],
      outputs: ['output'],
    },

    // 7. Expert: Token Optimizer
    {
      id: 'node-expert-optimizer',
      type: 'expert',
      label: EXPERT_DEFINITIONS.token_optimizer.label,
      sublabel: EXPERT_DEFINITIONS.token_optimizer.sublabel,
      role: EXPERT_DEFINITIONS.token_optimizer.role,
      iconName: 'Zap',
      position: { x: 680, y: 480 },
      status: gating.activeExperts.includes('token_optimizer') ? 'completed' : 'bypassed',
      config: {
        modelTier: EXPERT_DEFINITIONS.token_optimizer.modelTier,
        expertDomain: 'token_optimizer',
        systemPrompt: 'You are the Token & Latency Expert. Slim system prompts, slice context windows, and maximize prompt caching.',
      },
      outputTrace: {
        summary: 'System prompt slimmed by 42.6%; subagent context sliced to 14.8%.',
        confidence: gating.weights.token_optimizer,
        tokensUsed: 410,
        durationMs: 110,
        logs: [
          `[Optimizer] Stripped redundant instructions from agent prompt`,
          `[Optimizer] Enabled KV cache prefix reuse for worker AST`,
          `[Optimizer] Reduced token burn by 42.6%`,
        ],
      },
      inputs: ['input'],
      outputs: ['output'],
    },

    // 8. MoE Aggregator / Synthesizer Node
    {
      id: 'node-moe-aggregator',
      type: 'aggregator',
      label: 'MoE Synthesizer Node',
      sublabel: 'Ensemble Aggregation & Conflict Resolution',
      role: '@synthesizer',
      iconName: 'Workflow',
      position: { x: 1040, y: 240 },
      status: 'completed',
      config: {
        temperature: 0.3,
        modelTier: 'claude-3-7-sonnet',
      },
      outputTrace: {
        summary: 'Synthesized 4-phase Plan Canvas with 9 tasks, 3 invariants, and 4 tests.',
        confidence: 0.98,
        tokensUsed: 1450,
        durationMs: 420,
        logs: [
          `[Aggregator] Ingested outputs from active experts`,
          `[Aggregator] Weighted fusion applied based on MoE softmax routing`,
          `[Aggregator] Compiled complete Plan Canvas engineering specification`,
        ],
      },
      inputs: ['architect', 'speculative_coder', 'security_auditor', 'acceptance_verifier', 'token_optimizer'],
      outputs: ['output'],
    },

    // 9. Plan Canvas & Kanban Output Node
    {
      id: 'node-plan-output',
      type: 'output',
      label: 'Plan Canvas Dispatch',
      sublabel: 'Petri Board & Chat Handoff',
      role: '@mesh-ledger',
      iconName: 'Target',
      position: { x: 1320, y: 240 },
      status: 'completed',
      config: {},
      outputTrace: {
        summary: 'Ready to dispatch to Plan Canvas or Petri Kanban board.',
        confidence: 1.0,
        tokensUsed: 0,
        durationMs: 5,
        logs: [
          `[Output] Plan Canvas v1 formatted`,
          `[Output] Handoff target: /chat & /board`,
        ],
      },
      inputs: ['input'],
      outputs: [],
    },
  ];

  const edges: PySpurEdge[] = [
    // Goal Input -> MoE Router
    {
      id: 'edge-input-router',
      sourceNodeId: 'node-goal-input',
      sourceHandle: 'output',
      targetNodeId: 'node-moe-router',
      targetHandle: 'input',
      isActive: true,
      label: 'Goal Prompt',
    },
    // MoE Router -> 5 Experts
    {
      id: 'edge-router-architect',
      sourceNodeId: 'node-moe-router',
      sourceHandle: 'architect',
      targetNodeId: 'node-expert-architect',
      targetHandle: 'input',
      weight: gating.weights.architect,
      isActive: gating.activeExperts.includes('architect'),
      label: `w: ${gating.weights.architect}`,
    },
    {
      id: 'edge-router-coder',
      sourceNodeId: 'node-moe-router',
      sourceHandle: 'speculative_coder',
      targetNodeId: 'node-expert-coder',
      targetHandle: 'input',
      weight: gating.weights.speculative_coder,
      isActive: gating.activeExperts.includes('speculative_coder'),
      label: `w: ${gating.weights.speculative_coder}`,
    },
    {
      id: 'edge-router-security',
      sourceNodeId: 'node-moe-router',
      sourceHandle: 'security_auditor',
      targetNodeId: 'node-expert-security',
      targetHandle: 'input',
      weight: gating.weights.security_auditor,
      isActive: gating.activeExperts.includes('security_auditor'),
      label: `w: ${gating.weights.security_auditor}`,
    },
    {
      id: 'edge-router-verifier',
      sourceNodeId: 'node-moe-router',
      sourceHandle: 'acceptance_verifier',
      targetNodeId: 'node-expert-verifier',
      targetHandle: 'input',
      weight: gating.weights.acceptance_verifier,
      isActive: gating.activeExperts.includes('acceptance_verifier'),
      label: `w: ${gating.weights.acceptance_verifier}`,
    },
    {
      id: 'edge-router-optimizer',
      sourceNodeId: 'node-moe-router',
      sourceHandle: 'token_optimizer',
      targetNodeId: 'node-expert-optimizer',
      targetHandle: 'input',
      weight: gating.weights.token_optimizer,
      isActive: gating.activeExperts.includes('token_optimizer'),
      label: `w: ${gating.weights.token_optimizer}`,
    },
    // 5 Experts -> Aggregator
    {
      id: 'edge-architect-aggregator',
      sourceNodeId: 'node-expert-architect',
      sourceHandle: 'output',
      targetNodeId: 'node-moe-aggregator',
      targetHandle: 'architect',
      isActive: gating.activeExperts.includes('architect'),
    },
    {
      id: 'edge-coder-aggregator',
      sourceNodeId: 'node-expert-coder',
      sourceHandle: 'output',
      targetNodeId: 'node-moe-aggregator',
      targetHandle: 'speculative_coder',
      isActive: gating.activeExperts.includes('speculative_coder'),
    },
    {
      id: 'edge-security-aggregator',
      sourceNodeId: 'node-expert-security',
      sourceHandle: 'output',
      targetNodeId: 'node-moe-aggregator',
      targetHandle: 'security_auditor',
      isActive: gating.activeExperts.includes('security_auditor'),
    },
    {
      id: 'edge-verifier-aggregator',
      sourceNodeId: 'node-expert-verifier',
      sourceHandle: 'output',
      targetNodeId: 'node-moe-aggregator',
      targetHandle: 'acceptance_verifier',
      isActive: gating.activeExperts.includes('acceptance_verifier'),
    },
    {
      id: 'edge-optimizer-aggregator',
      sourceNodeId: 'node-expert-optimizer',
      sourceHandle: 'output',
      targetNodeId: 'node-moe-aggregator',
      targetHandle: 'token_optimizer',
      isActive: gating.activeExperts.includes('token_optimizer'),
    },
    // Aggregator -> Plan Output
    {
      id: 'edge-aggregator-output',
      sourceNodeId: 'node-moe-aggregator',
      sourceHandle: 'output',
      targetNodeId: 'node-plan-output',
      targetHandle: 'input',
      isActive: true,
      label: 'Synthesized Plan',
    },
  ];

  return {
    id: 'workflow-moe-planner',
    name: 'Mixture of Experts (MoE) Planner',
    description: 'PySpur visual workflow routing incoming goals across 5 specialized domain experts and synthesizing verified Plan Canvas specifications.',
    templateKey: 'moe_planner',
    nodes,
    edges,
    updatedAt: Date.now(),
  };
}

// ============================================================================
// Additional PySpur Templates
// ============================================================================

export function createAgenticCoderWorkflow(): PySpurWorkflow {
  const nodes: PySpurNode[] = [
    {
      id: 'node-code-input',
      type: 'input',
      label: 'Bug / Feature Directive',
      sublabel: 'User Request',
      role: '@user',
      iconName: 'MessageSquare',
      position: { x: 80, y: 180 },
      status: 'completed',
      config: { promptTemplate: 'Fix jump impulse velocity and platform collision jitter' },
      inputs: [],
      outputs: ['output'],
    },
    {
      id: 'node-code-coder',
      type: 'code',
      label: 'Speculative Coder AST',
      sublabel: 'AST Rewrite & Physics Logic',
      role: '@speculative-coder',
      iconName: 'Code2',
      position: { x: 380, y: 180 },
      status: 'completed',
      config: { modelTier: 'claude-3-7-sonnet', pythonCode: '// Rust AST transformer' },
      inputs: ['input'],
      outputs: ['output'],
    },
    {
      id: 'node-code-test',
      type: 'evaluator',
      label: 'Acceptance Test Runner',
      sublabel: 'Cargo Test & Invariant Matrix',
      role: '@acceptance-verifier',
      iconName: 'CheckCircle2',
      position: { x: 680, y: 180 },
      status: 'completed',
      config: { toolName: 'cargo test --lib' },
      inputs: ['input'],
      outputs: ['output'],
    },
    {
      id: 'node-code-gate',
      type: 'human_approval',
      label: 'Operator Review Gate',
      sublabel: 'Human-in-the-Loop Sign-off',
      role: '@gatekeeper',
      iconName: 'ShieldCheck',
      position: { x: 980, y: 180 },
      status: 'idle',
      config: { timeoutMs: 300000 },
      inputs: ['input'],
      outputs: ['output'],
    },
    {
      id: 'node-code-output',
      type: 'output',
      label: 'Git CAS Delivery',
      sublabel: 'Push Branch & Merge to Main',
      role: '@delivery-worker',
      iconName: 'Target',
      position: { x: 1280, y: 180 },
      status: 'idle',
      config: {},
      inputs: ['input'],
      outputs: [],
    },
  ];

  const edges: PySpurEdge[] = [
    { id: 'e1', sourceNodeId: 'node-code-input', sourceHandle: 'output', targetNodeId: 'node-code-coder', targetHandle: 'input', isActive: true },
    { id: 'e2', sourceNodeId: 'node-code-coder', sourceHandle: 'output', targetNodeId: 'node-code-test', targetHandle: 'input', isActive: true },
    { id: 'e3', sourceNodeId: 'node-code-test', sourceHandle: 'output', targetNodeId: 'node-code-gate', targetHandle: 'input', isActive: true },
    { id: 'e4', sourceNodeId: 'node-code-gate', sourceHandle: 'output', targetNodeId: 'node-code-output', targetHandle: 'input', isActive: false },
  ];

  return {
    id: 'workflow-agentic-coder',
    name: 'Agentic Coder & Grader Loop',
    description: 'PySpur workflow connecting AST code synthesis with automated test execution and human-in-the-loop review gates.',
    templateKey: 'agentic_coder',
    nodes,
    edges,
    updatedAt: Date.now(),
  };
}

export function createRagRetrievalWorkflow(): PySpurWorkflow {
  const nodes: PySpurNode[] = [
    {
      id: 'node-rag-input',
      type: 'input',
      label: 'Query Ingestion',
      sublabel: 'User Question / Context',
      role: '@user',
      iconName: 'MessageSquare',
      position: { x: 80, y: 180 },
      status: 'completed',
      config: { promptTemplate: 'Search ECC memory vault for token optimization patterns' },
      inputs: [],
      outputs: ['output'],
    },
    {
      id: 'node-rag-embed',
      type: 'tool',
      label: 'Memory Chunker & Embedder',
      sublabel: 'Text Vectorization',
      role: '@memory-daemon',
      iconName: 'Cpu',
      position: { x: 380, y: 180 },
      status: 'completed',
      config: { toolName: 'ecc_embed_vault' },
      inputs: ['input'],
      outputs: ['output'],
    },
    {
      id: 'node-rag-search',
      type: 'tool',
      label: 'Vector Database Matcher',
      sublabel: 'Cosine Similarity Search',
      role: '@vector-db',
      iconName: 'Database',
      position: { x: 680, y: 180 },
      status: 'completed',
      config: { topK: 5 },
      inputs: ['input'],
      outputs: ['output'],
    },
    {
      id: 'node-rag-synth',
      type: 'llm',
      label: 'Context Reducer & Synthesizer',
      sublabel: 'LLM Ingestion & Citations',
      role: '@knowledge-agent',
      iconName: 'Sparkles',
      position: { x: 980, y: 180 },
      status: 'completed',
      config: { modelTier: 'claude-3-7-sonnet' },
      inputs: ['input'],
      outputs: ['output'],
    },
  ];

  const edges: PySpurEdge[] = [
    { id: 'r1', sourceNodeId: 'node-rag-input', sourceHandle: 'output', targetNodeId: 'node-rag-embed', targetHandle: 'input', isActive: true },
    { id: 'r2', sourceNodeId: 'node-rag-embed', sourceHandle: 'output', targetNodeId: 'node-rag-search', targetHandle: 'input', isActive: true },
    { id: 'r3', sourceNodeId: 'node-rag-search', sourceHandle: 'output', targetNodeId: 'node-rag-synth', targetHandle: 'input', isActive: true },
  ];

  return {
    id: 'workflow-rag-retrieval',
    name: 'RAG Knowledge Retrieval Pipeline',
    description: 'PySpur visual pipeline for vector embedding search, context extraction, and cited synthesis.',
    templateKey: 'rag_retrieval',
    nodes,
    edges,
    updatedAt: Date.now(),
  };
}

export function createHumanApprovalWorkflow(): PySpurWorkflow {
  const nodes: PySpurNode[] = [
    {
      id: 'node-ha-input',
      type: 'input',
      label: 'Proposed Mutation',
      sublabel: 'Delivery Gate Request',
      role: '@worker',
      iconName: 'GitBranch',
      position: { x: 80, y: 180 },
      status: 'completed',
      config: {},
      inputs: [],
      outputs: ['output'],
    },
    {
      id: 'node-ha-eval',
      type: 'evaluator',
      label: 'Automated Invariant Check',
      sublabel: 'Clippy, Fmt & Tests',
      role: '@verifier',
      iconName: 'CheckCircle2',
      position: { x: 420, y: 180 },
      status: 'completed',
      config: {},
      inputs: ['input'],
      outputs: ['output'],
    },
    {
      id: 'node-ha-gate',
      type: 'human_approval',
      label: 'Executive Approval Gate',
      sublabel: 'Operator Confirmation',
      role: '@owner',
      iconName: 'ShieldCheck',
      position: { x: 760, y: 180 },
      status: 'running',
      config: {},
      inputs: ['input'],
      outputs: ['output'],
    },
    {
      id: 'node-ha-output',
      type: 'output',
      label: 'Merge & Release',
      sublabel: 'Squash Merge to main',
      role: '@ledger',
      iconName: 'Target',
      position: { x: 1100, y: 180 },
      status: 'idle',
      config: {},
      inputs: ['input'],
      outputs: [],
    },
  ];

  const edges: PySpurEdge[] = [
    { id: 'ha1', sourceNodeId: 'node-ha-input', sourceHandle: 'output', targetNodeId: 'node-ha-eval', targetHandle: 'input', isActive: true },
    { id: 'ha2', sourceNodeId: 'node-ha-eval', sourceHandle: 'output', targetNodeId: 'node-ha-gate', targetHandle: 'input', isActive: true },
    { id: 'ha3', sourceNodeId: 'node-ha-gate', sourceHandle: 'output', targetNodeId: 'node-ha-output', targetHandle: 'input', isActive: false },
  ];

  return {
    id: 'workflow-human-approval',
    name: 'Human-in-the-Loop Gatekeeper',
    description: 'PySpur workflow enforcing human approval verification before irreversible delivery.',
    templateKey: 'human_approval',
    nodes,
    edges,
    updatedAt: Date.now(),
  };
}

// ============================================================================
// Assembles Synthesized PlanCanvasDoc from MoE Execution Output
// ============================================================================

export function synthesizePlanFromMoe(goalPrompt: string, _workflow?: PySpurWorkflow): PlanCanvasDoc {
  const gating = calculateMoeGating(goalPrompt, 3);
  const activeDomains = gating.activeExperts;

  const objectives: string[] = [
    `Execute core requirements for ${goalPrompt.slice(0, 50)}.`,
    'Enforce bounded execution boundaries and zero silent message drops.',
    'Isolate repeatable reproduction test harness before modifying application code.',
  ];

  const invariants: string[] = [
    'Bounded Memory: Maximum 64 MiB allocated per concurrent provider turn.',
    'Fail-Closed Recovery: Disable MCP and approval bypass during recovery turns.',
    'Safe Epoch Timestamps: Produced monotonically at ingestion boundary.',
  ];

  const tasks: { id: string; text: string; completed: boolean; role: string }[] = [];

  // Phase 1 tasks from Architect & Verifier
  tasks.push({
    id: `task-${Date.now()}-1`,
    text: `Define boundary contract & invariants for "${goalPrompt.slice(0, 35)}"`,
    completed: true,
    role: '@architect',
  });
  tasks.push({
    id: `task-${Date.now()}-2`,
    text: 'Construct failing acceptance test reproduction loop',
    completed: false,
    role: '@acceptance-verifier',
  });

  // Phase 2 tasks from Coder
  tasks.push({
    id: `task-${Date.now()}-3`,
    text: `Synthesize minimal implementation for ${goalPrompt.slice(0, 30)}`,
    completed: false,
    role: '@speculative-coder',
  });
  tasks.push({
    id: `task-${Date.now()}-4`,
    text: 'Verify memory bounds & zero unconstrained allocations',
    completed: false,
    role: '@speculative-coder',
  });

  // Phase 3 tasks from Verifier & Security
  tasks.push({
    id: `task-${Date.now()}-5`,
    text: '14/14 automated acceptance tests matrix pass',
    completed: false,
    role: '@acceptance-verifier',
  });
  tasks.push({
    id: `task-${Date.now()}-6`,
    text: 'Verify 0 Clippy warnings and 0 permission breaches',
    completed: false,
    role: '@security-auditor',
  });

  // If Token Optimizer is active, add token task
  if (activeDomains.includes('token_optimizer')) {
    tasks.push({
      id: `task-${Date.now()}-7`,
      text: 'Slim system prompts and verify 40%+ token reduction',
      completed: false,
      role: '@token-optimizer',
    });
  }

  return {
    id: `plan-moe-${Date.now()}`,
    title: goalPrompt.length > 55 ? `${goalPrompt.slice(0, 55)}...` : goalPrompt,
    goalPrompt,
    status: 'review_required',
    version: 1,
    summary: `Synthesized by PySpur Mixture of Experts (MoE) engine across ${activeDomains.length} active experts (${activeDomains.map((d) => EXPERT_DEFINITIONS[d].role).join(', ')}). Bounded invariants, test matrices, and CAS git delivery.`,
    objectives,
    invariants,
    phases: [
      {
        id: 'phase-1',
        name: 'Phase 1: Invariant Contract & Test Preconditions',
        description: 'Map boundary constraints, deep module seams, and author isolated test fixtures.',
        tasks: tasks.slice(0, 2),
      },
      {
        id: 'phase-2',
        name: 'Phase 2: Worker AST Synthesis & Implementation',
        description: 'Synthesize minimal non-breaking code changes inside clean sandbox worktree.',
        tasks: tasks.slice(2, 4),
      },
      {
        id: 'phase-3',
        name: 'Phase 3: Verification, Security & Invariant Proof',
        description: 'Dual review, deterministic test matrix consensus, and compliance evaluation.',
        tasks: tasks.slice(4),
      },
    ],
    testMatrix: [
      'test_bounded_queue_overflow_emits_explicit_marker',
      'test_concurrent_stdin_stdout_deadlock_freedom',
      'test_sqlite_wal_recovery_after_forced_sigkill',
      'test_acceptance_dual_verifier_consensus',
    ],
    annotations: [],
    updatedAt: Date.now(),
  };
}
