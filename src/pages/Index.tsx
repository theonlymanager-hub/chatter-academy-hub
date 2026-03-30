import { useState, useEffect } from "react";
import {
  Users,
  Star,
  TrendingUp,
  ExternalLink,
  Activity,
  FolderOpen,
  AlertCircle,
  DollarSign,
  ClipboardCheck,
} from "lucide-react";
import { teamMembers, shiftSchedule, chatterColors, modelColors, chattersOnLeave } from "@/lib/mock-data";
import { platformApi, ACCOUNT_IDS, WeeklyEarnings } from "@/services/platformApi";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DailyCheckInBanner from "@/components/DailyCheckInBanner";
import RevenueLTV from "@/components/RevenueLTV";
import MarkTaskTracker from "@/components/MarkTaskTracker";
import LukeTaskTracker from "@/components/LukeTaskTracker";
import StrikesPanel from "@/components/StrikesPanel";
import ChatterTasksWidget from "@/components/ChatterTasksWidget";
import TeamActivityFeed from "@/components/TeamActivityFeed";
import { isDemoUser } from "@/utils/demo";

// ── constants ──────────────────────────────────────────────────────────────
const MODELS = [
  { key: "ashley", name: "Ashley", color: "#f472b6", gradient: "from-pink-500/20 to-pink-900/10", border: "border-pink-500/30", bgAccent: "bg-pink-500/10" },
  { key: "willow", name: "Willow", color: "#34d399", gradient: "from-emerald-500/20 to-emerald-900/10", border: "border-emerald-500/30", bgAccent: "bg-emerald-500/10" },
  { key: "izzie", name: "Izzy", color: "#a78bfa", gradient: "from-violet-500/20 to-violet-900/10", border: "border-violet-500/30", bgAccent: "bg-violet-500/10" },
] as const;

// Hardcoded model stats from RevenueLTV (updated 2026-03-30)
const MODEL_STATS: Record<string, { allTimeRev: number; totalSubs: number }> = {
  ashley: { allTimeRev: 59568, totalSubs: 9393 },
  willow: { allTimeRev: 15456, totalSubs: 1454 },
  izzie: { allTimeRev: 67039, totalSubs: 11365 },
};

const WEEKLY_TARGET = 5000;

