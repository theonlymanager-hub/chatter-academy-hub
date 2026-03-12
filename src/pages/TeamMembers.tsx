import { useState, useEffect } from "react";
import { teamMembers, chatterColors, QualityScores } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Trash2, Trophy } from "lucide-react";

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

export default function TeamMembers() {
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
    chatters: teamMembers.filter(m => m.category === "chatter"),
    supervisors: teamMembers.filter(m => m.category === "supervisor"),
    management: teamMembers.filter(m => m.category === "management"),
    clientCommunication: teamMembers.filter(m => m.category === "client-communication")
  };

  // Create leaderboard
  const leaderboard = teamMembers
    .filter(m => m.category === "chatter")
    .map(member => ({
      ...member,
      combinedScore: (member.qualityScore * 0.6) + (member.revenueGenerated / 1000 * 0.4)
    }))
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

        <div className={`grid ${gridCols} gap-3`}>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Revenue (week)</p>
            <p className="text-lg font-bold">${member.revenueGenerated.toLocaleString()}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Quality Score</p>
            <p className="text-lg font-bold">{member.qualityScore}<span className="text-xs text-muted-foreground">/10</span></p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Tasks Done</p>
            <p className="text-lg font-bold">{member.tasksCompleted}<span className="text-xs text-muted-foreground">/{member.weeklyTasks}</span></p>
          </div>
          
          {/* Chatter Analytics - Only for chatters */}
          {isChatter && member.analytics && (
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Training Progress</span>
            <span className="text-xs font-medium">{member.trainingProgress}%</span>
          </div>
          <Progress value={member.trainingProgress} className="h-2" />
        </div>

        {/* Quality Score Categories */}
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
              <div className="grid grid-cols-2 gap-2">
                {qualityCategories.map(({ key, label }) => (
                  <div key={key} className="bg-secondary/30 rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold">{member.qualityScores[key]}<span className="text-xs text-muted-foreground">/10</span></p>
                  </div>
                ))}
                <div className="bg-primary/10 rounded-lg p-2 col-span-2">
                  <p className="text-[10px] text-muted-foreground">Overall Average</p>
                  <p className="text-sm font-bold text-primary">{member.qualityScores.overall}<span className="text-xs text-muted-foreground">/10</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

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
                
                {/* Quality Review Options */}
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

      {/* Management Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSection("management")}
            className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
          >
            {collapsedSections["management"] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            👑 Management ({groupedMembers.management.length})
          </button>
        </div>
        
        {!collapsedSections["management"] && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {groupedMembers.management.map(renderMemberCard)}
          </div>
        )}
      </div>

      {/* Client Communication Section */}
      {groupedMembers.clientCommunication.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSection("client-communication")}
              className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors"
            >
              {collapsedSections["client-communication"] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              📞 Client Communication ({groupedMembers.clientCommunication.length})
            </button>
          </div>
          
          {!collapsedSections["client-communication"] && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {groupedMembers.clientCommunication.map(renderMemberCard)}
            </div>
          )}
        </div>
      )}

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
                      <span>Quality: {member.qualityScore}/10</span>
                      <span>Revenue: ${member.revenueGenerated.toLocaleString()}</span>
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
