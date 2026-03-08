import { modelColors } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { FileText, Link, Camera, DollarSign } from "lucide-react";

interface Client {
  id: string;
  name: string;
  username: string;
  theme: string;
  status: "active" | "inactive";
  driveLink?: string;
  notes: string;
}

const clients: Client[] = [
  { id: "1", name: "Izzy", username: "myizzyreal", theme: "Military", status: "active", driveLink: "#", notes: "AI model. TOP 5.1%. Discipline/command roleplay works best. Q1 net: $61K" },
  { id: "2", name: "Willow", username: "ginger5foot", theme: "Playful Redhead", status: "active", driveLink: "#", notes: "REAL model. TOP 6.4%. Keep content authentic and playful. Q1 net: $12K" },
  { id: "3", name: "Lucinda Bleu", username: "lucibleu", theme: "Goth Aesthetic", status: "active", driveLink: "#", notes: "AI model. TOP 9.1%. Dark/mysterious vibe. Candlelit content performs well. Q1 net: $3K" },
  { id: "4", name: "Ashley Morris", username: "ashleymorris", theme: "College", status: "active", driveLink: "#", notes: "AI model. TOP 1.1%! Best performer. Shy/innocent angle. Q1 net: $27K" },
];

export default function ClientProfiles() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Model accounts and notes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((client) => {
          const color = modelColors[client.name] || "217 91% 60%";
          return (
            <div key={client.id} className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                >
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-xs text-muted-foreground">@{client.username}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${client.status === "active" ? "text-success border-success/40" : "text-muted-foreground"}`}
                >
                  {client.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs" style={{ backgroundColor: `hsl(${color} / 0.15)`, color: `hsl(${color})` }}>
                  {client.theme}
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              </div>

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
