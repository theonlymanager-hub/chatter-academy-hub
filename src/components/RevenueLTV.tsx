import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';

interface ModelData {
  name: string;
  thisWeekRev: number;
  allTimeRev: number;
  totalSubs: number;
  thisWeekLTV: number;
  allTimeLTV: number;
  target: number;
}

const LTV_TARGET = 7;

// Real data from OF API (updated 2026-03-30 00:05 — GROSS figures, what Luke sees)
const MODELS: ModelData[] = [
  { name: 'Ashley', thisWeekRev: 4583, allTimeRev: 59568, totalSubs: 9393, thisWeekLTV: 0, allTimeLTV: 0, target: LTV_TARGET },
  { name: 'Izzie', thisWeekRev: 2178, allTimeRev: 67039, totalSubs: 11365, thisWeekLTV: 0, allTimeLTV: 0, target: LTV_TARGET },
  { name: 'Willow', thisWeekRev: 480, allTimeRev: 15456, totalSubs: 1454, thisWeekLTV: 0, allTimeLTV: 0, target: LTV_TARGET },
];

// Calculate LTVs
MODELS.forEach(m => {
  // This week LTV = this week rev / total subs (rough — ideally weekly new subs)
  m.thisWeekLTV = m.totalSubs > 0 ? Math.round((m.thisWeekRev / m.totalSubs) * 100) / 100 : 0;
  // All-time LTV = total rev / total subs
  m.allTimeLTV = m.totalSubs > 0 ? Math.round((m.allTimeRev / m.totalSubs) * 100) / 100 : 0;
});

export default function RevenueLTV() {
  const weeklyTotal = MODELS.reduce((sum, m) => sum + m.thisWeekRev, 0);
  const weeklyTarget = 15000; // $5K per model × 3

  function getLTVColor(ltv: number): string {
    if (ltv >= 7) return 'text-green-500';
    if (ltv >= 4) return 'text-yellow-500';
    return 'text-red-500';
  }

  function getLTVBadge(ltv: number): 'default' | 'secondary' | 'destructive' {
    if (ltv >= 7) return 'default';
    if (ltv >= 4) return 'secondary';
    return 'destructive';
  }

  const targetProgress = Math.min((weeklyTotal / weeklyTarget) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Weekly Revenue Target */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            This Week's Revenue
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
          <p className="text-xs text-muted-foreground mt-1">{targetProgress.toFixed(0)}% of weekly target ($5K per model)</p>
        </CardContent>
      </Card>

      {/* Per-Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODELS.map((model) => (
          <Card key={model.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {model.name}
                </span>
                <Badge variant={getLTVBadge(model.thisWeekLTV)}>
                  ${model.thisWeekLTV.toFixed(2)} LTV
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> This Week
                </span>
                <span className="font-medium">${model.thisWeekRev.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Total Subs
                </span>
                <span className="font-medium">{model.totalSubs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Week LTV</span>
                <span className={`font-medium ${getLTVColor(model.thisWeekLTV)}`}>
                  ${model.thisWeekLTV.toFixed(2)} / ${model.target.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">All-Time LTV</span>
                <span className={`font-medium ${getLTVColor(model.allTimeLTV)}`}>
                  ${model.allTimeLTV.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
