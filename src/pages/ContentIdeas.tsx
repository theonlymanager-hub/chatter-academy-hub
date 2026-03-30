import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const MODELS = ["Ashley", "Willow", "Izzie"];
const STORAGE_KEY = "content_ideas_notes";

interface NotesData {
  [model: string]: string;
}

function loadNotes(): NotesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: NotesData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function ContentIdeas() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "supervisor";
  const [notes, setNotes] = useState<NotesData>(loadNotes);
  const [activeModel, setActiveModel] = useState("Ashley");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveNotes(notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes]);

  const updateNote = (model: string, value: string) => {
    setNotes((prev) => ({ ...prev, [model]: value }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Content Ideas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Brainstorm content ideas per model — just type
            </p>
          </div>
          {saved && (
            <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      {/* Model tabs */}
      <div className="flex gap-2">
        {MODELS.map((m) => (
          <button
            key={m}
            onClick={() => setActiveModel(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeModel === m
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Notes area */}
      <div className="glass-card border border-border/20 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border/20 flex items-center justify-between">
          <h2 className="font-bold text-lg">{activeModel}</h2>
          <span className="text-xs text-muted-foreground">Auto-saves as you type</span>
        </div>
        <textarea
          value={notes[activeModel] || ""}
          onChange={(e) => updateNote(activeModel, e.target.value)}
          placeholder={`Brainstorm content ideas for ${activeModel}...\n\nPhoto sets needed:\n- \n\nVideo ideas:\n- \n\nPPV concepts:\n- \n\nNotes:\n- `}
          className="w-full min-h-[500px] p-5 bg-transparent text-sm leading-relaxed resize-y focus:outline-none placeholder:text-muted-foreground/30"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
