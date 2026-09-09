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

  const KIND_SELECTORS: { kind: PetriItemKind; label: string; icon: React.ReactNode; style: string }[] = [
    {
      kind: 'feat',
      label: 'feat',
      icon: <Sparkles className="w-3 h-3 text-[#0A7B76]" />,
      style: 'bg-[#E0F7F6] text-[#0A7B76] border-[#B4E8E4]',
    },
    {
      kind: 'bug',
      label: 'bug',
      icon: <Bug className="w-3 h-3 text-rose-600" />,
      style: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      kind: 'issue',
      label: 'issue',
      icon: <AlertCircle className="w-3 h-3 text-amber-600" />,
      style: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      kind: 'mile',
      label: 'mile',
      icon: <Milestone className="w-3 h-3 text-indigo-600" />,
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 pt-5 pb-2">
      <div className="max-w-4xl mx-auto backdrop-blur-2xl bg-white/90 border border-stone-200/80 rounded-2xl p-3 sm:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#0ABAB5]/40 hover:shadow-[0_8px_30px_rgba(10,186,181,0.06)]">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          {/* Kind Selector Pills */}
          <div className="flex items-center space-x-1.5 bg-stone-100/90 p-1 rounded-xl border border-stone-200 self-stretch sm:self-auto justify-center">
            {KIND_SELECTORS.map((item) => {
              const isSelected = selectedKind === item.kind;
              return (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => setSelectedKind(item.kind)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase font-semibold transition-all border ${
                    isSelected
                      ? `${item.style} shadow-sm scale-105`
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Prompt Input */}
          <div className="flex-1 relative w-full">
            <input
              value={intent}
              onChange={handleInputChange}
              placeholder="What do you want to happen or change?"
              className="w-full bg-stone-50/90 border border-stone-200/80 rounded-xl px-4 py-2 text-xs sm:text-sm font-sans text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#0ABAB5] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Submit Action Button in soft Tiffany Pastel */}
          <button
            type="submit"
            disabled={!intent.trim() || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2 rounded-xl bg-[#0ABAB5] hover:bg-[#099E99] text-white text-xs font-mono font-bold transition-all shadow-[0_2px_10px_rgba(10,186,181,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
          >
            <span>{isSubmitting ? 'Logging...' : 'Launch'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
