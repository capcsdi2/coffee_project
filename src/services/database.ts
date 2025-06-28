import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export interface CoffeeEntry {
  id?: string;
  date: string;
  time: string;
  type: string;
  size: string;
  brewingMethod: string;
  caffeine: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Settings {
  id?: string;
  key: string;
  value: string;
  description?: string;
}

class DatabaseService {
  private readonly DEFAULT_PASSCODE = 'coffee123';

  async init(): Promise<void> {
    // Check if we have a valid session or if we need to sign in anonymously
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Sign in anonymously for demo purposes
      // In a real app, you'd implement proper authentication
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Error signing in anonymously:', error);
        throw new Error('Failed to initialize database connection');
      }
    }

    // Initialize default settings if they don't exist
    await this.initializeDefaultSettings();
  }

  private async initializeDefaultSettings(): Promise<void> {
    try {
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('key')
        .eq('key', 'admin_passcode')
        .single();

      if (!existingSettings) {
        await this.setSetting('admin_passcode', this.DEFAULT_PASSCODE);
      }
    } catch (error) {
      // Settings might not exist yet, which is fine
      console.log('Initializing default settings...');
    }
  }

  private convertFromDatabase(dbEntry: Database['public']['Tables']['coffee_entries']['Row']): CoffeeEntry {
    return {
      id: dbEntry.id,
      date: dbEntry.date,
      time: dbEntry.time,
      type: dbEntry.type,
      size: dbEntry.size,
      brewingMethod: dbEntry.brewing_method,
      caffeine: dbEntry.caffeine,
      notes: dbEntry.notes || undefined,
      createdAt: dbEntry.created_at,
      updatedAt: dbEntry.updated_at
    };
  }

  private convertToDatabase(entry: Omit<CoffeeEntry, 'id' | 'createdAt' | 'updatedAt'>): Database['public']['Tables']['coffee_entries']['Insert'] {
    return {
      date: entry.date,
      time: entry.time,
      type: entry.type,
      size: entry.size,
      brewing_method: entry.brewingMethod,
      caffeine: entry.caffeine,
      notes: entry.notes || null
    };
  }

  async getAllEntries(): Promise<CoffeeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('coffee_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        throw new Error('Failed to fetch coffee entries');
      }

      return data?.map(entry => this.convertFromDatabase(entry)) || [];
    } catch (error) {
      console.error('Error in getAllEntries:', error);
      throw error;
    }
  }

  async addEntry(entry: Omit<CoffeeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const dbEntry = this.convertToDatabase(entry);
      
      const { data, error } = await supabase
        .from('coffee_entries')
        .insert(dbEntry)
        .select('id')
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        throw new Error('Failed to add coffee entry');
      }

      return data.id;
    } catch (error) {
      console.error('Error in addEntry:', error);
      throw error;
    }
  }

  async deleteEntry(id: string | number): Promise<void> {
    try {
      const { error } = await supabase
        .from('coffee_entries')
        .delete()
        .eq('id', id.toString());

      if (error) {
        console.error('Error deleting entry:', error);
        throw new Error('Failed to delete coffee entry');
      }
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      throw error;
    }
  }

  async updateEntry(id: string | number, updatedEntry: Partial<CoffeeEntry>): Promise<void> {
    try {
      const updateData: Database['public']['Tables']['coffee_entries']['Update'] = {};
      
      if (updatedEntry.date) updateData.date = updatedEntry.date;
      if (updatedEntry.time) updateData.time = updatedEntry.time;
      if (updatedEntry.type) updateData.type = updatedEntry.type;
      if (updatedEntry.size) updateData.size = updatedEntry.size;
      if (updatedEntry.brewingMethod) updateData.brewing_method = updatedEntry.brewingMethod;
      if (updatedEntry.caffeine !== undefined) updateData.caffeine = updatedEntry.caffeine;
      if (updatedEntry.notes !== undefined) updateData.notes = updatedEntry.notes || null;

      const { error } = await supabase
        .from('coffee_entries')
        .update(updateData)
        .eq('id', id.toString());

      if (error) {
        console.error('Error updating entry:', error);
        throw new Error('Failed to update coffee entry');
      }
    } catch (error) {
      console.error('Error in updateEntry:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching setting:', error);
        throw new Error('Failed to fetch setting');
      }

      return data?.value || null;
    } catch (error) {
      console.error('Error in getSetting:', error);
      return null;
    }
  }

  async setSetting(key: string, value: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) {
        console.error('Error setting value:', error);
        throw new Error('Failed to save setting');
      }
    } catch (error) {
      console.error('Error in setSetting:', error);
      throw error;
    }
  }

  async getCoffeeTypes(): Promise<Array<{ name: string; caffeine: Record<string, number> }>> {
    try {
      const { data, error } = await supabase
        .from('coffee_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching coffee types:', error);
        throw new Error('Failed to fetch coffee types');
      }

      return data?.map(type => ({
        name: type.name,
        caffeine: {
          'Small': type.caffeine_per_small,
          'Medium': type.caffeine_per_medium,
          'Large': type.caffeine_per_large,
          'Extra Large': type.caffeine_per_extra_large
        }
      })) || [];
    } catch (error) {
      console.error('Error in getCoffeeTypes:', error);
      return [];
    }
  }

  async getBrewingMethods(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('brewing_methods')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching brewing methods:', error);
        throw new Error('Failed to fetch brewing methods');
      }

      return data?.map(method => method.name) || [];
    } catch (error) {
      console.error('Error in getBrewingMethods:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    // No cleanup needed for Supabase client
    return Promise.resolve();
  }
}

export const databaseService = new DatabaseService();