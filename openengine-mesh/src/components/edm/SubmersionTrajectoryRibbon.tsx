import React, { useState } from 'react';
import { WeeklyLongitudinalFrame } from '../../services/edmStorageService';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

interface SubmersionTrajectoryRibbonProps {
  timeline: WeeklyLongitudinalFrame[];
  className?: string;
  waterline?: number; // default 0.50 (50% threshold)
}

export const SubmersionTrajectoryRibbon: React.FC<SubmersionTrajectoryRibbonProps> = ({
  timeline,
  className = '',
  waterline = 0.50,
}) => {
  const [hoveredWeek, setHoveredWeek] = useState<WeeklyLongitudinalFrame | null>(null);

  if (!timeline || timeline.length === 0) return null;

  // Viewport dimensions for SVG 2.5D isometric projection
  const width = 340;
  const height = 90;
  const paddingX = 35;
  const paddingY = 15;

  const stepX = (width - paddingX * 2) / Math.max(1, timeline.length - 1);
  const baselineY = height - paddingY - 10;
  const topY = paddingY + 5;
  const usableHeight = baselineY - topY;

  // Waterline Y position (inverted SVG coordinates)
  const waterlineY = baselineY - waterline * usableHeight;

  // Compute 3D isometric points for Attendance curve and Homework curve
  const attPoints = timeline.map((frame, i) => {
    const x = paddingX + i * stepX;
    const y = baselineY - frame.normAttendance * usableHeight;
    return { x, y, frame };
  });

  const hwPoints = timeline.map((frame, i) => {
    const x = paddingX + i * stepX;
    const y = baselineY - frame.normHomework * usableHeight;
    return { x, y, frame };
  });

  // SVG path generators with smooth cubic bezier tangents
  const buildSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      d += ` C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const attPath = buildSmoothPath(attPoints);
  const hwPath = buildSmoothPath(hwPoints);

  // Closed area under homework trajectory down to waterline
  const hwAreaPath = `${hwPath} L ${hwPoints[hwPoints.length - 1].x} ${baselineY} L ${hwPoints[0].x} ${baselineY} Z`;

  const lastFrame = timeline[timeline.length - 1];
  const isCurrentlySubmerged = (lastFrame?.normAttendance ?? 1) < waterline || (lastFrame?.normHomework ?? 1) < waterline;

  return (
    <div className={`relative bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-800 shadow-inner ${className}`}>
      {/* Ribbon Header with Quantum Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 font-mono">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>Petri Momentum Submersion Trajectory</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-teal-400">
            <span className="w-2 h-0.5 bg-teal-400 rounded-full inline-block" /> Attendance
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-0.5 bg-indigo-400 rounded-full inline-block" /> Homework
          </span>
          {isCurrentlySubmerged && (
            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800/80 font-bold flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5" /> Submerged
            </span>
          )}
        </div>
      </div>

      {/* SVG Submersion Ribbon Canvas */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-22 overflow-visible select-none">
          <defs>
            {/* Gradient under waterline (Submerged Zone) */}
            <linearGradient id="submergedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0.65" />
            </linearGradient>

            {/* Attendance Glow */}
            <filter id="glowTeal" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#14b8a6" floodOpacity="0.7" />
            </filter>
            <filter id="glowIndigo" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#818cf8" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Submerged Depth Trench (Background below waterline) */}
          <rect
            x={paddingX}
            y={waterlineY}
            width={width - paddingX * 2}
            height={baselineY - waterlineY}
            fill="url(#submergedGradient)"
            rx="3"
          />

          {/* Risk Hyperplane / Waterline Line */}
          <line
            x1={paddingX}
            y1={waterlineY}
            x2={width - paddingX}
            y2={waterlineY}
            stroke="#f43f5e"
            strokeWidth="1.2"
            strokeDasharray="4,4"
            opacity="0.8"
          />
          <text
            x={width - paddingX + 4}
            y={waterlineY + 3}
            fill="#fb7185"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            50% Risk Line
          </text>

          {/* Shaded Area */}
          <path d={hwAreaPath} fill="rgba(99, 102, 241, 0.08)" />

          {/* Trajectory Curves */}
          <path
            d={attPath}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glowTeal)"
          />
          <path
            d={hwPath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#glowIndigo)"
          />

          {/* Trajectory Nodes & Interactive Waypoints */}
          {timeline.map((frame, i) => {
            const x = paddingX + i * stepX;
            const attY = baselineY - frame.normAttendance * usableHeight;
            const hwY = baselineY - frame.normHomework * usableHeight;
            const isSub = frame.normAttendance < waterline || frame.normHomework < waterline;

            return (
              <g
                key={`pt-group-${frame.week}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredWeek(frame)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                {/* Vertical Timeline Guide */}
                <line
                  x1={x}
                  y1={topY}
                  x2={x}
                  y2={baselineY}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Attendance Node */}
                <circle
                  cx={x}
                  cy={attY}
                  r="3.5"
                  fill="#14b8a6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Homework Node */}
                <circle
                  cx={x}
                  cy={hwY}
                  r="3"
                  fill={frame.normHomework < waterline ? '#f43f5e' : '#818cf8'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Week Label */}
                <text
                  x={x}
                  y={baselineY + 12}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  W{frame.week}
                </text>

                {/* Submersion Marker Badge if diving under waterline */}
                {isSub && (
                  <circle
                    cx={x}
                    cy={waterlineY}
                    r="2"
                    fill="#f43f5e"
                    opacity="0.85"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Diagnostic Detail Floating Tooltip */}
        {hoveredWeek && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-xs border border-slate-700 rounded-lg p-2 text-[10px] font-mono shadow-xl z-20 pointer-events-none flex items-center gap-3">
            <span className="font-bold text-teal-400">Week {hoveredWeek.week}</span>
            <span>Att: {Math.round(hoveredWeek.normAttendance * 100)}%</span>
            <span>Hw: {Math.round(hoveredWeek.normHomework * 100)}%</span>
            <span className={hoveredWeek.compositeVelocity < 0 ? 'text-rose-400' : 'text-emerald-400'}>
              v: {hoveredWeek.compositeVelocity > 0 ? '+' : ''}{hoveredWeek.compositeVelocity.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Trajectory Dynamics Summary Bar */}
      <div className="mt-1 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>Longitudinal Velocity: {lastFrame ? (lastFrame.compositeVelocity > 0 ? '+' : '') + lastFrame.compositeVelocity.toFixed(2) : '0.00'}/wk</span>
        </span>
        <span className={isCurrentlySubmerged ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
          {isCurrentlySubmerged ? '▼ Trajectory Below Risk Waterline' : '▲ Stable Surface Trajectory'}
        </span>
      </div>
    </div>
  );
};
