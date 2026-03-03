import { shiftSchedule } from "@/lib/mock-data";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const shifts = ["morning", "afternoon", "night"] as const;
const shiftLabels = { morning: "6AM–2PM", afternoon: "2PM–10PM", night: "10PM–6AM" };
const shiftColors = { morning: "bg-primary/20 text-primary", afternoon: "bg-warning/20 text-warning", night: "bg-accent/20 text-accent" };

export default function ShiftCalendar() {
  const getShift = (day: string, shift: string) =>
    shiftSchedule.filter((s) => s.day === day && s.shift === shift);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shift Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Weekly shift schedule</p>
      </div>

      <div className="glass-card overflow-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground p-3 w-24">Shift</th>
              {days.map((day) => (
                <th key={day} className="text-left text-xs font-medium text-muted-foreground p-3">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift} className="border-b border-border/30 last:border-0">
                <td className="p-3">
                  <div className="text-xs font-medium capitalize">{shift}</div>
                  <div className="text-[10px] text-muted-foreground">{shiftLabels[shift]}</div>
                </td>
                {days.map((day) => {
                  const entries = getShift(day, shift);
                  return (
                    <td key={day} className="p-2">
                      {entries.length > 0 ? (
                        <div className="space-y-1">
                          {entries.map((e) => (
                            <div key={e.id} className={`text-xs px-2 py-1.5 rounded-md ${shiftColors[shift]}`}>
                              {e.memberName}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground/30 text-center">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 flex-wrap">
        {shifts.map((shift) => (
          <div key={shift} className="flex items-center gap-2 text-xs">
            <div className={`h-3 w-3 rounded ${shiftColors[shift].split(" ")[0]}`} />
            <span className="capitalize text-muted-foreground">{shift} ({shiftLabels[shift]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
