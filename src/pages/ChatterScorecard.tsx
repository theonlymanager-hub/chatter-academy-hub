import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, TrendingUp, TrendingDown, Minus, Plus, X, Save } from "lucide-react";

interface ScoreEntry {
  id: string;
  chatterName: string;
  month: string; // "2026-03"
  responseTime: number; // 1-10
  personalisation: number;
  conversationFlow: number;
  ppvTiming: number;
  energyTone: number;
  overall: number; // auto-calculated average
  revenue: number; // $ earned that month
  notes: string;
  scoredBy: string;
  scoredAt: string;
}

const STORAGE_KEY = "chatter-scorecard-data";
const CHATTERS = ["Marc", "JD", "Jemimah", "KC", "Jane"];
const CATEGORIES = [
  { key: "responseTime", label: "Response Time", desc: "How fast do they reply? Under 5 min = good" },
  { key: "personalisation", label: "Personalisation", desc: "Do they use fan's name, reference past convos?" },
  { key: "conversationFlow", label: "Conversation Flow", desc: "Natural progression? Not robotic or copy-paste?" },
  { key: "ppvTiming", label: "PPV Timing", desc: "PPVs sent at the right moment? Not spam?" },
  { key: "energyTone", label: "Energy & Tone", desc: "Engaging? Fun? Or boring one-liners?" },
] as const;

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 8) return "bg-green-500/20 border-green-500/30";
  if (score >= 6) return "bg-yellow-500/20 border-yellow-500/30";
  if (score >= 4) return "bg-orange-500/20 border-orange-500/30";
  return "bg-red-500/20 border-red-500/30";
}

function getVerdict(score: number): { label: string; color: string } {
  if (score >= 8) return { label: "Excellent", color: "text-green-400" };
  if (score >= 6) return { label: "Acceptable", color: "text-yellow-400" };
  if (score >= 4) return { label: "Needs Improvement", color: "text-orange-400" };
  if (score >= 2) return { label: "At Risk", color: "text-red-400" };
  return { label: "TERMINATE", color: "text-red-500 font-bold" };
}

