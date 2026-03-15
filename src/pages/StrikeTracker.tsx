import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Plus, Trash2, X, Shield, ShieldAlert, ShieldX } from "lucide-react";

interface Strike {
  id: string;
  chatterName: string;
  reason: string;
  date: string;
  issuedBy: string;
  strikeNumber: 1 | 2 | 3;
}

const STORAGE_KEY = "strike-tracker-data";
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
  "Other"
];

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

export default function StrikeTracker() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor";

  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formChatter, setFormChatter] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formCustomReason, setFormCustomReason] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setStrikes(JSON.parse(saved)); } catch { setStrikes([]); }
    }
  }, []);

  const save = useCallback((data: Strike[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStrikes(data);
  }, []);

  const getChatterStrikes = (name: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return strikes.filter(s => s.chatterName === name && new Date(s.date) >= monthStart);
  };

  const addStrike = () => {
    if (!formChatter || (!formReason && !formCustomReason)) return;
    const current = getChatterStrikes(formChatter);
    const strikeNum = Math.min(current.length + 1, 3) as 1 | 2 | 3;

    const newStrike: Strike = {
      id: Date.now().toString(),
      chatterName: formChatter,
      reason: formReason === "Other" ? formCustomReason : formReason,
      date: new Date().toISOString().split("T")[0],
      issuedBy: user?.username || "Unknown",
      strikeNumber: strikeNum,
    };

    save([newStrike, ...strikes]);
    setFormChatter("");
    setFormReason("");
    setFormCustomReason("");
    setShowForm(false);
  };

  const removeStrike = (id: string) => {
    save(strikes.filter(s => s.id !== id));
  };

  const now = new Date();
  const monthName = now.toLocaleString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strike Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            3-strike system — resets monthly. Strike 1: warning. Strike 2: final warning. Strike 3: removed.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Issue Strike"}
          </Button>
        )}
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
                onChange={e => setFormChatter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select chatter...</option>
                {CHATTERS.map(c => {
                  const count = getChatterStrikes(c).length;
                  return <option key={c} value={c}>{c} ({count}/3 strikes this month)</option>;
                })}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Reason</label>
              <select
                value={formReason}
                onChange={e => setFormReason(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select reason...</option>
                {STRIKE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {formReason === "Other" && (
            <Input
              value={formCustomReason}
              onChange={e => setFormCustomReason(e.target.value)}
              placeholder="Describe the issue..."
            />
          )}
          <Button onClick={addStrike} disabled={!formChatter || (!formReason && !formCustomReason)}>
            Issue Strike {formChatter && `to ${formChatter} (will be Strike ${Math.min(getChatterStrikes(formChatter).length + 1, 3)})`}
          </Button>
        </div>
      )}

      {/* Current Month Overview */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {monthName} — Current Standing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CHATTERS.map(name => {
            const count = getChatterStrikes(name).length;
            const bgColor = count === 0 ? "border-green-500/30" : count === 1 ? "border-yellow-500/30" : count === 2 ? "border-orange-500/30" : "border-red-500/30";
            const textColor = count === 0 ? "text-green-400" : count === 1 ? "text-yellow-400" : count === 2 ? "text-orange-400" : "text-red-400";
            return (
              <div key={name} className={`glass-card p-4 rounded-lg border ${bgColor} text-center`}>
                <p className="font-bold text-lg">{name}</p>
                <p className={`text-2xl font-bold ${textColor}`}>{count}/3</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {count === 0 ? "Clean" : count === 1 ? "Warning issued" : count === 2 ? "Final warning" : "REMOVED"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strike History */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Strike History</h2>
        {strikes.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No strikes issued yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {strikes.map(s => {
              const label = getStrikeLabel(s.strikeNumber);
              return (
                <div key={s.id} className="glass-card p-4 flex items-center gap-4">
                  {getStrikeIcon(s.strikeNumber)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{s.chatterName}</span>
                      <Badge variant="outline" className={`text-[10px] ${label.color}`}>{label.text}</Badge>
                      <span className="text-xs text-muted-foreground">{s.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.reason}</p>
                    <p className="text-[10px] text-muted-foreground">Issued by: {s.issuedBy}</p>
                  </div>
                  {canManage && (
                    <Button size="sm" variant="ghost" className="text-red-400 h-7" onClick={() => removeStrike(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
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
