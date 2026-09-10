import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  GitBranch,
  Layers,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Workflow,
  Target,
  MessageSquare,
  Cpu,
  Database,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Activity,
  Check,
  Box,
  Sliders,
  FileText,
  Repeat,
  CheckSquare,
  Play,
  StepForward,
  Pencil,
  Trash2,
  Maximize2,
  LayoutGrid,
} from 'lucide-react';
import {
  PySpurWorkflow,
  PySpurNode,
} from '../../types';

interface PySpurNodeCanvasProps {
  workflow: PySpurWorkflow;
  selectedNodeId: string | null;
  onSelectNode: (node: PySpurNode | null) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  isRunning?: boolean;
  onRunAll?: () => void;
  onRunSingleNode?: (nodeId: string) => void;
  onStepNext?: () => void;
  onResetWorkflow?: () => void;
  onDeleteNode?: (nodeId: string) => void;
  onEditNode?: (nodeId: string) => void;
  onAddEdge?: (sourceNodeId: string, sourceHandle: string, targetNodeId: string, targetHandle: string) => void;
  onAutoLayout?: () => void;
}

// Icon mapper for nodes
const NODE_ICONS: Record<string, React.ElementType> = {
  MessageSquare,
  GitBranch,
  Layers,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Workflow,
  Target,
  Cpu,
  Database,
  Sparkles,
  Box,
  Sliders,
  FileText,
  Repeat,
  CheckSquare,
};

