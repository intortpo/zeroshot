import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Search,
  Code2,
  PenTool,
  BarChart3,
  Bot,
  Cog,
  UploadCloud,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { GoogleDwdStatus } from '../types';

interface GoogleWorkspaceDwdModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GoogleDwdStatus;
  onLoadCredentials: (jsonContent: string, delegatedUser?: string) => Promise<GoogleDwdStatus | void>;
  onSelectUseCase: (useCaseId: string, prompt: string) => void;
}

export const GoogleWorkspaceDwdModal: React.FC<GoogleWorkspaceDwdModalProps> = ({
  isOpen,
  onClose,
  status,
  onLoadCredentials,
  onSelectUseCase,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [delegatedEmail, setDelegatedEmail] = useState(status.delegated_user || 'intortpo@gmail.com');
  const [activeTab, setActiveTab] = useState<'use_cases' | 'credentials'>('use_cases');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonInput(text);
      try {
        const parsed = JSON.parse(text);
        if (parsed.client_email) {
          setErrorMsg(null);
        }
      } catch {
        setErrorMsg('Invalid JSON format in uploaded file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitKey = async () => {
    if (!jsonInput.trim()) {
      setErrorMsg('Please paste or upload a Google Service Account .json key.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onLoadCredentials(jsonInput, delegatedEmail);
      setSuccessMsg('Google DWD credentials validated and activated successfully.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const useCaseDetails = [
    {
      id: 'research',
      title: 'Research & Analysis',
      icon: <Search className="w-4 h-4 text-[#e5e5e5]" />,
      desc: 'Conduct deep research, gather information, and generate insights from multiple sources automatically',
      workspaceTarget: 'Google Docs & Drive Synthesis Brief',
      defaultPrompt: 'Conduct deep research on multi-agent mesh orchestration patterns and synthesize findings into Google Docs.',
    },
    {
      id: 'code',
      title: 'Code Generation',
      icon: <Code2 className="w-4 h-4 text-[#e5e5e5]" />,
      desc: 'Write, debug, and refactor code with AI agents that understand your codebase and requirements',
      workspaceTarget: 'Repository Trunk, Testkit & Gated PR Delivery',
      defaultPrompt: 'Refactor background task scheduler to support bounded async backpressure and parallel verifiers.',
    },
    {
      id: 'content',
      title: 'Content Creation',
      icon: <PenTool className="w-4 h-4 text-[#e5e5e5]" />,
      desc: 'Generate blog posts, documentation, marketing copy, and technical writing with multi-agent teams',
      workspaceTarget: 'Google Docs Collaborative Publisher',
      defaultPrompt: 'Draft technical architecture release post for distributed Tauri v2 mesh app and export to Google Docs.',
    },
    {
      id: 'data_pipelines',
      title: 'Data Pipelines',
      icon: <BarChart3 className="w-4 h-4 text-[#e5e5e5]" />,
      desc: 'Extract, transform, and analyze data from APIs, databases, and web sources automatically',
      workspaceTarget: 'Google Sheets & BigQuery Live Feed',
      defaultPrompt: 'Extract peer node latency and RTX compute utilization telemetry, appending rows to Google Sheets.',
    },
    {
      id: 'customer_support',
      title: 'Customer Support',
      icon: <Bot className="w-4 h-4 text-[#e5e5e5]" />,
      desc: 'Deploy 24/7 support bots on Telegram, Discord, Slack with memory and knowledge-backed responses',
      workspaceTarget: 'Gmail & Team Inquiry Inbox',
      defaultPrompt: 'Triage customer inquiries from support inbox, draft citations, and stage resolution drafts in Gmail.',
    },
    {
      id: 'workflow_automation',
      title: 'Workflow Automation',
      icon: <Cog className="w-4 h-4 text-[#e5e5e5]" />,
      desc: 'Automate multi-step business processes with agents that hand off tasks, verify results, and self-correct',
      workspaceTarget: 'End-to-End Cross-Service Workflow Coordinator',
      defaultPrompt: 'Coordinate multi-step verification pipeline: auto-run test suite, trigger gate review, and notify team.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0b0b] border border-[#222222] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e0e0e0] font-sans">
        {/* Header */}
        <div className="border-b border-[#1c1c1c] p-5 flex items-center justify-between bg-[#0e0e0e]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#171717] border border-[#262626]">
              <Layers className="w-4 h-4 text-[#f5f5f5]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#f5f5f5] flex items-center space-x-2">
                <span>Google Workspace & Domain-Wide Delegation (DWD)</span>
                {status.is_configured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#161616] text-[#a3a3a3] border border-[#2e2e2e]">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#171717] text-[#737373] border border-[#262626]">
                    Ready to Connect
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#737373] mt-0.5 font-mono">
                Authorize multi-agent teams with Google Service Account .json credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#737373] hover:text-[#f5f5f5] hover:bg-[#1c1c1c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1c1c1c] bg-[#090909] px-5 py-2 space-x-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('use_cases')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'use_cases'
                ? 'border-[#f5f5f5] text-[#f5f5f5] font-medium'
                : 'border-transparent text-[#737373] hover:text-[#a3a3a3]'
            }`}
          >
            Autonomous Use Cases (6)
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'credentials'
                ? 'border-[#f5f5f5] text-[#f5f5f5] font-medium'
                : 'border-transparent text-[#737373] hover:text-[#a3a3a3]'
            }`}
          >
            DWD Service Account Key (.json)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'use_cases' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#737373] font-mono">
                <span>Select a use case to dispatch into the mesh:</span>
                <span>Active DWD User: {status.delegated_user || delegatedEmail}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {useCaseDetails.map((uc) => (
                  <div
                    key={uc.id}
                    className="p-4 rounded-lg border border-[#1c1c1c] bg-[#0e0e0e] hover:border-[#2e2e2e] hover:bg-[#121212] transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded bg-[#171717] border border-[#222]">
                            {uc.icon}
                          </div>
                          <h3 className="text-xs font-medium text-[#f5f5f5]">{uc.title}</h3>
                        </div>
                        <span className="text-[10px] font-mono text-[#737373] group-hover:text-[#a3a3a3] transition-colors">
                          DWD Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] leading-relaxed">{uc.desc}</p>
                      <div className="text-[10px] font-mono text-[#525252] flex items-center space-x-1">
                        <span>Target:</span>
                        <span className="text-[#a3a3a3]">{uc.workspaceTarget}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectUseCase(uc.id, uc.defaultPrompt);
                        onClose();
                      }}
                      className="mt-3 w-full py-1.5 px-3 rounded bg-[#171717] hover:bg-[#222222] text-[#f5f5f5] text-[11px] font-mono border border-[#262626] transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Dispatch Agent Goal</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#737373]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DWD Status Card */}
              <div className="p-4 rounded-lg border border-[#1c1c1c] bg-[#0e0e0e] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#a3a3a3]" />
                    <span className="font-medium text-[#f5f5f5]">Google Workspace DWD Authority</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#737373]">
                    {status.project_id ? `Project: ${status.project_id}` : 'Unlinked'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-mono border-t border-[#171717]">
                  <div>
                    <span className="text-[#525252]">Service Account: </span>
                    <span className="text-[#a3a3a3]">{status.client_email || 'Not configured'}</span>
                  </div>
                  <div>
                    <span className="text-[#525252]">Delegated Subject: </span>
                    <span className="text-[#a3a3a3]">{status.delegated_user || delegatedEmail}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] font-mono text-[#525252] flex flex-wrap gap-1.5">
                  {status.scopes.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#141414] border border-[#1f1f1f] text-[#8e8e8e]">
                      {s.replace('https://www.googleapis.com/auth/', '')}
                    </span>
                  ))}
                </div>
              </div>

              {/* JSON Input Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#737373]">
                  <label className="flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Service Account Credentials JSON</span>
                  </label>
                  <label className="cursor-pointer flex items-center space-x-1 text-[#a3a3a3] hover:text-[#f5f5f5]">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload .json</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{\n  "type": "service_account",\n  "project_id": "your-gcp-project",\n  "private_key_id": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "mesh-sa@project.iam.gserviceaccount.com"\n}`}
                  rows={7}
                  className="w-full bg-[#080808] border border-[#1c1c1c] rounded-lg p-3 text-xs font-mono text-[#e0e0e0] placeholder-[#404040] focus:outline-none focus:border-[#333333] transition-colors"
                />
              </div>

              {/* Delegated User Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#737373] flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Delegated Workspace User Email (Subject Impersonation)</span>
                </label>
                <input
                  type="email"
                  value={delegatedEmail}
                  onChange={(e) => setDelegatedEmail(e.target.value)}
                  placeholder="e.g. user@your-workspace-domain.com"
                  className="w-full bg-[#080808] border border-[#1c1c1c] rounded-lg px-3 py-2 text-xs font-mono text-[#e0e0e0] placeholder-[#404040] focus:outline-none focus:border-[#333333] transition-colors"
                />
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-[#1a0f0f] border border-[#3d1a1a] text-xs font-mono text-[#f87171]">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-lg bg-[#0f1a12] border border-[#1a3d22] text-xs font-mono text-[#4ade80] flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSubmitKey}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#1c1c1c] hover:bg-[#262626] text-[#f5f5f5] text-xs font-mono font-medium border border-[#2e2e2e] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5 text-[#a3a3a3]" />
                <span>{isSubmitting ? 'Validating DWD Key...' : 'Connect & Validate DWD Key'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
