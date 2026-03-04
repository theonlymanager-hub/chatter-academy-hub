import { useState } from "react";
import { shiftSchedule, massMessages, chatterColors, modelColors } from "@/lib/mock-data";
import { Clock, MessageSquare } from "lucide-react";

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

  // Get mass messages grouped by day of week
  const getMessagesByDay = (day: string) => {
    return massMessages.filter(m => m.dayOfWeek === day).reduce((acc, m) => {
      if (!acc.find(x => x.modelName === m.modelName)) acc.push(m);
      return acc;
    }, [] as typeof massMessages);
  };

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

      {/* Mass Message / PPV Schedule */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Mass Message & PPV Schedule</h2>
          <span className="text-[10px] text-muted-foreground ml-auto">So chatters know when to expect message spikes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-28">Model</th>
                {days.map(day => (
                  <th key={day} className="text-center text-xs font-medium text-muted-foreground p-3">{day.slice(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(modelColors).map(([model, color]) => {
                return (
                  <tr key={model} className="border-b border-border/30 last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
                        <span className="text-xs font-medium">{model}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const msgs = getMessagesByDay(day).filter(m => m.modelName === model);
                      return (
                        <td key={day} className="p-2 text-center">
                          {msgs.length > 0 ? (
                            <div className="space-y-1">
                              {msgs.map(m => (
                                <div
                                  key={m.id}
                                  className="text-[10px] px-1.5 py-1 rounded-md border group relative"
                                  style={{ backgroundColor: `hsl(${color} / 0.1)`, borderColor: `hsl(${color} / 0.3)`, color: `hsl(${color})` }}
                                >
                                  <div className="font-medium">MM + PPV</div>
                                  <div className="opacity-60">${m.ppvPrice}</div>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-40">
                                    <div className="bg-popover border border-border rounded-lg p-2 shadow-lg text-left">
                                      <p className="text-[10px] font-medium text-foreground">{m.ppvTitle}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.messagePreview}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
          {Object.entries(modelColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
