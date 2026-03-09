import { BookOpen, Target, Users, MessageCircle, Star, ChevronRight, AlertTriangle, Zap, Crown } from "lucide-react";

const whaleStages = [
  {
    stage: 1,
    title: "Information Gathering",
    description: "Find out their name, job, location, hobbies, and relationship status. Ask natural questions — don't interrogate.",
    icon: "🔍",
  },
  {
    stage: 2,
    title: "Mirror & Connect",
    description: "Relay their info back as shared interests. Create common ground — \"No way, I love that too!\" Make them feel understood.",
    icon: "🪞",
  },
  {
    stage: 3,
    title: "Paint a Future",
    description: "Give them a vision of what could be. \"If you were here right now...\" Make it personal and vivid. They should feel special.",
    icon: "🎨",
  },
  {
    stage: 4,
    title: "Test the Waters",
    description: "Drop a light flirty comment. DON'T jump straight to explicit content. Gauge their reaction before escalating.",
    icon: "💧",
  },
  {
    stage: 5,
    title: "Navigate Based on Response",
    description: "Read their reply and adapt your approach accordingly. Every response tells you what to do next.",
    icon: "🧭",
  },
];

const responseNavigation = [
  {
    response: "\"You're cheeky\"",
    meaning: "Interested but cautious",
    action: "Slow play — keep building, don't push yet",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    response: "Takes the bait",
    meaning: "Ready and engaged",
    action: "Natural upsell — transition smoothly to premium content",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  {
    response: "\"Too soon\"",
    meaning: "Not warmed up yet",
    action: "Pull back — more rapport building needed, no pressure",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
  },
  {
    response: "Ignores the flirt",
    meaning: "Not ready at all",
    action: "Change topic — build more connection first, try again later",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
  },
];

const conversationRules = [
  { rule: "Never rush a potential whale", detail: "Patience pays 10x. Rushing kills the relationship." },
  { rule: "Store personal info, use it later", detail: "Remember their dog's name, their job, their city. Bring it up days later." },
  { rule: "Paint a future — make them feel special", detail: "They should feel like they're the only one getting this attention." },
  { rule: "Read responses and adapt", detail: "Every message tells you something. Adjust your energy accordingly." },
  { rule: "Mirror their energy", detail: "Match their vibe. If they're chill, be chill. If they're excited, match it." },
  { rule: "Create exclusivity", detail: "\"I don't usually share this, but for you...\" — make them feel chosen." },
  { rule: "Minimum 5-7 messages of rapport before ANY pitch", detail: "Build the connection first. Selling too early = lost revenue long term." },
  { rule: "Always redirect a 'no' to an alternative", detail: "Never shut down the conversation. Offer something else instead." },
];

const ratingTiers = [
  { range: "9 – 10", label: "Elite", description: "Exceptional performance. Bonus eligible.", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: Crown },
  { range: "7.5 – 8.9", label: "Good", description: "Solid performance. Keep it up.", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: Star },
  { range: "6 – 7.4", label: "Needs Work", description: "Below standard. Improvement plan required.", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: AlertTriangle },
  { range: "Below 6", label: "At Risk", description: "Performance review. Immediate improvement needed.", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: AlertTriangle },
];

export default function KnowledgeBase() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Coaching playbook & scoring criteria — study this, live this
        </p>
      </div>

      {/* Whale Creation Guide */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Whale Creation Guide</h2>
            <p className="text-xs text-muted-foreground">
              Turn normal fans into long-term high spenders
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {whaleStages.map((stage) => (
            <div key={stage.stage} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{stage.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Stage {stage.stage}
                    </span>
                    <h3 className="font-semibold text-sm">{stage.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Response Navigation (Stage 5 detail) */}
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-primary" />
            Stage 5 — Response Navigation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {responseNavigation.map((item) => (
              <div key={item.response} className={`p-3 rounded-lg border ${item.bg}`}>
                <p className={`text-sm font-bold ${item.color}`}>{item.response}</p>
                <p className="text-xs text-muted-foreground mt-1">= {item.meaning}</p>
                <p className="text-xs mt-1">→ {item.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Fan Types */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Two Fan Types</h2>
            <p className="text-xs text-muted-foreground">Know who you're talking to</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold">Quick Fans</h3>
              <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                Majority
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                Come in ready to buy — direct and eager
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                Basic sell approach — efficient and straightforward
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                Maximise what you can from each interaction
              </li>
            </ul>
          </div>

          <div className="glass-card p-5 space-y-3 border border-primary/20">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Potential Whales</h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Rare — High Value
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Conversational — they open up personally
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Use the <strong className="text-foreground">FULL whale process</strong> — every stage matters
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <strong className="text-foreground">NEVER rush</strong> — patience = maximum lifetime value
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Conversation Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Conversation Rules</h2>
            <p className="text-xs text-muted-foreground">Non-negotiable standards for every chat</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="space-y-3">
            {conversationRules.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <span className="text-primary font-bold text-sm mt-0.5">{i + 1}.</span>
                <div>
                  <p className="text-sm font-semibold">{item.rule}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Quality Standards</h2>
            <p className="text-xs text-muted-foreground">
              The goal is 10/10 chatting — here's how you're rated
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ratingTiers.map((tier) => (
            <div key={tier.range} className={`p-4 rounded-lg border ${tier.bg}`}>
              <div className="flex items-center gap-2">
                <tier.icon className={`h-4 w-4 ${tier.color}`} />
                <span className={`font-bold text-sm ${tier.color}`}>{tier.range}</span>
                <span className="text-xs bg-background/50 px-2 py-0.5 rounded-full">{tier.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
