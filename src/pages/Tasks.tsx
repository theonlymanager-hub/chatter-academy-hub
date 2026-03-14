import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Check,
  X,
  Clock,
  Link2,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  category: string;
  proof?: string;
}

interface ChatterInfo {
  name: string;
  shift: string;
  shiftTime: string;
  gradient: string;
  accent: string;
}

const chattersInfo: ChatterInfo[] = [
  { name: "Marc", shift: "Morning", shiftTime: "6 AM – 2 PM", gradient: "from-blue-500/20 to-cyan-500/20", accent: "text-blue-400" },
  { name: "JD", shift: "Afternoon", shiftTime: "2 PM – 10 PM", gradient: "from-violet-500/20 to-purple-500/20", accent: "text-violet-400" },
  { name: "Jemimah", shift: "Afternoon", shiftTime: "2 PM – 10 PM", gradient: "from-pink-500/20 to-rose-500/20", accent: "text-pink-400" },
  { name: "KC", shift: "Night", shiftTime: "10 PM – 6 AM", gradient: "from-amber-500/20 to-orange-500/20", accent: "text-amber-400" },
  { name: "Jane", shift: "Night", shiftTime: "10 PM – 6 AM", gradient: "from-emerald-500/20 to-teal-500/20", accent: "text-emerald-400" },
];

const defaultTasks: Task[] = [
  { id: "1", title: "Review morning shift conversations", assignee: "Jane", status: "pending", priority: "high", dueDate: "Today", category: "Revenue" },
  { id: "2", title: "Send PPV follow-ups to inactive fans", assignee: "Marc", status: "in-progress", priority: "medium", dueDate: "Today", category: "Technique" },
  { id: "3", title: "Update fan profile notes", assignee: "Jemimah", status: "completed", priority: "low", dueDate: "Yesterday", category: "Script" },
  { id: "4", title: "Check DM response times", assignee: "JD", status: "pending", priority: "high", dueDate: "Today", category: "Revenue" },
  { id: "5", title: "Send welcome messages to new subs", assignee: "KC", status: "pending", priority: "medium", dueDate: "Today", category: "Technique" },
  { id: "6", title: "Create a whale (subscriber spending $500+)", assignee: "Jane", status: "pending", priority: "high", dueDate: "This Week", category: "Revenue" },
  { id: "7", title: "Hit $500 daily revenue target", assignee: "Jane", status: "pending", priority: "high", dueDate: "This Week", category: "Revenue" },
  { id: "8", title: "Use 3 upsell techniques in one conversation", assignee: "Marc", status: "completed", priority: "medium", dueDate: "This Week", category: "Technique" },
  { id: "9", title: "Complete the PPV script for Izzy", assignee: "Marc", status: "pending", priority: "medium", dueDate: "This Week", category: "Script" },
  { id: "10", title: "Create a whale (subscriber spending $500+)", assignee: "JD", status: "pending", priority: "high", dueDate: "This Week", category: "Revenue" },
  { id: "11", title: "Use the rapport-building technique 5 times", assignee: "JD", status: "pending", priority: "medium", dueDate: "This Week", category: "Technique" },
  { id: "12", title: "Complete the opening message script", assignee: "JD", status: "completed", priority: "low", dueDate: "This Week", category: "Script" },
  { id: "13", title: "Hit $300 daily revenue target", assignee: "Jemimah", status: "completed", priority: "high", dueDate: "This Week", category: "Revenue" },
  { id: "14", title: "Use the VIP treatment technique on 3 subs", assignee: "Jemimah", status: "pending", priority: "medium", dueDate: "This Week", category: "Technique" },
  { id: "15", title: "Complete the upsell script for Willow", assignee: "Jemimah", status: "pending", priority: "medium", dueDate: "This Week", category: "Script" },
  { id: "16", title: "Complete Willow mass message script", assignee: "KC", status: "pending", priority: "medium", dueDate: "This Week", category: "Script" },
  { id: "17", title: "Review and update whale profiles", assignee: "KC", status: "pending", priority: "low", dueDate: "This Week", category: "Script" },
  { id: "18", title: "Hit $400 daily revenue target", assignee: "KC", status: "pending", priority: "high", dueDate: "This Week", category: "Revenue" },
];

