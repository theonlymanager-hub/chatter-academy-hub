import { useEffect, useState } from "react";
import { Users, Radio, Palmtree } from "lucide-react";
import {
  fetchTeamActivity,
  formatTimeAgo,
  formatActionLabel,
  SHIFT_SCHEDULE,
  type ActivityEvent,
  type TeamMemberStatus,
} from "@/lib/teamActivityStore";

// ── Helpers ────────────────────────────────────────────────────────────────

function getCurrentShiftLabel(): string {
  const h = parseInt(
    new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      hour: "numeric",
      hour12: false,
    })
  );
  if (h >= 6 && h < 14) return "6AM–2PM";
  if (h >= 14 && h < 22) return "2PM–10PM";
  return "10PM–6AM";
}

function actionColor(action: string): string {
  switch (action) {
    case "logged_in":
    case "joined_voice":
    case "started_shift":
      return "text-emerald-400";
    case "logged_out":
    case "left_voice":
    case "ended_shift":
      return "text-red-400";
    case "on_leave":
      return "text-amber-400";
    default:
      return "text-muted-foreground";
  }
}

function statusDot(status: TeamMemberStatus): string {
  if (status.isOnLeave) return "bg-amber-400";
  if (status.isOnDuty) return "bg-emerald-400 animate-pulse";
  return "bg-red-400/60";
}

function statusLabel(status: TeamMemberStatus): string {
  if (status.isOnLeave) return "On Leave";
  if (status.isOnDuty) return "On Duty";
  return "Offline";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TeamActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [statuses, setStatuses] = useState<TeamMemberStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const result = await fetchTeamActivity();
      setActivities(result.activities);
      setStatuses(result.statuses);
    } catch (e) {
      console.error("[TeamActivityFeed] Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(iv);
  }, []);

  const currentShift = getCurrentShiftLabel();
  const onDutyCount = statuses.filter((s) => s.isOnDuty).length;

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Team Activity</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Radio className="h-3 w-3 text-emerald-400" />
          <span>{onDutyCount} on duty</span>
          <span className="mx-1">·</span>
          <span>{currentShift} shift</span>
        </div>
      </div>

      {/* Who's On Duty */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <div
            key={s.name}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              s.isOnDuty
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : s.isOnLeave
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            <div className={`h-2 w-2 rounded-full shrink-0 ${statusDot(s)}`} />
            <span>{s.name}</span>
            <span className="text-[10px] opacity-70">{statusLabel(s)}</span>
          </div>
        ))}
      </div>

      {/* Shift Schedule (compact) */}
      <div className="rounded-lg bg-secondary/30 p-3 space-y-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Shift Schedule (UK)
        </p>
        {SHIFT_SCHEDULE.map((s) => (
          <div
            key={s.shift}
            className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
              s.shift === currentShift ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="font-medium">{s.shift}</span>
            <span>{s.members.join(" + ")}</span>
          </div>
        ))}

      </div>

      {/* Activity Feed */}
      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-3">Loading activity…</p>
      ) : activities.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">No activity in the last 24h</p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {activities.slice(0, 20).map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
            >
              {a.action === "on_leave" ? (
                <Palmtree className="h-3 w-3 text-amber-400 shrink-0" />
              ) : (
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    a.action === "logged_in" || a.action === "joined_voice"
                      ? "bg-emerald-400"
                      : a.action === "on_leave"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
              )}
              <span className="text-sm font-medium">{a.user}</span>
              <span className={`text-xs ${actionColor(a.action)}`}>
                {formatActionLabel(a.action, a.channel)}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
                {formatTimeAgo(a.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
