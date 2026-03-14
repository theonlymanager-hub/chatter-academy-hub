import { useState, useMemo } from "react";
import { massMessages, modelColors } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, DollarSign, MessageSquare, Plus, Trash2, CalendarDays, ListTodo } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const modelNames = ["Izzy", "Willow", "Lucinda Bleu", "Ashley Morris"];
const messageTypes = ["Mass Message", "PPV", "Prompt"] as const;

interface ScheduledMessage {
  id: string;
  model: string;
  date: string;
  time: string;
  type: typeof messageTypes[number];
  content: string;
  status: "scheduled" | "sent" | "draft";
}

const defaultScheduled: ScheduledMessage[] = [
  { id: "s1", model: "Izzy", date: "2026-03-16", time: "10:00", type: "Mass Message", content: "Good morning babe 💕 I woke up thinking about you...", status: "scheduled" },
  { id: "s2", model: "Willow", date: "2026-03-16", time: "14:00", type: "PPV", content: "Something special just for you... 🔥", status: "scheduled" },
  { id: "s3", model: "Ashley Morris", date: "2026-03-17", time: "09:00", type: "Mass Message", content: "Missing you already... come talk to me 😘", status: "draft" },
  { id: "s4", model: "Lucinda Bleu", date: "2026-03-18", time: "20:00", type: "Prompt", content: "Dark & moody set — candle lit vibes 🕯️", status: "scheduled" },
];

