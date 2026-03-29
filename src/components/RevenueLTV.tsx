import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ModelStats {
  model_name: string;
  total_revenue: number | null;
  subscription_revenue: number | null;
  message_revenue: number | null;
  tip_revenue: number | null;
  date: string;
}

interface ModelLTV {
  name: string;
  weeklyRevenue: number;
  activeSubs: number;
  ltv: number;
  target: number;
  ppvConversion: string;
}

const LTV_TARGET = 7; // $7-8 per sub target (Luke 2026-03-20)

export default function RevenueLTV() {
  const [models, setModels] = useState<ModelLTV[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [weeklyTarget] = useState(5000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Get last 7 days of stats
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_model_stats')
        .select('*')
        .gte('date', dateStr)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Group by model
        const modelMap = new Map<string, ModelStats[]>();
        data.forEach((row: ModelStats) => {
          const existing = modelMap.get(row.model_name) || [];
          existing.push(row);
          modelMap.set(row.model_name, existing);
        });

        const modelStats: ModelLTV[] = [];
        let total = 0;

        modelMap.forEach((stats, name) => {
          const weekRev = stats.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
          const msgRev = stats.reduce((sum, s) => sum + (s.message_revenue || 0), 0);
          total += weekRev;

          // Estimate subs from subscription revenue (average sub price ~$5-10)
          const subRev = stats.reduce((sum, s) => sum + (s.subscription_revenue || 0), 0);
          const estimatedSubs = subRev > 0 ? Math.round(subRev / 7) : 0;
          const ltv = estimatedSubs > 0 ? weekRev / estimatedSubs : 0;
          
          // PPV conversion = message revenue as % of total (rough proxy)
          const ppvRate = weekRev > 0 ? ((msgRev / weekRev) * 100).toFixed(1) : '0.0';

          modelStats.push({
            name,
            weeklyRevenue: weekRev,
            activeSubs: estimatedSubs,
            ltv: Math.round(ltv * 100) / 100,
            target: LTV_TARGET,
            ppvConversion: `${ppvRate}%`,
          });
        });

        setModels(modelStats);
        setWeeklyTotal(total);
      } else {
        // No data yet — show placeholder
        setModels([
          { name: 'Ashley', weeklyRevenue: 0, activeSubs: 0, ltv: 0, target: LTV_TARGET, ppvConversion: '—' },
          { name: 'Willow', weeklyRevenue: 0, activeSubs: 0, ltv: 0, target: LTV_TARGET, ppvConversion: '—' },
          { name: 'Izzie', weeklyRevenue: 0, activeSubs: 0, ltv: 0, target: LTV_TARGET, ppvConversion: '—' },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch model stats:', err);
    } finally {
      setLoading(false);
    }
  }

  function getLTVColor(ltv: number): string {
    if (ltv >= 7) return 'text-green-500';
    if (ltv >= 4) return 'text-yellow-500';
    return 'text-red-500';
  }

  function getLTVBadge(ltv: number): string {
    if (ltv >= 7) return 'default';
    if (ltv >= 4) return 'secondary';
    return 'destructive';
  }

  const targetProgress = weeklyTarget > 0 ? Math.min((weeklyTotal / weeklyTarget) * 100, 100) : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Weekly Revenue Target */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Weekly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${weeklyTotal.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/ ${weeklyTarget.toLocaleString()} target</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${targetProgress >= 100 ? 'bg-green-500' : targetProgress >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${targetProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{targetProgress.toFixed(0)}% of target</p>
        </CardContent>
      </Card>

      {/* Per-Model LTV Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card key={model.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {model.name}
                </span>
                <Badge variant={getLTVBadge(model.ltv) as 'default' | 'secondary' | 'destructive'}>
                  ${model.ltv.toFixed(2)} LTV
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Weekly Rev
                </span>
                <span className="font-medium">${model.weeklyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Active Subs
                </span>
                <span className="font-medium">{model.activeSubs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PPV Rate</span>
                <span className="font-medium">{model.ppvConversion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">LTV Target</span>
                <span className={`font-medium ${getLTVColor(model.ltv)}`}>
                  ${model.ltv.toFixed(2)} / ${model.target.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
