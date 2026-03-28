import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Trash2,
  X,
  MapPin,
  Calendar,
  CheckSquare,
  Copy,
  Share2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Home,
  User,
  StickyNote,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────

interface ContentItem {
  id: string;
  category: "feed" | "ppv" | "custom" | "scenario" | "content_bank";
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
}

interface AirbnbBooking {
  id: string;
  model: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: "upcoming" | "active" | "completed";
  feedPostCount: number;
  ppvVideoCount: number;
  notes: string;
  assignedTo: string;
  contentItems: ContentItem[];
  createdBy: string;
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const STORAGE_KEY = "airbnb-schedule-v2";

const MODELS = ["Ashley Morris", "Izzy", "Willow"];

const MODEL_COLORS: Record<string, string> = {
  "Ashley Morris": "border-l-pink-500",
  "Izzy": "border-l-purple-500",
  "Willow": "border-l-emerald-500",
};

const MODEL_BG: Record<string, string> = {
  "Ashley Morris": "from-pink-500/10 to-transparent",
  "Izzy": "from-purple-500/10 to-transparent",
  "Willow": "from-emerald-500/10 to-transparent",
};

const MODEL_ACCENT: Record<string, string> = {
  "Ashley Morris": "text-pink-400",
  "Izzy": "text-purple-400",
  "Willow": "text-emerald-400",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  upcoming: { label: "Upcoming", color: "text-blue-300", bg: "bg-blue-500/20 border-blue-500/30" },
  active: { label: "Active", color: "text-green-300", bg: "bg-green-500/20 border-green-500/30" },
  completed: { label: "Completed", color: "text-zinc-400", bg: "bg-zinc-500/20 border-zinc-500/30" },
};

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string }> = {
  feed: { label: "Feed Posts", emoji: "📸" },
  ppv: { label: "PPV Videos", emoji: "💰" },
  custom: { label: "Custom Fulfillments", emoji: "🎯" },
  scenario: { label: "Scenario Content", emoji: "🎬" },
  content_bank: { label: "Content Bank", emoji: "🗂️" },
};

const CATEGORY_ORDER: ContentItem["category"][] = ["feed", "ppv", "custom", "scenario", "content_bank"];

const ASSIGNEES = ["Elle", "Ashley Morris", "Izzy", "Willow", "Luke"];

// ── Helpers ────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getBookingStatus(booking: AirbnbBooking): "upcoming" | "active" | "completed" {
  if (booking.status === "completed") return "completed";
  const today = new Date().toISOString().split("T")[0];
  if (booking.checkIn <= today && booking.checkOut >= today) return "active";
  if (booking.checkOut < today) return "completed";
  return "upcoming";
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Component ──────────────────────────────────────────────────────────

