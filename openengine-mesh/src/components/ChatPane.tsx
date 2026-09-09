import React, { useState } from 'react';
import { Send, Sparkles, Mic, Image, GitBranch, History, Search, Code2, PenTool, BarChart3, Bot, Cog } from 'lucide-react';
import { RunSummary } from '../types';

interface ChatPaneProps {
  runs: RunSummary[];
  activeRunId: string | null;
  onSelectRun: (runId: string) => void;
  onSubmitGoal: (goal: string, repo: string) => Promise<void>;
  onOpenApprovalModal: () => void;
  onOpenDwdModal?: () => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  runs,
  activeRunId,
  onSelectRun,
  onSubmitGoal,
  onOpenApprovalModal,
  onOpenDwdModal,
}) => {
  const [goal, setGoal] = useState('');
  const [repo, setRepo] = useState('foxlight/zero-petri');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const quickUseCases = [
    {
      id: 'research',
      name: 'Research',
      icon: <Search className="w-3 h-3 text-[#a3a3a3]" />,
      prompt: 'Conduct deep research on multi-agent petri orchestration and compile findings in Google Docs.',
    },
    {
      id: 'code',
      name: 'Code Gen',
      icon: <Code2 className="w-3 h-3 text-[#a3a3a3]" />,
      prompt: 'Write, test, and refactor code module for distributed peer coordination with unit tests.',
    },
    {
      id: 'content',
      name: 'Content',
      icon: <PenTool className="w-3 h-3 text-[#a3a3a3]" />,
      prompt: 'Generate technical documentation and release post for distributed Tauri petri architecture.',
    },
    {
      id: 'data_pipelines',
      name: 'Data Pipeline',
      icon: <BarChart3 className="w-3 h-3 text-[#a3a3a3]" />,
      prompt: 'Extract, transform, and analyze peer node latency telemetry, exporting to Google Sheets.',
    },
    {
      id: 'customer_support',
      name: 'Support Bot',
      icon: <Bot className="w-3 h-3 text-[#a3a3a3]" />,
      prompt: 'Deploy support bot agent on Telegram/Discord with memory-backed inquiry triage and Gmail drafts.',
    },
    {
      id: 'workflow_automation',
      name: 'Workflow',
      icon: <Cog className="w-3 h-3 text-[#a3a3a3]" />,
      prompt: 'Automate multi-step business process with task handoffs, verification, and email reports.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmitGoal(goal, repo);
      setGoal('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080808] border-r border-[#1c1c1c] text-[#e0e0e0] font-sans">
      {/* Header */}
      <div className="p-3 border-b border-[#1c1c1c] flex items-center justify-between bg-[#0b0b0b]">
        <div className="flex items-center space-x-2 text-xs font-sans text-[#f5f5f5]">
          <Sparkles className="w-3.5 h-3.5 text-[#8e8e8e]" />
          <span>Agent Dispatch Hub</span>
        </div>

        {/* Target Repo Picker */}
        <div className="flex items-center space-x-1.5 text-xs bg-[#0e0e0e] border border-[#1f1f1f] px-2 py-1 rounded">
          <GitBranch className="w-3 h-3 text-[#737373]" />
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="bg-transparent text-[#d4d4d4] focus:outline-none w-36 font-sans text-[10px]"
            title="Target Repository"
          />
        </div>
      </div>

      {/* 6 Core Use Cases Quick Strip */}
      <div className="border-b border-[#171717] bg-[#0a0a0a] px-3 py-2 overflow-x-auto">
        <div className="flex items-center justify-between mb-1.5 text-[10px] font-sans text-[#525252]">
          <span>USE CASE AGENTS (DWD)</span>
          {onOpenDwdModal && (
            <button
              onClick={onOpenDwdModal}
              className="text-[#8e8e8e] hover:text-[#f5f5f5] transition-colors underline"
            >
              Config .json
            </button>
          )}
        </div>
        <div className="flex items-center space-x-1.5 whitespace-nowrap">
          {quickUseCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setGoal(uc.prompt)}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-[#0f0f0f] hover:bg-[#171717] border border-[#1c1c1c] hover:border-[#2e2e2e] text-[10px] font-sans text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
            >
              {uc.icon}
              <span>{uc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Runs History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-[10px] font-sans text-[#525252] uppercase tracking-wider flex items-center space-x-1">
          <History className="w-3 h-3" />
          <span>Durable Run Stream</span>
        </div>

        {runs.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#525252] font-sans">
            No active runs on petri. Pick a use case or submit a goal below.
          </div>
        ) : (
          runs.map((run) => {
            const isSelected = run.runId === activeRunId;
            return (
              <div
                key={run.runId}
                onClick={() => onSelectRun(run.runId)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#333333] bg-[#121212] text-[#f5f5f5]'
                    : 'border-[#171717] bg-[#0c0c0c] text-[#a3a3a3] hover:border-[#262626] hover:bg-[#0f0f0f]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-[10px] text-[#737373]">
                    #{run.runId.slice(0, 8)}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-sans uppercase font-medium ${
                      run.status === 'running'
                        ? 'bg-[#1c1c1c] text-[#e0e0e0] border border-[#333333] animate-pulse'
                        : run.status === 'gated'
                        ? 'bg-[#222222] text-[#f5f5f5] border border-[#444444]'
                        : run.status === 'delivered'
                        ? 'bg-[#141414] text-[#a3a3a3] border border-[#262626]'
                        : 'bg-[#111111] text-[#525252]'
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
                <div className="font-medium line-clamp-2 text-[#e5e5e5]">{run.title}</div>

                {run.status === 'gated' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRun(run.runId);
                      onOpenApprovalModal();
                    }}
                    className="mt-2 w-full py-1 px-2 text-[10px] font-sans text-[#f5f5f5] bg-[#1c1c1c] hover:bg-[#262626] rounded border border-[#333333] transition-colors"
                  >
                    Review & Signoff Gate
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Goal Submission Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#1c1c1c] bg-[#0a0a0a]">
        <div className="relative">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Submit a goal or choose a use case above (with Google Workspace DWD binding)..."
            rows={3}
            className="w-full text-xs p-2.5 rounded-lg bg-[#070707] border border-[#1c1c1c] text-[#e0e0e0] placeholder-[#525252] focus:outline-none focus:border-[#333333] resize-none leading-relaxed font-sans"
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1.5">
              {/* Voice Input Toggle (Android/Desktop) */}
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`p-1.5 rounded-md border text-xs transition-colors ${
                  isRecording
                    ? 'bg-[#2b1818] border-[#592626] text-[#fca5a5] animate-pulse'
                    : 'border-[#1c1c1c] text-[#737373] hover:text-[#f5f5f5] hover:bg-[#141414]'
                }`}
                title="Voice Input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {/* Image Input */}
              <button
                type="button"
                className="p-1.5 rounded-md border border-[#1c1c1c] text-[#737373] hover:text-[#f5f5f5] hover:bg-[#141414] text-xs transition-colors"
                title="Attach Screenshot / Spec"
              >
                <Image className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!goal.trim() || isSubmitting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium text-[#f5f5f5] bg-[#1a1a1a] hover:bg-[#242424] border border-[#2e2e2e] disabled:opacity-40 transition-colors"
            >
              <Send className="w-3 h-3 text-[#a3a3a3]" />
              <span>{isSubmitting ? 'Routing...' : 'Dispatch'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
