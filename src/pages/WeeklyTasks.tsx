import { useState, useEffect } from "react";
import { teamMembers, chatterColors } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ListTodo } from "lucide-react";

interface WeeklyTask {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
  category: string;
}

const initialTasks: WeeklyTask[] = [
  // Mandatory Training tasks for all chatters
  { id: "wt_train_jane", title: "📚 Review Knowledge Base + complete weekly training quiz", assignee: "Jane", completed: false, category: "Training" },
  { id: "wt_train_marc", title: "📚 Review Knowledge Base + complete weekly training quiz", assignee: "Marc", completed: false, category: "Training" },
  { id: "wt_train_jd", title: "📚 Review Knowledge Base + complete weekly training quiz", assignee: "Jaydee", completed: false, category: "Training" },
  { id: "wt_train_jem", title: "📚 Review Knowledge Base + complete weekly training quiz", assignee: "Jemimah", completed: false, category: "Training" },
  { id: "wt_train_kc", title: "📚 Review Knowledge Base + complete weekly training quiz", assignee: "KC", completed: false, category: "Training" },
  { id: "wt1", title: "Create a whale (subscriber spending $500+)", assignee: "Jane", completed: false, category: "Revenue" },
  { id: "wt2", title: "Hit $500 daily revenue target", assignee: "Jane", completed: false, category: "Revenue" },
  { id: "wt3", title: "Use 3 upsell techniques in one conversation", assignee: "Marc", completed: true, category: "Technique" },
  { id: "wt4", title: "Complete the PPV script for Izzy", assignee: "Marc", completed: false, category: "Script" },
  { id: "wt5", title: "Create a whale (subscriber spending $500+)", assignee: "Jaydee", completed: false, category: "Revenue" },
  { id: "wt6", title: "Use the rapport-building technique 5 times", assignee: "Jaydee", completed: false, category: "Technique" },
  { id: "wt7", title: "Complete the opening message script", assignee: "Jaydee", completed: true, category: "Script" },
  { id: "wt8", title: "Hit $300 daily revenue target", assignee: "Jemimah", completed: true, category: "Revenue" },
  { id: "wt9", title: "Use the VIP treatment technique on 3 subs", assignee: "Jemimah", completed: false, category: "Technique" },
  { id: "wt10", title: "Complete the upsell script for Willow", assignee: "Jemimah", completed: false, category: "Script" },
  { id: "wt11", title: "Send 50 personalized openers", assignee: "Jane", completed: true, category: "Technique" },
  { id: "wt12", title: "Complete Willow mass message script", assignee: "KC", completed: false, category: "Script" },
  { id: "wt13", title: "Review and update whale profiles", assignee: "KC", completed: false, category: "Script" },
  { id: "wt14", title: "Hit $400 daily revenue target", assignee: "KC", completed: false, category: "Revenue" },
];

const categoryColors: Record<string, string> = {
  Revenue: "bg-primary/20 text-primary",
  Technique: "bg-accent/20 text-accent",
  Script: "bg-warning/20 text-warning",
  Training: "bg-purple-500/20 text-purple-400",
};

export default function WeeklyTasks() {
  const [tasks, setTasks] = useState<WeeklyTask[]>(() => {
    const saved = localStorage.getItem("chatter-weekly-tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  useEffect(() => {
    localStorage.setItem("chatter-weekly-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const chatters = ["Jane", "Marc", "Jaydee", "Jemimah", "KC"];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly Tasks</h1>
        <p className="text-muted-foreground text-sm mt-1">Task assignments for the current week</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {chatters.map(name => {
          const memberTasks = tasks.filter(t => t.assignee === name);
          const done = memberTasks.filter(t => t.completed).length;
          const color = chatterColors[name];
          return (
            <div key={name} className="glass-card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-lg font-bold">{done}/{memberTasks.length}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {done === memberTasks.length ? "All complete ✓" : `${memberTasks.length - done} remaining`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tasks by chatter */}
      <div className="space-y-4">
        {chatters.map(name => {
          const memberTasks = tasks.filter(t => t.assignee === name);
          const color = chatterColors[name];
          return (
            <div key={name} className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {teamMembers.find(m => m.name === name)?.role}
                  </p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  {memberTasks.filter(t => t.completed).length}/{memberTasks.length} done
                </span>
              </div>
              <div className="space-y-1.5">
                {memberTasks.map(task => (
                  <label
                    key={task.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      task.completed ? "bg-success/5 border border-success/20" : "bg-secondary/30 border border-transparent hover:border-border/50"
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <span className={`text-sm flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${categoryColors[task.category] || ""}`}>
                      {task.category}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
