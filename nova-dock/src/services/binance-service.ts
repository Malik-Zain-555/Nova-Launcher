// Nova Dock 2.0 — Real-time Binance Crypto WebSocket Engine
// Direct connection to Binance public market data (no API key required).
// Supports dynamic symbol subscription for custom bar coins.

export interface CryptoTicker {
  symbol: string;        // e.g. BTCUSDT
  displaySymbol: string; // e.g. BTC
  price: number;         // 0 = still loading
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  lastUpdated: number;   // epoch ms, 0 = never updated
  direction: 'up' | 'down' | 'neutral';
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  note?: string;
  triggered: boolean;
  triggeredAt?: number;
  createdAt: number;
}

type TickerCallback = (tickers: Map<string, CryptoTicker>) => void;
type AlertCallback  = (alert: PriceAlert, currentPrice: number) => void;

class BinanceService {
  private ws: WebSocket | null = null;
  private tickers: Map<string, CryptoTicker> = new Map();
  private alerts: PriceAlert[] = [];
  private tickerListeners: Set<TickerCallback> = new Set();
  private alertListeners: Set<AlertCallback> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private audioCtx: AudioContext | null = null;
  private trackedSymbols: string[] = [];
  private _connected = false;

  constructor() {
    this.loadAlertsFromStorage();
  }

  // ── Symbol Management ────────────────────────────────────────────────────

  /** Call once (or whenever settings change) to set which symbols to stream. */
  public setTrackedSymbols(symbols: string[]) {
    const deduped = [...new Set(symbols.map(s => s.toUpperCase()))];
    const changed = deduped.length !== this.trackedSymbols.length ||
      deduped.some((s, i) => s !== this.trackedSymbols[i]);
    if (!changed) return;

    this.trackedSymbols = deduped;

    // Ensure every symbol has a ticker entry (price 0 = loading)
    for (const sym of deduped) {
      if (!this.tickers.has(sym)) {
        this.tickers.set(sym, this.emptyTicker(sym));
      }
    }
    this.notifyTickerListeners();
    this.reconnect();
  }

  public getTrackedSymbols(): string[] {
    return [...this.trackedSymbols];
  }

  private emptyTicker(symbol: string): CryptoTicker {
    return {
      symbol,
      displaySymbol: symbol.replace('USDT', ''),
      price: 0,
      priceChangePercent: 0,
      high24h: 0,
      low24h: 0,
      volume: 0,
      lastUpdated: 0,
      direction: 'neutral'
    };
  }

  // ── WebSocket Streaming ──────────────────────────────────────────────────

  private reconnect() {
    this.disconnect();
    this.startStreaming();
  }

  private disconnect() {
    if (this.ws) {
      this.ws.onclose = null; // suppress auto-reconnect
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._connected = false;
  }

  public startStreaming() {
    if (typeof window === 'undefined' || this.trackedSymbols.length === 0) return;

    try {
      const streams = this.trackedSymbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
      const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this._connected = true;
        console.log('[Binance] WebSocket connected — streaming', this.trackedSymbols.length, 'pairs');
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.data) this.handleTickerUpdate(msg.data);
        } catch { /* ignore ping/pong */ }
      };

      this.ws.onerror = () => {
        console.warn('[Binance] WebSocket error — will fallback to REST');
      };

