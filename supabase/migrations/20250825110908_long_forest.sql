/*
  # Fix Auth Events RLS Policy

  1. Security Updates
    - Update RLS policy for `auth_events` table to allow authenticated users to insert their own events
    - Allow service role to manage all auth events
    - Users can only insert events where user_id matches their auth.uid()

  2. Changes
    - Drop existing restrictive INSERT policy
    - Create new policy allowing authenticated users to insert their own events
    - Maintain existing SELECT policies for security
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Service role can manage auth events" ON auth_events;
DROP POLICY IF EXISTS "Users can view own auth events" ON auth_events;

-- Create comprehensive policies for auth_events
CREATE POLICY "Service role can manage auth events"
  ON auth_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own auth events"
  ON auth_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own auth events"
  ON auth_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;