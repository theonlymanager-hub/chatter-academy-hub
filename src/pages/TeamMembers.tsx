import { useState, useEffect } from "react";
import { teamMembers, chatterColors } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

interface MemberNotes {
  [memberId: string]: Note[];
}

export default function TeamMembers() {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [memberNotes, setMemberNotes] = useState<MemberNotes>({});
  const [newNoteText, setNewNoteText] = useState<Record<string, string>>({});

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

    setMemberNotes(prev => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), note]
    }));
    setNewNoteText(prev => ({ ...prev, [memberId]: "" }));
  };

  const deleteNote = (memberId: string, noteId: string) => {
    setMemberNotes(prev => ({
      ...prev,
      [memberId]: (prev[memberId] || []).filter(n => n.id !== noteId)
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your chatting team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {teamMembers.map((member) => {
          const color = chatterColors[member.name] || "217 91% 60%";
          const notes = memberNotes[member.id] || [];
          const isExpanded = expandedNotes[member.id];

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
                  </div>
                </div>
                {member.clockedIn && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-success">Clocked in</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Training Progress</span>
                  <span className="text-xs font-medium">{member.trainingProgress}%</span>
                </div>
                <Progress value={member.trainingProgress} className="h-2" />
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
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-2">
                    {/* Add Note Form */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a note..."
                        value={newNoteText[member.id] || ""}
                        onChange={(e) => setNewNoteText(prev => ({ ...prev, [member.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addNote(member.id)}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" onClick={() => addNote(member.id)} className="h-8 px-2">
                        <Plus className="h-4 w-4" />
                      </Button>
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
        })}
      </div>
    </div>
  );
}
