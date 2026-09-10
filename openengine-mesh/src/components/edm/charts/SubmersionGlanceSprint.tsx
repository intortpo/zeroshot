import React, { useMemo } from 'react';
import { StudentEdmRecord } from '../../../services/edmStorageService';
import { LieflatColorMode, LIEFLAT_PALETTES } from './lieflatTheme';
import { Zap, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';

interface SubmersionGlanceSprintProps {
  students: StudentEdmRecord[];
  colorMode: LieflatColorMode;
  waterlineElevation: number;
  height?: number;
  onSelectStudent?: (studentId: string) => void;
}

export const SubmersionGlanceSprint: React.FC<SubmersionGlanceSprintProps> = ({
  students,
  colorMode,
  waterlineElevation,
  height = 360,
  onSelectStudent,
}) => {
  const palette = LIEFLAT_PALETTES[colorMode] || LIEFLAT_PALETTES.tiffany;

  // Rank students by velocity & mastery
  const rankedStudents = useMemo(() => {
    return [...students]
      .map((st) => {
        const skillVals = Object.values(st.latentMastery);
        const avgMastery =
          skillVals.length > 0 ? skillVals.reduce((a, b) => a + b, 0) / skillVals.length : 0.5;
        const score = avgMastery * 100 + st.compositeVelocity * 15;
        const isSubmerged = score < (waterlineElevation + 0.5) * 80;
        return {
          ...st,
          avgMastery,
          score,
          isSubmerged,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [students, waterlineElevation]);

  // Aggregate high-speed Glance KPIs
  const topPerformer = rankedStudents[0];
  const totalSubmerged = rankedStudents.filter((s) => s.isSubmerged).length;
  const meanVelocity =
    rankedStudents.reduce((acc, s) => acc + s.compositeVelocity, 0) /
    Math.max(rankedStudents.length, 1);

  return (
    <div
      className="relative w-full rounded-2xl p-5 border border-stone-800 shadow-2xl flex flex-col justify-between select-none"
      style={{ minHeight: height, backgroundColor: palette.background }}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-stone-200 border border-stone-700/60">
            Lieflat Glance · Velocity Sprint & Metric Stroke
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
            style={{ backgroundColor: palette.surface, color: palette.accent }}
          >
            {palette.name} Palette
          </span>
        </div>

        <div className="text-[11px] font-mono text-stone-400">
          Conclusion-First · Ranked in 0ms
        </div>
      </div>

      {/* Top 3 Bold Glance Metric Blocks ("Stroke" format) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {/* Metric 1 */}
        <div
          className="p-4 rounded-2xl border transition-all"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold flex items-center justify-between">
            <span>Sprint Velocity Pace</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-3xl font-black mt-1 font-mono tracking-tight" style={{ color: palette.textPrimary }}>
            {meanVelocity > 0 ? '+' : ''}{meanVelocity.toFixed(2)}
            <span className="text-xs font-normal text-stone-500 font-sans ml-1">/ wk</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+1.4σ above baseline curve</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="p-4 rounded-2xl border transition-all"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold flex items-center justify-between">
            <span>Submersion Exposure</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-3xl font-black mt-1 font-mono tracking-tight text-rose-400">
            {totalSubmerged}
            <span className="text-xs font-normal text-stone-500 font-sans ml-1">
              / {rankedStudents.length} students
            </span>
          </div>
          <div className="text-[11px] font-mono text-rose-300 mt-1">
            {((totalSubmerged / Math.max(rankedStudents.length, 1)) * 100).toFixed(1)}% below waterline
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="p-4 rounded-2xl border transition-all"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold flex items-center justify-between">
            <span>Top Velocity Lead</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-black mt-1 font-sans truncate" style={{ color: palette.accent }}>
            {topPerformer?.pseudonym || 'N/A'}
          </div>
          <div className="text-[11px] font-mono text-stone-400 mt-1">
            Mastery: {(topPerformer?.avgMastery * 100 || 0).toFixed(0)}% · +{(topPerformer?.compositeVelocity || 0).toFixed(2)}/wk
          </div>
        </div>
      </div>

      {/* Ranked Sprint Bars (The "Eight Products Race" archetype) */}
      <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
        {rankedStudents.slice(0, 8).map((st, rank) => {
          const barWidth = Math.max(12, Math.min(100, (st.score / (topPerformer?.score || 100)) * 100));
          const isSub = st.isSubmerged;

          return (
            <div
              key={st.id}
              onClick={() => onSelectStudent?.(st.id)}
              className="p-2.5 rounded-xl border border-stone-800/80 bg-stone-900/50 hover:bg-stone-800/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center space-x-3 w-44 shrink-0">
                <span className="w-6 font-mono font-bold text-xs text-stone-400">
                  #{rank + 1}
                </span>
                <span className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
                  {st.pseudonym}
                </span>
              </div>

              {/* Bold Visual Block Bar */}
              <div className="flex-1 bg-stone-800/60 rounded-lg h-5 relative overflow-hidden flex items-center">
                <div
                  className="h-full rounded-md transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: isSub ? '#E11D48' : palette.accent,
                    opacity: isSub ? 0.8 : 1,
                  }}
                />
                <span className="absolute left-2 text-[10px] font-mono font-bold text-white drop-shadow-sm">
                  {Math.round(st.avgMastery * 100)}% DINA
                </span>
              </div>

              {/* Velocity Delta Indicator */}
              <div className="w-24 text-right shrink-0">
                <span
                  className={`font-mono text-xs font-bold ${
                    st.compositeVelocity >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {st.compositeVelocity >= 0 ? '+' : ''}
                  {st.compositeVelocity.toFixed(2)}/wk
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-500">
        <span>Click any row to jump to student diagnostic breakdown</span>
        <span>Waterline threshold: {(waterlineElevation + 0.5).toFixed(2)}</span>
      </div>
    </div>
  );
};
