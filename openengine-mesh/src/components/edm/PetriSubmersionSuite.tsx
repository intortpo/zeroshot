import React, { useState, useMemo } from 'react';
import { StudentEdmRecord } from '../../services/edmStorageService';
import { LieflatColorMode } from './charts/lieflatTheme';
import { SubmersionWaveRidge } from './charts/SubmersionWaveRidge';
import { SubmersionLollipopAlmanac } from './charts/SubmersionLollipopAlmanac';
import { SubmersionGlanceSprint } from './charts/SubmersionGlanceSprint';
import { SubmersionForceNetwork } from './charts/SubmersionForceNetwork';
import { PetriHourglassStream } from './PetriHourglassStream';
import { PetriSubmersionCanvas } from './PetriSubmersionCanvas';
import {
  Waves,
  Pin,
  Zap,
  Share2,
  Hourglass,
  Box,
  Palette,
  Sliders,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface PetriSubmersionSuiteProps {
  students: StudentEdmRecord[];
  selectedStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
}

type ChartFamily =
  | 'wave_ridge'
  | 'lollipop_almanac'
  | 'glance_sprint'
  | 'force_network'
  | 'hourglass_stream'
  | 'volumetric_manifold';

export const PetriSubmersionSuite: React.FC<PetriSubmersionSuiteProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
}) => {
  const [activeFamily, setActiveFamily] = useState<ChartFamily>('wave_ridge');
  const [colorMode, setColorMode] = useState<LieflatColorMode>('tiffany');
  const [waterlineElevation, setWaterlineElevation] = useState<number>(0.0);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Selected student record
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  // Compute live telemetry based on waterline elevation
  const telemetry = useMemo(() => {
    const total = students.length;
    let submerged = 0;
    let sumVelocity = 0;

    students.forEach((s) => {
      sumVelocity += s.compositeVelocity;
      const skills = Object.values(s.latentMastery);
      const avgMastery = skills.length > 0 ? skills.reduce((a, b) => a + b, 0) / skills.length : 0.5;
      const elev = (avgMastery - 0.5) * 2 - waterlineElevation;
      if (elev < 0) submerged++;
    });

    const submersionRate = total > 0 ? (submerged / total) * 100 : 0;
    const meanVelocity = total > 0 ? sumVelocity / total : 0;

    return {
      total,
      submerged,
      submersionRate,
      meanVelocity,
    };
  }, [students, waterlineElevation]);

  const handleExportSnapshot = () => {
    const dataSnapshot = {
      timestamp: new Date().toISOString(),
      activeFamily,
      colorMode,
      waterlineElevation,
      telemetry,
      sampleCohort: students.slice(0, 10).map((s) => ({
        id: s.id,
        pseudonym: s.pseudonym,
        qsvcRiskLevel: s.qsvcRiskLevel,
        compositeVelocity: s.compositeVelocity,
      })),
    };

    const blob = new Blob([JSON.stringify(dataSnapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petri-submersion-${activeFamily}-${colorMode}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice(`Exported Lieflat ${activeFamily} snapshot (${colorMode} palette).`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Suite Control Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-teal-400 font-bold">
                Petri 3D Submersion Analytics Suite
              </span>
              <span className="text-xs text-stone-500">· Grounded in Lieflat Charts Visual Language</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Volumetric Manifolds & Editorial Data Stories
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Lifting Lupi Editorial, Glance, and Interactive networks into the 3D Submersion continuum.
            </p>
          </div>

          {/* Color Mode Selector (5 Modes) */}
          <div className="flex items-center space-x-1.5 bg-black/60 border border-stone-800 p-1.5 rounded-2xl">
            <span className="text-[10px] font-mono text-stone-400 px-2 uppercase font-semibold flex items-center space-x-1">
              <Palette className="w-3 h-3 text-stone-400" />
              <span>Palette:</span>
            </span>

            {[
              { id: 'mono', label: 'Mono', color: '#E5E7EB' },
              { id: 'porcelain', label: 'Porcelain', color: '#38BDF8' },
              { id: 'palm', label: 'Palm', color: '#10B981' },
              { id: 'wire', label: 'Wire', color: '#FF5722' },
              { id: 'tiffany', label: 'Tiffany', color: '#0ABAB5' },
            ].map((pm) => (
              <button
                key={pm.id}
                onClick={() => setColorMode(pm.id as LieflatColorMode)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  colorMode === pm.id
                    ? 'bg-stone-800 text-white shadow-xs border border-stone-700'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: pm.color }}
                />
                <span>{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Waterline Slider & Telemetry HUD */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-stone-800/80 items-center">
          {/* Waterline Elevation Slider */}
          <div className="md:col-span-5 bg-black/40 border border-stone-800/80 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-400 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-400" />
                <span>Waterline Risk Elevation (Z):</span>
              </span>
              <span className="font-bold text-teal-300 font-mono">
                {waterlineElevation > 0 ? '+' : ''}
                {waterlineElevation.toFixed(2)}σ
              </span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.05"
              value={waterlineElevation}
              onChange={(e) => setWaterlineElevation(parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span>-2.0σ (Permissive)</span>
              <span>0.0σ Baseline</span>
              <span>+2.0σ (Strict)</span>
            </div>
          </div>

          {/* Telemetry HUD Numbers */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-black/40 border border-stone-800/80 p-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Enrolled Cohort</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">{telemetry.total}</div>
            </div>

            <div className="bg-black/40 border border-stone-800/80 p-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Submerged Deficits</div>
              <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                {telemetry.submerged}
              </div>
            </div>

            <div className="bg-black/40 border border-stone-800/80 p-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Submersion Rate</div>
              <div className="text-lg font-black text-teal-300 font-mono mt-0.5">
                {telemetry.submersionRate.toFixed(1)}%
              </div>
            </div>

            <div className="bg-black/40 border border-stone-800/80 p-2.5 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-stone-500 uppercase">Cohort Velocity</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {telemetry.meanVelocity > 0 ? '+' : ''}
                {telemetry.meanVelocity.toFixed(2)}/w
              </div>
            </div>
          </div>
        </div>

        {/* Chart Family Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              {
                id: 'wave_ridge',
                label: '1. Lupi Wave (Fifty Cohorts, One Wave)',
                icon: Waves,
                badge: '3D Terrain',
              },
              {
                id: 'lollipop_almanac',
                label: '2. Barcode Lollipop Almanac',
                icon: Pin,
                badge: 'Countable Units',
              },
              {
                id: 'glance_sprint',
                label: '3. Glance Velocity Sprint',
                icon: Zap,
                badge: 'Fast Ranking',
              },
              {
                id: 'force_network',
                label: '4. 3D Force Graph DAG',
                icon: Share2,
                badge: 'Interactive',
              },
              {
                id: 'hourglass_stream',
                label: '5. The Funnel, Poured (Hourglass)',
                icon: Hourglass,
                badge: 'Lupi Editorial',
              },
              {
                id: 'volumetric_manifold',
                label: '6. 3D Volumetric Manifold',
                icon: Box,
                badge: 'Full WebGL',
              },
            ].map((f) => {
              const IconComp = f.icon;
              const isActive = activeFamily === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFamily(f.id as ChartFamily)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportSnapshot}
            className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Snapshot</span>
          </button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="bg-teal-950 border border-teal-700/80 p-3 rounded-2xl flex items-center justify-between text-xs text-teal-200 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-teal-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Chart Display Area */}
      <div className="w-full">
        {activeFamily === 'wave_ridge' && (
          <SubmersionWaveRidge
            students={students}
            colorMode={colorMode}
            waterlineElevation={waterlineElevation}
            height={440}
            onSelectStudent={onSelectStudent}
          />
        )}

        {activeFamily === 'lollipop_almanac' && (
          <SubmersionLollipopAlmanac
            students={students}
            colorMode={colorMode}
            waterlineElevation={waterlineElevation}
            height={440}
            onSelectStudent={onSelectStudent}
          />
        )}

        {activeFamily === 'glance_sprint' && (
          <SubmersionGlanceSprint
            students={students}
            colorMode={colorMode}
            waterlineElevation={waterlineElevation}
            height={440}
            onSelectStudent={onSelectStudent}
          />
        )}

        {activeFamily === 'force_network' && (
          <SubmersionForceNetwork
            students={students}
            colorMode={colorMode}
            waterlineElevation={waterlineElevation}
            height={440}
            onSelectStudent={onSelectStudent}
          />
        )}

        {activeFamily === 'hourglass_stream' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl">
            <PetriHourglassStream
              initialMode="chat_cognition"
            />
          </div>
        )}

        {activeFamily === 'volumetric_manifold' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl">
            <PetriSubmersionCanvas
              student={selectedStudent}
              cohort={students}
              initialMode="cohort_velocity_field"
              onSelectStudent={onSelectStudent}
              height={440}
            />
          </div>
        )}
      </div>
    </div>
  );
};
