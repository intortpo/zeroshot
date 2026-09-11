import React, { useState, useEffect } from 'react';
import { X, Server, Cloud, KeyRound, GitBranch, ChevronDown, Check, Eye, EyeOff } from 'lucide-react';

export type WorkspaceEnvironment = 'local-docker' | 'cloud-run';

export interface WorkspaceConfig {
  environment: WorkspaceEnvironment;
  token: string;
  repository: string;
}

export interface WorkspaceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (config: WorkspaceConfig) => void;
}

const DEFAULT_REPOSITORIES = [
  'intortpo/zeroshot',
  'intortpo/bbs-momentum',
  'foxlight-ai/core',
];

export const WorkspaceSelectionModal: React.FC<WorkspaceSelectionModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [environment, setEnvironment] = useState<WorkspaceEnvironment>('local-docker');
  const [token, setToken] = useState('');
  const [repository, setRepository] = useState(DEFAULT_REPOSITORIES[0]);
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (onConnect) {
      onConnect({
        environment,
        token,
        repository,
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-neutral-100 overflow-hidden text-neutral-800 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
              Connect Workspace
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select compute runtime and configure repository access
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="divide-y divide-neutral-100">
          {/* Section 1: Environment */}
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-700">
                Environment
              </label>
              <span className="text-[11px] text-neutral-400">
                Execution runtime
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Local Docker */}
              <button
                type="button"
                onClick={() => setEnvironment('local-docker')}
                className={`relative flex flex-col p-3.5 rounded-xl text-left border transition-all ${
                  environment === 'local-docker'
                    ? 'border-neutral-900 bg-neutral-50/60 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center space-x-2">
                    <Server
                      className={`w-4 h-4 ${
                        environment === 'local-docker'
                          ? 'text-neutral-900'
                          : 'text-neutral-400'
                      }`}
                    />
                    <span className="text-xs font-semibold text-neutral-900">
                      Local Docker
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      environment === 'local-docker'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {environment === 'local-docker' && (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Local engine daemon container
                </p>
              </button>

              {/* Cloud Run */}
              <button
                type="button"
                onClick={() => setEnvironment('cloud-run')}
                className={`relative flex flex-col p-3.5 rounded-xl text-left border transition-all ${
                  environment === 'cloud-run'
                    ? 'border-neutral-900 bg-neutral-50/60 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center space-x-2">
                    <Cloud
                      className={`w-4 h-4 ${
                        environment === 'cloud-run'
                          ? 'text-neutral-900'
                          : 'text-neutral-400'
                      }`}
                    />
                    <span className="text-xs font-semibold text-neutral-900">
                      Cloud Run
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      environment === 'cloud-run'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {environment === 'cloud-run' && (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Serverless managed cloud instance
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: GitHub Auth */}
          <div className="px-6 py-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="github-token"
                className="text-xs font-medium text-neutral-700"
              >
                GitHub Authentication
              </label>
              <span className="text-[11px] text-neutral-400">
                Personal Access Token
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="github-token"
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-10 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                tabIndex={-1}
                aria-label={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Token requires standard repository read and write access permissions.
            </p>
          </div>

          {/* Section 3: Target Repository */}
          <div className="px-6 py-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="target-repo"
                className="text-xs font-medium text-neutral-700"
              >
                Target Repository
              </label>
              <span className="text-[11px] text-neutral-400">
                Git repository
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <select
                id="target-repo"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-10 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors cursor-pointer"
              >
                {DEFAULT_REPOSITORIES.map((repo) => (
                  <option key={repo} value={repo}>
                    {repo}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2.5 px-6 py-4 bg-neutral-50/50 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-black hover:bg-neutral-800 active:bg-neutral-900 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              Connect Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
