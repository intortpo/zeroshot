import React, { useMemo } from 'react';
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
import { Bot, CheckCircle2, XCircle, ShieldAlert, GitPullRequest, Loader2 } from 'lucide-react';
import { GraphNodeState, NodeExecutionStatus } from '../types';

interface VisualGraphProps {
  nodesState: Record<string, GraphNodeState>;
  onSelectNode?: (nodeId: string) => void;
  onOpenApproval?: () => void;
}

// Custom Pipeline Node Component
const PipelineNode: React.FC<{
  data: {
    title: string;
    role: string;
    status: NodeExecutionStatus;
    icon: React.ReactNode;
    isGate?: boolean;
    onAction?: () => void;
  };
}> = ({ data }) => {
  const statusColors = {
    idle: 'border-mesh-border bg-gray-900/90 text-gray-400',
    running: 'border-blue-500 bg-blue-950/70 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    passed: 'border-emerald-500 bg-emerald-950/70 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    failed: 'border-rose-500 bg-rose-950/70 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    gated: 'border-amber-500 bg-amber-950/70 text-amber-300 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]',
  };

  return (
    <div
      onClick={data.onAction}
      className={`px-4 py-3 rounded-lg border-2 min-w-[200px] cursor-pointer transition-all duration-300 select-none ${
        statusColors[data.status]
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          {data.icon}
          <div>
            <div className="text-sm font-semibold text-white tracking-wide">{data.title}</div>
            <div className="text-[10px] text-gray-400 uppercase font-mono">{data.role}</div>
          </div>
        </div>

        <div className="flex items-center">
          {data.status === 'running' && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
          {data.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {data.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
          {data.status === 'gated' && <ShieldAlert className="w-4 h-4 text-amber-400 animate-bounce" />}
        </div>
      </div>

      {data.isGate && data.status === 'gated' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onAction?.();
          }}
          className="mt-2.5 w-full py-1 px-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded shadow-md transition-colors"
        >
          Review & Signoff
        </button>
      )}

      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = {
  pipelineNode: PipelineNode,
};

export const VisualGraph: React.FC<VisualGraphProps> = ({
  nodesState,
  onSelectNode,
  onOpenApproval,
}) => {
  const workerStatus = nodesState['worker']?.status || 'idle';
  const acceptanceStatus = nodesState['acceptance']?.status || 'idle';
  const codeStatus = nodesState['code']?.status || 'idle';
  const gateStatus = nodesState['gate']?.status || 'idle';
  const deliveryStatus = nodesState['deliver']?.status || 'idle';

  const nodes: Node[] = useMemo(
    () => [
      {
        id: 'worker',
        type: 'pipelineNode',
        position: { x: 50, y: 150 },
        data: {
          title: 'Worker Agent',
          role: 'Code Generator',
          status: workerStatus,
          icon: <Bot className="w-5 h-5 text-indigo-400" />,
          onAction: () => onSelectNode?.('worker'),
        },
      },
      {
        id: 'acceptance',
        type: 'pipelineNode',
        position: { x: 340, y: 60 },
        data: {
          title: 'Acceptance Verifier',
          role: 'Behavioral Tests',
          status: acceptanceStatus,
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          onAction: () => onSelectNode?.('acceptance'),
        },
      },
      {
        id: 'code',
        type: 'pipelineNode',
        position: { x: 340, y: 240 },
        data: {
          title: 'Code Reviewer',
          role: 'Safety & Quality',
          status: codeStatus,
          icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />,
          onAction: () => onSelectNode?.('code'),
        },
      },
      {
        id: 'gate',
        type: 'pipelineNode',
        position: { x: 630, y: 150 },
        data: {
          title: 'Human Gate',
          role: 'Signoff / Review',
          status: gateStatus,
          isGate: true,
          icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
          onAction: onOpenApproval,
        },
      },
      {
        id: 'deliver',
        type: 'pipelineNode',
        position: { x: 920, y: 150 },
        data: {
          title: 'Automated Delivery',
          role: 'PR & CI Merge',
          status: deliveryStatus,
          icon: <GitPullRequest className="w-5 h-5 text-purple-400" />,
          onAction: () => onSelectNode?.('deliver'),
        },
      },
    ],
    [workerStatus, acceptanceStatus, codeStatus, gateStatus, deliveryStatus, onSelectNode, onOpenApproval]
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: 'e-worker-acceptance',
        source: 'worker',
        target: 'acceptance',
        animated: workerStatus === 'running' || acceptanceStatus === 'running',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#4b5563', strokeWidth: 2 },
      },
      {
        id: 'e-worker-code',
        source: 'worker',
        target: 'code',
        animated: workerStatus === 'running' || codeStatus === 'running',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#4b5563', strokeWidth: 2 },
      },
      {
        id: 'e-acceptance-gate',
        source: 'acceptance',
        target: 'gate',
        animated: acceptanceStatus === 'passed' && gateStatus === 'gated',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#4b5563', strokeWidth: 2 },
      },
      {
        id: 'e-code-gate',
        source: 'code',
        target: 'gate',
        animated: codeStatus === 'passed' && gateStatus === 'gated',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#4b5563', strokeWidth: 2 },
      },
      {
        id: 'e-gate-deliver',
        source: 'gate',
        target: 'deliver',
        animated: deliveryStatus === 'running',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#4b5563', strokeWidth: 2 },
      },
    ],
    [workerStatus, acceptanceStatus, codeStatus, gateStatus, deliveryStatus]
  );

  return (
    <div className="w-full h-full bg-mesh-dark relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background color="#21262d" gap={16} size={1} />
        <Controls className="!bg-mesh-card !border-mesh-border !fill-gray-300" />
      </ReactFlow>
    </div>
  );
};
