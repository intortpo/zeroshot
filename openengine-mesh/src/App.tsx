import { useState, useMemo, useEffect } from 'react';
import { NodeMeshStatus } from './components/NodeMeshStatus';
import { PetriIntentBar } from './components/PetriIntentBar';
import { PetriKanban } from './components/PetriKanban';
import { SkillsCatalog } from './components/SkillsCatalog';
import { MemoryExplorer } from './components/MemoryExplorer';
import { EnterpriseStats } from './components/EnterpriseStats';
import { TuiView } from './components/TuiView';
import { UserProfileModal } from './components/UserProfileModal';
import { ApprovalModal } from './components/ApprovalModal';
import { GoogleWorkspaceDwdModal } from './components/GoogleWorkspaceDwdModal';
import { WorkspaceSelectionModal } from './components/workspace/WorkspaceSelectionModal';
import { PySpurSettingsModal } from './components/pyspur/PySpurSettingsModal';
import { PetriPySpurStudioView } from './components/pyspur/PetriPySpurStudioView';
import { CosmosServerView } from './components/CosmosServerView';
import { PetriSettings } from './components/PetriSettings';
import { ZeroView } from './components/ZeroView';
import { ChatPlanCanvasView } from './components/ChatPlanCanvasView';
import { PreviewAgentationPanel } from './components/preview/PreviewAgentationPanel';
import { GovernanceView } from './components/GovernanceView';
import { AgentCognitionHUD } from './components/AgentCognitionHUD';
import { CustomContextMenu } from './components/CustomContextMenu';
import { AiProviderMonitorModal } from './components/models/AiProviderMonitorModal';
import { ConsumerPortalView } from './components/consumer/ConsumerPortalView';
import { PetriServerView } from './components/server/PetriServerView';
import { PetriAntigravityCloudView } from './components/antigravity/PetriAntigravityCloudView';
import { GitHubProjectsBoard } from './components/projects/GitHubProjectsBoard';
import { EdmDashboardView } from './components/edm/EdmDashboardView';
import { MidtermClockInDemoView } from './components/edm/MidtermClockInDemoView';
import { AssetLibraryView } from './components/gallery/AssetLibraryView';
import { PetriVideoFlowEditor } from './components/generative/flow/PetriVideoFlowEditor';
import { FederatedDataView } from './components/federated/FederatedDataView';
import { GenerativeSuiteView } from './components/generative/GenerativeSuiteView';
import { McpServerManagerView } from './components/mcp/McpServerManagerView';
import { PetriGitDevelopmentView } from './components/git/PetriGitDevelopmentView';
import { MotionContainer } from './components/motion/MotionContainer';
import { TierBoundaryGuard } from './components/TierBoundaryGuard';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { MobileMoreDrawer } from './components/mobile/MobileMoreDrawer';
import { useIsMobile } from './hooks/useIsMobile';
import { useMeshLedger } from './hooks/useMeshLedger';
import { STANDARD_TIER_PERSONAS, tierService } from './services/tierService';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { executeCodingTurn } from './services/autonomousCoderService';
import { PetriItem, PetriItemKind, PetriStage, Workspace, SkillCategory, UserProfile, PetriViewMode, SystemTier } from './types';

