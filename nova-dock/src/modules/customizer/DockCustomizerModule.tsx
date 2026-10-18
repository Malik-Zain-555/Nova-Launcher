import React, { useState, useEffect } from 'react';
import {
  dockSettingsService,
  DockSettings,
  DOCK_THEMES,
  DockThemeKey,
  PillWidth,
  DockPosition,
  ExpandTrigger,
  AVAILABLE_COINS,
  COIN_NAMES,
  coinName
} from '../../services/dock-settings';
import { binanceService } from '../../services/binance-service';
import { FluentIcon } from '../../components/FluentIcon';

export const DockCustomizerModule: React.FC = () => {
  const [settings, setSettings] = useState<DockSettings>(dockSettingsService.getSettings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return dockSettingsService.onSettingsChange((updated) => setSettings({ ...updated }));
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2000);
  };

  const handleUpdate = (partial: Partial<DockSettings>, toastMsg = 'Settings saved') => {
    dockSettingsService.updateSettings(partial);
    showToast(toastMsg);
  };

  const handleToggleWidget = (widgetKey: keyof DockSettings['visibleWidgets']) => {
    const nextState = !settings.visibleWidgets[widgetKey];
    dockSettingsService.updateVisibleWidget(widgetKey, nextState);
    showToast(`${widgetKey} ${nextState ? 'enabled' : 'disabled'}`);
  };

  const handleBarCoinToggle = (symbol: string) => {
    const isSelected = settings.barCoins.includes(symbol);
    if (isSelected) {
      dockSettingsService.removeBarCoin(symbol);
      showToast(`Removed ${coinName(symbol)} from dock pill`);
    } else {
      if (settings.barCoins.length >= settings.barCoinCount) {
        showToast(`Limit reached (${settings.barCoinCount} max). Increase slot count or remove a coin.`);
        return;
      }
      dockSettingsService.addBarCoin(symbol);
      // Ensure binance service streams this symbol
      const currentTracked = binanceService.getTrackedSymbols();
      if (!currentTracked.includes(symbol)) {
        binanceService.setTrackedSymbols([...currentTracked, symbol]);
      }
      showToast(`Added ${coinName(symbol)} to dock pill`);
    }
  };

  const handleBarCoinCountChange = (count: number) => {
    if (settings.barCoins.length > count) {
      const trimmed = settings.barCoins.slice(0, count);
      dockSettingsService.updateSettings({ barCoinCount: count, barCoins: trimmed });
    } else {
      dockSettingsService.updateSettings({ barCoinCount: count });
    }
    showToast(`Pill coin limit set to ${count}`);
  };

  const handleTestChime = () => {
    binanceService.playAlertSound();
    showToast('Alert sound chime played');
  };

  const currentTheme = DOCK_THEMES[settings.theme] || DOCK_THEMES.obsidian;
  const accentColor = currentTheme.accent;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6 relative select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <FluentIcon name="CheckCircle2" size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm transition-colors duration-200"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <FluentIcon name="Sliders" size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Dock Customizer</h1>
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-colors duration-200"
                style={{
                  backgroundColor: `${accentColor}15`,
                  borderColor: `${accentColor}35`,
                  color: accentColor
                }}
              >
                LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Personalize dock aesthetics, ticker coins, layout dimensions, and visible island widgets
            </p>
          </div>
        </div>
      </div>

      {/* 2. Bar Coin Picker (Pill Coins) */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3.5 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              <FluentIcon name="Coins" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Pill Coins</h2>
              <p className="text-[10px] text-white/50">Choose which coins appear in your dock bar</p>
            </div>
          </div>

          {/* Bar Coin Count Selector (1-4 chips) */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <span className="text-[10px] font-medium text-white/40 uppercase mr-1">Display Limit:</span>
            {[1, 2, 3, 4].map((count) => {
              const isActive = settings.barCoinCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleBarCoinCountChange(count)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold border transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white hover:border-white/20'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${accentColor}25`,
                          borderColor: accentColor,
                          color: '#ffffff'
                        }
                      : undefined
                  }
                  title={`Show up to ${count} coins on pill`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Coins Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Selected in Dock ({settings.barCoins.length} of {settings.barCoinCount})
            </span>
            {settings.barCoins.length === 0 && (
              <span className="text-[10px] text-amber-400 font-mono">Select at least 1 coin</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[38px] p-2 rounded-xl bg-black/40 border border-white/[0.06] items-center">
            {settings.barCoins.map((symbol) => (
              <div
                key={symbol}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]"
                style={{
                  backgroundColor: `${accentColor}18`,
                  borderColor: `${accentColor}50`,
                  color: '#ffffff'
                }}
              >
                <span className="font-bold">{coinName(symbol)}</span>
                <span className="text-[9.5px] text-white/40">USDT</span>
                <button
                  type="button"
                  onClick={() => handleBarCoinToggle(symbol)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white/50 hover:text-rose-400 hover:bg-rose-500/20 transition-colors ml-0.5"
                  title={`Remove ${coinName(symbol)} from dock pill`}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Empty Slot Indicators */}
            {Array.from({ length: Math.max(0, settings.barCoinCount - settings.barCoins.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="px-2.5 py-1 rounded-lg border border-dashed border-white/10 text-[10px] font-mono text-white/30 flex items-center gap-1 select-none"
              >
                <span>+</span>
                <span>Slot {settings.barCoins.length + idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Coins Grid */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block">
            Coin Catalog ({AVAILABLE_COINS.length} Available Pairs)
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {AVAILABLE_COINS.map((symbol) => {
              const isSelected = settings.barCoins.includes(symbol);
              const displayName = coinName(symbol);
              return (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => handleBarCoinToggle(symbol)}
                  className={`px-2 py-1.5 rounded-xl border text-center transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 flex flex-col items-center justify-center ${
                    isSelected
                      ? 'shadow-sm'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-white/70'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${accentColor}20`,
                          borderColor: accentColor,
                          color: '#ffffff'
                        }
                      : undefined
                  }
                  title={`${displayName} (${symbol}) · Click to ${isSelected ? 'remove' : 'add'}`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-bold leading-tight">{displayName}</span>
                    {isSelected && (
                      <span className="text-[9px]" style={{ color: accentColor }}>✓</span>
                    )}
                  </div>
                  <span className="text-[9px] text-white/40 font-mono leading-none mt-0.5">USDT</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Theme Picker */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <FluentIcon name="Palette" size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">Theme Presets</h2>
            <p className="text-[10px] text-white/50">Select dock interface aesthetics and accent color scheme</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(Object.keys(DOCK_THEMES) as DockThemeKey[]).map((themeKey) => {
            const t = DOCK_THEMES[themeKey];
            const isSelected = settings.theme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => handleUpdate({ theme: themeKey, accentColor: t.accent }, `Theme set to ${t.name}`)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                  isSelected
                    ? 'shadow-sm'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${t.accent}18`,
                        borderColor: t.accent
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/30 flex-shrink-0"
                    style={{ backgroundColor: t.accent }}
                  />
                  <span className="text-xs font-bold text-white truncate">{t.name}</span>
                </div>
                <span className="text-[10px] text-white/40 block font-mono">{themeKey}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Glass Opacity Slider */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              <FluentIcon name="Layers" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Glass Opacity</h2>
              <p className="text-[10px] text-white/50">Anti-bleed background opacity for dock capsule</p>
            </div>
          </div>
          <span
            className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border bg-white/[0.04]"
            style={{ color: accentColor, borderColor: `${accentColor}40` }}
          >
            {Math.round(settings.glassOpacity * 100)}%
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <input
            type="range"
            min="0.75"
            max="1.00"
            step="0.01"
            value={settings.glassOpacity}
            onChange={(e) =>
              handleUpdate(
                { glassOpacity: parseFloat(e.target.value) },
                `Opacity set to ${Math.round(parseFloat(e.target.value) * 100)}%`
              )
            }
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor }}
          />
          <div className="flex justify-between text-[10px] text-white/40 font-mono">
            <span>75% (Frosted)</span>
            <span>85% (Translucent)</span>
            <span>95% (Recommended)</span>
            <span>100% (Solid Pitch Black)</span>
          </div>
        </div>
      </section>

      {/* 5. Pill Width */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <FluentIcon name="Maximize2" size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">Pill Width</h2>
            <p className="text-[10px] text-white/50">Base horizontal dimension for the top floating dock capsule</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'compact' as PillWidth, label: 'Compact (440px)', desc: 'Minimal footprint' },
            { id: 'standard' as PillWidth, label: 'Standard (540px)', desc: 'Balanced layout' },
            { id: 'wide' as PillWidth, label: 'Wide (660px)', desc: 'Maximum telemetry' }
          ].map((w) => {
            const isSelected = settings.pillWidth === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleUpdate({ pillWidth: w.id }, `Pill width set to ${w.label}`)}
                className={`p-3 rounded-xl border text-center transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                  isSelected
                    ? 'shadow-sm'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-white/70'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${accentColor}20`,
                        borderColor: accentColor,
                        color: '#ffffff'
                      }
                    : undefined
                }
              >
                <div className="text-xs font-bold leading-tight">{w.label}</div>
                <div className="text-[10px] text-white/40 font-mono mt-0.5">{w.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Widget Toggles */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              <FluentIcon name="LayoutGrid" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Visible Pill Widgets</h2>
              <p className="text-[10px] text-white/50">Toggle visible components within the compact dock pill</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { key: 'cryptoTicker' as const, label: 'Crypto Ticker', icon: 'TrendingUp', desc: 'Live bar coin prices' },
            { key: 'quickApps' as const, label: 'Quick Apps', icon: 'Globe', desc: 'One-click app launchers' },
            { key: 'clock' as const, label: 'Clock', icon: 'Clock', desc: 'System digital time' },
            { key: 'battery' as const, label: 'Battery', icon: 'Battery', desc: 'Power level & charge status' },
            { key: 'cpuRam' as const, label: 'CPU & RAM', icon: 'Cpu', desc: 'Hardware usage telemetry' },
            { key: 'commandBadge' as const, label: 'Command Badge', icon: 'Command', desc: 'Ctrl+Alt+Space shortcut' }
          ].map((widget) => {
            const isVisible = settings.visibleWidgets[widget.key];
            return (
              <button
                key={widget.key}
                type="button"
                onClick={() => handleToggleWidget(widget.key)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                  isVisible
                    ? 'border-white/[0.14] bg-white/[0.04]'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/40 hover:text-white/70 hover:border-white/20'
                }`}
                style={
                  isVisible
                    ? {
                        borderColor: `${accentColor}50`,
                        backgroundColor: `${accentColor}10`
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <FluentIcon
                    name={widget.icon}
                    size={16}
                    className={isVisible ? '' : 'text-white/30'}
                    color={isVisible ? accentColor : undefined}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-white leading-tight truncate">{widget.label}</div>
                    <div className="text-[10px] text-white/40 truncate">{widget.desc}</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${
                    isVisible
                      ? 'text-white'
                      : 'bg-white/[0.03] text-white/30 border-white/[0.06]'
                  }`}
                  style={
                    isVisible
                      ? {
                          backgroundColor: `${accentColor}25`,
                          borderColor: accentColor,
                          color: '#ffffff'
                        }
                      : undefined
                  }
                >
                  {isVisible ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. Dock Position & 8. Expand Trigger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 7. Dock Position */}
        <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              <FluentIcon name="SlidersHorizontal" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Dock Position</h2>
              <p className="text-[10px] text-white/50">Screen anchor placement</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'top' as DockPosition, label: 'Top', desc: 'Dynamic island style' },
              { id: 'bottom' as DockPosition, label: 'Bottom', desc: 'Taskbar / dock style' }
            ].map((pos) => {
              const isSelected = settings.dockPosition === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => handleUpdate({ dockPosition: pos.id }, `Dock position set to ${pos.label}`)}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                    isSelected
                      ? 'shadow-sm'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-white/70'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${accentColor}20`,
                          borderColor: accentColor,
                          color: '#ffffff'
                        }
                      : undefined
                  }
                >
                  <div className="text-xs font-bold">{pos.label}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{pos.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 8. Expand Trigger */}
        <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] space-y-3 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}40`,
                color: accentColor
              }}
            >
              <FluentIcon name="MousePointerClick" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">Expand Trigger</h2>
              <p className="text-[10px] text-white/50">Interaction gesture to open dock</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'click' as ExpandTrigger, label: 'Click', desc: 'Explicit click (Zero accidents)' },
              { id: 'hover' as ExpandTrigger, label: 'Hover', desc: 'Expand on cursor hover' }
            ].map((trig) => {
              const isSelected = settings.expandTrigger === trig.id;
              return (
                <button
                  key={trig.id}
                  type="button"
                  onClick={() => handleUpdate({ expandTrigger: trig.id }, `Trigger set to ${trig.label}`)}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                    isSelected
                      ? 'shadow-sm'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 text-white/70'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${accentColor}20`,
                          borderColor: accentColor,
                          color: '#ffffff'
                        }
                      : undefined
                  }
                >
                  <div className="text-xs font-bold">{trig.label}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{trig.desc}</div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* 9. Alert Sound Test */}
      <section className="p-4 rounded-2xl bg-[#0A0B10] border border-white/[0.08] flex items-center justify-between transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors duration-200"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
          >
            <FluentIcon name="Volume2" size={16} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">Alert Sound Test</h2>
            <p className="text-[10px] text-white/50">Audible chime synthesized via Web Audio API for crypto target alerts</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestChime}
          className="px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-semibold text-white transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 shadow-sm"
          style={{
            backgroundColor: `${accentColor}20`,
            borderColor: `${accentColor}50`
          }}
        >
          <FluentIcon name="Volume2" size={14} color={accentColor} />
          <span>Play Chime</span>
        </button>
      </section>
    </div>
  );
};
