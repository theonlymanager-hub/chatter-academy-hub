import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

type Status = "FILLED" | "OPEN" | "PROBATION";

interface Role {
  id: string;
  name: string;
  status: Status;
  role: string;
  shift?: string;
  pay: string;
  daily: string[];
  weekly: string[];
  monthly: string[];
  kpis: string[];
}

const supervisorDaily = [
  "Review prior shift handover note",
  "Monitor live shift attendance",
  "5 QC reviews per chatter per shift",
  "Add 1+ entry to Chat Feedback Board",
  "Approve/reject chatter task completion screenshots within 12h",
  "Handle shift requests (approve/deny + find replacement)",
  "Strike missed shifts or quality fails in real-time",
  "Write end-of-shift handover note",
];

const supervisorWeekly = [
  "Prep next week's mass message schedule for own shift (by Sunday)",
  "Attend Sunday team call",
  "Record 1+ training video using Tap Record",
  "Update Content Ideas / Scenario Board with new ideas",
];

const supervisorMonthly = [
  "Submit monthly summary on each chatter on own shift",
  "Recommend raises for chatters hitting QC 7+ for 90 days",
  "Help interview new chatters for own shift",
];

const supervisorKpis = [
  "5+ QC reviews per chatter per shift",
  "1+ training video per week",
  "Chat Feedback Board updated daily",
  "Mass message schedule prepped by Sunday",
  "Shift's avg chatter QC trending upward",
  "Zero false strikes, zero missed real violations",
];

const supervisorPay = "PHP 35-50k/mo + bonuses (Supervisor of Month \$200, Training Video of Month \$100, team-goal +\$50)";

const chatterDaily = [
  "Log in to dashboard at start of shift",
  "Read prior chatter's handover note for assigned model",
  "Check Chatter Tasks for active improvement tasks",
  "Check Chat Feedback Board for new examples",
  "Message fans in priority order: whales > new subs > lapsed > mass",
  "Send scheduled mass messages and PPVs on schedule",
  "Log every PPV sent and unlocked in the dashboard",
  "Maintain < 5 min response time during active conversations",
  "Submit chatter task completion screenshots throughout shift",
  "Check Airbnb Schedule before quoting any custom",
  "Flag whale behavior changes to supervisor immediately",
  "Write end-of-shift handover note",
];

const chatterWeekly = [
  "Read any new Knowledge Base / Chatting Playbook updates",
  "Watch any new Training Videos",
  "Complete chatter tasks (5 verified instances per task)",
];

const chatterKpis = [
  "Average QC score >= 7.0 within 90 days",
  "Response time avg < 5 min during shift",
  "PPV conversion rate tracked individually",
  "Chatter tasks completed on time",
  "Zero Hubstaff complaints / unauthorized access",
  "Below QC 4.0 for a month = automatic fire",
];

const chatterPay = "New hires \$4/hr + 3% commission. After 90 days at QC 7+: \$5/hr + 5% individual commission. After 6 months at QC 8+: \$5.50/hr + 7% individual commission. Bonuses: \$10 per completed task, \$100 Chatter of Month, \$50 Most Improved.";

