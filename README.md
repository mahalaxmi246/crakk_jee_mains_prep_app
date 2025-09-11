@@ .. @@
 # Crakk - JEE Preparation Educational App

 A comprehensive JEE preparation platform built with React, TypeScript, and Tailwind CSS.

+## ⚠️ Authentication Status
+
+**Authentication is currently DISABLED.** This includes:
+- Google OAuth login/signup
+- User profiles and sessions
+- Protected routes
+
+To re-enable authentication, see [`docs/auth-rollback.md`](./docs/auth-rollback.md).
+
 ## Features

 - **Daily Practice Problems (DPPs)** - Subject-wise practice with progress tracking
@@ .. @@
 - **Previous Year Questions (PYQs)** - Solve questions from JEE Main & Advanced
 - **AI-Powered Chatbots** - Get help with doubts, generate questions, and more
 - **Contests** - Compete with other JEE aspirants
-- **User Authentication** - Secure login with Google OAuth
+- **User Authentication** - ~~Secure login with Google OAuth~~ (Currently disabled)
 - **Progress Tracking** - Monitor your preparation journey

 ## Tech Stack
@@ .. @@
 - **Frontend**: React 18, TypeScript, Tailwind CSS
 - **Build Tool**: Vite
 - **Routing**: React Router v6
-- **Authentication**: Supabase Auth with Google OAuth
-- **Database**: Supabase (PostgreSQL)
+- **Authentication**: ~~Supabase Auth with Google OAuth~~ (Disabled)
+- **Database**: ~~Supabase (PostgreSQL)~~ (Client stubbed)
 - **Icons**: Lucide React

 ## Getting Started

@@ .. @@
 npm run dev
 ```

-4. Set up your environment variables in `.env`:
-
-```env
-VITE_SUPABASE_URL=your_supabase_project_url
-VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
-```
+4. The app will run without any environment variables since auth is disabled.

 ## Available Scripts

@@ .. @@
 - `npm run preview` - Preview the production build locally
 - `npm run lint` - Run ESLint for code quality checks

+## Re-enabling Authentication
+
+Authentication has been disabled for this deployment. To re-enable:
+
+1. Follow the guide in [`docs/auth-rollback.md`](./docs/auth-rollback.md)
+2. Set up Supabase project and Google OAuth
+3. Add environment variables
+4. Restore auth components and routes
+
 ## Project Structure

 ```
@@ .. @@
 ├── src/
 │   ├── components/     # Reusable UI components
 │   ├── contexts/       # React contexts (Auth, etc.)
-│   ├── pages/          # Page components
+│   ├── pages/          # Page components  
 │   ├── lib/            # Utility libraries and configurations
+│   ├── utils/          # Helper utilities
 │   └── types/          # TypeScript type definitions
+├── docs/               # Documentation
+│   └── auth-rollback.md # Guide to re-enable authentication
 ├── public/             # Static assets
-└── supabase/           # Supabase migrations and config
+└── supabase/           # Supabase migrations (preserved)
 ```

 ## Contributing