interface QualityScore {
  chatter_name: string;
  overall_score: number;
  created_at: string;
}

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`);

// ── component ──────────────────────────────────────────────────────────────
const Index = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDemo = isDemoUser(user?.role);

  // ─ state ─
  const [weeklyEarnings, setWeeklyEarnings] = useState<Record<string, WeeklyEarnings>>({});
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [qualityScores, setQualityScores] = useState<QualityScore[]>([]);
  const [pendingCustoms, setPendingCustoms] = useState(0);
  const [liveAttendance, setLiveAttendance] = useState<string[]>([]);

  // ─ fetch weekly earnings ─
  useEffect(() => {
    (async () => {
      const apiKey = platformApi.getApiKey();
      if (!apiKey) { setRevenueLoading(false); setRevenueError("No API key"); return; }
      try {
        const weekly = await platformApi.getAllWeeklyEarnings();
        setWeeklyEarnings(weekly);
        const errors = Object.entries(weekly).filter(([, w]) => w.error);
        if (errors.length > 0) {
          setRevenueError(`API errors: ${errors.map(([n, w]) => `${n}: ${w.error}`).join(", ")}`);
        }
      } catch (e) {
        console.error("Failed to fetch earnings:", e);
        setRevenueError(String(e));
      } finally {
        setRevenueLoading(false);
      }
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
        const latestByChatter: Record<string, QualityScore> = {};
        for (const row of data as QualityScore[]) {
          if (!latestByChatter[row.chatter_name]) {
            latestByChatter[row.chatter_name] = row;
          }
        }
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
  const totalWeeklyGross = Object.values(weeklyEarnings).reduce((s, w) => s + (w?.grossTotal || 0), 0);
  const chattersOnly = teamMembers.filter((m) => m.category === "chatter");
  const onlineCount = liveAttendance.length;
  const avgQcScore = qualityScores.length > 0
    ? (qualityScores.reduce((s, q) => s + q.overall_score, 0) / qualityScores.length)
    : 0;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl">
      <DailyCheckInBanner />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Account operations overview</p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO — Model Revenue Cards
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODELS.map(({ key, name, color, gradient, border, bgAccent }) => {
          const weekly = weeklyEarnings[key];
          const revenue = weekly?.grossTotal || 0;
          const tipsRev = weekly?.tips || 0;
          const messagesRev = weekly?.messages || 0;
          const hasError = weekly?.error;
          const pct = Math.min(100, Math.round((revenue / WEEKLY_TARGET) * 100));
          const stats = MODEL_STATS[key];
          const ltv = stats && stats.totalSubs > 0 ? (stats.allTimeRev / stats.totalSubs).toFixed(2) : "—";

          return (
            <div key={key} className={`rounded-xl border ${border} bg-gradient-to-br ${gradient} p-5 space-y-4`}>
              {/* Model identity */}
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${color}33`, color }}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold">{name}</span>
                  {hasError && <AlertCircle className="inline ml-2 h-3.5 w-3.5 text-red-400" title={hasError} />}
                </div>
              </div>

              {/* Revenue */}
              <div>
                <p className="text-3xl font-bold tracking-tight" style={{ color }}>
                  {isDemo ? "—" : revenueLoading ? "…" : hasError ? "err" : fmt(revenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">this week (gross)</p>
              </div>

              {/* Progress bar toward $5K */}
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{isDemo ? "—" : `${pct}%`}</span>
                  <span>{fmt(WEEKLY_TARGET)} target</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: isDemo ? "0%" : `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <p className="text-muted-foreground">LTV</p>
                  <p className="font-semibold">{isDemo ? "—" : `$${ltv}`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Subs</p>
                  <p className="font-semibold">{isDemo ? "—" : (stats?.totalSubs?.toLocaleString() || "—")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tips</p>
                  <p className="font-semibold">{isDemo ? "—" : revenueLoading ? "…" : fmt(tipsRev)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. QUICK STATS ROW — 4 compact cards
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Weekly Revenue",
            value: isDemo ? "—" : revenueLoading ? "…" : revenueError && totalWeeklyGross === 0 ? "err" : fmt(totalWeeklyGross),
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Chatters On Shift",
            value: `${onlineCount}/${chattersOnly.length}`,
            icon: Activity,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Pending Customs",
            value: `${pendingCustoms}`,
            icon: AlertCircle,
            color: pendingCustoms > 0 ? "text-red-400" : "text-emerald-400",
            bg: pendingCustoms > 0 ? "bg-red-500/10" : "bg-emerald-500/10",
          },
          {
            label: "Avg QC Score",
            value: isDemo ? "—" : qualityScores.length === 0 ? "—" : avgQcScore.toFixed(1),
            icon: ClipboardCheck,
            color: avgQcScore >= 8 ? "text-emerald-400" : avgQcScore >= 6 ? "text-amber-400" : "text-red-400",
            bg: avgQcScore >= 8 ? "bg-emerald-500/10" : avgQcScore >= 6 ? "bg-amber-500/10" : "bg-red-500/10",
          },
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

      {/* ══════════════════════════════════════════════════════════════════
          3. TWO-COLUMN LAYOUT — Team Activity | Strikes + Tasks
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT — Team Activity Feed */}
        <div className="space-y-4">
          <TeamActivityFeed />
        </div>

        {/* RIGHT — Strikes + Chatter Tasks stacked */}
        <div className="space-y-4">
          {(isAdmin || user?.role === "supervisor") && <StrikesPanel />}
          {(isAdmin || user?.role === "supervisor") && <ChatterTasksWidget />}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          4. TASK TRACKERS — kept but lower priority
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LukeTaskTracker />
        <MarkTaskTracker />
      </div>

      {/* ── RevenueLTV (detailed breakdown — kept for drill-down) ─────── */}
      <RevenueLTV />
    </div>
  );
};

export default Index;
