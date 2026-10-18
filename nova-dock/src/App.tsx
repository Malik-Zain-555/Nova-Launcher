import React, { useState, useEffect } from 'react';
import { DynamicIsland } from './components/DynamicIsland';
import { CommandPalette, PaletteItem } from './components/CommandPalette';
import { FluentIcon } from './components/FluentIcon';
import { NavItem } from './components/NavigationRail';
import { SystemMetrics, LiveActivity, ContextMode } from './types';
import { DesignTokens, AccentKey } from './design-system/tokens';
import { OnboardingModal } from './components/OnboardingModal';
import { AICopilotModule } from './modules/copilot/AICopilotModule';
import { DayOrchestratorModule } from './modules/day-orchestrator/DayOrchestratorModule';
import { FocusSuiteModule } from './modules/focus/FocusSuiteModule';
import { TasksProjectsModule } from './modules/tasks/TasksProjectsModule';
import { CalendarMeetingsModule } from './modules/calendar/CalendarMeetingsModule';
import { NotesCaptureModule } from './modules/notes/NotesCaptureModule';
import { ClipboardProModule } from './modules/clipboard/ClipboardProModule';
import { SnippetsModule } from './modules/snippets/SnippetsModule';
import { WorkspaceManagerModule } from './modules/workspaces/WorkspaceManagerModule';
import { AutomationEngineModule } from './modules/automation/AutomationEngineModule';
import { PCDoctorModule } from './modules/pc-doctor/PCDoctorModule';
import { MediaAudioModule } from './modules/media-audio/MediaAudioModule';
import { QuickToolsModule } from './modules/quick-tools/QuickToolsModule';
import { FlowRewindModule } from './modules/flow-rewind/FlowRewindModule';
import { BinanceCryptoModule } from './modules/crypto/BinanceCryptoModule';
import { binanceService } from './services/binance-service';
import { DockCustomizerModule } from './modules/customizer/DockCustomizerModule';
import { dockSettingsService } from './services/dock-settings';

