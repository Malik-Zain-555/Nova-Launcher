import React from 'react';
import { LiveActivity } from '../types';
import { FluentIcon } from './FluentIcon';

interface LiveActivityPillProps {
  activity: LiveActivity;
  onDismiss: (id: string) => void;
  onClick?: () => void;
}

export const LiveActivityPill: React.FC<LiveActivityPillProps> = ({
  activity,
  onDismiss,
  onClick
}) => {
  const getIconName = () => {
    switch (activity.type) {
      case 'timer': return 'Timer';
      case 'media': return 'Music';
      case 'meeting': return 'Video';
      case 'clipboard': return 'CheckCircle2';
      case 'battery': return 'BatteryWarning';
      case 'download': return 'DownloadCloud';
      default: return activity.iconName || 'Bell';
    }
  };

  const getAccentBg = () => {
    switch (activity.type) {
      case 'clipboard': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'meeting': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'battery': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'timer': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border backdrop-blur-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${getAccentBg()}`}
    >
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
        <FluentIcon name={getIconName()} size={13} />
      </div>

      <div className="flex flex-col text-left leading-tight pr-1">
        <span className="text-[11px] font-semibold tracking-wide text-white">
          {activity.title}
        </span>
        {activity.subtitle && (
          <span className="text-[9px] text-white/70 truncate max-w-[140px]">
            {activity.subtitle}
          </span>
        )}
      </div>

      {activity.progress !== undefined && (
        <div className="w-10 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.round(activity.progress * 100)}%` }}
          />
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(activity.id);
        }}
        className="w-4 h-4 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10"
      >
        <FluentIcon name="X" size={10} />
      </button>
    </div>
  );
};
