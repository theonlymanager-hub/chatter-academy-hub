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
  "Marc": "217 91% 60%",      // blue
  "Jemimah": "30 80% 55%",    // orange
  "Jane": "160 84% 39%",      // green
  "KC": "270 60% 60%",        // purple
  "Kenneth": "340 75% 55%",   // pink/magenta
  "Jaydee": "45 90% 50%",     // gold
};

export const modelColors: Record<string, string> = {
  "Izzy": "0 72% 55%",          // red
  "Willow": "160 84% 39%",      // emerald
  "Lucinda Bleu": "270 60% 60%", // purple
  "Ashley Morris": "330 70% 60%", // pink
};

// NOTE: Clock-in status should eventually pull from Discord ON DUTY voice channel
// Team roster: Marc, Jemimah, Jane, KC, Kenneth, Jaydee
export const teamMembers: TeamMember[] = [
  { id: "1", name: "Marc", avatar: "MA", role: "Chatter", trainingProgress: 85, qualityScore: 8.0, revenueGenerated: 9200, status: "online", weeklyTasks: 5, tasksCompleted: 4, clockedIn: true, clockInTime: "6:00 AM" },
  { id: "2", name: "Jemimah", avatar: "JM", role: "Chatter", trainingProgress: 67, qualityScore: 8.1, revenueGenerated: 6780, status: "online", weeklyTasks: 5, tasksCompleted: 5, clockedIn: true, clockInTime: "6:00 AM" },
  { id: "3", name: "Jane", avatar: "JA", role: "Senior Chatter", trainingProgress: 100, qualityScore: 9.2, revenueGenerated: 12450, status: "offline", weeklyTasks: 5, tasksCompleted: 4, clockedIn: false },
  { id: "4", name: "KC", avatar: "KC", role: "Chatter", trainingProgress: 72, qualityScore: 7.5, revenueGenerated: 5100, status: "offline", weeklyTasks: 5, tasksCompleted: 3, clockedIn: false },
  { id: "5", name: "Kenneth", avatar: "KE", role: "Chatter", trainingProgress: 83, qualityScore: 7.8, revenueGenerated: 8320, status: "offline", weeklyTasks: 5, tasksCompleted: 3, clockedIn: false },
  { id: "6", name: "Jaydee", avatar: "JD", role: "Junior Chatter", trainingProgress: 50, qualityScore: 6.5, revenueGenerated: 3200, status: "offline", weeklyTasks: 4, tasksCompleted: 2, clockedIn: false },
];

export const trainingCurriculum: TrainingModule[] = [
  { week: 1, title: "Foundations & Platform Basics", lessons: [{ name: "Platform Navigation", completed: true }, { name: "Profile Setup", completed: true }, { name: "Basic Messaging Etiquette", completed: true }, { name: "Content Guidelines", completed: true }], testPassed: true },
  { week: 2, title: "Conversation Techniques", lessons: [{ name: "Opening Messages", completed: true }, { name: "Building Rapport", completed: true }, { name: "Active Listening Signals", completed: true }, { name: "Personality Matching", completed: false }], testPassed: false },
  { week: 3, title: "Revenue Generation", lessons: [{ name: "Upsell Techniques", completed: true }, { name: "PPV Strategy", completed: false }, { name: "Tip Menu Optimization", completed: false }, { name: "Custom Content Pricing", completed: false }], testPassed: false },
  { week: 4, title: "Whale Management", lessons: [{ name: "Identifying High Spenders", completed: false }, { name: "VIP Treatment", completed: false }, { name: "Long-term Retention", completed: false }, { name: "Exclusive Offers", completed: false }], testPassed: false },
  { week: 5, title: "Advanced Strategies", lessons: [{ name: "Mass Messaging", completed: false }, { name: "Scheduling & Timing", completed: false }, { name: "A/B Testing Messages", completed: false }, { name: "Analytics Reading", completed: false }], testPassed: false },
  { week: 6, title: "Mastery & Scaling", lessons: [{ name: "Multi-Account Management", completed: false }, { name: "Team Coordination", completed: false }, { name: "Crisis Management", completed: false }, { name: "Performance Review", completed: false }], testPassed: false },
];

