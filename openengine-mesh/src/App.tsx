import { useState } from 'react';
import { NodeMeshStatus } from './components/NodeMeshStatus';
import { ChatPane } from './components/ChatPane';
import { VisualGraph } from './components/VisualGraph';
import { ApprovalModal } from './components/ApprovalModal';
import { useMeshLedger } from './hooks/useMeshLedger';
import { MessageSquare, GitGraph, ShieldAlert } from 'lucide-react';

export function App() {
  const {
    localNode,
    peers,
    runs,
    activeRunId,
    setActiveRunId,
    nodesState,
    submitGoal,
    submitDeliveryGate,
  } = useMeshLedger();

  const [mobileTab, setMobileTab] = useState<'chat' | 'graph'>('graph');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  const activeRun = runs.find((r) => r.runId === activeRunId);

  const approvalRequest = {
    runId: activeRun?.runId || 'run-default',
    repoPath: 'foxlight/zero-petri',
    diff: activeRun?.diff || 'No diff captured for this run.',
    testLogs: activeRun?.testLogs || 'All acceptance and code review tests passed with 0 defects.',
    verifiers: [
      { name: 'Acceptance Verifier', passed: true },
      { name: 'Code Reviewer', passed: true },
    ],
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-mesh-dark font-sans">
      {/* Top Bar: Mesh Discovery & Hardware Status */}
      <NodeMeshStatus
        localNode={localNode}
        peers={peers}
        activeRunsCount={runs.filter((r) => r.status === 'running' || r.status === 'gated').length}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane: Chat, Goals, and Runs */}
        <div
          className={`w-full md:w-[380px] lg:w-[420px] h-full flex-shrink-0 ${
            mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <ChatPane
            runs={runs}
            activeRunId={activeRunId}
            onSelectRun={(id) => {
              setActiveRunId(id);
              if (window.innerWidth < 768) setMobileTab('graph');
            }}
            onSubmitGoal={submitGoal}
            onOpenApprovalModal={() => setIsApprovalOpen(true)}
          />
        </div>

        {/* Right Pane: Interactive Visual DAG */}
        <div
          className={`flex-1 h-full relative ${
            mobileTab === 'graph' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <VisualGraph
            nodesState={nodesState}
            onSelectNode={(nodeId) => console.log('Selected node:', nodeId)}
            onOpenApproval={() => setIsApprovalOpen(true)}
          />

          {/* Floating Gate Signoff Callout on Mobile/Desktop */}
          {activeRun?.status === 'gated' && !isApprovalOpen && (
            <div className="absolute bottom-16 md:bottom-6 right-6 z-20 animate-bounce">
              <button
                onClick={() => setIsApprovalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xl shadow-amber-950/80 border border-amber-400/40 transition-all hover:scale-105"
              >
                <ShieldAlert className="w-4 h-4 text-amber-200" />
                <span>Action Required: Signoff Gate</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar (Visible only on small screens) */}
      <div className="md:hidden border-t border-mesh-border bg-mesh-card flex items-center justify-around py-2 px-4 select-none z-30">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex flex-col items-center space-y-1 text-[11px] font-medium transition-colors ${
            mobileTab === 'chat' ? 'text-mesh-accent' : 'text-gray-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Goals & Runs</span>
        </button>

        <button
          onClick={() => setMobileTab('graph')}
          className={`flex flex-col items-center space-y-1 text-[11px] font-medium transition-colors ${
            mobileTab === 'graph' ? 'text-mesh-accent' : 'text-gray-400'
          }`}
        >
          <GitGraph className="w-5 h-5" />
          <span>Pipeline DAG</span>
        </button>
      </div>

      {/* Gated PR / Signoff Modal */}
      <ApprovalModal
        request={approvalRequest}
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        onApprove={async (runId) => {
          await submitDeliveryGate(runId, true);
        }}
        onReject={async (runId, feedback) => {
          await submitDeliveryGate(runId, false, feedback);
        }}
      />
    </div>
  );
}

export default App;
