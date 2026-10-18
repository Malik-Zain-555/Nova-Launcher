import React, { useState, useEffect } from 'react';
import { FluentIcon } from '../../components/FluentIcon';
import { FocusAudioEngine } from './FocusAudio';

interface FocusSuiteProps {
  timerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: (minutes: number) => void;
}

export const FocusSuiteModule: React.FC<FocusSuiteProps> = ({
  timerSeconds,
  isTimerRunning,
  onToggleTimer,
  onResetTimer
}) => {
  const [selectedCycle, setSelectedCycle] = useState<number>(25);
  const [breakCycle, setBreakCycle] = useState<number>(5);
  const [isDeepWork, setIsDeepWork] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'white-noise' | 'lo-fi'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);
  const [streakDays, setStreakDays] = useState<number>(4);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(6);

  // Health Reminders countdown (in minutes)
  const [eyeBreakMinutes, setEyeBreakMinutes] = useState<number>(14);
  const [waterMinutes, setWaterMinutes] = useState<number>(28);

  const handleSoundChange = (sound: 'none' | 'rain' | 'white-noise' | 'lo-fi') => {
    setAmbientSound(sound);
    if (sound === 'none') {
      FocusAudioEngine.stop();
    } else {
      FocusAudioEngine.play(sound, ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    FocusAudioEngine.setVolume(vol);
  };

  const mins = Math.floor(timerSeconds / 60);
  const secs = (timerSeconds % 60).toString().padStart(2, '0');
  const totalSeconds = selectedCycle * 60;
  const progressRatio = 1 - timerSeconds / totalSeconds;

  return (
    <div className="h-full flex flex-col space-y-4 text-white">
      {/* Top Controls Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Pomodoro Ring & Controls */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center space-y-3">
          <div className="relative w-36 h-36 rounded-full border-4 border-white/10 flex flex-col items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-[var(--nova-accent,#7c5cff)] transition-all duration-500 fill-none"
                strokeWidth="6"
                strokeDasharray={402}
                strokeDashoffset={402 - 402 * Math.min(1, Math.max(0, progressRatio))}
                strokeLinecap="round"
              />
            </svg>

            <span className="text-2xl font-bold font-mono text-white tracking-wider z-10">
              {mins}:{secs}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest z-10">
              {isDeepWork ? 'Deep Work' : 'Pomodoro'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onToggleTimer}
              className="px-5 py-2 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <FluentIcon name={isTimerRunning ? 'Pause' : 'Play'} size={14} />
              <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              onClick={() => onResetTimer(selectedCycle)}
              className="px-3 py-2 rounded-xl bg-white/10 text-white/70 text-xs font-medium hover:bg-white/15 active:scale-95 transition-all"
            >
              Reset
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-1.5 pt-1">
            {[25, 45, 60].map(duration => (
              <button
                key={duration}
                onClick={() => {
                  setSelectedCycle(duration);
                  onResetTimer(duration);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  selectedCycle === duration
                    ? 'bg-white/20 text-white font-bold border border-white/30'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {duration}m
              </button>
            ))}
          </div>
        </div>

        {/* Right: Deep Work Mode & Ambient Lo-Fi Generator */}
        <div className="space-y-3 flex flex-col justify-between">
          {/* Deep Work Mode Toggle */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FluentIcon name="ShieldAlert" size={16} className="text-purple-400" />
                <span className="text-xs font-semibold text-white">Deep Work Mode</span>
              </div>
              <button
                onClick={() => setIsDeepWork(!isDeepWork)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  isDeepWork ? 'bg-[var(--nova-accent,#7c5cff)]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    isDeepWork ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-white/50 leading-snug">
              Auto-enables Windows Do-Not-Disturb, blocks distracting social websites, and dims non-focus displays.
            </p>
          </div>

          {/* Ambient Sound / Lo-Fi Beats */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white/90">Ambient Sound & Lo-Fi</span>
              <span className="text-[10px] text-white/40 font-mono">Offline Synthesizer</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'none', label: 'Off', icon: 'VolumeX' },
                { id: 'rain', label: 'Rain', icon: 'CloudRain' },
                { id: 'white-noise', label: 'Noise', icon: 'Radio' },
                { id: 'lo-fi', label: 'Lo-Fi', icon: 'Music' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSoundChange(s.id as any)}
                  className={`py-1.5 rounded-xl text-[10px] flex flex-col items-center gap-1 transition-all ${
                    ambientSound === s.id
                      ? 'bg-[var(--nova-accent,#7c5cff)] text-white font-semibold'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <FluentIcon name={s.icon} size={13} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {ambientSound !== 'none' && (
              <div className="flex items-center gap-2 pt-1">
                <FluentIcon name="Volume2" size={13} className="text-white/40" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-[var(--nova-accent,#7c5cff)] h-1 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Health & Wellbeing Habits */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FluentIcon name="Eye" size={16} className="text-cyan-400" />
            <div>
              <div className="text-xs font-medium text-white">20-20-20 Break</div>
              <div className="text-[10px] text-white/40">{eyeBreakMinutes}m remaining</div>
            </div>
          </div>
          <button
            onClick={() => setEyeBreakMinutes(20)}
            className="text-[10px] text-[var(--nova-accent,#7c5cff)] hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FluentIcon name="Droplets" size={16} className="text-blue-400" />
            <div>
              <div className="text-xs font-medium text-white">Hydration Break</div>
              <div className="text-[10px] text-white/40">{waterMinutes}m remaining</div>
            </div>
          </div>
          <button
            onClick={() => setWaterMinutes(30)}
            className="text-[10px] text-[var(--nova-accent,#7c5cff)] hover:underline"
          >
            Drank 💧
          </button>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FluentIcon name="Flame" size={16} className="text-amber-400" />
            <div>
              <div className="text-xs font-medium text-white">Focus Streak</div>
              <div className="text-[10px] text-white/40">{streakDays} Days · {sessionsCompleted} sessions</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-300">🔥 +150 XP</span>
        </div>
      </div>
    </div>
  );
};
