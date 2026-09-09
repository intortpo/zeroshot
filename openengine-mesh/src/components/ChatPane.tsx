import React, { useState } from 'react';
import { Send, Sparkles, Mic, Image, GitBranch, History } from 'lucide-react';
import { RunSummary } from '../types';

interface ChatPaneProps {
  runs: RunSummary[];
  activeRunId: string | null;
  onSelectRun: (runId: string) => void;
  onSubmitGoal: (goal: string, repo: string) => Promise<void>;
  onOpenApprovalModal: () => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  runs,
  activeRunId,
  onSelectRun,
  onSubmitGoal,
  onOpenApprovalModal,
}) => {
  const [goal, setGoal] = useState('');
  const [repo, setRepo] = useState('foxlight/zero-petri');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
    <div className="flex flex-col h-full bg-mesh-card border-r border-mesh-border">
      {/* Header */}
      <div className="p-3 border-b border-mesh-border flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-semibold text-white">
          <Sparkles className="w-4 h-4 text-mesh-accent" />
          <span>Autonomous Agent Hub</span>
        </div>

        {/* Target Repo Picker */}
        <div className="flex items-center space-x-1.5 text-xs bg-gray-900 border border-mesh-border px-2 py-1 rounded">
          <GitBranch className="w-3.5 h-3.5 text-gray-400" />
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="bg-transparent text-gray-200 focus:outline-none w-36 font-mono text-[11px]"
            title="Target Repository"
          />
        </div>
      </div>

      {/* Runs History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
          <History className="w-3.5 h-3.5" />
          <span>Durable Run Stream</span>
        </div>

        {runs.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            No active runs on mesh. Submit a goal below to start autonomous execution.
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
                    ? 'border-mesh-accent bg-blue-950/40 text-white'
                    : 'border-mesh-border bg-gray-900/60 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-gray-400">
                    #{run.runId.slice(0, 8)}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      run.status === 'running'
                        ? 'bg-blue-900/70 text-blue-300 border border-blue-600/50 animate-pulse'
                        : run.status === 'gated'
                        ? 'bg-amber-900/70 text-amber-300 border border-amber-600/50'
                        : run.status === 'delivered'
                        ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-600/50'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
                <div className="font-medium line-clamp-2">{run.title}</div>

                {run.status === 'gated' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRun(run.runId);
                      onOpenApprovalModal();
                    }}
                    className="mt-2 w-full py-1 px-2 text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors shadow"
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
      <form onSubmit={handleSubmit} className="p-3 border-t border-mesh-border bg-gray-900/80">
        <div className="relative">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Submit a goal or issue (e.g., 'Add Tailscale wireguard peer heartbeat broadcast and unit test')..."
            rows={3}
            className="w-full text-xs p-2.5 rounded-lg bg-gray-950 border border-mesh-border text-white placeholder-gray-500 focus:outline-none focus:border-mesh-accent resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1.5">
              {/* Voice Input Toggle (Android/Desktop) */}
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`p-1.5 rounded-md border text-xs transition-colors ${
                  isRecording
                    ? 'bg-rose-900 border-rose-600 text-rose-300 animate-pulse'
                    : 'border-mesh-border text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Voice Input"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              {/* Image Input */}
              <button
                type="button"
                className="p-1.5 rounded-md border border-mesh-border text-gray-400 hover:text-white hover:bg-gray-800 text-xs transition-colors"
                title="Attach Screenshot / Spec"
              >
                <Image className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!goal.trim() || isSubmitting}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-mesh-accent hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-md shadow-blue-900/30"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? 'Routing...' : 'Dispatch'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
