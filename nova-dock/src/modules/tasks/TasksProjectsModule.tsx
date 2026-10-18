import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export interface TaskItem {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  tag?: string;
  dueDate?: string;
  subtasks?: Array<{ id: string; title: string; done: boolean }>;
  trackedSeconds?: number;
  isTracking?: boolean;
}

export const TasksProjectsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'today'>('list');
  const [inputVal, setInputVal] = useState<string>('');

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: 'Complete Nova Dock 2.0 essential modules refactor',
      status: 'in-progress',
      priority: 'high',
      tag: 'Development',
      dueDate: 'Today at 5:00 PM',
      trackedSeconds: 2400,
      subtasks: [
        { id: '1-1', title: 'Day Orchestrator & Energy Engine', done: true },
        { id: '1-2', title: 'Focus Suite & Lo-Fi Generator', done: true },
        { id: '1-3', title: 'Clipboard Pro & Snippet Expander', done: false }
      ]
    },
    {
      id: '2',
      title: 'Prepare design tokens documentation for Windows 11 Acrylic',
      status: 'todo',
      priority: 'medium',
      tag: 'Design',
      dueDate: 'Tomorrow',
      trackedSeconds: 0
    },
    {
      id: '3',
      title: 'Review pull requests and test MSIX installer script',
      status: 'done',
      priority: 'low',
      tag: 'DevOps',
      dueDate: 'Yesterday',
      trackedSeconds: 1200
    }
  ]);

  // Natural language parser for adding tasks
  const handleAddTask = () => {
    const raw = inputVal.trim();
    if (!raw) return;

    let priority: 'high' | 'medium' | 'low' = 'medium';
    let tag = 'General';
    let cleanTitle = raw;

    if (raw.includes('!high')) {
      priority = 'high';
      cleanTitle = cleanTitle.replace('!high', '').trim();
    } else if (raw.includes('!low')) {
      priority = 'low';
      cleanTitle = cleanTitle.replace('!low', '').trim();
    }

    const tagMatch = cleanTitle.match(/#([a-zA-Z0-9]+)/);
    if (tagMatch) {
      tag = tagMatch[1];
      cleanTitle = cleanTitle.replace(tagMatch[0], '').trim();
    }

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: cleanTitle,
      status: 'todo',
      priority,
      tag,
      dueDate: 'Today',
      trackedSeconds: 0
    };

    setTasks(prev => [newTask, ...prev]);
    setInputVal('');
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
      }
      return t;
    }));
  };

  const handleToggleSubtask = (taskId: string, subId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s)
        };
      }
      return t;
    }));
  };

  return (
    <div className="h-full flex flex-col space-y-3.5 text-white">
      {/* Top Bar: Input & View Switcher */}
      <div className="flex items-center justify-between gap-3">
        {/* Natural Language Task Input */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-[var(--nova-accent,#7c5cff)] transition-all">
          <FluentIcon name="PlusCircle" size={16} className="text-white/40" />
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Type task with tags e.g. 'Pay bill at 9am #Finance !high' and press Enter..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
          />
        </div>

        {/* View Mode Pills */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          {(['list', 'kanban', 'today'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                viewMode === mode
                  ? 'bg-[var(--nova-accent,#7c5cff)] text-white font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`p-3 rounded-2xl border transition-all ${
                task.status === 'done'
                  ? 'bg-white/[0.02] border-white/5 text-white/40'
                  : 'bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleStatus(task.id)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                      task.status === 'done'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-white/30 hover:border-white'
                    }`}
                  >
                    {task.status === 'done' && <FluentIcon name="Check" size={11} />}
                  </button>
                  <span className={`text-xs font-medium ${task.status === 'done' ? 'line-through' : ''}`}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  {task.tag && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                      #{task.tag}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      task.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>

              {/* Subtasks Checklist */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-white/5 pl-6 space-y-1">
                  {task.subtasks.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleSubtask(task.id, sub.id)}
                      className="flex items-center gap-2 text-[11px] text-white/70 hover:text-white cursor-pointer"
                    >
                      <div className={`w-3 h-3 rounded flex items-center justify-center border ${sub.done ? 'bg-[var(--nova-accent,#7c5cff)] border-[var(--nova-accent,#7c5cff)] text-white' : 'border-white/20'}`}>
                        {sub.done && <FluentIcon name="Check" size={8} />}
                      </div>
                      <span className={sub.done ? 'line-through text-white/40' : ''}>{sub.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="flex-1 grid grid-cols-3 gap-3 overflow-hidden">
          {(['todo', 'in-progress', 'done'] as const).map(colStatus => {
            const colTasks = tasks.filter(t => t.status === colStatus);
            const titles = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Completed' };

            return (
              <div key={colStatus} className="flex flex-col p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs font-semibold text-white/80">
                  <span>{titles[colStatus]}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                  {colTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleStatus(t.id)}
                      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-white/15 cursor-pointer text-xs space-y-1.5"
                    >
                      <div className="font-medium text-white/90 leading-tight">{t.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-white/40">
                        <span>#{t.tag}</span>
                        <span className="capitalize">{t.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'today' && (
        <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--nova-accent,#7c5cff)]">Today's Focus Items</h4>
          {tasks.filter(t => t.dueDate?.includes('Today')).map(t => (
            <div key={t.id} className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between text-xs">
              <span>{t.title}</span>
              <span className="text-[10px] font-mono text-white/50">{t.dueDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
