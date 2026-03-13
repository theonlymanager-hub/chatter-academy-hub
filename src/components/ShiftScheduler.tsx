import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Users } from 'lucide-react';
import config from '@/config/api';

interface ShiftAssignment {
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  modelId: string;
  chatterId: string;
}

export default function ShiftScheduler() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([
    // Today's default assignments
    { date: '2026-03-06', shiftType: 'morning', modelId: 'izzie', chatterId: 'marc' },
    { date: '2026-03-06', shiftType: 'morning', modelId: 'willow', chatterId: 'marc' },
    { date: '2026-03-06', shiftType: 'morning', modelId: 'lucinda', chatterId: 'marc' },
    { date: '2026-03-06', shiftType: 'morning', modelId: 'ashley', chatterId: 'marc' },
    { date: '2026-03-06', shiftType: 'afternoon', modelId: 'izzie', chatterId: 'jaydee' },
    { date: '2026-03-06', shiftType: 'afternoon', modelId: 'willow', chatterId: 'jaydee' },
    { date: '2026-03-06', shiftType: 'afternoon', modelId: 'lucinda', chatterId: 'jemimah' },
    { date: '2026-03-06', shiftType: 'afternoon', modelId: 'ashley', chatterId: 'jemimah' },
    { date: '2026-03-06', shiftType: 'night', modelId: 'izzie', chatterId: 'kc' },
    { date: '2026-03-06', shiftType: 'night', modelId: 'willow', chatterId: 'kc' },
    { date: '2026-03-06', shiftType: 'night', modelId: 'lucinda', chatterId: 'jane' },
    { date: '2026-03-06', shiftType: 'night', modelId: 'ashley', chatterId: 'jane' },
  ]);

  const [selectedDate, setSelectedDate] = useState('2026-03-06');

  const assignmentsForDate = assignments.filter(a => a.date === selectedDate);

  const shiftTypes: Array<'morning' | 'afternoon' | 'night'> = ['morning', 'afternoon', 'night'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shift Scheduler</h2>
          <p className="text-muted-foreground">Assign chatters to models per shift</p>
          <Badge variant="outline" className="mt-2 text-sm font-medium">
            🇬🇧 All times are UK time (GMT/BST)
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2 bg-background text-foreground"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {shiftTypes.map((shiftType) => (
          <Card key={shiftType}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {config.shifts[shiftType].label}
              </CardTitle>
              <CardDescription>
                {config.shifts[shiftType].start} - {config.shifts[shiftType].end}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.models.map((model) => {
                const assignment = assignmentsForDate.find(
                  a => a.shiftType === shiftType && a.modelId === model.id
                );
                
                return (
                  <div key={model.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{model.name}</span>
                      </div>
                      {model.type && (
                        <Badge variant={model.type === 'AI' ? 'secondary' : 'default'}>
                          {model.type}
                        </Badge>
                      )}
                    </div>
                    
                    <Select
                      value={assignment?.chatterId || ''}
                      onValueChange={(value) => {
                        if (assignment) {
                          setAssignments(prev => 
                            prev.map(a => 
                              a === assignment ? { ...a, chatterId: value } : a
                            )
                          );
                        } else {
                          setAssignments(prev => [...prev, {
                            date: selectedDate,
                            shiftType,
                            modelId: model.id,
                            chatterId: value,
                          }]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Assign chatter..." />
                      </SelectTrigger>
                      <SelectContent>
                        {config.chatters.map((chatter) => (
                          <SelectItem key={chatter.id} value={chatter.id}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {chatter.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
