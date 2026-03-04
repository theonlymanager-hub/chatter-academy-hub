export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  trainingProgress: number;
  qualityScore: number;
  revenueGenerated: number;
  status: "online" | "offline" | "busy";
  weeklyTasks: number;
  tasksCompleted: number;
  clockedIn?: boolean;
  clockInTime?: string;
}

export interface TrainingModule {
  week: number;
  title: string;
  lessons: { name: string; completed: boolean }[];
  testPassed: boolean;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
}

export interface ShiftEntry {
  id: string;
  memberId: string;
  memberName: string;
  day: string;
  shift: "morning" | "afternoon" | "night";
  startTime: string;
  endTime: string;
}

export interface MassMessage {
  id: string;
  modelName: string;
  theme: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  messagePreview: string;
  ppvTitle: string;
  ppvPrice: number;
}

export const chatterColors: Record<string, string> = {
  "Jane": "217 91% 60%",      // blue
  "Kenneth": "160 84% 39%",   // green
  "Jaydee": "270 60% 60%",    // purple
  "Jemimah": "30 80% 55%",    // orange
};

export const modelColors: Record<string, string> = {
  "Izzy": "0 72% 55%",          // red
  "Willow": "160 84% 39%",      // emerald
  "Lucinda Bleu": "270 60% 60%", // purple
  "Ashley Morris": "330 70% 60%", // pink
};

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Jane", avatar: "JA", role: "Senior Chatter", trainingProgress: 100, qualityScore: 9.2, revenueGenerated: 12450, status: "online", weeklyTasks: 5, tasksCompleted: 4, clockedIn: true, clockInTime: "8:00 AM" },
  { id: "2", name: "Kenneth", avatar: "KE", role: "Chatter", trainingProgress: 83, qualityScore: 7.8, revenueGenerated: 8320, status: "online", weeklyTasks: 5, tasksCompleted: 3, clockedIn: true, clockInTime: "9:30 AM" },
  { id: "3", name: "Jaydee", avatar: "JD", role: "Junior Chatter", trainingProgress: 50, qualityScore: 6.5, revenueGenerated: 3200, status: "busy", weeklyTasks: 4, tasksCompleted: 2, clockedIn: true, clockInTime: "10:00 AM" },
  { id: "4", name: "Jemimah", avatar: "JM", role: "Chatter", trainingProgress: 67, qualityScore: 8.1, revenueGenerated: 6780, status: "offline", weeklyTasks: 5, tasksCompleted: 5, clockedIn: false },
];

export const trainingCurriculum: TrainingModule[] = [
  { week: 1, title: "Foundations & Platform Basics", lessons: [{ name: "Platform Navigation", completed: true }, { name: "Profile Setup", completed: true }, { name: "Basic Messaging Etiquette", completed: true }, { name: "Content Guidelines", completed: true }], testPassed: true },
  { week: 2, title: "Conversation Techniques", lessons: [{ name: "Opening Messages", completed: true }, { name: "Building Rapport", completed: true }, { name: "Active Listening Signals", completed: true }, { name: "Personality Matching", completed: false }], testPassed: false },
  { week: 3, title: "Revenue Generation", lessons: [{ name: "Upsell Techniques", completed: true }, { name: "PPV Strategy", completed: false }, { name: "Tip Menu Optimization", completed: false }, { name: "Custom Content Pricing", completed: false }], testPassed: false },
  { week: 4, title: "Whale Management", lessons: [{ name: "Identifying High Spenders", completed: false }, { name: "VIP Treatment", completed: false }, { name: "Long-term Retention", completed: false }, { name: "Exclusive Offers", completed: false }], testPassed: false },
  { week: 5, title: "Advanced Strategies", lessons: [{ name: "Mass Messaging", completed: false }, { name: "Scheduling & Timing", completed: false }, { name: "A/B Testing Messages", completed: false }, { name: "Analytics Reading", completed: false }], testPassed: false },
  { week: 6, title: "Mastery & Scaling", lessons: [{ name: "Multi-Account Management", completed: false }, { name: "Team Coordination", completed: false }, { name: "Crisis Management", completed: false }, { name: "Performance Review", completed: false }], testPassed: false },
];

export const tasks: Task[] = [
  { id: "1", title: "Create a whale (subscriber spending $500+)", assignee: "Jane", dueDate: "2026-03-07", status: "in-progress", priority: "high" },
  { id: "2", title: "Hit $500 daily revenue", assignee: "Kenneth", dueDate: "2026-03-05", status: "pending", priority: "high" },
  { id: "3", title: "Use 3 upsell techniques in one conversation", assignee: "Jaydee", dueDate: "2026-03-06", status: "completed", priority: "medium" },
  { id: "4", title: "Send 50 personalized openers", assignee: "Jemimah", dueDate: "2026-03-04", status: "completed", priority: "medium" },
  { id: "5", title: "Convert 5 free followers to paid", assignee: "Jane", dueDate: "2026-03-07", status: "in-progress", priority: "high" },
  { id: "6", title: "Complete Week 2 training module", assignee: "Jaydee", dueDate: "2026-03-05", status: "pending", priority: "low" },
  { id: "7", title: "Achieve 8+ quality score this week", assignee: "Kenneth", dueDate: "2026-03-07", status: "in-progress", priority: "medium" },
  { id: "8", title: "Sell 10 PPV messages", assignee: "Jane", dueDate: "2026-03-06", status: "pending", priority: "high" },
];

