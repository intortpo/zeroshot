import React, { useState } from 'react';
import {
  FolderGit2,
  GitCommit,
  Activity,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';
import { ProjectOverview, ProjectTask, TaskLifecycleStatus } from '../types';

interface ProjectTrackerProps {
  onOpenGateModal: (runId: string) => void;
  onSelectTask?: (task: ProjectTask) => void;
}

export const ProjectTracker: React.FC<ProjectTrackerProps> = ({
  onOpenGateModal,
  onSelectTask,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Canonical End-to-End Project State
  const [project] = useState<ProjectOverview>({
    id: 'proj-cognitive-core',
    name: 'The Cognitive Core (Continuous, Evolving Intelligence)',
    repo: 'foxlight/zero-petri',
    branch: 'main',
    description:
      'Rather than waiting for a job submission, the cognitive engine runs on the RTX server as an autonomous, self-scheduling cognitive thread.',
    milestones: [
      {
        id: 'ms-01',
        title: 'Continuous Sensory Feed',
        phase: 'Phase 01',
        description: 'Passive terminal monitoring, AST changes, and GitHub issue event stream integration.',
        status: 'completed',
        progress: 100,
        taskIds: ['tsk-101', 'tsk-102'],
      },
      {
        id: 'ms-02',
        title: 'Shadow Graph Execution on RTX',
        phase: 'Phase 02',
        description: 'Speculative isolated containers anticipating test cases and verifying type integrity.',
        status: 'completed',
        progress: 100,
        taskIds: ['tsk-103'],
      },
      {
        id: 'ms-03',
        title: 'The Attention Arbitrator',
        phase: 'Phase 03',
        description: 'Evaluates confusion vs flow; routes between Silent Shadow and Active Emergence.',
        status: 'in_progress',
        progress: 90,
        taskIds: ['tsk-104'],
      },
      {
        id: 'ms-04',
        title: 'Autonomous Memory Consolidation',
        phase: 'Phase 04',
        description: 'Background Sleep / Dream cycles, episodic SQLite ledger, and persistent heuristic RAG.',
        status: 'in_progress',
        progress: 80,
        taskIds: ['tsk-105'],
      },
    ],
    tasks: [
      {
        id: 'tsk-101',
        runId: 'run-8f921bc4-001',
        title: 'Implement live Tailscale status JSON parser & peer registry',
        component: 'mesh::discovery',
        assignedAgent: 'Agy Worker',
        status: 'completed',
        commitHash: '4b4b23b8',
        linesAdded: 107,
        linesRemoved: 2,
        durationSeconds: 27,
        updatedAt: Date.now() - 3600000,
      },
      {
        id: 'tsk-102',
        title: 'Dynamic work router (RTX host heavy routing vs thin client)',
        component: 'mesh::router',
        assignedAgent: 'Agy Worker',
        status: 'completed',
        commitHash: '7a892b31',
        linesAdded: 84,
        linesRemoved: 0,
        durationSeconds: 19,
        updatedAt: Date.now() - 3200000,
      },
      {
        id: 'tsk-103',
        title: 'Direct nvidia-smi VRAM querying and GPU role classification',
        component: 'hardware::detect',
        assignedAgent: 'Agy Worker',
        status: 'completed',
        commitHash: 'b657c2a9',
        linesAdded: 96,
        linesRemoved: 4,
        durationSeconds: 22,
        updatedAt: Date.now() - 2500000,
      },
      {
        id: 'tsk-104',
        runId: 'run-8f921bc4-001',
        title: 'Parallel verifier execution (acceptance tests + code review)',
        component: 'verifier::pipeline',
        assignedAgent: 'Acceptance & Code Verifier',
        status: 'verifying',
        linesAdded: 142,
        linesRemoved: 12,
        durationSeconds: 45,
        updatedAt: Date.now() - 600000,
      },
      {
        id: 'tsk-105',
        runId: 'run-8f921bc4-001',
        title: 'Human signoff gate & automated PR delivery execution',
        component: 'gate::delivery',
        assignedAgent: 'Human Gatekeeper',
        status: 'gated',
        linesAdded: 68,
        linesRemoved: 5,
        durationSeconds: 12,
        updatedAt: Date.now() - 60000,
      },
    ],
    metrics: {
      totalTasks: 5,
      completedTasks: 3,
      activeRuns: 1,
      gatedApprovals: 1,
      repairTurnCount: 0,
      totalTokens: 18420,
      testPassRate: 100,
    },
  });

  const filteredTasks = project.tasks.filter((t) => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && (t.status === 'in_progress' || t.status === 'verifying' || t.status === 'gated')) ||
      t.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.component.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: TaskLifecycleStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-1.5 text-[#a3a3a3] font-sans text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8e8e8e]" />
            <span>Delivered</span>
          </span>
        );
      case 'gated':
        return (
          <span className="flex items-center space-x-1.5 text-[#e5e5e5] font-sans text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4d4d4]" />
            <span>Awaiting Signoff</span>
          </span>
        );
      case 'verifying':
        return (
          <span className="flex items-center space-x-1.5 text-[#737373] font-sans text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#525252] animate-ping" />
            <span>Verifying</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center space-x-1.5 text-[#737373] font-sans text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#525252]" />
            <span>In Flight</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1.5 text-[#525252] font-sans text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#262626]" />
            <span>Queued</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#070707] text-[#e0e0e0] font-sans select-none overflow-y-auto">
      {/* Project Header - Soft Ink Aesthetic */}
      <div className="border-b border-[#1c1c1c] p-6 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs text-[#737373] font-sans tracking-wide">
              <FolderGit2 className="w-3.5 h-3.5 text-[#a3a3a3]" />
              <span>{project.repo}</span>
              <span>/</span>
              <span className="text-[#a3a3a3]">{project.branch}</span>
            </div>
            <h1 className="text-xl font-medium tracking-tight text-[#f5f5f5]">
              {project.name}
            </h1>
            <p className="text-xs text-[#737373] max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="flex items-center gap-5 border border-[#1f1f1f] bg-[#0c0c0c] px-4 py-2.5 rounded-lg text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#525252] uppercase font-sans">Completion</span>
              <span className="text-sm font-sans font-medium text-[#e5e5e5]">
                {Math.round((project.metrics.completedTasks / project.metrics.totalTasks) * 100)}%
              </span>
            </div>
            <div className="w-[1px] h-6 bg-[#1f1f1f]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#525252] uppercase font-sans">Pass Rate</span>
              <span className="text-sm font-sans font-medium text-[#e5e5e5]">
                {project.metrics.testPassRate}%
              </span>
            </div>
            <div className="w-[1px] h-6 bg-[#1f1f1f]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#525252] uppercase font-sans">Gated Signoff</span>
              <span className="text-sm font-sans font-medium text-[#e5e5e5]">
                {project.metrics.gatedApprovals} Active
              </span>
            </div>
          </div>
        </div>

        {/* Minimalist Progress Hairline */}
        <div className="w-full bg-[#171717] h-[2px] mt-6 rounded-full overflow-hidden">
          <div
            className="bg-[#737373] h-full transition-all duration-700 ease-out"
            style={{
              width: `${(project.metrics.completedTasks / project.metrics.totalTasks) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Phase Milestones - Clean Horizontal Flow */}
      <div className="border-b border-[#1c1c1c] px-6 py-4 bg-[#090909]">
        <div className="text-[10px] uppercase font-sans text-[#525252] tracking-wider mb-3 flex items-center space-x-1.5">
          <Layers className="w-3 h-3" />
          <span>Execution Phases</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {project.milestones.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-lg border transition-all ${
                m.status === 'completed'
                  ? 'border-[#1f1f1f] bg-[#0c0c0c] text-[#8e8e8e]'
                  : m.status === 'in_progress'
                  ? 'border-[#2e2e2e] bg-[#111111] text-[#e0e0e0]'
                  : 'border-[#171717] bg-[#080808] text-[#525252]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-sans mb-1.5">
                <span className="text-[#737373]">{m.phase}</span>
                <span className="text-[#a3a3a3] font-medium">{m.progress}%</span>
              </div>
              <div className="text-xs font-medium text-[#e5e5e5] mb-1">{m.title}</div>
              <div className="text-[11px] text-[#737373] line-clamp-2 leading-relaxed">
                {m.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Task Ledger */}
      <div className="flex-1 p-6 space-y-4">
        {/* Controls: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            {['all', 'active', 'gated', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-md font-sans text-[11px] capitalize transition-colors ${
                  filterStatus === tab
                    ? 'bg-[#1c1c1c] text-[#f5f5f5] border border-[#2e2e2e]'
                    : 'text-[#737373] hover:text-[#a3a3a3] hover:bg-[#111111]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-[#0c0c0c] border border-[#1c1c1c] px-2.5 py-1.5 rounded-md w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#525252]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks or components..."
              className="bg-transparent focus:outline-none text-[11px] text-[#e0e0e0] placeholder-[#525252] w-full font-sans"
            />
          </div>
        </div>

        {/* Task Rows Table */}
        <div className="border border-[#1c1c1c] rounded-lg overflow-hidden bg-[#0a0a0a]">
          <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[#1c1c1c] text-[10px] font-sans uppercase text-[#525252] tracking-wider bg-[#0d0d0d]">
            <div className="col-span-4 sm:col-span-3">Task & Component</div>
            <div className="col-span-4 sm:col-span-4">Execution Summary</div>
            <div className="hidden sm:block sm:col-span-2">Agent / Actor</div>
            <div className="col-span-4 sm:col-span-3 text-right">Status & Action</div>
          </div>

          <div className="divide-y divide-[#171717]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask?.(task)}
                className="grid grid-cols-12 px-4 py-3.5 items-center text-xs hover:bg-[#0f0f0f] transition-colors cursor-pointer group"
              >
                {/* ID & Component */}
                <div className="col-span-4 sm:col-span-3 space-y-0.5">
                  <div className="font-sans text-[10px] text-[#737373] flex items-center space-x-1.5">
                    <span>{task.id}</span>
                    <span>·</span>
                    <span className="text-[#a3a3a3]">{task.component}</span>
                  </div>
                  {task.commitHash && (
                    <div className="flex items-center space-x-1 text-[10px] text-[#525252] font-sans">
                      <GitCommit className="w-3 h-3" />
                      <span>{task.commitHash}</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="col-span-4 sm:col-span-4 pr-3">
                  <div className="font-medium text-[#e0e0e0] group-hover:text-[#f5f5f5] transition-colors">
                    {task.title}
                  </div>
                  <div className="text-[10px] text-[#525252] font-sans mt-0.5">
                    +{task.linesAdded} / -{task.linesRemoved} lines
                  </div>
                </div>

                {/* Agent */}
                <div className="hidden sm:block sm:col-span-2 text-[11px] text-[#737373] font-sans">
                  {task.assignedAgent}
                </div>

                {/* Status & Actions */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-end space-x-3">
                  {getStatusBadge(task.status)}

                  {task.status === 'gated' && task.runId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenGateModal(task.runId!);
                      }}
                      className="px-2.5 py-1 rounded bg-[#222222] hover:bg-[#2b2b2b] text-[#f5f5f5] text-[10px] font-sans border border-[#333] transition-colors"
                    >
                      Signoff
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-[#525252] px-2 py-3 border-t border-[#171717] gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-[#737373]" />
              <span>Durable Ledger: Online (Append-Only)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#737373]" />
              <span>Tokens: {project.metrics.totalTokens.toLocaleString()}</span>
            </span>
          </div>

          <div className="text-[#404040]">
            Press <kbd className="px-1 py-0.5 rounded bg-[#171717] text-[#737373]">Tab</kbd> to switch views
          </div>
        </div>
      </div>
    </div>
  );
};
