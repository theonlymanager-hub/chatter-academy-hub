import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, X, Search, Play, Video, ChevronDown, ChevronUp } from "lucide-react";

interface TrainingVideo {
  id: string;
  title: string;
  category: string;
  summary: string;
  videoUrl: string;
  addedBy: string;
  addedAt: string;
}

const STORAGE_KEY = "training-videos-v1";

const CATEGORIES = [
  { value: "re-engagement", label: "🔄 Re-engagement", desc: "Dealing with fans who left and came back" },
  { value: "rapport-building", label: "🤝 Rapport Building", desc: "Building genuine connection before selling" },
  { value: "ppv-timing", label: "💰 PPV Timing", desc: "When and how to send PPVs" },
  { value: "fan-energy", label: "🎯 Reading Fan Energy", desc: "Matching the fan's mood and signals" },
  { value: "whale-management", label: "🐋 Whale Management", desc: "Handling high-value fans" },
  { value: "sexting", label: "🔥 Sexting Quality", desc: "Building scenarios and escalation" },
  { value: "objection-handling", label: "🛡️ Objection Handling", desc: "When fans say it's too expensive" },
  { value: "upselling", label: "📈 Upselling", desc: "Turning small buys into bigger ones" },
  { value: "mistakes", label: "❌ What NOT to Do", desc: "Common mistakes to avoid" },
  { value: "general", label: "📚 General", desc: "Other training content" },
];

export default function TrainingVideos() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor";

  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formSummary, setFormSummary] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setVideos(JSON.parse(saved)); } catch { setVideos([]); }
    }
  }, []);

  const save = useCallback((data: TrainingVideo[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setVideos(data);
  }, []);

  const addVideo = () => {
    if (!formTitle.trim() || !formSummary.trim()) return;
    const video: TrainingVideo = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      category: formCategory,
      summary: formSummary.trim(),
      videoUrl: formVideoUrl.trim(),
      addedBy: user?.displayName || user?.username || "Unknown",
      addedAt: new Date().toISOString().split("T")[0],
    };
    save([video, ...videos]);
    setFormTitle("");
    setFormSummary("");
    setFormVideoUrl("");
    setShowForm(false);
  };

  const deleteVideo = (id: string) => {
    save(videos.filter(v => v.id !== id));
  };

  let filtered = videos;
  if (filterCategory !== "all") filtered = filtered.filter(v => v.category === filterCategory);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(v => v.title.toLowerCase().includes(q) || v.summary.toLowerCase().includes(q));
  }

  // Group by category
  const grouped: Record<string, TrainingVideo[]> = {};
  for (const v of filtered) {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category].push(v);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Training Videos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real chat case studies with analysis — watch before every shift
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Add Video"}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{videos.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Total Videos</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{videos.filter(v => v.category === "mistakes").length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">What NOT to Do</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{videos.filter(v => v.category === "rapport-building" || v.category === "ppv-timing").length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Core Skills</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{new Set(videos.map(v => v.category)).size}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Categories</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">New Training Video</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Title</label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g., Dealing with a lapsed spender who returns" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Category</label>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Video URL (Google Drive, YouTube, etc.)</label>
            <Input value={formVideoUrl} onChange={e => setFormVideoUrl(e.target.value)}
              placeholder="https://drive.google.com/file/... or leave blank to add later" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Summary & Key Takeaways</label>
            <Textarea value={formSummary} onChange={e => setFormSummary(e.target.value)}
              placeholder="What happens in this video? What's the main lesson? What should the chatter do differently?"
              className="min-h-[120px]" />
          </div>
          <Button onClick={addVideo} disabled={!formTitle.trim() || !formSummary.trim()}>
            Add Training Video
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search videos..." className="pl-9" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Category sections */}
      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Video className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No training videos yet. {canManage ? "Add one to get started!" : "Check back soon."}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, vids]) => {
          const catInfo = CATEGORIES.find(c => c.value === cat);
          return (
            <div key={cat} className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {catInfo?.label || cat}
                <Badge variant="outline" className="text-xs">{vids.length} video{vids.length !== 1 ? "s" : ""}</Badge>
              </h2>
              <p className="text-sm text-muted-foreground -mt-2">{catInfo?.desc}</p>
              {vids.map(video => {
                const isExpanded = expandedId === video.id;
                return (
                  <div key={video.id} className="glass-card overflow-hidden">
                    <div className="p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : video.id)}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            <Play className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{video.title}</h3>
                            <p className="text-[10px] text-muted-foreground">
                              Added by {video.addedBy} · {video.addedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canManage && (
                            <Button size="sm" variant="ghost" className="text-red-400 h-8 w-8 p-0"
                              onClick={(e) => { e.stopPropagation(); deleteVideo(video.id); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/20 pt-3 space-y-3">
                        <p className="text-sm whitespace-pre-wrap">{video.summary}</p>
                        {video.videoUrl && (
                          <a href={video.videoUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                            <Play className="h-4 w-4" /> Watch Video
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
