import { useEffect, useState } from 'react';
import { MANDATORY_PAGES } from '@/hooks/usePageVisitTracker';
import { CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';

const LOGIN_STORAGE_KEY = 'onlyboard_dashboard_logins';

interface DailyVisitData {
  username: string;
  date: string;
  pagesVisited: string[];
  loginTime: string;
  lastSync: string;
}

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

// Known chatters for tracking
const KNOWN_CHATTERS = ['marc', 'jaydee', 'jemimah', 'kc', 'jane'];

export default function DashboardActivityView() {
  const [activity, setActivity] = useState<DailyVisitData[]>([]);

  useEffect(() => {
    const today = getTodayStr();
    const allLogins = getAllLogins();
    const todayLogins = allLogins.filter((l) => l.date === today);
    setActivity(todayLogins);

    // Refresh every 30s
    const interval = setInterval(() => {
      const freshLogins = getAllLogins().filter((l) => l.date === getTodayStr());
      setActivity(freshLogins);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Build a combined view: known chatters + any with activity today
  const chatterUsernames = new Set([
    ...KNOWN_CHATTERS,
    ...activity.map((a) => a.username.toLowerCase()),
  ]);

  const chatterList = Array.from(chatterUsernames).map((username) => {
    const entry = activity.find((a) => a.username.toLowerCase() === username);
    const pagesVisited = entry?.pagesVisited || [];
    const missingPages = MANDATORY_PAGES.filter((p) => !pagesVisited.includes(p.path));
    return {
      username,
      loginTime: entry?.loginTime || null,
      pagesVisited,
      missingPages,
      allDone: missingPages.length === 0 && pagesVisited.length > 0,
      hasLoggedIn: !!entry,
    };
  });

  // Sort: logged in first, then by missing pages (most missing first)
  chatterList.sort((a, b) => {
    if (a.hasLoggedIn && !b.hasLoggedIn) return -1;
    if (!a.hasLoggedIn && b.hasLoggedIn) return 1;
    return b.missingPages.length - a.missingPages.length;
  });

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Dashboard Activity — Today</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </div>

      {chatterList.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No chatter activity recorded today.
        </p>
      ) : (
        <div className="space-y-3">
          {chatterList.map((chatter) => (
            <div
              key={chatter.username}
              className={`rounded-lg p-4 border ${
                !chatter.hasLoggedIn
                  ? 'bg-red-500/5 border-red-500/30'
                  : chatter.allDone
                  ? 'bg-green-500/5 border-green-500/30'
                  : 'bg-yellow-500/5 border-yellow-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{chatter.username}</span>
                  {chatter.allDone && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                      ✅ All Done
                    </span>
                  )}
                  {!chatter.hasLoggedIn && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">
                      ⚠️ Not logged in
                    </span>
                  )}
                </div>

                {chatter.loginTime && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(chatter.loginTime).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>

              {/* Pages checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {MANDATORY_PAGES.map((page) => {
                  const visited = chatter.pagesVisited.includes(page.path);
                  return (
                    <div
                      key={page.path}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                        visited ? 'text-green-400' : 'text-red-400 font-medium'
                      }`}
                    >
                      {visited ? (
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 shrink-0" />
                      )}
                      {page.label}
                    </div>
                  );
                })}
              </div>

              {/* Missing pages summary */}
              {chatter.missingPages.length > 0 && chatter.hasLoggedIn && (
                <p className="text-[10px] text-red-400 mt-2">
                  Missing: {chatter.missingPages.map((p) => p.label).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
