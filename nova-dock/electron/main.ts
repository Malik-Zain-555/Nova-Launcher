import { app, BrowserWindow, screen, Tray, Menu, nativeImage, NativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { MainEventBus } from './event-bus';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let eventBus: MainEventBus | null = null;

const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged;

function getAssetPath(filename: string): string {
  const p1 = path.join(__dirname, 'assets', filename);
  const p2 = path.join(__dirname, '../electron/assets', filename);
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return p1;
}

// Enable 60 FPS hardware acceleration & low resource usage
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('high-dpi-support', '1');

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const initialWidth = 540;
  const initialHeight = 44;
  const x = Math.round((screenWidth - initialWidth) / 2);
  const y = 0; // Attached directly to top edge like iPhone Dynamic Island

  const icoPath = getAssetPath('icon.ico');
  const pngPath = getAssetPath('icon.png');
  const appIconPath = fs.existsSync(icoPath) ? icoPath : pngPath;
  const appIcon = fs.existsSync(appIconPath) ? nativeImage.createFromPath(appIconPath) : undefined;

  mainWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  // Windows stays on top across workspaces
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  eventBus = new MainEventBus(mainWindow);

  const distIndexPath = path.join(__dirname, '../dist/index.html');
  const shouldUseDevServer = process.env.ELECTRON_DEV === '1' || (isDev && !fs.existsSync(distIndexPath));

  if (shouldUseDevServer) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(distIndexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icoPath = getAssetPath('tray.ico');
  const pngPath = getAssetPath('tray.png');
  const trayIconPath = process.platform === 'win32' && fs.existsSync(icoPath) ? icoPath : pngPath;
  let trayImage: NativeImage;

  if (fs.existsSync(trayIconPath)) {
    trayImage = nativeImage.createFromPath(trayIconPath);
  } else {
    trayImage = nativeImage.createEmpty();
  }

  tray = new Tray(trayImage);
  tray.setToolTip('Nova Dock 2.0 (Ctrl+Alt+Space)');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide Dock',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      }
    },
    {
      label: 'Command Palette (Ctrl+Alt+Space)',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('hotkey:summon-palette');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Nova Dock',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
