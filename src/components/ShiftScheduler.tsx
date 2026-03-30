import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Users, Loader2, Sun, Sunset, Moon, AlertCircle } from 'lucide-react';
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

type ShiftType = 'morning' | 'afternoon' | 'night';

const SHIFT_META: Record<ShiftType, { label: string; time: string; icon: typeof Sun; accent: string; activeBorder: string }> = {
  morning: {
    label: 'Morning Shift',
    time: '6:00 AM – 2:00 PM',
    icon: Sun,
    accent: 'text-amber-400',
    activeBorder: 'border-amber-500/60 bg-amber-500/5',
  },
  afternoon: {
    label: 'Afternoon Shift',
    time: '2:00 PM – 10:00 PM',
    icon: Sunset,
    accent: 'text-orange-400',
    activeBorder: 'border-orange-500/60 bg-orange-500/5',
  },
  night: {
    label: 'Night Shift',
    time: '10:00 PM – 6:00 AM',
    icon: Moon,
    accent: 'text-blue-400',
    activeBorder: 'border-blue-500/60 bg-blue-500/5',
  },
};

const SHIFT_ORDER: ShiftType[] = ['morning', 'afternoon', 'night'];

function getCurrentShift(): ShiftType {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'afternoon';
  return 'night';
}

function getShiftStatus(shiftType: ShiftType, selectedDate: string): 'on-duty' | 'upcoming' | 'completed' {
  const today = new Date().toISOString().split('T')[0];
  if (selectedDate < today) return 'completed';
  if (selectedDate > today) return 'upcoming';

  const current = getCurrentShift();
  const currentIndex = SHIFT_ORDER.indexOf(current);
  const shiftIndex = SHIFT_ORDER.indexOf(shiftType);

  if (shiftType === current) return 'on-duty';
  if (shiftIndex > currentIndex) return 'upcoming';
  return 'completed';
}

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; className: string }> = {
  'on-duty': { label: '● On Duty', variant: 'default', className: 'bg-green-600/90 text-white border-green-500' },
  upcoming: { label: 'Upcoming', variant: 'outline', className: 'border-muted-foreground/30 text-muted-foreground' },
  completed: { label: 'Completed', variant: 'secondary', className: 'bg-muted text-muted-foreground' },
};

export default function ShiftScheduler() {
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [editingShift, setEditingShift] = useState<string | null>(null);

  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('date', selectedDate)
      .eq('is_active', true);
    if (error) {
      console.error('Error fetching shifts:', error);
    } else {
      setShifts((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchShifts();
  }, [selectedDate]);

  // Group shifts by shift type → array of { chatterName, models[] }
  const groupedShifts = useMemo(() => {
    const grouped: Record<ShiftType, { chatterName: string; models: string[] }[]> = {
      morning: [],
      afternoon: [],
      night: [],
    };

    for (const shift of shifts) {
      const st = shift.shift_type as ShiftType;
      if (!grouped[st]) continue;
      grouped[st].push({
        chatterName: shift.chatter_name,
        models: shift.models || [],
      });
    }

    return grouped;
  }, [shifts]);

  // Get chatter assigned to a model for a shift type
  const getAssignment = (shiftType: string, modelId: string): string => {
    const shift = shifts.find((s) => s.shift_type === shiftType && s.models?.includes(modelId));
    return shift ? shift.chatter_name : '';
  };

  const chatterNameToId = (name: string) => {
    const chatter = config.chatters.find((c) => c.name.toLowerCase() === name.toLowerCase());
    return chatter?.id || '';
  };

  const handleAssign = async (shiftType: string, modelId: string, chatterId: string) => {
    const chatter = config.chatters.find((c) => c.id === chatterId);
    if (!chatter) return;

    for (const shift of shifts) {
      if (shift.shift_type === shiftType && shift.models?.includes(modelId)) {
        const newModels = shift.models.filter((m) => m !== modelId);
        if (newModels.length === 0) {
          await supabase.from('shifts').delete().eq('id', shift.id);
        } else {
          await supabase
            .from('shifts')
            .update({ models: newModels } as any)
            .eq('id', shift.id);
        }
      }
    }

    const existingShift = shifts.find((s) => s.shift_type === shiftType && s.chatter_name === chatter.name);
    if (existingShift) {
      const newModels = [...new Set([...(existingShift.models || []), modelId])];
      await supabase
        .from('shifts')
        .update({ models: newModels } as any)
        .eq('id', existingShift.id);
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

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shift Calendar</h2>
          <p className="text-muted-foreground text-sm">Who's on which accounts, per shift</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            🇬🇧 UK Time
          </Badge>
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-0 bg-transparent text-sm font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {SHIFT_ORDER.map((shiftType) => {
            const meta = SHIFT_META[shiftType];
            const status = getShiftStatus(shiftType, selectedDate);
            const isActive = status === 'on-duty';
            const chatters = groupedShifts[shiftType];
            const statusStyle = STATUS_BADGE[status];
            const Icon = meta.icon;

            return (
              <Card
                key={shiftType}
                className={`transition-all duration-200 ${
                  isActive ? `border-2 ${meta.activeBorder} shadow-lg` : 'border border-border/50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted/60 ${meta.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{meta.label}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          {meta.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusStyle.className}>{statusStyle.label}</Badge>
                      <button
                        onClick={() => setEditingShift(editingShift === shiftType ? null : shiftType)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                      >
                        {editingShift === shiftType ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {chatters.length === 0 && editingShift !== shiftType ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-3 px-4 rounded-lg bg-muted/30">
                      <AlertCircle className="h-4 w-4" />
                      No chatters assigned for this shift
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Chatter rows */}
                      {chatters.map((chatter, idx) => {
                        const modelNames = chatter.models
                          .map((mId) => config.models.find((m) => m.id === mId)?.name || mId)
                          .sort();

                        return (
                          <div
                            key={`${chatter.chatterName}-${idx}`}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                              isActive ? 'bg-muted/40' : 'bg-muted/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {chatter.chatterName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{chatter.chatterName}</p>
                                <p className="text-xs text-muted-foreground">Chatter</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {modelNames.map((name) => (
                                <Badge key={name} variant="secondary" className="text-xs font-normal">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Edit mode: assignment dropdowns */}
                      {editingShift === shiftType && (
                        <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Assign Chatters to Accounts
                          </p>
                          {config.models.map((model) => {
                            const assignedChatterName = getAssignment(shiftType, model.id);
                            const assignedChatterId = chatterNameToId(assignedChatterName);

                            return (
                              <div
                                key={model.id}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/20"
                              >
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{model.name}</span>
                                </div>
                                <Select
                                  value={assignedChatterId}
                                  onValueChange={(value) => handleAssign(shiftType, model.id, value)}
                                >
                                  <SelectTrigger className="flex-1 h-9">
                                    <SelectValue placeholder="Assign chatter…" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {config.chatters.map((chatter) => (
                                      <SelectItem key={chatter.id} value={chatter.id}>
                                        <div className="flex items-center gap-2">
                                          <Users className="h-3.5 w-3.5" />
                                          {chatter.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
