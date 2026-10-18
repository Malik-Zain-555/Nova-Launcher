// Nova Dock 2.0 — Dock Customization & Settings Engine
// Manages themes, glass opacity, bar coin selection, pill widgets, and dock position.

export type DockThemeKey = 'obsidian' | 'binance' | 'cyber' | 'slate' | 'emerald';
export type DockPosition = 'top' | 'bottom';
export type ExpandTrigger = 'click' | 'hover';
export type PillWidth = 'compact' | 'standard' | 'wide';

export interface DockSettings {
  theme: DockThemeKey;
  glassOpacity: number; // 0.70 – 1.00
  dockPosition: DockPosition;
  pillWidth: PillWidth;
  expandTrigger: ExpandTrigger;
  hoverDelay: number; // ms
  visibleWidgets: {
    cryptoTicker: boolean;
    quickApps: boolean;
    clock: boolean;
    battery: boolean;
    cpuRam: boolean;
    weather: boolean;
    commandBadge: boolean;
  };
  barCoins: string[];       // Which coins to display in the compact pill ticker
  barCoinCount: number;     // How many coins to show in pill (1–4)
  cryptoWatchlist: string[];// Full watchlist for the expanded Binance module
  soundAlerts: boolean;
  startWithWindows: boolean;
  accentColor: string;
}

// ─── Coin Catalog ────────────────────────────────────────────────────────────

export const AVAILABLE_COINS: string[] = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT', 'XRPUSDT',
  'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'UNIUSDT',
  'ATOMUSDT', 'LTCUSDT', 'NEARUSDT', 'APTUSDT', 'ARBUSDT', 'OPUSDT',
  'SHIBUSDT', 'PEPEUSDT', 'SUIUSDT', 'TONUSDT', 'TRXUSDT', 'FILUSDT',
  'MATICUSDT', 'INJUSDT', 'TIAUSDT', 'RENDERUSDT', 'FETUSDT'
];

export const COIN_NAMES: Record<string, string> = {
  BTCUSDT: 'BTC',   ETHUSDT: 'ETH',   SOLUSDT: 'SOL',   BNBUSDT: 'BNB',
  DOGEUSDT: 'DOGE', XRPUSDT: 'XRP',   ADAUSDT: 'ADA',   AVAXUSDT: 'AVAX',
  DOTUSDT: 'DOT',   LINKUSDT: 'LINK',  UNIUSDT: 'UNI',   ATOMUSDT: 'ATOM',
  LTCUSDT: 'LTC',   NEARUSDT: 'NEAR',  APTUSDT: 'APT',   ARBUSDT: 'ARB',
  OPUSDT: 'OP',     SHIBUSDT: 'SHIB',  PEPEUSDT: 'PEPE', SUIUSDT: 'SUI',
  TONUSDT: 'TON',   TRXUSDT: 'TRX',    FILUSDT: 'FIL',   MATICUSDT: 'MATIC',
  INJUSDT: 'INJ',   TIAUSDT: 'TIA',    RENDERUSDT: 'RNDR', FETUSDT: 'FET'
};

/** Derive display name from symbol, with lookup fallback */
export function coinName(symbol: string): string {
  return COIN_NAMES[symbol] || symbol.replace('USDT', '');
}

// ─── Themes ──────────────────────────────────────────────────────────────────

export const DOCK_THEMES: Record<DockThemeKey, {
  name: string; bg: string; border: string; accent: string; glow: string; textAccent: string;
}> = {
  obsidian: {
    name: 'Obsidian',
    bg: '#0A0B10',
    border: 'rgba(255,255,255,0.10)',
    accent: '#8b5cf6',
    glow: 'rgba(139,92,246,0.18)',
    textAccent: 'text-violet-400'
  },
  binance: {
    name: 'Binance Gold',
    bg: '#0C0D12',
    border: 'rgba(240,185,11,0.22)',
    accent: '#f0b90b',
    glow: 'rgba(240,185,11,0.14)',
    textAccent: 'text-amber-400'
  },
  cyber: {
    name: 'Cyber Neon',
    bg: '#08081A',
    border: 'rgba(56,189,248,0.22)',
    accent: '#06b6d4',
    glow: 'rgba(6,182,212,0.14)',
    textAccent: 'text-cyan-400'
  },
  slate: {
    name: 'Slate',
    bg: '#131722',
    border: 'rgba(59,130,246,0.18)',
    accent: '#3b82f6',
    glow: 'rgba(59,130,246,0.12)',
    textAccent: 'text-blue-400'
  },
  emerald: {
    name: 'Emerald',
    bg: '#060D08',
    border: 'rgba(16,185,129,0.22)',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.14)',
    textAccent: 'text-emerald-400'
  }
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: DockSettings = {
  theme: 'obsidian',
  glassOpacity: 0.98,
  dockPosition: 'top',
  pillWidth: 'standard',
  expandTrigger: 'click',
  hoverDelay: 200,
  visibleWidgets: {
    cryptoTicker: true,
    quickApps: false,
    clock: true,
    battery: true,
    cpuRam: false,
    weather: false,
    commandBadge: false
  },
  barCoins: ['BTCUSDT', 'ETHUSDT'],
  barCoinCount: 2,
  cryptoWatchlist: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT', 'XRPUSDT'],
  soundAlerts: true,
  startWithWindows: false,
  accentColor: '#8b5cf6'
};

// ─── Service ─────────────────────────────────────────────────────────────────

type SettingsListener = (settings: DockSettings) => void;

class DockSettingsService {
  private settings: DockSettings;
  private listeners: Set<SettingsListener> = new Set();

  constructor() {
    this.settings = this.loadSettings();
  }

  public getSettings(): DockSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<DockSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    this.notify();
  }

  public updateVisibleWidget(widgetKey: keyof DockSettings['visibleWidgets'], visible: boolean) {
    this.settings.visibleWidgets = { ...this.settings.visibleWidgets, [widgetKey]: visible };
    this.saveSettings();
    this.notify();
  }

  /** Replace the bar coins list and cap to barCoinCount */
  public setBarCoins(coins: string[]) {
    this.settings.barCoins = coins.slice(0, Math.max(1, this.settings.barCoinCount));
    this.saveSettings();
    this.notify();
  }

  /** Add a coin to bar (if not already there and under limit) */
  public addBarCoin(symbol: string) {
    if (!this.settings.barCoins.includes(symbol) && this.settings.barCoins.length < this.settings.barCoinCount) {
      this.settings.barCoins = [...this.settings.barCoins, symbol];
      this.saveSettings();
      this.notify();
    }
  }

  /** Remove a coin from bar */
  public removeBarCoin(symbol: string) {
    this.settings.barCoins = this.settings.barCoins.filter(c => c !== symbol);
    this.saveSettings();
    this.notify();
  }

  public onSettingsChange(cb: SettingsListener): () => void {
    this.listeners.add(cb);
    cb(this.settings);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.settings });
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('nova_dock_settings_v2', JSON.stringify(this.settings));
    } catch (e) { /* quota exceeded or SSR */ }
  }

  private loadSettings(): DockSettings {
    try {
      const raw = localStorage.getItem('nova_dock_settings_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          visibleWidgets: { ...DEFAULT_SETTINGS.visibleWidgets, ...(parsed.visibleWidgets || {}) }
        };
      }
    } catch (e) { /* corrupt data */ }
    return { ...DEFAULT_SETTINGS };
  }
}

export const dockSettingsService = new DockSettingsService();
