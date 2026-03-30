import { useState, useEffect } from "react";
import { Shield, ShieldAlert, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Compact strikes overview panel for embedding in dashboard/other pages.
// Full management UI lives at /strikes (StrikeTracker page).

type StrikeStatus = "active" | "expired" | "appealed";

interface Strike {
  id: string;
  chatter_name: string;
  strike_number: 1 | 2 | 3;
  reason: string;
  issued_by: string;
  issued_at: string;
  expires_at: string | null;
  status: StrikeStatus;
}

const STORAGE_KEY = "strikes";
const CHATTERS = ["Marc", "JD", "Jemimah", "KC", "Jane"];

function loadStrikes(): Strike[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : Array.isArray(parsed?.strikes) ? parsed.strikes : [];
  } catch {
    return [];
  }
}

export default function StrikesPanel() {
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setStrikes(loadStrikes());
  }, []);

  const getActiveCount = (name: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return strikes.filter(
      (s) => s.chatter_name === name && s.status === "active" && new Date(s.issued_at) >= monthStart
    ).length;
  };

  const totalActive = CHATTERS.reduce((sum, c) => sum + getActiveCount(c), 0);

  return (
    <div
      className="glass-card p-5 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
      onClick={() => navigate("/strikes")}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Strike Tracker</h3>
        </div>
        <span className="text-xs text-muted-foreground">{totalActive} active</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {CHATTERS.map((name) => {
          const count = getActiveCount(name);
          const color =
            count === 0
              ? "text-green-400"
              : count === 1
              ? "text-yellow-400"
              : count === 2
              ? "text-orange-400"
              : "text-red-400";
          const bg =
            count === 0
              ? "bg-green-500/10 border-green-500/20"
              : count === 1
              ? "bg-yellow-500/10 border-yellow-500/20"
              : count === 2
              ? "bg-orange-500/10 border-orange-500/20"
              : "bg-red-500/10 border-red-500/20";

          return (
            <div key={name} className={`rounded-lg border p-2 text-center ${bg}`}>
              <p className="text-xs font-medium truncate">{name}</p>
              <p className={`text-lg font-bold ${color}`}>{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
