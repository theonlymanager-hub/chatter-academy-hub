import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Pencil, Check, X, Camera, Video, Lock, FileText, ExternalLink, Copy, ClipboardCheck, MapPin, CalendarDays } from 'lucide-react';
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

interface CustomTask {
  id: string;
  fan_name: string;
  description: string;
  amount: string;
  due_date: string;
  done: boolean;
  done_at?: string;
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
  customs: CustomTask[];
  week_start: string;
  drive_link?: string;
  guidelines_link?: string;
  updated_at?: string;
}

type RecurringKey = keyof PipelineData['recurring'];

// --- Helpers ---

// Weekly content categories — matches Luke's Notion plan
const RECURRING_META: Record<RecurringKey, { label: string; labelEs: string; description: string; descEs: string; example: string; exampleEs: string; icon: React.ReactNode }> = {
  photo_sets: { 
    label: 'PPV Content', labelEs: 'Contenido PPV',
    description: '2 per week — ideas refreshed weekly on the ideas board', descEs: '2 por semana — ideas actualizadas semanalmente',
    example: 'Exclusive lockable content. New PPV ideas each week from the content board.', exampleEs: 'Contenido exclusivo con candado. Ideas nuevas cada semana.',
    icon: <Lock className="h-5 w-5" /> 
  },
  short_videos: { 
    label: 'Script Packages', labelEs: 'Paquetes de Guión',
    description: '1-2 per week — for older subs who\'ve seen current scripts', descEs: '1-2 por semana — para suscriptores antiguos',
    example: 'Full scenario shoots. At least 1-2 fresh scripts per week so returning fans have new content.', exampleEs: 'Sesiones completas de escenarios. Mínimo 1-2 guiones frescos por semana.',
    icon: <FileText className="h-5 w-5" /> 
  },
  ppv_pieces: { 
    label: 'Main Feed Posts', labelEs: 'Publicaciones del Feed',
    description: '7-10 per week — post 1-2x daily to keep fans engaged', descEs: '7-10 por semana — publicar 1-2x al día',
    example: 'Post on main feed at least once or twice a day. Mix of photos and short clips. Keeps fans engaged and active.', exampleEs: 'Publicar en el feed principal 1-2 veces al día. Mezcla de fotos y clips.',
    icon: <Camera className="h-5 w-5" /> 
  },
  script_packages: { 
    label: 'Mass Message Images', labelEs: 'Imágenes para Mensajes Masivos',
    description: '7 per week — 1 free SFW image per day to fans', descEs: '7 por semana — 1 imagen SFW gratis al día',
    example: 'SFW teasers only: bed selfie, bar pic, mirror selfie, shower pic (misty, cleavage). NOT explicit.', exampleEs: 'Solo SFW: selfie en cama, espejo, ducha (con vapor, escote). NO explícito.',
    icon: <Camera className="h-5 w-5" /> 
  },
  ai_lifestyle: { 
    label: 'Random Clips', labelEs: 'Clips Aleatorios',
    description: '3-5 per week — extra sellable content', descEs: '3-5 por semana — contenido extra para vender',
    example: 'Similar to PPV style but sold individually. Extra content to keep the vault stocked.', exampleEs: 'Similar a PPV pero vendido individualmente. Contenido extra.',
    icon: <Video className="h-5 w-5" /> 
  },
  ai_scenario: { 
    label: 'Random Photos', labelEs: 'Fotos Aleatorias',
    description: '3-5 per week — selfies, verification, casual', descEs: '3-5 por semana — selfies, verificación, casual',
    example: 'Selfies, boob pics, thumbs up, verification poses. Quick casual content.', exampleEs: 'Selfies, fotos casuales, poses de verificación. Contenido rápido.',
    icon: <Camera className="h-5 w-5" /> 
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
      photo_sets: { target: 2, completed: [] },
      short_videos: { target: 2, completed: [] },
      ppv_pieces: { target: 10, completed: [] },
      script_packages: { target: 7, completed: [] },
      ai_lifestyle: { target: 5, completed: [] },
      ai_scenario: { target: 5, completed: [] },
    },
    one_off_tasks: [],
    customs: [],
    week_start: weekStart,
    drive_link: 'https://drive.google.com/drive/folders/PLACEHOLDER',
    guidelines_link: 'https://example.com/guidelines',
  };
}

