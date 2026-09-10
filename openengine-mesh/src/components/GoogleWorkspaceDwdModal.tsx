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
  const [delegatedEmail, setDelegatedEmail] = useState(status.delegated_user || 'j.sadol@bbs.ac.th');
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
      defaultPrompt: 'Conduct deep research on multi-agent petri orchestration patterns and synthesize findings into Google Docs.',
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
      defaultPrompt: 'Draft technical architecture release post for distributed Tauri v2 petri app and export to Google Docs.',
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
      <div className="bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-800 font-sans">
        {/* Header */}
        <div className="border-b border-stone-200/80 p-5 flex items-center justify-between bg-stone-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-stone-100 border border-stone-200">
              <Layers className="w-4 h-4 text-stone-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-stone-900 flex items-center space-x-2">
                <span>Google Workspace Domain-Wide Delegation</span>
                {status.is_configured ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-sans bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-sans bg-stone-100 text-stone-500 border border-stone-200 font-medium">
                    Ready to Connect
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-sans">
                Authorize autonomous agent teams with Google Service Account credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200/80 bg-stone-50/50 px-5 py-2 space-x-4 text-xs font-sans">
          <button
            onClick={() => setActiveTab('use_cases')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'use_cases'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
            }`}
          >
            Autonomous Use Cases (6)
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-1 border-b-2 transition-all ${
              activeTab === 'credentials'
                ? 'border-stone-900 text-stone-900 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
            }`}
          >
            Service Account Key (.json)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'use_cases' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 font-sans">
                <span>Select an autonomous goal to dispatch to the board:</span>
                <span>Active User: {status.delegated_user || delegatedEmail}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {useCaseDetails.map((uc) => (
                  <div
                    key={uc.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 hover:border-stone-400 hover:bg-stone-50 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-700">
                            {uc.icon}
                          </div>
                          <h3 className="text-xs font-semibold text-stone-900">{uc.title}</h3>
                        </div>
                        <span className="text-xs font-sans text-stone-400 font-medium">
                          DWD Ready
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">{uc.desc}</p>
                      <div className="text-xs font-sans text-stone-400 flex items-center space-x-1">
                        <span>Target:</span>
                        <span className="text-stone-700 font-medium">{uc.workspaceTarget}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectUseCase(uc.id, uc.defaultPrompt);
                        onClose();
                      }}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-sans font-medium border border-stone-200 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Dispatch Agent Goal</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-stone-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DWD Status Card */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-stone-900">Workspace Delegation Authority</span>
                  </div>
                  <span className="font-sans text-xs text-stone-500">
                    {status.project_id ? `Project: ${status.project_id}` : 'Unlinked'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-sans border-t border-stone-200/80">
                  <div>
                    <span className="text-stone-500">Service Account: </span>
                    <span className="text-stone-800 font-medium">{status.client_email || 'Not configured'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Delegated Subject: </span>
                    <span className="text-stone-800 font-medium">{status.delegated_user || delegatedEmail}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs font-sans text-stone-600 flex flex-wrap gap-1.5">
                  {status.scopes.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-stone-700">
                      {s.replace('https://www.googleapis.com/auth/', '')}
                    </span>
                  ))}
                </div>
              </div>

              {/* JSON Input Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-sans text-stone-600 font-medium">
                  <label className="flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-stone-700" />
                    <span>Service Account Credentials JSON</span>
                  </label>
                  <label className="cursor-pointer flex items-center space-x-1 text-stone-600 hover:text-stone-900">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload .json</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{\n  "type": "service_account",\n  "project_id": "your-gcp-project",\n  "private_key_id": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "petri-sa@project.iam.gserviceaccount.com"\n}`}
                  rows={7}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-sans text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              {/* Delegated User Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-stone-600 font-medium flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 text-stone-700" />
                  <span>Delegated Workspace User Email (Subject Impersonation)</span>
                </label>
                <input
                  type="email"
                  value={delegatedEmail}
                  onChange={(e) => setDelegatedEmail(e.target.value)}
                  placeholder="e.g. user@your-workspace-domain.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-sans text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-sans text-rose-700">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-sans text-emerald-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSubmitKey}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-sans font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5 text-[#0ABAB5]" />
                <span>{isSubmitting ? 'Validating Credentials...' : 'Save & Validate Credentials'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
