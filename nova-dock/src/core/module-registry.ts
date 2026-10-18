import { NovaModule, PluginContext } from '../types/module';
import { CommandItem } from '../types';

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, NovaModule> = new Map();
  private enabledModuleIds: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  public register(mod: NovaModule): void {
    if (this.modules.has(mod.id)) {
      console.warn(`[ModuleRegistry] Module ${mod.id} is already registered. Overwriting.`);
    }
    this.modules.set(mod.id, mod);
    this.enabledModuleIds.add(mod.id);
  }

  public unregister(id: string): void {
    this.modules.delete(id);
    this.enabledModuleIds.delete(id);
  }

  public getModule(id: string): NovaModule | undefined {
    return this.modules.get(id);
  }

  public getAllModules(): NovaModule[] {
    return Array.from(this.modules.values());
  }

  public getEnabledModules(): NovaModule[] {
    return Array.from(this.modules.values()).filter(m => this.enabledModuleIds.has(m.id));
  }

  public setModuleEnabled(id: string, enabled: boolean): void {
    if (enabled) {
      this.enabledModuleIds.add(id);
    } else {
      this.enabledModuleIds.delete(id);
    }
  }

  public async initAll(context: PluginContext): Promise<void> {
    for (const mod of this.getEnabledModules()) {
      if (mod.init) {
        try {
          await mod.init(context);
        } catch (err) {
          console.error(`[ModuleRegistry] Failed to init module "${mod.id}":`, err);
        }
      }
    }
  }

  public getAllCommands(context: PluginContext): CommandItem[] {
    const commands: CommandItem[] = [];
    for (const mod of this.getEnabledModules()) {
      if (mod.getCommands) {
        try {
          commands.push(...mod.getCommands(context));
        } catch (err) {
          console.error(`[ModuleRegistry] Error retrieving commands from "${mod.id}":`, err);
        }
      }
    }
    return commands;
  }
}
