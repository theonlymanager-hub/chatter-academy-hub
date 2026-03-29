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
  // ACTIVE
  { id: '1', title: 'OF API integration — revenue + LTV automation', status: 'active', category: 'Dashboard', created_at: '2026-03-29T12:00:00Z', completed_at: null, notes: 'API wrapper built, RevenueLTV component coded, pushed to GitHub' },
  { id: '2', title: 'Chatting Playbook — upsell techniques, whale handling, VIP packages', status: 'active', category: 'Knowledge Base', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: 'Researching top agency techniques' },
  { id: '3', title: 'Content filming checklist for Luke', status: 'active', category: 'Content', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: 'Categories and scenarios per model' },

  // QUEUED
  { id: '4', title: 'Dashboard — strikes system', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '5', title: 'Dashboard — shift calendar cleanup', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '6', title: 'Dashboard — chatter task repetition system (10-15x)', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '7', title: 'Client-facing checklist page (no agency branding)', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '8', title: 'Dashboard — training results visibility fix', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '9', title: 'Dashboard — team activity feed fix', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '10', title: 'Expired fan re-engagement mass messages', status: 'queued', category: 'API', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: null },
  { id: '11', title: 'Smart PPV timing system', status: 'queued', category: 'API', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: null },
  { id: '12', title: 'Whale detection auto-alerts', status: 'queued', category: 'API', created_at: '2026-03-29T14:00:00Z', completed_at: null, notes: null },
  { id: '13', title: 'Airbnb schedule on dashboard + content checklists', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '14', title: 'Fan profiles cleanup', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T13:45:00Z', completed_at: null, notes: null },
  { id: '15', title: 'Time-off request sync fix (Zar\'s bug)', status: 'queued', category: 'Dashboard', created_at: '2026-03-29T07:30:00Z', completed_at: null, notes: null },
  { id: '16', title: 'Mark task tracker on dashboard (this!)', status: 'active', category: 'Dashboard', created_at: '2026-03-29T14:45:00Z', completed_at: null, notes: null },

  // DONE TODAY
  { id: '100', title: 'Mass message schedule — week of 30 Mar to 5 Apr', status: 'done', category: 'Operations', created_at: '2026-03-29T11:00:00Z', completed_at: '2026-03-29T12:27:00Z', notes: 'Posted to #mass-message-schedule: Ashley, Willow, Izzie. 7 days each.' },
  { id: '101', title: 'Morning briefing sent to Luke', status: 'done', category: 'Operations', created_at: '2026-03-29T08:50:00Z', completed_at: '2026-03-29T08:51:00Z', notes: 'Covered overnight recap, to-do, weekly numbers' },
  { id: '102', title: 'Whale James birthday message — posted to CHAT TEAM', status: 'done', category: 'Operations', created_at: '2026-03-29T04:20:00Z', completed_at: '2026-03-29T04:23:00Z', notes: 'Jane confirmed. Custom void (deleted tipping account).' },
  { id: '103', title: 'Sunday push message to chatters', status: 'done', category: 'Operations', created_at: '2026-03-29T13:00:00Z', completed_at: '2026-03-29T13:01:00Z', notes: 'Focus on whale follow-ups, re-engage quiet fans' },
  { id: '104', title: 'OF API wrapper (ofapi.ts)', status: 'done', category: 'Dashboard', created_at: '2026-03-29T13:30:00Z', completed_at: '2026-03-29T14:30:00Z', notes: 'Full wrapper: earnings, fans, transactions, chats, mass messaging, vault. Pushed to GitHub.' },
  { id: '105', title: 'RevenueLTV dashboard component', status: 'done', category: 'Dashboard', created_at: '2026-03-29T14:00:00Z', completed_at: '2026-03-29T14:30:00Z', notes: 'Weekly revenue target bar, per-model LTV cards, PPV rate. Pushed to GitHub.' },
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
