import { tasks } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function Tasks() {
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

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task Assignments</h1>
        <p className="text-muted-foreground text-sm mt-1">Weekly tasks and goals</p>
      </div>

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
                <div key={task.id} className="glass-card p-4 space-y-2">
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    <Badge variant="outline" className={`text-[10px] ${task.priority === "high" ? "border-destructive/50 text-destructive" : task.priority === "medium" ? "border-warning/50 text-warning" : ""}`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Due: {task.dueDate}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
