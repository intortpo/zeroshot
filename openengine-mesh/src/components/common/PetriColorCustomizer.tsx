import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw, Check } from 'lucide-react';
import { themeColorService, THEME_PRESETS, PetriThemeColors } from '../../services/themeColorService';

interface PetriColorCustomizerProps {
  className?: string;
}

export const PetriColorCustomizer: React.FC<PetriColorCustomizerProps> = ({ className = '' }) => {
  const [colors, setColors] = useState<PetriThemeColors>(() => themeColorService.getColors());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<PetriThemeColors>;
      if (customEvent.detail) {
        setColors(customEvent.detail);
      }
    };
    window.addEventListener('petri_theme_changed', handler);
    return () => window.removeEventListener('petri_theme_changed', handler);
  }, []);

  const handleColorChange = (key: keyof PetriThemeColors, value: string) => {
    themeColorService.setColors({ [key]: value });
  };

  const handleApplyPreset = (presetKey: keyof typeof THEME_PRESETS) => {
    themeColorService.applyPreset(presetKey);
  };

  const handleReset = () => {
    themeColorService.resetToDefault();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#071620] border border-teal-900/40 text-teal-300 hover:text-teal-100 hover:border-teal-700/60 text-xs font-mono transition-colors cursor-pointer shadow-xs"
        title="Customize Color Palette"
      >
        <Palette className="w-3.5 h-3.5 text-teal-400" />
        <span>Theme Colors</span>
        <div
          className="w-3 h-3 rounded-full border border-teal-500/40"
          style={{ backgroundColor: colors.primary }}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-[#071620] border border-teal-900/60 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4 font-sans select-none">
          <div className="flex items-center justify-between border-b border-teal-900/40 pb-2.5">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
                Color Scheme
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] font-mono text-slate-400 hover:text-teal-300 flex items-center space-x-1 cursor-pointer transition-colors"
              title="Reset to Tiffany Default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                const isActive = colors.primary.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={key}
                    onClick={() => handleApplyPreset(key as keyof typeof THEME_PRESETS)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'bg-teal-950/80 border-teal-500/80 text-teal-200 font-semibold'
                        : 'bg-[#041017] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-[11px] font-mono truncate">{preset.name.split(' ')[0]}</span>
                    </div>
                    {isActive && <Check className="w-3 h-3 text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Individual Hex Controls */}
          <div className="space-y-2 pt-1 border-t border-teal-900/40">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Custom Channels
            </span>

            {/* Primary Channel */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="text-[11px]">Primary</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-18 px-1.5 py-0.5 rounded bg-[#041017] border border-teal-900/50 text-[10px] text-teal-200 text-right uppercase"
                />
              </div>
            </div>

            {/* Secondary Channel */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="text-[11px]">Secondary</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-18 px-1.5 py-0.5 rounded bg-[#041017] border border-teal-900/50 text-[10px] text-teal-200 text-right uppercase"
                />
              </div>
            </div>

            {/* Waterline Channel */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="text-[11px]">Waterline</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colors.waterline}
                  onChange={(e) => handleColorChange('waterline', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.waterline}
                  onChange={(e) => handleColorChange('waterline', e.target.value)}
                  className="w-18 px-1.5 py-0.5 rounded bg-[#041017] border border-teal-900/50 text-[10px] text-teal-200 text-right uppercase"
                />
              </div>
            </div>

            {/* Surge Channel */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="text-[11px]">Surge / Peak</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colors.surge}
                  onChange={(e) => handleColorChange('surge', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={colors.surge}
                  onChange={(e) => handleColorChange('surge', e.target.value)}
                  className="w-18 px-1.5 py-0.5 rounded bg-[#041017] border border-teal-900/50 text-[10px] text-teal-200 text-right uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
