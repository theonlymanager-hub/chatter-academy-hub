// updated v3
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Clock, Sun, Moon, Plus, Trash2, Eye } from "lucide-react";

interface CheckItem {
  id: string;
  label: string;
  category: "start_of_day" | "ongoing" | "end_of_day" | "weekly";
  checked: boolean;
}

interface PersonChecklist {
  person: string;
  username: string;
  role: string;
  items: Omit<CheckItem, "checked">[];
}

const CHECKLISTS: PersonChecklist[] = [
  {
    person: "Luke",
    username: "luke",
    role: "admin",
    items: [
      // Morning Quality Review — Marc's shift (6AM-2PM)
      { id: "luke_morning_review", label: "🔍 Morning Quality Review — Marc's shift: screenshot 5-10 chats (mix of good + needs improvement)", category: "start_of_day" },
      { id: "luke_morning_input", label: "📝 Send screenshots with input — where to improve, what was good", category: "start_of_day" },
      { id: "luke_morning_summary", label: "📊 Overall quality summary for Marc's shift", category: "start_of_day" },

      // Afternoon Quality Review — JD + Jemimah shift (2PM-10PM)
      { id: "luke_afternoon_review", label: "🔍 Afternoon Quality Review — JD + Jemimah shift: 5-10 screenshots", category: "ongoing" },
      { id: "luke_afternoon_input", label: "📝 Send screenshots with input — improvements + good examples", category: "ongoing" },
      { id: "luke_afternoon_summary", label: "📊 Overall quality summary for JD + Jemimah shift", category: "ongoing" },

      // Creative Work
      { id: "luke_ppv_ideas", label: "💡 PPV ideas — new concepts, scenarios, content angles", category: "ongoing" },
      { id: "luke_mass_msg_ideas", label: "💡 Mass message ideas — games, engagement, personalised openers", category: "ongoing" },
      { id: "luke_game_nights", label: "💡 Game nights / fun account events — brainstorm + plan", category: "ongoing" },

      // Interviews
      { id: "luke_interviews", label: "📞 Take 4-5 interview calls from Zar's filtered pipeline", category: "ongoing" },

      // General Oversight
      { id: "luke_check_revenue", label: "💰 Check daily revenue + LTV conversions", category: "ongoing" },
      { id: "luke_check_ig", label: "📱 Check IG accounts — how are they performing?", category: "ongoing" },
      { id: "luke_check_dashboard", label: "📋 Check dashboard — scores, customs, attendance", category: "ongoing" },
      { id: "luke_oversee_ops", label: "👁️ General operations overview — anything need attention?", category: "ongoing" },

      // End of Day
      { id: "luke_overnight_delegate", label: "🌙 Delegate overnight review to Zar/Elle — 5-10 screenshots of KC + Jane shift", category: "end_of_day" },

      // Weekly
      { id: "luke_weekly_mm", label: "📅 WEEKLY: Review mass message calendar for the week", category: "weekly" },
      { id: "luke_weekly_perf", label: "📅 WEEKLY: Review chatter performance vs targets + decide who stays/goes", category: "weekly" },
      { id: "luke_weekly_creative", label: "📅 WEEKLY: Content planning — PPVs, game nights, new ideas for all 4 accounts", category: "weekly" },
    ],
  },
  {
    person: "Mark",
    username: "mark",
    role: "supervisor",
    items: [
      { id: "mark_whale_check", label: "Whale check — all whales replied to, last contact verified", category: "start_of_day" },
      { id: "mark_shift_handoff", label: "Post shift handoff message in CHAT TEAM general", category: "start_of_day" },
      { id: "mark_msg_zar", label: "Message Zar with today's tasks", category: "start_of_day" },
      { id: "mark_msg_elle", label: "Message Elle with today's tasks", category: "start_of_day" },
      { id: "mark_attendance", label: "Verify who's on shift — voice channel + log-ins match", category: "start_of_day" },
      { id: "mark_dashboard", label: "Check dashboard — customs pending? Scores updated?", category: "start_of_day" },
      { id: "mark_quality", label: "Quality check — review chats from current shift", category: "ongoing" },
      { id: "mark_discord_dms", label: "Discord DMs — reply to any unread", category: "ongoing" },
      { id: "mark_chat_team", label: "CHAT TEAM channels — check for anything needing action", category: "ongoing" },
      { id: "mark_customs", label: "Chase any pending customs", category: "ongoing" },
      { id: "mark_fan_replies", label: "Check for unanswered fan messages across accounts", category: "ongoing" },
      { id: "mark_kb", label: "Add any new insights to Knowledge Base", category: "ongoing" },
      { id: "mark_process_screenshots", label: "Process Luke's quality screenshots — summarise, upload to feedback board, send to Elle", category: "ongoing" },
      { id: "mark_sales_ss", label: "Verify all shift sales screenshots posted", category: "end_of_day" },
      { id: "mark_shift_logs", label: "End-of-shift logs submitted by all chatters", category: "end_of_day" },
      { id: "mark_revenue", label: "Check daily revenue — update dashboard if needed", category: "end_of_day" },
      { id: "mark_prep", label: "Prep tomorrow's priorities — whale list, pending customs, shifts", category: "end_of_day" },
      { id: "mark_weekly_mm", label: "📅 WEEKLY: Mass messages + PPVs scheduled for the week", category: "weekly" },
      { id: "mark_weekly_shifts", label: "📅 WEEKLY: Shift calendar updated and shared", category: "weekly" },
      { id: "mark_weekly_perf", label: "📅 WEEKLY: Review chatter performance vs targets", category: "weekly" },
      { id: "mark_weekly_ab", label: "📅 WEEKLY: A/B test results — what's converting?", category: "weekly" },
    ],
  },
  {
    person: "Elle",
    username: "elle",
    role: "data_entry",
    items: [
      { id: "elle_attendance", label: "Verify attendance — who logged in? Anyone missing?", category: "start_of_day" },
      { id: "elle_dashboard", label: "Update dashboard data — scores, schedules, team info", category: "start_of_day" },
      { id: "elle_customs", label: "Check customs board — update status, chase if overdue", category: "ongoing" },
      { id: "elle_shift_logs", label: "Chase chatters for missing end-of-shift logs", category: "ongoing" },
      { id: "elle_scores", label: "Update quality scores on dashboard when received", category: "ongoing" },
      { id: "elle_model_comms", label: "Model communications — content requests, schedule updates", category: "ongoing" },
      { id: "elle_airbnb", label: "Airbnb bookings — check upcoming, book if needed", category: "ongoing" },
      { id: "elle_overnight_review", label: "🌙 Overnight quality review — screenshot 5-10 chats from KC + Jane shift for Luke", category: "end_of_day" },
      { id: "elle_shift_cal", label: "Shift calendar up to date for tomorrow", category: "end_of_day" },
      { id: "elle_data_check", label: "All dashboard data current and accurate", category: "end_of_day" },
      { id: "elle_weekly_cal", label: "📅 WEEKLY: Full shift calendar updated for the week", category: "weekly" },
      { id: "elle_weekly_mm", label: "📅 WEEKLY: Mass message schedules posted to Discord", category: "weekly" },
    ],
  },
  {
    person: "Zar",
    username: "zar",
    role: "supervisor",
    items: [
      { id: "zar_hiring_check", label: "Check hiring pipeline — any pending applications?", category: "start_of_day" },
      { id: "zar_interviews", label: "Any interviews scheduled today? Prep ready?", category: "start_of_day" },
      { id: "zar_applications", label: "Process new applications — review, approve/reject", category: "ongoing" },
      { id: "zar_tickets", label: "Check hiring tickets — follow up on stale ones", category: "ongoing" },
      { id: "zar_id_verify", label: "ID verifications — assign Verified role when submitted", category: "ongoing" },
      { id: "zar_filter_calls", label: "Filter candidates — pass top 3-5 to Luke for final interviews", category: "ongoing" },
      { id: "zar_schedule", label: "Schedule mass messages when calendar updated", category: "ongoing" },
      { id: "zar_overnight_review", label: "🌙 Overnight quality review — screenshot 5-10 chats from KC + Jane shift for Luke", category: "end_of_day" },
      { id: "zar_hiring_update", label: "Update hiring status — who's in pipeline, where", category: "end_of_day" },
      { id: "zar_weekly_interviews", label: "📅 WEEKLY: Batch interviews organised for the week", category: "weekly" },
      { id: "zar_weekly_payouts", label: "📅 WEEKLY: Payout list compiled and sent", category: "weekly" },
    ],
  },
];

