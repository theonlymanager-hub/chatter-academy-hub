import { useState, useEffect } from "react";
import { MessageCircle, Clock, Calendar, Briefcase, MapPin, Loader2, Pencil, Save, X, Plus, ExternalLink, AlertTriangle } from "lucide-react";
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
  lastMessaged: string;
  activeTime: string;
  payday: string;
  personality: string;
  hobbies: string;
  interests: string;
  notes: string;
  job: string;
  location: string;
  dateOfBirth: string;
  relationshipStatus: string;
  tier: string;
  fanType: string;
  tags: string;
  lastSpent: string;
}

function dbToFan(row: any): Fan {
  return {
    id: row.id,
    name: row.name || "",
    account: row.model_name || "",
    ofUsername: row.of_username || "",
    totalSpent: row.total_spent || 0,
    lastMessaged: row.last_messaged ? row.last_messaged.split("T")[0] : "",
    activeTime: row.active_time || "",
    payday: row.payday || "",
    personality: row.personality || "",
    hobbies: row.hobbies || "",
    interests: row.interests || "",
    notes: row.notes || "",
    job: row.job || "",
    location: row.location || "",
    dateOfBirth: row.dob ? String(row.dob) : "",
    relationshipStatus: row.relationship_status || "",
    tier: row.tier || "regular",
    fanType: row.interests || "",
    tags: row.hobbies || "",
    lastSpent: row.last_active || "",
  };
}

const MODELS = ["Ashley", "Willow", "Izzie", "Lucinda"];

const MODEL_COLORS: Record<string, string> = {
  Ashley: "hsl(330, 70%, 60%)",
  Willow: "hsl(160, 84%, 39%)",
  Izzie: "hsl(0, 72%, 55%)",
  Lucinda: "hsl(270, 60%, 60%)",
};

function needsContact(lastMessaged: string): boolean {
  if (!lastMessaged) return true;
  const diff = Date.now() - new Date(lastMessaged).getTime();
  return diff > 24 * 60 * 60 * 1000;
}

function formatDate(d: string): string {
  if (!d) return "Never";
  const date = new Date(d);
  return date.toLocaleDateString("en-GB");
}

