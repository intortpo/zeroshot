import React, { useState } from 'react';
import {
  Terminal,
  Cloud,
  Cpu,
  Plus,
  Play,
  Square,
  Trash2,
  GitPullRequest,
  Shield,
  Send,
  RefreshCw
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
  onNavigateToProjects: _onNavigateToProjects,
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

  // Chat State
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agy'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

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

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        { role: 'agy', content: `Executing agy command for: "${userMessage}"...` }
      ]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <header className="relative z-10 border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-semibold text-slate-900">
                Antigravity Cloud Run
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Isolated Antigravity CLI sessions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-slate-600">Gateway:</span>
            <span className="text-emerald-700 font-medium">
              {cosmosAuthService.isBehindCosmos() ? 'Protected' : 'Secure'}
            </span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>Sessions ({sessions.length})</span>
            </span>
            <button
              onClick={refreshSessions}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
              title="Refresh sessions"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sessions.map((sess) => {
              const isSelected = sess.id === activeSession?.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-200 bg-blue-50 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sess.status === 'running'
                            ? 'bg-emerald-500'
                            : sess.status === 'starting'
                            ? 'bg-amber-400'
                            : 'bg-slate-300'
                        }`}
                      />
                      <span className="text-sm font-medium text-slate-900 truncate max-w-[130px]">
                        {sess.name}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-500 font-medium">
                      {sess.envType === 'cloud_run' ? 'Cloud' : 'Local'}
                    </span>
                  </div>

                  {sess.taskTitle && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {sess.taskTitle}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {activeSession ? (
            <>
              <div className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-slate-900">
                    {activeSession.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                    {activeSession.envType === 'cloud_run' ? 'Cloud Run' : 'Docker Engine'}
                  </span>
                  {activeSession.githubIssueNumber && (
                    <a
                      href={activeSession.githubIssueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Issue #{activeSession.githubIssueNumber}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  {activeSession.status === 'running' ? (
                    <button
                      onClick={() => antigravityCloudService.stopSession(activeSession.id).then(refreshSessions)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => antigravityCloudService.startSession(activeSession.id).then(refreshSessions)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer border border-emerald-200"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      antigravityCloudService.deleteSession(activeSession.id);
                      refreshSessions();
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 flex-col">
                    <Terminal className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Start a conversation with Agy in {activeSession.name}</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Message Agy..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none max-h-32"
                      rows={1}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl shadow-sm transition-colors mb-[2px] cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
              <div>
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-base font-medium text-slate-600">No Active Session</p>
                <p className="text-sm mt-1">Create a new session to start chatting with Agy.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                New Session
              </h2>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. issue-98-cve"
                  autoFocus
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewSessionEnv('local_docker')}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      newSessionEnv === 'local_docker'
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className={`w-4 h-4 ${newSessionEnv === 'local_docker' ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className={`text-sm font-medium ${newSessionEnv === 'local_docker' ? 'text-blue-900' : 'text-slate-700'}`}>Local Docker</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewSessionEnv('cloud_run')}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      newSessionEnv === 'cloud_run'
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Cloud className={`w-4 h-4 ${newSessionEnv === 'cloud_run' ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span className={`text-sm font-medium ${newSessionEnv === 'cloud_run' ? 'text-blue-900' : 'text-slate-700'}`}>Cloud Run</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Link Issue (Optional)
                </label>
                <select
                  value={selectedIssueNumber || ''}
                  onChange={(e) => setSelectedIssueNumber(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- No issue --</option>
                  {projectItems.map((item) => (
                    <option key={item.id} value={item.issueNumber}>
                      #{item.issueNumber}: {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