// --- Airbnb Booking Helpers ---

interface AirbnbBooking {
  id: string;
  model: string;
  location: string;
  check_in: string;
  check_out: string;
  cost: number;
  status: string;
  notes: string;
}

function loadAirbnbBookings(model: string, weekStart: string): AirbnbBooking[] {
  try {
    const raw = localStorage.getItem('airbnb_bookings');
    if (!raw) return [];
    const all: AirbnbBooking[] = JSON.parse(raw);
    const monday = new Date(weekStart + 'T00:00:00');
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    return all.filter(b => {
      if (b.model?.toLowerCase() !== model.toLowerCase()) return false;
      if (b.status === 'cancelled') return false;
      const checkIn = new Date(b.check_in + 'T00:00:00');
      const checkOut = new Date(b.check_out + 'T00:00:00');
      // Booking overlaps with this week
      return checkIn <= sunday && checkOut >= monday;
    });
  } catch {
    return [];
  }
}

function formatBookingDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
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
      // No auto-reset — weekly content is cumulative, not weekly
      // Just update the week_start for display
      if (parsed.week_start !== currentMonday) {
        parsed.week_start = currentMonday;
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

const MODEL_OPTIONS = ['Ashley', 'Willow', 'Izzie'];

const ClientChecklist: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelName = searchParams.get('model') || '';

  let isAdmin = false;
  let isDataEntry = false;
  let isLoggedIn = false;
  try {
    const auth = useAuth();
    isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'supervisor';
    isDataEntry = auth.user?.role === 'data_entry';
    isLoggedIn = !!auth.user;
  } catch {
    isAdmin = false;
  }

  const canEdit = isAdmin || isDataEntry;
  const isDashboard = window.location.pathname.startsWith('/content-checklist');

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
  const [newTaskAmount, setNewTaskAmount] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomFan, setNewCustomFan] = useState('');
  const [newCustomDesc, setNewCustomDesc] = useState('');
  const [newCustomAmount, setNewCustomAmount] = useState('');
  const [newCustomDue, setNewCustomDue] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [airbnbBookings, setAirbnbBookings] = useState<AirbnbBooking[]>([]);

  // Load data on mount
  useEffect(() => {
    if (modelName) {
      loadData(modelName).then(loaded => {
        setData(loaded);
        setAirbnbBookings(loadAirbnbBookings(modelName, loaded.week_start));
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

  const copyClientLink = () => {
    // Always generate the PUBLIC client link, not the dashboard URL
    const url = `${window.location.origin}/client-checklist?model=${encodeURIComponent(modelName)}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const addOneOffTask = () => {
    if (!newTaskDesc.trim()) return;
    const desc = newTaskAmount 
      ? `${newTaskDesc.trim()} — $${newTaskAmount}` 
      : newTaskDesc.trim();
    updateData(prev => ({
      ...prev,
      one_off_tasks: [
        ...prev.one_off_tasks,
        { id: generateId(), description: desc, due_date: newTaskDue, done: false },
      ],
    }));
    setNewTaskDesc('');
    setNewTaskDue('');
    setNewTaskAmount('');
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

  const confirmAndRemoveOneOff = (id: string) => {
    updateData(prev => ({
      ...prev,
      one_off_tasks: prev.one_off_tasks.filter(t => t.id !== id),
    }));
  };

  const removeOneOff = (id: string) => {
    updateData(prev => ({
      ...prev,
      one_off_tasks: prev.one_off_tasks.filter(t => t.id !== id),
    }));
  };

  // --- Customs handlers ---

  const addCustom = () => {
    if (!newCustomDesc.trim()) return;
    updateData(prev => ({
      ...prev,
      customs: [
        ...(prev.customs || []),
        { id: generateId(), fan_name: newCustomFan.trim(), description: newCustomDesc.trim(), amount: newCustomAmount.trim(), due_date: newCustomDue, done: false },
      ],
    }));
    setNewCustomFan('');
    setNewCustomDesc('');
    setNewCustomAmount('');
    setNewCustomDue('');
    setShowAddCustom(false);
  };

  const toggleCustom = (id: string) => {
    updateData(prev => ({
      ...prev,
      customs: (prev.customs || []).map(c =>
        c.id === id ? { ...c, done: !c.done, done_at: !c.done ? new Date().toISOString() : undefined } : c
      ),
    }));
  };

  const confirmAndRemoveCustom = (id: string) => {
    updateData(prev => ({
      ...prev,
      customs: (prev.customs || []).filter(c => c.id !== id),
    }));
  };

  const removeCustom = (id: string) => {
    updateData(prev => ({
      ...prev,
      customs: (prev.customs || []).filter(c => c.id !== id),
    }));
  };

  // --- Render ---

  if (!modelName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Client Content Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Select a model:</p>
            {MODEL_OPTIONS.map(model => (
              <Button
                key={model}
                variant="outline"
                className="w-full h-12 text-lg"
                onClick={() => setSearchParams({ model })}
              >
                {model}
              </Button>
            ))}
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
        {/* Model Tabs — ONLY on dashboard, never on public client link */}
        {isDashboard && canEdit && (
          <div className="flex gap-2 justify-center">
            {MODEL_OPTIONS.map(model => (
              <Button
                key={model}
                variant={model === modelName ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchParams({ model })}
              >
                {model}
              </Button>
            ))}
          </div>
        )}

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
          {(canEdit) && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">Admin View</Badge>
              <Button variant="outline" size="sm" onClick={copyClientLink} className="text-xs h-7">
                {linkCopied ? <ClipboardCheck className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {linkCopied ? 'Copied!' : 'Copy Client Link'}
              </Button>
            </div>
          )}
        </div>

        {/* Resources & Upload Links */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resources & Upload Links</CardTitle>
              {(canEdit) && !editingLinks && (
                <Button variant="ghost" size="sm" onClick={startEditLinks}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
              {(canEdit) && editingLinks && (
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

        {/* Airbnb Shoot Schedule */}
        {airbnbBookings.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-amber-400" />
                Shoots This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {airbnbBookings.map(booking => (
                <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <MapPin className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-amber-200">{booking.location || 'Location TBC'}</p>
                    <p className="text-muted-foreground">
                      {formatBookingDate(booking.check_in)} → {formatBookingDate(booking.check_out)}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-muted-foreground/70">{booking.notes}</p>
                    )}
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-300">
                      {booking.status === 'confirmed' ? '✅ Confirmed' : booking.status === 'booked' ? '📋 Booked' : booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground/60">
                Content to film during this booking should be ticked off below ↓
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recurring Weekly Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Weekly Content</CardTitle>
              {(canEdit) && !editingTargets && (
                <Button variant="ghost" size="sm" onClick={startEditTargets}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit Targets
                </Button>
              )}
              {(canEdit) && editingTargets && (
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
                        <span className="font-medium text-sm">{isDashboard ? meta.label : `${meta.label} / ${meta.labelEs}`}</span>
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
                      <p className="text-xs text-muted-foreground">{isDashboard ? meta.description : `${meta.description} / ${meta.descEs}`}</p>
                      <p className="text-[11px] text-muted-foreground/70 italic mt-0.5">{isDashboard ? meta.example : `${meta.example} / ${meta.exampleEs}`}</p>
                      <Progress value={pct} className="h-1.5 mt-1.5" />
                      {(canEdit) && item.completed.length > 0 && (
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
              {(canEdit) && (
                <Button variant="ghost" size="sm" onClick={() => setShowAddTask(!showAddTask)}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add task form */}
            {(canEdit) && showAddTask && (
              <div className="space-y-2 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <Input
                  placeholder="Task description (e.g. Custom: close up pussy play, riding dildo...)"
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOneOffTask()}
                />
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newTaskAmount}
                    onChange={e => setNewTaskAmount(e.target.value)}
                    className="w-24"
                    placeholder="Amount $"
                  />
                  <Input
                    type="date"
                    value={newTaskDue}
                    onChange={e => setNewTaskDue(e.target.value)}
                    className="flex-1"
                    placeholder="Due date"
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
                      {(canEdit) && task.done && task.done_at && (
                        <span className="text-[10px] text-muted-foreground/60">
                          Done: {new Date(task.done_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {task.done && (canEdit) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] text-green-600 border-green-600/30 hover:bg-green-600/10"
                        onClick={() => confirmAndRemoveOneOff(task.id)}
                      >
                        <Check className="h-3 w-3 mr-1" /> Confirm & Remove
                      </Button>
                    )}
                    {(canEdit) && !task.done && (
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
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Customs Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Customs</CardTitle>
              {(canEdit) && (
                <Button variant="ghost" size="sm" onClick={() => setShowAddCustom(!showAddCustom)}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(canEdit) && showAddCustom && (
              <div className="space-y-2 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <Input
                  placeholder="Fan name / Nombre del fan"
                  value={newCustomFan}
                  onChange={e => setNewCustomFan(e.target.value)}
                />
                <Input
                  placeholder="Description (e.g. close up, riding dildo, dirty talk...)"
                  value={newCustomDesc}
                  onChange={e => setNewCustomDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newCustomAmount}
                    onChange={e => setNewCustomAmount(e.target.value)}
                    className="w-24"
                    placeholder="Amount $"
                  />
                  <Input
                    type="date"
                    value={newCustomDue}
                    onChange={e => setNewCustomDue(e.target.value)}
                    className="flex-1"
                    placeholder="Due date"
                  />
                  <Button size="sm" onClick={addCustom} disabled={!newCustomDesc.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            )}

            {(!data.customs || data.customs.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No customs pending
              </p>
            ) : (
              data.customs.map(custom => (
                <div
                  key={custom.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all
                    ${custom.done ? 'border-green-600/30 bg-green-600/5' : 'border-orange-500/30 bg-orange-500/5'}`}
                >
                  <Checkbox
                    checked={custom.done}
                    onCheckedChange={() => toggleCustom(custom.id)}
                    className="mt-0.5 h-6 w-6"
                  />
                  <div className="flex-1 min-w-0">
                    {custom.fan_name && (
                      <p className="text-xs font-medium text-orange-400 mb-0.5">
                        🧑 {custom.fan_name}
                      </p>
                    )}
                    <p className={`text-sm ${custom.done ? 'line-through text-muted-foreground' : ''}`}>
                      {custom.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {custom.amount && (
                        <Badge variant="outline" className="text-xs">
                          ${custom.amount}
                        </Badge>
                      )}
                      {custom.due_date && (
                        <span className="text-[11px] text-muted-foreground">
                          Due: {new Date(custom.due_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {(canEdit) && custom.done && custom.done_at && (
                        <span className="text-[10px] text-muted-foreground/60">
                          Done: {new Date(custom.done_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {custom.done && (canEdit) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] text-green-600 border-green-600/30 hover:bg-green-600/10"
                        onClick={() => confirmAndRemoveCustom(custom.id)}
                      >
                        <Check className="h-3 w-3 mr-1" /> Confirm & Remove
                      </Button>
                    )}
                    {(canEdit) && !custom.done && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeCustom(custom.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    )}
                  </div>
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
