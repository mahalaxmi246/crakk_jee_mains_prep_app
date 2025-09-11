/*
  # Authentication System Tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users.id)
      - `email` (text, unique, not null)
      - `full_name` (text)
      - `avatar_url` (text)
      - `provider` (text)
      - `phone` (text)
      - `role` (text, default 'user')
      - `onboarded` (boolean, default false)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_login_at` (timestamptz)
    
    - `auth_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `event_type` (text, check constraint)
      - `ip` (text)
      - `user_agent` (text)
      - `created_at` (timestamptz)
    
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
      - `device_label` (text)
      - `last_seen_at` (timestamptz)
      - `ip` (text)
      - `user_agent` (text)
    
    - `user_consents`
      - `user_id` (uuid, primary key, foreign key to profiles.id)
      - `terms_version` (text)
      - `accepted_at` (timestamptz)
      - `marketing_opt_in` (boolean, default false)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Create indexes for performance

  3. Functions
    - Auto-create profile on user signup
    - Track authentication events
    - Manage user sessions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  provider text DEFAULT 'email',
  phone text,
  role text DEFAULT 'user',
  onboarded boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz DEFAULT now()
);

-- Create auth_events table
CREATE TABLE IF NOT EXISTS auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('signup', 'signin', 'signout', 'password_reset')),
  ip text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  device_label text,
  last_seen_at timestamptz DEFAULT now(),
  ip text,
  user_agent text
);

-- Create user_consents table
CREATE TABLE IF NOT EXISTS user_consents (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  terms_version text DEFAULT '1.0',
  accepted_at timestamptz DEFAULT now(),
  marketing_opt_in boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_events_user_created ON auth_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_last_seen ON user_sessions(user_id, last_seen_at DESC);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for auth_events
CREATE POLICY "Users can view own auth events"
  ON auth_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage auth events"
  ON auth_events
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for user_consents
CREATE POLICY "Users can view own consents"
  ON user_consents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own consents"
  ON user_consents
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage consents"
  ON user_consents
  FOR ALL
  TO service_role
  USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email')
  );
  
  -- Record signup event
  INSERT INTO auth_events (user_id, event_type, ip, user_agent)
  VALUES (
    NEW.id,
    'signup',
    COALESCE(NEW.raw_user_meta_data->>'ip', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_agent', '')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();