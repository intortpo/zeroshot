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
