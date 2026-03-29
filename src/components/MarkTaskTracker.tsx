import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MarkTask {
  id: string;
  title: string;
  status: 'active' | 'queued' | 'done';
  category: string;
  created_at: string;
  completed_at: string | null;
  notes: string | null;
}

const STATUS_ICONS = {
  active: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  queued: <Clock className="h-4 w-4 text-yellow-500" />,
  done: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

const STATUS_COLORS = {
  active: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  done: 'bg-green-500/10 text-green-500 border-green-500/20',
};

// Hardcoded tasks until Supabase table is created
const STATIC_TASKS: MarkTask[] = [
  // ACTIVE — actually working on RIGHT NOW
  { id: '1', title: 'Weekly LTV tracking — historical week-over-week data', status: 'active', category: 'Dashboard', created_at: '2026-03-29T23:00:00Z', completed_at: null, notes: 'Luke wants weekly LTV trend, not just snapshot' },
  { id: '2', title: 'Daily automated OF API revenue pull (cron)', status: 'active', category: 'API', created_at: '2026-03-29T23:00:00Z', completed_at: null, notes: 'So dashboard updates automatically without manual pulls' },

  // QUEUED — next up
  { id: '3', title: 'Luke\'s Tasks section on dashboard', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T18:00:00Z', completed_at: null, notes: null },
  { id: '4', title: 'Smart mass messaging system (exclude active convos + whales)', status: 'queued', category: 'API', created_at: '2026-03-29T18:00:00Z', completed_at: null, notes: null },
  { id: '5', title: 'Scenarios → mass messages → scripts pipeline', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T18:00:00Z', completed_at: null, notes: null },
  { id: '6', title: 'Dashboard — chatter task repetition system (10-15x)', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '7', title: 'Client-facing content checklist page (no agency branding)', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '8', title: 'Dashboard — training results visibility (needs Supabase table)', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: 'Blocked: quiz_results table doesn\'t exist' },
  { id: '9', title: 'Dashboard — team activity feed fix', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '10', title: 'Expired fan re-engagement mass messages', status: 'queued', category: 'API', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: null },
  { id: '11', title: 'Whale detection auto-alerts', status: 'queued', category: 'API', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: null },
  { id: '12', title: 'Airbnb schedule on dashboard + content checklists', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '13', title: 'Fan profiles cleanup', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '14', title: 'Time-off request sync (needs Supabase table)', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T07:30:00Z', completed_at: null, notes: 'Blocked: time_off_requests table doesn\'t exist' },
  { id: '15', title: 'Strikes system — move to Supabase from localStorage', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '16', title: 'Smart PPV timing system', status: 'queued', category: 'API', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: null },
  { id: '17', title: 'Content ideas page with weekly targets per client', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: null },

  // DONE TODAY
  { id: '100', title: 'Mass message schedule — week of 30 Mar to 5 Apr', status: 'done', category: 'Operations', created_at: '2026-03-29T11:00:00Z', completed_at: '2026-03-29T12:27:00Z', notes: 'Posted to #mass-message-schedule: Ashley, Willow, Izzie. 7 days each.' },
  { id: '101', title: 'Morning briefing sent to Luke', status: 'done', category: 'Operations', created_at: '2026-03-29T08:50:00Z', completed_at: '2026-03-29T08:51:00Z', notes: 'Covered overnight recap, to-do, weekly numbers' },
  { id: '102', title: 'Whale James birthday message — posted to CHAT TEAM', status: 'done', category: 'Operations', created_at: '2026-03-29T04:20:00Z', completed_at: '2026-03-29T04:23:00Z', notes: 'Jane confirmed. Custom void (deleted tipping account).' },
  { id: '103', title: 'Sunday push message to chatters', status: 'done', category: 'Operations', created_at: '2026-03-29T13:00:00Z', completed_at: '2026-03-29T13:01:00Z', notes: 'Focus on whale follow-ups, re-engage quiet fans' },
  { id: '104', title: 'OF API wrapper (ofapi.ts)', status: 'done', category: 'Dashboard', created_at: '2026-03-29T13:30:00Z', completed_at: '2026-03-29T14:30:00Z', notes: 'Full wrapper: earnings, fans, transactions, chats, mass messaging, vault. Pushed to GitHub.' },
  { id: '105', title: 'RevenueLTV dashboard component', status: 'done', category: 'Dashboard', created_at: '2026-03-29T14:00:00Z', completed_at: '2026-03-29T14:30:00Z', notes: 'Weekly revenue target bar, per-model LTV cards, PPV rate. Pushed to GitHub.' },
  { id: '106', title: 'Mark Task Tracker on dashboard', status: 'done', category: 'Dashboard', created_at: '2026-03-29T14:45:00Z', completed_at: '2026-03-29T14:55:00Z', notes: 'Active/queued/done with filters. Luke can see what Mark is working on.' },
  { id: '107', title: 'Chat Feedback Board populated (2 → 12 entries)', status: 'done', category: 'Dashboard', created_at: '2026-03-29T16:00:00Z', completed_at: '2026-03-29T16:45:00Z', notes: '10 new QC-based entries: dead responses, premature PPVs, copy-paste, panic responses, good examples.' },
  { id: '108', title: 'Shift Calendar cleanup', status: 'done', category: 'Dashboard', created_at: '2026-03-29T16:30:00Z', completed_at: '2026-03-29T16:45:00Z', notes: 'Cleaner header, quick overview badges showing today\'s assignments.' },
  { id: '109', title: 'Chatting Playbook — full page', status: 'done', category: 'Knowledge Base', created_at: '2026-03-29T16:45:00Z', completed_at: '2026-03-29T17:30:00Z', notes: '6 sections, 30+ techniques: Conversation Flow, PPV Timing, Whale Handling, Upsell Ladder, Sexting Flow, Common Mistakes.' },
  { id: '110', title: 'Content filming checklist for Luke', status: 'done', category: 'Content', created_at: '2026-03-29T17:00:00Z', completed_at: '2026-03-29T17:15:00Z', notes: 'Per-model breakdown: categories, scenarios, quantities. ~60-75 content pieces/week across 3 models.' },
];

export default function MarkTaskTracker() {
  const [tasks, setTasks] = useState<MarkTask[]>(STATIC_TASKS);
  const [filter, setFilter] = useState<'all' | 'active' | 'queued' | 'done'>('all');

  const activeTasks = tasks.filter(t => t.status === 'active');
  const queuedTasks = tasks.filter(t => t.status === 'queued');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Mark's Tasks</CardTitle>
          <div className="flex gap-1">
            <Badge 
              variant={filter === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer text-xs"
              onClick={() => setFilter('all')}
            >
              All ({tasks.length})
            </Badge>
            <Badge 
              variant={filter === 'active' ? 'default' : 'outline'} 
              className="cursor-pointer text-xs"
              onClick={() => setFilter('active')}
            >
              Active ({activeTasks.length})
            </Badge>
            <Badge 
              variant={filter === 'queued' ? 'default' : 'outline'} 
              className="cursor-pointer text-xs"
              onClick={() => setFilter('queued')}
            >
              Queued ({queuedTasks.length})
            </Badge>
            <Badge 
              variant={filter === 'done' ? 'default' : 'outline'} 
              className="cursor-pointer text-xs"
              onClick={() => setFilter('done')}
            >
              Done ({doneTasks.length})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-2 rounded-lg border ${STATUS_COLORS[task.status]}`}
            >
              <div className="mt-0.5">{STATUS_ICONS[task.status]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                    {task.category}
                  </Badge>
                </div>
                {task.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5">{task.notes}</p>
                )}
                {task.completed_at && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Completed: {new Date(task.completed_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
