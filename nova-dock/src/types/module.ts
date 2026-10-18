import React from 'react';
import { CommandItem, SystemMetrics, LiveActivity, ContextMode } from './index';

export type Permission = 
  | 'system.clipboard'
  | 'system.process'
  | 'system.window'
  | 'system.network'
  | 'system.audio'
  | 'ai.inference'
  | 'storage.sqlite'
  | 'notifications.toast';

export interface PluginContext {
  metrics: SystemMetrics;
  activeContext: ContextMode;
  emitEvent: (event: string, payload?: any) => void;
  triggerLiveActivity: (activity: LiveActivity) => void;
  clearLiveActivity: (id: string) => void;
  requestPermission: (perm: Permission) => Promise<boolean>;
  openCommandPalette: (query?: string) => void;
  storage: {
    get: <T>(key: string, fallback: T) => Promise<T>;
    set: <T>(key: string, value: T) => Promise<void>;
  };
}

export interface NovaModule {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string; // Lucide icon name
  category: 'Productivity' | 'System' | 'Intelligence' | 'Media' | 'Utilities' | 'Wellness';
  permissions: Permission[];
  
  // Lifecycle
  init?: (context: PluginContext) => Promise<void>;
  destroy?: () => Promise<void>;

  // Rendering hooks
  renderCompactBadge?: (context: PluginContext) => React.ReactNode;
  renderExpanded: (context: PluginContext) => React.ReactNode;
  renderQuickWidget?: (context: PluginContext) => React.ReactNode;

  // Search & Command integration
  getCommands?: (context: PluginContext) => CommandItem[];

  // Event listener
  onEvent?: (event: string, payload: any, context: PluginContext) => void;
}
