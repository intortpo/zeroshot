import React from 'react';
import { LatentSkill } from '../../services/edmStorageService';

interface EdmRadarChartProps {
  skills: LatentSkill[];
  masteryProbabilities: Record<string, number>;
  cohortBenchmark?: number; // default 0.80
  size?: number;
  className?: string;
}

export const EdmRadarChart: React.FC<EdmRadarChartProps> = ({
  skills,
  masteryProbabilities,
  cohortBenchmark = 0.80,
  size = 320,
  className = '',
}) => {
  const center = size / 2;
  const radius = (size / 2) - 40;
  const numAxes = skills.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  // Helper to convert polar coordinates (radius, angle) to cartesian (x, y)
  const getCoordinates = (value: number, index: number): [number, number] => {
    // Start at top (-PI/2) and rotate clockwise
    const angle = index * angleSlice - Math.PI / 2;
    const r = radius * Math.max(0, Math.min(1, value));
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  // Grid level polygons (0.25, 0.50, 0.75, 1.00)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Calculate polygon points string for student mastery
  const studentPoints = skills
    .map((skill, i) => {
      const val = masteryProbabilities[skill.id] ?? 0.5;
      const [x, y] = getCoordinates(val, i);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Calculate polygon points string for cohort benchmark
  const benchmarkPoints = skills
    .map((skill, i) => {
      const val = skill.benchmarkTarget || cohortBenchmark;
      const [x, y] = getCoordinates(val, i);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid Rings */}
        {levels.map((lvl) => {
          const levelPoints = skills
            .map((_, i) => {
              const [x, y] = getCoordinates(lvl, i);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

          return (
            <g key={`level-${lvl}`}>
              <polygon
                points={levelPoints}
                fill={lvl === 1.0 ? '#f8fafc' : 'none'}
                stroke="#e2e8f0"
                strokeWidth={lvl === 1.0 ? '1.5' : '1'}
                strokeDasharray={lvl < 1.0 ? '3,3' : 'none'}
              />
              <text
                x={center + 4}
                y={center - radius * lvl + 10}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
              >
                {Math.round(lvl * 100)}%
              </text>
            </g>
          );
        })}

        {/* Spokes (Axes from center to periphery) */}
        {skills.map((skill, i) => {
          const [x, y] = getCoordinates(1.0, i);
          return (
            <line
              key={`spoke-${skill.id}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark Threshold Layer */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />

        {/* Student Latent Mastery Polygon */}
        <polygon
          points={studentPoints}
          fill="rgba(13, 148, 136, 0.22)" // Tiffany teal
          stroke="#0d9488"
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Data Point Markers on Vertexes */}
        {skills.map((skill, i) => {
          const val = masteryProbabilities[skill.id] ?? 0.5;
          const [x, y] = getCoordinates(val, i);
          const isMastered = val >= (skill.benchmarkTarget || cohortBenchmark);

          return (
            <g key={`marker-${skill.id}`} className="transition-all duration-300">
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill={isMastered ? '#0d9488' : '#e11d48'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* Axis Labels */}
        {skills.map((skill, i) => {
          const [x, y] = getCoordinates(1.18, i);
          const val = masteryProbabilities[skill.id] ?? 0.5;
          const isDeficit = val < 0.5;

          return (
            <g key={`label-${skill.id}`}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isDeficit ? '#be123c' : '#334155'}
                fontSize="10"
                fontWeight={isDeficit ? '700' : '500'}
                className="select-none"
              >
                {skill.name}
              </text>
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isDeficit ? '#e11d48' : '#0d9488'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="700"
              >
                {Math.round(val * 100)}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend Footer */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
          <span>Student Mastery (DINA CDM)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 border-t-2 border-dashed border-slate-400 inline-block" />
          <span>Curriculum Target</span>
        </div>
      </div>
    </div>
  );
};
