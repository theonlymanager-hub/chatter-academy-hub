import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const VISIT_STORAGE_KEY = 'onlyboard_page_visits';
const LOGIN_STORAGE_KEY = 'onlyboard_dashboard_logins';

export interface MandatoryPage {
  path: string;
  label: string;
}

export const MANDATORY_PAGES: MandatoryPage[] = [
  { path: '/knowledge-base', label: 'Knowledge Base' },
  { path: '/training', label: 'Training' },
  { path: '/fans', label: 'Fan Profiles' },
  { path: '/chat-feedback', label: 'Chat Feedback' },
  { path: '/tasks', label: 'Chatter Tasks' },
];

interface DailyVisitData {
  username: string;
  date: string; // YYYY-MM-DD
  pagesVisited: string[];
  loginTime: string; // ISO timestamp
  lastSync: string;
}

interface PageVisitContextType {
  todayVisits: string[];
  allUsersActivity: DailyVisitData[];
  trackPageVisit: (path: string) => void;
  getMissingPages: () => MandatoryPage[];
  allPagesVisited: boolean;
}

const PageVisitContext = createContext<PageVisitContextType | undefined>(undefined);

function getTodayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
}

function getAllLogins(): DailyVisitData[] {
  try {
    const raw = localStorage.getItem(LOGIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllLogins(data: DailyVisitData[]) {
  localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(data));
}

export function PageVisitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [todayVisits, setTodayVisits] = useState<string[]>([]);
  const [allUsersActivity, setAllUsersActivity] = useState<DailyVisitData[]>([]);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize: load today's visits for current user + fetch all from Supabase
  useEffect(() => {
    if (!user) return;

    const today = getTodayStr();
    const allLogins = getAllLogins();
    const existing = allLogins.find(
      (l) => l.username === user.username && l.date === today
    );

    if (existing) {
      setTodayVisits(existing.pagesVisited);
    } else {
      // First login today — record it
      const newLogin: DailyVisitData = {
        username: user.username,
        date: today,
        pagesVisited: [],
        loginTime: new Date().toISOString(),
        lastSync: '',
      };
      const updated = [...allLogins, newLogin];
      saveAllLogins(updated);
      setTodayVisits([]);

      // Write login to Supabase
      supabase.from('dashboard_activity').upsert(
        {
          username: user.username,
          date: today,
          pages_visited: [] as any,
          login_time: new Date().toISOString(),
          last_sync: new Date().toISOString(),
        },
        { onConflict: 'username,date' }
      ).then(() => {});
    }

    // Fetch ALL users' activity from Supabase for today
    fetchAllActivity(today, allLogins);
  }, [user]);

  async function fetchAllActivity(today: string, localLogins: DailyVisitData[]) {
    try {
      const { data, error } = await supabase
        .from('dashboard_activity')
        .select('*')
        .eq('date', today);

      if (!error && data && data.length > 0) {
        const supabaseActivity: DailyVisitData[] = data.map((d: any) => ({
          username: d.username,
          date: d.date,
          pagesVisited: Array.isArray(d.pages_visited) ? d.pages_visited : [],
          loginTime: d.login_time,
          lastSync: d.last_sync || '',
        }));

        // Merge: Supabase is source of truth, but include local data for current user if fresher
        const merged = [...supabaseActivity];
        // Also include any local-only entries not in Supabase
        for (const local of localLogins.filter(l => l.date === today)) {
          if (!merged.find(m => m.username === local.username)) {
            merged.push(local);
          }
        }
        setAllUsersActivity(merged);
      } else {
        // Fallback to localStorage
        setAllUsersActivity(localLogins.filter(l => l.date === today));
      }
    } catch {
      setAllUsersActivity(localLogins.filter(l => l.date === today));
    }
  }

  // Sync current user's visits to Supabase
  const syncToSupabase = useCallback(async () => {
    if (!user) return;
    const today = getTodayStr();
    const allLogins = getAllLogins();
    const current = allLogins.find(
      (l) => l.username === user.username && l.date === today
    );
    if (!current) return;

    try {
      await supabase.from('dashboard_activity').upsert(
        {
          username: current.username,
          date: current.date,
          pages_visited: current.pagesVisited as any,
          login_time: current.loginTime,
          last_sync: new Date().toISOString(),
        },
        { onConflict: 'username,date' }
      );
      current.lastSync = new Date().toISOString();
      saveAllLogins(allLogins);

      // Re-fetch all activity so supervisor sees updates
      fetchAllActivity(today, allLogins);
    } catch {
      // Supabase write failed — localStorage is still primary
    }
  }, [user]);

  const trackPageVisit = useCallback(
    (path: string) => {
      if (!user) return;

      const today = getTodayStr();
      const allLogins = getAllLogins();
      let current = allLogins.find(
        (l) => l.username === user.username && l.date === today
      );

      if (!current) {
        current = {
          username: user.username,
          date: today,
          pagesVisited: [],
          loginTime: new Date().toISOString(),
          lastSync: '',
        };
        allLogins.push(current);
      }

      if (!current.pagesVisited.includes(path)) {
        current.pagesVisited.push(path);
        saveAllLogins(allLogins);
        setTodayVisits([...current.pagesVisited]);
        setAllUsersActivity([...allLogins]);

        // Debounce Supabase sync
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(syncToSupabase, 3000);
      }
    },
    [user, syncToSupabase]
  );

  const getMissingPages = useCallback(() => {
    return MANDATORY_PAGES.filter((p) => !todayVisits.includes(p.path));
  }, [todayVisits]);

  const allPagesVisited = MANDATORY_PAGES.every((p) => todayVisits.includes(p.path));

  return (
    <PageVisitContext.Provider
      value={{ todayVisits, allUsersActivity, trackPageVisit, getMissingPages, allPagesVisited }}
    >
      {children}
    </PageVisitContext.Provider>
  );
}

export function usePageVisitTracker() {
  const context = useContext(PageVisitContext);
  if (!context) {
    throw new Error('usePageVisitTracker must be used within a PageVisitProvider');
  }
  return context;
}
