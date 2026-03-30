import { Injectable } from '@angular/core';

export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  swatch: string;
  vars: { [key: string]: string };
}

export const THEMES: AppTheme[] = [
  {
    id: 'default', name: 'Midnight Navy', emoji: '🌌',
    swatch: 'linear-gradient(135deg,#0b0f1a,#0f1628)',
    vars: { '--bg1': '#0b0f1a', '--bg2': '#0f1628', '--orb1': '#3b4fd8', '--orb2': '#7c3aed', '--orb3': '#0e9488' }
  },
  {
    id: 'emerald', name: 'Emerald Forest', emoji: '🌿',
    swatch: 'linear-gradient(135deg,#021a0f,#042a18)',
    vars: { '--bg1': '#021a0f', '--bg2': '#042a18', '--orb1': '#059669', '--orb2': '#10b981', '--orb3': '#34d399' }
  },
  {
    id: 'cobalt', name: 'Cobalt Blue', emoji: '🌊',
    swatch: 'linear-gradient(135deg,#050d1f,#0a1735)',
    vars: { '--bg1': '#050d1f', '--bg2': '#0a1735', '--orb1': '#1d4ed8', '--orb2': '#3b82f6', '--orb3': '#60a5fa' }
  },
  {
    id: 'gold', name: 'Luxury Gold', emoji: '✨',
    swatch: 'linear-gradient(135deg,#1a0f00,#2a1800)',
    vars: { '--bg1': '#1a0f00', '--bg2': '#2a1800', '--orb1': '#b45309', '--orb2': '#f59e0b', '--orb3': '#fbbf24' }
  },
  {
    id: 'violet', name: 'Deep Violet', emoji: '🔮',
    swatch: 'linear-gradient(135deg,#0d0520,#150a32)',
    vars: { '--bg1': '#0d0520', '--bg2': '#150a32', '--orb1': '#4c1d95', '--orb2': '#7c3aed', '--orb3': '#a78bfa' }
  },
  {
    id: 'rose', name: 'Rose Sunset', emoji: '🌸',
    swatch: 'linear-gradient(135deg,#1a0510,#2a0818)',
    vars: { '--bg1': '#1a0510', '--bg2': '#2a0818', '--orb1': '#9d174d', '--orb2': '#ec4899', '--orb3': '#f9a8d4' }
  },
  {
    id: 'slate', name: 'Slate Gray', emoji: '🪨',
    swatch: 'linear-gradient(135deg,#0a0c14,#141824)',
    vars: { '--bg1': '#0a0c14', '--bg2': '#141824', '--orb1': '#334155', '--orb2': '#64748b', '--orb3': '#94a3b8' }
  },
  {
    id: 'cyber', name: 'Cyber Teal', emoji: '⚡',
    swatch: 'linear-gradient(135deg,#001a1a,#002828)',
    vars: { '--bg1': '#001a1a', '--bg2': '#002828', '--orb1': '#0f766e', '--orb2': '#14b8a6', '--orb3': '#5eead4' }
  },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'lt_theme';

  apply(themeId: string) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const root = document.documentElement;
    // Set each CSS variable directly on :root — highest possible specificity
    Object.entries(theme.vars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });
    localStorage.setItem(this.KEY, themeId);
  }

  restore() {
    const saved = localStorage.getItem(this.KEY) || 'default';
    this.apply(saved);
    return saved;
  }

  current(): string {
    return localStorage.getItem(this.KEY) || 'default';
  }
}
