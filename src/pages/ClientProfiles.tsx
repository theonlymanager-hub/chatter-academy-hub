import { useState, useEffect } from "react";
import { modelColors } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Camera, Tag, BookOpen, MessageCircle, AlertTriangle, Pencil, Save, X, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ModelProfile {
  id: string;
  name: string;
  username: string;
  perceivedAge: number;
  location: string;
  niche: string;
  background: string;
  contentStyle: string;
  keyFacts: string[];
  canDo: string[];
  cantDo: string[];
  personality: string;
  warning?: string;
}

const DEFAULT_MODELS: ModelProfile[] = [
  {
    id: "1",
    name: "Ashley Morris",
    username: "ashleymorris",
    perceivedAge: 18,
    location: "Arizona, USA",
    niche: "College girl",
    background:
      "Fun, flirty college student. Loves partying, studying, going to the gym. Lives with roommate.",
    contentStyle: "Casual selfies, gym content, college lifestyle",
    keyFacts: [
      "She's in Arizona (Phoenix area)",
      "Goes to ASU",
      "Has a roommate",
      "Loves Pilates",
      "Cooking disasters",
      "Shopping with friends",
    ],
    personality: "Shy, nervous, giggly. Blushes easily. Never forward or aggressive — led by the fan. Uses '...' and 🙈😳🥺 a lot.",
    canDo: ["Solo content", "Strip teases", "Selfies", "Voice notes (shy energy)", "Bedroom/kitchen/bathroom content", "Pilates outfit content"],
    cantDo: ["Gym content (indoor only)", "Boy/girl", "Aggressive/dominant tone", "Meetup promises", "Anything that breaks shy persona"],
  },
  {
    id: "2",
    name: "Izzy",
    username: "myizzyreal",
    perceivedAge: 18,
    location: "Texas, USA",
    niche: "Military girl",
    background:
      "Active duty, tough but feminine. Don't overdo the military theme — she's still a normal girl doing normal stuff.",
    contentStyle: "Fitness, outdoor activities, military lifestyle touches",
    keyFacts: [
      "Based in Texas (near military base)",
      "Does PT at 5am",
      "Misses home",
      "Likes hiking",
      "BBQs on base",
    ],
    personality: "Confident, bold, commanding. Short sentences. Takes control. Uses 😈💪🔥. Never cutesy or submissive.",
    canDo: ["Solo content", "Workout/fitness content", "Shower content", "Confident strip teases", "Voice notes (commanding tone)", "Dog tags/military aesthetic"],
    cantDo: ["Submissive/baby talk", "Begging for tips", "Breaking confident persona", "Anything overly cutesy"],
  },
  {
    id: "3",
    name: "Willow",
    username: "ginger5foot",
    perceivedAge: 18,
    location: "Portland, Oregon",
    niche: "Redhead / normal girl",
    background:
      "Artsy, cozy vibes, cat lover, into yoga and farmers markets. No specific niche — just a normal girl.",
    contentStyle: "Cozy/artsy, natural beauty",
    keyFacts: [
      "Has a cat",
      "Loves Thai food",
      "Does yoga",
      "Baking enthusiast",
      "Farmers markets",
      "Rainy day vibes",
    ],
    personality: "Playful, flirty, cheeky, fun. Lots of 😉😏💋. Teases constantly. Light energy, never heavy or serious.",
    canDo: ["Solo content", "Playful strip teases", "Bath/shower content", "Cooking content", "Voice notes (flirty/playful)", "Casual lifestyle content"],
    cantDo: ["Aggressive/dominant tone", "Military references", "Anything too serious or heavy", "Content that doesn't match artsy/cozy vibe"],
  },
];

const STORAGE_KEY = "client_profiles_data";

function loadProfiles(): ModelProfile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // corrupted data, fall through to default
  }
  // Seed with defaults
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MODELS));
  return DEFAULT_MODELS;
}

