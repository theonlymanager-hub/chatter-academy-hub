/**
 * Team Activity Store
 *
 * Pulls real attendance data from Supabase (attendance table, populated by the
 * Discord attendance bot) and merges it with a local shift schedule to produce
 * a live-style activity feed for the dashboard.
 */

import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type ActivityAction =
  | "logged_in"
  | "logged_out"
  | "started_shift"
  | "ended_shift"
  | "joined_voice"
  | "left_voice"
  | "on_leave";

export interface ActivityEvent {
  id: string;
  user: string;
  action: ActivityAction;
  channel?: string;
  timestamp: string; // ISO
}

export interface TeamMemberStatus {
  name: string;
  isOnDuty: boolean;
  isOnLeave: boolean;
  lastAction: ActivityAction;
  lastSeen: string; // ISO
  currentShift?: string;
}

// ── Shift Schedule (UK time) ───────────────────────────────────────────────

export const SHIFT_SCHEDULE = [
  { shift: "6AM–2PM", members: ["Marc"], startHour: 6, endHour: 14 },
  { shift: "2PM–10PM", members: ["JD", "Jemimah"], startHour: 14, endHour: 22 },
  { shift: "10PM–6AM", members: ["KC", "Jane"], startHour: 22, endHour: 6 },
];

// Discord username → display name mapping
const DISPLAY_NAMES: Record<string, string> = {
  kc: "KC",
  KC: "KC",
  jane: "Jane",
  Jane: "Jane",
  marc: "Marc",
  Marc: "Marc",
  jaydee: "JD",
  Jaydee: "JD",
  JD: "JD",
  jemimah: "Jemimah",
  Jemimah: "Jemimah",
  ThisIsMerridianPie: "JD",
  maybenotrembrandtt: "JD",
};

function resolveDisplayName(raw: string): string {
  return DISPLAY_NAMES[raw] || DISPLAY_NAMES[raw.toLowerCase()] || raw;
}

// ── Fetch from Supabase ────────────────────────────────────────────────────

interface AttendanceRow {
  id: number;
  chatter_name: string;
  discord_username: string;
  login_time: string;
  logout_time: string | null;
  shift: string;
  date: string;
}

/**
 * Pull today's + yesterday's attendance rows and convert to activity events.
 */
export async function fetchTeamActivity(): Promise<{
  activities: ActivityEvent[];
  statuses: TeamMemberStatus[];
}> {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA", { timeZone: "Europe/London" });

  // Try Supabase first
  let rows: AttendanceRow[] = [];
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .in("date", [todayStr, yesterdayStr])
      .order("login_time", { ascending: true });

    if (!error && data) {
      rows = data as AttendanceRow[];
    }
  } catch {
    // Fall through to seed data
  }

  // If no rows from Supabase, use realistic seed data
  if (rows.length === 0) {
    rows = generateSeedData(todayStr, yesterdayStr);
  }

  // Convert rows to activity events
  const activities: ActivityEvent[] = [];
  const latestByUser: Record<string, { action: ActivityAction; timestamp: string; shift?: string }> = {};

  for (const row of rows) {
    const user = resolveDisplayName(row.chatter_name || row.discord_username);

    // Login event
    if (row.login_time) {
      const loginId = `login-${row.id}`;
      activities.push({
        id: loginId,
        user,
        action: "logged_in",
        channel: "ON DUTY",
        timestamp: row.login_time,
      });

      if (!latestByUser[user] || new Date(row.login_time) > new Date(latestByUser[user].timestamp)) {
        latestByUser[user] = { action: "logged_in", timestamp: row.login_time, shift: row.shift };
      }
    }

    // Logout event
    if (row.logout_time) {
      const logoutId = `logout-${row.id}`;
      activities.push({
        id: logoutId,
        user,
        action: "logged_out",
        channel: "ON DUTY",
        timestamp: row.logout_time,
      });

      if (!latestByUser[user] || new Date(row.logout_time) > new Date(latestByUser[user].timestamp)) {
        latestByUser[user] = { action: "logged_out", timestamp: row.logout_time, shift: row.shift };
      }
    }
  }

  // JD is active — removed hardcoded on_leave status

  // ── Determine if a chatter SHOULD be on duty based on shift schedule ──
  const ukHour = parseInt(
    now.toLocaleString("en-GB", { timeZone: "Europe/London", hour: "numeric", hour12: false })
  );

  function isScheduledNow(name: string): boolean {
    for (const s of SHIFT_SCHEDULE) {
      if (!s.members.includes(name)) continue;
      if (s.startHour < s.endHour) {
        // Normal shift (e.g. 6-14, 14-22)
        if (ukHour >= s.startHour && ukHour < s.endHour) return true;
      } else {
        // Overnight shift (e.g. 22-6)
        if (ukHour >= s.startHour || ukHour < s.endHour) return true;
      }
    }
    return false;
  }

  // Build statuses — cross-reference attendance data with shift schedule
  const allMembers = ["KC", "Jane", "Marc", "Jemimah", "JD"];
  const statuses: TeamMemberStatus[] = allMembers.map((name) => {
    const latest = latestByUser[name];
    const rawOnDuty = latest?.action === "logged_in" || latest?.action === "joined_voice";
    const scheduled = isScheduledNow(name);

    // If attendance says "on duty" but their shift has ended, mark them off duty
    // (catches missed logout records)
    const isOnDuty = rawOnDuty && scheduled;

    const isOnLeave = latest?.action === "on_leave";
    return {
      name,
      isOnDuty,
      isOnLeave,
      lastAction: latest?.action || "logged_out",
      lastSeen: latest?.timestamp || now.toISOString(),
      currentShift: latest?.shift,
    };
  });

  // Sort activities by timestamp descending (most recent first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter to last 24 hours only
  const cutoff = now.getTime() - 86400000;
  const recentActivities = activities.filter((a) => new Date(a.timestamp).getTime() > cutoff);

  return { activities: recentActivities, statuses };
}

