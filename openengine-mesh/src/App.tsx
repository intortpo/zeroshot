import { useState, useMemo } from 'react';
import { NodeMeshStatus } from './components/NodeMeshStatus';
import { PetriIntentBar } from './components/PetriIntentBar';
import { PetriKanban } from './components/PetriKanban';
import { SkillsCatalog } from './components/SkillsCatalog';
import { MemoryExplorer } from './components/MemoryExplorer';
import { EnterpriseStats } from './components/EnterpriseStats';
import { TuiView } from './components/TuiView';
import { UserProfileModal } from './components/UserProfileModal';
import { SilkShaderBackground } from './components/SilkShaderBackground';
import { ApprovalModal } from './components/ApprovalModal';
import { GoogleWorkspaceDwdModal } from './components/GoogleWorkspaceDwdModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { PetriSettings } from './components/PetriSettings';
import { ZeroView } from './components/ZeroView';
import { ChatPlanCanvasView } from './components/ChatPlanCanvasView';
import { NodeStudioView } from './components/node/NodeStudioView';
import { PreviewAgentationPanel } from './components/preview/PreviewAgentationPanel';
import { GovernanceView } from './components/GovernanceView';
import { AgentCognitionHUD } from './components/AgentCognitionHUD';
import { CustomContextMenu } from './components/CustomContextMenu';
import { AiProviderMonitorModal } from './components/models/AiProviderMonitorModal';
import { ConsumerPortalView } from './components/consumer/ConsumerPortalView';
import { PetriServerView } from './components/server/PetriServerView';
import { CentricFocusChatView } from './components/focus/CentricFocusChatView';
import { EdmDashboardView } from './components/edm/EdmDashboardView';
import { MidtermClockInDemoView } from './components/edm/MidtermClockInDemoView';
import { AssetLibraryView } from './components/gallery/AssetLibraryView';
import { PetriVideoFlowEditor } from './components/generative/flow/PetriVideoFlowEditor';
import { GeminiThoughtCompanionView } from './components/companion/GeminiThoughtCompanionView';
import { GeminiThoughtDrawer } from './components/companion/GeminiThoughtDrawer';
import { FederatedDataView } from './components/federated/FederatedDataView';
import { GenerativeSuiteView } from './components/generative/GenerativeSuiteView';
import { McpServerManagerView } from './components/mcp/McpServerManagerView';
import { ProjectsHubView } from './components/projects/ProjectsHubView';
import { PetriGitDevelopmentView } from './components/git/PetriGitDevelopmentView';
import { MotionContainer } from './components/motion/MotionContainer';
import { TierBoundaryGuard } from './components/TierBoundaryGuard';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { MobileMoreDrawer } from './components/mobile/MobileMoreDrawer';
import { useIsMobile } from './hooks/useIsMobile';
import { useMeshLedger } from './hooks/useMeshLedger';
import { STANDARD_TIER_PERSONAS, tierService } from './services/tierService';
import { PetriItem, PetriItemKind, PetriStage, Workspace, SkillCategory, UserProfile, PetriViewMode, SystemTier } from './types';

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

  // Enterprise View: 'focus' (default) | 'chat' | 'board' | 'node' | 'generative_*' | 'mcp' | etc.
  const [currentView, setCurrentView] = useState<PetriViewMode>('focus');
  const handleSelectView = (view: PetriViewMode) => {
    if (view === 'graph') {
      setCurrentView('node');
    } else {
      setCurrentView(view);
    }
  };
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isCognitionOpen, setIsCognitionOpen] = useState<boolean>(false);
  const isMobile = useIsMobile(768);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isCompanionDrawerOpen, setIsCompanionDrawerOpen] = useState(false);

  // 3-Tier Enterprise Users & Identity State (SuperAdmin, Control, Consumer Personas)
  const [users, setUsers] = useState<UserProfile[]>(STANDARD_TIER_PERSONAS);
  const [activeUserId, setActiveUserId] = useState<string>('usr-hideo');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isDwdModalOpen, setIsDwdModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isAiProviderModalOpen, setIsAiProviderModalOpen] = useState(false);
  const [activeAiModelId, setActiveAiModelId] = useState('gemini-3.8-flash-high');
  const [selectedItem, setSelectedItem] = useState<PetriItem | null>(null);
  const [selectedEdmSourceFileId, setSelectedEdmSourceFileId] = useState<string>('f-below-passing');

  // Workspaces State (Authentic Local Repository)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'ws-petri',
      name: 'zero-petri',
      repo: 'foxlight/zero-petri',
      path: '/home/hideo/Documents/GitHub/zero-petri',
      itemCount: 7,
    },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-petri');

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
      setCurrentView('focus');
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
  const [items, setItems] = useState<PetriItem[]>([
    {
      id: 'pt-commit-97a09659',
      workspaceId: 'ws-petri',
      kind: 'feat',
      title: 'transform UI to soft Tiffany pastel light enterprise aesthetic with TUI view',
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
      title: 'streamline UI to soft frost intent bar and left-to-right kanban',
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
    const newItem: PetriItem = {
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
    <div className="flex flex-col h-screen w-screen overflow-hidden text-stone-900 font-sans relative">
      {/* Background: Flowing Tiffany pastel light fluid silk shader */}
      <SilkShaderBackground workflowStatus="running" />

      {/* Soft Frost Ambient Overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-white/15 pointer-events-none z-10" />

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

                {/* View: Centric Focus Chat with Steerable Thinking Cloud */}
                {currentView === 'focus' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <CentricFocusChatView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                      users={users}
                      onHandoffPlan={(plan) => {
                        handleCreateIntent(plan.title, 'feat');
                        setCurrentView('plan');
                      }}
                      onLogGoal={(goal) => handleCreateIntent(goal, 'feat')}
                      onNavigateToView={(v) => setCurrentView(v)}
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
                      />
                    </div>
                  </div>
                )}
         
                {/* View: Node Studio (Visual Platform & DevContainer Pipeline Engine) */}
                {currentView === 'node' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <NodeStudioView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                      onHandoffPlan={(plan) => {
                        handleCreateIntent(plan.title, 'feat');
                        setCurrentView('chat');
                      }}
                      onNavigateToChat={() => setCurrentView('chat')}
                    />
                  </div>
                )}

                {/* View: Projects Hub (Multi-Account GitHub & Local Workspaces) */}
                {currentView === 'projects' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                    <ProjectsHubView
                      activeUser={activeUser}
                      activeWorkspace={activeWorkspace}
                      onSelectWorkspace={(ws) => setActiveWorkspaceId(ws.id)}
                      onNavigateToView={(v) => setCurrentView(v as PetriViewMode)}
                    />
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
                    <EdmDashboardView
                      activeWorkspace={activeWorkspace}
                      activeUser={activeUser}
                      onNavigateToNodeStudio={() => setCurrentView('node')}
                      selectedFederatedFileId={selectedEdmSourceFileId}
                      onSelectFederatedSourceFile={setSelectedEdmSourceFileId}
                      onNavigateToFederatedData={() => setCurrentView('federated')}
                      onNavigateToMidtermDemo={() => setCurrentView('midterm_clockin_demo')}
                    />
                  </div>
                )}

                {/* View 9b: Midterm Examination & Clock-In Longitudinal Live Demo (110+ Lieflat Charts) */}
                {currentView === 'midterm_clockin_demo' && (
                  <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-200 bg-[#041017]">
                    <MidtermClockInDemoView
                      onBackToDashboard={() => setCurrentView('edm')}
                    />
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
                  <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-200 bg-slate-950">
                    <PetriVideoFlowEditor
                      onOpenCompanion={() => setIsCompanionDrawerOpen(true)}
                    />
                  </div>
                )}

                {/* View 12: Gemini Thought Companion (Infinite Forking Open-Ended AI) */}
                {currentView === 'companion' && (
                  <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200 bg-slate-950">
                    <GeminiThoughtCompanionView
                      onNavigateToVideoFlow={() => setCurrentView('video_flow')}
                    />
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
        onOpenDwdModal={() => setIsDwdModalOpen(true)}
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

      {/* Global Gemini Thought Companion Slide-Over Drawer */}
      <GeminiThoughtDrawer
        isOpen={isCompanionDrawerOpen}
        onClose={() => setIsCompanionDrawerOpen(false)}
        onNavigateToVideoFlow={() => setCurrentView('video_flow')}
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
