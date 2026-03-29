import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Crown } from 'lucide-react';

interface LukeTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  notes?: string;
}

const STATUS_ICONS = {
  'todo': <Circle className="h-4 w-4 text-muted-foreground" />,
  'in-progress': <Clock className="h-4 w-4 text-blue-500" />,
  'done': <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

const PRIORITY_COLORS = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const LUKE_TASKS: LukeTask[] = [
  { id: '1', title: 'Call with Mateo + Elle — mass message strategy & content planning', status: 'todo', priority: 'high', dueDate: 'Mon 30 Mar', notes: 'Both confirmed available. Set time in morning.' },
  { id: '2', title: 'Film training videos for chatters', status: 'todo', priority: 'high', notes: 'Content filming checklist ready — ask Mark for it' },
  { id: '3', title: 'Quality checks on today\'s chats', status: 'todo', priority: 'high', notes: 'Daily task. Zar sends screenshots, Luke reviews.' },
  { id: '4', title: 'Review mass message schedule for this week', status: 'todo', priority: 'high', notes: 'Posted in #mass-message-schedule. Ashley/Willow/Izzie Mon-Sun.' },
  { id: '5', title: 'Reset Mac Mini admin password (AnyDesk + screen share)', status: 'todo', priority: 'medium', notes: 'Recovery mode → resetpassword. 5 mins, no data loss.' },
  { id: '6', title: 'Book Airbnb for Ashley content shoot', status: 'todo', priority: 'high', notes: 'Elle chasing Ashley for a date. 6 customs pending.' },
  { id: '7', title: 'Derek decision — when to hand back to chatters', status: 'todo', priority: 'medium', notes: 'Luke handling Derek directly. Ashley video ready per Mateo.' },
  { id: '8', title: 'Review Chatting Playbook on dashboard', status: 'todo', priority: 'medium', notes: '/chatting-playbook — 6 sections, 30+ techniques' },
  { id: '9', title: 'Send voice note about mass message operation', status: 'todo', priority: 'high', notes: 'Mentioned Sunday night — detailed explanation for Mark' },
  { id: '10', title: 'Review content filming checklist', status: 'todo', priority: 'medium', notes: 'Per-model breakdown of what to film. ~60-75 pieces/week.' },
];

export default function LukeTaskTracker() {
  const todoTasks = LUKE_TASKS.filter(t => t.status === 'todo');
  const inProgressTasks = LUKE_TASKS.filter(t => t.status === 'in-progress');
  const doneTasks = LUKE_TASKS.filter(t => t.status === 'done');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            Luke's Tasks
          </CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {todoTasks.length} to do
            </Badge>
            {doneTasks.length > 0 && (
              <Badge variant="default" className="text-xs">
                {doneTasks.length} done
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {LUKE_TASKS.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-2 rounded-lg border ${
                task.status === 'done' 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : task.priority === 'high' 
                    ? 'bg-red-500/5 border-red-500/20' 
                    : 'bg-muted/30 border-border/20'
              }`}
            >
              <div className="mt-0.5">{STATUS_ICONS[task.status]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </span>
                  <Badge variant="outline" className={`text-[10px] px-1 py-0 shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </Badge>
                </div>
                {task.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5">{task.notes}</p>
                )}
                {task.dueDate && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">Due: {task.dueDate}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
