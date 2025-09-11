/*
  # Fix User Sessions RLS Policy

  1. Security Updates
    - Add INSERT policy for user_sessions table
    - Allow authenticated users to create their own sessions
    - Maintain existing SELECT policy for users to view own sessions
    - Keep service role full access policy

  2. Policy Structure
    - INSERT: Users can create sessions where user_id matches their auth.uid()
    - SELECT: Users can view their own sessions
    - Service role: Full access for backend operations
*/

-- Add INSERT policy for user_sessions
CREATE POLICY "Users can create own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());