function saveProfiles(profiles: ModelProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export default function ClientProfiles() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin";
  const [models, setModels] = useState<ModelProfile[]>(() => loadProfiles());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ModelProfile | null>(null);

  useEffect(() => {
    setModels(loadProfiles());
  }, []);

  const startEdit = (model: ModelProfile) => {
    setEditingId(model.id);
    setDraft({ ...model, keyFacts: [...model.keyFacts], canDo: [...model.canDo], cantDo: [...model.cantDo] });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (!draft) return;
    const updated = models.map((m) => (m.id === draft.id ? draft : m));
    setModels(updated);
    saveProfiles(updated);
    setEditingId(null);
    setDraft(null);
  };

  const updateDraft = (field: keyof ModelProfile, value: unknown) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const updateListItem = (field: "keyFacts" | "canDo" | "cantDo", index: number, value: string) => {
    if (!draft) return;
    const arr = [...draft[field]];
    arr[index] = value;
    setDraft({ ...draft, [field]: arr });
  };

  const addListItem = (field: "keyFacts" | "canDo" | "cantDo") => {
    if (!draft) return;
    setDraft({ ...draft, [field]: [...draft[field], ""] });
  };

  const removeListItem = (field: "keyFacts" | "canDo" | "cantDo", index: number) => {
    if (!draft) return;
    const arr = [...draft[field]];
    arr.splice(index, 1);
    setDraft({ ...draft, [field]: arr });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Model profiles — key info and chatter reference for each account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => {
          const color =
            modelColors[model.name] ||
            modelColors[model.name.replace(" Morris", "")] ||
            "217 91% 60%";
          const isEditing = editingId === model.id && draft;

          return (
            <div
              key={model.id}
              className="glass-card border-none rounded-xl overflow-hidden"
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center gap-4"
                style={{
                  background: `linear-gradient(135deg, hsl(${color} / 0.15), hsl(${color} / 0.05))`,
                }}
              >
                {/* Avatar placeholder */}
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 border-2"
                  style={{
                    backgroundColor: `hsl(${color} / 0.2)`,
                    color: `hsl(${color})`,
                    borderColor: `hsl(${color} / 0.4)`,
                  }}
                >
                  {model.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <>
                      <input
                        className="text-xl font-bold bg-secondary/50 border border-border/50 rounded px-2 py-1 w-full mb-1"
                        value={draft.name}
                        onChange={(e) => updateDraft("name", e.target.value)}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">@</span>
                        <input
                          className="text-sm bg-secondary/50 border border-border/50 rounded px-2 py-0.5 w-full"
                          value={draft.username}
                          onChange={(e) => updateDraft("username", e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold truncate">{model.name}</h2>
                      <p className="text-sm text-muted-foreground">@{model.username}</p>
                    </>
                  )}
                </div>
                {isEditing ? (
                  <input
                    className="text-xs bg-secondary/50 border border-border/50 rounded px-2 py-1 w-28 shrink-0"
                    value={draft.niche}
                    onChange={(e) => updateDraft("niche", e.target.value)}
                  />
                ) : (
                  <Badge
                    className="shrink-0 text-xs"
                    style={{
                      backgroundColor: `hsl(${color} / 0.15)`,
                      color: `hsl(${color})`,
                      borderColor: `hsl(${color} / 0.3)`,
                    }}
                    variant="outline"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {model.niche}
                  </Badge>
                )}
                {/* Edit / Save / Cancel buttons */}
                {canEdit && !isEditing && editingId === null && (
                  <button
                    onClick={() => startEdit(model)}
                    className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Edit profile"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {isEditing && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={saveDraft}
                      className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Age:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className="font-medium bg-secondary/50 border border-border/50 rounded px-2 py-0.5 w-16"
                        value={draft.perceivedAge}
                        onChange={(e) => updateDraft("perceivedAge", parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <span className="font-medium">{model.perceivedAge}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    {isEditing ? (
                      <input
                        className="font-medium bg-secondary/50 border border-border/50 rounded px-2 py-0.5 w-full"
                        value={draft.location}
                        onChange={(e) => updateDraft("location", e.target.value)}
                      />
                    ) : (
                      <span className="font-medium truncate">{model.location}</span>
                    )}
                  </div>
                </div>

                {/* Background */}
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Background</p>
                      {isEditing ? (
                        <textarea
                          className="text-sm bg-secondary/50 border border-border/50 rounded px-2 py-1 w-full min-h-[60px] resize-y"
                          value={draft.background}
                          onChange={(e) => updateDraft("background", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm">{model.background}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content style */}
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Content:</span>
                  {isEditing ? (
                    <input
                      className="bg-secondary/50 border border-border/50 rounded px-2 py-0.5 flex-1"
                      value={draft.contentStyle}
                      onChange={(e) => updateDraft("contentStyle", e.target.value)}
                    />
                  ) : (
                    <span>{model.contentStyle}</span>
                  )}
                </div>

                {/* Key Facts */}
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium mb-2">
                        Key Facts for Chatters
                      </p>
                      {isEditing ? (
                        <div className="space-y-1">
                          {draft.keyFacts.map((fact, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <input
                                className="text-sm bg-secondary/50 border border-border/50 rounded px-2 py-0.5 flex-1"
                                value={fact}
                                onChange={(e) => updateListItem("keyFacts", i, e.target.value)}
                              />
                              <button
                                onClick={() => removeListItem("keyFacts", i)}
                                className="p-1 text-red-400 hover:text-red-300 shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addListItem("keyFacts")}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
                          >
                            <Plus className="h-3 w-3" /> Add fact
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {model.keyFacts.map((fact, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span
                                className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: `hsl(${color})` }}
                              />
                              {fact}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personality */}
                {(model.personality || isEditing) && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Personality / Voice</p>
                    {isEditing ? (
                      <textarea
                        className="text-sm bg-secondary/50 border border-border/50 rounded px-2 py-1 w-full min-h-[60px] resize-y"
                        value={draft.personality}
                        onChange={(e) => updateDraft("personality", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">{model.personality}</p>
                    )}
                  </div>
                )}

                {/* Can Do / Can't Do */}
                <div className="grid grid-cols-2 gap-3">
                  {(isEditing || (model.canDo && model.canDo.length > 0)) && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-[10px] text-green-400 uppercase font-medium mb-1">✅ Can Do</p>
                      {isEditing ? (
                        <div className="space-y-1">
                          {draft.canDo.map((item, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <input
                                className="text-xs bg-secondary/50 border border-border/50 rounded px-2 py-0.5 flex-1"
                                value={item}
                                onChange={(e) => updateListItem("canDo", i, e.target.value)}
                              />
                              <button
                                onClick={() => removeListItem("canDo", i)}
                                className="p-0.5 text-red-400 hover:text-red-300 shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addListItem("canDo")}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
                          >
                            <Plus className="h-3 w-3" /> Add
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-0.5">
                          {model.canDo.map((item, i) => (
                            <li key={i} className="text-xs text-green-300">{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {(isEditing || (model.cantDo && model.cantDo.length > 0)) && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-[10px] text-red-400 uppercase font-medium mb-1">❌ Can't Do</p>
                      {isEditing ? (
                        <div className="space-y-1">
                          {draft.cantDo.map((item, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <input
                                className="text-xs bg-secondary/50 border border-border/50 rounded px-2 py-0.5 flex-1"
                                value={item}
                                onChange={(e) => updateListItem("cantDo", i, e.target.value)}
                              />
                              <button
                                onClick={() => removeListItem("cantDo", i)}
                                className="p-0.5 text-red-400 hover:text-red-300 shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addListItem("cantDo")}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
                          >
                            <Plus className="h-3 w-3" /> Add
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-0.5">
                          {model.cantDo.map((item, i) => (
                            <li key={i} className="text-xs text-red-300">{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Warning */}
                {model.warning && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {model.warning}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
