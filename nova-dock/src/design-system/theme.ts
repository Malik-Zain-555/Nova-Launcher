import { DesignTokens, AccentKey } from './tokens';

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'auto';
  accent: AccentKey;
  customAccentHex?: string;
  transparency: number; // 0.5 to 1.0
  reducedMotion: boolean;
  dockPosition: 'top' | 'bottom' | 'left' | 'right';
}

export const defaultThemeConfig: ThemeConfig = {
  mode: 'dark',
  accent: 'violet',
  transparency: 0.85,
  reducedMotion: false,
  dockPosition: 'top'
};

export class ThemeManager {
  private config: ThemeConfig;
  private listeners: Array<(cfg: ThemeConfig) => void> = [];

  constructor(initialConfig?: Partial<ThemeConfig>) {
    this.config = { ...defaultThemeConfig, ...initialConfig };
    this.applyToDocument();
  }

  public getConfig(): ThemeConfig {
    return { ...this.config };
  }

  public setAccent(accent: AccentKey, customHex?: string) {
    this.config.accent = accent;
    if (customHex) this.config.customAccentHex = customHex;
    this.applyToDocument();
    this.notify();
  }

  public setMode(mode: 'dark' | 'light' | 'auto') {
    this.config.mode = mode;
    this.applyToDocument();
    this.notify();
  }

  public setTransparency(alpha: number) {
    this.config.transparency = Math.min(1.0, Math.max(0.5, alpha));
    this.applyToDocument();
    this.notify();
  }

  public setReducedMotion(enabled: boolean) {
    this.config.reducedMotion = enabled;
    this.applyToDocument();
    this.notify();
  }

  public subscribe(fn: (cfg: ThemeConfig) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.config));
  }

  private applyToDocument() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const accentHex = this.config.customAccentHex || DesignTokens.colors.accents[this.config.accent]?.hex || '#7c5cff';
    root.style.setProperty('--nova-accent', accentHex);
    root.style.setProperty('--nova-alpha', this.config.transparency.toString());

    if (this.config.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (this.config.mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto: detect system dark mode
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isSystemDark);
      root.classList.toggle('light', !isSystemDark);
    }
  }
}
