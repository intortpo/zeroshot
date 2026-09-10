import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Sliders,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen
} from 'lucide-react';
import {
  midtermClockInService
} from '../../../services/midtermClockInService';

interface MidtermIrtEvaluatorProps {
  className?: string;
}

export const MidtermIrtEvaluator: React.FC<MidtermIrtEvaluatorProps> = ({
  className = '',
}) => {
  const [passingCutoff, setPassingCutoff] = useState<number>(70);
  const [selectedItemId, setSelectedItemId] = useState<string>('ITEM-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');

  const students = useMemo(() => midtermClockInService.getAllStudents(), []);
  const irtItems = useMemo(() => midtermClockInService.getIrtItems(), []);

  // Compute live metrics dynamically as passingCutoff moves
  const metrics = useMemo(
    () => midtermClockInService.getEvaluationMetrics(passingCutoff),
    [passingCutoff]
  );

  const distributionBins = useMemo(
    () => midtermClockInService.getScoreDistributionBins(passingCutoff),
    [passingCutoff]
  );

  const selectedItem = useMemo(
    () => irtItems.find((i) => i.itemId === selectedItemId) || irtItems[0],
    [irtItems, selectedItemId]
  );

  const iccCurvePoints = useMemo(
    () => midtermClockInService.calculateIccCurve(selectedItem),
    [selectedItem]
  );

  // Filter students for roster preview
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (selectedCohort !== 'ALL' && s.cohort !== selectedCohort) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.punctualityCategory.toLowerCase().includes(q)
        );
      })
      .slice(0, 10); // Show top 10 matches for fast render
  }, [students, searchQuery, selectedCohort]);

  // SVG dimensions for ICC curve
  const svgWidth = 460;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Convert theta [-3, 3] and prob [0, 1] to SVG coordinates
  const getX = (theta: number) => padLeft + ((theta + 3) / 6) * plotWidth;
  const getY = (prob: number) => padTop + (1 - prob) * plotHeight;

  const iccPath = useMemo(() => {
    return iccCurvePoints.reduce((acc, pt, idx) => {
      const x = getX(pt.theta);
      const y = getY(pt.probability);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [iccCurvePoints]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-teal-500/20 rounded-xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  Midterm Examination Evaluation Studio
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  IRT 2PL / 3PL Submersion
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Item Response Theory parameterization, bimodal cohort bifurcation, and real-time waterline cutoff.
              </p>
            </div>
          </div>

          {/* Dynamic Cutoff Slider in Header */}
          <div className="bg-slate-950/80 border border-teal-500/40 rounded-xl p-3 flex items-center gap-4 min-w-[320px]">
            <div className="flex items-center gap-2 text-teal-400">
              <Sliders className="w-4 h-4" />
              <span className="text-xs font-semibold whitespace-nowrap">Passing Threshold:</span>
            </div>
            <input
              type="range"
              min="50"
              max="85"
              step="1"
              value={passingCutoff}
              onChange={(e) => setPassingCutoff(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="text-sm font-bold font-mono text-teal-300 w-12 text-right">
              {passingCutoff}%
            </span>
          </div>
        </div>
      </div>

      {/* Reactive Score Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Total Examinees</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">{metrics.totalStudents}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across 2 cohorts</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3.5 bg-emerald-950/10">
          <div className="text-[10px] text-emerald-400 font-mono uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Passing Cohort
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
            {metrics.passedCount}{' '}
            <span className="text-xs font-normal text-slate-400 ml-1">({metrics.passRate}%)</span>
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Above {passingCutoff}% waterline</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Submerged Cohort
          </div>
          <div className="text-xl font-bold font-mono text-slate-200 mt-1">
            {metrics.submergedCount}{' '}
            <span className="text-xs font-normal text-slate-400 ml-1">({metrics.submergedRate}%)</span>
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Requiring remediation</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Cohort Mean</div>
          <div className="text-xl font-bold font-mono text-teal-300 mt-1">{metrics.averageScore}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Median: {metrics.medianScore}%</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Std Deviation</div>
          <div className="text-xl font-bold font-mono text-slate-300 mt-1">±{metrics.stdDeviation}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Bimodal spread</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Punch Correlation</div>
          <div className="text-xl font-bold font-mono text-teal-400 mt-1">r = {metrics.correlationR}</div>
          <div className="text-[10px] text-teal-500/80 mt-0.5">Strong positive</div>
        </div>
      </div>

      {/* Main Grid: Bimodal Score Distribution + IRT 2PL Curve */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Bimodal Score Distribution Histogram (6 cols) */}
        <div className="xl:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Bimodal Score Distribution with Submerged Waterline
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Cutoff: {passingCutoff}%</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Observe how adjusting the passing slider shifts the boundary between passing and submerged students in real time.
            </p>

            {/* Bar Histogram */}
            <div className="space-y-2.5">
              {distributionBins.map((bin) => {
                const maxCount = 280;
                const pctWidth = Math.min(100, (bin.count / maxCount) * 100);
                const isSubmerged = bin.max < passingCutoff;
                const isPassing = bin.min >= passingCutoff;

                return (
                  <div key={bin.range} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-medium">{bin.range}%</span>
                      <span className="text-slate-400">
                        {bin.count} students ({((bin.count / 849) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-4 w-full bg-slate-800/80 rounded-full overflow-hidden flex relative">
                      <div
                        style={{ width: `${pctWidth}%` }}
                        className={`h-full transition-all duration-300 rounded-full ${
                          isPassing
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                            : isSubmerged
                            ? 'bg-gradient-to-r from-slate-700 to-slate-500'
                            : 'bg-gradient-to-r from-amber-500 to-teal-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-slate-500" /> Submerged ({metrics.submergedCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-teal-400" /> Passing ({metrics.passedCount})
              </span>
            </div>
            <span className="font-mono text-teal-400 text-[11px]">
              Waterline: {passingCutoff}%
            </span>
          </div>
        </div>

        {/* IRT 2PL Characteristic Curve Viewer (6 cols) */}
        <div className="xl:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Item Response Theory (2PL) Characteristic Curve
                </h4>
              </div>

              {/* Item Selector Dropdown */}
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-teal-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-500 font-mono"
              >
                {irtItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.itemId}: {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Item Parameters Badges */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Discrimination (a)</div>
                <div className="text-sm font-mono font-bold text-teal-300">{selectedItem.discriminationA}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Difficulty (b)</div>
                <div className="text-sm font-mono font-bold text-amber-300">{selectedItem.difficultyB}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Pseudo-Guess (c)</div>
                <div className="text-sm font-mono font-bold text-slate-300">{selectedItem.guessingC}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Pass Rate</div>
                <div className="text-sm font-mono font-bold text-emerald-300">
                  {Math.round(selectedItem.empiricalPassRate * 100)}%
                </div>
              </div>
            </div>

            {/* SVG 2PL Characteristic Curve */}
            <div className="w-full flex justify-center">
              <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
                {/* Horizontal Grid lines (Probabilities 0.0, 0.25, 0.5, 0.75, 1.0) */}
                {[0.0, 0.25, 0.5, 0.75, 1.0].map((prob) => {
                  const y = getY(prob);
                  return (
                    <g key={prob}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="#334155"
                        strokeWidth="0.75"
                        strokeDasharray={prob === 0.5 ? '4 4' : '2 2'}
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3}
                        fill="#94A3B8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {prob.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Grid lines (Theta -3, -2, -1, 0, 1, 2, 3) */}
                {[-3, -2, -1, 0, 1, 2, 3].map((theta) => {
                  const x = getX(theta);
                  return (
                    <g key={theta}>
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={svgHeight - padBottom}
                        stroke="#334155"
                        strokeWidth="0.75"
                        strokeDasharray={theta === 0 ? '4 4' : '2 2'}
                      />
                      <text
                        x={x}
                        y={svgHeight - padBottom + 14}
                        fill="#94A3B8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {theta > 0 ? `+${theta}` : theta}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text
                  x={svgWidth / 2}
                  y={svgHeight - 4}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  Latent Ability (θ)
                </text>
                <text
                  x={12}
                  y={svgHeight / 2}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  transform={`rotate(-90 12 ${svgHeight / 2})`}
                >
                  P(θ)
                </text>

                {/* The 2PL Logistic Sigmoid Curve */}
                <path
                  d={iccPath}
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Inflection Point at Difficulty (b) */}
                <circle
                  cx={getX(selectedItem.difficultyB)}
                  cy={getY(0.5 + selectedItem.guessingC * 0.5)}
                  r="4.5"
                  fill="#0ABAB5"
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Model: P(θ) = c + (1-c) / (1 + e^[-a(θ-b)])</span>
            <span className="text-teal-400">Inflection θ = {selectedItem.difficultyB}</span>
          </div>
        </div>
      </div>

      {/* Student Roster Preview Table with Search & Cohort Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Student Performance & Clock-In Telemetry Roster
            </h4>
            <span className="text-[10px] font-mono text-slate-500">(849 Sampled)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search examinee or id..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 w-48 font-mono"
              />
            </div>

            {/* Cohort Filter */}
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500 font-mono"
            >
              <option value="ALL">All Cohorts</option>
              <option value="Delta-Alpha (Dawn)">Delta-Alpha (Dawn)</option>
              <option value="Omega-Psi (Dusk)">Omega-Psi (Dusk)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2 px-3">Student ID</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Cohort</th>
                <th className="py-2 px-3">Avg Clock-In</th>
                <th className="py-2 px-3">Punctuality</th>
                <th className="py-2 px-3">Attendance</th>
                <th className="py-2 px-3">Midterm</th>
                <th className="py-2 px-3">Waterline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredStudents.map((s) => {
                const passed = s.midtermScore >= passingCutoff;
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-300">{s.id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.cohort}</td>
                    <td className="py-2.5 px-3 text-teal-300">{s.avgClockInFormatted}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.punctualityCategory === 'Early Bird'
                            ? 'bg-teal-900/40 text-teal-300 border border-teal-500/30'
                            : s.punctualityCategory === 'On Time'
                            ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                            : s.punctualityCategory === 'Borderline'
                            ? 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                            : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {s.punctualityCategory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{s.attendanceRate}%</td>
                    <td className="py-2.5 px-3 font-bold text-slate-100">{s.midtermScore}%</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          passed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {passed ? 'PASSED' : 'SUBMERGED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
