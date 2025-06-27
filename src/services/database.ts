export interface CoffeeEntry {
  id?: number;
  date: string;
  time: string;
  type: string;
  size: string;
  brewingMethod: string;
  caffeine: number;
  notes?: string;
  createdAt?: string;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
}

class DatabaseService {
  private readonly COFFEE_ENTRIES_KEY = 'coffee_entries';
  private readonly SETTINGS_KEY = 'coffee_settings';
  private readonly DEFAULT_PASSCODE = 'coffee123';

  async init(): Promise<void> {
    // Initialize default settings if they don't exist
    const settings = this.getStoredSettings();
    if (!settings.admin_passcode) {
      await this.setSetting('admin_passcode', this.DEFAULT_PASSCODE);
    }
  }

  private getStoredEntries(): CoffeeEntry[] {
    try {
      const stored = localStorage.getItem(this.COFFEE_ENTRIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading coffee entries from localStorage:', error);
      return [];
    }
  }

  private saveEntries(entries: CoffeeEntry[]): void {
    try {
      localStorage.setItem(this.COFFEE_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving coffee entries to localStorage:', error);
      throw new Error('Failed to save coffee entries');
    }
  }

  private getStoredSettings(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading settings from localStorage:', error);
      return {};
    }
  }

  private saveSettings(settings: Record<string, string>): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      throw new Error('Failed to save settings');
    }
  }

  private generateId(): number {
    const entries = this.getStoredEntries();
    const maxId = entries.reduce((max, entry) => Math.max(max, entry.id || 0), 0);
    return maxId + 1;
  }

  async getAllEntries(): Promise<CoffeeEntry[]> {
    const entries = this.getStoredEntries();
    // Sort by date and time in descending order
    return entries.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });
  }

  async addEntry(entry: Omit<CoffeeEntry, 'id' | 'createdAt'>): Promise<number> {
    const entries = this.getStoredEntries();
    const newId = this.generateId();
    const newEntry: CoffeeEntry = {
      ...entry,
      id: newId,
      createdAt: new Date().toISOString()
    };
    
    entries.push(newEntry);
    this.saveEntries(entries);
    return newId;
  }

  async deleteEntry(id: number): Promise<void> {
    const entries = this.getStoredEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    this.saveEntries(filteredEntries);
  }

  async updateEntry(id: number, updatedEntry: Partial<CoffeeEntry>): Promise<void> {
    const entries = this.getStoredEntries();
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      throw new Error(`Entry with id ${id} not found`);
    }
    
    entries[entryIndex] = { ...entries[entryIndex], ...updatedEntry };
    this.saveEntries(entries);
  }

  async getSetting(key: string): Promise<string | null> {
    const settings = this.getStoredSettings();
    return settings[key] || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const settings = this.getStoredSettings();
    settings[key] = value;
    this.saveSettings(settings);
  }

  async close(): Promise<void> {
    // No cleanup needed for localStorage
    return Promise.resolve();
  }
}

export const databaseService = new DatabaseService();