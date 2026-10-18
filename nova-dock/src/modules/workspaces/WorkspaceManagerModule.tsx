import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface WorkspacePreset {
  id: string;
  name: string;
  icon: string;
  apps: string[];
  contextMode: string;
  description: string;
}

export const WorkspaceManagerModule: React.FC = () => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('work');
  const [isActivating, setIsActivating] = useState<boolean>(false);

  const presets: WorkspacePreset[] = [
    {
      id: 'work',
      name: 'Development & Engineering',
      icon: 'Code',
      apps: ['code', 'cmd', 'chrome'],
      contextMode: 'Coding',
      description: 'Opens VS Code, Terminal, and Chrome; sets volume to 40% and enables Coding Context.'
    },
    {
      id: 'study',
      name: 'Research & Study',
      icon: 'BookOpen',
      apps: ['notion', 'msedge'],
      contextMode: 'Writing',
      description: 'Opens Notion and Edge; starts 45m Pomodoro and sets ambient rain lo-fi.'
    },
    {
      id: 'streaming',
      name: 'Streaming & Media',
      icon: 'Radio',
      apps: ['spotify', 'discord'],
      contextMode: 'General',
      description: 'Opens Spotify and Discord; unmutes desktop audio and maximizes media controls.'
    },
    {
      id: 'focus',
      name: 'Zero-Distraction Isolation',
      icon: 'Shield',
      apps: [],
      contextMode: 'Coding',
      description: 'Enables Deep Work DND, minimizes non-essential apps, and locks Dynamic Island.'
    }
  ];

  const handleActivateWorkspace = (preset: WorkspacePreset) => {
    setActiveWorkspaceId(preset.id);
    setIsActivating(true);

    // Launch apps via Electron if available
    preset.apps.forEach(appCmd => {
      if (typeof window !== 'undefined' && (window as any).novaAPI?.launchApp) {
        (window as any).novaAPI.launchApp(appCmd);
      }
    });

    setTimeout(() => {
      setIsActivating(false);
    }, 700);
  };

  const handleSnap = (dir: string) => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.snapWindow) {
      (window as any).novaAPI.snapWindow(dir);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 text-white">
      {/* Top: Snap Layouts Matrix */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white/90">Instant Window Snap Layouts</span>
          <span className="text-[10px] text-white/40">PowerToys-style Layout Snapping</span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {[
            { id: 'left', label: 'Left Half', icon: 'PanelLeft' },
            { id: 'right', label: 'Right Half', icon: 'PanelRight' },
            { id: 'top', label: 'Top Half', icon: 'PanelTop' },
            { id: 'bottom', label: 'Bottom Half', icon: 'PanelBottom' },
            { id: 'max', label: 'Maximize', icon: 'Maximize' },
            { id: 'min', label: 'Minimize', icon: 'Minimize2' }
          ].map(snap => (
            <button
              key={snap.id}
              onClick={() => handleSnap(snap.id)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 flex flex-col items-center gap-1.5 text-xs text-white/80 transition-all hover:scale-105 active:scale-95"
            >
              <FluentIcon name={snap.icon} size={16} className="text-[var(--nova-accent,#7c5cff)]" />
              <span className="text-[10px] font-medium">{snap.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Workspaces Grid */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white/90">Saved Productivity Workspaces</span>
          <span className="text-[10px] text-white/40">1-Click Multi-App Orchestration</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {presets.map(ws => {
            const isActive = activeWorkspaceId === ws.id;
            return (
              <div
                key={ws.id}
                onClick={() => handleActivateWorkspace(ws)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-[var(--nova-accent,#7c5cff)]/15 border-[var(--nova-accent,#7c5cff)] shadow-lg'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[var(--nova-accent,#7c5cff)]">
                        <FluentIcon name={ws.icon} size={15} />
                      </div>
                      <span className="text-xs font-bold text-white">{ws.name}</span>
                    </div>

                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">
                      {ws.contextMode}
                    </span>
                  </div>

                  <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                    {ws.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Apps: {ws.apps.join(', ') || 'None (Isolated)'}</span>
                  <button
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-semibold text-white flex items-center gap-1"
                  >
                    <FluentIcon name="Play" size={10} />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
