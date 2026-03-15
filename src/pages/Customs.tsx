import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, Check, Clock, Pencil, Trash2, DollarSign, CalendarClock, AlertTriangle, Loader2 } from "lucide-react";
import { modelColors } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomOrder {
  id: string;
  description: string;
  detailedDescription: string;
  price: number;
  deadline: string;
  fanOfUsername: string;
  status: "pending" | "complete";
  dateRequested: string;
  fanName: string;
  model: string;
}

type FilterStatus = "all" | "pending" | "complete";

const MODELS = ["Ashley", "Willow", "Izzie", "Lucinda"];

const modelColorMap: Record<string, string> = {
  "Ashley": modelColors["Ashley Morris"] || "330 70% 60%",
  "Willow": modelColors["Willow"] || "160 84% 39%",
  "Izzie": modelColors["Izzy"] || "0 72% 55%",
  "Lucinda": modelColors["Lucinda Bleu"] || "270 60% 60%",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  complete: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  complete: <Check className="h-3 w-3" />,
};

function getDeadlineColor(deadline: string): string {
  if (!deadline) return "text-muted-foreground";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline + "T00:00:00");
  const diff = dl.getTime() - today.getTime();
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  if (daysDiff < 0) return "text-red-400";
  if (daysDiff < 1) return "text-yellow-400";
  return "text-green-400";
}

function getDeadlineBg(deadline: string): string {
  if (!deadline) return "bg-muted/20";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline + "T00:00:00");
  const diff = dl.getTime() - today.getTime();
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  if (daysDiff < 0) return "bg-red-500/10 border-red-500/30";
  if (daysDiff < 1) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-green-500/10 border-green-500/30";
}

function dbToCustom(row: any): CustomOrder {
  return {
    id: row.id,
    description: row.description || "",
    detailedDescription: row.detailed_description || "",
    price: row.price || 0,
    deadline: row.deadline || "",
    fanOfUsername: row.fan_username || "",
    status: row.status === "complete" ? "complete" : "pending",
    dateRequested: row.created_at ? row.created_at.split("T")[0] : "",
    fanName: row.fan_name || "",
    model: row.model_name || "",
  };
}

