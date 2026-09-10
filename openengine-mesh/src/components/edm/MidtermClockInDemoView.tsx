import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Grid,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ClockInRadialDial } from './charts/ClockInRadialDial';
import { MidtermIrtEvaluator } from './charts/MidtermIrtEvaluator';
import { LieflatAlmanacGrid } from './charts/LieflatAlmanacGrid';
import { ChartOptionDefinition } from '../../services/lieflatCatalogService';
import { PetriColorCustomizer } from '../common/PetriColorCustomizer';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-900/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 mb-1">
            <span>Petri EDM</span>
            <span>/</span>
            <span>STUDIO</span>
            <span>/</span>
            <span className="text-slate-400">MIDTERM & CLOCK-IN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>Midterm & Clock-In Studio</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-mono font-semibold bg-[#071620] text-teal-300 border border-teal-700/50">
              110+ Chart Options
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <PetriColorCustomizer />

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-2 rounded-xl bg-[#071620] border border-teal-900/50 hover:border-teal-700/60 text-xs font-mono font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to EDM Studio
            </button>
          )}
        </div>
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
          {/* Key Empirical Takeaways Banner - Solid Obsidian */}
          <div className="bg-[#071620] border border-teal-900/40 rounded-2xl p-5 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#041017] border border-teal-800/60 rounded-xl text-teal-300">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    Circadian Clock-In & Exam Mastery Telemetry
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#041017] border border-teal-800 text-teal-300 font-bold">
                      r = 0.784
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#041017] border border-teal-800 text-teal-300 font-bold">
                      p &lt; 0.001
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-teal-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 849 Student Population
                  </span>
                  <span className="flex items-center gap-1.5 text-teal-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 25 Item IRT 2PL Validation
                  </span>
                  <span className="flex items-center gap-1.5 text-teal-300">
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
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs font-mono whitespace-nowrap cursor-pointer transition-colors shadow-xs"
            >
              Open 110+ Chart Almanac
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MIDTERM EVALUATION STUDIO */}
      {activeTab === 'midterm' && (
        <div className="space-y-4">
          <MidtermIrtEvaluator />
        </div>
      )}

      {/* TAB 3: CLOCK-IN TELEMETRY STUDIO */}
      {activeTab === 'clock_in' && (
        <div className="space-y-4">
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
