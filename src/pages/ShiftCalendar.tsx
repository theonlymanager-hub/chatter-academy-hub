import { useState } from "react";
import { shiftSchedule, chatterColors } from "@/lib/mock-data";
import { Clock } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const shiftTypes = ["morning", "afternoon", "night"] as const;
const shiftLabels = { morning: "6AM–2PM", afternoon: "2PM–10PM", night: "10PM–6AM" };
const chatters = ["Jane", "Kenneth", "Jaydee", "Jemimah"];

export default function ShiftCalendar() {
  const [view, setView] = useState<"grid" | "chatter">("grid");

  const getShift = (day: string, shift: string) =>
    shiftSchedule.filter((s) => s.day === day && s.shift === shift);

  const getChatterShifts = (name: string) =>
    shiftSchedule.filter((s) => s.memberName === name);

  const getWeeklyHours = (name: string) => getChatterShifts(name).length * 8;



  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shift Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Weekly chatter shift schedule</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <button onClick={() => setView("grid")} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Grid View
          </button>
          <button onClick={() => setView("chatter")} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === "chatter" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            By Chatter
          </button>
        </div>
      </div>

      {/* Weekly Hours Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {chatters.map((name) => {
          const hours = getWeeklyHours(name);
          const color = chatterColors[name];
          return (
            <div key={name} className="glass-card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-lg font-bold">{hours}h</span>
                <span className="text-xs text-muted-foreground">/ week</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{getChatterShifts(name).length} shifts</p>
            </div>
          );
        })}
      </div>

      {view === "grid" ? (
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
              {shiftTypes.map((shift) => (
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
                            {entries.map((e) => {
                              const color = chatterColors[e.memberName] || "217 91% 60%";
                              return (
                                <div key={e.id} className="text-xs px-2 py-1.5 rounded-md border" style={{ backgroundColor: `hsl(${color} / 0.15)`, borderColor: `hsl(${color} / 0.3)`, color: `hsl(${color})` }}>
                                  <div className="font-medium">{e.memberName}</div>
                                  <div className="text-[10px] opacity-70">{e.startTime} – {e.endTime}</div>
                                </div>
                              );
                            })}
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
      ) : (
        <div className="space-y-4">
          {chatters.map((name) => {
            const memberShifts = getChatterShifts(name);
            const color = chatterColors[name];
            return (
              <div key={name} className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-[10px] text-muted-foreground">{getWeeklyHours(name)}h / week • {memberShifts.length} shifts</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day) => {
                    const dayShifts = memberShifts.filter((s) => s.day === day);
                    return (
                      <div key={day} className="text-center">
                        <div className="text-[10px] text-muted-foreground mb-1">{day.slice(0, 3)}</div>
                        {dayShifts.length > 0 ? (
                          dayShifts.map((s) => (
                            <div key={s.id} className="text-[10px] px-1 py-1 rounded" style={{ backgroundColor: `hsl(${color} / 0.15)`, color: `hsl(${color})` }}>
                              {s.startTime.replace(":00", "")}
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-muted-foreground/20">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {chatters.map((name) => (
          <div key={name} className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${chatterColors[name]})` }} />
            <span className="text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>


    </div>
  );
}
