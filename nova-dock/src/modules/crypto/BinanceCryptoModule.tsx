import React, { useState, useEffect } from 'react';
import { binanceService, CryptoTicker, PriceAlert } from '../../services/binance-service';
import { FluentIcon } from '../../components/FluentIcon';
import { coinName } from '../../services/dock-settings';

export const BinanceCryptoModule: React.FC = () => {
  const [tickers, setTickers] = useState<Map<string, CryptoTicker>>(binanceService.getTickers());
  const [alerts, setAlerts] = useState<PriceAlert[]>(binanceService.getAlerts());
  const [isConnected, setIsConnected] = useState<boolean>(binanceService.isConnected);

  // Alert Form State
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [alertNote, setAlertNote] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    // If no symbols are tracked yet, initialize standard market pairs
    if (binanceService.getTrackedSymbols().length === 0) {
      binanceService.setTrackedSymbols([
        'BTCUSDT',
        'ETHUSDT',
        'SOLUSDT',
        'BNBUSDT',
        'DOGEUSDT',
        'XRPUSDT'
      ]);
    }

    const unsubTickers = binanceService.onTickers((updated) => {
      setTickers(new Map(updated));
      setIsConnected(binanceService.isConnected);
    });

    const unsubAlert = binanceService.onAlertTriggered((alert, price) => {
      setAlerts(binanceService.getAlerts());
      setStatusMsg(`Alert triggered: ${coinName(alert.symbol)} reached $${price.toLocaleString()}`);
    });

    const pollInterval = setInterval(() => {
      setIsConnected(binanceService.isConnected);
    }, 1000);

    return () => {
      unsubTickers();
      unsubAlert();
      clearInterval(pollInterval);
    };
  }, []);

  const formatPrice = (val: number): string => {
    if (val === 0) return '—';
    if (val >= 1000) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (val >= 1) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else {
      return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPriceInput);
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) {
      setStatusMsg('Please enter a valid target price.');
      setTimeout(() => setStatusMsg(''), 3000);
      return;
    }

    binanceService.addAlert(selectedSymbol, priceNum, direction, alertNote.trim() || undefined);
    setAlerts(binanceService.getAlerts());
    setTargetPriceInput('');
    setAlertNote('');
    setStatusMsg(
      `Price alert armed for ${coinName(selectedSymbol)} ${
        direction === 'above' ? '≥' : '≤'
      } $${formatPrice(priceNum)}`
    );
    setTimeout(() => setStatusMsg(''), 3500);
  };

  const handleRemoveAlert = (id: string) => {
    binanceService.removeAlert(id);
    setAlerts(binanceService.getAlerts());
    setStatusMsg('Price alert removed');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const handleResetAlert = (id: string) => {
    binanceService.resetAlert(id);
    setAlerts(binanceService.getAlerts());
    setStatusMsg('Price alert rearmed');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const handleTestChime = () => {
    binanceService.playAlertSound();
    setStatusMsg('Audio alert chime played');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const activeTicker = tickers.get(selectedSymbol);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6 relative select-none">
      {/* Top Banner Header */}
      <div className="p-3.5 rounded-2xl bg-[#0A0B10] border border-white/[0.08] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--nova-accent)]/30 bg-[var(--nova-accent)]/15 text-[var(--nova-accent)] flex-shrink-0">
            <FluentIcon name="TrendingUp" size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide uppercase">
                Binance Live Trading Station
              </h1>
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-colors duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                  isConnected
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                  }`}
                />
                <span>{isConnected ? 'LIVE' : 'CONNECTING...'}</span>
              </div>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              Zero-latency direct stream from Binance matching engine · Real-time price alerts with audible chimes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestChime}
          className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white/80 hover:text-white flex items-center gap-1.5 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 border border-white/[0.08]"
          title="Test alert sound chime"
        >
          <FluentIcon name="Volume2" size={13} className="text-[var(--nova-accent)]" />
          <span>Test Chime</span>
        </button>
      </div>

      {/* Status Banner */}
      {statusMsg && (
        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 animate-in fade-in flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FluentIcon name="CheckCircle2" size={14} className="text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg('')}
            className="text-white/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real-time Crypto Price Cards (3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from(tickers.values()).map((ticker) => {
          const isSelected = selectedSymbol === ticker.symbol;
          const isLoading = ticker.price === 0 || ticker.lastUpdated === 0;
          const isUp = ticker.priceChangePercent >= 0;
          const symbolDisplayName = coinName(ticker.symbol);

          return (
            <div
              key={ticker.symbol}
              onClick={() => {
                setSelectedSymbol(ticker.symbol);
                if (!targetPriceInput && ticker.price > 0) {
                  const suggested = direction === 'above' ? ticker.price * 1.05 : ticker.price * 0.95;
                  setTargetPriceInput(
                    suggested >= 10 ? suggested.toFixed(2) : suggested.toFixed(4)
                  );
                }
              }}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                isSelected
                  ? 'bg-white/[0.06] border border-[var(--nova-accent)]/40 shadow-sm'
                  : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs font-mono">{symbolDisplayName}</span>
                  <span className="text-[10px] text-white/40 font-mono">/USDT</span>
                </div>

                {isLoading ? (
                  <span className="text-[11px] font-mono text-white/30 px-1.5 py-0.5 rounded bg-white/[0.02]">
                    —
                  </span>
                ) : (
                  <span
                    className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    <span>{isUp ? '▲' : '▼'}</span>
                    <span>{Math.abs(ticker.priceChangePercent).toFixed(2)}%</span>
                  </span>
                )}
              </div>

              <div className="mt-2">
                {isLoading ? (
                  <div className="text-lg font-mono text-white/40 tracking-tight">Loading...</div>
                ) : (
                  <div className="text-xl font-bold font-mono text-white tracking-tight">
                    ${formatPrice(ticker.price)}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/45 mt-2.5 font-mono border-t border-white/[0.06] pt-1.5">
                <span>24h H: {isLoading ? '—' : `$${formatPrice(ticker.high24h)}`}</span>
                <span>24h L: {isLoading ? '—' : `$${formatPrice(ticker.low24h)}`}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Alert Creation Section */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3.5 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--nova-accent)]/30 bg-[var(--nova-accent)]/15 text-[var(--nova-accent)]">
              <FluentIcon name="Bell" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Set Price Target Alert</h2>
              <p className="text-[10px] text-white/50">Audible chime & notification banner when target is reached</p>
            </div>
          </div>

          {activeTicker && (
            <div className="text-xs font-mono text-white/60 hidden sm:block">
              {coinName(activeTicker.symbol)}:{' '}
              <strong className="text-white font-bold">
                {activeTicker.price > 0 ? `$${formatPrice(activeTicker.price)}` : 'Loading...'}
              </strong>
            </div>
          )}
        </div>

        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Symbol */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block">
              Coin
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl bg-black/40 border border-white/[0.12] text-xs text-white font-mono focus:border-[var(--nova-accent)] focus:outline-none transition-colors"
            >
              {Array.from(tickers.values()).map((t) => (
                <option key={t.symbol} value={t.symbol} className="bg-[#131722] text-white">
                  {coinName(t.symbol)} ({t.price > 0 ? `$${formatPrice(t.price)}` : 'Loading...'})
                </option>
              ))}
            </select>
          </div>

          {/* Condition Direction */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-1 h-9 p-0.5 rounded-xl bg-black/40 border border-white/[0.12]">
              <button
                type="button"
                onClick={() => setDirection('above')}
                className={`rounded-lg text-xs font-semibold transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                  direction === 'above'
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                ≥ Crosses Above
              </button>
              <button
                type="button"
                onClick={() => setDirection('below')}
                className={`rounded-lg text-xs font-semibold transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                  direction === 'below'
                    ? 'bg-rose-500 text-white font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                ≤ Crosses Below
              </button>
            </div>
          </div>

          {/* Target Price */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block">
              Target Price ($)
            </label>
            <input
              type="number"
              step="any"
              placeholder={activeTicker && activeTicker.price > 0 ? activeTicker.price.toString() : 'Target price'}
              value={targetPriceInput}
              onChange={(e) => setTargetPriceInput(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/[0.12] text-xs text-white font-mono placeholder-white/30 focus:border-[var(--nova-accent)] focus:outline-none transition-colors"
            />
          </div>

          {/* Optional Note & Submit */}
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full h-9 rounded-xl bg-[var(--nova-accent,#8b5cf6)] hover:brightness-110 text-white font-bold text-xs shadow-sm active:scale-95 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-1.5"
            >
              <FluentIcon name="Plus" size={14} />
              <span>Arm Alert Rule</span>
            </button>
          </div>

          {/* Optional Note row if desired */}
          <div className="sm:col-span-12 space-y-1">
            <input
              type="text"
              placeholder="Optional alert note (e.g. Breakout retest level, take profit, stop loss)..."
              value={alertNote}
              onChange={(e) => setAlertNote(e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-black/30 border border-white/[0.08] text-[11px] text-white placeholder-white/25 focus:border-[var(--nova-accent)] focus:outline-none transition-colors"
            />
          </div>
        </form>
      </section>

      {/* Active Alerts List */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.02] text-white/70">
              <FluentIcon name="List" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Active Price Alerts</h2>
              <p className="text-[10px] text-white/50">Audited continuously against incoming WebSocket price ticks</p>
            </div>
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            {alerts.filter((a) => !a.triggered).length} Watching · {alerts.filter((a) => a.triggered).length} Triggered
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-white/40 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center gap-1.5">
            <FluentIcon name="Bell" size={20} className="text-white/20 mb-1" />
            <p>No price alerts active.</p>
            <p className="text-[10px] text-white/30">Set a target price rule above to monitor the market live.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const currentTicker = tickers.get(alert.symbol);
              const currentPrice = currentTicker ? currentTicker.price : 0;
              const hasPrice = currentPrice > 0;
              const diff = hasPrice ? Math.abs(currentPrice - alert.targetPrice) : 0;
              const displayName = coinName(alert.symbol);

              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                    alert.triggered
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        alert.triggered ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-pulse'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 font-mono font-bold text-white">
                        <span>{displayName}</span>
                        <span className="text-[10px] text-white/40 font-normal">/USDT</span>
                        <span className={alert.direction === 'above' ? 'text-emerald-400' : 'text-rose-400'}>
                          {alert.direction === 'above' ? '≥' : '≤'} ${formatPrice(alert.targetPrice)}
                        </span>
                        {alert.note && (
                          <span className="font-sans font-normal text-[11px] text-white/60">
                            · {alert.note}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/45 font-mono mt-0.5">
                        Current: {hasPrice ? `$${formatPrice(currentPrice)}` : 'Loading...'}
                        {hasPrice && ` · Diff: $${formatPrice(diff)}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.triggered ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        TRIGGERED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        WATCHING
                      </span>
                    )}

                    {alert.triggered && (
                      <button
                        type="button"
                        onClick={() => handleResetAlert(alert.id)}
                        title="Rearm this alert"
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] text-white/90 font-medium transition-colors"
                      >
                        Rearm
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveAlert(alert.id)}
                      title="Delete alert"
                      className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <FluentIcon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
