import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PetriItemKind } from '../types';

interface PetriIntentBarProps {
  onSubmitIntent: (intent: string, kind?: PetriItemKind) => void;
}

export const PetriIntentBar: React.FC<PetriIntentBarProps> = ({ onSubmitIntent }) => {
  const [intent, setIntent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatic AI classification heuristic based on natural intent language
  const inferKind = (val: string): PetriItemKind => {
    const lower = val.toLowerCase();
    if (
      lower.startsWith('fix') ||
      lower.includes('bug') ||
      lower.includes('error') ||
      lower.includes('crash') ||
      lower.includes('broken') ||
      lower.includes('fail')
    ) {
      return 'bug';
    }
    if (
      lower.startsWith('why') ||
      lower.includes('issue') ||
      lower.includes('investigate') ||
      lower.includes('problem') ||
      lower.includes('audit')
    ) {
      return 'issue';
    }
    if (
      lower.startsWith('v1') ||
      lower.includes('release') ||
      lower.includes('launch') ||
      lower.includes('milestone') ||
      lower.includes('roadmap')
    ) {
      return 'mile';
    }
    return 'feat';
  };

  const detectedKind = intent.trim() ? inferKind(intent) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const autoKind = inferKind(intent.trim());
    onSubmitIntent(intent.trim(), autoKind);
    setIntent('');
    setIsSubmitting(false);
  };

  return (
    <div className="w-full px-5 sm:px-8 pt-5 pb-2">
      <div className="max-w-4xl mx-auto subtle-depth rounded-2xl p-3 sm:p-3.5 transition-all hover:border-stone-400/80">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Subtle AI Auto-Classifier Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 border border-stone-200/80 text-stone-600 text-xs font-mono shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#0ABAB5]" />
            <span className="text-[11px] font-medium">
              {detectedKind ? `AI: ${detectedKind}` : 'AI Auto-Classified'}
            </span>
          </div>

          {/* Prompt Input with Clean, Proportional Typography */}
          <div className="flex-1 relative w-full">
            <input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="What do you want to happen or change in the codebase?"
              className="w-full bg-white/70 border border-stone-200/80 rounded-xl px-4 py-2 text-xs sm:text-sm font-sans text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all font-normal"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!intent.trim() || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-sans font-medium transition-all border border-stone-900 disabled:opacity-30 disabled:hover:bg-stone-900 cursor-pointer"
          >
            <span>{isSubmitting ? 'Dispatching...' : 'Launch'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
