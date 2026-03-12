import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Check, Clock, Pencil, Trash2 } from "lucide-react";
import { modelColors } from "@/lib/mock-data";

interface CustomOrder {
  id: string;
  description: string;
  status: "pending" | "in-progress" | "complete";
  dateRequested: string;
  fanName: string;
  model: string;
}

const STORAGE_KEY = "the-only-board-customs";

const MODELS = ["Ashley", "Willow", "Izzie", "Lucinda"];

const modelColorMap: Record<string, string> = {
  "Ashley": modelColors["Ashley Morris"] || "330 70% 60%",
  "Willow": modelColors["Willow"] || "160 84% 39%",
  "Izzie": modelColors["Izzy"] || "0 72% 55%",
  "Lucinda": modelColors["Lucinda Bleu"] || "270 60% 60%",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  complete: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  "in-progress": <Pencil className="h-3 w-3" />,
  complete: <Check className="h-3 w-3" />,
};

export default function Customs() {
  const [customs, setCustoms] = useState<CustomOrder[]>([]);
  const [collapsedModels, setCollapsedModels] = useState<Record<string, boolean>>({});
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [newDesc, setNewDesc] = useState("");
  const [newFan, setNewFan] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFan, setEditFan] = useState("");
  const [editStatus, setEditStatus] = useState<CustomOrder["status"]>("pending");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCustoms(JSON.parse(saved));
    } else {
      // Placeholder data
      setCustoms([
        { id: "1", description: "Solo shower video - 5 min", status: "pending", dateRequested: "2026-03-10", fanName: "Patrick", model: "Ashley" },
        { id: "2", description: "Feet pics in red heels", status: "in-progress", dateRequested: "2026-03-09", fanName: "Jay41", model: "Willow" },
        { id: "3", description: "Military roleplay video - 3 min", status: "pending", dateRequested: "2026-03-11", fanName: "Nate", model: "Izzie" },
        { id: "4", description: "Goth candlelit photoshoot", status: "complete", dateRequested: "2026-03-08", fanName: "Zaza", model: "Lucinda" },
        { id: "5", description: "Lingerie try-on haul", status: "pending", dateRequested: "2026-03-12", fanName: "Derek", model: "Ashley" },
        { id: "6", description: "JOI video - dom tone", status: "in-progress", dateRequested: "2026-03-10", fanName: "DEVO", model: "Izzie" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (customs.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
    }
  }, [customs]);

  const toggleModel = (model: string) => {
    setCollapsedModels(prev => ({ ...prev, [model]: !prev[model] }));
  };

  const addCustom = (model: string) => {
    if (!newDesc.trim() || !newFan.trim()) return;
    const custom: CustomOrder = {
      id: Date.now().toString(),
      description: newDesc.trim(),
      status: "pending",
      dateRequested: new Date().toISOString().split("T")[0],
      fanName: newFan.trim(),
      model,
    };
    setCustoms(prev => [...prev, custom]);
    setNewDesc("");
    setNewFan("");
    setAddingTo(null);
  };

  const updateStatus = (id: string, status: CustomOrder["status"]) => {
    setCustoms(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const startEdit = (custom: CustomOrder) => {
    setEditingId(custom.id);
    setEditDesc(custom.description);
    setEditFan(custom.fanName);
    setEditStatus(custom.status);
  };

  const saveEdit = (id: string) => {
    setCustoms(prev => prev.map(c => c.id === id ? { ...c, description: editDesc, fanName: editFan, status: editStatus } : c));
    setEditingId(null);
  };

  const deleteCustom = (id: string) => {
    setCustoms(prev => prev.filter(c => c.id !== id));
  };

  const getModelCustoms = (model: string) => customs.filter(c => c.model === model);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customs Board</h1>
        <p className="text-muted-foreground text-sm mt-1">Track custom content orders by model</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MODELS.map(model => {
          const modelCustoms = getModelCustoms(model);
          const pending = modelCustoms.filter(c => c.status === "pending").length;
          const inProgress = modelCustoms.filter(c => c.status === "in-progress").length;
          const color = modelColorMap[model];
          return (
            <div key={model} className="glass-card p-4" style={{ borderColor: `hsl(${color} / 0.2)` }}>
              <p className="text-sm font-medium" style={{ color: `hsl(${color})` }}>{model}</p>
              <p className="text-2xl font-bold mt-1">{modelCustoms.length}</p>
              <p className="text-[10px] text-muted-foreground">{pending} pending · {inProgress} in progress</p>
            </div>
          );
        })}
      </div>

      {/* Model sections */}
      {MODELS.map(model => {
        const modelCustoms = getModelCustoms(model);
        const color = modelColorMap[model];
        const isCollapsed = collapsedModels[model];

        return (
          <div key={model} className="space-y-3">
            <button
              onClick={() => toggleModel(model)}
              className="flex items-center gap-3 w-full text-left"
            >
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
              >
                {model.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold" style={{ color: `hsl(${color})` }}>
                  {model}
                </h2>
                <p className="text-xs text-muted-foreground">{modelCustoms.length} customs</p>
              </div>
              {isCollapsed ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronUp className="h-5 w-5 text-muted-foreground" />}
            </button>

            {!isCollapsed && (
              <div className="space-y-2 pl-12">
                {modelCustoms.length === 0 && (
                  <p className="text-sm text-muted-foreground py-3">No customs for {model}</p>
                )}

                {modelCustoms.map(custom => (
                  <div key={custom.id} className="glass-card p-4 group">
                    {editingId === custom.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="Description"
                          className="h-8 text-sm"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={editFan}
                            onChange={e => setEditFan(e.target.value)}
                            placeholder="Fan name"
                            className="h-8 text-sm flex-1"
                          />
                          <Select value={editStatus} onValueChange={(v: CustomOrder["status"]) => setEditStatus(v)}>
                            <SelectTrigger className="h-8 text-xs w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="complete">Complete</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(custom.id)} className="h-7 text-xs">Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => {
                            const next = custom.status === "pending" ? "in-progress" : custom.status === "in-progress" ? "complete" : "pending";
                            updateStatus(custom.id, next);
                          }}
                          className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border ${statusColors[custom.status]} hover:opacity-80 transition-opacity`}
                          title="Click to cycle status"
                        >
                          {statusIcons[custom.status]}
                          {custom.status}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{custom.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Fan: <strong className="text-foreground">{custom.fanName}</strong></span>
                            <span>Requested: {custom.dateRequested}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(custom)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => deleteCustom(custom.id)} className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add new custom */}
                {addingTo === model ? (
                  <div className="glass-card p-4 space-y-3">
                    <Input
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder="Custom description..."
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Input
                        value={newFan}
                        onChange={e => setNewFan(e.target.value)}
                        placeholder="Fan name"
                        className="h-8 text-sm flex-1"
                        onKeyDown={e => e.key === "Enter" && addCustom(model)}
                      />
                      <Button size="sm" onClick={() => addCustom(model)} className="h-8">Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setAddingTo(null); setNewDesc(""); setNewFan(""); }} className="h-8">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingTo(model)}
                    className="w-full h-8 text-xs border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Custom
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
