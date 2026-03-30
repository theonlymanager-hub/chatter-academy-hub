import { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Edit2, X, ExternalLink, Clock, Save, ChevronLeft, ChevronRight, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────
const MODEL_NAMES = ["Ashley", "Willow", "Izzie"] as const;
type ModelName = typeof MODEL_NAMES[number];

const MESSAGE_TYPES = ["Mass Message", "PPV", "Prompt"] as const;
type MessageType = typeof MESSAGE_TYPES[number];

const AUDIENCES = ["all", "whales only", "new subs", "expired fans"] as const;
type Audience = typeof AUDIENCES[number];

const STATUSES = ["scheduled", "sent", "skipped"] as const;
type Status = typeof STATUSES[number];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

interface ScheduledItem {
  id: string;
  model: ModelName;
  dayOfWeek: string;
  date: string;
  type: MessageType;
  time: string;
  description: string;
  mediaLink: string;
  ppvPrice: string;
  audience: Audience;
  status: Status;
}

// ── Colours ────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<MessageType, { bg: string; text: string; border: string; dot: string }> = {
  "Mass Message": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400" },
  "PPV":          { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  "Prompt":       { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-400" },
};

const MODEL_COLORS: Record<ModelName, string> = {
  "Ashley": "hsl(330 70% 60%)",
  "Willow": "hsl(160 84% 39%)",
  "Izzie":  "hsl(0 72% 55%)",
};

const STORAGE_KEY = "mass_message_schedule";

// ── Seed data (Mon 30 Mar – Sun 5 Apr 2026) ───────────────────────────
function buildSeedData(): ScheduledItem[] {
  const seed: ScheduledItem[] = [
    // Ashley
    { id: "seed-a1", model: "Ashley", dayOfWeek: "Monday",    date: "2026-03-30", type: "PPV",          time: "10:00", description: "Morning selfie – bright natural light",               mediaLink: "", ppvPrice: "$12", audience: "all",          status: "scheduled" },
    { id: "seed-a2", model: "Ashley", dayOfWeek: "Tuesday",   date: "2026-03-31", type: "Mass Message", time: "14:00", description: "Game: \"Truth or Dare\" engagement",                  mediaLink: "", ppvPrice: "",    audience: "all",          status: "scheduled" },
    { id: "seed-a3", model: "Ashley", dayOfWeek: "Wednesday", date: "2026-04-01", type: "PPV",          time: "11:00", description: "Lingerie set – 5 pics",                              mediaLink: "", ppvPrice: "$15", audience: "all",          status: "scheduled" },
    { id: "seed-a4", model: "Ashley", dayOfWeek: "Thursday",  date: "2026-04-02", type: "Prompt",       time: "09:00", description: "\"Good morning\" conversation starter",               mediaLink: "", ppvPrice: "",    audience: "all",          status: "scheduled" },
    { id: "seed-a5", model: "Ashley", dayOfWeek: "Friday",    date: "2026-04-03", type: "PPV",          time: "20:00", description: "Shower video",                                       mediaLink: "", ppvPrice: "$18", audience: "all",          status: "scheduled" },
    { id: "seed-a6", model: "Ashley", dayOfWeek: "Saturday",  date: "2026-04-04", type: "Mass Message", time: "15:00", description: "Game: \"Would You Rather\"",                          mediaLink: "", ppvPrice: "",    audience: "all",          status: "scheduled" },
    { id: "seed-a7", model: "Ashley", dayOfWeek: "Sunday",    date: "2026-04-05", type: "Mass Message", time: "12:00", description: "Re-engagement message for quiet fans",                mediaLink: "", ppvPrice: "",    audience: "expired fans", status: "scheduled" },
    // Willow
    { id: "seed-w1", model: "Willow", dayOfWeek: "Monday",    date: "2026-03-30", type: "PPV",          time: "11:00", description: "Kitchen baking – cosy vibes",                        mediaLink: "", ppvPrice: "$10", audience: "all",          status: "scheduled" },
    { id: "seed-w2", model: "Willow", dayOfWeek: "Wednesday", date: "2026-04-01", type: "PPV",          time: "20:00", description: "Cozy evening set",                                   mediaLink: "", ppvPrice: "$15", audience: "all",          status: "scheduled" },
    { id: "seed-w3", model: "Willow", dayOfWeek: "Friday",    date: "2026-04-03", type: "PPV",          time: "09:00", description: "Morning routine",                                    mediaLink: "", ppvPrice: "$12", audience: "all",          status: "scheduled" },
    { id: "seed-w4", model: "Willow", dayOfWeek: "Sunday",    date: "2026-04-05", type: "Mass Message", time: "12:00", description: "Re-engagement for quiet fans",                       mediaLink: "", ppvPrice: "",    audience: "expired fans", status: "scheduled" },
    // Izzie
    { id: "seed-i1", model: "Izzie",  dayOfWeek: "Monday",    date: "2026-03-30", type: "PPV",          time: "10:00", description: "Workout clip – gym energy",                          mediaLink: "", ppvPrice: "$12", audience: "all",          status: "scheduled" },
    { id: "seed-i2", model: "Izzie",  dayOfWeek: "Wednesday", date: "2026-04-01", type: "PPV",          time: "19:00", description: "Uniform tease",                                      mediaLink: "", ppvPrice: "$15", audience: "all",          status: "scheduled" },
    { id: "seed-i3", model: "Izzie",  dayOfWeek: "Friday",    date: "2026-04-03", type: "PPV",          time: "20:00", description: "Shower content",                                     mediaLink: "", ppvPrice: "$18", audience: "all",          status: "scheduled" },
    { id: "seed-i4", model: "Izzie",  dayOfWeek: "Sunday",    date: "2026-04-05", type: "Mass Message", time: "12:00", description: "Re-engagement for quiet fans",                       mediaLink: "", ppvPrice: "",    audience: "expired fans", status: "scheduled" },
  ];
  return seed;
}

// ── Date helpers ───────────────────────────────────────────────────────
function getWeekStart(offset: number): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateForDay(weekStart: Date, dayIdx: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIdx);
  return d.toISOString().split("T")[0];
}

function fmtShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Badge component ────────────────────────────────────────────────────
function TypeBadge({ type }: { type: MessageType }) {
  const c = TYPE_COLORS[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    scheduled: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    sent:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    skipped:   "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
}

// ── Empty form state ───────────────────────────────────────────────────
const emptyForm = (model: ModelName): Omit<ScheduledItem, "id"> => ({
  model,
  dayOfWeek: "Monday",
  date: "",
  type: "Mass Message",
  time: "10:00",
  description: "",
  mediaLink: "",
  ppvPrice: "",
  audience: "all",
  status: "scheduled",
});

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function MassMessageCalendar() {
  const { user } = useAuth();
  const canEdit = user && ["admin", "supervisor", "data_entry"].includes(user.role);

  const [activeModel, setActiveModel] = useState<ModelName>("Ashley");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ScheduledItem, "id">>(emptyForm("Ashley"));

  // ── Data ──
  const [items, setItems] = useState<ScheduledItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fall through */ }
    }
    const seed = buildSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  });

  const save = useCallback((next: ScheduledItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  // ── Week info ──
  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const weekEnd = useMemo(() => { const e = new Date(weekStart); e.setDate(e.getDate() + 6); return e; }, [weekStart]);
  const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  // ── Filtered data ──
  const weekItems = useMemo(() => {
    return items.filter(i => {
      if (i.model !== activeModel) return false;
      const dates = DAYS_OF_WEEK.map((_, idx) => dateForDay(weekStart, idx));
      return dates.includes(i.date);
    });
  }, [items, activeModel, weekStart]);

  const byDay = useMemo(() => {
    const map: Record<string, ScheduledItem[]> = {};
    DAYS_OF_WEEK.forEach((_, idx) => {
      const d = dateForDay(weekStart, idx);
      map[d] = weekItems.filter(i => i.date === d).sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [weekItems, weekStart]);

  // ── Stats ──
  const stats = useMemo(() => {
    const mm = weekItems.filter(i => i.type === "Mass Message").length;
    const ppv = weekItems.filter(i => i.type === "PPV").length;
    const pr = weekItems.filter(i => i.type === "Prompt").length;
    return { total: weekItems.length, mm, ppv, pr };
  }, [weekItems]);

  // ── Form handlers ──
  const openAdd = (dateStr?: string) => {
    const dayIdx = dateStr ? DAYS_OF_WEEK.indexOf(
      new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" }) as any
    ) : 0;
    const f = emptyForm(activeModel);
    if (dateStr) {
      f.date = dateStr;
      f.dayOfWeek = DAYS_OF_WEEK[dayIdx] || "Monday";
    }
    setForm(f);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: ScheduledItem) => {
    const { id, ...rest } = item;
    setForm(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    // Compute date from dayOfWeek + current week
    const dayIdx = DAYS_OF_WEEK.indexOf(form.dayOfWeek as any);
    const computedDate = dateForDay(weekStart, dayIdx >= 0 ? dayIdx : 0);
    const item: ScheduledItem = {
      ...form,
      date: computedDate,
      id: editingId || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    if (editingId) {
      save(items.map(i => i.id === editingId ? item : i));
      toast.success("Updated");
    } else {
      save([...items, item]);
      toast.success("Added to schedule");
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    save(items.filter(i => i.id !== id));
    toast.success("Removed");
  };

  const today = todayStr();

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mass Message Scheduler</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule mass messages, PPVs & prompts per model</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Mass Msg ({stats.mm})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> PPV ({stats.ppv})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> Prompt ({stats.pr})</span>
          </div>
          {canEdit && (
            <Button onClick={() => openAdd()} size="sm" className="gap-1.5 h-8">
              <Plus className="h-3.5 w-3.5" /> New Item
            </Button>
          )}
        </div>
      </div>

      {/* ── Model Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border/30">
        {MODEL_NAMES.map(name => {
          const active = name === activeModel;
          return (
            <button key={name} onClick={() => setActiveModel(name)}
              className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 ${
                active ? "border-current" : "border-transparent text-muted-foreground hover:text-foreground/70"
              }`}
              style={active ? { color: MODEL_COLORS[name], borderColor: MODEL_COLORS[name] } : {}}>
              {name}
            </button>
          );
        })}
      </div>

      {/* ── Week Navigation ── */}
      <div className="flex items-center justify-between bg-card/50 border border-border/20 rounded-lg px-4 py-2.5">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> Previous Week
        </button>
        <div className="text-center">
          <span className="text-sm font-semibold">{weekLabel}</span>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="ml-3 px-2 py-0.5 text-[10px] rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Today
            </button>
          )}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition-colors">
          Next Week <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day, dayIdx) => {
          const dateStr = dateForDay(weekStart, dayIdx);
          const isToday = dateStr === today;
          const dayItems = byDay[dateStr] || [];

          return (
            <div key={dateStr}
              className={`rounded-lg border min-h-[200px] flex flex-col ${
                isToday ? "border-primary/40 bg-primary/[0.03]" : "border-border/20 bg-card/30"
              }`}>
              {/* Day header */}
              <div className={`px-3 py-2 border-b ${isToday ? "border-primary/20" : "border-border/10"}`}>
                <div className={`text-xs font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {day.slice(0, 3)}
                </div>
                <div className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                  {new Date(dateStr + "T12:00:00").getDate()}
                </div>
                <div className="text-[10px] text-muted-foreground/60">{fmtShort(dateStr)}</div>
              </div>

              {/* Items */}
              <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                {dayItems.map(item => {
                  const tc = TYPE_COLORS[item.type];
                  return (
                    <div key={item.id}
                      className={`rounded-md p-2 border ${tc.border} ${tc.bg} group cursor-pointer hover:brightness-110 transition-all relative`}
                      onClick={() => canEdit && openEdit(item)}>
                      <div className="flex items-start justify-between gap-1">
                        <TypeBadge type={item.type} />
                        {canEdit && (
                          <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </div>
                      <p className="text-xs mt-1 text-foreground/80 line-clamp-2">{item.description}</p>
                      {item.type === "PPV" && item.ppvPrice && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400">{item.ppvPrice}</span>
                      )}
                      {item.mediaLink && (
                        <a href={item.mediaLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 mt-1 text-[10px] text-blue-400 hover:text-blue-300">
                          <ExternalLink className="h-3 w-3" /> Drive
                        </a>
                      )}
                      <div className="mt-1.5">
                        <StatusBadge status={item.status} />
                      </div>
                      {item.audience !== "all" && (
                        <div className="text-[10px] text-muted-foreground/60 mt-1">🎯 {item.audience}</div>
                      )}
                    </div>
                  );
                })}

                {dayItems.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground/30 text-xs">
                    No sends
                  </div>
                )}
              </div>

              {/* Add button */}
              {canEdit && (
                <button onClick={() => openAdd(dateStr)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/30 transition-colors border-t border-border/10">
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border/30 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Scheduled Item" : "Add Scheduled Item"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-secondary rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Model */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Model</label>
                <select value={form.model} onChange={e => setForm({ ...form, model: e.target.value as ModelName })}
                  className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50">
                  {MODEL_NAMES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Day + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Day of Week</label>
                  <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50">
                    {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Time to Send</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <div className="flex gap-2">
                  {MESSAGE_TYPES.map(t => {
                    const tc = TYPE_COLORS[t];
                    return (
                      <button key={t} onClick={() => setForm({ ...form, type: t })}
                        className={`flex-1 py-2 rounded-md text-sm font-medium border transition-all ${
                          form.type === t
                            ? `${tc.bg} ${tc.text} ${tc.border}`
                            : "border-border/20 text-muted-foreground hover:border-border/40"
                        }`}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description / Caption</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What's being sent..."
                  className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50 min-h-[70px] resize-y" />
              </div>

              {/* Media Link */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Media Link (Google Drive folder URL)</label>
                <input value={form.mediaLink} onChange={e => setForm({ ...form, mediaLink: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50" />
              </div>

              {/* PPV Price (conditional) */}
              {form.type === "PPV" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">PPV Price</label>
                  <input value={form.ppvPrice} onChange={e => setForm({ ...form, ppvPrice: e.target.value })}
                    placeholder="$12"
                    className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </div>
              )}

              {/* Audience + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Audience</label>
                  <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value as Audience })}
                    className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50">
                    {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}
                    className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm outline-none focus:border-primary/50">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border/20">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> {editingId ? "Update" : "Add to Schedule"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notes Section ── */}
      <div className="rounded-xl border border-border/20 bg-card/40 p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Scheduling Rules & Notes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> PPV Timing Rules
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Wait for <strong>5+ fan replies</strong> before sending PPV</li>
              <li>• Never send PPV cold — warm them up first</li>
              <li>• Best times: after engagement spike or late evening</li>
              <li>• Space PPVs at least 2 days apart per model</li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              🐋 Whale Management
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Exclude whales from mass messages</strong> — they get personal attention</li>
              <li>• Whales = $100+ lifetime spend</li>
              <li>• Send whales custom content, not blasts</li>
              <li>• Track whale PPV open rates separately</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
              🧪 A/B Testing Notes
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Test different PPV price points ($10 vs $15)</li>
              <li>• Compare caption styles: teasing vs direct</li>
              <li>• Track which send times get best open rates</li>
              <li>• Rotate game types weekly to avoid fatigue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
