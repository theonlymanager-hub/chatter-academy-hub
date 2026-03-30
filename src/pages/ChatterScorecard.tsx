import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { chatterColors } from "@/lib/mock-data";
import { getTasks, type ChatterTask } from "@/lib/chatterTasksStore";
import {
  User, Clock, Star, TrendingUp, TrendingDown, Minus,
  MessageSquare, DollarSign, Calendar, AlertTriangle,
  ThumbsUp, ThumbsDown, Save, Edit2, X, ChevronDown, ChevronUp,
  CheckCircle2, ListTodo, Shield,
} from "lucide-react";
import { isDemoUser } from "@/utils/demo";

// ── Types ──────────────────────────────────────────────────────────────
interface CategoryScore {
  score: number;
  note: string;
}

interface ScorecardEntry {
  id: string;
  chatter_name: string;
  week_of: string;
  overall_score: number;
  categories: {
    response_time: CategoryScore;
    personalisation: CategoryScore;
    conversation_flow: CategoryScore;
    ppv_timing: CategoryScore;
    energy_tone: CategoryScore;
    aftercare: CategoryScore;
  };
  feedback_bullets: string[];
  reviewed_by: string;
  trend?: "up" | "down" | "flat";
}

// ── Chatter definitions ────────────────────────────────────────────────
const CHATTERS = [
  { name: "Marc", role: "Chatter", shift: "6AM – 2PM", shiftLabel: "Morning", shiftColor: "bg-muted/50 text-foreground border-border/30" },
  { name: "Jaydee", role: "Chatter", shift: "2PM – 10PM", shiftLabel: "Afternoon", shiftColor: "bg-muted/50 text-foreground border-border/30" },
  { name: "Jemimah", role: "Chatter", shift: "2PM – 10PM", shiftLabel: "Afternoon", shiftColor: "bg-muted/50 text-foreground border-border/30" },
  { name: "KC", role: "Chatter", shift: "10PM – 6AM", shiftLabel: "Night", shiftColor: "bg-muted/50 text-foreground border-border/30" },
  { name: "Jane", role: "Chatter", shift: "10PM – 6AM", shiftLabel: "Night", shiftColor: "bg-muted/50 text-foreground border-border/30" },
] as const;

const SCORECARD_KEY = "chatter_scorecards";
const PROFILE_KEY = "chatter-profiles-data";

// ── Category labels ────────────────────────────────────────────────────
const CATEGORY_META: { key: keyof ScorecardEntry["categories"]; label: string; icon: string }[] = [
  { key: "response_time", label: "Response Time", icon: "⚡" },
  { key: "personalisation", label: "Personalisation", icon: "🎯" },
  { key: "conversation_flow", label: "Conversation Flow", icon: "💬" },
  { key: "ppv_timing", label: "PPV Timing", icon: "💰" },
  { key: "energy_tone", label: "Energy & Tone", icon: "🔥" },
  { key: "aftercare", label: "Aftercare", icon: "💜" },
];

