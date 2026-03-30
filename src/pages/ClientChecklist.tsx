import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Camera, Upload, Link, ExternalLink } from "lucide-react";

// This page is client-facing — NO agency branding, NO admin features
// Accessed via: /client-checklist?model=ashley (or willow, izzie)

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  example?: string;
  uploadFolder?: string;
  completed: boolean;
}

const STORAGE_KEY = "client-checklist-data";

const DEFAULT_ITEMS: Record<string, ChecklistItem[]> = {
  ashley: [
    { id: "a1", category: "PPV Content", title: "Bedroom tease video (30s-1min)", description: "Lying on bed, shy eye contact, slowly teasing. College dorm vibe.", completed: false },
    { id: "a2", category: "PPV Content", title: "Post-shower towel strip", description: "Coming out of shower in towel, nervous energy, camera on desk/shelf.", completed: false },
    { id: "a3", category: "PPV Content", title: "Study desk to bedroom transition", description: "Start studying, get distracted, move to bed. Shy progression.", completed: false },
    { id: "a4", category: "Selfies/Photos", title: "Morning bed selfies (5+)", description: "Just woke up, messy hair, natural light. Cozy and sleepy vibe.", completed: false },
    { id: "a5", category: "Selfies/Photos", title: "Outfit of the day pics (3+)", description: "Different casual outfits — loungewear, going out, sporty.", completed: false },
    { id: "a6", category: "Selfies/Photos", title: "Mirror selfies in underwear (3+)", description: "Bedroom mirror, standing or sitting on bed. Shy but cute.", completed: false },
    { id: "a7", category: "Voice Notes", title: "'Good morning' sleepy voice", description: "30 seconds, just woken up, yawning, sweet and sleepy.", completed: false },
    { id: "a8", category: "Voice Notes", title: "'Thinking about you' whisper", description: "15-30 seconds, soft voice, like texting someone you like.", completed: false },
    { id: "a9", category: "Voice Notes", title: "'I can't believe I'm doing this' giggle", description: "Nervous giggle, like she's about to do something naughty.", completed: false },
    { id: "a10", category: "Lifestyle", title: "Making coffee / cooking clip", description: "In kitchen, casual clothes, natural and relaxed.", completed: false },
    { id: "a11", category: "Lifestyle", title: "Walking around casually", description: "Just moving through the space in underwear/loungewear. Candid.", completed: false },
    { id: "a12", category: "Verification", title: "Verification photos (2+)", description: "Clear face, holding today's date on paper. Different angles.", completed: false },
  ],
  izzie: [
    { id: "i1", category: "PPV Content", title: "Post-workout tease (sports bra removal)", description: "Just finished training, sweaty, confident. Remove sports bra slowly.", completed: false },
    { id: "i2", category: "PPV Content", title: "Shower after training", description: "Stepping into shower, confident energy. Camera on counter.", completed: false },
    { id: "i3", category: "PPV Content", title: "Confident strip", description: "Standing, direct eye contact, no shyness. Military confidence.", completed: false },
    { id: "i4", category: "Selfies/Photos", title: "Gym mirror selfies (5+)", description: "Sports bra, leggings, strong poses. Confident, direct eye contact.", completed: false },
    { id: "i5", category: "Selfies/Photos", title: "Dog tags / military aesthetic (3+)", description: "Dog tags visible, tough but sexy. Tank top or sports bra.", completed: false },
    { id: "i6", category: "Selfies/Photos", title: "Post-workout sweaty selfies (3+)", description: "Flushed, sweaty, looking strong and confident.", completed: false },
    { id: "i7", category: "Voice Notes", title: "'Rise and shine soldier' morning", description: "Commanding, confident, like a drill sergeant but flirty.", completed: false },
    { id: "i8", category: "Voice Notes", title: "'Mission briefing' tease", description: "15-30 seconds, telling them what they're about to see.", completed: false },
    { id: "i9", category: "Lifestyle", title: "Stretching / warm-up clip", description: "On yoga mat or floor, athletic wear. Strong and flexible.", completed: false },
    { id: "i10", category: "Lifestyle", title: "Protein shake / healthy meal", description: "In kitchen, sporty outfit. Healthy lifestyle vibe.", completed: false },
    { id: "i11", category: "Verification", title: "Verification photos (2+)", description: "Clear face, holding today's date on paper. Different angles.", completed: false },
  ],
  willow: [
    { id: "w1", category: "PPV Content", title: "Playful strip tease", description: "Fun energy, teasing, giggling. Pillow fight vibe.", completed: false },
    { id: "w2", category: "PPV Content", title: "Bath/shower content", description: "Bubble bath or shower with steam. Relaxed and flirty.", completed: false },
    { id: "w3", category: "PPV Content", title: "Cooking in underwear tease", description: "In kitchen, apron or just underwear, being playful.", completed: false },
    { id: "w4", category: "Selfies/Photos", title: "Flirty mirror selfies (5+)", description: "Tongue out, winking, peace signs. Bright and fun energy.", completed: false },
    { id: "w5", category: "Selfies/Photos", title: "Red lingerie photos (3+)", description: "To match the redhead brand. Different poses.", completed: false },
    { id: "w6", category: "Selfies/Photos", title: "Casual / cozy photos (3+)", description: "Oversized jumper, messy bun, holding a mug. Cozy vibes.", completed: false },
    { id: "w7", category: "Voice Notes", title: "'Hey you' flirty greeting", description: "Playful and cheeky, like texting someone you fancy.", completed: false },
    { id: "w8", category: "Voice Notes", title: "'Guess what I'm wearing' tease", description: "Giggling, teasing, making them guess.", completed: false },
    { id: "w9", category: "Lifestyle", title: "Dancing / getting ready clip", description: "Music playing, getting ready for a night out. Fun energy.", completed: false },
    { id: "w10", category: "Lifestyle", title: "Yoga / stretching", description: "On mat, relaxed, flexible. Natural and calm.", completed: false },
    { id: "w11", category: "Verification", title: "Verification photos (2+)", description: "Clear face, holding today's date on paper. Different angles.", completed: false },
  ],
};

