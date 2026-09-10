export interface PetriThemeColors {
  name: string;
  primary: string;
  secondary: string;
  waterline: string;
  surge: string;
  surface: string;
  background: string;
}

export const THEME_PRESETS: Record<string, PetriThemeColors> = {
  tiffany: {
    name: 'Tiffany Solid (Default)',
    primary: '#0D9488',
    secondary: '#14B8A6',
    waterline: '#0ABAB5',
    surge: '#5EEAD4',
    surface: '#071620',
    background: '#041017',
  },
  emerald: {
    name: 'Emerald Precision',
    primary: '#059669',
    secondary: '#10B981',
    waterline: '#34D399',
    surge: '#6EE7B7',
    surface: '#051b14',
    background: '#020d09',
  },
  cyan: {
    name: 'Arctic Cyan',
    primary: '#0891B2',
    secondary: '#06B6D4',
    waterline: '#22D3EE',
    surge: '#67E8F9',
    surface: '#081c24',
    background: '#041117',
  },
  monochrome: {
    name: 'Monochrome Steel',
    primary: '#475569',
    secondary: '#64748B',
    waterline: '#94A3B8',
    surge: '#CBD5E1',
    surface: '#0f172a',
    background: '#020617',
  },
};

const STORAGE_KEY = 'petri_custom_theme_colors';

class ThemeColorService {
  private currentColors: PetriThemeColors;

  constructor() {
    this.currentColors = this.loadColors();
    this.applyCssVariables();
  }

  private loadColors(): PetriThemeColors {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...THEME_PRESETS.tiffany, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return THEME_PRESETS.tiffany;
  }

  public getColors(): PetriThemeColors {
    return this.currentColors;
  }

  public setColors(colors: Partial<PetriThemeColors>) {
    this.currentColors = { ...this.currentColors, ...colors };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentColors));
    } catch {
      // ignore
    }
    this.applyCssVariables();
    window.dispatchEvent(new CustomEvent('petri_theme_changed', { detail: this.currentColors }));
  }

  public applyPreset(presetKey: keyof typeof THEME_PRESETS) {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      this.setColors(preset);
    }
  }

  public resetToDefault() {
    this.setColors(THEME_PRESETS.tiffany);
  }

  private applyCssVariables() {
    const root = document.documentElement;
    root.style.setProperty('--petri-primary', this.currentColors.primary);
    root.style.setProperty('--petri-secondary', this.currentColors.secondary);
    root.style.setProperty('--petri-waterline', this.currentColors.waterline);
    root.style.setProperty('--petri-surge', this.currentColors.surge);
    root.style.setProperty('--petri-surface', this.currentColors.surface);
    root.style.setProperty('--petri-bg', this.currentColors.background);
  }
}

export const themeColorService = new ThemeColorService();
