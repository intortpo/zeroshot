import React, { useState } from 'react';
import { X, Palette, Check, Type, Box } from 'lucide-react';
import { DesignTokenSystem } from '../../../services/openDesignService';

interface ThemeTokenInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: DesignTokenSystem;
  onApplyTokens: (updated: DesignTokenSystem, applyToAllPages: boolean) => void;
}

const THEME_PRESETS: Array<{
  id: string;
  name: string;
  palette: DesignTokenSystem['palette'];
}> = [
  {
    id: 'tiffany',
    name: 'Petri Tiffany Clean',
    palette: {
      primary: '#0ABAB5',
      secondary: '#4F46E5',
      background: '#FAFBFB',
      surface: '#FFFFFF',
      text: '#1C1917',
      accent: '#0D9488',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Neon',
    palette: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      accent: '#06B6D4',
    },
  },
  {
    id: 'academic',
    name: 'Academic Slate',
    palette: {
      primary: '#0D9488',
      secondary: '#0284C7',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#0F172A',
      accent: '#E11D48',
    },
  },
  {
    id: 'cyber',
    name: 'Cyber Dark',
    palette: {
      primary: '#10B981',
      secondary: '#6366F1',
      background: '#090D16',
      surface: '#121826',
      text: '#F1F5F9',
      accent: '#F59E0B',
    },
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    palette: {
      primary: '#F97316',
      secondary: '#D946EF',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: '#451A03',
      accent: '#0284C7',
    },
  },
  {
    id: 'monochrome',
    name: 'Minimalist Monochrome',
    palette: {
      primary: '#18181B',
      secondary: '#52525B',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#09090B',
      accent: '#71717A',
    },
  },
];

export const ThemeTokenInspectorModal: React.FC<ThemeTokenInspectorModalProps> = ({
  isOpen,
  onClose,
  tokens,
  onApplyTokens,
}) => {
  const [currentTokens, setCurrentTokens] = useState<DesignTokenSystem>(tokens);
  const [applyToAll, setApplyToAll] = useState(true);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: (typeof THEME_PRESETS)[0]) => {
    setCurrentTokens((prev) => ({
      ...prev,
      name: preset.name,
      palette: { ...preset.palette },
    }));
  };

  const handlePaletteChange = (key: keyof DesignTokenSystem['palette'], value: string) => {
    setCurrentTokens((prev) => ({
      ...prev,
      palette: {
        ...prev.palette,
        [key]: value,
      },
    }));
  };

  const handleFontChange = (font: string) => {
    setCurrentTokens((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        fontFamily: font,
      },
    }));
  };

  const handleRadiiChange = (radii: string) => {
    setCurrentTokens((prev) => ({
      ...prev,
      radii: {
        ...prev.radii,
        md: radii,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyTokens(currentTokens, applyToAll);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Theme & Design Token Inspector</h3>
              <p className="text-[11px] text-stone-500">
                Configure brand typography, color palette, and component curvature across your product.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Preset Palettes */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800 text-[11px] uppercase tracking-wider font-mono">
              Curated Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {THEME_PRESETS.map((p) => {
                const isSelected = currentTokens.palette.primary === p.palette.primary;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100/70'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-stone-900 text-xs">{p.name}</div>
                      <div className="flex items-center space-x-1.5 mt-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: p.palette.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: p.palette.secondary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: p.palette.background }}
                        />
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Color Swatches */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800 text-[11px] uppercase tracking-wider font-mono">
              Palette Customization
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                [
                  ['primary', 'Primary Accent'],
                  ['secondary', 'Secondary Accent'],
                  ['background', 'Canvas Background'],
                  ['surface', 'Card Surface'],
                  ['text', 'Primary Typography'],
                  ['accent', 'Pill / Warning Accent'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
                  <div className="text-[10px] text-stone-500 font-medium">{label}</div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentTokens.palette[key]}
                      onChange={(e) => handlePaletteChange(key, e.target.value)}
                      className="w-7 h-7 rounded-lg border border-stone-300 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentTokens.palette[key]}
                      onChange={(e) => handlePaletteChange(key, e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-stone-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography & Radii */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <label className="font-bold text-stone-800 text-[11px] uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Type className="w-3.5 h-3.5 text-stone-500" />
                <span>Typography Scale</span>
              </label>
              <select
                value={currentTokens.typography.fontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="Inter, system-ui, sans-serif">Inter (Modern Clean)</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono (Technical / Code)</option>
                <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Geometric B2B)</option>
                <option value="Georgia, serif">Georgia (Editorial & Academic)</option>
                <option value="system-ui, sans-serif">System Native</option>
              </select>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
              <label className="font-bold text-stone-800 text-[11px] uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Box className="w-3.5 h-3.5 text-stone-500" />
                <span>Card Curvature (Radius)</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  ['0px', 'Sharp'],
                  ['8px', 'Subtle'],
                  ['16px', 'Smooth'],
                  ['24px', 'Pill'],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRadiiChange(val)}
                    className={`py-2 text-[10px] font-bold rounded-xl border transition ${
                      currentTokens.radii.md === val
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scope Selection */}
          <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-teal-900">Propagation Scope</span>
              <p className="text-[11px] text-teal-700">Apply token updates to all pages in this product?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition"
          >
            Apply Design Tokens
          </button>
        </div>
      </div>
    </div>
  );
};
