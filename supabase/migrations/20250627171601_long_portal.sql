/*
  # Complete Coffee Tracker Database Schema

  This migration creates all required tables for the Coffee Consumption Dashboard application.
  
  ## Tables Created:
  1. **coffee_entries** - Stores individual coffee consumption records
  2. **settings** - Stores application configuration settings
  3. **user_preferences** - Stores user-specific preferences and settings
  4. **coffee_types** - Reference table for coffee types with caffeine content
  5. **brewing_methods** - Reference table for brewing methods
  
  ## Features:
  - Comprehensive data structure for coffee tracking
  - Reference tables for data consistency
  - Proper indexes for optimal performance
  - Row Level Security (RLS) enabled
  - Automatic timestamp management
  - Sample data for demonstration
*/

-- Enable Row Level Security
ALTER TABLE IF EXISTS coffee_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;

-- Create coffee_entries table for storing coffee consumption records
CREATE TABLE IF NOT EXISTS coffee_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    time time NOT NULL,
    type text NOT NULL,
    size text NOT NULL CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large')),
    brewing_method text NOT NULL,
    caffeine integer NOT NULL CHECK (caffeine >= 0),
    notes text,
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create settings table for storing application configuration
CREATE TABLE IF NOT EXISTS settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table for user-specific settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
    preference_key text NOT NULL,
    preference_value jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, preference_key)
);

-- Create coffee_types reference table
CREATE TABLE IF NOT EXISTS coffee_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    caffeine_per_small integer NOT NULL DEFAULT 0,
    caffeine_per_medium integer NOT NULL DEFAULT 0,
    caffeine_per_large integer NOT NULL DEFAULT 0,
    caffeine_per_extra_large integer NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create brewing_methods reference table
CREATE TABLE IF NOT EXISTS brewing_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    typical_brew_time_minutes integer,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coffee_entries_date ON coffee_entries(date);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_user_date ON coffee_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_type ON coffee_entries(type);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_created_at ON coffee_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_id, key);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_key ON user_preferences(user_id, preference_key);
CREATE INDEX IF NOT EXISTS idx_coffee_types_name ON coffee_types(name);
CREATE INDEX IF NOT EXISTS idx_brewing_methods_name ON brewing_methods(name);

-- Row Level Security Policies

-- Coffee entries policies
CREATE POLICY "Users can read own coffee entries"
    ON coffee_entries
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coffee entries"
    ON coffee_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coffee entries"
    ON coffee_entries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own coffee entries"
    ON coffee_entries
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can read own settings"
    ON settings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings"
    ON settings
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences"
    ON user_preferences
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Reference tables - allow read access to all authenticated users
CREATE POLICY "Authenticated users can read coffee types"
    ON coffee_types
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read brewing methods"
    ON brewing_methods
    FOR SELECT
    TO authenticated
    USING (true);

-- Enable RLS on all tables
ALTER TABLE coffee_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE brewing_methods ENABLE ROW LEVEL SECURITY;

-- Insert default coffee types with caffeine content
INSERT INTO coffee_types (name, description, caffeine_per_small, caffeine_per_medium, caffeine_per_large, caffeine_per_extra_large) VALUES
    ('Espresso', 'Strong concentrated coffee', 63, 94, 125, 156),
    ('Americano', 'Espresso with hot water', 77, 154, 231, 308),
    ('Latte', 'Espresso with steamed milk', 64, 128, 192, 256),
    ('Cappuccino', 'Espresso with steamed milk and foam', 64, 128, 192, 256),
    ('Macchiato', 'Espresso with a dollop of steamed milk', 64, 128, 192, 256),
    ('Mocha', 'Espresso with chocolate and steamed milk', 95, 175, 255, 335),
    ('Cold Brew', 'Coffee brewed with cold water over time', 103, 205, 308, 410),
    ('Drip Coffee', 'Traditional filtered coffee', 95, 190, 285, 380)
ON CONFLICT (name) DO NOTHING;

-- Insert default brewing methods
INSERT INTO brewing_methods (name, description, typical_brew_time_minutes) VALUES
    ('Espresso Machine', 'High-pressure brewing method', 1),
    ('French Press', 'Immersion brewing with metal filter', 4),
    ('Pour Over', 'Manual brewing with paper filter', 3),
    ('Cold Brew', 'Long extraction with cold water', 720),
    ('Drip', 'Automatic drip coffee maker', 5),
    ('Aeropress', 'Pressure brewing with paper filter', 2)
ON CONFLICT (name) DO NOTHING;

-- Insert default system settings
INSERT INTO settings (key, value, description) VALUES
    ('admin_passcode', 'coffee123', 'Default admin passcode for system access'),
    ('daily_caffeine_limit', '400', 'Recommended daily caffeine limit in mg'),
    ('app_version', '1.0.0', 'Current application version'),
    ('maintenance_mode', 'false', 'System maintenance mode flag')
ON CONFLICT (key) DO NOTHING;

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_coffee_entries_updated_at
    BEFORE UPDATE ON coffee_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coffee_types_updated_at
    BEFORE UPDATE ON coffee_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brewing_methods_updated_at
    BEFORE UPDATE ON brewing_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();