import React, { useState } from 'react';
import {
  Terminal,
  Cloud,
  Cpu,
  Plus,
  Play,
  Square,
  Trash2,
  ExternalLink,
  RefreshCw,
  GitPullRequest,
  Shield,
  ArrowUpRight
} from 'lucide-react';
import {
  antigravityCloudService,
  AntigravitySession
} from '../../services/antigravityCloudService';
import {
  githubProjectService,
  GitHubProjectItem
} from '../../services/githubProjectService';
import { cosmosAuthService } from '../../services/cosmosAuthService';
import { UserProfile, Workspace } from '../../types';

interface PetriAntigravityCloudViewProps {
  activeUser: UserProfile;
  activeWorkspace?: Workspace;
  onNavigateToProjects?: () => void;
}

export const PetriAntigravityCloudView: React.FC<PetriAntigravityCloudViewProps> = ({
  activeUser: _activeUser,
  activeWorkspace: _activeWorkspace,
  onNavigateToProjects,
}) => {
  const [sessions, setSessions] = useState<AntigravitySession[]>(() =>
    antigravityCloudService.getSessions()
  );
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const list = antigravityCloudService.getSessions();
    return list[0]?.id || '';
  });
  const [projectItems, setProjectItems] = useState<GitHubProjectItem[]>(() =>
    githubProjectService.getProjectItems()
  );

  // New Session Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionEnv, setNewSessionEnv] = useState<'local_docker' | 'cloud_run'>('local_docker');
  const [selectedIssueNumber, setSelectedIssueNumber] = useState<number | undefined>(undefined);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const refreshSessions = () => {
    setSessions([...antigravityCloudService.getSessions()]);
    setProjectItems([...githubProjectService.getProjectItems()]);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    const matchedIssue = projectItems.find((i) => i.issueNumber === selectedIssueNumber);

    const created = antigravityCloudService.createSession({
      name: newSessionName.trim(),
      envType: newSessionEnv,
      taskTitle: matchedIssue ? matchedIssue.title : undefined,
      githubIssueNumber: matchedIssue?.issueNumber,
      githubIssueUrl: matchedIssue?.issueUrl,
    });

    if (matchedIssue) {
      githubProjectService.linkSessionToItem(matchedIssue.id, created.id);
    }

    refreshSessions();
    setActiveSessionId(created.id);
    setIsCreateModalOpen(false);
    setNewSessionName('');
  };

  const handleLaunchSessionForIssue = (item: GitHubProjectItem) => {
    const name = `issue-${item.issueNumber || Math.floor(Math.random() * 1000)}`;
    const created = antigravityCloudService.createSession({
      name,
      envType: 'local_docker',
      taskTitle: item.title,
      githubIssueNumber: item.issueNumber,
      githubIssueUrl: item.issueUrl,
    });
    githubProjectService.linkSessionToItem(item.id, created.id);
    refreshSessions();
    setActiveSessionId(created.id);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F6F3EC] text-[#1A1D1A] font-mono relative">
      {/* Drafting parchment grid backdrop */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(26,29,26,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,29,26,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Ribbon: Antigravity Cloud Run & Cosmos Gateway Status */}
      <header className="relative z-10 border-b border-[#1A1D1A] bg-[#FAF8F3] px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded border border-[#1A1D1A] bg-[#1A1D1A] text-[#FAF8F3] flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold uppercase tracking-wider">
                ANTIGRAVITY // CLOUD RUN ENGINE
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#1A1D1A] bg-[#EDE8DC] font-bold">
                v2.4 DOCKER + CLOUD RUN
              </span>
            </div>
            <p className="text-[10px] text-[#1A1D1A]/60">
              Isolated Antigravity CLI (<code className="font-bold">agy</code>) sessions with live ttyd web terminals
            </p>
          </div>
        </div>

        {/* Status Indicators & Action CTA */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 border border-[#1A1D1A]/30 bg-white text-[10px]">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-bold">COSMOS GATEWAY:</span>
            <span className="text-emerald-700 font-bold uppercase">
              {cosmosAuthService.isBehindCosmos() ? 'PROXY PROTECTED' : 'DEV SECURE'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 border border-[#1A1D1A]/30 bg-white text-[10px]">
            <Cloud className="w-3.5 h-3.5 text-sky-700" />
            <span className="font-bold">PROJECT:</span>
            <span className="font-bold">foxlight-489607</span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-[2px_2px_0px_#1A1D1A] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New agy Session</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Sessions Shelf (Left) + Live Terminal (Center) + GitHub Project Tasks (Right) */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Panel: Active Antigravity Sessions List */}
        <aside className="w-72 border-r border-[#1A1D1A] bg-[#FAF8F3] flex flex-col">
          <div className="p-3 border-b border-[#1A1D1A]/20 flex items-center justify-between bg-[#EDE8DC]/50">
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Container Sessions ({sessions.length})</span>
            </span>
            <button
              onClick={refreshSessions}
              className="p-1 text-[#1A1D1A]/60 hover:text-[#1A1D1A] cursor-pointer"
              title="Refresh sessions"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {sessions.map((sess) => {
              const isSelected = sess.id === activeSession?.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`p-3 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1A1D1A] bg-white shadow-[3px_3px_0px_#1A1D1A]'
                      : 'border-[#1A1D1A]/40 bg-[#FAF8F3] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sess.status === 'running'
                            ? 'bg-emerald-600 animate-pulse'
                            : sess.status === 'starting'
                            ? 'bg-amber-500 animate-spin'
                            : 'bg-stone-400'
                        }`}
                      />
                      <span className="text-xs font-bold truncate max-w-[130px]">
                        {sess.name}
                      </span>
                    </div>

                    <span className="text-[9px] px-1.5 py-0.2 border border-[#1A1D1A]/50 uppercase font-bold bg-[#F2EFE9]">
                      {sess.envType === 'cloud_run' ? 'Cloud Run' : 'Local Docker'}
                    </span>
                  </div>

                  {sess.taskTitle && (
                    <p className="text-[10px] text-[#1A1D1A]/80 line-clamp-2 mb-1.5 font-sans">
                      {sess.taskTitle}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[9px] text-[#1A1D1A]/60 font-mono pt-1 border-t border-[#1A1D1A]/10">
                    <span>Port :{sess.port}</span>
                    <span>{sess.tmuxSessionName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Panel: Live Embedded Web Terminal (ttyd + tmux) */}
        <main className="flex-1 flex flex-col bg-[#111311] text-[#E0E2DE] overflow-hidden">
          {activeSession ? (
            <>
              {/* Terminal Title Bar & Session Controller */}
              <div className="border-b border-[#333] bg-[#1A1D1A] px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-white tracking-wider uppercase">
                      {activeSession.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 border border-white/20 bg-black/40 text-stone-300">
                      {activeSession.envType === 'cloud_run' ? 'Cloud Run Gen2' : 'Docker Engine'}
                    </span>
                  </div>

                  {activeSession.githubIssueNumber && (
                    <a
                      href={activeSession.githubIssueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 font-sans"
                    >
                      <GitPullRequest className="w-3 h-3" />
                      <span>Issue #{activeSession.githubIssueNumber}</span>
                    </a>
                  )}
                </div>

                {/* Session Actions */}
                <div className="flex items-center space-x-2 text-[10px]">
                  {activeSession.envType === 'local_docker' && (
                    <button
                      onClick={() => antigravityCloudService.deployToCloudRun(activeSession.id).then(refreshSessions)}
                      className="px-2.5 py-1 bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-600/50 flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Cloud className="w-3 h-3" />
                      <span>Deploy to Cloud Run</span>
                    </button>
                  )}

                  {activeSession.status === 'running' ? (
                    <button
                      onClick={() => antigravityCloudService.stopSession(activeSession.id).then(refreshSessions)}
                      className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 flex items-center space-x-1 cursor-pointer"
                    >
                      <Square className="w-3 h-3" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => antigravityCloudService.startSession(activeSession.id).then(refreshSessions)}
                      className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-600 flex items-center space-x-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  )}

                  <a
                    href={activeSession.ttydUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 flex items-center space-x-1 cursor-pointer"
                    title="Pop out in separate browser tab"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Popout</span>
                  </a>

                  <button
                    onClick={() => {
                      antigravityCloudService.deleteSession(activeSession.id);
                      refreshSessions();
                    }}
                    className="p-1 hover:text-red-400 text-stone-500 cursor-pointer"
                    title="Destroy container"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Embedded Web Terminal Canvas */}
              <div className="flex-1 relative bg-black flex flex-col">
                {/* Fallback Simulation Terminal Console when local port is not bound yet */}
                <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 selection:bg-white selection:text-black">
                  <div className="text-stone-500 mb-2">
                    # Antigravity CLI (agy) container interactive terminal ready.
                    <br /># Connected to session {activeSession.name} [{activeSession.tmuxSessionName}]
                  </div>

                  {activeSession.logTail?.map((line, idx) => (
                    <div key={idx} className="text-emerald-400/90 leading-relaxed">
                      {line}
                    </div>
                  ))}

                  <div className="pt-3 border-t border-stone-800/80 mt-4 text-[11px] text-stone-400">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-1.5 py-0.5 bg-stone-800 text-white rounded text-[10px] font-bold">
                        ttyd web terminal active
                      </span>
                      <span>URL: <a href={activeSession.ttydUrl} target="_blank" rel="noreferrer" className="text-sky-400 underline">{activeSession.ttydUrl}</a></span>
                    </div>
                    <p className="text-stone-500 font-sans text-xs">
                      Runs the native <strong>Antigravity CLI (agy)</strong> inside this isolated container with complete access to git, workspace files, Playwright MCP, and Google Gemini models.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-500">
              <div>
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm uppercase tracking-wider font-bold">No Active agy Session</p>
                <p className="text-xs mt-1">Create a new container session or launch one from the GitHub Project tasks on the right.</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel: Connected GitHub Project #1 Tasks Tracker */}
        <aside className="w-80 border-l border-[#1A1D1A] bg-[#FAF8F3] flex flex-col">
          <div className="p-3 border-b border-[#1A1D1A]/20 bg-[#EDE8DC]/50 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <GitPullRequest className="w-3.5 h-3.5 text-[#1A1D1A]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                GitHub Project #1 Roadmap
              </span>
            </div>
            {onNavigateToProjects && (
              <button
                onClick={onNavigateToProjects}
                className="text-[9px] text-[#1A1D1A] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
              >
                <span>Full Hub</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Project Items List with 1-Click agy Launch */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {projectItems.map((item) => {
              const isAssigned = !!item.assignedSessionId;
              return (
                <div
                  key={item.id}
                  className="p-3 border border-[#1A1D1A]/40 bg-white shadow-[2px_2px_0px_#1A1D1A] flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-[9px]">
                    <span
                      className={`px-1.5 py-0.5 font-bold uppercase border ${
                        item.status === 'Done'
                          ? 'bg-emerald-100 border-emerald-700 text-emerald-800'
                          : item.status === 'In Progress'
                          ? 'bg-amber-100 border-amber-700 text-amber-800'
                          : 'bg-stone-100 border-stone-400 text-stone-700'
                      }`}
                    >
                      {item.status}
                    </span>

                    {item.milestoneTitle && (
                      <span className="text-stone-500 truncate max-w-[120px]">
                        {item.milestoneTitle}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold leading-tight line-clamp-2">
                    {item.title}
                  </h3>

                  {item.body && (
                    <p className="text-[10px] text-[#1A1D1A]/70 line-clamp-2 font-sans">
                      {item.body}
                    </p>
                  )}

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[9px]">
                    {item.labels.length > 0 && (
                      <div className="flex gap-1">
                        {item.labels.slice(0, 2).map((lbl) => (
                          <span key={lbl} className="px-1 py-0.5 bg-stone-100 border border-stone-300 text-stone-600">
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Launch Session Action */}
                    <button
                      onClick={() => handleLaunchSessionForIssue(item)}
                      className="px-2 py-1 bg-[#1A1D1A] hover:bg-[#333] text-[#FAF8F3] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_#1A1D1A]"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>{isAssigned ? 'Attach agy' : 'Launch agy'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Modal: Create New Antigravity Container Session */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md border-2 border-[#1A1D1A] bg-[#FAF8F3] p-6 shadow-[6px_6px_0px_#1A1D1A]">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-[#1A1D1A] pb-2 mb-4 flex items-center justify-between">
              <span>Launch Isolated agy Session</span>
              <span className="text-[10px] bg-[#EDE8DC] border border-[#1A1D1A] px-2 py-0.5">
                CONTAINERIZED
              </span>
            </h2>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Session Identifier / Worktree Name
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. issue-98-cve or research-nebula"
                  autoFocus
                  required
                  className="w-full bg-white border border-[#1A1D1A] px-3 py-2 text-xs focus:outline-none shadow-[inset_1px_1px_2px_rgba(0,0,0,0.06)]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Target Execution Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSessionEnv('local_docker')}
                    className={`p-2.5 border text-left cursor-pointer transition-all ${
                      newSessionEnv === 'local_docker'
                        ? 'bg-[#1A1D1A] text-white border-[#1A1D1A] font-bold shadow-[2px_2px_0px_#1A1D1A]'
                        : 'bg-white border-[#1A1D1A]/50 hover:border-[#1A1D1A]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span className="text-xs uppercase">Local Docker</span>
                    </div>
                    <span className="text-[9px] opacity-80 block font-normal">
                      Runs locally on host via Docker with fast volume bind mounts.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewSessionEnv('cloud_run')}
                    className={`p-2.5 border text-left cursor-pointer transition-all ${
                      newSessionEnv === 'cloud_run'
                        ? 'bg-[#1A1D1A] text-white border-[#1A1D1A] font-bold shadow-[2px_2px_0px_#1A1D1A]'
                        : 'bg-white border-[#1A1D1A]/50 hover:border-[#1A1D1A]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Cloud className="w-3.5 h-3.5" />
                      <span className="text-xs uppercase">Cloud Run</span>
                    </div>
                    <span className="text-[9px] opacity-80 block font-normal">
                      Serverless container in GCP asia-southeast1 with GCS persistence.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Bind to GitHub Project Task (Optional)
                </label>
                <select
                  value={selectedIssueNumber || ''}
                  onChange={(e) => setSelectedIssueNumber(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-white border border-[#1A1D1A] px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">-- No explicit task binding --</option>
                  {projectItems.map((item) => (
                    <option key={item.id} value={item.issueNumber}>
                      #{item.issueNumber}: {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1A1D1A]/20">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 border border-[#1A1D1A] bg-white text-xs font-bold uppercase hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1D1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#1A1D1A] cursor-pointer"
                >
                  Launch Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
