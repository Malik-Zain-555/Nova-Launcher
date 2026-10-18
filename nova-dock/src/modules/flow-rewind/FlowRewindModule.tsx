import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface RewindEvent {
  id: string;
  timestamp: string;
  timeLabel: string;
  type: 'clipboard' | 'app' | 'file' | 'meeting' | 'task';
  title: string;
  detail: string;
  actionUrl?: string;
}

export const FlowRewindModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOptedIn, setIsOptedIn] = useState<boolean>(true);

  const [timeline, setTimeline] = useState<RewindEvent[]>([
    {
      id: '1',
      timestamp: 'Today, 01:15 AM',
      timeLabel: '10 mins ago',
      type: 'clipboard',
      title: 'Copied GitHub Repository URL',
      detail: 'https://github.com/nova-dock/v2',
      actionUrl: 'https://github.com/nova-dock/v2'
    },
    {
      id: '2',
      timestamp: 'Today, 00:48 AM',
      timeLabel: '35 mins ago',
      type: 'app',
      title: 'Launched Visual Studio Code',
      detail: 'Opened workspace: C:\\Users\\zainc\\Projects\\nova-dock'
    },
    {
      id: '3',
      timestamp: 'Yesterday, 05:20 PM',
      timeLabel: 'Yesterday afternoon',
      type: 'meeting',
      title: 'Joined Google Meet Call',
      detail: 'Design Review: Dynamic Island Spring Curves',
      actionUrl: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '4',
      timestamp: 'Yesterday, 03:10 PM',
      timeLabel: 'Yesterday afternoon',
      type: 'clipboard',
      title: 'Copied API Documentation Link',
      detail: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
      actionUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API'
    },
    {
      id: '5',
      timestamp: 'Yesterday, 11:30 AM',
      timeLabel: 'Yesterday morning',
      type: 'task',
      title: 'Completed Task',
      detail: 'Refactor Nova Dock to TypeScript & React'
    }
  ]);

  const handleCopyOrOpen = (ev: RewindEvent) => {
    if (ev.actionUrl) {
      window.open(ev.actionUrl, '_blank');
    } else {
      navigator.clipboard.writeText(ev.detail);
    }
  };

  const filteredEvents = timeline.filter(ev =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.timeLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-3.5 text-white">
      {/* Header Banner & Privacy Notice */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FluentIcon name="History" size={16} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200">Flow Rewind (Local-Only Timeline)</h3>
          </div>
          <p className="text-xs text-white/70 mt-1 max-w-xl leading-relaxed">
            Search your historical digital footprints—find that link from yesterday afternoon, apps you opened, and snippets you copied. 100% local and offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50">{isOptedIn ? 'Tracking Active' : 'Paused'}</span>
          <button
            onClick={() => setIsOptedIn(!isOptedIn)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              isOptedIn ? 'bg-[var(--nova-accent,#7c5cff)]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                isOptedIn ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-[var(--nova-accent,#7c5cff)] transition-all">
        <FluentIcon name="Search" size={15} className="text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search timeline (e.g. 'yesterday afternoon', 'github', 'meet')..."
          className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
            <FluentIcon name="X" size={12} />
          </button>
        )}
      </div>

      {/* Rewind Timeline List */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {filteredEvents.map(ev => {
          const icon = ev.type === 'clipboard' ? 'Clipboard' : ev.type === 'app' ? 'AppWindow' : ev.type === 'meeting' ? 'Video' : 'CheckCircle2';
          const color = ev.type === 'clipboard' ? 'text-amber-400' : ev.type === 'app' ? 'text-purple-400' : ev.type === 'meeting' ? 'text-blue-400' : 'text-emerald-400';

          return (
            <div
              key={ev.id}
              onClick={() => handleCopyOrOpen(ev)}
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 truncate pr-2">
                <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
                  <FluentIcon name={icon} size={15} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white/95 flex items-center gap-2 truncate">
                    <span>{ev.title}</span>
                    <span className="text-[10px] text-white/40 font-mono font-normal">
                      · {ev.timeLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/60 font-mono truncate mt-0.5">
                    {ev.detail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-white/40 font-mono">
                  {ev.timestamp}
                </span>
                <div className="p-1 rounded-lg bg-white/5 text-white/40 group-hover:text-white transition-colors">
                  <FluentIcon name={ev.actionUrl ? 'ExternalLink' : 'Copy'} size={13} />
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="py-12 text-center text-xs text-white/40">
            No events found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
