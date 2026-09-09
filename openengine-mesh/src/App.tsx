import { useState } from 'react';
import { NodeMeshStatus } from './components/NodeMeshStatus';
import { PetriIntentBar } from './components/PetriIntentBar';
import { PetriKanban } from './components/PetriKanban';
import { SilkShaderBackground } from './components/SilkShaderBackground';
import { ApprovalModal } from './components/ApprovalModal';
import { GoogleWorkspaceDwdModal } from './components/GoogleWorkspaceDwdModal';
import { useMeshLedger } from './hooks/useMeshLedger';
import { PetriItem, PetriItemKind, PetriStage } from './types';

export function App() {
  const {
    localNode,
    peers,
    submitGoal,
    submitDeliveryGate,
    googleDwdStatus,
    loadDwdCredentials,
    dispatchUseCase,
  } = useMeshLedger();

  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isDwdModalOpen, setIsDwdModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PetriItem | null>(null);

  // Canonical Petri Kanban State
  const [items, setItems] = useState<PetriItem[]>([
    {
      id: 'pt-001',
      kind: 'feat',
      title: 'Implement live Tailscale WireGuard peer heartbeat & routing',
      stage: 'merged',
      commitHash: '4b4b23b8',
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'pt-002',
      kind: 'mile',
      title: 'Multiplatform Tauri v2 coordinator for Linux Omarchy & Android',
      stage: 'merged',
      commitHash: 'ae11b729',
      createdAt: Date.now() - 6000000,
      updatedAt: Date.now() - 3000000,
    },
    {
      id: 'pt-003',
      kind: 'feat',
      title: 'Google Workspace Domain-Wide Delegation (DWD) with .json key',
      stage: 'merged',
      commitHash: '71dc16f1',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: 'pt-004',
      kind: 'feat',
      title: 'Speculative test runner anticipating test cases inside target container',
      stage: 'gated',
      runId: 'run-8f921bc4-001',
      createdAt: Date.now() - 900000,
      updatedAt: Date.now() - 120000,
      diff: `diff --git a/crates/speculative/src/runner.rs b/crates/speculative/src/runner.rs
new file mode 100644
index 0000000..9c4a112
--- /dev/null
+++ b/crates/speculative/src/runner.rs
@@ -0,0 +1,24 @@
+pub struct SpeculativeRunner {
+    pub target_image: String,
+    pub vram_ceiling_mb: u64,
+}
+
+impl SpeculativeRunner {
+    pub fn execute_precomputation(&self) -> Result<(), String> {
+        println!("Spun up speculative test environment on RTX 4090");
+        Ok(())
+    }
+}`,
      testLogs: `running 3 tests
test runner::tests::test_vram_allocation ... ok
test runner::tests::test_anticipatory_dependency_build ... ok
test runner::tests::test_type_integrity_proof ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; finished in 0.28s`,
    },
    {
      id: 'pt-005',
      kind: 'bug',
      title: 'Handle unexpected SIGPIPE on bounded streaming stdin during container cancellation',
      stage: 'verifying',
      createdAt: Date.now() - 450000,
      updatedAt: Date.now() - 60000,
    },
    {
      id: 'pt-006',
      kind: 'feat',
      title: 'Dynamic hardware negotiation: query nvidia-smi VRAM for role classification',
      stage: 'in_flight',
      createdAt: Date.now() - 240000,
      updatedAt: Date.now() - 30000,
    },
    {
      id: 'pt-007',
      kind: 'issue',
      title: 'Investigate peer discovery latency when roaming across mobile hotspots',
      stage: 'backlog',
      createdAt: Date.now() - 180000,
      updatedAt: Date.now() - 180000,
    },
  ]);

  // Handle Intent Submission from Frosted Hero Bar
  const handleCreateIntent = async (title: string, kind: PetriItemKind) => {
    const newItemId = `pt-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: PetriItem = {
      id: newItemId,
      kind,
      title,
      stage: 'in_flight', // Immediately transitions from intent to in_flight on RTX
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setItems((prev) => [newItem, ...prev]);

    // Dispatch to background engine
    try {
      await submitGoal(title, 'foxlight/zero-petri');
    } catch (e) {
      console.warn('submitGoal error:', e);
    }
  };

  const handleOpenApproval = (item: PetriItem) => {
    setSelectedItem(item);
    setIsApprovalOpen(true);
  };

  const activeApprovalRequest = {
    runId: selectedItem?.runId || selectedItem?.id || 'run-default',
    repoPath: 'foxlight/zero-petri',
    diff: selectedItem?.diff || 'diff --git a/crates/petri/src/lib.rs b/crates/petri/src/lib.rs\n+pub fn petri_orchestrate() -> bool { true }',
    testLogs: selectedItem?.testLogs || 'All acceptance and code review tests passed with 0 defects.',
    verifiers: [
      { name: 'Acceptance Verifier', passed: true },
      { name: 'Code Reviewer', passed: true },
    ],
  };

  const handleApproveGate = async (runId: string) => {
    await submitDeliveryGate(runId, true);
    if (selectedItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                stage: 'merged' as PetriStage,
                commitHash: Math.random().toString(16).substring(2, 10),
                updatedAt: Date.now(),
              }
            : i
        )
      );
    }
    setIsApprovalOpen(false);
  };

  const handleRejectGate = async (runId: string, feedback?: string) => {
    await submitDeliveryGate(runId, false, feedback);
    if (selectedItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                stage: 'in_flight' as PetriStage,
                updatedAt: Date.now(),
              }
            : i
        )
      );
    }
    setIsApprovalOpen(false);
  };

  const activeJobsCount = items.filter(
    (i) => i.stage === 'in_flight' || i.stage === 'verifying' || i.stage === 'gated'
  ).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070707] font-sans relative">
      {/* Background: Highly performant dark fluid silk shader */}
      <SilkShaderBackground workflowStatus="running" />

      {/* Soft Frost Overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/35 pointer-events-none z-10" />

      {/* Interactive UI Container */}
      <div className="relative z-20 flex flex-col h-full w-full overflow-hidden">
        {/* Top Header: Frameless Draggable Petri Bar */}
        <NodeMeshStatus
          localNode={localNode}
          peers={peers}
          activeRunsCount={activeJobsCount}
          isDwdConfigured={googleDwdStatus.is_configured}
          onOpenDwdModal={() => setIsDwdModalOpen(true)}
        />

        {/* Element 1: Soft Frost Intent Bar */}
        <PetriIntentBar onSubmitIntent={handleCreateIntent} />

        {/* Element 2: Left-to-Right Flowing Kanban (Right Being Fully Merged) */}
        <div className="flex-1 flex overflow-hidden">
          <PetriKanban
            items={items}
            onOpenApproval={handleOpenApproval}
            onSelectItem={(item) => {
              if (item.stage === 'gated') {
                handleOpenApproval(item);
              }
            }}
          />
        </div>
      </div>

      {/* Gated PR / Signoff Modal */}
      <ApprovalModal
        request={activeApprovalRequest}
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        onApprove={handleApproveGate}
        onReject={handleRejectGate}
      />

      {/* Google Workspace & DWD Key Manager Modal */}
      <GoogleWorkspaceDwdModal
        isOpen={isDwdModalOpen}
        onClose={() => setIsDwdModalOpen(false)}
        status={googleDwdStatus}
        onLoadCredentials={loadDwdCredentials}
        onSelectUseCase={(useCaseId, prompt) => {
          handleCreateIntent(prompt, 'feat');
          dispatchUseCase(useCaseId, prompt);
        }}
      />
    </div>
  );
}

export default App;
