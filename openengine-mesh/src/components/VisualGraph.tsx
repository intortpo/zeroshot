import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Handle,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Activity,
  Brain,
  Cpu,
  Sparkles,
  Database,
  Moon,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { GraphNodeState, NodeExecutionStatus } from '../types';
import { SilkShaderBackground } from './SilkShaderBackground';

interface VisualGraphProps {
  nodesState: Record<string, GraphNodeState>;
  onSelectNode?: (nodeId: string) => void;
  onOpenApproval?: () => void;
}

// Custom Cognitive Core Pipeline Node with soft ink styling
const CognitiveNode: React.FC<{
  data: {
    title: string;
    subtitle: string;
    items: string[];
    status: NodeExecutionStatus;
    icon: React.ReactNode;
    badge?: string;
    isGate?: boolean;
    onAction?: () => void;
  };
}> = ({ data }) => {
  return (
    <div
      onClick={data.onAction}
      className={`px-4 py-3 rounded-xl border min-w-[260px] max-w-[290px] cursor-pointer transition-all duration-300 select-none backdrop-blur-md ${
        data.status === 'gated'
          ? 'border-[#444] bg-[#141414]/90 text-[#f5f5f5] shadow-xl animate-pulse'
          : data.status === 'running'
          ? 'border-[#333] bg-[#121212]/90 text-[#e0e0e0] shadow-lg'
          : 'border-[#1c1c1c] bg-[#0c0c0c]/90 text-[#a3a3a3] hover:border-[#2e2e2e] hover:bg-[#101010]/95'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#525252] !w-2 !h-2 !border-none" />
      <Handle type="target" position={Position.Left} className="!bg-[#525252] !w-2 !h-2 !border-none" />

      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#171717] border border-[#222]">
            {data.icon}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#f5f5f5] tracking-tight">{data.title}</div>
            <div className="text-[9px] text-[#737373] font-mono">{data.subtitle}</div>
          </div>
        </div>

        {data.badge && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#171717] text-[#a3a3a3] border border-[#262626]">
            {data.badge}
          </span>
        )}
      </div>

      <ul className="space-y-0.5 mt-2 pt-2 border-t border-[#171717] text-[10px] font-mono text-[#737373]">
        {data.items.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-1.5">
            <span className="w-1 h-1 rounded-full bg-[#525252]" />
            <span className="truncate">{item}</span>
          </li>
        ))}
      </ul>

      <Handle type="source" position={Position.Bottom} className="!bg-[#525252] !w-2 !h-2 !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-[#525252] !w-2 !h-2 !border-none" />
    </div>
  );
};

const nodeTypes = {
  cognitiveNode: CognitiveNode,
};

export const VisualGraph: React.FC<VisualGraphProps> = ({
  nodesState,
  onSelectNode,
  onOpenApproval,
}) => {
  const [activePillar, setActivePillar] = useState<'shadow' | 'arbitrator' | 'memory' | null>('shadow');
  const [showPillarDetails, setShowPillarDetails] = useState(true);

  const gateStatus = nodesState.gate?.status || 'gated';
  const workerStatus = nodesState.worker?.status || 'passed';

  const nodes: Node[] = useMemo(
    () => [
      {
        id: 'sensory',
        type: 'cognitiveNode',
        position: { x: 380, y: 25 },
        data: {
          title: 'Continuous Sensory Feed',
          subtitle: 'Real-Time Developer Telemetry',
          badge: 'Continuous',
          icon: <Activity className="w-4 h-4 text-[#a3a3a3]" />,
          items: [
            'Passive terminal output & compiler errors',
            'Live AST modifications & file saves',
            'Active GitHub issue & PR stream',
          ],
          status: 'running',
          onAction: () => onSelectNode?.('sensory'),
        },
      },
      {
        id: 'arbitrator',
        type: 'cognitiveNode',
        position: { x: 380, y: 175 },
        data: {
          title: 'The Attention Arbitrator',
          subtitle: 'Intervention Decision Engine',
          badge: 'Evaluates Need',
          icon: <Brain className="w-4 h-4 text-[#d4d4d4]" />,
          items: [
            'Evaluates: Does human need intervention?',
            'Confusion latency & lingering focus analysis',
            'Self-scheduling autonomous cognitive thread',
          ],
          status: 'running',
          onAction: () => {
            setActivePillar('arbitrator');
            onSelectNode?.('arbitrator');
          },
        },
      },
      {
        id: 'shadow',
        type: 'cognitiveNode',
        position: { x: 120, y: 335 },
        data: {
          title: 'Silent Shadow',
          subtitle: 'Speculative RTX Containers',
          badge: 'Autonomous RTX',
          icon: <Cpu className="w-4 h-4 text-[#8e8e8e]" />,
          items: [
            'Speculative diffs & branch pre-computation',
            'Isolated Docker target verification',
            'Type integrity proof before git commit',
          ],
          status: workerStatus,
          onAction: () => {
            setActivePillar('shadow');
            onSelectNode?.('shadow');
          },
        },
      },
      {
        id: 'emergence',
        type: 'cognitiveNode',
        position: { x: 640, y: 335 },
        data: {
          title: 'Active Emergence',
          subtitle: 'Human-Aligned Surface',
          badge: '1-Tap Signoff',
          icon: <Sparkles className="w-4 h-4 text-[#e5e5e5]" />,
          items: [
            'Ambient voice notes & dynamic HUD hints',
            'Compiler error resolution proposals',
            '1-Tap gate signoff & GitHub PR delivery',
          ],
          status: gateStatus,
          isGate: true,
          onAction: onOpenApproval,
        },
      },
      {
        id: 'consolidation',
        type: 'cognitiveNode',
        position: { x: 380, y: 500 },
        data: {
          title: 'Autonomous Memory Consolidation',
          subtitle: 'Background Sleep / Dream Cycle',
          badge: 'Episodic SQLite',
          icon: <Database className="w-4 h-4 text-[#a3a3a3]" />,
          items: [
            'Durable episodic SQLite ledger record',
            'Pruning of stale speculative hypotheses',
            'Learned codebase heuristics into persistent RAG',
          ],
          status: 'idle',
          onAction: () => {
            setActivePillar('memory');
            onSelectNode?.('consolidation');
          },
        },
      },
    ],
    [workerStatus, gateStatus, onSelectNode, onOpenApproval]
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: 'e-sensory-arbitrator',
        source: 'sensory',
        target: 'arbitrator',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#525252', strokeWidth: 2 },
      },
      {
        id: 'e-arbitrator-shadow',
        source: 'arbitrator',
        target: 'shadow',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#525252', strokeWidth: 2 },
      },
      {
        id: 'e-arbitrator-emergence',
        source: 'arbitrator',
        target: 'emergence',
        animated: gateStatus === 'gated',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#737373', strokeWidth: 2 },
      },
      {
        id: 'e-shadow-consolidation',
        source: 'shadow',
        target: 'consolidation',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#333333', strokeWidth: 1.5 },
      },
      {
        id: 'e-emergence-consolidation',
        source: 'emergence',
        target: 'consolidation',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#333333', strokeWidth: 1.5 },
      },
    ],
    [gateStatus]
  );

  return (
    <div className="w-full h-full bg-[#070707] relative overflow-hidden flex flex-col font-sans">
      {/* Super smooth flowing silk shader in background */}
      <SilkShaderBackground workflowStatus={gateStatus === 'gated' ? 'gated' : 'running'} />

      {/* Main Graph Flow Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.3}
          maxZoom={1.5}
          className="!bg-transparent"
        >
          <Background color="#1a1a1a" gap={20} size={1} className="!opacity-30" />
          <Controls className="!bg-[#0c0c0c]/80 !backdrop-blur-md !border-[#1c1c1c] !fill-[#737373] shadow-xl" />
        </ReactFlow>
      </div>

      {/* Pillars of Continuous Intelligence Bottom Drawer */}
      <div className="border-t border-[#1c1c1c] bg-[#090909]/95 backdrop-blur-md p-3.5 z-20 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#f5f5f5]">
            <Brain className="w-3.5 h-3.5 text-[#8e8e8e]" />
            <span className="font-semibold">The Cognitive Core Architecture</span>
            <span className="text-[#525252]">·</span>
            <span className="text-[#737373]">Autonomous Cognitive Thread on RTX</span>
          </div>

          <button
            onClick={() => setShowPillarDetails(!showPillarDetails)}
            className="text-[11px] font-mono text-[#737373] hover:text-[#f5f5f5] flex items-center space-x-1 transition-colors"
          >
            <span>{showPillarDetails ? 'Collapse Insights' : 'Expand Insights'}</span>
            {showPillarDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showPillarDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Pillar 1: Shadow Graph Execution */}
            <div
              onClick={() => setActivePillar('shadow')}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                activePillar === 'shadow'
                  ? 'border-[#333333] bg-[#121212]'
                  : 'border-[#171717] bg-[#0c0c0c] hover:border-[#222]'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-medium text-[#f5f5f5] mb-1 font-mono text-[11px]">
                <Cpu className="w-3 h-3 text-[#a3a3a3]" />
                <span>Shadow Graph Execution</span>
              </div>
              <p className="text-[10px] text-[#737373] leading-relaxed">
                While you write code or view issues, the RTX server spins up speculative test environments in isolated target containers. It anticipates test cases and verifies type integrity before you run <code className="text-[#a3a3a3]">cargo test</code>.
              </p>
            </div>

            {/* Pillar 2: The Attention Arbitrator */}
            <div
              onClick={() => setActivePillar('arbitrator')}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                activePillar === 'arbitrator'
                  ? 'border-[#333333] bg-[#121212]'
                  : 'border-[#171717] bg-[#0c0c0c] hover:border-[#222]'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-medium text-[#f5f5f5] mb-1 font-mono text-[11px]">
                <Zap className="w-3 h-3 text-[#a3a3a3]" />
                <span>The Attention Arbitrator</span>
              </div>
              <p className="text-[10px] text-[#737373] leading-relaxed">
                Decides whether to remain silent or surface insight. Observes compiler traces, prepares fixes in shadow memory, and only interrupts with an ambient voice note or HUD hint if your focus lingers in confusion.
              </p>
            </div>

            {/* Pillar 3: Evolving Memory & Sleep Cycles */}
            <div
              onClick={() => setActivePillar('memory')}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                activePillar === 'memory'
                  ? 'border-[#333333] bg-[#121212]'
                  : 'border-[#171717] bg-[#0c0c0c] hover:border-[#222]'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-medium text-[#f5f5f5] mb-1 font-mono text-[11px]">
                <Moon className="w-3 h-3 text-[#a3a3a3]" />
                <span>Memory & Sleep Cycles</span>
              </div>
              <p className="text-[10px] text-[#737373] leading-relaxed">
                Working context stays live in multimodal context. Durable episodic SQLite ledger records code evolution. When idle, night routines consolidate diffs, synthesize error heuristics, and optimize local embeddings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