const categoryConfig = {
  start_of_day: { label: "🌅 Start of Day", color: "text-amber-400" },
  ongoing: { label: "🔄 Ongoing", color: "text-blue-400" },
  end_of_day: { label: "🌙 End of Day", color: "text-purple-400" },
  weekly: { label: "📅 Weekly (Monday)", color: "text-orange-400" },
};

function ChecklistView({ checklist, viewOnly = false }: { checklist: PersonChecklist; viewOnly?: boolean }) {
  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date().getDay();
  const storageKey = `checklist_${checklist.username}_${today}`;
  const notesKey = `checklist_notes_${checklist.username}_${today}`;
  const customKey = `checklist_custom_${checklist.username}_${today}`;

  const [items, setItems] = useState<CheckItem[]>([]);
  const [customItems, setCustomItems] = useState<CheckItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const savedCustom = localStorage.getItem(customKey);
    const savedN = localStorage.getItem(notesKey);

    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      const initialized = checklist.items
        .filter(item => item.category !== "weekly" || dayOfWeek === 1)
        .map(item => ({ ...item, checked: false }));
      setItems(initialized);
    }

    if (savedCustom) setCustomItems(JSON.parse(savedCustom));
    if (savedN) { setNotes(savedN); setSavedNotes(savedN); }
  }, [checklist.username]);

  const toggleItem = (id: string) => {
    if (viewOnly) return;
    const updated = items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const toggleCustom = (id: string) => {
    if (viewOnly) return;
    const updated = customItems.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    setCustomItems(updated);
    localStorage.setItem(customKey, JSON.stringify(updated));
  };

  const addCustom = () => {
    if (!newItemText.trim() || viewOnly) return;
    const item: CheckItem = { id: `custom_${Date.now()}`, label: newItemText.trim(), category: "ongoing", checked: false };
    const updated = [...customItems, item];
    setCustomItems(updated);
    localStorage.setItem(customKey, JSON.stringify(updated));
    setNewItemText("");
  };

  const removeCustom = (id: string) => {
    if (viewOnly) return;
    const updated = customItems.filter(i => i.id !== id);
    setCustomItems(updated);
    localStorage.setItem(customKey, JSON.stringify(updated));
  };

  const saveNotes = () => {
    localStorage.setItem(notesKey, notes);
    setSavedNotes(notes);
  };

  const allItems = [...items, ...customItems];
  const done = allItems.filter(i => i.checked).length;
  const total = allItems.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  const categories = ["start_of_day", "ongoing", "end_of_day", "weekly"] as const;

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{checklist.person}'s Progress</span>
            <span className="text-2xl font-bold">{done}/{total}</span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={pct} className="flex-1 h-3" />
            <span className="text-sm font-medium min-w-[3rem] text-right">{Math.round(pct)}%</span>
          </div>
          {pct === 100 && (
            <div className="flex items-center gap-2 mt-3 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">All tasks complete! 🎉</span>
            </div>
          )}
          {viewOnly && (
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm">View only — {checklist.person} ticks these off</span>
            </div>
          )}
        </CardContent>
      </Card>

      {categories.map(cat => {
        const config = categoryConfig[cat];
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length === 0) return null;

        return (
          <Card key={cat} className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg ${config.color}`}>{config.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {catItems.map(item => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${viewOnly ? '' : 'cursor-pointer'}
                    ${item.checked ? "bg-green-500/10 border border-green-500/20" : "bg-muted/30 border border-transparent hover:border-border/50"}`}
                >
                  <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id)} disabled={viewOnly} className="h-5 w-5" />
                  <span className={`flex-1 ${item.checked ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
                  {item.checked && <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">Done</Badge>}
                </label>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cyan-400">➕ Today's Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customItems.map(item => (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all
              ${item.checked ? "bg-green-500/10 border border-green-500/20" : "bg-muted/30 border border-transparent"}`}>
              <Checkbox checked={item.checked} onCheckedChange={() => toggleCustom(item.id)} disabled={viewOnly} className="h-5 w-5" />
              <span className={`flex-1 ${item.checked ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
              {!viewOnly && (
                <Button variant="ghost" size="sm" onClick={() => removeCustom(item.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          {!viewOnly && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a task for today..."
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
                className="flex-1 bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button onClick={addCustom} size="sm" disabled={!newItemText.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!viewOnly && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-400">📝 Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Quick notes, reminders..." value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px] bg-muted/30" />
            <Button onClick={saveNotes} size="sm" className="mt-2" disabled={notes === savedNotes}>Save Notes</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DailyChecklist() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const username = user?.username || '';

  const myChecklist = CHECKLISTS.find(c => c.username === username);

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <Tabs defaultValue={username} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {CHECKLISTS.map(c => (
              <TabsTrigger key={c.username} value={c.username} className="text-sm">
                {c.person}
              </TabsTrigger>
            ))}
          </TabsList>
          {CHECKLISTS.map(c => (
            <TabsContent key={c.username} value={c.username}>
              <ChecklistView checklist={c} viewOnly={c.username !== username} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  if (!myChecklist) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">No checklist assigned to your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Day</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
      <ChecklistView checklist={myChecklist} />
    </div>
  );
}
// v2
