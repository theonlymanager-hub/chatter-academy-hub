import { useState, useEffect } from "react";
import {
  MessageCircle, Clock, Calendar, Briefcase, MapPin, Loader2,
  Pencil, Save, X, Plus, ExternalLink, AlertTriangle, ChevronDown,
  ChevronUp, Crown, Heart, User, Star, DollarSign, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Fan {
  id: string;
  name: string;
  modelName: string;
  ofUsername: string;
  totalSpent: number;
  isWhale: boolean;
  tier: string;
  lastMessaged: string;
  lastActive: string;
  activeTime: string;
  payday: string;
  personality: string;
  hobbies: string;
  interests: string;
  notes: string;
  job: string;
  location: string;
  dob: string;
  relationshipStatus: string;
  preferences: string[];
}

function dbToFan(row: any): Fan {
  return {
    id: row.id,
    name: row.name || "",
    modelName: row.model_name || "",
    ofUsername: row.of_username || "",
    totalSpent: row.total_spent || 0,
    isWhale: row.is_whale || false,
    tier: row.tier || "regular",
    lastMessaged: row.last_messaged || "",
    lastActive: row.last_active || "",
    activeTime: row.active_time || "",
    payday: row.payday || "",
    personality: row.personality || "",
    hobbies: row.hobbies || "",
    interests: row.interests || "",
    notes: row.notes || "",
    job: row.job || "",
    location: row.location || "",
    dob: row.dob || "",
    relationshipStatus: row.relationship_status || "",
    preferences: row.preferences || [],
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
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getFanTypeLabel(tier: string): { label: string; color: string } {
  switch (tier?.toLowerCase()) {
    case "whale": return { label: "🐋 Whale", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
    case "vip": return { label: "⭐ VIP", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
    case "regular": return { label: "Regular", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
    case "new": return { label: "🆕 New", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
    default: return { label: tier || "Regular", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
  }
}

/* ─── Edit Modal ─── */
function EditModal({
  fan,
  onSave,
  onClose,
}: {
  fan: Fan;
  onSave: (data: Fan) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<Fan>({ ...fan });
  const set = (key: keyof Fan, value: any) => setData((p) => ({ ...p, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] border border-border/40 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/30 sticky top-0 bg-[#1a1a2e] z-10">
          <h3 className="text-lg font-bold">Edit Fan — {fan.name || "New Fan"}</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSave(data)}>
              <Save className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Info */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic Info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Fan Name" value={data.name} onChange={(v) => set("name", v)} />
              <Field label="OF Username" value={data.ofUsername} onChange={(v) => set("ofUsername", v)} placeholder="@username" />
              <Field label="Total Spent ($)" value={String(data.totalSpent)} onChange={(v) => set("totalSpent", Number(v) || 0)} type="number" />
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Tier</label>
                <select
                  className="w-full mt-1 bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm"
                  value={data.tier}
                  onChange={(e) => set("tier", e.target.value)}
                >
                  <option value="new">New</option>
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                  <option value="whale">Whale</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Personal Info</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Date of Birth" value={data.dob} onChange={(v) => set("dob", v)} placeholder="e.g. 15/03/1990" />
              <Field label="Location" value={data.location} onChange={(v) => set("location", v)} placeholder="City, Country" />
              <Field label="Job" value={data.job} onChange={(v) => set("job", v)} placeholder="e.g. Electrician" />
              <Field label="Payday" value={data.payday} onChange={(v) => set("payday", v)} placeholder="e.g. Last Friday of month" />
              <Field label="Relationship Status" value={data.relationshipStatus} onChange={(v) => set("relationshipStatus", v)} placeholder="e.g. Single, Married" />
              <Field label="Hobbies" value={data.hobbies} onChange={(v) => set("hobbies", v)} placeholder="e.g. Gym, Gaming" />
            </div>
          </div>

          {/* Activity */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activity</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Active Time" value={data.activeTime} onChange={(v) => set("activeTime", v)} placeholder="e.g. Evenings 8-11pm" />
              <Field label="Last Messaged" value={data.lastMessaged?.split("T")[0] || ""} onChange={(v) => set("lastMessaged", v)} type="date" />
              <Field label="Last Active" value={data.lastActive?.split("T")[0] || ""} onChange={(v) => set("lastActive", v)} type="date" />
            </div>
          </div>

          {/* Personality & Preferences */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Personality & Preferences</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Personality Notes</label>
                <Textarea
                  value={data.personality}
                  onChange={(e) => set("personality", e.target.value)}
                  rows={2}
                  placeholder="How to talk to this fan, what they respond to..."
                  className="mt-1"
                />
              </div>
              <Field label="Interests" value={data.interests} onChange={(v) => set("interests", v)} placeholder="e.g. submissive, military roleplay" />
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Preferences (what they buy / respond to)</label>
                <Textarea
                  value={(data.preferences || []).join(", ")}
                  onChange={(e) => set("preferences", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  rows={2}
                  placeholder="e.g. solo content, PPV openers, sexting sessions"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Notes</label>
                <Textarea
                  value={data.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  placeholder="Any other notes about this fan..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );
}

/* ─── Fan Card ─── */
function FanCard({
  fan,
  index,
  modelColor,
  onEdit,
  onMarkMessaged,
}: {
  fan: Fan;
  index: number;
  modelColor: string;
  onEdit: (fan: Fan) => void;
  onMarkMessaged: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const contact = needsContact(fan.lastMessaged);
  const isVip = fan.totalSpent >= 1000;
  const typeInfo = getFanTypeLabel(fan.tier);

  return (
    <div className="glass-card border border-border/20 hover:border-border/40 transition-all duration-200 rounded-lg overflow-hidden">
      {/* ── Collapsed View ── */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: modelColor }}
          >
            {fan.name ? fan.name.slice(0, 2).toUpperCase() : "??"}
          </div>

          {/* Name + Username */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base">{fan.name || "Unknown"}</span>
              {fan.ofUsername && (
                <a
                  href={`https://onlyfans.com/${fan.ofUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{fan.ofUsername} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {/* Badges row */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {isVip && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="h-3 w-3" /> VIP
                </span>
              )}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              {contact && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/25 text-red-400 border border-red-500/40 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> NEEDS CONTACT
                </span>
              )}
            </div>
          </div>

          {/* Right side: spend + actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xl font-bold text-green-400">${fan.totalSpent.toLocaleString()}</span>
              <p className="text-[10px] text-muted-foreground">lifetime</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => { e.stopPropagation(); onEdit(fan); }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded View ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border/20 space-y-4">
          {/* Activity Row */}
          <div className="flex items-center gap-4 flex-wrap text-xs pt-3">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Last messaged:</span>
              <span className={contact ? "text-red-400 font-semibold" : "text-foreground"}>
                {formatDate(fan.lastMessaged)}
              </span>
              <button
                onClick={() => onMarkMessaged(fan.id)}
                className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors ml-1"
              >
                Mark Today
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Last active:</span>
              <span className="text-foreground">{formatDate(fan.lastActive)}</span>
            </div>
            {fan.activeTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Online:</span>
                <span className="text-foreground">{fan.activeTime}</span>
              </div>
            )}
          </div>

          {/* Personal Info Grid */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <User className="h-3 w-3" /> Personal Info
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
              {fan.dob && <InfoItem icon="🎂" label="DOB" value={fan.dob} />}
              {fan.location && <InfoItem icon={<MapPin className="h-3 w-3" />} label="Location" value={fan.location} />}
              {fan.job && <InfoItem icon={<Briefcase className="h-3 w-3" />} label="Job" value={fan.job} />}
              {fan.payday && <InfoItem icon={<Calendar className="h-3 w-3" />} label="Payday" value={fan.payday} />}
              {fan.relationshipStatus && <InfoItem icon={<Heart className="h-3 w-3" />} label="Status" value={fan.relationshipStatus} />}
              {fan.hobbies && <InfoItem icon="🎮" label="Hobbies" value={fan.hobbies} />}
              {fan.interests && <InfoItem icon={<Star className="h-3 w-3" />} label="Interests" value={fan.interests} />}
            </div>
            {!fan.dob && !fan.location && !fan.job && !fan.payday && !fan.relationshipStatus && !fan.hobbies && !fan.interests && (
              <p className="text-xs text-muted-foreground/50 italic">No personal info recorded yet</p>
            )}
          </div>

          {/* Personality */}
          {fan.personality && (
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                🧠 Personality Notes
              </h4>
              <p className="text-xs text-foreground/80 bg-secondary/50 rounded-md p-2.5 leading-relaxed">{fan.personality}</p>
            </div>
          )}

          {/* Preferences */}
          {fan.preferences && fan.preferences.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Preferences
              </h4>
              <div className="flex gap-1.5 flex-wrap">
                {fan.preferences.map((pref, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {fan.notes && (
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                📝 Notes
              </h4>
              <p className="text-xs text-amber-300/80 bg-amber-500/10 rounded-md p-2.5 leading-relaxed">{fan.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  );
}

/* ─── Main Page ─── */
export default function FanProfiles() {
  const [fansByModel, setFansByModel] = useState<Record<string, Fan[]>>({});
  const [totalsByModel, setTotalsByModel] = useState<Record<string, number>>({});
  const [countsByModel, setCountsByModel] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingFan, setEditingFan] = useState<Fan | null>(null);
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
      toast.error("Failed to load fan profiles");
      setLoading(false);
      return;
    }

    const grouped: Record<string, Fan[]> = {};
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    MODELS.forEach((m) => { grouped[m] = []; totals[m] = 0; counts[m] = 0; });

    (data || []).forEach((row: any) => {
      const fan = dbToFan(row);
      const model = MODELS.find((m) => fan.modelName.toLowerCase().includes(m.toLowerCase()));
      if (model) {
        totals[model] += fan.totalSpent;
        counts[model]++;
        grouped[model].push(fan);
      }
    });

    setFansByModel(grouped);
    setTotalsByModel(totals);
    setCountsByModel(counts);
    setLoading(false);
  };

  useEffect(() => { fetchFans(); }, []);

  const saveEdit = async (data: Fan) => {
    const { error } = await supabase
      .from("fan_profiles")
      .update({
        name: data.name,
        of_username: data.ofUsername,
        total_spent: data.totalSpent,
        tier: data.tier,
        active_time: data.activeTime,
        last_messaged: data.lastMessaged || null,
        last_active: data.lastActive || null,
        payday: data.payday,
        job: data.job,
        location: data.location,
        dob: data.dob || null,
        relationship_status: data.relationshipStatus,
        hobbies: data.hobbies,
        interests: data.interests,
        personality: data.personality,
        preferences: data.preferences,
        notes: data.notes,
      })
      .eq("id", data.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Fan profile saved");
      setEditingFan(null);
      fetchFans();
    }
  };

  const markMessaged = async (fanId: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("fan_profiles")
      .update({ last_messaged: now })
      .eq("id", fanId);
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
      tier: "new",
    });
    if (error) {
      toast.error("Failed to add fan");
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
        <p className="text-muted-foreground text-sm mt-1">
          Tracked fans per model — click any card to expand full details
        </p>
      </div>

      {MODELS.map((model) => {
        const color = MODEL_COLORS[model];
        const fans = fansByModel[model] || [];
        const totalLifetime = totalsByModel[model] || 0;
        const count = countsByModel[model] || 0;
        const needsContactCount = fans.filter((f) => needsContact(f.lastMessaged)).length;

        return (
          <div key={model} className="space-y-3">
            {/* Model Header */}
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {model.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{model}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{count} fans</span>
                    <span>·</span>
                    <span className="text-green-400 font-semibold">${totalLifetime.toLocaleString()} lifetime</span>
                    {needsContactCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-red-400 font-semibold">{needsContactCount} need contact</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAddingModel(addingModel === model ? null : model)}>
                <Plus className="h-4 w-4 mr-1" /> Add Fan
              </Button>
            </div>

            {/* Add Fan Form */}
            {addingModel === model && (
              <div className="glass-card p-4 flex gap-3 items-end border border-border/30 rounded-lg">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</label>
                  <Input value={newFan.name} onChange={(e) => setNewFan((p) => ({ ...p, name: e.target.value }))} placeholder="Fan name" className="mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">OF Username</label>
                  <Input value={newFan.ofUsername} onChange={(e) => setNewFan((p) => ({ ...p, ofUsername: e.target.value }))} placeholder="@username" className="mt-1" />
                </div>
                <Button onClick={() => addFan(model)} size="sm">Add</Button>
                <Button variant="ghost" size="sm" onClick={() => setAddingModel(null)}><X className="h-4 w-4" /></Button>
              </div>
            )}

            {/* Fan Cards */}
            {fans.length === 0 ? (
              <div className="glass-card p-6 text-center text-muted-foreground text-sm rounded-lg border border-border/20">
                No fans tracked yet for {model}. Click "Add Fan" to start.
              </div>
            ) : (
              <div className="space-y-2">
                {fans.map((fan, i) => (
                  <FanCard
                    key={fan.id}
                    fan={fan}
                    index={i}
                    modelColor={color}
                    onEdit={setEditingFan}
                    onMarkMessaged={markMessaged}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit Modal */}
      {editingFan && (
        <EditModal
          fan={editingFan}
          onSave={saveEdit}
          onClose={() => setEditingFan(null)}
        />
      )}
    </div>
  );
}
