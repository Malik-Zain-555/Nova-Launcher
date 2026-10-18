import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('novaAPI', {
  resizeWindow: (width: number, height: number) => {
    return ipcRenderer.invoke('window:resize', width, height);
  },
  launchApp: (cmd: string) => {
    return ipcRenderer.invoke('app:launch', cmd);
  },
  killProcess: (procName: string) => {
    return ipcRenderer.invoke('system:kill-process', procName);
  },
  openFolder: (folderName: string) => {
    return ipcRenderer.invoke('system:open-folder', folderName);
  },
  snapWindow: (direction: string) => {
    return ipcRenderer.invoke('system:snap-window', direction);
  },
  systemAction: (action: string) => {
    return ipcRenderer.invoke('system:action', action);
  },
  dbGet: (key: string) => {
    return ipcRenderer.invoke('db:get', key);
  },
  dbSet: (key: string, val: any) => {
    return ipcRenderer.invoke('db:set', key, val);
  },
  onMetricsUpdate: (callback: (metrics: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('metrics:update', handler);
    return () => ipcRenderer.removeListener('metrics:update', handler);
  },
  onClipboardNew: (callback: (item: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('clipboard:new', handler);
    return () => ipcRenderer.removeListener('clipboard:new', handler);
  },
  onSummonPalette: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('hotkey:summon-palette', handler);
    return () => ipcRenderer.removeListener('hotkey:summon-palette', handler);
  },
  onFullscreenChange: (callback: (isFullscreen: boolean) => void) => {
    const handler = (_: any, isFs: boolean) => callback(isFs);
    ipcRenderer.on('system:fullscreen-change', handler);
    return () => ipcRenderer.removeListener('system:fullscreen-change', handler);
  }
});
