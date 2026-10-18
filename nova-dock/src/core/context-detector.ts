import { ContextMode } from '../types';

export class ContextDetector {
  private static appMap: Record<string, ContextMode> = {
    // Coding
    'code': 'Coding',
    'cursor': 'Coding',
    'devenv': 'Coding',
    'idea64': 'Coding',
    'pycharm64': 'Coding',
    'sublime_text': 'Coding',
    'windowsterminal': 'Coding',
    'cmd': 'Coding',
    'powershell': 'Coding',

    // Browsing
    'chrome': 'Browsing',
    'msedge': 'Browsing',
    'firefox': 'Browsing',
    'brave': 'Browsing',
    'arc': 'Browsing',

    // Meeting
    'zoom': 'Meeting',
    'teams': 'Meeting',
    'slack': 'Meeting',
    'discord': 'Meeting',
    'webex': 'Meeting',

    // Writing
    'winword': 'Writing',
    'notion': 'Writing',
    'obsidian': 'Writing',
    'typora': 'Writing',
    'notepad': 'Writing',

    // Gaming
    'steam': 'Gaming',
    'epicgameslauncher': 'Gaming',
    'valorant': 'Gaming',
    'overwatch': 'Gaming',

    // Design
    'figma': 'Design',
    'photoshop': 'Design',
    'illustrator': 'Design',
    'blender': 'Design'
  };

  /**
   * Infers Context Mode from process name or window title
   */
  public static detectMode(processName: string, windowTitle: string = ''): ContextMode {
    const cleanProc = processName.toLowerCase().replace(/\.exe$/, '').trim();
    if (this.appMap[cleanProc]) {
      return this.appMap[cleanProc];
    }

    const titleLower = windowTitle.toLowerCase();
    if (titleLower.includes('meet') || titleLower.includes('zoom') || titleLower.includes('call')) {
      return 'Meeting';
    }
    if (titleLower.includes('visual studio') || titleLower.includes('.ts') || titleLower.includes('.py')) {
      return 'Coding';
    }
    if (titleLower.includes('figma') || titleLower.includes('canvas')) {
      return 'Design';
    }

    return 'General';
  }
}
