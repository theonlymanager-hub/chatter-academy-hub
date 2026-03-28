import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { chatterColors } from "@/lib/mock-data";
import {
  User, Clock, Star, TrendingUp, TrendingDown, Minus,
  MessageSquare, DollarSign, Calendar, AlertTriangle,
  ThumbsUp, ThumbsDown, Save, Edit2, X,
} from "lucide-react";

// ── Chatter definitions ────────────────────────────────────────────────────
const CHATTERS = [
  { name: "Marc", role: "Chatter", shift: "6AM – 2PM", shiftLabel: "Morning", shiftColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { name: "Jaydee", role: "Chatter", shift: "2PM – 10PM", shiftLabel: "Afternoon", shiftColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { name: "Jemimah", role: "Chatter", shift: "10PM – 6AM", shiftLabel: "Night", shiftColor: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  { name: "KC", role: "Chatter", shift: "6AM – 2PM", shiftLabel: "Morning", shiftColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { name: "Jane", role: "Chatter", shift: "6AM – 2PM", shiftLabel: "Morning", shiftColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
] as const;

const STORAGE_KEY = "chatter-profiles-data";

interface QualityRecord {
  id: string;
  chatter_name: string;
  overall_score: number;
  response_time_score: number | null;
  personalisation_score: number | null;
  conversation_flow_score: number | null;
  ppv_timing_score: number | null;
  energy_tone_score: number | null;
  notes: string | null;
  shift_date: string | null;
  reviewed_by: string | null;
  created_at: string;
}

interface ProfileData {
  strongPoints: string;
  weakPoints: string;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 8) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 6) return "bg-amber-500/10 border-amber-500/30";
  if (score >= 4) return "bg-orange-500/10 border-orange-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function getScoreLabel(score: number): string {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Needs Work";
  return "At Risk";
}

export default function ChatterScorecard() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "supervisor";

  const [allScores, setAllScores] = useState<Record<string, QualityRecord[]>>({});
  const [profileData, setProfileData] = useState<Record<string, ProfileData>>({});
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editStrong, setEditStrong] = useState("");
  const [editWeak, setEditWeak] = useState("");

  // Load profile data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setProfileData(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Fetch all quality scores from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("quality_scores")
        .select("id, chatter_name, overall_score, response_time_score, personalisation_score, conversation_flow_score, ppv_timing_score, energy_tone_score, notes, shift_date, reviewed_by, created_at")
        .order("created_at", { ascending: false });

      if (error || !data) return;

      const grouped: Record<string, QualityRecord[]> = {};
      for (const row of data) {
        if (!row.chatter_name) continue;
        if (!grouped[row.chatter_name]) grouped[row.chatter_name] = [];
        grouped[row.chatter_name].push(row as QualityRecord);
      }
      setAllScores(grouped);
    })();
  }, []);

  const saveProfileData = (name: string, strong: string, weak: string) => {
    const updated = { ...profileData, [name]: { strongPoints: strong, weakPoints: weak } };
    setProfileData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEditingProfile(null);
  };

  const startEditing = (name: string) => {
    setEditStrong(profileData[name]?.strongPoints || "");
    setEditWeak(profileData[name]?.weakPoints || "");
    setEditingProfile(name);
  };

  // Get weekly scores (last 7 days)
  const getWeeklyAvg = (name: string): number | null => {
    const records = allScores[name];
    if (!records || records.length === 0) return null;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekScores = records.filter(r => new Date(r.created_at) >= weekAgo);
    if (weekScores.length === 0) return null;
    return weekScores.reduce((sum, r) => sum + r.overall_score, 0) / weekScores.length;
  };

  // Get consistent issues from recent notes
  const getConsistentIssues = (name: string): string[] => {
    const records = allScores[name];
    if (!records) return [];
    const recentNotes = records
      .slice(0, 10)
      .map(r => r.notes)
      .filter(Boolean) as string[];

    // Parse notes for issues — look for patterns
    const issues: string[] = [];
    const noteText = recentNotes.join(" ").toLowerCase();

    if (noteText.includes("response") || noteText.includes("slow") || noteText.includes("speed"))
      issues.push("Response time needs improvement");
    if (noteText.includes("personal") || noteText.includes("generic") || noteText.includes("copy"))
      issues.push("Lacks personalisation");
    if (noteText.includes("ppv") || noteText.includes("timing") || noteText.includes("spam"))
      issues.push("PPV timing/strategy");
    if (noteText.includes("tone") || noteText.includes("energy") || noteText.includes("boring"))
      issues.push("Energy & tone issues");
    if (noteText.includes("flow") || noteText.includes("conversation") || noteText.includes("abrupt"))
      issues.push("Conversation flow");
    if (noteText.includes("follow") || noteText.includes("aftercare"))
      issues.push("Follow-up / aftercare");

    return issues;
  };

  // Count shifts this week (from shiftSchedule data — hardcoded since schedule is fixed daily)
  const getShiftsThisWeek = (): number => {
    // All chatters work every day in the schedule, so 7 shifts/week
    return 7;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chatter Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Individual performance profiles with QC scores, strengths, and areas to improve
        </p>
      </div>

      {/* Chatter Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {CHATTERS.map((chatter) => {
          const color = chatterColors[chatter.name] || "217 91% 60%";
          const records = allScores[chatter.name] || [];
          const latest = records[0];
          const latestScore = latest?.overall_score ?? null;
          const weeklyAvg = getWeeklyAvg(chatter.name);
          const issues = getConsistentIssues(chatter.name);
          const profile = profileData[chatter.name];
          const isEditing = editingProfile === chatter.name;

          // Score trend
          let trend: number | null = null;
          if (records.length >= 2) {
            trend = records[0].overall_score - records[1].overall_score;
          }

          return (
            <div key={chatter.name} className="glass-card rounded-xl overflow-hidden">
              {/* Header */}
              <div
                className="p-5 pb-4"
                style={{ background: `linear-gradient(135deg, hsl(${color} / 0.15), hsl(${color} / 0.05))` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold shadow-lg"
                    style={{ backgroundColor: `hsl(${color} / 0.25)`, color: `hsl(${color})`, border: `2px solid hsl(${color} / 0.4)` }}
                  >
                    {chatter.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{chatter.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}>
                        {chatter.role}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] border ${chatter.shiftColor}`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {chatter.shift}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Hero */}
              <div className="px-5 py-4">
                <div className={`rounded-xl p-4 border ${latestScore !== null ? getScoreBg(latestScore) : "border-border/20 bg-secondary/20"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Latest QC Score</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-4xl font-extrabold ${latestScore !== null ? getScoreColor(latestScore) : "text-muted-foreground/30"}`}>
                          {latestScore !== null ? latestScore.toFixed(1) : "—"}
                        </span>
                        <span className="text-sm text-muted-foreground">/10</span>
                        {trend !== null && trend !== 0 && (
                          <span className={`flex items-center text-xs ml-1 ${trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                            {trend > 0 ? "+" : ""}{trend.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {latestScore !== null && (
                        <Badge variant="outline" className={`text-[10px] mt-1 ${getScoreColor(latestScore)}`}>
                          {getScoreLabel(latestScore)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Weekly Avg</p>
                      <span className={`text-2xl font-bold ${weeklyAvg !== null ? getScoreColor(weeklyAvg) : "text-muted-foreground/30"}`}>
                        {weeklyAvg !== null ? weeklyAvg.toFixed(1) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="px-5 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/40 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">Avg Response</p>
                    </div>
                    <p className="text-lg font-bold text-muted-foreground/50">—</p>
                    <p className="text-[9px] text-muted-foreground">coming soon</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">PPV Conv. Rate</p>
                    </div>
                    <p className="text-lg font-bold text-muted-foreground/50">—</p>
                    <p className="text-[9px] text-muted-foreground">coming soon</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">Shifts / Week</p>
                    </div>
                    <p className="text-lg font-bold">{getShiftsThisWeek()}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">Total Reviews</p>
                    </div>
                    <p className="text-lg font-bold">{records.length}</p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown (latest) */}
              {latest && (
                <div className="px-5 pb-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Score Breakdown</p>
                  <div className="space-y-1.5">
                    {([
                      { key: "response_time_score" as const, label: "Response Time" },
                      { key: "personalisation_score" as const, label: "Personalisation" },
                      { key: "conversation_flow_score" as const, label: "Conversation Flow" },
                      { key: "ppv_timing_score" as const, label: "PPV Timing" },
                      { key: "energy_tone_score" as const, label: "Energy & Tone" },
                    ]).map(({ key, label }) => {
                      const val = latest[key];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
                          <div className="flex-1 h-2 rounded-full bg-secondary/50 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: val != null ? `${val * 10}%` : "0%",
                                backgroundColor: val != null
                                  ? val >= 8 ? "#34d399" : val >= 6 ? "#fbbf24" : val >= 4 ? "#fb923c" : "#f87171"
                                  : "#666",
                              }}
                            />
                          </div>
                          <span className={`text-xs font-bold w-6 text-right ${val != null ? getScoreColor(val) : "text-muted-foreground"}`}>
                            {val ?? "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strong & Weak Points */}
              <div className="px-5 pb-3 space-y-3">
                {isEditing ? (
                  <div className="space-y-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1 mb-1">
                        <ThumbsUp className="h-3 w-3" /> Strong Points
                      </label>
                      <Textarea
                        value={editStrong}
                        onChange={(e) => setEditStrong(e.target.value)}
                        placeholder="e.g. Great personalisation, fast responses, engaging tone..."
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-red-400 font-medium flex items-center gap-1 mb-1">
                        <ThumbsDown className="h-3 w-3" /> Areas to Improve
                      </label>
                      <Textarea
                        value={editWeak}
                        onChange={(e) => setEditWeak(e.target.value)}
                        placeholder="e.g. PPV timing, follow-up consistency, grammar..."
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingProfile(null)}>
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveProfileData(chatter.name, editStrong, editWeak)}>
                        <Save className="h-3 w-3 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Strong Points */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> Strong Points
                        </p>
                        {canEdit && (
                          <button onClick={() => startEditing(chatter.name)} className="text-muted-foreground hover:text-primary transition-colors">
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      {profile?.strongPoints ? (
                        <p className="text-xs text-muted-foreground bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/10">
                          {profile.strongPoints}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/40 italic">Not set — click edit to add</p>
                      )}
                    </div>

                    {/* Weak Points */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-red-400 font-medium flex items-center gap-1 mb-1">
                        <ThumbsDown className="h-3 w-3" /> Areas to Improve
                      </p>
                      {profile?.weakPoints ? (
                        <p className="text-xs text-muted-foreground bg-red-500/5 rounded-lg p-2 border border-red-500/10">
                          {profile.weakPoints}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/40 italic">Not set — click edit to add</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Consistent Issues */}
              <div className="px-5 pb-5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1 mb-2">
                  <AlertTriangle className="h-3 w-3" /> Consistent Issues
                </p>
                {issues.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {issues.map((issue, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-orange-500/30 text-orange-400 bg-orange-500/5">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                ) : records.length > 0 ? (
                  <p className="text-xs text-emerald-400/70">No recurring issues detected ✓</p>
                ) : (
                  <p className="text-xs text-muted-foreground/40 italic">No QC data yet</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
