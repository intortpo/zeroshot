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
    <div className="w-full px-5 sm:px-8 pt-4 pb-2">
      <div className="max-w-4xl mx-auto border border-[#1A1D1A] bg-[#FAF8F3] p-3 shadow-[3px_3px_0px_#1A1D1A] relative select-none">
        {/* Technical Corner Alignment Registration Marks */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-[#1A1D1A]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-[#1A1D1A]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-[#1A1D1A]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-[#1A1D1A]" />

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* 1960s Inked Classification Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 border border-[#1A1D1A] bg-[#EDE8DC] text-[#1A1D1A] text-[10px] font-mono uppercase tracking-wider shrink-0 shadow-[1px_1px_0px_#1A1D1A]">
            <Sparkles className="w-3 h-3 text-[#1A1D1A]" strokeWidth={1.5} />
            <span className="font-bold">
              {detectedKind ? `AI: ${detectedKind.toUpperCase()}` : 'INTENT PARSER'}
            </span>
          </div>

          {/* Technical Manual Prompt Input */}
          <div className="flex-1 relative w-full">
            <input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="ENTER SPECIFICATION OR FLIGHT PLAN INTENT (E.G. 'ADD AST CACHE IN CANDIDATE PIPELINE')..."
              className="w-full bg-[#FAF8F3] border border-[#1A1D1A]/50 focus:border-[#1A1D1A] px-3.5 py-1.5 text-xs font-mono text-[#1A1D1A] placeholder-[#1A1D1A]/40 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!intent.trim() || isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-1.5 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-[#1A1D1A] text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-30 cursor-pointer shadow-[2px_2px_0px_#1A1D1A]"
          >
            <span>{isSubmitting ? 'DISPATCHING...' : 'DISPATCH // CODE'}</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
};
