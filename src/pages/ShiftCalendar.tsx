import { useState, useMemo, useEffect } from "react";
import { shiftSchedule, chatterColors } from "@/lib/mock-data";
import { Clock, ChevronLeft, ChevronRight, Sun, Sunset, Moon, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Shift definitions ──────────────────────────────────────────────────
const SHIFTS = [
  { key: "morning", label: "Morning", time: "6 AM – 2 PM", startHour: 6, endHour: 14, icon: Sun, color: "blue" },
  { key: "afternoon", label: "Afternoon", time: "2 PM – 10 PM", startHour: 14, endHour: 22, icon: Sunset, color: "green" },
  { key: "night", label: "Night", time: "10 PM – 6 AM", startHour: 22, endHour: 6, icon: Moon, color: "purple" },
] as const;

const SHIFT_STYLES: Record<string, { bg: string; border: string; text: string; badge: string; activeBg: string }> = {
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/25",  text: "text-blue-400",   badge: "bg-blue-500/20 text-blue-300",   activeBg: "bg-blue-500/20" },
  green:  { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300", activeBg: "bg-emerald-500/20" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300", activeBg: "bg-purple-500/20" },
};

const MODEL_ACCOUNTS = [
  { code: "AS", name: "Ashley" },
  { code: "WI", name: "Willow" },
  { code: "IZ", name: "Izzy" },
];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Helpers ────────────────────────────────────────────────────────────
function getWeekDates(offset: number) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getCurrentShiftKey(): string | null {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return "morning";
  if (hour >= 14 && hour < 22) return "afternoon";
  return "night";
}

function isCurrentShift(shiftKey: string): boolean {
  return getCurrentShiftKey() === shiftKey;
}

// ── Component ──────────────────────────────────────────────────────────
export default function ShiftCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(new Date());

  // Live clock tick every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const todayStr = now.toDateString();
  const currentShift = getCurrentShiftKey();
  const isThisWeek = weekOffset === 0;

  const weekLabel = `${weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  // Build lookup: { "Monday-morning": ShiftEntry[] }
  const shiftMap = useMemo(() => {
    const map: Record<string, typeof shiftSchedule> = {};
    for (const entry of shiftSchedule) {
      const key = `${entry.day}-${entry.shift}`;
      if (!map[key]) map[key] = [];
      map[key].push(entry);
    }
    return map;
  }, []);

  // On-duty chatters right now
  const onDutyChatters = useMemo(() => {
    if (!currentShift) return [];
    const todayName = DAY_NAMES[now.getDay() === 0 ? 6 : now.getDay() - 1];
    const entries = shiftMap[`${todayName}-${currentShift}`] || [];
    return entries.map((e) => e.memberName);
  }, [currentShift, shiftMap, now]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shift Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Weekly chatter schedule · All times UK (GMT)</p>
      </div>

      {/* On-Duty Banner */}
      {isThisWeek && onDutyChatters.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="relative flex items-center justify-center">
            <Radio className="h-5 w-5 text-emerald-400" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <span className="text-sm font-semibold text-emerald-400">Currently On Duty</span>
            <span className="text-sm text-slate-300 ml-2">
              {onDutyChatters.join(", ")}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              ({SHIFTS.find((s) => s.key === currentShift)?.label} shift · {SHIFTS.find((s) => s.key === currentShift)?.time})
            </span>
          </div>
        </div>
      )}

      {/* Shift Legend */}
      <div className="flex flex-wrap gap-4">
        {SHIFTS.map((shift) => {
          const style = SHIFT_STYLES[shift.color];
          const Icon = shift.icon;
          const active = isThisWeek && isCurrentShift(shift.key);
          return (
            <div
              key={shift.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${style.border} ${active ? style.activeBg : style.bg} transition-colors`}
            >
              <Icon className={`h-4 w-4 ${style.text}`} />
              <span className={`text-sm font-medium ${style.text}`}>{shift.label}</span>
              <span className="text-xs text-muted-foreground">{shift.time}</span>
              {active && (
                <span className="ml-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        {/* Week navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-card/80">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-semibold">{weekLabel}</h2>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-[11px] text-primary hover:underline"
              >
                Back to this week
              </button>
            )}
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-28 bg-card/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Shift
                  </div>
                </th>
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === todayStr;
                  return (
                    <th
                      key={i}
                      className={`text-center text-xs font-medium p-3 ${
                        isToday
                          ? "bg-primary/5 border-b-2 border-primary"
                          : "bg-card/40"
                      }`}
                    >
                      <div className={`text-[11px] uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {DAY_SHORT[i]}
                      </div>
                      <div className={`text-lg font-bold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>
                        {date.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SHIFTS.map((shift) => {
                const style = SHIFT_STYLES[shift.color];
                const Icon = shift.icon;
                const active = isThisWeek && isCurrentShift(shift.key);

                return (
                  <tr
                    key={shift.key}
                    className={`border-b border-border/20 last:border-0 ${
                      active ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    {/* Shift label cell */}
                    <td className="p-3 bg-card/60">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${style.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${style.text}`} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            {shift.label}
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{shift.time}</div>
                        </div>
                      </div>
                    </td>

                    {/* Day cells */}
                    {weekDates.map((date, i) => {
                      const dayName = DAY_NAMES[i];
                      const entries = shiftMap[`${dayName}-${shift.key}`] || [];
                      const isToday = date.toDateString() === todayStr;
                      const isCurrent = isToday && active;

                      return (
                        <td
                          key={i}
                          className={`p-2 align-top ${isToday ? "bg-primary/[0.03]" : ""}`}
                        >
                          {entries.length > 0 ? (
                            <div className="space-y-1.5">
                              {entries.map((e) => {
                                const chatterColor = chatterColors[e.memberName] || "217 91% 60%";
                                const isOnDuty = isCurrent && onDutyChatters.includes(e.memberName);
                                return (
                                  <div
                                    key={e.id}
                                    className={`relative rounded-lg px-2.5 py-2 border transition-all ${
                                      isCurrent
                                        ? `${style.activeBg} ${style.border} ring-1 ring-inset ring-white/5`
                                        : `${style.bg} ${style.border}`
                                    }`}
                                  >
                                    {/* Live indicator */}
                                    {isOnDuty && (
                                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                      </span>
                                    )}

                                    {/* Chatter name */}
                                    <div className="flex items-center gap-1.5">
                                      <div
                                        className="h-2 w-2 rounded-full shrink-0"
                                        style={{ backgroundColor: `hsl(${chatterColor})` }}
                                      />
                                      <span className="text-xs font-semibold text-slate-200 truncate">
                                        {e.memberName}
                                      </span>
                                    </div>

                                    {/* Model accounts */}
                                    <div className="flex gap-1 mt-1">
                                      {MODEL_ACCOUNTS.map((m) => (
                                        <span
                                          key={m.code}
                                          className={`text-[9px] font-bold px-1 py-0 rounded ${style.badge}`}
                                          title={m.name}
                                        >
                                          {m.code}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Time */}
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                      {e.startTime} – {e.endTime}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground/20 text-center py-3">—</div>
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
      </div>

      {/* Chatter Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
        {["Marc", "Jaydee", "Jemimah", "KC", "Jane"].map((name) => (
          <div key={name} className="flex items-center gap-2 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: `hsl(${chatterColors[name] || "217 91% 60%"})` }}
            />
            <span className="text-muted-foreground">{name}</span>
            {onDutyChatters.includes(name) && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-400">
                ON DUTY
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
