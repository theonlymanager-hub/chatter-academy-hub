import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
}

interface ChatterInfo {
  name: string;
  shift: string;
  shiftTime: string;
}

const chattersInfo: ChatterInfo[] = [
  { name: "Marc", shift: "Morning", shiftTime: "6 AM – 2 PM" },
  { name: "JD", shift: "Afternoon", shiftTime: "2 PM – 10 PM" },
  { name: "Jemimah", shift: "Afternoon", shiftTime: "2 PM – 10 PM" },
  { name: "KC", shift: "Night", shiftTime: "10 PM – 6 AM" },
  { name: "Jane", shift: "Night", shiftTime: "10 PM – 6 AM" },
];

const MAX_TASKS_PER_CHATTER = 5;

const defaultTasks: Task[] = [
  { id: "1", title: "Review morning shift conversations", assignee: "Jane", status: "pending", priority: "high" },
  { id: "2", title: "Send PPV follow-ups to inactive fans", assignee: "Marc", status: "pending", priority: "medium" },
  { id: "3", title: "Update fan profile notes", assignee: "Jemimah", status: "completed", priority: "low" },
  { id: "4", title: "Check DM response times", assignee: "JD", status: "pending", priority: "high" },
  { id: "5", title: "Send welcome messages to new subs", assignee: "KC", status: "pending", priority: "medium" },
  { id: "6", title: "Create a whale (subscriber spending $500+)", assignee: "Jane", status: "pending", priority: "high" },
  { id: "7", title: "Hit $500 daily revenue target", assignee: "Jane", status: "pending", priority: "high" },
  { id: "8", title: "Use 3 upsell techniques in one conversation", assignee: "Marc", status: "completed", priority: "medium" },
  { id: "9", title: "Complete the PPV script for Izzy", assignee: "Marc", status: "pending", priority: "medium" },
  { id: "10", title: "Create a whale (subscriber spending $500+)", assignee: "JD", status: "pending", priority: "high" },
  { id: "11", title: "Use the rapport-building technique 5 times", assignee: "JD", status: "pending", priority: "medium" },
  { id: "13", title: "Hit $300 daily revenue target", assignee: "Jemimah", status: "completed", priority: "high" },
  { id: "14", title: "Use the VIP treatment technique on 3 subs", assignee: "Jemimah", status: "pending", priority: "medium" },
  { id: "16", title: "Complete Willow mass message script", assignee: "KC", status: "pending", priority: "medium" },
  { id: "18", title: "Hit $400 daily revenue target", assignee: "KC", status: "pending", priority: "high" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [collapsedChatters, setCollapsedChatters] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    assignee: string;
    priority: "low" | "medium" | "high";
  }>({ title: "", assignee: "", priority: "medium" });

  useEffect(() => {
    const saved = localStorage.getItem("chatter-tasks-v2");
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks(defaultTasks);
      localStorage.setItem("chatter-tasks-v2", JSON.stringify(defaultTasks));
    }
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("chatter-tasks-v2", JSON.stringify(tasks));
    }
  }, [tasks]);

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return { ...t, status: t.status === "completed" ? "pending" : "completed" };
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = () => {
    if (!newTask.title.trim() || !newTask.assignee) return;
    // Enforce max 5 tasks per chatter
    const assigneeTasks = tasks.filter(t => t.assignee === newTask.assignee);
    if (assigneeTasks.length >= MAX_TASKS_PER_CHATTER) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignee: newTask.assignee,
      status: "pending",
      priority: newTask.priority,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask({ title: "", assignee: "", priority: "medium" });
    setShowAddForm(false);
  };

  const toggleCollapse = (name: string) => {
    setCollapsedChatters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={`space-y-5 max-w-4xl transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chatter Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {completedTasks}/{totalTasks} completed · {overallPercent}%
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Overall progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Team Progress</span>
          <span className="text-sm font-bold text-primary">{overallPercent}%</span>
        </div>
        <Progress value={overallPercent} className="h-2" />
      </div>

      {/* Add task form */}
      {showAddForm && (
        <div className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Task description..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="sm:col-span-1"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Assign to...</option>
              {chattersInfo.map((c) => {
                const count = tasks.filter(t => t.assignee === c.name).length;
                return (
                  <option key={c.name} value={c.name} disabled={count >= MAX_TASKS_PER_CHATTER}>
                    {c.name} ({count}/{MAX_TASKS_PER_CHATTER})
                  </option>
                );
              })}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={addTask} size="sm" className="gap-1"><Check className="h-3 w-3" /> Save</Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="gap-1"><X className="h-3 w-3" /> Cancel</Button>
          </div>
        </div>
      )}

      {/* Chatter Cards */}
      <div className="space-y-3">
        {chattersInfo.map((chatter) => {
          const chatterTasks = tasks.filter((t) => t.assignee === chatter.name).slice(0, MAX_TASKS_PER_CHATTER);
          const done = chatterTasks.filter((t) => t.status === "completed").length;
          const total = chatterTasks.length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          const isCollapsed = collapsedChatters.has(chatter.name);

          return (
            <div key={chatter.name} className="glass-card overflow-hidden">
              {/* Card header */}
              <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {chatter.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{chatter.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{chatter.shift} · {chatter.shiftTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{done}/{total}</span>
                    <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="font-medium text-primary">{percent}%</span>
                  </div>
                  <button onClick={() => toggleCollapse(chatter.name)} className="p-1 hover:bg-secondary rounded transition-colors">
                    {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              {/* Task list */}
              {!isCollapsed && (
                <div className="px-4 py-2 space-y-0.5">
                  {chatterTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No tasks assigned</p>
                  ) : (
                    chatterTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`group flex items-center gap-3 py-2 px-2 rounded-md hover:bg-secondary/20 transition-colors ${task.status === "completed" ? "opacity-50" : ""}`}
                      >
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                        />
                        <span className={`text-sm flex-1 ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
