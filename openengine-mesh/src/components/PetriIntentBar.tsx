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
      icon: <Sparkles className="w-3.5 h-3.5 text-stone-900" />,
      style: 'bg-stone-900 text-white border-stone-900',
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
    <div className="w-full px-5 sm:px-8 pt-5 pb-2">
      <div className="max-w-4xl mx-auto backdrop-blur-2xl bg-white/65 border border-stone-200/80 rounded-2xl p-3 sm:p-3.5 transition-colors hover:border-stone-400">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Kind Selector Pills */}
          <div className="flex items-center space-x-1 bg-stone-100/70 p-1 rounded-xl border border-stone-200/80 self-stretch sm:self-auto justify-center">
            {KIND_SELECTORS.map((item) => {
              const isSelected = selectedKind === item.kind;
              return (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => setSelectedKind(item.kind)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-sans uppercase transition-all border ${
                    isSelected
                      ? `${item.style} font-medium`
                      : 'border-transparent text-stone-500 hover:text-stone-800 font-normal'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Prompt Input with Clean, Proportional Typography */}
          <div className="flex-1 relative w-full">
            <input
              value={intent}
              onChange={handleInputChange}
              placeholder="What do you want to happen or change in the codebase?"
              className="w-full bg-white/70 border border-stone-200/80 rounded-xl px-4 py-2 text-xs sm:text-sm font-sans text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all font-normal"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!intent.trim() || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-sans font-medium transition-all border border-stone-900 disabled:opacity-30 disabled:hover:bg-stone-900"
          >
            <span>{isSubmitting ? 'Logging...' : 'Launch'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
