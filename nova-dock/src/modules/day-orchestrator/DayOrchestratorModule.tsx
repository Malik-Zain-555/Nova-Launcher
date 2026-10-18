import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface TimelineBlock {
  id: string;
  time: string;
  title: string;
  category: 'deep-work' | 'meeting' | 'admin' | 'break' | 'review';
  energyDemand: 'high' | 'medium' | 'low';
  completed: boolean;
}

export const DayOrchestratorModule: React.FC = () => {
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [productivityScore, setProductivityScore] = useState<number>(88);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);

  const [schedule, setSchedule] = useState<TimelineBlock[]>([
    { id: '1', time: '09:00 - 10:30', title: 'Deep Work: Nova Dock Architecture Refactor', category: 'deep-work', energyDemand: 'high', completed: true },
    { id: '2', time: '10:30 - 10:45', title: '20-20-20 Eye Break & Hydration', category: 'break', energyDemand: 'low', completed: true },
    { id: '3', time: '11:00 - 11:45', title: 'Team Sync & Product Design Review', category: 'meeting', energyDemand: 'medium', completed: false },
    { id: '4', time: '12:00 - 13:00', title: 'Deep Work: Raycast Fuzzy Parser Optimization', category: 'deep-work', energyDemand: 'high', completed: false },
    { id: '5', time: '14:00 - 15:00', title: 'Inbox Zero & PR Reviews', category: 'admin', energyDemand: 'medium', completed: false },
    { id: '6', time: '17:30 - 18:00', title: 'Daily Review & Shutdown Routine', category: 'review', energyDemand: 'low', completed: false }
  ]);

  const handleToggleBlock = (id: string) => {
    setSchedule(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  };

  const handleReplan = () => {
    setIsReplanning(true);
    setTimeout(() => {
      // Re-order based on current energy level: if energy is low, shift deep-work to later or break down into chunks
      if (energyLevel === 'low') {
        setSchedule(prev => [
          ...prev.filter(b => b.energyDemand === 'low' || b.category === 'break'),
          ...prev.filter(b => b.energyDemand === 'medium'),
          ...prev.filter(b => b.energyDemand === 'high')
        ]);
      } else {
        setSchedule(prev => [
          ...prev.filter(b => b.energyDemand === 'high'),
          ...prev.filter(b => b.energyDemand === 'medium'),
          ...prev.filter(b => b.energyDemand === 'low')
        ]);
      }
      setIsReplanning(false);
    }, 600);
  };

  const completedCount = schedule.filter(b => b.completed).length;
  const progressPct = Math.round((completedCount / schedule.length) * 100);

  return (
    <div className="h-full flex flex-col space-y-3.5 text-white">
      {/* Morning Briefing Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FluentIcon name="Sparkles" size={16} className="text-amber-300" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-200">AI Morning Briefing</h3>
          </div>
          <p className="text-xs text-white/80 mt-1 max-w-lg leading-relaxed">
            Good morning Zain! You have 2 high-focus sessions and 1 meeting scheduled. Your energy is peak right now—ideal for crushing architecture milestones.
          </p>
        </div>

        {/* Productivity Score Dial */}
        <div className="flex flex-col items-center justify-center pl-4 border-l border-white/10">
          <div className="text-xl font-bold font-mono text-[var(--nova-accent,#7c5cff)]">{productivityScore}%</div>
          <span className="text-[9px] uppercase tracking-wider text-white/50">Productivity</span>
        </div>
      </div>

      {/* Energy Level Selector & Controls Bar */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60 font-medium">How's your energy?</span>
          <div className="flex gap-1.5">
            {[
              { id: 'high', label: 'High ⚡', col: 'text-amber-300 border-amber-500/40 bg-amber-500/10' },
              { id: 'medium', label: 'Medium 🔋', col: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10' },
              { id: 'low', label: 'Low 🪫', col: 'text-rose-300 border-rose-500/40 bg-rose-500/10' }
            ].map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setEnergyLevel(lvl.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  energyLevel === lvl.id
                    ? lvl.col
                    : 'text-white/40 border-transparent hover:bg-white/5'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleReplan}
          disabled={isReplanning}
          className="px-3 py-1 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <FluentIcon name="RotateCw" size={12} className={isReplanning ? 'animate-spin' : ''} />
          <span>{isReplanning ? 'Re-planning...' : 'AI Re-plan Day'}</span>
        </button>
      </div>

      {/* Daily Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-white/60">
          <span>Day Execution: {completedCount} of {schedule.length} blocks completed</span>
          <span className="font-mono">{progressPct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--nova-accent,#7c5cff)] to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Schedule Timeline Blocks */}
      <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
        {schedule.map(block => (
          <div
            key={block.id}
            onClick={() => handleToggleBlock(block.id)}
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
              block.completed
                ? 'bg-white/[0.02] border-white/5 text-white/40 line-through'
                : 'bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                  block.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-white/30'
                }`}
              >
                {block.completed && <FluentIcon name="Check" size={11} />}
              </div>

              <div>
                <div className="font-medium text-white/95">{block.title}</div>
                <div className="text-[10px] text-white/50 font-mono mt-0.5">{block.time}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                  block.energyDemand === 'high'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : block.energyDemand === 'medium'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {block.energyDemand} Energy
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