export default function Customs() {
  const { user } = useAuth();
  const canEdit = user && ['admin', 'supervisor', 'data_entry'].includes(user.role);
  const [customs, setCustoms] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [collapsedModels, setCollapsedModels] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("customs-collapsed");
    return saved ? JSON.parse(saved) : {};
  });
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [newDesc, setNewDesc] = useState("");
  const [newDetailedDesc, setNewDetailedDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newFanOfUsername, setNewFanOfUsername] = useState("");
  const [newFan, setNewFan] = useState("");

  // Edit state
  const [editDesc, setEditDesc] = useState("");
  const [editDetailedDesc, setEditDetailedDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editFanOfUsername, setEditFanOfUsername] = useState("");
  const [editFan, setEditFan] = useState("");
  const [editStatus, setEditStatus] = useState<CustomOrder["status"]>("pending");

  // Fetch customs from DB
  const fetchCustoms = async () => {
    const { data, error } = await supabase
      .from("customs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching customs:", error);
      toast.error("Failed to load customs");
    } else {
      setCustoms((data || []).map(dbToCustom));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustoms();
  }, []);

  const toggleModel = (model: string) => {
    setCollapsedModels(prev => {
      const updated = { ...prev, [model]: !prev[model] };
      localStorage.setItem("customs-collapsed", JSON.stringify(updated));
      return updated;
    });
  };

  const addCustom = async (model: string) => {
    if (!newDesc.trim() || !newFan.trim()) return;
    const { data, error } = await supabase.from("customs").insert({
      description: newDesc.trim(),
      detailed_description: newDetailedDesc.trim(),
      price: parseFloat(newPrice) || 0,
      deadline: newDeadline || null,
      fan_username: newFanOfUsername.trim(),
      fan_name: newFan.trim(),
      model_name: model,
      status: "pending",
    } as any).select().single();

    if (error) {
      console.error("Error adding custom:", error);
      toast.error("Failed to add custom");
      return;
    }
    setCustoms(prev => [dbToCustom(data), ...prev]);
    setNewDesc("");
    setNewDetailedDesc("");
    setNewPrice("");
    setNewDeadline("");
    setNewFanOfUsername("");
    setNewFan("");
    setAddingTo(null);
    toast.success("Custom added");
  };

  const updateStatus = async (id: string, status: CustomOrder["status"]) => {
    const { error } = await supabase.from("customs").update({ status, updated_at: new Date().toISOString() } as any).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setCustoms(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const startEdit = (custom: CustomOrder) => {
    setEditingId(custom.id);
    setEditDesc(custom.description);
    setEditDetailedDesc(custom.detailedDescription || "");
    setEditPrice(custom.price ? custom.price.toString() : "");
    setEditDeadline(custom.deadline || "");
    setEditFanOfUsername(custom.fanOfUsername || "");
    setEditFan(custom.fanName);
    setEditStatus(custom.status);
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("customs").update({
      description: editDesc,
      detailed_description: editDetailedDesc,
      price: parseFloat(editPrice) || 0,
      deadline: editDeadline || null,
      fan_username: editFanOfUsername,
      fan_name: editFan,
      status: editStatus,
      updated_at: new Date().toISOString(),
    } as any).eq("id", id);

    if (error) {
      toast.error("Failed to save edit");
      return;
    }
    setCustoms(prev => prev.map(c => c.id === id ? {
      ...c,
      description: editDesc,
      detailedDescription: editDetailedDesc,
      price: parseFloat(editPrice) || 0,
      deadline: editDeadline,
      fanOfUsername: editFanOfUsername,
      fanName: editFan,
      status: editStatus,
    } : c));
    setEditingId(null);
    toast.success("Custom updated");
  };

  const deleteCustom = async (id: string) => {
    const { error } = await supabase.from("customs").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete custom");
      return;
    }
    setCustoms(prev => prev.filter(c => c.id !== id));
    toast.success("Custom deleted");
  };

  const getModelCustoms = (model: string) => {
    let filtered = customs.filter(c => c.model === model);
    if (filterStatus !== "all") {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    return filtered;
  };

  const getAllModelCustoms = (model: string) => customs.filter(c => c.model === model);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customs Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Track custom content orders by model</p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
          {(["all", "pending", "complete"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {status === "all" ? "All" : status === "pending" ? "Pending" : "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MODELS.map(model => {
          const modelCustoms = getAllModelCustoms(model);
          const pending = modelCustoms.filter(c => c.status === "pending").length;
          const complete = modelCustoms.filter(c => c.status === "complete").length;
          const totalRevenue = modelCustoms.reduce((sum, c) => sum + (c.price || 0), 0);
          const color = modelColorMap[model];
          return (
            <div key={model} className="glass-card p-4" style={{ borderColor: `hsl(${color} / 0.2)` }}>
              <p className="text-sm font-medium" style={{ color: `hsl(${color})` }}>{model}</p>
              <p className="text-2xl font-bold mt-1">{modelCustoms.length}</p>
              <p className="text-[10px] text-muted-foreground">{pending} pending · {complete} complete</p>
              {totalRevenue > 0 && (
                <p className="text-xs font-semibold mt-1 text-green-400">${totalRevenue.toLocaleString()}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Model sections */}
      {MODELS.map(model => {
        const modelCustoms = getModelCustoms(model);
        const allModelCustoms = getAllModelCustoms(model);
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
                <p className="text-xs text-muted-foreground">
                  {modelCustoms.length} customs{filterStatus !== "all" ? ` (${filterStatus})` : ""} · {allModelCustoms.length} total
                </p>
              </div>
              {isCollapsed ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronUp className="h-5 w-5 text-muted-foreground" />}
            </button>

            {!isCollapsed && (
              <div className="space-y-2 pl-12">
                {modelCustoms.length === 0 && (
                  <p className="text-sm text-muted-foreground py-3">
                    {filterStatus !== "all" ? `No ${filterStatus} customs for ${model}` : `No customs for ${model}`}
                  </p>
                )}

                {modelCustoms.map(custom => (
                  <div key={custom.id} className="glass-card p-4 group">
                    {editingId === custom.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="Short description"
                          className="h-8 text-sm"
                        />
                        <Textarea
                          value={editDetailedDesc}
                          onChange={e => setEditDetailedDesc(e.target.value)}
                          placeholder="Detailed description — exactly what the fan wants..."
                          className="text-sm min-h-[60px]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={editFan}
                            onChange={e => setEditFan(e.target.value)}
                            placeholder="Fan name"
                            className="h-8 text-sm"
                          />
                          <Input
                            value={editFanOfUsername}
                            onChange={e => setEditFanOfUsername(e.target.value)}
                            placeholder="OF @ username"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            placeholder="Price ($)"
                            className="h-8 text-sm"
                          />
                          <Input
                            type="date"
                            value={editDeadline}
                            onChange={e => setEditDeadline(e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Select value={editStatus} onValueChange={(v: CustomOrder["status"]) => setEditStatus(v)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
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
                        <span className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border ${statusColors[custom.status]}`}>
                          {statusIcons[custom.status]}
                          {custom.status}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{custom.description}</p>
                            {custom.price > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-sm font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                                <DollarSign className="h-3 w-3" />{custom.price}
                              </span>
                            )}
                          </div>

                          {custom.detailedDescription && (
                            <p className="text-xs text-muted-foreground mt-1.5 bg-secondary/30 p-2 rounded">
                              {custom.detailedDescription}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span>Fan: <strong className="text-foreground">{custom.fanName}</strong></span>
                            {custom.fanOfUsername && (
                              <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                                {custom.fanOfUsername}
                              </span>
                            )}
                            <span>Requested: {custom.dateRequested}</span>
                            {custom.deadline && (
                              <span className={`inline-flex items-center gap-1 font-medium ${getDeadlineColor(custom.deadline)} ${getDeadlineBg(custom.deadline)} px-1.5 py-0.5 rounded border`}>
                                <CalendarClock className="h-3 w-3" />
                                Due: {custom.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                        {canEdit && (
                          <div className="flex gap-1 shrink-0">
                            {custom.status === "pending" ? (
                              <button onClick={() => updateStatus(custom.id, "complete")} className="px-2 py-1 rounded-md bg-green-500/20 hover:bg-green-500/40 transition-colors text-green-400 text-xs font-medium flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Complete
                              </button>
                            ) : (
                              <button onClick={() => updateStatus(custom.id, "pending")} className="px-2 py-1 rounded-md bg-yellow-500/20 hover:bg-yellow-500/40 transition-colors text-yellow-400 text-xs font-medium flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> Reopen
                              </button>
                            )}
                            <button onClick={() => startEdit(custom)} className="p-1.5 rounded-md hover:bg-secondary transition-colors" title="Edit">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteCustom(custom.id)} className="px-2 py-1 rounded-md bg-destructive/20 hover:bg-destructive/40 transition-colors text-destructive text-xs font-medium flex items-center gap-1" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add new custom — only for admin/supervisor/data_entry */}
                {canEdit && addingTo === model ? (
                  <div className="glass-card p-4 space-y-3">
                    <Input
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder="Short description..."
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Textarea
                      value={newDetailedDesc}
                      onChange={e => setNewDetailedDesc(e.target.value)}
                      placeholder="Detailed description — exactly what the fan wants..."
                      className="text-sm min-h-[60px]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={newFan}
                        onChange={e => setNewFan(e.target.value)}
                        placeholder="Fan name"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={newFanOfUsername}
                        onChange={e => setNewFanOfUsername(e.target.value)}
                        placeholder="OF @ username"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        placeholder="Price ($)"
                        className="h-8 text-sm"
                      />
                      <Input
                        type="date"
                        value={newDeadline}
                        onChange={e => setNewDeadline(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => addCustom(model)} className="h-8">Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setAddingTo(null); setNewDesc(""); setNewDetailedDesc(""); setNewPrice(""); setNewDeadline(""); setNewFanOfUsername(""); setNewFan(""); }} className="h-8">Cancel</Button>
                    </div>
                  </div>
                ) : canEdit ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingTo(model)}
                    className="w-full h-8 text-xs border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Custom
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