export default function AirbnbSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user?.role === "admin" || user?.role === "supervisor" || user?.role === "data_entry";

  const [bookings, setBookings] = useState<AirbnbBooking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterModel, setFilterModel] = useState<string>("all");

  // Form state
  const [form, setForm] = useState({
    model: "",
    location: "",
    checkIn: "",
    checkOut: "",
    feedPostCount: 5,
    ppvVideoCount: 3,
    notes: "",
    assignedTo: "Elle",
  });

  // Content item form
  const [itemForm, setItemForm] = useState({
    category: "feed" as ContentItem["category"],
    title: "",
    description: "",
  });

  // ── Persistence ────────────────────────────────────────────────────

  useEffect(() => {
    // NOTE: Using localStorage as temporary storage. Supabase table `airbnb_bookings` is needed.
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch {
        setBookings([]);
      }
    }
  }, []);

  const save = useCallback((data: AirbnbBooking[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setBookings(data);
  }, []);

  // ── CRUD ───────────────────────────────────────────────────────────

  const resetForm = () => {
    setForm({ model: "", location: "", checkIn: "", checkOut: "", feedPostCount: 5, ppvVideoCount: 3, notes: "", assignedTo: "Elle" });
    setShowForm(false);
    setEditingId(null);
  };

  const submitBooking = () => {
    if (!form.model || !form.location || !form.checkIn || !form.checkOut) return;

    if (editingId) {
      save(
        bookings.map((b) =>
          b.id === editingId
            ? {
                ...b,
                model: form.model,
                location: form.location,
                checkIn: form.checkIn,
                checkOut: form.checkOut,
                feedPostCount: form.feedPostCount,
                ppvVideoCount: form.ppvVideoCount,
                notes: form.notes,
                assignedTo: form.assignedTo,
              }
            : b
        )
      );
      toast({ title: "Booking updated" });
    } else {
      const booking: AirbnbBooking = {
        id: generateId(),
        ...form,
        status: "upcoming",
        contentItems: [],
        createdBy: user?.username || "Unknown",
        createdAt: new Date().toISOString().split("T")[0],
      };
      save([booking, ...bookings]);
      setExpandedId(booking.id);
      toast({ title: "Booking created" });
    }
    resetForm();
  };

  const startEdit = (booking: AirbnbBooking) => {
    setForm({
      model: booking.model,
      location: booking.location,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      feedPostCount: booking.feedPostCount,
      ppvVideoCount: booking.ppvVideoCount,
      notes: booking.notes,
      assignedTo: booking.assignedTo,
    });
    setEditingId(booking.id);
    setShowForm(true);
  };

  const deleteBooking = (id: string) => {
    save(bookings.filter((b) => b.id !== id));
    toast({ title: "Booking deleted" });
  };

  const updateStatus = (id: string, status: AirbnbBooking["status"]) => {
    save(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  // ── Content Items ──────────────────────────────────────────────────

  const addContentItem = (bookingId: string) => {
    if (!itemForm.title.trim()) return;
    const item: ContentItem = {
      id: generateId(),
      category: itemForm.category,
      title: itemForm.title.trim(),
      description: itemForm.description.trim(),
      completed: false,
      completedAt: null,
    };
    save(bookings.map((b) => (b.id === bookingId ? { ...b, contentItems: [...b.contentItems, item] } : b)));
    setItemForm({ ...itemForm, title: "", description: "" });
  };

  const toggleItem = (bookingId: string, itemId: string) => {
    if (!canManage) return;
    save(
      bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              contentItems: b.contentItems.map((i) =>
                i.id === itemId
                  ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString().split("T")[0] : null }
                  : i
              ),
            }
          : b
      )
    );
  };

  const deleteItem = (bookingId: string, itemId: string) => {
    save(bookings.map((b) => (b.id === bookingId ? { ...b, contentItems: b.contentItems.filter((i) => i.id !== itemId) } : b)));
  };

  const copyChecklist = (booking: AirbnbBooking) => {
    const lines = [
      `🏠 AIRBNB SHOOT — ${booking.model}`,
      `📍 ${booking.location}`,
      `📅 ${formatDate(booking.checkIn)} → ${formatDate(booking.checkOut)}`,
      `👤 Assigned: ${booking.assignedTo}`,
      `📸 Feed posts: ${booking.feedPostCount} | 💰 PPV videos: ${booking.ppvVideoCount}`,
      "",
    ];

    for (const cat of CATEGORY_ORDER) {
      const items = booking.contentItems.filter((i) => i.category === cat);
      if (items.length === 0) continue;
      const cfg = CATEGORY_CONFIG[cat];
      lines.push(`${cfg.emoji} ${cfg.label} (${items.filter((i) => i.completed).length}/${items.length})`);
      items.forEach((item, idx) => {
        const check = item.completed ? "✅" : "⬜";
        lines.push(`  ${check} ${idx + 1}. ${item.title}`);
        if (item.description) lines.push(`     ${item.description}`);
      });
      lines.push("");
    }

    const total = booking.contentItems.length;
    const done = booking.contentItems.filter((i) => i.completed).length;
    lines.push(`Progress: ${done}/${total} (${total > 0 ? Math.round((done / total) * 100) : 0}%)`);
    if (booking.notes) lines.push(`\n📝 Notes: ${booking.notes}`);

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      toast({ title: "Checklist copied!", description: "Paste into Telegram, WhatsApp, etc." });
    });
  };

  // ── Filtering & sorting ────────────────────────────────────────────

  const sortedBookings = [...bookings]
    .map((b) => ({ ...b, computedStatus: getBookingStatus(b) }))
    .sort((a, b) => {
      const statusOrder = { active: 0, upcoming: 1, completed: 2 };
      const diff = statusOrder[a.computedStatus] - statusOrder[b.computedStatus];
      if (diff !== 0) return diff;
      return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
    });

  const filtered = sortedBookings.filter((b) => {
    if (filterStatus !== "all" && b.computedStatus !== filterStatus) return false;
    if (filterModel !== "all" && b.model !== filterModel) return false;
    return true;
  });

  // ── Stats ──────────────────────────────────────────────────────────

  const stats = {
    upcoming: sortedBookings.filter((b) => b.computedStatus === "upcoming").length,
    active: sortedBookings.filter((b) => b.computedStatus === "active").length,
    completed: sortedBookings.filter((b) => b.computedStatus === "completed").length,
    totalItems: bookings.reduce((s, b) => s + b.contentItems.length, 0),
    completedItems: bookings.reduce((s, b) => s + b.contentItems.filter((i) => i.completed).length, 0),
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Home className="h-6 w-6 text-rose-400" />
            Airbnb Schedule
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plan content shoots, track bookings, manage checklists
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

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Upcoming", value: stats.upcoming, color: "text-blue-400" },
          { label: "Active", value: stats.active, color: "text-green-400" },
          { label: "Completed", value: stats.completed, color: "text-zinc-400" },
          { label: "Total Items", value: stats.totalItems, color: "text-white" },
          { label: "Items Done", value: stats.completedItems, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All models</option>
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Booking form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">{editingId ? "Edit Booking" : "New Airbnb Booking"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model</label>
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select model...</option>
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Location (City, State)</label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Brighton, East Sussex"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Check-in</label>
              <Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Check-out</label>
              <Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Feed Posts (target count)</label>
              <Input
                type="number"
                min={0}
                value={form.feedPostCount}
                onChange={(e) => setForm({ ...form, feedPostCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">PPV Videos (target count)</label>
              <Input
                type="number"
                min={0}
                value={form.ppvVideoCount}
                onChange={(e) => setForm({ ...form, ppvVideoCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Assigned To</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Notes</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Budget, special requirements, equipment, outfit notes..."
              className="min-h-[60px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={submitBooking} disabled={!form.model || !form.location || !form.checkIn || !form.checkOut}>
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

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Home className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm">
            {bookings.length === 0 ? "No bookings yet — create one to start planning shoots." : "No bookings match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const isExpanded = expandedId === booking.id;
            const completedCount = booking.contentItems.filter((i) => i.completed).length;
            const totalCount = booking.contentItems.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const statusCfg = STATUS_CONFIG[booking.computedStatus];
            const modelColor = MODEL_COLORS[booking.model] || "border-l-zinc-500";
            const modelBg = MODEL_BG[booking.model] || "from-zinc-500/10 to-transparent";
            const modelAccent = MODEL_ACCENT[booking.model] || "text-zinc-400";
            const days = daysUntil(booking.checkIn);

            return (
              <div
                key={booking.id}
                className={`glass-card overflow-hidden border-l-4 ${modelColor}`}
              >
                {/* Card header with gradient */}
                <div
                  className={`p-4 bg-gradient-to-r ${modelBg} cursor-pointer`}
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Date block */}
                      <div className="text-center min-w-[50px]">
                        <p className="text-2xl font-bold leading-none">{new Date(booking.checkIn).getDate()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {new Date(booking.checkIn).toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                        {booking.computedStatus === "upcoming" && days > 0 && (
                          <p className="text-[9px] text-blue-400 mt-0.5">{days}d away</p>
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold text-lg ${modelAccent}`}>{booking.model}</h3>
                          <Badge variant="outline" className={`text-[10px] ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {booking.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {booking.assignedTo}
                          </span>
                          <span>📸 {booking.feedPostCount} feed</span>
                          <span>💰 {booking.ppvVideoCount} PPV</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side — progress */}
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-lg font-bold">
                          {completedCount}/{totalCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground">items done</p>
                        {totalCount > 0 && (
                          <div className="w-28 mt-1">
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        {totalCount > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{progress}%</p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border/30 p-4 space-y-4">
                    {/* Action bar */}
                    <div className="flex gap-2 flex-wrap">
                      {canManage && (
                        <>
                          <select
                            value={booking.status}
                            onChange={(e) => updateStatus(booking.id, e.target.value as AirbnbBooking["status"])}
                            className="bg-secondary border border-border/30 rounded-md px-3 py-1.5 text-sm"
                          >
                            <option value="upcoming">📅 Upcoming</option>
                            <option value="active">🟢 Active</option>
                            <option value="completed">✅ Completed</option>
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddItem(showAddItem === booking.id ? null : booking.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Item
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => startEdit(booking)}>
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copyChecklist(booking)}>
                        <Copy className="h-3 w-3 mr-1" /> Copy Checklist
                      </Button>
                      {canManage && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => deleteBooking(booking.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      )}
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="flex items-start gap-2 bg-secondary/30 rounded-lg p-3">
                        <StickyNote className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
                      </div>
                    )}

                    {/* Summary counts */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {CATEGORY_ORDER.map((cat) => {
                        const cfg = CATEGORY_CONFIG[cat];
                        const items = booking.contentItems.filter((i) => i.category === cat);
                        const done = items.filter((i) => i.completed).length;
                        return (
                          <div key={cat} className="bg-secondary/30 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-muted-foreground uppercase">
                              {cfg.emoji} {cfg.label}
                            </p>
                            <p className="text-sm font-bold">
                              {done}/{items.length}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add item form */}
                    {showAddItem === booking.id && canManage && (
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-semibold">Add Content Item</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Category</label>
                            <select
                              value={itemForm.category}
                              onChange={(e) =>
                                setItemForm({ ...itemForm, category: e.target.value as ContentItem["category"] })
                              }
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              {CATEGORY_ORDER.map((cat) => {
                                const cfg = CATEGORY_CONFIG[cat];
                                return (
                                  <option key={cat} value={cat}>
                                    {cfg.emoji} {cfg.label}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Title</label>
                            <Input
                              value={itemForm.title}
                              onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                              placeholder="e.g. Lingerie set — red lace"
                            />
                          </div>
                        </div>
                        <Textarea
                          value={itemForm.description}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          placeholder="Details — outfit, props, angles, duration, specific fan requests..."
                          className="min-h-[70px]"
                        />
                        <Button
                          size="sm"
                          onClick={() => addContentItem(booking.id)}
                          disabled={!itemForm.title.trim()}
                        >
                          Add to Checklist
                        </Button>
                      </div>
                    )}

                    {/* Content checklist by category */}
                    {booking.contentItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground/50 italic text-center py-6">
                        No content items yet — add feed posts, PPV, customs, scenarios, and content bank items
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {CATEGORY_ORDER.map((cat) => {
                          const items = booking.contentItems.filter((i) => i.category === cat);
                          if (items.length === 0) return null;
                          const cfg = CATEGORY_CONFIG[cat];
                          const done = items.filter((i) => i.completed).length;
                          return (
                            <div key={cat}>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">
                                  {cfg.emoji} {cfg.label} ({done}/{items.length})
                                </p>
                                <div className="w-20">
                                  <Progress
                                    value={items.length > 0 ? Math.round((done / items.length) * 100) : 0}
                                    className="h-1.5"
                                  />
                                </div>
                              </div>
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg mb-1.5 transition-colors ${
                                    item.completed ? "bg-green-500/5 opacity-60" : "bg-secondary/30"
                                  }`}
                                >
                                  <button
                                    onClick={() => toggleItem(booking.id, item.id)}
                                    disabled={!canManage}
                                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                      item.completed
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "border-zinc-500 hover:border-green-400"
                                    } ${!canManage ? "cursor-default" : "cursor-pointer"}`}
                                  >
                                    {item.completed && <CheckSquare className="h-3 w-3" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-medium text-sm ${
                                        item.completed ? "line-through text-muted-foreground" : ""
                                      }`}
                                    >
                                      {item.title}
                                    </p>
                                    {item.description && (
                                      <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-pre-wrap">
                                        {item.description}
                                      </p>
                                    )}
                                    {item.completedAt && (
                                      <p className="text-[10px] text-green-400/60 mt-0.5">
                                        ✓ Completed {item.completedAt}
                                      </p>
                                    )}
                                  </div>
                                  {canManage && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-400 h-6 w-6 p-0 shrink-0"
                                      onClick={() => deleteItem(booking.id, item.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Supabase notice */}
      <p className="text-[10px] text-muted-foreground/40 text-center">
        ⚠ Data stored in localStorage. Supabase table <code>airbnb_bookings</code> needed for persistence.
      </p>
    </div>
  );
}
