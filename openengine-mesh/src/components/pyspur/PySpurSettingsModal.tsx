import React, { useState, useEffect } from 'react';
import { Settings, X, Eye, EyeOff, Check } from 'lucide-react';

export type PySpurLlmProvider = 'OpenAI' | 'Anthropic' | 'Gemini';

export interface PySpurSettings {
  apiUrl: string;
  llmProvider: PySpurLlmProvider;
  apiKey: string;
}

export const PYSPUR_SETTINGS_STORAGE_KEY = 'petri_pyspur_settings_v1';

export const DEFAULT_PYSPUR_SETTINGS: PySpurSettings = {
  apiUrl: 'http://127.0.0.1:8000',
  llmProvider: 'OpenAI',
  apiKey: '',
};

export function loadStoredPySpurSettings(): PySpurSettings {
  if (typeof window === 'undefined') return DEFAULT_PYSPUR_SETTINGS;
  try {
    const raw = localStorage.getItem(PYSPUR_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PYSPUR_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      apiUrl: parsed.apiUrl || DEFAULT_PYSPUR_SETTINGS.apiUrl,
      llmProvider: parsed.llmProvider || DEFAULT_PYSPUR_SETTINGS.llmProvider,
      apiKey: parsed.apiKey || '',
    };
  } catch {
    return DEFAULT_PYSPUR_SETTINGS;
  }
}

export interface PySpurSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: PySpurSettings) => void;
}

export const PySpurSettingsModal: React.FC<PySpurSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [apiUrl, setApiUrl] = useState(DEFAULT_PYSPUR_SETTINGS.apiUrl);
  const [llmProvider, setLlmProvider] = useState<PySpurLlmProvider>(DEFAULT_PYSPUR_SETTINGS.llmProvider);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = loadStoredPySpurSettings();
      setApiUrl(stored.apiUrl);
      setLlmProvider(stored.llmProvider);
      setApiKey(stored.apiKey);
      setIsSaved(false);
    }
  }, [isOpen]);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: PySpurSettings = {
      apiUrl: apiUrl.trim() || DEFAULT_PYSPUR_SETTINGS.apiUrl,
      llmProvider,
      apiKey: apiKey.trim(),
    };

    try {
      localStorage.setItem(PYSPUR_SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      window.dispatchEvent(
        new CustomEvent('petri_pyspur_settings_updated', {
          detail: updatedSettings,
        })
      );
    } catch (err) {
      console.error('Failed to save PySpur settings:', err);
    }

    if (onSave) {
      onSave(updatedSettings);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pyspur-settings-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 flex flex-col font-sans transition-all transform scale-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 id="pyspur-settings-title" className="text-base font-semibold text-slate-900">
                PySpur Settings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your local PySpur runtime and model provider.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
          {/* PySpur API URL */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pyspur-api-url" className="text-xs font-medium text-slate-700">
              PySpur API URL
            </label>
            <input
              id="pyspur-api-url"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
            />
            <span className="text-[11px] text-slate-400">
              Default local PySpur container endpoint.
            </span>
          </div>

          {/* LLM Provider */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pyspur-llm-provider" className="text-xs font-medium text-slate-700">
              LLM Provider
            </label>
            <div className="relative">
              <select
                id="pyspur-llm-provider"
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value as PySpurLlmProvider)}
                className="w-full appearance-none px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors cursor-pointer"
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Anthropic">Anthropic</option>
                <option value="Gemini">Gemini</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pyspur-api-key" className="text-xs font-medium text-slate-700">
              API Key
            </label>
            <div className="relative">
              <input
                id="pyspur-api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              API credentials are kept secure in local workspace storage.
            </span>
          </div>

          {/* Actions */}
          <div className="mt-3 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-black rounded-lg transition-colors shadow-sm active:scale-[0.98]"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
