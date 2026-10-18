/**
 * Smart Natural Language Interpreter for Raycast-style Command Palette
 * Parses math expressions, unit conversions, currency conversions, timers, reminders, and system intents.
 */

export interface InterpretedAction {
  type: 'math' | 'unit' | 'currency' | 'timer' | 'reminder' | 'translate' | 'define' | 'kill' | 'folder' | 'snap' | 'theme' | 'web';
  title: string;
  subtitle: string;
  resultValue?: string;
  category: 'Math' | 'Unit' | 'Currency' | 'Focus' | 'Task' | 'Language' | 'System' | 'Theme' | 'Web';
  icon: string;
  execute: () => void | Promise<void>;
}

// Offline currency exchange rates (against USD baseline)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  PKR: 278.5,
  INR: 83.4,
  JPY: 154.2,
  CAD: 1.36,
  AUD: 1.52,
  CNY: 7.24,
  CHF: 0.91,
  AED: 3.67,
  SAR: 3.75
};

// Unit conversion factors to standard SI units
const UNIT_FACTORS: Record<string, { base: string; factor: number }> = {
  // Length (base: meter)
  km: { base: 'm', factor: 1000 },
  m: { base: 'm', factor: 1 },
  cm: { base: 'm', factor: 0.01 },
  mm: { base: 'm', factor: 0.001 },
  mile: { base: 'm', factor: 1609.344 },
  miles: { base: 'm', factor: 1609.344 },
  foot: { base: 'm', factor: 0.3048 },
  feet: { base: 'm', factor: 0.3048 },
  ft: { base: 'm', factor: 0.3048 },
  inch: { base: 'm', factor: 0.0254 },
  inches: { base: 'm', factor: 0.0254 },
  in: { base: 'm', factor: 0.0254 },
  yard: { base: 'm', factor: 0.9144 },
  yards: { base: 'm', factor: 0.9144 },

  // Weight (base: kg)
  kg: { base: 'kg', factor: 1 },
  g: { base: 'kg', factor: 0.001 },
  mg: { base: 'kg', factor: 0.000001 },
  lb: { base: 'kg', factor: 0.453592 },
  lbs: { base: 'kg', factor: 0.453592 },
  oz: { base: 'kg', factor: 0.0283495 },

  // Data (base: MB)
  gb: { base: 'mb', factor: 1024 },
  mb: { base: 'mb', factor: 1 },
  tb: { base: 'mb', factor: 1048576 },
  kb: { base: 'mb', factor: 0.0009765625 }
};

