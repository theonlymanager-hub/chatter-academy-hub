import { modelColors } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Camera, Tag, BookOpen, MessageCircle, AlertTriangle } from "lucide-react";

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
  warning?: string;
}

const models: ModelProfile[] = [
  {
    id: "1",
    name: "Ashley Morris",
    username: "ashleymorris",
    perceivedAge: 21,
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
  },
  {
    id: "2",
    name: "Izzy",
    username: "myizzyreal",
    perceivedAge: 23,
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
  },
  {
    id: "3",
    name: "Willow",
    username: "ginger5foot",
    perceivedAge: 22,
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
  },
  {
    id: "4",
    name: "Lucinda Bleu",
    username: "lucibleu",
    perceivedAge: 24,
    location: "London, UK",
    niche: "Goth / alternative",
    background:
      "Dark aesthetic, vinyl collector, loves live music, sketching, vintage shopping.",
    contentStyle: "Dark/moody, alternative fashion",
    keyFacts: [
      "Into The Cure",
      "Gets piercings",
      "Goes to gigs",
      "Sketches by candlelight",
      "Vintage shopping",
    ],
    warning: "May be dropped soon if traffic doesn't improve",
  },
];

export default function ClientProfiles() {
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
                  <h2 className="text-xl font-bold truncate">{model.name}</h2>
                  <p className="text-sm text-muted-foreground">@{model.username}</p>
                </div>
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
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{model.perceivedAge}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{model.location}</span>
                  </div>
                </div>

                {/* Background */}
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Background</p>
                      <p className="text-sm">{model.background}</p>
                    </div>
                  </div>
                </div>

                {/* Content style */}
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Content:</span>
                  <span>{model.contentStyle}</span>
                </div>

                {/* Key Facts */}
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium mb-2">
                        Key Facts for Chatters
                      </p>
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
                    </div>
                  </div>
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
