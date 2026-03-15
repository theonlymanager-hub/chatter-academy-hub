import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { modelColors } from "@/lib/mock-data";
import { Plus, Trash2, Upload, X, Eye, AlertTriangle, CheckCircle } from "lucide-react";

interface FeedbackEntry {
  id: string;
  tab: "bad" | "good";
  imageData: string; // base64 data URL
  description: string;
  chatterName: string;
  model: string;
  date: string;
}

const STORAGE_KEY = "chat-feedback-data";

const MODEL_OPTIONS = ["Izzy", "Willow", "Lucinda Bleu", "Ashley Morris"];
const CHATTER_OPTIONS = ["Marc", "JD", "Jemimah", "KC", "Jane"];

export default function ChatFeedback() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canAdd = user?.role === "admin" || user?.role === "supervisor";

  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab] = useState<"bad" | "good">("bad");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formChatter, setFormChatter] = useState("");
  const [formModel, setFormModel] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        setEntries([]);
      }
    }
  }, []);

  const saveEntries = useCallback((data: FeedbackEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setEntries(data);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addEntry = () => {
    if (!formImage || !formDescription || !formChatter || !formModel) return;
    const newEntry: FeedbackEntry = {
      id: Date.now().toString(),
      tab: formTab,
      imageData: formImage,
      description: formDescription,
      chatterName: formChatter,
      model: formModel,
      date: new Date().toISOString().split("T")[0],
    };
    const updated = [newEntry, ...entries];
    saveEntries(updated);
    setFormImage("");
    setFormDescription("");
    setFormChatter("");
    setFormModel("");
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
  };

  const renderEntries = (tab: "bad" | "good") => {
    const filtered = entries.filter(e => e.tab === tab);
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
                {/* Screenshot */}
                <div className="shrink-0 md:w-[320px]">
                  <img
                    src={entry.imageData}
                    alt="Chat screenshot"
                    className="rounded-lg border border-border/50 w-full object-contain max-h-[400px]"
                  />
                </div>

                {/* Description */}
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
                      {entry.chatterName}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
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

      {/* Add Form */}
      {showForm && canAdd && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">Add Chat Feedback</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Type</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={formTab === "bad" ? "destructive" : "outline"}
                  onClick={() => setFormTab("bad")}
                  className="flex-1 text-xs"
                >
                  ❌ Bad Example
                </Button>
                <Button
                  size="sm"
                  variant={formTab === "good" ? "default" : "outline"}
                  onClick={() => setFormTab("good")}
                  className={`flex-1 text-xs ${formTab === "good" ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  ✅ Good Example
                </Button>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Chatter</label>
              <select
                value={formChatter}
                onChange={e => setFormChatter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select chatter...</option>
                {CHATTER_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model Account</label>
              <select
                value={formModel}
                onChange={e => setFormModel(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select model...</option>
                {MODEL_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">Screenshot</label>
            {formImage ? (
              <div className="relative inline-block">
                <img src={formImage} alt="Preview" className="rounded-lg border border-border/50 max-h-[200px]" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => setFormImage("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase block mb-1">
              What went {formTab === "bad" ? "wrong" : "right"}? (Be specific)
            </label>
            <Textarea
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder={formTab === "bad"
                ? "e.g., Fan was clearly engaged and asking questions but chatter let them go to sleep without sending a PPV or teaser. Zero monetization attempt..."
                : "e.g., Great use of personalization — referenced the fan's football team, built rapport, then naturally transitioned to a PPV tease..."
              }
              className="min-h-[120px]"
            />
          </div>

          <Button
            onClick={addEntry}
            disabled={!formImage || !formDescription || !formChatter || !formModel}
            className="w-full"
          >
            Add to {formTab === "bad" ? "Bad Examples" : "Good Examples"}
          </Button>
        </div>
      )}

      {/* Tabs */}
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

        <TabsContent value="bad" className="mt-4">
          {renderEntries("bad")}
        </TabsContent>

        <TabsContent value="good" className="mt-4">
          {renderEntries("good")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
