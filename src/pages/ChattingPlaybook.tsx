import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, TrendingUp, Crown, MessageSquare, DollarSign, Heart, AlertTriangle, Zap, User } from "lucide-react";

const SECTIONS = [
  {
    id: "flow",
    label: "Conversation Flow",
    icon: <MessageSquare className="h-4 w-4" />,
    content: [
      {
        title: "The 5-Message Rule",
        body: "NEVER send a PPV until you've exchanged at least 5 engaged messages with the fan. 'Engaged' means the fan is actively replying with more than one-word answers. If they're giving you 'lol' or 'nice', they're NOT engaged yet.",
      },
      {
        title: "Open-Ended Questions",
        body: "Every message should end with a question or hook. Dead responses kill conversations. Instead of 'thanks babe 😘', try 'thanks babe 😘 what are you up to tonight? I'm so bored...' — give them something to reply to.",
      },
      {
        title: "Mirror Their Energy",
        body: "If a fan sends 3 sentences, don't reply with 1 word. Match their effort. If they're being flirty, be flirty back. If they're chatty, be chatty. The fan sets the pace, you match and slightly escalate.",
      },
      {
        title: "The Tension Build",
        body: "Don't rush to explicit content. Build anticipation: casual → flirty → suggestive → explicit. Each step should feel natural. The longer the build, the more they'll pay when you finally send content.",
      },
      {
        title: "Recovery When They Go Quiet",
        body: "If a fan stops replying: wait 2 hours, then send something casual and personal — NOT a PPV. 'Hey, just thinking about you... hope your day is going well 💕' works better than 'I made something special for you...'",
      },
    ],
  },
  {
    id: "ppv",
    label: "PPV Timing",
    icon: <DollarSign className="h-4 w-4" />,
    content: [
      {
        title: "When to Send PPV",
        body: "Only after 5+ engaged fan replies. Fan must be showing buying signals: compliments, asking for more, tipping, or explicitly asking for content. If they haven't done any of these, they're not ready.",
      },
      {
        title: "PPV Pricing Ladder",
        body: "Start low, build up: $12 tease → $15 strip/shower → $18 solo → $25+ special. NEVER start with the expensive stuff. Let them get used to buying, then gradually increase.",
      },
      {
        title: "After They Buy",
        body: "After a purchase: THANK THEM genuinely, chat for a bit, make them feel special. Don't immediately send another PPV. Wait at least 5-10 more messages. The worst thing you can do is make them feel like an ATM.",
      },
      {
        title: "If They Say No",
        body: "Never push. Say 'no worries babe, it's not going anywhere 😘' and continue the conversation naturally. Try again MUCH later — next session or next day. Pushing = losing the fan permanently.",
      },
      {
        title: "PPV Message Framing",
        body: "Frame PPVs as exclusive/personal, not transactional. 'I was thinking about you and recorded something...' beats 'New content available!' Make them feel like it was made FOR THEM.",
      },
    ],
  },
  {
    id: "whale",
    label: "Whale Handling",
    icon: <Crown className="h-4 w-4" />,
    content: [
      {
        title: "Identifying Whales",
        body: "A whale is any fan who has spent $200+ total OR tips $50+ in a single session. Check fan notes for spending history. These fans get PRIORITY — always reply to whales first, even if other convos are waiting.",
      },
      {
        title: "Whale Communication Style",
        body: "Whales want to feel special and exclusive. Use their NAME. Reference past conversations. Remember their interests (check notes). 'Hey [name], I remember you said you liked...' — this is what keeps them spending.",
      },
      {
        title: "Upselling to Whales",
        body: "Whales are the ones who will buy $500-2K customs. But you need to BUILD to it. Start with standard PPVs, then customs ($50-100), then suggest a 'VIP experience' or 'something really special just for you.' The pitch: 'I've never done this for anyone else...'",
      },
      {
        title: "VIP Treatment Package",
        body: "For $500-2K, offer: personalised video saying their name, voice notes, exclusive photos they'll never see posted, a 'girlfriend experience' day where you message them throughout the day. Package it as an experience, not a transaction.",
      },
      {
        title: "Whale Retention",
        body: "Check in with whales even when they're not buying. 'Hey [name], haven't heard from you in a few days... miss you 💕' — proactive contact keeps them engaged and prevents them drifting to other creators.",
      },
    ],
  },
  {
    id: "upsell",
    label: "Upsell Ladder",
    icon: <TrendingUp className="h-4 w-4" />,
    content: [
      {
        title: "The Upsell Staircase",
        body: "$5 tip → $12 PPV → $15 PPV → $25 PPV → $50 custom → $100 custom → $200 custom → $500 VIP → $1K+ experience. Each step ONLY happens when they've completed the previous one. Never skip steps.",
      },
      {
        title: "Custom Pitch Framework",
        body: "When a fan has bought 3+ PPVs: 'You know what, I've been thinking... would you want me to make something just for you? Like, exactly what YOU want to see? 😏' Let THEM describe what they want, then price it based on complexity.",
      },
      {
        title: "Game Mechanics",
        body: "Create spending games: 'Pick a number 1-5, each one unlocks something different 😈' or 'Tip $X and I'll do whatever you say for the next 10 minutes.' Games make spending feel fun, not transactional.",
      },
      {
        title: "Scarcity & Exclusivity",
        body: "Use scarcity: 'I'm only offering this to 3 people...' or 'I recorded this just now and I'm deleting it in 24 hours...' Time pressure and exclusivity drive impulse purchases.",
      },
      {
        title: "The $1K+ Pitch",
        body: "For big-ticket items: build the relationship over WEEKS. The fan must trust you and feel genuinely connected. Then: 'I want to do something INSANE for you. Like, the craziest thing I've ever done. But it's going to take a lot of work... would you be interested?' Let them ask the price. When they do, frame it as an investment in an experience.",
      },
    ],
  },
  {
    id: "sexting",
    label: "Sexting Flow",
    icon: <Heart className="h-4 w-4" />,
    content: [
      {
        title: "Pacing is Everything",
        body: "Start casual → build flirty tension → suggestive → explicit. Each phase should last at least 3-5 messages. Rushing kills the mood and the sale. Think foreplay, not a transaction.",
      },
      {
        title: "Use Anticipation",
        body: "'I wish you could see what I'm wearing right now...' (don't show yet). 'Omg I just did something so naughty...' (don't tell yet). Make them ASK. When they beg for it, THAT'S when you send the PPV.",
      },
      {
        title: "Descriptive Language",
        body: "Paint pictures with words. Don't just say 'I'm horny.' Say 'I'm lying in bed and I can't stop thinking about... 😳' — specificity and emotion drive engagement more than being explicit.",
      },
      {
        title: "Reciprocity",
        body: "Ask them what THEY want. 'What would you do if you were here right now?' — when they share fantasies, you have ammunition for custom pitches and know exactly what content to sell them.",
      },
      {
        title: "Aftercare",
        body: "After explicit exchanges: cool down naturally. Don't just stop. 'That was amazing... I'm literally blushing right now 🙈' — make them feel good about spending and they'll come back for more.",
      },
    ],
  },
  {
    id: "personas",
    label: "Model Personas",
    icon: <User className="h-4 w-4" />,
    content: [
      {
        title: "🎓 ASHLEY — College Girl (Shy/Nervous)",
        body: "Voice: Shy, giggly, nervous energy. Uses '...' a lot. Blushes easily. Says things like 'omg I can't believe I'm doing this 🙈', 'you're making me blush...', 'I've never shown anyone this before'. Never aggressive or forward — she's led by the fan. Questions like 'do you... want to see more? 😳'. Indoor only — bedroom, kitchen, bathroom. NO gym content. Age: college-age. Location: Arizona.",
      },
      {
        title: "🎓 Ashley — Copy-Paste Openers",
        body: "Morning: 'Good morning 🥱 I just woke up and I'm still in bed... wish you were here to cuddle...' | Flirty: 'I was just thinking about you and I got this feeling... is that weird? 😳' | PPV lead: 'I did something naughty today... I've never shown this to anyone before... do you want to see? 🙈' | Aftercare: 'That was so intense... I'm literally blushing right now 😳💕 you make me feel things...'",
      },
      {
        title: "🔥 WILLOW — Redhead (Playful/Flirty)",
        body: "Voice: Playful, fun, cheeky, confident but not aggressive. Lots of 😉😏💋. Teases constantly. Says things like 'wouldn't you like to know 😏', 'I've got a surprise for you...', 'you're fun... I like you'. Initiates games and challenges. Energy is light and fun, never serious or heavy. Age: early 20s. Location: flexible.",
      },
      {
        title: "🔥 Willow — Copy-Paste Openers",
        body: "Morning: 'Morning handsome 😉 what trouble are we getting into today?' | Flirty: 'I'm so bored right now... entertain me? 😏 winner gets a prize...' | PPV lead: 'I just filmed something and honestly... it's probably too much 💋 but you seem like you can handle it. Want to see?' | Aftercare: 'Mmm that was fun 😏 you're officially one of my favourites now 💕'",
      },
      {
        title: "🎖️ IZZIE — Military (Confident/Bold)",
        body: "Voice: Direct, commanding, confident. Short sentences. No baby emojis or begging. Says things like 'I know what you want.', 'Send the tip. You won't regret it.', 'At ease soldier... I'm in charge here 😈'. Takes control of conversations. Sets the pace. Doesn't ask — tells. Uses fewer emojis. When she does use them: 😈💪🔥. NEVER cutesy or submissive. Age: early 20s. Background: military/fitness.",
      },
      {
        title: "🎖️ Izzie — Copy-Paste Openers",
        body: "Morning: 'Rise and shine. I've been up since 5 training. You ready for your mission today? 💪' | Flirty: 'I've had my eye on you. Don't make me wait.' | PPV lead: '$20 for the front view. Send the tip and I'll send it now. Want the full package? $40.' | Aftercare: 'Good soldier. You earned that. Want to go again? 😈'",
      },
    ],
  },
  {
    id: "mistakes",
    label: "Common Mistakes",
    icon: <AlertTriangle className="h-4 w-4" />,
    content: [
      {
        title: "❌ Sending PPVs to cold fans",
        body: "A fan who just subscribed or hasn't replied to the welcome message is NOT ready for a PPV. Warm them up first with conversation.",
      },
      {
        title: "❌ Copy-paste messages",
        body: "Fans follow 10-15 creators. If your messages sound generic, you lose. Personalise everything. Use their name. Reference past convos.",
      },
      {
        title: "❌ One-word responses",
        body: "'Thanks' 'lol' 'haha' — these kill conversations. Every message should move the conversation forward. Add a question, a tease, or a hook.",
      },
      {
        title: "❌ Panicking at meetup requests",
        body: "Fans will ask to meet. Don't freeze. Redirect naturally: 'Aww I wish! But for now, I have something even better for you...' and pivot to exclusive content.",
      },
      {
        title: "❌ Being scared to ask for money",
        body: "You're providing value. Don't apologise for prices. Be confident: 'I made this just for you, I think you're going to love it 😈' — if you're nervous, the fan will sense it.",
      },
      {
        title: "❌ Spamming PPVs after rejection",
        body: "If they say no, STOP. Re-engage with conversation. Try again MUCH later with different content. Pushing = blocked.",
      },
    ],
  },
];

export default function ChattingPlaybook() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Chatting Playbook
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Techniques, scripts, and frameworks for better chatting. Reference this during every shift.
        </p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {SECTIONS.map((s) => (
            <TabsTrigger
              key={s.id}
              value={s.id}
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5 text-xs"
            >
              {s.icon}
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-4">
            <div className="space-y-3">
              {section.content.map((item, i) => (
                <Card key={i} className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-yellow-400" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
