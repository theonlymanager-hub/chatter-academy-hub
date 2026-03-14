import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { modelColors } from "@/lib/mock-data";
import { DollarSign, Clock, Heart, User, Calendar, Briefcase, Moon, Star, Pencil, Copy, Check, MessageCircle, AlertTriangle, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Fan {
  id: string;
  name: string;
  account: string;
  ofUsername: string;
  totalSpent: number;
  lastActive: string;
  tier: "whale" | "vip" | "regular";
  preferences: string[];
  personality: string;
  activeTime: string;
  payday: string;
  job?: string;
  dateOfBirth?: string;
  location?: string;
  relationshipStatus?: string;
  hobbies?: string;
  interests: string;
  notes: string;
  lastMessaged?: string;
}

function dbToFan(row: any): Fan {
  return {
    id: row.id,
    name: row.name || "",
    account: row.model_name || "",
    ofUsername: row.of_username || "",
    totalSpent: row.total_spent || 0,
    lastActive: row.last_active || "Unknown",
    tier: (row.tier === "whale" || row.tier === "vip") ? row.tier : "regular",
    preferences: row.preferences || [],
    personality: row.personality || "switch",
    activeTime: row.active_time || "Unknown",
    payday: row.payday || "Unknown",
    job: row.job || undefined,
    dateOfBirth: row.dob ? String(row.dob) : undefined,
    location: row.location || undefined,
    relationshipStatus: row.relationship_status || undefined,
    hobbies: row.hobbies || undefined,
    interests: row.interests || "",
    notes: row.notes || "",
    lastMessaged: row.last_messaged ? row.last_messaged.split("T")[0] : undefined,
  };
}

const tierColors = {
  whale: "45 93% 47%",
  vip: "270 60% 60%",
  regular: "217 91% 60%",
};

const personalityIcons: Record<string, string> = {
  submissive: "😇",
  dominant: "😈",
  switch: "🔄",
};

function needsContact(lastMessaged?: string): boolean {
  if (!lastMessaged) return true;
  const last = new Date(lastMessaged);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return diffMs > 24 * 60 * 60 * 1000;
}

export default function FanProfiles() {
  const [fansByModel, setFansByModel] = useState<Record<string, Fan[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingFanId, setEditingFanId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit form state
  const [editOfUsername, setEditOfUsername] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [editActiveTime, setEditActiveTime] = useState("");
  const [editPayday, setEditPayday] = useState("");
  const [editJob, setEditJob] = useState("");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRelationshipStatus, setEditRelationshipStatus] = useState("");
  const [editHobbies, setEditHobbies] = useState("");

  const fetchFans = async () => {
    const { data, error } = await supabase
      .from("fan_profiles")
      .select("*")
      .order("total_spent", { ascending: false });
    if (error) {
      console.error("Error fetching fan profiles:", error);
      toast.error("Failed to load fan profiles");
      setLoading(false);
      return;
    }
    const grouped: Record<string, Fan[]> = {};
    for (const row of data || []) {
      const fan = dbToFan(row);
      const model = fan.account || "Unknown";
      if (!grouped[model]) grouped[model] = [];
      grouped[model].push(fan);
    }
    setFansByModel(grouped);
    setLoading(false);
  };

  useEffect(() => {
    fetchFans();
  }, []);

  const copyUsername = (fanId: string, username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedId(fanId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const startEdit = (fan: Fan) => {
    setEditingFanId(fan.id);
    setEditOfUsername(fan.ofUsername);
    setEditNotes(fan.notes);
    setEditInterests(fan.interests);
    setEditActiveTime(fan.activeTime);
    setEditPayday(fan.payday);
    setEditJob(fan.job || "");
    setEditDateOfBirth(fan.dateOfBirth || "");
    setEditLocation(fan.location || "");
    setEditRelationshipStatus(fan.relationshipStatus || "");
    setEditHobbies(fan.hobbies || "");
  };

  const saveEdit = async (modelName: string, fanId: string) => {
    const { error } = await supabase.from("fan_profiles").update({
      of_username: editOfUsername,
      notes: editNotes,
      interests: editInterests,
      active_time: editActiveTime,
      payday: editPayday,
      job: editJob || null,
      dob: editDateOfBirth || null,
      location: editLocation || null,
      relationship_status: editRelationshipStatus || null,
      hobbies: editHobbies || null,
      updated_at: new Date().toISOString(),
    } as any).eq("id", fanId);

    if (error) {
      toast.error("Failed to save changes");
      return;
    }

    // Update local state
    setFansByModel(prev => {
      const updated = { ...prev };
      updated[modelName] = updated[modelName].map(f =>
        f.id === fanId
          ? { ...f, ofUsername: editOfUsername, notes: editNotes, interests: editInterests, activeTime: editActiveTime, payday: editPayday, job: editJob || undefined, dateOfBirth: editDateOfBirth || undefined, location: editLocation || undefined, relationshipStatus: editRelationshipStatus || undefined, hobbies: editHobbies || undefined }
          : f
      );
      return updated;
    });
    setEditingFanId(null);
    toast.success("Fan profile updated");
  };

  const markMessaged = async (modelName: string, fanId: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("fan_profiles").update({ last_messaged: now, updated_at: now } as any).eq("id", fanId);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    const today = now.split("T")[0];
    setFansByModel(prev => {
      const updated = { ...prev };
      updated[modelName] = updated[modelName].map(f =>
        f.id === fanId ? { ...f, lastMessaged: today } : f
      );
      return updated;
    });
  };

  const clearLastMessaged = async (modelName: string, fanId: string) => {
    const { error } = await supabase.from("fan_profiles").update({ last_messaged: null, updated_at: new Date().toISOString() } as any).eq("id", fanId);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    setFansByModel(prev => {
      const updated = { ...prev };
      updated[modelName] = updated[modelName].map(f =>
        f.id === fanId ? { ...f, lastMessaged: undefined } : f
      );
      return updated;
    });
  };

  const setLastMessagedDate = async (modelName: string, fanId: string, date: string) => {
    const isoDate = date ? new Date(date).toISOString() : null;
    const { error } = await supabase.from("fan_profiles").update({ last_messaged: isoDate, updated_at: new Date().toISOString() } as any).eq("id", fanId);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    setFansByModel(prev => {
      const updated = { ...prev };
      updated[modelName] = updated[modelName].map(f =>
        f.id === fanId ? { ...f, lastMessaged: date } : f
      );
      return updated;
    });
  };

  const modelColorOverrides: Record<string, string> = {
    "Izzie": modelColors["Izzy"] || "0 72% 55%",
    "Ashley": modelColors["Ashley Morris"] || "330 70% 60%",
    "Willow": modelColors["Willow"] || "160 84% 39%",
    "Lucinda Bleu": modelColors["Lucinda Bleu"] || "270 60% 60%",
  };
  const models = Object.keys(fansByModel).filter(m => fansByModel[m].length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="space-y-8 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
          <p className="text-muted-foreground text-sm mt-1">No fan profiles found. Add fans to the database to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Top fans by spend per model — deep profiles for whale management</p>
      </div>

      {models.map((modelName) => {
        const fans = fansByModel[modelName];
        const modelColor = modelColorOverrides[modelName] || modelColors[modelName] || "217 91% 60%";
        const totalForModel = fans.reduce((sum, f) => sum + f.totalSpent, 0);
        const needsContactCount = fans.filter(f => (f.tier === "whale" || f.tier === "vip") && needsContact(f.lastMessaged)).length;

        return (
          <div key={modelName} className="space-y-4">
            {/* Model Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-border/50">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `hsl(${modelColor} / 0.2)`, color: `hsl(${modelColor})` }}
              >
                {modelName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold" style={{ color: `hsl(${modelColor})` }}>{modelName}</h2>
                <p className="text-xs text-muted-foreground">Top {fans.length} fans • ${totalForModel.toLocaleString()} lifetime</p>
              </div>
              {needsContactCount > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  ⚠️ {needsContactCount} need contact
                </Badge>
              )}
            </div>

            {/* Fans for this model */}
            <div className="space-y-3">
              {fans.map((fan, index) => {
                const color = tierColors[fan.tier];
                const isEditing = editingFanId === fan.id;
                const showContactWarning = (fan.tier === "whale" || fan.tier === "vip") && needsContact(fan.lastMessaged);

                return (
                  <div key={fan.id} className={`glass-card p-4 ${showContactWarning ? "border-red-500/30 ring-1 ring-red-500/20" : ""}`}>
                    <div className="flex items-start gap-4">
                      {/* Rank & Avatar */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold relative"
                          style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                        >
                          {fan.name.slice(0, 2).toUpperCase()}
                          {showContactWarning && (
                            <span className="absolute -top-1 -right-1 text-xs">🔴</span>
                          )}
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Name + OF Username */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-lg">{fan.name}</p>
                            {fan.totalSpent >= 1000 && (
                              <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/30">
                                ⭐ VIP
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px]" style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}>
                              {fan.tier.toUpperCase()}
                            </Badge>
                            <span className="text-xs">{personalityIcons[fan.personality] || "🔄"} {fan.personality}</span>
                            {showContactWarning && (
                              <Badge variant="destructive" className="text-[10px] animate-pulse gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                NEEDS CONTACT
                              </Badge>
                            )}
                          </div>
                          <button
                            onClick={() => copyUsername(fan.id, fan.ofUsername)}
                            className="mt-1 inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-md transition-colors cursor-pointer border border-primary/20"
                            title="Click to copy"
                          >
                            {fan.ofUsername}
                            {copiedId === fan.id ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-50" />
                            )}
                          </button>
                        </div>

                        {/* Last Messaged Tracking */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <MessageCircle className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Last messaged:</span>
                            {fan.lastMessaged ? (
                              <span className={`font-medium ${needsContact(fan.lastMessaged) ? "text-red-400" : "text-green-400"}`}>
                                {fan.lastMessaged}
                              </span>
                            ) : (
                              <span className="text-red-400 font-medium">Never</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2"
                            onClick={() => markMessaged(modelName, fan.id)}
                          >
                            ✅ Today
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2 text-red-400 hover:text-red-300"
                            onClick={() => clearLastMessaged(modelName, fan.id)}
                          >
                            ✖ Clear
                          </Button>
                          <Input
                            type="date"
                            className="h-6 text-[10px] w-32"
                            value={fan.lastMessaged || ""}
                            onChange={(e) => setLastMessagedDate(modelName, fan.id, e.target.value)}
                          />
                        </div>

                        {isEditing ? (
                          <div className="space-y-2 p-3 bg-secondary/20 rounded-lg border border-border/50">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">OF Username</label>
                                <Input value={editOfUsername} onChange={e => setEditOfUsername(e.target.value)} className="h-7 text-sm" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">Job</label>
                                <Input value={editJob} onChange={e => setEditJob(e.target.value)} className="h-7 text-sm" placeholder="Unknown" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">Active Time</label>
                                <Input value={editActiveTime} onChange={e => setEditActiveTime(e.target.value)} className="h-7 text-sm" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">Payday</label>
                                <Input value={editPayday} onChange={e => setEditPayday(e.target.value)} className="h-7 text-sm" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">🎂 Date of Birth</label>
                                <Input value={editDateOfBirth} onChange={e => setEditDateOfBirth(e.target.value)} className="h-7 text-sm" placeholder="Unknown" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">📍 Location</label>
                                <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} className="h-7 text-sm" placeholder="Unknown" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">💍 Relationship Status</label>
                                <Input value={editRelationshipStatus} onChange={e => setEditRelationshipStatus(e.target.value)} className="h-7 text-sm" placeholder="Unknown" />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground uppercase">🎮 Hobbies</label>
                                <Input value={editHobbies} onChange={e => setEditHobbies(e.target.value)} className="h-7 text-sm" placeholder="Unknown" />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground uppercase">Interests</label>
                              <Input value={editInterests} onChange={e => setEditInterests(e.target.value)} className="h-7 text-sm" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground uppercase">Notes</label>
                              <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="text-sm min-h-[50px]" />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" onClick={() => saveEdit(modelName, fan.id)} className="h-7 text-xs">Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingFanId(null)} className="h-7 text-xs">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Profile Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Moon className="h-3 w-3" />
                                <span>{fan.activeTime}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Payday: {fan.payday}</span>
                              </div>
                              {fan.job && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Briefcase className="h-3 w-3" />
                                  <span>{fan.job}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{fan.lastActive}</span>
                              </div>
                              {fan.dateOfBirth && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span>🎂</span>
                                  <span>DOB: {fan.dateOfBirth}</span>
                                </div>
                              )}
                              {fan.location && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{fan.location}</span>
                                </div>
                              )}
                              {fan.relationshipStatus && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span>💍</span>
                                  <span>{fan.relationshipStatus}</span>
                                </div>
                              )}
                              {fan.hobbies && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span>🎮</span>
                                  <span>{fan.hobbies}</span>
                                </div>
                              )}
                            </div>

                            {/* Interests */}
                            {fan.interests && <p className="text-sm text-muted-foreground">{fan.interests}</p>}

                            {/* Preferences Tags */}
                            {fan.preferences && fan.preferences.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {fan.preferences.map((pref) => (
                                  <Badge key={pref} variant="secondary" className="text-[10px]">{pref}</Badge>
                                ))}
                              </div>
                            )}

                            {/* Notes */}
                            {fan.notes && (
                              <div className="p-2 rounded bg-secondary/30 text-xs text-muted-foreground">
                                <strong>Notes:</strong> {fan.notes}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Total Spent + Actions */}
                      <div className="text-right shrink-0 space-y-2">
                        <div>
                          <p className="text-lg font-bold" style={{ color: `hsl(${color})` }}>${fan.totalSpent.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">lifetime</p>
                        </div>
                        {!isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => startEdit(fan)}
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
