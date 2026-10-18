import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface SnippetTemplate {
  id: string;
  prefix: string;
  title: string;
  body: string;
  variables: string[];
}

export const SnippetsModule: React.FC = () => {
  const [snippets, setSnippets] = useState<SnippetTemplate[]>([
    {
      id: '1',
      prefix: '!email',
      title: 'Primary Professional Email',
      body: 'zain@example.com',
      variables: []
    },
    {
      id: '2',
      prefix: '!meet',
      title: 'Standard Zoom Meeting Invitation',
      body: 'Hi there,\n\nLooking forward to speaking with you! Here is the meeting link:\nhttps://zoom.us/j/1234567890\n\nBest regards,\nZain',
      variables: []
    },
    {
      id: '3',
      prefix: '!sig',
      title: 'Full Email Signature',
      body: 'Warm regards,\n\nZain | Staff Systems & Desktop Engineer\nNova Dock Core Team · Windows 11 Fluent Suite',
      variables: []
    },
    {
      id: '4',
      prefix: '!today',
      title: 'Current Date Stamp',
      body: 'Date: {date} ({time})',
      variables: ['date', 'time']
    }
  ]);

  const [activeSnippetId, setActiveSnippetId] = useState<string>('1');
  const [filterQuery, setFilterQuery] = useState<string>('');

  const activeSnippet = snippets.find(s => s.id === activeSnippetId) || snippets[0];

  const handleCopySnippet = (snippet: SnippetTemplate) => {
    let resolved = snippet.body;
    const now = new Date();
    resolved = resolved.replace(/{date}/g, now.toLocaleDateString());
    resolved = resolved.replace(/{time}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    navigator.clipboard.writeText(resolved);
  };

  const handleCreateSnippet = () => {
    const newSnip: SnippetTemplate = {
      id: Date.now().toString(),
      prefix: '!new',
      title: 'New Text Snippet',
      body: 'Replacement text here...',
      variables: []
    };
    setSnippets(prev => [newSnip, ...prev]);
    setActiveSnippetId(newSnip.id);
  };

  const filteredSnippets = snippets.filter(s =>
    s.prefix.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="h-full flex gap-3 text-white">
      {/* Left List */}
      <div className="w-64 h-full flex flex-col space-y-2 border-r border-white/10 pr-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <FluentIcon name="Search" size={13} className="text-white/40" />
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Search triggers (!email)..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
          />
        </div>

        <button
          onClick={handleCreateSnippet}
          className="w-full py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow"
        >
          <FluentIcon name="Plus" size={13} />
          <span>New Snippet</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
          {filteredSnippets.map(snip => (
            <div
              key={snip.id}
              onClick={() => setActiveSnippetId(snip.id)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                activeSnippetId === snip.id
                  ? 'bg-white/15 border-white/20 text-white shadow'
                  : 'bg-white/[0.03] border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[var(--nova-accent,#7c5cff)]">
                  {snip.prefix}
                </span>
              </div>
              <div className="text-xs font-medium text-white/90 truncate mt-0.5">
                {snip.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detail & Editor */}
      <div className="flex-1 h-full flex flex-col space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-mono">Trigger:</span>
            <input
              type="text"
              value={activeSnippet.prefix}
              onChange={e => {
                const val = e.target.value;
                setSnippets(prev => prev.map(s => s.id === activeSnippetId ? { ...s, prefix: val } : s));
              }}
              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono font-bold text-[var(--nova-accent,#7c5cff)] focus:outline-none"
            />
            <input
              type="text"
              value={activeSnippet.title}
              onChange={e => {
                const val = e.target.value;
                setSnippets(prev => prev.map(s => s.id === activeSnippetId ? { ...s, title: val } : s));
              }}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none ml-2"
            />
          </div>

          <button
            onClick={() => handleCopySnippet(activeSnippet)}
            className="px-3 py-1 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow"
          >
            <FluentIcon name="Copy" size={13} />
            <span>Copy & Expand</span>
          </button>
        </div>

        {/* Snippet Template Editor */}
        <textarea
          value={activeSnippet.body}
          onChange={e => {
            const val = e.target.value;
            setSnippets(prev => prev.map(s => s.id === activeSnippetId ? { ...s, body: val } : s));
          }}
          className="flex-1 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-[var(--nova-accent,#7c5cff)] custom-scrollbar"
        />

        {/* Dynamic Variables Pill Bar */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-white/60">
          <span className="text-[10px] uppercase font-semibold text-white/40">Variables:</span>
          {['{date}', '{time}', '{clipboard}', '{cursor}'].map(v => (
            <button
              key={v}
              onClick={() => {
                const newBody = activeSnippet.body + ' ' + v;
                setSnippets(prev => prev.map(s => s.id === activeSnippetId ? { ...s, body: newBody } : s));
              }}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-mono text-cyan-300 transition-colors"
            >
              + {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
