import React, { useState } from 'react';
import {
  Sparkles,
  Bug,
  AlertCircle,
  Milestone,
  ArrowRight,
} from 'lucide-react';
import { PetriItemKind } from '../types';

interface PetriIntentBarProps {
  onSubmitIntent: (title: string, kind: PetriItemKind) => Promise<void> | void;
}

export const PetriIntentBar: React.FC<PetriIntentBarProps> = ({ onSubmitIntent }) => {
  const [intent, setIntent] = useState('');
  const [selectedKind, setSelectedKind] = useState<PetriItemKind>('feat');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect intent kind if user starts typing prefix
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIntent(val);

    const lower = val.toLowerCase();
    if (lower.startsWith('bug:') || lower.startsWith('fix:')) {
      setSelectedKind('bug');
    } else if (lower.startsWith('issue:') || lower.startsWith('why:') || lower.startsWith('inquiry:')) {
      setSelectedKind('issue');
    } else if (lower.startsWith('feat:') || lower.startsWith('add:') || lower.startsWith('new:')) {
      setSelectedKind('feat');
    } else if (lower.startsWith('mile:') || lower.startsWith('epic:') || lower.startsWith('release:')) {
      setSelectedKind('mile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim() || isSubmitting) return;

    // Clean prefix if explicitly typed
    let cleanTitle = intent.trim();
    if (cleanTitle.toLowerCase().startsWith('bug:') || cleanTitle.toLowerCase().startsWith('fix:')) {
      cleanTitle = cleanTitle.substring(cleanTitle.indexOf(':') + 1).trim();
    } else if (cleanTitle.toLowerCase().startsWith('feat:') || cleanTitle.toLowerCase().startsWith('add:')) {
      cleanTitle = cleanTitle.substring(cleanTitle.indexOf(':') + 1).trim();
    } else if (cleanTitle.toLowerCase().startsWith('issue:')) {
      cleanTitle = cleanTitle.substring(cleanTitle.indexOf(':') + 1).trim();
    } else if (cleanTitle.toLowerCase().startsWith('mile:') || cleanTitle.toLowerCase().startsWith('epic:')) {
      cleanTitle = cleanTitle.substring(cleanTitle.indexOf(':') + 1).trim();
    }

    setIsSubmitting(true);
    try {
      await onSubmitIntent(cleanTitle || intent.trim(), selectedKind);
      setIntent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const KIND_SELECTORS: { kind: PetriItemKind; label: string; icon: React.ReactNode }[] = [
    { kind: 'feat', label: 'feat', icon: <Sparkles className="w-3 h-3 text-[#e5e5e5]" /> },
    { kind: 'bug', label: 'bug', icon: <Bug className="w-3 h-3 text-[#f87171]" /> },
    { kind: 'issue', label: 'issue', icon: <AlertCircle className="w-3 h-3 text-[#fbbf24]" /> },
    { kind: 'mile', label: 'mile', icon: <Milestone className="w-3 h-3 text-[#818cf8]" /> },
  ];

  return (
    <div className="w-full px-4 sm:px-6 pt-5 pb-2">
      <div className="max-w-4xl mx-auto backdrop-blur-2xl bg-[#0c0c0c]/70 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl transition-all duration-300 hover:border-white/15">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          {/* Kind Selector Pills */}
          <div className="flex items-center space-x-1 bg-[#141414]/90 p-1 rounded-xl border border-white/5 self-stretch sm:self-auto justify-center">
            {KIND_SELECTORS.map((item) => (
              <button
                key={item.kind}
                type="button"
                onClick={() => setSelectedKind(item.kind)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase font-medium transition-all ${
                  selectedKind === item.kind
                    ? 'bg-[#222222] text-[#f5f5f5] shadow-sm border border-white/10'
                    : 'text-[#737373] hover:text-[#d4d4d4]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="flex-1 relative w-full">
            <input
              value={intent}
              onChange={handleInputChange}
              placeholder="What do you want to happen or to change?"
              className="w-full bg-[#141414]/90 border border-white/5 rounded-xl px-4 py-2 text-xs sm:text-sm font-sans text-[#f5f5f5] placeholder-[#525252] focus:outline-none focus:border-white/20 transition-all font-medium"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!intent.trim() || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2 rounded-xl bg-[#f5f5f5] hover:bg-[#ffffff] text-[#0a0a0a] text-xs font-mono font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100"
          >
            <span>{isSubmitting ? 'Logging...' : 'Launch'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0a0a0a]" />
          </button>
        </form>
      </div>
    </div>
  );
};
