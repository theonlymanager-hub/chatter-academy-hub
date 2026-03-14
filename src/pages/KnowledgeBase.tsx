import { BookOpen, Target, Users, MessageCircle, Star, ChevronRight, AlertTriangle, Zap, Crown, DollarSign, Send, Brain, ShieldAlert, CheckCircle } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function KnowledgeBase() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete coaching playbook & scoring criteria — study this, live this
        </p>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {/* ─── 1. WHALE CREATION & HIGH SPENDER MANAGEMENT ─── */}
        <AccordionItem value="whale-creation" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Whale Creation & High Spender Management</h2>
                <p className="text-xs text-muted-foreground font-normal">Turn normal fans into long-term high spenders</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* What is a Whale */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h3 className="font-semibold text-sm mb-2">What is a Whale?</h3>
              <p className="text-sm text-muted-foreground">
                A subscriber who spends $500+/month, has strong emotional investment in the model, returns consistently, buys without much convincing, and tips generously. They're not just customers — they're emotionally connected.
              </p>
              <p className="text-sm text-primary font-medium mt-2">
                Why it matters: 20% of subscribers = 80% of revenue. One whale = 50 regular subs in value.
              </p>
            </div>

            {/* Whale Creation Process */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                The Whale Creation Process
              </h3>
              <div className="space-y-3">
                {[
                  { stage: 1, title: "Information Gathering", icon: "🔍", desc: "Find out everything: name, job, location, hobbies, relationship status, interests. This is the FOUNDATION — you can't create a whale without knowing who they are. Ask genuine questions, show real interest. Store info in fan notes." },
                  { stage: 2, title: "Mirror & Connect", icon: "🪞", desc: "Relay information back as if you have things in common. Create shared experiences and common ground. Make them feel like you're genuinely compatible. Build the illusion of a real connection." },
                  { stage: 3, title: "Paint a Future", icon: "🎨", desc: "Give them a view of a future they could potentially have together. Make them feel like this could be something MORE than just a subscription. This is what hooks whales long-term." },
                  { stage: 4, title: "Test the Waters", icon: "💧", desc: "Don't jump straight to intimate content. Start with a light flirty comment to gauge reaction. See how they respond before escalating." },
                  { stage: 5, title: "Navigate Based on Response", icon: "🧭", desc: "Each response type requires a DIFFERENT next move. Read their reply and adapt your approach accordingly." },
                ].map((s) => (
                  <div key={s.stage} className="glass-card p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Stage {s.stage}</span>
                          <h4 className="font-semibold text-sm">{s.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Navigation */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                Stage 5 — Response Navigation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { response: "\"You're cheeky\"", meaning: "Interested but cautious", action: "Slow play — keep building, don't push yet", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
                  { response: "Takes the bait", meaning: "Ready and engaged", action: "Natural upsell — transition smoothly to premium content", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
                  { response: "\"Too soon\"", meaning: "Not warmed up yet", action: "Pull back — more rapport building needed, no pressure", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
                  { response: "Ignores the flirt", meaning: "Not ready at all", action: "Change topic — build more connection first, try again later", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
                ].map((item) => (
                  <div key={item.response} className={`p-3 rounded-lg border ${item.bg}`}>
                    <p className={`text-sm font-bold ${item.color}`}>{item.response}</p>
                    <p className="text-xs text-muted-foreground mt-1">= {item.meaning}</p>
                    <p className="text-xs mt-1">→ {item.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Two Fan Types */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Two Types of Fans</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <h4 className="font-semibold">Quick Fans</h4>
                    <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full font-medium">Majority</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span>Come in ready — direct and to the point</li>
                    <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span>Basic rapport → upsell → PPV → move to next</li>
                    <li className="flex items-start gap-2"><span className="text-yellow-400 mt-0.5">•</span>Maximise what you can from each interaction</li>
                  </ul>
                </div>
                <div className="glass-card p-5 space-y-3 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Potential Whales</h4>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Rare — High Value</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Conversational — they open up personally</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Use the <strong className="text-foreground">FULL whale process</strong> — every stage matters</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><strong className="text-foreground">NEVER rush</strong> — patience = maximum lifetime value</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Whale Identification */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Whale Identification — Early Signals (First Week)</h3>
              <div className="glass-card p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Multiple purchases in short time",
                    "Long, detailed messages",
                    "Personal questions about the model",
                    "Quick response times",
                    "Remembers previous conversations",
                    "Tips without being asked",
                    "$100+ spent in first week",
                    "10+ messages per day",
                  ].map((signal, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground p-1">
                      <span className="text-green-400">✓</span> {signal}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keeping Whales */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Why Whales Leave & How to Prevent It</h3>
              <div className="glass-card p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-red-400 mb-2">Why They Leave:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Feel taken for granted</li>
                    <li>• Sense they're just a wallet</li>
                    <li>• Find someone who gives more attention</li>
                    <li>• The "spell" breaks</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-green-400 mb-2">Prevention:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Consistent attention, surprise messages</li>
                    <li>• Ask about THEM (not just wait to pitch)</li>
                    <li>• Evolve the relationship over time</li>
                    <li>• Acknowledge their importance subtly</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Win-Back Sequence */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Win-Back Sequence for Churning Whales</h3>
              <div className="space-y-2">
                {[
                  { day: "Day 1-3", msg: "Casual check-in — \"Hey, been thinking about you. Everything okay?\"" },
                  { day: "Day 4-7", msg: "Concern + care — \"Miss talking to you. Hope everything's alright.\"" },
                  { day: "Day 8-14", msg: "Direct but warm — \"I noticed you've been quiet. Did I do something wrong?\"" },
                  { day: "Day 15+", msg: "One genuine message, then let go if no response." },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0 mt-0.5">{step.day}</span>
                    <p className="text-sm text-muted-foreground">{step.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Study */}
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <h3 className="font-semibold text-sm text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Real Case Study: How We Lost a $2,549 Whale
              </h3>
              <p className="text-sm text-muted-foreground mb-3">#1 spender on an account — gone in one day.</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">What happened:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Fan paid $100 for exclusive content</li>
                  <li>Instead of delivering, the chatter pushed for a $200 custom</li>
                  <li>Fan asked FIVE TIMES for his content</li>
                  <li>Fan expressed disappointment and said he'd have to restrict access</li>
                  <li>Chatter responded defensively instead of apologising</li>
                </ol>
                <p className="mt-2"><strong className="text-red-400">Result:</strong> Subscription expired same day. $2,549+ lifetime value — gone forever.</p>
                <div className="mt-3 p-3 rounded-lg bg-red-500/10">
                  <p className="text-xs font-medium text-red-400">Failures to learn from:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Took money, didn't deliver</li>
                    <li>• Bait & switch pricing</li>
                    <li>• 4-hour response gap when fan was engaged</li>
                    <li>• Got defensive instead of apologising</li>
                    <li>• Getting defensive with a frustrated fan is NEVER acceptable — apologise, deliver, THEN upsell</li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── 2. CONVERSATION TECHNIQUES & NAVIGATION ─── */}
        <AccordionItem value="conversation-techniques" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Conversation Techniques & Navigation</h2>
                <p className="text-xs text-muted-foreground font-normal">Read fans, match energy, and keep conversations alive</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Reading Subscriber Intent */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Reading Subscriber Intent</h3>
              <div className="space-y-2">
                {[
                  { type: "The Browser", behaviour: "Just looking around", approach: "Light engagement, build curiosity", color: "text-gray-400" },
                  { type: "The Chatter", behaviour: "Wants connection", approach: "Full conversation, relationship building", color: "text-blue-400" },
                  { type: "The Buyer", behaviour: "Ready to spend", approach: "Warm up briefly then natural transition to content", color: "text-green-400" },
                  { type: "The Whale Potential", behaviour: "Emotional investment", approach: "Full whale creation process", color: "text-primary" },
                  { type: "The Time Waster", behaviour: "Endless chat, never buys", approach: "Identify fast, don't waste time", color: "text-red-400" },
                ].map((fan) => (
                  <div key={fan.type} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <span className={`font-bold text-sm shrink-0 ${fan.color}`}>{fan.type}</span>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{fan.behaviour}</p>
                      <p className="text-xs mt-0.5">→ {fan.approach}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matching Energy */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Matching Energy</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Read their vibe from messages — tone, length, emoji usage</li>
                  <li>• Mirror their language style naturally</li>
                  <li>• Know when to be playful vs serious</li>
                  <li>• Match their pace — don't force yours</li>
                </ul>
              </div>
            </div>

            {/* Keeping Conversations Alive */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Keeping Conversations Alive</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Ask open-ended questions — never yes/no</li>
                  <li>• Use storytelling elements to create engagement</li>
                  <li>• Create curiosity — leave them wanting more</li>
                  <li>• Reference past conversations ("How did that work thing go?")</li>
                  <li>• Time gaps strategically — don't over-message</li>
                  <li>• Know when to let it breathe</li>
                </ul>
              </div>
            </div>

            {/* Escalation Signals */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Escalation Signals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                  <p className="text-xs font-bold text-green-400 mb-2">🟢 Green Lights</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Asking personal questions</li>
                    <li>• Sending longer messages</li>
                    <li>• Responding quickly</li>
                    <li>• Flirting back</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                  <p className="text-xs font-bold text-yellow-400 mb-2">🟡 Yellow Lights</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Short replies</li>
                    <li>• Delayed responses</li>
                    <li>• Changing the subject</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                  <p className="text-xs font-bold text-red-400 mb-2">🔴 Red Flags</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Uncomfortable language</li>
                    <li>• Asking to stop</li>
                    <li>• Going cold</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* GFE/BFE Elements */}
            <div>
              <h3 className="font-semibold text-sm mb-3">The "Girlfriend/Boyfriend Experience" Elements</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Good morning messages</li>
                  <li>• "Thinking of you" moments</li>
                  <li>• Asking about their day, sharing yours</li>
                  <li>• Future planning ("When you visit...")</li>
                  <li>• Exclusive nicknames</li>
                  <li>• Making them feel chosen — not one of many</li>
                </ul>
              </div>
            </div>

            {/* Conversation Rules */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Non-Negotiable Conversation Rules</h3>
              <div className="glass-card p-5">
                <div className="space-y-3">
                  {[
                    { rule: "Never rush a potential whale", detail: "Patience pays 10x. Rushing kills the relationship." },
                    { rule: "Store personal info, use it later", detail: "Remember their dog's name, their job, their city. Bring it up days later." },
                    { rule: "Paint a future — make them feel special", detail: "They should feel like they're the only one getting this attention." },
                    { rule: "Read responses and adapt", detail: "Every message tells you something. Adjust your energy accordingly." },
                    { rule: "Mirror their energy", detail: "Match their vibe. If they're chill, be chill. If they're excited, match it." },
                    { rule: "Create exclusivity", detail: "\"I don't usually share this, but for you...\" — make them feel chosen." },
                    { rule: "Minimum 5-7 messages of rapport before ANY pitch", detail: "Build the connection first. Selling too early = lost revenue long term." },
                    { rule: "Always redirect a 'no' to an alternative", detail: "Never shut down the conversation. Offer something else instead." },
                  ].map((item, i) => (
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
            </div>

            {/* Model Personas */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Model Personas — Stay in Character</h3>
              <p className="text-xs text-muted-foreground mb-3">Each model has a distinct persona. Breaking character confuses fans and kills trust. Don't use the same template opener on every account.</p>
              <div className="space-y-2">
                {[
                  { model: "Ashley 🎓", persona: "College/Shy", tone: "Tone DOWN forward messages — she's shy, not aggressive" },
                  { model: "Lucinda 🖤", persona: "Goth", tone: "Low, slow, mysterious" },
                  { model: "Willow/Mia 🔥", persona: "Redhead", tone: "Breathy, teasing, slight rasp" },
                  { model: "Izzy 🎖️", persona: "Military", tone: "Tough, confident, commanding" },
                  { model: "Olivia 🍳", persona: "Cooking/Homey", tone: "Warm, soft, friendly" },
                ].map((m) => (
                  <div key={m.model} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <span className="font-bold text-sm shrink-0 w-28">{m.model}</span>
                    <span className="text-xs text-muted-foreground shrink-0 w-24">{m.persona}</span>
                    <span className="text-xs flex-1">{m.tone}</span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── 3. SALES & UPSELLING ─── */}
        <AccordionItem value="sales-upselling" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Sales & Upselling</h2>
                <p className="text-xs text-muted-foreground font-normal">Pricing psychology, objection handling, and revenue maximisation</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Pricing Psychology */}
            <div>
              <h3 className="font-semibold text-sm mb-3">PPV Pricing Psychology</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong className="text-foreground">Anchoring:</strong> Start with the higher-value option, then offer alternatives</li>
                  <li>• <strong className="text-foreground">Perceived value:</strong> Frame what they're getting, not just the price</li>
                  <li>• <strong className="text-foreground">"Worth it" language:</strong> Focus on the experience, not the cost</li>
                  <li>• <strong className="text-foreground">Never seem desperate:</strong> Confidence sells</li>
                </ul>
              </div>
            </div>

            {/* Timing Your Pitch */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Timing Your Pitch</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Warm up BEFORE pitching — don't rush to sales</li>
                  <li>• Read buying signals before transitioning</li>
                  <li>• Use natural transition phrases</li>
                  <li>• Know when NOT to pitch (fan is upset, venting, just started chatting)</li>
                  <li>• Don't pitch every single message</li>
                </ul>
              </div>
            </div>

            {/* Soft vs Hard Sell */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Soft Sell vs Hard Sell</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-blue-400/10 border border-blue-400/20">
                  <p className="text-sm font-bold text-blue-400 mb-2">Soft Sell (Most Situations)</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Build desire first</li>
                    <li>• Let them ask</li>
                    <li>• Suggest gently</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-orange-400/10 border border-orange-400/20">
                  <p className="text-sm font-bold text-orange-400 mb-2">Hard Sell (When Ready)</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Direct offer</li>
                    <li>• Create urgency</li>
                    <li>• Clear call to action</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Handling Objections */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Handling Objections</h3>
              <div className="space-y-3">
                {[
                  { objection: "\"Too expensive\"", responses: ["Reframe value, not price", "Offer tiered alternatives (if no to $100, try $80 — don't jump to $30)", "Value stack: explain what makes this special"] },
                  { objection: "\"I'm broke right now\"", responses: ["Identify if real or excuse", "Suggest lower-tier alternatives", "Build future commitment (\"I'll save something special for when you're ready\")", "Keep them engaged anyway"] },
                  { objection: "\"Show me first\"", responses: ["Offer a teaser, not the full thing", "Create curiosity without giving it away"] },
                  { objection: "\"Other creators charge less\"", responses: ["Reframe: quality over quantity", "Emphasise exclusivity and personal connection"] },
                ].map((obj) => (
                  <div key={obj.objection} className="glass-card p-4">
                    <p className="text-sm font-bold text-primary mb-2">{obj.objection}</p>
                    <ul className="space-y-1">
                      {obj.responses.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">→</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <strong className="text-yellow-400">Key rule:</strong> Know when to stop pushing. Preserving the relationship matters more than one sale. Don't burn bridges.
              </p>
            </div>

            {/* Tip Encouragement */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Tip Encouragement (Done Right)</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Goal-based incentives</li>
                  <li>• Teasing without frustrating</li>
                  <li>• Reward delivery after tips</li>
                  <li>• Building tip habits over time</li>
                  <li>• <strong className="text-red-400">Never</strong> guilt-trip or beg</li>
                </ul>
              </div>
            </div>

            {/* Creating Urgency */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Creating Urgency</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Time-limited offers</li>
                  <li>• Availability scarcity ("Only making a few of these")</li>
                  <li>• "Only for you" exclusivity</li>
                  <li>• Flash sales</li>
                  <li>• Anniversary/milestone plays</li>
                </ul>
              </div>
            </div>

            {/* Revenue Maximisation Rules */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Revenue Maximisation Rules</h3>
              <div className="p-4 rounded-lg bg-green-400/5 border border-green-400/20">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Know floor prices — never undersell</li>
                  <li>• Use tiered offers (step down gradually, not drastically)</li>
                  <li>• Always upsell after a purchase ("Want to see more?")</li>
                  <li>• Encourage tips and custom requests</li>
                  <li>• <strong className="text-red-400">Never give content for free</strong></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── 4. PPV STRATEGY ─── */}
        <AccordionItem value="ppv-strategy" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">PPV Strategy</h2>
                <p className="text-xs text-muted-foreground font-normal">Scheduling, content rules, and custom pricing</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Scheduling */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Scheduling</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Send PPVs <strong className="text-foreground">2-3 times per week</strong> (recommended: Tuesday/Thursday/Saturday)</li>
                  <li>• Stagger send times by 30 minutes across models</li>
                  <li>• Un-send unopened mass messages after 4-6 hours (keeps content exclusive)</li>
                </ul>
              </div>
            </div>

            {/* Content Rules */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Content Rules</h3>
              <div className="p-4 rounded-lg bg-purple-400/5 border border-purple-400/20">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• All content must be <strong className="text-foreground">indoor locations only</strong> (bedroom, kitchen, bathroom, hallway, closet)</li>
                  <li>• <strong className="text-red-400">No AI-generated content</strong> for mass message PPVs</li>
                  <li>• Each PPV needs a proper description — not just "check this out"</li>
                  <li>• Model-specific adaptation is essential (Ashley content ≠ Izzy content)</li>
                </ul>
              </div>
            </div>

            {/* Content Categories */}
            <div>
              <h3 className="font-semibold text-sm mb-3">PPV Content Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Bedroom Sets", "Bathroom/Shower Sets", "Kitchen Sets", "Closet/Hallway Sets", "Creative/Themed Sets"].map((cat) => (
                  <div key={cat} className="p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-xs font-medium">{cat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Content Pricing */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Custom Content Pricing</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Base rate structures per content type</li>
                  <li>• Add-on pricing for personalisation (name usage, specific requests)</li>
                  <li>• Complexity scaling (simple → elaborate)</li>
                  <li>• Rush fees for urgent requests</li>
                  <li>• Negotiation boundaries — <strong className="text-foreground">know your floor</strong></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── 5. FAN PSYCHOLOGY & RELATIONSHIP BUILDING ─── */}
        <AccordionItem value="fan-psychology" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Fan Psychology & Relationship Building</h2>
                <p className="text-xs text-muted-foreground font-normal">What makes fans come back isn't just content — it's feeling special</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Making Them Feel Special */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Making Them Feel Special</h3>
              <div className="space-y-2">
                {[
                  { num: 1, text: "Remember everything", detail: "their job, pets, hobbies, problems" },
                  { num: 2, text: "Reference the past", detail: "\"How did that work thing go?\"" },
                  { num: 3, text: "Create inside jokes", detail: "unique to your relationship" },
                  { num: 4, text: "Show vulnerability", detail: "share appropriate personal moments" },
                  { num: 5, text: "Make them feel chosen", detail: "\"You're one of the few I actually enjoy talking to\"" },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <span className="text-pink-400 font-bold text-sm mt-0.5">{item.num}.</span>
                    <div>
                      <p className="text-sm font-semibold">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Investment Tactics */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Emotional Investment Tactics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "The Confidant Play", desc: "Share something \"private\" to make them feel trusted" },
                  { name: "The Dream Builder", desc: "Paint a future together (fantasy is fine)" },
                  { name: "The Exclusive Access", desc: "Give them things no one else gets — first look at content, behind-the-scenes, personal updates" },
                  { name: "The Appreciation Show", desc: "Make them feel valued beyond money — \"Talking to you is the best part of my day\"" },
                  { name: "The Memory Keeper", desc: "Remember and reference everything — \"Wasn't your interview today? How'd it go?\"" },
                ].map((tactic) => (
                  <div key={tactic.name} className="p-3 rounded-lg bg-pink-400/5 border border-pink-400/10">
                    <p className="text-sm font-bold text-pink-400">{tactic.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tactic.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What NOT to Do */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-red-400">What NOT to Do</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>❌ Treat them like an ATM</li>
                  <li>❌ Only message when selling</li>
                  <li>❌ Forget what they told you</li>
                  <li>❌ Use generic responses</li>
                  <li>❌ Make them feel like one of many</li>
                  <li>❌ Ignore what they say and pivot to sales</li>
                  <li>❌ Copy-paste the same message to multiple fans</li>
                </ul>
              </div>
            </div>

            {/* The Balance */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                The Balance
              </h3>
              <p className="text-sm text-muted-foreground">
                Whales will spend MORE if you DON'T constantly pitch. The connection IS the sell. They want to support you. Spending is their way of showing love. You reward spending with MORE connection.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── 6. COMMON MISTAKES TO AVOID ─── */}
        <AccordionItem value="common-mistakes" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Common Mistakes to Avoid</h2>
                <p className="text-xs text-muted-foreground font-normal">Critical errors and performance issues found in reviews</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Critical Errors */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-red-400">Critical Errors (Immediate Action Required)</h3>
              <div className="space-y-2">
                {[
                  { mistake: "Using the wrong name", why: "Breaks the illusion completely", outcome: "Strike + immediate coaching" },
                  { mistake: "Breaking character", why: "Fan realises they're not talking to the model", outcome: "Strike + retraining" },
                  { mistake: "Sharing personal/real info", why: "Security risk + breaks persona", outcome: "Possible removal" },
                  { mistake: "Mentioning other fans", why: "Makes them feel like one of many", outcome: "Strike" },
                  { mistake: "Taking money and not delivering", why: "Destroys trust, loses whales", outcome: "Formal warning" },
                  { mistake: "Getting defensive with a frustrated fan", why: "Escalates conflict, loses the fan", outcome: "Coaching required" },
                ].map((err) => (
                  <div key={err.mistake} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-400">{err.mistake}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{err.why}</p>
                      </div>
                      <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full shrink-0 font-medium">{err.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Errors */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-yellow-400">Performance Errors</h3>
              <div className="space-y-2">
                {[
                  { mistake: "Same template opener on every account", fix: "Customise per model persona" },
                  { mistake: "Jumping straight to selling", fix: "Warm up first, build rapport" },
                  { mistake: "Leaving fans on read for hours", fix: "Respond within 5 minutes" },
                  { mistake: "Giving up after first 'no'", fix: "Reframe, offer alternatives" },
                  { mistake: "Dropping price too fast", fix: "Step down gradually" },
                  { mistake: "\"Babe\" at the wrong moment", fix: "Read the room first" },
                  { mistake: "Missing upsell opportunities", fix: "Always offer the next step" },
                  { mistake: "No sales attempts at all", fix: "Balance connection with sales" },
                ].map((err) => (
                  <div key={err.mistake} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <span className="text-yellow-400 mt-0.5">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{err.mistake}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Fix: {err.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Review Findings */}
            <div className="p-4 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
              <h3 className="font-semibold text-sm mb-2 text-yellow-400">Quality Review Findings (March 2026)</h3>
              <p className="text-xs text-muted-foreground mb-2">Real issues found during spot checks:</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong className="text-foreground">Wrong name used</strong> — always verify before flagging (fans sometimes share real names in conversation)</li>
                <li>• <strong className="text-foreground">"Babe" at wrong moment</strong> — lost a sale because timing was off</li>
                <li>• <strong className="text-foreground">Missed video call upsell</strong> — fan was clearly interested, chatter didn't offer</li>
                <li>• Team average score: <strong className="text-yellow-400">5.9/10</strong> — goal is 10/10</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── 7. QUALITY STANDARDS & EXPECTATIONS ─── */}
        <AccordionItem value="quality-standards" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Quality Standards & Expectations</h2>
                <p className="text-xs text-muted-foreground font-normal">Scoring system, strike policy, and supervisor pathway</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Scoring System */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Scoring System (6 Categories, 10-Point Scale)</h3>
              <div className="space-y-3">
                {[
                  { cat: "1. Personalisation", points: ["Uses fan's name correctly and naturally", "References previous conversations/interests", "Adapts tone to fan's personality", "No generic copy-paste openers"] },
                  { cat: "2. Sales Technique", points: ["Natural transitions to content offers (not forced)", "Handles objections without being pushy", "Creates desire before the pitch", "Offers alternatives when fan says no"] },
                  { cat: "3. Rapport Building", points: ["Asks questions, shows interest", "Remembers fan details", "Builds emotional connection before selling", "Makes fan feel special/unique"] },
                  { cat: "4. Response Quality", points: ["Messages are engaging, not one-word", "Appropriate emoji usage (not overdone)", "Acceptable spelling/grammar", "Messages create curiosity/tension"] },
                  { cat: "5. Revenue Maximisation", points: ["Appropriate pricing, knows floor prices", "Uses tiered offers", "Upsells after purchase", "Encourages tips/custom requests"] },
                  { cat: "6. Mistake Avoidance", points: ["Start at 10, deductions apply:", "Wrong name: -3 | Broke character: -2", "Shared personal info: -5 | Mentioned other fans: -3", "Rude to paying fan: -2 | Left on read: -1 per incident"] },
                ].map((c) => (
                  <div key={c.cat} className="glass-card p-4">
                    <p className="text-sm font-bold mb-2">{c.cat}</p>
                    <ul className="space-y-1">
                      {c.points.map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Tiers */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Rating Tiers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { range: "9.0 – 10.0", label: "⭐ Elite", desc: "Exceptional performance. Bonus eligible.", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
                  { range: "7.5 – 8.9", label: "✅ Good", desc: "Meeting expectations. Keep it up.", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
                  { range: "6.0 – 7.4", label: "⚠️ Needs Improvement", desc: "Below standard. Coaching required.", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
                  { range: "Below 6.0", label: "🔴 At Risk", desc: "Performance plan or termination.", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
                ].map((tier) => (
                  <div key={tier.range} className={`p-4 rounded-lg border ${tier.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${tier.color}`}>{tier.range}</span>
                      <span className="text-xs bg-background/50 px-2 py-0.5 rounded-full">{tier.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className="p-4 rounded-lg bg-emerald-400/5 border border-emerald-400/20">
              <h3 className="font-semibold text-sm mb-2">Response Time Standard</h3>
              <p className="text-sm text-muted-foreground">
                Target: <strong className="text-emerald-400">under 5 minutes</strong> average. 15+ minute average = 1 strike.
              </p>
            </div>

            {/* Strike System */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Strike System</h3>
              <div className="glass-card p-4">
                <div className="space-y-2">
                  {[
                    { offence: "Slow response (15+ min average)", strikes: "1" },
                    { offence: "Wrong persona/tone", strikes: "1" },
                    { offence: "Missing shift without notice", strikes: "2" },
                    { offence: "Sharing account access", strikes: "3 (immediate removal)" },
                    { offence: "Off-platform payment discussion", strikes: "3 (immediate removal)" },
                    { offence: "Subscriber complaint", strikes: "1-3 (based on severity)" },
                  ].map((s) => (
                    <div key={s.offence} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                      <span className="text-xs text-muted-foreground">{s.offence}</span>
                      <span className="text-xs font-bold text-red-400 shrink-0 ml-3">{s.strikes}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-400 font-bold mt-3">3 strikes = removal. Strikes decay after 30 days clean.</p>
              </div>
            </div>

            {/* Platform Safety */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-red-400">Platform Safety Rules (Non-Negotiable)</h3>
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>🚫 NEVER mention other platforms for payment</li>
                  <li>🚫 Don't promise meetups (even jokingly)</li>
                  <li>🚫 No underage references — ever</li>
                  <li>🚫 Keep everything on OnlyFans</li>
                  <li>🚫 No screenshots or recording</li>
                </ul>
              </div>
            </div>

            {/* Chatter Reports */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Chatter Reports</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Daily reports with specific feedback</li>
                  <li>• Be HARSH — point out missed sales opportunities</li>
                  <li>• Match fan tone assessment, not just grammar checks</li>
                  <li>• Monthly: top performers = bonus, bottom performers = replacement</li>
                </ul>
              </div>
            </div>

            {/* Supervisor Expectations */}
            <div>
              <h3 className="font-semibold text-sm mb-3">What Management Expects</h3>
              <div className="glass-card p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong className="text-foreground">Don't praise without checking</strong> — verify actual performance before saying "good work"</li>
                  <li>• <strong className="text-foreground">Keep messages SHORT</strong> — chatters are working. Action needed + why = done</li>
                  <li>• <strong className="text-foreground">Finish before starting</strong> — complete each task 100% before moving on</li>
                  <li>• <strong className="text-foreground">Be proactive</strong> — suggest ideas, don't wait for commands</li>
                  <li>• <strong className="text-foreground">Daily check-ins</strong> — "What are you doing? Blockers? How to improve?"</li>
                  <li>• <strong className="text-foreground">Goal is 10/10</strong> — 5.9 average isn't bad, but that's not the target</li>
                </ul>
              </div>
            </div>

            {/* Supervisor Pathway */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Supervisor Pathway</h3>
              <p className="text-xs text-muted-foreground mb-3">Top performers can become supervisors:</p>
              <div className="space-y-2">
                {[
                  "Complete all training with 90%+ average",
                  "30 days active chatting with good metrics",
                  "Zero strikes in last 30 days",
                  "Recommended by current supervisor",
                  "Interview with management",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{i + 1}</span>
                    <p className="text-xs text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/20">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-emerald-400">Benefits:</strong> Higher commission, priority scheduling, direct line to management, growth path.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* ─── 8. CHATTING STRATEGY ─── */}
        <AccordionItem value="chatting-strategy" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Chatting Strategy & Standards</h2>
                <p className="text-xs text-muted-foreground font-normal">Upselling, whale creation, zero tolerance rules & response standards</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            {/* Upsell Techniques */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                Upsell Techniques
              </h3>
              <div className="space-y-2">
                {[
                  { rule: "Push for customs naturally in conversation", detail: "Never force it — let it come up organically. If they mention a fantasy or preference, that's your opening." },
                  { rule: "Sell top/premium content at the right moment", detail: "When the fan is engaged and warmed up, not cold. Timing is everything — pitching to a cold fan kills the mood." },
                  { rule: "VIP tier for big spenders", detail: "Fans who spend $1,000+ get fast replies, free content drops, and exclusive access. Make them feel like royalty." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-400/5 border border-green-400/10">
                    <span className="text-green-400 font-bold text-sm mt-0.5">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-semibold">{item.rule}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Whale Creation */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                Whale Creation
              </h3>
              <div className="space-y-2">
                {[
                  { rule: "Long game — emotional investment to point of no return", detail: "They should feel so connected that leaving would feel like a real breakup. That's when they spend without thinking." },
                  { rule: "High energy chatting ALWAYS", detail: "Zero bland replies. Every message should have personality, warmth, and intent. If you're bored, they're bored." },
                  { rule: "Build genuine connection", detail: "The fan should think the model genuinely likes them. Not fake, not forced — make it feel real." },
                  { rule: "Takes time, that's fine", detail: "Rushing kills whales. A whale built over 3 weeks will spend 10x more than a fan you pushed too hard on day 1." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-primary font-bold text-sm mt-0.5">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-semibold">{item.rule}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero Tolerance Rules */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Zero Tolerance Rules
              </h3>
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="space-y-3">
                  {[
                    { offence: "\"I'm bored\" type messages", result: "Instant coaching — if the fan is bored, you failed" },
                    { offence: "Low energy, copy-paste, bland conversation", result: "Strike — this kills revenue and fan retention" },
                    { offence: "Anything that kills the mood or breaks immersion", result: "Immediate correction — the fantasy must stay intact" },
                    { offence: "Generic openers like \"hey how are you\" with no personalisation", result: "Coaching required — every opener must reference something personal" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-red-500/5">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-red-400 mt-0.5">🚫</span>
                        <p className="text-sm font-semibold text-red-400">{item.offence}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 max-w-[200px] text-right">{item.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Standards */}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Response Standards
              </h3>
              <div className="glass-card p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-emerald-400/5 border border-emerald-400/20 text-center">
                    <p className="text-3xl font-bold text-emerald-400">2 min</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum response time</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <p className="text-3xl font-bold text-primary">$400–$500</p>
                    <p className="text-xs text-muted-foreground mt-1">Weekly net target per 100 free subs</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    "Every reply moves the conversation forward — no dead-end messages",
                    "Use fan's personal details (job, hobbies, location) naturally in conversation",
                    "Reference past conversations to show you remember them",
                    "Match the model's persona and energy in every single message",
                  ].map((standard, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <p className="text-sm text-muted-foreground">{standard}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── TYPES OF FANS ─── */}
        <AccordionItem value="fan-types" className="glass-card border rounded-lg px-5">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold">Types of Fans & How to Handle Them</h2>
                <p className="text-xs text-muted-foreground font-normal">Not every fan is the same — adapt your approach</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
              <h3 className="font-bold text-orange-400 mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Golden Rule</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Not all fans are the same.</strong> A good chatter reads each fan individually and adapts.
                Don't use the same approach for every person. Be independent, assess the situation, and handle it accordingly.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                {
                  type: "The Open Book",
                  emoji: "📖",
                  desc: "Shares info freely, chatty, responds fast. Easy to build rapport with.",
                  approach: "Go straight into info gathering. Ask about their interests, where they're from, what they like. They'll tell you everything."
                },
                {
                  type: "The Closed-Off Fan",
                  emoji: "🔒",
                  desc: "Short replies, guarded, doesn't share much. Needs to trust you first.",
                  approach: "DON'T push for info immediately. Mirror their energy, connect on a human level. Be patient. Build trust before asking questions. They'll open up when they feel safe."
                },
                {
                  type: "The Shy One",
                  emoji: "🙈",
                  desc: "Nervous, unsure, might be new to the platform.",
                  approach: "Be warm and reassuring. Make them feel comfortable. Don't be too sexual too fast. Let them set the pace. Light teasing, build confidence."
                },
                {
                  type: "The Big Spender",
                  emoji: "💰",
                  desc: "Tips quickly, buys PPVs without much push. Has money and isn't afraid to spend.",
                  approach: "Don't undersell. Give them premium treatment. Exclusive content, personal attention. Whale creation pipeline — they're already halfway there."
                },
                {
                  type: "The Window Shopper",
                  emoji: "👀",
                  desc: "Subscribes but rarely buys. Might just be browsing.",
                  approach: "Engage first, sell later. Build genuine connection. Tease content strategically. Use FOMO (limited time, exclusive). Don't spam PPVs — it pushes them away."
                },
                {
                  type: "The Aggressive One",
                  emoji: "🔥",
                  desc: "Very forward, explicit quickly, knows what they want.",
                  approach: "Match their energy but stay in control. Guide the conversation toward sales. They want action — give it to them through PPVs and customs, not free chat."
                },
                {
                  type: "The Lonely Fan",
                  emoji: "💙",
                  desc: "Looking for genuine connection, emotionally invested.",
                  approach: "Be their person. Make them feel special and heard. These fans become whales when treated right. Aftercare is CRITICAL. Don't just sell — connect."
                },
                {
                  type: "The Returner",
                  emoji: "🔄",
                  desc: "Comes back after periods of inactivity.",
                  approach: "Welcome back warmly. Don't guilt trip about being away. Make them feel missed, not punished. 'I was thinking about you' > 'where have you been?'"
                },
              ].map((fan, i) => (
                <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{fan.emoji}</span>
                    <h4 className="font-bold text-sm">{fan.type}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{fan.desc}</p>
                  <p className="text-xs"><strong className="text-orange-400">Approach:</strong> <span className="text-muted-foreground">{fan.approach}</span></p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
              <h3 className="font-bold text-orange-400 mb-2 flex items-center gap-2"><Brain className="h-4 w-4" /> Trust Before Information</h3>
              <p className="text-sm text-muted-foreground">
                Some fans won't give info straight away — and that's normal. Not everyone trusts immediately.
                If a fan is closed off, <strong>mirror their energy and connect first.</strong> Match their vibe, 
                show genuine interest, let them feel comfortable. Once trust is built, they'll naturally start sharing.
                <br /><br />
                <strong>The pipeline:</strong> Mirror → Connect → Trust → Information → Whale Creation.
                <br />
                For open fans: Skip straight to information gathering.
                <br />
                For guarded fans: Mirror & connect first, then ease into questions.
                <br /><br />
                <strong>A good chatter reads the situation and adapts.</strong> There is no one-size-fits-all approach.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
