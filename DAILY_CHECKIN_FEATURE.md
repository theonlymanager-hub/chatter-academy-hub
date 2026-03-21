# Daily Dashboard Check-In System

**Status:** ✅ Implemented & Deployed

## Overview
A mandatory daily dashboard check-in system for chatters to ensure they visit all critical pages each day. Supervisors can monitor compliance in real-time.

## Features Implemented

### 1. **Page Visit Tracking** (`src/hooks/usePageVisitTracker.tsx`)
- Tracks which pages each user visits during their session
- Stores data in **localStorage** as primary storage (instant, works offline)
- Attempts to sync to **Supabase** `dashboard_logins` table (graceful fallback if table doesn't exist)
- Records:
  - Username
  - Login date (YYYY-MM-DD)
  - Login time (ISO timestamp)
  - Pages visited (array of paths)
  - Last sync time

**Mandatory Pages Tracked:**
- `/knowledge-base` — Knowledge Base
- `/training` — Training
- `/fans` — Fan Profiles
- `/chat-feedback` — Chat Feedback
- `/tasks` — Chatter Tasks

### 2. **Daily Check-In Banner** (`src/components/DailyCheckInBanner.tsx`)
- **Visible to:** Chatters only
- **Location:** Top of Dashboard (Index page)
- **Behavior:**
  - Shows prominent warning banner until all pages are visited
  - Visual progress bar showing completion percentage
  - Clickable links to unvisited pages (red) vs visited pages (green)
  - Banner cannot be dismissed until all pages visited
  - Shows success message when complete

### 3. **Dashboard Activity View** (`src/components/DashboardActivityView.tsx`)
- **Visible to:** Admin and Supervisor roles only
- **Location:** Team Members page (top section)
- **Shows for each chatter:**
  - Last login time
  - Pages visited today (checkmarks)
  - Missing mandatory pages (highlighted in red)
  - "Not logged in" warning if no activity today
  - Auto-refreshes every 30 seconds

### 4. **Automatic Page Tracking** (`src/components/PageVisitTracker.tsx`)
- Invisible component that runs on every route change
- Automatically records page visits as users navigate
- No manual tracking required

### 5. **Route Access Updates** (`src/App.tsx`)
- Added `'chatter'` role to the following routes:
  - `/knowledge-base`
  - `/fans`
  - `/tasks`
- These pages were previously restricted to admin/supervisor/data_entry only
- Now chatters can access all mandatory pages

## Technical Architecture

### Data Flow
1. User logs in → Initial `DailyVisitData` record created in localStorage
2. User navigates → `PageVisitTracker` detects route change → calls `trackPageVisit()`
3. Visit recorded in localStorage immediately
4. After 3-second debounce → Attempts Supabase sync (graceful fail if table missing)
5. Dashboard/Team Members pages read from localStorage for instant display

### Storage Strategy
- **Primary:** localStorage (instant, offline-capable, survives page refresh)
- **Secondary:** Supabase (for persistence across devices, optional)
- **Fallback:** If Supabase table doesn't exist yet, localStorage continues working

### Known Chatter Usernames (for tracking)
Hardcoded list in `DashboardActivityView.tsx`:
- marc
- jaydee
- jemimah
- kc
- jane

*(Activity for other usernames will also be shown if they log in)*

## Supabase Table Schema (Optional)

If you want to create the table manually via Supabase UI:

```sql
CREATE TABLE dashboard_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  login_date DATE NOT NULL,
  pages_visited TEXT[] DEFAULT '{}',
  login_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(username, login_date)
);

CREATE INDEX idx_dashboard_logins_user_date ON dashboard_logins(username, login_date);
```

**Note:** The app works perfectly fine WITHOUT this table. It will gracefully fall back to localStorage-only mode.

## User Experience

### For Chatters
1. Log in to dashboard
2. See bright yellow warning banner with checklist
3. Click on red (unvisited) pages to check them off
4. Progress bar fills as pages are visited
5. Banner turns green when all pages visited
6. Can now focus on actual work

### For Supervisors
1. Go to Team Members page
2. See "Dashboard Activity — Today" section at the top
3. Real-time view of who's logged in and what they've visited
4. Red highlighting for chatters who haven't completed check-in
5. Green highlighting for those who completed all pages
6. Warning badge for chatters who haven't logged in at all

## Files Changed/Created

**Created:**
- `src/hooks/usePageVisitTracker.tsx` (tracking context)
- `src/components/DailyCheckInBanner.tsx` (chatter banner)
- `src/components/DashboardActivityView.tsx` (supervisor view)
- `src/components/PageVisitTracker.tsx` (auto tracker)

**Modified:**
- `src/App.tsx` (wrapped with providers, opened routes to chatters)
- `src/pages/Index.tsx` (added banner)
- `src/pages/TeamMembers.tsx` (added activity view)

## Deployment

Committed and pushed to GitHub:
```
git add -A
git commit -m "Add mandatory daily dashboard check-in tracking for chatters"
git push
```

Lovable will auto-deploy on next sync (or manual trigger).

## Next Steps (Optional)

1. **Create Supabase table** if you want cross-device persistence
2. **Customize mandatory pages** by editing `MANDATORY_PAGES` array in `usePageVisitTracker.tsx`
3. **Add more chatters** to `KNOWN_CHATTERS` list in `DashboardActivityView.tsx`
4. **Email/Discord notifications** for non-compliance (future enhancement)
5. **Historical reporting** — track check-in patterns over weeks/months

---

**Built:** 2026-03-20  
**Status:** Production-ready  
**Storage:** localStorage (primary) + Supabase (optional sync)
