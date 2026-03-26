import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Gamepad2, Zap, DollarSign, BarChart3 } from "lucide-react";

interface GameStrategy {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  revenue: "Low" | "Medium" | "High";
  steps: string[];
}

const GAME_STRATEGIES: GameStrategy[] = [
  {
    id: "rps",
    name: "Rock Paper Scissors",
    description: "Classic game with escalating unlock prices per round. Fans play rounds to unlock exclusive content, with each round costing more than the last.",
    difficulty: "Beginner",
    revenue: "Medium",
    steps: [
      "Send an opening message: 'Want to play a game? 🎮 Rock Paper Scissors — winner gets a surprise!'",
      "Set Round 1 unlock at a low entry price (e.g. $5) to get them hooked",
      "If the fan wins, send a teaser reward and offer the next round at a higher price",
      "If the fan loses, offer a 'rematch' at the same price — keep them engaged",
      "Escalate prices each round: Round 2 = $10, Round 3 = $15, Round 4 = $20+",
      "Final round winner gets exclusive content as the grand prize",
      "Tip: Let them win early rounds to build momentum, then raise stakes"
    ]
  },
  {
    id: "rapsheet",
    name: "Rapsheet Quiz",
    description: "A 'Getting to Know Me' quiz using model facts. Fans answer questions about the model to unlock content — tests how well they pay attention.",
    difficulty: "Beginner",
    revenue: "Medium",
    steps: [
      "Prepare 5-10 questions about the model (favourite colour, birthday, pet name, etc.)",
      "Send: 'Think you really know me? 😏 Take my quiz and prove it!'",
      "Each correct answer earns a point; set a price per question ($3-5 each)",
      "Keep score as you go — fans love the competitive element",
      "At the end, give rewards based on score: 3/5 = teaser, 4/5 = photo set, 5/5 = exclusive video",
      "Wrong answers? Offer hints for an extra tip",
      "Tip: Update questions regularly using info from the model's social media and bio"
    ]
  },
  {
    id: "word-game",
    name: "10 Round Word Game",
    description: "Fans collect one word per round to build a password that unlocks exclusive content. Each round costs more — 10 rounds of escalating engagement.",
    difficulty: "Intermediate",
    revenue: "High",
    steps: [
      "Tell the fan: 'I have something special locked away 🔐 Collect all 10 words to unlock it!'",
      "Each round reveals one word of a 10-word password/phrase",
      "Set escalating prices: Round 1-3 = $5, Round 4-6 = $8, Round 7-9 = $12, Round 10 = $15",
      "Between rounds, send teaser content to keep anticipation high",
      "Give each word with a flirty message to maintain the mood",
      "Once they have all 10 words, they send the password to unlock the exclusive content",
      "Total potential: $80-100+ per fan who completes all rounds",
      "Tip: Add bonus rounds for fans who want even more after completing the game"
    ]
  },
  {
    id: "upsell-bundle",
    name: "Upselling Bundle Strategy",
    description: "Pivot single content requests into higher-value bundles. Turn a $10 request into a $50+ sale by packaging content strategically.",
    difficulty: "Advanced",
    revenue: "High",
    steps: [
      "When a fan requests a single piece of content, acknowledge it warmly",
      "Before sending, offer a bundle: 'I actually have a set of 5 similar ones — want the full collection?'",
      "Price the bundle at 3-4x the single item (not 5x — make it feel like a deal)",
      "If they hesitate, offer a 'middle option': 3 for 2.5x the single price",
      "Always frame it as exclusive: 'I only offer these bundles to my favourites'",
      "Include a bonus item in the bundle that they didn't ask for — adds perceived value",
      "Follow up after purchase: 'Want me to make a custom set just for you?' to start the next sale",
      "Tip: Keep a catalogue of bundle-ready content organised by theme"
    ]
  },
  {
    id: "paradise",
    name: "Trip to Paradise",
    description: "Long-form word unlock game with 20+ rounds. Fans collect words to 'travel to paradise' — maximum engagement and revenue over extended conversations.",
    difficulty: "Advanced",
    revenue: "High",
    steps: [
      "Set the scene: 'Want to take a trip to paradise with me? 🏝️ Collect the words to get your boarding pass!'",
      "Plan 20-25 rounds, each revealing one word of a long phrase",
      "Start with low prices ($3-5) and gradually escalate to $15-20 per round",
      "Every 5 rounds, send a 'destination preview' — a teaser of the final reward",
      "Add 'turbulence' rounds where they can lose a word unless they pay to keep it",
      "Halfway point: Offer a 'first class upgrade' bundle for extra content",
      "Final destination unlock = premium exclusive content (photo set + video)",
      "Total potential: $150-250+ per fan who completes the journey",
      "Tip: This works best with highly engaged fans — qualify them first with a shorter game"
    ]
  },
  {
    id: "private-heaven",
    name: "Private Heaven",
    description: "Mass DM hook that leads into a word collection game. Cast a wide net with an enticing opener, then convert responses into the word game format.",
    difficulty: "Intermediate",
    revenue: "High",
    steps: [
      "Craft a mass DM: 'I have a private collection that only a few fans can access 🔑 Want in?'",
      "Anyone who responds gets entered into the word collection game",
      "Start with a free first word to hook them in",
      "Set 10-15 rounds of word collection at $5-10 each",
      "Send teaser clips between rounds to maintain interest",
      "The 'heaven' content should be genuinely premium — fans will talk about it",
      "Track which fans complete the game for future targeting",
      "Tip: Send the mass DM during peak hours (evenings/weekends) for best response rate"
    ]
  },
  {
    id: "joi-game",
    name: "7 Round Guided Game",
    description: "Structured 7-round interactive experience with locked video content at each stage. Each round builds on the previous one for maximum engagement.",
    difficulty: "Advanced",
    revenue: "High",
    steps: [
      "Set up 7 themed rounds, each with a locked video as the reward",
      "Round 1: Low entry price ($5) — introductory teaser content",
      "Round 2-3: Medium price ($10) — building anticipation",
      "Round 4-5: Higher price ($15) — premium content reveals",
      "Round 6: Peak price ($20) — the most exclusive content",
      "Round 7 (Finale): Special price ($25) — the grand finale experience",
      "Between rounds, engage with messages to maintain the narrative flow",
      "Total potential: $100+ per fan across all 7 rounds",
      "Tip: Pre-record all content so you can run this game with multiple fans simultaneously"
    ]
  },
  {
    id: "truth-dare",
    name: "Truth or Dare",
    description: "Interactive truth or dare where fans pick challenges. Each dare or truth reveal comes with exclusive content — easy to run and highly engaging.",
    difficulty: "Beginner",
    revenue: "Medium",
    steps: [
      "Start with: 'Let's play Truth or Dare 😈 You pick first!'",
      "Prepare 10+ truths and 10+ dares in advance",
      "Truths: Personal questions that build connection (keeps them coming back)",
      "Dares: Content-based reveals priced at $5-15 depending on intensity",
      "Fan picks truth or dare, then you deliver and ask them to pick again",
      "Alternate between free truths and paid dares to keep momentum",
      "Bonus: Let them dare YOU for premium prices",
      "Tip: Keep a running list of popular truths and dares that convert well"
    ]
  },
  {
    id: "spin-wheel",
    name: "Spin the Wheel",
    description: "Randomised prize wheel concept. Fans pay to spin and win content of varying value — the gambling element drives repeat purchases.",
    difficulty: "Beginner",
    revenue: "Medium",
    steps: [
      "Create a visual wheel graphic with 6-8 segments (use Canva or similar)",
      "Segments range from small wins (teaser photo) to big wins (exclusive video set)",
      "Charge $5-10 per spin",
      "Use a random method to determine the result (coin flip, random number, etc.)",
      "Send the result with the corresponding content",
      "Offer 'double or nothing' spins for fans who want to go again",
      "Weekly wheel refresh: Change prizes to keep it fresh",
      "Tip: Weight the wheel slightly in their favour early on — happy fans spin more"
    ]
  },
  {
    id: "hot-cold",
    name: "Hot or Cold",
    description: "Guide fans toward hidden content using hot/cold clues. Each clue costs a small amount — fans pay to narrow down what exclusive content they will unlock.",
    difficulty: "Beginner",
    revenue: "Low",
    steps: [
      "Tell the fan: 'I have something hidden for you 🔥❄️ Pay for clues to find it!'",
      "Prepare 5-8 clues that gradually reveal what the content is",
      "Charge $3-5 per clue",
      "Use 'cold', 'warm', 'hot', 'burning' language to build excitement",
      "After all clues, offer the final content at a premium price",
      "If they guess early (unlikely), reward their enthusiasm with a bonus",
      "Tip: The mystery element is the hook — don't reveal too much too early"
    ]
  },
  {
    id: "would-you-rather",
    name: "Would You Rather",
    description: "Present two content options and let the fan choose. Both options require payment — it's not IF they buy, but WHICH they buy.",
    difficulty: "Beginner",
    revenue: "Medium",
    steps: [
      "Send: 'Would you rather see [Option A] or [Option B]? 🤔'",
      "Both options should be desirable — this is a choice, not a yes/no",
      "Price both options similarly ($8-15 each)",
      "After they choose and purchase, reveal: 'Good choice... but are you curious about the other one?'",
      "Many fans will buy both — that's the strategy",
      "Run 3-5 rounds of Would You Rather in a session",
      "Tip: Pair a fan favourite with something new to drive discovery of fresh content"
    ]
  },
  {
    id: "countdown",
    name: "Countdown Timer",
    description: "Create urgency with a countdown to exclusive content drop. Limited-time offers drive impulse purchases and FOMO.",
    difficulty: "Intermediate",
    revenue: "Medium",
    steps: [
      "Announce: 'Something exclusive drops in 24 hours ⏰ Pre-order now at a discount!'",
      "Offer early-bird pricing (20-30% off) for fans who commit before the countdown ends",
      "Send countdown updates: 12 hours, 6 hours, 1 hour, 30 minutes",
      "Each update includes a new teaser to build anticipation",
      "When the timer hits zero, send the content to pre-orders first",
      "After delivery, offer it to everyone else at full price",
      "Create a 'late fee' version at premium price for fans who missed the window",
      "Tip: Use countdowns for your best content — scarcity must feel real"
    ]
  },
  {
    id: "fantasy-builder",
    name: "Fantasy Builder",
    description: "Fans design their ideal custom content by choosing elements step-by-step. Each choice adds to the price — fans build (and pay for) their perfect experience.",
    difficulty: "Advanced",
    revenue: "High",
    steps: [
      "Start with: 'Let's build your dream experience together 💭 You choose every detail!'",
      "Step 1: Choose a theme/setting (bedroom, shower, outdoor, etc.) — base price $10",
      "Step 2: Choose an outfit/look — add $5-10",
      "Step 3: Choose the style (teasing, playful, intense, etc.) — add $5-10",
      "Step 4: Choose the format (photo set, short clip, long video) — add $10-25",
      "Step 5: Add extras (personalised message, name mention, etc.) — add $5-15",
      "Present the final 'build' with total price and create the custom content",
      "Total potential: $35-70+ per custom build",
      "Tip: Have pre-made content for common combinations to fulfil quickly"
    ]
  }
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  Intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const REVENUE_COLORS: Record<string, string> = {
  Low: "bg-blue-500/20 text-blue-300",
  Medium: "bg-purple-500/20 text-purple-300",
  High: "bg-emerald-500/20 text-emerald-300",
};

const REVENUE_ICONS: Record<string, string> = {
  Low: "$",
  Medium: "$$",
  High: "$$$",
};

export default function ContentIdeas() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterRevenue, setFilterRevenue] = useState("all");

  let filtered = GAME_STRATEGIES;
  if (filterDifficulty !== "all") filtered = filtered.filter(g => g.difficulty === filterDifficulty);
  if (filterRevenue !== "all") filtered = filtered.filter(g => g.revenue === filterRevenue);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          Game Strategies
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Engagement games and conversion strategies — browse, learn, and apply
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{GAME_STRATEGIES.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Total Games</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{GAME_STRATEGIES.filter(g => g.revenue === "High").length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">High Revenue</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{GAME_STRATEGIES.filter(g => g.difficulty === "Beginner").length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Beginner Friendly</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterDifficulty}
          onChange={e => setFilterDifficulty(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Difficulty</option>
          <option value="Beginner">🟢 Beginner</option>
          <option value="Intermediate">🟡 Intermediate</option>
          <option value="Advanced">🔴 Advanced</option>
        </select>
        <select
          value={filterRevenue}
          onChange={e => setFilterRevenue(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Revenue</option>
          <option value="Low">$ Low</option>
          <option value="Medium">$$ Medium</option>
          <option value="High">$$$ High</option>
        </select>
      </div>

      {/* Game cards — grouped by difficulty */}
      <div className="space-y-6">
        {(filterDifficulty === "all" ? ["Beginner", "Intermediate", "Advanced"] : [filterDifficulty]).map(diff => {
          const revenueOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
          const group = filtered
            .filter(g => g.difficulty === diff)
            .sort((a, b) => (revenueOrder[a.revenue] ?? 2) - (revenueOrder[b.revenue] ?? 2));
          if (group.length === 0) return null;
          const diffEmoji = diff === "Beginner" ? "🟢" : diff === "Intermediate" ? "🟡" : "🔴";
          return (
            <div key={diff}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{diffEmoji}</span> {diff}
                <Badge variant="outline" className="text-xs ml-1">{group.length} games</Badge>
              </h2>
              <div className="space-y-3">
        {group.map((game) => {
          const isExpanded = expandedId === game.id;
          return (
            <div key={game.id} className="glass-card overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : game.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-base">{game.name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${DIFFICULTY_COLORS[game.difficulty]}`}>
                        {game.difficulty}
                      </Badge>
                      <Badge className={`text-[10px] ${REVENUE_COLORS[game.revenue]}`}>
                        {REVENUE_ICONS[game.revenue]} {game.revenue}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  </div>
                  <div className="shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable step-by-step instructions */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-border/20">
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Step-by-Step Instructions
                    </h4>
                    <ol className="space-y-2">
                      {game.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

          </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-8 text-center text-muted-foreground">
          <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No games match your filters. Try adjusting the difficulty or revenue filter.</p>
        </div>
      )}
    </div>
  );
}
