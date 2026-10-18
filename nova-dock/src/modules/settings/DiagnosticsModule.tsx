import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export const DiagnosticsModule: React.FC = () => {
  const [logEntries, setLogEntries] = useState<string[]>([
    '[2026-10-14 00:48:12] [SYSTEM] Nova Dock 2.0 shell initialized successfully.',
    '[2026-10-14 00:48:14] [DWM] Windows 11 Acrylic backdrop material applied.',
    '[2026-10-14 00:52:10] [HOTKEY] Registered global hotkey: CommandOrControl+Alt+Space.',
    '[2026-10-14 01:15:30] [PALETTE] Smart natural language interpreter initialized.',
    '[2026-10-14 01:25:40] [DATABASE] SQLite store synchronized at ~/.novadock_v2.json.'
  ]);

  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [uiScale, setUiScale] = useState<string>('100%');
  const [backupExported, setBackupExported] = useState<boolean>(false);

  const handleExportBackup = () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      settings: { theme: 'dark', accent: 'violet' },
      tasks: [],
      notes: [],
      snippets: []
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novadock-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setBackupExported(true);
    setTimeout(() => setBackupExported(false), 3000);
  };

  const handleClearLogs = () => {
    setLogEntries(['[SYSTEM] Logs cleared by user.']);
  };

  return (
    <div className="h-full flex flex-col space-y-4 text-white">
      {/* Top Banner: Diagnostics & Accessibility */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">System Diagnostics & Reliability</h3>
          <p className="text-xs text-white/60 mt-0.5">Crash logs, accessibility preferences, and encrypted backup recovery.</p>
        </div>

        <button
          onClick={handleExportBackup}
          className="px-4 py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow"
        >
          <FluentIcon name="Download" size={13} />
          <span>Export Backup</span>
        </button>
      </div>

      {backupExported && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
          <FluentIcon name="CheckCircle2" size={15} />
          <span>Backup JSON downloaded successfully!</span>
        </div>
      )}

      {/* Accessibility & Display Tuning */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Accessibility & UI Scale</h4>

        <div className="grid grid-cols-3 gap-3">
          {/* Reduced Motion Toggle */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">Reduced Motion</div>
              <div className="text-[10px] text-white/40">Disable spring physics</div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={e => setReducedMotion(e.target.checked)}
              className="w-4 h-4 accent-[var(--nova-accent,#7c5cff)] cursor-pointer"
            />
          </div>

          {/* High Contrast Toggle */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">High Contrast</div>
              <div className="text-[10px] text-white/40">Thick borders & max text</div>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={e => setHighContrast(e.target.checked)}
              className="w-4 h-4 accent-[var(--nova-accent,#7c5cff)] cursor-pointer"
            />
          </div>

          {/* UI Scale Dropdown */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-white">UI Zoom Scale</div>
              <div className="text-[10px] text-white/40">Scale factor</div>
            </div>
            <select
              value={uiScale}
              onChange={e => setUiScale(e.target.value)}
              className="px-2 py-1 rounded bg-white/10 text-xs text-white border-none focus:outline-none"
            >
              <option value="90%" className="bg-slate-900">90%</option>
              <option value="100%" className="bg-slate-900">100%</option>
              <option value="115%" className="bg-slate-900">115%</option>
              <option value="125%" className="bg-slate-900">125%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live In-App Error Log Viewer */}
      <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">In-App Error & Diagnostics Log</span>
            <span className="text-[10px] font-mono text-white/40">(~/.novadock.log)</span>
          </div>

          <button
            onClick={handleClearLogs}
            className="text-[11px] text-white/40 hover:text-white"
          >
            Clear Log Buffer
          </button>
        </div>

        <div className="flex-1 p-3 rounded-2xl bg-slate-950/80 border border-white/10 font-mono text-[11px] text-white/70 overflow-y-auto space-y-1 custom-scrollbar leading-relaxed">
          {logEntries.map((log, i) => (
            <div key={i} className={log.includes('[ERROR]') ? 'text-rose-400 font-bold' : log.includes('[HOTKEY]') ? 'text-cyan-300' : 'text-white/80'}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
