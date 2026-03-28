import { useState, useEffect } from "react";
import {
  Users,
  Star,
  TrendingUp,
  ExternalLink,
  Activity,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import { teamMembers, shiftSchedule, chatterColors, modelColors, chattersOnLeave } from "@/lib/mock-data";
import { platformApi, ACCOUNT_IDS, EarningStats } from "@/services/platformApi";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DailyCheckInBanner from "@/components/DailyCheckInBanner";

// ── constants ──────────────────────────────────────────────────────────────
const MODELS = [
  { key: "ashley", name: "Ashley", color: "#f472b6", gradient: "from-pink-500/20 to-pink-900/10", border: "border-pink-500/30" },
  { key: "izzie", name: "Izzy", color: "#a78bfa", gradient: "from-violet-500/20 to-violet-900/10", border: "border-violet-500/30" },
  { key: "willow", name: "Willow", color: "#34d399", gradient: "from-emerald-500/20 to-emerald-900/10", border: "border-emerald-500/30" },
  { key: "lucinda", name: "Lucinda", color: "#fbbf24", gradient: "from-amber-500/20 to-amber-900/10", border: "border-amber-500/30" },
] as const;

const DRIVE_LINKS: Record<string, string | null> = {
  Izzy: "https://drive.google.com/drive/folders/1gsSiL3gOO4XVU7OgAjDK710qb6A5zrJ4",
  Ashley: "https://drive.google.com/drive/folders/1qkJvhJCEoN9Zu0_TFlwsITiDpDchl7WS",
  Willow: "https://drive.google.com/drive/folders/1gFzP99TBks2RiJIwGaLwsiDyxuUHPpzP",
  Lucinda: null, // coming next week
};

const WEEKLY_TARGET = 5000; // revenue target per model

interface QualityScore {
  chatter_name: string;
  overall_score: number;
  created_at: string;
}

interface TeamActivityEntry {
  username: string;
  role: string;
  lastActive: number; // timestamp
}

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`);

const timeAgo = (ts: number) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── component ──────────────────────────────────────────────────────────────
const Index = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // ─ state ─
  const [earningStats, setEarningStats] = useState<Record<string, EarningStats | null>>({});
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [qualityScores, setQualityScores] = useState<QualityScore[]>([]);
  const [pendingCustoms, setPendingCustoms] = useState(0);
  const [teamActivity, setTeamActivity] = useState<TeamActivityEntry[]>([]);
  const [liveAttendance, setLiveAttendance] = useState<string[]>([]);

  // ─ track own activity via Supabase dashboard_activity table ─
  useEffect(() => {
    if (!user) return;
    const username = user.username || "Unknown";
    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

    const upsertAndFetch = async () => {
      // Upsert current user's activity
      const now = new Date().toISOString();
      const { data: existing } = await supabase
        .from("dashboard_activity")
        .select("id")
        .eq("username", username)
        .eq("date", todayStr)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("dashboard_activity")
          .update({ last_sync: now })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("dashboard_activity")
          .insert({ username, date: todayStr, login_time: now, last_sync: now });
      }

      // Fetch ALL team members' activity from today
      const { data: allActivity } = await supabase
        .from("dashboard_activity")
        .select("username, last_sync, login_time, date")
        .eq("date", todayStr)
        .order("last_sync", { ascending: false });

      if (allActivity) {
        // Also look up roles from app_users
        const { data: users } = await supabase
          .from("app_users")
          .select("username, role");
        const roleMap: Record<string, string> = {};
        if (users) users.forEach((u) => { roleMap[u.username] = u.role; });

        const entries: TeamActivityEntry[] = allActivity.map((a) => ({
          username: a.username,
          role: roleMap[a.username] || "chatter",
          lastActive: new Date(a.last_sync).getTime(),
        }));
        setTeamActivity(entries);
      }
    };

    upsertAndFetch();
    // Refresh every 30s
    const interval = setInterval(upsertAndFetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ─ fetch earnings ─
  useEffect(() => {
    (async () => {
      const apiKey = platformApi.getApiKey();
      if (!apiKey) { setRevenueLoading(false); return; }
      try {
        const stats = await platformApi.getAllEarningStats();
        setEarningStats(stats);
      } catch (e) { console.error("Failed to fetch earnings:", e); }
      finally { setRevenueLoading(false); }
    })();
  }, []);

  // ─ fetch latest quality score per chatter ─
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("quality_scores")
        .select("chatter_name, overall_score, created_at")
        .order("created_at", { ascending: false });
      if (data) {
        // Group by chatter_name, keep only the most recent entry per chatter
        const latestByChatter: Record<string, QualityScore> = {};
        for (const row of data as QualityScore[]) {
          if (!latestByChatter[row.chatter_name]) {
            latestByChatter[row.chatter_name] = row;
          }
        }
        // Return all unique chatters, sorted by most recent first
        const unique = Object.values(latestByChatter).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setQualityScores(unique);
      }
    })();
  }, []);

  // ─ fetch pending customs ─
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("customs").select("id, status").eq("status", "pending");
      if (error) console.error("Customs query error:", error);
      console.log(`[Dashboard] Pending customs count: ${data?.length || 0}`, data);
      setPendingCustoms(data?.length || 0);
    })();
  }, []);

  // ─ live attendance ─
  useEffect(() => {
    const discordToDashboard: Record<string, string> = {
      ThisIsMerridianPie: "Jaydee", maybenotrembrandtt: "Jaydee",
      Marc: "Marc", Jane: "Jane", KC: "KC", Jemimah: "Jemimah",
    };
    const fetch = async () => {
      const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
      const { data } = await supabase
        .from("attendance")
        .select("chatter_name, discord_username")
        .eq("date", todayStr)
        .is("logout_time", null);
      if (data) setLiveAttendance(data.map((r) => discordToDashboard[r.chatter_name] || discordToDashboard[r.discord_username] || r.chatter_name));
    };
    fetch();
    const iv = setInterval(fetch, 120000);
    return () => clearInterval(iv);
  }, []);

  // ─ derived ─
  const totalRevenue = Object.values(earningStats).reduce((s, e) => s + (e?.total || 0), 0);
  const chattersOnly = teamMembers.filter((m) => m.category === "chatter");
  const onlineCount = liveAttendance.length;

  // Average LTV placeholder — subscriptions / subscribers count (rough)
  const subscriberCount = Object.values(earningStats).reduce((s, e) => {
    // Use subscriptions as proxy until subscriber counts are fetched
    return s + (e ? Math.max(1, Math.round(e.subscriptions / 10)) : 0);
  }, 0);
  const avgLtv = subscriberCount > 0 ? totalRevenue / subscriberCount : 0;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl">
      <DailyCheckInBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Account operations overview</p>
      </div>

      {/* ── Quick Stats Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Average LTV", value: revenueLoading ? "…" : fmt(avgLtv), icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Chatters On Shift", value: `${onlineCount}/${chattersOnly.length}`, icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className="text-xl font-bold tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Model Revenue Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MODELS.map(({ key, name, color, gradient, border }) => {
          const stats = earningStats[key];
          const revenue = stats?.total || 0;
          const subs = stats?.subscriptions || 0;
          const pct = Math.min(100, Math.round((revenue / WEEKLY_TARGET) * 100));
          return (
            <div key={key} className={`rounded-xl border ${border} bg-gradient-to-br ${gradient} p-5 space-y-3`}>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${color}33`, color }}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-sm">{name}</span>
              </div>

              <div>
                <p className="text-2xl font-bold" style={{ color }}>{revenueLoading ? "…" : (revenue > 0 ? fmt(revenue) : "$0")}</p>
                <p className="text-[11px] text-muted-foreground">weekly revenue</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{pct}% of target</span>
                  <span>{fmt(WEEKLY_TARGET)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-muted-foreground">Subs Rev</p>
                  <p className="font-medium">{revenueLoading ? "…" : (subs > 0 ? fmt(subs) : "$0")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LTV</p>
                  <p className="font-medium">{revenueLoading ? "…" : (stats && stats.total > 0 ? fmt(stats.total / Math.max(1, Math.round(stats.subscriptions / 10))) : "$0")}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Middle Row: Team Activity + Quality Scores + Pending Customs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Team Activity */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Team Activity</h2>
          </div>
          {teamActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {teamActivity.map((t) => {
                const isOnline = Date.now() - t.lastActive < 300000; // 5 min
                return (
                  <div key={t.username} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/30">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/40"}`} />
                    <span className="text-sm font-medium flex-1 truncate">{t.username}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{t.role}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(t.lastActive)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Quality Scores */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-sm">Recent Quality Scores</h2>
          </div>
          {qualityScores.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">No scores yet</p>
          ) : (
            <div className="space-y-2">
              {qualityScores.map((qs, i) => {
                const scoreColor = qs.overall_score >= 8 ? "text-emerald-400" : qs.overall_score >= 6 ? "text-amber-400" : "text-red-400";
                const color = chatterColors[qs.chatter_name] || "217 91% 60%";
                return (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/30">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                    >
                      {qs.chatter_name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm flex-1 truncate">{qs.chatter_name}</span>
                    <span className={`text-sm font-bold ${scoreColor}`}>{qs.overall_score.toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(qs.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Customs */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className={`h-4 w-4 ${pendingCustoms > 0 ? "text-red-400" : "text-emerald-400"}`} />
            <h2 className="font-semibold text-sm">Pending Customs</h2>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className={`text-5xl font-bold ${pendingCustoms > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {pendingCustoms}
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {pendingCustoms > 0 ? `${pendingCustoms} custom${pendingCustoms > 1 ? "s" : ""} awaiting completion` : "All customs completed ✅"}
          </p>
        </div>
      </div>

      {/* ── Content Drive Links ─────────────────────────────────────────── */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Content Drives</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODELS.map(({ name, color, border }) => {
            const link = DRIVE_LINKS[name];
            return (
              <div key={name} className={`rounded-lg border ${border} p-3 flex items-center gap-3`}>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: `${color}33`, color }}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{name}</p>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      Open Drive <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Coming next week</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
