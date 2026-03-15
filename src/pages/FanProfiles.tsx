import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { modelColors } from "@/lib/mock-data";
import {
  DollarSign, Clock, Heart, User, Calendar, Briefcase, Moon, Star,
  Pencil, Copy, Check, MessageCircle, AlertTriangle, MapPin, Loader2,
  Search, Plus, SortAsc, ChevronDown, ChevronUp, Users, X, Save,
  Cake, Home, Gamepad2, ArrowUpDown, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Constants ──────────────────────────────────────────────────────────────

const MODEL_TABS = ["All", "Ashley", "Willow", "Izzie", "Lucinda"] as const;
type ModelTab = typeof MODEL_TABS[number];

const MODEL_GRADIENT: Record<string, string> = {
  Ashley: "from-pink-500 to-rose-600",
  Willow: "from-emerald-400 to-teal-600",
  Izzie: "from-red-400 to-orange-600",
  Lucinda: "from-purple-400 to-violet-600",
};

const MODEL_COLOR_HSL: Record<string, string> = {
  Izzie: "0 72% 55%",
  Ashley: "330 70% 60%",
  Willow: "160 84% 39%",
  Lucinda: "270 60% 60%",
};

type SortOption = "spend" | "name" | "lastContacted";

function needsContact(lastMessaged?: string): boolean {
  if (!lastMessaged) return true;
  const last = new Date(lastMessaged);
  const now = new Date();
  return now.getTime() - last.getTime() > 24 * 60 * 60 * 1000;
}

function getModelKey(account: string): string {
  if (account.toLowerCase().includes("ashley")) return "Ashley";
  if (account.toLowerCase().includes("willow")) return "Willow";
  if (account.toLowerCase().includes("izz")) return "Izzie";
  if (account.toLowerCase().includes("lucinda")) return "Lucinda";
  return account;
}

// ─── Add Fan Dialog ─────────────────────────────────────────────────────────

function AddFanDialog({ onClose, onSave }: { onClose: () => void; onSave: (fan: any) => Promise<void> }) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("Ashley");
  const [ofUsername, setOfUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    await onSave({ name: name.trim(), model_name: model, of_username: ofUsername.trim() });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card p-6 w-full max-w-md mx-4 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add New Fan</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Fan Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BigSpender42" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Model</label>
            <div className="flex gap-2 mt-1">
              {["Ashley", "Willow", "Izzie", "Lucinda"].map(m => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    model === m
                      ? `bg-gradient-to-r ${MODEL_GRADIENT[m]} text-white shadow-lg`
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">OF Username</label>
            <Input value={ofUsername} onChange={e => setOfUsername(e.target.value)} placeholder="@username" className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Fan
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Fan Card ───────────────────────────────────────────────────────────────

function FanCard({
  fan,
  modelKey,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onMarkMessaged,
  onClearMessaged,
  onSetMessagedDate,
  copiedId,
  onCopyUsername,
  animDelay,
}: {
  fan: Fan;
  modelKey: string;
  isEditing: boolean;
  onStartEdit: (fan: Fan) => void;
  onCancelEdit: () => void;
  onSaveEdit: (fanId: string, data: any) => Promise<void>;
  onMarkMessaged: (fanId: string) => void;
  onClearMessaged: (fanId: string) => void;
  onSetMessagedDate: (fanId: string, date: string) => void;
  copiedId: string | null;
  onCopyUsername: (fanId: string, username: string) => void;
  animDelay: number;
}) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [editForm, setEditForm] = useState({
    of_username: fan.ofUsername,
    notes: fan.notes,
    interests: fan.interests,
    active_time: fan.activeTime,
    payday: fan.payday,
    job: fan.job || "",
    dob: fan.dateOfBirth || "",
    location: fan.location || "",
    relationship_status: fan.relationshipStatus || "",
    hobbies: fan.hobbies || "",
  });

  const showContactWarning = needsContact(fan.lastMessaged);
  const isVip = fan.totalSpent >= 1000;
  const color = MODEL_COLOR_HSL[modelKey] || "217 91% 60%";
  const gradient = MODEL_GRADIENT[modelKey] || "from-blue-500 to-cyan-500";

  const handleSave = () => {
    onSaveEdit(fan.id, editForm);
  };

  useEffect(() => {
    if (isEditing) {
      setEditForm({
        of_username: fan.ofUsername,
        notes: fan.notes,
        interests: fan.interests,
        active_time: fan.activeTime,
        payday: fan.payday,
        job: fan.job || "",
        dob: fan.dateOfBirth || "",
        location: fan.location || "",
        relationship_status: fan.relationshipStatus || "",
        hobbies: fan.hobbies || "",
      });
    }
  }, [isEditing]);

  return (
    <div
      className={`
        glass-card overflow-hidden transition-all duration-300 hover:border-border
        hover:shadow-lg hover:shadow-black/20 group
        ${showContactWarning ? "border-red-500/30 ring-1 ring-red-500/20" : ""}
      `}
      style={{
        animation: `fadeSlideIn 0.4s ease-out ${animDelay}ms both`,
      }}
    >
      {/* Top gradient accent */}
      <div className={`h-1 bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="p-5">
        {/* Header: Name + Spend */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold truncate">{fan.name}</h3>
              {isVip && (
                <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/30 shrink-0">
                  ⭐ VIP
                </Badge>
              )}
              <Badge
                className="text-[10px] shrink-0"
                style={{
                  backgroundColor: `hsl(${color} / 0.15)`,
                  color: `hsl(${color})`,
                  borderColor: `hsl(${color} / 0.3)`,
                }}
              >
                {modelKey}
              </Badge>
            </div>
            {fan.ofUsername && (
              <button
                onClick={() => onCopyUsername(fan.id, fan.ofUsername)}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                title="Click to copy"
              >
                @{fan.ofUsername}
                {copiedId === fan.id ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3 opacity-40" />
                )}
              </button>
            )}
          </div>
          <div className="text-right shrink-0 pl-3">
            <p className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{
              backgroundImage: `linear-gradient(to right, hsl(${color}), hsl(${color} / 0.7))`,
            }}>
              ${fan.totalSpent.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">lifetime spend</p>
          </div>
        </div>

        {/* Key Info Grid */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
            {fan.dateOfBirth && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Cake className="h-3 w-3 shrink-0" />
                <span className="truncate">{fan.dateOfBirth}</span>
              </div>
            )}
            {fan.location && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{fan.location}</span>
              </div>
            )}
            {fan.payday && fan.payday !== "Unknown" && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="truncate">Payday: {fan.payday}</span>
              </div>
            )}
            {fan.relationshipStatus && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Heart className="h-3 w-3 shrink-0" />
                <span className="truncate">{fan.relationshipStatus}</span>
              </div>
            )}
            {fan.hobbies && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gamepad2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{fan.hobbies}</span>
              </div>
            )}
            {fan.job && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="h-3 w-3 shrink-0" />
                <span className="truncate">{fan.job}</span>
              </div>
            )}
          </div>
        )}

        {/* Last Messaged */}
        <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-border/30">
          <div className="flex items-center gap-1.5 text-xs">
            <MessageCircle className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Last msg:</span>
            {fan.lastMessaged ? (
              <span className={`font-medium ${needsContact(fan.lastMessaged) ? "text-red-400" : "text-green-400"}`}>
                {fan.lastMessaged}
              </span>
            ) : (
              <span className="text-red-400 font-medium">Never</span>
            )}
          </div>
          {showContactWarning && (
            <Badge variant="destructive" className="text-[10px] animate-pulse gap-1 h-5">
              <AlertTriangle className="h-2.5 w-2.5" />
              Needs contact
            </Badge>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => onMarkMessaged(fan.id)}>
              ✅ Today
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-400 hover:text-red-300" onClick={() => onClearMessaged(fan.id)}>
              ✖
            </Button>
            <Input
              type="date"
              className="h-6 text-[10px] w-28"
              value={fan.lastMessaged || ""}
              onChange={(e) => onSetMessagedDate(fan.id, e.target.value)}
            />
          </div>
        </div>

        {/* Edit Mode */}
        {isEditing ? (
          <div className="space-y-2 p-3 bg-secondary/20 rounded-lg border border-border/50 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">OF Username</label>
                <Input value={editForm.of_username} onChange={e => setEditForm(f => ({ ...f, of_username: e.target.value }))} className="h-7 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">Job</label>
                <Input value={editForm.job} onChange={e => setEditForm(f => ({ ...f, job: e.target.value }))} className="h-7 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">DOB</label>
                <Input value={editForm.dob} onChange={e => setEditForm(f => ({ ...f, dob: e.target.value }))} className="h-7 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">Location</label>
                <Input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className="h-7 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">Payday</label>
                <Input value={editForm.payday} onChange={e => setEditForm(f => ({ ...f, payday: e.target.value }))} className="h-7 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">Relationship</label>
                <Input value={editForm.relationship_status} onChange={e => setEditForm(f => ({ ...f, relationship_status: e.target.value }))} className="h-7 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">Hobbies</label>
                <Input value={editForm.hobbies} onChange={e => setEditForm(f => ({ ...f, hobbies: e.target.value }))} className="h-7 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">Active Time</label>
                <Input value={editForm.active_time} onChange={e => setEditForm(f => ({ ...f, active_time: e.target.value }))} className="h-7 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Notes</label>
              <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} className="text-sm min-h-[60px]" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSave} className="h-7 text-xs gap-1">
                <Save className="h-3 w-3" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-7 text-xs">Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Notes (expandable) */}
            {fan.notes && (
              <button
                onClick={() => setNotesExpanded(!notesExpanded)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {notesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span className="font-medium">Notes</span>
                </div>
                {notesExpanded && (
                  <p className="mt-1.5 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2.5 animate-in slide-in-from-top-1 duration-150">
                    {fan.notes}
                  </p>
                )}
              </button>
            )}

            {/* Preferences Tags */}
            {fan.preferences && fan.preferences.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {fan.preferences.map((pref) => (
                  <Badge key={pref} variant="secondary" className="text-[10px]">{pref}</Badge>
                ))}
              </div>
            )}

            {/* Edit button */}
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onStartEdit(fan)}
              >
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FanProfiles() {
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFanId, setEditingFanId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModelTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("spend");
  const [showAddDialog, setShowAddDialog] = useState(false);

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
    setFans((data || []).map(dbToFan));
    setLoading(false);
  };

  useEffect(() => { fetchFans(); }, []);

  // ─── Filtering, searching, sorting ──────────────────────────────────────

  const filteredFans = useMemo(() => {
    let result = [...fans];

    // Filter by model tab
    if (activeTab !== "All") {
      result = result.filter(f => getModelKey(f.account) === activeTab);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.ofUsername.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "spend": return b.totalSpent - a.totalSpent;
        case "name": return a.name.localeCompare(b.name);
        case "lastContacted": {
          if (!a.lastMessaged && !b.lastMessaged) return 0;
          if (!a.lastMessaged) return -1; // Never contacted first
          if (!b.lastMessaged) return 1;
          return a.lastMessaged.localeCompare(b.lastMessaged); // Oldest first
        }
        default: return 0;
      }
    });

    return result;
  }, [fans, activeTab, searchQuery, sortBy]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const copyUsername = (fanId: string, username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedId(fanId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const addFan = async (data: { name: string; model_name: string; of_username: string }) => {
    const { error } = await supabase.from("fan_profiles").insert({
      name: data.name,
      model_name: data.model_name,
      of_username: data.of_username,
      total_spent: 0,
      tier: "regular",
    } as any);
    if (error) {
      toast.error("Failed to add fan: " + error.message);
      return;
    }
    toast.success(`Added ${data.name}`);
    setShowAddDialog(false);
    fetchFans();
  };

  const saveEdit = async (fanId: string, form: any) => {
    const { error } = await supabase.from("fan_profiles").update({
      of_username: form.of_username,
      notes: form.notes,
      interests: form.interests,
      active_time: form.active_time,
      payday: form.payday,
      job: form.job || null,
      dob: form.dob || null,
      location: form.location || null,
      relationship_status: form.relationship_status || null,
      hobbies: form.hobbies || null,
      updated_at: new Date().toISOString(),
    } as any).eq("id", fanId);

    if (error) { toast.error("Failed to save changes"); return; }

    setFans(prev => prev.map(f =>
      f.id === fanId
        ? {
            ...f,
            ofUsername: form.of_username,
            notes: form.notes,
            interests: form.interests,
            activeTime: form.active_time,
            payday: form.payday,
            job: form.job || undefined,
            dateOfBirth: form.dob || undefined,
            location: form.location || undefined,
            relationshipStatus: form.relationship_status || undefined,
            hobbies: form.hobbies || undefined,
          }
        : f
    ));
    setEditingFanId(null);
    toast.success("Fan profile updated");
  };

  const markMessaged = async (fanId: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("fan_profiles").update({ last_messaged: now, updated_at: now } as any).eq("id", fanId);
    if (error) { toast.error("Failed to update"); return; }
    setFans(prev => prev.map(f => f.id === fanId ? { ...f, lastMessaged: now.split("T")[0] } : f));
  };

  const clearMessaged = async (fanId: string) => {
    const { error } = await supabase.from("fan_profiles").update({ last_messaged: null, updated_at: new Date().toISOString() } as any).eq("id", fanId);
    if (error) { toast.error("Failed to update"); return; }
    setFans(prev => prev.map(f => f.id === fanId ? { ...f, lastMessaged: undefined } : f));
  };

  const setMessagedDate = async (fanId: string, date: string) => {
    const isoDate = date ? new Date(date).toISOString() : null;
    const { error } = await supabase.from("fan_profiles").update({ last_messaged: isoDate, updated_at: new Date().toISOString() } as any).eq("id", fanId);
    if (error) { toast.error("Failed to update"); return; }
    setFans(prev => prev.map(f => f.id === fanId ? { ...f, lastMessaged: date } : f));
  };

  // ─── Stats ──────────────────────────────────────────────────────────────

  const totalFans = fans.length;
  const totalSpend = fans.reduce((s, f) => s + f.totalSpent, 0);
  const vipCount = fans.filter(f => f.totalSpent >= 1000).length;
  const needsContactCount = fans.filter(f => needsContact(f.lastMessaged)).length;

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* CSS for card animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deep profiles for whale management & fan engagement
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Fan
        </Button>
      </div>

      {/* Quick Stats */}
      {totalFans > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-bold">{totalFans}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Fans</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-bold text-green-400">${totalSpend.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Spend</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{vipCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">VIP Fans</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className={`text-2xl font-bold ${needsContactCount > 0 ? "text-red-400" : "text-green-400"}`}>{needsContactCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Need Contact</p>
          </div>
        </div>
      )}

      {/* Model Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {MODEL_TABS.map(tab => {
          const count = tab === "All" ? fans.length : fans.filter(f => getModelKey(f.account) === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? tab === "All"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : `bg-gradient-to-r ${MODEL_GRADIENT[tab] || ""} text-white shadow-lg`
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fans by name or username..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="bg-secondary/50 text-sm rounded-lg px-3 py-2 border border-border/50 text-foreground"
          >
            <option value="spend">Highest Spend</option>
            <option value="name">Name A→Z</option>
            <option value="lastContacted">Needs Contact</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {fans.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No fan profiles yet</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
              Data will populate automatically from quality checks and whale monitoring.
              You can also add fans manually using the button above.
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Add Your First Fan
          </Button>
        </div>
      ) : filteredFans.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No fans match your filters.</p>
        </div>
      ) : (
        /* Fan Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredFans.map((fan, i) => (
            <FanCard
              key={fan.id}
              fan={fan}
              modelKey={getModelKey(fan.account)}
              isEditing={editingFanId === fan.id}
              onStartEdit={() => setEditingFanId(fan.id)}
              onCancelEdit={() => setEditingFanId(null)}
              onSaveEdit={saveEdit}
              onMarkMessaged={markMessaged}
              onClearMessaged={clearMessaged}
              onSetMessagedDate={setMessagedDate}
              copiedId={copiedId}
              onCopyUsername={copyUsername}
              animDelay={i * 50}
            />
          ))}
        </div>
      )}

      {/* Add Fan Dialog */}
      {showAddDialog && (
        <AddFanDialog onClose={() => setShowAddDialog(false)} onSave={addFan} />
      )}
    </div>
  );
}
