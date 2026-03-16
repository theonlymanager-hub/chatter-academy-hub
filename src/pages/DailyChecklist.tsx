import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, AlertTriangle, Sun, Sunset, Moon, Plus, Trash2 } from "lucide-react";

interface CheckItem {
  id: string;
  label: string;
  category: "start_of_day" | "ongoing" | "end_of_day" | "weekly";
  checked: boolean;
  note?: string;
}

const DEFAULT_ITEMS: Omit<CheckItem, "checked" | "note">[] = [
  // Start of day
  { id: "whale_check", label: "Whale check — all whales replied to, last contact verified", category: "start_of_day" },
  { id: "shift_handoff", label: "Post shift handoff message in CHAT TEAM general", category: "start_of_day" },
  { id: "zar_tasks", label: "Message Zar with today's tasks", category: "start_of_day" },
  { id: "elle_tasks", label: "Message Elle with today's tasks", category: "start_of_day" },
  { id: "attendance_check", label: "Verify who's on shift — voice channel + log-ins match", category: "start_of_day" },
  { id: "dashboard_check", label: "Check dashboard — any customs pending? Scores updated?", category: "start_of_day" },

  // Ongoing
  { id: "quality_review", label: "Quality check — review chats from current shift", category: "ongoing" },
  { id: "discord_dms", label: "Discord DMs — reply to any unread", category: "ongoing" },
  { id: "chat_team_monitor", label: "CHAT TEAM channels — check for anything needing action", category: "ongoing" },
  { id: "customs_chase", label: "Chase any pending customs", category: "ongoing" },
  { id: "fan_replies", label: "Check for unanswered fan messages across accounts", category: "ongoing" },
  { id: "knowledge_base", label: "Add any new insights to Knowledge Base", category: "ongoing" },

  // End of day
  { id: "sales_screenshots", label: "Verify all shift sales screenshots posted", category: "end_of_day" },
  { id: "end_shift_logs", label: "End-of-shift logs submitted by all chatters", category: "end_of_day" },
  { id: "revenue_check", label: "Check daily revenue — update dashboard if needed", category: "end_of_day" },
  { id: "tomorrow_prep", label: "Prep tomorrow's priorities — whale list, pending customs, upcoming shifts", category: "end_of_day" },

  // Weekly (Monday)
  { id: "mass_msg_schedule", label: "📅 WEEKLY: Mass messages + PPVs scheduled for the week", category: "weekly" },
  { id: "shift_calendar", label: "📅 WEEKLY: Shift calendar updated and shared", category: "weekly" },
  { id: "performance_review", label: "📅 WEEKLY: Review chatter performance vs targets", category: "weekly" },
  { id: "ab_test_review", label: "📅 WEEKLY: A/B test results — what's converting?", category: "weekly" },
];

const categoryConfig = {
  start_of_day: { label: "🌅 Start of Day", icon: Sun, color: "text-amber-400" },
  ongoing: { label: "🔄 Ongoing", icon: Clock, color: "text-blue-400" },
  end_of_day: { label: "🌙 End of Day", icon: Moon, color: "text-purple-400" },
  weekly: { label: "📅 Weekly (Monday)", icon: AlertTriangle, color: "text-orange-400" },
};

export default function DailyChecklist() {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [customItems, setCustomItems] = useState<CheckItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    // Try to load today's checklist from localStorage (simple, admin-only)
    const saved = localStorage.getItem(`checklist_${today}`);
    const savedCustom = localStorage.getItem(`checklist_custom_${today}`);
    const savedNotes = localStorage.getItem(`checklist_notes_${today}`);

    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      // Initialize with defaults
      const initialized = DEFAULT_ITEMS
        .filter(item => {
          if (item.category === "weekly" && dayOfWeek !== 1) return false; // Only show weekly on Mondays
          return true;
        })
        .map(item => ({ ...item, checked: false, note: "" }));
      setItems(initialized);
    }

    if (savedCustom) {
      setCustomItems(JSON.parse(savedCustom));
    }

    if (savedNotes) {
      setNotes(savedNotes);
      setSavedNotes(savedNotes);
    }
  };

  const toggleItem = (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);
    localStorage.setItem(`checklist_${today}`, JSON.stringify(updatedItems));
  };

  const toggleCustomItem = (id: string) => {
    const updated = customItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setCustomItems(updated);
    localStorage.setItem(`checklist_custom_${today}`, JSON.stringify(updated));
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) return;
    const newItem: CheckItem = {
      id: `custom_${Date.now()}`,
      label: newItemText.trim(),
      category: "ongoing",
      checked: false,
    };
    const updated = [...customItems, newItem];
    setCustomItems(updated);
    localStorage.setItem(`checklist_custom_${today}`, JSON.stringify(updated));
    setNewItemText("");
  };

  const removeCustomItem = (id: string) => {
    const updated = customItems.filter(item => item.id !== id);
    setCustomItems(updated);
    localStorage.setItem(`checklist_custom_${today}`, JSON.stringify(updated));
  };

  const saveNotes = () => {
    localStorage.setItem(`checklist_notes_${today}`, notes);
    setSavedNotes(notes);
  };

  const allItems = [...items, ...customItems];
  const completedCount = allItems.filter(i => i.checked).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const categories = ["start_of_day", "ongoing", "end_of_day", "weekly"] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Day</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {completedCount}/{totalCount}
          </div>
          <p className="text-xs text-muted-foreground">tasks done</p>
        </div>
      </div>

      {/* Progress bar */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-3" />
            <span className="text-sm font-medium min-w-[3rem] text-right">
              {Math.round(progress)}%
            </span>
          </div>
          {progress === 100 && (
            <div className="flex items-center gap-2 mt-3 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">All tasks complete! 🎉</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task categories */}
      {categories.map(cat => {
        const config = categoryConfig[cat];
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length === 0) return null;

        return (
          <Card key={cat} className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center gap-2 ${config.color}`}>
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {catItems.map(item => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                    ${item.checked
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-muted/30 border border-transparent hover:border-border/50"
                    }`}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="h-5 w-5"
                  />
                  <span className={`flex-1 ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                    {item.label}
                  </span>
                  {item.checked && (
                    <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                      Done
                    </Badge>
                  )}
                </label>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Custom items */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-cyan-400">
            ➕ Today's Extras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all
                ${item.checked
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-muted/30 border border-transparent"
                }`}
            >
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => toggleCustomItem(item.id)}
                className="h-5 w-5"
              />
              <span className={`flex-1 ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                {item.label}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCustomItem(item.id)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a task for today..."
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustomItem()}
              className="flex-1 bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button onClick={addCustomItem} size="sm" disabled={!newItemText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick notes */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
            📝 Notes for Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Quick notes, reminders, things to follow up on..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="min-h-[100px] bg-muted/30"
          />
          <Button
            onClick={saveNotes}
            size="sm"
            className="mt-2"
            disabled={notes === savedNotes}
          >
            Save Notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
