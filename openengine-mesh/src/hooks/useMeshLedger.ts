import { useState, useEffect, useCallback } from 'react';
import { NodeSpec, RunSummary, GraphNodeState } from '../types';

// Detect if running inside Tauri v2 runtime
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export function useMeshLedger() {
  const [localNode, setLocalNode] = useState<NodeSpec>({
    nodeId: 'node-local',
    role: 'thin_client',
    deviceName: 'Linux Omarchy Host',
    hasRtx: false,
    activeJobs: 0,
  });

  const [peers, setPeers] = useState<NodeSpec[]>([
    {
      nodeId: 'node-rtx-omarchy',
      role: 'rtx_host',
      deviceName: 'RTX 4090 Workstation',
      hasRtx: true,
      vramFreeMb: 22400,
      memoryFreeMb: 61440,
      activeJobs: 1,
    },
    {
      nodeId: 'node-android-pixel',
      role: 'thin_client',
      deviceName: 'Pixel 9 Pro Mobile',
      hasRtx: false,
      activeJobs: 0,
    },
  ]);

  const [runs, setRuns] = useState<RunSummary[]>([
    {
      runId: 'run-8f921bc4-001',
      title: 'feat: add wireguard peer heartbeat broadcast and unit test',
      status: 'gated',
      createdAt: Date.now() - 120000,
      diff: `diff --git a/src-tauri/src/mesh.rs b/src-tauri/src/mesh.rs
new file mode 100644
index 0000000..8341b12
--- /dev/null
+++ b/src-tauri/src/mesh.rs
@@ -0,0 +1,48 @@
+use serde::{Deserialize, Serialize};
+
+#[derive(Clone, Debug, Deserialize, Serialize)]
+pub struct MeshHeartbeat {
+    pub node_id: String,
+    pub role: String,
+    pub vram_free_mb: Option<u64>,
+    pub active_jobs: u32,
+}
+
+pub fn broadcast_heartbeat(beat: &MeshHeartbeat) -> Result<(), String> {
+    println!("Broadcasting heartbeat across mesh for node {}", beat.node_id);
+    Ok(())
+}`,
      testLogs: `running 2 tests
test mesh::tests::test_heartbeat_serialization ... ok
test mesh::tests::test_dynamic_work_routing ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.04s`,
    },
  ]);

  const [activeRunId, setActiveRunId] = useState<string | null>('run-8f921bc4-001');

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

  // Load hardware spec on mount
  useEffect(() => {
    async function loadHardware() {
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const spec = await invoke<NodeSpec>('detect_hardware');
          if (spec) setLocalNode(spec);
        } catch (e) {
          console.warn('Failed to invoke detect_hardware via Tauri:', e);
        }
      }
    }
    loadHardware();
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
  };
}
