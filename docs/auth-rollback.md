# Authentication Rollback Guide

This document explains how to re-enable authentication after it has been disabled.

## Overview

Authentication was disabled to disconnect from Supabase Auth and Google OAuth. This guide will help you restore full authentication functionality.

## Steps to Re-enable Authentication

### 1. Environment Variables

Add these environment variables back to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Console Setup

1. **Go to Supabase Dashboard → Authentication → Providers**
2. **Enable Google Provider:**
   - Toggle "Enable Google provider" to ON
   - Add your Google OAuth client ID and secret
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5180/auth/callback` (for development)

3. **Go to Authentication → Settings**
   - Toggle "Disable new user signups" to OFF (allow signups)

### 3. Google Cloud Console Setup

1. **Go to Google Cloud Console → APIs & Services → Credentials**
2. **Create OAuth 2.0 Client ID:**
   - Application type: Web application
   - Name: "Crakk JEE App"
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
3. **Copy Client ID and Client Secret** to Supabase provider settings

### 4. Code Changes

#### Restore AuthContext
Replace `src/contexts/AuthContext.tsx` with the original implementation that includes:
- `useEffect` for auth state changes
- Real `signOut` functionality
- Session management

#### Restore Auth Pages
1. **Restore Login page** (`src/pages/Login.tsx`)
2. **Restore Profile page** (`src/pages/Profile.tsx`) 
3. **Restore AuthCallback page** (`src/pages/AuthCallback.tsx`)
4. **Restore ProtectedRoute component** (`src/components/ProtectedRoute.tsx`)

#### Update App.tsx
- Remove `AuthDisabledPage` import
- Restore original auth routes:
  ```tsx
  <Route path="/login" element={<Login />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  ```
- Remove dev banner for auth disabled

#### Update Navbar
- Restore auth buttons (Login/Profile)
- Re-add `useAuth` hook usage
- Show user state conditionally

#### Restore Supabase Client
Replace `src/lib/supabaseClient.ts` with real Supabase configuration:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 5. Component Updates

Update components that check auth state:
- `src/pages/Contests.tsx` - restore `useAuth` hook
- `src/pages/ReferEarn.tsx` - restore `useAuth` hook
- Any other components using auth

### 6. Testing

1. **Start development server:** `npm run dev`
2. **Test Google OAuth flow:**
   - Click "Login with Google"
   - Complete OAuth flow
   - Verify user session persists
3. **Test logout functionality**
4. **Test protected routes**

## Security Notes

- Rotate Supabase keys after re-enabling if they were exposed
- Ensure redirect URIs match exactly between Google and Supabase
- Test in both development and production environments

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check Google OAuth client redirect URIs match Supabase exactly
   - Ensure no trailing slashes

2. **"Invalid client ID"**
   - Verify Google client ID is correctly set in Supabase provider settings
   - Check environment variables are loaded

3. **Session not persisting**
   - Check Supabase client configuration
   - Verify auth state change listeners are working

### Getting Help

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors
3. Verify all environment variables are set correctly

## Commit Message

When re-enabling auth, use this commit message:
```
feat: re-enable authentication with Supabase and Google OAuth

- Restore AuthContext with session management
- Re-add login, profile, and callback pages
- Update Supabase client configuration
- Enable Google OAuth provider in Supabase
- Add environment variables for auth
```