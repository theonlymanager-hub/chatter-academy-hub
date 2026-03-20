import { useState, useEffect } from "react";
import { DollarSign, Users, Star, Clock, MessageSquare, Pencil, Check, Calendar, ArrowRight } from "lucide-react";
import { teamMembers, shiftSchedule, chatterColors, modelColors, chattersOnLeave } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { platformApi, ACCOUNT_IDS, EarningStats } from "@/services/platformApi";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = weekDays[new Date().getDay()];

interface EditableKPI {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: any;
}

interface QualityScore {
  chatter_name: string;
  overall_score: number;
  response_time_score: number | null;
  personalisation_score: number | null;
  conversation_flow_score: number | null;
  ppv_timing_score: number | null;
  energy_tone_score: number | null;
  created_at: string;
}

const Index = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Revenue from API
  const [earningStats, setEarningStats] = useState<Record<string, EarningStats | null>>({});
  const [revenueLoading, setRevenueLoading] = useState(true);

  // Leaderboard from Supabase
  const [leaderboardData, setLeaderboardData] = useState<QualityScore[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Exciting metrics
  const [pendingCustoms, setPendingCustoms] = useState(0);
  const [topChatter, setTopChatter] = useState<{name: string; revenue: number} | null>(null);
  const [topModel, setTopModel] = useState<{name: string; revenue: number} | null>(null);

  // Real-time attendance from Supabase
  const [liveAttendance, setLiveAttendance] = useState<string[]>([]);

  // Fetch real earning stats from API
  useEffect(() => {
    const fetchEarnings = async () => {
      const apiKey = platformApi.getApiKey();
      if (!apiKey) {
        setRevenueLoading(false);
        return;
      }
      try {
        const stats = await platformApi.getAllEarningStats();
        setEarningStats(stats);
      } catch (e) {
        console.error('Failed to fetch earning stats:', e);
      } finally {
        setRevenueLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  // Fetch quality scores from Supabase
  useEffect(() => {
    const fetchQualityScores = async () => {
      try {
        const { data, error } = await supabase
          .from('quality_scores')
          .select('chatter_name, overall_score, response_time_score, personalisation_score, conversation_flow_score, ppv_timing_score, energy_tone_score, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch quality scores:', error);
          setLeaderboardLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setLeaderboardLoading(false);
          return;
        }

        // Get latest score per chatter
        const latestByChatter = new Map<string, QualityScore>();
        for (const row of data) {
          if (!row.chatter_name || row.overall_score == null) continue;
          if (!latestByChatter.has(row.chatter_name)) {
            latestByChatter.set(row.chatter_name, {
              chatter_name: row.chatter_name,
              overall_score: row.overall_score,
              response_time_score: row.response_time_score,
              personalisation_score: row.personalisation_score,
              conversation_flow_score: row.conversation_flow_score,
              ppv_timing_score: row.ppv_timing_score,
              energy_tone_score: row.energy_tone_score,
              created_at: row.created_at || '',
            });
          }
        }

        // Sort by overall_score descending
        const sorted = Array.from(latestByChatter.values()).sort((a, b) => b.overall_score - a.overall_score);
        setLeaderboardData(sorted);
      } catch (e) {
        console.error('Failed to fetch quality scores:', e);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchQualityScores();
  }, []);

  // Fetch pending customs count
  useEffect(() => {
    const fetchPendingCustoms = async () => {
      const { data } = await supabase.from('customs').select('id').eq('status', 'pending');
      setPendingCustoms(data?.length || 0);
    };
    fetchPendingCustoms();
  }, []);

  // Fetch real-time attendance — who's ACTUALLY on duty right now
  useEffect(() => {
    // Map Discord display names → dashboard names
    const discordToDashboard: Record<string, string> = {
      'ThisIsMerridianPie': 'Jaydee',
      'maybenotrembrandtt': 'Jaydee',
      'Marc': 'Marc',
      'Jane': 'Jane',
      'KC': 'KC',
      'Jemimah': 'Jemimah',
    };
    const fetchLiveAttendance = async () => {
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
      const { data } = await supabase
        .from('attendance')
        .select('chatter_name, discord_username')
        .eq('date', todayStr)
        .is('logout_time', null);
      if (data) {
        const mapped = data.map(r => {
          return discordToDashboard[r.chatter_name] || discordToDashboard[r.discord_username] || r.chatter_name;
        });
        setLiveAttendance(mapped);
      }
    };
    fetchLiveAttendance();
    // Refresh every 2 minutes
    const interval = setInterval(fetchLiveAttendance, 120000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Top Chatter + Top Model from OF API daily data
  useEffect(() => {
    const fetchDailyMetrics = async () => {
      const apiKey = platformApi.getApiKey();
      if (!apiKey) return;

      try {
        const dailyEarnings = await platformApi.getAllDailyEarnings();

        // Shift schedule (UTC hours)
        const SHIFT_SCHEDULE = [
          { chatters: ['Marc'], startHour: 6, endHour: 14 },
          { chatters: ['JD', 'Jemimah'], startHour: 14, endHour: 22 },
          { chatters: ['KC', 'Jane'], startHour: 22, endHour: 30 },
        ];

        const chatterRevenue: Record<string, number> = {};
        const modelRevenue: Record<string, number> = {};
        const modelNames: Record<string, string> = {
          ashley: 'Ashley', willow: 'Willow', izzie: 'Izzie', lucinda: 'Lucinda',
        };

        for (const [modelKey, stats] of Object.entries(dailyEarnings)) {
          if (!stats) continue;
          const displayName = modelNames[modelKey] || modelKey;
          modelRevenue[displayName] = (modelRevenue[displayName] || 0) + stats.grossToday;

          for (const tx of stats.transactions) {
            const txHour = new Date(tx.time * 1000).getUTCHours();
            const normHour = txHour < 6 ? txHour + 24 : txHour;

            for (const shift of SHIFT_SCHEDULE) {
              if (normHour >= shift.startHour && normHour < shift.endHour) {
                const share = tx.gross / shift.chatters.length;
                for (const chatter of shift.chatters) {
                  chatterRevenue[chatter] = (chatterRevenue[chatter] || 0) + share;
                }
                break;
              }
            }
          }
        }

        const sortedChatters = Object.entries(chatterRevenue).sort(([, a], [, b]) => b - a);
        if (sortedChatters.length > 0) {
          setTopChatter({ name: sortedChatters[0][0], revenue: Math.round(sortedChatters[0][1] * 100) / 100 });
        }

        const sortedModels = Object.entries(modelRevenue).sort(([, a], [, b]) => b - a);
        if (sortedModels.length > 0) {
          setTopModel({ name: sortedModels[0][0], revenue: Math.round(sortedModels[0][1] * 100) / 100 });
        }
      } catch (e) {
        console.error('Failed to fetch daily metrics:', e);
      }
    };
    fetchDailyMetrics();
  }, []);

  // Calculate totals from API earning stats
  const totalApiRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.total || 0), 0);
  const totalSubscriptionRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.subscriptions || 0), 0);
  const totalMessageRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.messages || 0), 0);
  const totalTipsRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.tips || 0), 0);

  // Today's schedule and current shift
  const todayShifts = shiftSchedule.filter((s) => s.day === today);
  const nowHour = new Date().getUTCHours();
  const currentShift = nowHour >= 6 && nowHour < 14 ? "morning" : nowHour >= 14 && nowHour < 22 ? "afternoon" : "night";
  const allCurrentShiftChatters = todayShifts.filter(s => s.shift === currentShift);
  const currentShiftChatters = allCurrentShiftChatters.filter(s => !chattersOnLeave.includes(s.memberName));
  const chattersOnly = teamMembers.filter(m => m.category === "chatter");
  // Use REAL attendance data — who's actually in voice, not just scheduled
  const onlineChatters = liveAttendance.length > 0 ? liveAttendance.length : 0;

  // Avg quality from Supabase leaderboard data
  const avgQuality = leaderboardData.length > 0
    ? (leaderboardData.reduce((sum, d) => sum + d.overall_score, 0) / leaderboardData.length).toFixed(1)
    : "—";

  const formatRevenue = (amount: number) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount.toLocaleString()}`;
  };

  const [kpis, setKpis] = useState<EditableKPI[]>([]);
  const [kpisInitialized, setKpisInitialized] = useState(false);

  // Update KPIs when data loads
  useEffect(() => {
    if (!revenueLoading && !leaderboardLoading && !kpisInitialized) {
      setKpis([
        { title: "Chatters Online", value: `${onlineChatters}/${chattersOnly.length}`, change: `${onlineChatters} active now`, changeType: "neutral", icon: Users },
        { title: "Avg Quality Score", value: leaderboardData.length > 0 ? `${avgQuality}/10` : "No data", change: leaderboardData.length > 0 ? "From quality checks" : "Run quality checks to populate", changeType: "neutral", icon: Star },
        { title: "Pending Customs", value: `${pendingCustoms}`, change: pendingCustoms > 0 ? "Need attention" : "All clear ✅", changeType: pendingCustoms > 0 ? "negative" : "positive", icon: Clock },
      ]);
      setKpisInitialized(true);
    }
  }, [revenueLoading, leaderboardLoading, kpisInitialized]);

  const [editingKpi, setEditingKpi] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (i: number) => {
    setEditingKpi(i);
    setEditValue(kpis[i].value);
  };

  const saveEdit = (i: number) => {
    setKpis(prev => prev.map((k, idx) => idx === i ? { ...k, value: editValue } : k));
    setEditingKpi(null);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Chatting Operations — Overview of your chatting team performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {revenueLoading ? (
          <div className="col-span-full text-center text-sm text-muted-foreground py-4">Loading data...</div>
        ) : kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{kpi.title}</span>
                <div className="flex items-center gap-1">
                  {editingKpi === i ? (
                    <button onClick={() => saveEdit(i)} className="h-7 w-7 rounded-md bg-success/20 flex items-center justify-center hover:bg-success/30 transition-colors">
                      <Check className="h-3.5 w-3.5 text-success" />
                    </button>
                  ) : (
                    <button onClick={() => startEdit(i)} className="h-7 w-7 rounded-md bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
              <div>
                {editingKpi === i ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(i)}
                    className="text-2xl font-bold h-10 bg-secondary/50 border-primary/30"
                    autoFocus
                  />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                )}
                <p className={`text-xs mt-1 ${kpi.changeType === "positive" ? "text-success" : kpi.changeType === "negative" ? "text-destructive" : "text-muted-foreground"}`}>
                  {kpi.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-Model Revenue Breakdown — Admin Only */}
      {isAdmin && totalApiRevenue > 0 && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Revenue by Model</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(earningStats).map(([name, stats]) => {
              if (!stats) return null;
              const color = modelColors[name === 'izzie' ? 'Izzy' : name === 'willow' ? 'Willow' : name === 'lucinda' ? 'Lucinda Bleu' : 'Ashley Morris'] || "217 91% 60%";
              const displayName = name === 'izzie' ? 'Izzy' : name === 'willow' ? 'Willow' : name === 'lucinda' ? 'Lucinda Bleu' : name === 'ashley' ? 'Ashley Morris' : name;
              return (
                <div key={name} className="p-3 rounded-lg border" style={{ borderColor: `hsl(${color} / 0.3)`, backgroundColor: `hsl(${color} / 0.05)` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                  <p className="text-xl font-bold">{formatRevenue(stats.total)}</p>
                  <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                    <div>Subs: {formatRevenue(stats.subscriptions)} | Msgs: {formatRevenue(stats.messages)}</div>
                    <div>Tips: {formatRevenue(stats.tips)} | Posts: {formatRevenue(stats.posts)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exciting Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Chatter of the Day */}
        <div className="glass-card p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-muted-foreground">Top Chatter Today</span>
          </div>
          {topChatter ? (
            <div>
              <p className="text-3xl font-bold text-green-400">{topChatter.name}</p>
              {isAdmin && <p className="text-xs text-muted-foreground mt-1">${topChatter.revenue.toLocaleString()} revenue generated</p>}
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-muted-foreground/50">—</p>
              <p className="text-xs text-muted-foreground mt-1">No sales data yet today</p>
            </div>
          )}
        </div>

        {/* Top Model of the Day */}
        <div className="glass-card p-5 border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Top Model Today</span>
          </div>
          {topModel ? (
            <div>
              <p className="text-3xl font-bold text-primary">{topModel.name}</p>
              {isAdmin && <p className="text-xs text-muted-foreground mt-1">${topModel.revenue.toLocaleString()} gross revenue today</p>}
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-muted-foreground/50">—</p>
              <p className="text-xs text-muted-foreground mt-1">No data yet today</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule & Mass Messages Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Today's Schedule</h2>
            <span className="text-xs text-muted-foreground ml-auto">{today}</span>
          </div>
          {todayShifts.length > 0 ? (
            <div className="space-y-1">
              {todayShifts.map((s) => {
                const color = chatterColors[s.memberName] || "217 91% 60%";
                const isCurrentShift = s.shift === currentShift;
                const isOnLeave = chattersOnLeave.includes(s.memberName);
                return (
                  <div key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isOnLeave ? "opacity-40" : isCurrentShift ? "bg-success/10" : "bg-secondary/20"}`}>
                    {isCurrentShift && !isOnLeave && <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse shrink-0" />}
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                      {s.memberName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium flex-1">{s.memberName}</span>
                    <span className="text-xs text-muted-foreground">{s.startTime}–{s.endTime}</span>
                    {isOnLeave ? (
                      <span className="text-[10px] text-muted-foreground bg-muted-foreground/20 px-1.5 py-0.5 rounded">LEAVE</span>
                    ) : isCurrentShift && liveAttendance.includes(s.memberName) ? (
                      <span className="text-[10px] text-success font-medium">🟢 LIVE</span>
                    ) : isCurrentShift ? (
                      <span className="text-[10px] text-red-400 font-medium">⚠️ SCHEDULED (not in voice)</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">off shift</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shifts scheduled today</p>
          )}
        </div>

        {/* Mass Messages Link Card */}
        <Link to="/messages" className="glass-card p-5 flex items-center gap-4 hover:border-primary/30 transition-colors group">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">📅 Mass Messages</h2>
            <p className="text-sm text-muted-foreground mt-0.5">View & Schedule</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>

      {/* Leaderboard — from Supabase quality_scores */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Leaderboard</h2>
          <span className="text-xs text-muted-foreground ml-auto">Quality Score</span>
        </div>
        {leaderboardLoading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading quality scores...</p>
        ) : leaderboardData.length > 0 ? (
          <div className="space-y-2">
            {leaderboardData.map((entry, i) => {
              const color = chatterColors[entry.chatter_name] || "217 91% 60%";
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={entry.chatter_name} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                  <span className="text-lg w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                    {entry.chatter_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.chatter_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: `hsl(${color})` }}>{entry.overall_score.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">/10</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">Quality scores will appear after reviews</p>
        )}
      </div>
    </div>
  );
};

export default Index;
