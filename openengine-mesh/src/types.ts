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
