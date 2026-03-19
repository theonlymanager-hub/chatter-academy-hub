import { useState, useEffect } from "react";
import { teamMembers, chatterColors } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Info, ClipboardCheck, TrendingUp, Calendar, User, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { label: "Conversation Flow & Energy", dbKey: "response_time_score" },
  { label: "Personalisation & Fan Profiling", dbKey: "personalisation_score" },
  { label: "Sales & PPV Execution", dbKey: "conversation_flow_score" },
  { label: "Whale Development & Retention", dbKey: "ppv_timing_score" },
  { label: "Standards & Rules Compliance", dbKey: "energy_tone_score" },
];

const categoryDescriptions: Record<string, string> = {
  "Conversation Flow & Energy": "Matching energy, keeping conversations alive, natural transitions, no dead-end messages. Are they reading the fan and adapting? (KB: Conversation Techniques & Navigation)",
  "Personalisation & Fan Profiling": "Adapting approach to fan type (first 5-10 messages), using their name/details, location strategy, remembering past conversations. (KB: Fan Type Identification, Location Connection)",
  "Sales & PPV Execution": "PPV timing after rapport, pricing psychology, upselling naturally, not spamming. Building toward a sale, not just chatting. (KB: Sales & Upselling, PPV Strategy)",
  "Whale Development & Retention": "Building high-value relationships, making fans feel special, aftercare with hooks, standing out from other models. Long game. (KB: Whale Creation, Fan Psychology, Standing Out)",
  "Standards & Rules Compliance": "No copy-paste openers, no guilt tripping, no lazy replies (<15 chars), response time under 10 mins, following all Knowledge Base rules. (KB: Common Mistakes, Quality Standards)",
};

