export type PetriItemKind = 'bug' | 'issue' | 'feat' | 'mile';
export type PetriStage = 'backlog' | 'in_flight' | 'verifying' | 'gated' | 'merged';

export interface AgentWorker {
  id: string;
  role: string;
  status: 'idle' | 'thinking' | 'recursing' | 'executing' | 'done';
  thought?: string;
  recursionTurn?: number;
}

export interface Workspace {
  id: string;
  name: string;
  repo: string;
  path: string;
  itemCount: number;
}

export interface PetriItem {
  id: string;
  workspaceId?: string;
  kind: PetriItemKind;
  title: string;
  description?: string;
  stage: PetriStage;
  runId?: string;
  diff?: string;
  testLogs?: string;
  commitHash?: string;
  createdAt: number;
  updatedAt: number;
  agents?: AgentWorker[];
  chainOfThought?: string[];
  recursionDepth?: number;
  isFannedOut?: boolean;
  parentId?: string;
  branchName?: string;
  childrenIds?: string[];
}

export type NodeRole = 'rtx_host' | 'thin_client';

export interface NodeSpec {
  nodeId: string;
  role: NodeRole;
  deviceName: string;
  hasRtx: boolean;
  vramFreeMb?: number;
  memoryFreeMb?: number;
  activeJobs: number;
}

export type NodeExecutionStatus = 'idle' | 'running' | 'passed' | 'failed' | 'gated';

export interface GraphNodeState {
  id: string;
  name: string;
  role: string;
  status: NodeExecutionStatus;
  progress?: number;
  details?: string;
  updatedAt: number;
}

export interface RunSummary {
  runId: string;
  title: string;
  status: 'pending' | 'running' | 'gated' | 'delivered' | 'failed';
  diff?: string;
  testLogs?: string;
  verdictFeedback?: string;
  createdAt: number;
}

export interface GateApprovalRequest {
  runId: string;
  repoPath: string;
  diff: string;
  testLogs: string;
  verifiers: {
    name: string;
    passed: boolean;
    feedback?: string;
  }[];
}

export type TaskLifecycleStatus = 'todo' | 'in_progress' | 'verifying' | 'gated' | 'completed' | 'blocked';

export interface ProjectTask {
  id: string;
  runId?: string;
  title: string;
  component: string;
  assignedAgent: string;
  status: TaskLifecycleStatus;
  commitHash?: string;
  linesAdded: number;
  linesRemoved: number;
  durationSeconds?: number;
  updatedAt: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  phase: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  progress: number;
  taskIds: string[];
}

export interface ProjectOverview {
  id: string;
  name: string;
  repo: string;
  branch: string;
  description: string;
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    activeRuns: number;
    gatedApprovals: number;
    repairTurnCount: number;
    totalTokens: number;
    testPassRate: number;
  };
}

export interface UseCaseDescriptor {
  id: string;
  title: string;
  description: string;
  icon: string;
  workspace_target: string;
  scopes_required: string[];
}

export interface GoogleDwdStatus {
  is_configured: boolean;
  project_id?: string;
  client_email?: string;
  delegated_user?: string;
  key_id_suffix?: string;
  scopes: string[];
  supported_use_cases: UseCaseDescriptor[];
  last_validated_at?: number;
}

export interface WorkspaceArtifact {
  artifact_type: string;
  title: string;
  uri_or_id: string;
  status: string;
}

export interface WorkspaceUseCaseResult {
  use_case_id: string;
  status: string;
  summary: string;
  workspace_artifacts: WorkspaceArtifact[];
  execution_log: string[];
}

export type SkillCategory = 'firebase' | 'github' | 'gcloud' | 'agy' | 'diagram' | 'ecc';

export interface PetriSkill {
  id: string;
  category: SkillCategory;
  name: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  isActive: boolean;
  samplePrompts: string[];
  repoUrl?: string;
}

export type MemoryType = 'episodic' | 'semantic' | 'rule' | 'vector' | 'config';

export interface MemoryEntry {
  id: string;
  workspaceId: string;
  type: MemoryType;
  title: string;
  content: string;
  tags: string[];
  timestamp: number;
  tokens?: number;
  importance: 'critical' | 'high' | 'medium' | 'low';
  metadata?: Record<string, unknown>;
}

export type UserRole = 'owner' | 'lead_architect' | 'senior_dev' | 'security_auditor' | 'viewer';

export type SystemTier = 'superadmin' | 'control' | 'consumer';