// ── Seed data ──────────────────────────────────────────────────────────
function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SEED_DATA: ScorecardEntry[] = [
  {
    id: uuid(),
    chatter_name: "Marc",
    week_of: "2026-03-24",
    overall_score: 4,
    categories: {
      response_time: { score: 5, note: "Averaging 3-5 min replies, needs to be under 2 min" },
      personalisation: { score: 3, note: "Still using generic openers, not referencing fan profiles" },
      conversation_flow: { score: 4, note: "One-line responses, conversations dying quickly" },
      ppv_timing: { score: 5, note: "Sending too early, needs 5+ fan replies first" },
      energy_tone: { score: 3, note: "Robotic, no warmth or personality coming through" },
      aftercare: { score: 4, note: "Sometimes sends aftercare, inconsistent follow-up" },
    },
    feedback_bullets: [
      "Stop one-line dead responses — expand every reply",
      "Use fan's name more, reference their profile",
      "Follow up within 5 mins when fan goes quiet",
    ],
    reviewed_by: "Mark",
    trend: "down",
  },
  {
    id: uuid(),
    chatter_name: "Jaydee",
    week_of: "2026-03-17",
    overall_score: 4,
    categories: {
      response_time: { score: 5, note: "Generally quick but inconsistent during peak" },
      personalisation: { score: 4, note: "Some fan name usage, needs more profile references" },
      conversation_flow: { score: 4, note: "Decent flow but drops off after PPV send" },
      ppv_timing: { score: 3, note: "Sends PPV too early in conversations" },
      energy_tone: { score: 4, note: "Reasonable energy, could be warmer" },
      aftercare: { score: 3, note: "Inconsistent — sometimes good, sometimes nothing" },
    },
    feedback_bullets: ["Wait for 5+ fan replies before PPV", "Keep conversation going after PPV purchase", "Currently on approved leave — scores from last active week"],
    reviewed_by: "Mark",
    trend: "flat",
  },
  {
    id: uuid(),
    chatter_name: "Jemimah",
    week_of: "2026-03-24",
    overall_score: 4,
    categories: {
      response_time: { score: 5, note: "Decent speed but drops off during busy periods" },
      personalisation: { score: 5, note: "Shows some effort but inconsistent" },
      conversation_flow: { score: 4, note: "Decent engagement when present, but low volume overall" },
      ppv_timing: { score: 3, note: "Not following PPV scripts, random timing" },
      energy_tone: { score: 4, note: "Warm enough but needs more enthusiasm" },
      aftercare: { score: 3, note: "Rarely sends aftercare messages" },
    },
    feedback_bullets: [
      "Follow the PPV timing scripts — don't freelance",
      "Increase message volume per shift",
      "Always send aftercare within 10 min of purchase",
    ],
    reviewed_by: "Mark",
    trend: "flat",
  },
  {
    id: uuid(),
    chatter_name: "KC",
    week_of: "2026-03-24",
    overall_score: 3,
    categories: {
      response_time: { score: 4, note: "Inconsistent — sometimes fast, sometimes 10+ min gaps" },
      personalisation: { score: 2, note: "Generic questions, not using fan profile data at all" },
      conversation_flow: { score: 3, note: "Conversations feel interrogative, not natural" },
      ppv_timing: { score: 3, note: "PPV drops feel random, no build-up" },
      energy_tone: { score: 3, note: "Flat energy, reads like a script" },
      aftercare: { score: 3, note: "Minimal effort, copy-paste feel" },
    },
    feedback_bullets: [
      "Read fan profiles before starting conversations",
      "Stop asking generic questions — reference specifics",
      "Build rapport before any PPV send",
    ],
    reviewed_by: "Mark",
    trend: "down",
  },
  {
    id: uuid(),
    chatter_name: "Jane",
    week_of: "2026-03-24",
    overall_score: 3,
    categories: {
      response_time: { score: 4, note: "Acceptable speed but no urgency" },
      personalisation: { score: 3, note: "Some effort but surface-level only" },
      conversation_flow: { score: 3, note: "Short replies, not driving conversations forward" },
      ppv_timing: { score: 3, note: "Sends PPV without warming up the fan" },
      energy_tone: { score: 3, note: "Monotone, needs more personality" },
      aftercare: { score: 2, note: "Lazy aftercare, no re-engagement hooks at all" },
    },
    feedback_bullets: [
      "Aftercare is mandatory after every purchase — no exceptions",
      "Add re-engagement hooks (questions, teasers)",
      "Show more personality — fans want connection",
    ],
    reviewed_by: "Mark",
    trend: "down",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-yellow-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function getScoreBgClass(score: number): string {
  if (score >= 8) return "bg-emerald-500/15 border-emerald-500/40";
  if (score >= 6) return "bg-yellow-500/15 border-yellow-500/40";
  if (score >= 4) return "bg-orange-500/15 border-orange-500/40";
  return "bg-red-500/15 border-red-500/40";
}

function getScoreBarColor(score: number): string {
  if (score >= 8) return "#34d399";
  if (score >= 6) return "#facc15";
  if (score >= 4) return "#fb923c";
  return "#f87171";
}

function getScoreLabel(score: number): string {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Needs Work";
  return "At Risk";
}

function getScoreRingColor(score: number): string {
  if (score >= 8) return "ring-emerald-500/50";
  if (score >= 6) return "ring-yellow-500/50";
  if (score >= 4) return "ring-orange-500/50";
  return "ring-red-500/50";
}

function getStrikeCount(name: string): number {
  try {
    const raw = localStorage.getItem("strikes");
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.strikes) ? parsed.strikes : [];
    return arr.filter((s: any) => s.chatter_name === name && s.status === "active").length;
  } catch { return 0; }
}

function getActiveTaskCount(name: string): number {
  try {
    const tasks = getTasks();
    return tasks.filter((t: ChatterTask) => t.chatter_name === name && t.status === "in_progress").length;
  } catch { return 0; }
}

function loadScorecards(): ScorecardEntry[] {
  try {
    const raw = localStorage.getItem(SCORECARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // Seed
  localStorage.setItem(SCORECARD_KEY, JSON.stringify(SEED_DATA));
  return SEED_DATA;
}

// ── Component ──────────────────────────────────────────────────────────
export default function ChatterScorecard() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.role);
  const [scorecards, setScorecards] = useState<ScorecardEntry[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    setScorecards(loadScorecards());
  }, []);

  const getCardForChatter = (name: string): ScorecardEntry | null => {
    return scorecards.find(s => s.chatter_name === name) || null;
  };

  const toggleExpand = (name: string) => {
    setExpandedCard(prev => prev === name ? null : name);
  };

  const onLeave = (card: ScorecardEntry | null): boolean => {
    if (!card) return false;
    return card.overall_score === 0 && card.feedback_bullets.some(b => b.toLowerCase().includes("leave"));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chatter Scorecards</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Full QC breakdowns with category scores, notes, and actionable feedback — week of {scorecards[0]?.week_of || "—"}
        </p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CHATTERS.map((chatter) => {
          const card = getCardForChatter(chatter.name);
          const score = card?.overall_score ?? null;
          const leave = onLeave(card);
          const color = chatterColors[chatter.name] || "217 91% 60%";
          return (
            <button
              key={chatter.name}
              onClick={() => toggleExpand(chatter.name)}
              className={`rounded-xl p-3 border transition-all hover:scale-[1.02] text-left ${
                leave
                  ? "border-zinc-700/50 bg-zinc-800/30"
                  : score !== null
                  ? getScoreBgClass(score)
                  : "border-border/20 bg-secondary/20"
              } ${expandedCard === chatter.name ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: `hsl(${color} / 0.25)`, color: `hsl(${color})` }}
                >
                  {chatter.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold truncate">{chatter.name}</span>
              </div>
              {leave ? (
                <span className="text-xs text-zinc-500 font-medium">On Leave</span>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-extrabold ${isDemo ? "text-muted-foreground" : score !== null ? getScoreColor(score) : "text-muted-foreground/30"}`}>
                    {isDemo ? "••" : score !== null ? score : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">/10</span>
                  {!isDemo && card?.trend && card.trend !== "flat" && (
                    <span className={`ml-1 ${card.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                      {card.trend === "up" ? <TrendingUp className="h-3 w-3 inline" /> : <TrendingDown className="h-3 w-3 inline" />}
                    </span>
                  )}
                  {!isDemo && card?.trend === "flat" && !leave && (
                    <Minus className="h-3 w-3 inline ml-1 text-zinc-500" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Cards */}
      <div className="space-y-4">
        {CHATTERS.map((chatter) => {
          const card = getCardForChatter(chatter.name);
          const color = chatterColors[chatter.name] || "217 91% 60%";
          const isExpanded = expandedCard === chatter.name;
          const leave = onLeave(card);
          const strikes = getStrikeCount(chatter.name);
          const activeTasks = getActiveTaskCount(chatter.name);

          return (
            <div
              key={chatter.name}
              className="glass-card rounded-xl overflow-hidden border border-border/30"
            >
              {/* Card Header — always visible */}
              <button
                onClick={() => toggleExpand(chatter.name)}
                className="w-full text-left"
              >
                <div
                  className="p-5 flex items-center justify-between"
                  style={{ background: `linear-gradient(135deg, hsl(${color} / 0.12), hsl(${color} / 0.03))` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with score ring */}
                    <div
                      className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ring-3 ${
                        leave ? "ring-zinc-600/50" : card ? getScoreRingColor(card.overall_score) : "ring-zinc-700/30"
                      }`}
                      style={{
                        backgroundColor: `hsl(${color} / 0.25)`,
                        color: `hsl(${color})`,
                        border: `2px solid hsl(${color} / 0.4)`,
                      }}
                    >
                      {chatter.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{chatter.name}</h3>
                        {leave && (
                          <Badge variant="outline" className="text-[10px] border-zinc-600/40 text-zinc-500">
                            ON LEAVE
                          </Badge>
                        )}
                        {!leave && card && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${getScoreColor(card.overall_score)} border-current/30`}
                          >
                            {getScoreLabel(card.overall_score)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] border ${chatter.shiftColor}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {chatter.shift}
                        </Badge>
                        {strikes > 0 && (
                          <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400 bg-red-500/10">
                            <Shield className="h-3 w-3 mr-1" />
                            {strikes} Strike{strikes > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {activeTasks > 0 && (
                          <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-400 bg-blue-500/10">
                            <ListTodo className="h-3 w-3 mr-1" />
                            {activeTasks} Active Task{activeTasks > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Score display */}
                    {!leave && card && (
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className={`text-3xl font-extrabold ${isDemo ? "text-muted-foreground" : getScoreColor(card.overall_score)}`}>
                            {isDemo ? "••" : card.overall_score}
                          </span>
                          <span className="text-sm text-muted-foreground">/10</span>
                        </div>
                        {!isDemo && card.trend && (
                          <span className={`text-xs flex items-center justify-end gap-0.5 ${
                            card.trend === "up" ? "text-emerald-400" : card.trend === "down" ? "text-red-400" : "text-zinc-500"
                          }`}>
                            {card.trend === "up" && <><TrendingUp className="h-3 w-3" /> Improving</>}
                            {card.trend === "down" && <><TrendingDown className="h-3 w-3" /> Declining</>}
                            {card.trend === "flat" && <><Minus className="h-3 w-3" /> Steady</>}
                          </span>
                        )}
                      </div>
                    )}
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </button>

              {/* Expandable Detail */}
              {isExpanded && card && !leave && (
                <div className="p-5 pt-2 space-y-5 border-t border-border/20">
                  {/* Category Breakdown */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5" /> Category Breakdown
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CATEGORY_META.map(({ key, label, icon }) => {
                        const cat = card.categories[key];
                        return (
                          <div
                            key={key}
                            className={`rounded-xl p-4 border ${getScoreBgClass(cat.score)}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{icon}</span>
                                <span className="text-sm font-semibold">{label}</span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-xl font-extrabold ${isDemo ? "text-muted-foreground" : getScoreColor(cat.score)}`}>
                                  {isDemo ? "••" : cat.score}
                                </span>
                                <span className="text-xs text-muted-foreground">/10</span>
                              </div>
                            </div>
                            {/* Score bar */}
                            <div className="h-2 rounded-full bg-secondary/50 overflow-hidden mb-2">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: isDemo ? "50%" : `${cat.score * 10}%`,
                                  backgroundColor: isDemo ? "#666" : getScoreBarColor(cat.score),
                                }}
                              />
                            </div>
                            {/* Note */}
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {isDemo ? "Hidden in demo mode" : cat.note}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback & Action Items */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Key Feedback
                    </p>
                    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                      <ul className="space-y-2">
                        {card.feedback_bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-400 mt-0.5 shrink-0">▸</span>
                            <span className="text-sm text-muted-foreground">{isDemo ? "Hidden" : bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground pt-1 border-t border-border/10">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Week of {card.week_of}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Reviewed by {card.reviewed_by}
                    </span>
                    {strikes > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <Shield className="h-3 w-3" />
                        {strikes} Active Strike{strikes > 1 ? "s" : ""}
                      </span>
                    )}
                    {activeTasks > 0 && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <ListTodo className="h-3 w-3" />
                        {activeTasks} Active Task{activeTasks > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* On Leave expanded */}
              {isExpanded && leave && (
                <div className="p-5 pt-2 border-t border-border/20">
                  <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/20 p-6 text-center">
                    <p className="text-zinc-500 text-sm">No QC data available — chatter is currently on leave</p>
                    <p className="text-zinc-600 text-xs mt-1">Scorecard will update when they return to active shifts</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
