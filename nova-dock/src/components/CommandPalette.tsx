import React, { useState, useEffect, useRef } from 'react';
import { FluentIcon } from './FluentIcon';
import { fuzzySearch } from '../core/fuzzy-search';
import { SmartInterpreter, InterpretedAction } from '../core/smart-interpreter';

export interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'App' | 'Action' | 'Clipboard' | 'Task' | 'AI' | 'System' | 'Web';
  icon: string;
  keywords?: string[];
  shortcut?: string;
  action: () => void | Promise<void>;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: PaletteItem[];
  onStartTimer: (minutes: number) => void;
  onAddReminder: (title: string, timeStr?: string) => void;
  onKillProcess: (proc: string) => void;
  onOpenFolder: (folder: string) => void;
  onSnap: (dir: string) => void;
  onSetThemeMode: (mode: 'dark' | 'light') => void;
  onSetAccent: (accent: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  items,
  onStartTimer,
  onAddReminder,
  onKillProcess,
  onOpenFolder,
  onSnap,
  onSetThemeMode,
  onSetAccent
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [interpretedAction, setInterpretedAction] = useState<InterpretedAction | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Interpret natural language query (math, units, currency, timer, system intents)
  useEffect(() => {
    const action = SmartInterpreter.interpret(query, {
      onStartTimer,
      onAddReminder,
      onKillProcess,
      onOpenFolder,
      onSnap,
      onSetThemeMode,
      onSetAccent
    });
    setInterpretedAction(action);
    setSelectedIndex(0);
  }, [query]);

  // Filter items by category
  const filteredByCategory = activeCategory === 'All'
    ? items
    : items.filter(it => it.category === activeCategory);

  // Fuzzy match query across titles, subtitles, and keywords
  const searchResults = fuzzySearch(
    filteredByCategory,
    query,
    item => [item.title, item.subtitle || '', ...(item.keywords || [])],
    10
  ).map(res => res.item);

  // Fallback web search action if query has content
  const displayItems = [...searchResults];
  if (query.trim() && !interpretedAction && displayItems.length === 0) {
    displayItems.push({
      id: 'web-google',
      title: `Search Google for "${query}"`,
      subtitle: 'Open web search in default browser',
      category: 'Web',
      icon: 'Globe',
      action: () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
    });
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    const totalSelectable = displayItems.length + (interpretedAction ? 1 : 0);
    if (totalSelectable === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalSelectable);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalSelectable) % totalSelectable);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (interpretedAction && selectedIndex === 0) {
        interpretedAction.execute();
        onClose();
      } else {
        const itemIdx = interpretedAction ? selectedIndex - 1 : selectedIndex;
        if (displayItems[itemIdx]) {
          displayItems[itemIdx].action();
          onClose();
        }
      }
    }
  };

  if (!isOpen) return null;

  const categories = ['All', 'App', 'Action', 'Clipboard', 'Task', 'AI', 'System'];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-start justify-center pt-20 z-50 animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-[620px] max-h-[500px] flex flex-col rounded-2xl bg-slate-950/95 border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl"
        style={{
          boxShadow: '0 25px 65px -15px rgba(0,0,0,0.85), 0 0 1px 1px rgba(255,255,255,0.2) inset'
        }}
      >
        {/* Search Header Bar */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
          <FluentIcon name="Search" size={18} className="text-[var(--nova-accent,#7c5cff)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, app, math (2*(3+4)), timer 15m, kill chrome..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none tracking-normal"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-white/40 hover:text-white p-1 rounded-full"
            >
              <FluentIcon name="X" size={13} />
            </button>
          )}
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 border border-white/10 px-1.5 py-0.5 rounded-md bg-white/5">
            <span>ESC</span>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="px-3.5 py-1.5 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar bg-white/[0.01]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[var(--nova-accent,#7c5cff)] text-white shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Body List Container */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {/* Smart Interpreter Live Result Card */}
          {interpretedAction && (
            <div
              onClick={() => {
                interpretedAction.execute();
                onClose();
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedIndex === 0
                  ? 'bg-[var(--nova-accent,#7c5cff)]/25 border-[var(--nova-accent,#7c5cff)] text-white'
                  : 'bg-white/[0.04] border-white/10 text-white/90 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--nova-accent,#7c5cff)]/30 flex items-center justify-center text-[var(--nova-accent,#7c5cff)] border border-[var(--nova-accent,#7c5cff)]/40">
                  <FluentIcon name={interpretedAction.icon} size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-wide font-mono text-white">
                    {interpretedAction.title}
                  </div>
                  <div className="text-xs text-white/60">
                    {interpretedAction.subtitle}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--nova-accent,#7c5cff)]/40 text-white">
                  {interpretedAction.category}
                </span>
                <span className="text-[10px] text-white/40 font-mono">↵ Execute</span>
              </div>
            </div>
          )}

          {/* Regular Search Items */}
          {displayItems.map((item, idx) => {
            const actualIndex = interpretedAction ? idx + 1 : idx;
            const isSelected = selectedIndex === actualIndex;

            return (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className={`px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-white/15 border-white/20 text-white shadow-sm'
                    : 'border-transparent text-white/80 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[var(--nova-accent,#7c5cff)] text-white'
                        : 'bg-white/5 text-white/60 group-hover:text-white'
                    }`}
                  >
                    <FluentIcon name={item.icon} size={15} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white truncate">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-[11px] text-white/50 truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                      {item.shortcut}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                    {item.category}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] text-white/60 font-mono">↵</span>
                  )}
                </div>
              </div>
            );
          })}

          {displayItems.length === 0 && !interpretedAction && (
            <div className="py-12 text-center text-xs text-white/40 space-y-1">
              <FluentIcon name="SearchX" size={24} className="mx-auto text-white/20 mb-2" />
              <div>No matching commands found</div>
              <div className="text-[11px] text-white/30">Try math expressions, "timer 15m", or "kill chrome"</div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-3.5 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px]">↑</kbd> <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px]">↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px]">↵</kbd> Open</span>
            <span><kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[10px]">esc</kbd> Dismiss</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px]">Nova Dock 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