const SECTIONS: { title: string; roles: Role[] }[] = [
  {
    title: "Management",
    roles: [
      {
        id: "ops-mgr",
        name: "OPEN — Hiring",
        status: "OPEN",
        role: "Operations Manager",
        pay: "PHP 60-80k/mo starter, scales to \$5-6k USD once profitable",
        daily: ["Review overnight handover from Night Supervisor","Monitor live dashboard for revenue, QC, and shift attendance anomalies","Check team Discord for blockers and escalations","Respond to supervisor escalations within 2 hours","Spot-check 2-3 chats per shift across the day","Update Whiteboard with daily priorities"],
        weekly: ["Run Sunday team call (Fireflies on, all 3 supervisors)","Build weekly summary email for founder","Approve next week's mass message schedule from each supervisor","Approve any chatter raises","Submit payroll line items to founder","Update Dashboard Improvements Tracker"],
        monthly: ["Run monthly chatter performance reviews","Make keep/fire calls on chatters below QC 4.0","Update hiring pipeline","Send monthly P&L view to founder","Set next month's team-wide goals (QC, LTV, revenue)"],
        kpis: ["Team avg QC >= 7.0 by end of month 3","Per-model weekly revenue trending up month-over-month","100% shift coverage","Chatter retention (no involuntary churn from A/B-tier)","Sunday summary delivered by 11pm UK every Sunday","Weekly mass message plan approved by Sunday","< 24h response on chatter blockers"],
      },
    ],
  },
  {
    title: "Shift Supervisors",
    roles: [
      { id: "sup-morning", name: "OPEN — Hiring", status: "OPEN", role: "Morning Supervisor", shift: "6AM-2PM UK", pay: supervisorPay, daily: supervisorDaily, weekly: supervisorWeekly, monthly: supervisorMonthly, kpis: supervisorKpis },
      { id: "sup-afternoon", name: "OPEN — Hiring", status: "OPEN", role: "Afternoon Supervisor", shift: "2PM-10PM UK", pay: supervisorPay, daily: supervisorDaily, weekly: supervisorWeekly, monthly: supervisorMonthly, kpis: supervisorKpis },
      { id: "sup-night", name: "OPEN — Hiring", status: "OPEN", role: "Night Supervisor", shift: "10PM-6AM UK", pay: supervisorPay, daily: supervisorDaily, weekly: supervisorWeekly, monthly: supervisorMonthly, kpis: supervisorKpis },
    ],
  },
  {
    title: "Chatters",
    roles: [
      { id: "ch-marc", name: "Marc", status: "PROBATION", role: "Chatter", shift: "Morning 6AM-2PM UK", pay: chatterPay, daily: chatterDaily, weekly: chatterWeekly, monthly: [], kpis: chatterKpis },
      { id: "ch-morning-2", name: "OPEN — Hiring", status: "OPEN", role: "Chatter", shift: "Morning 6AM-2PM UK", pay: chatterPay, daily: chatterDaily, weekly: chatterWeekly, monthly: [], kpis: chatterKpis },
      { id: "ch-aft-1", name: "OPEN — Hiring (replacing JD)", status: "OPEN", role: "Chatter", shift: "Afternoon 2PM-10PM UK", pay: chatterPay, daily: chatterDaily, weekly: chatterWeekly, monthly: [], kpis: chatterKpis },
      { id: "ch-aft-2", name: "OPEN — Hiring (replacing Jemimah)", status: "OPEN", role: "Chatter", shift: "Afternoon 2PM-10PM UK", pay: chatterPay, daily: chatterDaily, weekly: chatterWeekly, monthly: [], kpis: chatterKpis },
      { id: "ch-kc", name: "KC", status: "FILLED", role: "Chatter", shift: "Night 10PM-6AM UK", pay: chatterPay, daily: chatterDaily, weekly: chatterWeekly, monthly: [], kpis: chatterKpis },
      { id: "ch-jane", name: "Jane", status: "FILLED", role: "Chatter", shift: "Night 10PM-6AM UK", pay: chatterPay, daily: chatterDaily, weekly: chatterWeekly, monthly: [], kpis: chatterKpis },
      { id: "ch-buffer", name: "OPEN — Hiring (buffer / any shift)", status: "OPEN", role: "Chatter", shift: "Flexible", pay: chatterPay, daily: chatterDaily, weekly: chatterWeekly, monthly: [], kpis: chatterKpis },
    ],
  },
  {
    title: "Support",
    roles: [
      {
        id: "data-entry",
        name: "OPEN — Hiring",
        status: "OPEN",
        role: "Data Entry / Admin",
        pay: "PHP 20-30k/mo + \$50 monthly accuracy bonus",
        daily: ["Update fan profiles per chatter flags","Process Airbnb booking updates","Add new mass message images to scheduling system","Coordinate custom delivery scheduling","Onboard new hires (NDA, Hubstaff install, account setup)"],
        weekly: ["Build Client Checklist for each model","Review Airbnb Schedule for upcoming week","Pull weekly revenue report from API","Update Chatter Profile photos / bios","Clean up Client Profiles"],
        monthly: ["Help Ops Manager assemble payroll line items"],
        kpis: ["100% data accuracy","< 24h on any data update request","Airbnb schedule always current","New hires fully onboarded within 48h"],
      },
    ],
  },
];

function statusBadge(status: Status) {
  if (status === "FILLED") return (<Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">Filled</Badge>);
  if (status === "OPEN") return (<Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30">Open</Badge>);
  return (<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">Probation</Badge>);
}

function TaskList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{title}</p>
      <ul className="text-sm space-y-1 list-disc pl-5">
        {items.map((item, i) => (<li key={i}>{item}</li>))}
      </ul>
    </div>
  );
}

export default function TeamList() {
  const [openId, setOpenId] = useState<string | null>(null);
  const allRoles = SECTIONS.flatMap((s) => s.roles);
  const total = allRoles.length;
  const filled = allRoles.filter((r) => r.status === "FILLED").length;
  const open = allRoles.filter((r) => r.status === "OPEN").length;
  const probation = allRoles.filter((r) => r.status === "PROBATION").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Roster</h1>
        <p className="text-muted-foreground text-sm mt-1">All positions across the operation — filled, open, and on probation</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Total Positions</p><p className="text-2xl font-bold">{total}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Filled</p><p className="text-2xl font-bold text-green-400">{filled}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">Open</p><p className="text-2xl font-bold text-orange-400">{open}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-muted-foreground">On Probation</p><p className="text-2xl font-bold text-blue-400">{probation}</p></div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <div className="space-y-2">
            {section.roles.map((role) => {
              const isOpen = openId === role.id;
              return (
                <div key={role.id} className="glass-card overflow-hidden">
                  <button onClick={() => setOpenId(isOpen ? null : role.id)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition">
                    {isOpen ? (<ChevronDown className="h-4 w-4 shrink-0" />) : (<ChevronRight className="h-4 w-4 shrink-0" />)}
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold truncate">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.role}{role.shift && ` · ${role.shift}`}</p>
                    </div>
                    {statusBadge(role.status)}
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/10 p-4 space-y-4 bg-black/20">
                      <TaskList title="Daily Responsibilities" items={role.daily} />
                      <TaskList title="Weekly Responsibilities" items={role.weekly} />
                      <TaskList title="Monthly Responsibilities" items={role.monthly} />
                      <TaskList title="KPIs" items={role.kpis} />
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Pay Band</p>
                        <p className="text-sm">{role.pay}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

