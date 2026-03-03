import { DollarSign, Users, Star, TrendingUp, ArrowUpRight, Calendar } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { teamMembers, tasks } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";

const models = [
  { name: "Izzy", theme: "Military", color: "hsl(var(--primary))", days: ["Monday", "Wednesday", "Friday"] },
  { name: "Willow", theme: "Playful Redhead", color: "hsl(var(--accent))", days: ["Monday", "Wednesday", "Friday"] },
  { name: "Lucinda Bleu", theme: "Goth Aesthetic", color: "hsl(270 60% 60%)", days: ["Monday", "Wednesday", "Friday"] },
  { name: "Ashley Morris", theme: "College", color: "hsl(30 80% 55%)", days: ["Monday", "Wednesday", "Friday"] },
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Index = () => {
  const totalRevenue = teamMembers.reduce((sum, m) => sum + m.revenueGenerated, 0);
  const avgQuality = (teamMembers.reduce((sum, m) => sum + m.qualityScore, 0) / teamMembers.length).toFixed(1);
  const activeChatters = teamMembers.filter((m) => m.status === "online").length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your chatting team performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+12.5% from last week" changeType="positive" icon={DollarSign} />
        <MetricCard title="Active Chatters" value={`${activeChatters}/${teamMembers.length}`} change="3 online now" changeType="neutral" icon={Users} />
        <MetricCard title="Avg Quality Score" value={`${avgQuality}/10`} change="+0.3 from last week" changeType="positive" icon={Star} />
        <MetricCard title="Tasks Completed" value={`${completedTasks}/${tasks.length}`} change={`${Math.round((completedTasks / tasks.length) * 100)}% completion rate`} changeType="neutral" icon={TrendingUp} />
      </div>

      {/* Mass Message Schedule */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Mass Message Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-xs font-medium text-muted-foreground">Model</div>
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-xs font-medium text-muted-foreground text-center">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>
            {/* Model rows */}
            {models.map((model) => (
              <div key={model.name} className="grid grid-cols-8 gap-1 mb-1">
                <div className="p-2 flex flex-col justify-center">
                  <span className="text-sm font-medium truncate">{model.name}</span>
                  <span className="text-[10px] text-muted-foreground">{model.theme}</span>
                </div>
                {weekDays.map((day) => {
                  const isScheduled = model.days.includes(day);
                  return (
                    <div
                      key={day}
                      className={`rounded-md p-2 text-center flex items-center justify-center transition-colors ${
                        isScheduled
                          ? "bg-secondary border border-border"
                          : "bg-transparent"
                      }`}
                    >
                      {isScheduled && (
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: model.color }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
          {models.map((model) => (
            <div key={model.name} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: model.color }} />
              <span className="text-xs text-muted-foreground">{model.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-4">
          <h2 className="font-semibold">Top Performers</h2>
          <div className="space-y-3">
            {[...teamMembers]
              .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
              .slice(0, 4)
              .map((member, i) => (
                <div key={member.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
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
              ))}
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

      <div className="glass-card p-5 space-y-4">
        <h2 className="font-semibold">Training Progress</h2>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
