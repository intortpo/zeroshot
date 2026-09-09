import { useState, useEffect, useCallback } from 'react';
import { NodeSpec, RunSummary, GraphNodeState, GoogleDwdStatus, WorkspaceUseCaseResult } from '../types';

// Detect if running inside Tauri v2 runtime
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export function useMeshLedger() {
  const [googleDwdStatus, setGoogleDwdStatus] = useState<GoogleDwdStatus>({
    is_configured: false,
    delegated_user: 'intortpo@gmail.com',
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    supported_use_cases: [],
  });

  const [localNode, setLocalNode] = useState<NodeSpec>({
    nodeId: 'node-po',
    role: 'thin_client',
    deviceName: 'Linux Host (po)',
    hasRtx: false,
    activeJobs: 0,
  });

  const [peers, setPeers] = useState<NodeSpec[]>([]);

  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const [nodesState, setNodesState] = useState<Record<string, GraphNodeState>>({
    worker: {
      id: 'worker',
      name: 'Worker Agent (Agy)',
      role: 'Code Generator',
      status: 'passed',
      updatedAt: Date.now() - 60000,
    },
    acceptance: {
      id: 'acceptance',
      name: 'Acceptance Verifier',
      role: 'Acceptance Suite',
      status: 'passed',
      updatedAt: Date.now() - 30000,
    },
    code: {
      id: 'code',
      name: 'Code Reviewer',
      role: 'Safety & Maintainability',
      status: 'passed',
      updatedAt: Date.now() - 25000,
    },
    gate: {
      id: 'gate',
      name: 'Human Approval Gate',
      role: 'Gated Delivery',
      status: 'gated',
      updatedAt: Date.now() - 20000,
    },
    deliver: {
      id: 'deliver',
      name: 'Automated Delivery',
      role: 'PR & CI Merge',
      status: 'idle',
      updatedAt: Date.now(),
    },
  });

  // Load hardware spec & Google DWD status on mount
  useEffect(() => {
    async function loadInitialState() {
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const spec = await invoke<NodeSpec>('detect_hardware');
          if (spec) setLocalNode(spec);
          const peerList = await invoke<NodeSpec[]>('get_mesh_peers');
          if (peerList) setPeers(peerList);
          const dwd = await invoke<GoogleDwdStatus>('get_google_dwd_status');
          if (dwd) setGoogleDwdStatus(dwd);
        } catch (e) {
          console.warn('Failed to invoke initial state via Tauri:', e);
        }
      }
    }
    loadInitialState();
  }, []);

  const loadDwdCredentials = useCallback(async (jsonContent: string, delegatedUser?: string) => {
    if (isTauri) {
      const { invoke } = await import('@tauri-apps/api/core');
      const updated = await invoke<GoogleDwdStatus>('load_google_dwd_credentials', {
        jsonContent,
        delegatedUser,
      });
      setGoogleDwdStatus(updated);
      return updated;
    } else {
      const parsed = JSON.parse(jsonContent);
      const mockStatus: GoogleDwdStatus = {
        is_configured: true,
        project_id: parsed.project_id || 'zero-petri-mesh',
        client_email: parsed.client_email || 'service-account@iam.gserviceaccount.com',
        delegated_user: delegatedUser || 'intortpo@gmail.com',
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/documents',
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/gmail.modify',
        ],
        supported_use_cases: [],
        last_validated_at: Date.now() / 1000,
      };
      setGoogleDwdStatus(mockStatus);
      return mockStatus;
    }
  }, []);

  const dispatchUseCase = useCallback(async (useCaseId: string, prompt: string) => {
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke<WorkspaceUseCaseResult>('dispatch_workspace_use_case', {
          useCaseId,
          prompt,
        });
      } catch (e) {
        console.warn('dispatch_workspace_use_case failed:', e);
      }
    }
    return null;
  }, []);

  const submitGoal = useCallback(async (goal: string, repo: string) => {
    const newRunId = `run-${Math.random().toString(36).substring(2, 10)}`;
    const newRun: RunSummary = {
      runId: newRunId,
      title: goal,
      status: 'running',
      createdAt: Date.now(),
    };

    setRuns((prev) => [newRun, ...prev]);
    setActiveRunId(newRunId);

    // Update node states to reflect execution pipeline
    setNodesState({
      worker: {
        id: 'worker',
        name: 'Worker Agent (Agy)',
        role: 'Code Generator',
        status: 'running',
        updatedAt: Date.now(),
      },
      acceptance: {
        id: 'acceptance',
        name: 'Acceptance Verifier',
        role: 'Acceptance Suite',
        status: 'idle',
        updatedAt: Date.now(),
      },
      code: {
        id: 'code',
        name: 'Code Reviewer',
        role: 'Safety & Maintainability',
        status: 'idle',
        updatedAt: Date.now(),
      },
      gate: {
        id: 'gate',
        name: 'Human Approval Gate',
        role: 'Gated Delivery',
        status: 'idle',
        updatedAt: Date.now(),
      },
      deliver: {
        id: 'deliver',
        name: 'Automated Delivery',
        role: 'PR & CI Merge',
        status: 'idle',
        updatedAt: Date.now(),
      },
    });

    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('submit_goal', { runId: newRunId, repoPath: repo, goal });
      } catch (e) {
        console.warn('Tauri submit_goal fallback simulation:', e);
      }
    }
  }, []);

  const submitDeliveryGate = useCallback(
    async (runId: string, approved: boolean, notes?: string) => {
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          await invoke('submit_delivery_gate', {
            runId,
            repoPath: '.',
            approved,
          });
        } catch (e) {
          console.warn('Tauri submit_delivery_gate fallback:', e);
        }
      }

      setRuns((prev) =>
        prev.map((r) => {
          if (r.runId === runId) {
            return {
              ...r,
              status: approved ? 'delivered' : 'running',
              verdictFeedback: notes,
            };
          }
          return r;
        })
      );

      setNodesState((prev) => ({
        ...prev,
        gate: {
          ...prev.gate,
          status: approved ? 'passed' : 'failed',
          updatedAt: Date.now(),
        },
        deliver: {
          ...prev.deliver,
          status: approved ? 'passed' : 'idle',
          updatedAt: Date.now(),
        },
      }));
    },
    []
  );

  return {
    localNode,
    peers,
    setPeers,
    runs,
    activeRunId,
    setActiveRunId,
    nodesState,
    submitGoal,
    submitDeliveryGate,
    googleDwdStatus,
    loadDwdCredentials,
    dispatchUseCase,
  };
}
