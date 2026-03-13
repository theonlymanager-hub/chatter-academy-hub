import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { modelColors } from "@/lib/mock-data";
import { DollarSign, Clock, Heart, User, Calendar, Briefcase, Moon, Star, Pencil, Copy, Check, MessageCircle, AlertTriangle } from "lucide-react";

interface Fan {
  id: string;
  name: string;
  account: string;
  ofUsername: string;
  totalSpent: number;
  lastActive: string;
  tier: "whale" | "vip" | "regular";
  preferences: string[];
  personality: "submissive" | "dominant" | "switch";
  activeTime: string;
  payday: string;
  job?: string;
  interests: string;
  notes: string;
  lastMessaged?: string; // ISO date string
}

const STORAGE_KEY = "fan-profiles-data";

// Default data
const defaultFansByModel: Record<string, Fan[]> = {
  "Izzie": [
    { 
      id: "1", name: "Nate", account: "Izzie", ofUsername: "@nate_real", totalSpent: 3498, lastActive: "Today", tier: "whale",
      preferences: ["solo content", "military roleplay", "PPV opener"],
      personality: "submissive",
      activeTime: "Evenings 8-11pm",
      payday: "Fridays",
      job: "Unknown",
      interests: "Military/discipline themes, loves being commanded",
      notes: "Top whale. Greedy daily. Opens ALL PPVs within hours. Full script completed."
    },
    { 
      id: "4", name: "DEVO", account: "Izzie", ofUsername: "@u567823", totalSpent: 2068, lastActive: "2 days ago", tier: "whale",
      preferences: ["roleplay", "military", "customs"],
      personality: "submissive",
      activeTime: "Late nights",
      payday: "Bi-weekly",
      interests: "Military fetish, detailed roleplay scenarios",
      notes: "Responds well to commanding tone. Likes extended roleplay sessions."
    },
    {
      id: "12", name: "RyanM", account: "Izzie", ofUsername: "@ryan_muscle", totalSpent: 890, lastActive: "Yesterday", tier: "vip",
      preferences: ["PPV", "solo"],
      personality: "switch",
      activeTime: "Mornings",
      payday: "Monthly",
      interests: "Solo content, athletic themes",
      notes: "Consistent buyer. Opens most PPVs. Quiet but reliable."
    },
    {
      id: "13", name: "ChrisB", account: "Izzie", ofUsername: "@chris_b_92", totalSpent: 620, lastActive: "3 days ago", tier: "vip",
      preferences: ["customs", "chat"],
      personality: "dominant",
      activeTime: "Evenings",
      payday: "Weekly",
      interests: "Extended conversations, custom requests",
      notes: "Loves long chats. Will order customs after rapport building."
    },
    {
      id: "14", name: "SteveK", account: "Izzie", ofUsername: "@u234567", totalSpent: 445, lastActive: "This week", tier: "regular",
      preferences: ["PPV", "tips"],
      personality: "submissive",
      activeTime: "Late nights",
      payday: "Bi-weekly",
      interests: "General content, military theme",
      notes: "Steady spender. Building up — potential whale."
    },
  ],
  "Ashley": [
    { 
      id: "2", name: "Patrick", account: "Ashley", ofUsername: "@patrick_night", totalSpent: 2549, lastActive: "Today", tier: "whale",
      preferences: ["customs", "tipping", "college theme"],
      personality: "dominant",
      activeTime: "8-11pm weeknights",
      payday: "Monthly (1st)",
      job: "Office worker",
      interests: "Shy/innocent angle, first-time narratives",
      notes: "Big tipper. Loves ordering customs. Night owl - most active 8-11pm."
    },
    { 
      id: "3", name: "Derek", account: "Ashley", ofUsername: "@derek_weekends", totalSpent: 2364, lastActive: "Yesterday", tier: "whale",
      preferences: ["weekly PPV", "consistent buyer"],
      personality: "switch",
      activeTime: "Weekends",
      payday: "Saturdays",
      interests: "Variety content, likes surprises",
      notes: "Consistent weekly spender. Reliable Saturday purchases."
    },
    { 
      id: "10", name: "adamo", account: "Ashley", ofUsername: "@u789456", totalSpent: 805, lastActive: "Today", tier: "vip",
      preferences: ["PPV", "daily buyer"],
      personality: "dominant",
      activeTime: "Daily",
      payday: "Daily spender",
      interests: "Pure message buyer, no tips",
      notes: "New but spending fast (joined Feb 21). Daily engagement, pure PPV buyer."
    },
    { 
      id: "11", name: "Mikey", account: "Ashley", ofUsername: "@mikey_drums", totalSpent: 734, lastActive: "Today", tier: "vip",
      preferences: ["customs", "100/500 tier"],
      personality: "submissive",
      activeTime: "Early mornings",
      payday: "Daily",
      job: "Drummer",
      interests: "Custom content, very active daily",
      notes: "Custom buyer (100/500 tier noted). Very active daily engagement. Drummer."
    },
    {
      id: "15", name: "TommyJ", account: "Ashley", ofUsername: "@tommy_college", totalSpent: 520, lastActive: "Yesterday", tier: "regular",
      preferences: ["PPV", "college theme"],
      personality: "switch",
      activeTime: "Weekends",
      payday: "Monthly",
      interests: "College/party themes, candid style",
      notes: "Weekend warrior. Buys most PPVs on Saturday nights."
    },
  ],
  "Willow": [
    { 
      id: "5", name: "Jay41", account: "Willow", ofUsername: "@jay41_feet", totalSpent: 1200, lastActive: "Today", tier: "vip",
      preferences: ["feet", "customs", "no toys"],
      personality: "dominant",
      activeTime: "Afternoons",
      payday: "Weekly Fridays",
      job: "Works from home",
      interests: "Feet content, finger play only (no toys), detailed custom requests",
      notes: "Very specific requests. NO TOYS - he hates them. Feet + fingers only. Red/French nails preferred."
    },
    { 
      id: "6", name: "James", account: "Willow", ofUsername: "@james_cowboy", totalSpent: 950, lastActive: "3 days ago", tier: "vip",
      preferences: ["customs", "toy play"],
      personality: "submissive",
      activeTime: "Evenings",
      payday: "Bi-weekly",
      interests: "Cowgirl content, toy riding",
      notes: "Deleted old account, created new one. Previous big spender returning. Willing to pay again for customs."
    },
    {
      id: "16", name: "DaveW", account: "Willow", ofUsername: "@u345678", totalSpent: 680, lastActive: "Today", tier: "vip",
      preferences: ["feet", "lingerie"],
      personality: "dominant",
      activeTime: "Afternoons",
      payday: "Weekly",
      interests: "Feet and lingerie combos",
      notes: "Consistent tipper. Loves new lingerie reveals."
    },
    {
      id: "17", name: "AaronP", account: "Willow", ofUsername: "@aaron_quiet", totalSpent: 410, lastActive: "Yesterday", tier: "regular",
      preferences: ["PPV", "solo"],
      personality: "submissive",
      activeTime: "Mornings",
      payday: "Monthly",
      interests: "Solo playful content",
      notes: "Opens most PPVs. Quiet chatter but reliable buyer."
    },
    {
      id: "18", name: "MikeR", account: "Willow", ofUsername: "@mike_talker", totalSpent: 320, lastActive: "This week", tier: "regular",
      preferences: ["customs", "chat"],
      personality: "switch",
      activeTime: "Evenings",
      payday: "Bi-weekly",
      interests: "Conversation-heavy, likes getting to know her",
      notes: "Building rapport. Potential for customs once trust established."
    },
  ],
  "Lucinda Bleu": [
    { 
      id: "7", name: "Zaza", account: "Lucinda Bleu", ofUsername: "@zaza_dark", totalSpent: 183, lastActive: "This week", tier: "vip",
      preferences: ["goth aesthetic", "mysterious content"],
      personality: "submissive",
      activeTime: "Late nights",
      payday: "Unknown",
      interests: "Dark/mysterious themes, candlelit content",
      notes: "Top spender for Lucinda. Responds well to dark aesthetic."
    },
    { 
      id: "8", name: "Todd Whiting", account: "Lucinda Bleu", ofUsername: "@todd_appreciation", totalSpent: 136, lastActive: "This week", tier: "regular",
      preferences: ["tips only", "no PPV"],
      personality: "dominant",
      activeTime: "Evenings",
      payday: "Unknown",
      interests: "Pure tipper - doesn't buy messages/PPV",
      notes: "$136 in tips only, $0 messages. Appreciation spender."
    },
    { 
      id: "9", name: "Brandon", account: "Lucinda Bleu", ofUsername: "@brandon_goth", totalSpent: 112, lastActive: "This week", tier: "regular",
      preferences: ["goth content"],
      personality: "switch",
      activeTime: "Unknown",
      payday: "Unknown",
      interests: "Goth aesthetic content",
      notes: "Regular buyer, building relationship."
    },
    {
      id: "19", name: "EthanV", account: "Lucinda Bleu", ofUsername: "@u456789", totalSpent: 95, lastActive: "Yesterday", tier: "regular",
      preferences: ["PPV", "dark aesthetic"],
      personality: "submissive",
      activeTime: "Late nights",
      payday: "Monthly",
      interests: "Dark/mysterious reveals, candlelit themes",
      notes: "New fan, spending steadily. Responds well to mysterious tone."
    },
    {
      id: "20", name: "NoahC", account: "Lucinda Bleu", ofUsername: "@noah_chatter", totalSpent: 78, lastActive: "This week", tier: "regular",
      preferences: ["tips", "chat"],
      personality: "dominant",
      activeTime: "Evenings",
      payday: "Unknown",
      interests: "Conversation first, content second",
      notes: "Tipper who likes chatting. Could become VIP with engagement."
    },
  ],
};