export interface TierPermissions {
  canManageGovernance: boolean;
  canManageUsers: boolean;
  canManageProviders: boolean;
  canAccessTui: boolean;
  canApproveGates: boolean;
  canDeploy: boolean;
  canEditWorkflows: boolean;
  canRunDevContainers: boolean;
  canSteerCognition: boolean;
  canViewAuditLedger: boolean;
  canSubmitFeedback: boolean;
  canInteractAssistant: boolean;
  canViewPreview: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  tier: SystemTier;
  organization: string;
  canApproveGates: boolean;
  canDeploy: boolean;
  canEditRules: boolean;
  permissions?: Partial<TierPermissions>;
}

export interface EnterpriseStats {
  mttmMinutes: number;
  gateApprovalTimeMinutes: number;
  autonomousDeliveryRate: number;
  totalMergedPRs: number;
  activeWorkers: number;
  gpuVramUsedGb: number;
  gpuVramTotalGb: number;
  gpuDutyCyclePercent: number;
  gpuTempCelsius: number;
  totalTokensMonth: number;
  cacheHitRatio: number;
  costSavingsEstimatedUsd: number;
  selfLearningRulesLearned: number;
  selfLearningConfidence: number;
  invariantPassRate: number;
}

export type PetriViewMode = 'chat' | 'plan' | 'board' | 'graph' | 'node' | 'skills' | 'memory' | 'stats' | 'zero' | 'tui' | 'settings' | 'governance' | 'consumer';

// ECC (Everything Claude Code) Engine & Optimization Types
export interface EccOptimizationState {
  // 1. Token Optimization
  modelTier: 'opus_pro' | 'sonnet_flash' | 'haiku_lite';
  systemPromptSlimming: boolean;
  promptTokensSavedPercent: number;
  backgroundDaemonEnabled: boolean;

  // 2. Memory Persistence
  sessionPersistenceHooks: boolean;
  lastSessionSavedAt?: number;
  savedCheckpointsCount: number;

  // 3. Continuous Learning
  autoExtractPatterns: boolean;
  extractedSkillsCount: number;
  confidenceThreshold: number;

  // 4. Verification Loops
  evalMode: 'checkpoint' | 'continuous';
  graderType: 'deterministic_test' | 'invariant_ast' | 'llm_judge';
  passAt1: number;
  passAt3: number;

  // 5. Parallelization
  activeGitWorktrees: string[];
  cascadeMethodEnabled: boolean;
  scaleInstancesRecommendation: number;

  // 6. Subagent Orchestration
  contextSlicingRatio: number;
  iterativeRetrievalEnabled: boolean;
  activeSubagentSlices: {
    agent: string;
    tokenBudget: number;
    tokensUsed: number;
    retrievalCalls: number;
  }[];
}

// ECC (Everything Claude Code) Chat & Plan Canvas Types
export interface PlanAnnotation {
  id: string;
  pinNumber: number;
  sectionId: string;
  selectedText?: string;
  comment: string;
  author: string;
  createdAt: number;
}

export interface PlanTaskItem {
  id: string;
  text: string;
  completed: boolean;
  role?: string;
}

export interface PlanCanvasPhase {
  id: string;
  name: string;
  description: string;
  tasks: PlanTaskItem[];
}

export interface PlanCanvasDoc {
  id: string;
  title: string;
  goalPrompt: string;
  status: 'drafting' | 'review_required' | 'approved' | 'executing';
  version: number;
  summary: string;
  objectives: string[];
  invariants: string[];
  phases: PlanCanvasPhase[];
  testMatrix: string[];
  annotations: PlanAnnotation[];
  rawMarkdown?: string;
  updatedAt: number;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  sender: string;
  content: string;
  thought?: string;
  timestamp: number;
  planRef?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  model?: string;
  activeModel?: string;
  messageCount?: number;
  createdAt: number;
  updatedAt: number;
  messages?: AgentChatMessage[];
  planDoc?: PlanCanvasDoc;
}

// Bevy & Avian Physics Game Studio Types
export interface GameQuestionOption {
  id: string;
  label: string;
  description: string;
  physicsSnippet?: string;
}

export interface GameQuestion {
  id: string;
  category: 'mode' | 'physics' | 'controls' | 'rules' | 'entities';
  title: string;
  description: string;
  options: GameQuestionOption[];
  selectedOptionId?: string;
}

export interface GameChatMessage {
  id: string;
  sender: 'designer' | 'user';
  text: string;
  timestamp: number;
  question?: GameQuestion;
  bevyUpdate?: string;
}

export interface GamePhysicsConfig {
  gravity: number; // e.g. 9.81 or custom
  restitution: number; // bounciness [0.0 - 1.0]
  friction: number; // friction [0.0 - 1.0]
  linearDamping: number; // air drag
  substeps: number; // physics substepping e.g. 8
}

