import { useState, useEffect, useCallback } from "react";
import { modelColors } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Link, ExternalLink, Pencil, Check, X, Camera } from "lucide-react";

interface ClientProfile {
  id: string;
  name: string;
  username: string;
  theme: string;
  type: "AI" | "REAL";
  status: "active" | "inactive";
  description: string;
  factFinderUrl: string;
  driveUrl: string;
  profileImageUrl: string;
  ofRanking: string;
  q1Revenue: string;
  notes: string;
}

const STORAGE_KEY = "client-profiles-data-v2";

const defaultProfiles: ClientProfile[] = [
  {
    id: "1",
    name: "Izzy",
    username: "myizzyreal",
    theme: "Military",
    type: "AI",
    status: "active",
    description: "Military-themed model. Discipline and command roleplay works best. Strong, confident persona — fans respond to the commanding tone. Content features military aesthetics, dog tags, camo.",
    factFinderUrl: "",
    driveUrl: "",
    profileImageUrl: "",
    ofRanking: "TOP 5.1%",
    q1Revenue: "$61K",
    notes: "Highest earner. Military roleplay is the core draw. Fans love the commanding personality. Best performing PPVs are discipline-themed.",
  },
  {
    id: "2",
    name: "Willow",
    username: "ginger5foot",
    theme: "Playful Redhead",
    type: "REAL",
    status: "active",
    description: "Natural redhead, playful and teasing personality. Authentic, down-to-earth vibe. Content should feel genuine and fun — not overly produced. Fans love the girl-next-door energy.",
    factFinderUrl: "",
    driveUrl: "",
    profileImageUrl: "",
    ofRanking: "TOP 6.4%",
    q1Revenue: "$12K",
    notes: "Real model — keep content authentic. Playful teasing works better than explicit. Feet content performs well with her audience.",
  },
  {
    id: "3",
    name: "Lucinda Bleu",
    username: "lucibleu",
    theme: "Goth Aesthetic",
    type: "AI",
    status: "active",
    description: "Dark, mysterious goth persona. Candlelit content, dark aesthetics, slow and seductive tone. Fans are drawn to the mystery — keep conversations intriguing, never give everything away.",
    factFinderUrl: "",
    driveUrl: "",
    profileImageUrl: "",
    ofRanking: "TOP 9.1%",
    q1Revenue: "$3K",
    notes: "Lowest performer — needs attention. Dark/mysterious vibe must be consistent. Candlelit content performs best. Needs more whale development.",
  },
  {
    id: "4",
    name: "Ashley Morris",
    username: "ashleymorris",
    theme: "College",
    type: "AI",
    status: "active",
    description: "College girl persona — shy, innocent angle with a naughty side. The 'girl you had a crush on in class' energy. Fans love the shy-to-bold progression. First-time narratives perform extremely well.",
    factFinderUrl: "",
    driveUrl: "",
    profileImageUrl: "",
    ofRanking: "TOP 1.1%",
    q1Revenue: "$27K",
    notes: "Best performer by ranking. Shy/innocent angle is KEY — don't break character. College theme content (dorm room, study sessions) converts well. Strong repeat buyers.",
  },
];

