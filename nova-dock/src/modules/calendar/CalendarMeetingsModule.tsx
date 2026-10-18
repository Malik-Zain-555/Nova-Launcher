import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface MeetingEvent {
  id: string;
  title: string;
  time: string;
  platform: 'meet' | 'zoom' | 'teams' | 'in-person';
  joinUrl?: string;
  attendees: string[];
  isStartingSoon?: boolean;
}

export const CalendarMeetingsModule: React.FC = () => {
  const [meetingMode, setMeetingMode] = useState<boolean>(false);
  const [micMuted, setMicMuted] = useState<boolean>(true);
  const [meetingNotes, setMeetingNotes] = useState<string>('- Action item: finalize design spec\n- Deployment target: Friday');

  const [events, setEvents] = useState<MeetingEvent[]>([
    {
      id: '1',
      title: 'Nova Dock Architecture & Design Alignment',
      time: '11:00 AM - 11:45 AM',
      platform: 'meet',
      joinUrl: 'https://meet.google.com/abc-defg-hij',
      attendees: ['Zain (Host)', 'Lead Designer', 'Desktop Staff Eng'],
      isStartingSoon: true
    },
    {
      id: '2',
      title: 'Weekly Engineering Standup & Demo',
      time: '02:00 PM - 02:30 PM',
      platform: 'zoom',
      joinUrl: 'https://zoom.us/j/1234567890',
      attendees: ['Core Team (6)']
    },
    {
      id: '3',
      title: 'Product Roadmap Sync',
      time: '04:30 PM - 05:00 PM',
      platform: 'teams',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/123',
      attendees: ['Product Director']
    }
  ]);

  const handleJoin = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
      setMeetingMode(true);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3.5 text-white">
      {/* Auto Meeting Mode Active Bar */}
      <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
        meetingMode
          ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
          : 'bg-white/[0.03] border-white/10'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${meetingMode ? 'bg-emerald-400 animate-ping' : 'bg-white/20'}`} />
          <div>
            <div className="text-xs font-semibold text-white">
              {meetingMode ? 'Meeting Mode Active' : 'Meeting Mode Standby'}
            </div>
            <div className="text-[10px] text-white/50">
              {meetingMode ? 'Do-Not-Disturb on · Notifications muted · Scratchpad ready' : 'Auto-activates during meetings'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meetingMode && (
            <button
              onClick={() => setMicMuted(!micMuted)}
              className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 font-medium transition-all ${
                micMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <FluentIcon name={micMuted ? 'MicOff' : 'Mic'} size={13} />
              <span>{micMuted ? 'Muted' : 'Live'}</span>
            </button>
          )}

          <button
            onClick={() => setMeetingMode(!meetingMode)}
            className="px-3 py-1 rounded-xl bg-white/10 text-xs text-white/70 hover:text-white"
          >
            {meetingMode ? 'End Mode' : 'Simulate Mode'}
          </button>
        </div>
      </div>

      {/* Upcoming Meetings List */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
        <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Today's Agenda</h4>
        {events.map(ev => (
          <div
            key={ev.id}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
              ev.isStartingSoon
                ? 'bg-[var(--nova-accent,#7c5cff)]/15 border-[var(--nova-accent,#7c5cff)]/40 shadow-lg'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[var(--nova-accent,#7c5cff)]">
                <FluentIcon name={ev.platform === 'meet' ? 'Video' : ev.platform === 'zoom' ? 'Camera' : 'Users'} size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>{ev.title}</span>
                  {ev.isStartingSoon && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                      Starts in 5m
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/50 font-mono mt-0.5">
                  {ev.time} · {ev.attendees.join(', ')}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleJoin(ev.joinUrl)}
              className="px-3 py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold shadow hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <FluentIcon name="ExternalLink" size={13} />
              <span>Join Now</span>
            </button>
          </div>
        ))}
      </div>

      {/* Meeting Scratchpad */}
      {meetingMode && (
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="font-semibold text-white">Live Meeting Scratchpad</span>
            <span className="text-[10px] text-white/40">Auto-saves to Notes</span>
          </div>
          <textarea
            value={meetingNotes}
            onChange={e => setMeetingNotes(e.target.value)}
            className="w-full h-16 p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono resize-none focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
