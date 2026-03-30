import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Video,
  Paintbrush,
  Plus,
  Pencil,
  Trash2,
  Target,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────
type Model = "Ashley" | "Willow" | "Izzie";
type Category = "solo" | "b/g" | "lingerie" | "lifestyle" | "themed" | "custom" | "bts";
type IdeaStatus = "idea" | "planned" | "shot" | "edited" | "posted";
type Priority = "high" | "medium" | "low";

interface ContentIdea {
  id: string;
  model: Model;
  title: string;
  category: Category;
  status: IdeaStatus;
  priority: Priority;
  notes: string;
  created_at: string;
  due_date: string;
}

interface WeeklyTargets {
  [key: string]: { photos: number; videos: number; customs: number };
}

interface ContentData {
  content_ideas: ContentIdea[];
  weekly_targets: WeeklyTargets;
}

// ─── Constants ───────────────────────────────────────────────────────
const MODELS: Model[] = ["Ashley", "Willow", "Izzie"];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "b/g", label: "B/G" },
  { value: "lingerie", label: "Lingerie" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "themed", label: "Themed" },
  { value: "custom", label: "Custom" },
  { value: "bts", label: "Behind the Scenes" },
];

const STATUSES: { value: IdeaStatus; label: string; color: string }[] = [
  { value: "idea", label: "💡 Idea", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
  { value: "planned", label: "📋 Planned", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "shot", label: "📸 Shot", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { value: "edited", label: "✂️ Edited", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { value: "posted", label: "✅ Posted", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "low", label: "Low", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
];

const CATEGORY_COLORS: Record<Category, string> = {
  solo: "bg-pink-500/20 text-pink-300",
  "b/g": "bg-orange-500/20 text-orange-300",
  lingerie: "bg-rose-500/20 text-rose-300",
  lifestyle: "bg-teal-500/20 text-teal-300",
  themed: "bg-violet-500/20 text-violet-300",
  custom: "bg-amber-500/20 text-amber-300",
  bts: "bg-cyan-500/20 text-cyan-300",
};

const STATUS_ORDER: IdeaStatus[] = ["idea", "planned", "shot", "edited", "posted"];

const DEFAULT_TARGETS: WeeklyTargets = {
  Ashley: { photos: 10, videos: 3, customs: 2 },
  Willow: { photos: 8, videos: 2, customs: 1 },
  Izzie: { photos: 10, videos: 3, customs: 2 },
};

const SAMPLE_IDEAS: ContentIdea[] = [];

const STORAGE_KEY = "the_only_board_content_ideas";

// ─── Helpers ─────────────────────────────────────────────────────────
function loadData(): ContentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { content_ideas: SAMPLE_IDEAS, weekly_targets: DEFAULT_TARGETS };
}

function saveData(data: ContentData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStatusMeta(s: IdeaStatus) {
  return STATUSES.find((st) => st.value === s)!;
}

function getPriorityMeta(p: Priority) {
  return PRIORITIES.find((pr) => pr.value === p)!;
}

// ─── Component ───────────────────────────────────────────────────────
export default function ContentIdeas() {
  const { user } = useAuth();
  const canEdit = user && ["admin", "supervisor"].includes(user.role);

  const [data, setData] = useState<ContentData>(loadData);
  const [activeModel, setActiveModel] = useState<Model>("Ashley");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTargetsOpen, setEditTargetsOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("solo");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formNotes, setFormNotes] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  // Target edit state
  const [tempTargets, setTempTargets] = useState<WeeklyTargets>(data.weekly_targets);

  useEffect(() => { saveData(data); }, [data]);

  // Filtered ideas for active model
  const modelIdeas = useMemo(() => {
    let ideas = data.content_ideas.filter((i) => i.model === activeModel);
    if (filterCategory !== "all") ideas = ideas.filter((i) => i.category === filterCategory);
    if (filterStatus !== "all") ideas = ideas.filter((i) => i.status === filterStatus);
    if (filterPriority !== "all") ideas = ideas.filter((i) => i.priority === filterPriority);
    // Sort: priority high→low, then status early→late
    const pOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    ideas.sort((a, b) => {
      if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
      return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    });
    return ideas;
  }, [data.content_ideas, activeModel, filterCategory, filterStatus, filterPriority]);

  // Weekly progress per model (count "posted" items)
  const progressFor = (model: Model) => {
    const ideas = data.content_ideas.filter((i) => i.model === model);
    const posted = ideas.filter((i) => i.status === "posted");
    const targets = data.weekly_targets[model] || { photos: 0, videos: 0, customs: 0 };
    // Count by category approximation: solo/lingerie/lifestyle/themed/bts = photo, b/g stays photo, custom = custom
    const photosDone = posted.filter((i) => i.category !== "custom").length;
    const customsDone = posted.filter((i) => i.category === "custom").length;
    // For videos we count shot items as progress towards video target
    const videosDone = ideas.filter((i) => ["shot", "edited", "posted"].includes(i.status) && ["b/g", "solo"].includes(i.category)).length;
    return {
      photos: { done: Math.min(photosDone, targets.photos), target: targets.photos },
      videos: { done: Math.min(videosDone, targets.videos), target: targets.videos },
      customs: { done: Math.min(customsDone, targets.customs), target: targets.customs },
    };
  };

  // ─── Actions ─────────────────────────────────────────────────────
  const addIdea = () => {
    if (!formTitle.trim()) return;
    const idea: ContentIdea = {
      id: crypto.randomUUID(),
      model: activeModel,
      title: formTitle.trim(),
      category: formCategory,
      status: "idea",
      priority: formPriority,
      notes: formNotes,
      created_at: new Date().toISOString().slice(0, 10),
      due_date: formDueDate,
    };
    setData((d) => ({ ...d, content_ideas: [...d.content_ideas, idea] }));
    resetForm();
    setAddOpen(false);
  };

  const updateIdea = () => {
    if (!editingIdea) return;
    setData((d) => ({
      ...d,
      content_ideas: d.content_ideas.map((i) =>
        i.id === editingIdea.id ? editingIdea : i
      ),
    }));
    setEditingIdea(null);
  };

  const deleteIdea = (id: string) => {
    setData((d) => ({
      ...d,
      content_ideas: d.content_ideas.filter((i) => i.id !== id),
    }));
  };

  const cycleStatus = (id: string) => {
    setData((d) => ({
      ...d,
      content_ideas: d.content_ideas.map((i) => {
        if (i.id !== id) return i;
        const idx = STATUS_ORDER.indexOf(i.status);
        const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
        return { ...i, status: next };
      }),
    }));
  };

  const saveTargets = () => {
    setData((d) => ({ ...d, weekly_targets: tempTargets }));
    setEditTargetsOpen(false);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormCategory("solo");
    setFormPriority("medium");
    setFormNotes("");
    setFormDueDate("");
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            Content Ideas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plan and track content ideas per model with weekly production targets
          </p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Dialog open={editTargetsOpen} onOpenChange={setEditTargetsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTempTargets(data.weekly_targets)}
                  >
                    <Target className="h-4 w-4 mr-1" /> Edit Targets
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Weekly Targets</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {MODELS.map((m) => (
                      <div key={m} className="space-y-2">
                        <h3 className="font-semibold text-sm">{m}</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {(["photos", "videos", "customs"] as const).map((t) => (
                            <div key={t}>
                              <Label className="text-xs capitalize">{t}</Label>
                              <Input
                                type="number"
                                min={0}
                                value={tempTargets[m]?.[t] ?? 0}
                                onChange={(e) =>
                                  setTempTargets((prev) => ({
                                    ...prev,
                                    [m]: { ...prev[m], [t]: Number(e.target.value) },
                                  }))
                                }
                                className="h-8"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button onClick={saveTargets} className="w-full">
                      <Save className="h-4 w-4 mr-1" /> Save Targets
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Idea
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>New Content Idea — {activeModel}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. College dorm room strip tease" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select value={formCategory} onValueChange={(v) => setFormCategory(v as Category)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Priority</Label>
                        <Select value={formPriority} onValueChange={(v) => setFormPriority(v as Priority)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Due Date (optional)</Label>
                      <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Props needed, location, etc." rows={2} />
                    </div>
                    <Button onClick={addIdea} disabled={!formTitle.trim()} className="w-full">
                      <Plus className="h-4 w-4 mr-1" /> Add Idea
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Weekly Summary — all models */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MODELS.map((m) => {
          const p = progressFor(m);
          return (
            <Card key={m} className="glass-card p-4 space-y-3">
              <h3 className="font-semibold text-sm">{m}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Camera className="h-3.5 w-3.5 text-pink-400" />
                  <span className="w-14">Photos</span>
                  <Progress value={p.photos.target ? (p.photos.done / p.photos.target) * 100 : 0} className="flex-1 h-2" />
                  <span className="text-muted-foreground w-10 text-right">{p.photos.done}/{p.photos.target}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Video className="h-3.5 w-3.5 text-blue-400" />
                  <span className="w-14">Videos</span>
                  <Progress value={p.videos.target ? (p.videos.done / p.videos.target) * 100 : 0} className="flex-1 h-2" />
                  <span className="text-muted-foreground w-10 text-right">{p.videos.done}/{p.videos.target}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Paintbrush className="h-3.5 w-3.5 text-amber-400" />
                  <span className="w-14">Customs</span>
                  <Progress value={p.customs.target ? (p.customs.done / p.customs.target) * 100 : 0} className="flex-1 h-2" />
                  <span className="text-muted-foreground w-10 text-right">{p.customs.done}/{p.customs.target}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Model Tabs */}
      <Tabs value={activeModel} onValueChange={(v) => setActiveModel(v as Model)}>
        <TabsList className="mb-4">
          {MODELS.map((m) => {
            const count = data.content_ideas.filter((i) => i.model === m).length;
            return (
              <TabsTrigger key={m} value={m}>
                {m} <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {MODELS.map((m) => (
          <TabsContent key={m} value={m} className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Ideas List */}
            {modelIdeas.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">
                <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No content ideas match your filters.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {modelIdeas.map((idea) => {
                  const statusMeta = getStatusMeta(idea.status);
                  const priorityMeta = getPriorityMeta(idea.priority);
                  return (
                    <Card key={idea.id} className="glass-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="font-semibold text-sm">{idea.title}</h3>
                            <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[idea.category]}`}>
                              {CATEGORIES.find((c) => c.value === idea.category)?.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${priorityMeta.color}`}>
                              {priorityMeta.label}
                            </Badge>
                          </div>
                          {idea.notes && (
                            <p className="text-xs text-muted-foreground mb-2">{idea.notes}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>Created: {idea.created_at}</span>
                            {idea.due_date && <span>Due: {idea.due_date}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status badge — click to cycle */}
                          <button
                            onClick={() => canEdit && cycleStatus(idea.id)}
                            className={`px-2 py-1 rounded text-[10px] font-medium border cursor-pointer transition-colors hover:opacity-80 ${statusMeta.color}`}
                            title={canEdit ? "Click to advance status" : statusMeta.label}
                          >
                            {statusMeta.label}
                          </button>
                          {canEdit && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingIdea({ ...idea })}
                                className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteIdea(idea.id)}
                                className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Idea Dialog */}
      <Dialog open={!!editingIdea} onOpenChange={(v) => { if (!v) setEditingIdea(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Content Idea</DialogTitle>
          </DialogHeader>
          {editingIdea && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={editingIdea.title} onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={editingIdea.category} onValueChange={(v) => setEditingIdea({ ...editingIdea, category: v as Category })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={editingIdea.status} onValueChange={(v) => setEditingIdea({ ...editingIdea, status: v as IdeaStatus })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={editingIdea.priority} onValueChange={(v) => setEditingIdea({ ...editingIdea, priority: v as Priority })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input type="date" value={editingIdea.due_date} onChange={(e) => setEditingIdea({ ...editingIdea, due_date: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea value={editingIdea.notes} onChange={(e) => setEditingIdea({ ...editingIdea, notes: e.target.value })} rows={2} />
              </div>
              <Button onClick={updateIdea} className="w-full">
                <Save className="h-4 w-4 mr-1" /> Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