// Chatter shift schedule with specific times
export const shiftSchedule: ShiftEntry[] = [
  { id: "1", memberId: "1", memberName: "Jane", day: "Monday", shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
  { id: "2", memberId: "2", memberName: "Kenneth", day: "Monday", shift: "afternoon", startTime: "2:00 PM", endTime: "10:00 PM" },
  { id: "3", memberId: "3", memberName: "Jaydee", day: "Monday", shift: "night", startTime: "10:00 PM", endTime: "6:00 AM" },
  { id: "4", memberId: "4", memberName: "Jemimah", day: "Tuesday", shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
  { id: "5", memberId: "1", memberName: "Jane", day: "Tuesday", shift: "afternoon", startTime: "2:00 PM", endTime: "10:00 PM" },
  { id: "6", memberId: "3", memberName: "Jaydee", day: "Tuesday", shift: "night", startTime: "10:00 PM", endTime: "6:00 AM" },
  { id: "7", memberId: "2", memberName: "Kenneth", day: "Wednesday", shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
  { id: "8", memberId: "1", memberName: "Jane", day: "Wednesday", shift: "afternoon", startTime: "2:00 PM", endTime: "10:00 PM" },
  { id: "9", memberId: "4", memberName: "Jemimah", day: "Thursday", shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
  { id: "10", memberId: "3", memberName: "Jaydee", day: "Thursday", shift: "afternoon", startTime: "2:00 PM", endTime: "10:00 PM" },
  { id: "11", memberId: "2", memberName: "Kenneth", day: "Friday", shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
  { id: "12", memberId: "4", memberName: "Jemimah", day: "Friday", shift: "afternoon", startTime: "2:00 PM", endTime: "10:00 PM" },
  { id: "13", memberId: "1", memberName: "Jane", day: "Saturday", shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
  { id: "14", memberId: "3", memberName: "Jaydee", day: "Saturday", shift: "night", startTime: "10:00 PM", endTime: "6:00 AM" },
  { id: "15", memberId: "2", memberName: "Kenneth", day: "Sunday", shift: "afternoon", startTime: "2:00 PM", endTime: "10:00 PM" },
  { id: "16", memberId: "4", memberName: "Jemimah", day: "Sunday", shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
];

// Generate mass messages for the current month
function generateMassMessages(): MassMessage[] {
  const messages: MassMessage[] = [];
  const models = [
    { name: "Izzy", theme: "Military", messages: {
      Monday: { preview: "Mission briefing incoming... 🎖️", ppv: "Workout tease PPV", price: 12 },
      Wednesday: { preview: "Post-workout vibes... 💪", ppv: "Shower PPV", price: 15 },
      Friday: { preview: "At ease... time to relax 🔥", ppv: "Full solo PPV", price: 18 },
    }},
    { name: "Willow", theme: "Playful Redhead", messages: {
      Monday: { preview: "Mondays are better with me... 😏🔥", ppv: "Playful tease PPV", price: 12 },
      Wednesday: { preview: "Hump day energy 😜", ppv: "Fun strip PPV", price: 15 },
      Friday: { preview: "TGIF baby! Time to celebrate 🧡", ppv: "Full solo PPV", price: 18 },
    }},
    { name: "Lucinda Bleu", theme: "Goth Aesthetic", messages: {
      Monday: { preview: "Come into the darkness... 🖤", ppv: "Candlelit tease PPV", price: 12 },
      Wednesday: { preview: "Feeling dangerous tonight... 😈", ppv: "Lingerie strip PPV", price: 15 },
      Friday: { preview: "The night is ours... 🌙", ppv: "Solo PPV", price: 18 },
    }},
    { name: "Ashley Morris", theme: "College", messages: {
      Monday: { preview: "Just got home from class... 😈", ppv: "Bedroom tease PPV", price: 12 },
      Wednesday: { preview: "Can't believe I'm showing this...", ppv: "Shy strip tease PPV", price: 15 },
      Friday: { preview: "Weekend vibes incoming... 🔥", ppv: "Full solo PPV", price: 18 },
    }},
  ];

  const year = 2026;
  const month = 2; // March (0-indexed)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let id = 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = dayNames[date.getDay()];
    
    for (const model of models) {
      const msgData = model.messages[dayOfWeek as keyof typeof model.messages];
      if (msgData) {
        messages.push({
          id: String(id++),
          modelName: model.name,
          theme: model.theme,
          date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          dayOfWeek,
          messagePreview: msgData.preview,
          ppvTitle: msgData.ppv,
          ppvPrice: msgData.price,
        });
      }
    }
  }

  return messages;
}

export const massMessages: MassMessage[] = generateMassMessages();
