import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, Heart, MessageSquare, TrendingUp } from "lucide-react";

interface Fan {
  id: string;
  name: string;
  account: string;
  totalSpent: number;
  lastActive: string;
  tier: "whale" | "vip" | "regular";
  notes: string;
  tags: string[];
}

const topFans: Fan[] = [
  { id: "1", name: "Nate", account: "Izzy", totalSpent: 3498, lastActive: "Today", tier: "whale", notes: "Greedy daily. Opens all PPVs. Prefers solo content.", tags: ["greedy daily", "OPENED PPV 🔓", "Full Script ✅"] },
  { id: "2", name: "Patrick", account: "Ashley", totalSpent: 2549, lastActive: "Today", tier: "whale", notes: "Big tipper. Loves customs. Active 8-11pm.", tags: ["big tipper", "custom buyer", "night owl"] },
  { id: "3", name: "Derek", account: "Ashley", totalSpent: 2364, lastActive: "Yesterday", tier: "whale", notes: "Consistent spender. Weekly PPV buyer.", tags: ["consistent", "weekly buyer"] },
  { id: "4", name: "DEVO", account: "Izzy", totalSpent: 2068, lastActive: "2 days ago", tier: "whale", notes: "Military fetish. Responds to roleplay.", tags: ["roleplay", "military"] },
  { id: "5", name: "Jay41", account: "Willow", totalSpent: 1200, lastActive: "Today", tier: "vip", notes: "Custom requester. Detailed requests.", tags: ["custom buyer", "No MMs"] },
  { id: "6", name: "James", account: "Willow", totalSpent: 950, lastActive: "3 days ago", tier: "vip", notes: "New account. Previous big spender.", tags: ["returning", "custom buyer"] },
];

const tierColors = {
  whale: "45 93% 47%", // gold
  vip: "270 60% 60%", // purple
  regular: "217 91% 60%", // blue
};

export default function FanProfiles() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fan Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Top spenders and whale management</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <DollarSign className="h-4 w-4" />
            <span>Total from Top Fans</span>
          </div>
          <p className="text-2xl font-bold mt-1">${topFans.reduce((sum, f) => sum + f.totalSpent, 0).toLocaleString()}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Heart className="h-4 w-4" />
            <span>Whales</span>
          </div>
          <p className="text-2xl font-bold mt-1">{topFans.filter(f => f.tier === "whale").length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>Avg Spend</span>
          </div>
          <p className="text-2xl font-bold mt-1">${Math.round(topFans.reduce((sum, f) => sum + f.totalSpent, 0) / topFans.length).toLocaleString()}</p>
        </div>
      </div>

      {/* Fan List */}
      <div className="space-y-3">
        {topFans.map((fan, index) => {
          const color = tierColors[fan.tier];
          return (
            <div key={fan.id} className="glass-card p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                  >
                    {fan.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{fan.name}</p>
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}>
                      {fan.tier.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">• {fan.account}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{fan.notes}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {fan.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-bold" style={{ color: `hsl(${color})` }}>${fan.totalSpent.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{fan.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
