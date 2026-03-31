import { teamMembers } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function TeamList() {
  const supervisors = teamMembers.filter(m => m.category === "supervisor");
  const dashboardManagers = teamMembers.filter(m => m.category === "dashboard_manager");
  const management = teamMembers.filter(m => m.category === "management");
  const all = [...management, ...supervisors, ...dashboardManagers];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team List</h1>
        <p className="text-muted-foreground text-sm mt-1">Supervisors, managers, and support staff</p>
      </div>

      <div className="space-y-2">
        {all.map((member) => (
          <div key={member.id} className="glass-card p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {member.avatar}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
            <Badge variant="outline" className="text-xs capitalize">{member.category?.replace("_", " ")}</Badge>
            {member.shiftTimes && (
              <Badge variant="outline" className="text-xs text-muted-foreground">🕐 {member.shiftTimes}</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
