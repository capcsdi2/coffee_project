/*
  # Coffee Tracker Database Schema

  This file contains the SQL schema for the Coffee Consumption Dashboard application.
  
  ## Tables Created:
  1. **coffee_entries** - Stores individual coffee consumption records
  2. **settings** - Stores application settings including admin passcode
  
  ## Features:
  - Auto-incrementing IDs for all tables
  - Timestamps for tracking when records were created/updated
  - Proper data types for all fields
  - Default values where appropriate
  - Indexes for better query performance
*/

-- Create coffee_entries table for storing coffee consumption records
CREATE TABLE IF NOT EXISTS coffee_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT NOT NULL,
    brewing_method TEXT NOT NULL,
    caffeine INTEGER NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table for storing application configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coffee_entries_date ON coffee_entries(date);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_type ON coffee_entries(type);
CREATE INDEX IF NOT EXISTS idx_coffee_entries_created_at ON coffee_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Insert default admin passcode setting
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_passcode', 'coffee123');

-- Insert sample data for demonstration (optional - remove in production)
INSERT OR IGNORE INTO coffee_entries (date, time, type, size, brewing_method, caffeine, notes) VALUES
    ('2024-01-15', '08:30', 'Americano', 'Medium', 'Espresso Machine', 154, 'Morning coffee to start the day'),
    ('2024-01-15', '14:00', 'Latte', 'Large', 'Espresso Machine', 192, 'Afternoon pick-me-up'),
    ('2024-01-14', '09:00', 'Espresso', 'Small', 'Espresso Machine', 63, 'Quick shot before meeting'),
    ('2024-01-14', '15:30', 'Cold Brew', 'Large', 'Cold Brew', 308, 'Refreshing afternoon drink'),
    ('2024-01-13', '07:45', 'Drip Coffee', 'Medium', 'Drip', 190, 'Classic morning brew'),
    ('2024-01-13', '13:15', 'Cappuccino', 'Medium', 'Espresso Machine', 128, 'Post-lunch coffee'),
    ('2024-01-12', '08:15', 'Mocha', 'Large', 'Espresso Machine', 255, 'Weekend treat'),
    ('2024-01-11', '09:30', 'Pour Over', 'Medium', 'Pour Over', 180, 'Slow morning ritual'),
    ('2024-01-11', '16:00', 'Macchiato', 'Small', 'Espresso Machine', 64, 'Late afternoon boost'),
    ('2024-01-10', '08:00', 'Americano', 'Large', 'Espresso Machine', 231, 'Strong start to the day');

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_coffee_entries_timestamp 
    AFTER UPDATE ON coffee_entries
BEGIN
    UPDATE coffee_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
    AFTER UPDATE ON settings
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;