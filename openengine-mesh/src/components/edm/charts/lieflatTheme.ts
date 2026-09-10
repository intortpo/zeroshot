/**
 * Lieflat Charts Theme & Palette Definition
 * Based on https://github.com/larashero3-dotcom/lieflat-charts
 * Authoritative color systems: Mono, Porcelain, Palm, Wire, and Tiffany (Petri Canonical).
 */

export type LieflatColorMode = 'mono' | 'porcelain' | 'palm' | 'wire' | 'tiffany';

export interface LieflatPalette {
  id: LieflatColorMode;
  name: string;
  description: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  waterlineColor: string;
  waterlineHex: number; // For Three.js
  submergedTint: string;
  elevatedTint: string;
  hexPrimary: number; // For Three.js
  hexSecondary: number;
  hexAccent: number;
}

export const LIEFLAT_PALETTES: Record<LieflatColorMode, LieflatPalette> = {
  mono: {
    id: 'mono',
    name: 'Mono',
    description: 'High-contrast graphite hairlines, pure structural focus & ivory paper',
    background: '#090D14',
    surface: '#111827',
    border: '#1F2937',
    textPrimary: '#F9FAFB',
    textMuted: '#9CA3AF',
    accent: '#E5E7EB',
    waterlineColor: 'rgba(156, 163, 175, 0.35)',
    waterlineHex: 0x9CA3AF,
    submergedTint: 'rgba(239, 68, 68, 0.25)',
    elevatedTint: 'rgba(243, 244, 246, 0.3)',
    hexPrimary: 0xE5E7EB,
    hexSecondary: 0x6B7280,
    hexAccent: 0xFFFFFF,
  },
  porcelain: {
    id: 'porcelain',
    name: 'Porcelain',
    description: 'Single-hue cobalt blue scale for ordered series & quantile mastery',
    background: '#071526',
    surface: '#0B223D',
    border: '#1A365D',
    textPrimary: '#F0F9FF',
    textMuted: '#7DD3FC',
    accent: '#38BDF8',
    waterlineColor: 'rgba(14, 165, 233, 0.35)',
    waterlineHex: 0x0EA5E9,
    submergedTint: 'rgba(186, 230, 253, 0.15)',
    elevatedTint: 'rgba(56, 189, 248, 0.35)',
    hexPrimary: 0x38BDF8,
    hexSecondary: 0x0284C7,
    hexAccent: 0xBAE6FD,
  },
  palm: {
    id: 'palm',
    name: 'Palm',
    description: 'Low-saturation sage green & warm gold for multi-category cohort states',
    background: '#0C1B17',
    surface: '#122A23',
    border: '#1D4539',
    textPrimary: '#ECFDF5',
    textMuted: '#6EE7B7',
    accent: '#10B981',
    waterlineColor: 'rgba(16, 185, 129, 0.35)',
    waterlineHex: 0x10B981,
    submergedTint: 'rgba(234, 179, 8, 0.2)',
    elevatedTint: 'rgba(16, 185, 129, 0.35)',
    hexPrimary: 0x10B981,
    hexSecondary: 0xEAB308,
    hexAccent: 0xA7F3D0,
  },
  wire: {
    id: 'wire',
    name: 'Wire (Editorial)',
    description: 'Graphite slate base with a singular neon fluorescent orange focal marker',
    background: '#0A0C10',
    surface: '#151821',
    border: '#232736',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    accent: '#FF5722',
    waterlineColor: 'rgba(255, 87, 34, 0.4)',
    waterlineHex: 0xFF5722,
    submergedTint: 'rgba(244, 63, 94, 0.25)',
    elevatedTint: 'rgba(255, 87, 34, 0.3)',
    hexPrimary: 0xFF5722,
    hexSecondary: 0x475569,
    hexAccent: 0xFFA07A,
  },
  tiffany: {
    id: 'tiffany',
    name: 'Tiffany (Petri)',
    description: 'Zero Petri canonical clean slate turquoise teal with cyan accents',
    background: '#081419',
    surface: '#0E232B',
    border: '#153A45',
    textPrimary: '#F0FDFA',
    textMuted: '#5EEAD4',
    accent: '#0ABAB5',
    waterlineColor: 'rgba(10, 186, 181, 0.35)',
    waterlineHex: 0x0ABAB5,
    submergedTint: 'rgba(244, 63, 94, 0.25)',
    elevatedTint: 'rgba(10, 186, 181, 0.35)',
    hexPrimary: 0x0ABAB5,
    hexSecondary: 0x0D9488,
    hexAccent: 0x99F6E4,
  },
};
