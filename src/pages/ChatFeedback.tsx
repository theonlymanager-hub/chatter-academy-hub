import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { modelColors } from "@/lib/mock-data";
import { Plus, Trash2, Upload, X, Eye, AlertTriangle, CheckCircle, Loader2, ZoomIn } from "lucide-react";
import { toast } from "sonner";

// Lightbox component for expanding screenshots
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-50">
        <X className="h-8 w-8" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

interface FeedbackEntry {
  id: string;
  tab: "bad" | "good";
  image_url: string;
  description: string;
  chatter_name: string;
  model: string;
  created_at: string;
}

const MODEL_OPTIONS = ["Izzy", "Willow", "Lucinda Bleu", "Ashley Morris"];
const CHATTER_OPTIONS = ["Marc", "JD", "Jemimah", "KC", "Jane"];

export default function ChatFeedback() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canAdd = user?.role === "admin" || user?.role === "supervisor";

  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab] = useState<"bad" | "good">("bad");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [formDescription, setFormDescription] = useState("");
  const [formChatter, setFormChatter] = useState("");
  const [formModel, setFormModel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("chat_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chat feedback:", error);
      // Fall back to localStorage
      const saved = localStorage.getItem("chat-feedback-data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEntries(parsed.map((p: any) => ({
            id: p.id,
            tab: p.tab,
            image_url: p.imageData || p.image_url,
            description: p.description,
            chatter_name: p.chatterName || p.chatter_name,
            model: p.model,
            created_at: p.date || p.created_at,
          })));
        } catch { setEntries([]); }
      }
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        URL.revokeObjectURL(url);
        resolve(compressed);
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (formImages.length + files.length > 5) {
      toast.error("Maximum 5 images per entry.");
      return;
    }
    for (const file of files) {
      if (file.size > 5000000) {
        toast.error(`${file.name} is too large (max 5MB per image).`);
        continue;
      }
      const compressed = await compressImage(file);
      setFormImages(prev => [...prev, compressed]);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // Parse image_url field — supports both single base64 string and JSON array
  const getImages = (imageUrl: string): string[] => {
    if (!imageUrl) return [];
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [imageUrl];
  };

  const addEntry = async () => {
    if (!formImages.length || !formDescription || !formChatter || !formModel) return;
    setSubmitting(true);

    const imageData = formImages.length === 1 ? formImages[0] : JSON.stringify(formImages);

    const { error } = await (supabase as any)
      .from("chat_feedback")
      .insert({
        tab: formTab,
        image_url: imageData,
        description: formDescription,
        chatter_name: formChatter,
        model: formModel,
      });

    if (error) {
      console.error("Insert error:", error);
      toast.error("Failed to save. Using local backup.");
      // Fallback to localStorage
      const saved = localStorage.getItem("chat-feedback-data");
      const existing = saved ? JSON.parse(saved) : [];
      existing.unshift({
        id: Date.now().toString(),
        tab: formTab,
        imageData: imageData,
        description: formDescription,
        chatterName: formChatter,
        model: formModel,
        date: new Date().toISOString().split("T")[0],
      });
      localStorage.setItem("chat-feedback-data", JSON.stringify(existing));
    } else {
      toast.success("Feedback entry added!");
    }

    setFormImages([]);
    setFormDescription("");
    setFormChatter("");
    setFormModel("");
    setShowForm(false);
    setSubmitting(false);
    fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    const { error } = await (supabase as any)
      .from("chat_feedback")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    } else {
      toast.success("Entry deleted");
      fetchEntries();
    }
  };

  const renderEntries = (tab: "bad" | "good") => {
    const filtered = entries.filter(e => e.tab === tab);
    if (loading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {tab === "bad" ? "bad" : "good"} examples yet.</p>
          {canAdd && <p className="text-xs mt-1">Add one using the button above.</p>}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {filtered.map(entry => {
          const color = modelColors[entry.model] || "217 91% 60%";
          return (
            <div key={entry.id} className="glass-card p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {entry.image_url && (
                <div className="shrink-0 md:w-[320px] flex flex-col gap-2">
                  {getImages(entry.image_url).map((imgSrc, idx) => (
                    <div key={idx} className="relative group cursor-pointer" onClick={() => setLightboxImage(imgSrc)}>
                      <img
                        src={imgSrc}
                        alt={`Chat screenshot ${idx + 1}`}
                        className="rounded-lg border border-border/50 w-full object-contain max-h-[400px] transition-opacity group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/60 rounded-full p-2">
                          <ZoomIn className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: `hsl(${color} / 0.4)`, color: `hsl(${color})` }}
                    >
                      {entry.model}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {entry.chatter_name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString("en-GB")}
                    </span>
                    {tab === "bad" ? (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <AlertTriangle className="h-3 w-3" /> BAD EXAMPLE
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] gap-1 bg-green-600/20 text-green-400 border-green-500/30">
                        <CheckCircle className="h-3 w-3" /> GOOD EXAMPLE
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-sm whitespace-pre-wrap">{entry.description}</p>
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-xs gap-1"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat Feedback Board</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real examples from real conversations — learn what works and what doesn't
          </p>
        </div>
        {canAdd && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
            variant={showForm ? "outline" : "default"}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Example"}
          </Button>
        )}
      </div>

      {showForm && canAdd && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">Add Chat Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Type</label>
              <div className="flex gap-2">
                <Button size="sm" variant={formTab === "bad" ? "destructive" : "outline"}
                  onClick={() => setFormTab("bad")} className="flex-1 text-xs">
                  ❌ Bad Example
                </Button>
                <Button size="sm" variant={formTab === "good" ? "default" : "outline"}
                  onClick={() => setFormTab("good")}
                  className={`flex-1 text-xs ${formTab === "good" ? "bg-green-600 hover:bg-green-700" : ""}`}>
                  ✅ Good Example
                </Button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Chatter</label>
              <select value={formChatter} onChange={e => setFormChatter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select chatter...</option>
                {CHATTER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model Account</label>
              <select value={formModel} onChange={e => setFormModel(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select model...</option>
                {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Screenshots ({formImages.length}/5)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formImages.map((img, idx) => (
                <div key={idx} className="relative inline-block">
                  <img src={img} alt={`Preview ${idx + 1}`} className="rounded-lg border border-border/50 max-h-[120px]" />
                  <Button size="sm" variant="destructive" className="absolute top-1 right-1 h-5 w-5 p-0"
                    onClick={() => setFormImages(prev => prev.filter((_, i) => i !== idx))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            {formImages.length < 5 && (
              <label className="flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formImages.length === 0 ? 'Click to upload screenshots (max 5MB each, up to 5)' : 'Add more screenshots'}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">
              What went {formTab === "bad" ? "wrong" : "right"}? (Be specific)
            </label>
            <Textarea value={formDescription} onChange={e => setFormDescription(e.target.value)}
              placeholder={formTab === "bad"
                ? "e.g., Fan was clearly engaged and asking questions but chatter let them go to sleep without sending a PPV or teaser..."
                : "e.g., Great use of personalization — referenced the fan's football team, built rapport, then naturally transitioned to a PPV tease..."
              } className="min-h-[120px]" />
          </div>

          <Button onClick={addEntry} disabled={!formImages.length || !formDescription || !formChatter || !formModel || submitting}
            className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add to {formTab === "bad" ? "Bad Examples" : "Good Examples"}
          </Button>
        </div>
      )}

      <Tabs defaultValue="bad" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bad" className="gap-2">
            ❌ What NOT to Do
            <Badge variant="destructive" className="text-[10px] ml-1">
              {entries.filter(e => e.tab === "bad").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="good" className="gap-2">
            ✅ Good Examples
            <Badge className="text-[10px] ml-1 bg-green-600/20 text-green-400">
              {entries.filter(e => e.tab === "good").length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bad" className="mt-4">{renderEntries("bad")}</TabsContent>
        <TabsContent value="good" className="mt-4">{renderEntries("good")}</TabsContent>
      </Tabs>

      {lightboxImage && (
        <ImageLightbox src={lightboxImage} alt="Chat screenshot" onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
}
