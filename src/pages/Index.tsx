import { useState, useEffect } from "react";
import { DollarSign, Users, Star, TrendingUp, Clock, MessageSquare, Pencil, Check, Calendar } from "lucide-react";
import { teamMembers, shiftSchedule, massMessages, chatterColors, modelColors, chattersOnLeave } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { platformApi, ACCOUNT_IDS, EarningStats } from "@/services/platformApi";

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = weekDays[new Date().getDay()];

interface EditableKPI {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: any;
}

const Index = () => {
  // Revenue from API
  const [earningStats, setEarningStats] = useState<Record<string, EarningStats | null>>({});
  const [revenueLoading, setRevenueLoading] = useState(true);

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

  // Calculate totals from API earning stats
  const totalApiRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.total || 0), 0);
  const totalSubscriptionRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.subscriptions || 0), 0);
  const totalMessageRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.messages || 0), 0);
  const totalTipsRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.tips || 0), 0);

  // Today's schedule and current shift
  const todayShifts = shiftSchedule.filter((s) => s.day === today);
  const nowHour = new Date().getUTCHours(); // UK = UTC in GMT (close enough for BST)
  const currentShift = nowHour >= 6 && nowHour < 14 ? "morning" : nowHour >= 14 && nowHour < 22 ? "afternoon" : "night";
  const allCurrentShiftChatters = todayShifts.filter(s => s.shift === currentShift);
  const currentShiftChatters = allCurrentShiftChatters.filter(s => !chattersOnLeave.includes(s.memberName));
  const onLeaveCurrentShift = allCurrentShiftChatters.filter(s => chattersOnLeave.includes(s.memberName));
  // Only count actual chatters (not supervisors, management, client comms)
  const chattersOnly = teamMembers.filter(m => m.category === "chatter");
  const onlineChatters = currentShiftChatters.length || chattersOnly.filter(m => m.status === "online" || m.status === "busy").length;
  const totalQuality = chattersOnly.reduce((sum, m) => sum + m.qualityScore, 0);
  const avgQuality = totalQuality > 0 ? (totalQuality / chattersOnly.filter(m => m.qualityScore > 0).length).toFixed(1) : "—";
  const totalTasks = chattersOnly.reduce((sum, m) => sum + m.weeklyTasks, 0);
  const completedTasks = chattersOnly.reduce((sum, m) => sum + m.tasksCompleted, 0);

  const formatRevenue = (amount: number) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount.toLocaleString()}`;
  };

  const [kpis, setKpis] = useState<EditableKPI[]>([]);
  const [kpisInitialized, setKpisInitialized] = useState(false);

  // Update KPIs when revenue data loads
  useEffect(() => {
    if (!revenueLoading && !kpisInitialized) {
      const revenueValue = totalApiRevenue > 0 ? formatRevenue(totalApiRevenue) : "No API key";
      const revenueChange = totalApiRevenue > 0
        ? `Subs: ${formatRevenue(totalSubscriptionRevenue)} | Msgs: ${formatRevenue(totalMessageRevenue)} | Tips: ${formatRevenue(totalTipsRevenue)}`
        : "Set API key in settings";

      setKpis([
        { title: "Chatters Online", value: `${onlineChatters}/${chattersOnly.length}`, change: `${onlineChatters} active now`, changeType: "neutral", icon: Users },
        { title: "Avg Quality Score", value: totalQuality > 0 ? `${avgQuality}/10` : "No data", change: totalQuality > 0 ? "From quality checks" : "Run quality checks to populate", changeType: "neutral", icon: Star },
        { title: "Tasks Completed", value: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "No tasks", change: totalTasks > 0 ? `${Math.round(completedTasks/totalTasks*100)}% completion rate` : "Assign tasks to get started", changeType: "neutral", icon: TrendingUp },
      ]);
      setKpisInitialized(true);
    }
  }, [revenueLoading, kpisInitialized, totalApiRevenue]);

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

  // Today's mass messages only
  const todayDate = new Date().toISOString().split("T")[0];
  const todayDayName = weekDays[new Date().getDay()];
  const todayMessages = massMessages.filter(m => m.dayOfWeek === todayDayName);

  // Leaderboard: chatters sorted by quality score
  const leaderboard = [...chattersOnly].filter(m => m.qualityScore > 0).sort((a, b) => b.qualityScore - a.qualityScore);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your chatting team performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {revenueLoading ? (
          <div className="col-span-full text-center text-sm text-muted-foreground py-4">Loading revenue data...</div>
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

      {/* Per-Model Revenue Breakdown */}
      {totalApiRevenue > 0 && (
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

      {/* Today's Schedule & Clock-in Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Today's Schedule</h2>
            <span className="text-xs text-muted-foreground ml-auto">{today}</span>
          </div>
          {todayShifts.length > 0 ? (
            <div className="space-y-2">
              {todayShifts.map((s) => {
                const color = chatterColors[s.memberName] || "217 91% 60%";
                const isCurrentShift = s.shift === currentShift;
                const isOnLeave = chattersOnLeave.includes(s.memberName);
                return (
                  <div key={s.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${isOnLeave ? "opacity-50 border-border/30 bg-secondary/10" : isCurrentShift ? "border-success/50 bg-success/10 ring-1 ring-success/20" : ""}`} style={!isCurrentShift && !isOnLeave ? { borderColor: `hsl(${color} / 0.3)`, backgroundColor: `hsl(${color} / 0.05)` } : {}}>
                    {isCurrentShift && !isOnLeave && <div className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />}
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                      {s.memberName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.memberName} {isOnLeave ? <span className="text-[10px] text-muted-foreground font-normal ml-1 bg-muted-foreground/20 px-1.5 py-0.5 rounded">ON LEAVE</span> : isCurrentShift ? <span className="text-[10px] text-success font-normal ml-1">● LIVE</span> : null}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{s.shift} shift · All models</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.startTime} – {s.endTime}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shifts scheduled today</p>
          )}
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="font-semibold">Clock-in Status</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success ml-auto capitalize">{currentShift} shift</span>
          </div>
          <div className="space-y-2">
            {chattersOnly.map((member) => {
              const color = chatterColors[member.name] || "217 91% 60%";
              const isOnLeave = chattersOnLeave.includes(member.name);
              const isOnShift = !isOnLeave && currentShiftChatters.some(s => s.memberName === member.name);
              return (
                <div key={member.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${isOnLeave ? "opacity-50 border-border/30 bg-secondary/10" : isOnShift ? "border-success/30 bg-success/5" : "border-border/30 bg-secondary/10"}`}>
                  <div className={`h-2 w-2 rounded-full shrink-0 ${isOnLeave ? "bg-muted-foreground/30" : isOnShift ? "bg-success animate-pulse" : "bg-muted-foreground/30"}`} />
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.role} · {member.shiftTimes}</p>
                  </div>
                  <span className={`text-xs ${isOnLeave ? "text-muted-foreground" : isOnShift ? "text-success" : "text-muted-foreground"}`}>
                    {isOnLeave ? <span className="bg-muted-foreground/20 px-1.5 py-0.5 rounded">ON LEAVE</span> : isOnShift ? "● On shift" : "○ Off shift"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Mass Messages */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Today's Mass Messages</h2>
          <span className="text-xs text-muted-foreground ml-auto">{todayDayName}</span>
        </div>
        {todayMessages.length > 0 ? (
          <div className="space-y-3">
            {todayMessages.map((m) => {
              const color = modelColors[m.modelName] || "217 91% 60%";
              // Determine message type from content
              const isPPV = m.ppvPrice > 0;
              const isPrompt = m.messagePreview.includes("?") || m.theme.toLowerCase().includes("prompt");
              const msgType = isPPV ? "PPV" : isPrompt ? "Prompt" : "Mass";
              const typeColor = isPPV ? "bg-amber-500/20 text-amber-400" : isPrompt ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400";
              return (
                <div key={m.id} className="flex items-stretch gap-0 rounded-lg overflow-hidden bg-secondary/20 border border-border/30">
                  {/* Model-colored left border */}
                  <div className="w-1 shrink-0" style={{ backgroundColor: `hsl(${color})` }} />
                  <div className="flex items-center gap-3 p-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                      {m.modelName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold" style={{ color: `hsl(${color})` }}>{m.modelName}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeColor}`}>{msgType}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground/80">{m.ppvTitle}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{m.messagePreview}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Theme: {m.theme}</p>
                    </div>
                    {isPPV && (
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center gap-0.5 bg-amber-500/20 text-amber-400 font-bold text-sm px-2.5 py-1 rounded-lg">
                          <DollarSign className="h-3.5 w-3.5" />
                          {m.ppvPrice}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No messages scheduled for today</p>
            <p className="text-xs mt-1 opacity-60">Check the Mass Message Calendar to plan ahead</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Leaderboard</h2>
          <span className="text-xs text-muted-foreground ml-auto">Quality Score</span>
        </div>
        {leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((member, i) => {
              const color = chatterColors[member.name] || "217 91% 60%";
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={member.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                  <span className="text-lg w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.shiftTimes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: `hsl(${color})` }}>{member.qualityScore.toFixed(1)}</p>
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
