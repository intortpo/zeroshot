import {
  AgentCognitionState,
  AgentCognitivePhase,
  AgentThinkingTurn,
  AgentWorkingConcept,
} from '../types';

type CognitionListener = (state: AgentCognitionState) => void;

const DEFAULT_WORKING_CONCEPT: AgentWorkingConcept = {
  id: 'concept-sqlite-bounded-queue',
  title: 'Bounded SQLite Backpressure Queue & Invariant Matrix',
  category: 'architecture',
  summary:
    'Enforcing 64 MiB buffer ceilings, concurrent Tokio async channels, and fail-closed transaction retries with zero memory leaks.',
  domainTerms: [
    'Bounded Queue',
    'Backpressure',
    'Fail-Closed Recovery',
    '64 MiB Buffer Guard',
    'Deterministic Exit Code',
    'CAS Compare-and-Swap',
  ],
  workingHypothesis:
    'Isolating minimal failing reproduction in an isolated .devcontainer before applying AST patches guarantees invariant preservation with zero regression breaches.',
  targetFiles: [
    'openengine-mesh/src/components/node/pyspurExecutionEngine.ts',
    'crates/petri/src/lib.rs',
    'openengine-mesh/src-tauri/src/main.rs',
  ],
  activeInvariants: [
    'Ceiling: 64 MiB unfinished-record buffer guard',
    'Assert: exit_code == 0 deterministic termination',
    'Bounded provider stdin/stdout concurrent streams without deadlock',
    'Safe-log epoch timestamps positive and JavaScript-safe',
  ],
  relatedNodes: ['node-petri-input', 'node-petri-worker', 'node-petri-verify', 'node-petri-gate'],
  updatedAt: Date.now(),
};

const DEFAULT_TURNS: AgentThinkingTurn[] = [
  {
    id: 'turn-1',
    timestamp: Date.now() - 48000,
    role: '@orchestrator',
    phase: 'hypothesizing',
    thought:
      'Examining goal directive for bounded SQLite retry queues. Reviewing CONTEXT.md architectural invariants. We must ensure no unbounded memory accumulation crosses async channel boundaries.',
    tokensUsed: 312,
    durationMs: 420,
    confidence: 0.96,
  },
  {
    id: 'turn-2',
    timestamp: Date.now() - 32000,
    role: '@speculative-coder',
    phase: 'analyzing_codebase',
    thought:
      'Locating SQLite queue driver and DevContainer container harness in /workspace. AST inspection confirms 64 MiB buffer guard is currently unconfigured. Planning reproduction test script.',
    tokensUsed: 428,
    durationMs: 510,
    confidence: 0.94,
  },
  {
    id: 'turn-3',
    timestamp: Date.now() - 14000,
    role: '@debugger-agent',
    phase: 'synthesizing_patch',
    thought:
      'Synthesizing Python/Rust test fixture with 10,000 backpressure items. Verifying exit code 0 and memory consumption ceiling. All assertions pass in isolated container environment.',
    tokensUsed: 590,
    durationMs: 680,
    confidence: 0.98,
  },
];

class AgentCognitionStore {
  private state: AgentCognitionState = {
    isThinking: false,
    activePhase: 'analyzing_codebase',
    activeConcept: DEFAULT_WORKING_CONCEPT,
    recentTurns: DEFAULT_TURNS,
    totalThinkingTokens: 1330,
  };

  private listeners: Set<CognitionListener> = new Set();

  getState(): AgentCognitionState {
    return this.state;
  }

  subscribe(listener: CognitionListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  setWorkingConcept(concept: Partial<AgentWorkingConcept>) {
    this.state = {
      ...this.state,
      activeConcept: {
        ...this.state.activeConcept,
        ...concept,
        updatedAt: Date.now(),
      },
    };
    this.notify();
  }

  steerConcept(concept: Partial<AgentWorkingConcept>) {
    this.setWorkingConcept(concept);
  }

  setCognitivePhase(phase: AgentCognitivePhase, isThinking?: boolean) {
    this.state = {
      ...this.state,
      activePhase: phase,
      isThinking: isThinking !== undefined ? isThinking : this.state.isThinking,
    };
    this.notify();
  }

  addThinkingTurn(turn: Omit<AgentThinkingTurn, 'id' | 'timestamp'>) {
    const newTurn: AgentThinkingTurn = {
      ...turn,
      id: `turn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };

    this.state = {
      ...this.state,
      recentTurns: [newTurn, ...this.state.recentTurns.slice(0, 19)],
      totalThinkingTokens: this.state.totalThinkingTokens + turn.tokensUsed,
      activePhase: turn.phase,
    };
    this.notify();
  }

  setIsThinking(isThinking: boolean) {
    this.state = {
      ...this.state,
      isThinking,
    };
    this.notify();
  }

  // Simulate an autonomous cognitive deliberation stream for demonstration
  async simulateDeliberation(goalText: string) {
    this.setIsThinking(true);
    this.setCognitivePhase('hypothesizing');

    // Update concept based on goal
    this.setWorkingConcept({
      title: `Cognitive Synthesis: ${goalText.slice(0, 45)}...`,
      summary: `Analyzing domain ontology, file targets, and regression matrix for "${goalText}".`,
      workingHypothesis: `Evaluating candidate implementation strategies and invariant constraints under the Feedback Loop First paradigm.`,
    });

    await new Promise((r) => setTimeout(r, 600));

    this.addThinkingTurn({
      role: '@orchestrator',
      phase: 'hypothesizing',
      thought: `Deconstructing goal "${goalText}". Parsing requirements and formulating hypothesis with minimal footprint.`,
      tokensUsed: 280,
      durationMs: 450,
      confidence: 0.95,
    });

    await new Promise((r) => setTimeout(r, 800));

    this.setCognitivePhase('verifying_invariants');
    this.addThinkingTurn({
      role: '@verifier-matrix',
      phase: 'verifying_invariants',
      thought: `Checking SAIF security policies and invariant boundaries. Verifying zero credential exposure and isolated container execution.`,
      tokensUsed: 340,
      durationMs: 380,
      confidence: 0.99,
    });

    await new Promise((r) => setTimeout(r, 600));

    this.setCognitivePhase('idle', false);
  }
}

export const agentCognitionService = new AgentCognitionStore();