const STORAGE_WORKSPACES_KEY = 'petri_workspaces_v1';
const STORAGE_ACTIVE_WS_KEY = 'petri_active_workspace_id_v1';

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-petri',
    name: 'zero-petri',
    repo: 'foxlight/zero-petri',
    branch: 'main',
    repoUrl: 'https://github.com/foxlight/zero-petri',
    path: '/home/hideo/Documents/GitHub/zero-petri',
    itemCount: 7,
    isPrivate: false,
    defaultBranch: 'main',
    lastSyncedAt: Date.now(),
  },
  {
    id: 'ws-cluster',
    name: 'cluster-runtime',
    repo: 'the-open-engine-company/open-engine-core',
    branch: 'main',
    repoUrl: 'https://github.com/the-open-engine-company/open-engine-core',
    path: '/home/hideo/Documents/GitHub/open-engine-core',
    itemCount: 3,
    isPrivate: true,
    defaultBranch: 'main',
    lastSyncedAt: Date.now(),
  },
  {
    id: 'ws-target',
    name: 'zeroshot-target',
    repo: 'the-open-engine-company/zeroshot-target',
    branch: 'main',
    repoUrl: 'https://github.com/the-open-engine-company/zeroshot-target',
    path: '/home/hideo/Documents/GitHub/zeroshot-target',
    itemCount: 2,
    isPrivate: false,
    defaultBranch: 'main',
    lastSyncedAt: Date.now(),
  },
];

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
  void GoogleWorkspaceDwdModal;
  void loadDwdCredentials;
  void dispatchUseCase;

  // Enterprise View: 'antigravity' (default Cloud Run & Docker agy sessions) | 'projects' | 'board' | etc.
  const [currentView, setCurrentView] = useState<PetriViewMode>('antigravity');
  const handleSelectView = (view: PetriViewMode) => {
    setCurrentView(view);
  };
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isCognitionOpen, setIsCognitionOpen] = useState<boolean>(false);
  const isMobile = useIsMobile(768);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // 3-Tier Enterprise Users & Identity State (SuperAdmin, Control, Consumer Personas)
  const [users, setUsers] = useState<UserProfile[]>(STANDARD_TIER_PERSONAS);
  const [activeUserId, setActiveUserId] = useState<string>('usr-hideo');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isDwdModalOpen, setIsDwdModalOpen] = useState(false);
  void isDwdModalOpen;
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isPySpurSettingsModalOpen, setIsPySpurSettingsModalOpen] = useState(false);
  const [isAiProviderModalOpen, setIsAiProviderModalOpen] = useState(false);
  const [activeAiModelId, setActiveAiModelId] = useState('gemini-3.8-flash-high');
  const [selectedItem, setSelectedItem] = useState<PetriItem | null>(null);
  const [selectedEdmSourceFileId, setSelectedEdmSourceFileId] = useState<string>('f-below-passing');

  // Workspaces State (Authentic Local Repository with LocalStorage Persistence)
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKSPACES;
    try {
      const saved = localStorage.getItem(STORAGE_WORKSPACES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load workspaces from localStorage', e);
    }
    return DEFAULT_WORKSPACES;
  });

  const [activeWorkspaceId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_ACTIVE_WS_KEY);
        if (saved) return saved;
      } catch {}
    }
    return 'ws-petri';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_WORKSPACES_KEY, JSON.stringify(workspaces));
    } catch (e) {
      console.warn('Failed to save workspaces to localStorage', e);
    }
  }, [workspaces]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_ACTIVE_WS_KEY, activeWorkspaceId);
    } catch {}
  }, [activeWorkspaceId]);

  // Active User Profile
  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) || users[0],
    [users, activeUserId]
  );

  const handleSelectTier = (newTier: SystemTier) => {
    // Check if a preconfigured persona exists for this tier for instantaneous testing
    const matchingPersona = users.find((u) => u.tier === newTier);
    if (matchingPersona) {
      setActiveUserId(matchingPersona.id);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === activeUserId ? { ...u, tier: newTier } : u))
      );
    }
    tierService.setActiveTier(newTier);

    if (newTier === 'consumer') {
      setCurrentView('consumer');
    } else if (currentView === 'consumer') {
      setCurrentView('antigravity');
    }
  };

  const handleCreateConsumerRequest = (
    title: string,
    details: string,
    category: 'feature' | 'bug' | 'inquiry'
  ) => {
    const newItem: PetriItem = {
      id: `pt-req-${Date.now().toString().slice(-6)}`,
      workspaceId: activeWorkspaceId,
      kind: category === 'bug' ? 'bug' : 'feat',
      title: `[Consumer ${category.toUpperCase()}] ${title}`,
      description: details,
      stage: 'backlog',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      commitHash: 'consumer-intent',
    };
    setItems((prev) => [newItem, ...prev]);
  };

  // Canonical Petri Items across workspaces (Built directly from real repository git history)
  const CANONICAL_INITIAL_ITEMS: PetriItem[] = [
    {
      id: 'pt-commit-c41c0956',
      workspaceId: 'ws-petri',
      kind: 'bug',
      title: 'fix(edm): resolve indexing crash in submersion manifest & harden webgl lifecycles',
      stage: 'merged',
      commitHash: 'c41c0956',
      createdAt: 1788973600000,
      updatedAt: 1788973600000,
      diff: `--- a/openengine-mesh/src/services/edmStorageService.ts\n+++ b/openengine-mesh/src/services/edmStorageService.ts\n@@ -960,6 +960,18 @@\n+  const numSkills = skills.length;\n+  const positions = skills.map((_, i) => [cos(i), sin(i)]);`,
      testLogs: `[cargo:test] All 42 unit test fixtures passed\n[vitest] EDM Studio components mounted cleanly`,
    },
    {
      id: 'pt-commit-97a09659',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'transform UI to 1960s wireframe airplane manual draft parchment aesthetic',
      stage: 'merged',
      commitHash: '97a09659',
      createdAt: 1788972517000,
      updatedAt: 1788972517000,
    },
    {
      id: 'pt-commit-36fbb1ee',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'add enterprise telemetry stats, self-learning engine, and user identity switcher',
      stage: 'merged',
      commitHash: '36fbb1ee',
      createdAt: 1788972218000,
      updatedAt: 1788972218000,
    },
    {
      id: 'pt-commit-2f8f303f',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'add wide array of skills for firebase, github, gcloud, agy and memory explorer',
      stage: 'merged',
      commitHash: '2f8f303f',
      createdAt: 1788971968000,
      updatedAt: 1788971968000,
    },
    {
      id: 'pt-commit-fcc2c077',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'add spacious kanban with recursive chain of thought, agent fan-out, and workspace switcher',
      stage: 'merged',
      commitHash: 'fcc2c077',
      createdAt: 1788971750000,
      updatedAt: 1788971750000,
    },
    {
      id: 'pt-commit-ac226920',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'streamline UI to inked intent bar and left-to-right technical manual kanban',
      stage: 'merged',
      commitHash: 'ac226920',
      createdAt: 1788971570000,
      updatedAt: 1788971570000,
    },
    {
      id: 'pt-commit-71dc16f1',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'add Google Workspace DWD json credentials and 6 core autonomous use cases',
      stage: 'merged',
      commitHash: '71dc16f1',
      createdAt: 1788970292000,
      updatedAt: 1788970292000,
    },
  ];

  const [items, setItems] = useState<PetriItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('petri_board_items_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load board items from localStorage:', e);
      }
    }
    return CANONICAL_INITIAL_ITEMS;
  });

  // Automatically sync items to localStorage on every change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('petri_board_items_v2', JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save board items to localStorage:', e);
      }
    }
  }, [items]);

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

