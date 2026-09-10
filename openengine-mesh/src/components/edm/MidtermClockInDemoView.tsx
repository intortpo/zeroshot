import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Grid,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { ClockInRadialDial } from './charts/ClockInRadialDial';
import { MidtermIrtEvaluator } from './charts/MidtermIrtEvaluator';
import { LieflatAlmanacGrid } from './charts/LieflatAlmanacGrid';
import { ChartOptionDefinition } from '../../services/lieflatCatalogService';

type TabMode = 'overview' | 'midterm' | 'clock_in' | 'almanac';

interface MidtermClockInDemoViewProps {
  onBackToDashboard?: () => void;
  className?: string;
}

export const MidtermClockInDemoView: React.FC<MidtermClockInDemoViewProps> = ({
  onBackToDashboard,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('overview');
  const [selectedChartOption, setSelectedChartOption] = useState<ChartOptionDefinition | null>(null);

  const handleSelectChartFromAlmanac = (chart: ChartOptionDefinition) => {
    setSelectedChartOption(chart);
    if (chart.archetype === 'midterm_exam') {
      setActiveTab('midterm');
    } else if (chart.archetype === 'clock_in_temporal') {
      setActiveTab('clock_in');
    }
  };

  return (
    <div className={`space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 text-slate-100 ${className}`}>
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <span>Petri EDM</span>
            <span>/</span>
            <span>LONGITUDINAL DEMO</span>
            <span>/</span>
            <span className="text-slate-400">MIDTERM & CLOCK-IN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            Midterm Exam & Clock-In Telemetry Studio
            <span className="text-xs px-2.5 py-1 rounded-full font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              110+ Chart Almanac
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Live demonstration of Lieflat Submersion charting capabilities: bimodal IRT examination evaluation,
            circadian 24-hour radial punch clocks, longitudinal attendance heatmaps, and a comprehensive 110+ chart taxonomy.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-teal-500/50 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            ← Back to EDM Dashboard
          </button>
        )}
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overview & Correlation Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('midterm')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'midterm'
              ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Midterm Evaluation Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('clock_in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'clock_in'
              ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Clock-In Telemetry Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('almanac')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'almanac'
              ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>100+ Chart Possibilities Almanac</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/40 text-slate-300 font-mono">
            110+
          </span>
        </button>
      </div>

      {/* Selected Chart Callout (if selected from Almanac) */}
      {selectedChartOption && (
        <div className="bg-teal-950/40 border border-teal-500/40 rounded-xl p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400">Active Archetype: </span>
              <strong className="text-teal-300">{selectedChartOption.name}</strong>
              <span className="text-slate-400 ml-2">({selectedChartOption.category})</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedChartOption(null)}
            className="text-[11px] text-teal-400 hover:text-teal-200 font-mono underline"
          >
            Clear Archetype Focus
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & SYNTHESIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Empirical Takeaways Banner */}
          <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950/80 border border-teal-500/30 rounded-2xl p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300">
                <Award className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100">
                  Empirical Finding: Circadian Clock-In Punctuality Directly Predicts Exam Mastery
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                  Analysis of 849 students across 16 weeks demonstrates a strong positive Pearson correlation
                  (<strong className="text-teal-300 font-mono">r = 0.784, p &lt; 0.001</strong>) between early check-in
                  behavior and midterm exam scores. Students clocking in during the morning surge window (07:45 – 08:15 AM)
                  achieve an average score of <strong className="text-emerald-400 font-mono">86.4%</strong>, compared to
                  <strong className="text-amber-400 font-mono"> 58.7%</strong> for irregular or tardy cohorts.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-teal-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 849 Student Population
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 25 Item IRT 2PL Validation
                  </span>
                  <span className="flex items-center gap-1.5 text-teal-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 16-Week Longitudinal Heatmap
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Dual Studios */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-400" />
                  Midterm Examination Evaluation
                </h3>
                <button
                  onClick={() => setActiveTab('midterm')}
                  className="text-xs text-teal-400 hover:text-teal-300 font-mono font-semibold"
                >
                  Full Studio →
                </button>
              </div>
              <MidtermIrtEvaluator />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  Clock-In Chronometer & Punch Card
                </h3>
                <button
                  onClick={() => setActiveTab('clock_in')}
                  className="text-xs text-teal-400 hover:text-teal-300 font-mono font-semibold"
                >
                  Full Studio →
                </button>
              </div>
              <ClockInRadialDial />
            </div>
          </div>

          {/* Quick Jump to Almanac */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  Explore 110+ More Lieflat Chart Possibilities
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Wave ridges, lollipop almanacs, glance sprints, stream funnels, 3D submersions, and tactical matrices.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('almanac')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md shadow-teal-500/20"
            >
              Open 110+ Chart Encyclopedia
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MIDTERM EVALUATION STUDIO */}
      {activeTab === 'midterm' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>
              Adjust the passing grade threshold slider in real-time to watch examinees transition across the waterline.
              Inspect the IRT 2PL difficulty and discrimination curve for all 25 exam items.
            </span>
          </div>
          <MidtermIrtEvaluator />
        </div>
      )}

      {/* TAB 3: CLOCK-IN TELEMETRY STUDIO */}
      {activeTab === 'clock_in' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>
              The 24-hour circular radial chronometer displays circadian punch volumes. Click &quot;Simulate Live Clock-In&quot; to inject
              real-time biometrics events into the live gateway stream.
            </span>
          </div>
          <ClockInRadialDial />
        </div>
      )}

      {/* TAB 4: 100+ CHART POSSIBILITIES ALMANAC */}
      {activeTab === 'almanac' && (
        <div className="space-y-4">
          <LieflatAlmanacGrid onSelectChart={handleSelectChartFromAlmanac} />
        </div>
      )}
    </div>
  );
};
