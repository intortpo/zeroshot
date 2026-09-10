import React, { useState, useEffect } from 'react';
import {
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Flame,
  Calendar,
  Layers
} from 'lucide-react';
import {
  midtermClockInService,
  ClockInHourDistribution,
  PunchCardDayCell,
  LivePunchEvent
} from '../../../services/midtermClockInService';

interface ClockInRadialDialProps {
  onSelectHour?: (hour: number) => void;
  className?: string;
}

export const ClockInRadialDial: React.FC<ClockInRadialDialProps> = ({
  onSelectHour,
  className = '',
}) => {
  const [radialData, setRadialData] = useState<ClockInHourDistribution[]>([]);
  const [heatmapData, setHeatmapData] = useState<PunchCardDayCell[]>([]);
  const [liveEvents, setLiveEvents] = useState<LivePunchEvent[]>([]);
  const [selectedHour, setSelectedHour] = useState<ClockInHourDistribution | null>(null);
  const [hoveredCell, setHoveredCell] = useState<PunchCardDayCell | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setRadialData(midtermClockInService.get24HourRadialDistribution());
    setHeatmapData(midtermClockInService.get16WeekPunchCardMatrix());
    setLiveEvents(midtermClockInService.getRecentLiveEvents());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulatePunch = () => {
    setIsSimulating(true);
    midtermClockInService.simulateClockIn();
    setLiveEvents(midtermClockInService.getRecentLiveEvents());
    setRadialData(midtermClockInService.get24HourRadialDistribution());

    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  // SVG Geometry for Radial 24-hour clock
  const size = 380;
  const center = size / 2;
  const innerRadius = 55;
  const maxOuterRadius = 160;

  const maxPunches = Math.max(...radialData.map((d) => d.punchCount), 1);

  // Current time needle angle (00:00 = top / -90 deg, 24h cycle = 360 deg)
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const needleAngle = (currentMinutes / 1440) * 360 - 90;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = center + 140 * Math.cos(needleRad);
  const needleY = center + 140 * Math.sin(needleRad);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner with Key Punctuality Insights */}
      <div className="bg-slate-900/90 border border-teal-500/20 rounded-xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  24-Hour Radial Clock-In & Punch Chronometer
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Submersion Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Longitudinal circadian punch distribution tracking 849 students across a 16-week semester.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Current Station Time</div>
              <div className="text-sm font-mono font-bold text-teal-300">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>

            <button
              onClick={handleSimulatePunch}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-lg ${
                isSimulating
                  ? 'bg-teal-500 text-slate-950 scale-95'
                  : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold hover:shadow-teal-500/25'
              }`}
            >
              <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Recording Biometrics...' : 'Simulate Live Clock-In'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Radial Dial + Telemetry Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* SVG Radial Clock Dial (7 cols) */}
        <div className="xl:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col items-center relative">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Flame className="w-4 h-4 text-teal-400" />
              <span>Circadian Radial Polar Projection</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              θ = 15° / Hour (24 Segments)
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible select-none">
              <defs>
                <linearGradient id="radialSurgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity="0.4" />
                </linearGradient>
                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                </radialGradient>
              </defs>

              {/* Concentric Guide Rings */}
              {[40, 75, 110, 145].map((radius, idx) => (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
              ))}

              {/* Radial Wedges for each hour */}
              {radialData.map((item, idx) => {
                const anglePerSegment = 360 / 24;
                const startAngle = idx * anglePerSegment - 90;
                const endAngle = startAngle + anglePerSegment;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                // Radius mapped to punch count
                const outerRadius = innerRadius + (item.punchCount / maxPunches) * (maxOuterRadius - innerRadius);

                const x1 = center + innerRadius * Math.cos(startRad);
                const y1 = center + innerRadius * Math.sin(startRad);
                const x2 = center + outerRadius * Math.cos(startRad);
                const y2 = center + outerRadius * Math.sin(startRad);
                const x3 = center + outerRadius * Math.cos(endRad);
                const y3 = center + outerRadius * Math.sin(endRad);
                const x4 = center + innerRadius * Math.cos(endRad);
                const y4 = center + innerRadius * Math.sin(endRad);

                const pathData = `
                  M ${x1} ${y1}
                  L ${x2} ${y2}
                  A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
                  L ${x4} ${y4}
                  A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
                  Z
                `;

                const isSurgeHour = item.hour === 7 || item.hour === 8;
                const isSelected = selectedHour?.hour === item.hour;

                return (
                  <g
                    key={item.hour}
                    className="cursor-pointer transition-all duration-200 group"
                    onClick={() => {
                      setSelectedHour(item);
                      if (onSelectHour) onSelectHour(item.hour);
                    }}
                    onMouseEnter={() => setSelectedHour(item)}
                  >
                    <path
                      d={pathData}
                      fill={
                        isSelected
                          ? '#0ABAB5'
                          : isSurgeHour
                          ? 'url(#radialSurgeGrad)'
                          : item.punchCount > 20
                          ? '#0284C7'
                          : '#1E293B'
                      }
                      stroke={isSelected ? '#5EEAD4' : isSurgeHour ? '#2DD4BF' : '#334155'}
                      strokeWidth={isSelected ? 2 : 0.8}
                      opacity={isSelected ? 1 : isSurgeHour ? 0.95 : 0.65}
                      className="transition-all duration-300 hover:opacity-100"
                    />

                    {/* Hour Number Labels on Perimeter */}
                    {idx % 3 === 0 && (
                      <text
                        x={center + (maxOuterRadius + 18) * Math.cos((startRad + endRad) / 2)}
                        y={center + (maxOuterRadius + 18) * Math.sin((startRad + endRad) / 2)}
                        fill="#94A3B8"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {item.hour.toString().padStart(2, '0')}:00
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Central Hub */}
              <circle
                cx={center}
                cy={center}
                r={innerRadius - 4}
                fill="url(#hubGlow)"
                stroke="#0D9488"
                strokeWidth="1.5"
              />

              <text
                x={center}
                y={center - 8}
                fill="#5EEAD4"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                PUNCH
              </text>
              <text
                x={center}
                y={center + 8}
                fill="#94A3B8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                RADIAL
              </text>

              {/* Real-time Needle */}
              <line
                x1={center}
                y1={center}
                x2={needleX}
                y2={needleY}
                stroke="#F43F5E"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <circle cx={needleX} cy={needleY} r="3" fill="#F43F5E" />
              <circle cx={center} cy={center} r="4" fill="#F43F5E" />
            </svg>

            {/* Morning Surge Callout Badge */}
            <div className="absolute top-4 right-4 bg-slate-950/90 border border-teal-500/40 rounded-lg p-2.5 shadow-xl max-w-[180px] pointer-events-none">
              <div className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Morning Surge
              </div>
              <div className="text-xs font-mono font-bold text-slate-100 mt-0.5">
                07:45 - 08:15 AM
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                574 Students clocked (67.6% of cohort). Avg Exam Score: <span className="text-teal-300 font-bold">86.4%</span>
              </div>
            </div>
          </div>

          {/* Selected Hour Detail Inspection Card */}
          <div className="w-full mt-4 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs flex items-center justify-between">
            {selectedHour ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-teal-400" />
                  <div>
                    <span className="font-semibold text-slate-200">
                      Window: {selectedHour.label} - {selectedHour.hour + 1}:00
                    </span>
                    <span className="text-slate-400 ml-2">
                      ({selectedHour.punchCount} check-ins recorded)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-mono">
                  <div>
                    <span className="text-slate-500">Cohort Score: </span>
                    <span className="text-teal-300 font-bold">{selectedHour.avgExamScore}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Punctuality: </span>
                    <span
                      className={
                        selectedHour.hour >= 7 && selectedHour.hour <= 8
                          ? 'text-teal-400 font-bold'
                          : selectedHour.hour > 8
                          ? 'text-amber-400 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {selectedHour.hour >= 7 && selectedHour.hour <= 8
                        ? 'Prime Optimum'
                        : selectedHour.hour > 8
                        ? 'Tardy Window'
                        : 'Off-Peak'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-slate-500 italic">
                Hover or click any radial segment to inspect hour-level punctuality vs midterm correlation.
              </span>
            )}
          </div>
        </div>

        {/* Live Punch Telemetry Feed & Station Status (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Punch-In Gateway Stream
                </h4>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-teal-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                ONLINE
              </span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {liveEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-950/70 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between text-xs hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded ${
                        evt.status === 'early'
                          ? 'bg-teal-500/20 text-teal-400'
                          : evt.status === 'punctual'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : evt.status === 'late'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {evt.status === 'late' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{evt.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {evt.studentId} • {evt.stationId}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-300">{evt.timeFormatted}</div>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        evt.status === 'early'
                          ? 'bg-teal-900/40 text-teal-300 border border-teal-500/30'
                          : evt.status === 'punctual'
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                          : evt.status === 'late'
                          ? 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Tile */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase">
                Early-Arrival Advantage
              </div>
              <div className="text-xl font-bold font-mono text-teal-400 mt-1">+27.7 pts</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                86.4% avg vs 58.7% late cohort
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase">
                Pearson Correlation
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">r = 0.784</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                High punctuality directly predicts pass
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 16-Week Mon-Fri Punch Card Heatmap */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              16-Week Longitudinal Punch Card Matrix
            </h4>
            <span className="text-[10px] font-mono text-slate-500">(Mon - Fri)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" /> Low Punch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-800/60 border border-teal-600" /> Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-teal-400 border border-teal-300" /> Peak (Midterm)
            </span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Week Headers */}
            <div className="grid grid-cols-17 gap-1 mb-1 text-center font-mono text-[9px] text-slate-500">
              <div className="text-left">Day</div>
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className={i + 1 === 8 ? 'text-teal-300 font-bold' : ''}>
                  W{i + 1}
                </div>
              ))}
            </div>

            {/* Rows for Mon-Fri */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((dayName, dayIdx) => (
              <div key={dayName} className="grid grid-cols-17 gap-1 items-center mb-1">
                <div className="text-[10px] font-mono text-slate-400 font-medium">{dayName}</div>
                {Array.from({ length: 16 }, (_, weekIdx) => {
                  const cell = heatmapData.find(
                    (c) => c.week === weekIdx + 1 && c.dayOfWeek === dayIdx
                  );
                  if (!cell) return <div key={weekIdx} className="h-6 rounded bg-slate-900" />;

                  const isMidtermWeek = cell.week === 8;

                  let cellBg = 'bg-slate-800/60';
                  let border = 'border-slate-700/40';
                  if (isMidtermWeek) {
                    cellBg = 'bg-teal-400';
                    border = 'border-teal-200';
                  } else if (cell.punchVolume > 800) {
                    cellBg = 'bg-teal-600/80';
                    border = 'border-teal-500';
                  } else if (cell.punchVolume > 760) {
                    cellBg = 'bg-teal-800/60';
                    border = 'border-teal-700';
                  }

                  return (
                    <div
                      key={weekIdx}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-6 rounded flex items-center justify-center text-[9px] font-mono font-semibold transition-transform hover:scale-110 cursor-pointer border ${cellBg} ${border} ${
                        isMidtermWeek ? 'text-slate-950' : 'text-slate-200'
                      }`}
                    >
                      {isMidtermWeek ? '845' : cell.punchVolume}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Hovered Cell Footnote */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          {hoveredCell ? (
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-semibold text-teal-400">
                Week {hoveredCell.week} • {hoveredCell.dayName}
              </span>
              <span>Punch Volume: <strong className="text-slate-100">{hoveredCell.punchVolume}</strong></span>
              <span>Tardiness: <strong className="text-amber-400">{hoveredCell.tardinessPercentage}%</strong></span>
              <span>Predicted Avg Score: <strong className="text-teal-300">{hoveredCell.averageScore}%</strong></span>
            </div>
          ) : (
            <span className="text-slate-500 italic">
              Hover across any day/week cell to inspect longitudinal tardiness vs test score correlation.
            </span>
          )}
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Layers className="w-3 h-3 text-teal-400" /> Week 8 = Midterm Examination Surge
          </span>
        </div>
      </div>
    </div>
  );
};
