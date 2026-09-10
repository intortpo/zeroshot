import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  RefreshCw,
  Play,
  X,
  Eye,
  EyeOff,
  Terminal,
  Check,
} from 'lucide-react';
import {
  AiProviderConfig,
  AiProviderType,
  AgyRunResult,
} from '../../types';
import {
  loadAiProvidersConfig,
  saveAiProvidersConfig,
  testProviderConnection,
  executeAgyPrompt,
  checkAgyCliStatus,
} from '../../services/aiProviderService';

interface AiProviderMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelId?: string;
  onSelectModel?: (modelId: string, providerId?: AiProviderType, effort?: 'low' | 'medium' | 'high') => void;
}

export const AiProviderMonitorModal: React.FC<AiProviderMonitorModalProps> = ({
  isOpen,
  onClose,
  activeModelId,
  onSelectModel,
}) => {
  const [providers, setProviders] = useState<AiProviderConfig[]>(() => loadAiProvidersConfig());
  const [selectedProviderId, setSelectedProviderId] = useState<AiProviderType>('agy');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  // AGY CLI Status
  const [agyStatus, setAgyStatus] = useState<{ installed: boolean; binary_path: string; version: string }>({
    installed: true,
    binary_path: '/home/hideo/.local/bin/agy',
    version: 'agy (Google Antigravity)',
  });

  // Test Console State
  const [testPrompt, setTestPrompt] = useState<string>(
    'Summarize the bounded SQLite queue invariants in one sentence.'
  );
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<AgyRunResult | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => {
      setToastNotice((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    if (isOpen) {
      checkAgyCliStatus().then((s) => setAgyStatus(s));
    }
    if (activeModelId) {
      const found = providers.find((p) => p.models.some((m) => m.id === activeModelId));
      if (found) {
        setSelectedProviderId(found.id);
      }
    }
  }, [isOpen, activeModelId, providers]);

  const activeProvider = useMemo(() => {
    return providers.find((p) => p.id === selectedProviderId) || providers[0];
  }, [providers, selectedProviderId]);

  const activeModel = useMemo(() => {
    return (
      activeProvider.models.find((m) => m.id === activeProvider.activeModelId) ||
      activeProvider.models[0]
    );
  }, [activeProvider]);

  // Handle Model Change for Active Provider
  const handleModelChange = (modelId: string) => {
    setProviders((prev) => {
      const updated = prev.map((p) => {
        if (p.id === selectedProviderId) {
          return { ...p, activeModelId: modelId };
        }
        return p;
      });
      saveAiProvidersConfig(updated);
      return updated;
    });
  };

  // Handle Effort Tier Change
  const handleEffortChange = (effort: 'low' | 'medium' | 'high') => {
    setProviders((prev) => {
      const updated = prev.map((p) => {
        if (p.id === selectedProviderId) {
          return { ...p, selectedEffort: effort };
        }
        return p;
      });
      saveAiProvidersConfig(updated);
      return updated;
    });
  };

  // Handle Endpoint URL Change
  const handleEndpointChange = (val: string) => {
    setProviders((prev) => {
      const updated = prev.map((p) => {
        if (p.id === selectedProviderId) {
          return { ...p, endpointUrl: val };
        }
        return p;
      });
      saveAiProvidersConfig(updated);
      return updated;
    });
  };

  // Handle API Key Change
  const handleApiKeyChange = (val: string) => {
    setProviders((prev) => {
      const updated = prev.map((p) => {
        if (p.id === selectedProviderId) {
          return { ...p, apiKey: val };
        }
        return p;
      });
      saveAiProvidersConfig(updated);
      return updated;
    });
  };

  // Test Connection
  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingMessage(null);
    try {
      const res = await testProviderConnection(activeProvider.id, activeProvider.endpointUrl);
      setProviders((prev) => {
        const updated = prev.map((p) => {
          if (p.id === activeProvider.id) {
            return {
              ...p,
              status: (res.reachable ? 'connected' : 'offline') as AiProviderConfig['status'],
              latencyMs: res.latencyMs,
            };
          }
          return p;
        });
        saveAiProvidersConfig(updated);
        return updated;
      });
      setPingMessage(res.message);
      showToast(`Connection test: ${res.reachable ? 'Online' : 'Unreachable'}`);
    } catch (err: any) {
      setPingMessage(`Ping failed: ${err?.message || String(err)}`);
    } finally {
      setIsPinging(false);
    }
  };

  // Execute Test Prompt via AGY or active engine
  const handleRunTestPrompt = async () => {
    if (!testPrompt.trim()) return;
    setIsTestRunning(true);
    setTestOutput(null);
    try {
      const effort = activeProvider.selectedEffort || 'medium';
      const result = await executeAgyPrompt(activeModel.id, effort, testPrompt.trim());
      setTestOutput(result);
      showToast(`Completed test run in ${result.duration_ms}ms`);
    } catch (err: any) {
      showToast(`Test run failed: ${err?.message || String(err)}`);
    } finally {
      setIsTestRunning(false);
    }
  };

  // Set this model as workspace primary
  const handleSetAsPrimary = () => {
    const effort = activeProvider.selectedEffort || 'medium';
    onSelectModel?.(activeModel.id, activeProvider.id, effort);
    showToast(`Set ${activeModel.name} as primary orchestrator model!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  AI Models & Providers Monitoring Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AGY CLI Integrated
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Configure local Antigravity runtime, monitor health, adjust reasoning effort, and setup cloud models.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Tabs Header */}
        <div className="px-6 pt-3 border-b border-stone-200 flex items-center space-x-2 overflow-x-auto bg-stone-50/40">
          {providers.map((p) => {
            const isSelected = p.id === selectedProviderId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProviderId(p.id);
                  setPingMessage(null);
                  setTestOutput(null);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 border-b-2 font-medium text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 text-indigo-900 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    p.status === 'connected'
                      ? 'bg-emerald-500'
                      : p.status === 'degraded'
                      ? 'bg-amber-500'
                      : 'bg-stone-300'
                  }`}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Provider Overview Card */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-stone-900">{activeProvider.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      activeProvider.status === 'connected'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {activeProvider.status.toUpperCase()}
                  </span>
                  {activeProvider.latencyMs !== undefined && (
                    <span className="text-[10px] font-mono text-stone-400">
                      ({activeProvider.latencyMs}ms latency)
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{activeProvider.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isPinging}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetAsPrimary}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set as Active</span>
                </button>
              </div>
            </div>

            {pingMessage && (
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs font-mono">
                › {pingMessage}
              </div>
            )}

            {/* Provider Settings Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200/80 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 text-[11px]">
                  {activeProvider.isLocalBinary ? 'Local CLI Executable Path' : 'Provider Endpoint URL'}
                </label>
                <input
                  type="text"
                  value={activeProvider.endpointUrl}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {!activeProvider.isLocalBinary && (
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 text-[11px] flex items-center justify-between">
                    <span>API Token / Secret Key</span>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-stone-400 hover:text-stone-600 text-[10px] flex items-center space-x-1"
                    >
                      {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showApiKey ? 'Hide' : 'Show'}</span>
                    </button>
                  </label>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={activeProvider.apiKey || ''}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-live-... or ghp_..."
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Model Selection & Reasoning Effort Config */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
                  Model Catalog & Reasoning Parameters
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Select model to drive autonomous code generation, invariants, and plan synthesis.
                </p>
              </div>
            </div>

            {/* Model Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeProvider.models.map((m) => {
                const isModelSelected = m.id === activeProvider.activeModelId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModelChange(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isModelSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900 leading-tight">
                          {m.name}
                        </span>
                        {isModelSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 leading-snug line-clamp-2">
                        {m.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 pt-1 border-t border-stone-100">
                      <span>{(m.contextWindowTokens / 1024).toFixed(0)}k ctx</span>
                      <span className="capitalize">{m.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reasoning Effort Tier Config (if supported by model) */}
            {activeModel.reasoningEffortSupported && (
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-stone-800">Reasoning Effort Tier</span>
                  <p className="text-[11px] text-stone-500">
                    Controls token budget and depth for chain-of-thought exploration in AGY.
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  {(['low', 'medium', 'high'] as const).map((tier) => {
                    const isTierSelected = (activeProvider.selectedEffort || 'medium') === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleEffortChange(tier)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                          isTierSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Test Console */}
          <div className="p-5 rounded-2xl bg-stone-900 text-stone-100 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-stone-200">
                  Interactive AI Test Runner ({activeModel.name})
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">
                Command: {activeProvider.id === 'agy' ? `agy --model ${activeModel.id} -p` : 'API POST'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunTestPrompt();
                }}
                placeholder="Enter prompt to execute via AGY CLI..."
                className="flex-1 px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-xs font-mono text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                type="button"
                disabled={isTestRunning || !testPrompt.trim()}
                onClick={handleRunTestPrompt}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {isTestRunning ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Execution Output Console */}
            {testOutput && (
              <div className="mt-3 p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono space-y-2 max-h-52 overflow-y-auto">
                <div className="flex items-center justify-between text-[10px] text-stone-500 pb-1 border-b border-stone-800">
                  <span>Model: {testOutput.model_used}</span>
                  <span>
                    Exit: {testOutput.exit_code} · Duration: {testOutput.duration_ms}ms · Tokens:{' '}
                    {testOutput.tokens_estimated}
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-stone-200 leading-relaxed text-[11px]">
                  {testOutput.stdout}
                </div>
                {testOutput.stderr && (
                  <div className="whitespace-pre-wrap text-rose-400 leading-relaxed text-[10px]">
                    {testOutput.stderr}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 flex items-center justify-between bg-stone-50 text-xs">
          <div className="flex items-center space-x-2 text-stone-500">
            <span>AGY Binary:</span>
            <span className="font-mono font-semibold text-stone-800">{agyStatus.binary_path}</span>
          </div>

          <div className="flex items-center space-x-2">
            {toastNotice && (
              <span className="text-emerald-700 font-medium animate-in fade-in mr-2">
                {toastNotice}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
