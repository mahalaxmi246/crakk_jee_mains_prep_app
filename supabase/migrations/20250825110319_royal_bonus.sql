/*
  # Fix handle_new_user trigger for signup

  1. Updates
    - Fix the handle_new_user trigger function to properly handle new user creation
    - Ensure all required fields are populated with safe defaults
    - Add proper error handling and logging
    
  2. Changes
    - Update trigger function to use auth.users data properly
    - Set safe defaults for all non-nullable columns
    - Handle edge cases where user data might be missing
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with safe defaults
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    provider,
    phone,
    role,
    onboarded,
    metadata,
    created_at,
    updated_at,
    last_login_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    COALESCE(NEW.phone, NULL),
    'user',
    false,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    NOW(),
    NOW(),
    NOW()
  );

  -- Insert signup event
  INSERT INTO public.auth_events (
    user_id,
    event_type,
    ip,
    user_agent,
    created_at
  )
  VALUES (
    NEW.id,
    'signup',
    NULL, -- IP will be set by application layer
    NULL, -- User agent will be set by application layer
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;