      this.ws.onclose = () => {
        this._connected = false;
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.startStreaming();
        }, 5000);
      };
    } catch {
      this.startRestPolling();
    }
  }

  public get isConnected() { return this._connected; }

  private handleTickerUpdate(data: any) {
    const symbol: string = data.s;
    if (!symbol) return;

    const price = parseFloat(data.c);
    const changePercent = parseFloat(data.P);
    const high = parseFloat(data.h);
    const low = parseFloat(data.l);
    const vol = parseFloat(data.v);

    const prev = this.tickers.get(symbol);
    const prevPrice = prev?.price || price;
    const direction: CryptoTicker['direction'] =
      price > prevPrice ? 'up' : price < prevPrice ? 'down' : 'neutral';

    this.tickers.set(symbol, {
      symbol,
      displaySymbol: symbol.replace('USDT', ''),
      price,
      priceChangePercent: changePercent,
      high24h: high,
      low24h: low,
      volume: vol,
      lastUpdated: Date.now(),
      direction
    });

    this.checkPriceAlerts(symbol, price);
    this.notifyTickerListeners();
  }

  // ── REST Fallback (when WebSocket is blocked) ────────────────────────────

  private startRestPolling() {
    setInterval(async () => {
      if (this.trackedSymbols.length === 0) return;
      try {
        const symbols = this.trackedSymbols.map(s => `"${s}"`).join(',');
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`);
        const data = await res.json();
        for (const item of data) {
          this.handleTickerUpdate({
            s: item.symbol,
            c: item.lastPrice,
            P: item.priceChangePercent,
            h: item.highPrice,
            l: item.lowPrice,
            v: item.volume
          });
        }
      } catch { /* offline — prices stay at last known value */ }
    }, 4000);
  }

  // ── Alert System ─────────────────────────────────────────────────────────

  private checkPriceAlerts(symbol: string, currentPrice: number) {
    for (const alert of this.alerts) {
      if (alert.symbol !== symbol || alert.triggered) continue;
      const hit =
        (alert.direction === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.direction === 'below' && currentPrice <= alert.targetPrice);
      if (hit) {
        alert.triggered = true;
        alert.triggeredAt = Date.now();
        this.saveAlertsToStorage();
        this.playAlertSound();
        this.notifyAlertListeners(alert, currentPrice);
      }
    }
  }

  public addAlert(symbol: string, targetPrice: number, direction: 'above' | 'below', note?: string): PriceAlert {
    const alert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      symbol: symbol.toUpperCase(),
      targetPrice,
      direction,
      note,
      triggered: false,
      createdAt: Date.now()
    };
    this.alerts.push(alert);
    this.saveAlertsToStorage();
    return alert;
  }

  public removeAlert(id: string) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.saveAlertsToStorage();
  }

  public resetAlert(id: string) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.triggered = false;
      alert.triggeredAt = undefined;
      this.saveAlertsToStorage();
    }
  }

  public getAlerts(): PriceAlert[] { return [...this.alerts]; }

  // ── Audio Chime ──────────────────────────────────────────────────────────

  public playAlertSound() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const now = this.audioCtx.currentTime;

      const osc1 = this.audioCtx.createOscillator();
      const g1   = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      g1.gain.setValueAtTime(0.25, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc1.connect(g1).connect(this.audioCtx.destination);
      osc1.start(now); osc1.stop(now + 0.55);

      const osc2 = this.audioCtx.createOscillator();
      const g2   = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.34);
      g2.gain.setValueAtTime(0.3, now + 0.18);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(g2).connect(this.audioCtx.destination);
      osc2.start(now + 0.18); osc2.stop(now + 0.8);
    } catch (e) {
      console.warn('[Binance] Audio chime error:', e);
    }
  }

  // ── Subscriptions ────────────────────────────────────────────────────────

  public getTickers(): Map<string, CryptoTicker> { return this.tickers; }
  public getTicker(symbol: string): CryptoTicker | undefined { return this.tickers.get(symbol); }

  public onTickers(cb: TickerCallback): () => void {
    this.tickerListeners.add(cb);
    cb(this.tickers);
    return () => { this.tickerListeners.delete(cb); };
  }

  public onAlertTriggered(cb: AlertCallback): () => void {
    this.alertListeners.add(cb);
    return () => { this.alertListeners.delete(cb); };
  }

  private notifyTickerListeners() {
    for (const cb of this.tickerListeners) cb(this.tickers);
  }
  private notifyAlertListeners(alert: PriceAlert, price: number) {
    for (const cb of this.alertListeners) cb(alert, price);
  }

  // ── Persistence ──────────────────────────────────────────────────────────

  private saveAlertsToStorage() {
    try { localStorage.setItem('nova_binance_alerts', JSON.stringify(this.alerts)); } catch {}
  }
  private loadAlertsFromStorage() {
    try {
      const raw = localStorage.getItem('nova_binance_alerts');
      if (raw) this.alerts = JSON.parse(raw);
    } catch {}
  }
}

export const binanceService = new BinanceService();
