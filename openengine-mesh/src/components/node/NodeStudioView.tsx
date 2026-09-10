import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Play,
  Plus,
  Download,
  Upload,
  X,
  CheckCircle2,
  GitBranch,
  Layers,
  Code2,
  ShieldCheck,
  Zap,
  Workflow,
  Target,
  ChevronDown,
  Activity,
  Box,
  Database,
  Cpu,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  PySpurWorkflow,
  PySpurNode,
  PySpurNodeType,
  PlanCanvasDoc,
  Workspace,
  UserProfile,
} from '../../types';
import { PySpurNodeCanvas } from './PySpurNodeCanvas';
import {
  createDefaultMoeWorkflow,
  createAgenticCoderWorkflow,
  createRagRetrievalWorkflow,
  createHumanApprovalWorkflow,
  calculateMoeGating,
  synthesizePlanFromMoe,
  EXPERT_DEFINITIONS,
} from './moeWorkflowEngine';
import {
  createPetriOrchestrationWorkflow,
  createDevContainerCoderWorkflow,
  createEvaluatorSuiteWorkflow,
  executePySpurNode,
  getTopologicalNodeOrder,
} from './pyspurExecutionEngine';
import { PetriStageTimeline } from './PetriStageTimeline';
import {
  buildGoalGraph,
  DynamicGoalGraph,
  GraphStage,
} from '../OrchestrationGraphView';
import { DevContainerConsoleDrawer } from './DevContainerConsoleDrawer';
import { PySpurEvalsPanel } from './PySpurEvalsPanel';
import { execInDevContainer } from '../../services/devcontainerService';

interface NodeStudioViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  initialTab?: 'canvas' | 'stages' | 'split' | 'evals' | 'devcontainer';
  onHandoffPlan?: (plan: PlanCanvasDoc) => void;
  onNavigateToChat?: () => void;
}

const PRESET_GOALS = [
  {
    label: 'SQLite Bounded Queue',
    prompt: 'Implement bounded SQLite retry queues with backpressure and acceptance test suite',
    category: 'architecture',
  },
  {
    label: 'Jumpy Arena Physics',
    prompt: 'Fix dude jump impulse velocity and platform collision jitter in Jumpy arena',
    category: 'code',
  },
  {
    label: 'SAIF Security Audit',
    prompt: 'Conduct autonomous SAIF security audit and verify zero over-granted permissions',
    category: 'security',
  },
  {
    label: 'DWD OAuth Flow',
    prompt: 'Generate editorial sequence diagram for Google Workspace DWD OAuth token validation',
    category: 'verification',
  },
];

