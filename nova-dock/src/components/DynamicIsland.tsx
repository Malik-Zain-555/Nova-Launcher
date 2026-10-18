import React, { useState, useEffect, useRef } from 'react';
import { DockState, SystemMetrics, LiveActivity, ContextMode } from '../types';
import { FluentIcon } from './FluentIcon';
import { LiveActivityPill } from './LiveActivityPill';
import { NavigationRail, NavItem } from './NavigationRail';
import { binanceService, CryptoTicker } from '../services/binance-service';
import { dockSettingsService, DockSettings, DOCK_THEMES, coinName } from '../services/dock-settings';

interface DynamicIslandProps {
  metrics: SystemMetrics;
  activeActivities: LiveActivity[];
  onDismissActivity: (id: string) => void;
  contextMode: ContextMode;
  dockPosition: 'top' | 'bottom' | 'left' | 'right';
  onChangeDockPosition: (pos: 'top' | 'bottom' | 'left' | 'right') => void;
  isFullscreenAppActive: boolean;
  onQuickLaunch: (appId: string) => void;
  onOpenCommandPalette: () => void;
  onFileDropped?: (files: FileList) => void;
  navItems: NavItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  renderActivePage: () => React.ReactNode;
  onSelectContextMode?: (mode: ContextMode) => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  metrics,
  activeActivities,
  onDismissActivity,
  contextMode,
  dockPosition,
  onChangeDockPosition: _onChangeDockPosition,
  isFullscreenAppActive,
  onQuickLaunch,
  onOpenCommandPalette,
  onFileDropped,
  navItems,
  activeNavId,
  onSelectNav,
  renderActivePage,
  onSelectContextMode: _onSelectContextMode
}) => {
  const [dockState, setDockState] = useState<DockState>('compact');
  const [visualExpanded, setVisualExpanded] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Live Binance WebSocket Tickers
  const [cryptoTickers, setCryptoTickers] = useState<Map<string, CryptoTicker>>(binanceService.getTickers());

  // Live Dock Customization Settings
  const [settings, setSettings] = useState<DockSettings>(dockSettingsService.getSettings());

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to Binance tickers & dock settings changes
  useEffect(() => {
    // Ensure Binance tracks configured bar coins and watchlist
    const current = dockSettingsService.getSettings();
    const symbolsToStream = Array.from(new Set([
      ...(current.barCoins || []),
      ...(current.cryptoWatchlist || [])
    ]));
    if (symbolsToStream.length > 0) {
      binanceService.setTrackedSymbols(symbolsToStream);
    }

    const unsubCrypto = binanceService.onTickers((updated) => {
      setCryptoTickers(new Map(updated));
    });

    const unsubSettings = dockSettingsService.onSettingsChange((s) => {
      setSettings({ ...s });
      const updatedSymbols = Array.from(new Set([
        ...(s.barCoins || []),
        ...(s.cryptoWatchlist || [])
      ]));
      if (updatedSymbols.length > 0) {
        binanceService.setTrackedSymbols(updatedSymbols);
      }
    });

    return () => {
      unsubCrypto();
      unsubSettings();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Width calculators based on user settings
  const getPillWidthPx = (): number => {
    switch (settings.pillWidth) {
      case 'compact': return 440;
      case 'wide': return 660;
      case 'standard':
      default: return 540;
    }
  };

  const getExpandedWidthPx = (): number => {
    return 820;
  };

  // ── Window Resizing Actions ────────────────────────────────────────────────
  const expandDock = () => {
    const width = getExpandedWidthPx();
    const height = 560;

    // Electron window resize THEN set visual state
    if (typeof window !== 'undefined' && (window as any).novaAPI?.resizeWindow) {
      (window as any).novaAPI.resizeWindow(width, height);
    }
    setDockState('expanded');
    requestAnimationFrame(() => {
      setVisualExpanded(true);
    });
  };

  const collapseDock = () => {
    setIsPinned(false);
    // Set visual state FIRST, then shrink Electron window after 200ms
    setVisualExpanded(false);
    setTimeout(() => {
      setDockState('compact');
      const width = getPillWidthPx();
      const height = 44;
      if (typeof window !== 'undefined' && (window as any).novaAPI?.resizeWindow) {
        (window as any).novaAPI.resizeWindow(width, height);
      }
    }, 200);
  };

  const toggleExpand = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (visualExpanded) {
      collapseDock();
    } else {
      setIsPinned(true);
      expandDock();
    }
  };

  // Click-to-expand by default when clicking on the compact pill
  const handlePillClick = () => {
    if (!visualExpanded) {
      expandDock();
    }
  };

  // Hover triggers (only active when enabled in settings)
  const handleMouseEnter = () => {
    if (settings.expandTrigger === 'hover' && !visualExpanded && !isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        expandDock();
      }, settings.hoverDelay || 200);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (settings.expandTrigger === 'hover' && visualExpanded && !isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        collapseDock();
      }, 220);
    }
  };

  // Drag & drop file support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFileDropped) onFileDropped(e.dataTransfer.files);
    }
  };

  // Auto-hide when fullscreen app is active and dock is unpinned
  const isBottom = (dockPosition || settings.dockPosition) === 'bottom';
  const autoHideTransform = isFullscreenAppActive && !isPinned
    ? (isBottom ? 'translate-y-28 opacity-0 pointer-events-none' : '-translate-y-28 opacity-0 pointer-events-none')
    : 'translate-y-0 opacity-100';

  const currentTheme = DOCK_THEMES[settings.theme] || DOCK_THEMES.obsidian;

  // Active bar coins from settings
  const barCoins = settings.barCoins && settings.barCoins.length > 0
    ? settings.barCoins.slice(0, settings.barCoinCount || 4)
    : ['BTCUSDT', 'ETHUSDT'];

  // Currency price formatter
  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || price === 0) return '—';
    if (price >= 1000) {
      return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    }
    if (price >= 1) {
      return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  };

  // Reusable bar coins ticker component
  const renderBarCoinsTicker = () => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectNav('binance');
        if (!visualExpanded) {
          setIsPinned(true);
          expandDock();
        }
      }}
      className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm select-none"
      title="Binance Live Feed · Click to view Trading Station"
    >
      {/* Live green dot indicator */}
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot flex-shrink-0" />

      {/* Real-time bar coins */}
      <div className="flex items-center gap-2">
        {barCoins.map((symbol, idx) => {
          const ticker = cryptoTickers.get(symbol);
          const hasPrice = ticker && ticker.price > 0;
          const isUp = hasPrice && ticker.priceChangePercent >= 0;
          const changeColor = hasPrice ? (isUp ? 'text-emerald-400' : 'text-rose-400') : 'text-white/40';

          return (
            <React.Fragment key={symbol}>
              {idx > 0 && <span className="text-white/20 text-[10px] select-none font-sans">·</span>}
              <div className="flex items-center gap-1.5 font-mono text-[11px] leading-none">
                <span className="text-white/80 font-sans font-medium text-[11px]">{coinName(symbol)}</span>
                <span className={`font-semibold ${hasPrice ? changeColor : 'text-white/40 ticker-loading'}`}>
                  {hasPrice ? formatPrice(ticker.price) : '—'}
                </span>
                {hasPrice && (
                  <span className={`text-[9.5px] font-semibold ${changeColor}`}>
                    {isUp ? '▲' : '▼'}{Math.abs(ticker.priceChangePercent).toFixed(1)}%
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      onClick={handlePillClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative mx-auto select-none gpu-layer island-transition transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${autoHideTransform} ${
        isDragOver ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent' : ''
      } ${
        visualExpanded
          ? 'rounded-[20px]'
          : 'rounded-[22px] cursor-pointer hover:border-white/20'
      } border overflow-hidden`}
      style={{
        width: visualExpanded ? getExpandedWidthPx() : getPillWidthPx(),
        height: visualExpanded ? 560 : 44,
        backgroundColor: currentTheme.bg,
        opacity: settings.glassOpacity ?? 0.98,
        borderColor: currentTheme.border,
        boxShadow: visualExpanded
          ? `0 24px 64px rgba(0, 0, 0, 0.92), 0 0 24px ${currentTheme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.16)`
          : `0 10px 32px rgba(0, 0, 0, 0.75), 0 0 14px ${currentTheme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.16)`
      }}
    >
      {/* Specular Edge Highlight */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-full z-30" />

      {/* HEADER / COMPACT PILL BAR */}
      <header
        className={`h-[44px] px-3.5 flex items-center justify-between gap-2 z-20 relative w-full gpu-layer transition-colors duration-200 ${
          visualExpanded ? 'border-b border-white/10 bg-[#07080E]' : ''
        }`}
      >
        {visualExpanded ? (
          /* EXPANDED HEADER: [⚡ logo] [bar coins ticker] [customize button] [pin toggle] [✕ close] */
          <>
            {/* Left: Logo & Station Title */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                onClick={collapseDock}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500/20 to-violet-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)] select-none cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title="Nova Dock 2.0 · Click to collapse"
              >
                <span className="text-xs">⚡</span>
              </div>
              <span className="text-xs font-bold text-white tracking-wide hidden sm:inline">Nova Station</span>
            </div>

            {/* Center: Bar Coins Live Ticker */}
            <div className="flex items-center justify-center min-w-0">
              {renderBarCoinsTicker()}
            </div>

            {/* Right: Customize, Pin Toggle, Close */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNav('customizer');
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  activeNavId === 'customizer'
                    ? 'bg-amber-500 text-black shadow-md font-bold'
                    : 'bg-white/10 hover:bg-white/15 text-white/90 hover:text-white'
                }`}
                title="Customize Dock"
              >
                <FluentIcon name="Sliders" size={12} />
                <span>Customize</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinned(!isPinned);
                }}
                title={isPinned ? 'Dock will stay open (Pinned)' : 'Auto-collapse enabled'}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  isPinned
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'text-white/40 hover:text-white bg-white/5 border border-white/5'
                }`}
              >
                {isPinned ? 'PINNED' : 'AUTO'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  collapseDock();
                }}
                title="Close Dock"
                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          </>
        ) : (
          /* COMPACT PILL: [⚡ logo] [live-dot + custom coins from settings.barCoins] [clock] [battery] [▾ expand] */
          <>
            {/* Left: Logo & Quick Apps */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500/20 to-violet-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] flex-shrink-0"
                title="Nova Dock 2.0 · Click to expand"
              >
                <span className="text-xs">⚡</span>
              </div>

              {settings.visibleWidgets.quickApps && (
                <div className="flex items-center gap-0.5 ml-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickLaunch('chrome');
                    }}
                    title="Browser"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                  >
                    <FluentIcon name="Globe" size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickLaunch('cmd');
                    }}
                    title="Terminal"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                  >
                    <FluentIcon name="Terminal" size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickLaunch('code');
                    }}
                    title="VS Code"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                  >
                    <FluentIcon name="Code" size={13} />
                  </button>
                </div>
              )}

              {settings.visibleWidgets.commandBadge && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCommandPalette();
                  }}
                  title="Command Palette (Ctrl+Alt+Space)"
                  className="ml-0.5 px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center gap-1 text-[10px] text-white/80 transition-all hover:scale-105 active:scale-95 shadow-sm font-mono font-bold"
                >
                  <span className="text-amber-400">⌘</span>
                  <span>Space</span>
                </button>
              )}
            </div>

            {/* Center: Live Activities or Bar Coins Ticker */}
            <div className="flex items-center justify-center min-w-0">
              {activeActivities.length > 0 ? (
                <LiveActivityPill
                  activity={activeActivities[0]}
                  onDismiss={onDismissActivity}
                  onClick={() => {
                    setIsPinned(true);
                    expandDock();
                  }}
                />
              ) : settings.visibleWidgets.cryptoTicker ? (
                renderBarCoinsTicker()
              ) : (
                <span className="text-[11px] font-semibold text-white/80 tracking-tight">Nova Dock 2.0</span>
              )}
            </div>

            {/* Right: Telemetry Widgets & Minimal Expand Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {settings.visibleWidgets.cpuRam && (
                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/5 text-[9.5px] font-mono text-cyan-300">
                  <span className="text-white/40">CPU</span>
                  <span>{metrics.cpuUsage}%</span>
                </div>
              )}

              {/* Battery indicator */}
              {settings.visibleWidgets.battery && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                  <FluentIcon
                    name={metrics.isCharging ? 'Zap' : metrics.batteryPercent < 20 ? 'BatteryWarning' : 'Battery'}
                    size={11}
                    className={metrics.isCharging ? 'text-amber-400' : 'text-emerald-400'}
                  />
                  <span className="font-mono text-[9.5px] font-bold">{metrics.batteryPercent}%</span>
                </div>
              )}

              {/* Real Clock */}
              {settings.visibleWidgets.clock && (
                <div className="font-bold text-white tracking-tight text-[11px] font-mono px-0.5">
                  {metrics.currentTime}
                </div>
              )}

              {/* Minimal Expand Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                title="Expand All Features"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center text-[11px] font-bold transition-all active:scale-90"
              >
                <span>▾</span>
              </button>
            </div>
          </>
        )}
      </header>

      {/* EXPANDED CONTENT VIEWPORT */}
      {dockState === 'expanded' && (
        <div
          className={`h-[516px] flex overflow-hidden island-content-enter ${
            visualExpanded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Left NavigationRail Sidebar */}
          <NavigationRail
            items={navItems}
            activeId={activeNavId}
            onSelect={onSelectNav}
            isPinned={isPinned}
            onTogglePin={() => setIsPinned(!isPinned)}
            contextMode={contextMode}
          />

          {/* Right Active Page Viewport */}
          <section className="flex-1 h-full p-4 overflow-y-auto custom-scrollbar bg-[#090A0F]">
            {renderActivePage()}
          </section>
        </div>
      )}

      {/* Drag & Drop File Zone Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 rounded-[20px] bg-amber-500/20 backdrop-blur-md border-2 border-dashed border-amber-400 flex items-center justify-center pointer-events-none z-40">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <FluentIcon name="UploadCloud" size={20} />
            <span>Drop file onto Nova Dock</span>
          </div>
        </div>
      )}
    </div>
  );
};
