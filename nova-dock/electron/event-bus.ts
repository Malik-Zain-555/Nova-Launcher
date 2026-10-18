import { ipcMain, BrowserWindow, clipboard, globalShortcut, shell, screen } from 'electron';
import { NovaDatabase } from './database';
import { WindowsHelper } from './windows-helper';
import { exec } from 'child_process';
import os from 'os';

export class MainEventBus {
  private mainWindow: BrowserWindow;
  private db: NovaDatabase;
  private lastClipboardText: string = '';
  private currentWidth: number = 580;
  private currentHeight: number = 52;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.db = NovaDatabase.getInstance();
    this.registerIpcHandlers();
    this.registerGlobalHotkeys();
    this.startClipboardWatcher();
    this.startMetricsEmitter();
    this.startFullscreenWatcher();
    this.startMultiMonitorWatcher();
  }

  private registerIpcHandlers(): void {
    // Dynamic Window Resize
    ipcMain.handle('window:resize', (_, width: number, height: number) => {
      if (!this.mainWindow.isDestroyed()) {
        this.currentWidth = width;
        this.currentHeight = height;
        const currentDisplay = screen.getDisplayNearestPoint(this.mainWindow.getBounds());
        const { x: dispX, y: dispY, width: dispW } = currentDisplay.workArea;
        const [, currentY] = this.mainWindow.getPosition();
        const newX = Math.round(dispX + (dispW - width) / 2);
        const newY = currentY > 100 ? currentY : dispY;
        this.mainWindow.setBounds({ x: newX, y: newY, width, height });
      }
    });

    // Database operations
    ipcMain.handle('db:get', (_, key: string) => this.db.get(key));
    ipcMain.handle('db:set', (_, key: string, val: any) => this.db.set(key, val));

    // Launch app / URL
    ipcMain.handle('app:launch', (_, command: string) => {
      if (command.startsWith('http://') || command.startsWith('https://')) {
        shell.openExternal(command);
      } else {
        exec(`start "" "${command}"`, (err) => {
          if (err) console.error(`[MainEventBus] Launch error for "${command}":`, err);
        });
      }
    });

    // Kill Process
    ipcMain.handle('system:kill-process', (_, procName: string) => {
      WindowsHelper.killProcess(procName);
    });

    // Open Folder
    ipcMain.handle('system:open-folder', (_, folderName: string) => {
      WindowsHelper.openFolder(folderName);
    });

    // Window Snapping
    ipcMain.handle('system:snap-window', (_, direction: string) => {
      WindowsHelper.snapWindow(direction);
    });

    // System Actions (lock, sleep, screensnip, recycle bin)
    ipcMain.handle('system:action', (_, action: string) => {
      switch (action) {
        case 'lock':
          exec('rundll32.exe user32.dll,LockWorkStation');
          break;
        case 'sleep':
          exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
          break;
        case 'screensnip':
          exec('start ms-screenclip:');
          break;
        case 'empty-recycle':
          exec('powershell.exe -NoProfile -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"');
          break;
        default:
          console.log(`[MainEventBus] Unknown system action: ${action}`);
      }
    });
  }

  private registerGlobalHotkeys(): void {
    // Raycast-style command palette trigger: Ctrl+Alt+Space
    globalShortcut.register('CommandOrControl+Alt+Space', () => {
      if (!this.mainWindow.isDestroyed()) {
        if (!this.mainWindow.isVisible()) {
          this.mainWindow.show();
        }
        this.mainWindow.focus();
        this.mainWindow.webContents.send('hotkey:summon-palette');
      }
    });
  }

  private startClipboardWatcher(): void {
    setInterval(() => {
      const text = clipboard.readText();
      if (text && text.trim() && text !== this.lastClipboardText) {
        this.lastClipboardText = text;
        const item = {
          id: Date.now().toString(),
          text,
          copiedAt: new Date().toISOString()
        };
        this.db.insertItem('clipboard_history', item);
        this.mainWindow.webContents.send('clipboard:new', item);
      }
    }, 1000);
  }

  private startFullscreenWatcher(): void {
    // Check every 2 seconds if active window is a fullscreen game / video
    setInterval(() => {
      if (!this.mainWindow.isDestroyed()) {
        WindowsHelper.checkFullscreen((isFs) => {
          this.mainWindow.webContents.send('system:fullscreen-change', isFs);
        });
      }
    }, 2000);
  }

  private startMultiMonitorWatcher(): void {
    // Check if mouse cursor moved to another display
    setInterval(() => {
      if (!this.mainWindow.isDestroyed()) {
        const point = screen.getCursorScreenPoint();
        const nearest = screen.getDisplayNearestPoint(point);
        const [winX] = this.mainWindow.getPosition();
        const displayBounds = nearest.bounds;

        // If dock is on a different display than cursor
        if (winX < displayBounds.x || winX > displayBounds.x + displayBounds.width) {
          WindowsHelper.followActiveMonitor(this.mainWindow, this.currentWidth, this.currentHeight);
        }
      }
    }, 1500);
  }

  private startMetricsEmitter(): void {
    setInterval(() => {
      if (this.mainWindow.isDestroyed()) return;

      const load = Math.round(os.loadavg()[0] * 10);
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const ramPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

      this.mainWindow.webContents.send('metrics:update', {
        cpuUsage: Math.min(100, Math.max(4, load)),
        ramUsage: ramPercent,
        diskUsage: 48,
        batteryPercent: 91,
        isCharging: true,
        networkUp: 140,
        networkDown: 920,
        currentTime: timeStr,
        currentDate: dateStr,
        weatherTemp: '22°C',
        weatherCondition: 'Partly Cloudy'
      });
    }, 2500);
  }
}
