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

interface NodeStudioViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
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
  activeWorkspace: _activeWorkspace,
  activeUser: _activeUser,
  onHandoffPlan,
  onNavigateToChat,
}) => {
  // Active Workflow State
  const [workflow, setWorkflow] = useState<PySpurWorkflow>(() =>
    createDefaultMoeWorkflow()
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-moe-router');
  const [goalPrompt, setGoalPrompt] = useState<string>(
    'Implement bounded SQLite retry queues with backpressure and acceptance test suite'
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

  // Switch Template
  const handleSelectTemplate = (
    key: 'moe_planner' | 'agentic_coder' | 'rag_retrieval' | 'human_approval'
  ) => {
    setIsTemplateMenuOpen(false);
    if (key === 'moe_planner') {
      const wf = createDefaultMoeWorkflow(goalPrompt);
      setWorkflow(wf);
      setSelectedNodeId('node-moe-router');
      setSynthesizedPlan(synthesizePlanFromMoe(goalPrompt, wf));
      showToast('Loaded Mixture of Experts (MoE) Planner workflow');
    } else if (key === 'agentic_coder') {
      setWorkflow(createAgenticCoderWorkflow());
      setSelectedNodeId('node-code-coder');
      showToast('Loaded Agentic Coder Loop template');
    } else if (key === 'rag_retrieval') {
      setWorkflow(createRagRetrievalWorkflow());
      setSelectedNodeId('node-rag-search');
      showToast('Loaded RAG Knowledge Retrieval template');
    } else if (key === 'human_approval') {
      setWorkflow(createHumanApprovalWorkflow());
      setSelectedNodeId('node-ha-gate');
      showToast('Loaded Human-in-the-Loop Approval template');
    }
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
    const newNode: PySpurNode = {
      id: newId,
      type,
      label: `Custom ${type.toUpperCase()}`,
      sublabel: 'User-configured PySpur node',
      role: `@custom-${type}`,
      iconName: type === 'code' ? 'Code2' : type === 'tool' ? 'Cpu' : 'Workflow',
      position: { x: 450 + Math.random() * 80, y: 150 + Math.random() * 80 },
      status: 'idle',
      config: {
        modelTier: 'claude-3-7-sonnet',
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

      {/* Top Banner: PySpur Branding, Template Switcher & Telemetry Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
        {/* Left: Branding & Template Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-stone-950">PySpur Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  MoE v2
                </span>
              </div>
              <div className="text-[10px] text-stone-500 font-sans">
                Visual Development Platform for Agent Workflows & Mixture of Experts
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
                  PySpur Workflow Templates
                </div>

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
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
            title="Export PySpur JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
            title="Import PySpur JSON"
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
                if (e.key === 'Enter') handleRunMoEWorkflow();
              }}
              placeholder="Enter goal for Mixture of Experts planning (e.g. Bounded SQLite queue, SAIF security audit...)"
              className="w-full pl-14 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <button
            type="button"
            disabled={isRunning || !goalPrompt.trim()}
            onClick={() => handleRunMoEWorkflow()}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-100 text-amber-800 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Running MoE...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run MoE Plan</span>
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
                handleRunMoEWorkflow(p.prompt);
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
        {/* Center: PySpur Visual Graph Canvas */}
        <div className="flex-1 h-full relative">
          <PySpurNodeCanvas
            workflow={workflow}
            selectedNodeId={selectedNodeId}
            onSelectNode={(node) => setSelectedNodeId(node ? node.id : null)}
            onUpdateNodePosition={handleUpdateNodePosition}
            isRunning={isRunning}
          />
        </div>

        {/* Right: Node Inspector & Trace Drawer */}
        {selectedNode && (
          <aside className="w-80 md:w-96 bg-white/95 backdrop-blur-xl border-l border-stone-200/90 flex flex-col h-full z-20 shadow-lg font-sans overflow-hidden">
            {/* Inspector Header */}
            <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                  {selectedNode.label.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 leading-tight">
                    {selectedNode.label}
                  </h3>
                  <div className="text-[10px] font-mono text-stone-400">{selectedNode.role}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspector Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Description */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Node Specification
                </span>
                <p className="mt-1 text-stone-700 text-xs leading-relaxed">
                  {selectedNode.sublabel}
                </p>
              </div>

              {/* Status & Model Tier */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] text-stone-400 font-medium">Lifecycle Status</div>
                  <div className="font-bold text-stone-900 capitalize flex items-center space-x-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedNode.status === 'completed'
                          ? 'bg-emerald-500'
                          : selectedNode.status === 'running'
                          ? 'bg-amber-500 animate-ping'
                          : selectedNode.status === 'bypassed'
                          ? 'bg-stone-300'
                          : 'bg-stone-400'
                      }`}
                    />
                    <span>{selectedNode.status}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-[10px] text-stone-400 font-medium">Model / Engine</div>
                  <div className="font-mono text-stone-900 font-semibold text-[11px] truncate">
                    {selectedNode.config.modelTier || 'Native AST'}
                  </div>
                </div>
              </div>

              {/* Gating Weights Breakdown (if Router or Expert) */}
              {selectedNode.config.gatingWeights && (
                <div className="space-y-2 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                    <span>Softmax Gating Weights</span>
                    <span className="font-mono text-[10px]">Top-3 Active</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {Object.entries(selectedNode.config.gatingWeights).map(([domain, weight]) => (
                      <div key={domain} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-stone-600">
                          <span className="capitalize">{domain.replace('_', ' ')}</span>
                          <span className="font-bold text-indigo-700">
                            {Math.round(weight * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-200/80 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(weight * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Prompt / Prompt Template */}
              {selectedNode.config.systemPrompt && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    System Prompt
                  </span>
                  <div className="p-3 rounded-xl bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {selectedNode.config.systemPrompt}
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
            </div>
          </aside>
        )}
      </div>

      {/* Add Custom Node Modal */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md p-5 space-y-4 font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-stone-900">Add PySpur Workflow Node</h3>
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
              Select a node type to insert into the active agentic workflow canvas:
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
