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

export type SkillCategory = 'firebase' | 'github' | 'gcloud' | 'agy';

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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  organization: string;
  canApproveGates: boolean;
  canDeploy: boolean;
  canEditRules: boolean;
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

export type PetriViewMode = 'board' | 'skills' | 'memory' | 'stats' | 'zero' | 'tui' | 'settings';
