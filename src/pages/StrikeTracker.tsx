import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Shield,
  ShieldAlert,
  ShieldX,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  CheckCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "strikes";
const CHATTERS = ["Marc", "JD", "Jemimah", "KC", "Jane"];
const STRIKE_REASONS = [
  "30+ min reply wait (repeated)",
  "PPV spam",
  "Copy-paste messages",
  "Missed shift",
  "Ignored customs",
  "Poor quality chatting",
  "Failed to follow feedback",
  "No end-of-shift log",
  "Other",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uuid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getStrikeIcon(n: number) {
  if (n === 1) return <Shield className="h-4 w-4 text-yellow-400" />;
  if (n === 2) return <ShieldAlert className="h-4 w-4 text-orange-400" />;
  return <ShieldX className="h-4 w-4 text-red-400" />;
}

function getStrikeLabel(n: number) {
  if (n === 1) return { text: "Strike 1 — Written Warning", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
  if (n === 2) return { text: "Strike 2 — Final Warning", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
  return { text: "Strike 3 — Removed", color: "bg-red-500/20 text-red-300 border-red-500/30" };
}

function statusBadge(status: StrikeStatus) {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-300 border-red-500/30">Active</Badge>;
    case "expired":
      return <Badge variant="outline" className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/30">Expired</Badge>;
    case "appealed":
      return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-300 border-blue-500/30">Appealed</Badge>;
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// ---------------------------------------------------------------------------
// Local storage helpers
// ---------------------------------------------------------------------------

function loadStrikes(): Strike[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Support both { strikes: [...] } and plain array
    return Array.isArray(parsed) ? parsed : Array.isArray(parsed?.strikes) ? parsed.strikes : [];
  } catch {
    return [];
  }
}

function saveStrikes(strikes: Strike[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ strikes }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StrikeTracker() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor";

  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formChatter, setFormChatter] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formCustomReason, setFormCustomReason] = useState("");
  const [expandedChatter, setExpandedChatter] = useState<string | null>(null);

  // Load
  useEffect(() => {
    setStrikes(loadStrikes());
  }, []);

  // Persist
  const save = useCallback((data: Strike[]) => {
    saveStrikes(data);
    setStrikes(data);
  }, []);

  // Active strikes for a chatter this month
  const getActiveMonthStrikes = useCallback(
    (name: string) => {
      const monthStart = getMonthStart();
      return strikes.filter(
        (s) =>
          s.chatter_name === name &&
          s.status === "active" &&
          new Date(s.issued_at) >= monthStart
      );
    },
    [strikes]
  );

  // All strikes for a chatter (any status)
  const getAllChatterStrikes = useCallback(
    (name: string) => strikes.filter((s) => s.chatter_name === name),
    [strikes]
  );

  // Issue strike
  const addStrike = () => {
    if (!formChatter || (!formReason && !formCustomReason)) return;
    const current = getActiveMonthStrikes(formChatter);
    const strikeNum = Math.min(current.length + 1, 3) as 1 | 2 | 3;
    const now = new Date().toISOString();

    const newStrike: Strike = {
      id: uuid(),
      chatter_name: formChatter,
      strike_number: strikeNum,
      reason: formReason === "Other" ? formCustomReason : formReason,
      issued_by: user?.username || user?.displayName || "Unknown",
      issued_at: now,
      expires_at: null,
      status: "active",
    };

    save([newStrike, ...strikes]);
    setFormChatter("");
    setFormReason("");
    setFormCustomReason("");
    setShowForm(false);
  };

  // Remove strike
  const removeStrike = (id: string) => {
    save(strikes.filter((s) => s.id !== id));
  };

  // Change status
  const setStrikeStatus = (id: string, status: StrikeStatus) => {
    save(strikes.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  // Monthly reset — expire all active strikes
  const monthlyReset = () => {
    if (!confirm("This will expire all active strikes. Continue?")) return;
    save(
      strikes.map((s) =>
        s.status === "active" ? { ...s, status: "expired" as StrikeStatus, expires_at: new Date().toISOString() } : s
      )
    );
  };

  const now = new Date();
  const monthName = now.toLocaleString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strike Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            3-strike system — resets monthly. Strike 1: warning. Strike 2: final warning. Strike 3: removed.
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <>
              <Button size="sm" variant="outline" onClick={monthlyReset} className="text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Monthly Reset
              </Button>
              <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
                {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                {showForm ? "Cancel" : "Issue Strike"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Add Strike Form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">Issue Strike</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Chatter</label>
              <select
                value={formChatter}
                onChange={(e) => setFormChatter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select chatter...</option>
                {CHATTERS.map((c) => {
                  const count = getActiveMonthStrikes(c).length;
                  return (
                    <option key={c} value={c} disabled={count >= 3}>
                      {c} ({count}/3 strikes this month)
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Reason</label>
              <select
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select reason...</option>
                {STRIKE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {formReason === "Other" && (
            <Input
              value={formCustomReason}
              onChange={(e) => setFormCustomReason(e.target.value)}
              placeholder="Describe the issue..."
            />
          )}
          <Button onClick={addStrike} disabled={!formChatter || (!formReason && !formCustomReason)}>
            Issue Strike{" "}
            {formChatter &&
              `to ${formChatter} (will be Strike ${Math.min(getActiveMonthStrikes(formChatter).length + 1, 3)})`}
          </Button>
        </div>
      )}

      {/* Current Month Overview — click to expand */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {monthName} — Current Standing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CHATTERS.map((name) => {
            const count = getActiveMonthStrikes(name).length;
            const isExpanded = expandedChatter === name;
            const borderColor =
              count === 0
                ? "border-green-500/30"
                : count === 1
                ? "border-yellow-500/30"
                : count === 2
                ? "border-orange-500/30"
                : "border-red-500/30";
            const textColor =
              count === 0
                ? "text-green-400"
                : count === 1
                ? "text-yellow-400"
                : count === 2
                ? "text-orange-400"
                : "text-red-400";
            const bgGlow =
              count === 0
                ? ""
                : count === 1
                ? "shadow-yellow-500/5"
                : count === 2
                ? "shadow-orange-500/10"
                : "shadow-red-500/10";

            return (
              <div
                key={name}
                className={`glass-card p-4 rounded-lg border ${borderColor} text-center cursor-pointer transition-all hover:scale-[1.02] ${bgGlow} ${
                  isExpanded ? "ring-1 ring-primary/40" : ""
                }`}
                onClick={() => setExpandedChatter(isExpanded ? null : name)}
              >
                <p className="font-bold text-lg">{name}</p>
                <p className={`text-2xl font-bold ${textColor}`}>{count}/3</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {count === 0
                    ? "✅ Clean"
                    : count === 1
                    ? "⚠️ Warning issued"
                    : count === 2
                    ? "🟠 Final warning"
                    : "🔴 REMOVED"}
                </p>
                <div className="mt-1">
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 mx-auto text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mx-auto text-muted-foreground" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Chatter History */}
      {expandedChatter && (
        <div className="glass-card p-5 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {expandedChatter}'s Strike History
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setExpandedChatter(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {getAllChatterStrikes(expandedChatter).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No strikes on record.</p>
          ) : (
            <div className="space-y-2">
              {getAllChatterStrikes(expandedChatter)
                .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
                .map((s) => {
                  const label = getStrikeLabel(s.strike_number);
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                      {getStrikeIcon(s.strike_number)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] ${label.color}`}>
                            {label.text}
                          </Badge>
                          {statusBadge(s.status)}
                          <span className="text-xs text-muted-foreground">{formatDateTime(s.issued_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{s.reason}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Issued by: {s.issued_by}
                          {s.expires_at && ` · Expired: ${formatDate(s.expires_at)}`}
                        </p>
                      </div>
                      {canManage && (
                        <div className="flex gap-1 shrink-0">
                          {s.status === "active" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 h-7 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStrikeStatus(s.id, "appealed");
                              }}
                            >
                              Appeal
                            </Button>
                          )}
                          {s.status !== "active" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-400 h-7 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStrikeStatus(s.id, "active");
                              }}
                            >
                              Reactivate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStrike(s.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Full Strike History */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          All Strike History
        </h2>
        {strikes.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No strikes issued yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {strikes
              .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
              .map((s) => {
                const label = getStrikeLabel(s.strike_number);
                return (
                  <div key={s.id} className="glass-card p-4 flex items-center gap-4">
                    {getStrikeIcon(s.strike_number)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{s.chatter_name}</span>
                        <Badge variant="outline" className={`text-[10px] ${label.color}`}>
                          {label.text}
                        </Badge>
                        {statusBadge(s.status)}
                        <span className="text-xs text-muted-foreground">{formatDateTime(s.issued_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{s.reason}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Issued by: {s.issued_by}
                        {s.expires_at && ` · Expired: ${formatDate(s.expires_at)}`}
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex gap-1 shrink-0">
                        {s.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 h-7 text-[10px]"
                            onClick={() => setStrikeStatus(s.id, "appealed")}
                          >
                            Appeal
                          </Button>
                        )}
                        {s.status !== "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-yellow-400 h-7 text-[10px]"
                            onClick={() => setStrikeStatus(s.id, "active")}
                          >
                            Reactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 h-7"
                          onClick={() => removeStrike(s.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
  );
}
