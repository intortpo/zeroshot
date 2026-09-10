import React, { useState, useMemo } from 'react';
import { StudentEdmRecord } from '../../../services/edmStorageService';
import { LieflatColorMode, LIEFLAT_PALETTES } from './lieflatTheme';
import { Info } from 'lucide-react';

interface SubmersionLollipopAlmanacProps {
  students: StudentEdmRecord[];
  colorMode: LieflatColorMode;
  waterlineElevation: number; // e.g. -2.0 to +2.0
  height?: number;
  onSelectStudent?: (studentId: string) => void;
}

export const SubmersionLollipopAlmanac: React.FC<SubmersionLollipopAlmanacProps> = ({
  students,
  colorMode,
  waterlineElevation,
  height = 360,
  onSelectStudent,
}) => {
  const palette = LIEFLAT_PALETTES[colorMode] || LIEFLAT_PALETTES.tiffany;
  const [hoveredStudent, setHoveredStudent] = useState<StudentEdmRecord | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'submerged' | 'elevated'>('all');

  // Map student latent mastery to elevation (-50 to +50 coordinate space)
  const items = useMemo(() => {
    return students.map((st, index) => {
      // Calculate average latent mastery across skills [0, 1]
      const skillVals = Object.values(st.latentMastery);
      const avgMastery =
        skillVals.length > 0 ? skillVals.reduce((a, b) => a + b, 0) / skillVals.length : 0.5;

      // Scaled elevation between -100 and +100
      // Waterline elevation is in sigma e.g. [-2, 2] scaled by 25
      const waterlineCoord = waterlineElevation * 25;
      const rawElevation = (avgMastery - 0.5) * 160 + st.compositeVelocity * 10;
      const relativeElevation = rawElevation - waterlineCoord;
      const isSubmerged = relativeElevation < 0;

      return {
        student: st,
        index,
        avgMastery,
        rawElevation,
        relativeElevation,
        isSubmerged,
      };
    });
  }, [students, waterlineElevation]);

  const filteredItems = useMemo(() => {
    if (filterMode === 'submerged') return items.filter((i) => i.isSubmerged);
    if (filterMode === 'elevated') return items.filter((i) => !i.isSubmerged);
    return items;
  }, [items, filterMode]);

  const submergedCount = items.filter((i) => i.isSubmerged).length;
  const elevatedCount = items.length - submergedCount;

  return (
    <div
      className="relative w-full rounded-2xl p-5 border border-stone-800 shadow-2xl flex flex-col justify-between select-none"
      style={{ minHeight: height, backgroundColor: palette.background }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center space-x-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-stone-200 border border-stone-700/60">
            Lieflat Basics · Barcode Lollipop Almanac
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
            style={{ backgroundColor: palette.surface, color: palette.accent }}
          >
            {palette.name} Palette
          </span>
        </div>

        {/* Filter Controls & Counts */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilterMode('elevated')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'elevated'
                ? 'bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700'
                : 'text-stone-400 hover:text-emerald-300'
            }`}
          >
            Elevated ({elevatedCount})
          </button>
          <button
            onClick={() => setFilterMode('submerged')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'submerged'
                ? 'bg-rose-900/60 text-rose-300 font-bold border border-rose-700'
                : 'text-stone-400 hover:text-rose-300'
            }`}
          >
            Submerged ({submergedCount})
          </button>
        </div>
      </div>

      {/* Almanac SVG Canvas */}
      <div className="flex-1 w-full py-4 flex items-center justify-center overflow-x-auto">
        <svg
          viewBox={`0 0 ${Math.max(filteredItems.length * 36 + 80, 720)} 260`}
          className="w-full h-56 overflow-visible"
        >
          {/* Baseline Gridlines */}
          <line
            x1="20"
            y1="40"
            x2={Math.max(filteredItems.length * 36 + 60, 700)}
            y2="40"
            stroke={palette.border}
            strokeDasharray="2 4"
            strokeWidth="1"
          />
          <text x="25" y="36" fill={palette.textMuted} fontSize="9" fontFamily="monospace">
            +2.0σ Peak Mastery
          </text>

          {/* WATERLINE BOUNDARY (Z = 0) */}
          <g>
            <line
              x1="20"
              y1="130"
              x2={Math.max(filteredItems.length * 36 + 60, 700)}
              y2="130"
              stroke={palette.accent}
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <rect
              x="20"
              y="130"
              width={Math.max(filteredItems.length * 36 + 40, 680)}
              height="100"
              fill={palette.waterlineColor}
              opacity="0.15"
            />
            <text x="25" y="126" fill={palette.accent} fontSize="9" fontFamily="monospace" fontWeight="bold">
              WATERLINE RISK BOUNDARY (Z = 0)
            </text>
          </g>

          <line
            x1="20"
            y1="220"
            x2={Math.max(filteredItems.length * 36 + 60, 700)}
            y2="220"
            stroke={palette.border}
            strokeDasharray="2 4"
            strokeWidth="1"
          />
          <text x="25" y="235" fill={palette.textMuted} fontSize="9" fontFamily="monospace">
            -2.0σ Deficit Immersion
          </text>

          {/* Countable Unit Barcode Lollipops */}
          {filteredItems.map((item, idx) => {
            const x = 70 + idx * 36;
            // Map relativeElevation to Y coord: 130 is waterline
            // +100 rel elevation -> y = 40; -100 rel elevation -> y = 220
            const y = Math.max(30, Math.min(230, 130 - item.relativeElevation * 0.9));
            const isSub = item.isSubmerged;
            const isHovered = hoveredStudent?.id === item.student.id;

            return (
              <g
                key={item.student.id}
                className="cursor-pointer transition-all duration-150 group"
                onMouseEnter={() => setHoveredStudent(item.student)}
                onMouseLeave={() => setHoveredStudent(null)}
                onClick={() => onSelectStudent?.(item.student.id)}
              >
                {/* Vertical Hairline Stem */}
                <line
                  x1={x}
                  y1={130}
                  x2={x}
                  y2={y}
                  stroke={isSub ? '#F43F5E' : palette.accent}
                  strokeWidth={isHovered ? '2' : '1'}
                  opacity={isHovered ? 1 : 0.75}
                />

                {/* Drop Pin / Lollipop Head */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : 5}
                  fill={isSub ? '#E11D48' : palette.accent}
                  stroke={palette.background}
                  strokeWidth="2"
                  className="transition-transform duration-100"
                />

                {/* Internal Countable Dot */}
                <circle cx={x} cy={y} r="1.5" fill="#FFFFFF" />

                {/* Submerged Anchor Indicator */}
                {isSub && (
                  <circle
                    cx={x}
                    cy={130}
                    r="2"
                    fill="#F43F5E"
                    opacity="0.8"
                  />
                )}

                {/* Student Initials Label */}
                <text
                  x={x}
                  y={y > 130 ? y + 14 : y - 9}
                  textAnchor="middle"
                  fill={isHovered ? '#FFFFFF' : palette.textMuted}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {item.student.pseudonym.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        {hoveredStudent ? (
          <div className="flex items-center space-x-3 text-stone-200">
            <span className="font-bold text-white">{hoveredStudent.pseudonym}</span>
            <span className="text-stone-400">Cohort: {hoveredStudent.cohort}</span>
            <span className="text-emerald-400">
              Velocity: {hoveredStudent.compositeVelocity > 0 ? '+' : ''}
              {hoveredStudent.compositeVelocity.toFixed(2)}/wk
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                hoveredStudent.qsvcRiskLevel === 'red'
                  ? 'bg-rose-950 text-rose-300'
                  : hoveredStudent.qsvcRiskLevel === 'amber'
                  ? 'bg-amber-950 text-amber-300'
                  : 'bg-emerald-950 text-emerald-300'
              }`}
            >
              Risk: {hoveredStudent.qsvcRiskLevel}
            </span>
          </div>
        ) : (
          <div className="text-stone-500 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Hover on pins to inspect student velocity and DINA latent coordinates</span>
          </div>
        )}

        <div className="text-[11px] text-stone-400">
          Waterline: {waterlineElevation > 0 ? '+' : ''}
          {waterlineElevation.toFixed(1)}σ · Submersion Rate:{' '}
          <strong className="text-teal-400">
            {((submergedCount / Math.max(items.length, 1)) * 100).toFixed(1)}%
          </strong>
        </div>
      </div>
    </div>
  );
};