export const App: React.FC = () => {
  // Theme & Dock Position
  const [accent, setAccent] = useState<AccentKey>('violet');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [dockPosition, setDockPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [contextMode, setContextMode] = useState<ContextMode>('General');
  const [isFullscreenAppActive, setIsFullscreenAppActive] = useState<boolean>(false);

  // Shell Navigation State — start on 'home' dashboard
  const [activeNavId, setActiveNavId] = useState<string>('home');
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const openTour = () => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.resizeWindow) {
      (window as any).novaAPI.resizeWindow(620, 560);
    }
    setIsOnboardingOpen(true);
  };

  const closeTour = () => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.resizeWindow) {
      (window as any).novaAPI.resizeWindow(580, 52);
    }
    setIsOnboardingOpen(false);
  };

  // Real System Metrics (real timer for clock/date; hardware stats from IPC if available)
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 0,
    batteryPercent: 100,
    isCharging: false,
    networkUp: 0,
    networkDown: 0,
    currentTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    currentDate: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  });

  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      setMetrics(prev => ({
        ...prev,
        currentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        currentDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      }));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Sync binanceService with dock settings on mount and change
  useEffect(() => {
    const unsub = dockSettingsService.onSettingsChange((s) => {
      const allSymbols = [...new Set([...s.barCoins, ...s.cryptoWatchlist])];
      binanceService.setTrackedSymbols(allSymbols);
    });
    return unsub;
  }, []);

  // Activities: Starts empty, populated dynamically by real events (timer, alerts, clips)
  const [activities, setActivities] = useState<LiveActivity[]>([]);

  // Pomodoro Focus state (synchronized with FocusSuiteModule)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Clipboard history state (populated by real system clipboard IPC)
  const [clipboardItems, setClipboardItems] = useState<string[]>([]);

  // Connect Electron IPC & crypto alert listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).novaAPI) {
      const api = (window as any).novaAPI;
      if (api.onMetricsUpdate) {
        api.onMetricsUpdate((m: SystemMetrics) => setMetrics(prev => ({ ...prev, ...m })));
      }
      if (api.getSystemMetrics) {
        api.getSystemMetrics().then((m: SystemMetrics) => {
          if (m) setMetrics(prev => ({ ...prev, ...m }));
        }).catch(() => {});
      }
      if (api.onClipboardNew) {
        api.onClipboardNew((item: any) => {
          if (item?.text) {
            setClipboardItems(prev => [item.text, ...prev.filter(x => x !== item.text)].slice(0, 30));
            setActivities(prev => [
              {
                id: `clip-${Date.now()}`,
                type: 'clipboard',
                title: 'Copied to Clipboard',
                subtitle: item.text.slice(0, 32),
                expiresAt: Date.now() + 3000
              },
              ...prev.filter(a => a.type !== 'clipboard')
            ]);
          }
        });
      }
      if (api.onSummonPalette) {
        api.onSummonPalette(() => setIsPaletteOpen(true));
      }
      if (api.onFullscreenChange) {
        api.onFullscreenChange((isFs: boolean) => setIsFullscreenAppActive(isFs));
      }
    }

    const unsubAlert = binanceService.onAlertTriggered((alert, price) => {
      setActivities(prev => [
        {
          id: `crypto-${alert.id}-${Date.now()}`,
          type: 'custom',
          title: `Price Alert: ${alert.symbol} hit $${price.toLocaleString()}!`,
          subtitle: alert.note ? `${alert.note} (Target: $${alert.targetPrice.toLocaleString()})` : `Target $${alert.targetPrice.toLocaleString()} reached`,
          iconName: 'TrendingUp',
          accentColor: '#f59e0b',
          expiresAt: Date.now() + 10000
        },
        ...prev
      ]);
    });

    return () => {
      unsubAlert();
    };
  }, []);

  // Global keydown listener for keyboard-first invocation (Ctrl+Alt+Space)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'Space') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            setIsTimerRunning(false);
            setActivities(prev => [
              {
                id: `timer-done-${Date.now()}`,
                type: 'timer',
                title: 'Focus Session Finished',
                subtitle: 'Take a well-deserved 5m break',
                accentColor: '#34d399'
              },
              ...prev.filter(a => a.type !== 'timer')
            ]);
            return 25 * 60;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Synchronize Live Activity for timer
  useEffect(() => {
    if (isTimerRunning) {
      const mins = Math.floor(timerSeconds / 60);
      const secs = (timerSeconds % 60).toString().padStart(2, '0');
      setActivities(prev => [
        {
          id: 'focus-timer',
          type: 'timer',
          title: `Focus: ${mins}:${secs}`,
          subtitle: 'Deep Work Session',
          progress: 1 - timerSeconds / (25 * 60)
        },
        ...prev.filter(a => a.id !== 'focus-timer')
      ]);
    } else {
      setActivities(prev => prev.filter(a => a.id !== 'focus-timer'));
    }
  }, [isTimerRunning, timerSeconds]);

  // Apply Accent CSS
  useEffect(() => {
    const hex = DesignTokens.colors.accents[accent]?.hex || '#7c5cff';
    document.documentElement.style.setProperty('--nova-accent', hex);
  }, [accent]);

  // Actions for Command Palette & Quick Launch
  const handleQuickLaunch = (appId: string) => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.launchApp) {
      (window as any).novaAPI.launchApp(appId);
    } else {
      console.log(`[QuickLaunch] Launching ${appId}`);
    }
  };

  const handleKillProcess = (proc: string) => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.killProcess) {
      (window as any).novaAPI.killProcess(proc);
    }
    setActivities(prev => [
      {
        id: `kill-${Date.now()}`,
        type: 'custom',
        title: `Killed Process: ${proc}`,
        subtitle: 'Terminated via PC Doctor',
        iconName: 'ZapOff',
        expiresAt: Date.now() + 3000
      },
      ...prev
    ]);
  };

  const handleOpenFolder = (folder: string) => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.openFolder) {
      (window as any).novaAPI.openFolder(folder);
    }
  };

  const handleSnap = (direction: string) => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.snapWindow) {
      (window as any).novaAPI.snapWindow(direction);
    }
  };

  const handleStartTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

  const handleAddReminder = (title: string, timeStr?: string) => {
    setActivities(prev => [
      {
        id: `remind-${Date.now()}`,
        type: 'custom',
        title: `Reminder Added: "${title}"`,
        subtitle: timeStr ? `Scheduled for ${timeStr}` : 'Saved to Tasks',
        iconName: 'CheckCircle2',
        expiresAt: Date.now() + 4000
      },
      ...prev
    ]);
  };

  // Nav Items (Complete Modular System)
  const navItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: 'Home' },
    { id: 'binance', label: 'Crypto Live', icon: 'TrendingUp', badge: 'LIVE' },
    { id: 'copilot', label: 'AI Copilot', icon: 'Sparkles' },
    { id: 'orchestrator', label: 'Day Planner', icon: 'CalendarDays' },
    { id: 'focus', label: 'Focus Timer', icon: 'Timer', badge: isTimerRunning ? 'RUN' : undefined },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
    { id: 'notes', label: 'Notes', icon: 'FileText' },
    { id: 'clipboard', label: 'Clipboard', icon: 'Clipboard' },
    { id: 'snippets', label: 'Snippets', icon: 'Code' },
    { id: 'workspaces', label: 'Workspaces', icon: 'Layout' },
    { id: 'automation', label: 'Automation', icon: 'Cpu' },
    { id: 'doctor', label: 'PC Doctor', icon: 'Activity' },
    { id: 'media', label: 'Media', icon: 'Headphones' },
    { id: 'tools', label: 'Quick Tools', icon: 'Wrench' },
    { id: 'rewind', label: 'Flow Rewind', icon: 'History' },
    { id: 'customizer', label: 'Customize', icon: 'Sliders' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  // Palette Items for Fuzzy Search
  const paletteItems: PaletteItem[] = [
    { id: 'nav-home', title: 'Open Dashboard', subtitle: 'System overview & quick actions', category: 'Action', icon: 'Home', action: () => setActiveNavId('home') },
    { id: 'nav-binance', title: 'Open Binance Live Crypto', subtitle: 'Real-time coin prices, ticker & target alerts', category: 'Action', icon: 'TrendingUp', action: () => setActiveNavId('binance') },
    { id: 'nav-customizer', title: 'Open Dock Customizer', subtitle: 'Customize themes, opacity, width & widgets', category: 'Action', icon: 'Sliders', action: () => setActiveNavId('customizer') },
    { id: 'nav-copilot', title: 'Open AI Copilot Chat', subtitle: 'Chat with Claude, GPT-4o, or local Ollama', category: 'AI', icon: 'Sparkles', action: () => setActiveNavId('copilot') },
    { id: 'nav-orchestrator', title: 'Open Day Orchestrator', subtitle: 'Plan daily focus and schedules', category: 'Action', icon: 'CalendarDays', action: () => setActiveNavId('orchestrator') },
    { id: 'nav-focus', title: 'Open Focus Suite', subtitle: 'Pomodoro timer and deep work sessions', category: 'Action', icon: 'Timer', action: () => setActiveNavId('focus') },
    { id: 'nav-doctor', title: 'Open PC Doctor', subtitle: 'Diagnose problems, check RAM/CPU, clean cache', category: 'System', icon: 'Activity', action: () => setActiveNavId('doctor') },
    { id: 'nav-automation', title: 'Open Automation Engine', subtitle: 'Run macros, routines, and IFTTT rules', category: 'Action', icon: 'Cpu', action: () => setActiveNavId('automation') },
    { id: 'nav-media', title: 'Open Media & Audio Controls', subtitle: 'Per-app mixer and now playing', category: 'Action', icon: 'Headphones', action: () => setActiveNavId('media') },
    { id: 'nav-tools', title: 'Open Quick Tools', subtitle: 'Password gen, Base64, color picker, QR', category: 'Action', icon: 'Wrench', action: () => setActiveNavId('tools') },
    { id: 'nav-tasks', title: 'Open Tasks & Projects', subtitle: 'Manage tasks and project roadmaps', category: 'Action', icon: 'CheckSquare', action: () => setActiveNavId('tasks') },
    { id: 'nav-calendar', title: 'Open Calendar & Meet', subtitle: 'View upcoming events and sync meetings', category: 'Action', icon: 'Calendar', action: () => setActiveNavId('calendar') },
    { id: 'nav-notes', title: 'Open Notes & Capture', subtitle: 'Quick notes and markdown scratchpad', category: 'Action', icon: 'FileText', action: () => setActiveNavId('notes') },
    { id: 'nav-clipboard', title: 'Open Clipboard Pro', subtitle: 'Searchable clipboard history', category: 'Action', icon: 'Clipboard', action: () => setActiveNavId('clipboard') },
    { id: 'nav-snippets', title: 'Open Text Snippets', subtitle: 'Reusable text templates and code snippets', category: 'Action', icon: 'Code', action: () => setActiveNavId('snippets') },
    { id: 'nav-workspaces', title: 'Open Workspace Manager', subtitle: 'Switch virtual desktop workspaces', category: 'Action', icon: 'Layout', action: () => setActiveNavId('workspaces') },
    { id: 'nav-rewind', title: 'Open Flow Rewind', subtitle: 'Activity history and time rewind', category: 'Action', icon: 'History', action: () => setActiveNavId('rewind') },
    { id: 'app-chrome', title: 'Google Chrome', subtitle: 'Open Web Browser', category: 'App', icon: 'Globe', keywords: ['browser', 'internet'], action: () => handleQuickLaunch('chrome') },
    { id: 'app-explorer', title: 'File Explorer', subtitle: 'Browse Files & Folders', category: 'App', icon: 'Folder', keywords: ['files'], action: () => handleQuickLaunch('explorer') },
    { id: 'app-code', title: 'Visual Studio Code', subtitle: 'Code Editor', category: 'App', icon: 'Code', keywords: ['ide', 'ts'], action: () => handleQuickLaunch('code') },
    { id: 'app-terminal', title: 'Windows Terminal', subtitle: 'PowerShell & CLI', category: 'App', icon: 'Terminal', keywords: ['cmd', 'bash'], action: () => handleQuickLaunch('cmd') },
    { id: 'app-calc', title: 'Calculator', subtitle: 'System Calculator', category: 'App', icon: 'Calculator', action: () => handleQuickLaunch('calc') },
    { id: 'act-snip', title: 'Screen Clip', subtitle: 'Snipping Tool (Win+Shift+S)', category: 'Action', icon: 'Scissors', action: () => handleQuickLaunch('ms-screenclip:') },
    { id: 'act-lock', title: 'Lock PC', subtitle: 'Lock workstation', category: 'System', icon: 'Lock', action: () => (window as any).novaAPI?.systemAction('lock') },
    { id: 'act-sleep', title: 'Sleep PC', subtitle: 'Low power state', category: 'System', icon: 'Moon', action: () => (window as any).novaAPI?.systemAction('sleep') },
    { id: 'act-recycle', title: 'Empty Recycle Bin', subtitle: 'Clear trash', category: 'System', icon: 'Trash2', action: () => (window as any).novaAPI?.systemAction('empty-recycle') },
    { id: 'snap-left', title: 'Snap Left Half', subtitle: 'Tile active window to left', category: 'Action', icon: 'PanelLeft', action: () => handleSnap('left') },
    { id: 'snap-right', title: 'Snap Right Half', subtitle: 'Tile active window to right', category: 'Action', icon: 'PanelRight', action: () => handleSnap('right') },
    ...clipboardItems.map((clip, i) => ({
      id: `clip-${i}`,
      title: clip.length > 50 ? `${clip.slice(0, 50)}...` : clip,
      subtitle: 'Copy back to clipboard',
      category: 'Clipboard' as const,
      icon: 'Clipboard',
      action: () => navigator.clipboard.writeText(clip)
    }))
  ];

  // Render Active Page
  const renderActivePage = () => {
    switch (activeNavId) {
      case 'home':
        return (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Real Live Clock & Status Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-white tracking-tight">Nova Dock</h2>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    v2.0 Active
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  {metrics.currentDate} · <span className="font-mono text-white/70">{metrics.currentTime}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveNavId('customizer')}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white/90 font-medium flex items-center gap-1.5 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 border border-white/10"
                >
                  <FluentIcon name="Sliders" size={13} className="text-[var(--nova-accent)]" />
                  <span>Customize</span>
                </button>
                <button
                  onClick={openTour}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white/90 font-medium flex items-center gap-1.5 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 border border-white/10"
                >
                  <FluentIcon name="Sparkles" size={13} className="text-[var(--nova-accent)]" />
                  <span>Tour</span>
                </button>
              </div>
            </div>

            {/* Real Live Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* CPU Usage */}
              <div
                onClick={() => setActiveNavId('doctor')}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  <span>CPU Usage</span>
                  <FluentIcon name="Cpu" size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1.5">
                  {metrics.cpuUsage > 0 ? `${metrics.cpuUsage}%` : '—'}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${metrics.cpuUsage > 0 ? 'bg-cyan-400' : 'bg-white/20'}`} />
                  <span className="text-[11px] text-white/50">
                    {metrics.cpuUsage > 0 ? 'Live telemetry active' : 'Waiting for telemetry'}
                  </span>
                </div>
              </div>

              {/* Memory Usage */}
              <div
                onClick={() => setActiveNavId('doctor')}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  <span>Memory Usage</span>
                  <FluentIcon name="Activity" size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1.5">
                  {metrics.ramUsage > 0 ? `${metrics.ramUsage}%` : '—'}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${metrics.ramUsage > 0 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  <span className="text-[11px] text-white/50">
                    {metrics.ramUsage > 0 ? 'System memory tracked' : 'Waiting for telemetry'}
                  </span>
                </div>
              </div>

              {/* Focus Session */}
              <div
                onClick={() => setActiveNavId('focus')}
                className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                  <span>Focus Session</span>
                  <FluentIcon name="Timer" size={14} className="text-[var(--nova-accent)] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1.5">
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                  <span className="text-[11px] text-[var(--nova-accent)] font-medium">
                    {isTimerRunning ? 'Session in progress' : 'Ready to start'}
                  </span>
                </div>
              </div>
            </div>

            {/* Getting Started Cards (linking to customizer and binance modules) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setActiveNavId('binance')}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-transparent border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2.5 group-hover:scale-105 transition-transform">
                  <FluentIcon name="TrendingUp" size={16} />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Live Crypto Station</h3>
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 rounded">
                    BINANCE
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Real-time WebSocket market streams, 24h ticker statistics, and custom price alerts directly on your dock.
                </p>
                <div className="mt-3 flex items-center text-xs text-amber-400 font-medium gap-1 group-hover:gap-2 transition-all">
                  <span>Open Crypto Live</span>
                  <span>→</span>
                </div>
              </div>

              <div
                onClick={() => setActiveNavId('customizer')}
                className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-white/[0.02] to-transparent border border-violet-500/20 hover:border-violet-500/40 cursor-pointer transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2.5 group-hover:scale-105 transition-transform">
                  <FluentIcon name="Sliders" size={16} />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Dock Customizer</h3>
                  <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-500/15 border border-violet-500/25 px-1.5 py-0.5 rounded">
                    APPEARANCE
                  </span>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Tailor themes, glass opacity, pill width, visible telemetry widgets, and which coins display on the compact pill.
                </p>
                <div className="mt-3 flex items-center text-xs text-violet-400 font-medium gap-1 group-hover:gap-2 transition-all">
                  <span>Configure Dock</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            {/* Quick System Action Buttons */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">
                System Actions
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: 'Screen Clip',
                    icon: 'Scissors',
                    desc: 'Snipping tool',
                    action: () => handleQuickLaunch('ms-screenclip:')
                  },
                  {
                    label: 'Lock PC',
                    icon: 'Lock',
                    desc: 'Lock session',
                    action: () => (window as any).novaAPI?.systemAction('lock')
                  },
                  {
                    label: 'Sleep PC',
                    icon: 'Moon',
                    desc: 'Low power state',
                    action: () => (window as any).novaAPI?.systemAction('sleep')
                  },
                  {
                    label: 'Empty Recycle Bin',
                    icon: 'Trash2',
                    desc: 'Clean storage',
                    action: () => (window as any).novaAPI?.systemAction('empty-recycle')
                  }
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={act.action}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 flex flex-col gap-1 text-left transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] active:scale-95 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-[var(--nova-accent)] group-hover:scale-110 transition-transform">
                      <FluentIcon name={act.icon} size={14} />
                    </div>
                    <span className="font-semibold text-xs text-white/90 mt-1">{act.label}</span>
                    <span className="text-[10px] text-white/40">{act.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'copilot':
        return <AICopilotModule />;

      case 'orchestrator':
        return <DayOrchestratorModule />;

      case 'focus':
        return (
          <FocusSuiteModule
            timerSeconds={timerSeconds}
            isTimerRunning={isTimerRunning}
            onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
            onResetTimer={(mins) => {
              setIsTimerRunning(false);
              setTimerSeconds(mins * 60);
            }}
          />
        );

      case 'binance':
        return <BinanceCryptoModule />;

      case 'tasks':
        return <TasksProjectsModule />;

      case 'calendar':
        return <CalendarMeetingsModule />;

      case 'notes':
        return <NotesCaptureModule />;

      case 'clipboard':
        return <ClipboardProModule />;

      case 'snippets':
        return <SnippetsModule />;

      case 'workspaces':
        return <WorkspaceManagerModule />;

      case 'automation':
        return <AutomationEngineModule />;

      case 'doctor':
        return <PCDoctorModule />;

      case 'media':
        return <MediaAudioModule />;

      case 'tools':
        return <QuickToolsModule />;

      case 'rewind':
        return <FlowRewindModule />;

      case 'customizer':
      case 'settings':
        return <DockCustomizerModule />;

      default:
        return (
          <div className="flex items-center justify-center h-full text-xs text-white/50">
            Module view under construction for {activeNavId}.
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full m-0 p-0 overflow-hidden flex flex-col items-center justify-start bg-transparent select-none">
      {/* 3-State Dynamic Island Shell */}
      <DynamicIsland
        metrics={metrics}
        activeActivities={activities}
        onDismissActivity={id => setActivities(prev => prev.filter(a => a.id !== id))}
        contextMode={contextMode}
        dockPosition={dockPosition}
        onChangeDockPosition={setDockPosition}
        isFullscreenAppActive={isFullscreenAppActive}
        onQuickLaunch={handleQuickLaunch}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        navItems={navItems}
        activeNavId={activeNavId}
        onSelectNav={setActiveNavId}
        renderActivePage={renderActivePage}
        onSelectContextMode={setContextMode}
      />

      {/* Raycast-Style Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        items={paletteItems}
        onStartTimer={handleStartTimer}
        onAddReminder={handleAddReminder}
        onKillProcess={handleKillProcess}
        onOpenFolder={handleOpenFolder}
        onSnap={handleSnap}
        onSetThemeMode={setThemeMode}
        onSetAccent={color => setAccent(color as AccentKey)}
      />

      {/* 60-Second Onboarding Tour & v1.0 Importer */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          localStorage.setItem('nova_onboarding_done', 'true');
          closeTour();
        }}
        onImportV1Data={data => {
          if (data.accent) setAccent(data.accent);
        }}
      />
    </div>
  );
};
