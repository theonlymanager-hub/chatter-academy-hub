import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Pencil, Check, X, Camera, Video, Lock, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// --- Types ---

interface CompletedEntry {
  timestamp: string; // ISO string
}

interface RecurringItem {
  target: number;
  completed: CompletedEntry[];
}

interface OneOffTask {
  id: string;
  description: string;
  due_date: string; // ISO date or empty
  done: boolean;
  done_at?: string; // ISO string
}

interface PipelineData {
  recurring: {
    photo_sets: RecurringItem;
    short_videos: RecurringItem;
    ppv_pieces: RecurringItem;
    script_packages: RecurringItem;
    ai_lifestyle: RecurringItem;
    ai_scenario: RecurringItem;
  };
  one_off_tasks: OneOffTask[];
  week_start: string; // ISO date (Monday)
  drive_link?: string; // Admin-editable Google Drive link
  guidelines_link?: string; // Admin-editable guidelines link
  updated_at?: string; // Last updated timestamp
}

type RecurringKey = keyof PipelineData['recurring'];

// --- Helpers ---

const RECURRING_META: Record<RecurringKey, { label: string; description: string; example: string; icon: React.ReactNode }> = {
  photo_sets: { 
    label: 'Photo Sets', 
    description: 'Outfits, bedroom, lifestyle', 
    example: '10 different outfits — bedroom, lifestyle, lingerie. Min 5 photos per set.',
    icon: <Camera className="h-5 w-5" /> 
  },
  short_videos: { 
    label: 'Short Video Clips', 
    description: '30-60 sec for feed, mix of explicitness', 
    example: '30-60 sec clips. Mix of SFW (teasers) and explicit. Vertical format.',
    icon: <Video className="h-5 w-5" /> 
  },
  ppv_pieces: { 
    label: 'PPV Content Pieces', 
    description: 'Lockable content to sell', 
    example: 'Exclusive content for paid messages. Solo, toys, scenarios.',
    icon: <Lock className="h-5 w-5" /> 
  },
  script_packages: { 
    label: 'Script Packages', 
    description: 'Full scenario shoots', 
    example: 'Full scenario shoots from the scenario board. Follow the script exactly.',
    icon: <FileText className="h-5 w-5" /> 
  },
  ai_lifestyle: { 
    label: 'AI Lifestyle Posts', 
    description: 'AI images for feed — carousels, out and about, daily life', 
    example: 'AI-generated lifestyle images for feed posts.',
    icon: <Camera className="h-5 w-5" /> 
  },
  ai_scenario: { 
    label: 'AI Scenario Content', 
    description: 'AI images to support script scenarios — setup shots', 
    example: 'AI images supporting script scenarios.',
    icon: <FileText className="h-5 w-5" /> 
  },
};