const tierColors = {
  whale: "45 93% 47%",
  vip: "270 60% 60%",
  regular: "217 91% 60%",
};

const personalityIcons = {
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
  const [fansByModel, setFansByModel] = useState<Record<string, Fan[]>>(defaultFansByModel);
  const [editingFanId, setEditingFanId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit form state
  const [editOfUsername, setEditOfUsername] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [editActiveTime, setEditActiveTime] = useState("");
  const [editPayday, setEditPayday] = useState("");
  const [editJob, setEditJob] = useState("");

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved data over defaults (preserves structure, updates edited fields)
        const merged: Record<string, Fan[]> = {};
        for (const model of Object.keys(defaultFansByModel)) {
          merged[model] = defaultFansByModel[model].map(defaultFan => {
            const savedFan = parsed[model]?.find((f: Fan) => f.id === defaultFan.id);
            return savedFan ? { ...defaultFan, ...savedFan } : defaultFan;
          });
          // Also include any fans that were added in saved but not in defaults
          const savedOnly = (parsed[model] || []).filter((sf: Fan) => !defaultFansByModel[model].some(df => df.id === sf.id));
          merged[model] = [...merged[model], ...savedOnly];
        }
        // Include models in saved that aren't in defaults
        for (const model of Object.keys(parsed)) {
          if (!merged[model]) {
            merged[model] = parsed[model];
          }
        }
        setFansByModel(merged);
      } catch {
        setFansByModel(defaultFansByModel);
      }
    }
  }, []);

  const saveToStorage = useCallback((data: Record<string, Fan[]>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  };

  const saveEdit = (modelName: string, fanId: string) => {
    const updated = { ...fansByModel };
    updated[modelName] = updated[modelName].map(f =>
      f.id === fanId
        ? { ...f, ofUsername: editOfUsername, notes: editNotes, interests: editInterests, activeTime: editActiveTime, payday: editPayday, job: editJob || undefined }
        : f
    );
    setFansByModel(updated);
    saveToStorage(updated);
    setEditingFanId(null);
  };

  const markMessaged = (modelName: string, fanId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = { ...fansByModel };
    updated[modelName] = updated[modelName].map(f =>
      f.id === fanId ? { ...f, lastMessaged: today } : f
    );
    setFansByModel(updated);
    saveToStorage(updated);
  };

  const setLastMessagedDate = (modelName: string, fanId: string, date: string) => {
    const updated = { ...fansByModel };
    updated[modelName] = updated[modelName].map(f =>
      f.id === fanId ? { ...f, lastMessaged: date } : f
    );
    setFansByModel(updated);
    saveToStorage(updated);
  };

  const modelColorOverrides: Record<string, string> = {
    "Izzie": modelColors["Izzy"] || "0 72% 55%",
    "Ashley": modelColors["Ashley Morris"] || "330 70% 60%",
    "Willow": modelColors["Willow"] || "160 84% 39%",
    "Lucinda Bleu": modelColors["Lucinda Bleu"] || "270 60% 60%",
  };
  const models = Object.keys(fansByModel).filter(m => fansByModel[m].length > 0);
  
  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Top 5 fans by spend per model — deep profiles for whale management</p>
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
                        {/* Name + OF Username (prominent) */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-lg">{fan.name}</p>
                            <Badge variant="outline" className="text-[10px]" style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}>
                              {fan.tier.toUpperCase()}
                            </Badge>
                            <span className="text-xs">{personalityIcons[fan.personality]} {fan.personality}</span>
                            {showContactWarning && (
                              <Badge variant="destructive" className="text-[10px] animate-pulse gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                NEEDS CONTACT
                              </Badge>
                            )}
                          </div>
                          {/* OF Username - prominent, clickable, copyable */}
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
                          <Input
                            type="date"
                            className="h-6 text-[10px] w-32"
                            value={fan.lastMessaged || ""}
                            onChange={(e) => setLastMessagedDate(modelName, fan.id, e.target.value)}
                          />
                        </div>

                        {isEditing ? (
                          /* Edit Form */
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
                            </div>

                            {/* Interests */}
                            <p className="text-sm text-muted-foreground">{fan.interests}</p>

                            {/* Preferences Tags */}
                            <div className="flex flex-wrap gap-1">
                              {fan.preferences.map((pref) => (
                                <Badge key={pref} variant="secondary" className="text-[10px]">{pref}</Badge>
                              ))}
                            </div>

                            {/* Notes */}
                            <div className="p-2 rounded bg-secondary/30 text-xs text-muted-foreground">
                              <strong>Notes:</strong> {fan.notes}
                            </div>
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
