import { useMemo } from "react";
import { ClipboardList, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTasks, getCompletionsThisWeek, type ChatterTask } from "@/lib/chatterTasksStore";

interface ChatterSummary {
  name: string;
  active: number;
  completedThisWeek: number;
  progressThisWeek: number; // total completions logged this week across all tasks
}

export default function ChatterTasksWidget() {
  const navigate = useNavigate();

  const summaries = useMemo<ChatterSummary[]>(() => {
    const tasks = getTasks();
    const map: Record<string, { active: number; completed: number; weekProgress: number }> = {};

    for (const t of tasks) {
      if (!map[t.chatter_name]) {
        map[t.chatter_name] = { active: 0, completed: 0, weekProgress: 0 };
      }
      const thisWeek = getCompletionsThisWeek(t);
      if (t.status === "in_progress") {
        map[t.chatter_name].active++;
        map[t.chatter_name].weekProgress += thisWeek;
      }
      if (t.status === "completed") {
        // Count completions this week even on completed tasks
        map[t.chatter_name].completed++;
      }
    }

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        active: data.active,
        completedThisWeek: data.completed,
        progressThisWeek: data.weekProgress,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  if (summaries.length === 0) return null;

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Task Repetition Tracker</h2>
        </div>
        <button
          onClick={() => navigate("/chatter-tasks")}
          className="text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-2">
        {summaries.map((s) => {
          const onTrack = s.progressThisWeek > 0;
          return (
            <div
              key={s.name}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigate("/chatter-tasks")}
            >
              <div
                className={`h-2 w-2 rounded-full shrink-0 ${
                  s.active === 0
                    ? "bg-emerald-400"
                    : onTrack
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />
              <span className="text-sm font-medium flex-1 truncate">{s.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {s.active} active
              </span>
              <span
                className={`text-[10px] font-medium ${
                  s.active === 0
                    ? "text-emerald-400"
                    : onTrack
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {s.active === 0
                  ? "All done ✓"
                  : onTrack
                  ? `+${s.progressThisWeek} this week`
                  : "No progress"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