export interface GameLoopSpec {
  modeName: string;
  cameraPerspective: '2d_topdown' | '2d_sidescroll' | '3d_arena' | 'isometric';
  primaryInput: string;
  objective: string;
  scoringRule: string;
  failCondition: string;
}

export interface GameWorkspace {
  id: string;
  title: string;
  tagline: string;
  dimension: '2d' | '3d';
  bevyVersion: string;
  avianVersion: string;
  status: 'drafting' | 'compiling' | 'ready' | 'published';
  physicsConfig: GamePhysicsConfig;
  gameLoop: GameLoopSpec;
  bevyCode: string;
  chatHistory: GameChatMessage[];
  pendingQuestion?: GameQuestion;
  publishedAt?: number;
  playCount: number;
  likes: number;
  thumbnailColor: string;
  lightyearConfig?: LightyearConfig;
}

export type LightyearTransport = 'webtransport' | 'websocket' | 'udp_netcode';
export type PredictionMode = 'full_rollback' | 'snapshot_interpolation' | 'lockstep';

export interface LightyearConfig {
  transport: LightyearTransport;
  predictionMode: PredictionMode;
  serverTickRate: number;
  clientTickRate: number;
  packetLossSimPercent: number;
  latencySimMs: number;
  enableAvianRollback: boolean;
  interestManagement: boolean;
}

export interface MultiplayerLobbyPeer {
  id: string;
  name: string;
  role: 'host' | 'player';
  pingMs: number;
  isReady: boolean;
  predictedRollbacks?: number;
}

export interface MultiplayerLobby {
  gameId: string;
  gameTitle: string;
  roomCode: string;
  hostName: string;
  joinUrl: string;
  status: 'waiting' | 'in_match' | 'closed';
  tickRateHz: number;
  clientPrediction: boolean;
  lightyearConfig?: LightyearConfig;
  peers: MultiplayerLobbyPeer[];
}

// ============================================================================
// PySpur & Mixture of Experts (MoE) Visual Development Platform Types
// ============================================================================

export type PySpurNodeType =
  | 'input'
  | 'router'
  | 'branch'
  | 'expert'
  | 'llm'
  | 'tool'
  | 'code'
  | 'rag_retriever'
  | 'loop'
  | 'human_approval'
  | 'evaluator'
  | 'aggregator'
  | 'subworkflow'
  | 'output';

export type PySpurNodeStatus = 'idle' | 'running' | 'completed' | 'failed' | 'bypassed';

export type MoeExpertDomain =
  | 'architect'
  | 'speculative_coder'
  | 'security_auditor'
  | 'acceptance_verifier'
  | 'token_optimizer';

export interface PySpurNodeOutputTrace {
  summary: string;
  confidence: number;
  tokensUsed: number;
  durationMs: number;
  logs: string[];
  rawOutput?: any;
  planFragment?: {
    title?: string;
    objectives?: string[];
    invariants?: string[];
    tasks?: { text: string; role: string }[];
    testMatrix?: string[];
  };
}

export interface PySpurNodeConfig {
  modelTier?: string;
  systemPrompt?: string;
  promptTemplate?: string;
  temperature?: number;
  topK?: number;
  gatingWeights?: Record<string, number>;
  pythonCode?: string;
  codeExecutionTarget?: 'devcontainer' | 'sandbox';
  toolName?: string;
  toolArgs?: Record<string, any>;
  timeoutMs?: number;
  expertDomain?: MoeExpertDomain;
  conditionExpression?: string;
  ragCollection?: string;
  ragTopK?: number;
  loopInputKey?: string;
  loopMaxIterations?: number;
  humanApprovalStatus?: 'pending' | 'approved' | 'rejected';
  humanApprovalNotes?: string;
  evaluatorCriteria?: string;
  evaluatorRubricScore?: number;
  evaluatorAssertions?: string[];
  structuredOutputSchema?: string;
  subworkflowId?: string;
}

export interface PySpurNode {
  id: string;
  type: PySpurNodeType;
  label: string;
  sublabel: string;
  role: string;
  iconName: string;
  position: { x: number; y: number };
  status: PySpurNodeStatus;
  config: PySpurNodeConfig;
  outputTrace?: PySpurNodeOutputTrace;
  inputs?: string[];
  outputs?: string[];
}

export interface PySpurEdge {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
  weight?: number;
  isActive?: boolean;
  label?: string;
}

export interface PySpurWorkflow {
  id: string;
  name: string;
  description: string;
  templateKey: 'petri_orchestration' | 'moe_planner' | 'agentic_coder' | 'rag_retrieval' | 'human_approval' | 'devcontainer_coder' | 'evaluator_suite' | 'custom';
  nodes: PySpurNode[];
  edges: PySpurEdge[];
  updatedAt: number;
}