export const NodeStudioView: React.FC<NodeStudioViewProps> = ({
  activeWorkspace,
  activeUser: _activeUser,
  initialTab = 'canvas',
  onHandoffPlan,
  onNavigateToChat,
}) => {
  // Active Workflow State - Defaults to Canonical Petri Orchestration Pipeline
  const [workflow, setWorkflow] = useState<PySpurWorkflow>(() =>
    createPetriOrchestrationWorkflow()
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-petri-worker');
  const [goalPrompt, setGoalPrompt] = useState<string>(
    'Implement bounded SQLite retry queues with backpressure and acceptance test suite'
  );
  const [activeStage, setActiveStage] = useState<GraphStage>('input');
  const [activeGraph, setActiveGraph] = useState<DynamicGoalGraph>(() =>
    buildGoalGraph(
      'Implement bounded SQLite retry queues with backpressure and acceptance test suite',
      false
    )
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState<boolean>(false);
  const [studioToast, setStudioToast] = useState<string | null>(null);
  const [synthesizedPlan, setSynthesizedPlan] = useState<PlanCanvasDoc | null>(() =>
    synthesizePlanFromMoe(
      'Implement bounded SQLite retry queues with backpressure and acceptance test suite',
      workflow
    )
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setStudioToast(msg);
    setTimeout(() => {
      setStudioToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Selected Node lookup
  const selectedNode = useMemo(() => {
    return workflow.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [workflow.nodes, selectedNodeId]);

  // Aggregate telemetry
  const totalTokens = useMemo(() => {
    return workflow.nodes.reduce(
      (sum, n) => sum + (n.outputTrace?.tokensUsed || 0),
      0
    );
  }, [workflow.nodes]);

  const activeExpertsCount = useMemo(() => {
    return workflow.nodes.filter(
      (n) => n.type === 'expert' && n.status === 'completed'
    ).length;
  }, [workflow.nodes]);

  // Studio Tab State: 'canvas' | 'stages' | 'split' | 'evals' | 'devcontainer'
  const [activeTab, setActiveTab] = useState<'canvas' | 'stages' | 'split' | 'evals' | 'devcontainer'>(initialTab);

  // Helper to map node ID to Petri GraphStage
  const getPetriStageForNode = (nodeId: string): GraphStage => {
    if (nodeId.includes('input')) return 'input';
    if (nodeId.includes('worker') || nodeId.includes('code') || nodeId.includes('coder')) return 'worker';
    if (nodeId.includes('verify') || nodeId.includes('eval')) return 'verifying';
    if (nodeId.includes('gate') || nodeId.includes('approval') || nodeId.includes('choice')) return 'choice';
    if (nodeId.includes('repair')) return 'repair';
    if (nodeId.includes('delivery') || nodeId.includes('output')) return 'delivery';
    return 'idle';
  };

  // Switch Template & Reset Flow
  const handleSelectTemplate = (
    key:
      | 'petri_orchestration'
      | 'moe_planner'
      | 'agentic_coder'
      | 'rag_retrieval'
      | 'human_approval'
      | 'devcontainer_coder'
      | 'evaluator_suite'
  ) => {
    setIsTemplateMenuOpen(false);
    let newWf: PySpurWorkflow;
    let defaultSelectedId: string;
    let defaultPrompt = goalPrompt;

    if (key === 'petri_orchestration') {
      newWf = createPetriOrchestrationWorkflow(goalPrompt);
      defaultSelectedId = 'node-petri-worker';
      setSynthesizedPlan(null);
      setActiveStage('input');
      setActiveGraph(buildGoalGraph(goalPrompt, false));
      showToast('Loaded Canonical Petri Orchestration Pipeline');
    } else if (key === 'moe_planner') {
      newWf = createDefaultMoeWorkflow(goalPrompt);
      defaultSelectedId = 'node-moe-router';
      setSynthesizedPlan(synthesizePlanFromMoe(goalPrompt, newWf));
      showToast('Loaded Full-Stack MoE Planner pipeline');
    } else if (key === 'devcontainer_coder') {
      newWf = createDevContainerCoderWorkflow();
      defaultSelectedId = 'node-dev-code';
      defaultPrompt = 'Implement bounded SQLite retry queues with backpressure in Python DevContainer';
      setSynthesizedPlan(null);
      showToast('Loaded DevContainer Python Runner & Evaluation Loop');
    } else if (key === 'evaluator_suite') {
      newWf = createEvaluatorSuiteWorkflow();
      defaultSelectedId = 'node-eval-judge';
      defaultPrompt = 'Evaluate test dataset pass@k assertions and token efficiency';
      setSynthesizedPlan(null);
      showToast('Loaded Evaluator & Benchmark Suite');
    } else if (key === 'agentic_coder') {
      newWf = createAgenticCoderWorkflow();
      defaultSelectedId = 'node-code-coder';
      defaultPrompt = 'Fix dude jump impulse velocity and platform collision jitter in Jumpy arena';
      setSynthesizedPlan(null);
      showToast('Loaded Agentic Coder & Test Grader Loop');
    } else if (key === 'rag_retrieval') {
      newWf = createRagRetrievalWorkflow();
      defaultSelectedId = 'node-rag-search';
      defaultPrompt = 'Search memory vault for zero-petri architectural invariants and patterns';
      setSynthesizedPlan(null);
      showToast('Loaded RAG Knowledge Retrieval pipeline');
    } else if (key === 'human_approval') {
      newWf = createHumanApprovalWorkflow();
      defaultSelectedId = 'node-ha-gate';
      defaultPrompt = 'Verify and sign off production release candidate PR delivery';
      setSynthesizedPlan(null);
      showToast('Loaded Human-in-the-Loop Gatekeeper pipeline');
    } else {
      return;
    }

    // Assign fresh unique ID to force canvas re-centering and clean remount
    newWf = {
      ...newWf,
      id: `${newWf.id}-${Date.now()}`,
      updatedAt: Date.now(),
    };

    setWorkflow(newWf);
    setSelectedNodeId(defaultSelectedId);
    setGoalPrompt(defaultPrompt);
    setIsRunning(false);
  };

  // Delete node and cascade all connected edges
  const handleDeleteNode = (nodeId: string) => {
    const target = workflow.nodes.find((n) => n.id === nodeId);
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter(
        (e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId
      ),
      updatedAt: Date.now(),
    }));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    showToast(`Deleted node "${target?.label || nodeId}" and detached edges`);
  };

  // Live node configuration update
  const handleUpdateNode = (nodeId: string, updates: Partial<PySpurNode>) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          ...updates,
          config: {
            ...n.config,
            ...(updates.config || {}),
          },
        };
      }),
      updatedAt: Date.now(),
    }));
  };

  // Step Debugger: Run All
  const handleRunAll = async () => {
    if (workflow.templateKey === 'moe_planner') {
      handleRunMoEWorkflow();
      return;
    }
    setIsRunning(true);
    showToast(`Executing workflow "${workflow.name}"...`);
    const order = getTopologicalNodeOrder(workflow);
    const outputs: Record<string, any> = { input_prompt: goalPrompt };

    for (const nodeId of order) {
      setActiveStage(getPetriStageForNode(nodeId));
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, status: 'running' } : n)),
      }));

      const targetNode = workflow.nodes.find((n) => n.id === nodeId);
      if (targetNode) {
        const trace = await executePySpurNode(targetNode, workflow, outputs);
        outputs[nodeId] = trace.rawOutput || trace;
        setWorkflow((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) =>
            n.id === nodeId ? { ...n, status: 'completed', outputTrace: trace } : n
          ),
          edges: prev.edges.map((e) => (e.sourceNodeId === nodeId ? { ...e, isActive: true } : e)),
        }));
      }
    }
    setActiveStage('merged');
    setIsRunning(false);
    showToast('Workflow execution completed successfully');
  };

  // Step Debugger: Run Single Selected Node
  const handleRunSingleNode = async (nodeId: string) => {
    const target = workflow.nodes.find((n) => n.id === nodeId);
    if (!target) return;
    setIsRunning(true);
    showToast(`Executing single node: ${target.label}`);
    setActiveStage(getPetriStageForNode(nodeId));
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, status: 'running' } : n)),
    }));

    const trace = await executePySpurNode(target, workflow, { input_prompt: goalPrompt });
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, status: 'completed', outputTrace: trace } : n
      ),
    }));
    setIsRunning(false);
    showToast(`Node ${target.label} completed (${trace.durationMs}ms)`);
  };

  // Step Debugger: Step Next Node in DAG
  const handleStepNext = async () => {
    const order = getTopologicalNodeOrder(workflow);
    const nextNodeId = order.find((id) => {
      const n = workflow.nodes.find((node) => node.id === id);
      return n && n.status === 'idle';
    });
    if (!nextNodeId) {
      setActiveStage('merged');
      showToast('All nodes in DAG have completed execution');
      return;
    }
    await handleRunSingleNode(nextNodeId);
  };

  // Step Debugger: Reset Workflow
  const handleResetWorkflow = () => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({ ...n, status: 'idle', outputTrace: undefined })),
      edges: prev.edges.map((e) => ({ ...e, isActive: false })),
    }));
    setActiveStage('input');
    showToast('Workflow state reset to idle');
  };

  // Handle Drag / Position update
  const handleUpdateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
    }));
  };

  // Execute MoE Workflow
  const handleRunMoEWorkflow = (customPrompt?: string) => {
    const prompt = (customPrompt || goalPrompt).trim();
    if (!prompt) return;

    setIsRunning(true);
    showToast(`Executing PySpur MoE Workflow for: "${prompt.slice(0, 35)}..."`);

    // Reset all nodes to idle except input
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({
        ...n,
        status: n.type === 'input' ? 'running' : 'idle',
      })),
      edges: prev.edges.map((e) => ({ ...e, isActive: false })),
    }));

    // Step 1: Input node completed (0.3s)
    setTimeout(() => {
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.type === 'input'
            ? {
                ...n,
                status: 'completed',
                config: { ...n.config, promptTemplate: prompt },
                outputTrace: {
                  summary: `Prompt registered: "${prompt}"`,
                  confidence: 1.0,
                  tokensUsed: 45,
                  durationMs: 14,
                  logs: [`[Input] Ingested user prompt (${prompt.length} chars)`],
                },
              }
            : n
        ),
        edges: prev.edges.map((e) =>
          e.sourceNodeId === 'node-goal-input' ? { ...e, isActive: true } : e
        ),
      }));

      // Step 2: Gating Router evaluates (0.8s)
      setTimeout(() => {
        const gating = calculateMoeGating(prompt, 3);

        setWorkflow((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => {
            if (n.id === 'node-moe-router') {
              return {
                ...n,
                status: 'completed',
                config: { ...n.config, gatingWeights: gating.weights },
                outputTrace: {
                  summary: `Activated: ${gating.activeExperts
                    .map((d) => EXPERT_DEFINITIONS[d].role)
                    .join(', ')}`,
                  confidence: 0.95,
                  tokensUsed: 120,
                  durationMs: 65,
                  logs: [
                    `[Router] Evaluated semantic features across 5 expert domains`,
                    `[Router] Gating weights: ${JSON.stringify(gating.weights)}`,
                    `[Router] Top-3: ${gating.activeExperts.join(', ')}`,
                  ],
                },
              };
            }
            return n;
          }),
          edges: prev.edges.map((e) => {
            if (e.sourceNodeId === 'node-moe-router') {
              const handle = e.sourceHandle as any;
              return {
                ...e,
                isActive: gating.activeExperts.includes(handle),
              };
            }
            return e;
          }),
        }));

        // Step 3: Run Active Experts Concurrently (1.4s)
        setTimeout(() => {
          setWorkflow((prev) => ({
            ...prev,
            nodes: prev.nodes.map((n) => {
              if (n.type === 'expert') {
                const domain = n.config.expertDomain;
                const isActive = domain && gating.activeExperts.includes(domain);
                return {
                  ...n,
                  status: isActive ? 'completed' : 'bypassed',
                  outputTrace: {
                    ...n.outputTrace!,
                    confidence: domain ? gating.weights[domain] : 0,
                  },
                };
              }
              return n;
            }),
            edges: prev.edges.map((e) => {
              if (e.targetNodeId === 'node-moe-aggregator') {
                const handle = e.targetHandle as any;
                return {
                  ...e,
                  isActive: gating.activeExperts.includes(handle),
                };
              }
              return e;
            }),
          }));

          // Step 4: MoE Aggregator Combines (2.1s)
          setTimeout(() => {
            const plan = synthesizePlanFromMoe(prompt, workflow);
            setSynthesizedPlan(plan);

            setWorkflow((prev) => ({
              ...prev,
              nodes: prev.nodes.map((n) => {
                if (n.id === 'node-moe-aggregator' || n.id === 'node-plan-output') {
                  return { ...n, status: 'completed' };
                }
                return n;
              }),
              edges: prev.edges.map((e) => ({ ...e, isActive: true })),
            }));

            setIsRunning(false);
            showToast('MoE Plan Synthesis Complete! Ready for Plan Canvas.');
          }, 700);
        }, 600);
      }, 500);
    }, 300);
  };

  // One-click handoff to Plan Canvas
  const handleHandoffToPlanCanvas = () => {
    if (!synthesizedPlan) return;
    onHandoffPlan?.(synthesizedPlan);
    showToast(`Dispatched plan "${synthesizedPlan.title}" to Plan Canvas!`);
    if (onNavigateToChat) {
      setTimeout(() => onNavigateToChat(), 500);
    }
  };

  // Add custom node to canvas
  const handleAddNode = (type: PySpurNodeType) => {
    const newId = `node-custom-${Date.now()}`;
    const iconName =
      type === 'code'
        ? 'Box'
        : type === 'tool'
        ? 'Cpu'
        : type === 'rag_retriever'
        ? 'Database'
        : type === 'loop'
        ? 'Repeat'
        : type === 'evaluator'
        ? 'ShieldCheck'
        : type === 'human_approval'
        ? 'CheckCircle2'
        : type === 'router' || type === 'branch'
        ? 'GitBranch'
        : type === 'llm'
        ? 'Sparkles'
        : 'Workflow';

    const newNode: PySpurNode = {
      id: newId,
      type,
      label: `Custom ${type.toUpperCase()}`,
      sublabel: 'User-configured PySpur node',
      role: `@custom-${type}`,
      iconName,
      position: { x: 450 + Math.random() * 80, y: 150 + Math.random() * 80 },
      status: 'idle',
      config: {
        modelTier: 'gemini-3.8-flash-high',
        codeExecutionTarget: type === 'code' ? 'devcontainer' : undefined,
        pythonCode:
          type === 'code'
            ? 'import sys\nprint("[devcontainer] Executing script in container...")\nsys.exit(0)'
            : undefined,
        ragCollection: type === 'rag_retriever' ? 'workspace_docs' : undefined,
        ragTopK: type === 'rag_retriever' ? 3 : undefined,
        evaluatorAssertions:
          type === 'evaluator' ? ['assert exit_code == 0', 'assert "ok" in output.lower()'] : undefined,
        evaluatorRubricScore: type === 'evaluator' ? 95 : undefined,
        humanApprovalStatus: type === 'human_approval' ? 'approved' : undefined,
        temperature: 0.7,
      },
      outputTrace: {
        summary: 'Node initialized and ready for execution.',
        confidence: 1.0,
        tokensUsed: 0,
        durationMs: 0,
        logs: ['[Node] Registered in PySpur workflow mesh'],
      },
      inputs: ['input'],
      outputs: ['output'],
    };

    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));

    setIsAddNodeModalOpen(false);
    setSelectedNodeId(newId);
    showToast(`Added custom ${type} node to canvas`);
  };

  // Export PySpur JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workflow, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `pyspur-workflow-${workflow.templateKey}.json`);
    dlAnchor.click();
    showToast('Exported PySpur workflow JSON');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as PySpurWorkflow;
        if (imported.nodes && imported.edges) {
          setWorkflow(imported);
          setSelectedNodeId(imported.nodes[0]?.id || null);
          showToast(`Imported "${imported.name || 'PySpur Workflow'}"`);
        }
      } catch (err) {
        showToast('Invalid PySpur workflow JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/50 text-stone-900 font-sans overflow-hidden">
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      {/* Top Banner: Node Studio Branding, Template Switcher & Telemetry Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
        {/* Left: Branding & Template Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-stone-950">Node Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Pipeline Engine
                </span>
              </div>
              <div className="text-[10px] text-stone-500 font-sans">
                Visual Development & Execution Pipelines for Autonomous Agents
              </div>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-stone-200 hidden sm:block" />

          {/* Template Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-xs font-medium text-stone-800 transition-colors cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-stone-600" />
              <span>{workflow.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white border border-stone-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                  Dev Management Pipelines
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('petri_orchestration')}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    workflow.templateKey === 'petri_orchestration'
                      ? 'bg-orange-50 text-orange-950 font-semibold border border-orange-200/60'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Workflow className="w-4 h-4 text-[#FF5F1F] shrink-0" />
                  <div>
                    <div className="text-xs font-semibold flex items-center space-x-1.5">
                      <span>Petri Orchestration Pipeline</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#FF5F1F]/15 text-[#FF5F1F] rounded-full font-bold">Canonical</span>
                    </div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      6-stage: Ingestion → DevContainer → Tests → Gate → Repair → CAS Merge
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('moe_planner')}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    workflow.templateKey === 'moe_planner'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Mixture of Experts (MoE) Planner</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      Dynamic routing across 5 domain experts
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('agentic_coder')}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    workflow.templateKey === 'agentic_coder'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Agentic Coder & Test Loop</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      Speculative AST coder with test grader
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('rag_retrieval')}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    workflow.templateKey === 'rag_retrieval'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Database className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">RAG Knowledge Retrieval Pipeline</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      Chunking, embedding, vector search & synthesis
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('devcontainer_coder')}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    workflow.templateKey === 'devcontainer_coder'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Box className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">DevContainer Python Coder Loop</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      Executes isolated Python scripts in .devcontainer with assertions
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('evaluator_suite')}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    workflow.templateKey === 'evaluator_suite'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Evaluator & Benchmark Suite</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      RAG retrieval, reasoning synthesis & LLM-as-a-judge scoring
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('human_approval')}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    workflow.templateKey === 'human_approval'
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Human-in-the-Loop Gatekeeper</div>
                    <div className="text-[10px] text-stone-500 font-normal">
                      Execution gate pausing for operator sign-off
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Studio View Mode Switcher: Canvas | Stages | Split | Evals | DevContainer */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'canvas'
                  ? 'bg-white shadow-xs text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Workflow Canvas
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stages')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'stages'
                  ? 'bg-white shadow-xs text-orange-950 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 text-[#FF5F1F]" />
              <span>Petri Stages</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'split'
                  ? 'bg-white shadow-xs text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Split Dual</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('evals')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'evals'
                  ? 'bg-white shadow-xs text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Test Datasets & Evals</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-teal-50 text-[#0ABAB5] font-bold">
                4
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('devcontainer')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'devcontainer'
                  ? 'bg-white shadow-xs text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-blue-500" />
              <span>DevContainer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Center/Right: Live Telemetry Badges & Toolbar */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-stone-500">
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
              <Activity className="w-3 h-3 text-stone-600" />
              <span>Nodes: {workflow.nodes.length}</span>
            </span>
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Active Experts: {activeExpertsCount}</span>
            </span>
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>{totalTokens.toLocaleString()} Tok</span>
            </span>
          </div>

          <div className="h-5 w-[1px] bg-stone-200 hidden sm:block" />

          {/* Action Buttons */}
          <button
            type="button"
            onClick={() => setIsAddNodeModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
            title="Add Custom Node"
          >
            <Plus className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Add Node</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            title="Export Workflow JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            title="Import Workflow JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Toast Notification */}
          {studioToast && (
            <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-xs">{studioToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* Studio Tab: Workflow Canvas */}
      {activeTab === 'canvas' && (
        <>
          {/* Goal Prompt Bar & Interactive Execution Controls */}
          <div className="bg-white/60 backdrop-blur-md border-b border-stone-200/80 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 z-10">
            {/* Prompt Input Form */}
            <div className="w-full md:flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">
                  /plan
                </span>
                <input
                  type="text"
                  value={goalPrompt}
                  onChange={(e) => setGoalPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (workflow.templateKey === 'moe_planner') {
                        handleRunMoEWorkflow();
                      } else {
                        handleRunAll();
                      }
                    }
                  }}
                  placeholder={
                    workflow.templateKey === 'moe_planner'
                      ? 'Enter goal for Mixture of Experts planning (e.g. Bounded SQLite queue, SAIF audit...)'
                      : `Enter directive for ${workflow.name}...`
                  }
                  className="w-full pl-14 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeWorkspace) {
                    setGoalPrompt(`Implement core features and tests for ${activeWorkspace.name}`);
                    showToast(`Synced objective with workspace "${activeWorkspace.name}"`);
                  } else {
                    setGoalPrompt('Implement bounded SQLite retry queues with backpressure and acceptance test suite');
                    showToast('Loaded active development objective');
                  }
                }}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                title="Sync objective from active workspace or goal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Sync Goal</span>
              </button>

              <button
                type="button"
                disabled={isRunning || !goalPrompt.trim()}
                onClick={() => {
                  if (workflow.templateKey === 'moe_planner') {
                    handleRunMoEWorkflow();
                  } else {
                    handleRunAll();
                  }
                }}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-amber-100 text-amber-800 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
              >
                {isRunning ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{workflow.templateKey === 'moe_planner' ? 'Run MoE Plan' : 'Run Pipeline'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Preset Chips */}
            <div className="hidden xl:flex items-center space-x-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Presets:</span>
              {PRESET_GOALS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setGoalPrompt(p.prompt);
                    if (workflow.templateKey === 'moe_planner') {
                      handleRunMoEWorkflow(p.prompt);
                    } else {
                      handleRunAll();
                    }
                  }}
                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Canvas & Inspector Layout */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Center: Node Studio Visual Graph Canvas */}
            <div className="flex-1 h-full relative">
              <PySpurNodeCanvas
                key={workflow.id}
                workflow={workflow}
                selectedNodeId={selectedNodeId}
                onSelectNode={(node) => setSelectedNodeId(node ? node.id : null)}
                onUpdateNodePosition={handleUpdateNodePosition}
                isRunning={isRunning}
                onRunAll={handleRunAll}
                onRunSingleNode={handleRunSingleNode}
                onStepNext={handleStepNext}
                onResetWorkflow={handleResetWorkflow}
                onDeleteNode={handleDeleteNode}
                onEditNode={(nodeId) => setSelectedNodeId(nodeId)}
              />
            </div>

            {/* Right: Node Inspector & Trace Drawer */}
            {selectedNode && (
              <aside className="w-80 md:w-96 bg-white/95 backdrop-blur-xl border-l border-stone-200/90 flex flex-col h-full z-20 shadow-lg font-sans overflow-hidden">
                {/* Inspector Header */}
                <div className="px-5 py-3.5 border-b border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 flex-1 mr-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      {selectedNode.label.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={selectedNode.label}
                        onChange={(e) => handleUpdateNode(selectedNode.id, { label: e.target.value })}
                        className="w-full text-xs font-bold text-stone-900 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-indigo-500 focus:bg-white focus:outline-none px-1 py-0.5 rounded transition-all"
                        placeholder="Node Title"
                      />
                      <input
                        type="text"
                        value={selectedNode.role}
                        onChange={(e) => handleUpdateNode(selectedNode.id, { role: e.target.value })}
                        className="w-full text-[10px] font-mono text-stone-500 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-indigo-500 focus:bg-white focus:outline-none px-1 py-0.5 rounded transition-all"
                        placeholder="@role-identifier"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(null)}
                      className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                      title="Close Inspector"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inspector Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                  {/* Directive & Specification */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Node Specification / Directive
                      </span>
                      <span className="text-[9px] font-mono text-stone-400">Editable</span>
                    </div>
                    <textarea
                      value={selectedNode.sublabel}
                      onChange={(e) => handleUpdateNode(selectedNode.id, { sublabel: e.target.value })}
                      rows={2}
                      className="mt-1 w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all leading-relaxed"
                      placeholder="Specify node task, purpose, or invariants..."
                    />
                  </div>

                  {/* Status, Node Type & Model Engine */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <div className="text-[10px] text-stone-400 font-medium">Node Type</div>
                      <select
                        value={selectedNode.type}
                        onChange={(e) => handleUpdateNode(selectedNode.id, { type: e.target.value as PySpurNodeType })}
                        className="w-full bg-white border border-stone-200 rounded-lg p-1 text-[11px] font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="llm">LLM Model</option>
                        <option value="code">Code Runner</option>
                        <option value="tool">Tool Invocation</option>
                        <option value="evaluator">Evaluator Grader</option>
                        <option value="router">Branch Router</option>
                        <option value="human_approval">Approval Gate</option>
                        <option value="rag_retriever">RAG Vector</option>
                        <option value="input">Input Prompt</option>
                        <option value="output">Release Output</option>
                        <option value="expert">MoE Expert</option>
                      </select>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <div className="text-[10px] text-stone-400 font-medium">Model / Engine</div>
                      <select
                        value={selectedNode.config.modelTier || 'claude-3-7-sonnet'}
                        onChange={(e) => handleUpdateNode(selectedNode.id, { config: { ...selectedNode.config, modelTier: e.target.value } })}
                        className="w-full bg-white border border-stone-200 rounded-lg p-1 text-[11px] font-mono font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="claude-3-7-sonnet">claude-3-7-sonnet</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="claude-3-5-haiku">claude-3-5-haiku</option>
                        <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                        <option value="native-ast">native-ast</option>
                      </select>
                    </div>
                  </div>

                  {/* System Prompt / Prompt Template (Editable) */}
                  {(selectedNode.type === 'llm' || selectedNode.type === 'expert' || selectedNode.config.promptTemplate !== undefined || selectedNode.config.systemPrompt !== undefined) && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Prompt Template / System Prompt
                        </span>
                        <span className="text-[9px] font-mono text-stone-400">&#123;&#123;var&#125;&#125; supported</span>
                      </div>
                      <textarea
                        value={selectedNode.config.promptTemplate || selectedNode.config.systemPrompt || ''}
                        onChange={(e) => handleUpdateNode(selectedNode.id, {
                          config: {
                            ...selectedNode.config,
                            promptTemplate: e.target.value,
                            systemPrompt: e.target.value,
                          }
                        })}
                        rows={4}
                        placeholder="Enter prompt directive with {{variable}} interpolation..."
                        className="w-full p-2.5 rounded-xl bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed border border-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                      />
                    </div>
                  )}

                  {/* Python Code & DevContainer Execution Target */}
                  {selectedNode.type === 'code' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                        <span>Execution Environment</span>
                        <span className="text-[10px] font-mono text-blue-600">Isolated Container</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-stone-200/60 text-[11px] font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateNode(selectedNode.id, { config: { ...selectedNode.config, codeExecutionTarget: 'devcontainer' } });
                            showToast('Target: DevContainer runtime');
                          }}
                          className={`py-1 rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-1 ${
                            selectedNode.config.codeExecutionTarget === 'devcontainer'
                              ? 'bg-white text-blue-700 shadow-xs font-semibold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <span>🐳 DevContainer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateNode(selectedNode.id, { config: { ...selectedNode.config, codeExecutionTarget: 'sandbox' } });
                            showToast('Target: In-Memory Sandbox');
                          }}
                          className={`py-1 rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-1 ${
                            selectedNode.config.codeExecutionTarget !== 'devcontainer'
                              ? 'bg-white text-stone-800 shadow-xs font-semibold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <span>⚡ In-Memory Sandbox</span>
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            Python Script / Logic
                          </span>
                          <span className="text-[9px] font-mono text-stone-400">Python 3.11</span>
                        </div>
                        <textarea
                          value={selectedNode.config.pythonCode || ''}
                          onChange={(e) => handleUpdateNode(selectedNode.id, { config: { ...selectedNode.config, pythonCode: e.target.value } })}
                          rows={5}
                          placeholder="# Write executable Python or AST script..."
                          className="w-full mt-1 p-2.5 rounded-xl bg-stone-950 text-emerald-400 font-mono text-[11px] leading-relaxed border border-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          showToast('Running script in DevContainer (/workspace)...');
                          const res = await execInDevContainer(selectedNode.config.pythonCode || 'print("ok")');
                          setWorkflow((prev) => ({
                            ...prev,
                            nodes: prev.nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    status: 'completed',
                                    outputTrace: {
                                      summary: `DevContainer Exec: exit code ${res.exit_code}`,
                                      confidence: res.exit_code === 0 ? 0.99 : 0.4,
                                      tokensUsed: 80,
                                      durationMs: res.duration_ms,
                                      logs: [
                                        `[devcontainer] Executed via ${res.execution_target}`,
                                        res.stdout || '[no stdout]',
                                      ],
                                    },
                                  }
                                : n
                            ),
                          }));
                          showToast(`DevContainer execution completed (${res.duration_ms}ms)`);
                        }}
                        className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Script in DevContainer</span>
                      </button>
                    </div>
                  )}

                  {/* Human-in-the-loop Approval Actions */}
                  {selectedNode.type === 'human_approval' && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span>Operator Sign-off Gate</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {selectedNode.config.humanApprovalStatus || 'pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Execution pauses at this checkpoint until operator signs off on generated artifacts.
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setWorkflow((prev) => ({
                              ...prev,
                              nodes: prev.nodes.map((n) =>
                                n.id === selectedNode.id
                                ? {
                                    ...n,
                                    status: 'completed',
                                    config: { ...n.config, humanApprovalStatus: 'approved' },
                                  }
                                : n
                              ),
                            }));
                            showToast('Operator APPROVED step execution');
                          }}
                          className="py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWorkflow((prev) => ({
                              ...prev,
                              nodes: prev.nodes.map((n) =>
                                n.id === selectedNode.id
                                ? {
                                    ...n,
                                    status: 'failed',
                                    config: { ...n.config, humanApprovalStatus: 'rejected' },
                                  }
                                : n
                              ),
                            }));
                            showToast('Operator REJECTED step execution');
                          }}
                          className="py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Evaluator Assertions Details (Editable) */}
                  {selectedNode.type === 'evaluator' && (
                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                        <span>Evaluator & Assertions</span>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = selectedNode.config.evaluatorAssertions || ['assert exit_code == 0'];
                            handleUpdateNode(selectedNode.id, {
                              config: {
                                ...selectedNode.config,
                                evaluatorAssertions: [...cur, 'assert "success" in stdout'],
                              },
                            });
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                        >
                          + Add Rule
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(selectedNode.config.evaluatorAssertions || ['assert exit_code == 0']).map((a, i) => (
                          <div key={i} className="flex items-center space-x-1.5">
                            <input
                              type="text"
                              value={a}
                              onChange={(e) => {
                                const cur = [...(selectedNode.config.evaluatorAssertions || ['assert exit_code == 0'])];
                                cur[i] = e.target.value;
                                handleUpdateNode(selectedNode.id, {
                                  config: { ...selectedNode.config, evaluatorAssertions: cur },
                                });
                              }}
                              className="flex-1 px-2 py-1 rounded-lg bg-white border border-stone-200 font-mono text-[10px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const cur = (selectedNode.config.evaluatorAssertions || ['assert exit_code == 0']).filter((_, idx) => idx !== i);
                                handleUpdateNode(selectedNode.id, {
                                  config: { ...selectedNode.config, evaluatorAssertions: cur },
                                });
                              }}
                              className="p-1 rounded-md text-stone-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Output Trace & Execution Logs */}
                  {selectedNode.outputTrace && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Output Trace & Logs
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {selectedNode.outputTrace.durationMs}ms · {selectedNode.outputTrace.tokensUsed} tokens
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 text-xs space-y-2">
                        <div className="font-medium text-stone-900">
                          {selectedNode.outputTrace.summary}
                        </div>

                        {selectedNode.outputTrace.logs && selectedNode.outputTrace.logs.length > 0 && (
                          <div className="pt-2 border-t border-stone-200 font-mono text-[10px] text-stone-600 space-y-1">
                            {selectedNode.outputTrace.logs.map((log, idx) => (
                              <div key={idx} className="flex items-start space-x-1.5">
                                <span className="text-stone-400 select-none">›</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Send to Plan Canvas Action */}
                  {synthesizedPlan && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleHandoffToPlanCanvas}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all shadow-xs active:scale-98 cursor-pointer"
                      >
                        <Target className="w-3.5 h-3.5 text-[#0ABAB5]" />
                        <span>Send to Plan Canvas →</span>
                      </button>
                      <p className="text-[10px] text-stone-400 text-center mt-1">
                        Updates active Plan Canvas & Kanban task queue
                      </p>
                    </div>
                  )}

                  {/* Delete Node Action */}
                  <div className="pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Node from Workflow</span>
                    </button>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </>
      )}

      {/* Studio Tab: Petri Orchestration Stages */}
      {activeTab === 'stages' && (
        <PetriStageTimeline
          workflow={workflow}
          activeStage={activeStage}
          activeGraph={activeGraph}
          isRunning={isRunning}
          onRunPipeline={handleRunAll}
          onStepNext={handleStepNext}
          onReset={handleResetWorkflow}
          onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
          selectedNodeId={selectedNodeId}
        />
      )}

      {/* Studio Tab: Split Dual View (Canvas + Stages) */}
      {activeTab === 'split' && (
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          <div className="flex-1 h-full relative border-r border-stone-200">
            <PySpurNodeCanvas
              key={`split-${workflow.id}`}
              workflow={workflow}
              selectedNodeId={selectedNodeId}
              onSelectNode={(node) => setSelectedNodeId(node ? node.id : null)}
              onUpdateNodePosition={handleUpdateNodePosition}
              isRunning={isRunning}
              onRunAll={handleRunAll}
              onRunSingleNode={handleRunSingleNode}
              onStepNext={handleStepNext}
              onResetWorkflow={handleResetWorkflow}
              onDeleteNode={handleDeleteNode}
              onEditNode={(nodeId) => setSelectedNodeId(nodeId)}
            />
          </div>
          <div className="w-full xl:w-[480px] h-full overflow-hidden border-t xl:border-t-0 xl:border-l border-stone-200">
            <PetriStageTimeline
              workflow={workflow}
              activeStage={activeStage}
              activeGraph={activeGraph}
              isRunning={isRunning}
              onRunPipeline={handleRunAll}
              onStepNext={handleStepNext}
              onReset={handleResetWorkflow}
              onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
              selectedNodeId={selectedNodeId}
            />
          </div>
        </div>
      )}

      {/* Studio Tab: Test Datasets & Evals */}
      {activeTab === 'evals' && (
        <PySpurEvalsPanel workflow={workflow} />
      )}

      {/* Studio Tab: DevContainer Center */}
      {activeTab === 'devcontainer' && (
        <DevContainerConsoleDrawer isOpen={true} />
      )}

      {/* Add Custom Node Modal */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-5 space-y-4 font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-stone-900">Add Pipeline Node</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNodeModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Select a node type to insert into the active development workflow pipeline:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { type: 'llm' as PySpurNodeType, label: 'LLM Model Node', icon: Sparkles, desc: 'Claude 3.7 / GPT-4o generator' },
                { type: 'code' as PySpurNodeType, label: 'Python / AST Code', icon: Code2, desc: 'Inline code execution' },
                { type: 'tool' as PySpurNodeType, label: 'Tool Invocation', icon: Cpu, desc: 'Filesystem / CLI actions' },
                { type: 'evaluator' as PySpurNodeType, label: 'Evaluator Grader', icon: CheckCircle2, desc: 'Pass@k assertions' },
                { type: 'router' as PySpurNodeType, label: 'Branch Router', icon: GitBranch, desc: 'Conditional routing' },
                { type: 'human_approval' as PySpurNodeType, label: 'Approval Gate', icon: ShieldCheck, desc: 'Human-in-the-loop' },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddNode(item.type)}
                    className="flex flex-col text-left p-3 rounded-xl border border-stone-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 text-stone-800 font-semibold text-xs">
                      <IconComp className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