// Tasks - cleared placeholder data
// Will be populated with real tasks from supervisors
export const tasks: Task[] = [
  // Add real tasks here
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

// Mass messages - Week of March 9-15, 2026
// Types: mass (general), prompt (conversation starter), ppv (pay-per-view sale)
// PPV frequency: 2-3 per week max per model
export const massMessages: MassMessage[] = [
  // MONDAY March 9
  { id: "1", modelName: "Izzy", theme: "Military", date: "2026-03-09", dayOfWeek: "Monday", messagePreview: "Mission briefing, soldier...", ppvTitle: "Workout tease", ppvPrice: 12 },
  { id: "2", modelName: "Ashley Morris", theme: "College", date: "2026-03-09", dayOfWeek: "Monday", messagePreview: "Studying so hard rn...", ppvTitle: "Study break surprise", ppvPrice: 10 },
  
  // TUESDAY March 10
  { id: "3", modelName: "Willow", theme: "Playful Redhead", date: "2026-03-10", dayOfWeek: "Tuesday", messagePreview: "Woke up feeling extra playful today...", ppvTitle: "Morning stretch", ppvPrice: 12 },
  { id: "4", modelName: "Lucinda Bleu", theme: "Goth Aesthetic", date: "2026-03-10", dayOfWeek: "Tuesday", messagePreview: "The darkness calls...", ppvTitle: "Candlelit session", ppvPrice: 15 },
  
  // WEDNESDAY March 11
  { id: "5", modelName: "Izzy", theme: "Military", date: "2026-03-11", dayOfWeek: "Wednesday", messagePreview: "Post-workout shower time...", ppvTitle: "Shower clean-up", ppvPrice: 15 },
  { id: "6", modelName: "Ashley Morris", theme: "College", date: "2026-03-11", dayOfWeek: "Wednesday", messagePreview: "My roommate is gone all day...", ppvTitle: "Dorm room fun", ppvPrice: 12 },
  
  // THURSDAY March 12
  { id: "7", modelName: "Willow", theme: "Playful Redhead", date: "2026-03-12", dayOfWeek: "Thursday", messagePreview: "New lingerie just arrived...", ppvTitle: "Try-on session", ppvPrice: 15 },
  { id: "8", modelName: "Lucinda Bleu", theme: "Goth Aesthetic", date: "2026-03-12", dayOfWeek: "Thursday", messagePreview: "Late night thoughts...", ppvTitle: "Moonlit reveal", ppvPrice: 12 },
  
  // FRIDAY March 13
  { id: "9", modelName: "Izzy", theme: "Military", date: "2026-03-13", dayOfWeek: "Friday", messagePreview: "At ease soldier... time to relax", ppvTitle: "Off-duty special", ppvPrice: 18 },
  { id: "10", modelName: "Ashley Morris", theme: "College", date: "2026-03-13", dayOfWeek: "Friday", messagePreview: "TGIF! No classes tomorrow...", ppvTitle: "Weekend kickoff", ppvPrice: 15 },
  { id: "11", modelName: "Willow", theme: "Playful Redhead", date: "2026-03-13", dayOfWeek: "Friday", messagePreview: "Friday vibes hitting different...", ppvTitle: "Happy hour tease", ppvPrice: 12 },
  { id: "12", modelName: "Lucinda Bleu", theme: "Goth Aesthetic", date: "2026-03-13", dayOfWeek: "Friday", messagePreview: "Friday the 13th special...", ppvTitle: "Unlucky for you", ppvPrice: 13 },
  
  // SATURDAY March 14
  { id: "13", modelName: "Izzy", theme: "Military", date: "2026-03-14", dayOfWeek: "Saturday", messagePreview: "Weekend warrior mode...", ppvTitle: "Training montage", ppvPrice: 15 },
  { id: "14", modelName: "Ashley Morris", theme: "College", date: "2026-03-14", dayOfWeek: "Saturday", messagePreview: "Lazy Saturday morning...", ppvTitle: "Bed head cutie", ppvPrice: 10 },
  
  // SUNDAY March 15
  { id: "15", modelName: "Willow", theme: "Playful Redhead", date: "2026-03-15", dayOfWeek: "Sunday", messagePreview: "Sunday funday...", ppvTitle: "Rest day relaxation", ppvPrice: 12 },
  { id: "16", modelName: "Lucinda Bleu", theme: "Goth Aesthetic", date: "2026-03-15", dayOfWeek: "Sunday", messagePreview: "Sundays are for self-care...", ppvTitle: "Bath time ritual", ppvPrice: 15 },
];