export class SmartInterpreter {
  /**
   * Main entry point to interpret arbitrary user input
   */
  public static interpret(
    rawQuery: string,
    context: {
      onStartTimer?: (minutes: number) => void;
      onAddReminder?: (title: string, timeStr?: string) => void;
      onKillProcess?: (proc: string) => void;
      onOpenFolder?: (folder: string) => void;
      onSnap?: (dir: string) => void;
      onSetThemeMode?: (mode: 'dark' | 'light') => void;
      onSetAccent?: (color: string) => void;
    }
  ): InterpretedAction | null {
    const q = rawQuery.trim();
    if (!q) return null;

    // 1. Percentage Math: e.g. "15% of 850" or "20% off 100"
    const pctMatch = q.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:of|off)\s*(\d+(?:\.\d+)?)$/i);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const base = parseFloat(pctMatch[2]);
      const isOff = q.toLowerCase().includes('off');
      const val = isOff ? base - (base * pct) / 100 : (base * pct) / 100;
      const resStr = `${val}`;
      return {
        type: 'math',
        title: `= ${resStr}`,
        subtitle: isOff ? `${pct}% off ${base}` : `${pct}% of ${base}`,
        resultValue: resStr,
        category: 'Math',
        icon: 'Calculator',
        execute: () => {
          navigator.clipboard.writeText(resStr);
        }
      };
    }

    // 2. Mathematical Expression (e.g. "sqrt(144) + 12", "4 * (12 + 8)", "2^8")
    const mathCandidate = q.replace(/\^/g, '**');
    if (/^[0-9+\-*/().^%\s]|(?:sqrt|abs|round|floor|ceil|sin|cos|tan|log|pi|e)/i.test(mathCandidate)) {
      try {
        // Sanitize for safe execution
        if (!/[a-df-oq-z_$[\]]/i.test(mathCandidate)) {
          const evalExpr = mathCandidate
            .replace(/\bsqrt\b/gi, 'Math.sqrt')
            .replace(/\babs\b/gi, 'Math.abs')
            .replace(/\bround\b/gi, 'Math.round')
            .replace(/\bpi\b/gi, 'Math.PI')
            .replace(/\be\b/gi, 'Math.E');

          const evaluated = Function(`"use strict"; return (${evalExpr})`)();
          if (typeof evaluated === 'number' && !isNaN(evaluated) && isFinite(evaluated)) {
            const rounded = Math.round(evaluated * 1000000) / 1000000;
            const resStr = `${rounded}`;
            return {
              type: 'math',
              title: `= ${resStr}`,
              subtitle: `Calculated from "${q}" (Click to copy)`,
              resultValue: resStr,
              category: 'Math',
              icon: 'Calculator',
              execute: () => {
                navigator.clipboard.writeText(resStr);
              }
            };
          }
        }
      } catch {
        // Not a pure math expression, continue
      }
    }

    // 3. Unit Conversion (e.g. "100 km to miles", "50 kg to lbs", "32 c to f")
    const unitMatch = q.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)\s+(?:to|in)\s+([a-z]+)$/i);
    if (unitMatch) {
      const val = parseFloat(unitMatch[1]);
      const fromUnit = unitMatch[2].toLowerCase();
      const toUnit = unitMatch[3].toLowerCase();

      // Temperature special case
      if ((fromUnit === 'c' || fromUnit === 'celsius') && (toUnit === 'f' || toUnit === 'fahrenheit')) {
        const f = Math.round(((val * 9) / 5 + 32) * 100) / 100;
        const resStr = `${f} °F`;
        return {
          type: 'unit',
          title: resStr,
          subtitle: `${val} °C converted to Fahrenheit`,
          resultValue: resStr,
          category: 'Unit',
          icon: 'ArrowRightLeft',
          execute: () => navigator.clipboard.writeText(resStr)
        };
      }
      if ((fromUnit === 'f' || fromUnit === 'fahrenheit') && (toUnit === 'c' || toUnit === 'celsius')) {
        const c = Math.round((((val - 32) * 5) / 9) * 100) / 100;
        const resStr = `${c} °C`;
        return {
          type: 'unit',
          title: resStr,
          subtitle: `${val} °F converted to Celsius`,
          resultValue: resStr,
          category: 'Unit',
          icon: 'ArrowRightLeft',
          execute: () => navigator.clipboard.writeText(resStr)
        };
      }

      // Linear unit conversions
      const fromFactor = UNIT_FACTORS[fromUnit];
      const toFactor = UNIT_FACTORS[toUnit];
      if (fromFactor && toFactor && fromFactor.base === toFactor.base) {
        const inBase = val * fromFactor.factor;
        const converted = Math.round((inBase / toFactor.factor) * 10000) / 10000;
        const resStr = `${converted} ${toUnit}`;
        return {
          type: 'unit',
          title: resStr,
          subtitle: `${val} ${fromUnit} converted to ${toUnit}`,
          resultValue: resStr,
          category: 'Unit',
          icon: 'ArrowRightLeft',
          execute: () => navigator.clipboard.writeText(resStr)
        };
      }

      // Currency conversions (e.g. "100 usd to eur", "50 gbp to pkr")
      const fromCurr = fromUnit.toUpperCase();
      const toCurr = toUnit.toUpperCase();
      if (CURRENCY_RATES[fromCurr] && CURRENCY_RATES[toCurr]) {
        const valInUSD = val / CURRENCY_RATES[fromCurr];
        const converted = Math.round(valInUSD * CURRENCY_RATES[toCurr] * 100) / 100;
        const resStr = `${converted} ${toCurr}`;
        return {
          type: 'currency',
          title: resStr,
          subtitle: `${val} ${fromCurr} converted to ${toCurr}`,
          resultValue: resStr,
          category: 'Currency',
          icon: 'Coins',
          execute: () => navigator.clipboard.writeText(resStr)
        };
      }
    }

    // 4. Timer Command (e.g. "timer 15m", "timer 25", "timer 45 min")
    const timerMatch = q.match(/^timer\s+(\d+)\s*(m|min|s|sec|h|hr)?$/i);
    if (timerMatch) {
      const num = parseInt(timerMatch[1], 10);
      const unit = (timerMatch[2] || 'm').toLowerCase();
      const mins = unit.startsWith('s') ? Math.max(1, Math.round(num / 60)) : unit.startsWith('h') ? num * 60 : num;
      return {
        type: 'timer',
        title: `Start Focus Timer: ${mins} minutes`,
        subtitle: `Launch pomodoro countdown in Dynamic Island`,
        category: 'Focus',
        icon: 'Timer',
        execute: () => {
          if (context.onStartTimer) context.onStartTimer(mins);
        }
      };
    }

    // 5. Reminder Command (e.g. "remind me at 5pm to call Ali", "remind me to buy milk")
    const remindMatch = q.match(/^remind\s+(?:me\s+)?(?:at\s+([0-9ap:apm\s]+)\s+to\s+)?(.+)$/i);
    if (remindMatch) {
      const timePart = remindMatch[1]?.trim();
      const taskPart = remindMatch[2]?.trim();
      return {
        type: 'reminder',
        title: `Create Reminder: "${taskPart}"`,
        subtitle: timePart ? `Scheduled for ${timePart}` : 'Added to Tasks & Projects',
        category: 'Task',
        icon: 'BellRing',
        execute: () => {
          if (context.onAddReminder) context.onAddReminder(taskPart, timePart);
        }
      };
    }

    // 6. Kill Process Command (e.g. "kill chrome", "kill discord", "kill node")
    const killMatch = q.match(/^kill\s+([a-z0-9-_.]+)/i);
    if (killMatch) {
      const proc = killMatch[1].trim();
      return {
        type: 'kill',
        title: `Terminate Process: "${proc}"`,
        subtitle: `Force kill ${proc}.exe via PC Doctor`,
        category: 'System',
        icon: 'ZapOff',
        execute: () => {
          if (context.onKillProcess) context.onKillProcess(proc);
        }
      };
    }

    // 7. Open Folder Command (e.g. "open folder downloads", "open folder desktop")
    const folderMatch = q.match(/^open\s+folder\s+([a-z0-9-_ ]+)/i);
    if (folderMatch) {
      const folderName = folderMatch[1].trim();
      return {
        type: 'folder',
        title: `Open Folder: "${folderName}"`,
        subtitle: `Reveal ${folderName} in File Explorer`,
        category: 'System',
        icon: 'FolderOpen',
        execute: () => {
          if (context.onOpenFolder) context.onOpenFolder(folderName);
        }
      };
    }

    // 8. Snap Command (e.g. "snap left", "snap right", "snap max", "snap min")
    const snapMatch = q.match(/^snap\s+(left|right|top|bottom|max|min|center)/i);
    if (snapMatch) {
      const dir = snapMatch[1].toLowerCase();
      return {
        type: 'snap',
        title: `Snap Window: ${dir.toUpperCase()}`,
        subtitle: `Reposition active foreground window to ${dir}`,
        category: 'System',
        icon: 'Layout',
        execute: () => {
          if (context.onSnap) context.onSnap(dir);
        }
      };
    }

    // 9. Theme / Accent Command (e.g. "dark mode on", "light mode on", "accent cyan")
    if (/^(dark|light)\s+mode(?:\s+on)?$/i.test(q)) {
      const mode = q.toLowerCase().includes('dark') ? 'dark' : 'light';
      return {
        type: 'theme',
        title: `Switch Theme: ${mode.toUpperCase()} Mode`,
        subtitle: `Adjust Nova Dock styling to ${mode}`,
        category: 'Theme',
        icon: 'Palette',
        execute: () => {
          if (context.onSetThemeMode) context.onSetThemeMode(mode);
        }
      };
    }
    const accentMatch = q.match(/^accent\s+(violet|cyan|rose|green|amber|blue)/i);
    if (accentMatch) {
      const color = accentMatch[1].toLowerCase();
      return {
        type: 'theme',
        title: `Set Accent Color: ${color.toUpperCase()}`,
        subtitle: `Apply ${color} theme across Dynamic Island & glow highlights`,
        category: 'Theme',
        icon: 'Sparkles',
        execute: () => {
          if (context.onSetAccent) context.onSetAccent(color);
        }
      };
    }

    // 10. Translation Command (e.g. "translate hello to Urdu", "translate goodbye to Spanish")
    const transMatch = q.match(/^translate\s+(.+?)\s+to\s+([a-z]+)$/i);
    if (transMatch) {
      const textToTrans = transMatch[1];
      const targetLang = transMatch[2];
      return {
        type: 'translate',
        title: `Translate: "${textToTrans}" → ${targetLang}`,
        subtitle: `Send translation prompt to Nova AI Copilot`,
        category: 'Language',
        icon: 'Languages',
        execute: () => {
          window.open(`https://translate.google.com/?sl=auto&tl=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(textToTrans)}&op=translate`);
        }
      };
    }

    // 11. Define Word Command (e.g. "define serendipity", "define ephemeral")
    const defMatch = q.match(/^define\s+([a-z]+)$/i);
    if (defMatch) {
      const word = defMatch[1];
      return {
        type: 'define',
        title: `Define: "${word}"`,
        subtitle: `Look up dictionary meaning for ${word}`,
        category: 'Language',
        icon: 'BookOpen',
        execute: () => {
          window.open(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`);
        }
      };
    }

    return null;
  }
}
