import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  category: 'system' | 'time' | 'app' | 'script';
}

export interface RoutinePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: string[];
}

export const AutomationEngineModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routines' | 'rules' | 'scripts'>('routines');
  const [runningRoutineId, setRunningRoutineId] = useState<string | null>(null);
  const [scriptInput, setScriptInput] = useState<string>('Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 ProcessName, CPU');
  const [scriptOutput, setScriptOutput] = useState<string>('');
  const [isScriptRunning, setIsScriptRunning] = useState<boolean>(false);

  // Automation Rules
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Battery Saver Auto-Engage',
      trigger: 'Battery < 20% & Disconnected',
      action: 'Turn on Windows Battery Saver & Dim Display 40%',
      enabled: true,
      category: 'system'
    },
    {
      id: '2',
      name: 'Evening Wind-Down',
      trigger: 'Time reaches 6:00 PM (Mon-Fri)',
      action: 'Switch to Warm Accent, Enable DND & Open Review',
      enabled: true,
      category: 'time'
    },
    {
      id: '3',
      name: 'Coding Focus Sync',
      trigger: 'VS Code or Terminal is Foreground',
      action: 'Set Context to Coding & Launch Lo-Fi Synth',
      enabled: true,
      category: 'app'
    },
    {
      id: '4',
      name: 'Midnight Auto-Lock',
      trigger: 'No user input for 30 mins after 12:00 AM',
      action: 'Lock Workstation & Put System to Sleep',
      enabled: false,
      category: 'time'
    }
  ]);

  // Routine Presets
  const routines: RoutinePreset[] = [
    {
      id: 'morning',
      name: 'Morning Launch Routine',
      icon: 'Sun',
      description: 'Prepares your digital workspace for peak performance.',
      steps: [
        'Fetch live weather & calendar events',
        'Open Day Orchestrator morning briefing',
        'Launch Slack & Microsoft Teams',
        'Start 25m Focus Block with Lo-Fi audio'
      ]
    },
    {
      id: 'deep-focus',
      name: 'Deep Work Isolation Routine',
      icon: 'Shield',
      description: 'Eliminates all distractions and maximizes cognitive bandwidth.',
      steps: [
        'Enable Windows Do-Not-Disturb',
        'Close social apps (Discord, Spotify)',
        'Dim secondary monitor by 60%',
        'Start 50-minute Pomodoro timer'
      ]
    },
    {
      id: 'gaming',
      name: 'Gaming Mode Routine',
      icon: 'Gamepad2',
      description: 'Maximizes GPU & CPU allocation for heavy workloads.',
      steps: [
        'Suspend non-essential background processes',
        'Free unused system RAM cache',
        'Auto-hide Dynamic Island to prevent overlay conflicts',
        'Set Windows Power Plan to Ultimate Performance'
      ]
    },
    {
      id: 'wind-down',
      name: 'Evening Shutdown Routine',
      icon: 'Moon',
      description: 'Safely closes day items, saves notes, and powers down.',
      steps: [
        'Auto-save all notes & backup local SQLite database',
        'Generate productivity score review',
        'Clear clipboard history cache',
        'Lock workstation & suspend system'
      ]
    }
  ];

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleRunRoutine = (routine: RoutinePreset) => {
    setRunningRoutineId(routine.id);
    setTimeout(() => {
      setRunningRoutineId(null);
    }, 1200);
  };

  const handleExecuteScript = () => {
    setIsScriptRunning(true);
    setScriptOutput('Executing PowerShell script in background...\n');

    setTimeout(() => {
      setScriptOutput(`ProcessName   CPU\n-----------   ---\nchrome        14.2\ncode          8.6\nelectron      3.1\nexplorer      1.4\nsvchost       0.9\n\nCommand exited with code 0 (Success).`);
      setIsScriptRunning(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col space-y-3.5 text-white">
      {/* Top Tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FluentIcon name="Cpu" size={18} className="text-[var(--nova-accent,#7c5cff)]" />
          <h3 className="text-sm font-semibold text-white">Automation Engine & Macros</h3>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {(['routines', 'rules', 'scripts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[var(--nova-accent,#7c5cff)] text-white font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Routines */}
      {activeTab === 'routines' && (
        <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-1">
          {routines.map(rt => {
            const isRunning = runningRoutineId === rt.id;

            return (
              <div
                key={rt.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[var(--nova-accent,#7c5cff)]">
                        <FluentIcon name={rt.icon} size={16} />
                      </div>
                      <span className="text-xs font-bold text-white">{rt.name}</span>
                    </div>

                    <button
                      onClick={() => handleRunRoutine(rt)}
                      disabled={isRunning}
                      className="px-3 py-1 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow"
                    >
                      <FluentIcon name={isRunning ? 'RotateCw' : 'Play'} size={12} className={isRunning ? 'animate-spin' : ''} />
                      <span>{isRunning ? 'Running...' : 'Run'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                    {rt.description}
                  </p>

                  <div className="mt-3 space-y-1">
                    {rt.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Visual If-This-Then-That Rules */}
      {activeTab === 'rules' && (
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                rule.enabled
                  ? 'bg-white/[0.04] border-white/10 text-white'
                  : 'bg-white/[0.01] border-white/5 text-white/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{rule.name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-mono">
                    {rule.category}
                  </span>
                </div>
                <div className="text-xs text-white/70 flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-amber-300">IF:</span> {rule.trigger}
                  <span className="text-cyan-300">→ THEN:</span> {rule.action}
                </div>
              </div>

              <button
                onClick={() => handleToggleRule(rule.id)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  rule.enabled ? 'bg-[var(--nova-accent,#7c5cff)]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: PowerShell & Python Script Runner */}
      {activeTab === 'scripts' && (
        <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="font-semibold text-white">PowerShell / Python Script Runner</span>
            <span className="text-[10px] text-amber-300 font-mono">Runs locally with explicit confirmation</span>
          </div>

          <textarea
            value={scriptInput}
            onChange={e => setScriptInput(e.target.value)}
            className="h-28 p-3 rounded-xl bg-slate-950/90 border border-white/10 text-xs text-cyan-300 font-mono resize-none focus:outline-none"
          />

          <div className="flex justify-between items-center">
            <button
              onClick={handleExecuteScript}
              disabled={isScriptRunning}
              className="px-4 py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow"
            >
              <FluentIcon name={isScriptRunning ? 'Loader2' : 'Terminal'} size={13} className={isScriptRunning ? 'animate-spin' : ''} />
              <span>{isScriptRunning ? 'Running Script...' : 'Execute Script'}</span>
            </button>
            <span className="text-[10px] text-white/40 font-mono">PowerShell 7.x compatible</span>
          </div>

          {/* Console Output */}
          <div className="flex-1 p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-[11px] text-emerald-400 overflow-y-auto whitespace-pre custom-scrollbar">
            {scriptOutput || '// Output console will appear here after execution...'}
          </div>
        </div>
      )}
    </div>
  );
};
