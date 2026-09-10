import React, { useState, useMemo } from 'react';
import {
  Search,
  Grid,
  Sparkles,
  Tag,
  Check,
  Zap,
  ChevronRight,
  X,
  Compass
} from 'lucide-react';
import {
  lieflatCatalogService,
  ChartOptionDefinition,
  LieflatArchetype,
  LIEFLAT_ARCHETYPES_METADATA
} from '../../../services/lieflatCatalogService';

interface LieflatAlmanacGridProps {
  onSelectChart?: (chart: ChartOptionDefinition) => void;
  className?: string;
}

export const LieflatAlmanacGrid: React.FC<LieflatAlmanacGridProps> = ({
  onSelectChart,
  className = '',
}) => {
  const [selectedArchetype, setSelectedArchetype] = useState<LieflatArchetype | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePreviewChart, setActivePreviewChart] = useState<ChartOptionDefinition | null>(null);
  const [dimensionFilter, setDimensionFilter] = useState<string>('ALL');

  const allCharts = useMemo(() => lieflatCatalogService.getAllCharts(), []);

  const filteredCharts = useMemo(() => {
    return allCharts.filter((chart) => {
      // Archetype filter
      if (selectedArchetype !== 'all' && chart.archetype !== selectedArchetype) {
        return false;
      }
      // Dimensionality filter
      if (dimensionFilter !== 'ALL' && chart.dimensionality !== dimensionFilter) {
        return false;
      }
      // Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        chart.name.toLowerCase().includes(q) ||
        chart.description.toLowerCase().includes(q) ||
        chart.category.toLowerCase().includes(q) ||
        chart.tags.some((t) => t.toLowerCase().includes(q)) ||
        (chart.mathFormula && chart.mathFormula.toLowerCase().includes(q))
      );
    });
  }, [allCharts, selectedArchetype, dimensionFilter, searchQuery]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-teal-500/20 rounded-xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  Lieflat 100+ Chart Encyclopedia & Possibilities Almanac
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {allCharts.length} Verified Options
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Grounded in the canonical Lieflat Submersion specification across 10 distinct visualization archetypes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search 110+ chart types, formulas, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 w-64 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dimensionality Filter */}
            <select
              value={dimensionFilter}
              onChange={(e) => setDimensionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500 font-mono"
            >
              <option value="ALL">All Dimensions</option>
              <option value="2D">2D Planar</option>
              <option value="2.5D">2.5D Isometric</option>
              <option value="3D Submersion">3D Submersion</option>
            </select>
          </div>
        </div>

        {/* Archetype Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setSelectedArchetype('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedArchetype === 'all'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All Archetypes ({allCharts.length})
          </button>

          {LIEFLAT_ARCHETYPES_METADATA.map((arch) => {
            const count = allCharts.filter((c) => c.archetype === arch.id).length;
            const isSelected = selectedArchetype === arch.id;

            return (
              <button
                key={arch.id}
                onClick={() => setSelectedArchetype(arch.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{arch.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCharts.map((chart) => {
          return (
            <div
              key={chart.id}
              onClick={() => {
                setActivePreviewChart(chart);
                if (onSelectChart) onSelectChart(chart);
              }}
              className="bg-slate-900/70 border border-slate-800 hover:border-teal-500/50 rounded-xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/5 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700/60 font-semibold">
                    {chart.category}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      chart.dimensionality === '3D Submersion'
                        ? 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                        : chart.dimensionality === '2.5D'
                        ? 'bg-teal-900/40 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {chart.dimensionality}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition-colors line-clamp-1">
                  {chart.name}
                </h4>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {chart.description}
                </p>

                {chart.mathFormula && (
                  <div className="mt-2.5 p-1.5 rounded bg-slate-950/70 border border-slate-850 font-mono text-[10px] text-teal-300 truncate">
                    ƒ: {chart.mathFormula}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {chart.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] text-slate-500 font-mono bg-slate-800/50 px-1.5 py-0.5 rounded flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-600" />
                      {tag}
                    </span>
                  ))}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredCharts.length === 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center">
          <Compass className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-spin" />
          <h4 className="text-sm font-bold text-slate-300">No chart options match your query</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or selecting a different archetype filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedArchetype('all');
              setDimensionFilter('ALL');
            }}
            className="mt-4 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-teal-400 font-mono"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Modal Preview Drawer for Selected Chart */}
      {activePreviewChart && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActivePreviewChart(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {activePreviewChart.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ID: {activePreviewChart.id}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-500/30 ml-auto mr-8">
                {activePreviewChart.dimensionality}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-2">
              {activePreviewChart.name}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {activePreviewChart.description}
            </p>

            {activePreviewChart.mathFormula && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4">
                <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Canonical Mathematical Formulation
                </div>
                <div className="font-mono text-xs text-teal-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 overflow-x-auto">
                  {activePreviewChart.mathFormula}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                <div className="text-[10px] font-mono uppercase text-slate-500">Recommended Use Case</div>
                <div className="text-xs text-slate-200 mt-1">{activePreviewChart.recommendedFor}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                <div className="text-[10px] font-mono uppercase text-slate-500">Interactive Waterline</div>
                <div className="text-xs font-semibold text-teal-400 mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {activePreviewChart.waterlineInteractive
                    ? 'Supported (Dynamic Real-time Threshold)'
                    : 'Static Reference Plane'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Taxonomy Tags:</span>
              {activePreviewChart.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-teal-300 border border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActivePreviewChart(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  if (onSelectChart) onSelectChart(activePreviewChart);
                  setActivePreviewChart(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                Select Archetype for Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
