import { useState, useMemo } from "react";
import { ClipboardList, Plus, CheckCircle2, Filter, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTasks,
  addTask,
  markCompletion,
  deleteTask,
  getCompletionsThisWeek,
  CATEGORY_LABELS,
  type TaskCategory,
  type TaskStatus,
  type ChatterTask,
} from "@/lib/chatterTasksStore";

const CHATTERS = ["Marc", "JD", "Jemimah", "KC", "Jane"];
const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];

const categoryColor: Record<TaskCategory, string> = {
  conversation_flow: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ppv_timing: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  personalisation: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  response_time: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  aftercare: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  energy_tone: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function ChatterTasks() {
  const { user } = useAuth();
  const isSupervisor = user?.role === "admin" || user?.role === "supervisor";

  // Force re-render on data changes
  const [rev, setRev] = useState(0);
  const bump = () => setRev((r) => r + 1);

  // Filters
  const [filterChatter, setFilterChatter] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Assign form state
  const [open, setOpen] = useState(false);
  const [newChatter, setNewChatter] = useState(CHATTERS[0]);
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("conversation_flow");
  const [newTarget, setNewTarget] = useState(10);

  const tasks = useMemo(() => {
    void rev; // dependency
    return getTasks();
  }, [rev]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterChatter !== "all" && t.chatter_name !== filterChatter) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, filterChatter, filterCategory, filterStatus]);

  // Group by chatter
  const grouped = useMemo(() => {
    const map: Record<string, ChatterTask[]> = {};
    for (const t of filtered) {
      (map[t.chatter_name] ??= []).push(t);
    }
    // Sort chatters alphabetically
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleAssign = () => {
    if (!newTask.trim()) return;
    addTask(newChatter, newTask.trim(), newCategory, newTarget, user?.displayName || "Unknown");
    setNewTask("");
    setNewTarget(10);
    setOpen(false);
    bump();
  };

  const handleMarkCompletion = (id: string) => {
    markCompletion(id);
    bump();
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    bump();
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Chatter Task Repetition
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track recurring tasks — chatters must complete each task {`10–15`} times before it's done.
          </p>
        </div>

        {isSupervisor && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Assign Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Chatter</Label>
                  <Select value={newChatter} onValueChange={setNewChatter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CHATTERS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Task Description</Label>
                  <Input
                    placeholder="e.g. Use personalised greetings instead of generic openers"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newCategory} onValueChange={(v) => setNewCategory(v as TaskCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Completions</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleAssign} className="w-full">Assign Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterChatter} onValueChange={setFilterChatter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Chatter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chatters</SelectItem>
            {CHATTERS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[170px] h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task groups by chatter */}
      {grouped.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">
          No tasks found. {isSupervisor && "Click \"Assign Task\" to get started."}
        </div>
      ) : (
        grouped.map(([chatter, chatterTasks]) => (
          <div key={chatter} className="glass-card p-5 space-y-4">
            <h2 className="text-lg font-semibold">{chatter}</h2>
            <div className="space-y-3">
              {chatterTasks.map((t) => {
                const pct = Math.round((t.current_completions / t.target_completions) * 100);
                const thisWeek = getCompletionsThisWeek(t);
                const isComplete = t.status === "completed";

                return (
                  <div
                    key={t.id}
                    className={`rounded-lg border p-4 space-y-3 ${
                      isComplete
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border/50 bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                          {t.task}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <Badge variant="outline" className={`text-[10px] ${categoryColor[t.category]}`}>
                            {CATEGORY_LABELS[t.category]}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Assigned by {t.assigned_by} · {new Date(t.assigned_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                          {thisWeek > 0 && (
                            <span className="text-[10px] text-emerald-400">+{thisWeek} this week</span>
                          )}
                          {!isComplete && thisWeek === 0 && (
                            <span className="text-[10px] text-red-400">No progress this week</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isComplete ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                          </Badge>
                        ) : (
                          <>
                            {isSupervisor && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleMarkCompletion(t.id)}
                              >
                                <CheckCircle2 className="h-3 w-3" /> Mark Completion
                              </Button>
                            )}
                          </>
                        )}
                        {isSupervisor && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDelete(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{t.current_completions}/{t.target_completions} completions</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress
                        value={pct}
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
