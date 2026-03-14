import { useState, useMemo } from "react";
import { shiftSchedule, chatterColors } from "@/lib/mock-data";
import { Clock, ChevronLeft, ChevronRight, CalendarDays, Repeat, Sun, Moon, Check, X, Lock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

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
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
}

const defaultRequests: ShiftRequest[] = [
  { id: "r1", type: "day-off", chatter: "Jane", date: "2026-03-18", note: "Doctor's appointment", status: "pending", submittedBy: "Jane", submittedAt: "2026-03-14T10:00:00Z" },
  { id: "r2", type: "swap", chatter: "KC", date: "2026-03-17", note: "Swap with Jaydee — night → afternoon", status: "approved", submittedBy: "KC", submittedAt: "2026-03-13T14:00:00Z", reviewedBy: "Luke" },
];

/** Roles that can edit the shift calendar and approve/reject requests */
const EDITOR_ROLES = ["admin", "supervisor", "data_entry"] as const;

export default function ShiftCalendar() {
  const { user, hasPermission } = useAuth();
  const canEditShifts = hasPermission("edit_schedules");
  const currentUserDisplay = user?.displayName || "Unknown";
  const currentUserRole = user?.role || "chatter";
  const isEditor = EDITOR_ROLES.includes(currentUserRole as typeof EDITOR_ROLES[number]);

  const [weekOffset, setWeekOffset] = useState(0);
  const [requests, setRequests] = useState<ShiftRequest[]>(() => {
    const saved = localStorage.getItem("shift-requests");
    return saved ? JSON.parse(saved) : defaultRequests;
  });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showTimeOffForm, setShowTimeOffForm] = useState(false);
  const [newRequest, setNewRequest] = useState<Omit<ShiftRequest, "id" | "status" | "submittedBy" | "submittedAt">>({
    type: "day-off", chatter: chatters[0], date: "", note: "",
  });
  const [timeOffRequest, setTimeOffRequest] = useState({
    type: "day-off" as "day-off" | "swap" | "coverage",
    date: "",
    note: "",
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
    const req: ShiftRequest = {
      ...newRequest,
      id: Date.now().toString(),
      status: "pending",
      submittedBy: currentUserDisplay,
      submittedAt: new Date().toISOString(),
    };
    saveRequests([...requests, req]);
    setNewRequest({ type: "day-off", chatter: chatters[0], date: "", note: "" });
    setShowRequestForm(false);
  };

  const addTimeOffRequest = () => {
    if (!timeOffRequest.date || !timeOffRequest.note.trim()) return;
    const req: ShiftRequest = {
      id: Date.now().toString(),
      type: timeOffRequest.type,
      chatter: currentUserDisplay,
      date: timeOffRequest.date,
      note: timeOffRequest.note,
      status: "pending",
      submittedBy: currentUserDisplay,
      submittedAt: new Date().toISOString(),
    };
    saveRequests([...requests, req]);
    setTimeOffRequest({ type: "day-off", date: "", note: "" });
    setShowTimeOffForm(false);
  };

  const updateRequestStatus = (id: string, status: "approved" | "denied") => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status, reviewedBy: currentUserDisplay } : r
    );
    saveRequests(updated);
  };

  // Filter requests for the bottom section: chatters see only their own
  const visibleRequests = isEditor
    ? requests
    : requests.filter((r) => r.submittedBy === currentUserDisplay || r.chatter === currentUserDisplay);

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

  const typeLabels = {
    "day-off": "Day Off",
    swap: "Shift Swap",
    coverage: "Schedule Change",
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shift Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Weekly chatter shift schedule</p>
        </div>
        {!canEditShifts && (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 gap-1">
            <Lock className="h-3 w-3" />
            View Only
          </Badge>
        )}
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

        {/* Shift Scheduler Panel — only for editors */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Shift Scheduler
            </h3>
            {canEditShifts && (
              <Button onClick={() => setShowRequestForm(!showRequestForm)} size="sm" variant="outline" className="gap-1">
                <Repeat className="h-3 w-3" /> Request
              </Button>
            )}
          </div>

          {!canEditShifts && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-400/20 bg-amber-400/5">
              <Lock className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400/80">
                You have view-only access. Use the request form below to ask for schedule changes.
              </p>
            </div>
          )}

          {canEditShifts && showRequestForm && (
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

          {/* Requests list in sidebar */}
          <div className="space-y-2">
            {requests.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No requests</p>
            ) : (
              requests.slice(0, 5).map((req) => {
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
                    {/* Approve/Reject for editors on pending requests */}
                    {canEditShifts && req.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] gap-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                          onClick={() => updateRequestStatus(req.id, "approved")}
                        >
                          <Check className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] gap-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                          onClick={() => updateRequestStatus(req.id, "denied")}
                        >
                          <X className="h-3 w-3" /> Deny
                        </Button>
                      </div>
                    )}
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

      {/* ─── Request Time Off / Shift Change ─── */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Request Time Off / Shift Change
            </h2>
            <p className="text-muted-foreground text-xs mt-1">
              Submit a request for day off, shift swap, or schedule change
            </p>
          </div>
          <Button
            onClick={() => setShowTimeOffForm(!showTimeOffForm)}
            size="sm"
            className="gap-1"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {showTimeOffForm ? "Cancel" : "New Request"}
          </Button>
        </div>

        {showTimeOffForm && (
          <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-secondary/20 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={timeOffRequest.type}
                  onChange={(e) => setTimeOffRequest({ ...timeOffRequest, type: e.target.value as ShiftRequest["type"] })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="day-off">Day Off</option>
                  <option value="swap">Shift Swap</option>
                  <option value="coverage">Schedule Change</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={timeOffRequest.date}
                  onChange={(e) => setTimeOffRequest({ ...timeOffRequest, date: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Submitted by</label>
                <Input value={currentUserDisplay} disabled className="h-9 opacity-60" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Reason</label>
              <Input
                placeholder="e.g. Personal appointment, need to swap with someone..."
                value={timeOffRequest.note}
                onChange={(e) => setTimeOffRequest({ ...timeOffRequest, note: e.target.value })}
                className="h-9"
                onKeyDown={(e) => e.key === "Enter" && addTimeOffRequest()}
              />
            </div>
            <Button onClick={addTimeOffRequest} size="sm" className="gap-1">
              <Send className="h-3 w-3" /> Submit Request
            </Button>
          </div>
        )}

        {/* Pending requests list */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {isEditor ? "All Requests" : "Your Requests"}
          </h3>
          {visibleRequests.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No requests yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleRequests.map((req) => {
                const color = chatterColors[req.chatter] || "217 91% 60%";
                return (
                  <div key={req.id} className="p-4 rounded-lg border border-border/30 bg-secondary/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                          {req.chatter.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{req.chatter}</span>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(req.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${statusBadge[req.status]}`}>{req.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${typeColors[req.type]}`}>
                        {typeLabels[req.type]}
                      </Badge>
                      {req.reviewedBy && (
                        <span className="text-[10px] text-muted-foreground">
                          Reviewed by {req.reviewedBy}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{req.note}</p>
                    {/* Approve/Reject — only for editors on pending */}
                    {isEditor && req.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                          onClick={() => updateRequestStatus(req.id, "approved")}
                        >
                          <Check className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                          onClick={() => updateRequestStatus(req.id, "denied")}
                        >
                          <X className="h-3 w-3" /> Deny
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
