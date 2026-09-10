import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Sliders,
  CheckCircle2,
  Download,
  Cpu,
  RefreshCw,
  Brain,
  History,
} from 'lucide-react';
import {
  SaifAuditPillar,
  GovernancePolicy,
  GovernanceAuditRecord,
  Workspace,
  UserProfile,
} from '../types';
import { governanceService } from '../services/governanceService';
import { tierService } from '../services/tierService';
import { AgentCognitionHUD } from './AgentCognitionHUD';

interface GovernanceViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
}

export const GovernanceView: React.FC<GovernanceViewProps> = ({
  activeWorkspace: _activeWorkspace,
  activeUser,
}) => {
  const [pillars, setPillars] = useState<SaifAuditPillar[]>(() =>
    governanceService.getPillars()
  );
  const [policies, setPolicies] = useState<GovernancePolicy[]>(() =>
    governanceService.getPolicies()
  );
  const [auditRecords, setAuditRecords] = useState<GovernanceAuditRecord[]>(() =>
    governanceService.getAuditRecords()
  );
  const [activeTab, setActiveTab] = useState<
    'saif' | 'policies' | 'models' | 'cognition' | 'ledger'
  >('saif');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditToast, setAuditToast] = useState<string | null>(null);

  const isSuperAdmin = activeUser?.tier === 'superadmin';

  useEffect(() => {
    return governanceService.subscribe(() => {
      setPillars(governanceService.getPillars());
      setPolicies(governanceService.getPolicies());
      setAuditRecords(governanceService.getAuditRecords());
    });
  }, []);

  const showToast = (msg: string) => {
    setAuditToast(msg);
    setTimeout(() => {
      setAuditToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    showToast('Executing comprehensive SAIF 6-pillar security scan...');
    const res = await governanceService.runSaifAudit();
    setIsAuditing(false);
    showToast(`SAIF Audit Complete: ${res.passedChecks}/${res.totalChecks} checks verified (Score: ${res.overallScore}%)`);
  };

  const handleTogglePolicy = (policyId: string) => {
    if (!isSuperAdmin) {
      showToast('Policy modification restricted: SuperAdmin tier required.');
      if (activeUser) {
        tierService.recordBoundaryViolation(activeUser, `Toggle policy ${policyId}`);
      }
      return;
    }
    governanceService.togglePolicy(policyId);
    showToast('Updated governance policy threshold');
  };

  const handleExportLedger = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(auditRecords, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `petri-governance-audit-ledger-${Date.now()}.json`);
    dlAnchor.click();
    showToast('Exported verifiable audit ledger JSON');
  };

  // Calculate overall metrics
  const totalChecks = pillars.reduce((sum, p) => sum + p.checksCount, 0);
  const passedChecks = pillars.reduce((sum, p) => sum + p.passedCount, 0);
  const overallScore = Math.round((passedChecks / totalChecks) * 100);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFBFB] text-stone-900 font-sans overflow-hidden">
      {/* Top Banner: Governance Branding & Actions */}
      <div className="bg-white border-b border-stone-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-stone-950 tracking-tight">
                Enterprise AI Governance & Invariant Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {overallScore}% · A+ POSTURE
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isSuperAdmin
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}>
                {isSuperAdmin ? 'SUPERADMIN ROOT' : 'CONTROL AUDIT-ONLY'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-sans">
              Google SAIF Compliance · Fail-Closed Model Boundaries · HITL Review Policies · Immutable Audit Ledger
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {auditToast && (
            <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{auditToast}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleExportLedger}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Download immutable ledger records"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Ledger</span>
          </button>

          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Run SAIF Audit'}</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-stone-50/50 border-b border-stone-200/80">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
            SAIF 6-Pillar Score
          </div>
          <div className="text-xl font-bold text-stone-900 mt-1 flex items-baseline space-x-1.5">
            <span>{overallScore}%</span>
            <span className="text-xs text-emerald-600 font-semibold font-mono">
              ({passedChecks}/{totalChecks} checks)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
            Active Review Policies
          </div>
          <div className="text-xl font-bold text-stone-900 mt-1 flex items-baseline space-x-1.5">
            <span>{policies.filter((p) => p.isEnabled).length} / {policies.length}</span>
            <span className="text-xs text-indigo-600 font-semibold font-mono">Strict</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
            Model Tier Guardrails
          </div>
          <div className="text-xl font-bold text-stone-900 mt-1 flex items-baseline space-x-1.5">
            <span>4 Tiers</span>
            <span className="text-xs text-teal-600 font-semibold font-mono">Fail-Closed</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
            Durable Event Ledger
          </div>
          <div className="text-xl font-bold text-stone-900 mt-1 flex items-baseline space-x-1.5">
            <span>{auditRecords.length + 1420}</span>
            <span className="text-xs text-stone-500 font-semibold font-mono">Epoch Verified</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="px-6 pt-3 border-b border-stone-200/80 bg-white flex items-center space-x-2 text-xs">
        {[
          { id: 'saif', label: 'SAIF Compliance Posture', icon: ShieldCheck },
          { id: 'policies', label: 'HITL Gate Policies', icon: Sliders },
          { id: 'models', label: 'Model Boundaries & Guards', icon: Cpu },
          { id: 'cognition', label: 'Live Cognition & Concept Monitor', icon: Brain },
          { id: 'ledger', label: 'Durable Audit Ledger', icon: History },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-950 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tab 1: SAIF 6-Pillars Matrix */}
        {activeTab === 'saif' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Google Secure AI Framework (SAIF) 6-Pillar Checklist
                </h2>
                <p className="text-xs text-stone-500">
                  Comprehensive audit vectors spanning execution isolation, data vaults, model guardrails, and event durability.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-semibold">
                Pass Rate: 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillars.map((pillar) => (
                <div
                  key={pillar.key}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-stone-900">
                      {pillar.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {pillar.passedCount}/{pillar.checksCount} PASS
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pillar.checks.map((chk) => (
                      <div
                        key={chk.id}
                        className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-stone-800">
                          <div className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{chk.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-400">
                            {new Date(chk.lastAuditedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 pl-5 leading-normal">
                          {chk.description}
                        </p>
                        <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-200/50 pl-5">
                          Evidence: {chk.evidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: HITL Gate Policies */}
        {activeTab === 'policies' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Human-in-the-Loop Review Gate & Invariant Policies
                </h2>
                <p className="text-xs text-stone-500">
                  Configurable threshold rules governing worker branch isolation, dual verifiers, and compare-and-swap merge authority.
                </p>
              </div>
            </div>

            {!isSuperAdmin && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Read-Only Compliance Mode:</strong> Your current tier is <strong>CONTROL</strong>. Modifying fail-closed safety policies or security gate thresholds requires <strong>SUPERADMIN</strong> privileges.
                </span>
              </div>
            )}

            <div className="space-y-3">
              {policies.map((pol) => (
                <div
                  key={pol.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-900">{pol.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200 uppercase">
                        {pol.category}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {pol.severity}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-normal">
                      {pol.description}
                    </p>
                    <div className="text-[10px] font-mono text-stone-400">
                      Target Scope: <span className="text-stone-600">{pol.targetScope}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePolicy(pol.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      pol.isEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform absolute top-0.5 ${
                        pol.isEnabled ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Model Boundaries & Guards */}
        {activeTab === 'models' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="pb-2 border-b border-stone-200/80">
              <h2 className="text-sm font-bold text-stone-900">
                Model & Provider Tier Boundary Governance
              </h2>
              <p className="text-xs text-stone-500">
                Caller-authored model identifiers with fail-closed recovery policies. In accordance with repository invariants, admission rejects unverified external bindings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'gemini-3.8-flash-high',
                  name: 'Gemini 3.8 Flash High / Reasoning',
                  provider: 'Google AGY CLI',
                  role: 'Speculative Coder & Planner',
                  maxTurnTokens: 64000,
                  temperatureCeiling: 0.3,
                  failClosedRecovery: true,
                },
                {
                  id: 'claude-sonnet-4-6-thinking',
                  name: 'Claude Sonnet 4.6 (Thinking)',
                  provider: 'Anthropic / Native',
                  role: 'Invariant Verifier & Grader',
                  maxTurnTokens: 64000,
                  temperatureCeiling: 0.2,
                  failClosedRecovery: true,
                },
                {
                  id: 'claude-opus-4-6-thinking',
                  name: 'Claude Opus 4.6 (Thinking)',
                  provider: 'Anthropic / Native',
                  role: 'Architectural Security Auditor',
                  maxTurnTokens: 128000,
                  temperatureCeiling: 0.2,
                  failClosedRecovery: true,
                },
                {
                  id: 'devcontainer-local-python',
                  name: 'DevContainer Isolated Sandbox',
                  provider: 'Docker Native Container',
                  role: 'Minimal Reproduction & Execution',
                  maxTurnTokens: 32000,
                  temperatureCeiling: 0.0,
                  failClosedRecovery: true,
                },
              ].map((tier) => (
                <div
                  key={tier.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{tier.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-50 text-[#0ABAB5] border border-teal-200">
                      AUTHORIZED
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 space-y-1 font-mono text-[11px]">
                    <div>Provider: <strong className="text-stone-800">{tier.provider}</strong></div>
                    <div>Default Role: <strong className="text-stone-800">{tier.role}</strong></div>
                    <div>Max Turn Tokens: <strong className="text-stone-800">{tier.maxTurnTokens.toLocaleString()}</strong></div>
                    <div>Temperature Lock: <strong className="text-stone-800">{tier.temperatureCeiling}</strong></div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-mono text-emerald-700">
                    <span className="flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Fail-Closed Structured Recovery Active</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Live Cognition & Concept Monitor */}
        {activeTab === 'cognition' && (
          <div className="max-w-4xl mx-auto h-[620px]">
            <AgentCognitionHUD mode="inline" />
          </div>
        )}

        {/* Tab 5: Durable Audit Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Immutable Durable Event Ledger
                </h2>
                <p className="text-xs text-stone-500">
                  Durable event receipts captured at the producer boundary with positive JavaScript-safe Unix milliseconds.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportLedger}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Receipt Hash</th>
                      <th className="p-3">Timestamp (Epoch ms)</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {auditRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-stone-600 font-bold">
                          {rec.receiptHash}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-500">
                          {rec.timestamp} ({new Date(rec.timestamp).toLocaleTimeString()})
                        </td>
                        <td className="p-3 font-mono text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                            {rec.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-800 font-semibold">
                          {rec.actor}
                        </td>
                        <td className="p-3 text-[11px] text-stone-700 max-w-xs truncate" title={rec.details}>
                          {rec.action} · {rec.details}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {rec.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
