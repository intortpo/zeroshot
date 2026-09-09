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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-stone-800 font-sans">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAFBFB]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700 border border-stone-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Gated Signoff: Run #{request.runId.slice(0, 8)}
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Target Repo: <span className="text-stone-800 font-medium">{request.repoPath}</span>
              </p>
            </div>
          </div>

          {/* Verifier Badge Strip */}
          <div className="flex items-center space-x-2">
            {request.verifiers.map((v, i) => (
              <div
                key={i}
                className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{v.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 border-b border-stone-200/70 px-5 py-2 bg-stone-50/50 text-xs font-sans">
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'diff'
                ? 'bg-white text-stone-900 border border-stone-200 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-stone-700" />
            <span>Candidate Diff</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-white text-stone-900 border border-stone-200 shadow-sm'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-stone-700" />
            <span>Verification Test Output</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 bg-stone-50/70 font-mono text-xs">
          {activeTab === 'diff' ? (
            <pre className="whitespace-pre-wrap text-stone-800 bg-white p-4 rounded-2xl border border-stone-200/80 select-text leading-relaxed">
              {request.diff || 'No diff content available.'}
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap text-stone-800 bg-white p-4 rounded-2xl border border-stone-200/80 select-text leading-relaxed">
              {request.testLogs || 'No test log stream captured.'}
            </pre>
          )}
        </div>

        {/* Rejection Feedback Box */}
        {isRejecting && (
          <div className="p-4 bg-rose-50 border-t border-rose-200 flex flex-col space-y-2 animate-in slide-in-from-bottom-2 text-xs">
            <div className="flex items-center space-x-1.5 text-rose-800 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Feedback for Bounded Auto-Repair Worker:</span>
            </div>
            <textarea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              placeholder="Describe why this diff was rejected (e.g. edge case test failure, formatting, security concern)..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl bg-white border border-rose-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-rose-400 font-sans"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200/70 flex items-center justify-between bg-stone-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            Dismiss
          </button>

          <div className="flex items-center space-x-3">
            {!isRejecting ? (
              <>
                <button
                  onClick={() => setIsRejecting(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject & Repair</span>
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleApprove}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-stone-900 hover:bg-black transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Delivering...' : '1-Tap Approve & Ship'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionFeedback.trim() || isSubmitting}
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors"
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
