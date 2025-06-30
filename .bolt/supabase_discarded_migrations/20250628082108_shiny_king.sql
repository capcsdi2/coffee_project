/*
  # Coffee Tracker Database Schema

  1. New Tables
    - `coffee_entries`
      - `id` (uuid, primary key)
      - `date` (date)
      - `time` (time)
      - `type` (text)
      - `size` (text with check constraint)
      - `brewing_method` (text)
      - `caffeine` (integer with check constraint)
      - `notes` (text, optional)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `description` (text, optional)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add policies for anonymous users to access global settings

  3. Sample Data
    - Default admin passcode setting
    - Sample coffee entries for demonstration
*/

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coffee_entries_date ON coffee_entries(date);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_user_date ON coffee_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_type ON coffee_entries(type);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_created_at ON coffee_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_user_key ON settings(user_id, key);

-- Enable Row Level Security
ALTER TABLE coffee_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

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

-- Settings policies for authenticated users
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

-- Settings policies for anonymous users (global settings)
CREATE POLICY "Anonymous users can read global settings"
    ON settings
    FOR SELECT
    TO anon
    USING (user_id IS NULL);

CREATE POLICY "Anonymous users can insert global settings"
    ON settings
    FOR INSERT
    TO anon
    WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can update global settings"
    ON settings
    FOR UPDATE
    TO anon
    USING (user_id IS NULL)
    WITH CHECK (user_id IS NULL);

-- Create function for automatic timestamp updates
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

-- Insert default admin passcode setting (global setting with user_id = NULL)
INSERT INTO settings (key, value, description, user_id) VALUES 
    ('admin_passcode', 'coffee123', 'Default admin passcode for system access', NULL)
ON CONFLICT (key) DO NOTHING;

-- Insert sample data for demonstration (optional - remove in production)
INSERT INTO coffee_entries (date, time, type, size, brewing_method, caffeine, notes, user_id) VALUES
    ('2024-01-15', '08:30', 'Americano', 'Medium', 'Espresso Machine', 154, 'Morning coffee to start the day', NULL),
    ('2024-01-15', '14:00', 'Latte', 'Large', 'Espresso Machine', 192, 'Afternoon pick-me-up', NULL),
    ('2024-01-14', '09:00', 'Espresso', 'Small', 'Espresso Machine', 63, 'Quick shot before meeting', NULL),
    ('2024-01-14', '15:30', 'Cold Brew', 'Large', 'Cold Brew', 308, 'Refreshing afternoon drink', NULL),
    ('2024-01-13', '07:45', 'Drip Coffee', 'Medium', 'Drip', 190, 'Classic morning brew', NULL),
    ('2024-01-13', '13:15', 'Cappuccino', 'Medium', 'Espresso Machine', 128, 'Post-lunch coffee', NULL),
    ('2024-01-12', '08:15', 'Mocha', 'Large', 'Espresso Machine', 255, 'Weekend treat', NULL),
    ('2024-01-11', '09:30', 'Pour Over', 'Medium', 'Pour Over', 180, 'Slow morning ritual', NULL),
    ('2024-01-11', '16:00', 'Macchiato', 'Small', 'Espresso Machine', 64, 'Late afternoon boost', NULL),
    ('2024-01-10', '08:00', 'Americano', 'Large', 'Espresso Machine', 231, 'Strong start to the day', NULL)
ON CONFLICT DO NOTHING;