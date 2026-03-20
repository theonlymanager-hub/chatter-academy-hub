import { useState, useEffect } from "react";
import { teamMembers, chatterColors, QualityScores } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Trash2, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Note {
  id: string;
  text: string;
  timestamp: string;
  qualityReview?: {
    category: keyof QualityScores;
    score: number;
    date: string;
  };
}

interface MemberNotes {
  [memberId: string]: Note[];
}

interface SupabaseQualityScore {
  chatter_name: string;
  overall_score: number;
  response_time_score: number | null;
  personalisation_score: number | null;
  conversation_flow_score: number | null;
  ppv_timing_score: number | null;
  energy_tone_score: number | null;
}

interface QualityScoreRecord {
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

export default function TeamMembers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [expandedQuality, setExpandedQuality] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("chatter-team-sections");
    return saved ? JSON.parse(saved) : {};
  });
  const [memberNotes, setMemberNotes] = useState<MemberNotes>({});
  const [newNoteText, setNewNoteText] = useState<Record<string, string>>({});
  const [newNoteCategory, setNewNoteCategory] = useState<Record<string, keyof QualityScores>>({});
  const [newNoteScore, setNewNoteScore] = useState<Record<string, number>>({});

  // Supabase quality scores
  const [supabaseScores, setSupabaseScores] = useState<Record<string, SupabaseQualityScore>>({});
  // All quality score records grouped by chatter name
  const [allScoresByChatter, setAllScoresByChatter] = useState<Record<string, QualityScoreRecord[]>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const { data, error } = await supabase
          .from('quality_scores')
          .select('id, chatter_name, overall_score, response_time_score, personalisation_score, conversation_flow_score, ppv_timing_score, energy_tone_score, notes, shift_date, reviewed_by, created_at')
          .order('created_at', { ascending: false });
        if (error || !data) return;
        const latest: Record<string, SupabaseQualityScore> = {};
        const allGrouped: Record<string, QualityScoreRecord[]> = {};
        for (const row of data) {
          if (!row.chatter_name || row.overall_score == null) continue;
          if (!latest[row.chatter_name]) {
            latest[row.chatter_name] = {
              chatter_name: row.chatter_name,
              overall_score: row.overall_score,
              response_time_score: row.response_time_score,
              personalisation_score: row.personalisation_score,
              conversation_flow_score: row.conversation_flow_score,
              ppv_timing_score: row.ppv_timing_score,
              energy_tone_score: row.energy_tone_score,
            };
          }
          if (!allGrouped[row.chatter_name]) {
            allGrouped[row.chatter_name] = [];
          }
          allGrouped[row.chatter_name].push({
            id: row.id,
            chatter_name: row.chatter_name,
            overall_score: row.overall_score,
            response_time_score: row.response_time_score,
            personalisation_score: row.personalisation_score,
            conversation_flow_score: row.conversation_flow_score,
            ppv_timing_score: row.ppv_timing_score,
            energy_tone_score: row.energy_tone_score,
            notes: row.notes,
            shift_date: row.shift_date,
            reviewed_by: row.reviewed_by,
            created_at: row.created_at,
          });
        }
        setSupabaseScores(latest);
        setAllScoresByChatter(allGrouped);
      } catch (e) {
        console.error('Failed to fetch quality scores:', e);
      }
    };
    fetchScores();
  }, []);

  const toggleHistory = (memberId: string) => {
    setExpandedHistory(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  // Helper to parse notes into regular notes and supervisor notes
  const parseNotes = (notesStr: string | null): { notes: string; supervisorNotes: string } => {
    if (!notesStr) return { notes: "", supervisorNotes: "" };
    const supervisorMatch = notesStr.match(/\|\s*SUPERVISOR:\s*(.*)/);
    const notesMatch = notesStr.match(/^NOTES:\s*(.*?)(?:\s*\|\s*SUPERVISOR:|$)/);
    if (notesMatch || supervisorMatch) {
      return {
        notes: notesMatch ? notesMatch[1].trim() : notesStr.replace(/\|\s*SUPERVISOR:.*/, "").trim(),
        supervisorNotes: supervisorMatch ? supervisorMatch[1].trim() : "",
      };
    }
    return { notes: notesStr, supervisorNotes: "" };
  };

  const getScoreColor = (score: number): string => {
    if (score >= 7) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 7) return "bg-green-500/10";
    if (score >= 5) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatter-team-notes");
    if (saved) {
      setMemberNotes(JSON.parse(saved));
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (Object.keys(memberNotes).length > 0) {
      localStorage.setItem("chatter-team-notes", JSON.stringify(memberNotes));
    }
  }, [memberNotes]);

  const toggleNotes = (memberId: string) => {
    setExpandedNotes(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const toggleQuality = (memberId: string) => {
    setExpandedQuality(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem("chatter-team-sections", JSON.stringify(updated));
      return updated;
    });
  };

  const addNote = (memberId: string) => {
    const text = newNoteText[memberId]?.trim();
    if (!text) return;

    const note: Note = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    // Add quality review data if provided
    const category = newNoteCategory[memberId];
    const score = newNoteScore[memberId];
    if (category && score) {
      note.qualityReview = {
        category,
        score,
        date: new Date().toISOString().split('T')[0]
      };
    }

    setMemberNotes(prev => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), note]
    }));
    setNewNoteText(prev => ({ ...prev, [memberId]: "" }));
    setNewNoteCategory(prev => ({ ...prev, [memberId]: undefined as any }));
    setNewNoteScore(prev => ({ ...prev, [memberId]: undefined as any }));
  };

  const deleteNote = (memberId: string, noteId: string) => {
    setMemberNotes(prev => ({
      ...prev,
      [memberId]: (prev[memberId] || []).filter(n => n.id !== noteId)
    }));
  };

  // Group team members by category
  const groupedMembers = {
    supervisors: teamMembers.filter(m => m.category === "supervisor"),
    dashboardManagers: teamMembers.filter(m => m.category === "dashboard_manager"),
    chatters: teamMembers.filter(m => m.category === "chatter"),
  };

  const jobDescriptions: Record<string, string[]> = {

    "Zar": [
      "Shift management & scheduling",
      "Chatter oversight & accountability",
      "Vault management (content distribution)",
      "Hiring pipeline & onboarding",
      "Shift calendar updates",
    ],
    "Elle": [
      "Dashboard data entry & updates",
      "Customs board management",
      "Client communication & content coordination",
      "Mass message scheduling",
      "Shift calendar maintenance",
    ],
  };

  // Create leaderboard using Supabase quality scores
  const leaderboard = teamMembers
    .filter(m => m.category === "chatter")
    .map(member => {
      const sbScore = supabaseScores[member.name]?.overall_score ?? 0;
      return {
        ...member,
        liveQualityScore: sbScore,
        combinedScore: (sbScore * 0.6) + (member.revenueGenerated / 1000 * 0.4)
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  const qualityCategories: Array<{key: keyof QualityScores, label: string}> = [
    { key: 'personalisation', label: 'Personalisation' },
    { key: 'responseSpeed', label: 'Response Speed' },
    { key: 'ppvStrategy', label: 'PPV Strategy' },
    { key: 'followUp', label: 'Follow-up' },
    { key: 'fanRetention', label: 'Fan Retention' },
    { key: 'grammar', label: 'Grammar' },
    { key: 'aftercare', label: 'Aftercare' }
  ];

  const renderMemberCard = (member: any) => {
    const color = chatterColors[member.name] || "217 91% 60%";
    const notes = memberNotes[member.id] || [];
    const isNotesExpanded = expandedNotes[member.id];
    const isQualityExpanded = expandedQuality[member.id];

    // Determine grid columns based on member type
    const isChatter = member.category === "chatter";
    const statsCount = isChatter ? 6 : 3; // 6 for chatters (3 original + 3 analytics), 3 for others
    const gridCols = statsCount === 6 ? "grid-cols-3" : "grid-cols-3";

    return (
      <div key={member.id} className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
            >
              {member.avatar}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${member.status === "online" ? "bg-success" : member.status === "busy" ? "bg-warning" : "bg-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{member.name}</p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] capitalize"
                style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}
              >
                {member.role}
              </Badge>
              <Badge variant="outline" className="capitalize text-[10px]">
                {member.status}
              </Badge>
              {member.shiftTimes && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  🕐 {member.shiftTimes}
                </Badge>
              )}
            </div>
          </div>
          {member.clockedIn && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success">Clocked in</span>
            </div>
          )}
        </div>

        {/* Prominent Quality Score */}
        <div className="flex items-center justify-center py-3 rounded-xl" style={{ backgroundColor: `hsl(${color} / 0.08)` }}>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Quality Score</p>
            <p className="text-5xl font-extrabold tracking-tight" style={{ color: `hsl(${color})` }}>
              {supabaseScores[member.name] ? supabaseScores[member.name].overall_score.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">/ 10</p>
          </div>
        </div>

        {/* Job Description */}
        {jobDescriptions[member.name] && (
          <ul className="text-xs text-muted-foreground space-y-1 border-l-2 pl-3" style={{ borderColor: `hsl(${color} / 0.5)` }}>
            {jobDescriptions[member.name].map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: `hsl(${color} / 0.6)` }} />
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className={`grid ${gridCols} gap-3`}>
          {isAdmin && (
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground">Revenue (week)</p>
              <p className="text-lg font-bold">${member.revenueGenerated.toLocaleString()}</p>
            </div>
          )}
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Tasks Done</p>
            <p className="text-lg font-bold">{member.tasksCompleted}<span className="text-xs text-muted-foreground">/{member.weeklyTasks}</span></p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Training</p>
            <p className="text-lg font-bold">{member.trainingProgress}%</p>
          </div>
          
          {/* Chatter Analytics - Only for chatters */}
          {isChatter && member.analytics && isAdmin && (
            <>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground">Shifts This Week</p>
                <p className="text-lg font-bold">{member.analytics.shiftsThisWeek}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground">Avg/Shift</p>
                <p className="text-lg font-bold">${member.analytics.avgRevenuePerShift}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground">Monthly Total</p>
                <p className="text-lg font-bold">${member.analytics.monthlyTotalRevenue.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>


        {/* Quality Score Categories — only for chatters */}
        {isChatter && (
          <div className="border-t border-border/30 pt-3">
            <button
              onClick={() => toggleQuality(member.id)}
              className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                📊 Quality Breakdown
              </span>
              {isQualityExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {isQualityExpanded && (
              <div className="mt-3 space-y-2">
                {supabaseScores[member.name] ? (
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'response_time_score', label: 'Response Speed' },
                      { key: 'personalisation_score', label: 'Personalisation' },
                      { key: 'conversation_flow_score', label: 'Conversation Flow' },
                      { key: 'ppv_timing_score', label: 'PPV Timing' },
                      { key: 'energy_tone_score', label: 'Energy & Tone' },
                    ] as const).map(({ key, label }) => (
                      <div key={key} className="bg-secondary/30 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-bold">{supabaseScores[member.name][key] ?? "—"}<span className="text-xs text-muted-foreground">/10</span></p>
                      </div>
                    ))}
                    <div className="bg-primary/10 rounded-lg p-2 col-span-2">
                      <p className="text-[10px] text-muted-foreground">Overall Average</p>
                      <p className="text-sm font-bold text-primary">{supabaseScores[member.name].overall_score.toFixed(1)}<span className="text-xs text-muted-foreground">/10</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No quality scores yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quality Score History — only for chatters */}
        {isChatter && (
          <div className="border-t border-border/30 pt-3">
            <button
              onClick={() => toggleHistory(member.id)}
              className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                📈 Quality Score History
                {allScoresByChatter[member.name]?.length > 0 && (
                  <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {allScoresByChatter[member.name].length}
                  </span>
                )}
              </span>
              {expandedHistory[member.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expandedHistory[member.id] && (
              <div className="mt-3 space-y-3">
                {allScoresByChatter[member.name]?.length > 0 ? (
                  <>
                    {/* Average & Trend Summary */}
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Average Score</p>
                        <p className="text-xl font-bold">
                          {(allScoresByChatter[member.name].reduce((sum, s) => sum + s.overall_score, 0) / allScoresByChatter[member.name].length).toFixed(1)}
                          <span className="text-xs text-muted-foreground font-normal">/10</span>
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Reviews</p>
                        <p className="text-xl font-bold">{allScoresByChatter[member.name].length}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trend</p>
                        <div className="flex items-center gap-1">
                          {allScoresByChatter[member.name].length >= 2 ? (
                            (() => {
                              const latest = allScoresByChatter[member.name][0].overall_score;
                              const previous = allScoresByChatter[member.name][1].overall_score;
                              const diff = latest - previous;
                              if (diff > 0) return <><TrendingUp className="h-5 w-5 text-green-500" /><span className="text-sm font-bold text-green-500">+{diff.toFixed(1)}</span></>;
                              if (diff < 0) return <><TrendingDown className="h-5 w-5 text-red-500" /><span className="text-sm font-bold text-red-500">{diff.toFixed(1)}</span></>;
                              return <><Minus className="h-5 w-5 text-muted-foreground" /><span className="text-sm font-bold text-muted-foreground">0.0</span></>;
                            })()
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score History List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {allScoresByChatter[member.name].map((record) => {
                        const { notes: regularNotes, supervisorNotes } = parseNotes(record.notes);
                        return (
                          <div key={record.id} className={`rounded-lg p-3 ${getScoreBgColor(record.overall_score)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${getScoreColor(record.overall_score)}`}>
                                  {record.overall_score.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">/10</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{record.shift_date || new Date(record.created_at).toLocaleDateString("en-GB")}</p>
                                <p className="text-[10px] text-muted-foreground">by {record.reviewed_by || "Unknown"}</p>
                              </div>
                            </div>
                            {regularNotes && (
                              <p className="text-xs text-muted-foreground mt-2 italic">📝 {regularNotes}</p>
                            )}
                            {supervisorNotes && (
                              <p className="text-xs mt-1 text-primary/80 italic">👤 Supervisor: {supervisorNotes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No quality checks recorded yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        <div className="border-t border-border/30 pt-3">
          <button
            onClick={() => toggleNotes(member.id)}
            className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              📝 Supervisor Notes
              {notes.length > 0 && (
                <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {notes.length}
                </span>
              )}
            </span>
            {isNotesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isNotesExpanded && (
            <div className="mt-3 space-y-2">
              {/* Add Note Form */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note..."
                    value={newNoteText[member.id] || ""}
                    onChange={(e) => setNewNoteText(prev => ({ ...prev, [member.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addNote(member.id)}
                    className="h-8 text-sm flex-1"
                  />
                  <Button size="sm" onClick={() => addNote(member.id)} className="h-8 px-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quality Review Options — only for chatters */}
                {isChatter && (
                  <div className="flex gap-2">
                    <Select value={newNoteCategory[member.id] || ""} onValueChange={(value: keyof QualityScores) => setNewNoteCategory(prev => ({ ...prev, [member.id]: value }))}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Quality category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityCategories.map(({ key, label }) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="Score"
                      value={newNoteScore[member.id] || ""}
                      onChange={(e) => setNewNoteScore(prev => ({ ...prev, [member.id]: parseInt(e.target.value) || undefined as any }))}
                      className="h-8 text-sm w-20"
                    />
                  </div>
                )}
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">No notes yet</p>
                ) : (
                  notes.slice().reverse().map(note => (
                    <div key={note.id} className="bg-secondary/30 rounded-lg p-2 group relative">
                      <button
                        onClick={() => deleteNote(member.id, note.id)}
                        className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                      <p className="text-sm pr-6">{note.text}</p>
                      {note.qualityReview && (
                        <div className="text-[10px] text-primary bg-primary/10 rounded px-2 py-1 mt-1 inline-block">
                          {qualityCategories.find(c => c.key === note.qualityReview?.category)?.label}: {note.qualityReview.score}/10
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">{note.timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
          <span>Weekly tasks: {member.tasksCompleted}/{member.weeklyTasks}</span>
          <span className={member.tasksCompleted === member.weeklyTasks ? "text-success" : ""}>
            {member.tasksCompleted === member.weeklyTasks ? "All done ✓" : `${member.weeklyTasks - member.tasksCompleted} remaining`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your chatting team</p>
      </div>

      {/* Supervisors Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSection("supervisors")}
            className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
          >
            {collapsedSections["supervisors"] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            👥 Supervisors ({groupedMembers.supervisors.length})
          </button>
        </div>
        
        {!collapsedSections["supervisors"] && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {groupedMembers.supervisors.map(renderMemberCard)}
          </div>
        )}
      </div>

      {/* Dashboard Manager Section */}
      {groupedMembers.dashboardManagers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSection("dashboardManagers")}
              className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
            >
              {collapsedSections["dashboardManagers"] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              📊 Dashboard Manager ({groupedMembers.dashboardManagers.length})
            </button>
          </div>
          
          {!collapsedSections["dashboardManagers"] && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {groupedMembers.dashboardManagers.map(renderMemberCard)}
            </div>
          )}
        </div>
      )}

      {/* Chatters Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSection("chatters")}
            className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
          >
            {collapsedSections["chatters"] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            💬 Chatters ({groupedMembers.chatters.length})
          </button>
        </div>
        
        {!collapsedSections["chatters"] && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {groupedMembers.chatters.map(renderMemberCard)}
          </div>
        )}
      </div>

      {/* Chat Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Chat Leaderboard</h2>
        </div>
        
        <div className="glass-card p-5">
          <div className="space-y-3">
            {leaderboard.map((member, index) => {
              const color = chatterColors[member.name] || "217 91% 60%";
              const medalEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
              
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <div className="text-lg font-bold w-8 text-center">
                    {medalEmoji}
                  </div>
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                  >
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Quality: {member.liveQualityScore ? `${member.liveQualityScore.toFixed(1)}/10` : "—"}</span>
                      {isAdmin && <span>Revenue: ${member.revenueGenerated.toLocaleString()}</span>}
                      <span>Combined Score: {member.combinedScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
