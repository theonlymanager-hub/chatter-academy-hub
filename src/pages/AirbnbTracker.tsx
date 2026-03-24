import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, X, MapPin, Calendar, Camera, CheckSquare, Share2, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShootItem {
  id: string;
  type: "custom" | "feed" | "ppv" | "content_bank" | "other";
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
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  notes: string;
  shootItems: ShootItem[];
  createdBy: string;
  createdAt: string;
  shareToken: string;
}

const STORAGE_KEY = "airbnb-tracker-v1";
const MODELS = ["Ashley Morris", "Lucinda Bleu", "Izzy", "Willow"];
const ITEM_TYPES = [
  { value: "custom", label: "Custom Order", emoji: "🎯" },
  { value: "feed", label: "Feed Post", emoji: "📸" },
  { value: "ppv", label: "PPV Content", emoji: "💰" },
  { value: "content_bank", label: "Content Bank", emoji: "🗂️" },
  { value: "other", label: "Other", emoji: "📋" },
];

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  in_progress: "bg-green-500/20 text-green-300 border-green-500/30",
  completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: "📅 Upcoming",
  in_progress: "🟢 In Progress",
  completed: "✅ Completed",
  cancelled: "❌ Cancelled",
};

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function AirbnbTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = user?.role === "admin" || user?.role === "supervisor" || user?.role === "data_entry";

  const [bookings, setBookings] = useState<AirbnbBooking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);

  // Form state
  const [formModel, setFormModel] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCheckIn, setFormCheckIn] = useState("");
  const [formCheckOut, setFormCheckOut] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Item form state
  const [itemType, setItemType] = useState<ShootItem["type"]>("custom");
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setBookings(JSON.parse(saved)); } catch { setBookings([]); }
    }
  }, []);

  const save = useCallback((data: AirbnbBooking[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setBookings(data);
  }, []);

  const addBooking = () => {
    if (!formModel || !formLocation || !formCheckIn) return;
    const booking: AirbnbBooking = {
      id: Date.now().toString(),
      model: formModel,
      location: formLocation,
      checkIn: formCheckIn,
      checkOut: formCheckOut,
      status: "upcoming",
      notes: formNotes,
      shootItems: [],
      createdBy: user?.username || "Unknown",
      createdAt: new Date().toISOString().split("T")[0],
      shareToken: generateToken(),
    };
    save([booking, ...bookings]);
    setShowForm(false);
    setFormModel(""); setFormLocation(""); setFormCheckIn(""); setFormCheckOut(""); setFormNotes("");
    setExpandedBooking(booking.id);
  };

  const updateBookingStatus = (id: string, status: AirbnbBooking["status"]) => {
    save(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const deleteBooking = (id: string) => {
    save(bookings.filter(b => b.id !== id));
  };

  const addShootItem = (bookingId: string) => {
    if (!itemTitle.trim()) return;
    const item: ShootItem = {
      id: Date.now().toString(),
      type: itemType,
      title: itemTitle.trim(),
      description: itemDesc.trim(),
      completed: false,
      completedAt: null,
    };
    save(bookings.map(b => b.id === bookingId ? { ...b, shootItems: [...b.shootItems, item] } : b));
    setItemTitle(""); setItemDesc("");
  };

  const toggleItem = (bookingId: string, itemId: string) => {
    save(bookings.map(b => b.id === bookingId ? {
      ...b,
      shootItems: b.shootItems.map(i => i.id === itemId ? {
        ...i,
        completed: !i.completed,
        completedAt: !i.completed ? new Date().toISOString().split("T")[0] : null,
      } : i),
    } : b));
  };

  const deleteItem = (bookingId: string, itemId: string) => {
    save(bookings.map(b => b.id === bookingId ? {
      ...b,
      shootItems: b.shootItems.filter(i => i.id !== itemId),
    } : b));
  };

  const copyShareLink = (booking: AirbnbBooking) => {
    // Generate a text-based checklist for sharing
    const lines = [
      `📸 SHOOT CHECKLIST — ${booking.model}`,
      `📍 ${booking.location}`,
      `📅 ${new Date(booking.checkIn).toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" })}${booking.checkOut ? ` — ${new Date(booking.checkOut).toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" })}` : ""}`,
      "",
      ...booking.shootItems.map((item, idx) => {
        const typeInfo = ITEM_TYPES.find(t => t.value === item.type);
        const check = item.completed ? "✅" : "⬜";
        let line = `${check} ${idx + 1}. ${typeInfo?.emoji || ""} ${item.title}`;
        if (item.description) line += `\n   ${item.description}`;
        return line;
      }),
      "",
      `Total: ${booking.shootItems.length} items | ${booking.shootItems.filter(i => i.completed).length} done`,
    ];
    
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      toast({ title: "Checklist copied!", description: "Paste it anywhere — Telegram, WhatsApp, etc." });
    });
  };

  // Stats
  const upcoming = bookings.filter(b => b.status === "upcoming").length;
  const inProgress = bookings.filter(b => b.status === "in_progress").length;
  const totalItems = bookings.reduce((s, b) => s + b.shootItems.length, 0);
  const completedItems = bookings.reduce((s, b) => s + b.shootItems.filter(i => i.completed).length, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-rose-400" />
            Airbnb Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track bookings, plan shoots, share checklists with models
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "New Booking"}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Upcoming</p>
          <p className="text-2xl font-bold text-blue-400">{upcoming}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">In Progress</p>
          <p className="text-2xl font-bold text-green-400">{inProgress}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Total Items</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{completedItems}</p>
        </div>
      </div>

      {/* Add Booking Form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">New Airbnb Booking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model</label>
              <select value={formModel} onChange={e => setFormModel(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select model...</option>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Location</label>
              <Input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="e.g. Brighton, 2-bed flat near seafront" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Check-in Date</label>
              <Input type="date" value={formCheckIn} onChange={e => setFormCheckIn(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Check-out Date</label>
              <Input type="date" value={formCheckOut} onChange={e => setFormCheckOut(e.target.value)} />
            </div>
          </div>
          <Textarea value={formNotes} onChange={e => setFormNotes(e.target.value)}
            placeholder="Notes — budget, special requirements, equipment needed..." className="min-h-[60px]" />
          <Button onClick={addBooking} disabled={!formModel || !formLocation || !formCheckIn}>Create Booking</Button>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <MapPin className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground text-sm">No bookings yet. Create one to start planning shoots!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const isExpanded = expandedBooking === booking.id;
            const completedCount = booking.shootItems.filter(i => i.completed).length;
            const totalCount = booking.shootItems.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div key={booking.id} className={`glass-card overflow-hidden ${booking.status === "upcoming" ? "border-blue-500/20" : booking.status === "in_progress" ? "border-green-500/20" : ""}`}>
                {/* Header */}
                <div className="p-4 cursor-pointer" onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{new Date(booking.checkIn).getDate()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {new Date(booking.checkIn).toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{booking.model.split(" ")[0]}</h3>
                          <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[booking.status]}`}>
                            {STATUS_LABELS[booking.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{completedCount}/{totalCount}</p>
                      <p className="text-[10px] text-muted-foreground">items done</p>
                      {totalCount > 0 && (
                        <div className="w-24 h-2 bg-zinc-800 rounded-full mt-1">
                          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border/30 p-4 space-y-4">
                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {canManage && (
                        <>
                          <select value={booking.status}
                            onChange={e => updateBookingStatus(booking.id, e.target.value as AirbnbBooking["status"])}
                            className="bg-secondary border border-border/30 rounded-md px-3 py-1.5 text-sm">
                            <option value="upcoming">📅 Upcoming</option>
                            <option value="in_progress">🟢 In Progress</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                          <Button size="sm" variant="outline" onClick={() => setShowAddItem(showAddItem === booking.id ? null : booking.id)}>
                            <Plus className="h-3 w-3 mr-1" /> Add Item
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copyShareLink(booking)}>
                        <Copy className="h-3 w-3 mr-1" /> Copy Text
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        const url = `${window.location.origin}/shoot/${booking.shareToken}`;
                        navigator.clipboard.writeText(url).then(() => {
                          toast({ title: "Share link copied!", description: "Send this to the model — no login needed." });
                        });
                      }}>
                        <Share2 className="h-3 w-3 mr-1" /> Share Link
                      </Button>
                      {canManage && (
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteBooking(booking.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      )}
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground italic">{booking.notes}</p>
                    )}

                    {/* Add Item Form */}
                    {showAddItem === booking.id && canManage && (
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Type</label>
                            <select value={itemType} onChange={e => setItemType(e.target.value as ShootItem["type"])}
                              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                              {ITEM_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Title</label>
                            <Input value={itemTitle} onChange={e => setItemTitle(e.target.value)}
                              placeholder="e.g. Ted custom — multi-toy video" />
                          </div>
                        </div>
                        <Textarea value={itemDesc} onChange={e => setItemDesc(e.target.value)}
                          placeholder="Detailed description — outfit, props, angles, duration, specific requirements..."
                          className="min-h-[80px]" />
                        <Button size="sm" onClick={() => addShootItem(booking.id)} disabled={!itemTitle.trim()}>
                          Add to Checklist
                        </Button>
                      </div>
                    )}

                    {/* Shoot Items */}
                    {booking.shootItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground/50 italic text-center py-4">
                        No items yet — add customs, feed posts, and PPV content to the shoot list
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {ITEM_TYPES.map(type => {
                          const items = booking.shootItems.filter(i => i.type === type.value);
                          if (items.length === 0) return null;
                          return (
                            <div key={type.value}>
                              <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1 mt-3">
                                {type.emoji} {type.label} ({items.filter(i => i.completed).length}/{items.length})
                              </p>
                              {items.map(item => (
                                <div key={item.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${item.completed ? "bg-green-500/5 opacity-60" : "bg-secondary/30"}`}>
                                  <button onClick={() => toggleItem(booking.id, item.id)}
                                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${item.completed ? "bg-green-500 border-green-500 text-white" : "border-zinc-500 hover:border-green-400"}`}>
                                    {item.completed && <CheckSquare className="h-3 w-3" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                      {item.title}
                                    </p>
                                    {item.description && (
                                      <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-pre-wrap">{item.description}</p>
                                    )}
                                  </div>
                                  {canManage && (
                                    <Button size="sm" variant="ghost" className="text-red-400 h-6 w-6 p-0 shrink-0"
                                      onClick={() => deleteItem(booking.id, item.id)}>
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
    </div>
  );
}
