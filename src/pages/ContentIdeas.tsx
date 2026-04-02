import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Pencil,
  Check,
  X,
  Camera,
  Video,
  Smartphone,
  Theater,
  Film,
  Flame,
  ChevronDown,
  ChevronRight,
  StickyNote,
  Filter,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ModelName = "Ashley" | "Willow" | "Izzie";
type Priority = "high" | "medium" | "low";
type Status = "todo" | "in-progress" | "done";
type CategoryKey = "ppv_photos" | "ppv_videos" | "main_feed" | "custom_templates" | "reels_social" | "seasonal_themed";
type StatusFilter = "all" | Status;

interface ContentItem {
  id: string;
  description: string;
  priority: Priority;
  status: Status;
  notes: string;
}

interface CategoryData {
  items: ContentItem[];
}

interface ModelData {
  categories: Record<CategoryKey, CategoryData>;
  generalNotes: string;
}

interface ContentListsData {
  models: Record<ModelName, ModelData>;
  version: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MODELS: ModelName[] = ["Ashley", "Willow", "Izzie"];
const STORAGE_KEY = "content_lists_v2";

const CATEGORY_META: Record<CategoryKey, { emoji: string; label: string; icon: React.ReactNode }> = {
  ppv_photos: { emoji: "📸", label: "PPV Photos", icon: <Camera className="h-4 w-4" /> },
  ppv_videos: { emoji: "🎥", label: "PPV Videos", icon: <Video className="h-4 w-4" /> },
  main_feed: { emoji: "📱", label: "Main Feed", icon: <Smartphone className="h-4 w-4" /> },
  custom_templates: { emoji: "🎭", label: "Custom Templates", icon: <Theater className="h-4 w-4" /> },
  reels_social: { emoji: "🎬", label: "Reels / Social", icon: <Film className="h-4 w-4" /> },
  seasonal_themed: { emoji: "🔥", label: "Seasonal / Themed", icon: <Flame className="h-4 w-4" /> },
};

const CATEGORY_KEYS: CategoryKey[] = Object.keys(CATEGORY_META) as CategoryKey[];

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const STATUS_LABELS: Record<Status, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
};