export default function MassMessageCalendar() {
  const { user } = useAuth();
  const canEdit = user && ['admin', 'supervisor', 'data_entry'].includes(user.role);

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>(() => {
    const saved = localStorage.getItem("mass-msg-scheduled");
    return saved ? JSON.parse(saved) : defaultScheduled;
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMsg, setNewMsg] = useState<Omit<ScheduledMessage, "id">>({
    model: "Izzy", date: "", time: "10:00", type: "Mass Message", content: "", status: "scheduled",
  });

  const saveScheduled = (msgs: ScheduledMessage[]) => {
    setScheduled(msgs);
    localStorage.setItem("mass-msg-scheduled", JSON.stringify(msgs));
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

  const getMessagesForDay = (day: number) =>
    massMessages.filter((m) => m.date === getDateStr(day));

  const getScheduledForDay = (day: number) =>
    scheduled.filter((s) => s.date === getDateStr(day));

  const selectedMessages = selectedDate ? massMessages.filter((m) => m.date === selectedDate) : [];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const addMessage = () => {
    if (!newMsg.content.trim() || !newMsg.date) return;
    const msg: ScheduledMessage = { ...newMsg, id: Date.now().toString() };
    saveScheduled([...scheduled, msg]);
    setNewMsg({ model: "Izzy", date: "", time: "10:00", type: "Mass Message", content: "", status: "scheduled" });
    setShowAddForm(false);
  };

  const deleteMessage = (id: string) => {
    saveScheduled(scheduled.filter((s) => s.id !== id));
  };

  const statusColors = {
    scheduled: "text-blue-400 border-blue-400/40",
    sent: "text-emerald-400 border-emerald-400/40",
    draft: "text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mass Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Schedule and view mass messages by model</p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="calendar" className="gap-2"><CalendarDays className="h-4 w-4" /> Calendar</TabsTrigger>
          <TabsTrigger value="scheduler" className="gap-2"><ListTodo className="h-4 w-4" /> Scheduler</TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
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
                const msgs = getMessagesForDay(day);
                const schd = getScheduledForDay(day);
                const dateStr = getDateStr(day);
                const isSelected = selectedDate === dateStr;
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                const isToday = dateStr === todayStr;
                const hasItems = msgs.length > 0 || schd.length > 0;

                return (
                  <Tooltip key={day}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`min-h-[72px] p-1.5 rounded-lg border transition-all text-left flex flex-col ${
                          isSelected ? "border-primary bg-primary/10"
                            : isToday ? "border-primary/50 bg-primary/5"
                            : hasItems ? "border-border/50 bg-secondary/30 hover:bg-secondary/60"
                            : "border-transparent hover:border-border/30"
                        }`}
                      >
                        <span className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{day}</span>
                        <div className="flex flex-wrap gap-0.5">
                          {msgs.map((m) => (
                            <div key={m.id} className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${modelColors[m.modelName]})` }} />
                          ))}
                          {schd.map((s) => (
                            <div key={s.id} className="h-2 w-2 rounded-sm border border-amber-400/60 bg-amber-400/30" />
                          ))}
                        </div>
                      </button>
                    </TooltipTrigger>
                    {hasItems && (
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1.5">
                          {msgs.map((m) => (
                            <div key={m.id} className="text-xs">
                              <span className="font-medium" style={{ color: `hsl(${modelColors[m.modelName]})` }}>{m.modelName}</span>
                              <span className="text-muted-foreground ml-1">— {m.messagePreview}</span>
                            </div>
                          ))}
                          {schd.map((s) => (
                            <div key={s.id} className="text-xs">
                              <span className="font-medium text-amber-400">{s.model}</span>
                              <span className="text-muted-foreground ml-1">— {s.type}: {s.content.slice(0, 40)}...</span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDate && selectedMessages.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-semibold text-sm">
                Messages for {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              <div className="space-y-2">
                {selectedMessages.map((m) => {
                  const color = modelColors[m.modelName];
                  return (
                    <div key={m.id} className="p-3 rounded-lg border flex items-start gap-3" style={{ borderColor: `hsl(${color} / 0.3)`, backgroundColor: `hsl(${color} / 0.05)` }}>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                        {m.modelName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: `hsl(${color})` }}>{m.modelName}</span>
                          <span className="text-[10px] text-muted-foreground">({m.theme})</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {m.messagePreview}
                        </p>
                        <p className="text-xs mt-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-accent" />
                          <span className="text-accent font-medium">{m.ppvTitle} — ${m.ppvPrice}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            {modelNames.map((name) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${modelColors[name]})` }} />
                <span className="text-muted-foreground">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-sm border border-amber-400/60 bg-amber-400/30" />
              <span className="text-muted-foreground">Scheduled</span>
            </div>
          </div>
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-4 mt-4">
          {canEdit && (
            <div className="flex justify-end">
              <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Message
              </Button>
            </div>
          )}

          {showAddForm && canEdit && (
            <div className="glass-card p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="font-semibold text-sm">New Scheduled Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <select
                  value={newMsg.model}
                  onChange={(e) => setNewMsg({ ...newMsg, model: e.target.value })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {modelNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <Input type="date" value={newMsg.date} onChange={(e) => setNewMsg({ ...newMsg, date: e.target.value })} />
                <Input type="time" value={newMsg.time} onChange={(e) => setNewMsg({ ...newMsg, time: e.target.value })} />
                <select
                  value={newMsg.type}
                  onChange={(e) => setNewMsg({ ...newMsg, type: e.target.value as typeof messageTypes[number] })}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {messageTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Input
                placeholder="Content preview..."
                value={newMsg.content}
                onChange={(e) => setNewMsg({ ...newMsg, content: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addMessage()}
              />
              <div className="flex gap-2">
                <Button onClick={addMessage} size="sm">Save</Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          {/* Scheduled messages list */}
          <div className="space-y-2">
            {scheduled.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No scheduled messages yet.</p>
              </div>
            ) : (
              scheduled
                .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
                .map((msg) => {
                  const color = modelColors[msg.model] || "217 91% 60%";
                  return (
                    <div key={msg.id} className="glass-card p-4 flex items-center gap-4">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                      >
                        {msg.model.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: `hsl(${color})` }}>{msg.model}</span>
                          <Badge variant="outline" className="text-[10px]">{msg.type}</Badge>
                          <Badge variant="outline" className={`text-[10px] ${statusColors[msg.status]}`}>{msg.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{msg.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(msg.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at {msg.time}
                        </p>
                      </div>
                      {canEdit && (
                        <button onClick={() => deleteMessage(msg.id)} className="p-2 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