const RECURRING_KEYS: RecurringKey[] = ['photo_sets', 'short_videos', 'ppv_pieces', 'script_packages'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setHours(0, 0, 0, 0);
  date.setDate(diff);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatWeekLabel(mondayStr: string): string {
  const mon = new Date(mondayStr + 'T00:00:00');
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${mon.toLocaleDateString('en-GB', opts)} — ${sun.toLocaleDateString('en-GB', opts)}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function defaultData(weekStart: string): PipelineData {
  return {
    recurring: {
      photo_sets: { target: 10, completed: [] },
      short_videos: { target: 3, completed: [] },
      ppv_pieces: { target: 5, completed: [] },
      script_packages: { target: 2, completed: [] },
      ai_lifestyle: { target: 5, completed: [] },
      ai_scenario: { target: 3, completed: [] },
    },
    one_off_tasks: [],
    week_start: weekStart,
    drive_link: 'https://drive.google.com/drive/folders/PLACEHOLDER',
    guidelines_link: 'https://example.com/guidelines',
  };
}

function storageKey(model: string): string {
  return `content_pipeline_${model.toLowerCase()}`;
}

// Load from Supabase or localStorage
async function loadData(model: string): Promise<PipelineData> {
  const currentMonday = formatDate(getMonday(new Date()));
  
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('client_checklist')
      .select('*')
      .eq('model_name', model)
      .eq('week_start', currentMonday)
      .single();

    if (!error && data) {
      return {
        ...data.data,
        week_start: currentMonday,
        updated_at: data.updated_at,
      } as PipelineData;
    }
  } catch (e) {
    console.warn('Supabase load failed, using localStorage:', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(storageKey(model));
    if (raw) {
      const parsed: PipelineData = JSON.parse(raw);
      // Auto-reset if new week
      if (parsed.week_start !== currentMonday) {
        const reset = defaultData(currentMonday);
        // Keep targets and links from old data
        for (const key of RECURRING_KEYS) {
          if (parsed.recurring[key]?.target) {
            reset.recurring[key].target = parsed.recurring[key].target;
          }
        }
        if (parsed.drive_link) reset.drive_link = parsed.drive_link;
        if (parsed.guidelines_link) reset.guidelines_link = parsed.guidelines_link;
        // Keep incomplete one-off tasks
        reset.one_off_tasks = parsed.one_off_tasks.filter(t => !t.done);
        return reset;
      }
      return parsed;
    }
  } catch {}
  
  return defaultData(currentMonday);
}

// Save to both Supabase and localStorage
async function saveData(model: string, data: PipelineData) {
  // Save to localStorage as fallback
  localStorage.setItem(storageKey(model), JSON.stringify(data));

  try {
    // Save to Supabase
    await supabase
      .from('client_checklist')
      .upsert({
        model_name: model,
        week_start: data.week_start,
        data: data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'model_name,week_start'
      });
  } catch (e) {
    console.warn('Supabase save failed, localStorage only:', e);
  }
}

// --- Component ---

const ClientChecklist: React.FC = () => {
  const [searchParams] = useSearchParams();
  const modelName = searchParams.get('model') || '';

  let isAdmin = false;
  try {
    const auth = useAuth();
    isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'supervisor';
  } catch {
    // No auth required for viewing
    isAdmin = false;
  }

  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTargets, setEditingTargets] = useState(false);
  const [editingLinks, setEditingLinks] = useState(false);
  const [tempTargets, setTempTargets] = useState<Record<RecurringKey, number>>({
    photo_sets: 10, short_videos: 3, ppv_pieces: 5, script_packages: 2,
    ai_lifestyle: 5, ai_scenario: 3,
  });
  const [tempDriveLink, setTempDriveLink] = useState('');
  const [tempGuidelinesLink, setTempGuidelinesLink] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (modelName) {
      loadData(modelName).then(loaded => {
        setData(loaded);
        setLoading(false);
      });
    }
  }, [modelName]);

  // Persist on change
  useEffect(() => {
    if (data && modelName) {
      saveData(modelName, data);
    }
  }, [data, modelName]);

  const updateData = useCallback((updater: (prev: PipelineData) => PipelineData) => {
    setData(prev => prev ? updater(prev) : null);
  }, []);

  // --- Recurring handlers ---

  const toggleRecurring = (key: RecurringKey) => {
    updateData(prev => {
      const item = prev.recurring[key];
      if (item.completed.length < item.target) {
        return {
          ...prev,
          recurring: {
            ...prev.recurring,
            [key]: { ...item, completed: [...item.completed, { timestamp: new Date().toISOString() }] },
          },
        };
      }
      return prev;
    });
  };

  const removeLastRecurring = (key: RecurringKey) => {
    updateData(prev => {
      const item = prev.recurring[key];
      if (item.completed.length > 0) {
        return {
          ...prev,
          recurring: {
            ...prev.recurring,
            [key]: { ...item, completed: item.completed.slice(0, -1) },
          },
        };
      }
      return prev;
    });
  };

  const startEditTargets = () => {
    if (!data) return;
    const t: Record<string, number> = {};
    for (const key of RECURRING_KEYS) t[key] = data.recurring[key].target;
    setTempTargets(t as Record<RecurringKey, number>);
    setEditingTargets(true);
  };

  const saveTargets = () => {
    updateData(prev => {
      const newRecurring = { ...prev.recurring };
      for (const key of RECURRING_KEYS) {
        newRecurring[key] = { ...newRecurring[key], target: Math.max(1, tempTargets[key] || 1) };
      }
      return { ...prev, recurring: newRecurring };
    });
    setEditingTargets(false);
  };

  const startEditLinks = () => {
    if (!data) return;
    setTempDriveLink(data.drive_link || '');
    setTempGuidelinesLink(data.guidelines_link || '');
    setEditingLinks(true);
  };

  const saveLinks = () => {
    updateData(prev => ({
      ...prev,
      drive_link: tempDriveLink,
      guidelines_link: tempGuidelinesLink,
    }));
    setEditingLinks(false);
  };

  // --- One-off handlers ---

  const addOneOffTask = () => {
    if (!newTaskDesc.trim()) return;
    updateData(prev => ({
      ...prev,
      one_off_tasks: [
        ...prev.one_off_tasks,
        { id: generateId(), description: newTaskDesc.trim(), due_date: newTaskDue, done: false },
      ],
    }));
    setNewTaskDesc('');
    setNewTaskDue('');
    setShowAddTask(false);
  };

  const toggleOneOff = (id: string) => {
    updateData(prev => ({
      ...prev,
      one_off_tasks: prev.one_off_tasks.map(t =>
        t.id === id ? { ...t, done: !t.done, done_at: !t.done ? new Date().toISOString() : undefined } : t
      ),
    }));
  };

  const removeOneOff = (id: string) => {
    updateData(prev => ({
      ...prev,
      one_off_tasks: prev.one_off_tasks.filter(t => t.id !== id),
    }));
  };

  // --- Render ---

  if (!modelName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground text-lg">No model specified.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs">?model=Name</code> in the URL.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{modelName}'s Content Checklist</h1>
          <p className="text-sm text-muted-foreground">
            Week of {formatWeekLabel(data.week_start)}
          </p>
          {data.updated_at && (
            <p className="text-xs text-muted-foreground/60">
              Last updated: {new Date(data.updated_at).toLocaleString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
          {isAdmin && (
            <Badge variant="outline" className="text-xs">Admin View</Badge>
          )}
        </div>

        {/* Resources & Upload Links */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resources & Upload Links</CardTitle>
              {isAdmin && !editingLinks && (
                <Button variant="ghost" size="sm" onClick={startEditLinks}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
              {isAdmin && editingLinks && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={saveLinks}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLinks(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingLinks ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Google Drive Folder</label>
                  <Input
                    value={tempDriveLink}
                    onChange={e => setTempDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Content Guidelines</label>
                  <Input
                    value={tempGuidelinesLink}
                    onChange={e => setTempGuidelinesLink(e.target.value)}
                    placeholder="https://..."
                    className="text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <a
                    href={data.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Google Drive Upload Folder
                  </a>
                  <a
                    href={data.guidelines_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Content Guidelines & Examples
                  </a>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium">Quick Instructions:</p>
                  <p className="mt-1">Upload content to the drive folder, then tick items off below.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recurring Weekly Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Weekly Content</CardTitle>
              {isAdmin && !editingTargets && (
                <Button variant="ghost" size="sm" onClick={startEditTargets}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit Targets
                </Button>
              )}
              {isAdmin && editingTargets && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={saveTargets}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTargets(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {RECURRING_KEYS.map(key => {
              const item = data.recurring[key];
              const meta = RECURRING_META[key];
              const done = item.completed.length;
              const target = item.target;
              const pct = target > 0 ? Math.round((done / target) * 100) : 0;
              const allDone = done >= target;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => allDone ? removeLastRecurring(key) : toggleRecurring(key)}
                      className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all
                        ${allDone
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-muted-foreground/30 hover:border-primary/50 text-muted-foreground'
                        }`}
                    >
                      {meta.icon}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{meta.label}</span>
                        {editingTargets ? (
                          <Input
                            type="number"
                            min={1}
                            value={tempTargets[key]}
                            onChange={e => setTempTargets(prev => ({ ...prev, [key]: parseInt(e.target.value) || 1 }))}
                            className="w-16 h-7 text-xs text-center"
                          />
                        ) : (
                          <span className={`text-sm font-mono ${allDone ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {done}/{target}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                      <p className="text-[11px] text-muted-foreground/70 italic mt-0.5">{meta.example}</p>
                      <Progress value={pct} className="h-1.5 mt-1.5" />
                      {isAdmin && item.completed.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          Last: {new Date(item.completed[item.completed.length - 1].timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Tap buttons for adding/removing */}
                  <div className="flex gap-2 pl-13 ml-[52px]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex-1"
                      disabled={allDone}
                      onClick={() => toggleRecurring(key)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Done One
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={done === 0}
                      onClick={() => removeLastRecurring(key)}
                    >
                      Undo
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* One-off Tasks Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Specific Tasks</CardTitle>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => setShowAddTask(!showAddTask)}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add task form */}
            {isAdmin && showAddTask && (
              <div className="space-y-2 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <Input
                  placeholder="Task description..."
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOneOffTask()}
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newTaskDue}
                    onChange={e => setNewTaskDue(e.target.value)}
                    className="flex-1"
                    placeholder="Due date (optional)"
                  />
                  <Button size="sm" onClick={addOneOffTask} disabled={!newTaskDesc.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Task list */}
            {data.one_off_tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No specific tasks this week
              </p>
            ) : (
              data.one_off_tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all
                    ${task.done ? 'border-green-600/30 bg-green-600/5' : 'border-muted-foreground/20'}`}
                >
                  <Checkbox
                    checked={task.done}
                    onCheckedChange={() => toggleOneOff(task.id)}
                    className="mt-0.5 h-6 w-6"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.due_date && (
                        <span className="text-[11px] text-muted-foreground">
                          Due: {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {isAdmin && task.done && task.done_at && (
                        <span className="text-[10px] text-muted-foreground/60">
                          Done: {new Date(task.done_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOneOff(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/40 pb-4">
          Tap items to mark as done · Resets every Monday
        </p>
      </div>
    </div>
  );
};

export default ClientChecklist;