export default function ClientProfiles() {
  const [profiles, setProfiles] = useState<ClientProfile[]>(defaultProfiles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ClientProfile>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved over defaults
        const merged = defaultProfiles.map(dp => {
          const sp = parsed.find((p: ClientProfile) => p.id === dp.id);
          return sp ? { ...dp, ...sp } : dp;
        });
        setProfiles(merged);
      } catch {
        setProfiles(defaultProfiles);
      }
    }
  }, []);

  const saveProfiles = useCallback((data: ClientProfile[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setProfiles(data);
  }, []);

  const startEdit = (profile: ClientProfile) => {
    setEditingId(profile.id);
    setEditData({ ...profile });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = profiles.map(p =>
      p.id === editingId ? { ...p, ...editData } : p
    );
    saveProfiles(updated);
    setEditingId(null);
    setEditData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Model accounts — click to expand for full details, links, and notes
        </p>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {profiles.map(profile => {
          const color = modelColors[profile.name] || modelColors[profile.name.replace(" Morris", "")] || "217 91% 60%";
          const isEditing = editingId === profile.id;

          return (
            <AccordionItem key={profile.id} value={profile.id} className="glass-card border-none">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-4 w-full pr-4">
                  {/* Profile Avatar */}
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                  >
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">{profile.name}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}
                      >
                        {profile.theme}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {profile.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${profile.status === "active" ? "text-green-400 border-green-500/40" : "text-muted-foreground"}`}
                      >
                        {profile.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      @{profile.username} • {profile.ofRanking} • Q1: {profile.q1Revenue}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-5">
                <div className="space-y-4 pt-2">
                  {isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-3 p-4 rounded-lg bg-secondary/20 border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase block mb-1">OF Ranking</label>
                          <Input
                            value={editData.ofRanking || ""}
                            onChange={e => setEditData({ ...editData, ofRanking: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase block mb-1">Q1 Revenue</label>
                          <Input
                            value={editData.q1Revenue || ""}
                            onChange={e => setEditData({ ...editData, q1Revenue: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase block mb-1">Description</label>
                        <Textarea
                          value={editData.description || ""}
                          onChange={e => setEditData({ ...editData, description: e.target.value })}
                          className="min-h-[80px] text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase block mb-1">📋 Fact Finder Sheet URL</label>
                          <Input
                            value={editData.factFinderUrl || ""}
                            onChange={e => setEditData({ ...editData, factFinderUrl: e.target.value })}
                            className="h-8 text-sm"
                            placeholder="https://docs.google.com/..."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase block mb-1">📁 Google Drive URL</label>
                          <Input
                            value={editData.driveUrl || ""}
                            onChange={e => setEditData({ ...editData, driveUrl: e.target.value })}
                            className="h-8 text-sm"
                            placeholder="https://drive.google.com/..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase block mb-1">Notes</label>
                        <Textarea
                          value={editData.notes || ""}
                          onChange={e => setEditData({ ...editData, notes: e.target.value })}
                          className="min-h-[60px] text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="gap-1">
                          <Check className="h-3 w-3" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1">
                          <X className="h-3 w-3" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      {/* Description */}
                      <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-sm">{profile.description}</p>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-secondary/20 text-center">
                          <p className="text-xs text-muted-foreground">OF Ranking</p>
                          <p className="font-bold text-lg" style={{ color: `hsl(${color})` }}>{profile.ofRanking}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/20 text-center">
                          <p className="text-xs text-muted-foreground">Q1 Revenue</p>
                          <p className="font-bold text-lg">{profile.q1Revenue}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/20 text-center">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-bold text-lg">{profile.type}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/20 text-center">
                          <p className="text-xs text-muted-foreground">Theme</p>
                          <p className="font-bold text-lg text-sm">{profile.theme}</p>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="flex gap-2 flex-wrap">
                        <a
                          href={`https://onlyfans.com/${profile.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary/50 hover:bg-secondary text-sm transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" /> OF Profile
                        </a>
                        {profile.factFinderUrl ? (
                          <a
                            href={profile.factFinderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary/50 hover:bg-secondary text-sm transition-colors"
                          >
                            <FileText className="h-4 w-4" /> Fact Finder
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary/20 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" /> Fact Finder (not set)
                          </span>
                        )}
                        {profile.driveUrl ? (
                          <a
                            href={profile.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary/50 hover:bg-secondary text-sm transition-colors"
                          >
                            <Link className="h-4 w-4" /> Google Drive
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary/20 text-sm text-muted-foreground">
                            <Link className="h-4 w-4" /> Drive (not set)
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Notes</p>
                        <p className="text-sm">{profile.notes}</p>
                      </div>

                      {/* Edit Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => startEdit(profile)}
                      >
                        <Pencil className="h-3 w-3" /> Edit Profile
                      </Button>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
