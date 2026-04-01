import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Target, Loader2, TrendingUp } from 'lucide-react';
import { WeeklyEarnings } from '@/services/platformApi';

const MODELS = [
  { key: 'ashley', name: 'Ashley' },
  { key: 'izzie', name: 'Izzie' },
  { key: 'willow', name: 'Willow' },
];
const WEEKLY_TARGET = 5000;

interface Props {
  weeklyEarnings: Record<string, WeeklyEarnings>;
  activeSubs: Record<string, number>;
  revenueLoading: boolean;
}

export default function RevenueLTV({ weeklyEarnings, activeSubs, revenueLoading }: Props) {
  if (revenueLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const weekTotal = MODELS.reduce((s, m) => s + (weeklyEarnings[m.key]?.grossTotal || 0), 0);
  const weekTarget = WEEKLY_TARGET * MODELS.length;
  const progress = Math.min((weekTotal / weekTarget) * 100, 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            This Week's Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${weekTotal.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/ ${weekTarget.toLocaleString()} target</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Week of {new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })} — {progress.toFixed(0)}%
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODELS.map(({ key, name }) => {
          const weekly = weeklyEarnings[key];
          const revenue = weekly?.grossTotal || 0;
          const tipsRev = weekly?.tips || 0;
          const subs = activeSubs[key] || 0;
          const ltv = subs > 0 && revenue > 0 ? (revenue / subs).toFixed(2) : '—';
          const mp = Math.min((revenue / WEEKLY_TARGET) * 100, 100);

          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xl font-bold text-green-400">
                    ${revenue.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">this week</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${mp >= 100 ? 'bg-green-500' : mp >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${mp}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  ${revenue.toLocaleString()} / $5K — Tips: ${tipsRev.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <TrendingUp className="h-3 w-3 text-cyan-400" />
                  <span className="text-xs text-muted-foreground">
                    LTV: <span className="font-semibold text-foreground">{ltv === '—' ? '—' : `$${ltv}`}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {subs > 0 ? `${subs} active subs` : 'No sub data'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