export const PySpurNodeCanvas: React.FC<PySpurNodeCanvasProps> = ({
  workflow,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  isRunning = false,
  onRunAll,
  onRunSingleNode,
  onStepNext,
  onResetWorkflow,
  onDeleteNode,
  onEditNode,
  onAddEdge,
  onAutoLayout,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging individual node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive Wire Creation State
  const [connectingSource, setConnectingSource] = useState<{ nodeId: string; handle: string } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Escape key cancels active wire creation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConnectingSource(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Canvas Pan Mouse Events
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.pyspur-node-card') || (e.target as HTMLElement).closest('.pyspur-port-handle')) return;
    if (connectingSource) {
      setConnectingSource(null);
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;
      setMouseCanvasPos({ x: canvasX, y: canvasY });
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggingNodeId) {
      const newX = Math.round((e.clientX - dragOffset.x - pan.x) / zoom);
      const newY = Math.round((e.clientY - dragOffset.y - pan.y) / zoom);
      onUpdateNodePosition(draggingNodeId, { x: Math.max(10, newX), y: Math.max(10, newY) });
    }
  }, [isPanning, startPan, draggingNodeId, dragOffset, pan, zoom, onUpdateNodePosition]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Zoom to Fit all nodes inside current canvas viewport
  const handleZoomToFit = useCallback(() => {
    if (!workflow.nodes.length || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minX = Math.min(...workflow.nodes.map((n) => n.position.x));
    const maxX = Math.max(...workflow.nodes.map((n) => n.position.x + 250));
    const minY = Math.min(...workflow.nodes.map((n) => n.position.y));
    const maxY = Math.max(...workflow.nodes.map((n) => n.position.y + 130));

    const contentWidth = Math.max(280, maxX - minX);
    const contentHeight = Math.max(180, maxY - minY);

    const fitZoom = Math.max(0.4, Math.min(1.1, Math.min((rect.width - 80) / contentWidth, (rect.height - 80) / contentHeight)));
    setZoom(fitZoom);
    setPan({
      x: (rect.width - contentWidth * fitZoom) / 2 - minX * fitZoom,
      y: (rect.height - contentHeight * fitZoom) / 2 - minY * fitZoom,
    });
  }, [workflow.nodes]);

  // Hierarchical Topological Auto-Layout
  const handleAutoLayout = useCallback(() => {
    if (onAutoLayout) {
      onAutoLayout();
      return;
    }
    const cols: Record<number, string[]> = {};
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    workflow.nodes.forEach((n) => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    workflow.edges.forEach((e) => {
      if (adj[e.sourceNodeId]) adj[e.sourceNodeId].push(e.targetNodeId);
      if (inDegree[e.targetNodeId] !== undefined) inDegree[e.targetNodeId]++;
    });

    const depth: Record<string, number> = {};
    const queue = workflow.nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
    queue.forEach((id) => { depth[id] = 0; });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const d = depth[u] || 0;
      if (!cols[d]) cols[d] = [];
      if (!cols[d].includes(u)) cols[d].push(u);

      for (const v of adj[u] || []) {
        inDegree[v]--;
        depth[v] = Math.max(depth[v] || 0, d + 1);
        if (inDegree[v] === 0) queue.push(v);
      }
    }

    workflow.nodes.forEach((n) => {
      if (depth[n.id] === undefined) {
        const lastCol = Math.max(0, ...Object.keys(cols).map(Number)) + 1;
        if (!cols[lastCol]) cols[lastCol] = [];
        cols[lastCol].push(n.id);
      }
    });

    Object.entries(cols).forEach(([colIdxStr, nodeIds]) => {
      const colIdx = Number(colIdxStr);
      nodeIds.forEach((nodeId, rowIdx) => {
        const x = 50 + colIdx * 290;
        const y = 80 + rowIdx * 170;
        onUpdateNodePosition(nodeId, { x, y });
      });
    });
  }, [workflow.nodes, workflow.edges, onAutoLayout, onUpdateNodePosition]);

  // Handle Node Card Mouse Down for Dragging
  const handleNodeMouseDown = (e: React.MouseEvent, node: PySpurNode) => {
    e.stopPropagation();
    onSelectNode(node);
    setDraggingNodeId(node.id);
    const canvasRect = containerRef.current?.getBoundingClientRect();
    if (canvasRect) {
      setDragOffset({
        x: e.clientX - (node.position.x * zoom + pan.x),
        y: e.clientY - (node.position.y * zoom + pan.y),
      });
    }
  };

  // Build lookup of node coordinates
  const nodeMap = useMemo(() => {
    const map = new Map<string, PySpurNode>();
    workflow.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [workflow.nodes]);

  // Compute SVG Bezier curves for all edges
  const renderedEdges = useMemo(() => {
    return workflow.edges.map((edge) => {
      const source = nodeMap.get(edge.sourceNodeId);
      const target = nodeMap.get(edge.targetNodeId);
      if (!source || !target) return null;

      // Approximate handle positions based on typical card size (w: 240, h: 90)
      const startX = source.position.x + 240;
      let startY = source.position.y + 44;
      if (edge.sourceHandle === 'true') {
        startY = source.position.y + 28;
      } else if (edge.sourceHandle === 'false') {
        startY = source.position.y + 60;
      }

      const endX = target.position.x;
      const endY = target.position.y + 44;

      const deltaX = Math.max(50, Math.abs(endX - startX) * 0.45);
      const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

      const isEdgeActive = edge.isActive !== false;
      const isHighlighted =
        edge.sourceNodeId === selectedNodeId || edge.targetNodeId === selectedNodeId;

      return {
        ...edge,
        pathD,
        startX,
        startY,
        endX,
        endY,
        midX: (startX + endX) / 2,
        midY: (startY + endY) / 2,
        isEdgeActive,
        isHighlighted,
      };
    }).filter(Boolean);
  }, [workflow.edges, nodeMap, selectedNodeId]);

  // Connecting line calculation
  const connectingLinePath = useMemo(() => {
    if (!connectingSource) return null;
    const source = nodeMap.get(connectingSource.nodeId);
    if (!source) return null;

    const startX = source.position.x + 240;
    let startY = source.position.y + 44;
    if (connectingSource.handle === 'true') startY = source.position.y + 28;
    if (connectingSource.handle === 'false') startY = source.position.y + 60;

    const endX = mouseCanvasPos.x;
    const endY = mouseCanvasPos.y;
    const deltaX = Math.max(40, Math.abs(endX - startX) * 0.4);
    return `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;
  }, [connectingSource, nodeMap, mouseCanvasPos]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownCanvas}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-stone-50/50"
      style={{
        backgroundImage: `radial-gradient(#e2e8f0 1px, transparent 1px)`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoom / Pan / Layout Controls Overlay */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center space-x-1.5 p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono text-stone-500 px-1 font-semibold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3.5 bg-stone-200 mx-0.5" />
        <button
          type="button"
          onClick={handleZoomToFit}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          title="Zoom to Fit All Nodes"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleAutoLayout}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          title="Hierarchical Auto-Layout"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(0.92);
            setPan({ x: 30, y: 30 });
          }}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          title="Reset Canvas View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Wire Notice */}
      {connectingSource && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs shadow-lg flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Click target node's input port to wire connection (or ESC to cancel)</span>
        </div>
      )}

      {/* Floating Step Debugger Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md font-sans text-xs">
        <button
          type="button"
          onClick={onRunAll}
          disabled={isRunning}
          className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run All'}</span>
        </button>

        <button
          type="button"
          onClick={() => selectedNodeId && onRunSingleNode?.(selectedNodeId)}
          disabled={isRunning || !selectedNodeId}
          className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-stone-700 font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          title="Run only the currently selected node"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Run Node</span>
        </button>

        <button
          type="button"
          onClick={onStepNext}
          disabled={isRunning}
          className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-stone-700 font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          title="Step to next downstream node in DAG"
        >
          <StepForward className="w-3.5 h-3.5 text-indigo-500" />
          <span>Step Next</span>
        </button>

        <div className="w-[1px] h-4 bg-stone-200" />

        <button
          type="button"
          onClick={onResetWorkflow}
          disabled={isRunning}
          className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          title="Reset node statuses to idle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas for Bezier Edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <linearGradient id="edgeActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#0abab5" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {renderedEdges.map((e) => {
          if (!e) return null;
          return (
            <g key={e.id}>
              {/* Background shadow stroke */}
              <path
                d={e.pathD}
                fill="none"
                stroke={e.isHighlighted ? '#818cf8' : e.isEdgeActive ? '#cbd5e1' : '#f1f5f9'}
                strokeWidth={e.isHighlighted ? 4 : 2}
                strokeLinecap="round"
                opacity={e.isEdgeActive ? 0.9 : 0.4}
              />

              {/* Active flowing animated stroke */}
              {e.isEdgeActive && isRunning && (
                <path
                  d={e.pathD}
                  fill="none"
                  stroke="url(#edgeActiveGrad)"
                  strokeWidth={2.5}
                  strokeDasharray="6,6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}

              {/* Edge Label (Weight / Description) */}
              {e.label && (
                <g transform={`translate(${e.midX}, ${e.midY})`}>
                  <rect
                    x={-28}
                    y={-10}
                    width={56}
                    height={18}
                    rx={6}
                    fill="#ffffff"
                    stroke={e.isHighlighted ? '#6366f1' : '#e2e8f0'}
                    strokeWidth={1}
                    className="shadow-xs"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={e.isHighlighted ? '#4338ca' : '#64748b'}
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {e.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* In-progress wire being drawn by operator */}
        {connectingLinePath && (
          <path
            d={connectingLinePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth={3}
            strokeDasharray="6,4"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Nodes Container */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {workflow.nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const IconComp = NODE_ICONS[node.iconName] || Workflow;
          const isBypassed = node.status === 'bypassed';
          const isRunningNode = node.status === 'running';
          const isCompleted = node.status === 'completed';

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className={`pyspur-node-card absolute pointer-events-auto w-[240px] rounded-2xl transition-all cursor-move ${
                isSelected
                  ? 'ring-2 ring-indigo-500 shadow-xl bg-white'
                  : 'shadow-sm hover:shadow-md bg-white/95 border border-stone-200/90'
              } ${isBypassed ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
            >
              {/* Card Header */}
              <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      node.type === 'router'
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : node.type === 'expert'
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        : node.type === 'aggregator'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : node.type === 'input'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-stone-900 leading-tight">
                      {node.label}
                    </div>
                    <div className="text-[9px] font-mono text-stone-400">{node.role}</div>
                  </div>
                </div>

                {/* Action Icons & Status Indicator */}
                <div className="flex items-center space-x-1">
                  {onEditNode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNode(node);
                        onEditNode(node.id);
                      }}
                      className="p-1 rounded-md text-stone-400 hover:text-indigo-600 hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Edit Node in Inspector"
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {onDeleteNode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNode(node.id);
                      }}
                      className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Node"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {isRunningNode ? (
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                      <Activity className="w-2.5 h-2.5 animate-spin" />
                      <span>Run</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-2.5 h-2.5" />
                      <span>Done</span>
                    </span>
                  ) : isBypassed ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono text-stone-400 bg-stone-100">
                      Skip
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono text-stone-400 bg-stone-50 border border-stone-200">
                      Idle
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-2">
                <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                  {node.sublabel}
                </p>

                {/* Model Tier & DevContainer Badge */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                  {node.config.codeExecutionTarget === 'devcontainer' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1 font-semibold">
                      <span>🐳</span>
                      <span>DevContainer</span>
                    </span>
                  ) : node.type === 'rag_retriever' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      RAG Vector
                    </span>
                  ) : node.type === 'evaluator' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                      Evaluator
                    </span>
                  ) : node.type === 'human_approval' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      HITL Gate
                    </span>
                  ) : node.config.modelTier ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-stone-100 text-stone-600 border border-stone-200">
                      {node.config.modelTier.split('-').slice(-2).join('-')}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-stone-100 text-stone-500">
                      {node.type}
                    </span>
                  )}

                  {node.outputTrace && (
                    <span className="text-[10px] font-mono text-stone-500">
                      {node.outputTrace.durationMs}ms · {node.outputTrace.tokensUsed} tok
                    </span>
                  )}
                </div>

                {/* Gating Weight Bar for Expert Nodes */}
                {node.type === 'expert' && node.outputTrace?.confidence !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-stone-500">
                      <span>Routing Weight:</span>
                      <span className="font-bold text-stone-800">
                        {Math.round(node.outputTrace.confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${Math.round(node.outputTrace.confidence * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Left Input Port */}
              {node.inputs && node.inputs.length > 0 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connectingSource && connectingSource.nodeId !== node.id) {
                      onAddEdge?.(connectingSource.nodeId, connectingSource.handle, node.id, 'in');
                      setConnectingSource(null);
                    }
                  }}
                  className={`pyspur-port-handle absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${
                    connectingSource && connectingSource.nodeId !== node.id
                      ? 'bg-emerald-500 ring-2 ring-emerald-300 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                  title="Input Port (Click to connect)"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}

              {/* Right Output Port(s) */}
              {node.outputs && node.outputs.length > 0 && (
                node.type === 'branch' || node.type === 'router' ? (
                  <>
                    {/* True Port */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingSource({ nodeId: node.id, handle: 'true' });
                      }}
                      className={`pyspur-port-handle absolute -right-2 top-7 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${
                        connectingSource?.nodeId === node.id && connectingSource?.handle === 'true'
                          ? 'ring-2 ring-emerald-400'
                          : ''
                      }`}
                      title="Route True (Click to start wire)"
                    >
                      <span className="text-[8px] font-bold text-white font-mono leading-none">T</span>
                    </div>

                    {/* False Port */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingSource({ nodeId: node.id, handle: 'false' });
                      }}
                      className={`pyspur-port-handle absolute -right-2 top-14 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${
                        connectingSource?.nodeId === node.id && connectingSource?.handle === 'false'
                          ? 'ring-2 ring-rose-400'
                          : ''
                      }`}
                      title="Route False (Click to start wire)"
                    >
                      <span className="text-[8px] font-bold text-white font-mono leading-none">F</span>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnectingSource({ nodeId: node.id, handle: 'out' });
                    }}
                    className={`pyspur-port-handle absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${
                      connectingSource?.nodeId === node.id ? 'bg-indigo-600 ring-2 ring-indigo-300' : 'bg-indigo-500'
                    }`}
                    title="Output Port (Click to start wire)"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Minimap Overlay */}
      <div className="absolute bottom-6 right-6 z-20 w-36 h-24 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm p-1.5 flex flex-col justify-between pointer-events-none hidden sm:flex">
        <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 font-semibold px-0.5">
          <span>MINIMAP</span>
          <span>{workflow.nodes.length} nodes</span>
        </div>
        <div className="relative flex-1 rounded bg-stone-100/70 border border-stone-200/50 overflow-hidden">
          {workflow.nodes.map((n) => {
            const leftPct = Math.min(85, Math.max(5, (n.position.x / 1400) * 85));
            const topPct = Math.min(80, Math.max(5, (n.position.y / 600) * 80));
            return (
              <div
                key={n.id}
                className={`absolute w-3 h-1.5 rounded-xs transition-colors ${
                  n.id === selectedNodeId
                    ? 'bg-indigo-600 ring-1 ring-indigo-300'
                    : n.status === 'completed'
                    ? 'bg-emerald-500'
                    : 'bg-stone-400'
                }`}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
