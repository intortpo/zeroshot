import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  ShieldCheck,
  FileCode2,
  X,
  Zap,
  Target,
  Edit3,
  Check,
  Send,
} from 'lucide-react';
import {
  AgentCognitionState,
  AgentCognitivePhase,
} from '../types';
import { agentCognitionService } from '../services/agentCognitionService';

interface AgentCognitionHUDProps {
  mode?: 'drawer' | 'inline';
  isOpen?: boolean;
  onClose?: () => void;
}

export const AgentCognitionHUD: React.FC<AgentCognitionHUDProps> = ({
  mode = 'drawer',
  isOpen = false,
  onClose,
}) => {
  const [cognition, setCognition] = useState<AgentCognitionState>(() =>
    agentCognitionService.getState()
  );
  const [simulating, setSimulating] = useState(false);

  // Edit Concept state
  const [isEditingConcept, setIsEditingConcept] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editHypothesis, setEditHypothesis] = useState('');
  const [editFiles, setEditFiles] = useState('');
  const [editInvariants, setEditInvariants] = useState('');

  // Operator Steer Thought Input
  const [steerInput, setSteerInput] = useState('');

  useEffect(() => {
    return agentCognitionService.subscribe((updated) => {
      setCognition(updated);
    });
  }, []);

  const concept = cognition.activeConcept;

  // Initialize edit fields when entering edit mode
  const handleStartEdit = () => {
    setEditTitle(concept.title);
    setEditSummary(concept.summary);
    setEditHypothesis(concept.workingHypothesis);
    setEditFiles(concept.targetFiles.join(', '));
    setEditInvariants(concept.activeInvariants.join('\n'));
    setIsEditingConcept(true);
  };

  const handleSaveConcept = () => {
    const updatedFiles = editFiles
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
    const updatedInvariants = editInvariants
      .split('\n')
      .map((inv) => inv.trim())
      .filter(Boolean);

    agentCognitionService.setWorkingConcept({
      title: editTitle.trim() || concept.title,
      summary: editSummary.trim() || concept.summary,
      workingHypothesis: editHypothesis.trim() || concept.workingHypothesis,
      targetFiles: updatedFiles.length > 0 ? updatedFiles : concept.targetFiles,
      activeInvariants: updatedInvariants.length > 0 ? updatedInvariants : concept.activeInvariants,
    });

    agentCognitionService.addThinkingTurn({
      role: '@human-operator',
      phase: 'hypothesizing',
      thought: `Updated concept definition to: "${editTitle.trim() || concept.title}". New working hypothesis registered.`,
      tokensUsed: 45,
      durationMs: 40,
      confidence: 1.0,
    });

    setIsEditingConcept(false);
  };

  const handleSendSteer = async () => {
    const prompt = steerInput.trim();
    if (!prompt) return;

    setSteerInput('');
    agentCognitionService.setIsThinking(true);

    agentCognitionService.addThinkingTurn({
      role: '@human-operator',
      phase: 'hypothesizing',
      thought: `Operator Directive: "${prompt}"`,
      tokensUsed: Math.round(prompt.length / 4),
      durationMs: 30,
      confidence: 1.0,
    });

    // Simulated agent cognitive reaction
    setTimeout(() => {
      agentCognitionService.addThinkingTurn({
        role: '@orchestrator',
        phase: 'verifying_invariants',
        thought: `Acknowledged operator directive: "${prompt}". Re-evaluating active invariants and updating execution strategy.`,
        tokensUsed: 140,
        durationMs: 220,
        confidence: 0.98,
      });
      agentCognitionService.setIsThinking(false);
    }, 450);
  };

  if (mode === 'drawer' && !isOpen) return null;

  const getPhaseBadge = (phase: AgentCognitivePhase) => {
    switch (phase) {
      case 'hypothesizing':
        return { label: 'HYPOTHESIZING', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'analyzing_codebase':
        return { label: 'ANALYZING CODEBASE', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'synthesizing_patch':
        return { label: 'SYNTHESIZING PATCH', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'verifying_invariants':
        return { label: 'VERIFYING INVARIANTS', color: 'bg-teal-50 text-[#0ABAB5] border-teal-200' };
      case 'self_critique':
        return { label: 'SELF-CRITIQUE', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'awaiting_gate':
        return { label: 'AWAITING GATE', color: 'bg-orange-50 text-[#FF5F1F] border-orange-200' };
      case 'idle':
      default:
        return { label: 'IDLE / READY', color: 'bg-stone-100 text-stone-600 border-stone-200' };
    }
  };

  const currentBadge = getPhaseBadge(cognition.activePhase);

  const handleRunSimulation = async () => {
    setSimulating(true);
    await agentCognitionService.simulateDeliberation(
      'Verify 64 MiB buffer ceiling and backpressure queues in DevContainer'
    );
    setSimulating(false);
  };

  const content = (
    <div className="flex-1 flex flex-col h-full bg-white text-stone-900 font-sans overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0ABAB5]/10 border border-[#0ABAB5]/30 flex items-center justify-center text-[#0ABAB5]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-stone-950 uppercase tracking-wider font-mono">
                Agent Cognition & Concept Monitor
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${currentBadge.color} flex items-center space-x-1`}
              >
                {cognition.isThinking && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping mr-1" />}
                <span>{currentBadge.label}</span>
              </span>
            </div>
            <div className="text-[10px] text-stone-500 font-sans">
              Real-time inner deliberation stream & active domain ontology
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={simulating}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-[11px] font-medium text-stone-700 flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
            title="Simulate active thinking turn"
          >
            <Sparkles className={`w-3 h-3 text-[#0ABAB5] ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Thinking...' : 'Deliberate'}</span>
          </button>

          {mode === 'drawer' && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Section 1: Active Working Concept Card (With In-Place Editing) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-teal-50/30 border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-[#0ABAB5]" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-stone-700">
                Active Working Concept
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-50 text-[#0ABAB5] border border-teal-200 uppercase">
                {concept.category}
              </span>
              {!isEditingConcept ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-white/80 border border-transparent hover:border-stone-200 transition-colors"
                  title="Update Working Concept"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleSaveConcept}
                    className="px-2 py-0.5 rounded-lg bg-[#0ABAB5] text-white text-[10px] font-bold flex items-center space-x-1 shadow-2xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingConcept(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isEditingConcept ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">
                  {concept.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {concept.summary}
                </p>
              </div>

              {/* Working Hypothesis */}
              <div className="p-3 rounded-xl bg-white border border-teal-200/70 text-xs">
                <div className="text-[10px] font-mono font-bold text-[#0ABAB5] uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Working Hypothesis (Feedback Loop First)</span>
                </div>
                <p className="text-stone-800 italic leading-relaxed">
                  "{concept.workingHypothesis}"
                </p>
              </div>

              {/* Active Invariants */}
              <div>
                <div className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Active Invariants to Enforce:
                </div>
                <div className="space-y-1">
                  {concept.activeInvariants.map((inv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-[11px] text-stone-700 bg-white/80 px-2.5 py-1 rounded-lg border border-stone-200/60 font-mono"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{inv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Files & Symbols */}
              <div>
                <div className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Target Symbols & Files:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {concept.targetFiles.map((file, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-[11px] font-mono border border-stone-200 transition-colors"
                    >
                      <FileCode2 className="w-3 h-3 text-stone-500" />
                      <span>{file.split('/').pop()}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Domain Ontology Terms */}
              <div className="pt-2 border-t border-stone-200/60 flex flex-wrap gap-1">
                {concept.domainTerms.map((term, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-stone-600 border border-stone-200"
                  >
                    #{term}
                  </span>
                ))}
              </div>
            </>
          ) : (
            /* Editing Form */
            <div className="space-y-3 animate-in fade-in duration-150 text-xs font-sans">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-stone-500 block mb-1">
                  Concept Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30"
                  placeholder="e.g. Bounded SQLite Queue"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-stone-500 block mb-1">
                  Concept Summary
                </label>
                <textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 resize-none"
                  placeholder="Brief summary of what the concept addresses..."
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-stone-500 block mb-1">
                  Working Hypothesis
                </label>
                <textarea
                  value={editHypothesis}
                  onChange={(e) => setEditHypothesis(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 resize-none italic"
                  placeholder="Testable premise guiding the agent's work..."
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-stone-500 block mb-1">
                  Target Files (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={editFiles}
                  onChange={(e) => setEditFiles(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30"
                  placeholder="path/to/file1.ts, path/to/file2.rs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-stone-500 block mb-1">
                  Active Invariants (One Per Line)
                </label>
                <textarea
                  value={editInvariants}
                  onChange={(e) => setEditInvariants(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 resize-none"
                  placeholder="Ceiling: 64 MiB&#10;Assert: exit_code == 0"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingConcept(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConcept}
                  className="px-4 py-1.5 rounded-xl bg-[#0ABAB5] hover:bg-[#099b97] text-white font-semibold text-xs flex items-center space-x-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update & Steer Agent</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Steer Agent Deliberation Input Box */}
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2">
            <Send className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-stone-700">
              Steer Agent Deliberation
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendSteer();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={steerInput}
              onChange={(e) => setSteerInput(e.target.value)}
              placeholder="Inject a thought or guidance into the agent's stream (e.g. Ensure exit code is checked first)..."
              className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30 transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={!steerInput.trim()}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <span>Steer</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* Section 3: Real-time Thinking Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-stone-700">
                Live Deliberation & Chain of Thought ({cognition.recentTurns.length} turns)
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{cognition.totalThinkingTokens.toLocaleString()} Tok</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {cognition.recentTurns.map((turn) => {
              const turnBadge = getPhaseBadge(turn.phase);
              const isOperator = turn.role === '@human-operator';

              return (
                <div
                  key={turn.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                    isOperator
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-stone-50/80 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-bold text-[11px] ${isOperator ? 'text-amber-900' : 'text-stone-800'}`}>
                        {turn.role}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold border ${turnBadge.color}`}
                      >
                        {turnBadge.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-stone-400">
                      <span>{turn.tokensUsed} tokens</span>
                      <span>·</span>
                      <span>{turn.durationMs}ms</span>
                    </div>
                  </div>

                  <p className={`font-sans leading-relaxed text-[11px] p-2.5 rounded-xl border ${
                    isOperator
                      ? 'bg-white border-amber-200 text-amber-950 font-medium'
                      : 'bg-white border-stone-200/70 text-stone-700'
                  }`}>
                    {turn.thought}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 font-mono">
                    <span>Confidence: {(turn.confidence * 100).toFixed(0)}%</span>
                    <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (mode === 'inline') {
    return <div className="h-full rounded-2xl border border-stone-200 overflow-hidden shadow-xs">{content}</div>;
  }

  // Drawer Mode: Slide-out panel overlay
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/30 backdrop-blur-2xs animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-xl h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {content}
      </div>
    </div>
  );
};
