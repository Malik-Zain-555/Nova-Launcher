import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface NoteDoc {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export const NotesCaptureModule: React.FC = () => {
  const [notes, setNotes] = useState<NoteDoc[]>([
    {
      id: '1',
      title: 'Nova Dock Architecture Specs',
      content: `# Nova Dock 2.0 Specifications\n\n- **Shell**: Dynamic Island 3-state morphing (Compact, Live Activity, Expanded)\n- **Physics**: 60fps spring transitions\n- **Blur**: Native Windows 11 Acrylic & Mica\n- **Backlinks**: [[Project Alpha]], [[Design System]]\n\n#architecture #windows #fluent`,
      tags: ['architecture', 'windows', 'fluent'],
      updatedAt: 'Just now'
    },
    {
      id: '2',
      title: 'Raycast Command Palette Patterns',
      content: `# Raycast Search Architecture\n\n1. Fuzzy proximity scoring\n2. Math parser with percentage calculations\n3. System action intents\n\n#search #algorithms`,
      tags: ['search', 'algorithms'],
      updatedAt: '2 hours ago'
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isPreview, setIsPreview] = useState<boolean>(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateContent = (text: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id === activeNoteId) {
        // Extract tags
        const tags = Array.from(text.matchAll(/#([a-zA-Z0-9]+)/g)).map(m => m[1]);
        return { ...n, content: text, tags, updatedAt: 'Just now' };
      }
      return n;
    }));
  };

  const handleCreateNote = () => {
    const newNote: NoteDoc = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '# New Note\n\nType your markdown notes here...',
      tags: ['quick'],
      updatedAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    n.content.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="h-full flex gap-3 text-white">
      {/* Left Sidebar: Note List & Search */}
      <div className="w-56 h-full flex flex-col space-y-2 border-r border-white/10 pr-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <FluentIcon name="Search" size={13} className="text-white/40" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Search notes & tags..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
          />
        </div>

        <button
          onClick={handleCreateNote}
          className="w-full py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow"
        >
          <FluentIcon name="Plus" size={13} />
          <span>New Note</span>
        </button>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                activeNoteId === note.id
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'bg-white/[0.02] border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <div className="text-xs font-semibold truncate">{note.title}</div>
              <div className="text-[10px] text-white/40 truncate mt-0.5">{note.updatedAt}</div>
              {note.tags.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Area: Markdown Editor & Backlinks */}
      <div className="flex-1 h-full flex flex-col space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <input
            type="text"
            value={activeNote.title}
            onChange={e => {
              const val = e.target.value;
              setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title: val } : n));
            }}
            className="bg-transparent text-sm font-bold text-white focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 flex items-center gap-1"
            >
              <FluentIcon name={isPreview ? 'Edit3' : 'Eye'} size={13} />
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isPreview ? (
          <div className="flex-1 p-3 rounded-2xl bg-white/[0.02] border border-white/5 overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
            {activeNote.content}
          </div>
        ) : (
          <textarea
            value={activeNote.content}
            onChange={e => handleUpdateContent(e.target.value)}
            className="flex-1 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-[var(--nova-accent,#7c5cff)] custom-scrollbar"
            placeholder="Type markdown note... Use #tags and [[Backlinks]]"
          />
        )}
      </div>
    </div>
  );
};
