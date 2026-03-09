import { useState, useEffect } from "react";
import { DollarSign, Users, Star, TrendingUp, ArrowUpRight, Calendar, Clock, MessageSquare, FileSpreadsheet, Pencil, Check, LogIn, LogOut } from "lucide-react";
import { teamMembers, tasks, shiftSchedule, massMessages, chatterColors, modelColors } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
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

interface ClockInStatus {
  [memberId: string]: {
    clockedIn: boolean;
    clockInTime: string | null;
  };
}

const Index = () => {
  // Clock-in state with localStorage
  const [clockInStatus, setClockInStatus] = useState<ClockInStatus>({});
  // Revenue from API
  const [earningStats, setEarningStats] = useState<Record<string, EarningStats | null>>({});
  const [revenueLoading, setRevenueLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("chatter-clock-in");
    if (saved) {
      setClockInStatus(JSON.parse(saved));
    } else {
      const initial: ClockInStatus = {};
      teamMembers.forEach(m => {
        initial[m.id] = { clockedIn: m.clockedIn || false, clockInTime: m.clockInTime || null };
      });
      setClockInStatus(initial);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(clockInStatus).length > 0) {
      localStorage.setItem("chatter-clock-in", JSON.stringify(clockInStatus));
    }
  }, [clockInStatus]);

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

  const toggleClockIn = (memberId: string) => {
    setClockInStatus(prev => {
      const current = prev[memberId] || { clockedIn: false, clockInTime: null };
      if (current.clockedIn) {
        return { ...prev, [memberId]: { clockedIn: false, clockInTime: null } };
      } else {
        const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        return { ...prev, [memberId]: { clockedIn: true, clockInTime: now } };
      }
    });
  };

  // Calculate totals from API earning stats
  const totalApiRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.total || 0), 0);
  const totalSubscriptionRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.subscriptions || 0), 0);
  const totalMessageRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.messages || 0), 0);
  const totalTipsRevenue = Object.values(earningStats).reduce((sum, s) => sum + (s?.tips || 0), 0);

  // Chatter stats
  const onlineChatters = Object.values(clockInStatus).filter(s => s.clockedIn).length || teamMembers.filter(m => m.status === "online" || m.status === "busy").length;
  const avgQuality = (teamMembers.reduce((sum, m) => sum + m.qualityScore, 0) / teamMembers.length).toFixed(1);
  const totalTasks = teamMembers.reduce((sum, m) => sum + m.weeklyTasks, 0);
  const completedTasks = teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0);

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
        { title: "Chatters Online", value: `${onlineChatters}/${teamMembers.length}`, change: `${onlineChatters} active now`, changeType: "neutral", icon: Users },
        { title: "Avg Quality Score", value: `${avgQuality}/10`, change: "+0.3 from last week", changeType: "positive", icon: Star },
        { title: "Tasks Completed", value: `${completedTasks}/${totalTasks}`, change: totalTasks > 0 ? `${Math.round(completedTasks/totalTasks*100)}% completion rate` : "No tasks", changeType: "neutral", icon: TrendingUp },
        { title: "Total Revenue", value: revenueValue, change: revenueChange, changeType: totalApiRevenue > 0 ? "positive" : "neutral", icon: DollarSign },
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

  const todayShifts = shiftSchedule.filter((s) => s.day === today);
  const upcomingMessages = massMessages.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your chatting team performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                return (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg border" style={{ borderColor: `hsl(${color} / 0.3)`, backgroundColor: `hsl(${color} / 0.05)` }}>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                      {s.memberName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.memberName}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{s.shift} shift</p>
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
          </div>
          <div className="space-y-2">
            {teamMembers.map((m) => {
              const color = chatterColors[m.name] || "217 91% 60%";
              const status = clockInStatus[m.id] || { clockedIn: m.clockedIn, clockInTime: m.clockInTime };
              return (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.clockedIn ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-success">In since {status.clockInTime}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Clocked out</span>
                      </>
                    )}
                    <button
                      onClick={() => toggleClockIn(m.id)}
                      className={`ml-2 p-1.5 rounded-md transition-colors ${status.clockedIn ? "bg-destructive/20 hover:bg-destructive/30 text-destructive" : "bg-success/20 hover:bg-success/30 text-success"}`}
                      title={status.clockedIn ? "Clock out" : "Clock in"}
                    >
                      {status.clockedIn ? <LogOut className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Messages */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Upcoming Mass Messages</h2>
        </div>
        {upcomingMessages.length > 0 ? (
          <div className="space-y-2">
            {upcomingMessages.map((m) => {
              const color = modelColors[m.modelName] || "217 91% 60%";
              return (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                    {m.modelName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: `hsl(${color})` }}>{m.modelName}</span>
                      <span className="text-[10px] text-muted-foreground">{m.dayOfWeek}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.messagePreview}</p>
                  </div>
                  <span className="text-xs font-medium text-accent">${m.ppvPrice}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">No messages scheduled</p>
        )}
      </div>

      {/* Mass Message Schedule */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Mass Message Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-xs font-medium text-muted-foreground">Model</div>
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-xs font-medium text-muted-foreground text-center">{day.slice(0, 3)}</div>
              ))}
            </div>
            {Object.entries(modelColors).map(([name, color]) => (
              <div key={name} className="grid grid-cols-8 gap-1 mb-1">
                <div className="p-2 flex flex-col justify-center">
                  <span className="text-sm font-medium truncate">{name}</span>
                </div>
                {weekDays.map((day) => {
                  const isScheduled = ["Monday", "Wednesday", "Friday"].includes(day);
                  return (
                    <div key={day} className={`rounded-md p-2 text-center flex items-center justify-center transition-colors ${isScheduled ? "bg-secondary border border-border" : "bg-transparent"}`}>
                      {isScheduled && <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
          {Object.entries(modelColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-4">
          <h2 className="font-semibold">Top Performers</h2>
          <div className="space-y-3">
            {[...teamMembers].sort((a, b) => b.revenueGenerated - a.revenueGenerated).slice(0, 4).map((member, i) => {
              const color = chatterColors[member.name] || "217 91% 60%";
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${member.revenueGenerated.toLocaleString()}</p>
                    <div className="flex items-center gap-0.5 text-xs text-success">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>{member.qualityScore}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h2 className="font-semibold">Recent Tasks</h2>
          <div className="space-y-3">
            {tasks.length > 0 ? tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${task.status === "completed" ? "bg-success" : task.status === "in-progress" ? "bg-warning" : "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.assignee}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === "high" ? "bg-destructive/20 text-destructive" : task.priority === "medium" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}>
                  {task.priority}
                </span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks assigned yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Training Progress */}
      <div className="glass-card p-5 space-y-4">
        <h2 className="font-semibold">Training Progress</h2>
        <div className="space-y-3">
          {teamMembers.map((member) => {
            const color = chatterColors[member.name] || "217 91% 60%";
            return (
              <div key={member.id} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.trainingProgress}%</span>
                  </div>
                  <Progress value={member.trainingProgress} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Placeholder - Google Sheets only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3 border-dashed">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Google Sheets Import</h3>
          </div>
          <p className="text-xs text-muted-foreground">Import schedules, team data, and performance metrics directly from Google Sheets for seamless updates.</p>
          <button className="text-xs px-3 py-1.5 rounded-md bg-secondary text-muted-foreground cursor-not-allowed opacity-50">Coming Soon</button>
        </div>
      </div>
    </div>
  );
};

export default Index;
