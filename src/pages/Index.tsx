import { useState } from "react";
import { DollarSign, Users, Star, TrendingUp, ArrowUpRight, Calendar, Clock, MessageSquare, Plug, FileSpreadsheet, Pencil, Check } from "lucide-react";
import { teamMembers, tasks, shiftSchedule, massMessages, chatterColors, modelColors } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const today = "Wednesday";

interface EditableKPI {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: any;
}

const Index = () => {
  // Calculate chatter stats from team data
  const onlineChatters = teamMembers.filter(m => m.status === "online" || m.status === "busy").length;
  const avgQuality = (teamMembers.reduce((sum, m) => sum + m.qualityScore, 0) / teamMembers.length).toFixed(1);
  const totalTasks = teamMembers.reduce((sum, m) => sum + m.weeklyTasks, 0);
  const completedTasks = teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0);
  const totalChatterRevenue = teamMembers.reduce((sum, m) => sum + m.revenueGenerated, 0);

  const [kpis, setKpis] = useState<EditableKPI[]>([
    { title: "Chatters Online", value: `${onlineChatters}/${teamMembers.length}`, change: `${onlineChatters} active now`, changeType: "neutral", icon: Users },
    { title: "Avg Quality Score", value: `${avgQuality}/10`, change: "+0.3 from last week", changeType: "positive", icon: Star },
    { title: "Tasks Completed", value: `${completedTasks}/${totalTasks}`, change: `${Math.round(completedTasks/totalTasks*100)}% completion rate`, changeType: "neutral", icon: TrendingUp },
    { title: "Chatter Revenue", value: `$${totalChatterRevenue.toLocaleString()}`, change: "This week combined", changeType: "positive", icon: DollarSign },
  ]);
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
  // Clear placeholder data - will be populated with real data via API
  const upcomingMessages: typeof massMessages = [];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your chatting team performance</p>
      </div>

      {/* Chatter KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
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
                    {m.clockedIn ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-success">In since {m.clockInTime}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Clocked out</span>
                      </>
                    )}
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
            {tasks.slice(0, 5).map((task) => (
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
            ))}
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

      {/* Integration Placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3 border-dashed">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Infloww Data Sync</h3>
          </div>
          <p className="text-xs text-muted-foreground">Connect your Infloww account to automatically sync revenue data, subscriber counts, and message analytics.</p>
          <button className="text-xs px-3 py-1.5 rounded-md bg-secondary text-muted-foreground cursor-not-allowed opacity-50">Coming Soon</button>
        </div>
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
