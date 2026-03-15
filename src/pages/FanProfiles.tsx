import { useState, useEffect } from "react";
import { DollarSign, Clock, MessageCircle, Calendar, Briefcase, Gamepad2, MapPin, Loader2, Pencil, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Fan {
  id: string;
  name: string;
  account: string;
  ofUsername: string;
  totalSpent: number;
  lastActive: string;
  lastSpent: string;
  activeTime: string;
  spendingDays: string;
  hobbies: string;
  interests: string;
  notes: string;
  lastMessaged: string;
  payday: string;
  job: string;
  location: string;
  dateOfBirth: string;
  relationshipStatus: string;
}

function dbToFan(row: any): Fan {
  return {
    id: row.id,
    name: row.name || "",
    account: row.model_name || "",
    ofUsername: row.of_username || "",
    totalSpent: row.total_spent || 0,
    lastActive: row.last_active || "",
    lastSpent: row.last_spent || "",
    activeTime: row.active_time || "",
    spendingDays: row.spending_days || "",
    hobbies: row.hobbies || "",
    interests: row.interests || "",
    notes: row.notes || "",
    lastMessaged: row.last_messaged ? row.last_messaged.split("T")[0] : "",
    payday: row.payday || "",
    job: row.job || "",
    location: row.location || "",
    dateOfBirth: row.dob ? String(row.dob) : "",
    relationshipStatus: row.relationship_status || "",
  };
}

const MODELS = ["Ashley", "Willow", "Izzie", "Lucinda"];

const MODEL_COLORS: Record<string, string> = {
  Ashley: "330 70% 60%",
  Willow: "160 84% 39%",
  Izzie: "0 72% 55%",
  Lucinda: "270 60% 60%",
};

function needsContact(lastMessaged: string): boolean {
  if (!lastMessaged) return true;
  const diff = Date.now() - new Date(lastMessaged).getTime();
  return diff > 24 * 60 * 60 * 1000;
}

export default function FanProfiles() {
  const [fansByModel, setFansByModel] = useState<Record<string, Fan[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Fan>>({});
  const [addingModel, setAddingModel] = useState<string | null>(null);
  const [newFan, setNewFan] = useState({ name: "", ofUsername: "" });

  const fetchFans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fan_profiles")
      .select("*")
      .order("total_spent", { ascending: false });

    if (error) {
      console.error("Error fetching fans:", error);
      setLoading(false);
      return;
    }

    const grouped: Record<string, Fan[]> = {};
    MODELS.forEach(m => grouped[m] = []);

    (data || []).forEach((row: any) => {
      const fan = dbToFan(row);
      const model = MODELS.find(m => fan.account.toLowerCase().includes(m.toLowerCase()));
      if (model) {
        grouped[model].push(fan);
      }
    });

    // Top 5 per model
    Object.keys(grouped).forEach(m => {
      grouped[m] = grouped[m].slice(0, 5);
    });

    setFansByModel(grouped);
    setLoading(false);
  };

  useEffect(() => { fetchFans(); }, []);

  const startEdit = (fan: Fan) => {
    setEditingId(fan.id);
    setEditData({ ...fan });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("fan_profiles").update({
      name: editData.name,
      of_username: editData.ofUsername,
      total_spent: editData.totalSpent,
      last_active: editData.lastActive,
      last_spent: editData.lastSpent,
      active_time: editData.activeTime,
      spending_days: editData.spendingDays,
      hobbies: editData.hobbies,
      interests: editData.interests,
      notes: editData.notes,
      last_messaged: editData.lastMessaged || null,
      payday: editData.payday,
      job: editData.job,
      location: editData.location,
      dob: editData.dateOfBirth || null,
      relationship_status: editData.relationshipStatus,
    }).eq("id", editingId);

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Saved");
      setEditingId(null);
      fetchFans();
    }
  };

  const addFan = async (model: string) => {
    if (!newFan.name.trim()) return;
    const { error } = await supabase.from("fan_profiles").insert({
      name: newFan.name,
      model_name: model,
      of_username: newFan.ofUsername,
      total_spent: 0,
      tier: "regular",
    });
    if (error) {
      toast.error("Failed to add");
    } else {
      toast.success("Fan added");
      setAddingModel(null);
      setNewFan({ name: "", ofUsername: "" });
      fetchFans();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Top 5 whale spenders per model</p>
      </div>

      {MODELS.map(model => {
        const color = MODEL_COLORS[model];
        const fans = fansByModel[model] || [];

        return (
          <div key={model} className="space-y-3">
            {/* Model Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}>
                  {model.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold" style={{ color: `hsl(${color})` }}>{model}</h2>
                <span className="text-sm text-muted-foreground">({fans.length} whale{fans.length !== 1 ? "s" : ""})</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAddingModel(addingModel === model ? null : model)}>
                <Plus className="h-4 w-4 mr-1" /> Add Fan
              </Button>
            </div>

            {/* Add Fan Form */}
            {addingModel === model && (
              <div className="glass-card p-4 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input value={newFan.name} onChange={e => setNewFan(p => ({ ...p, name: e.target.value }))} placeholder="Fan name" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">OF Username</label>
                  <Input value={newFan.ofUsername} onChange={e => setNewFan(p => ({ ...p, ofUsername: e.target.value }))} placeholder="@username" />
                </div>
                <Button onClick={() => addFan(model)} size="sm">Add</Button>
                <Button variant="ghost" size="sm" onClick={() => setAddingModel(null)}><X className="h-4 w-4" /></Button>
              </div>
            )}

            {/* Fan Cards */}
            {fans.length === 0 ? (
              <div className="glass-card p-6 text-center text-muted-foreground text-sm">
                No fans added yet. Click "Add Fan" to start tracking whale spenders for {model}.
              </div>
            ) : (
              <div className="space-y-2">
                {fans.map((fan, i) => {
                  const isEditing = editingId === fan.id;
                  const contact = needsContact(fan.lastMessaged);

                  return (
                    <div key={fan.id} className="glass-card p-4" style={{ borderLeft: `3px solid hsl(${color})` }}>
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold" style={{ color: `hsl(${color})` }}>Editing: {fan.name}</span>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <div><label className="text-[10px] text-muted-foreground">Name</label><Input value={editData.name || ""} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} /></div>
                            <div><label className="text-[10px] text-muted-foreground">OF Username</label><Input value={editData.ofUsername || ""} onChange={e => setEditData(p => ({ ...p, ofUsername: e.target.value }))} /></div>
                            <div><label className="text-[10px] text-muted-foreground">Total Spent ($)</label><Input type="number" value={editData.totalSpent || 0} onChange={e => setEditData(p => ({ ...p, totalSpent: Number(e.target.value) }))} /></div>
                            <div><label className="text-[10px] text-muted-foreground">Last Messaged</label><Input type="date" value={editData.lastMessaged || ""} onChange={e => setEditData(p => ({ ...p, lastMessaged: e.target.value }))} /></div>
                            <div><label className="text-[10px] text-muted-foreground">Last Spent</label><Input value={editData.lastSpent || ""} onChange={e => setEditData(p => ({ ...p, lastSpent: e.target.value }))} placeholder="e.g. 2 days ago" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Activity Level</label><Input value={editData.activeTime || ""} onChange={e => setEditData(p => ({ ...p, activeTime: e.target.value }))} placeholder="e.g. Daily, Evenings" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Spending Days</label><Input value={editData.spendingDays || ""} onChange={e => setEditData(p => ({ ...p, spendingDays: e.target.value }))} placeholder="e.g. Fridays, Paydays" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Hobbies</label><Input value={editData.hobbies || ""} onChange={e => setEditData(p => ({ ...p, hobbies: e.target.value }))} placeholder="e.g. Football, Gaming" /></div>
                            <div><label className="text-[10px] text-muted-foreground">DOB</label><Input value={editData.dateOfBirth || ""} onChange={e => setEditData(p => ({ ...p, dateOfBirth: e.target.value }))} placeholder="e.g. 15 March 1995" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Location</label><Input value={editData.location || ""} onChange={e => setEditData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Texas, USA" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Job</label><Input value={editData.job || ""} onChange={e => setEditData(p => ({ ...p, job: e.target.value }))} placeholder="e.g. Engineer" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Relationship</label><Input value={editData.relationshipStatus || ""} onChange={e => setEditData(p => ({ ...p, relationshipStatus: e.target.value }))} placeholder="e.g. Single" /></div>
                          </div>
                          <div><label className="text-[10px] text-muted-foreground">Notes</label><Textarea value={editData.notes || ""} onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-start gap-4">
                          {/* Rank */}
                          <div className="text-2xl font-bold text-muted-foreground/40 w-8 text-center shrink-0">
                            {i + 1}
                          </div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-lg">{fan.name}</span>
                              {fan.ofUsername && <span className="text-xs text-muted-foreground">@{fan.ofUsername}</span>}
                              {fan.totalSpent >= 1000 && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">⭐ VIP</span>}
                              {contact && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full animate-pulse">Needs contact</span>}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <DollarSign className="h-3 w-3" /> Total: <span className="text-foreground font-medium">${fan.totalSpent.toLocaleString()}</span>
                              </div>
                              {fan.lastMessaged && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <MessageCircle className="h-3 w-3" /> Last msg: <span className="text-foreground">{fan.lastMessaged}</span>
                                </div>
                              )}
                              {fan.lastSpent && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="h-3 w-3" /> Last spent: <span className="text-foreground">{fan.lastSpent}</span>
                                </div>
                              )}
                              {fan.activeTime && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="h-3 w-3" /> Active: <span className="text-foreground">{fan.activeTime}</span>
                                </div>
                              )}
                              {fan.spendingDays && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <DollarSign className="h-3 w-3" /> Spends on: <span className="text-foreground">{fan.spendingDays}</span>
                                </div>
                              )}
                              {fan.hobbies && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Gamepad2 className="h-3 w-3" /> Hobbies: <span className="text-foreground">{fan.hobbies}</span>
                                </div>
                              )}
                              {fan.job && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Briefcase className="h-3 w-3" /> Job: <span className="text-foreground">{fan.job}</span>
                                </div>
                              )}
                              {fan.location && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <MapPin className="h-3 w-3" /> Location: <span className="text-foreground">{fan.location}</span>
                                </div>
                              )}
                              {fan.dateOfBirth && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="h-3 w-3" /> DOB: <span className="text-foreground">{fan.dateOfBirth}</span>
                                </div>
                              )}
                              {fan.relationshipStatus && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  ❤️ <span className="text-foreground">{fan.relationshipStatus}</span>
                                </div>
                              )}
                            </div>

                            {fan.notes && (
                              <p className="text-xs text-muted-foreground mt-2 italic">📝 {fan.notes}</p>
                            )}
                          </div>

                          {/* Edit Button */}
                          <Button variant="ghost" size="sm" onClick={() => startEdit(fan)} className="shrink-0">
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