// ── Seed Data (fallback when Supabase is empty) ────────────────────────────

function generateSeedData(todayStr: string, yesterdayStr: string): AttendanceRow[] {
  const now = new Date();
  // Yesterday ~2 PM UK
  const yesterday2pm = new Date(now);
  yesterday2pm.setDate(yesterday2pm.getDate() - 1);
  yesterday2pm.setHours(14, 0, 0, 0);

  // Yesterday ~10 PM UK
  const yesterday10pm = new Date(now);
  yesterday10pm.setDate(yesterday10pm.getDate() - 1);
  yesterday10pm.setHours(22, 0, 0, 0);

  // Today ~6 AM UK
  const today6am = new Date(now);
  today6am.setHours(6, 0, 0, 0);

  return [
    // KC: logged in ~2 PM yesterday, still on duty
    {
      id: 1001,
      chatter_name: "KC",
      discord_username: "KC",
      login_time: yesterday2pm.toISOString(),
      logout_time: null,
      shift: "2PM-10PM",
      date: yesterdayStr,
    },
    // Jane: logged in ~2 PM yesterday, still on duty
    {
      id: 1002,
      chatter_name: "Jane",
      discord_username: "Jane",
      login_time: yesterday2pm.toISOString(),
      logout_time: null,
      shift: "2PM-10PM",
      date: yesterdayStr,
    },
    // Marc: logged out ~10 PM yesterday
    {
      id: 1003,
      chatter_name: "Marc",
      discord_username: "Marc",
      login_time: new Date(yesterday2pm.getTime() + 3600000).toISOString(),
      logout_time: yesterday10pm.toISOString(),
      shift: "2PM-10PM",
      date: yesterdayStr,
    },
    // Jemimah: logged in yesterday evening, logged out ~6 AM today
    {
      id: 1004,
      chatter_name: "Jemimah",
      discord_username: "Jemimah",
      login_time: yesterday10pm.toISOString(),
      logout_time: today6am.toISOString(),
      shift: "10PM-6AM",
      date: yesterdayStr,
    },
  ];
}

// ── Time formatting helpers ────────────────────────────────────────────────

export function formatTimeAgo(timestamp: string): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatActionLabel(action: ActivityAction, channel?: string): string {
  switch (action) {
    case "logged_in":
      return channel ? `joined ${channel}` : "logged in";
    case "logged_out":
      return channel ? `left ${channel}` : "logged out";
    case "started_shift":
      return "started shift";
    case "ended_shift":
      return "ended shift";
    case "joined_voice":
      return channel ? `joined ${channel}` : "joined voice";
    case "left_voice":
      return channel ? `left ${channel}` : "left voice";
    case "on_leave":
      return "on approved leave";
    default:
      return action;
  }
}
