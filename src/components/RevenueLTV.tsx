import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Target, Users, TrendingUp, Loader2, RefreshCw } from 'lucide-react';

interface ModelRevenue {
  today_gross: number;
  total_subs: number;
  new_subs_today: number;
  ltv_today: number;
}

interface RevenueData {
  updated_at: string;
  date: string;
  models: Record<string, ModelRevenue>;
}

const MODELS = ['Ashley', 'Izzie', 'Willow'];

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
          const t = new Date(d.updated_at);
          setLastUpdated(t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.error('Error fetching revenue:', err);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground text-sm">
          Revenue data not available yet. Cron updates every 3 hours.
        </CardContent>
      </Card>
    );
  }

  const totalToday = MODELS.reduce((s, n) => s + (data.models[n]?.today_gross || 0), 0);

  return (
    <div className="space-y-4">
      {/* Today's Total */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Today's Revenue (Gross)
            </CardTitle>
            <button onClick={fetchData} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Updated {lastUpdated}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">${totalToday.toLocaleString()}</span>
          <span className="text-muted-foreground text-sm ml-2">today across all models</span>
        </CardContent>
      </Card>

      {/* Per-Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODELS.map((name) => {
          const m = data.models[name] || { today_gross: 0, total_subs: 0, new_subs_today: 0, ltv_today: 0 };
          return (
            <Card key={name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xl font-bold text-green-400">${m.today_gross.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">today</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">New subs:</span>
                    <span className="font-medium">{m.new_subs_today || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">LTV:</span>
                    <span className={`font-medium ${m.ltv_today >= 7 ? 'text-green-400' : m.ltv_today >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {m.ltv_today > 0 ? `$${m.ltv_today}` : '—'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {m.total_subs.toLocaleString()} total subs
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
