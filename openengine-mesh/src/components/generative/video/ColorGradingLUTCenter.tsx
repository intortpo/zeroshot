import React from 'react';
import { Palette, Sparkles, Sliders, Sun, Film, ShieldAlert } from 'lucide-react';
import {
  COLOR_LUT_PROFILES,
  ColorLUTId,
  ColorLUTProfile,
  OpticalFXSettings,
} from '../../../services/hyperframeVideoService';

interface ColorGradingLUTCenterProps {
  activeLut: ColorLUTProfile;
  onSelectLUT: (id: ColorLUTId) => void;
  opticalSettings: OpticalFXSettings;
  onUpdateOptical: (updates: Partial<OpticalFXSettings>) => void;
}

export const ColorGradingLUTCenter: React.FC<ColorGradingLUTCenterProps> = ({
  activeLut,
  onSelectLUT,
  opticalSettings,
  onUpdateOptical,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Cinematic Post-Processing & Real-Time Color Grading
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Active: {activeLut.name}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              5 curated 3D LUT profiles with real-time optical shader passes (anamorphic flares, grain, chromatic fringe).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onSelectLUT('tiffany-clean');
            onUpdateOptical({
              anamorphicFlare: 45,
              filmGrain: 20,
              bloom: 35,
              chromaticAberration: 15,
              vignette: 25,
            });
          }}
          className="text-xs text-slate-400 hover:text-slate-200 underline"
        >
          Reset Color Defaults
        </button>
      </div>

      {/* LUT Profile Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {COLOR_LUT_PROFILES.map(lut => {
          const isSelected = activeLut.id === lut.id;
          return (
            <button
              key={lut.id}
              onClick={() => onSelectLUT(lut.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800 border-teal-400 shadow-md ring-1 ring-teal-500/40'
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: lut.colorHex }} />
                <span className="text-[10px] font-mono text-slate-400">{lut.temperature.split(' ')[0]}</span>
              </div>
              <h4 className={`text-xs font-semibold mb-1 ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                {lut.name}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{lut.description}</p>
            </button>
          );
        })}
      </div>

      {/* Real-time Optical Shader Sliders */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-semibold text-slate-200">Optical Emulsion & Lens FX Shaders</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Anamorphic Flare */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Anamorphic Horizontal Streak
              </span>
              <span className="font-mono text-teal-400">{opticalSettings.anamorphicFlare}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.anamorphicFlare}
              onChange={e => onUpdateOptical({ anamorphicFlare: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Film Grain */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Film className="w-3 h-3 text-amber-400" />
                35mm Analog Film Grain
              </span>
              <span className="font-mono text-teal-400">{opticalSettings.filmGrain}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.filmGrain}
              onChange={e => onUpdateOptical({ filmGrain: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Bloom & Halation */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3 h-3 text-yellow-400" />
                Highlight Bloom & Halation
              </span>
              <span className="font-mono text-teal-400">{opticalSettings.bloom}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.bloom}
              onChange={e => onUpdateOptical({ bloom: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Chromatic Aberration */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-purple-400" />
                Chromatic Aberration Fringe
              </span>
              <span className="font-mono text-teal-400">{opticalSettings.chromaticAberration}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.chromaticAberration}
              onChange={e => onUpdateOptical({ chromaticAberration: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg accent-teal-400 cursor-pointer"
            />
          </div>

          {/* Vignette */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-slate-400" />
                Peripheral Edge Vignette
              </span>
              <span className="font-mono text-teal-400">{opticalSettings.vignette}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.vignette}
              onChange={e => onUpdateOptical({ vignette: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg accent-teal-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
