import { useState } from "react";
import { modelColors } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Link, Camera, DollarSign, Users } from "lucide-react";

interface Client {
  id: string;
  name: string;
  username: string;
  theme: string;
  type: string;
  status: "active" | "inactive";
  driveLink?: string;
  subscriberCount: string;
  monthlyRevenue: string;
  notes: string;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Ashley Morris",
    username: "ashleymorris",
    theme: "College",
    type: "AI-generated",
    status: "active",
    driveLink: "#",
    subscriberCount: "",
    monthlyRevenue: "",
    notes: "TOP 1.1%! Best performer. Shy/innocent angle. Q1 net: $27K",
  },
  {
    id: "2",
    name: "Willow",
    username: "ginger5foot",
    theme: "Redhead",
    type: "Real person",
    status: "active",
    driveLink: "#",
    subscriberCount: "",
    monthlyRevenue: "",
    notes: "TOP 6.4%. Keep content authentic and playful. Q1 net: $12K",
  },
  {
    id: "3",
    name: "Izzie",
    username: "myizzyreal",
    theme: "Military",
    type: "AI-generated",
    status: "active",
    driveLink: "#",
    subscriberCount: "",
    monthlyRevenue: "",
    notes: "TOP 5.1%. Discipline/command roleplay works best. Q1 net: $61K",
  },
  {
    id: "4",
    name: "Lucinda Bleu",
    username: "lucibleu",
    theme: "Goth",
    type: "AI-generated",
    status: "active",
    driveLink: "#",
    subscriberCount: "",
    monthlyRevenue: "",
    notes: "TOP 9.1%. Dark/mysterious vibe. Candlelit content performs well. Q1 net: $3K",
  },
];

const STORAGE_KEY = "onlyboard_client_profiles";

function loadClients(): Client[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Client[];
      // Merge with initial data to pick up any new fields
      return initialClients.map((ic) => {
        const saved = parsed.find((p) => p.id === ic.id);
        return saved ? { ...ic, subscriberCount: saved.subscriberCount, monthlyRevenue: saved.monthlyRevenue, notes: saved.notes } : ic;
      });
    }
  } catch {}
  return initialClients;
}

function saveClients(clients: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export default function ClientProfiles() {
  const [clients, setClients] = useState<Client[]>(loadClients);

  const updateClient = (id: string, field: keyof Client, value: string) => {
    setClients((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
      saveClients(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Model accounts, stats, and notes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clients.map((client) => {
          const color = modelColors[client.name] || modelColors["Izzy"] || "217 91% 60%";
          const initials = client.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div key={client.id} className="glass-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                  style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">{client.name}</p>
                  <p className="text-sm text-muted-foreground">@{client.username}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${
                    client.status === "active"
                      ? "text-green-400 border-green-400/40"
                      : "text-muted-foreground"
                  }`}
                >
                  {client.status === "active" ? "● Active" : "Inactive"}
                </Badge>
              </div>

              {/* Theme / Type badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `hsl(${color} / 0.15)`,
                    color: `hsl(${color})`,
                  }}
                >
                  {client.theme}
                </Badge>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {client.type}
                </Badge>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Subscribers
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 12,500"
                    value={client.subscriberCount}
                    onChange={(e) => updateClient(client.id, "subscriberCount", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Monthly Revenue
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. $9,000"
                    value={client.monthlyRevenue}
                    onChange={(e) => updateClient(client.id, "monthlyRevenue", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Notes
                </label>
                <Textarea
                  placeholder="Add notes about this client..."
                  value={client.notes}
                  onChange={(e) => updateClient(client.id, "notes", e.target.value)}
                  className="text-sm min-h-[80px] resize-y"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary text-sm transition-colors">
                  <Link className="h-4 w-4" />
                  Drive
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary text-sm transition-colors">
                  <Camera className="h-4 w-4" />
                  Content
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary text-sm transition-colors">
                  <DollarSign className="h-4 w-4" />
                  Stats
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
