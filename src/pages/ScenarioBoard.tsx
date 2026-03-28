import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, X, Search, MessageCircle, Clock, CheckCircle, Archive, Sparkles } from "lucide-react";

interface Scenario {
  id: string;
  model: string;
  text: string;
  category: "casual" | "flirty" | "evening" | "weekend" | "spicy";
  status: "available" | "in_use" | "cooldown" | "archived";
  oneTimeOnly: boolean;
  usedBy: string | null;
  usedAt: string | null;
  cooldownUntil: string | null;
  createdBy: string;
  createdAt: string;
  imageUrl?: string;
  // Scenario package fields
  scriptFlow?: string;
  aiContent?: string;
  realContent?: string;
  vaultRef?: string;
}

const STORAGE_KEY = "scenario-board-v5";
const MODELS = ["Ashley Morris", "Izzy", "Willow"];
const CATEGORIES = [
  { value: "casual", label: "Casual/Daytime", emoji: "☀️" },
  { value: "flirty", label: "Flirty", emoji: "😏" },
  { value: "evening", label: "Evening", emoji: "🌙" },
  { value: "weekend", label: "Weekend", emoji: "🎉" },
  { value: "spicy", label: "Spicy", emoji: "🔥" },
];

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/20 text-green-300 border-green-500/30",
  in_use: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  cooldown: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  archived: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  available: "✅ Available",
  in_use: "🟠 In Use",
  cooldown: "⏳ Cooldown",
  archived: "📁 Archived",
};

const CATEGORY_COLORS: Record<string, string> = {
  casual: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  flirty: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  evening: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  weekend: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  spicy: "bg-red-500/20 text-red-300 border-red-500/30",
};

const COOLDOWN_DAYS = 14;

