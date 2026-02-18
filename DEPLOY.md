# Summer Ball Portal — Deployment Guide

## Overview

Summer Ball Portal is a two-sided marketplace for summer collegiate baseball, connecting Players, College Coaches, and Summer Ball Programs.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Postgres, Storage)
- **Deployment**: Vercel

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose a name (e.g., `summer-ball-portal`) and a strong database password
4. Select a region close to your users
5. Click **Create new project** and wait for it to provision

---

## Step 2: Run SQL Migrations

1. In your Supabase Dashboard, go to **SQL Editor**
2. Open the file `db/schema.sql` from this repository
3. Copy the entire SQL contents and paste into the SQL Editor
4. Click **Run** to create all tables, RLS policies, and indexes

This creates the following tables:
- `profiles` — links to `auth.users`, stores role (player/coach/program)
- `player_profiles` — player details, stats, metrics, media
- `program_listings` — summer program details, fees, positions needed
- `coach_profiles` — college coach details

---

## Step 3: Configure Storage Buckets

1. In your Supabase Dashboard, go to **Storage**
2. Create two buckets:
   - **`avatars`** — for player headshot photos
   - **`logos`** — for program logos
3. For each bucket:
   - Click the bucket name → **Policies**
   - Add a policy for **SELECT** (public read):
     - Name: `Public read access`
     - Policy: `true` (allow all)
   - Add a policy for **INSERT** (authenticated upload):
     - Name: `Authenticated upload`
     - Policy: `auth.role() = 'authenticated'`
   - Add a policy for **UPDATE** (authenticated update):
     - Name: `Authenticated update`
     - Policy: `auth.role() = 'authenticated'`
4. Under bucket settings, toggle **Public bucket** to ON for both buckets

---

## Step 4: Set RLS Policies

RLS policies are included in the `db/schema.sql` migration. They enforce:

- **Profiles**: Everyone can read; users can only insert/update their own profile
- **Player Profiles**: Everyone can read; players can edit their own profile; coaches can manage players they uploaded
- **Program Listings**: Everyone can read; program owners can create/edit/delete their own listings
- **Coach Profiles**: Everyone can read; coaches can only edit their own profile

---

## Step 5: Configure Supabase Auth

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Under **Authentication** → **URL Configuration**:
   - Set **Site URL** to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**

---

## Step 6: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Push this repository to GitHub (or fork it)
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repository
4. In **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   (Find these in Supabase Dashboard → **Settings** → **API**)
5. Click **Deploy**

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

---

## Environment Variables

| Variable | Description | Where to find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |

---

## Local Development

```bash
# Clone the repo
git clone <your-repo-url>
cd SummerBallPortalV1

# Install dependencies
npm install

# Create .env.local with your Supabase credentials
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with Nav, Footer, Toaster
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind base styles
│   ├── auth/
│   │   ├── login/page.tsx      # Login form
│   │   ├── signup/page.tsx     # Signup with role selector
│   │   └── callback/route.ts   # Auth callback handler
│   ├── dashboard/
│   │   ├── page.tsx            # Role-based redirect
│   │   ├── layout.tsx          # Dashboard wrapper
│   │   ├── player/page.tsx     # Player profile editor
│   │   ├── program/page.tsx    # Program listing editor
│   │   └── coach/page.tsx      # Coach dashboard + bulk upload
│   ├── players/
│   │   ├── page.tsx            # Player search/browse
│   │   └── [id]/page.tsx       # Player profile detail
│   ├── programs/
│   │   ├── page.tsx            # Program search/browse
│   │   └── [id]/page.tsx       # Program detail
│   └── settings/page.tsx       # Account settings
├── components/
│   ├── nav.tsx                 # Navigation bar
│   ├── footer.tsx              # Site footer
│   └── ui/                     # Reusable UI components
├── lib/supabase/
│   ├── client.ts               # Browser Supabase client
│   └── server.ts               # Server Supabase client
├── types/index.ts              # TypeScript types & constants
├── db/schema.sql               # Database migration SQL
└── middleware.ts               # Auth middleware
```

---

## User Flows

1. **Landing Page** → Clear CTAs for each role
2. **Sign Up** → Pick role (Player/Coach/Program) → Create account
3. **Player** → Edit profile → Browse programs → Contact programs
4. **Program** → Create listing → Browse players → Contact players
5. **Coach** → Set up profile → Add players manually or via CSV bulk upload
6. **Contact** → Login-gated; reveals email/phone with mailto link

---

## Future Enhancements

- [ ] Stripe payments / premium features
- [ ] In-app messaging system
- [ ] Player consent flow for coach uploads
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced search/filtering
- [ ] Profile completeness indicator
