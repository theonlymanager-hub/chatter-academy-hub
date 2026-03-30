// Chatter Task Repetition System — localStorage data layer

export type TaskCategory =
  | "conversation_flow"
  | "ppv_timing"
  | "personalisation"
  | "response_time"
  | "aftercare"
  | "energy_tone";

export type TaskStatus = "in_progress" | "completed";

export interface ChatterTask {
  id: string;
  chatter_name: string;
  task: string;
  category: TaskCategory;
  target_completions: number;
  current_completions: number;
  completion_dates: string[]; // ISO date strings YYYY-MM-DD
  assigned_by: string;
  assigned_at: string; // ISO datetime
  status: TaskStatus;
  source: string;
}

const STORAGE_KEY = "chatter_tasks";
const SEED_KEY = "chatter_tasks_seeded_v1";

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  conversation_flow: "Conversation Flow",
  ppv_timing: "PPV Timing",
  personalisation: "Personalisation",
  response_time: "Response Time",
  aftercare: "Aftercare",
  energy_tone: "Energy & Tone",
};

// ── helpers ────────────────────────────────────────────────────────────
function uuid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

// ── CRUD ───────────────────────────────────────────────────────────────
export function getTasks(): ChatterTask[] {
  seedIfNeeded();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: ChatterTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function addTask(
  chatter_name: string,
  task: string,
  category: TaskCategory,
  target_completions: number,
  assigned_by: string,
  source = "manual"
): ChatterTask {
  const tasks = getTasks();
  const newTask: ChatterTask = {
    id: uuid(),
    chatter_name,
    task,
    category,
    target_completions,
    current_completions: 0,
    completion_dates: [],
    assigned_by,
    assigned_at: new Date().toISOString(),
    status: "in_progress",
    source,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function markCompletion(taskId: string): ChatterTask | null {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task || task.status === "completed") return null;

  const today = todayISO();
  // Prevent double-marking same day
  if (task.completion_dates.includes(today)) return task;

  task.current_completions += 1;
  task.completion_dates.push(today);

  if (task.current_completions >= task.target_completions) {
    task.status = "completed";
  }

  saveTasks(tasks);
  return task;
}

export function deleteTask(taskId: string) {
  const tasks = getTasks().filter((t) => t.id !== taskId);
  saveTasks(tasks);
}

// ── analytics helpers ──────────────────────────────────────────────────
export function getCompletionsThisWeek(task: ChatterTask): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toLocaleDateString("en-CA");

  return task.completion_dates.filter((d) => d >= mondayStr).length;
}

// No sample data — tasks should be created from real QC reviews
function seedIfNeeded() {
  // no-op
}
