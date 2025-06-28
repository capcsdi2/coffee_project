/*
  # Fix Settings Table RLS Policies

  1. Security Changes
    - Add policy for anonymous users to read global settings (like admin_passcode)
    - Add policy for anonymous users to insert/update global settings
    - Maintain existing authenticated user policies for user-specific settings

  2. Changes Made
    - Allow anonymous access to settings where user_id is NULL (global settings)
    - Keep existing policies for user-specific settings intact
*/

-- Allow anonymous users to read global settings (where user_id is NULL)
CREATE POLICY "Anonymous users can read global settings"
  ON settings
  FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- Allow anonymous users to insert global settings (where user_id is NULL)
CREATE POLICY "Anonymous users can insert global settings"
  ON settings
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Allow anonymous users to update global settings (where user_id is NULL)
CREATE POLICY "Anonymous users can update global settings"
  ON settings
  FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);