const MODEL_COLORS: Record<ModelName, string> = {
  Ashley: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  Willow: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Izzie: "bg-blue-500/20 text-blue-300 border-blue-500/40",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function makeItem(description: string, priority: Priority = "medium", notes: string = ""): ContentItem {
  return { id: generateId(), description, priority, status: "todo", notes };
}

// ─── Default / Starter Data ─────────────────────────────────────────────────

function buildStarterData(): ContentListsData {
  return {
    version: 2,
    models: {
      Ashley: {
        categories: {
          ppv_photos: {
            items: [
              makeItem("Dorm room selfie set — messy bed, laptop, oversized hoodie", "high"),
              makeItem("Cheerleader uniform photo set — pom-poms, high kicks, locker room", "high"),
              makeItem("Library 'study session' — glasses, books, pencil-biting", "medium"),
              makeItem("Sorority party theme — red cups, crop top, fairy lights", "medium"),
              makeItem("Graduation cap & gown reveal set", "low"),
              makeItem("Yoga mat / morning stretch — sports bra & leggings", "medium"),
              makeItem("Bubble bath with textbooks — playful / comedic", "low"),
            ],
          },
          ppv_videos: {
            items: [
              makeItem("'Study break' strip tease — 45-60 sec", "high"),
              makeItem("Cheerleader practice solo — dancing in uniform, 30 sec", "high"),
              makeItem("Getting ready for a party — outfit changes, mirror, 60 sec", "medium"),
              makeItem("Pillow fight POV — playful, 20-30 sec", "medium"),
              makeItem("Shower after gym — steamy, implied, 30-45 sec", "medium"),
              makeItem("ASMR whispering in bed — close-up, 60 sec", "low"),
            ],
          },
          main_feed: {
            items: [
              makeItem("Morning coffee selfie — messy hair, oversized shirt", "high"),
              makeItem("Campus walk photo — casual, backpack, sunglasses", "medium"),
              makeItem("Gym mirror selfie — leggings & sports bra", "high"),
              makeItem("Netflix & chill setup — blanket, snacks, cozy", "medium"),
              makeItem("'Just woke up' no-makeup selfie", "low"),
              makeItem("Studying with glasses on — candid vibe", "medium"),
            ],
          },
          custom_templates: {
            items: [
              makeItem("GFE morning text video — 'good morning babe'", "high"),
              makeItem("Name-drop JOI — personalised with fan's name", "high"),
              makeItem("Outfit try-on by request — fan picks outfits", "medium"),
              makeItem("'Caught in the dorm' roleplay — 30 sec", "medium"),
              makeItem("Personalised study buddy ASMR", "low"),
            ],
          },
          reels_social: {
            items: [
              makeItem("'Day in my life' college montage — TikTok format", "high"),
              makeItem("Outfit of the day transition reel", "medium"),
              makeItem("Dance trend in cheerleader outfit", "high"),
              makeItem("'What I eat in a day' — aesthetic food clips", "low"),
              makeItem("Q&A story slides — 'ask me anything'", "medium"),
            ],
          },
          seasonal_themed: {
            items: [
              makeItem("Spring Break bikini set — poolside, sunscreen", "high"),
              makeItem("Halloween — sexy college costume", "medium"),
              makeItem("Christmas — Santa hat, lingerie, gift unwrap", "medium"),
              makeItem("Valentine's Day — pink lingerie, roses, love letter", "high"),
              makeItem("Back to School — September new-term energy", "low"),
              makeItem("Summer holiday — beach, sun hat, sundress", "medium"),
            ],
          },
        },
        generalNotes: "Ashley's aesthetic is girl-next-door college vibes. Keep it relatable, youthful, and playful. She should feel like the hot girl from your lecture. Warm tones, natural light preferred.",
      },
      Willow: {
        categories: {
          ppv_photos: {
            items: [
              makeItem("Outdoor golden hour shoot — flowing dress, meadow", "high"),
              makeItem("Cozy home — fireplace, blanket, hot chocolate", "high"),
              makeItem("Artistic nude — natural light, window silhouette", "high", "Needs new watermark before releasing"),
              makeItem("Bathtub rose petals — candles, wine glass", "medium"),
              makeItem("Rainy day window — oversized jumper, steamy glass", "medium"),
              makeItem("Bed sheet tangle — white linen, morning sun", "medium"),
              makeItem("Kitchen baking — apron only, flour dusting", "low"),
            ],
          },
          ppv_videos: {
            items: [
              makeItem("Morning stretch in bed — natural light, 30-45 sec", "high"),
              makeItem("Bathtub soak — candles, slow pan, 45-60 sec", "high"),
              makeItem("Oil massage self-care — body close-ups, 30 sec", "medium"),
              makeItem("Dancing in living room — no bra, oversized shirt, 20 sec", "medium"),
              makeItem("Outdoor walk — sundress blowing, 30 sec", "low"),
              makeItem("Reading in lingerie — turning pages, soft music, 45 sec", "low"),
            ],
          },
          main_feed: {
            items: [
              makeItem("Sunrise coffee on the patio — barefoot, dreamy", "high"),
              makeItem("Mirror selfie — cozy outfit, messy bun", "medium"),
              makeItem("Nature walk photo — boots, autumn leaves", "medium"),
              makeItem("Cooking dinner candid — wine glass in hand", "medium"),
              makeItem("'Good morning' face close-up — freckles, no filter", "high"),
              makeItem("Cat/pet cuddle photo — wholesome vibes", "low"),
            ],
          },
          custom_templates: {
            items: [
              makeItem("Girlfriend experience — soft voice 'missing you' video", "high"),
              makeItem("Strip tease by fireplace — cozy setting", "high"),
              makeItem("Name-whisper ASMR — intimate close-up", "medium"),
              makeItem("Bathtub custom — fan picks scenario", "medium"),
              makeItem("Outdoor nude custom — artistic, nature backdrop", "low"),
            ],
          },
          reels_social: {
            items: [
              makeItem("'Aesthetic morning routine' reel — soft piano music", "high"),
              makeItem("Nature photography behind-the-scenes", "medium"),
              makeItem("Hair care routine — showing off red hair", "high"),
              makeItem("Cooking ASMR clip — chopping, sizzling", "low"),
              makeItem("'Outfit check' in mirror — casual to dressed up", "medium"),
            ],
          },
          seasonal_themed: {
            items: [
              makeItem("Autumn leaves outdoor shoot — boots, scarf, bare legs", "high"),
              makeItem("Christmas fireside — red lingerie, fairy lights, stockings", "high"),
              makeItem("Valentine's Day — wine & roses, candlelit bath", "medium"),
              makeItem("Summer garden — sundress, picnic blanket", "medium"),
              makeItem("Halloween — witch / gothic red-haired theme", "medium"),
              makeItem("New Year's Eve — champagne, sparkly outfit", "low"),
            ],
          },
        },
        generalNotes: "Willow's brand is natural, warm, real. Think cottage-core meets intimate. Red hair is her standout feature — always visible. Natural light is essential. IMPORTANT: New watermark needed before releasing artistic content. Avoid over-editing — fans love her 'real' look.",
      },
      Izzie: {
        categories: {
          ppv_photos: {
            items: [
              makeItem("Gym mirror selfie set — pump, sweat, sports bra", "high"),
              makeItem("Military uniform tease — unbuttoned, dog tags visible", "high"),
              makeItem("Tactical gear shoot — boots, camo pants, crop top", "high"),
              makeItem("Locker room after workout — towel, steam", "medium"),
              makeItem("Dog tags & lingerie — contrast of tough and sexy", "medium"),
              makeItem("Boxing gloves / punching bag action shots", "medium"),
              makeItem("Obstacle course / boot camp style — muddy, intense", "low"),
            ],
          },
          ppv_videos: {
            items: [
              makeItem("Workout montage — lifting, squats, abs, 45-60 sec", "high"),
              makeItem("Post-gym shower — steamy, slow-mo water, 30 sec", "high"),
              makeItem("Uniform strip — camo to lingerie, 45 sec", "medium"),
              makeItem("Morning PT routine — push-ups, sit-ups, running, 30 sec", "medium"),
              makeItem("Stretching routine — yoga mat, flexibility, 60 sec", "medium"),
              makeItem("Shadow boxing in sports bra — intense, 20 sec", "low"),
            ],
          },
          main_feed: {
            items: [
              makeItem("Gym check-in selfie — pre-workout pump", "high"),
              makeItem("Healthy meal prep photo — protein, greens", "medium"),
              makeItem("Dog tags casual photo — tank top, jeans", "medium"),
              makeItem("Progress / physique update — motivational caption", "high"),
              makeItem("Hiking / outdoor adventure snap", "low"),
              makeItem("'Just finished training' sweaty selfie", "medium"),
            ],
          },
          custom_templates: {
            items: [
              makeItem("Drill sergeant JOI — bossy, commanding tone", "high"),
              makeItem("Personal trainer custom — 'show me your form'", "high"),
              makeItem("Name-drop workout motivation video", "medium"),
              makeItem("Military roleplay — 'reporting for duty, sir'", "medium"),
              makeItem("Flexing / muscle worship custom", "low"),
            ],
          },
          reels_social: {
            items: [
              makeItem("Workout transformation reel — before/after pump", "high"),
              makeItem("'What I eat in a day' fitness edition", "medium"),
              makeItem("Gym fails / funny moments compilation", "high"),
              makeItem("Military vs civilian outfit transition", "medium"),
              makeItem("Motivational 'get up and train' clip — alarm, bed to gym", "low"),
            ],
          },
          seasonal_themed: {
            items: [
              makeItem("Summer bootcamp outdoor — obstacle course, bikini top", "high"),
              makeItem("Halloween — soldier / zombie soldier costume", "medium"),
              makeItem("Christmas — Santa's little soldier, red & camo", "medium"),
              makeItem("New Year — 'new year, new gains' gym motivation", "medium"),
              makeItem("Valentine's — dog tags + red lingerie, 'soldier of love'", "high"),
              makeItem("Memorial Day / Veterans tribute — respectful but sexy", "low"),
            ],
          },
        },
        generalNotes: "Izzie is the tough-but-hot military fitness girl. AI-generated model — keep content consistent with established look. Emphasise strength, discipline, and the contrast between tough exterior and sexy underneath. Dog tags are her signature prop. High energy, bold captions.",
      },
    },
  };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

function loadData(): ContentListsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === 2) return parsed;
    }
  } catch {
    // ignore
  }
  return buildStarterData();
}