// DevContainer Telemetry & Execution Types
export interface DevContainerInfo {
  installed: boolean;
  engine: string;
  state: 'running' | 'stopped' | 'unconfigured' | 'error';
  container_id?: string;
  container_name: string;
  image_name: string;
  ports: string[];
  uptime?: string;
  message: string;
}

// PySpur Test Dataset & Benchmarking Types
export interface PySpurTestCase {
  id: string;
  name: string;
  inputPrompt: string;
  expectedOutput?: string;
  assertions: string[];
  lastStatus?: 'pass' | 'fail' | 'pending';
  lastScore?: number;
  durationMs?: number;
}

export interface PySpurEvalRun {
  id: string;
  workflowId: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  passRatePercent: number;
  avgLatencyMs: number;
  estimatedCostUsd: number;
  timestamp: number;
}

// ============================================================================
// Agentation Visual Annotation & Live Preview Panel Types
// ============================================================================

export type PreviewViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface AgentationAnnotation {
  id: string;
  pinNumber: number;
  xPercent: number;
  yPercent: number;
  targetSelector: string;
  targetTagName: string;
  targetTextSnippet?: string;
  comment: string;
  category: 'bug' | 'visual' | 'feature' | 'copy';
  priority: 'low' | 'medium' | 'high';
  author: string;
  createdAt: number;
}

// ============================================================================
// Google Antigravity (AGY) CLI & AI Provider Management Types
// ============================================================================

export type AiProviderType = 'agy' | 'anthropic' | 'openai' | 'ollama' | 'cluster_oecp';

export interface AiModelSpec {
  id: string;
  providerId: AiProviderType;
  name: string;
  description: string;
  contextWindowTokens: number;
  maxOutputTokens: number;
  reasoningEffortSupported: boolean;
  costPer1mInputUsd: number;
  costPer1mOutputUsd: number;
  isLocal: boolean;
  category: 'flagship' | 'reasoning' | 'fast' | 'local';
}

export interface AiProviderConfig {
  id: AiProviderType;
  name: string;
  description: string;
  endpointUrl: string;
  apiKey?: string;
  status: 'connected' | 'degraded' | 'offline' | 'unconfigured';
  latencyMs?: number;
  models: AiModelSpec[];
  activeModelId: string;
  selectedEffort?: 'low' | 'medium' | 'high';
  isLocalBinary?: boolean;
  binaryPath?: string;
}

export interface AgyRunResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  model_used: string;
  tokens_estimated: number;
}

// ============================================================================
// Agent Cognition & Concept State Types
// ============================================================================

export type AgentCognitivePhase =
  | 'idle'
  | 'hypothesizing'
  | 'analyzing_codebase'
  | 'synthesizing_patch'
  | 'verifying_invariants'
  | 'self_critique'
  | 'awaiting_gate';

export interface AgentThinkingTurn {
  id: string;
  timestamp: number;
  role: string;
  phase: AgentCognitivePhase;
  thought: string;
  tokensUsed: number;
  durationMs: number;
  confidence: number;
}

export interface AgentWorkingConcept {
  id: string;
  title: string;
  category: 'architecture' | 'security' | 'code' | 'verification' | 'governance';
  summary: string;
  domainTerms: string[];
  workingHypothesis: string;
  targetFiles: string[];
  activeInvariants: string[];
  relatedNodes: string[];
  updatedAt: number;
}

export interface AgentCognitionState {
  isThinking: boolean;
  activePhase: AgentCognitivePhase;
  activeConcept: AgentWorkingConcept;
  recentTurns: AgentThinkingTurn[];
  totalThinkingTokens: number;
}

// ============================================================================
// Governance & SAIF Compliance Types
// ============================================================================

export interface SaifAuditCheck {
  id: string;
  pillar: 'foundations' | 'data_governance' | 'model_security' | 'fail_closed' | 'adversarial_defense' | 'audit_ledger';
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  evidence: string;
  lastAuditedAt: number;
}

export interface SaifAuditPillar {
  key: string;
  name: string;
  scorePercent: number;
  checksCount: number;
  passedCount: number;
  checks: SaifAuditCheck[];
}

export interface GovernancePolicy {
  id: string;
  category: 'model_access' | 'review_gate' | 'token_ceiling' | 'secret_sanitization' | 'cas_delivery';
  name: string;
  description: string;
  isEnabled: boolean;
  severity: 'strict' | 'advisory';
  targetScope: string;
}

export interface GovernanceAuditRecord {
  id: string;
  timestamp: number;
  category: string;
  actor: string;
  action: string;
  details: string;
  status: 'verified' | 'flagged' | 'blocked';
  receiptHash: string;
}