const SEED_SCENARIOS: Omit<Scenario, "id" | "createdAt">[] = [
  // ═══════════════════════════════════════════
  // ASHLEY MORRIS (10 scenarios)
  // ═══════════════════════════════════════════
  {
    model: "Ashley Morris",
    text: "Just got back from my first ever Pilates class and my legs are DEAD 😂 but honestly I feel amazing. Have you ever tried it?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust got back from my first ever Pilates class and my legs are DEAD 😂 but honestly I feel amazing. Have you ever tried it?\n\nFAN RESPONSES:\n• Fan says they work out too → \"No way! What do you do? I bet you look good doing it 😏\" → bond over fitness\n• Fan says no / not active → \"You should try it! I'll motivate you 💪 I looked so cute in my outfit too\"\n• Fan flirts → \"Haha stop 🙈 my legs are literally shaking right now... wanna see?\"\n\nTRANSITION TO PPV:\n\"My legs are SO sore but I looked cute in my workout outfit... wanna see what I wore? 😏\"\n\nPPV SUGGESTION:\nWorkout photo set or stretching video — $8-12",
    aiContent: "Gym selfie in leggings, post-workout glow photo, gym mirror pic",
    realContent: "Workout video, stretching clip, sweaty post-gym photo set",
    vaultRef: "Scenario 1 — Pilates",
  },
  {
    model: "Ashley Morris",
    text: "I just tried cooking pasta from scratch and honestly it was a disaster 😭 the kitchen looks like a war zone but at least I looked cute doing it",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nI just tried cooking pasta from scratch and honestly it was a disaster 😭 the kitchen looks like a war zone but at least I looked cute doing it\n\nFAN RESPONSES:\n• Fan laughs / asks what happened → Send AI kitchen disaster photo → \"It was SO messy but I had fun. Do you cook?\"\n• Fan offers to cook for her → \"Omg yes please 🥹 I need a man who can cook... I'll just stand there looking pretty\"\n• Fan flirts about the 'cute' part → \"Haha well the apron situation was... interesting 😏\"\n\nTRANSITION TO PPV:\n\"I made a mess but I looked cute... wanna see the apron situation? 😏 I wasn't wearing much underneath\"\n\nPPV SUGGESTION:\nApron / kitchen photo set — $10-15",
    aiContent: "Messy kitchen selfie, sauce on face photo, failed pasta close-up",
    realContent: "Cooking in apron video, kitchen dancing clip",
    vaultRef: "Scenario 2 — Cooking Disaster",
  },
  {
    model: "Ashley Morris",
    text: "Went shopping with my girls today and spent way too much 🛍️ got some cute stuff though... wanna see what I picked up?",
    category: "flirty",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nWent shopping with my girls today and spent way too much 🛍️ got some cute stuff though... wanna see what I picked up?\n\nFAN RESPONSES:\n• Fan says yes → Send AI shopping bag photo → \"I got this little outfit... should I try it on for you?\"\n• Fan asks what she bought → \"A few things 😏 one of them is definitely not for going out in public haha\"\n• Fan offers to buy her stuff → \"Omg you're so sweet 🥹 maybe you can pick my next outfit?\"\n\nTRANSITION TO PPV:\n\"I got something special... wanna see the try-on? 😏 It's a little revealing\"\n\nPPV SUGGESTION:\nTry-on haul video or outfit reveal photo set — $10-15",
    aiContent: "Shopping bag photos, store fronts, car with bags",
    realContent: "Try-on video, outfit reveal photo set",
    vaultRef: "Scenario 3 — Shopping Spree",
  },
  {
    model: "Ashley Morris",
    text: "Just finished a study session at the coffee shop and I'm so wired on caffeine rn ☕ what are you up to?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust finished a study session at the coffee shop and I'm so wired on caffeine rn ☕ what are you up to?\n\nFAN RESPONSES:\n• Fan asks what she's studying → \"Just some boring stuff 😂 but I need a distraction now... tell me something fun\"\n• Fan says they're bored too → \"We should entertain each other then 😏 I'm in a weird mood\"\n• Fan asks about her day → Build rapport → \"I'm all wired now... can't sit still. Wanna keep me company tonight?\"\n\nTRANSITION TO PPV:\n\"I'm so wired I can't relax... might need to do something to burn off this energy 😏 wanna see?\"\n\nPPV SUGGESTION:\nCasual selfie set or flirty bedroom content — $8-10",
    aiContent: "Coffee shop selfie, laptop study setup, iced coffee close-up",
    realContent: "Casual bedroom selfie set, getting-ready clip",
  },
  {
    model: "Ashley Morris",
    text: "Had the laziest Sunday ever — stayed in bed watching Netflix all day 🤭 sometimes you just need that right?",
    category: "weekend",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nHad the laziest Sunday ever — stayed in bed watching Netflix all day 🤭 sometimes you just need that right?\n\nFAN RESPONSES:\n• Fan agrees / says they're lazy too → \"We could've been lazy together 🥺 what would you watch with me?\"\n• Fan asks what she watched → Share show → \"I'm still in my pyjamas... well barely 😏\"\n• Fan says she deserves rest → \"You're so sweet 🥹 I wish someone was here to cuddle\"\n\nTRANSITION TO PPV:\n\"I've been in bed ALL day... barely dressed 🙈 wanna see how lazy I look right now?\"\n\nPPV SUGGESTION:\nBed selfie / lazy day photo set — $8-12",
    aiContent: "Bed selfie with messy hair, Netflix screen with blankets, cozy room photo",
    realContent: "Lazy day bed photos, pyjama content set",
  },
  {
    model: "Ashley Morris",
    text: "Just got back from a road trip to Sedona with my roommate and the views were insane 🏜️ wish you could've been there",
    category: "weekend",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust got back from a road trip to Sedona with my roommate and the views were insane 🏜️ wish you could've been there\n\nFAN RESPONSES:\n• Fan says it looks amazing → Send AI desert/road photo → \"It was so beautiful... I took some photos you might like 😏\"\n• Fan says they'd love to go → \"We should go together sometime 🥺 road trips are the best with good company\"\n• Fan asks about the trip → Share details → build connection → \"The hotel had this amazing view... I may have taken some pics in the room too\"\n\nTRANSITION TO PPV:\n\"I took some pictures at the hotel... the lighting was too good not to 😏 wanna see?\"\n\nPPV SUGGESTION:\nHotel room photo set or bikini/pool content — $10-15",
    aiContent: "Desert landscape, road trip car photo, hotel room views",
    realContent: "Hotel room photo set, pool/bikini photos from trip",
  },
  {
    model: "Ashley Morris",
    text: "I'm babysitting my friend's puppy this weekend and I literally can't stop cuddling him 🐶 look how cute he is",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nI'm babysitting my friend's puppy this weekend and I literally can't stop cuddling him 🐶 look how cute he is\n\nFAN RESPONSES:\n• Fan loves dogs → \"Omg do you have one?? I want one SO bad 🥺\" → bond over pets\n• Fan says she's cute too → \"Haha stop 🙈 the puppy is cuter than me right now... or is he?\"\n• Fan asks for more pics → Send AI puppy photo → \"He keeps jumping on me... I'm in my shorts and he won't stop 😂\"\n\nTRANSITION TO PPV:\n\"He keeps climbing all over me 😂 I'm barely dressed... wanna see how cute we look together? 😏\"\n\nPPV SUGGESTION:\nCute casual selfies with pet / home content — $8-10",
    aiContent: "Cute puppy photos, girl-with-puppy selfie, cozy home setting",
    realContent: "Home casual content, playing-with-pet clips",
  },
  {
    model: "Ashley Morris",
    text: "Just got out of the shower and I'm trying to decide what to wear tonight... girls night 🥂 help me pick?",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust got out of the shower and I'm trying to decide what to wear tonight... girls night 🥂 help me pick?\n\nFAN RESPONSES:\n• Fan picks an outfit → \"Good taste 😏 but you haven't seen all the options yet...\"\n• Fan says anything looks good → \"You're sweet 🥹 but I need REAL help... wanna see what I'm choosing between?\"\n• Fan flirts about the shower → \"Haha I JUST got out 🙈 I'm still in my towel... wanna see?\"\n\nTRANSITION TO PPV:\n\"Ok I'm still in my towel deciding 🙈 wanna see the outfit options? Or... the towel situation? 😏\"\n\nPPV SUGGESTION:\nTowel / getting ready photo set — $10-15",
    aiContent: "Bathroom mirror selfie, outfit options laid on bed, getting-ready vanity",
    realContent: "Getting-ready video, towel photos, outfit try-on set",
  },
  {
    model: "Ashley Morris",
    text: "Can't sleep... lying in bed thinking about things I probably shouldn't be 🙈 anyone up?",
    category: "spicy",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nCan't sleep... lying in bed thinking about things I probably shouldn't be 🙈 anyone up?\n\nFAN RESPONSES:\n• Fan says they can't sleep either → \"What are YOU thinking about? 😏 I bet it's similar to what I'm thinking\"\n• Fan asks what she's thinking → \"I can't say it out loud 🙈 but I could show you...\"\n• Fan flirts directly → \"Mmm you're making it worse 😏 now I REALLY can't sleep\"\n\nTRANSITION TO PPV:\n\"I'm lying here in basically nothing 🙈 want me to show you what I mean? I'm feeling brave tonight...\"\n\nPPV SUGGESTION:\nBedroom / lingerie content — $15-25",
    aiContent: "Dark bedroom selfie, messy sheets close-up, dim lighting mood photo",
    realContent: "Lingerie bedroom photo set, intimate video clip",
  },
  {
    model: "Ashley Morris",
    text: "Just got back from the gym and I'm all sweaty... need someone to help me cool down 😏",
    category: "spicy",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust got back from the gym and I'm all sweaty... need someone to help me cool down 😏\n\nFAN RESPONSES:\n• Fan offers to help → \"Oh yeah? 😏 How would you cool me down? I'm very hot right now...\"\n• Fan asks about her workout → \"Squats 🍑 my legs are shaking... wanna see the results?\"\n• Fan compliments her → \"You're making me even hotter 🙈 I need to take these gym clothes off...\"\n\nTRANSITION TO PPV:\n\"I'm literally dripping 💦 about to jump in the shower... wanna see the before and after? 😏\"\n\nPPV SUGGESTION:\nPost-gym / shower transition content — $12-20",
    aiContent: "Gym selfie, sweaty workout photo, gym mirror pic in leggings",
    realContent: "Post-gym photo set, shower teaser, workout booty clips",
  },

  // ═══════════════════════════════════════════
  // IZZY (10 scenarios — military themed)
  // ═══════════════════════════════════════════
  {
    model: "Izzy",
    text: "Morning PT was brutal today 💪 5am runs hit different when it's still dark out. What time did you wake up?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nMorning PT was brutal today 💪 5am runs hit different when it's still dark out. What time did you wake up?\n\nFAN RESPONSES:\n• Fan says they woke up late → \"Must be nice 😂 I was running in the dark while you were sleeping. I'm jealous\"\n• Fan says they work out too → \"No way! What's your routine? I bet I could outrun you though 😏\"\n• Fan asks about PT → \"It's physical training — we run, do push-ups, the works. I'm SOAKED in sweat right now\"\n\nTRANSITION TO PPV:\n\"I'm so sweaty from PT 💦 about to change out of these clothes... wanna see my workout look? 😏\"\n\nPPV SUGGESTION:\nPost-workout / sports bra photo set — $8-12",
    aiContent: "Early morning run selfie, dark sky workout photo, military base track",
    realContent: "Sweaty post-PT photos, sports bra workout set, changing room content",
  },
  {
    model: "Izzy",
    text: "Finally got a weekend off base and I found this cute little coffee shop in town ☕ needed this so bad",
    category: "weekend",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nFinally got a weekend off base and I found this cute little coffee shop in town ☕ needed this so bad\n\nFAN RESPONSES:\n• Fan asks about base life → \"It's intense honestly. That's why days off feel SO good. I actually dressed cute today for once 😂\"\n• Fan says they like coffee too → \"What's your order? I'm an iced oat milk latte girl ☕ we should get coffee together sometime\"\n• Fan flirts → \"Haha you're sweet 🥰 I needed some good company today... even if it's just texting\"\n\nTRANSITION TO PPV:\n\"I actually dressed up today since I'm off base... wanna see? I don't usually get to wear cute clothes 😏\"\n\nPPV SUGGESTION:\nCute casual outfit photos / civilian clothes set — $8-10",
    aiContent: "Coffee shop selfie, iced latte photo, cute town street snap",
    realContent: "Casual outfit photo set, date-look content",
  },
  {
    model: "Izzy",
    text: "BBQ on base today with the squad 🍖 the food was mid but the vibes were immaculate. How was your day?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nBBQ on base today with the squad 🍖 the food was mid but the vibes were immaculate. How was your day?\n\nFAN RESPONSES:\n• Fan asks about her squad → \"They're like family 💪 but none of them are as fun to talk to as you\"\n• Fan talks about their day → Show interest → \"That sounds nice! I wish I had more chill days like that\"\n• Fan says they'd grill for her → \"Omg yes 🥹 a man who can grill? That's hot. Almost as hot as me in my shorts today\"\n\nTRANSITION TO PPV:\n\"I wore these little shorts to the BBQ and got SO many looks 😂 wanna see the outfit? 😏\"\n\nPPV SUGGESTION:\nCasual shorts / summer outfit set — $8-10",
    aiContent: "BBQ setup photo, outdoor base hangout, summer day snap",
    realContent: "Summer outfit photos, shorts/tank top set",
  },
  {
    model: "Izzy",
    text: "Just did a 10 mile ruck march and my feet are destroyed 😩 but honestly I love pushing myself. You work out?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust did a 10 mile ruck march and my feet are destroyed 😩 but honestly I love pushing myself. You work out?\n\nFAN RESPONSES:\n• Fan says they work out → \"Nice! What's your thing? I bet I could keep up with you 😏 or you with me\"\n• Fan says no → \"That's ok 😂 I work out enough for both of us. My body is proof 💪\"\n• Fan asks what a ruck march is → \"Basically walking forever with a heavy pack on your back. My legs are so strong from it though 🍑\"\n\nTRANSITION TO PPV:\n\"My legs are SO sore but they look amazing right now 🍑 wanna see what all that training does? 😏\"\n\nPPV SUGGESTION:\nFitness body / legs photo set — $10-15",
    aiContent: "Trail/hiking photo, military boots close-up, backpack gear shot",
    realContent: "Fitness photo set, legs/body workout results content",
  },
  {
    model: "Izzy",
    text: "Got my hair done today for the first time in months 💇‍♀️ feeling cute. Needed this after a long week",
    category: "flirty",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nGot my hair done today for the first time in months 💇‍♀️ feeling cute. Needed this after a long week\n\nFAN RESPONSES:\n• Fan compliments her → \"Aww thank you 🥹 I feel like a whole new person. Military life doesn't let me be girly enough\"\n• Fan asks about her week → \"It was rough... training non-stop. But now I look cute and I'm ready to have fun 😏\"\n• Fan says they bet she looks good → \"Haha well... only one way to find out right? 😏\"\n\nTRANSITION TO PPV:\n\"I feel so pretty today 🥹 I did a little photoshoot to celebrate... wanna see? 😏\"\n\nPPV SUGGESTION:\nFresh hair / glam photo set — $10-12",
    aiContent: "Salon selfie, fresh hair mirror pic, cute smile close-up",
    realContent: "Glam photo set, hair flip video, dressed-up content",
  },
  {
    model: "Izzy",
    text: "Missing home today... Texas sunsets just hit different 🌅 where's home for you?",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nMissing home today... Texas sunsets just hit different 🌅 where's home for you?\n\nFAN RESPONSES:\n• Fan shares where they're from → \"Oh nice! I've always wanted to visit. Maybe one day you could show me around? 🥺\"\n• Fan says they miss home too → \"It's hard being away right? 🥺 at least we have each other to talk to\"\n• Fan comforts her → \"You're so sweet 🥹 you always make me feel better. I wish you were here watching this sunset with me\"\n\nTRANSITION TO PPV:\n\"The sunset is making me feel some type of way 🥺 I took some pics in this lighting... it's really pretty. Wanna see? 😏\"\n\nPPV SUGGESTION:\nGolden hour / sunset photo set — $10-15",
    aiContent: "Sunset landscape photo, golden hour silhouette, Texas sky",
    realContent: "Golden hour photo set, sunset-lit intimate content",
  },
  {
    model: "Izzy",
    text: "Just finished a night shift and I can't sleep 😴 my brain won't turn off. Talk to me?",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust finished a night shift and I can't sleep 😴 my brain won't turn off. Talk to me?\n\nFAN RESPONSES:\n• Fan says they're up too → \"Yay company 🥰 what are you doing up so late? I'm just lying in bed restless\"\n• Fan asks about the shift → \"It was long and boring 😩 now I just want someone to distract me\"\n• Fan flirts → \"Mmm you're gonna keep me up even longer 😏 but I don't mind...\"\n\nTRANSITION TO PPV:\n\"I'm lying here wide awake in barely anything 🙈 wanna see what I look like at 3am? 😏\"\n\nPPV SUGGESTION:\nLate night bedroom / can't sleep content — $12-18",
    aiContent: "Dark bedroom selfie, late-night phone glow, messy bed photo",
    realContent: "Late-night lingerie set, sleepy-but-sexy bedroom content",
  },
  {
    model: "Izzy",
    text: "Tried hiking this trail near base today and it was BEAUTIFUL 🏔️ nature is my therapy honestly",
    category: "weekend",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nTried hiking this trail near base today and it was BEAUTIFUL 🏔️ nature is my therapy honestly\n\nFAN RESPONSES:\n• Fan likes hiking too → \"We should hike together! 🥾 I'd love the company. It gets lonely out here sometimes\"\n• Fan asks about the trail → \"It was so peaceful 🥹 I stopped at this waterfall and just sat there. Took some pics too...\"\n• Fan compliments → \"Thanks babe 🥰 the views were amazing... and so was I apparently 😂\"\n\nTRANSITION TO PPV:\n\"I found this beautiful spot by a waterfall 💦 had to take some photos... wanna see? The scenery was gorgeous 😏\"\n\nPPV SUGGESTION:\nOutdoor / nature photo set — $10-12",
    aiContent: "Mountain trail photo, waterfall scenery, hiking outfit snap",
    realContent: "Outdoor fitness photos, hiking bikini/sports content",
  },
  // NEW Izzy scenarios
  {
    model: "Izzy",
    text: "There's a military ball coming up and I just found the PERFECT dress 👗 I never get to dress up so I'm way too excited",
    category: "flirty",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nThere's a military ball coming up and I just found the PERFECT dress 👗 I never get to dress up so I'm way too excited\n\nFAN RESPONSES:\n• Fan asks to see the dress → \"I'm not showing everyone 😏 but for you... maybe. It's really tight\"\n• Fan says she'll look amazing → \"Aww 🥹 I wish you could be my date. I hate going to these things alone\"\n• Fan asks about military balls → \"It's like prom but for soldiers 😂 dress uniforms, dancing, the whole thing. I clean up NICE\"\n\nTRANSITION TO PPV:\n\"Wanna see me try it on? 😏 Fair warning... it doesn't leave much to the imagination. I might need help with the zipper too 🙈\"\n\nPPV SUGGESTION:\nDress try-on / glam night photo set — $12-18",
    aiContent: "Evening dress shopping photo, military ball venue, dress on hanger",
    realContent: "Tight dress try-on video, getting ready glam set, zipper-tease photos",
  },
  {
    model: "Izzy",
    text: "Got a care package from home today and I almost cried 🥺📦 my mom sent my favourite snacks and a letter. Military life gets lonely sometimes",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nGot a care package from home today and I almost cried 🥺📦 my mom sent my favourite snacks and a letter. Military life gets lonely sometimes\n\nFAN RESPONSES:\n• Fan says that's sweet → \"It really is 🥹 I miss home so much. Having someone to talk to means everything to me right now\"\n• Fan says they'd send her one → \"Omg stop you're gonna make me cry for real 🥺 you're like the sweetest person ever\"\n• Fan asks about loneliness → \"It's hard being away from everyone. That's why I love talking to you... you make me feel less alone 🥹\"\n\nTRANSITION TO PPV:\n\"I'm feeling emotional and cuddly tonight 🥺 I'm in my comfy clothes just curled up... wanna see my cozy night? I look really cute right now 😏\"\n\nPPV SUGGESTION:\nCozy / intimate emotional-connection set — $10-15",
    aiContent: "Care package unboxing, handwritten letter, snacks spread on bed",
    realContent: "Cozy bedroom content, oversized shirt photos, vulnerable-but-cute set",
  },

  // ═══════════════════════════════════════════
  // WILLOW (10 scenarios — cozy/artsy redhead)
  // ═══════════════════════════════════════════
  {
    model: "Willow",
    text: "Just dyed my hair even redder and I'm kinda obsessed 🔥 do you like redheads?",
    category: "flirty",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust dyed my hair even redder and I'm kinda obsessed 🔥 do you like redheads?\n\nFAN RESPONSES:\n• Fan says yes → \"Good answer 😏 redheads are trouble though... are you ready for that?\"\n• Fan compliments her → \"Aww 🥰 you always know what to say. Wanna see how it turned out up close?\"\n• Fan says they love it → \"It's SO red now 🔥 it matches my personality... fiery 😏\"\n\nTRANSITION TO PPV:\n\"Want the full reveal? 😏 I did a little photoshoot to show off the new colour... and maybe more than just the hair 🙈\"\n\nPPV SUGGESTION:\nHair reveal / close-up photo set — $10-15",
    aiContent: "Hair dye process selfie, red hair close-up, bathroom mirror pic",
    realContent: "New hair photo set, flirty hair-flip video, intimate redhead content",
  },
  {
    model: "Willow",
    text: "Spent the whole morning at a farmers market and got way too many candles 🕯️ my room smells amazing now",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nSpent the whole morning at a farmers market and got way too many candles 🕯️ my room smells amazing now\n\nFAN RESPONSES:\n• Fan asks what scents → \"Lavender, vanilla, and this one called 'midnight rose' 🌹 my room is like a spa now\"\n• Fan says they like candles too → \"A man who appreciates candles? 🥰 that's sexy honestly. Come light them with me\"\n• Fan says it sounds cozy → \"It IS so cozy 🕯️ I'm just lying here surrounded by candles in my robe... very main character energy\"\n\nTRANSITION TO PPV:\n\"My room looks SO pretty with all these candles lit 🕯️ I may have taken some photos in the candlelight... wanna see? 😏\"\n\nPPV SUGGESTION:\nCandlelit / cozy aesthetic photo set — $10-12",
    aiContent: "Farmers market stalls, candle collection, cozy room with candles",
    realContent: "Candlelit bedroom photos, robe content, moody lighting set",
  },
  {
    model: "Willow",
    text: "Rainy day so I'm curled up with a book and tea ☕🌧️ perfect cozy day. What do you do on rainy days?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nRainy day so I'm curled up with a book and tea ☕🌧️ perfect cozy day. What do you do on rainy days?\n\nFAN RESPONSES:\n• Fan says they stay in too → \"We could be cozy together 🥺 imagine just cuddling with the rain outside...\"\n• Fan asks what book → Share title → \"It's a romance 🙈 it's giving me ideas... the main character is very bold\"\n• Fan says they'd keep her company → \"I'd love that 🥰 I'm in my big sweater with nothing underneath... just saying\"\n\nTRANSITION TO PPV:\n\"It's so cozy in here 🥰 I'm in my oversized sweater and that's basically it 🙈 want to see my rainy day look? 😏\"\n\nPPV SUGGESTION:\nOversized sweater / cozy intimate set — $10-15",
    aiContent: "Rainy window photo, tea and book flat lay, cozy blanket scene",
    realContent: "Oversized sweater content, cozy bedroom photos, reading-in-bed set",
  },
  {
    model: "Willow",
    text: "Just tried this new Thai place near me and it was SO good 🍜 I'm a total foodie. What's your favourite cuisine?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust tried this new Thai place near me and it was SO good 🍜 I'm a total foodie. What's your favourite cuisine?\n\nFAN RESPONSES:\n• Fan shares their favourite → \"Omg I love that too! We should get dinner together sometime 🥺 I'd be great company\"\n• Fan says they'd take her out → \"A dinner date? 🥰 I'd dress up SO cute for you. Where would you take me?\"\n• Fan talks about food → Build rapport → \"I love a man who likes food 😏 the way to my heart is 100% through my stomach\"\n\nTRANSITION TO PPV:\n\"I got all dressed up for dinner tonight 🥰 want to see my outfit? I may have shown a little too much... 😏\"\n\nPPV SUGGESTION:\nDate-night outfit / dinner-look photo set — $8-12",
    aiContent: "Thai food close-up, restaurant ambiance, dinner table selfie",
    realContent: "Date-night outfit set, cleavage dinner look, dressed-up content",
  },
  {
    model: "Willow",
    text: "Movie night with my cat tonight 🐱🎬 she always judges my movie choices lol. What should I watch?",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nMovie night with my cat tonight 🐱🎬 she always judges my movie choices lol. What should I watch?\n\nFAN RESPONSES:\n• Fan suggests a movie → \"Oooh good pick! I'll watch it 🎬 wish you were here to watch with me though 🥺\"\n• Fan says a scary movie → \"I HATE scary movies 😱 but if you were here to hold me... maybe 😏\"\n• Fan asks about the cat → Send AI cat photo → \"She's so cute but such a diva 😂 she's judging me right now for being in my pjs already\"\n\nTRANSITION TO PPV:\n\"Ok I'm all set up for movie night 🍿 I'm in my little pjs and honestly they're kinda revealing 🙈 wanna see my movie night fit? 😏\"\n\nPPV SUGGESTION:\nPyjama / cozy night photo set — $8-12",
    aiContent: "Cat on couch photo, movie screen with snacks, cozy living room",
    realContent: "Pyjama set photos, cozy night content, cute-with-cat clips",
  },
  {
    model: "Willow",
    text: "Yoga this morning has me feeling so zen 🧘‍♀️ I swear it fixes everything. You ever try it?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nYoga this morning has me feeling so zen 🧘‍♀️ I swear it fixes everything. You ever try it?\n\nFAN RESPONSES:\n• Fan says no → \"You should! 🧘‍♀️ I'm super flexible now... that comes in handy 😏\"\n• Fan says yes → \"No way! What's your favourite pose? Mine is downward dog... for obvious reasons 🍑😂\"\n• Fan makes a flexibility joke → \"Haha you'd be surprised 😏 I can do things most people can't...\"\n\nTRANSITION TO PPV:\n\"Yoga makes me SO flexible 🧘‍♀️ want to see some of my poses? My outfit was really cute too 😏\"\n\nPPV SUGGESTION:\nYoga / flexible poses photo set — $10-15",
    aiContent: "Yoga mat setup, sunrise yoga silhouette, zen garden photo",
    realContent: "Yoga pose photos, flexible body content, workout outfit set",
  },
  {
    model: "Willow",
    text: "Took myself on a solo date to the art gallery today 🎨 sometimes you just need your own company",
    category: "weekend",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nTook myself on a solo date to the art gallery today 🎨 sometimes you just need your own company\n\nFAN RESPONSES:\n• Fan says that's cool → \"It was SO nice 🎨 but I'd rather have gone with someone... like you maybe? 🥺\"\n• Fan offers to take her next time → \"Omg a gallery date? 🥰 that's literally my dream. You'd get bonus points for that\"\n• Fan asks what art she saw → Share details → \"There was this one painting... very sensual. Made me think of things 😏\"\n\nTRANSITION TO PPV:\n\"The art inspired me 🎨 I did my own little 'art project' photoshoot when I got home... very artistic, very tasteful 😏 wanna see?\"\n\nPPV SUGGESTION:\nArtistic / editorial style photo set — $12-15",
    aiContent: "Art gallery interior, paintings on wall, artsy aesthetic selfie",
    realContent: "Artistic nude/semi-nude photo set, editorial-style content",
  },
  {
    model: "Willow",
    text: "Just baked cookies and they actually turned out good for once 🍪 wish I could share some with you",
    category: "flirty",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust baked cookies and they actually turned out good for once 🍪 wish I could share some with you\n\nFAN RESPONSES:\n• Fan says they wish they could try → \"I'll save you some 🥺 but you have to come get them... or I could deliver 😏\"\n• Fan compliments her → \"Aww 🥰 I'm a whole package — cute AND I can bake? Wifey material right?\"\n• Fan asks what kind → \"Chocolate chip! 🍪 I may have gotten some chocolate on me though... 🙈\"\n\nTRANSITION TO PPV:\n\"Baking was messy 😂 I got flour everywhere and chocolate on my shirt... had to take it off 🙈 wanna see the evidence? 😏\"\n\nPPV SUGGESTION:\nMessy baking / apron content — $8-12",
    aiContent: "Fresh cookies on tray, flour-dusted counter, baking scene",
    realContent: "Messy baking photos, flour-on-face content, apron-only set",
  },
  // NEW Willow scenarios
  {
    model: "Willow",
    text: "Started painting again today 🎨 I haven't picked up a brush in months but it felt like therapy. I got paint EVERYWHERE though",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nStarted painting again today 🎨 I haven't picked up a brush in months but it felt like therapy. I got paint EVERYWHERE though\n\nFAN RESPONSES:\n• Fan asks what she painted → \"Something abstract 🎨 all reds and oranges to match my hair 😂 I'll show you if you want\"\n• Fan says they'd love to see → \"The painting or me covered in paint? 😏 because both are a sight right now\"\n• Fan says that's cool/artsy → \"I'm such an artsy mess 🥰 my hands, my clothes, my face... paint everywhere. Kinda cute though\"\n\nTRANSITION TO PPV:\n\"I literally have paint on my arms, my neck, my legs 😂 I should probably shower but... wanna see the artistic mess first? 😏 it's actually really cute\"\n\nPPV SUGGESTION:\nPaint-covered artsy photo set — $10-15",
    aiContent: "Canvas with abstract art, paint palette, messy art studio",
    realContent: "Body-with-paint photos, artsy editorial content, creative photoshoot",
  },
  {
    model: "Willow",
    text: "Built a blanket fort and put fairy lights inside 🏰✨ playing my vinyl records and drinking wine. This is my perfect night",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nBuilt a blanket fort and put fairy lights inside 🏰✨ playing my vinyl records and drinking wine. This is my perfect night\n\nFAN RESPONSES:\n• Fan says that sounds amazing → \"It IS 🥰 only thing missing is someone to share it with... wish you were here\"\n• Fan says they'd join → \"Yes please 🥺 we'd just lie here with the fairy lights and music... so romantic\"\n• Fan asks what she's listening to → \"Fleetwood Mac 🎶 perfect vibes for a cozy night. I'm already on my second glass of wine 😏\"\n\nTRANSITION TO PPV:\n\"The fairy lights make everything look so dreamy ✨ I may have taken some photos in here... the lighting is TOO good to waste 😏 wanna see my blanket fort photoshoot?\"\n\nPPV SUGGESTION:\nFairy light / cozy intimate photo set — $12-18",
    aiContent: "Blanket fort with fairy lights, vinyl record player, wine glass aesthetic",
    realContent: "Fairy-light intimate photos, cozy lingerie set, dreamy bedroom content",
  },

  // ═══════════════════════════════════════════
  // LUCINDA BLEU (10 scenarios — goth/alternative)
  // ═══════════════════════════════════════════
  {
    model: "Lucinda Bleu",
    text: "Just reorganised my entire vinyl collection 🎶 there's something so satisfying about it. You into music?",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust reorganised my entire vinyl collection 🎶 there's something so satisfying about it. You into music?\n\nFAN RESPONSES:\n• Fan shares their music taste → \"Omg what do you listen to? If you say anything mainstream I'm judging you 😂🖤\"\n• Fan says yes → \"A man with taste 🖤 tell me your top 3 albums and I'll tell you mine. This is a test 😏\"\n• Fan asks about her collection → \"All the classics — Bauhaus, Siouxsie, Joy Division 🖤 my taste is dark and so am I\"\n\nTRANSITION TO PPV:\n\"I was sorting records in my band tee and underwear 🙈 my room looked like a moody album cover... wanna see the aesthetic? 😏\"\n\nPPV SUGGESTION:\nBand tee / vinyl aesthetic photo set — $10-12",
    aiContent: "Vinyl collection spread, record player spinning, dark room with albums",
    realContent: "Band tee bedroom content, vinyl-aesthetic photoshoot, intimate music-room set",
  },
  {
    model: "Lucinda Bleu",
    text: "Went to a vintage shop today and found the sickest leather jacket 🖤 goth girl shopping spree",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nWent to a vintage shop today and found the sickest leather jacket 🖤 goth girl shopping spree\n\nFAN RESPONSES:\n• Fan says cool → \"It's SO good 🖤 I feel like a badass in it. I tried it on with just a bra underneath... looked insane\"\n• Fan asks to see it → \"Maybe 😏 but you have to appreciate the full look. Leather jacket + not much else = 🔥\"\n• Fan compliments her style → \"Goth girls do it best 🖤 you clearly have taste. I like that about you\"\n\nTRANSITION TO PPV:\n\"I tried the jacket on at home with basically nothing underneath 🙈 it's giving rockstar girlfriend. Wanna see? 😏\"\n\nPPV SUGGESTION:\nLeather jacket / edgy fashion set — $10-15",
    aiContent: "Vintage shop interior, leather jacket close-up, goth accessories display",
    realContent: "Leather jacket bra-only photos, edgy fashion set, alt-girl content",
  },
  {
    model: "Lucinda Bleu",
    text: "Doing my makeup for like an hour because I have nowhere to go 😂 but I look hot so whatever",
    category: "flirty",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nDoing my makeup for like an hour because I have nowhere to go 😂 but I look hot so whatever\n\nFAN RESPONSES:\n• Fan says she should go out → \"Nah I'd rather stay in and show YOU 😏 why waste this face on random people?\"\n• Fan asks to see → \"Hmm maybe 😈 but you have to earn it. Tell me something that'll make me blush\"\n• Fan compliments her → \"You haven't even seen it yet 😏 the dark lips and smoky eyes? I look dangerous tonight\"\n\nTRANSITION TO PPV:\n\"I look TOO good to not take photos 📸 did a whole dark glam shoot... wanna see? The makeup isn't the only thing that's dark 😈\"\n\nPPV SUGGESTION:\nGlam makeup / dark beauty photo set — $10-15",
    aiContent: "Makeup vanity setup, dark lipstick close-up, moody mirror selfie",
    realContent: "Dark glam photoshoot, smoky eye editorial, lingerie-with-makeup set",
  },
  {
    model: "Lucinda Bleu",
    text: "Late night vibes... listening to The Cure and overthinking everything 🌙 you ever get like that?",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nLate night vibes... listening to The Cure and overthinking everything 🌙 you ever get like that?\n\nFAN RESPONSES:\n• Fan relates → \"Right? 🖤 late nights are when my brain goes crazy. At least I have you to talk to\"\n• Fan asks what she's thinking about → \"Everything and nothing 🌙 life, the future... and maybe some things I shouldn't tell you 😏\"\n• Fan tries to comfort her → \"You're sweet 🥺 I don't need fixing... just someone to sit in the dark with me\"\n\nTRANSITION TO PPV:\n\"I'm in this mood where I just want to be seen 🌙 I took some really intimate photos in this lighting... wanna see my late-night self? 😏\"\n\nPPV SUGGESTION:\nMoody / dark lighting intimate set — $12-18",
    aiContent: "Dark bedroom with mood lighting, record player at night, moonlit window",
    realContent: "Low-light intimate photos, moody bedroom content, artistic dark set",
  },
  {
    model: "Lucinda Bleu",
    text: "Went to a gig last night and my ears are still ringing 🎸 but it was so worth it. You like live music?",
    category: "weekend",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nWent to a gig last night and my ears are still ringing 🎸 but it was so worth it. You like live music?\n\nFAN RESPONSES:\n• Fan says yes → \"What's the best gig you've been to? I'm judging your answer 😏🖤\"\n• Fan asks what band → \"This small punk band 🎸 nobody knows them yet but they were INSANE. I was right at the front\"\n• Fan says they'd go with her → \"I need a gig buddy 🖤 but warning — I go HARD at shows. Mosh pit energy\"\n\nTRANSITION TO PPV:\n\"My gig outfit was insane 🖤 ripped tights, crop top, the works. I looked like a groupie 😏 wanna see?\"\n\nPPV SUGGESTION:\nGig outfit / punk-rock look photo set — $10-12",
    aiContent: "Concert venue, crowd at gig, stage lights and band",
    realContent: "Gig outfit photos, ripped tights content, alt-girl going-out set",
  },
  {
    model: "Lucinda Bleu",
    text: "Just got a new piercing and I'm lowkey scared it's gonna hurt for days 😬 but it looks fire",
    category: "casual",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nJust got a new piercing and I'm lowkey scared it's gonna hurt for days 😬 but it looks fire\n\nFAN RESPONSES:\n• Fan asks where → \"Hmm that's a loaded question 😏 let's just say it's somewhere fun. Wanna guess?\"\n• Fan says they like piercings → \"A man who appreciates piercings? 🖤 you'd love my collection then... I have a few you haven't seen\"\n• Fan says they're scared of needles → \"I'm tough 💪🖤 pain is just spicy feelings. Besides, I look hot with them\"\n\nTRANSITION TO PPV:\n\"Want to see where I got pierced? 😏 I'll give you a hint — it's not my ears this time 🙈\"\n\nPPV SUGGESTION:\nPiercing reveal / body close-up set — $12-15",
    aiContent: "Piercing studio, jewelry close-up, alternative girl aesthetic",
    realContent: "Piercing reveal photos, body jewelry content, close-up intimate set",
  },
  {
    model: "Lucinda Bleu",
    text: "Sketching in my room with candles lit 🕯️✏️ this is my version of peace. What's yours?",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nSketching in my room with candles lit 🕯️✏️ this is my version of peace. What's yours?\n\nFAN RESPONSES:\n• Fan shares their peace → \"That sounds nice 🖤 I love knowing the real you. We're connecting on a deeper level\"\n• Fan asks what she's drawing → \"Something dark and beautiful 🕯️ kind of like me 😏 want to see?\"\n• Fan says she's creative → \"Art is my outlet 🖤 I put all my feelings into it. Some of my sketches are... very intimate\"\n\nTRANSITION TO PPV:\n\"I sketched something tonight that's very personal 🕯️ and I may have used myself as the reference... wanna see the sketch AND the reference photo? 😏\"\n\nPPV SUGGESTION:\nArtistic / candlelit self-portrait set — $12-18",
    aiContent: "Sketchbook pages, candlelit desk, dark room with art supplies",
    realContent: "Candlelit intimate photos, artistic self-portrait content, moody bedroom set",
  },
  {
    model: "Lucinda Bleu",
    text: "Found this abandoned building to do a photoshoot in today 📸 the aesthetic was PERFECT",
    category: "weekend",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nFound this abandoned building to do a photoshoot in today 📸 the aesthetic was PERFECT\n\nFAN RESPONSES:\n• Fan asks to see → \"The photos came out SO good 📸 dark, moody, a little dangerous... just like me 😏\"\n• Fan says that's cool → \"I love finding creepy beautiful places 🖤 this one had broken windows and graffiti. Perfect backdrop\"\n• Fan worries about her safety → \"Aww you're worried about me? 🥺 that's sweet. I had a friend with me... but the photos look like I'm all alone 😈\"\n\nTRANSITION TO PPV:\n\"The photos from today are INSANE 📸 very dark, very artistic, very... revealing 😏 the abandoned building gave main character energy. Wanna see the full set?\"\n\nPPV SUGGESTION:\nUrban exploration / edgy photoshoot set — $15-20",
    aiContent: "Abandoned building exterior, graffiti walls, broken windows urban decay",
    realContent: "Urban photoshoot set, edgy location content, artistic revealing photos",
  },
  // NEW Lucinda scenarios
  {
    model: "Lucinda Bleu",
    text: "Did a tarot reading for myself tonight and the cards said some WILD things 🔮🖤 want me to pull a card for you?",
    category: "evening",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1596394723269-e8e8a43ab2a8?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nDid a tarot reading for myself tonight and the cards said some WILD things 🔮🖤 want me to pull a card for you?\n\nFAN RESPONSES:\n• Fan says yes → Pull a flirty card → \"Interesting... The Lovers came up 😏 the cards know something we don't\"\n• Fan is sceptical → \"You don't believe? 🔮 let me prove it. I'll pull one and I bet it's accurate\"\n• Fan asks what hers said → \"It said someone new is about to get very close to me 🖤 maybe that's you? 😏\"\n\nTRANSITION TO PPV:\n\"The cards put me in a mood tonight 🔮 I did a little witchy photoshoot by candlelight... tarot cards, black lace, the whole vibe 😈 wanna see?\"\n\nPPV SUGGESTION:\nTarot / witchy aesthetic photo set — $12-18",
    aiContent: "Tarot card spread, crystal collection, candlelit occult setup",
    realContent: "Witchy photoshoot, black lace candlelit content, dark feminine set",
  },
  {
    model: "Lucinda Bleu",
    text: "Went for a midnight swim at the lake 🌙🖤 the water was freezing but the moonlight was worth it. I feel alive",
    category: "spicy",
    status: "available",
    oneTimeOnly: false,
    usedBy: null,
    usedAt: null,
    cooldownUntil: null,
    createdBy: "mark",
    imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=200&h=200&fit=crop",
    scriptFlow: "OPENING LINE:\nWent for a midnight swim at the lake 🌙🖤 the water was freezing but the moonlight was worth it. I feel alive\n\nFAN RESPONSES:\n• Fan says that sounds adventurous → \"I love doing wild things at night 🌙 the darkness makes me brave. I may have gone in without much on...\"\n• Fan asks if she was alone → \"Just me and the moon 🖤 nobody around for miles. I could do whatever I wanted... and I did 😏\"\n• Fan says they'd swim with her → \"Midnight swims are my love language 🌙 but you'd have to keep up with me... and keep your eyes open 😈\"\n\nTRANSITION TO PPV:\n\"The moonlight on the water was unreal 🌙 I took some photos and they're like a dark fairy tale... very wet, very revealing 😏 wanna see my midnight swim?\"\n\nPPV SUGGESTION:\nMoonlit / wet body photo set — $15-25",
    aiContent: "Moonlit lake, dark water reflection, nighttime outdoor scene",
    realContent: "Wet body photoshoot, moonlight-aesthetic content, dark outdoor intimate set",
  },
];