const DRIVE_LINKS: Record<string, string> = {
  ashley: "https://drive.google.com/drive/folders/1pEav3u8dVuWfe3P-pMLFiRzjL1hwb8ca",
  izzie: "https://drive.google.com/drive/folders/1gsSiL3gOO4XVU7OgAjDK710qb6A5zrJ4",
  willow: "https://drive.google.com/drive/folders/1SdLKOjpokxnMfzD63CgFy60w9DuE7YsH",
};

const MODEL_NAMES: Record<string, string> = {
  ashley: "Ashley",
  izzie: "Izzie",
  willow: "Willow",
};

export default function ClientChecklist() {
  const params = new URLSearchParams(window.location.search);
  const modelKey = (params.get("model") || "ashley").toLowerCase();
  const modelName = MODEL_NAMES[modelKey] || "Ashley";
  const driveLink = DRIVE_LINKS[modelKey] || "";
  
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-${modelKey}`);
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { setItems(DEFAULT_ITEMS[modelKey] || []); }
    } else {
      setItems(DEFAULT_ITEMS[modelKey] || []);
    }
  }, [modelKey]);

  const toggleItem = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    localStorage.setItem(`${STORAGE_KEY}-${modelKey}`, JSON.stringify(updated));
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white p-6 max-w-3xl mx-auto">
      {/* Header — NO agency branding */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{modelName}'s Content Checklist</h1>
        <p className="text-gray-400 mt-1">Tick off each item as you complete it. Upload finished content to the Drive folder below.</p>
        
        {/* Upload folder link */}
        {driveLink && (
          <a
            href={driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Content to Drive
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="font-bold">{completedCount}/{totalCount} ({progress}%)</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist by category */}
      {categories.map(category => (
        <div key={category} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Camera className="h-4 w-4" />
            {category}
          </h2>
          <div className="space-y-2">
            {items.filter(i => i.category === category).map(item => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  item.completed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50'
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-start gap-3">
                  {item.completed ? (
                    <CheckSquare className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
        Questions? Message your contact directly.
      </div>
    </div>
  );
}
