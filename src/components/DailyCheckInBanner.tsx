import { usePageVisitTracker, MANDATORY_PAGES } from '@/hooks/usePageVisitTracker';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function DailyCheckInBanner() {
  const { user } = useAuth();
  const { todayVisits, allPagesVisited } = usePageVisitTracker();

  // Only show for chatters
  if (!user || user.role !== 'chatter') return null;

  // If all pages visited, show a brief success message
  if (allPagesVisited) {
    return (
      <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="font-semibold text-green-400">Daily Check-In Complete ✅</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          You've visited all mandatory pages today. Great work!
        </p>
      </div>
    );
  }

  const visitedCount = MANDATORY_PAGES.filter((p) => todayVisits.includes(p.path)).length;

  return (
    <div className="mb-6 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/10 p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <span className="font-bold text-yellow-400 text-base">
          Daily Dashboard Check-In
        </span>
        <span className="ml-auto text-sm font-medium text-muted-foreground">
          {visitedCount}/{MANDATORY_PAGES.length} completed
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        You must visit all mandatory pages each day. Click on any unvisited page to check it off.
      </p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-secondary/50 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-yellow-500 rounded-full transition-all duration-500"
          style={{ width: `${(visitedCount / MANDATORY_PAGES.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MANDATORY_PAGES.map((page) => {
          const visited = todayVisits.includes(page.path);
          return (
            <Link
              key={page.path}
              to={page.path}
              className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors ${
                visited
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
              }`}
            >
              {visited ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <span className={`text-sm font-medium ${visited ? 'text-green-400' : 'text-red-300'}`}>
                {page.label}
              </span>
              {!visited && (
                <span className="ml-auto text-[10px] text-red-400/70">Not visited yet →</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
