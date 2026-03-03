import { teamMembers } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function TeamMembers() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your chatting team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {member.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${member.status === "online" ? "bg-success" : member.status === "busy" ? "bg-warning" : "bg-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
              <Badge variant="outline" className="ml-auto capitalize text-xs">
                {member.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold">${member.revenueGenerated.toLocaleString()}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Quality</p>
                <p className="text-lg font-bold">{member.qualityScore}<span className="text-xs text-muted-foreground">/10</span></p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Training Progress</span>
                <span className="text-xs font-medium">{member.trainingProgress}%</span>
              </div>
              <Progress value={member.trainingProgress} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tasks: {member.tasksCompleted}/{member.weeklyTasks}</span>
              <span className={member.tasksCompleted === member.weeklyTasks ? "text-success" : ""}>
                {member.tasksCompleted === member.weeklyTasks ? "All done ✓" : `${member.weeklyTasks - member.tasksCompleted} remaining`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
