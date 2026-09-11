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
    <div className="bg-[#FAF8F3] border border-[#1A1D1A]/15 rounded-2xl p-5 shadow-xs font-mono text-[#1A1D1A]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#1A1D1A]/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F0ECE1] text-teal-800 border border-[#1A1D1A]/15">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1A1D1A] tracking-wide flex items-center gap-2">
              Cinematic Post-Processing & Real-Time Color Grading
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#F0ECE1] text-[#1A1D1A] border border-[#1A1D1A]/20">
                Active: {activeLut.name}
              </span>
            </h3>
            <p className="text-xs text-[#1A1D1A]/60">
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
          className="text-xs text-[#1A1D1A]/60 hover:text-[#1A1D1A] underline"
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
                  ? 'bg-[#F6F3EC] border-[#1A1D1A] shadow-xs ring-2 ring-[#1A1D1A]/15'
                  : 'bg-[#FAF8F3] border-[#1A1D1A]/15 hover:border-[#1A1D1A]/35'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: lut.colorHex }} />
                <span className="text-[10px] font-mono text-[#1A1D1A]/60">{lut.temperature.split(' ')[0]}</span>
              </div>
              <h4 className={`text-xs font-semibold mb-1 ${isSelected ? 'text-[#1A1D1A] font-bold' : 'text-[#1A1D1A]/80'}`}>
                {lut.name}
              </h4>
              <p className="text-[11px] text-[#1A1D1A]/60 leading-snug line-clamp-2">{lut.description}</p>
            </button>
          );
        })}
      </div>

      {/* Real-time Optical Shader Sliders */}
      <div className="bg-[#F6F3EC] border border-[#1A1D1A]/15 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-teal-800" />
          <h4 className="text-xs font-semibold text-[#1A1D1A]">Optical Emulsion & Lens FX Shaders</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Anamorphic Flare */}
          <div>
            <div className="flex justify-between text-xs text-[#1A1D1A]/80 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-teal-700" />
                Anamorphic Horizontal Streak
              </span>
              <span className="font-mono text-teal-800 font-bold">{opticalSettings.anamorphicFlare}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.anamorphicFlare}
              onChange={e => onUpdateOptical({ anamorphicFlare: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#F0ECE1] rounded-lg accent-[#1A1D1A] cursor-pointer"
            />
          </div>

          {/* Film Grain */}
          <div>
            <div className="flex justify-between text-xs text-[#1A1D1A]/80 mb-1">
              <span className="flex items-center gap-1.5">
                <Film className="w-3 h-3 text-amber-700" />
                35mm Analog Film Grain
              </span>
              <span className="font-mono text-teal-800 font-bold">{opticalSettings.filmGrain}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.filmGrain}
              onChange={e => onUpdateOptical({ filmGrain: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#F0ECE1] rounded-lg accent-[#1A1D1A] cursor-pointer"
            />
          </div>

          {/* Bloom & Halation */}
          <div>
            <div className="flex justify-between text-xs text-[#1A1D1A]/80 mb-1">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3 h-3 text-amber-600" />
                Highlight Bloom & Halation
              </span>
              <span className="font-mono text-teal-800 font-bold">{opticalSettings.bloom}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.bloom}
              onChange={e => onUpdateOptical({ bloom: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#F0ECE1] rounded-lg accent-[#1A1D1A] cursor-pointer"
            />
          </div>

          {/* Chromatic Aberration */}
          <div>
            <div className="flex justify-between text-xs text-[#1A1D1A]/80 mb-1">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-purple-700" />
                Chromatic Aberration Fringe
              </span>
              <span className="font-mono text-teal-800 font-bold">{opticalSettings.chromaticAberration}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.chromaticAberration}
              onChange={e => onUpdateOptical({ chromaticAberration: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#F0ECE1] rounded-lg accent-[#1A1D1A] cursor-pointer"
            />
          </div>

          {/* Vignette */}
          <div>
            <div className="flex justify-between text-xs text-[#1A1D1A]/80 mb-1">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-[#1A1D1A]/60" />
                Peripheral Edge Vignette
              </span>
              <span className="font-mono text-teal-800 font-bold">{opticalSettings.vignette}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opticalSettings.vignette}
              onChange={e => onUpdateOptical({ vignette: Number(e.target.value) })}
              className="w-full h-1.5 bg-[#F0ECE1] rounded-lg accent-[#1A1D1A] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
