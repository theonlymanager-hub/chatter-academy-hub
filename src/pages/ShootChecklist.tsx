import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CheckSquare, MapPin, Calendar, Camera } from "lucide-react";

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
  status: string;
  notes: string;
  shootItems: ShootItem[];
  createdBy: string;
  createdAt: string;
  shareToken: string;
}

const STORAGE_KEY = "airbnb-tracker-v1";
const ITEM_TYPES = [
  { value: "custom", label: "Custom Orders", emoji: "🎯" },
  { value: "feed", label: "Feed Posts", emoji: "📸" },
  { value: "ppv", label: "PPV Content", emoji: "💰" },
  { value: "content_bank", label: "Content Bank", emoji: "🗂️" },
  { value: "other", label: "Other", emoji: "📋" },
];

export default function ShootChecklist() {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<AirbnbBooking | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const bookings: AirbnbBooking[] = JSON.parse(saved);
        const found = bookings.find(b => b.shareToken === token);
        if (found) {
          setBooking(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [token]);

  const toggleItem = useCallback((itemId: string) => {
    if (!booking) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const bookings: AirbnbBooking[] = JSON.parse(saved);
      const updated = bookings.map(b => {
        if (b.shareToken !== token) return b;
        return {
          ...b,
          shootItems: b.shootItems.map(i => i.id === itemId ? {
            ...i,
            completed: !i.completed,
            completedAt: !i.completed ? new Date().toISOString().split("T")[0] : null,
          } : i),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      const refreshed = updated.find(b => b.shareToken === token);
      if (refreshed) setBooking({ ...refreshed });
    } catch {}
  }, [booking, token]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Camera className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
          <h1 className="text-xl font-bold">Checklist not found</h1>
          <p className="text-zinc-400 mt-2 text-sm">This link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const completedCount = booking.shootItems.filter(i => i.completed).length;
  const totalCount = booking.shootItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-rose-500/20 to-transparent">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
          <div className="text-center">
            <p className="text-rose-400 text-xs uppercase tracking-widest font-semibold">Shoot Checklist</p>
            <h1 className="text-3xl font-bold mt-2">{booking.model}</h1>
            <div className="flex items-center justify-center gap-2 mt-2 text-zinc-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{booking.location}</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-1 text-zinc-400 text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(booking.checkIn).toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" })}
                {booking.checkOut && ` — ${new Date(booking.checkOut).toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" })}`}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-400">Progress</span>
              <span className="font-bold text-lg">{completedCount}/{totalCount}</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            {progress === 100 && totalCount > 0 && (
              <p className="text-center text-green-400 font-semibold mt-3 text-sm">✨ All done! Amazing work! ✨</p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-lg mx-auto px-4 pb-12 space-y-6">
        {booking.notes && (
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Notes</p>
            <p className="text-sm text-zinc-300">{booking.notes}</p>
          </div>
        )}

        {ITEM_TYPES.map(type => {
          const items = booking.shootItems.filter(i => i.type === type.value);
          if (items.length === 0) return null;
          const typeCompleted = items.filter(i => i.completed).length;

          return (
            <div key={type.value}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <span className="text-lg">{type.emoji}</span>
                  {type.label}
                </h2>
                <span className="text-xs text-zinc-500">{typeCompleted}/{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <button key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full text-left rounded-xl p-4 transition-all duration-200 active:scale-[0.98] ${
                      item.completed
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        item.completed
                          ? "bg-green-500 border-green-500"
                          : "border-zinc-600"
                      }`}>
                        {item.completed && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${item.completed ? "line-through text-zinc-500" : "text-white"}`}>
                          {idx + 1}. {item.title}
                        </p>
                        {item.description && (
                          <p className={`text-xs mt-1 leading-relaxed whitespace-pre-wrap ${item.completed ? "text-zinc-600" : "text-zinc-400"}`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {totalCount === 0 && (
          <div className="text-center py-12">
            <Camera className="h-10 w-10 mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No items on this checklist yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
