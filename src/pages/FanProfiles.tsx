// fan-profiles-v2
import { useState, useEffect } from "react";
import {
  MessageCircle, Clock, Calendar, Briefcase, MapPin, Loader2,
  Pencil, Save, X, Plus, ExternalLink, AlertTriangle, ChevronDown,
  ChevronUp, Crown, Heart, User, Star, DollarSign, Tag, ShoppingBag,
  Flame, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { isDemoUser } from "@/utils/demo";

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

const MODELS = ["Ashley", "Willow", "Izzie"];

const MODEL_COLORS: Record<string, string> = {
  Ashley: "hsl(330, 70%, 60%)",
  Willow: "hsl(160, 84%, 39%)",
  Izzie: "hsl(0, 72%, 55%)",
};

const FAN_TYPES = ["Unknown", "Submissive", "Dominant", "Switch", "Vanilla", "Roleplay", "Voyeur", "Generous Tipper", "Whale Potential"];

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

function timeSince(d: string): string {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
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

  // Parse interests for fan type & content preference
  const parts = (data.interests || "").split("|").map(s => s.trim());
  const fanType = parts[0] || "";
  const contentPref = parts[1] || "";
  const spentOn = parts[2] || "";

  const setInterestPart = (index: number, value: string) => {
    const p = [...parts];
    while (p.length <= index) p.push("");
    p[index] = value;
    set("interests", p.join(" | "));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] border border-border/40 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
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

          {/* Fan Type & Content */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fan Type & Content Preferences</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Fan Type</label>
                <select
                  className="w-full mt-1 bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm"
                  value={fanType}
                  onChange={(e) => setInterestPart(0, e.target.value)}
                >
                  <option value="">Select type...</option>
                  {FAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Field label="Fav Content Type" value={contentPref} onChange={(v) => setInterestPart(1, v)} placeholder="e.g. Solo, B/G, Feet, Roleplay" />
              <Field label="Spent Money On" value={spentOn} onChange={(v) => setInterestPart(2, v)} placeholder="e.g. PPVs, Customs, Tips, Sexting" />
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
              <Field label="Hobbies" value={data.hobbies} onChange={(v) => set("hobbies", v)} placeholder="e.g. Gym, Gaming, Football" />
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

          {/* Personality & Notes */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Personality & Notes</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Personality / How to Talk to Them</label>
                <Textarea
                  value={data.personality}
                  onChange={(e) => set("personality", e.target.value)}
                  rows={2}
                  placeholder="How does this fan communicate? What tone works? Are they shy, direct, flirty?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">What They Buy / Respond To (tags)</label>
                <Textarea
                  value={(data.preferences || []).join(", ")}
                  onChange={(e) => set("preferences", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  rows={2}
                  placeholder="e.g. solo PPVs, sexting, custom videos, feet content, tipping for attention"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Notes</label>
                <Textarea
                  value={data.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  placeholder="Anything else important about this fan..."
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
  modelColor,
  onEdit,
  onMarkMessaged,
  isAdmin,
  isDemo,
}: {
  fan: Fan;
  modelColor: string;
  onEdit: (fan: Fan) => void;
  onMarkMessaged: (id: string) => void;
  isAdmin: boolean;
  isDemo: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const contact = needsContact(fan.lastMessaged);
  const typeInfo = getFanTypeLabel(fan.tier);

  // Parse interests for fan type, content preference, spent on
  const interestParts = (fan.interests || "").split("|").map(s => s.trim());
  const fanType = interestParts[0] || "";
  const contentPref = interestParts[1] || "";
  const spentOn = interestParts[2] || "";

  return (
    <div className="glass-card border border-border/20 hover:border-border/40 transition-all duration-200 rounded-lg overflow-hidden">
      {/* ── Collapsed View — shows key info at a glance ── */}
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
            style={{ backgroundColor: modelColor }}
          >
            {isDemo ? "??" : (fan.name ? fan.name.slice(0, 2).toUpperCase() : "??")}
          </div>

          {/* Main Info */}
          <div className="min-w-0 flex-1">
            {/* Row 1: Name + Username + Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base">{isDemo ? `Fan #${fan.id.slice(-4).toUpperCase()}` : (fan.name || "Unknown")}</span>
              {!isDemo && fan.ofUsername && (
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
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              {fanType && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  {fanType}
                </span>
              )}
              {contact && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/25 text-red-400 border border-red-500/40 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> CONTACT
                </span>
              )}
            </div>

            {/* Row 2: Key stats at a glance */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
              {isAdmin && !isDemo && (
                <>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 font-bold">${fan.totalSpent.toLocaleString()}</span> lifetime
                  </span>
                  <span className="text-border/60">|</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                Last contact: <span className={contact ? "text-red-400 font-semibold" : "text-foreground"}>{timeSince(fan.lastMessaged)}</span>
              </span>
              {fan.hobbies && (
                <>
                  <span className="text-border/60">|</span>
                  <span className="truncate max-w-[180px]">🎮 {fan.hobbies}</span>
                </>
              )}
              {contentPref && (
                <>
                  <span className="text-border/60">|</span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-pink-400" /> {contentPref}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Edit + Expand */}
          <div className="flex items-center gap-2 shrink-0">
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

      {/* ── Expanded View — ALL fields visible ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border/20 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => onMarkMessaged(fan.id)}
              className="text-xs px-3 py-1.5 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30"
            >
              ✅ Mark Messaged Today
            </button>
          </div>

          {/* Spending & Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {isAdmin && !isDemo && (
              <>
                <InfoBox
                  icon={<DollarSign className="h-4 w-4 text-green-400" />}
                  label="Total Lifetime Spend"
                  value={`$${fan.totalSpent.toLocaleString()}`}
                  valueClass="text-green-400 text-lg font-bold"
                />
                <InfoBox
                  icon={<ShoppingBag className="h-4 w-4 text-amber-400" />}
                  label="Spent Money On"
                  value={spentOn || "Not recorded"}
                  valueClass={spentOn ? "text-foreground" : "text-muted-foreground/40 italic"}
                />
              </>
            )}
            <InfoBox
              icon={<Heart className="h-4 w-4 text-pink-400" />}
              label="Favourite Content"
              value={contentPref || "Not recorded"}
              valueClass={contentPref ? "text-foreground" : "text-muted-foreground/40 italic"}
            />
          </div>

          {/* Fan Type & Personality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoBox
              icon={<Flame className="h-4 w-4 text-orange-400" />}
              label="Fan Type"
              value={fanType || "Not set"}
              valueClass={fanType ? "text-foreground" : "text-muted-foreground/40 italic"}
            />
            <InfoBox
              icon={<Eye className="h-4 w-4 text-blue-400" />}
              label="Personality / How to Talk"
              value={fan.personality || "Not recorded"}
              valueClass={fan.personality ? "text-foreground text-xs leading-relaxed" : "text-muted-foreground/40 italic"}
            />
          </div>

          {/* Personal Info Grid */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <User className="h-3 w-3" /> Personal Info
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <MiniInfo label="🎂 DOB" value={fan.dob} />
              <MiniInfo label="📍 Location" value={fan.location} />
              <MiniInfo label="💼 Job" value={fan.job} />
              <MiniInfo label="💰 Payday" value={fan.payday} />
              <MiniInfo label="💑 Relationship" value={fan.relationshipStatus} />
              <MiniInfo label="🎮 Hobbies" value={fan.hobbies} />
            </div>
          </div>

          {/* Activity */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Activity
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <MiniInfo label="💬 Last Messaged" value={fan.lastMessaged ? formatDate(fan.lastMessaged) : undefined} alert={contact} />
              <MiniInfo label="🟢 Last Active" value={fan.lastActive ? formatDate(fan.lastActive) : undefined} />
              <MiniInfo label="⏰ Online Usually" value={fan.activeTime} />
            </div>
          </div>

          {/* Preferences Tags */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Tag className="h-3 w-3" /> What They Buy / Respond To
            </h4>
            {fan.preferences && fan.preferences.length > 0 ? (
              <div className="flex gap-1.5 flex-wrap">
                {fan.preferences.map((pref, i) => (
                  <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    {pref}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/40 italic">No tags yet — edit to add</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📝 Notes</h4>
            {fan.notes ? (
              <p className="text-xs text-amber-300/80 bg-amber-500/10 rounded-md p-3 leading-relaxed">{fan.notes}</p>
            ) : (
              <p className="text-xs text-muted-foreground/40 italic">No notes yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
  valueClass = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-sm ${valueClass}`}>{value}</p>
    </div>
  );
}

function MiniInfo({ label, value, alert }: { label: string; value?: string; alert?: boolean }) {
  return (
    <div className="p-2 rounded-md bg-secondary/20 border border-border/20">
      <span className="text-[10px] text-muted-foreground block">{label}</span>
      <span className={`text-xs ${alert ? "text-red-400 font-semibold" : value ? "text-foreground" : "text-muted-foreground/40 italic"}`}>
        {value || "Not set"}
      </span>
    </div>
  );
}

/* ─── Main Page ─── */
export default function FanProfiles() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDemo = isDemoUser(user?.role);
  const [fansByModel, setFansByModel] = useState<Record<string, Fan[]>>({});
  const [totalsByModel, setTotalsByModel] = useState<Record<string, number>>({});
  const [countsByModel, setCountsByModel] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingFan, setEditingFan] = useState<Fan | null>(null);
  const [addingModel, setAddingModel] = useState<string | null>(null);
  const [newFan, setNewFan] = useState({ name: "", ofUsername: "" });
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fan_profiles")
      .select("*")
      .gt("total_spent", 0)
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

  // Compute totals
  const totalFans = Object.values(countsByModel).reduce((a, b) => a + b, 0);
  const totalSpend = Object.values(totalsByModel).reduce((a, b) => a + b, 0);
  const totalNeedsContact = Object.values(fansByModel).flat().filter(f => needsContact(f.lastMessaged)).length;

  const modelsToShow = filterModel === "all" ? MODELS : [filterModel];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every fan's info in one place — hobbies, spend history, preferences, contact status
        </p>
      </div>

      {/* Summary Stats */}
      <div className={`grid grid-cols-2 ${isAdmin && !isDemo ? 'md:grid-cols-4' : 'md:grid-cols-2'} gap-3`}>
        <div className="glass-card p-4 rounded-lg border border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Total Fans</p>
          <p className="text-2xl font-bold">{totalFans}</p>
        </div>
        {isAdmin && !isDemo && (
          <>
            <div className="glass-card p-4 rounded-lg border border-border/20 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Lifetime Spend</p>
              <p className="text-2xl font-bold text-green-400">${totalSpend.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 rounded-lg border border-border/20 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Avg per Fan</p>
              <p className="text-2xl font-bold">${totalFans ? Math.round(totalSpend / totalFans).toLocaleString() : 0}</p>
            </div>
          </>
        )}
        <div className="glass-card p-4 rounded-lg border border-border/20 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Need Contact</p>
          <p className={`text-2xl font-bold ${totalNeedsContact > 0 ? "text-red-400" : "text-green-400"}`}>{totalNeedsContact}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <select
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm"
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value)}
        >
          <option value="all">All Models</option>
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm"
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
        >
          <option value="all">All Tiers</option>
          <option value="whale">🐋 Whales</option>
          <option value="vip">⭐ VIP</option>
          <option value="regular">Regular</option>
          <option value="new">🆕 New</option>
        </select>
        <Input
          placeholder="Search fans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-[250px]"
        />
      </div>

      {/* Fan Lists by Model */}
      {modelsToShow.map((model) => {
        const color = MODEL_COLORS[model];
        let fans = fansByModel[model] || [];
        
        if (filterTier !== "all") {
          fans = fans.filter(f => f.tier === filterTier);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          fans = fans.filter(f => 
            f.name.toLowerCase().includes(q) ||
            f.ofUsername.toLowerCase().includes(q) ||
            f.hobbies.toLowerCase().includes(q) ||
            f.notes.toLowerCase().includes(q)
          );
        }

        const totalLifetime = totalsByModel[model] || 0;
        const count = countsByModel[model] || 0;
        const needsContactCount = (fansByModel[model] || []).filter((f) => needsContact(f.lastMessaged)).length;

        return (
          <div key={model} className="space-y-3">
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
                    {isAdmin && !isDemo && (
                      <>
                        <span>·</span>
                        <span className="text-green-400 font-semibold">${totalLifetime.toLocaleString()} lifetime</span>
                      </>
                    )}
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

            {fans.length === 0 ? (
              <div className="glass-card p-6 text-center text-muted-foreground text-sm rounded-lg border border-border/20">
                {searchQuery || filterTier !== "all" ? "No fans match the current filters" : `No fans tracked yet for ${model}. Click "Add Fan" to start.`}
              </div>
            ) : (
              <div className="space-y-2">
                {fans.map((fan) => (
                  <FanCard
                    key={fan.id}
                    fan={fan}
                    modelColor={color}
                    onEdit={setEditingFan}
                    onMarkMessaged={markMessaged}
                    isAdmin={isAdmin}
                    isDemo={isDemo}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

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
