import { Badge } from "@/components/ui/badge";
import { modelColors } from "@/lib/mock-data";
import { DollarSign, Clock, Heart, User, Calendar, Briefcase, Moon, Star } from "lucide-react";

interface Fan {
  id: string;
  name: string;
  account: string;
  totalSpent: number;
  lastActive: string;
  tier: "whale" | "vip" | "regular";
  // Deep profile info
  preferences: string[];
  personality: "submissive" | "dominant" | "switch";
  activeTime: string;
  payday: string;
  job?: string;
  interests: string;
  notes: string;
}

// Organized by model
const fansByModel: Record<string, Fan[]> = {
  "Izzy": [
    { 
      id: "1", name: "Nate", account: "Izzy", totalSpent: 3498, lastActive: "Today", tier: "whale",
      preferences: ["solo content", "military roleplay", "PPV opener"],
      personality: "submissive",
      activeTime: "Evenings 8-11pm",
      payday: "Fridays",
      job: "Unknown",
      interests: "Military/discipline themes, loves being commanded",
      notes: "Top whale. Greedy daily. Opens ALL PPVs within hours. Full script completed."
    },
    { 
      id: "4", name: "DEVO", account: "Izzy", totalSpent: 2068, lastActive: "2 days ago", tier: "whale",
      preferences: ["roleplay", "military", "customs"],
      personality: "submissive",
      activeTime: "Late nights",
      payday: "Bi-weekly",
      interests: "Military fetish, detailed roleplay scenarios",
      notes: "Responds well to commanding tone. Likes extended roleplay sessions."
    },
  ],
  "Ashley": [
    { 
      id: "2", name: "Patrick", account: "Ashley", totalSpent: 2549, lastActive: "Today", tier: "whale",
      preferences: ["customs", "tipping", "college theme"],
      personality: "dominant",
      activeTime: "8-11pm weeknights",
      payday: "Monthly (1st)",
      job: "Office worker",
      interests: "Shy/innocent angle, first-time narratives",
      notes: "Big tipper. Loves ordering customs. Night owl - most active 8-11pm."
    },
    { 
      id: "3", name: "Derek", account: "Ashley", totalSpent: 2364, lastActive: "Yesterday", tier: "whale",
      preferences: ["weekly PPV", "consistent buyer"],
      personality: "switch",
      activeTime: "Weekends",
      payday: "Saturdays",
      interests: "Variety content, likes surprises",
      notes: "Consistent weekly spender. Reliable Saturday purchases."
    },
  ],
  "Willow": [
    { 
      id: "5", name: "Jay41", account: "Willow", totalSpent: 1200, lastActive: "Today", tier: "vip",
      preferences: ["feet", "customs", "no toys"],
      personality: "dominant",
      activeTime: "Afternoons",
      payday: "Weekly Fridays",
      job: "Works from home",
      interests: "Feet content, finger play only (no toys), detailed custom requests",
      notes: "Very specific requests. NO TOYS - he hates them. Feet + fingers only. Red/French nails preferred."
    },
    { 
      id: "6", name: "James", account: "Willow", totalSpent: 950, lastActive: "3 days ago", tier: "vip",
      preferences: ["customs", "toy play"],
      personality: "submissive",
      activeTime: "Evenings",
      payday: "Bi-weekly",
      interests: "Cowgirl content, toy riding",
      notes: "Deleted old account, created new one. Previous big spender returning. Willing to pay again for customs."
    },
  ],
  "Lucinda Bleu": [
    // Add Lucinda fans as we get data
  ],
};

const tierColors = {
  whale: "45 93% 47%", // gold
  vip: "270 60% 60%", // purple
  regular: "217 91% 60%", // blue
};

const personalityIcons = {
  submissive: "😇",
  dominant: "😈", 
  switch: "🔄",
};

export default function FanProfiles() {
  const models = Object.keys(fansByModel).filter(m => fansByModel[m].length > 0);
  
  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Top spenders organized by model - deep profiles for whale management</p>
      </div>

      {models.map((modelName) => {
        const fans = fansByModel[modelName];
        const modelColor = modelColors[modelName] || "217 91% 60%";
        const totalForModel = fans.reduce((sum, f) => sum + f.totalSpent, 0);
        
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
              <div>
                <h2 className="text-lg font-semibold" style={{ color: `hsl(${modelColor})` }}>{modelName}</h2>
                <p className="text-xs text-muted-foreground">{fans.length} top fans • ${totalForModel.toLocaleString()} lifetime</p>
              </div>
            </div>

            {/* Fans for this model */}
            <div className="space-y-3">
              {fans.map((fan, index) => {
                const color = tierColors[fan.tier];
                return (
                  <div key={fan.id} className="glass-card p-4">
                    <div className="flex items-start gap-4">
                      {/* Rank & Avatar */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                        >
                          {fan.name.slice(0, 2).toUpperCase()}
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{fan.name}</p>
                          <Badge variant="outline" className="text-[10px]" style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}>
                            {fan.tier.toUpperCase()}
                          </Badge>
                          <span className="text-xs">{personalityIcons[fan.personality]} {fan.personality}</span>
                        </div>

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
                      </div>

                      {/* Total Spent */}
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold" style={{ color: `hsl(${color})` }}>${fan.totalSpent.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">lifetime</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty state for Lucinda */}
      {fansByModel["Lucinda Bleu"]?.length === 0 && (
        <div className="glass-card p-6 text-center text-muted-foreground">
          <p>No whale profiles for Lucinda Bleu yet</p>
          <p className="text-xs mt-1">Add fan data from OnlyFans API</p>
        </div>
      )}
    </div>
  );
}
