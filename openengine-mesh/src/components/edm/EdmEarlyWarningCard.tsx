import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { StudentEdmRecord } from '../../services/edmStorageService';

interface EdmEarlyWarningCardProps {
  student: StudentEdmRecord;
  onTriggerIntervention?: (student: StudentEdmRecord) => void;
}

export const EdmEarlyWarningCard: React.FC<EdmEarlyWarningCardProps> = ({
  student,
  onTriggerIntervention,
}) => {
  const isRed = student.qsvcRiskLevel === 'red';
  const isAmber = student.qsvcRiskLevel === 'amber';

  const badgeConfig = {
    red: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      badgeBg: 'bg-rose-100 text-rose-700 border-rose-300',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />,
    },
    amber: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-700 border-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    },
    green: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    },
  }[student.qsvcRiskLevel];

  const velocityIsNegative = student.compositeVelocity < 0;

  return (
    <div className={`rounded-xl border p-4 transition-all duration-200 ${badgeConfig.bg} shadow-sm`}>
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {badgeConfig.icon}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-800 tracking-tight">
                {student.pseudonym}
              </h4>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${badgeConfig.badgeBg}`}>
                {student.qsvcRiskLevel === 'red' ? 'Critical' : student.qsvcRiskLevel === 'amber' ? 'Warning' : 'On-Track'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {student.cohort} · Model Confidence: {Math.round(student.qsvcConfidence * 100)}%
            </p>
          </div>
        </div>

        {/* Behavioral Velocity Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200 text-xs font-mono shadow-2xs">
          {velocityIsNegative ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span className="font-medium text-slate-700">
            Velocity: {student.compositeVelocity > 0 ? '+' : ''}
            {student.compositeVelocity.toFixed(2)}/wk
          </span>
        </div>
      </div>

      {/* Weekly Longitudinal Momentum Sparkline Bars */}
      <div className="mb-3 bg-white/70 rounded-lg p-2.5 border border-slate-200/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-400" />
            5-Week Normalized Attendance & Homework Velocity
          </span>
          <span className="text-[10px] text-slate-400">Strictly t ∈ [0.0, 1.0]</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {student.weeklyTimeline.map((frame) => (
            <div key={`wk-${frame.week}`} className="flex flex-col items-center gap-1">
              <div className="w-full bg-slate-100 rounded h-12 flex items-end p-0.5 gap-0.5">
                {/* Attendance Bar */}
                <div
                  className="w-1/2 bg-teal-500 rounded-xs transition-all duration-300"
                  style={{ height: `${Math.round(frame.normAttendance * 100)}%` }}
                  title={`W${frame.week} Attendance: ${Math.round(frame.normAttendance * 100)}%`}
                />
                {/* Homework Bar */}
                <div
                  className={`w-1/2 rounded-xs transition-all duration-300 ${
                    frame.normHomework < 0.6 ? 'bg-rose-400' : 'bg-indigo-400'
                  }`}
                  style={{ height: `${Math.round(frame.normHomework * 100)}%` }}
                  title={`W${frame.week} Homework: ${Math.round(frame.normHomework * 100)}%`}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500">W{frame.week}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pedagogical Diagnostic Rationale */}
      <div className="text-xs text-slate-700 leading-relaxed font-sans bg-white/60 rounded-lg p-3 border border-slate-200/70 whitespace-pre-line mb-3">
        {student.pedagogicalRationale}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Quantum ZZFeatureMap · Fidelity Kernel Verified</span>
        </div>

        {(isRed || isAmber) && (
          <button
            onClick={() => onTriggerIntervention?.(student)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Dispatch Remediation Module
          </button>
        )}
      </div>
    </div>
  );
};
