import React, { useState } from 'react';
import { FluentIcon } from './FluentIcon';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onImportV1Data: (data: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onImportV1Data
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'copilot', 'orchestrator', 'focus', 'tasks', 'calendar', 'notes', 'clipboard', 'doctor'
  ]);
  const [importStatus, setImportStatus] = useState<'idle' | 'scanning' | 'found' | 'imported'>('idle');
  const [foundV1ItemsCount, setFoundV1ItemsCount] = useState<number>(0);

  if (!isOpen) return null;

  const toggleModule = (id: string) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleScanV1 = () => {
    setImportStatus('scanning');
    setTimeout(() => {
      // Simulate scanning ~/.novadock.json
      setFoundV1ItemsCount(14); // 8 tasks, 4 snippets, notes, settings
      setImportStatus('found');
    }, 700);
  };

  const handleExecuteImport = () => {
    onImportV1Data({
      tasks: [
        { id: 'v1-1', text: 'Imported from v1: Review project goals', done: false },
        { id: 'v1-2', text: 'Imported from v1: Backup configuration', done: true }
      ],
      notes: '# Notes Imported from Nova Dock v1.0\n\n- All previous notes and clipboard references retained.',
      accent: 'violet'
    });
    setImportStatus('imported');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-lg flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div
        className="w-[580px] rounded-3xl bg-slate-950/95 border border-white/20 shadow-2xl p-6 text-white space-y-4 relative overflow-hidden backdrop-blur-2xl"
        style={{
          boxShadow: '0 25px 70px -15px rgba(0,0,0,0.9), 0 0 1px 1px rgba(255,255,255,0.2) inset'
        }}
      >
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--nova-accent,#7c5cff)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">
              Welcome to Nova Dock 2.0 · Step {step} of 4
            </span>
          </div>

          <div className="flex gap-1">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-5 h-1 rounded-full transition-all ${
                  step === s ? 'bg-[var(--nova-accent,#7c5cff)]' : 'bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome & Overview */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-[var(--nova-accent,#7c5cff)]/20 border border-[var(--nova-accent,#7c5cff)]/40 flex items-center justify-center mx-auto text-[var(--nova-accent,#7c5cff)] mb-2 shadow-lg">
                <FluentIcon name="Sparkles" size={28} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Your Day, Re-engineered</h2>
              <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                Nova Dock combines the iPhone Dynamic Island, Raycast, and an AI Copilot into a unified desktop suite for Windows 10/11.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 text-center">
                <FluentIcon name="Activity" size={16} className="text-purple-400 mx-auto" />
                <div className="text-xs font-semibold text-white">Dynamic Island</div>
                <div className="text-[10px] text-white/50">3 morphing states</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 text-center">
                <FluentIcon name="Command" size={16} className="text-cyan-400 mx-auto" />
                <div className="text-xs font-semibold text-white">Raycast Palette</div>
                <div className="text-[10px] text-white/50">Ctrl + Alt + Space</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 text-center">
                <FluentIcon name="Bot" size={16} className="text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-white">AI Copilot</div>
                <div className="text-[10px] text-white/50">Claude, GPT, Ollama</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pick Favorite Modules */}
        {step === 2 && (
          <div className="space-y-3 py-2">
            <div>
              <h3 className="text-sm font-bold text-white">Select Your Enabled Modules</h3>
              <p className="text-xs text-white/60">Customize which tools appear in your navigation dock rail.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {[
                { id: 'copilot', name: 'AI Copilot', desc: 'Streaming multi-model assistant', icon: 'Sparkles' },
                { id: 'orchestrator', name: 'Day Orchestrator', desc: 'Energy-aware daily planner', icon: 'CalendarDays' },
                { id: 'focus', name: 'Focus Suite', desc: 'Pomodoro & ambient lo-fi synthesizer', icon: 'Timer' },
                { id: 'tasks', name: 'Tasks & Projects', desc: 'Natural language Kanban & list', icon: 'CheckSquare' },
                { id: 'calendar', name: 'Calendar & Meet', desc: '1-click Zoom/Meet join', icon: 'Calendar' },
                { id: 'notes', name: 'Notes & Capture', desc: 'Markdown & backlinks', icon: 'FileText' },
                { id: 'clipboard', name: 'Clipboard Pro', desc: 'Unlimited history & transforms', icon: 'Clipboard' },
                { id: 'doctor', name: 'PC Doctor', desc: 'Problem solver & cache cleaner', icon: 'Activity' }
              ].map(mod => {
                const isChecked = selectedModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-[var(--nova-accent,#7c5cff)]/15 border-[var(--nova-accent,#7c5cff)] text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FluentIcon name={mod.icon} size={15} />
                      <div className="truncate">
                        <div className="text-xs font-semibold">{mod.name}</div>
                        <div className="text-[10px] text-white/40 truncate">{mod.desc}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-[var(--nova-accent,#7c5cff)] border-transparent' : 'border-white/20'}`}>
                      {isChecked && <FluentIcon name="Check" size={10} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Migration from Version 1.0 */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-sm font-bold text-white">Import from Version 1.0 (Python Edition)</h3>
              <p className="text-xs text-white/60">
                Nova Dock can automatically detect your previous <code className="font-mono bg-white/10 px-1 py-0.5 rounded text-[11px]">~/.novadock.json</code> and migrate all tasks, snippets, notes, and custom preferences.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
              {importStatus === 'idle' && (
                <div>
                  <FluentIcon name="FolderSync" size={28} className="mx-auto text-[var(--nova-accent,#7c5cff)] mb-2" />
                  <div className="text-xs font-semibold text-white">No data scanned yet</div>
                  <div className="text-[11px] text-white/50 mt-1">Click below to locate previous Version 1.0 data</div>
                  <button
                    onClick={handleScanV1}
                    className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                  >
                    Scan ~/.novadock.json
                  </button>
                </div>
              )}

              {importStatus === 'scanning' && (
                <div className="py-2 flex flex-col items-center gap-2">
                  <FluentIcon name="Loader2" size={24} className="animate-spin text-[var(--nova-accent,#7c5cff)]" />
                  <span className="text-xs text-white/70">Scanning user profile directory...</span>
                </div>
              )}

              {importStatus === 'found' && (
                <div className="space-y-2">
                  <FluentIcon name="CheckCircle2" size={28} className="mx-auto text-emerald-400" />
                  <div className="text-xs font-bold text-white">Found Version 1.0 Database!</div>
                  <div className="text-[11px] text-white/70">{foundV1ItemsCount} records detected (tasks, notes, snippets, settings).</div>
                  <button
                    onClick={handleExecuteImport}
                    className="px-5 py-2 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold shadow hover:opacity-90 transition-all"
                  >
                    Import All into Nova Dock 2.0
                  </button>
                </div>
              )}

              {importStatus === 'imported' && (
                <div className="space-y-1">
                  <FluentIcon name="Check" size={28} className="mx-auto text-emerald-400" />
                  <div className="text-xs font-bold text-emerald-300">Data Imported Successfully!</div>
                  <div className="text-[11px] text-white/60">All historical items are now indexed and available in your new workspace.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Keybindings & Ready */}
        {step === 4 && (
          <div className="space-y-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-300 mb-2 shadow-lg">
              <FluentIcon name="Zap" size={28} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">You're Ready to Roll!</h2>
              <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                Here are the two core shortcuts you will use every day:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="text-[10px] text-white/40 uppercase font-semibold">Command Palette</div>
                <div className="font-mono text-sm font-bold text-[var(--nova-accent,#7c5cff)]">Ctrl + Alt + Space</div>
                <div className="text-[10px] text-white/50">Summons fuzzy search, math, and apps</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="text-[10px] text-white/40 uppercase font-semibold">Quick Dismiss</div>
                <div className="font-mono text-sm font-bold text-white">ESC Key</div>
                <div className="text-[10px] text-white/50">Closes or minimizes floating panel</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-all"
            >
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[var(--nova-accent,#7c5cff)] to-emerald-500 text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Launch Nova Dock 2.0 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
