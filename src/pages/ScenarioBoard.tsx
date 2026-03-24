import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, X, Search, MessageCircle, Clock, CheckCircle, Archive, Sparkles } from "lucide-react";

interface Scenario {
  id: string;
  model: string;
  text: string;
  category: "casual" | "flirty" | "evening" | "weekend" | "spicy";
  status: "available" | "in_use" | "cooldown" | "archived";
  oneTimeOnly: boolean;
  usedBy: string | null;
  usedAt: string | null;
  cooldownUntil: string | null;
  createdBy: string;
  createdAt: string;
}

const STORAGE_KEY = "scenario-board-v1";
const MODELS = ["Ashley Morris", "Lucinda Bleu", "Izzy", "Willow"];
const CATEGORIES = [
  { value: "casual", label: "Casual/Daytime", emoji: "☀️" },
  { value: "flirty", label: "Flirty", emoji: "😏" },
  { value: "evening", label: "Evening", emoji: "🌙" },
  { value: "weekend", label: "Weekend", emoji: "🎉" },
  { value: "spicy", label: "Spicy", emoji: "🔥" },
];

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/20 text-green-300 border-green-500/30",
  in_use: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  cooldown: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  archived: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  available: "✅ Available",
  in_use: "🟠 In Use",
  cooldown: "⏳ Cooldown",
  archived: "📁 Archived",
};

const CATEGORY_COLORS: Record<string, string> = {
  casual: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  flirty: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  evening: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  weekend: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  spicy: "bg-red-500/20 text-red-300 border-red-500/30",
};

const COOLDOWN_DAYS = 14;