export default function QualityChecks() {
  const { user, hasPermission } = useAuth();
  const [selectedMember, setSelectedMember] = useState("");
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c.label, 5]))
  );
  const [notes, setNotes] = useState("");
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  const avgScore = (Object.values(scores).reduce((a, b) => a + b, 0) / categories.length).toFixed(1);
  const selectedChatter = teamMembers.find(m => m.id === selectedMember);
  const selectedColor = selectedChatter ? chatterColors[selectedChatter.name] : null;

  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [latestScoreByChatter, setLatestScoreByChatter] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchRecentScores = async () => {
      const { data, error } = await supabase
        .from("quality_scores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) {
        setRecentScores(data);
        // Build latest score per chatter
        const latest: Record<string, number> = {};
        for (const row of data) {
          if (row.chatter_name && row.overall_score != null && !latest[row.chatter_name]) {
            latest[row.chatter_name] = row.overall_score;
          }
        }
        setLatestScoreByChatter(latest);
      }
      setScoresLoading(false);
    };
    fetchRecentScores();
  }, [submitting]);

  const canViewAllScores = hasPermission('view_all_scores');
  const canOnlyViewOwnScores = hasPermission('view_own_scores_only');

  const currentUserTeamMember = user ? teamMembers.find(member =>
    member.name.toLowerCase() === user.displayName.toLowerCase()
  ) : null;

  const handleSubmit = async () => {
    if (!selectedMember || !selectedChatter) {
      toast.error("Please select a team member");
      return;
    }
    setSubmitting(true);

    const row: Record<string, any> = {
      chatter_name: selectedChatter.name,
      shift_date: shiftDate,
      overall_score: parseFloat(avgScore),
      notes: notes || null,
      reviewed_by: user?.displayName || "Unknown",
    };
    for (const cat of categories) {
      row[cat.dbKey] = scores[cat.label];
    }

    const { error } = await supabase.from("quality_scores").insert(row as any);
    setSubmitting(false);

    if (error) {
      console.error("Error submitting quality check:", error);
      toast.error("Failed to submit quality check");
      return;
    }

    toast.success(`Quality check submitted for ${selectedChatter.name}`);
    setSelectedMember("");
    setScores(Object.fromEntries(categories.map((c) => [c.label, 5])));
    setNotes("");
  };

  // If user is a chatter, show their own scores view
  if (canOnlyViewOwnScores && currentUserTeamMember) {
    const userColor = chatterColors[currentUserTeamMember.name];

    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Quality Scores</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your performance and feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestScoreByChatter[currentUserTeamMember.name] != null ? `${latestScoreByChatter[currentUserTeamMember.name].toFixed(1)}/10` : "—"}</div>
              <p className="text-xs text-muted-foreground">Overall performance rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checks This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">Per shift reviews completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+0.3</div>
              <p className="text-xs text-muted-foreground">Improvement this week</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center gap-3 p-4 rounded-lg border"
              style={{ borderColor: `hsl(${userColor} / 0.3)`, backgroundColor: `hsl(${userColor} / 0.05)` }}
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: `hsl(${userColor} / 0.2)`, color: `hsl(${userColor})` }}
              >
                {currentUserTeamMember.avatar}
              </div>
              <div>
                <p className="font-semibold">{currentUserTeamMember.name}</p>
                <p className="text-sm text-muted-foreground">{currentUserTeamMember.role} • Quality Score: {latestScoreByChatter[currentUserTeamMember.name] != null ? `${latestScoreByChatter[currentUserTeamMember.name].toFixed(1)}/10` : "No data"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For admin, supervisor, data_entry - show the scoring interface
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quality Checks</h1>
        <p className="text-muted-foreground text-sm mt-1">Score chatter performance — saved to database</p>
      </div>

      {/* Quality Check Methodology */}
      <div className="glass-card p-5 space-y-3 border-l-4 border-primary">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wide">How Quality Checks Work</h2>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Each chatter is reviewed across <span className="text-primary font-bold">5 different chats per shift</span>, spread throughout the shift.</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Reviews are <strong>spread across the shift</strong> — e.g. at 3PM, 5PM, 7PM — not all at once</li>
            <li>Each review is <strong>one chat conversation</strong>, scored against the Knowledge Base criteria</li>
            <li>This gives a <strong>broad, representative picture</strong> of how they're chatting across the whole shift</li>
            <li>At the end, the <strong>overall score + key issues</strong> are submitted here</li>
          </ul>
          <p className="text-xs mt-2 italic">Supervisor reads the chats, scores each category below based on the Knowledge Base standards, and adds specific coaching notes.</p>
        </div>
      </div>

      {/* Scoring Categories Reference */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Scoring Categories</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.map((cat) => (
            <div key={cat.label} className="p-3 rounded-lg bg-secondary/30">
              <p className="text-sm font-medium">{cat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{categoryDescriptions[cat.label]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Member</label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((m) => {
                  const color = chatterColors[m.name];
                  return (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
                        <span>{m.name}</span>
                        <span className="text-muted-foreground">— {m.role}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shift Date</label>
            <input
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {selectedChatter && (
          <div
            className="flex items-center gap-3 p-3 rounded-lg border"
            style={{ borderColor: `hsl(${selectedColor} / 0.3)`, backgroundColor: `hsl(${selectedColor} / 0.05)` }}
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: `hsl(${selectedColor} / 0.2)`, color: `hsl(${selectedColor})` }}
            >
              {selectedChatter.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold">{selectedChatter.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedChatter.role} • Current score: {latestScoreByChatter[selectedChatter.name] != null ? `${latestScoreByChatter[selectedChatter.name].toFixed(1)}/10` : "No data"}</p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {categories.map((category) => (
            <div key={category.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">{category.label}</label>
                <span className={`text-sm font-bold ${scores[category.label] >= 8 ? "text-success" : scores[category.label] >= 5 ? "text-warning" : "text-destructive"}`}>
                  {scores[category.label]}/10
                </span>
              </div>
              <Slider
                value={[scores[category.label]]}
                onValueChange={([v]) => setScores((s) => ({ ...s, [category.label]: v }))}
                min={1}
                max={10}
                step={1}
                className="py-1"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 py-3">
          <span className="text-sm text-muted-foreground">Average Score:</span>
          <span className={`text-3xl font-bold ${Number(avgScore) >= 8 ? "text-success" : Number(avgScore) >= 5 ? "text-warning" : "text-destructive"}`}>
            {avgScore}
          </span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes & Feedback</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add coaching notes, areas for improvement, positive highlights..." className="bg-secondary/50 min-h-[100px]" />
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Quality Check"}
        </Button>
      </div>

      {/* Recent Quality Scores with Category Breakdown */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Recent Quality Scores</h2>
        </div>
        {scoresLoading ? (
          <p className="text-sm text-muted-foreground">Loading scores...</p>
        ) : recentScores.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scores yet. Submit a quality check above.</p>
        ) : (
          <div className="space-y-4">
            {recentScores.map((score) => {
              const color = chatterColors[score.chatter_name] || "217 91% 60%";
              const scoreCategories = [
                { label: "Conversation Flow & Energy", value: score.response_time_score },
                { label: "Personalisation & Fan Profiling", value: score.personalisation_score },
                { label: "Sales & PPV Execution", value: score.conversation_flow_score },
                { label: "Whale Development & Retention", value: score.ppv_timing_score },
                { label: "Standards & Rules Compliance", value: score.energy_tone_score },
              ];
              return (
                <div key={score.id} className="p-4 rounded-lg border" style={{ borderColor: `hsl(${color} / 0.3)`, backgroundColor: `hsl(${color} / 0.03)` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                        {(score.chatter_name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{score.chatter_name}</p>
                        <p className="text-[10px] text-muted-foreground">{score.shift_date} · by {score.reviewed_by}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${(score.overall_score || 0) >= 8 ? "text-success" : (score.overall_score || 0) >= 5 ? "text-warning" : "text-destructive"}`}>
                        {(score.overall_score || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">/10</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {scoreCategories.map((cat) => {
                      const val = cat.value || 0;
                      const barColor = val >= 8 ? "bg-success" : val >= 5 ? "bg-warning" : "bg-destructive";
                      return (
                        <div key={cat.label} className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">{cat.label}</span>
                            <span className={`text-[11px] font-bold ${val >= 8 ? "text-success" : val >= 5 ? "text-warning" : "text-destructive"}`}>{val}/10</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${val * 10}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {score.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic border-t border-border/30 pt-2">"{score.notes}"</p>
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
