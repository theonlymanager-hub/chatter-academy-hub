import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Sun, Ruler, Shirt, Video, CheckCircle, AlertTriangle } from "lucide-react";

const MODELS = ["Ashley", "Willow", "Izzie"];

interface GuidelineSection {
  icon: React.ElementType;
  title: string;
  items: string[];
}

const GENERAL_GUIDELINES: GuidelineSection[] = [
  {
    icon: Camera,
    title: "Camera & Framing",
    items: [
      "Use a tripod or stable surface — NO shaky handheld footage",
      "Film in landscape (16:9) for main feed, portrait (9:16) for stories/reels",
      "Keep subject in the centre or use rule of thirds",
      "Short clips: 10-15 seconds. PPV content: 30-60 seconds medium length",
      "Multiple angles per session — don't film everything from one spot",
      "Close-ups for detail shots, wide for full body / environment",
    ],
  },
  {
    icon: Sun,
    title: "Lighting",
    items: [
      "Natural light is best — film near large windows during golden hour",
      "Ring light as backup — position at eye level, slightly above",
      "NEVER film with a window behind you (backlit = silhouette)",
      "Warm tones preferred — avoid harsh white/blue overhead lights",
      "Check for shadows on face before recording",
      "Consistent lighting across all clips in one session",
    ],
  },
  {
    icon: Ruler,
    title: "Quality Standards",
    items: [
      "Minimum 1080p resolution — 4K preferred",
      "Clean lens before every shoot (fingerprints show up on camera)",
      "No background clutter — clean, aesthetic space only",
      "Audio: no background TV, music, or people talking",
      "Watermark on ALL content (model-specific watermark)",
      "No screenshots of other apps, timestamps, or metadata visible",
    ],
  },
  {
    icon: Shirt,
    title: "Outfits & Styling",
    items: [
      "Minimum 3 outfit changes per shoot session",
      "Include: casual, dressed up, lingerie/intimate, themed",
      "Remove tags and stickers from new clothes",
      "Hair and makeup done BEFORE filming starts",
      "Accessories add variety — glasses, hats, jewellery, props",
      "Check outfit in camera before filming (some patterns look bad on video)",
    ],
  },
  {
    icon: Video,
    title: "Content Types Needed",
    items: [
      "Main feed posts: 2/day minimum (Josh handles posting)",
      "PPV content: 3-5 new pieces per week per model",
      "Custom content: within 5 days of order (7 days = failure)",
      "Voice notes: greetings, flirty, goodnight, aftercare (5 variations each)",
      "Behind-the-scenes clips for OFTV / stories",
      "Selfie-style casual content for mass messages",
    ],
  },
];

const DO_DONT: { do: string[]; dont: string[] } = {
  do: [
    "Film in batches — 1 session = 2+ weeks of content",
    "Save originals in Google Drive immediately after shoot",
    "Label files clearly: MODEL_TYPE_DATE (e.g. Ashley_PPV_20260401)",
    "Communicate with Elle about what's ready and what's needed",
    "Check the client checklist on this dashboard for what's outstanding",
    "Book Airbnb early for location variety",
  ],
  dont: [
    "Don't reuse old content as new — fans notice",
    "Don't film in the same location/outfit repeatedly",
    "Don't send unedited raw footage as final content",
    "Don't film vertically for main feed content (landscape only)",
    "Don't skip watermarking — ever",
    "Don't let customs go past 5 days without escalating",
  ],
};

export default function ContentGuidelines() {
  const { user } = useAuth();
  const [activeModel, setActiveModel] = useState("Ashley");

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Guidelines</h1>
        <p className="text-muted-foreground mt-1">
          Quality standards for all content production. Follow these for every shoot.
        </p>
      </div>

      {/* General Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GENERAL_GUIDELINES.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-white/10 bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Do / Don't */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-green-400">DO</h2>
          </div>
          <ul className="space-y-2">
            {DO_DONT.do.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">DON'T</h2>
          </div>
          <ul className="space-y-2">
            {DO_DONT.dont.map((item, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Visual Examples */}
      <div className="rounded-xl border border-white/10 bg-card p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Examples: Good vs Bad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Good Lighting Example */}
          <div>
            <div className="aspect-video bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400 font-medium">Good Lighting</p>
                <p className="text-xs text-slate-400 mt-1">Natural light, no shadows</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              <strong>✓ Soft natural light from window</strong><br />
              ✓ Even skin tone, no harsh shadows<br />
              ✓ Well-lit background
            </p>
          </div>

          {/* Bad Lighting Example */}
          <div>
            <div className="aspect-video bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-400 font-medium">Bad Lighting</p>
                <p className="text-xs text-slate-400 mt-1">Backlit, dark shadows</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              <strong>✗ Window behind subject (silhouette)</strong><br />
              ✗ Face too dark, harsh shadows<br />
              ✗ Overexposed background
            </p>
          </div>

          {/* Good Framing Example */}
          <div>
            <div className="aspect-video bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400 font-medium">Good Framing</p>
                <p className="text-xs text-slate-400 mt-1">Stable, centered, clean background</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              <strong>✓ Subject centered, rule of thirds</strong><br />
              ✓ Clean, uncluttered background<br />
              ✓ Stable camera (tripod)
            </p>
          </div>

          {/* Bad Framing Example */}
          <div>
            <div className="aspect-video bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-400 font-medium">Bad Framing</p>
                <p className="text-xs text-slate-400 mt-1">Messy background, shaky</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              <strong>✗ Cluttered background (clothes, mess)</strong><br />
              ✗ Subject off-center, awkward crop<br />
              ✗ Shaky handheld footage
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-slate-300">
            <strong className="text-blue-400">📸 Real examples coming soon:</strong> Luke will upload reference images/clips to replace these placeholders. Check back here for actual good/bad comparison shots.
          </p>
        </div>
      </div>

      {/* Model-specific notes */}
      <div className="rounded-xl border border-white/10 bg-card p-5">
        <h2 className="text-lg font-semibold text-white mb-3">Model-Specific Notes</h2>
        <div className="flex gap-2 mb-4">
          {MODELS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveModel(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeModel === m
                  ? "bg-cyan-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-300 space-y-2">
          {activeModel === "Ashley" && (
            <>
              <p><strong>Theme:</strong> College girl aesthetic. Casual, relatable, girl-next-door vibe.</p>
              <p><strong>Content style:</strong> Selfies, mirror shots, study/bedroom settings. Mix cute with spicy.</p>
              <p><strong>Wardrobe:</strong> Crop tops, skirts, oversized hoodies, glasses, lace.</p>
              <p><strong>Note:</strong> AI-generated model — maintain consistent face/body across all content.</p>
            </>
          )}
          {activeModel === "Willow" && (
            <>
              <p><strong>Theme:</strong> Redhead / ginger. Bold, confident energy.</p>
              <p><strong>Content style:</strong> More assertive poses. Natural settings work well.</p>
              <p><strong>Wardrobe:</strong> Earth tones, green, black. Lingerie sets that complement red hair.</p>
              <p><strong>Note:</strong> Real model (Mia). New watermark needed — fans spotted content overlap. Prioritise unique content ASAP.</p>
            </>
          )}
          {activeModel === "Izzie" && (
            <>
              <p><strong>Theme:</strong> Military / uniform aesthetic. Disciplined but playful.</p>
              <p><strong>Content style:</strong> Uniform-based, fitness, authority vibe.</p>
              <p><strong>Wardrobe:</strong> Camo, boots, dog tags, fitted athletic wear.</p>
              <p><strong>Note:</strong> AI-generated model — keep military theme consistent across all content.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
