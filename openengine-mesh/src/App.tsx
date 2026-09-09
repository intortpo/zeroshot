import { useState, useMemo } from 'react';
import { NodeMeshStatus } from './components/NodeMeshStatus';
import { PetriIntentBar } from './components/PetriIntentBar';
import { PetriKanban } from './components/PetriKanban';
import { SkillsCatalog } from './components/SkillsCatalog';
import { MemoryExplorer } from './components/MemoryExplorer';
import { SilkShaderBackground } from './components/SilkShaderBackground';
import { ApprovalModal } from './components/ApprovalModal';
import { GoogleWorkspaceDwdModal } from './components/GoogleWorkspaceDwdModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { useMeshLedger } from './hooks/useMeshLedger';
import { PetriItem, PetriItemKind, PetriStage, Workspace, SkillCategory } from './types';

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

  // Navigation View: 'board' | 'skills' | 'memory'
  const [currentView, setCurrentView] = useState<'board' | 'skills' | 'memory'>('board');

  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isDwdModalOpen, setIsDwdModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PetriItem | null>(null);

  // Workspaces State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'ws-petri',
      name: 'zero-petri',
      repo: 'foxlight/zero-petri',
      path: '/home/hideo/Documents/GitHub/zero-petri',
      itemCount: 7,
    },
    {
      id: 'ws-omarchy',
      name: 'omarchy-desktop',
      repo: 'foxlight/omarchy-desktop',
      path: '/home/hideo/Documents/GitHub/omarchy-desktop',
      itemCount: 3,
    },
    {
      id: 'ws-cloud',
      name: 'cloud-cluster',
      repo: 'the-open-engine/cluster-runners',
      path: '/home/hideo/workspaces/cluster-runners',
      itemCount: 2,
    },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-petri');

  // Canonical Petri Items across workspaces
  const [items, setItems] = useState<PetriItem[]>([
    {
      id: 'pt-001',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'Implement live Tailscale WireGuard peer heartbeat & routing',
      stage: 'merged',
      commitHash: '4b4b23b8',
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'pt-002',
      workspaceId: 'ws-petri',
      kind: 'mile',
      title: 'Multiplatform Tauri v2 coordinator for Linux Omarchy & Android',
      stage: 'merged',
      commitHash: 'ae11b729',
      createdAt: Date.now() - 6000000,
      updatedAt: Date.now() - 3000000,
    },
    {
      id: 'pt-003',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'Google Workspace Domain-Wide Delegation (DWD) with .json key',
      stage: 'merged',
      commitHash: '71dc16f1',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: 'pt-004',
      workspaceId: 'ws-petri',
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
      workspaceId: 'ws-petri',
      kind: 'bug',
      title: 'Handle unexpected SIGPIPE on bounded streaming stdin during container cancellation',
      stage: 'verifying',
      createdAt: Date.now() - 450000,
      updatedAt: Date.now() - 60000,
      recursionDepth: 2,
      chainOfThought: [
        '[turn 1 · cot] Ingesting bounded streaming I/O cancellation failure',
        '[turn 2 · recurse] Applying non-blocking pipe drain before container teardown',
      ],
    },
    {
      id: 'pt-006',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'Dynamic hardware negotiation: query nvidia-smi VRAM for role classification',
      stage: 'in_flight',
      createdAt: Date.now() - 240000,
      updatedAt: Date.now() - 30000,
      recursionDepth: 1,
      chainOfThought: [
        '[turn 1 · cot] Probing nvidia-smi memory stats via NVML bindings',
        '[turn 2 · recurse] Evaluating VRAM ceiling >= 16GB for rtx_host promotion',
      ],
    },
    {
      id: 'pt-007',
      workspaceId: 'ws-petri',
      kind: 'issue',
      title: 'Investigate peer discovery latency when roaming across mobile hotspots',
      stage: 'backlog',
      createdAt: Date.now() - 180000,
      updatedAt: Date.now() - 180000,
    },
    // Omarchy workspace items
    {
      id: 'pt-om-001',
      workspaceId: 'ws-omarchy',
      kind: 'feat',
      title: 'Wayland Hyprland native gesture IPC binding for seamless workspace split',
      stage: 'in_flight',
      createdAt: Date.now() - 1200000,
      updatedAt: Date.now() - 300000,
      recursionDepth: 1,
    },
    {
      id: 'pt-om-002',
      workspaceId: 'ws-omarchy',
      kind: 'bug',
      title: 'Eliminate XWayland fallback flickering during multi-monitor hotplug',
      stage: 'verifying',
      createdAt: Date.now() - 900000,
      updatedAt: Date.now() - 200000,
    },
    {
      id: 'pt-om-003',
      workspaceId: 'ws-omarchy',
      kind: 'mile',
      title: 'Omarchy Linux desktop frameless shell with hardware acceleration',
      stage: 'merged',
      commitHash: '8e19c43a',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
    },
    // Cloud cluster items
    {
      id: 'pt-cl-001',
      workspaceId: 'ws-cloud',
      kind: 'feat',
      title: 'Ephemeral target container sandbox pooling on GCP Cloud Run',
      stage: 'merged',
      commitHash: '2c90f841',
      createdAt: Date.now() - 5000000,
      updatedAt: Date.now() - 2400000,
    },
    {
      id: 'pt-cl-002',
      workspaceId: 'ws-cloud',
      kind: 'mile',
      title: 'Multi-region WireGuard mesh gateway with automated healthchecks',
      stage: 'in_flight',
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now() - 600000,
    },
  ]);

  // Active workspace info
  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  // Items visible in current workspace
  const visibleItems = useMemo(
    () => items.filter((item) => (item.workspaceId || 'ws-petri') === activeWorkspaceId),
    [items, activeWorkspaceId]
  );

  // Handle Intent Submission from Frosted Hero Bar
  const handleCreateIntent = async (title: string, kind: PetriItemKind) => {
    const newItemId = `pt-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: PetriItem = {
      id: newItemId,
      workspaceId: activeWorkspaceId,
      kind,
      title,
      stage: 'in_flight', // Immediately transitions from intent to in_flight on RTX
      createdAt: Date.now(),
      updatedAt: Date.now(),
      recursionDepth: 1,
      chainOfThought: [
        `[turn 1 · cot] Ingesting intent: "${title}"`,
        `[turn 1 · recurse] Initializing AST mapping in workspace: ${activeWorkspace?.name}`,
      ],
    };

    setItems((prev) => [newItem, ...prev]);

    // Update workspace item count
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, itemCount: ws.itemCount + 1 } : ws
      )
    );

    // Dispatch to background engine
    try {
      await submitGoal(title, activeWorkspace?.repo || 'foxlight/zero-petri');
    } catch (e) {
      console.warn('submitGoal error:', e);
    }
  };

  // Dispatch Skill from Catalog directly into Board
  const handleDispatchSkill = (prompt: string, category: SkillCategory) => {
    let kind: PetriItemKind = 'feat';
    if (category === 'github' && (prompt.toLowerCase().includes('bug') || prompt.toLowerCase().includes('conflict'))) {
      kind = 'bug';
    } else if (category === 'firebase' && prompt.toLowerCase().includes('audit')) {
      kind = 'issue';
    } else if (category === 'agy' && prompt.toLowerCase().includes('grill-me')) {
      kind = 'mile';
    }

    handleCreateIntent(prompt, kind);
    setCurrentView('board');
  };

  // Fan out agents into parallel RTX subagents
  const handleFanOutAgents = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            isFannedOut: true,
            recursionDepth: (item.recursionDepth ?? 1) + 1,
            agents: [
              {
                id: 'ag-coder',
                role: '@speculative-coder',
                status: 'recursing',
                recursionTurn: 2,
                thought: 'Synthesizing AST diff with bounded backpressure queues...',
              },
              {
                id: 'ag-verifier',
                role: '@acceptance-verifier',
                status: 'thinking',
                recursionTurn: 1,
                thought: 'Constructing test matrix for container cancellation & SIGPIPE...',
              },
              {
                id: 'ag-auditor',
                role: '@security-auditor',
                status: 'executing',
                recursionTurn: 2,
                thought: 'Verifying zero unbounded allocations across async runtime boundaries...',
              },
            ],
            chainOfThought: [
              ...(item.chainOfThought || []),
              `[turn ${(item.recursionDepth ?? 1) + 1} · fanout] Exploded task across 3 concurrent RTX subagents`,
              `[turn ${(item.recursionDepth ?? 1) + 1} · recurse] Speculative AST & invariant verifier parallel execution started`,
            ],
          };
        }
        return item;
      })
    );
  };

  // Recurse Agent Next Turn
  const handleRecurseAgent = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextDepth = (item.recursionDepth ?? 1) + 1;
          return {
            ...item,
            recursionDepth: nextDepth,
            chainOfThought: [
              ...(item.chainOfThought || []),
              `[turn ${nextDepth} · recurse] Synthesized AST patch; running bounded verification in container sandbox`,
            ],
            agents: item.agents?.map((a) => ({
              ...a,
              recursionTurn: (a.recursionTurn ?? 1) + 1,
              thought: `Advancing execution turn #${(a.recursionTurn ?? 1) + 1} on RTX accelerator`,
            })),
          };
        }
        return item;
      })
    );
  };

  // Advance stage (Backlog -> In Flight -> Verifying -> Gated -> Merged)
  const handleAdvanceStage = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let nextStage: PetriStage = item.stage;
          if (item.stage === 'backlog') nextStage = 'in_flight';
          else if (item.stage === 'in_flight') nextStage = 'verifying';
          else if (item.stage === 'verifying') nextStage = 'gated';
          else if (item.stage === 'gated') nextStage = 'merged';

          return {
            ...item,
            stage: nextStage,
            commitHash:
              nextStage === 'merged' && !item.commitHash
                ? Math.random().toString(16).substring(2, 10)
                : item.commitHash,
            updatedAt: Date.now(),
          };
        }
        return item;
      })
    );
  };

  // Create new workspace
  const handleCreateWorkspace = (name: string, repo: string, path: string) => {
    const newWsId = `ws-${Math.random().toString(36).substring(2, 7)}`;
    const newWs: Workspace = {
      id: newWsId,
      name,
      repo,
      path,
      itemCount: 0,
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newWsId);
  };

  const handleOpenApproval = (item: PetriItem) => {
    setSelectedItem(item);
    setIsApprovalOpen(true);
  };

  const activeApprovalRequest = {
    runId: selectedItem?.runId || selectedItem?.id || 'run-default',
    repoPath: activeWorkspace?.repo || 'foxlight/zero-petri',
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

  const activeJobsCount = visibleItems.filter(
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
        {/* Top Header: Frameless Draggable Petri Bar with Nav & Workspace Switcher */}
        <NodeMeshStatus
          localNode={localNode}
          peers={peers}
          activeRunsCount={activeJobsCount}
          isDwdConfigured={googleDwdStatus.is_configured}
          onOpenDwdModal={() => setIsDwdModalOpen(true)}
          activeWorkspace={activeWorkspace}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
          currentView={currentView}
          onSelectView={setCurrentView}
        />

        {/* View 1: Main Kanban Board & Intent Entry Bar */}
        {currentView === 'board' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Element 1: Soft Frost Intent Bar */}
            <PetriIntentBar onSubmitIntent={handleCreateIntent} />

            {/* Element 2: Left-to-Right Flowing Kanban (Right Being Fully Merged) */}
            <div className="flex-1 flex overflow-hidden">
              <PetriKanban
                items={visibleItems}
                onOpenApproval={handleOpenApproval}
                onSelectItem={(item) => {
                  if (item.stage === 'gated') {
                    handleOpenApproval(item);
                  }
                }}
                onFanOutAgents={handleFanOutAgents}
                onAdvanceStage={handleAdvanceStage}
                onRecurseAgent={handleRecurseAgent}
              />
            </div>
          </div>
        )}

        {/* View 2: Skills Registry Catalog (Firebase, GitHub, GCloud, AGY) */}
        {currentView === 'skills' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            <SkillsCatalog onDispatchSkill={handleDispatchSkill} />
          </div>
        )}

        {/* View 3: Memory Explorer (Episodic, Semantic/ADRs, Rules, Vector Store) */}
        {currentView === 'memory' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
            <MemoryExplorer activeWorkspace={activeWorkspace} />
          </div>
        )}
      </div>

      {/* Workspace Switcher Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={(id) => setActiveWorkspaceId(id)}
        onCreateWorkspace={handleCreateWorkspace}
      />

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
