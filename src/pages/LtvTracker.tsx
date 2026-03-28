import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, TrendingUp, TrendingDown, Minus, DollarSign, Users, Target, Calendar } from "lucide-react";

interface LtvEntry {
  id: string;
  date: string;
  model: string;
  subscribers: number;
  revenue: number;
  ltv: number;
  notes: string;
  addedBy: string;
}

interface OverallEntry {
  id: string;
  date: string;
  totalSubs: number;
  totalRevenue: number;
  overallLtv: number;
  entries: { model: string; subs: number; revenue: number; ltv: number }[];
  addedBy: string;
}

const STORAGE_KEY = "ltv-tracker-v1";
const MODELS = ["Ashley Morris", "Izzy", "Willow"];
const LTV_TARGET = 7.5; // $7-8 target, use midpoint

export default function LtvTracker() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor" || user?.role === "data_entry";

  const [entries, setEntries] = useState<OverallEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formData, setFormData] = useState<Record<string, { subs: string; revenue: string }>>(
    Object.fromEntries(MODELS.map(m => [m, { subs: "", revenue: "" }]))
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch { setEntries([]); }
    }
  }, []);

  const save = useCallback((data: OverallEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setEntries(data);
  }, []);

  const addEntry = () => {
    const modelEntries = MODELS.map(m => {
      const subs = parseInt(formData[m]?.subs || "0") || 0;
      const revenue = parseFloat(formData[m]?.revenue || "0") || 0;
      return { model: m, subs, revenue, ltv: subs > 0 ? Math.round((revenue / subs) * 100) / 100 : 0 };
    }).filter(e => e.subs > 0 || e.revenue > 0);

    const totalSubs = modelEntries.reduce((s, e) => s + e.subs, 0);
    const totalRevenue = modelEntries.reduce((s, e) => s + e.revenue, 0);

    if (totalSubs === 0) return;

    const entry: OverallEntry = {
      id: Date.now().toString(),
      date: formDate,
      totalSubs,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      overallLtv: Math.round((totalRevenue / totalSubs) * 100) / 100,
      entries: modelEntries,
      addedBy: user?.username || "Unknown",
    };

    const updated = [entry, ...entries].sort((a, b) => b.date.localeCompare(a.date));
    save(updated);
    setShowForm(false);
    setFormData(Object.fromEntries(MODELS.map(m => [m, { subs: "", revenue: "" }])));
  };

  const deleteEntry = (id: string) => {
    save(entries.filter(e => e.id !== id));
  };

  // Trend calculation
  const getTrend = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 0.01) return { direction: "flat" as const, diff: 0 };
    return { direction: diff > 0 ? "up" as const : "down" as const, diff: Math.round(diff * 100) / 100 };
  };

  // Latest stats
  const latest = entries[0];
  const previous = entries[1];
  const ltvTrend = latest && previous ? getTrend(latest.overallLtv, previous.overallLtv) : null;

  // Weekly averages (last 4 weeks)
  const weeklyData: { week: string; ltv: number; subs: number; revenue: number }[] = [];
  const now = new Date();
  for (let w = 0; w < 4; w++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (w * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEntries = entries.filter(e => {
      const d = new Date(e.date);
      return d >= weekStart && d <= weekEnd;
    });
    if (weekEntries.length > 0) {
      const avgLtv = weekEntries.reduce((s, e) => s + e.overallLtv, 0) / weekEntries.length;
      const avgSubs = weekEntries.reduce((s, e) => s + e.totalSubs, 0) / weekEntries.length;
      const avgRev = weekEntries.reduce((s, e) => s + e.totalRevenue, 0) / weekEntries.length;
      weeklyData.push({
        week: `${weekStart.toLocaleDateString("en-GB", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`,
        ltv: Math.round(avgLtv * 100) / 100,
        subs: Math.round(avgSubs),
        revenue: Math.round(avgRev),
      });
    }
  }

  // Per-model latest LTV
  const modelLatest = MODELS.map(m => {
    const latestEntry = latest?.entries.find(e => e.model === m);
    const prevEntry = previous?.entries.find(e => e.model === m);
    return {
      model: m,
      ltv: latestEntry?.ltv || 0,
      subs: latestEntry?.subs || 0,
      revenue: latestEntry?.revenue || 0,
      trend: latestEntry && prevEntry ? getTrend(latestEntry.ltv, prevEntry.ltv) : null,
    };
  });

  const TrendIcon = ({ trend }: { trend: ReturnType<typeof getTrend> }) => {
    if (!trend) return null;
    if (trend.direction === "up") return <TrendingUp className="h-3 w-3 text-green-400 inline ml-1" />;
    if (trend.direction === "down") return <TrendingDown className="h-3 w-3 text-red-400 inline ml-1" />;
    return <Minus className="h-3 w-3 text-zinc-400 inline ml-1" />;
  };

  const LtvBadge = ({ ltv }: { ltv: number }) => {
    if (ltv >= LTV_TARGET) return <Badge className="bg-green-500/20 text-green-300 text-[10px]">On Target</Badge>;
    if (ltv >= LTV_TARGET * 0.6) return <Badge className="bg-yellow-500/20 text-yellow-300 text-[10px]">Below Target</Badge>;
    return <Badge className="bg-red-500/20 text-red-300 text-[10px]">Critical</Badge>;
  };

  // Simple bar visualization
  const LtvBar = ({ ltv, max }: { ltv: number; max: number }) => {
    const pct = Math.min((ltv / max) * 100, 100);
    const targetPct = Math.min((LTV_TARGET / max) * 100, 100);
    return (
      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden mt-1">
        <div className="absolute h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: ltv >= LTV_TARGET ? "#22c55e" : ltv >= LTV_TARGET * 0.6 ? "#eab308" : "#ef4444" }} />
        <div className="absolute h-full w-0.5 bg-amber-400/60" style={{ left: `${targetPct}%` }} />
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-400" />
            LTV Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Lifetime Value per subscriber — target: ${LTV_TARGET}/sub
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? "Cancel" : <><Plus className="h-4 w-4 mr-1" /> Add Entry</>}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <p className="text-[10px] text-muted-foreground uppercase">Overall LTV</p>
          </div>
          <p className="text-3xl font-bold mt-1">
            ${latest?.overallLtv.toFixed(2) || "—"}
            <TrendIcon trend={ltvTrend} />
          </p>
          {ltvTrend && (
            <p className={`text-[10px] mt-1 ${ltvTrend.direction === "up" ? "text-green-400" : ltvTrend.direction === "down" ? "text-red-400" : "text-zinc-400"}`}>
              {ltvTrend.diff > 0 ? "+" : ""}{ltvTrend.diff.toFixed(2)} from last
            </p>
          )}
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            <p className="text-[10px] text-muted-foreground uppercase">Target</p>
          </div>
          <p className="text-3xl font-bold mt-1">${LTV_TARGET.toFixed(2)}</p>
          {latest && (
            <p className={`text-[10px] mt-1 ${latest.overallLtv >= LTV_TARGET ? "text-green-400" : "text-red-400"}`}>
              {latest.overallLtv >= LTV_TARGET ? "✅ On target" : `${((latest.overallLtv / LTV_TARGET) * 100).toFixed(0)}% of target`}
            </p>
          )}
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <p className="text-[10px] text-muted-foreground uppercase">Total Subs</p>
          </div>
          <p className="text-3xl font-bold mt-1">{latest?.totalSubs || "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Latest snapshot</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <p className="text-[10px] text-muted-foreground uppercase">Revenue</p>
          </div>
          <p className="text-3xl font-bold mt-1">${latest?.totalRevenue.toFixed(0) || "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Latest snapshot</p>
        </div>
      </div>

      {/* Per-Model Breakdown */}
      <div>
        <h2 className="text-lg font-bold mb-3">Per-Model LTV</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modelLatest.map(m => (
            <div key={m.model} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{m.model.split(" ")[0]}</p>
                  <p className="text-2xl font-bold mt-1">
                    ${m.ltv.toFixed(2)}
                    <TrendIcon trend={m.trend} />
                  </p>
                </div>
                <div className="text-right">
                  <LtvBadge ltv={m.ltv} />
                  <p className="text-[10px] text-muted-foreground mt-2">{m.subs} subs · ${m.revenue}</p>
                </div>
              </div>
              <LtvBar ltv={m.ltv} max={LTV_TARGET * 1.5} />
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Averages */}
      {weeklyData.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Weekly Trend
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {weeklyData.map((w, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <p className="text-[10px] text-muted-foreground">{w.week}</p>
                <p className="text-2xl font-bold mt-1">${w.ltv.toFixed(2)}</p>
                <LtvBar ltv={w.ltv} max={LTV_TARGET * 1.5} />
                <p className="text-[10px] text-muted-foreground mt-2">{w.subs} subs · ${w.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">Add LTV Snapshot</h3>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Date</label>
            <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="max-w-xs" />
          </div>
          <div className="space-y-3">
            {MODELS.map(model => (
              <div key={model} className="flex items-center gap-3">
                <span className="font-medium text-sm w-32 shrink-0">{model.split(" ")[0]}</span>
                <div className="flex gap-2 flex-1">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground">Subscribers</label>
                    <Input type="number" placeholder="0" value={formData[model]?.subs || ""}
                      onChange={e => setFormData(prev => ({ ...prev, [model]: { ...prev[model], subs: e.target.value } }))} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground">Revenue ($)</label>
                    <Input type="number" step="0.01" placeholder="0.00" value={formData[model]?.revenue || ""}
                      onChange={e => setFormData(prev => ({ ...prev, [model]: { ...prev[model], revenue: e.target.value } }))} />
                  </div>
                  <div className="w-20 text-center pt-5">
                    <p className="text-sm font-bold text-amber-400">
                      ${formData[model]?.subs && formData[model]?.revenue && parseInt(formData[model].subs) > 0
                        ? (parseFloat(formData[model].revenue) / parseInt(formData[model].subs)).toFixed(2)
                        : "—"}
                    </p>
                    <p className="text-[8px] text-muted-foreground">LTV</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={addEntry}>Save Snapshot</Button>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-bold mb-3">History</h2>
        {entries.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <DollarSign className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">No LTV data yet. Add your first snapshot!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => {
              const prev = entries[idx + 1];
              const trend = prev ? getTrend(entry.overallLtv, prev.overallLtv) : null;
              return (
                <div key={entry.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold">{new Date(entry.date).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })}</p>
                        <p className="text-[10px] text-muted-foreground">by {entry.addedBy}</p>
                      </div>
                      <div className="text-center px-4 border-l border-border/30">
                        <p className="text-xl font-bold">${entry.overallLtv.toFixed(2)}<TrendIcon trend={trend} /></p>
                        <p className="text-[10px] text-muted-foreground">Overall LTV</p>
                      </div>
                      <div className="text-center px-4 border-l border-border/30">
                        <p className="font-semibold">{entry.totalSubs}</p>
                        <p className="text-[10px] text-muted-foreground">Subs</p>
                      </div>
                      <div className="text-center px-4 border-l border-border/30">
                        <p className="font-semibold">${entry.totalRevenue.toFixed(0)}</p>
                        <p className="text-[10px] text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LtvBadge ltv={entry.overallLtv} />
                      {canManage && (
                        <Button size="sm" variant="ghost" className="text-red-400 h-7 w-7 p-0"
                          onClick={() => deleteEntry(entry.id)}>×</Button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px]">
                    {entry.entries.map(me => (
                      <span key={me.model} className="text-muted-foreground">
                        {me.model.split(" ")[0]}: <strong className="text-foreground">${me.ltv.toFixed(2)}</strong> ({me.subs} subs)
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
