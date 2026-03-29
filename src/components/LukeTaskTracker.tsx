import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, User } from 'lucide-react';

interface LukeTask {
  id: string;
  title: string;
  status: 'todo' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  notes?: string;
}

const LUKE_TASKS: LukeTask[] = [
  { id: '1', title: 'Film training videos for chatters', status: 'todo', priority: 'high', notes: 'Content filming checklist ready — ask Mark for the list' },
  { id: '2', title: 'Call with Mateo + Elle — mass message strategy', status: 'todo', priority: 'high', dueDate: '2026-03-30', notes: 'Both confirmed available. Topics: mass msg ideas, content planning, who creates weekly schedule' },
  { id: '3', title: 'Quality checks — review Zar\'s screenshots', status: 'todo', priority: 'high', notes: '4 sets today: Jane/Danny, KC/Zizu, Marc/Florian, Jem/Manny' },
  { id: '4', title: 'Reset Mac Mini admin password', status: 'todo', priority: 'medium', notes: 'Recovery Mode → resetpassword. Enables AnyDesk + Discord screen share. 5 min job.' },
  { id: '5', title: 'Approve mass message schedule for the week', status: 'todo', priority: 'medium', notes: 'Posted in #mass-message-schedule. Ashley, Willow, Izzie. Mon-Sun.' },
  { id: '6', title: 'Decide on content per model per week', status: 'todo', priority: 'high', notes: 'How much content needed? Content filming checklist has suggestions: ~20-25 pieces per model per week' },
  { id: '7', title: 'Book Airbnb for content shoots', status: 'todo', priority: 'high', notes: 'Nothing booked for next week. Elle chasing Ashley. Need dates ASAP.' },
  { id: '8', title: 'Review Chatting Playbook on dashboard', status: 'todo', priority: 'medium', notes: 'Live at /chatting-playbook — 6 sections, 30+ techniques. Review and add your own insights.' },
  { id: '9', title: 'Give Mark better client profile facts', status: 'todo', priority: 'low', notes: 'Dashboard client profiles need richer info from you.' },
  { id: '10', title: 'Derek decision — hands off or re-engage?', status: 'todo', priority: 'medium', notes: 'Chatters currently hands-off Derek per your order. Need final call.' },
];

const PRIORITY_COLORS = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function LukeTaskTracker() {
  const [tasks, setTasks] = useState<LukeTask[]>(LUKE_TASKS);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
    ));
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Luke's Tasks
          <Badge variant="outline" className="text-xs">{todoTasks.length} remaining</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[350px] overflow-y-auto">
          {todoTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${PRIORITY_COLORS[task.priority]}`}
              onClick={() => toggleTask(task.id)}
            >
              <Circle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{task.title}</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">{task.priority}</Badge>
                </div>
                {task.notes && <p className="text-xs text-muted-foreground mt-0.5">{task.notes}</p>}
                {task.dueDate && <p className="text-[10px] text-muted-foreground mt-0.5">Due: {task.dueDate}</p>}
              </div>
            </div>
          ))}
          {doneTasks.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground font-medium mt-3 mb-1">Completed</div>
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-2 rounded-lg border border-green-500/20 bg-green-500/5 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleTask(task.id)}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm line-through opacity-60">{task.title}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
