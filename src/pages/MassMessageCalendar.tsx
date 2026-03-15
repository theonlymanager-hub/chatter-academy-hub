import { useState, useMemo } from "react";
import { massMessages, modelColors } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, DollarSign, MessageSquare, Plus, Trash2, CalendarDays, ListTodo, Lightbulb, Send, Copy, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const modelNames = ["Izzy", "Willow", "Lucinda Bleu", "Ashley Morris"];
const messageTypes = ["Mass Message", "PPV", "Prompt"] as const;
const fanSegments = ["All Fans", "New Subs (< 7 days)", "High Spenders ($100+)", "Inactive (no msg 7+ days)", "Whales Only", "Engaged (5+ replies)"] as const;
const ppvPricePoints = ["$3", "$5", "$7", "$10", "$15", "$20", "$25", "$35", "$50", "Custom"] as const;

interface ScheduledMessage {
  id: string;
  model: string;
  date: string;
  time: string;
  type: typeof messageTypes[number];
  content: string;
  status: "scheduled" | "sent" | "draft";
  segment?: string;
  price?: string;
  variantB?: string;
  notes?: string;
}

interface PPVIdea {
  id: string;
  model: string;
  title: string;
  description: string;
  price: string;
  segment: string;
  status: "idea" | "ready" | "scheduled" | "sent";
  conversionRate?: string;
  createdAt: string;
}

const SCHEDULE_KEY = "mass-msg-scheduled-v2";
const PPV_KEY = "ppv-ideas-data";

// Quick templates for mass messages
const TEMPLATES: Record<string, string[]> = {
  "Mass Message": [
    "Good morning babe 💕 I woke up thinking about you...",
    "Just got out of the shower... wish you were here 😏",
    "I'm bored and lonely... come keep me company? 💋",
    "I just took the HOTTEST photos... wanna see? 🔥",
    "Game time! Guess what colour my underwear is 🎮 Winner gets a surprise...",
  ],
  "PPV": [
    "I made this just for you... 🔥 [UNLOCK TO SEE]",
    "You've been so good to me... here's your reward 😈",
    "My naughtiest content yet... are you ready? 💦",
    "POV: you walk in on me like this... 👀",
  ],
  "Prompt": [
    "Good morning handsome! What are your plans today? ☀️",
    "If you could take me anywhere in the world, where would we go? ✈️",
    "Tell me something nobody knows about you... 🤫",
    "What's the first thing you'd do if I was there right now? 😏",
  ],
};

