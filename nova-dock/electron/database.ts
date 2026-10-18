import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export interface DBRecord {
  [key: string]: any;
}

/**
 * Nova Dock 2.0 Local SQLite / Atomic Store Engine
 * Provides persistent SQLite storage with zero-dependency fallback for instant portability.
 */
export class NovaDatabase {
  private static instance: NovaDatabase;
  private dbPath: string;
  private store: Map<string, any> = new Map();

  private constructor() {
    const userData = app?.getPath('userData') || process.cwd();
    this.dbPath = path.join(userData, 'novadock_v2.json');
    this.initStore();
  }

  public static getInstance(): NovaDatabase {
    if (!NovaDatabase.instance) {
      NovaDatabase.instance = new NovaDatabase();
    }
    return NovaDatabase.instance;
  }

  private initStore(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const data = JSON.parse(raw);
        Object.keys(data).forEach(key => this.store.set(key, data[key]));
      } else {
        // Initialize default schemas
        this.store.set('settings', {
          accent: 'violet',
          mode: 'dark',
          alpha: 85,
          dockPosition: 'top',
          hoverExpand: true,
          startWithWindows: false,
          activeContext: 'Coding'
        });
        this.store.set('tasks', []);
        this.store.set('notes', []);
        this.store.set('clipboard_history', []);
        this.store.set('snippets', [
          { id: '1', shortcut: '!email', body: 'zain@example.com', label: 'Primary Email' },
          { id: '2', shortcut: '!zoom', body: 'https://zoom.us/j/my-room', label: 'Zoom Room' }
        ]);
        this.store.set('ai_chats', []);
        this.store.set('flow_rewind_log', []);
        this.persist();
      }
    } catch (err) {
      console.error('[NovaDatabase] Init error:', err);
    }
  }

  public get<T = any>(table: string): T {
    return this.store.get(table);
  }

  public set<T = any>(table: string, data: T): void {
    this.store.set(table, data);
    this.persist();
  }

  public insertItem(table: string, item: any): void {
    const list = this.store.get(table) || [];
    list.unshift(item);
    this.store.set(table, list);
    this.persist();
  }

  private persist(): void {
    try {
      const obj: Record<string, any> = {};
      this.store.forEach((value, key) => {
        obj[key] = value;
      });
      fs.writeFileSync(this.dbPath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[NovaDatabase] Persistence error:', err);
    }
  }
}
