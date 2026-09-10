import React, { useState } from 'react';
import {
  Play,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Box,
  GitBranch,
  Workflow,
  Target,
  ListTodo,
  Check,
  ChevronRight,
  Terminal,
  Activity,
} from 'lucide-react';
import { PySpurWorkflow, PySpurNode } from '../../types';
import { DynamicGoalGraph, GraphStage } from '../OrchestrationGraphView';

export interface PetriStageTimelineProps {
  workflow: PySpurWorkflow;
  activeStage: GraphStage;
  activeGraph: DynamicGoalGraph;
  isRunning: boolean;
  onRunPipeline: () => void;
  onStepNext: () => void;
  onReset: () => void;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
  onRunDevContainer?: () => void;
  isCompact?: boolean;
}

export const PetriStageTimeline: React.FC<PetriStageTimelineProps> = ({
  workflow,
  activeStage,
  activeGraph,
  isRunning,
  onRunPipeline,
  onStepNext,
  onReset,
  onSelectNode,
  selectedNodeId,
  onRunDevContainer,
  isCompact: _isCompact = false,
}) => {
  const [isPlanDrawerOpen, setIsPlanDrawerOpen] = useState(true);

  // Helper to lookup node in workflow
  const getNode = (idPrefix: string): PySpurNode | undefined => {
    return workflow.nodes.find(
      (n) => n.id.includes(idPrefix) || n.label.toLowerCase().includes(idPrefix)
    );
  };

  const inputNode = getNode('input');
  const workerNode = getNode('worker') || getNode('code') || getNode('coder');
  const verifyNode = getNode('verify') || getNode('eval');
  const gateNode = getNode('gate') || getNode('approval');
  const repairNode = getNode('repair') || getNode('branch');
  const deliveryNode = getNode('delivery') || getNode('output');

  // Stage definition list
  const STAGES: {
    key: GraphStage;
    number: number;
    title: string;
    sublabel: string;
    role: string;
    node?: PySpurNode;
    icon: React.ReactNode;
    phase: string;
  }[] = [
    {
      key: 'input',
      number: 1,
      title: 'Goal Ingestion & Spec Scope',
      sublabel: 'Parse invariants & repro boundary',
      role: '@orchestrator',
      node: inputNode,
      icon: <Target className="w-4 h-4 text-orange-500" />,
      phase: 'INGESTION',
    },
    {
      key: 'worker',
      number: 2,
      title: 'Worker Patch Synthesis',
      sublabel: 'Minimal repro in .devcontainer',
      role: activeGraph.workerRole || '@debugger-agent',
      node: workerNode,
      icon: <Box className="w-4 h-4 text-blue-500" />,
      phase: 'SYNTHESIS',
    },
    {
      key: 'verifying',
      number: 3,
      title: 'Acceptance Invariant Matrix',
      sublabel: 'Parallel regression & assertions',
      role: '@verifier-matrix',
      node: verifyNode,
      icon: <ShieldCheck className="w-4 h-4 text-teal-500" />,
      phase: 'VERIFICATION',
    },
    {
      key: 'choice',
      number: 4,
      title: 'Operator Review Gate',
      sublabel: 'Human-in-the-Loop review signoff',
      role: 'Human Operator',
      node: gateNode,
      icon: <CheckCircle2 className="w-4 h-4 text-indigo-500" />,
      phase: 'GATEKEEPER',
    },
    {
      key: 'repair',
      number: 5,
      title: 'Self-Healing Repair Loop',
      sublabel: 'Fallback on test breach or reject',
      role: '@debugger-agent',
      node: repairNode,
      icon: <GitBranch className="w-4 h-4 text-rose-500" />,
      phase: 'REPAIR',
    },
    {
      key: 'delivery',
      number: 6,
      title: 'Git Compare-and-Swap Delivery',
      sublabel: 'Squash merge verified ref to main',
      role: '@delivery-worker',
      node: deliveryNode,
      icon: <Workflow className="w-4 h-4 text-emerald-500" />,
      phase: 'DELIVERY',
    },
  ];

  // Map step status
  const getStepStatus = (stepStage: GraphStage) => {
    const stageOrder: GraphStage[] = ['input', 'worker', 'verifying', 'delivery', 'merged'];
    const currentIdx = stageOrder.indexOf(
      activeStage === 'choice' || activeStage === 'repair'
        ? 'verifying'
        : activeStage === 'delivery_repair'
        ? 'delivery'
        : activeStage
    );
    const stepIdx = stageOrder.indexOf(stepStage);

    if (activeStage === 'merged') return 'completed';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) {
      if (activeStage === 'repair') return 'repairing';
      return isRunning ? 'running' : 'active';
    }
    return 'pending';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] text-stone-900 font-sans overflow-hidden">
      {/* Top Controls & Stage Status Bar */}
      <div className="bg-white border-b border-stone-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-10">
        {/* Left: Dynamic Goal Metadata */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-[#FF5F1F] font-bold tracking-wide">PETRI ORCHESTRATION</span>
            <span className="text-stone-400">·</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF5F1F]/10 border border-[#FF5F1F]/30 text-[#FF5F1F]">
              CANONICAL DEV PIPELINE
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 mt-0.5">
            {activeGraph.planTitle}
          </h2>
          <p className="text-xs text-stone-500 line-clamp-1 max-w-2xl font-sans mt-0.5">
            {activeGraph.planSummary}
          </p>
        </div>

        {/* Center / Right: Execution Controls */}
        <div className="flex items-center space-x-2">
          {/* Run / Pause */}
          <button
            type="button"
            onClick={onRunPipeline}
            disabled={isRunning}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-100 text-amber-800 cursor-not-allowed'
                : 'bg-[#FF5F1F] hover:bg-orange-600 text-white active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Running Stages...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Full Pipeline</span>
              </>
            )}
          </button>

          {/* Step Next */}
          <button
            type="button"
            onClick={onStepNext}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
            title="Step next stage in DAG"
          >
            <span>Step</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            disabled={isRunning}
            className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title="Reset pipeline execution"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* DevContainer Runner */}
          {onRunDevContainer && (
            <button
              type="button"
              onClick={onRunDevContainer}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 flex items-center space-x-1 transition-colors cursor-pointer"
              title="Execute script in .devcontainer"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>Run in DevContainer</span>
            </button>
          )}

          {/* Plan Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsPlanDrawerOpen(!isPlanDrawerOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isPlanDrawerOpen
                ? 'bg-[#0ABAB5]/10 border-[#0ABAB5]/40 text-[#0ABAB5]'
                : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Work Plan ({activeGraph.steps.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Stage Cards + Dynamic Work Plan */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: 6 Stage Track Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {STAGES.map((st) => {
              const isStageActive =
                activeStage === st.key ||
                (st.key === 'delivery' && activeStage === 'merged');
              const nodeStatus = st.node?.status || 'idle';
              const isSelected = st.node && selectedNodeId === st.node.id;

              return (
                <div
                  key={st.key}
                  onClick={() => st.node && onSelectNode(st.node.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isStageActive
                      ? 'bg-white border-orange-500/80 shadow-md ring-2 ring-orange-500/20'
                      : isSelected
                      ? 'bg-white border-indigo-500/80 shadow-sm'
                      : nodeStatus === 'completed'
                      ? 'bg-white border-emerald-300 shadow-2xs'
                      : 'bg-white/80 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  {/* Top: Stage Number & Phase Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold font-mono text-stone-700">
                          {st.number}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                          {st.phase}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {nodeStatus === 'running' || (isStageActive && isRunning) ? (
                          <span className="flex items-center space-x-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold font-mono animate-pulse">
                            <Activity className="w-3 h-3 animate-spin" />
                            <span>ACTIVE</span>
                          </span>
                        ) : nodeStatus === 'completed' ? (
                          <span className="flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold font-mono">
                            <Check className="w-3 h-3" />
                            <span>DONE</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full font-mono">
                            QUEUED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage Title & Role */}
                    <div className="flex items-start space-x-2.5 mt-1">
                      <div className="mt-0.5">{st.icon}</div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 leading-tight">
                          {st.title}
                        </h3>
                        <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                          {st.sublabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Assigned Agent & Node Target */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-stone-600 font-medium">
                      {st.role}
                    </span>
                    {st.node?.config.codeExecutionTarget === 'devcontainer' && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-semibold flex items-center space-x-1">
                        <Box className="w-3 h-3" />
                        <span>DevContainer</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom: Node Trace Output Summary */}
                  {st.node?.outputTrace && (
                    <div className="mt-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] font-mono text-stone-700">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                        <span>{st.node.outputTrace.tokensUsed} tokens</span>
                        <span>{st.node.outputTrace.durationMs}ms</span>
                      </div>
                      <div className="truncate text-stone-800 font-sans">
                        {st.node.outputTrace.summary}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Execution Logs Inspector */}
          {selectedNodeId && (
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs mt-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-stone-600" />
                  <span className="text-xs font-bold font-mono text-stone-800">
                    STAGE EXECUTION LOGS & TRACE · {selectedNodeId}
                  </span>
                </div>
                {workflow.nodes.find((n) => n.id === selectedNodeId)?.outputTrace && (
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                    Exit Code 0 · Deterministic
                  </span>
                )}
              </div>

              <div className="mt-2 p-3 rounded-xl bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto max-h-48 space-y-1">
                {workflow.nodes.find((n) => n.id === selectedNodeId)?.outputTrace?.logs?.map(
                  (log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  )
                ) || (
                  <div className="text-stone-500 italic">
                    Node idle. Run pipeline or step through to stream container logs.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Drawer: Dynamic Goal Work Plan Checklist */}
        {isPlanDrawerOpen && (
          <div className="w-80 sm:w-96 bg-white border-l border-stone-200/80 p-5 flex flex-col space-y-4 overflow-y-auto shrink-0 shadow-xs">
            {/* Header */}
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-[#0ABAB5]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Goal Work Plan
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                {activeGraph.steps.filter((s) => getStepStatus(s.stageKey) === 'completed').length}{' '}
                / {activeGraph.steps.length} done
              </span>
            </div>

            {/* Strategy */}
            <div className="text-xs text-stone-600 font-sans leading-relaxed">
              <strong className="text-stone-900 block mb-0.5">Execution Strategy:</strong>
              {activeGraph.planSummary}
            </div>

            {/* Steps Checklist */}
            <div className="space-y-2.5 flex-1">
              {activeGraph.steps.map((step, idx) => {
                const status = getStepStatus(step.stageKey);
                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      const targetNode = STAGES.find((s) => s.key === step.stageKey)?.node;
                      if (targetNode) onSelectNode(targetNode.id);
                    }}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      status === 'running' || status === 'active'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                        : status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : status === 'repairing'
                        ? 'bg-rose-500/10 border-rose-500/40'
                        : 'bg-stone-50/70 border-stone-200/70 text-stone-600 hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                        {idx + 1}. {step.phase}
                      </span>
                      {status === 'completed' && (
                        <span className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold font-mono">
                          <Check className="w-3 h-3" />
                          <span>DONE</span>
                        </span>
                      )}
                      {(status === 'running' || status === 'active') && (
                        <span className="flex items-center space-x-1 text-[10px] text-amber-600 font-bold font-mono animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>RUNNING</span>
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="text-[10px] text-stone-400 font-mono">QUEUED</span>
                      )}
                    </div>

                    <div className="font-semibold text-stone-900 text-xs mb-0.5">
                      {step.title}
                    </div>

                    <div className="text-[11px] text-stone-500 font-mono">
                      Role: <strong className="text-stone-700">{step.role}</strong>
                    </div>

                    <div className="text-[11px] text-stone-500 mt-1 leading-normal">
                      {step.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Advance */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400 font-mono text-[11px]">Synchronized DAG</span>
              <button
                type="button"
                onClick={onStepNext}
                disabled={isRunning}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <span>Advance Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
