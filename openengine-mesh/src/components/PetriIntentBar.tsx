import React, { useState } from 'react';
import {
  ArrowRight,
  Bug,
  Sparkles,
  AlertCircle,
  Milestone,
} from 'lucide-react';
import { PetriItemKind } from '../types';

interface PetriIntentBarProps {
  onSubmitIntent: (intent: string, kind: PetriItemKind) => void;
}

export const PetriIntentBar: React.FC<PetriIntentBarProps> = ({ onSubmitIntent }) => {
  const [intent, setIntent] = useState('');
  const [selectedKind, setSelectedKind] = useState<PetriItemKind>('feat');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Intent classification keyword inference
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIntent(val);

    const lower = val.toLowerCase();
    if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('error') || lower.includes('crash')) {
      setSelectedKind('bug');
    } else if (lower.startsWith('why') || lower.includes('issue') || lower.includes('investigate') || lower.includes('problem')) {
      setSelectedKind('issue');
    } else if (lower.startsWith('v1') || lower.includes('release') || lower.includes('launch') || lower.includes('milestone')) {
      setSelectedKind('mile');
    } else if (lower.startsWith('add') || lower.startsWith('implement') || lower.startsWith('create') || lower.includes('feat')) {
      setSelectedKind('feat');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    onSubmitIntent(intent.trim(), selectedKind);
    setIntent('');
    setIsSubmitting(false);
  };

  const KIND_SELECTORS: {
    kind: PetriItemKind;
    label: string;
    icon: React.ReactNode;
    style: string;
  }[] = [
    {
      kind: 'feat',
      label: 'feat',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#0A7B76]" />,
      style: 'bg-[#E0F7F6] text-[#0A7B76] border-[#B4E8E4]',
    },
    {
      kind: 'bug',
      label: 'bug',
      icon: <Bug className="w-3.5 h-3.5 text-rose-600" />,
      style: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      kind: 'issue',
      label: 'issue',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
      style: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      kind: 'mile',
      label: 'mile',
      icon: <Milestone className="w-3.5 h-3.5 text-indigo-600" />,
      style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="w-full px-5 sm:px-8 pt-6 pb-3">
      <div className="max-w-5xl mx-auto backdrop-blur-2xl bg-white/60 border border-stone-200/80 rounded-3xl p-4 sm:p-5 transition-colors hover:border-[#0ABAB5]/50">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3.5">
          {/* Kind Selector Pills */}
          <div className="flex items-center space-x-1.5 bg-stone-100/70 p-1.5 rounded-2xl border border-stone-200/80 self-stretch sm:self-auto justify-center">
            {KIND_SELECTORS.map((item) => {
              const isSelected = selectedKind === item.kind;
              return (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => setSelectedKind(item.kind)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono uppercase font-semibold transition-all border ${
                    isSelected
                      ? `${item.style} font-bold`
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Prompt Input with Generous Typography */}
          <div className="flex-1 relative w-full">
            <input
              value={intent}
              onChange={handleInputChange}
              placeholder="What do you want to happen or change in the codebase?"
              className="w-full bg-white/70 border border-stone-200/80 rounded-2xl px-5 py-3 text-base sm:text-lg font-sans text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#0ABAB5] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!intent.trim() || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3 rounded-2xl bg-[#0ABAB5] hover:bg-[#099E99] text-white text-sm sm:text-base font-mono font-bold transition-all border border-[#0A9E99] disabled:opacity-30 disabled:hover:bg-[#0ABAB5]"
          >
            <span>{isSubmitting ? 'Logging...' : 'Launch'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
