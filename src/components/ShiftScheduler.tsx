import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Users, Loader2 } from 'lucide-react';
import config from '@/config/api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShiftRow {
  id: string;
  chatter_name: string;
  shift_type: string;
  models: string[];
  date: string;
  is_active: boolean;
}

export default function ShiftScheduler() {
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('date', selectedDate)
      .eq('is_active', true);
    if (error) {
      console.error('Error fetching shifts:', error);
    } else {
      setShifts(data as any[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchShifts();
  }, [selectedDate]);

  // Get chatter assigned to a model for a shift type
  const getAssignment = (shiftType: string, modelId: string): string => {
    const shift = shifts.find(s => s.shift_type === shiftType && s.models?.includes(modelId));
    return shift ? shift.chatter_name : '';
  };

  // Get the chatter ID from name
  const chatterNameToId = (name: string) => {
    const chatter = config.chatters.find(c => c.name.toLowerCase() === name.toLowerCase());
    return chatter?.id || '';
  };

  const handleAssign = async (shiftType: string, modelId: string, chatterId: string) => {
    const chatter = config.chatters.find(c => c.id === chatterId);
    if (!chatter) return;

    // Remove this model from any existing shift entry for this shift type and date
    for (const shift of shifts) {
      if (shift.shift_type === shiftType && shift.models?.includes(modelId)) {
        const newModels = shift.models.filter(m => m !== modelId);
        if (newModels.length === 0) {
          await supabase.from('shifts').delete().eq('id', shift.id);
        } else {
          await supabase.from('shifts').update({ models: newModels } as any).eq('id', shift.id);
        }
      }
    }

    // Add model to the chatter's shift entry, or create one
    const existingShift = shifts.find(s => s.shift_type === shiftType && s.chatter_name === chatter.name);
    if (existingShift) {
      const newModels = [...new Set([...(existingShift.models || []), modelId])];
      await supabase.from('shifts').update({ models: newModels } as any).eq('id', existingShift.id);
    } else {
      await supabase.from('shifts').insert({
        chatter_name: chatter.name,
        shift_type: shiftType,
        models: [modelId],
        date: selectedDate,
        is_active: true,
      } as any);
    }

    toast.success(`Assigned ${chatter.name} to ${modelId} (${shiftType})`);
    fetchShifts();
  };

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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
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
                  const assignedChatterName = getAssignment(shiftType, model.id);
                  const assignedChatterId = chatterNameToId(assignedChatterName);

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
                        value={assignedChatterId}
                        onValueChange={(value) => handleAssign(shiftType, model.id, value)}
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
      )}
    </div>
  );
}
