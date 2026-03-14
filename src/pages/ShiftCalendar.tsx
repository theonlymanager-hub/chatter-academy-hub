import { useState, useMemo } from "react";
import { shiftSchedule, chatterColors } from "@/lib/mock-data";
import { Clock, ChevronLeft, ChevronRight, CalendarDays, Repeat, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const shiftTypes = ["morning", "afternoon", "night"] as const;
const shiftLabels = { morning: "6AM–2PM", afternoon: "2PM–10PM", night: "10PM–6AM" };
const shiftIcons = { morning: Sun, afternoon: Clock, night: Moon };
const chatters = ["Jane", "KC", "Jaydee", "Jemimah"];

function getWeekDates(offset: number) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + offset * 7);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ShiftRequest {
  id: string;
  type: "swap" | "day-off" | "coverage";
  chatter: string;
  date: string;
  note: string;
  status: "pending" | "approved" | "denied";
}

const defaultRequests: ShiftRequest[] = [
  { id: "r1", type: "day-off", chatter: "Jane", date: "2026-03-18", note: "Doctor's appointment", status: "pending" },
  { id: "r2", type: "swap", chatter: "KC", date: "2026-03-17", note: "Swap with Jaydee — night → afternoon", status: "approved" },
];

export default function ShiftCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [requests, setRequests] = useState<ShiftRequest[]>(() => {
    const saved = localStorage.getItem("shift-requests");
    return saved ? JSON.parse(saved) : defaultRequests;
  });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState<Omit<ShiftRequest, "id" | "status">>({
    type: "day-off", chatter: chatters[0], date: "", note: "",
  });

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const weekLabel = `${weekDates[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  const getShift = (dayName: string, shift: string) =>
    shiftSchedule.filter((s) => s.day === dayName && s.shift === shift);

  const getChatterShifts = (name: string) =>
    shiftSchedule.filter((s) => s.memberName === name);

  const getWeeklyHours = (name: string) => getChatterShifts(name).length * 8;

  const saveRequests = (reqs: ShiftRequest[]) => {
    setRequests(reqs);
    localStorage.setItem("shift-requests", JSON.stringify(reqs));
  };

  const addRequest = () => {
    if (!newRequest.date || !newRequest.note.trim()) return;
    const req: ShiftRequest = { ...newRequest, id: Date.now().toString(), status: "pending" };
    saveRequests([...requests, req]);
    setNewRequest({ type: "day-off", chatter: chatters[0], date: "", note: "" });
    setShowRequestForm(false);
  };

  const typeColors = {
    swap: "text-blue-400 border-blue-400/40 bg-blue-400/10",
    "day-off": "text-amber-400 border-amber-400/40 bg-amber-400/10",
    coverage: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  };

  const statusBadge = {
    pending: "text-amber-400 border-amber-400/40",
    approved: "text-emerald-400 border-emerald-400/40",
    denied: "text-red-400 border-red-400/40",
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shift Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Weekly chatter shift schedule</p>
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

      {/* Main content: Calendar + Scheduler side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar - takes 2 cols */}
        <div className="lg:col-span-2 glass-card overflow-auto">
          {/* Week navigation */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <h2 className="text-sm font-semibold">{weekLabel}</h2>
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="text-[10px] text-primary hover:underline">
                  Back to this week
                </button>
              )}
            </div>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground p-3 w-24">Shift</th>
                {weekDates.map((date, i) => {
                  const today = new Date();
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <th key={i} className={`text-left text-xs font-medium p-3 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      <div>{dayNames[i].slice(0, 3)}</div>
                      <div className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                        {date.getDate()}
                      </div>
                      <div className="text-[10px]">{date.toLocaleDateString("en-GB", { month: "short" })}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {shiftTypes.map((shift) => {
                const Icon = shiftIcons[shift];
                return (
                  <tr key={shift} className="border-b border-border/30 last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <div>
                          <div className="text-xs font-medium capitalize">{shift}</div>
                          <div className="text-[10px] text-muted-foreground">{shiftLabels[shift]}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date, i) => {
                      const entries = getShift(dayNames[i], shift);
                      return (
                        <td key={i} className="p-2">
                          {entries.length > 0 ? (
                            <div className="space-y-1">
                              {entries.map((e) => {
                                const color = chatterColors[e.memberName] || "217 91% 60%";
                                return (
                                  <div key={e.id} className="text-xs px-2 py-1.5 rounded-md border" style={{ backgroundColor: `hsl(${color} / 0.15)`, borderColor: `hsl(${color} / 0.3)`, color: `hsl(${color})` }}>
                                    <div className="font-medium">{e.memberName}</div>
                                    <div className="text-[10px] opacity-70">{e.startTime}–{e.endTime}</div>
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Shift Scheduler Panel */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Shift Scheduler
            </h3>
            <Button onClick={() => setShowRequestForm(!showRequestForm)} size="sm" variant="outline" className="gap-1">
              <Repeat className="h-3 w-3" /> Request
            </Button>
          </div>

          {showRequestForm && (
            <div className="space-y-3 p-3 rounded-lg border border-border/50 bg-secondary/20 animate-in fade-in duration-200">
              <select
                value={newRequest.type}
                onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as ShiftRequest["type"] })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="day-off">Request Day Off</option>
                <option value="swap">Swap Shift</option>
                <option value="coverage">Assign Coverage</option>
              </select>
              <select
                value={newRequest.chatter}
                onChange={(e) => setNewRequest({ ...newRequest, chatter: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {chatters.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Input type="date" value={newRequest.date} onChange={(e) => setNewRequest({ ...newRequest, date: e.target.value })} className="h-9" />
              <Input
                placeholder="Note (e.g. reason, swap details)..."
                value={newRequest.note}
                onChange={(e) => setNewRequest({ ...newRequest, note: e.target.value })}
                className="h-9"
                onKeyDown={(e) => e.key === "Enter" && addRequest()}
              />
              <div className="flex gap-2">
                <Button onClick={addRequest} size="sm">Submit</Button>
                <Button onClick={() => setShowRequestForm(false)} variant="outline" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          {/* Requests list */}
          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No requests</p>
            ) : (
              requests.map((req) => {
                const color = chatterColors[req.chatter] || "217 91% 60%";
                return (
                  <div key={req.id} className="p-3 rounded-lg border border-border/30 bg-secondary/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                          {req.chatter.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{req.chatter}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${statusBadge[req.status]}`}>{req.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${typeColors[req.type]}`}>
                        {req.type === "day-off" ? "Day Off" : req.type === "swap" ? "Swap" : "Coverage"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(req.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.note}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

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
