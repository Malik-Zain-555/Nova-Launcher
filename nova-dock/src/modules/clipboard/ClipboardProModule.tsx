import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface ClipboardEntry {
  id: string;
  text: string;
  copiedAt: string;
  pinned: boolean;
  isSensitive: boolean;
}

export const ClipboardProModule: React.FC = () => {
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [selectedEntryId, setSelectedEntryId] = useState<string>('1');
  const [pasteStack, setPasteStack] = useState<string[]>([]);

  const [history, setHistory] = useState<ClipboardEntry[]>([
    {
      id: '1',
      text: 'sk-ant-api03-abcdef1234567890abcdef1234567890',
      copiedAt: '2 mins ago',
      pinned: true,
      isSensitive: true
    },
    {
      id: '2',
      text: '{"name":"Nova Dock","version":"2.0.0","engine":"electron-34","fps":60}',
      copiedAt: '12 mins ago',
      pinned: false,
      isSensitive: false
    },
    {
      id: '3',
      text: 'https://github.com/nova-dock/v2-desktop-suite',
      copiedAt: '1 hour ago',
      pinned: false,
      isSensitive: false
    },
    {
      id: '4',
      text: 'Banana\nApple\nOrange\nApple\nGrape',
      copiedAt: '3 hours ago',
      pinned: false,
      isSensitive: false
    }
  ]);

  const activeEntry = history.find(h => h.id === selectedEntryId) || history[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleTogglePin = (id: string) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, pinned: !h.pinned } : h));
  };

  // Text Transformations
  const applyTransform = (transform: 'upper' | 'lower' | 'json' | 'sort' | 'dedup' | 'slug') => {
    if (!activeEntry) return;
    let transformed = activeEntry.text;

    switch (transform) {
      case 'upper':
        transformed = transformed.toUpperCase();
        break;
      case 'lower':
        transformed = transformed.toLowerCase();
        break;
      case 'json':
        try {
          const parsed = JSON.parse(transformed);
          transformed = JSON.stringify(parsed, null, 2);
        } catch {}
        break;
      case 'sort':
        transformed = transformed.split('\n').sort().join('\n');
        break;
      case 'dedup':
        transformed = Array.from(new Set(transformed.split('\n'))).join('\n');
        break;
      case 'slug':
        transformed = transformed.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        break;
    }

    setHistory(prev => prev.map(h => h.id === activeEntry.id ? { ...h, text: transformed } : h));
    handleCopy(transformed);
  };

  const addToPasteStack = (text: string) => {
    setPasteStack(prev => [...prev, text]);
  };

  const maskIfSensitive = (entry: ClipboardEntry) => {
    if (entry.isSensitive) {
      return entry.text.slice(0, 7) + '••••••••••••••••••••••••' + entry.text.slice(-4);
    }
    return entry.text;
  };

  const filteredHistory = history.filter(h =>
    h.text.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="h-full flex gap-3 text-white">
      {/* Left Column: History Items */}
      <div className="w-64 h-full flex flex-col space-y-2 border-r border-white/10 pr-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <FluentIcon name="Search" size={13} className="text-white/40" />
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Search clipboard..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
          {filteredHistory.map(entry => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntryId(entry.id)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between group ${
                selectedEntryId === entry.id
                  ? 'bg-white/15 border-white/20 text-white shadow'
                  : 'bg-white/[0.03] border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <div className="truncate flex-1 pr-2">
                <div className="text-xs font-mono truncate">
                  {maskIfSensitive(entry)}
                </div>
                <div className="text-[10px] text-white/40 mt-1 flex items-center gap-2">
                  <span>{entry.copiedAt}</span>
                  {entry.isSensitive && (
                    <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300">
                      Masked Key
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePin(entry.id);
                }}
                className={`p-1 rounded text-white/40 hover:text-white ${entry.pinned ? 'text-amber-400' : ''}`}
              >
                <FluentIcon name="Pin" size={12} className={entry.pinned ? 'rotate-45' : ''} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Active Entry Detail, Transforms Toolbar & Paste Stack */}
      <div className="flex-1 h-full flex flex-col space-y-3">
        {/* Transformations Action Bar */}
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 pr-1">Transforms:</span>
            {[
              { id: 'upper', label: 'UPPER' },
              { id: 'lower', label: 'lower' },
              { id: 'json', label: '{ JSON }' },
              { id: 'sort', label: 'Sort A-Z' },
              { id: 'dedup', label: 'Dedup' },
              { id: 'slug', label: 'slug-case' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => applyTransform(t.id as any)}
                className="px-2 py-1 rounded-lg text-[10px] bg-white/5 hover:bg-white/15 text-white/80 font-mono transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopy(activeEntry?.text || '')}
            className="px-3 py-1 rounded-lg bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow"
          >
            <FluentIcon name="Copy" size={12} />
            <span>Copy</span>
          </button>
        </div>

        {/* Content Viewer / Editor */}
        <textarea
          value={activeEntry ? activeEntry.text : ''}
          onChange={e => {
            const val = e.target.value;
            setHistory(prev => prev.map(h => h.id === selectedEntryId ? { ...h, text: val } : h));
          }}
          className="flex-1 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono leading-relaxed resize-none focus:outline-none custom-scrollbar"
        />

        {/* Paste-Stack Tray */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FluentIcon name="Layers" size={14} className="text-cyan-400" />
            <span className="font-semibold text-white/90">Paste-Stack Queue:</span>
            <span className="text-[11px] text-white/50">{pasteStack.length} items queued</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addToPasteStack(activeEntry?.text || '')}
              className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white"
            >
              + Queue Active Item
            </button>
            {pasteStack.length > 0 && (
              <button
                onClick={() => setPasteStack([])}
                className="text-[11px] text-white/40 hover:text-white"
              >
                Clear Queue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
