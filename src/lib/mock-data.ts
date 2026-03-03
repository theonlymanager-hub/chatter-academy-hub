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
}

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Rivera", avatar: "AR", role: "Senior Chatter", trainingProgress: 100, qualityScore: 9.2, revenueGenerated: 12450, status: "online", weeklyTasks: 5, tasksCompleted: 4 },
  { id: "2", name: "Jordan Kim", avatar: "JK", role: "Chatter", trainingProgress: 83, qualityScore: 7.8, revenueGenerated: 8320, status: "online", weeklyTasks: 5, tasksCompleted: 3 },
  { id: "3", name: "Sam Taylor", avatar: "ST", role: "Junior Chatter", trainingProgress: 50, qualityScore: 6.5, revenueGenerated: 3200, status: "busy", weeklyTasks: 4, tasksCompleted: 2 },
  { id: "4", name: "Casey Morgan", avatar: "CM", role: "Chatter", trainingProgress: 67, qualityScore: 8.1, revenueGenerated: 6780, status: "offline", weeklyTasks: 5, tasksCompleted: 5 },
  { id: "5", name: "Riley Chen", avatar: "RC", role: "Senior Chatter", trainingProgress: 100, qualityScore: 9.5, revenueGenerated: 15200, status: "online", weeklyTasks: 5, tasksCompleted: 5 },
  { id: "6", name: "Dakota Lee", avatar: "DL", role: "Junior Chatter", trainingProgress: 33, qualityScore: 5.8, revenueGenerated: 1450, status: "offline", weeklyTasks: 4, tasksCompleted: 1 },
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
  { id: "1", title: "Create a whale (subscriber spending $500+)", assignee: "Alex Rivera", dueDate: "2026-03-07", status: "in-progress", priority: "high" },
  { id: "2", title: "Hit $500 daily revenue", assignee: "Jordan Kim", dueDate: "2026-03-05", status: "pending", priority: "high" },
  { id: "3", title: "Use 3 upsell techniques in one conversation", assignee: "Sam Taylor", dueDate: "2026-03-06", status: "completed", priority: "medium" },
  { id: "4", title: "Send 50 personalized openers", assignee: "Casey Morgan", dueDate: "2026-03-04", status: "completed", priority: "medium" },
  { id: "5", title: "Convert 5 free followers to paid", assignee: "Riley Chen", dueDate: "2026-03-07", status: "in-progress", priority: "high" },
  { id: "6", title: "Complete Week 2 training module", assignee: "Dakota Lee", dueDate: "2026-03-05", status: "pending", priority: "low" },
  { id: "7", title: "Achieve 8+ quality score this week", assignee: "Jordan Kim", dueDate: "2026-03-07", status: "in-progress", priority: "medium" },
  { id: "8", title: "Sell 10 PPV messages", assignee: "Alex Rivera", dueDate: "2026-03-06", status: "pending", priority: "high" },
];

export const shiftSchedule: ShiftEntry[] = [
  { id: "1", memberId: "1", memberName: "Alex Rivera", day: "Monday", shift: "morning" },
  { id: "2", memberId: "2", memberName: "Jordan Kim", day: "Monday", shift: "afternoon" },
  { id: "3", memberId: "3", memberName: "Sam Taylor", day: "Monday", shift: "night" },
  { id: "4", memberId: "4", memberName: "Casey Morgan", day: "Tuesday", shift: "morning" },
  { id: "5", memberId: "5", memberName: "Riley Chen", day: "Tuesday", shift: "afternoon" },
  { id: "6", memberId: "6", memberName: "Dakota Lee", day: "Tuesday", shift: "night" },
  { id: "7", memberId: "1", memberName: "Alex Rivera", day: "Wednesday", shift: "afternoon" },
  { id: "8", memberId: "2", memberName: "Jordan Kim", day: "Wednesday", shift: "morning" },
  { id: "9", memberId: "5", memberName: "Riley Chen", day: "Thursday", shift: "morning" },
  { id: "10", memberId: "3", memberName: "Sam Taylor", day: "Thursday", shift: "afternoon" },
  { id: "11", memberId: "4", memberName: "Casey Morgan", day: "Friday", shift: "morning" },
  { id: "12", memberId: "6", memberName: "Dakota Lee", day: "Friday", shift: "afternoon" },
  { id: "13", memberId: "1", memberName: "Alex Rivera", day: "Saturday", shift: "morning" },
  { id: "14", memberId: "5", memberName: "Riley Chen", day: "Saturday", shift: "night" },
  { id: "15", memberId: "2", memberName: "Jordan Kim", day: "Sunday", shift: "afternoon" },
  { id: "16", memberId: "3", memberName: "Sam Taylor", day: "Sunday", shift: "morning" },
];
