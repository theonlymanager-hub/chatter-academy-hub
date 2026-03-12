import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
}

const defaultTasks: Task[] = [
  { id: "1", title: "Review morning shift conversations", assignee: "Jane", status: "pending", priority: "high", dueDate: "Today" },
  { id: "2", title: "Send PPV follow-ups to inactive fans", assignee: "Marc", status: "in-progress", priority: "medium", dueDate: "Today" },
  { id: "3", title: "Update fan profile notes", assignee: "Jemimah", status: "completed", priority: "low", dueDate: "Yesterday" },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", assignee: "", priority: "medium" as const });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chatter-tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks(defaultTasks);
      localStorage.setItem("chatter-tasks", JSON.stringify(defaultTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("chatter-tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignee: newTask.assignee || "Unassigned",
      status: "pending",
      priority: newTask.priority,
      dueDate: "Today",
    };
    setTasks([...tasks, task]);
    setNewTask({ title: "", assignee: "", priority: "medium" });
    setShowAddForm(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const cycleStatus = (id: string) => {
    setTasks(tasks.map((t) => {
      if (t.id !== id) return t;
      const next = t.status === "pending" ? "in-progress" : t.status === "in-progress" ? "completed" : "pending";
      return { ...t, status: next };
    }));
  };

  const grouped = {
    pending: tasks.filter((t) => t.status === "pending"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const statusConfig = {
    pending: { label: "Pending", color: "bg-muted-foreground" },
    "in-progress": { label: "In Progress", color: "bg-warning" },
    completed: { label: "Completed", color: "bg-success" },
  } as const;

  const chatters = ["Jane", "Marc", "Jemimah", "KC", "Jaydee", "Zar", "Elle"];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Assignments</h1>
          <p className="text-muted-foreground text-sm mt-1">Weekly tasks and goals</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {showAddForm && (
        <div className="glass-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Task description..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="md:col-span-2"
            />
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Assign to...</option>
              {chatters.map((c) => (
                <option key={c} value={c}>{c}</option>
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
          </div>
          <div className="flex gap-2">
            <Button onClick={addTask} size="sm" className="gap-1">
              <Check className="h-3 w-3" /> Save
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm" className="gap-1">
              <X className="h-3 w-3" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((status) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${statusConfig[status].color}`} />
              <h2 className="font-semibold text-sm">{statusConfig[status].label}</h2>
              <span className="text-xs text-muted-foreground ml-auto">{grouped[status].length}</span>
            </div>
            <div className="space-y-2">
              {grouped[status].map((task) => (
                <div key={task.id} className="glass-card p-4 space-y-2 group relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => cycleStatus(task.id)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                      title="Change status"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
                      title="Delete task"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-snug pr-12">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    <Badge variant="outline" className={`text-[10px] ${task.priority === "high" ? "border-destructive/50 text-destructive" : task.priority === "medium" ? "border-warning/50 text-warning" : ""}`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Due: {task.dueDate}</p>
                </div>
              ))}
              {grouped[status].length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