export default function ChatterScorecard() {
  const { user } = useAuth();
  const canScore = user?.role === "admin" || user?.role === "supervisor";

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formChatter, setFormChatter] = useState("");
  const [formRevenue, setFormRevenue] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formScores, setFormScores] = useState<Record<string, number>>({
    responseTime: 5, personalisation: 5, conversationFlow: 5, ppvTiming: 5, energyTone: 5,
  });

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleString("en-GB", { month: "long", year: "numeric" });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setScores(JSON.parse(saved)); } catch { setScores([]); }
    }
  }, []);

  const save = useCallback((data: ScoreEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setScores(data);
  }, []);

  const addScore = () => {
    if (!formChatter) return;
    const vals = CATEGORIES.map(c => formScores[c.key] || 5);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

    const entry: ScoreEntry = {
      id: Date.now().toString(),
      chatterName: formChatter,
      month: currentMonth,
      responseTime: formScores.responseTime,
      personalisation: formScores.personalisation,
      conversationFlow: formScores.conversationFlow,
      ppvTiming: formScores.ppvTiming,
      energyTone: formScores.energyTone,
      overall: Math.round(avg * 10) / 10,
      revenue: Number(formRevenue) || 0,
      notes: formNotes,
      scoredBy: user?.username || "Unknown",
      scoredAt: new Date().toISOString(),
    };

    save([entry, ...scores]);
    setFormChatter("");
    setFormRevenue("");
    setFormNotes("");
    setFormScores({ responseTime: 5, personalisation: 5, conversationFlow: 5, ppvTiming: 5, energyTone: 5 });
    setShowForm(false);
  };

  const deleteScore = (id: string) => {
    save(scores.filter(s => s.id !== id));
  };

  // Get latest score per chatter for current month
  const latestByChatter: Record<string, ScoreEntry> = {};
  scores.filter(s => s.month === currentMonth).forEach(s => {
    if (!latestByChatter[s.chatterName]) latestByChatter[s.chatterName] = s;
  });

  // Get previous month scores for trend
  const prevMonth = `${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}-${String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0")}`;
  const prevByChatter: Record<string, ScoreEntry> = {};
  scores.filter(s => s.month === prevMonth).forEach(s => {
    if (!prevByChatter[s.chatterName]) prevByChatter[s.chatterName] = s;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chatter Scorecards</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monthly performance scores — anchored to revenue. Below 4/10 = at risk of termination.
          </p>
        </div>
        {canScore && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Score Chatter"}
          </Button>
        )}
      </div>

      {/* Current Month Overview */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {monthLabel} — Performance Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CHATTERS.map(name => {
            const current = latestByChatter[name];
            const prev = prevByChatter[name];
            const score = current?.overall || 0;
            const prevScore = prev?.overall || 0;
            const trend = current && prev ? score - prevScore : 0;
            const verdict = current ? getVerdict(score) : { label: "Not scored", color: "text-muted-foreground" };

            return (
              <div key={name} className={`glass-card p-4 rounded-lg border ${current ? getScoreBg(score) : "border-border/20"}`}>
                <p className="font-bold text-lg">{name}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold ${current ? getScoreColor(score) : "text-muted-foreground/30"}`}>
                    {current ? score.toFixed(1) : "—"}
                  </p>
                  <span className="text-sm text-muted-foreground">/10</span>
                  {trend !== 0 && (
                    <span className={`flex items-center text-xs ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
                      {trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                      {trend > 0 ? "+" : ""}{trend.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] mt-1 ${verdict.color}`}>{verdict.label}</p>
                {current && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">${current.revenue.toLocaleString()} revenue</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Score Form */}
      {showForm && canScore && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">Score Chatter — {monthLabel}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Chatter</label>
              <select
                value={formChatter}
                onChange={e => setFormChatter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select chatter...</option>
                {CHATTERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Monthly Revenue ($)</label>
              <input
                type="number"
                value={formRevenue}
                onChange={e => setFormRevenue(e.target.value)}
                placeholder="Total $ generated this month"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            {CATEGORIES.map(cat => (
              <div key={cat.key} className="flex items-center gap-4">
                <div className="w-48 shrink-0">
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.desc}</p>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formScores[cat.key]}
                  onChange={e => setFormScores(prev => ({ ...prev, [cat.key]: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className={`text-lg font-bold w-8 text-center ${getScoreColor(formScores[cat.key])}`}>
                  {formScores[cat.key]}
                </span>
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Notes</label>
            <Textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="Specific feedback, what to improve, what they did well..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              Average: <span className={`font-bold text-lg ${getScoreColor(CATEGORIES.reduce((sum, c) => sum + (formScores[c.key] || 5), 0) / CATEGORIES.length)}`}>
                {(CATEGORIES.reduce((sum, c) => sum + (formScores[c.key] || 5), 0) / CATEGORIES.length).toFixed(1)}
              </span>/10
            </div>
            <Button onClick={addScore} disabled={!formChatter}>
              <Save className="h-4 w-4 mr-1" /> Save Scorecard
            </Button>
          </div>
        </div>
      )}

      {/* Score History */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Score History</h2>
        {scores.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No scores yet. Start scoring chatters to track performance.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scores.slice(0, 20).map(s => {
              const verdict = getVerdict(s.overall);
              return (
                <div key={s.id} className={`glass-card p-4 border ${getScoreBg(s.overall)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-lg">{s.chatterName}</span>
                        <span className={`text-2xl font-bold ${getScoreColor(s.overall)}`}>{s.overall.toFixed(1)}/10</span>
                        <Badge variant="outline" className={`text-[10px] ${verdict.color}`}>{verdict.label}</Badge>
                        <span className="text-xs text-muted-foreground">{s.month}</span>
                        <span className="text-xs text-green-400 font-semibold">${s.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-3 mt-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                          <span key={cat.key} className="text-[10px] text-muted-foreground">
                            {cat.label}: <span className={getScoreColor(s[cat.key as keyof ScoreEntry] as number)}>{String(s[cat.key as keyof ScoreEntry])}</span>
                          </span>
                        ))}
                      </div>
                      {s.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{s.notes}"</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">Scored by {s.scoredBy} on {new Date(s.scoredAt).toLocaleDateString("en-GB")}</p>
                    </div>
                    {canScore && (
                      <Button size="sm" variant="ghost" className="text-red-400 h-7" onClick={() => deleteScore(s.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
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