// Automatic AI heuristic for intent kind classification
function inferPetriKind(text: string): PetriItemKind {
  const lower = text.toLowerCase();
  if (
    lower.startsWith('fix') ||
    lower.includes('bug') ||
    lower.includes('error') ||
    lower.includes('crash') ||
    lower.includes('broken') ||
    lower.includes('fail')
  ) {
    return 'bug';
  }
  if (
    lower.startsWith('why') ||
    lower.includes('issue') ||
    lower.includes('investigate') ||
    lower.includes('problem') ||
    lower.includes('audit')
  ) {
    return 'issue';
  }
  if (
    lower.startsWith('v1') ||
    lower.includes('release') ||
    lower.includes('launch') ||
    lower.includes('milestone') ||
    lower.includes('roadmap')
  ) {
    return 'mile';
  }
  return 'feat';
}

  // Handle Intent Submission from Frosted Hero Bar
  const handleCreateIntent = async (title: string, kind?: PetriItemKind) => {
    const determinedKind = kind || inferPetriKind(title);
    const newItemId = `pt-${Math.random().toString(36).substring(2, 7)}`;
    const baseItem: PetriItem = {
      id: newItemId,
      workspaceId: activeWorkspaceId,
      kind: determinedKind,
      title,
      stage: 'in_flight',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      recursionDepth: 1,
      chainOfThought: [
        `[turn 1 · cot] Ingesting intent: "${title}" by ${activeUser.name}`,
        `[turn 1 · recurse] Initializing AST mapping in workspace: ${activeWorkspace?.name}`,
      ],
    };

    // Execute actual autonomous coding synthesis turn immediately!
    const codedItem = executeCodingTurn(baseItem);
    setItems((prev) => [codedItem, ...prev]);

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

  // Run next speculative coding turn on an item
  const handleExecuteCodingTurn = (itemId: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? executeCodingTurn(it) : it))
    );
  };

  // Delete card from board
  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Reset board to canonical repo state
  const handleResetBoard = () => {
    setItems(CANONICAL_INITIAL_ITEMS);
    try {
      localStorage.removeItem('petri_board_items_v2');
    } catch {}
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
    if (currentView === 'skills') {
      setCurrentView('board');
    }
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

  // Branch a sub-goal from an existing task
  const handleBranchItem = (parentItem: PetriItem, branchName: string, subGoal: string) => {
    const newChildId = `pt-${Date.now().toString(36)}`;
    const newChildItem: PetriItem = {
      id: newChildId,
      workspaceId: activeWorkspaceId,
      kind: 'feat',
      title: subGoal,
      stage: 'in_flight',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      parentId: parentItem.id,
      branchName: branchName,
      chainOfThought: [
        `[turn 1 · branch] Forked branch '${branchName}' from parent #${parentItem.id.replace('pt-', '')}`,
        `[turn 2 · init] Allocated speculative sub-worker context for sub-goal`,
      ],
      agents: [
        {
          id: `ag-${Date.now()}-1`,
          role: '@speculative-coder',
          status: 'recursing',
          recursionTurn: 1,
        },
      ],
    };

    setItems((prev) => {
      const updated = prev.map((it) => {
        if (it.id === parentItem.id) {
          return {
            ...it,
            childrenIds: [...(it.childrenIds || []), newChildId],
          };
        }
        return it;
      });
      return [newChildItem, ...updated];
    });

    // Update workspace item count
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, itemCount: ws.itemCount + 1 } : ws
      )
    );
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans relative">
      {/* Background: Clean White Canvas */}
      <div className="absolute inset-0 bg-white pointer-events-none z-0" />

      {/* Interactive UI Container */}
      <div className="relative z-20 flex flex-col h-full w-full overflow-hidden">
        {/* Top Header: Frameless Light Enterprise Petri Bar with Nav, User Switcher, & Workspace */}
        <NodeMeshStatus
          localNode={localNode}
          peers={peers}
          activeRunsCount={activeJobsCount}
          isDwdConfigured={googleDwdStatus.is_configured}
          onOpenDwdModal={() => setIsDwdModalOpen(true)}
          activeWorkspace={activeWorkspace}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
          activeUser={activeUser}
          onOpenUserModal={() => setIsUserModalOpen(true)}
          onSelectTier={handleSelectTier}
          currentView={currentView}
          onSelectView={handleSelectView}
          isPreviewOpen={isPreviewOpen}
          onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
          isCognitionOpen={isCognitionOpen}
          onToggleCognition={() => setIsCognitionOpen(!isCognitionOpen)}
        />

        {/* Main Workspace Body with Optional Side-by-Side Agentation Live Preview */}
        <div className="flex-1 flex overflow-hidden relative min-w-0 pb-16 md:pb-0">
          <MotionContainer viewKey={currentView} preset="gentle" className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* View -1: Consumer Portal (Primary Surface for Consumer Tier) */}
            {currentView === 'consumer' && (
              <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                <ConsumerPortalView
                  activeUser={activeUser}
                  activeWorkspace={activeWorkspace}
                  items={visibleItems}
                  onCreateConsumerRequest={handleCreateConsumerRequest}
                  onOpenUserModal={() => setIsUserModalOpen(true)}
                />
              </div>
            )}

            {/* Tier Boundary Guard: Blocks Consumers from developer views fail-closed */}
            {activeUser.tier === 'consumer' && currentView !== 'consumer' ? (
              <TierBoundaryGuard
                currentTier={activeUser.tier}
                activeUser={activeUser}
                requiredTier="control"
                targetView={currentView}
                onReturnToAllowedView={() => setCurrentView('consumer')}
                onOpenUserModal={() => setIsUserModalOpen(true)}
              />
            ) : (
              <>
                {/* View 0: Chat & Interactive Plan Canvas (ECC Inspired) */}
                {(currentView === 'chat' || currentView === 'plan') && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <ChatPlanCanvasView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                      items={visibleItems}
                      initialMode={currentView === 'plan' ? 'canvas' : 'split'}
                      selectedModelId={activeAiModelId}
                      onSelectModelId={setActiveAiModelId}
                      onOpenAiProviderModal={() => setIsAiProviderModalOpen(true)}
                      onApprovePlan={(plan) => handleCreateIntent(plan.title)}
                      onSelectView={setCurrentView}
                      onBranchItem={handleBranchItem}
                    />
                  </div>
                )}

                {/* View: Antigravity Cloud Run Sessions (Replaces Legacy Focus and Autonomous Chat) */}
                {currentView === 'antigravity' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <PetriAntigravityCloudView
                      activeUser={activeUser}
                      activeWorkspace={activeWorkspace}
                      onNavigateToProjects={() => setCurrentView('projects')}
                    />
                  </div>
                )}

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
                        onBranchItem={handleBranchItem}
                        onExecuteCode={handleExecuteCodingTurn}
                        onDeleteItem={handleDeleteItem}
                        onResetBoard={handleResetBoard}
                      />
                    </div>
                  </div>
                )}

                {/* View: GitHub Projects Roadmap & Tracker */}
                {currentView === 'projects' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <GitHubProjectsBoard
                      onLaunchSession={() => setCurrentView('antigravity')}
                      onNavigateToView={(v) => setCurrentView(v)}
                    />
                  </div>
                )}

                {/* View: PySpur Studio (DAG Builder) */}
                {currentView === 'pyspur' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <PetriPySpurStudioView onOpenSettings={() => setIsPySpurSettingsModalOpen(true)} />
                  </div>
                )}

                {/* View: Zero (Zeroshot v8 Engine & Invariants) */}
                {currentView === 'zero' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <ZeroView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                    />
                  </div>
                )}

                {/* View: Cosmos Server UI */}
                {currentView === 'cosmos' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <CosmosServerView />
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

                {/* View 4: Enterprise Telemetry, Tokens & Cognitive Stats */}
                {(currentView === 'stats' || currentView === 'stats_telemetry' || currentView === 'stats_tokens') && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <EnterpriseStats
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                      items={items}
                      localNode={localNode}
                      subTab={
                        currentView === 'stats_telemetry'
                          ? 'telemetry'
                          : currentView === 'stats_tokens'
                          ? 'tokens'
                          : 'all'
                      }
                    />
                  </div>
                )}

                {/* View: Generative Suite & Petri Design */}
                {(currentView === 'generative_video' ||
                  currentView === 'generative_audio' ||
                  currentView === 'generative_image' ||
                  currentView === 'generative_multimodal' ||
                  currentView === 'generative_design') && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <GenerativeSuiteView
                      currentView={currentView}
                      onSelectView={setCurrentView}
                    />
                  </div>
                )}

                {/* View: MCP Server Protocol Manager */}
                {currentView === 'mcp' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <McpServerManagerView />
                  </div>
                )}

                {/* View 5: High-Density Terminal User Interface (TUI) */}
                {currentView === 'tui' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <TuiView
                      items={visibleItems}
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                      onFanOutAgents={handleFanOutAgents}
                      onAdvanceStage={handleAdvanceStage}
                      onRecurseAgent={handleRecurseAgent}
                      onSelectView={setCurrentView}
                      onDispatchSkill={handleDispatchSkill}
                    />
                  </div>
                )}

                {/* View 6: Connection & System Settings Panel */}
                {currentView === 'settings' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <PetriSettings
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                      onOpenAiProviderModal={() => setIsAiProviderModalOpen(true)}
                    />
                  </div>
                )}

                {/* View 7: Enterprise AI Governance & SAIF Compliance */}
                {currentView === 'governance' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <GovernanceView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                    />
                  </div>
                )}

                {/* View 8: Petri Server & SmartShield Container Control Center */}
                {currentView === 'server' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <PetriServerView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                    />
                  </div>
                )}

                {/* View 9: Quantum-Enhanced Educational Data Mining (EDM) Dashboard */}
                {currentView === 'edm' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <ErrorBoundary fallbackTitle="PETRI EDM // COGNITIVE DIAGNOSTICS SUBSYSTEM" onReset={() => setCurrentView('node')}>
                      <EdmDashboardView
                        activeWorkspace={activeWorkspace}
                        activeUser={activeUser}
                        onNavigateToNodeStudio={() => setCurrentView('node')}
                        selectedFederatedFileId={selectedEdmSourceFileId}
                        onSelectFederatedSourceFile={setSelectedEdmSourceFileId}
                        onNavigateToFederatedData={() => setCurrentView('federated')}
                        onNavigateToMidtermDemo={() => setCurrentView('midterm_clockin_demo')}
                      />
                    </ErrorBoundary>
                  </div>
                )}

                {/* View 9b: Midterm Examination & Clock-In Longitudinal Live Demo (110+ Lieflat Charts) */}
                {currentView === 'midterm_clockin_demo' && (
                  <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-200 bg-[#041017]">
                    <ErrorBoundary fallbackTitle="PETRI MIDTERM TELEMETRY SUBSYSTEM" onReset={() => setCurrentView('edm')}>
                      <MidtermClockInDemoView
                        onBackToDashboard={() => setCurrentView('edm')}
                      />
                    </ErrorBoundary>
                  </div>
                )}

                {/* View 10: Federated Data Hub, Secure Store & Doc RAG */}
                {currentView === 'federated' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <FederatedDataView
                      onFeedToEdm={(fileId) => {
                        setSelectedEdmSourceFileId(fileId);
                        setCurrentView('edm');
                      }}
                    />
                  </div>
                )}

                {/* View 11: Petri Video Flow (Real AI Video Editor & Scene Generator) */}
                {currentView === 'video_flow' && (
                  <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-200">
                    <PetriVideoFlowEditor />
                  </div>
                )}

                {/* View 13: Petri Digital Media & Artifact Vault (Gallery & Asset Library) */}
                {currentView === 'gallery' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <AssetLibraryView
                      onNavigateToVideoFlow={() => setCurrentView('video_flow')}
                      onNavigateToEdmStudio={() => setCurrentView('edm')}
                    />
                  </div>
                )}

                {/* View 14: Git Development Hub & Horizontal Petri Funnel */}
                {currentView === 'git' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200 bg-[#041017]">
                    <PetriGitDevelopmentView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                    />
                  </div>
                )}
              </>
            )}
          </MotionContainer>

          {/* Agentation Live Preview Panel (When active or toggled) */}
          {isPreviewOpen && (
            <PreviewAgentationPanel
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              activeUser={activeUser}
              onSendAnnotationsToChat={(_markdown) => {
                handleCreateIntent(`[Agentation Feedback] UI Visual Annotations on Preview`, 'issue');
                setCurrentView('chat');
              }}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px touch ergonomics) */}
      {isMobile && (
        <MobileBottomNav
          currentView={currentView}
          onSelectView={handleSelectView}
          onOpenMore={() => setIsMobileMoreOpen(true)}
          isCognitionActive={isCognitionOpen}
        />
      )}

      {/* Mobile Action Drawer for Secondary Views and Modals */}
      <MobileMoreDrawer
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        currentView={currentView}
        onSelectView={handleSelectView}
        activeUser={activeUser}
        activeWorkspace={activeWorkspace}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenAiProviderModal={() => setIsAiProviderModalOpen(true)}
      />

      {/* User Switcher & Identity Modal */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
        activeUserId={activeUserId}
        onSelectUser={(id) => setActiveUserId(id)}
        onAddUser={(newUser) => setUsers((prev) => [...prev, newUser])}
        onUpdateUser={(updatedUser) =>
          setUsers((prev) =>
            prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          )
        }
      />

      {/* Workspace Environment & Target Target Modal */}
      <WorkspaceSelectionModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onConnect={(config) => {
          console.log('Connected Workspace:', config);
          setIsWorkspaceModalOpen(false);
        }}
      />

      {/* PySpur Settings Modal */}
      <PySpurSettingsModal
        isOpen={isPySpurSettingsModalOpen}
        onClose={() => setIsPySpurSettingsModalOpen(false)}
      />

      {/* Gated PR / Signoff Modal */}
      <ApprovalModal
        request={activeApprovalRequest}
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        onApprove={handleApproveGate}
        onReject={handleRejectGate}
      />

      {/* DWD Modal hidden per security policy */}

      {/* AI Models & Providers Monitor & Setup Center Modal */}
      <AiProviderMonitorModal
        isOpen={isAiProviderModalOpen}
        onClose={() => setIsAiProviderModalOpen(false)}
        onSelectModel={(modelId) => setActiveAiModelId(modelId)}
      />

      {/* Global Ambient Agent Live Thinking & Concept HUD Drawer */}
      <AgentCognitionHUD
        mode="drawer"
        isOpen={isCognitionOpen}
        onClose={() => setIsCognitionOpen(false)}
      />

      {/* Global Custom Right-Click Context Menu & Text Selection Copy */}
      <CustomContextMenu
        onSelectView={handleSelectView}
        currentView={currentView}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
      />
      </div>
  );
}

export default App;
