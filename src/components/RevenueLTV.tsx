import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Target, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ModelData {
  name: string;
  todayRev: number;
  todaySubs: number;
  todayLTV: number;
  target: number;
}

const LTV_TARGET = 7;
const WEEKLY_TARGET_PER_MODEL = 5000;
const MODELS_LIST = ['Ashley', 'Izzie', 'Willow'];

export default function RevenueLTV() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's revenue from Supabase
      const { data: todayStats } = await supabase
        .from('daily_model_stats')
        .select('*')
        .eq('date', today)
        .in('model_name', MODELS_LIST);

      const result: ModelData[] = MODELS_LIST.map(name => {
        const row = (todayStats || []).find(r => r.model_name === name);
        const rev = row?.total_revenue || 0;
        // We don't have today's new subs from the API easily
        // For now show revenue and note subs need manual check
        return {
          name,
          todayRev: rev,
          todaySubs: 0, // Will need webhook or periodic delta tracking
          todayLTV: 0,
          target: LTV_TARGET,
        };
      });

      setModels(result);
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching revenue:', err);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const totalToday = models.reduce((s, m) => s + m.todayRev, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <RefreshCw className="h-3 w-3" /> {lastUpdated}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${totalToday.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">today across all models</span>
          </div>
        </CardContent>
      </Card>

      {/* Per-Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card key={model.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-xl font-bold text-green-400">
                  ${model.todayRev.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">today</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
