import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Trash2,
  X,
  MapPin,
  Calendar,
  Edit2,
  Home,
  PoundSterling,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  StickyNote,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// ── Types ──────────────────────────────────────────────────────────────

interface AirbnbBooking {
  id: string;
  model: string;
  location: string;
  check_in: string;
  check_out: string;
  cost: number;
  status: "booked" | "confirmed" | "completed" | "cancelled";
  notes: string;
  created_by: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = "airbnb_bookings";

const MODELS = ["Ashley", "Willow", "Izzie"];

const MODEL_COLORS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  Ashley: { border: "border-pink-500", bg: "bg-pink-500/15", text: "text-pink-400", dot: "bg-pink-500" },
  Willow: { border: "border-emerald-500", bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500" },
  Izzie: { border: "border-violet-500", bg: "bg-violet-500/15", text: "text-violet-400", dot: "bg-violet-500" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  booked: { label: "Booked", color: "text-blue-300", bg: "bg-blue-500/20 border-blue-500/30" },
  confirmed: { label: "Confirmed", color: "text-green-300", bg: "bg-green-500/20 border-green-500/30" },
  completed: { label: "Completed", color: "text-zinc-400", bg: "bg-zinc-500/20 border-zinc-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-300", bg: "bg-red-500/20 border-red-500/30" },
};

const DEFAULT_MODEL_COLORS = { border: "border-zinc-500", bg: "bg-zinc-500/15", text: "text-zinc-400", dot: "bg-zinc-500" };

const SAMPLE_BOOKINGS: AirbnbBooking[] = [];

// ── Helpers ────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDateShort(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatDateFull(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isPast(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T00:00:00") < today;
}

function isToday(dateStr: string) {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function dateToStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getWeeksInRange(startMonday: Date, numWeeks: number): Date[][] {
  const weeks: Date[][] = [];
  for (let w = 0; w < numWeeks; w++) {
    const weekStart = addDays(startMonday, w * 7);
    const days: Date[] = [];
    for (let d = 0; d < 7; d++) {
      days.push(addDays(weekStart, d));
    }
    weeks.push(days);
  }
  return weeks;
}

function bookingSpansDates(booking: AirbnbBooking, dateStr: string): boolean {
  return dateStr >= booking.check_in && dateStr <= booking.check_out;
}

// ── Component ──────────────────────────────────────────────────────────

export default function AirbnbSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user?.role === "admin" || user?.role === "supervisor";

  const [bookings, setBookings] = useState<AirbnbBooking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Form state
  const [form, setForm] = useState({
    model: "",
    location: "",
    check_in: "",
    check_out: "",
    cost: 0,
    status: "booked" as AirbnbBooking["status"],
    notes: "",
  });

  // ── Persistence ────────────────────────────────────────────────────

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookings(parsed);
          return;
        }
      } catch {}
    }
    // Pre-populate with sample data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_BOOKINGS));
    setBookings(SAMPLE_BOOKINGS);
  }, []);

  const save = useCallback((data: AirbnbBooking[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setBookings(data);
  }, []);

  // ── CRUD ───────────────────────────────────────────────────────────

  const resetForm = () => {
    setForm({ model: "", location: "", check_in: "", check_out: "", cost: 0, status: "booked", notes: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const submitBooking = () => {
    if (!form.model || !form.location || !form.check_in || !form.check_out) return;

    if (editingId) {
      save(
        bookings.map((b) =>
          b.id === editingId
            ? { ...b, ...form }
            : b
        )
      );
      toast({ title: "Booking updated" });
    } else {
      const booking: AirbnbBooking = {
        id: generateId(),
        ...form,
        created_by: user?.displayName || user?.username || "Unknown",
      };
      save([...bookings, booking]);
      toast({ title: "Booking created" });
    }
    resetForm();
  };

  const startEdit = (booking: AirbnbBooking) => {
    setForm({
      model: booking.model,
      location: booking.location,
      check_in: booking.check_in,
      check_out: booking.check_out,
      cost: booking.cost,
      status: booking.status,
      notes: booking.notes,
    });
    setEditingId(booking.id);
    setShowForm(true);
  };

  const deleteBooking = (id: string) => {
    save(bookings.filter((b) => b.id !== id));
    toast({ title: "Booking deleted" });
  };

  // ── Calendar data ──────────────────────────────────────────────────

  const today = new Date();
  const baseMonday = getMonday(today);
  const startMonday = addDays(baseMonday, weekOffset * 7);
  const NUM_WEEKS = 4;
  const weeks = getWeeksInRange(startMonday, NUM_WEEKS);

  const calendarEnd = dateToStr(addDays(startMonday, NUM_WEEKS * 7 - 1));
  const calendarStart = dateToStr(startMonday);

  const visibleBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status !== "cancelled" &&
          b.check_out >= calendarStart &&
          b.check_in <= calendarEnd
      ),
    [bookings, calendarStart, calendarEnd]
  );

  // ── Monthly summary ────────────────────────────────────────────────

  const thisMonth = today.toISOString().slice(0, 7); // "2026-03"
  const monthBookings = bookings.filter(
    (b) => b.check_in.startsWith(thisMonth) && b.status !== "cancelled"
  );
  const monthlyCount = monthBookings.length;
  const monthlyCost = monthBookings.reduce((sum, b) => sum + b.cost, 0);

  // ── Sorted list for below-calendar view ────────────────────────────

  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.status === "cancelled" && b.status !== "cancelled") return 1;
    if (b.status === "cancelled" && a.status !== "cancelled") return -1;
    return a.check_in.localeCompare(b.check_in);
  });

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Home className="h-6 w-6 text-rose-400" />
            Airbnb Schedule
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upcoming Airbnb bookings for content shoots
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            variant={showForm ? "outline" : "default"}
          >
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "New Booking"}
          </Button>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Month</p>
          <p className="text-2xl font-bold text-white">{monthlyCount}</p>
          <p className="text-[10px] text-muted-foreground">bookings</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Cost</p>
          <p className="text-2xl font-bold text-emerald-400">${monthlyCost.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-bold text-blue-400">{bookings.filter(b => b.status !== "cancelled").length}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Spend</p>
          <p className="text-2xl font-bold text-amber-400">
            ${bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.cost, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Booking form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border border-primary/30">
          <h3 className="font-semibold text-sm">{editingId ? "Edit Booking" : "New Airbnb Booking"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model</label>
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select model...</option>
                {MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Location</label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Brighton, UK"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Cost ($)</label>
              <Input
                type="number"
                min={0}
                value={form.cost || ""}
                onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) || 0 })}
                placeholder="200"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Check-in</label>
              <Input type="date" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Check-out</label>
              <Input type="date" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AirbnbBooking["status"] })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Notes</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Equipment, outfit notes, location details..."
              className="min-h-[60px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={submitBooking} disabled={!form.model || !form.location || !form.check_in || !form.check_out}>
              {editingId ? "Save Changes" : "Create Booking"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Calendar navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w - NUM_WEEKS)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium">
            {formatDateShort(dateToStr(startMonday))} — {formatDateShort(calendarEnd)}
          </p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[10px] text-primary hover:underline"
            >
              Back to today
            </button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w + NUM_WEEKS)}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="glass-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/30">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-[10px] text-muted-foreground uppercase py-2 font-semibold">
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border/20 last:border-b-0">
            {week.map((day) => {
              const ds = dateToStr(day);
              const todayStr = dateToStr(today);
              const dayIsPast = ds < todayStr;
              const dayIsToday = ds === todayStr;
              const dayBookings = visibleBookings.filter((b) => bookingSpansDates(b, ds));

              return (
                <div
                  key={ds}
                  className={`min-h-[80px] p-1 border-r border-border/10 last:border-r-0 transition-colors ${
                    dayIsToday
                      ? "bg-primary/10"
                      : dayIsPast
                      ? "bg-zinc-900/30"
                      : ""
                  }`}
                >
                  <p
                    className={`text-[11px] font-medium mb-0.5 ${
                      dayIsToday
                        ? "text-primary font-bold"
                        : dayIsPast
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day.getDate()}
                    {day.getDate() === 1 && (
                      <span className="ml-1 text-[9px]">
                        {day.toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                    )}
                  </p>
                  <div className="space-y-0.5">
                    {dayBookings.map((b) => {
                      const mc = MODEL_COLORS[b.model] || DEFAULT_MODEL_COLORS;
                      const isStart = ds === b.check_in;
                      return (
                        <div
                          key={b.id}
                          className={`text-[9px] px-1 py-0.5 rounded truncate ${mc.bg} ${mc.text} ${
                            dayIsPast && b.status !== "completed" ? "opacity-40" : ""
                          }`}
                          title={`${b.model} — ${b.location}\n${formatDateFull(b.check_in)} → ${formatDateFull(b.check_out)}\n$${b.cost}`}
                        >
                          {isStart ? (
                            <span className="font-semibold">{b.model}</span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${mc.dot}`} />
                              {b.model}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Model legend */}
      <div className="flex gap-4 justify-center">
        {MODELS.map((m) => {
          const mc = MODEL_COLORS[m] || DEFAULT_MODEL_COLORS;
          return (
            <div key={m} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`inline-block w-3 h-3 rounded-full ${mc.dot}`} />
              {m}
            </div>
          );
        })}
      </div>

      {/* Booking cards list */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          All Bookings
        </h2>
        {sortedBookings.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Home className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground text-sm">No bookings yet — create one to start planning shoots.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBookings.map((booking) => {
              const mc = MODEL_COLORS[booking.model] || DEFAULT_MODEL_COLORS;
              const statusCfg = STATUS_CONFIG[booking.status];
              const bookingIsPast = isPast(booking.check_out);
              const isCancelled = booking.status === "cancelled";

              return (
                <div
                  key={booking.id}
                  className={`glass-card border-l-4 ${mc.border} p-4 transition-opacity ${
                    bookingIsPast || isCancelled ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Model + status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold text-lg ${mc.text}`}>{booking.model}</h3>
                        <Badge variant="outline" className={`text-[10px] ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </Badge>
                        {bookingIsPast && !isCancelled && booking.status !== "completed" && (
                          <span className="text-[10px] text-amber-400">Past</span>
                        )}
                      </div>

                      {/* Date + location */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateFull(booking.check_in)} → {formatDateFull(booking.check_out)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.location}
                        </span>
                      </div>

                      {/* Cost */}
                      <div className="flex items-center gap-1 text-sm">
                        <PoundSterling className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">${booking.cost.toLocaleString()}</span>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <StickyNote className="h-3.5 w-3.5 text-yellow-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}

                      {/* Checklist link */}
                      <Link
                        to={`/client-checklist?model=${encodeURIComponent(booking.model)}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Content Checklist for {booking.model}
                      </Link>
                    </div>

                    {/* Actions */}
                    {canManage && (
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => startEdit(booking)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => deleteBooking(booking.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/20 text-[10px] text-muted-foreground/50">
                    <span>Created by {booking.created_by}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/40 text-center">
        Data stored in localStorage
      </p>
    </div>
  );
}
