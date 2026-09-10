import React, { useState } from 'react';
import {
  FolderGit2,
  GitBranch,
  RefreshCw,
  Plus,
  Search,
  Lock,
  Globe,
  Star,
  GitFork,
  Download,
  Trash2,
  Terminal,
  Clock,
  X,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  multiGithubAuth,
  GitHubAccount,
  GitHubRepoItem,
  LocalProjectItem,
} from '../../services/multiGithubAuthService';
import { MotionContainer } from '../motion/MotionContainer';
import { UserProfile, Workspace } from '../../types';

interface ProjectsHubViewProps {
  activeUser: UserProfile;
  activeWorkspace?: Workspace;
  onSelectWorkspace?: (ws: Workspace) => void;
  onNavigateToView?: (view: string) => void;
}

export const ProjectsHubView: React.FC<ProjectsHubViewProps> = ({
  onNavigateToView,
}) => {
  const [accounts, setAccounts] = useState<GitHubAccount[]>(() => multiGithubAuth.getAccounts());
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [localProjects, setLocalProjects] = useState<LocalProjectItem[]>(() =>
    multiGithubAuth.getLocalProjects()
  );
  const [remoteRepos, setRemoteRepos] = useState<GitHubRepoItem[]>(() =>
    multiGithubAuth.getRemoteRepos('all')
  );

  const [activeTab, setActiveTab] = useState<'local' | 'remote'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);
  const [pullingRepoId, setPullingRepoId] = useState<string | null>(null);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  // New Account Form State
  const [newAlias, setNewAlias] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newToken, setNewToken] = useState('');
  const [newAuthType, setNewAuthType] = useState<'pat' | 'oauth' | 'enterprise'>('pat');
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);

  // Refresh lists
  const refreshData = () => {
    setAccounts([...multiGithubAuth.getAccounts()]);
    setLocalProjects([...multiGithubAuth.getLocalProjects()]);
    setRemoteRepos([...multiGithubAuth.getRemoteRepos(selectedAccountId)]);
  };

  const handleAccountFilterChange = (accId: string) => {
    setSelectedAccountId(accId);
    setRemoteRepos(multiGithubAuth.getRemoteRepos(accId));
  };

  const handleSyncProject = async (projectId: string) => {
    setSyncingProjectId(projectId);
    try {
      await multiGithubAuth.syncLocalProject(projectId);
      setLocalProjects([...multiGithubAuth.getLocalProjects()]);
    } finally {
      setTimeout(() => setSyncingProjectId(null), 500);
    }
  };

  const handlePullDownRepo = async (repo: GitHubRepoItem) => {
    setPullingRepoId(repo.id);
    try {
      await multiGithubAuth.pullDownProject(repo);
      setLocalProjects([...multiGithubAuth.getLocalProjects()]);
      setActiveTab('local');
    } finally {
      setTimeout(() => setPullingRepoId(null), 700);
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    if (window.confirm('Remove this GitHub account from Petri vault?')) {
      multiGithubAuth.removeAccount(accountId);
      refreshData();
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newToken || !newEmail) return;

    setIsSubmittingAccount(true);
    try {
      await multiGithubAuth.addAccount(
        newAlias || `${newUsername} (${newAuthType.toUpperCase()})`,
        newToken,
        newUsername,
        newEmail,
        newUsername
      );
      refreshData();
      setIsAddAccountModalOpen(false);
      setNewAlias('');
      setNewUsername('');
      setNewEmail('');
      setNewToken('');
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  const filteredLocalProjects = localProjects.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccount =
      selectedAccountId === 'all' || p.accountId === selectedAccountId;
    return matchesQuery && matchesAccount;
  });

  const filteredRemoteRepos = remoteRepos.filter((r) => {
    const matchesQuery =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.language.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccount =
      selectedAccountId === 'all' || r.accountId === selectedAccountId;
    return matchesQuery && matchesAccount;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 font-sans">
      {/* Header & Accounts Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-6 py-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-stone-900">Projects & Git Vault</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  Multi-Account GitHub
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Manage multiple GitHub accounts, verify branch freshness, and 1-click pull remote repositories into your local workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect GitHub Account</span>
            </button>
          </div>
        </div>

        {/* Connected Accounts Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100">
          <span className="text-[11px] font-mono uppercase font-semibold text-stone-400">
            Accounts:
          </span>

          <button
            onClick={() => handleAccountFilterChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
              selectedAccountId === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>All Accounts</span>
            <span className="font-mono text-[10px] opacity-70">({accounts.length})</span>
          </button>

          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs ${
                selectedAccountId === acc.id
                  ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
              onClick={() => handleAccountFilterChange(acc.id)}
            >
              <img
                src={acc.avatarUrl}
                alt={acc.username}
                className="w-4 h-4 rounded-full border border-stone-300 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="truncate max-w-[140px]">{acc.alias}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 uppercase">
                {acc.authType}
              </span>
              <div
                className="text-[10px] font-mono text-emerald-600"
                title={`Rate Limit: ${acc.rateLimit.remaining} / ${acc.rateLimit.limit}`}
              >
                {acc.rateLimit.remaining} reqs
              </div>
              {accounts.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAccount(acc.id);
                  }}
                  className="p-0.5 text-stone-400 hover:text-rose-600 transition-colors ml-1"
                  title="Remove account"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Tabs and Toolbar */}
      <div className="px-6 py-3 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'local'
                ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Local Workspaces</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600">
              {filteredLocalProjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('remote')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'remote'
                ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>Remote Repositories</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600">
              {filteredRemoteRepos.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'local' ? 'local projects' : 'remote repos'}...`}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* LOCAL PROJECTS TAB */}
        {activeTab === 'local' && (
          <div className="space-y-4">
            <MotionContainer
              staggerChildren
              preset="gentle"
              staggerMs={35}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {filteredLocalProjects.map((project) => {
                const isSyncing = syncingProjectId === project.id;
                const isCurrentWs = project.name === 'zero-petri';

                return (
                  <div
                    key={project.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                      isCurrentWs
                        ? 'border-teal-300 ring-2 ring-teal-100/60'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                            <FolderGit2 className="w-5 h-5 text-teal-700" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-bold text-stone-900">{project.name}</h3>
                              {isCurrentWs && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-teal-100 text-teal-800 font-semibold">
                                  ACTIVE WORKSPACE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-stone-400 font-mono mt-0.5">
                              <span className="flex items-center space-x-1 text-stone-600">
                                <GitBranch className="w-3 h-3 text-emerald-600" />
                                <span>{project.currentBranch}</span>
                              </span>
                              <span>·</span>
                              <span className="truncate max-w-[260px] text-stone-500">
                                {project.path}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSyncProject(project.id)}
                          disabled={isSyncing}
                          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer"
                          title="Fetch & Check Freshness"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Freshness & Scoped Account attribution */}
                      <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-stone-50 p-2 rounded-xl">
                          <div className="text-[10px] uppercase font-mono text-stone-400">Sync Status</div>
                          <div className="font-semibold text-emerald-600 flex items-center justify-center space-x-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Up to date</span>
                          </div>
                        </div>
                        <div className="bg-stone-50 p-2 rounded-xl">
                          <div className="text-[10px] uppercase font-mono text-stone-400">Commits Ahead/Behind</div>
                          <div className="font-semibold text-stone-700 font-mono mt-0.5">
                            +{project.aheadCount} / -{project.behindCount}
                          </div>
                        </div>
                        <div className="bg-stone-50 p-2 rounded-xl">
                          <div className="text-[10px] uppercase font-mono text-stone-400">Git Identity</div>
                          <div className="font-semibold text-stone-700 truncate mt-0.5" title={project.accountAlias}>
                            {project.accountAlias.split('(')[0]}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-stone-400 font-mono flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>Synced {new Date(project.lastSyncAt).toLocaleTimeString()}</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        {onNavigateToView && (
                          <button
                            onClick={() => onNavigateToView('chat')}
                            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <Terminal className="w-3 h-3" />
                            <span>Open in Chat</span>
                          </button>
                        )}
                        {onNavigateToView && (
                          <button
                            onClick={() => onNavigateToView('board')}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <span>Kanban Flow</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </MotionContainer>
          </div>
        )}

        {/* REMOTE REPOSITORIES TAB */}
        {activeTab === 'remote' && (
          <div className="space-y-4">
            <MotionContainer
              staggerChildren
              preset="gentle"
              staggerMs={30}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredRemoteRepos.map((repo) => {
                const isPulling = pullingRepoId === repo.id;
                const isAlreadyCloned = localProjects.some((p) => p.name === repo.name);

                return (
                  <div
                    key={repo.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={repo.ownerAvatar}
                            alt={repo.owner}
                            className="w-7 h-7 rounded-lg border border-stone-200 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="text-xs font-bold text-stone-900 hover:text-teal-700 transition-colors flex items-center space-x-1.5">
                              <span>{repo.name}</span>
                              {repo.isPrivate ? (
                                <Lock className="w-3 h-3 text-amber-600" />
                              ) : (
                                <Globe className="w-3 h-3 text-stone-400" />
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {repo.fullName}
                            </div>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {repo.language}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 my-2 leading-relaxed">
                        {repo.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center space-x-3 text-[10px] text-stone-400 font-mono mt-3">
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span>{repo.stars}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <GitFork className="w-3 h-3 text-stone-400" />
                          <span>{repo.forks}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <GitBranch className="w-3 h-3 text-emerald-600" />
                          <span>{repo.defaultBranch}</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-stone-400 font-mono truncate max-w-[130px]">
                        {repo.accountAlias.split('(')[0]}
                      </span>

                      {isAlreadyCloned ? (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Cloned Locally</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePullDownRepo(repo)}
                          disabled={isPulling}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          {isPulling ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>{isPulling ? 'Pulling Down...' : 'Pull to Workspace'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </MotionContainer>
          </div>
        )}
      </div>

      {/* CONNECT GITHUB ACCOUNT MODAL */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">Connect GitHub Account</h3>
                  <p className="text-[11px] text-stone-500">
                    Vault encrypted with AES-256-GCM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAccountModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAuthType('pat')}
                    className={`py-1.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      newAuthType === 'pat'
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <User className="w-3 h-3 mx-auto mb-0.5" />
                    Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAuthType('enterprise')}
                    className={`py-1.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      newAuthType === 'enterprise'
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <Building2 className="w-3 h-3 mx-auto mb-0.5" />
                    Organization
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAuthType('oauth')}
                    className={`py-1.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      newAuthType === 'oauth'
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <Globe className="w-3 h-3 mx-auto mb-0.5" />
                    OAuth
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Account Alias / Label
                </label>
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="e.g. Work Org - OpenEngine"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    GitHub Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="octocat"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Git Email (Commit Identity) *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Personal Access Token (PAT) / Key *
                </label>
                <input
                  type="password"
                  required
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 font-mono"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Token requires `repo`, `read:org`, and `user` scopes. Encrypted locally with AES-256-GCM.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccount}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmittingAccount ? 'Encrypting & Saving...' : 'Save Account to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
