export interface QualityScores {
  personalisation: number;
  responseSpeed: number;
  ppvStrategy: number;
  followUp: number;
  fanRetention: number;
  grammar: number;
  aftercare: number;
  overall: number;
}

export interface ChatterAnalytics {
  shiftsThisWeek: number;
  avgRevenuePerShift: number;
  monthlyTotalRevenue: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  category: "chatter" | "supervisor" | "client-communication";
  trainingProgress: number;
  qualityScore: number;
  qualityScores: QualityScores;
  revenueGenerated: number;
  status: "online" | "offline" | "busy";
  weeklyTasks: number;
  tasksCompleted: number;
  clockedIn?: boolean;
  clockInTime?: string;
  analytics?: ChatterAnalytics;
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
  "Marc": "200 70% 50%",      // blue
  "Jemimah": "30 80% 55%",    // orange
  "Jane": "160 84% 39%",      // green
  "KC": "270 60% 60%",        // purple
  "Jaydee": "45 90% 50%",     // gold
  "Elle": "340 75% 55%",      // pink
  "Luke": "0 0% 80%",         // light grey (owner)
  "Zar": "190 70% 45%",       // teal (supervisor)
  "Mark": "210 80% 60%",      // blue (AI supervisor)
  "Mateo": "15 85% 50%",      // red-orange (client comms)
};

export const modelColors: Record<string, string> = {
  "Izzy": "0 72% 55%",          // red
  "Willow": "160 84% 39%",      // emerald
  "Lucinda Bleu": "270 60% 60%", // purple
  "Ashley Morris": "330 70% 60%", // pink
};

// NOTE: Clock-in status should eventually pull from Discord ON DUTY voice channel
// REAL team only — scores start at 0, only populated from actual quality reviews
// Kenneth REMOVED — not a real team member
export const teamMembers: TeamMember[] = [
  // Chatters (real team members only)
  { 
    id: "1", name: "Marc", avatar: "MA", role: "Chatter", category: "chatter", 
    trainingProgress: 0, qualityScore: 5.0, 
    qualityScores: { personalisation: 4, responseSpeed: 8, ppvStrategy: 4, followUp: 5, fanRetention: 4, grammar: 7, aftercare: 0, overall: 5.0 },
    revenueGenerated: 0, status: "online", weeklyTasks: 5, tasksCompleted: 0, clockedIn: true, clockInTime: "6:00 AM",
    analytics: { shiftsThisWeek: 0, avgRevenuePerShift: 0, monthlyTotalRevenue: 0 }
  },
  { 
    id: "2", name: "Jemimah", avatar: "JM", role: "Chatter", category: "chatter", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "online", weeklyTasks: 5, tasksCompleted: 0, clockedIn: false,
    analytics: { shiftsThisWeek: 0, avgRevenuePerShift: 0, monthlyTotalRevenue: 0 }
  },
  { 
    id: "3", name: "Jane", avatar: "JA", role: "Chatter", category: "chatter", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "offline", weeklyTasks: 5, tasksCompleted: 0, clockedIn: false,
    analytics: { shiftsThisWeek: 0, avgRevenuePerShift: 0, monthlyTotalRevenue: 0 }
  },
  { 
    id: "4", name: "KC", avatar: "KC", role: "Chatter", category: "chatter", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "offline", weeklyTasks: 5, tasksCompleted: 0, clockedIn: false,
    analytics: { shiftsThisWeek: 0, avgRevenuePerShift: 0, monthlyTotalRevenue: 0 }
  },
  { 
    id: "5", name: "Jaydee", avatar: "JD", role: "Chatter", category: "chatter", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "offline", weeklyTasks: 4, tasksCompleted: 0, clockedIn: false,
    analytics: { shiftsThisWeek: 0, avgRevenuePerShift: 0, monthlyTotalRevenue: 0 }
  },
  { 
    id: "6", name: "Elle", avatar: "EL", role: "Chatter", category: "chatter", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "offline", weeklyTasks: 4, tasksCompleted: 0, clockedIn: false,
    analytics: { shiftsThisWeek: 0, avgRevenuePerShift: 0, monthlyTotalRevenue: 0 }
  },
  
  // Supervisors
  { 
    id: "7", name: "Luke", avatar: "LU", role: "Agency Owner", category: "supervisor", 
    trainingProgress: 100, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "online", weeklyTasks: 0, tasksCompleted: 0, clockedIn: false
  },
  { 
    id: "8", name: "Zar", avatar: "ZA", role: "Supervisor", category: "supervisor", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "online", weeklyTasks: 0, tasksCompleted: 0, clockedIn: false
  },
  { 
    id: "9", name: "Mark", avatar: "MK", role: "AI Supervisor", category: "supervisor", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "online", weeklyTasks: 0, tasksCompleted: 0, clockedIn: false
  },
  
  // Client Communication
  { 
    id: "10", name: "Mateo", avatar: "MT", role: "Client Relations", category: "client-communication", 
    trainingProgress: 0, qualityScore: 0, 
    qualityScores: { personalisation: 0, responseSpeed: 0, ppvStrategy: 0, followUp: 0, fanRetention: 0, grammar: 0, aftercare: 0, overall: 0 },
    revenueGenerated: 0, status: "busy", weeklyTasks: 0, tasksCompleted: 0, clockedIn: false
  },
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