export default function MassMessageCalendar() {
  const { user } = useAuth();
  const canEdit = user && ['admin', 'supervisor', 'data_entry'].includes(user.role);

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterModel, setFilterModel] = useState<string>("all");

  const [scheduled, setScheduled] = useState<ScheduledMessage[]>(() => {
    const saved = localStorage.getItem(SCHEDULE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [ppvIdeas, setPPVIdeas] = useState<PPVIdea[]>(() => {
    const saved = localStorage.getItem(PPV_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Schedule form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMsg, setNewMsg] = useState<Omit<ScheduledMessage, "id">>({
    model: "Izzy", date: "", time: "10:00", type: "Mass Message", content: "", status: "scheduled", segment: "All Fans", price: "", variantB: "", notes: "",
  });

  // PPV form
  const [showPPVForm, setShowPPVForm] = useState(false);
  const [newPPV, setNewPPV] = useState({ model: "Izzy", title: "", description: "", price: "$10", segment: "All Fans" });

  const saveScheduled = (msgs: ScheduledMessage[]) => {
    setScheduled(msgs);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(msgs));
  };

  const savePPV = (ideas: PPVIdea[]) => {
    setPPVIdeas(ideas);
    localStorage.setItem(PPV_KEY, JSON.stringify(ideas));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getScheduledForDay = (day: number) => {
    const dateStr = getDateStr(day);
    let msgs = scheduled.filter((s) => s.date === dateStr);
    if (filterModel !== "all") msgs = msgs.filter(s => s.model === filterModel);
    return msgs;
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const addMessage = () => {
    if (!newMsg.content.trim() || !newMsg.date) return;
    const msg: ScheduledMessage = { ...newMsg, id: Date.now().toString() };
    saveScheduled([...scheduled, msg]);
    setNewMsg({ model: newMsg.model, date: newMsg.date, time: "10:00", type: "Mass Message", content: "", status: "scheduled", segment: "All Fans", price: "", variantB: "", notes: "" });
    toast.success("Message scheduled!");
  };

  const duplicateMessage = (msg: ScheduledMessage) => {
    const newDate = prompt("Enter date for copy (YYYY-MM-DD):", msg.date);
    if (!newDate) return;
    saveScheduled([...scheduled, { ...msg, id: Date.now().toString(), date: newDate, status: "scheduled" }]);
    toast.success("Message duplicated!");
  };

  const addPPVIdea = () => {
    if (!newPPV.title.trim()) return;
    const idea: PPVIdea = {
      ...newPPV, id: Date.now().toString(), status: "idea",
      createdAt: new Date().toISOString().split("T")[0],
    };
    savePPV([idea, ...ppvIdeas]);
    setNewPPV({ model: newPPV.model, title: "", description: "", price: "$10", segment: "All Fans" });
    setShowPPVForm(false);
    toast.success("PPV idea saved!");
  };

  const schedulePPV = (idea: PPVIdea) => {
    const date = prompt("Schedule for which date? (YYYY-MM-DD)");
    const time = prompt("At what time? (HH:MM)", "14:00");
    if (!date || !time) return;
    const msg: ScheduledMessage = {
      id: Date.now().toString(), model: idea.model, date, time,
      type: "PPV", content: `${idea.title} — ${idea.description}`,
      status: "scheduled", segment: idea.segment, price: idea.price,
    };
    saveScheduled([...scheduled, msg]);
    savePPV(ppvIdeas.map(p => p.id === idea.id ? { ...p, status: "scheduled" as const } : p));
    toast.success("PPV scheduled!");
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    sent: "bg-green-500/20 text-green-300 border-green-500/30",
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    idea: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ready: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  };

  const typeColors: Record<string, string> = {
    "Mass Message": "bg-blue-500/20 text-blue-300",
    "PPV": "bg-green-500/20 text-green-300",
    "Prompt": "bg-purple-500/20 text-purple-300",
  };

  const filteredScheduled = filterModel === "all" ? scheduled : scheduled.filter(s => s.model === filterModel);

  // Week overview: next 7 days
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mass Messages & PPVs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Schedule mass messages, prompts, and PPVs — per model, per segment
          </p>
        </div>
        <select
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Models</option>
          {modelNames.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Scheduled This Week</p>
          <p className="text-2xl font-bold text-blue-400">
            {scheduled.filter(s => {
              const d = new Date(s.date);
              return d >= today && d <= weekDays[6];
            }).length}
          </p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Mass Messages</p>
          <p className="text-2xl font-bold">{filteredScheduled.filter(s => s.type === "Mass Message").length}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">PPVs</p>
          <p className="text-2xl font-bold text-green-400">{filteredScheduled.filter(s => s.type === "PPV").length}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">PPV Ideas</p>
          <p className="text-2xl font-bold text-purple-400">{ppvIdeas.filter(p => filterModel === "all" || p.model === filterModel).length}</p>
        </div>
      </div>

      <Tabs defaultValue="week" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="week" className="gap-2"><Eye className="h-4 w-4" /> This Week</TabsTrigger>
          <TabsTrigger value="scheduler" className="gap-2"><ListTodo className="h-4 w-4" /> Schedule</TabsTrigger>
          <TabsTrigger value="ppv" className="gap-2"><DollarSign className="h-4 w-4" /> PPV Ideas</TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2"><CalendarDays className="h-4 w-4" /> Calendar</TabsTrigger>
        </TabsList>

        {/* ─── WEEK VIEW ─── */}
        <TabsContent value="week" className="space-y-3 mt-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Next 7 Days — {filterModel === "all" ? "All Models" : filterModel}
          </h2>
          {weekDays.map(day => {
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const dayMsgs = filteredScheduled.filter(s => s.date === dateStr);
            const isToday = day.toDateString() === today.toDateString();
            const dayLabel = day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });

            return (
              <div key={dateStr} className={`glass-card p-4 border ${isToday ? "border-primary/40" : "border-border/20"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-bold ${isToday ? "text-primary" : ""}`}>
                    {isToday ? "📅 TODAY — " : ""}{dayLabel}
                  </h3>
                  <span className="text-xs text-muted-foreground">{dayMsgs.length} scheduled</span>
                </div>
                {dayMsgs.length === 0 ? (
                  <p className="text-xs text-muted-foreground/40 italic">Nothing scheduled</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayMsgs.sort((a, b) => a.time.localeCompare(b.time)).map(msg => {
                      const color = modelColors[msg.model] || "217 91% 60%";
                      return (
                        <div key={msg.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/30">
                          <span className="text-xs font-mono text-muted-foreground w-12">{msg.time}</span>
                          <span className="text-xs font-bold w-8" style={{ color: `hsl(${color})` }}>{msg.model.slice(0, 2).toUpperCase()}</span>
                          <Badge className={`text-[9px] ${typeColors[msg.type]}`}>{msg.type}</Badge>
                          {msg.segment && msg.segment !== "All Fans" && (
                            <Badge variant="outline" className="text-[9px]">{msg.segment}</Badge>
                          )}
                          {msg.price && <span className="text-[10px] text-green-400 font-bold">{msg.price}</span>}
                          <span className="text-xs text-muted-foreground truncate flex-1">{msg.content}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        {/* ─── SCHEDULER ─── */}
        <TabsContent value="scheduler" className="space-y-4 mt-4">
          {canEdit && (
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Scheduled Messages</h2>
              <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> {showAddForm ? "Cancel" : "Add Message"}
              </Button>
            </div>
          )}

          {showAddForm && canEdit && (
            <div className="glass-card p-5 space-y-4 border-primary/30">
              <h3 className="font-semibold text-sm">New Scheduled Message</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model</label>
                  <select value={newMsg.model} onChange={(e) => setNewMsg({ ...newMsg, model: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {modelNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Date</label>
                  <Input type="date" value={newMsg.date} onChange={(e) => setNewMsg({ ...newMsg, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Time</label>
                  <Input type="time" value={newMsg.time} onChange={(e) => setNewMsg({ ...newMsg, time: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Type</label>
                  <select value={newMsg.type} onChange={(e) => setNewMsg({ ...newMsg, type: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {messageTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Fan Segment</label>
                  <select value={newMsg.segment} onChange={(e) => setNewMsg({ ...newMsg, segment: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {fanSegments.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {newMsg.type === "PPV" && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Price</label>
                    <select value={newMsg.price} onChange={(e) => setNewMsg({ ...newMsg, price: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select price...</option>
                      {ppvPricePoints.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Message Content</label>
                <Textarea value={newMsg.content} onChange={(e) => setNewMsg({ ...newMsg, content: e.target.value })}
                  placeholder="Write the message content..." className="min-h-[60px]" />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Quick Templates</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(TEMPLATES[newMsg.type] || []).map((t, i) => (
                    <button key={i} onClick={() => setNewMsg({ ...newMsg, content: t })}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border/30 truncate max-w-[200px]">
                      {t.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">A/B Variant (optional)</label>
                <Input value={newMsg.variantB || ""} onChange={(e) => setNewMsg({ ...newMsg, variantB: e.target.value })}
                  placeholder="Alternative message to test against..." />
              </div>

              <div className="flex gap-2">
                <Button onClick={addMessage} disabled={!newMsg.content || !newMsg.date}>
                  <Send className="h-4 w-4 mr-1" /> Schedule
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Messages List */}
          <div className="space-y-2">
            {filteredScheduled.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages scheduled. Click "Add Message" to start planning.</p>
              </div>
            ) : (
              filteredScheduled
                .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
                .map((msg) => {
                  const color = modelColors[msg.model] || "217 91% 60%";
                  return (
                    <div key={msg.id} className="glass-card p-4 flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                        {msg.model.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: `hsl(${color})` }}>{msg.model}</span>
                          <Badge className={`text-[9px] ${typeColors[msg.type]}`}>{msg.type}</Badge>
                          <Badge variant="outline" className={`text-[9px] ${statusColors[msg.status]}`}>{msg.status}</Badge>
                          {msg.segment && msg.segment !== "All Fans" && (
                            <Badge variant="outline" className="text-[9px]">🎯 {msg.segment}</Badge>
                          )}
                          {msg.price && <Badge className="text-[9px] bg-green-500/20 text-green-300">{msg.price}</Badge>}
                        </div>
                        <p className="text-sm mt-1">{msg.content}</p>
                        {msg.variantB && (
                          <p className="text-xs text-amber-300/70 mt-1">📊 A/B variant: {msg.variantB}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(msg.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at {msg.time}
                        </p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => duplicateMessage(msg)} className="p-2 hover:bg-secondary rounded text-muted-foreground transition-colors" title="Duplicate">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => saveScheduled(scheduled.filter(s => s.id !== msg.id))} className="p-2 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </TabsContent>

        {/* ─── PPV IDEAS ─── */}
        <TabsContent value="ppv" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">PPV Ideas Bank</h2>
            {canEdit && (
              <Button onClick={() => setShowPPVForm(!showPPVForm)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> {showPPVForm ? "Cancel" : "Add PPV Idea"}
              </Button>
            )}
          </div>

          {showPPVForm && canEdit && (
            <div className="glass-card p-5 space-y-4 border-green-500/30">
              <h3 className="font-semibold text-sm">New PPV Idea</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model</label>
                  <select value={newPPV.model} onChange={(e) => setNewPPV({ ...newPPV, model: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {modelNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Price Point</label>
                  <select value={newPPV.price} onChange={(e) => setNewPPV({ ...newPPV, price: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {ppvPricePoints.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Target Segment</label>
                  <select value={newPPV.segment} onChange={(e) => setNewPPV({ ...newPPV, segment: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {fanSegments.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <Input value={newPPV.title} onChange={(e) => setNewPPV({ ...newPPV, title: e.target.value })}
                placeholder="PPV title (e.g. 'Shower tease → full reveal')" />
              <Textarea value={newPPV.description} onChange={(e) => setNewPPV({ ...newPPV, description: e.target.value })}
                placeholder="Describe the PPV concept, what content is needed, how to tease it..." className="min-h-[60px]" />
              <Button onClick={addPPVIdea} disabled={!newPPV.title}>
                <Lightbulb className="h-4 w-4 mr-1" /> Save Idea
              </Button>
            </div>
          )}

          {/* PPV Ideas by model */}
          {(filterModel === "all" ? modelNames : [filterModel]).map(model => {
            const ideas = ppvIdeas.filter(p => p.model === model);
            if (ideas.length === 0 && filterModel !== "all") return null;
            const color = modelColors[model] || "217 91% 60%";

            return (
              <div key={model} className="space-y-2">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: `hsl(${color})` }}>
                  {model} <span className="text-xs font-normal text-muted-foreground">{ideas.length} ideas</span>
                </h3>
                {ideas.length === 0 ? (
                  <p className="text-xs text-muted-foreground/40 italic py-2">No PPV ideas yet for {model}</p>
                ) : (
                  ideas.map(idea => (
                    <div key={idea.id} className="glass-card p-4 flex items-start gap-3">
                      <span className="text-xl mt-0.5">💰</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{idea.title}</span>
                          <Badge className="text-[9px] bg-green-500/20 text-green-300">{idea.price}</Badge>
                          <Badge variant="outline" className={`text-[9px] ${statusColors[idea.status]}`}>{idea.status}</Badge>
                          <Badge variant="outline" className="text-[9px]">🎯 {idea.segment}</Badge>
                        </div>
                        {idea.description && (
                          <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">Added {idea.createdAt}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1 shrink-0">
                          {idea.status !== "scheduled" && (
                            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => schedulePPV(idea)}>
                              <Send className="h-3 w-3" /> Schedule
                            </Button>
                          )}
                          <button onClick={() => savePPV(ppvIdeas.filter(p => p.id !== idea.id))}
                            className="p-2 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </TabsContent>

        {/* ─── CALENDAR ─── */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <h2 className="text-lg font-semibold">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const schd = getScheduledForDay(day);
                const dateStr = getDateStr(day);
                const isSelected = selectedDate === dateStr;
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                const isToday = dateStr === todayStr;

                return (
                  <Tooltip key={day}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`min-h-[72px] p-1.5 rounded-lg border transition-all text-left flex flex-col ${
                          isSelected ? "border-primary bg-primary/10"
                            : isToday ? "border-primary/50 bg-primary/5"
                            : schd.length > 0 ? "border-border/50 bg-secondary/30 hover:bg-secondary/60"
                            : "border-transparent hover:border-border/30"
                        }`}
                      >
                        <span className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{day}</span>
                        <div className="flex flex-wrap gap-0.5">
                          {schd.map((s) => (
                            <div key={s.id} className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${modelColors[s.model] || "217 91% 60%"})` }} />
                          ))}
                        </div>
                        {schd.length > 0 && <span className="text-[9px] text-muted-foreground mt-auto">{schd.length} msg{schd.length > 1 ? "s" : ""}</span>}
                      </button>
                    </TooltipTrigger>
                    {schd.length > 0 && (
                      <TooltipContent side="top" className="max-w-xs">
                        {schd.map(s => (
                          <div key={s.id} className="text-xs py-0.5">
                            <span className="font-medium" style={{ color: `hsl(${modelColors[s.model] || "217 91% 60%"})` }}>{s.model}</span>
                            <span className="text-muted-foreground ml-1">— {s.type}: {s.content.slice(0, 40)}...</span>
                          </div>
                        ))}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            {modelNames.map((name) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${modelColors[name] || "217 91% 60%"})` }} />
                <span className="text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
