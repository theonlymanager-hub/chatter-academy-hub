import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, X, Lightbulb, Camera, Video, Image, Star } from "lucide-react";

interface ContentIdea {
  id: string;
  model: string;
  type: "ppv" | "mass_message" | "custom" | "shoot" | "social";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "idea" | "planned" | "shot" | "published";
  createdBy: string;
  createdAt: string;
}

const STORAGE_KEY = "content-ideas-data";
const MODELS = ["Izzy", "Willow", "Lucinda Bleu", "Ashley Morris"];
const TYPES = [
  { value: "ppv", label: "PPV", icon: "💰" },
  { value: "mass_message", label: "Mass Message", icon: "📨" },
  { value: "custom", label: "Custom", icon: "🎯" },
  { value: "shoot", label: "Shoot Concept", icon: "📸" },
  { value: "social", label: "Social/Reel", icon: "📱" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-300 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  idea: "bg-purple-500/20 text-purple-300",
  planned: "bg-blue-500/20 text-blue-300",
  shot: "bg-orange-500/20 text-orange-300",
  published: "bg-green-500/20 text-green-300",
};

export default function ContentIdeas() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor";

  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterModel, setFilterModel] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [formModel, setFormModel] = useState("");
  const [formType, setFormType] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState<"high" | "medium" | "low">("medium");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setIdeas(JSON.parse(saved)); } catch { setIdeas([]); }
    }
  }, []);

  const save = useCallback((data: ContentIdea[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setIdeas(data);
  }, []);

  const addIdea = () => {
    if (!formModel || !formType || !formTitle) return;
    const idea: ContentIdea = {
      id: Date.now().toString(),
      model: formModel,
      type: formType as ContentIdea["type"],
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      status: "idea",
      createdBy: user?.username || "Unknown",
      createdAt: new Date().toISOString().split("T")[0],
    };
    save([idea, ...ideas]);
    setFormTitle("");
    setFormDesc("");
    setShowForm(false);
  };

  const updateStatus = (id: string, status: ContentIdea["status"]) => {
    save(ideas.map(i => i.id === id ? { ...i, status } : i));
  };

  const deleteIdea = (id: string) => {
    save(ideas.filter(i => i.id !== id));
  };

  let filtered = ideas;
  if (filterModel !== "all") filtered = filtered.filter(i => i.model === filterModel);
  if (filterType !== "all") filtered = filtered.filter(i => i.type === filterType);

  const byModel: Record<string, ContentIdea[]> = {};
  MODELS.forEach(m => { byModel[m] = filtered.filter(i => i.model === m); });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Ideas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            PPV concepts, shoot lists, mass message ideas — per model
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Add Idea"}
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Total Ideas</p>
          <p className="text-2xl font-bold">{ideas.length}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">To Shoot</p>
          <p className="text-2xl font-bold text-orange-400">{ideas.filter(i => i.status === "planned").length}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Shot</p>
          <p className="text-2xl font-bold text-blue-400">{ideas.filter(i => i.status === "shot").length}</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Published</p>
          <p className="text-2xl font-bold text-green-400">{ideas.filter(i => i.status === "published").length}</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">New Content Idea</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model</label>
              <select value={formModel} onChange={e => setFormModel(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select model...</option>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Type</label>
              <select value={formType} onChange={e => setFormType(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select type...</option>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Priority</label>
              <select value={formPriority} onChange={e => setFormPriority(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>
          </div>
          <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Idea title (e.g. 'Shower tease → PPV full video')" />
          <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
            placeholder="Describe the concept, what content is needed, target fan segment..."
            className="min-h-[80px]" />
          <Button onClick={addIdea} disabled={!formModel || !formType || !formTitle}>Add Idea</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterModel} onChange={e => setFilterModel(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Models</option>
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
      </div>

      {/* Ideas by Model */}
      {(filterModel === "all" ? MODELS : [filterModel]).map(model => {
        const modelIdeas = byModel[model] || [];
        if (modelIdeas.length === 0 && filterModel !== "all") return null;
        return (
          <div key={model} className="space-y-2">
            <h2 className="text-lg font-bold border-b border-border/30 pb-1">{model}
              <span className="text-sm font-normal text-muted-foreground ml-2">{modelIdeas.length} ideas</span>
            </h2>
            {modelIdeas.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic py-2">No ideas yet for {model}</p>
            ) : (
              modelIdeas.map(idea => {
                const typeInfo = TYPES.find(t => t.value === idea.type);
                return (
                  <div key={idea.id} className="glass-card p-4 flex items-start gap-3">
                    <span className="text-xl mt-0.5">{typeInfo?.icon || "📋"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{idea.title}</span>
                        <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[idea.priority]}`}>
                          {idea.priority}
                        </Badge>
                        <Badge className={`text-[10px] ${STATUS_COLORS[idea.status]}`}>
                          {idea.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{idea.createdAt}</span>
                      </div>
                      {idea.description && (
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex gap-1 shrink-0">
                        <select
                          value={idea.status}
                          onChange={e => updateStatus(idea.id, e.target.value as ContentIdea["status"])}
                          className="bg-secondary border border-border/30 rounded px-2 py-1 text-[10px]"
                        >
                          <option value="idea">💡 Idea</option>
                          <option value="planned">📋 Planned</option>
                          <option value="shot">📸 Shot</option>
                          <option value="published">✅ Published</option>
                        </select>
                        <Button size="sm" variant="ghost" className="text-red-400 h-7 w-7 p-0" onClick={() => deleteIdea(idea.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
