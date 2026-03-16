import { useState, useEffect, useMemo, useCallback } from "react";
import { modelColors } from "@/lib/mock-data";
import { Plus, Trash2, Copy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const modelNames = ["Izzy", "Willow", "Lucinda Bleu", "Ashley Morris"];
const messageTypes = ["Mass Message", "PPV", "Prompt"] as const;
const fanSegments = ["All Fans", "New Subs (< 7 days)", "High Spenders ($100+)", "Inactive (no msg 7+ days)", "Whales Only", "Engaged (5+ replies)"] as const;
const ppvPricePoints = ["", "$3", "$5", "$7", "$10", "$15", "$20", "$25", "$35", "$50"] as const;

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

// Days of week for the schedule grid
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDateForDay(weekStart: Date, dayIndex: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Inline editable cell
function EditableCell({ value, onChange, type = "text", options, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; type?: string;
  options?: readonly string[]; placeholder?: string; className?: string;
}) {
  if (options) {
    return (
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`bg-transparent border-0 border-b border-transparent hover:border-border/40 focus:border-primary/60 outline-none text-sm px-1 py-0.5 w-full ${className}`}>
        {options.map(o => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    );
  }
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`bg-transparent border-0 border-b border-transparent hover:border-border/40 focus:border-primary/60 outline-none text-sm px-1 py-0.5 w-full ${className}`} />
  );
}

export default function MassMessageCalendar() {
  const { user } = useAuth();
  const canEdit = user && ['admin', 'supervisor', 'data_entry'].includes(user.role);

  const [activeModel, setActiveModel] = useState<string>(modelNames[0]);
  const [activeTab, setActiveTab] = useState<"schedule" | "ppv">("schedule");
  const [weekOffset, setWeekOffset] = useState(0);

  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([]);
  const [ppvIdeas, setPPVIdeas] = useState<PPVIdea[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [schedRes, ppvRes] = await Promise.all([
          supabase.from('scheduled_messages').select('*').order('date', { ascending: true }),
          supabase.from('ppv_ideas').select('*').order('created_at', { ascending: false }),
        ]);
        if (schedRes.data) {
          setScheduled(schedRes.data.map((r: any) => ({
            id: r.id, model: r.model, date: r.date, time: r.time || '',
            type: r.type as any, content: r.content || '', status: r.status as any,
            segment: r.segment || 'All Fans', price: r.price || '',
            variantB: r.variant_b || '', notes: r.notes || '',
          })));
        }
        if (ppvRes.data) {
          setPPVIdeas(ppvRes.data.map((r: any) => ({
            id: r.id, model: r.model, title: r.title || '', description: r.description || '',
            price: r.price || '', segment: r.segment || 'All Fans',
            status: r.status as any, conversionRate: r.conversion_rate || '',
            createdAt: r.created_at,
          })));
        }
      } catch (err) {
        console.error('Failed to load mass messages:', err);
        // Fallback to localStorage
        const saved = localStorage.getItem(SCHEDULE_KEY);
        if (saved) setScheduled(JSON.parse(saved));
        const savedPPV = localStorage.getItem(PPV_KEY);
        if (savedPPV) setPPVIdeas(JSON.parse(savedPPV));
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const saveScheduled = useCallback(async (msgs: ScheduledMessage[]) => {
    setScheduled(msgs);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(msgs)); // backup
  }, []);

  const savePPV = useCallback(async (ideas: PPVIdea[]) => {
    setPPVIdeas(ideas);
    localStorage.setItem(PPV_KEY, JSON.stringify(ideas)); // backup
  }, []);

  // Week navigation
  const today = new Date();
  const weekStart = useMemo(() => {
    const ws = getWeekStart(today);
    ws.setDate(ws.getDate() + weekOffset * 7);
    return ws;
  }, [weekOffset]);

  const weekEnd = useMemo(() => {
    const we = new Date(weekStart);
    we.setDate(we.getDate() + 6);
    return we;
  }, [weekStart]);

  const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  // Filter messages for active model and current week
  const weekMessages = useMemo(() => {
    return scheduled.filter(s => {
      if (s.model !== activeModel) return false;
      const msgDate = new Date(s.date + "T12:00:00");
      return msgDate >= weekStart && msgDate <= weekEnd;
    });
  }, [scheduled, activeModel, weekStart, weekEnd]);

  // Group by day
  const messagesByDay = useMemo(() => {
    const map: Record<string, ScheduledMessage[]> = {};
    DAYS.forEach((_, i) => {
      const dateStr = getDateForDay(weekStart, i);
      map[dateStr] = weekMessages.filter(m => m.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [weekMessages, weekStart]);

  const updateMessage = async (id: string, field: keyof ScheduledMessage, value: string) => {
    const updated = scheduled.map(m => m.id === id ? { ...m, [field]: value } : m);
    saveScheduled(updated);
    // Map field names to DB columns
    const dbField = field === 'variantB' ? 'variant_b' : field;
    await supabase.from('scheduled_messages').update({ [dbField]: value }).eq('id', id);
  };

  const addRow = async (dateStr: string) => {
    const { data } = await supabase.from('scheduled_messages').insert({
      model: activeModel, date: dateStr, time: '10:00', type: 'Mass Message',
      content: '', status: 'draft', segment: 'All Fans', price: '',
    }).select().single();
    if (data) {
      const msg: ScheduledMessage = {
        id: data.id, model: data.model, date: data.date, time: data.time || '',
        type: data.type as any, content: data.content || '', status: data.status as any,
        segment: data.segment || 'All Fans', price: data.price || '',
      };
      saveScheduled([...scheduled, msg]);
      toast.success("Row added");
    }
  };

  const deleteRow = async (id: string) => {
    saveScheduled(scheduled.filter(s => s.id !== id));
    await supabase.from('scheduled_messages').delete().eq('id', id);
  };

  const duplicateRow = async (msg: ScheduledMessage, targetDate: string) => {
    const { data } = await supabase.from('scheduled_messages').insert({
      model: msg.model, date: targetDate, time: msg.time, type: msg.type,
      content: msg.content, status: 'draft', segment: msg.segment,
      price: msg.price, variant_b: msg.variantB, notes: msg.notes,
    }).select().single();
    if (data) {
      saveScheduled([...scheduled, { ...msg, id: data.id, date: targetDate, status: "draft" as const }]);
      toast.success("Duplicated");
    }
  };

  const addPPVIdea = async () => {
    const { data } = await supabase.from('ppv_ideas').insert({
      model: activeModel, title: '', description: '', price: '$10',
      segment: 'All Fans', status: 'idea',
    }).select().single();
    if (data) {
      const idea: PPVIdea = {
        id: data.id, model: data.model, title: '', description: '',
        price: '$10', segment: 'All Fans', status: 'idea',
        createdAt: data.created_at,
      };
      savePPV([idea, ...ppvIdeas]);
    }
  };

  const updatePPV = async (id: string, field: keyof PPVIdea, value: string) => {
    const updated = ppvIdeas.map(p => p.id === id ? { ...p, [field]: value } : p);
    savePPV(updated);
    const dbField = field === 'conversionRate' ? 'conversion_rate' : field === 'createdAt' ? 'created_at' : field;
    await supabase.from('ppv_ideas').update({ [dbField]: value }).eq('id', id);
  };

  const modelColor = modelColors[activeModel] || "217 91% 60%";
  const totalThisWeek = weekMessages.length;
  const ppvCount = weekMessages.filter(m => m.type === "PPV").length;
  const promptCount = weekMessages.filter(m => m.type === "Prompt").length;
  const massCount = weekMessages.filter(m => m.type === "Mass Message").length;

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Mass Messages & PPVs</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{totalThisWeek} this week</span>
          <span className="text-muted-foreground/40">|</span>
          <span>{massCount} mass · {ppvCount} PPV · {promptCount} prompts</span>
        </div>
      </div>

      {/* Model tabs */}
      <div className="flex items-center gap-1 border-b border-border/30 pb-0">
        {modelNames.map(name => {
          const color = modelColors[name] || "217 91% 60%";
          const isActive = name === activeModel;
          return (
            <button key={name} onClick={() => setActiveModel(name)}
              className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                isActive
                  ? "border-current text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground/70"
              }`}
              style={isActive ? { color: `hsl(${color})`, borderColor: `hsl(${color})` } : {}}>
              {name}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setActiveTab("schedule")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeTab === "schedule" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Schedule
          </button>
          <button onClick={() => setActiveTab("ppv")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeTab === "ppv" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            PPV Ideas
          </button>
        </div>
      </div>

      {activeTab === "schedule" && (
        <>
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset(w => w - 1)} className="px-2 py-1 text-xs rounded hover:bg-secondary transition-colors">← Prev</button>
              <span className="text-sm font-medium min-w-[200px] text-center">{weekLabel}</span>
              <button onClick={() => setWeekOffset(w => w + 1)} className="px-2 py-1 text-xs rounded hover:bg-secondary transition-colors">Next →</button>
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Today</button>
              )}
            </div>
          </div>

          {/* Schedule table — one section per day */}
          <div className="space-y-1">
            {DAYS.map((day, dayIndex) => {
              const dateStr = getDateForDay(weekStart, dayIndex);
              const dayMsgs = messagesByDay[dateStr] || [];
              const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

              return (
                <div key={dateStr} className={`rounded-md border ${isToday ? "border-primary/30 bg-primary/[0.02]" : "border-border/20 bg-card/30"}`}>
                  {/* Day header row */}
                  <div className="flex items-center px-3 py-1.5 border-b border-border/10">
                    <span className={`text-xs font-semibold w-28 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      {day} <span className="font-normal">{formatDateShort(dateStr)}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 ml-auto">{dayMsgs.length} item{dayMsgs.length !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Column headers (only if has messages) */}
                  {dayMsgs.length > 0 && (
                    <div className="grid grid-cols-[60px_100px_1fr_140px_70px_60px_36px] gap-1 px-3 py-1 text-[10px] text-muted-foreground/60 uppercase tracking-wider border-b border-border/10">
                      <span>Time</span>
                      <span>Type</span>
                      <span>Content</span>
                      <span>Segment</span>
                      <span>Price</span>
                      <span>Status</span>
                      <span></span>
                    </div>
                  )}

                  {/* Message rows */}
                  {dayMsgs.map(msg => (
                    <div key={msg.id} className="grid grid-cols-[60px_100px_1fr_140px_70px_60px_36px] gap-1 px-3 py-1 border-b border-border/5 hover:bg-secondary/20 group items-center"
                      style={{ borderLeft: `3px solid hsl(${modelColor})` }}>
                      <EditableCell value={msg.time} type="time" onChange={v => updateMessage(msg.id, "time", v)} />
                      <EditableCell value={msg.type} options={messageTypes} onChange={v => updateMessage(msg.id, "type", v as any)} />
                      <EditableCell value={msg.content} placeholder="Message content..." onChange={v => updateMessage(msg.id, "content", v)} />
                      <EditableCell value={msg.segment || "All Fans"} options={fanSegments} onChange={v => updateMessage(msg.id, "segment", v)} className="text-xs" />
                      <EditableCell value={msg.price || ""} options={ppvPricePoints} onChange={v => updateMessage(msg.id, "price", v)} />
                      <EditableCell value={msg.status} options={["draft", "scheduled", "sent"] as const} onChange={v => updateMessage(msg.id, "status", v as any)} className="text-xs" />
                      {canEdit && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            const nextDate = getDateForDay(weekStart, Math.min(dayIndex + 1, 6));
                            duplicateRow(msg, nextDate);
                          }} className="p-1 hover:text-primary" title="Duplicate to next day">
                            <Copy className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteRow(msg.id)} className="p-1 hover:text-destructive" title="Delete">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add row button */}
                  {canEdit && (
                    <button onClick={() => addRow(dateStr)}
                      className="w-full flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/20 transition-colors">
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "ppv" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {ppvIdeas.filter(p => p.model === activeModel).length} ideas for {activeModel}
            </span>
            {canEdit && (
              <Button onClick={addPPVIdea} size="sm" variant="outline" className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" /> Add Idea
              </Button>
            )}
          </div>

          {/* PPV table */}
          <div className="rounded-md border border-border/20 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_80px_140px_80px_36px] gap-1 px-3 py-1.5 text-[10px] text-muted-foreground/60 uppercase tracking-wider bg-secondary/30 border-b border-border/10">
              <span>Title</span>
              <span>Description</span>
              <span>Price</span>
              <span>Segment</span>
              <span>Status</span>
              <span></span>
            </div>

            {ppvIdeas.filter(p => p.model === activeModel).length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground/40">No PPV ideas yet. Click "Add Idea" to start.</div>
            ) : (
              ppvIdeas.filter(p => p.model === activeModel).map(idea => (
                <div key={idea.id} className="grid grid-cols-[1fr_1fr_80px_140px_80px_36px] gap-1 px-3 py-1.5 border-b border-border/5 hover:bg-secondary/20 group items-center"
                  style={{ borderLeft: `3px solid hsl(${modelColor})` }}>
                  <input value={idea.title} onChange={e => updatePPV(idea.id, "title", e.target.value)} placeholder="PPV title..."
                    className="bg-transparent border-0 border-b border-transparent hover:border-border/40 focus:border-primary/60 outline-none text-sm px-1 py-0.5 w-full" />
                  <input value={idea.description} onChange={e => updatePPV(idea.id, "description", e.target.value)} placeholder="Description..."
                    className="bg-transparent border-0 border-b border-transparent hover:border-border/40 focus:border-primary/60 outline-none text-sm px-1 py-0.5 w-full text-muted-foreground" />
                  <select value={idea.price} onChange={e => updatePPV(idea.id, "price", e.target.value)}
                    className="bg-transparent border-0 text-sm px-1 py-0.5 outline-none">
                    {ppvPricePoints.filter(p => p).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={idea.segment} onChange={e => updatePPV(idea.id, "segment", e.target.value)}
                    className="bg-transparent border-0 text-xs px-1 py-0.5 outline-none">
                    {fanSegments.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={idea.status} onChange={e => updatePPV(idea.id, "status", e.target.value as any)}
                    className="bg-transparent border-0 text-xs px-1 py-0.5 outline-none">
                    {(["idea", "ready", "scheduled", "sent"] as const).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {canEdit && (
                    <button onClick={async () => { savePPV(ppvIdeas.filter(p => p.id !== idea.id)); await supabase.from('ppv_ideas').delete().eq('id', idea.id); }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-all" title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