export default function ScenarioBoard() {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "supervisor" || user?.role === "data_entry";
  const isChatter = user?.role === "chatter";

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterModel, setFilterModel] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("available");
  const [search, setSearch] = useState("");

  const [formModel, setFormModel] = useState("");
  const [formText, setFormText] = useState("");
  const [formCategory, setFormCategory] = useState<Scenario["category"]>("casual");
  const [formOneTime, setFormOneTime] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        let data: Scenario[] = JSON.parse(saved);
        const today = new Date().toISOString().split("T")[0];
        data = data.map(s => {
          if (s.status === "cooldown" && s.cooldownUntil && s.cooldownUntil <= today) {
            return { ...s, status: "available" as const, usedBy: null, usedAt: null, cooldownUntil: null };
          }
          return s;
        });
        // Seed if empty
        if (data.length === 0) {
          data = SEED_SCENARIOS.map((s, i) => ({ ...s, id: (Date.now() + i).toString(), createdAt: new Date().toISOString() }));
        }
        setScenarios(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch { setScenarios([]); }
    } else {
      // First load — seed with defaults
      const seeded: Scenario[] = SEED_SCENARIOS.map((s, i) => ({ ...s, id: (Date.now() + i).toString(), createdAt: new Date().toISOString() }));
      setScenarios(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
  }, []);

  const save = useCallback((data: Scenario[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setScenarios(data);
  }, []);

  const addScenario = () => {
    if (!formModel || !formText.trim()) return;
    const scenario: Scenario = {
      id: Date.now().toString(),
      model: formModel,
      text: formText.trim(),
      category: formCategory,
      status: "available",
      oneTimeOnly: formOneTime,
      usedBy: null,
      usedAt: null,
      cooldownUntil: null,
      createdBy: user?.username || "Unknown",
      createdAt: new Date().toISOString().split("T")[0],
    };
    save([scenario, ...scenarios]);
    setFormText("");
    setFormOneTime(false);
  };

  const claimScenario = (id: string) => {
    save(scenarios.map(s => s.id === id ? {
      ...s,
      status: "in_use" as const,
      usedBy: user?.displayName || user?.username || "Unknown",
      usedAt: new Date().toISOString().split("T")[0],
    } : s));
  };

  const releaseScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    if (scenario.oneTimeOnly) {
      save(scenarios.map(s => s.id === id ? { ...s, status: "archived" as const } : s));
    } else {
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() + COOLDOWN_DAYS);
      save(scenarios.map(s => s.id === id ? {
        ...s,
        status: "cooldown" as const,
        cooldownUntil: cooldownDate.toISOString().split("T")[0],
      } : s));
    }
  };

  const deleteScenario = (id: string) => {
    save(scenarios.filter(s => s.id !== id));
  };

  // Filtering
  let filtered = scenarios;
  if (filterModel !== "all") filtered = filtered.filter(s => s.model === filterModel);
  if (filterCategory !== "all") filtered = filtered.filter(s => s.category === filterCategory);
  if (filterStatus !== "all") filtered = filtered.filter(s => s.status === filterStatus);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => s.text.toLowerCase().includes(q));
  }

  // Stats per model
  const getModelStats = (model: string) => {
    const ms = scenarios.filter(s => s.model === model);
    return {
      total: ms.length,
      available: ms.filter(s => s.status === "available").length,
      inUse: ms.filter(s => s.status === "in_use").length,
      cooldown: ms.filter(s => s.status === "cooldown").length,
    };
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            Scenario Board
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pre-written scenarios for chatters — "what are you up to?" answers that hook fans
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Add Scenario"}
          </Button>
        )}
      </div>

      {/* Model Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MODELS.map(model => {
          const stats = getModelStats(model);
          const shortName = model.split(" ")[0];
          const isSelected = filterModel === model;
          return (
            <div key={model} className={`glass-card p-6 cursor-pointer transition-all ${isSelected ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30" : "hover:border-primary/30 hover:bg-secondary/20"}`}
              onClick={() => setFilterModel(isSelected ? "all" : model)}>
              <p className="text-lg font-bold mb-1">{shortName}</p>
              <p className="text-3xl font-bold text-primary">{stats.available}<span className="text-sm text-muted-foreground font-normal">/{stats.total}</span></p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-green-400">✅ {stats.available}</span>
                <span className="text-xs text-orange-400">🟠 {stats.inUse}</span>
                <span className="text-xs text-zinc-400">⏳ {stats.cooldown}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && canManage && (
        <div className="glass-card p-5 space-y-4 border-primary/30">
          <h3 className="font-semibold text-sm">New Scenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Model</label>
              <select value={formModel} onChange={e => setFormModel(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select model...</option>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Category</label>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value as Scenario["category"])}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formOneTime} onChange={e => setFormOneTime(e.target.checked)}
                  className="rounded border-input" />
                One-time only (archives after use)
              </label>
            </div>
          </div>
          <Textarea value={formText} onChange={e => setFormText(e.target.value)}
            placeholder="Write the scenario as the model would say it... make it exciting, give the fan a hook to respond to!"
            className="min-h-[100px]" />
          <div className="flex gap-2">
            <Button onClick={addScenario} disabled={!formModel || !formText.trim()}>Add Scenario</Button>
            <Button variant="outline" onClick={() => { setFormText(""); setFormOneTime(false); }}>Clear</Button>
          </div>
        </div>
      )}

      {/* Filters - only show when model selected */}
      {filterModel !== "all" && (<div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search scenarios..." className="pl-9" />
        </div>
        <select value={filterModel} onChange={e => setFilterModel(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Models</option>
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-secondary border border-border/30 rounded-md px-3 py-2 text-sm">
          <option value="all">All Statuses</option>
          <option value="available">✅ Available</option>
          <option value="in_use">🟠 In Use</option>
          <option value="cooldown">⏳ Cooldown</option>
          <option value="archived">📁 Archived</option>
        </select>
      </div>)}

      {/* Scenario count */}
      {filterModel !== "all" && (
        <p className="text-sm text-muted-foreground">{filtered.length} scenario{filtered.length !== 1 ? "s" : ""} shown</p>
      )}

      {/* Model Selection View - show when no model selected */}
      {filterModel === "all" && !showForm && (
        <div className="text-center text-muted-foreground text-sm mt-4">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Select a model above to view their scenarios</p>
        </div>
      )}

      {/* Scenarios List - only show when a model is selected */}
      {filterModel !== "all" && (<div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground text-sm">No scenarios found. {canManage ? "Add some!" : "Check back soon."}</p>
          </div>
        ) : (
          filtered.map(scenario => {
            const catInfo = CATEGORIES.find(c => c.value === scenario.category);
            return (
              <div key={scenario.id} className={`glass-card p-4 ${scenario.status === "available" ? "border-green-500/20" : scenario.status === "in_use" ? "border-orange-500/20" : "opacity-60"}`}>
                <div className="flex items-start gap-3">
                  {scenario.imageUrl ? (
                    <img
                      src={scenario.imageUrl}
                      alt=""
                      className="w-[80px] h-[80px] rounded-lg object-cover shrink-0 mt-0.5"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl mt-0.5">{catInfo?.emoji || "💬"}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {scenario.model.split(" ")[0]}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[scenario.category]}`}>
                        {catInfo?.label}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[scenario.status]}`}>
                        {STATUS_LABELS[scenario.status]}
                      </Badge>
                      {scenario.oneTimeOnly && (
                        <Badge variant="outline" className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/30">
                          ⚡ One-time
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{scenario.text}</p>
                    {/* Scenario Package Details */}
                    {(scenario.scriptFlow || scenario.aiContent || scenario.realContent || scenario.vaultRef) && (
                      <div className="mt-3 space-y-3 border-t border-border/20 pt-3">
                        {scenario.vaultRef && (
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/30">📁 {scenario.vaultRef}</Badge>
                          </div>
                        )}
                        {scenario.scriptFlow && (
                          <div className="space-y-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">📋 Script Flow</p>
                            <div className="space-y-2">
                              {scenario.scriptFlow.split(/\n\n/).map((section, sIdx) => {
                                const lines = section.split('\n');
                                const heading = lines[0];
                                const body = lines.slice(1).join('\n');
                                const isHeading = /^[A-Z ]+:/.test(heading);
                                if (isHeading) {
                                  return (
                                    <div key={sIdx} className="rounded-md bg-secondary/30 p-2.5">
                                      <p className="text-[10px] font-bold text-primary uppercase mb-1">{heading.replace(/:$/, '')}</p>
                                      <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{body}</p>
                                    </div>
                                  );
                                }
                                return <p key={sIdx} className="text-xs text-muted-foreground whitespace-pre-wrap">{section}</p>;
                              })}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {scenario.aiContent && (
                            <div className="rounded-md bg-blue-500/5 border border-blue-500/10 p-2.5">
                              <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">🤖 AI Content (Free to send)</p>
                              <p className="text-xs text-muted-foreground">{scenario.aiContent}</p>
                            </div>
                          )}
                          {scenario.realContent && (
                            <div className="rounded-md bg-emerald-500/5 border border-emerald-500/10 p-2.5">
                              <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">💰 Real Content (Behind PPV)</p>
                              <p className="text-xs text-muted-foreground">{scenario.realContent}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>Added by {scenario.createdBy} · {scenario.createdAt}</span>
                      {scenario.usedBy && <span>Used by <strong>{scenario.usedBy}</strong> on {scenario.usedAt}</span>}
                      {scenario.cooldownUntil && <span>Available again: {scenario.cooldownUntil}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {scenario.status === "available" && (isChatter || canManage) && (
                      <Button size="sm" variant="outline" className="text-green-400 border-green-500/30 h-8"
                        onClick={() => claimScenario(scenario.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Use
                      </Button>
                    )}
                    {scenario.status === "in_use" && (
                      <Button size="sm" variant="outline" className="text-orange-400 border-orange-500/30 h-8"
                        onClick={() => releaseScenario(scenario.id)}>
                        <Clock className="h-3 w-3 mr-1" /> Done
                      </Button>
                    )}
                    {canManage && (
                      <Button size="sm" variant="ghost" className="text-red-400 h-8 w-8 p-0"
                        onClick={() => deleteScenario(scenario.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>)}
    </div>
  );
}
