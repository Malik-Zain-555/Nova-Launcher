import { app, shell, screen, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import path from 'path';

export class WindowsHelper {
  private static lastFullscreenState: boolean = false;

  /**
   * Checks if the active foreground window is fullscreen (e.g. game or video)
   */
  public static checkFullscreen(callback: (isFullscreen: boolean) => void): void {
    const psScript = `
Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class WinCheck {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  }
"@
$hwnd = [WinCheck]::GetForegroundWindow()
$rect = New-Object WinCheck+RECT
[WinCheck]::GetWindowRect($hwnd, [ref]$rect) | Out-Null
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
Write-Output "$width,$height"
`;

    exec(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`, (err, stdout) => {
      if (err) return;
      const parts = stdout.trim().split(',');
      if (parts.length === 2) {
        const w = parseInt(parts[0], 10);
        const h = parseInt(parts[1], 10);
        const primary = screen.getPrimaryDisplay().bounds;

        // If foreground window covers or exceeds primary screen resolution
        const isFS = w >= primary.width && h >= primary.height;
        if (isFS !== this.lastFullscreenState) {
          this.lastFullscreenState = isFS;
          callback(isFS);
        }
      }
    });
  }

  /**
   * Terminate a process safely by name
   */
  public static killProcess(processName: string, callback?: (success: boolean) => void): void {
    const cleanName = processName.replace(/\.exe$/i, '').trim();
    exec(`taskkill /f /im "${cleanName}.exe"`, (err) => {
      if (callback) callback(!err);
    });
  }

  /**
   * Open known system folders in File Explorer
   */
  public static openFolder(folderKey: string): void {
    const key = folderKey.toLowerCase().trim();
    let targetPath: string = '';

    switch (key) {
      case 'downloads':
      case 'download':
        targetPath = app.getPath('downloads');
        break;
      case 'documents':
      case 'document':
      case 'docs':
        targetPath = app.getPath('documents');
        break;
      case 'desktop':
        targetPath = app.getPath('desktop');
        break;
      case 'pictures':
      case 'photos':
        targetPath = app.getPath('pictures');
        break;
      case 'music':
        targetPath = app.getPath('music');
        break;
      case 'videos':
        targetPath = app.getPath('videos');
        break;
      default:
        targetPath = path.isAbsolute(key) ? key : app.getPath('home');
    }

    shell.openPath(targetPath);
  }

  /**
   * Snap active foreground window to a quadrant or half
   */
  public static snapWindow(direction: string): void {
    const dir = direction.toLowerCase().trim();
    let psCmd = '';

    switch (dir) {
      case 'left':
        // Win + Left
        psCmd = `$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys("#{LEFT}")`;
        break;
      case 'right':
        // Win + Right
        psCmd = `$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys("#{RIGHT}")`;
        break;
      case 'max':
      case 'maximize':
        // Win + Up
        psCmd = `$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys("#{UP}")`;
        break;
      case 'min':
      case 'minimize':
        // Win + Down
        psCmd = `$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys("#{DOWN}")`;
        break;
      default:
        return;
    }

    exec(`powershell -NoProfile -Command "${psCmd}"`);
  }

  /**
   * Moves window to current active monitor containing the mouse pointer
   */
  public static followActiveMonitor(window: BrowserWindow, width: number, height: number): void {
    const point = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(point);
    const { x: screenX, y: screenY, width: screenW } = currentDisplay.workArea;

    const targetX = screenX + Math.round((screenW - width) / 2);
    const targetY = screenY + 8; // Top placement

    const [curX, curY] = window.getPosition();
    if (Math.abs(curX - targetX) > 10 || Math.abs(curY - targetY) > 10) {
      window.setBounds({ x: targetX, y: targetY, width, height });
    }
  }
}