const priorityConfig = {
  high: { label: "High", className: "border-red-500/50 text-red-400 bg-red-500/10" },
  medium: { label: "Med", className: "border-amber-500/50 text-amber-400 bg-amber-500/10" },
  low: { label: "Low", className: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" },
};

const categoryColors: Record<string, string> = {
  Revenue: "border-primary/50 text-primary bg-primary/10",
  Technique: "border-violet-500/50 text-violet-400 bg-violet-500/10",
  Script: "border-amber-500/50 text-amber-400 bg-amber-500/10",
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [proofDialog, setProofDialog] = useState<{ taskId: string; current: string } | null>(null);
  const [proofInput, setProofInput] = useState("");
  const [collapsedChatters, setCollapsedChatters] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    assignee: string;
    priority: "low" | "medium" | "high";
    category: string;
  }>({ title: "", assignee: "", priority: "medium", category: "Revenue" });

  useEffect(() => {
    const saved = localStorage.getItem("chatter-tasks-merged");
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks(defaultTasks);
      localStorage.setItem("chatter-tasks-merged", JSON.stringify(defaultTasks));
    }
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("chatter-tasks-merged", JSON.stringify(tasks));
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
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignee: newTask.assignee,
      status: "pending",
      priority: newTask.priority,
      dueDate: "This Week",
      category: newTask.category,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask({ title: "", assignee: "", priority: "medium", category: "Revenue" });
    setShowAddForm(false);
  };

  const saveProof = () => {
    if (!proofDialog) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === proofDialog.taskId ? { ...t, proof: proofInput || undefined } : t))
    );
    setProofDialog(null);
    setProofInput("");
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
    <div className={`space-y-6 max-w-7xl transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chatter Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {completedTasks}/{totalTasks} tasks completed · {overallPercent}% done
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
          <span className="text-sm font-medium">Overall Team Progress</span>
          <span className="text-sm font-bold text-amber-400">{overallPercent}%</span>
        </div>
        <Progress value={overallPercent} className="h-2" />
      </div>

      {/* Add task form */}
      {showAddForm && (
        <div className="glass-card p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            New Task
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input
              placeholder="Task description..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="md:col-span-2"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Assign to...</option>
              {chattersInfo.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="Revenue">Revenue</option>
              <option value="Technique">Technique</option>
              <option value="Script">Script</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={addTask} size="sm" className="gap-1"><Check className="h-3 w-3" /> Save</Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="gap-1"><X className="h-3 w-3" /> Cancel</Button>
          </div>
        </div>
      )}

      {/* Chatter Cards */}
      <div className="space-y-5">
        {chattersInfo.map((chatter, idx) => {
          const chatterTasks = tasks.filter((t) => t.assignee === chatter.name);
          const done = chatterTasks.filter((t) => t.status === "completed").length;
          const total = chatterTasks.length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          const isCollapsed = collapsedChatters.has(chatter.name);

          return (
            <div
              key={chatter.name}
              className="glass-card overflow-hidden transition-all duration-300 hover:border-border"
              style={{
                animationDelay: `${idx * 80}ms`,
                animation: mounted ? `fadeSlideIn 0.4s ease-out ${idx * 80}ms both` : "none",
              }}
            >
              {/* Card header */}
              <div className={`bg-gradient-to-r ${chatter.gradient} px-5 py-4 border-b border-border/30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-background/60 border border-border/50 flex items-center justify-center">
                      <User className={`h-5 w-5 ${chatter.accent}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{chatter.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {chatter.shift} · {chatter.shiftTime}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => toggleCollapse(chatter.name)} className="p-1.5 hover:bg-background/40 rounded-lg transition-colors">
                    {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{done}/{total} complete</span>
                    <span className={`text-xs font-bold ${chatter.accent}`}>{percent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-background/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percent}%`, background: `linear-gradient(90deg, hsl(217 91% 60%), hsl(160 84% 39%))` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task list */}
              {!isCollapsed && (
                <div className="px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {chatterTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No tasks assigned</p>
                  ) : (
                    chatterTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`group flex items-start gap-3 py-2.5 px-2 rounded-lg transition-all duration-300 hover:bg-muted/30 ${task.status === "completed" ? "opacity-60" : ""}`}
                      >
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug transition-all duration-300 ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityConfig[task.priority].className}`}>
                              {priorityConfig[task.priority].label}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryColors[task.category] || ""}`}>
                              {task.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Due: {task.dueDate}</span>
                            {task.proof ? (
                              <button
                                onClick={() => { setProofDialog({ taskId: task.id, current: task.proof || "" }); setProofInput(task.proof || ""); }}
                                className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <ImageIcon className="h-3 w-3" />
                                Proof ✓
                              </button>
                            ) : (
                              <button
                                onClick={() => { setProofDialog({ taskId: task.id, current: "" }); setProofInput(""); }}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Link2 className="h-3 w-3" />
                                Add Proof
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                          title="Delete task"
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

      {/* Proof Dialog */}
      <Dialog open={!!proofDialog} onOpenChange={(open) => { if (!open) { setProofDialog(null); setProofInput(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Proof</DialogTitle>
            <DialogDescription>Paste a screenshot URL or add a note as proof of task completion.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="https://screenshot-url.com/proof.png or a note..."
              value={proofInput}
              onChange={(e) => setProofInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveProof()}
            />
            {proofInput && proofInput.startsWith("http") && (
              <div className="rounded-lg border border-border overflow-hidden">
                <img src={proofInput} alt="Proof preview" className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setProofDialog(null); setProofInput(""); }}>Cancel</Button>
            <Button size="sm" onClick={saveProof}>Save Proof</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
