import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      coffee_entries: {
        Row: {
          id: string;
          date: string;
          time: string;
          type: string;
          size: string;
          brewing_method: string;
          caffeine: number;
          notes: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          time: string;
          type: string;
          size: string;
          brewing_method: string;
          caffeine: number;
          notes?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          time?: string;
          type?: string;
          size?: string;
          brewing_method?: string;
          caffeine?: number;
          notes?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          description: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          description?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          description?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      coffee_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          caffeine_per_small: number;
          caffeine_per_medium: number;
          caffeine_per_large: number;
          caffeine_per_extra_large: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      brewing_methods: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          typical_brew_time_minutes: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}