export default function FanProfiles() {
  const [fansByModel, setFansByModel] = useState<Record<string, Fan[]>>({});
  const [totalsByModel, setTotalsByModel] = useState<Record<string, number>>({});
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
    const totals: Record<string, number> = {};
    MODELS.forEach(m => { grouped[m] = []; totals[m] = 0; });

    (data || []).forEach((row: any) => {
      const fan = dbToFan(row);
      const model = MODELS.find(m => fan.account.toLowerCase().includes(m.toLowerCase()));
      if (model) {
        totals[model] += fan.totalSpent;
        grouped[model].push(fan);
      }
    });

    // Top 5 per model
    Object.keys(grouped).forEach(m => {
      grouped[m] = grouped[m].slice(0, 5);
    });

    setFansByModel(grouped);
    setTotalsByModel(totals);
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
      active_time: editData.activeTime,
      hobbies: editData.tags || editData.hobbies,
      interests: editData.fanType || editData.interests,
      personality: editData.personality,
      notes: editData.notes,
      last_messaged: editData.lastMessaged || null,
      payday: editData.payday,
      job: editData.job,
      location: editData.location,
      dob: editData.dateOfBirth || null,
      relationship_status: editData.relationshipStatus,
      last_active: editData.lastSpent,
    }).eq("id", editingId);

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Saved");
      setEditingId(null);
      fetchFans();
    }
  };

  const markMessaged = async (fanId: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("fan_profiles").update({ last_messaged: now }).eq("id", fanId);
    if (!error) {
      toast.success("Marked as messaged today");
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
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Top whale spenders per model — chatters check here for VIP treatment</p>
      </div>

      {MODELS.map(model => {
        const color = MODEL_COLORS[model];
        const fans = fansByModel[model] || [];
        const totalLifetime = totalsByModel[model] || 0;

        return (
          <div key={model} className="space-y-3">
            {/* Model Header */}
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: color }}>
                  {model.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{model}</h2>
                  <p className="text-xs text-muted-foreground">Top 5 fans · ${totalLifetime.toLocaleString()} lifetime</p>
                </div>
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
                No fans tracked yet for {model}. Click "Add Fan" or data will populate from whale checks.
              </div>
            ) : (
              <div className="space-y-2">
                {fans.map((fan, i) => {
                  const isEditing = editingId === fan.id;
                  const contact = needsContact(fan.lastMessaged);
                  const isWhale = fan.totalSpent >= 500;
                  const isVip = fan.totalSpent >= 1000;

                  return (
                    <div key={fan.id} className="glass-card p-4 hover:border-border/40 transition-colors">
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold">Editing: {fan.name}</span>
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
                            <div><label className="text-[10px] text-muted-foreground">Active Time</label><Input value={editData.activeTime || ""} onChange={e => setEditData(p => ({ ...p, activeTime: e.target.value }))} placeholder="e.g. Evenings 8-11pm" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Payday</label><Input value={editData.payday || ""} onChange={e => setEditData(p => ({ ...p, payday: e.target.value }))} placeholder="e.g. Fridays" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Fan Type</label><Input value={editData.fanType || ""} onChange={e => setEditData(p => ({ ...p, fanType: e.target.value }))} placeholder="e.g. submissive, switch" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Last Spent</label><Input value={editData.lastSpent || ""} onChange={e => setEditData(p => ({ ...p, lastSpent: e.target.value }))} placeholder="e.g. Today, 2 days ago" /></div>
                            <div><label className="text-[10px] text-muted-foreground">DOB</label><Input value={editData.dateOfBirth || ""} onChange={e => setEditData(p => ({ ...p, dateOfBirth: e.target.value }))} placeholder="dd/mm/yyyy" /></div>
                            <div><label className="text-[10px] text-muted-foreground">Location</label><Input value={editData.location || ""} onChange={e => setEditData(p => ({ ...p, location: e.target.value }))} /></div>
                            <div><label className="text-[10px] text-muted-foreground">Job</label><Input value={editData.job || ""} onChange={e => setEditData(p => ({ ...p, job: e.target.value }))} /></div>
                            <div><label className="text-[10px] text-muted-foreground">Relationship</label><Input value={editData.relationshipStatus || ""} onChange={e => setEditData(p => ({ ...p, relationshipStatus: e.target.value }))} /></div>
                          </div>
                          <div><label className="text-[10px] text-muted-foreground">Personality / Themes</label><Input value={editData.personality || ""} onChange={e => setEditData(p => ({ ...p, personality: e.target.value }))} placeholder="e.g. Military/discipline themes, loves being commanded" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Tags (comma separated)</label><Input value={editData.tags || ""} onChange={e => setEditData(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. solo content, military roleplay, PPV opener" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Notes</label><Textarea value={editData.notes || ""} onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="e.g. Top whale. Opens ALL PPVs within hours." /></div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div>
                          {/* Row 1: Rank, Name, Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-lg font-bold text-muted-foreground/50">#{i + 1}</span>
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: color }}>
                              {fan.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-lg font-bold">{fan.name}</span>
                            {isWhale && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">WHALE</span>}
                            {isVip && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">⭐ VIP</span>}
                            {fan.fanType && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">🎭 {fan.fanType}</span>}
                            {contact && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="h-3 w-3" /> NEEDS CONTACT
                              </span>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                              <span className="text-lg font-bold text-green-400">${fan.totalSpent.toLocaleString()}</span>
                              <Button variant="ghost" size="sm" onClick={() => startEdit(fan)} className="h-7 w-7 p-0">
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Row 2: Username */}
                          {fan.ofUsername && (
                            <div className="flex items-center gap-1 mb-2 ml-12">
                              <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">@{fan.ofUsername}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}

                          {/* Row 3: Last messaged, DOB, Active time, Payday, Last spent */}
                          <div className="flex items-center gap-4 flex-wrap text-xs ml-12 mb-2">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Last messaged:</span>
                              <span className={fan.lastMessaged ? "text-foreground" : "text-red-400 font-bold"}>
                                {formatDate(fan.lastMessaged)}
                              </span>
                              <button onClick={() => markMessaged(fan.id)} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors ml-1">
                                Today
                              </button>
                              {fan.dateOfBirth && <span className="ml-2 text-muted-foreground">{fan.dateOfBirth}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-wrap text-xs ml-12 mb-2">
                            {fan.activeTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-foreground">{fan.activeTime}</span>
                              </div>
                            )}
                            {fan.payday && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Payday:</span>
                                <span className="text-foreground">{fan.payday}</span>
                              </div>
                            )}
                            {fan.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-foreground">{fan.location}</span>
                              </div>
                            )}
                            {fan.lastSpent && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">⏱</span>
                                <span className="text-foreground">{fan.lastSpent}</span>
                              </div>
                            )}
                          </div>

                          {/* Row 4: Personality */}
                          {fan.personality && (
                            <p className="text-xs text-muted-foreground ml-12 mb-2 italic">{fan.personality}</p>
                          )}

                          {/* Row 5: Tags */}
                          {fan.tags && (
                            <div className="flex gap-1.5 flex-wrap ml-12 mb-2">
                              {fan.tags.split(",").map((tag, ti) => (
                                <span key={ti} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/30">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Row 6: Notes */}
                          {fan.notes && (
                            <p className="text-xs ml-12 text-amber-300/80">Notes: {fan.notes}</p>
                          )}
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
