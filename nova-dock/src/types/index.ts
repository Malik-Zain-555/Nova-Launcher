export type DockState = 'compact' | 'expanded' | 'live-activity';

export type DockPosition = 'top' | 'bottom' | 'left' | 'right';

export type ContextMode = 'General' | 'Coding' | 'Browsing' | 'Meeting' | 'Writing' | 'Gaming' | 'Design';

export interface LiveActivity {
  id: string;
  type: 'timer' | 'media' | 'meeting' | 'download' | 'battery' | 'clipboard' | 'custom';
  title: string;
  subtitle?: string;
  progress?: number; // 0 to 1
  iconName?: string;
  accentColor?: string;
  expiresAt?: number;
  actionPayload?: any;
}

export interface SystemMetrics {
  cpuUsage: number; // 0 - 100
  ramUsage: number; // 0 - 100
  diskUsage: number; // 0 - 100
  batteryPercent: number; // 0 - 100
  isCharging: boolean;
  networkUp: number; // KB/s
  networkDown: number; // KB/s
  weatherTemp?: string;
  weatherCondition?: string;
  currentTime: string;
  currentDate: string;
}

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'App' | 'Action' | 'Math' | 'Note' | 'Snippet' | 'AI' | 'Settings' | 'Window' | 'Web';
  icon?: string;
  shortcut?: string;
  keywords?: string[];
  action: () => void | Promise<void>;
}
