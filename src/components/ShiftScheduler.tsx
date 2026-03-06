import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    { date: '2026-03-06', shiftType: 'morning', modelId: 'izzie', chatterId: 'jane' },
    { date: '2026-03-06', shiftType: 'morning', modelId: 'willow', chatterId: 'jaydee' },
    { date: '2026-03-06', shiftType: 'afternoon', modelId: 'lucinda', chatterId: 'kenneth' },
    { date: '2026-03-06', shiftType: 'afternoon', modelId: 'izzie', chatterId: 'jane' },
    { date: '2026-03-06', shiftType: 'night', modelId: 'izzie', chatterId: 'jemimah' },
    { date: '2026-03-06', shiftType: 'night', modelId: 'willow', chatterId: 'kenneth' },
  ]);

  const [selectedDate, setSelectedDate] = useState('2026-03-06');

  const getShiftLabel = (shiftType: string) => {
    const shift = config.shifts[shiftType as keyof typeof config.shifts];
    return `${shift.label} (${shift.start} - ${shift.end})`;
  };

  const getModelName = (modelId: string) => {
    return config.models.find(m => m.id === modelId)?.name || modelId;
  };

  const getChatterName = (chatterId: string) => {
    return config.chatters.find(c => c.id === chatterId)?.name || chatterId;
  };

  const assignmentsForDate = assignments.filter(a => a.date === selectedDate);

  const shiftTypes: Array<'morning' | 'afternoon' | 'night'> = ['morning', 'afternoon', 'night'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shift Scheduler</h2>
          <p className="text-muted-foreground">Assign 1 chatter per model per shift for clear revenue attribution</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2"
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
                      <Badge variant={model.type === 'AI' ? 'secondary' : 'default'}>
                        {model.type}
                      </Badge>
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

      <Card>
        <CardHeader>
          <CardTitle>Why 1 Chatter Per Model Per Shift?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">📊 Clear Attribution</h4>
              <p className="text-sm text-muted-foreground">
                Every message sent during a shift is attributed to exactly one chatter.
                No confusion about who generated which revenue.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">⭐ Accurate Quality Scores</h4>
              <p className="text-sm text-muted-foreground">
                Review individual chatter performance without overlap.
                Give targeted feedback based on their actual work.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">💰 Fair Bonuses</h4>
              <p className="text-sm text-muted-foreground">
                Reward top performers fairly. Track who actually generates revenue,
                not who happens to be online.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
