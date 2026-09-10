import {
  X,
  Clock,
  MessageSquare,
  Trash2,
  GitFork,
  ArrowRight
} from 'lucide-react';
import { ConversationBranch } from '../../types';
import { geminiCompanionService } from '../../services/geminiCompanionService';

interface BranchTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: ConversationBranch[];
  activeBranchId: string;
  onSelectBranch: (id: string) => void;
}

export const BranchTreeModal: React.FC<BranchTreeModalProps> = ({
  isOpen,
  onClose,
  branches,
  activeBranchId,
  onSelectBranch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-teal-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Conversation Branch Lineage Tree
            </h3>
            <p className="text-xs text-slate-400">
              Navigate between forked conversation timelines or review where threads diverged.
            </p>
          </div>
        </div>

        {/* List of Branches */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {branches.map((branch) => {
            const isActive = branch.id === activeBranchId;
            const isMain = branch.id === 'main-branch';

            return (
              <div
                key={branch.id}
                onClick={() => {
                  onSelectBranch(branch.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-teal-950/30 border-teal-500/60 ring-1 ring-teal-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: branch.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                        {branch.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          ACTIVE
                        </span>
                      )}
                      {isMain && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-slate-400 bg-slate-800 border border-slate-700">
                          ROOT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {branch.messages.length} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {branch.createdAt}
                      </span>
                      {branch.parentBranchId && (
                        <span className="text-slate-400">
                          Diverged from: {branch.parentBranchId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isMain && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        geminiCompanionService.deleteBranch(branch.id);
                      }}
                      className="p-1.5 text-slate-600 hover:text-rose-400 rounded transition-colors"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Total Branches: {branches.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close Tree View
          </button>
        </div>
      </div>
    </div>
  );
};
