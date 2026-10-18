import React from 'react';
import { FluentIcon } from './FluentIcon';
import { ContextMode } from '../types';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
}

interface NavigationRailProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  isPinned: boolean;
  onTogglePin: () => void;
  contextMode: ContextMode;
}

interface SectionDefinition {
  title: string;
  ids: string[];
}

const SECTIONS: SectionDefinition[] = [
  {
    title: 'Trading',
    ids: ['binance', 'copilot']
  },
  {
    title: 'Productivity',
    ids: ['home', 'orchestrator', 'focus', 'tasks', 'calendar', 'notes', 'clipboard', 'snippets']
  },
  {
    title: 'System',
    ids: ['workspaces', 'automation', 'doctor', 'media', 'tools', 'rewind', 'customizer', 'settings']
  }
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  items,
  activeId,
  onSelect,
  isPinned,
  onTogglePin,
  contextMode
}) => {
  const knownIds = new Set(SECTIONS.flatMap(s => s.ids));
  const otherItems = items.filter(i => !knownIds.has(i.id));

  return (
    <aside className="w-48 h-full flex flex-col justify-between bg-[#07080E] border-r border-white/[0.08] select-none flex-shrink-0">
      {/* Top Status & Branding */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-bold text-white tracking-wider">NOVA 2.0</span>
        </div>
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">
          {contextMode}
        </span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-2.5 custom-scrollbar">
        {SECTIONS.map((section) => {
          const sectionItems = section.ids
            .map(id => items.find(item => item.id === id))
            .filter((item): item is NavItem => Boolean(item));

          if (sectionItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2 pt-1 pb-1 text-[9px] uppercase tracking-wider text-white/25 font-semibold">
                {section.title}
              </div>
              {sectionItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-r-md text-left text-xs transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group ${
                      isActive
                        ? 'bg-white/[0.08] border-l-2 border-[var(--nova-accent)] text-white font-semibold'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex-shrink-0 transition-colors duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                          isActive ? 'text-[var(--nova-accent)]' : 'text-white/40 group-hover:text-white/70'
                        }`}
                      >
                        <FluentIcon name={item.icon} size={14} />
                      </div>
                      <span className="truncate text-[11px]">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-[var(--nova-accent)]/20 text-[var(--nova-accent)] flex-shrink-0 leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {otherItems.length > 0 && (
          <div className="space-y-0.5">
            <div className="px-2 pt-1 pb-1 text-[9px] uppercase tracking-wider text-white/25 font-semibold">
              Other
            </div>
            {otherItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-r-md text-left text-xs transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group ${
                    isActive
                      ? 'bg-white/[0.08] border-l-2 border-[var(--nova-accent)] text-white font-semibold'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex-shrink-0 transition-colors duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                        isActive ? 'text-[var(--nova-accent)]' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    >
                      <FluentIcon name={item.icon} size={14} />
                    </div>
                    <span className="truncate text-[11px]">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-[var(--nova-accent)]/20 text-[var(--nova-accent)] flex-shrink-0 leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Pin Control */}
      <div className="p-2 border-t border-white/[0.08] flex-shrink-0">
        <button
          onClick={onTogglePin}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
            isPinned
              ? 'bg-white/[0.08] text-white border border-white/10'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <FluentIcon
              name="Pin"
              size={13}
              className={`transition-transform duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                isPinned ? 'rotate-45 text-[var(--nova-accent)]' : 'text-white/40'
              }`}
            />
            <span className="text-[11px] font-medium">Keep Open</span>
          </div>
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.06] text-white/60">
            {isPinned ? 'PINNED' : 'AUTO'}
          </span>
        </button>
      </div>
    </aside>
  );
};