export default function ScenarioBoard() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor" || user?.role === "data_entry";
  const isChatter = user?.role === "chatter";

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterModel, setFilterModel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("available");
  const [search, setSearch] = useState("");

  const [formModel, setFormModel] = useState("");
  const [formText, setFormText] = useState("");
  const [formCategory, setFormCategory] = useState<Scenario["category"]>("casual");
  const [formOneTime, setFormOneTime] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let data: Scenario[] = JSON.parse(saved);
        // Auto-release cooldowns that have expired
        const today = new Date().toISOString().split("T")[0];
        data = data.map(s => {
          if (s.status === "cooldown" && s.cooldownUntil && s.cooldownUntil <= today) {
            return { ...s, status: "available" as const, usedBy: null, usedAt: null, cooldownUntil: null };
          }
          return s;
        });
        setScenarios(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch { setScenarios([]); }
    }
  }, []);

  const save = useCallback((data: Scenario[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setScenarios(data);
  }, []);

  const addScenario = () => {
    if (!formModel || !formText.trim()) return;
    const scenario: Scenario = {
      id: Date.now().toString(),
      model: formModel,
      text: formText.trim(),
      category: formCategory,
      status: "available",
      oneTimeOnly: formOneTime,
      usedBy: null,
      usedAt: null,
      cooldownUntil: null,
      createdBy: user?.username || "Unknown",
      createdAt: new Date().toISOString().split("T")[0],
    };
    save([scenario, ...scenarios]);
    setFormText("");
    setFormOneTime(false);
  };

  const claimScenario = (id: string) => {
    save(scenarios.map(s => s.id === id ? {
      ...s,
      status: "in_use" as const,
      usedBy: user?.displayName || user?.username || "Unknown",
      usedAt: new Date().toISOString().split("T")[0],
    } : s));
  };

  const releaseScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    if (scenario.oneTimeOnly) {
      save(scenarios.map(s => s.id === id ? { ...s, status: "archived" as const } : s));
    } else {
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() + COOLDOWN_DAYS);
      save(scenarios.map(s => s.id === id ? {
        ...s,
        status: "cooldown" as const,
        cooldownUntil: cooldownDate.toISOString().split("T")[0],
      } : s));
    }
  };

  const deleteScenario = (id: string) => {
    save(scenarios.filter(s => s.id !== id));
  };

  // Filtering
  let filtered = scenarios;
  if (filterModel !== "all") filtered = filtered.filter(s => s.model === filterModel);
  if (filterCategory !== "all") filtered = filtered.filter(s => s.category === filterCategory);
  if (filterStatus !== "all") filtered = filtered.filter(s => s.status === filterStatus);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => s.text.toLowerCase().includes(q));
  }

  // Stats per model
  const getModelStats = (model: string) => {
    const ms = scenarios.filter(s => s.model === model);
    return {
      total: ms.length,
      available: ms.filter(s => s.status === "available").length,
      inUse: ms.filter(s => s.status === "in_use").length,
      cooldown: ms.filter(s => s.status === "cooldown").length,
    };
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            Scenario Board
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pre-written scenarios for chatters — "what are you up to?" answers that hook fans
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Add Scenario"}
          </Button>
        )}
      </div>

      {/* Model Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MODELS.map(model => {
          const stats = getModelStats(model);
          const shortName = model.split(" ")[0];
          return (
            <div key={model} className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setFilterModel(filterModel === model ? "all" : model)}>
              <p className="text-[10px] text-muted-foreground uppercase">{shortName}</p>
              <p className="text-2xl font-bold">{stats.available}<span className="text-sm text-muted-foreground">/{stats.total}</span></p>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] text-green-400">✅ {stats.available}</span>
                <span className="text-[10px] text-orange-400">🟠 {stats.inUse}</span>
                <span className="text-[10px] text-zinc-400">⏳ {stats.cooldown}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">New Scenario</h3>
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
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Category</label>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value as Scenario["category"])}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formOneTime} onChange={e => setFormOneTime(e.target.checked)}
                  className="rounded border-input" />
                One-time only (archives after use)
              </label>
            </div>
          </div>
          <Textarea value={formText} onChange={e => setFormText(e.target.value)}
            placeholder="Write the scenario as the model would say it... make it exciting, give the fan a hook to respond to!"
            className="min-h-[100px]" />
          <div className="flex gap-2">
            <Button onClick={addScenario} disabled={!formModel || !formText.trim()}>Add Scenario</Button>
            <Button variant="outline" onClick={() => { setFormText(""); setFormOneTime(false); }}>Clear</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search scenarios..." className="pl-9" />
        </div>
        <select value={filterModel} onChange={e => setFilterModel(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Models</option>
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Statuses</option>
          <option value="available">✅ Available</option>
          <option value="in_use">🟠 In Use</option>
          <option value="cooldown">⏳ Cooldown</option>
          <option value="archived">📁 Archived</option>
        </select>
      </div>

      {/* Scenario count */}
      <p className="text-sm text-muted-foreground">{filtered.length} scenario{filtered.length !== 1 ? "s" : ""} shown</p>

      {/* Scenarios List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">No scenarios found. {canManage ? "Add some!" : "Check back soon."}</p>
          </div>
        ) : (
          filtered.map(scenario => {
            const catInfo = CATEGORIES.find(c => c.value === scenario.category);
            return (
              <div key={scenario.id} className={`glass-card p-4 ${scenario.status === "available" ? "border-green-500/20" : scenario.status === "in_use" ? "border-orange-500/20" : "opacity-60"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{catInfo?.emoji || "💬"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {scenario.model.split(" ")[0]}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[scenario.category]}`}>
                        {catInfo?.label}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[scenario.status]}`}>
                        {STATUS_LABELS[scenario.status]}
                      </Badge>
                      {scenario.oneTimeOnly && (
                        <Badge variant="outline" className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/30">
                          ⚡ One-time
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{scenario.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>Added by {scenario.createdBy} · {scenario.createdAt}</span>
                      {scenario.usedBy && <span>Used by <strong>{scenario.usedBy}</strong> on {scenario.usedAt}</span>}
                      {scenario.cooldownUntil && <span>Available again: {scenario.cooldownUntil}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {scenario.status === "available" && (isChatter || canManage) && (
                      <Button size="sm" variant="outline" className="text-green-400 border-green-500/30 h-8"
                        onClick={() => claimScenario(scenario.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Use
                      </Button>
                    )}
                    {scenario.status === "in_use" && (
                      <Button size="sm" variant="outline" className="text-orange-400 border-orange-500/30 h-8"
                        onClick={() => releaseScenario(scenario.id)}>
                        <Clock className="h-3 w-3 mr-1" /> Done
                      </Button>
                    )}
                    {canManage && (
                      <Button size="sm" variant="ghost" className="text-red-400 h-8 w-8 p-0"
                        onClick={() => deleteScenario(scenario.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
