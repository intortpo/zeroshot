import React, { useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle, FileCode2, Terminal } from 'lucide-react';
import { GateApprovalRequest } from '../types';

interface ApprovalModalProps {
  request: GateApprovalRequest;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (runId: string) => Promise<void>;
  onReject: (runId: string, feedback: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'logs'>('diff');
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(request.runId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionFeedback.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(request.runId, rejectionFeedback);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-mesh-card border border-mesh-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-mesh-border flex items-center justify-between bg-gray-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Gated Signoff: Run #{request.runId.slice(0, 8)}
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Target Repo: <span className="text-blue-400">{request.repoPath}</span>
              </p>
            </div>
          </div>

          {/* Verifier Badge Strip */}
          <div className="flex items-center space-x-2">
            {request.verifiers.map((v, i) => (
              <div
                key={i}
                className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{v.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 border-b border-mesh-border px-4 py-2 bg-gray-900/40 text-xs">
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'diff'
                ? 'bg-mesh-border text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-blue-400" />
            <span>Candidate Diff</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-mesh-border text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Verification Test Output</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-mesh-dark">
          {activeTab === 'diff' ? (
            <pre className="whitespace-pre-wrap text-gray-300 select-text leading-relaxed">
              {request.diff || 'No diff content available.'}
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap text-emerald-300/90 select-text leading-relaxed">
              {request.testLogs || 'No test log stream captured.'}
            </pre>
          )}
        </div>

        {/* Rejection Feedback Box */}
        {isRejecting && (
          <div className="p-3 bg-rose-950/40 border-t border-rose-900/60 flex flex-col space-y-2 animate-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-1 text-xs text-rose-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Feedback for Bounded Auto-Repair Worker:</span>
            </div>
            <textarea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              placeholder="Describe why this diff was rejected (e.g. edge case test failure, formatting, security concern)..."
              rows={2}
              className="w-full text-xs p-2 rounded bg-gray-900 border border-rose-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-mesh-border flex items-center justify-between bg-gray-900/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Dismiss
          </button>

          <div className="flex items-center space-x-3">
            {!isRejecting ? (
              <>
                <button
                  onClick={() => setIsRejecting(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject & Repair</span>
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleApprove}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Delivering...' : '1-Tap Approve & Ship'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionFeedback.trim() || isSubmitting}
                  onClick={handleReject}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Routing to Worker...' : 'Confirm Rejection'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
