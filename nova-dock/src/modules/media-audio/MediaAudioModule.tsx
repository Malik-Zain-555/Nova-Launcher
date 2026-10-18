import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface AppVolume {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  icon: string;
}

export const MediaAudioModule: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(75);
  const [selectedDevice, setSelectedDevice] = useState<string>('Headphones (Realtek Audio)');

  const [apps, setApps] = useState<AppVolume[]>([
    { id: 'spotify', name: 'Spotify', volume: 80, muted: false, icon: 'Music' },
    { id: 'chrome', name: 'Google Chrome', volume: 60, muted: false, icon: 'Globe' },
    { id: 'discord', name: 'Discord', volume: 90, muted: false, icon: 'MessageSquare' },
    { id: 'system', name: 'System Sounds', volume: 40, muted: true, icon: 'Bell' }
  ]);

  const handleVolumeChange = (id: string, vol: number) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, volume: vol } : a));
  };

  const handleToggleMute = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, muted: !a.muted } : a));
  };

  return (
    <div className="h-full flex flex-col space-y-4 text-white">
      {/* Top Banner: Now Playing Widget */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-slate-900/40 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Album Art Placeholder */}
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <FluentIcon name="Music2" size={20} />
          </div>

          <div>
            <div className="text-xs font-bold text-white">Midnight City (Chill Synthwave)</div>
            <div className="text-[11px] text-white/60">M83 · Spotify Desktop</div>
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white">
            <FluentIcon name="SkipBack" size={15} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-[var(--nova-accent,#7c5cff)] text-white flex items-center justify-center shadow hover:opacity-90 active:scale-95 transition-all"
          >
            <FluentIcon name={isPlaying ? 'Pause' : 'Play'} size={15} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white">
            <FluentIcon name="SkipForward" size={15} />
          </button>
        </div>
      </div>

      {/* Global Mic & Audio Device Controls */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
        {/* Global Mic Mute */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow ${
              micMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <FluentIcon name={micMuted ? 'MicOff' : 'Mic'} size={15} />
            <span>{micMuted ? 'Global Mic Muted' : 'Microphone Live'}</span>
          </button>
          <span className="text-[11px] text-white/40">Hotkey: Ctrl+M</span>
        </div>

        {/* Audio Device Switcher */}
        <div className="flex items-center gap-2">
          <FluentIcon name="Headphones" size={15} className="text-white/40" />
          <select
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
          >
            <option value="Headphones (Realtek Audio)" className="bg-slate-900 text-white">Headphones (Realtek Audio)</option>
            <option value="Speakers (High Definition Audio)" className="bg-slate-900 text-white">Speakers (High Definition Audio)</option>
            <option value="AirPods Pro (Bluetooth)" className="bg-slate-900 text-white">AirPods Pro (Bluetooth)</option>
          </select>
        </div>
      </div>

      {/* Per-App Volume Mixer */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span className="font-semibold text-white">Windows Per-App Volume Mixer</span>
          <span className="text-[10px] text-white/40 font-mono">Master: {masterVolume}%</span>
        </div>

        <div className="space-y-2">
          {apps.map(app => (
            <div
              key={app.id}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5 w-36">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[var(--nova-accent,#7c5cff)]">
                  <FluentIcon name={app.icon} size={14} />
                </div>
                <span className="text-xs font-medium text-white/90">{app.name}</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={app.muted ? 0 : app.volume}
                onChange={e => handleVolumeChange(app.id, parseInt(e.target.value, 10))}
                className="flex-1 accent-[var(--nova-accent,#7c5cff)] h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />

              <div className="flex items-center gap-2 w-20 justify-end">
                <span className="text-[11px] font-mono text-white/60 w-8 text-right">
                  {app.muted ? 0 : app.volume}%
                </span>
                <button
                  onClick={() => handleToggleMute(app.id)}
                  className={`p-1.5 rounded-lg ${app.muted ? 'text-rose-400 bg-rose-500/10' : 'text-white/60 hover:text-white'}`}
                >
                  <FluentIcon name={app.muted ? 'VolumeX' : 'Volume2'} size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
