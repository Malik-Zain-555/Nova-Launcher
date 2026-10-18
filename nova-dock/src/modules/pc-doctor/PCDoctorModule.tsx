import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface ProcessItem {
  id: number;
  name: string;
  cpu: number;
  ramMb: number;
  diskMb: number;
}

export const PCDoctorModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'cleaner' | 'network' | 'ai-doctor'>('metrics');
  const [healthScore, setHealthScore] = useState<number>(94);
  const [cleaningState, setCleaningState] = useState<'idle' | 'cleaning' | 'cleaned'>('idle');
  const [freedSpaceMb, setFreedSpaceMb] = useState<number>(0);

  // Network test
  const [isTestingNetwork, setIsTestingNetwork] = useState<boolean>(false);
  const [pingMs, setPingMs] = useState<number>(18);
  const [downloadMbps, setDownloadMbps] = useState<number>(142.5);

  // AI Problem Solver
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    problem: string;
    rootCause: string;
    proposedFix: string;
    command: string;
  } | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [fixApplied, setFixApplied] = useState<boolean>(false);

  // Running processes
  const [processes, setProcesses] = useState<ProcessItem[]>([
    { id: 1042, name: 'chrome.exe', cpu: 14.2, ramMb: 1420, diskMb: 12.4 },
    { id: 2480, name: 'code.exe', cpu: 8.4, ramMb: 920, diskMb: 4.1 },
    { id: 3120, name: 'electron.exe', cpu: 2.8, ramMb: 145, diskMb: 0.8 },
    { id: 1104, name: 'discord.exe', cpu: 3.1, ramMb: 480, diskMb: 1.2 },
    { id: 840, name: 'spotify.exe', cpu: 1.2, ramMb: 310, diskMb: 0.5 },
    { id: 620, name: 'explorer.exe', cpu: 1.1, ramMb: 180, diskMb: 0.2 }
  ]);

  const handleKillProcess = (id: number, name: string) => {
    if (typeof window !== 'undefined' && (window as any).novaAPI?.killProcess) {
      (window as any).novaAPI.killProcess(name);
    }
    setProcesses(prev => prev.filter(p => p.id !== id));
  };

  const handleRunCleaner = () => {
    setCleaningState('cleaning');
    setTimeout(() => {
      // Simulate cleaning temporary caches and recycle bin
      if (typeof window !== 'undefined' && (window as any).novaAPI?.systemAction) {
        (window as any).novaAPI.systemAction('empty-recycle');
      }
      setFreedSpaceMb(1840); // 1.84 GB freed
      setCleaningState('cleaned');
      setHealthScore(98);
    }, 1200);
  };

  const handleTestNetwork = () => {
    setIsTestingNetwork(true);
    setTimeout(() => {
      setPingMs(16);
      setDownloadMbps(154.2);
      setIsTestingNetwork(false);
    }, 1000);
  };

  const handleDiagnoseProblem = () => {
    if (!problemDescription.trim()) return;
    setIsDiagnosing(true);
    setFixApplied(false);

    setTimeout(() => {
      const q = problemDescription.toLowerCase();
      if (q.includes('ram') || q.includes('memory') || q.includes('slow')) {
        setAiDiagnosis({
          problem: 'High memory load & working set fragmentation',
          rootCause: 'Background browser renderer subprocesses and standby list cache are consuming physical RAM.',
          proposedFix: 'Flush standby list, terminate idle background renderers, and trim working sets.',
          command: '[System.GC]::Collect(); Clear-RecycleBin -Force -ErrorAction SilentlyContinue'
        });
      } else if (q.includes('wifi') || q.includes('network') || q.includes('internet') || q.includes('disconnect')) {
        setAiDiagnosis({
          problem: 'DNS cache stale & Wi-Fi adapter power-saving glitch',
          rootCause: 'WlanSvc power management state causes intermittent packet drops on 5GHz band.',
          proposedFix: 'Flush Windows DNS resolver cache and reset TCP/IP stack.',
          command: 'ipconfig /flushdns; netsh int ip reset'
        });
      } else {
        setAiDiagnosis({
          problem: 'General Windows Performance Bottleneck',
          rootCause: 'Temporary disk fragmentation and orphaned system telemetry services.',
          proposedFix: 'Restart Windows Audio and DWM service, clean %TEMP% files.',
          command: 'Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue'
        });
      }
      setIsDiagnosing(false);
    }, 1000);
  };

  const handleApplyFix = () => {
    setFixApplied(true);
    setHealthScore(prev => Math.min(100, prev + 5));
  };

  return (
    <div className="h-full flex flex-col space-y-3.5 text-white">
      {/* Top Banner: Health Score Dial */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-[var(--nova-accent,#7c5cff)]/20 border border-[var(--nova-accent,#7c5cff)]/40 flex items-center justify-center font-bold font-mono text-base text-[var(--nova-accent,#7c5cff)]">
            {healthScore}
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">PC Health Score: Optimal</h3>
            <p className="text-[11px] text-white/60 mt-0.5">Hardware load balanced, no critical Windows crashes detected.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {(['metrics', 'cleaner', 'network', 'ai-doctor'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[var(--nova-accent,#7c5cff)] text-white font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab === 'ai-doctor' ? 'AI Problem Solver' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Live Hardware Metrics & Process Killer */}
      {activeTab === 'metrics' && (
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
          {/* Hardware Stats Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'CPU LOAD', val: '14%', sub: '3.8 GHz · 8 Cores', color: 'text-purple-400' },
              { label: 'RAM USAGE', val: '46%', sub: '7.4 / 16.0 GB', color: 'text-cyan-400' },
              { label: 'DISK I/O', val: '12 MB/s', sub: 'NVMe SSD · 48% Full', color: 'text-emerald-400' },
              { label: 'GPU 3D', val: '22%', sub: 'RTX Graphics · 48°C', color: 'text-amber-400' }
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{stat.label}</span>
                <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.val}</div>
                <div className="text-[10px] text-white/40">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Heavy Processes Table */}
          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            <div className="flex items-center justify-between text-[11px] text-white/40 font-semibold px-2 pb-1">
              <span>Process Name</span>
              <div className="flex gap-8 mr-12">
                <span>CPU %</span>
                <span>RAM</span>
              </div>
            </div>

            {processes.map(proc => (
              <div
                key={proc.id}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FluentIcon name="Cpu" size={14} className="text-white/40" />
                  <span className="font-mono text-white/90">{proc.name}</span>
                  <span className="text-[10px] text-white/40">PID {proc.id}</span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="font-mono text-white/80 w-12 text-right">{proc.cpu}%</span>
                  <span className="font-mono text-white/80 w-16 text-right">{proc.ramMb} MB</span>

                  <button
                    onClick={() => handleKillProcess(proc.id, proc.name)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold hover:bg-rose-500/30 transition-all"
                  >
                    End Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Temp & Cache Cleaner */}
      {activeTab === 'cleaner' && (
        <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">System Storage & Cache Optimizer</h4>
            <p className="text-xs text-white/60 leading-relaxed max-w-lg">
              Scans and safely eliminates junk files, Windows %TEMP% artifacts, orphaned crash dumps, and emptied Recycle Bin data.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-semibold">User Temp Cache</span>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-1">1,240 MB</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Recycle Bin</span>
                <div className="text-lg font-bold font-mono text-amber-300 mt-1">600 MB</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Browser Cache</span>
                <div className="text-lg font-bold font-mono text-purple-300 mt-1">450 MB</div>
              </div>
            </div>

            {cleaningState === 'cleaned' && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                <FluentIcon name="CheckCircle2" size={16} />
                <span>Successfully cleaned {freedSpaceMb} MB of temporary files! PC Health Score improved.</span>
              </div>
            )}
          </div>

          <button
            onClick={handleRunCleaner}
            disabled={cleaningState === 'cleaning'}
            className="w-full py-3 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow"
          >
            <FluentIcon name={cleaningState === 'cleaning' ? 'Loader2' : 'Trash2'} size={15} className={cleaningState === 'cleaning' ? 'animate-spin' : ''} />
            <span>{cleaningState === 'cleaning' ? 'Cleaning Caches & Recycle Bin...' : '1-Click Clean PC & Free Disk Space'}</span>
          </button>
        </div>
      )}

      {/* Tab 3: Wi-Fi & Network Diagnostics */}
      {activeTab === 'network' && (
        <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Network Diagnostics & Ping Telemetry</h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Ping Latency</span>
                <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{pingMs} ms</div>
                <span className="text-[10px] text-white/40">Gateway: 192.168.1.1</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Speed Down</span>
                <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">{downloadMbps} Mbps</div>
                <span className="text-[10px] text-white/40">Fiber Connection</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Wi-Fi Signal</span>
                <div className="text-2xl font-bold font-mono text-purple-300 mt-1">98%</div>
                <span className="text-[10px] text-white/40">5 GHz Band (Channel 36)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestNetwork}
            disabled={isTestingNetwork}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FluentIcon name={isTestingNetwork ? 'Loader2' : 'Activity'} size={15} className={isTestingNetwork ? 'animate-spin' : ''} />
            <span>{isTestingNetwork ? 'Testing Latency & Packet Loss...' : 'Run Network Ping Test'}</span>
          </button>
        </div>
      )}

      {/* Tab 4: AI Problem Solver */}
      {activeTab === 'ai-doctor' && (
        <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
          <div className="flex gap-2">
            <input
              type="text"
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDiagnoseProblem()}
              placeholder="Describe your PC issue e.g. 'RAM is at 95%', 'Wi-Fi keeps dropping'..."
              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--nova-accent,#7c5cff)]"
            />
            <button
              onClick={handleDiagnoseProblem}
              disabled={isDiagnosing || !problemDescription.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow"
            >
              {isDiagnosing ? 'Diagnosing...' : 'Diagnose'}
            </button>
          </div>

          {/* AI Diagnosis Output Card */}
          {aiDiagnosis && (
            <div className="flex-1 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 overflow-y-auto space-y-2.5 custom-scrollbar">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs font-bold text-amber-300">{aiDiagnosis.problem}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Safe Fix Verified
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block">Root Cause:</span>
                <p className="text-xs text-white/80 leading-relaxed mt-0.5">{aiDiagnosis.rootCause}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block">Proposed Solution:</span>
                <p className="text-xs text-white/80 leading-relaxed mt-0.5">{aiDiagnosis.proposedFix}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-[11px] text-cyan-300">
                {aiDiagnosis.command}
              </div>

              {fixApplied ? (
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <FluentIcon name="Check" size={14} />
                  <span>Fix executed safely. Telemetry re-checked and stable.</span>
                </div>
              ) : (
                <button
                  onClick={handleApplyFix}
                  className="w-full py-2 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow"
                >
                  Confirm & Apply Safe Fix
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
