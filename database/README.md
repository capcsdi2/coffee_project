# Coffee Tracker Database

This directory contains the database schema and related files for the Coffee Consumption Dashboard.

## Files

- `schema.sql` - Complete database schema with tables, indexes, and sample data
- `README.md` - This documentation file

## Database Structure

### Tables

#### coffee_entries
Stores individual coffee consumption records with the following fields:
- `id` - Auto-incrementing primary key
- `date` - Date of consumption (YYYY-MM-DD format)
- `time` - Time of consumption (HH:MM format)
- `type` - Type of coffee (Espresso, Americano, Latte, etc.)
- `size` - Size of the coffee (Small, Medium, Large, Extra Large)
- `brewing_method` - Method used to brew the coffee
- `caffeine` - Caffeine content in milligrams
- `notes` - Optional notes about the coffee
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

#### settings
Stores application configuration settings:
- `id` - Auto-incrementing primary key
- `key` - Setting key (unique)
- `value` - Setting value
- `created_at` - Timestamp when setting was created
- `updated_at` - Timestamp when setting was last updated

## Setup Instructions

1. Create a new SQLite database file
2. Run the `schema.sql` file to create the tables and initial data:
   ```bash
   sqlite3 coffee_tracker.db < schema.sql
   ```

## Default Settings

- **Admin Passcode**: `coffee123` (can be changed through the admin panel)

## Sample Data

The schema includes sample coffee entries for demonstration purposes. Remove the sample data INSERT statements in production.

## Security Notes

- The admin passcode is stored in the settings table
- In a production environment, consider hashing the passcode
- Regularly backup your database file
- Ensure proper file permissions on the database file

## Indexes

The schema includes indexes on frequently queried columns:
- `coffee_entries.date` - For date-based filtering
- `coffee_entries.type` - For coffee type analysis
- `coffee_entries.created_at` - For chronological sorting
- `settings.key` - For settings lookup

## Triggers

Automatic timestamp updates are handled by database triggers:
- `update_coffee_entries_timestamp` - Updates `updated_at` when records are modified
- `update_settings_timestamp` - Updates `updated_at` when settings are modified