import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Target, Users, TrendingUp, Loader2, RefreshCw } from 'lucide-react';

interface ModelRevenue {
  today_gross: number;
  week_gross: number;
  total_subs: number;
  new_subs_week: number;
  ltv_week: number;
}

interface RevenueData {
  updated_at: string;
  date: string;
  week_start: string;
  models: Record<string, ModelRevenue>;
}

const MODELS = ['Ashley', 'Izzie', 'Willow'];
const WEEKLY_TARGET = 5000;

export default function RevenueLTV() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const resp = await fetch('/revenue-data.json?t=' + Date.now());
      if (resp.ok) {
        const d: RevenueData = await resp.json();
        setData(d);
        if (d.updated_at) {
          setLastUpdated(new Date(d.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.error('Error fetching revenue:', err);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!data) {
    return <Card><CardContent className="py-6 text-center text-muted-foreground text-sm">Revenue data not available. Updates every 3 hours.</CardContent></Card>;
  }

  const weekTotal = MODELS.reduce((s, n) => s + (data.models[n]?.week_gross || 0), 0);
  const weekTarget = WEEKLY_TARGET * MODELS.length;
  const progress = Math.min((weekTotal / weekTarget) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Weekly Total */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              This Week's Revenue
            </CardTitle>
            <button onClick={fetchData} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> {lastUpdated}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${weekTotal.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/ ${weekTarget.toLocaleString()} target</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Week of {data.week_start} — {progress.toFixed(0)}% of target</p>
        </CardContent>
      </Card>

      {/* Per-Model */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODELS.map((name) => {
          const m = data.models[name] || { today_gross: 0, week_gross: 0, total_subs: 0, new_subs_week: 0, ltv_week: 0 };
          const modelProgress = Math.min((m.week_gross / WEEKLY_TARGET) * 100, 100);
          return (
            <Card key={name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-xl font-bold text-green-400">${m.week_gross.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">this week</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${modelProgress >= 100 ? 'bg-green-500' : modelProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${modelProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">${m.week_gross.toLocaleString()} / $5K target</p>
                </div>
                <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
                  <span>Today: <span className="text-foreground font-medium">${m.today_gross.toLocaleString()}</span></span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">New subs:</span>
                    <span className="font-medium">{m.new_subs_week || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">LTV:</span>
                    <span className={`font-medium ${m.ltv_week >= 7 ? 'text-green-400' : m.ltv_week >= 4 ? 'text-yellow-400' : m.ltv_week > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {m.ltv_week > 0 ? `$${m.ltv_week}` : '—'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground">{m.total_subs.toLocaleString()} total subs</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
