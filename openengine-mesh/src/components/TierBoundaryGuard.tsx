import React from 'react';
import { ShieldAlert, ArrowLeft, UserCheck, Lock } from 'lucide-react';
import { UserProfile, SystemTier, PetriViewMode } from '../types';
import { TIER_DEFINITIONS } from '../services/tierService';

interface TierBoundaryGuardProps {
  currentTier: SystemTier;
  activeUser: UserProfile;
  requiredTier: SystemTier;
  targetView: PetriViewMode;
  onReturnToAllowedView: () => void;
  onOpenUserModal: () => void;
}

export const TierBoundaryGuard: React.FC<TierBoundaryGuardProps> = ({
  currentTier,
  activeUser,
  requiredTier,
  targetView,
  onReturnToAllowedView,
  onOpenUserModal,
}) => {
  const currentMeta = TIER_DEFINITIONS[currentTier];
  const requiredMeta = TIER_DEFINITIONS[requiredTier];

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#FAFBFB] text-stone-900 font-sans">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-8 shadow-xl text-center space-y-6">
        {/* Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              Tier Access Boundary
            </span>
          </div>
          <h2 className="text-lg font-semibold text-stone-900 tracking-tight">
            Protected Platform Surface
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            The <span className="font-semibold text-stone-800 capitalize">{targetView}</span> view requires elevated permissions under Petri Zero enterprise policy.
          </p>
        </div>

        {/* Tier Comparison Card */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200">
            <span className="text-stone-500">Active Operator</span>
            <span className="font-semibold text-stone-900">{activeUser.name}</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200">
            <span className="text-stone-500">Current Tier</span>
            <span className={`font-semibold px-2 py-0.5 rounded-md border text-[11px] font-mono ${currentMeta.badgeStyle.bg} ${currentMeta.badgeStyle.text} ${currentMeta.badgeStyle.border}`}>
              {currentMeta.label.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Required Tier</span>
            <span className={`font-semibold px-2 py-0.5 rounded-md border text-[11px] font-mono ${requiredMeta.badgeStyle.bg} ${requiredMeta.badgeStyle.text} ${requiredMeta.badgeStyle.border}`}>
              {requiredMeta.label.toUpperCase()} OR HIGHER
            </span>
          </div>
        </div>

        {/* Principle of Least Privilege Notice */}
        <div className="flex items-start space-x-2.5 text-left p-3 rounded-2xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600">
          <Lock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            In accordance with Google SAIF principles, developer plumbing, raw DAG modifications, and security killswitches are strictly segregated by tier to prevent accidental modification and protect consumer privacy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onReturnToAllowedView}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Allowed View</span>
          </button>

          <button
            type="button"
            onClick={onOpenUserModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-medium transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch Identity Persona</span>
          </button>
        </div>
      </div>
    </div>
  );
};