function saveData(data: ContentListsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Components ──────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 uppercase tracking-wider ${PRIORITY_COLORS[priority]}`}>
      {priority}
    </Badge>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const colors: Record<Status, string> = {
    todo: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    done: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors[status]}`}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

interface ContentItemRowProps {
  item: ContentItem;
  isAdmin: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<ContentItem>) => void;
  onDelete: () => void;
}

function ContentItemRow({ item, isAdmin, onToggle, onUpdate, onDelete }: ContentItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(item.description);
  const [editNotes, setEditNotes] = useState(item.notes);
  const [editPriority, setEditPriority] = useState(item.priority);
  const [showNotes, setShowNotes] = useState(false);

  const handleSave = () => {
    onUpdate({ description: editDesc, notes: editNotes, priority: editPriority });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditDesc(item.description);
    setEditNotes(item.notes);
    setEditPriority(item.priority);
    setEditing(false);
  };

  const cycleStatus = () => {
    if (!isAdmin) return;
    const order: Status[] = ["todo", "in-progress", "done"];
    const idx = order.indexOf(item.status);
    onUpdate({ status: order[(idx + 1) % 3] });
  };

  return (
    <div className={`group rounded-lg border border-border/20 p-3 transition-all hover:border-border/40 ${item.status === "done" ? "opacity-60" : ""}`}>
      {editing ? (
        <div className="space-y-2">
          <Input
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="bg-background/50 text-sm"
            placeholder="Description"
          />
          <Input
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="bg-background/50 text-sm"
            placeholder="Notes (optional)"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority:</span>
            {(["high", "medium", "low"] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setEditPriority(p)}
                className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider transition-all ${editPriority === p ? PRIORITY_COLORS[p] : "border-border/20 text-muted-foreground opacity-50 hover:opacity-80"}`}
              >
                {p}
              </button>
            ))}
            <div className="flex-1" />
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 px-2">
              <X className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={handleSave} className="h-7 px-2">
              <Check className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={item.status === "done"}
              onCheckedChange={onToggle}
              disabled={!isAdmin}
              className="data-[state=checked]:bg-green-500/80 data-[state=checked]:border-green-500/80"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {item.description}
              </span>
              <PriorityBadge priority={item.priority} />
              <button onClick={cycleStatus} className="cursor-pointer">
                <StatusBadge status={item.status} />
              </button>
            </div>
            {item.notes && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <StickyNote className="h-3 w-3" />
                {showNotes ? item.notes : "View notes"}
              </button>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="h-7 w-7 p-0">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete} className="h-7 w-7 p-0 text-red-400 hover:text-red-300">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CategorySectionProps {
  categoryKey: CategoryKey;
  data: CategoryData;
  isAdmin: boolean;
  statusFilter: StatusFilter;
  onUpdate: (items: ContentItem[]) => void;
}

function CategorySection({ categoryKey, data, isAdmin, statusFilter, onUpdate }: CategorySectionProps) {
  const meta = CATEGORY_META[categoryKey];
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  const doneCount = data.items.filter((i) => i.status === "done").length;
  const total = data.items.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return data.items;
    return data.items.filter((i) => i.status === statusFilter);
  }, [data.items, statusFilter]);

  const toggleItem = (id: string) => {
    onUpdate(
      data.items.map((i) =>
        i.id === id ? { ...i, status: i.status === "done" ? "todo" : "done" } : i
      )
    );
  };

  const updateItem = (id: string, updates: Partial<ContentItem>) => {
    onUpdate(data.items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteItem = (id: string) => {
    onUpdate(data.items.filter((i) => i.id !== id));
  };

  const addItem = () => {
    if (!newDesc.trim()) return;
    onUpdate([...data.items, makeItem(newDesc.trim(), newPriority)]);
    setNewDesc("");
    setNewPriority("medium");
    setAdding(false);
  };

  return (
    <Card className="glass-card border-border/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="text-lg">{meta.emoji}</span>
            <CardTitle className="text-base">{meta.label}</CardTitle>
            <Badge variant="outline" className="text-[10px] ml-1 border-border/30">
              {doneCount}/{total}
            </Badge>
          </button>
          {isAdmin && !collapsed && (
            <Button size="sm" variant="outline" onClick={() => setAdding(!adding)} className="h-7 text-xs border-border/30">
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          )}
        </div>
        <Progress value={pct} className="h-1.5 mt-2" />
        <span className="text-[10px] text-muted-foreground">{pct}% complete</span>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-2 pt-0">
          {adding && isAdmin && (
            <div className="flex gap-2 items-center p-2 rounded-lg border border-dashed border-border/30">
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="New item description..."
                className="bg-background/50 text-sm flex-1"
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
              <div className="flex gap-1">
                {(["high", "medium", "low"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${newPriority === p ? PRIORITY_COLORS[p] : "border-border/20 text-muted-foreground opacity-50"}`}
                  >
                    {p[0]}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={addItem} className="h-7 px-2">
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 px-2">
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filteredItems.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 text-center italic">
              {statusFilter !== "all" ? `No ${STATUS_LABELS[statusFilter].toLowerCase()} items` : "No items yet"}
            </p>
          )}
          {filteredItems.map((item) => (
            <ContentItemRow
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onToggle={() => toggleItem(item.id)}
              onUpdate={(updates) => updateItem(item.id, updates)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ContentIdeas() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "supervisor";
  const [data, setData] = useState<ContentListsData>(loadData);
  const [activeModel, setActiveModel] = useState<ModelName>("Ashley");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [saved, setSaved] = useState(false);

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveData(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  const modelData = data.models[activeModel];

  const updateCategory = useCallback(
    (catKey: CategoryKey, items: ContentItem[]) => {
      setData((prev) => ({
        ...prev,
        models: {
          ...prev.models,
          [activeModel]: {
            ...prev.models[activeModel],
            categories: {
              ...prev.models[activeModel].categories,
              [catKey]: { items },
            },
          },
        },
      }));
    },
    [activeModel]
  );

  const updateGeneralNotes = useCallback(
    (notes: string) => {
      setData((prev) => ({
        ...prev,
        models: {
          ...prev.models,
          [activeModel]: {
            ...prev.models[activeModel],
            generalNotes: notes,
          },
        },
      }));
    },
    [activeModel]
  );

  // Overall stats for selected model
  const allItems = useMemo(
    () => CATEGORY_KEYS.flatMap((k) => modelData.categories[k].items),
    [modelData]
  );
  const totalItems = allItems.length;
  const doneItems = allItems.filter((i) => i.status === "done").length;
  const inProgressItems = allItems.filter((i) => i.status === "in-progress").length;
  const todoItems = allItems.filter((i) => i.status === "todo").length;
  const overallPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Content Lists</h1>
            <p className="text-muted-foreground text-sm mt-1">
              What to film, categorised by model. Track progress and plan shoots.
            </p>
          </div>
          {saved && (
            <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
              ✓ Saved
            </Badge>
          )}
        </div>
      </div>

      {/* Model Tabs */}
      <div className="flex gap-2">
        {MODELS.map((m) => {
          const mItems = CATEGORY_KEYS.flatMap((k) => data.models[m].categories[k].items);
          const mDone = mItems.filter((i) => i.status === "done").length;
          const mPct = mItems.length > 0 ? Math.round((mDone / mItems.length) * 100) : 0;
          return (
            <button
              key={m}
              onClick={() => setActiveModel(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                activeModel === m
                  ? `${MODEL_COLORS[m]} border-current`
                  : "border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40"
              }`}
            >
              {m}
              <span className="text-[10px] opacity-70">{mPct}%</span>
            </button>
          );
        })}
      </div>

      {/* Stats Bar */}
      <Card className="glass-card border-border/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{activeModel} — Overall Progress</span>
            <span className="text-xs text-muted-foreground">
              {doneItems}/{totalItems} items complete
            </span>
          </div>
          <Progress value={overallPct} className="h-2 mb-3" />
          <div className="flex gap-4 text-xs">
            <span className="text-zinc-400">📋 Todo: {todoItems}</span>
            <span className="text-blue-400">🔄 In Progress: {inProgressItems}</span>
            <span className="text-green-400">✅ Done: {doneItems}</span>
          </div>
        </CardContent>
      </Card>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Filter:</span>
        {(["all", "todo", "in-progress", "done"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              statusFilter === f
                ? "bg-white/10 border-white/20 text-foreground"
                : "border-border/20 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABELS[f as Status]}
          </button>
        ))}
      </div>

      {/* Category Sections */}
      {CATEGORY_KEYS.map((catKey) => (
        <CategorySection
          key={`${activeModel}-${catKey}`}
          categoryKey={catKey}
          data={modelData.categories[catKey]}
          isAdmin={isAdmin}
          statusFilter={statusFilter}
          onUpdate={(items) => updateCategory(catKey, items)}
        />
      ))}

      {/* General Notes Section */}
      <Card className="glass-card border-border/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            {activeModel} — Shooting Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <textarea
              value={modelData.generalNotes}
              onChange={(e) => updateGeneralNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border/20 bg-background/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="General notes for this model's shoots..."
            />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {modelData.generalNotes || "No notes yet."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
