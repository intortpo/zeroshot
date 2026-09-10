import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Terminal,
  FolderGit2,
} from 'lucide-react';
import { PetriHourglassStream } from '../edm/PetriHourglassStream';
import { PetriColorCustomizer } from '../common/PetriColorCustomizer';
import { Workspace, UserProfile } from '../../types';

interface PetriGitDevelopmentViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
}

interface GitCommitItem {
  hash: string;
  type: string;
  scope?: string;
  message: string;
  author: string;
  age: string;
  status: 'passed' | 'running' | 'gated';
}

export const PetriGitDevelopmentView: React.FC<PetriGitDevelopmentViewProps> = ({
  activeWorkspace,
  activeUser: _activeUser,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'funnel' | 'commits' | 'worktrees' | 'ci'>('funnel');
  const [ciStatus, setCiStatus] = useState<Record<string, 'passed' | 'running' | 'idle'>>({
    'cargo fmt': 'passed',
    'cargo clippy': 'passed',
    'cargo test': 'passed',
    'npm run lint': 'passed',
    'npm test': 'passed',
    'forbidden-word-guard': 'passed',
  });

  const recentCommits: GitCommitItem[] = [
    {
      hash: '6e63e7f',
      type: 'feat',
      scope: 'gallery',
      message: 'add digital asset library vault, unify edm studio federated selector, and deploy turnkey vm',
      author: 'hideo',
      age: '24m ago',
      status: 'passed',
    },
    {
      hash: 'e927c3a',
      type: 'feat',
      scope: 'video',
      message: 'expand hyperframe video editor and add gemini thought companion forking',
      author: 'hideo',
      age: '1h ago',
      status: 'passed',
    },
    {
      hash: '8f2d19b',
      type: 'feat',
      scope: 'edm',
      message: 'implement longitudinal clock-in and midterm submersion charting',
      author: 'hideo',
      age: '2h ago',
      status: 'passed',
    },
    {
      hash: '4a1b80c',
      type: 'fix',
      scope: 'deploy',
      message: 'resolve private repo clone failure and configure caddy turnkey proxy',
      author: 'hideo',
      age: '3h ago',
      status: 'passed',
    },
  ];

  const handleRunCiGates = () => {
    setIsRefreshing(true);
    setCiStatus({
      'cargo fmt': 'running',
      'cargo clippy': 'running',
      'cargo test': 'running',
      'npm run lint': 'running',
      'npm test': 'running',
      'forbidden-word-guard': 'running',
    });

    setTimeout(() => {
      setCiStatus({
        'cargo fmt': 'passed',
        'cargo clippy': 'passed',
        'cargo test': 'passed',
        'npm run lint': 'passed',
        'npm test': 'passed',
        'forbidden-word-guard': 'passed',
      });
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#041017] text-slate-100 overflow-y-auto font-sans select-none">
      {/* Top Header Bar */}
      <div className="border-b border-teal-900/40 bg-[#071620] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#041017] border border-teal-700/60 flex items-center justify-center text-teal-400 shadow-sm">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                Git Development Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-teal-950 text-teal-300 border border-teal-800/60">
                main trunk
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#041017] text-slate-300 border border-teal-900/40">
                {activeWorkspace?.repo || 'foxlight/zero-petri'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 mt-0.5">
              <span className="flex items-center space-x-1">
                <GitBranch className="w-3.5 h-3.5 text-teal-400" />
                <span>Branch: main (single release trunk)</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Conventional Commit Enforcement: Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center space-x-3">
          <PetriColorCustomizer />

          <button
            onClick={handleRunCiGates}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-mono font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Verify CI Gates</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-teal-900/40 pb-3">
          <button
            onClick={() => setActiveTab('funnel')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'funnel'
                ? 'bg-teal-950 border border-teal-700/60 text-teal-200'
                : 'bg-[#071620] border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Petri Funnel Stream (Left → Right)
          </button>
          <button
            onClick={() => setActiveTab('commits')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'commits'
                ? 'bg-teal-950 border border-teal-700/60 text-teal-200'
                : 'bg-[#071620] border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Authoritative Commits
          </button>
          <button
            onClick={() => setActiveTab('ci')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'ci'
                ? 'bg-teal-950 border border-teal-700/60 text-teal-200'
                : 'bg-[#071620] border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Automated CI Verification Gates
          </button>
          <button
            onClick={() => setActiveTab('worktrees')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'worktrees'
                ? 'bg-teal-950 border border-teal-700/60 text-teal-200'
                : 'bg-[#071620] border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Isolated Worktrees
          </button>
        </div>

        {/* Section 1: Horizontal Petri Funnel */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase text-teal-400 font-bold tracking-wider flex items-center space-x-2">
              <GitMerge className="w-4 h-4" />
              <span>Left-to-Right Delivery Stream</span>
            </h2>
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
              <span>Commits (540)</span>
              <span>→</span>
              <span>CI Gates (180)</span>
              <span>→</span>
              <span>Squash (42)</span>
              <span>→</span>
              <span>Releases (4)</span>
            </div>
          </div>

          <PetriHourglassStream
            initialMode="git_development"
            orientation="horizontal"
          />
        </section>

        {/* Section 2: Repository Health & Rules Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#071620] border border-teal-900/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Trunk Policy</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">Single Main Trunk</div>
            <div className="text-xs text-slate-300 font-mono">
              All deliveries target main directly. No semantic promotion branches.
            </div>
          </div>

          <div className="bg-[#071620] border border-teal-900/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Release Fanout</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">Immutable GitHub Release</div>
            <div className="text-xs text-slate-300 font-mono">
              Native CLI binaries, Docker target, npm package, PyPI wheel rev 1.
            </div>
          </div>

          <div className="bg-[#071620] border border-teal-900/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Worktree Safety</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono">Isolated Container Sandboxes</div>
            <div className="text-xs text-slate-300 font-mono">
              Worker git operations run exclusively in temporary worktrees.
            </div>
          </div>
        </div>

        {/* Section 3: CI Gates Status Grid */}
        <div className="bg-[#071620] border border-teal-900/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase text-teal-400 font-bold tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span>Automated CI Gate Status</span>
            </h3>
            <span className="text-[11px] font-mono text-teal-300 bg-[#041017] px-2.5 py-1 rounded-lg border border-teal-900/50">
              6 of 6 Gates Passing
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(ciStatus).map(([name, status]) => (
              <div
                key={name}
                className="bg-[#041017] border border-teal-900/40 rounded-xl p-3 flex items-center justify-between font-mono text-xs"
              >
                <span className="text-slate-300">{name}</span>
                {status === 'running' ? (
                  <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
                ) : (
                  <span className="flex items-center space-x-1 text-teal-400 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASSED</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Recent Authoritative Commits Stream */}
        <div className="bg-[#071620] border border-teal-900/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase text-teal-400 font-bold tracking-wider flex items-center space-x-2">
              <GitCommit className="w-4 h-4" />
              <span>Authoritative Squash Commits on Main</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Squash merge enforces conventional title as released commit
            </span>
          </div>

          <div className="space-y-2">
            {recentCommits.map((c) => (
              <div
                key={c.hash}
                className="bg-[#041017] border border-teal-900/40 hover:border-teal-700/60 rounded-xl p-3.5 flex items-center justify-between gap-4 font-mono transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 text-[11px] font-bold border border-teal-900/60">
                    {c.hash}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-200 truncate flex items-center space-x-1.5">
                      <span className="font-bold text-teal-400">{c.type}{c.scope ? `(${c.scope})` : ''}:</span>
                      <span>{c.message}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Authored by {c.author} • {c.age}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60">
                    squash-merged
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
